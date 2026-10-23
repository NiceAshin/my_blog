---
title: Netty 服务端初始化流程
date: 2023-06-30
sidebar: auto
prev: ./component
next: ./codec
---
# Netty 服务端初始化流程

> 预计阅读时间：9 分钟

Netty 服务端启动看起来只有 `bind(port)` 一行，内部却完成了线程组创建、Channel 实例化、Pipeline 装配、注册 Selector、绑定端口和监听 accept 一整套动作。理解这条链路，排查“启动成功但连不上”“handler 不生效”“端口被占用”才有依据。

## 1. 最小可运行服务端

```java
public class NettyServer {

    public static void main(String[] args) throws InterruptedException {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(boss, worker)
                    .channel(NioServerSocketChannel.class)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ch.pipeline()
                                    .addLast(new LineBasedFrameDecoder(8192))
                                    .addLast(new StringDecoder(StandardCharsets.UTF_8))
                                    .addLast(new StringEncoder(StandardCharsets.UTF_8))
                                    .addLast(new SimpleChannelInboundHandler<String>() {
                                        @Override
                                        protected void channelRead0(
                                                ChannelHandlerContext ctx, String msg) {
                                            ctx.writeAndFlush("echo:" + msg + "\n");
                                        }
                                    });
                        }
                    });

            ChannelFuture future = bootstrap.bind(9000).sync();
            System.out.println("listening on " + future.channel().localAddress());
            future.channel().closeFuture().sync();
        } finally {
            boss.shutdownGracefully();
            worker.shutdownGracefully();
        }
    }
}
```

注意 `childHandler` 的泛型是 `SocketChannel`，不是 `ServerChannel`。`ServerChannel` 是监听套接字，`SocketChannel` 才是每条客户端连接。写错泛型时编译可能通过，但运行期类型不匹配。

## 2. EventLoopGroup 初始化

`NioEventLoopGroup` 内部持有多个 `NioEventLoop`，每个 EventLoop 绑定一个线程和一个 Selector。

- `boss` 只负责 `accept` 新连接，通常 1 个线程足够；
- `worker` 负责已连接 Channel 的读写和业务 handler，默认线程数约为 CPU 核数 × 2；
- 每个 Channel 注册时只会绑定一个 EventLoop，之后该 Channel 的所有事件都在这个线程处理。

因此 handler 中不要执行阻塞 IO、长事务或 `Thread.sleep`，否则会卡住该 EventLoop 上所有 Channel。

## 3. ServerBootstrap 配置

```java
bootstrap.group(boss, worker)
        .channel(NioServerSocketChannel.class)
        .option(ChannelOption.SO_BACKLOG, 1024)
        .childOption(ChannelOption.TCP_NODELAY, true)
        .childOption(ChannelOption.SO_KEEPALIVE, true);
```

- `channel()` 决定服务端 Channel 的实现，NIO 场景用 `NioServerSocketChannel`；
- `option()` 作用于监听 Channel，例如 `SO_BACKLOG` 是 accept 队列长度；
- `childOption()` 作用于每条客户端连接，例如 `TCP_NODELAY` 关闭 Nagle、`SO_KEEPALIVE` 开启 TCP 保活；
- `handler()` 只作用于监听 Channel；
- `childHandler()` 作用于新接入的客户端 Channel。

`SO_BACKLOG` 不是越大越好，最终受操作系统 `somaxconn` 限制。高并发短连接场景要同时调整内核参数。

## 4. Channel 的创建与注册

`bind()` 调用后，`ServerBootstrap` 会：

1. 通过 `ChannelFactory` 反射创建 `NioServerSocketChannel`；
2. 从 bossGroup 中选一个 EventLoop；
3. 把 Channel 注册到该 EventLoop 的 Selector；
4. 触发 `ChannelInitializer.initChannel`，装配监听 Channel 的 Pipeline；
5. 调用底层 `bind` 绑定端口；
6. 注册 `OP_ACCEPT`，等待新连接。

注册完成后，`ChannelFuture` 才会标记成功。因此 `bind().sync()` 返回时，端口已经处于监听状态。

## 5. 新连接接入

boss 线程检测到 `OP_ACCEPT` 后，调用 `NioServerSocketChannel.doReadMessages` 创建 `SocketChannel`，然后把它交给 workerGroup：

1. 从 workerGroup 选一个 EventLoop；
2. 将客户端 Channel 注册到该 EventLoop；
3. 执行 `childHandler` 中的 `ChannelInitializer`，装配业务 Pipeline；
4. 注册 `OP_READ`，开始读取数据。

`ChannelInitializer` 在初始化完成后会把自己从 Pipeline 移除，避免重复初始化。不要在 `initChannel` 里做耗时的数据库连接或远程调用，它会阻塞新连接的注册。

## 6. 绑定端口与关闭

```java
ChannelFuture future = bootstrap.bind(9000).sync();
future.channel().closeFuture().sync();
```

`closeFuture().sync()` 让主线程阻塞到服务端 Channel 关闭。生产代码通常会把 `Channel` 保存下来，在 JVM 关机钩子中优雅关闭：

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    future.channel().close();
    boss.shutdownGracefully();
    worker.shutdownGracefully();
}));
```

`shutdownGracefully()` 会先停止接收新任务，再处理完队列中的任务，比直接 `shutdownNow()` 安全。

## 7. 常见坑

- `boss` 开很多线程：accept 是串行的，多开没有收益，反而增加竞争。
- `childHandler` 写成 `ServerChannel`，新连接没有业务 handler。
- 在 `initChannel` 里做阻塞操作，导致新连接接入变慢。
- 只调用 `bind()` 不调用 `sync()`，端口可能尚未绑定完成就开始后续逻辑。
- 忘记保留 `Channel` 引用，无法主动关闭服务端。
- 端口被占用时只看异常不查进程，`lsof -i:9000` 能快速定位。
- 生产环境绑定 `0.0.0.0` 却没有防火墙或安全组限制，端口直接暴露公网。

初始化流程记成一句话：**boss 建监听 Channel，worker 接管客户端 Channel；Pipeline 在注册时装配，bind 成功后才开始 accept。**
