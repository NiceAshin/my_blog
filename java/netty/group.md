---
title: Netty群发消息
date: 2023-05-14
sidebar: auto
prev: ./protobuf
next: ./heartbeat
---
# Netty群发消息

> 预计阅读时间：7 分钟

聊天室、行情推送、设备广播都有一个共同需求：把同一条消息发给当前所有在线连接。自己维护 `List<Channel>` 也能做，但要处理连接关闭、并发增删、写失败清理。Netty 的 `ChannelGroup` 把这些生命周期管理封装好了，适合作为广播的基础设施。

## ChannelGroup 是什么

`ChannelGroup` 是 `Channel` 的集合，实现了 `Set<Channel>`，同时提供批量写操作。常用的 `DefaultChannelGroup` 有几个特点：

- 线程安全，可在多个 EventLoop 线程中增删；
- channel 关闭后会自动从组里移除；
- `writeAndFlush` 返回 `ChannelGroupFuture`，可以统一监听成功/失败；
- 支持 `ChannelMatcher`，广播时排除某个连接。

注意它只负责“管理连接并批量写”，不负责消息持久化、离线消息和背压。业务上的“用户是否在线”仍应放在自己的会话表中。

## 一个聊天室广播示例

```java
@ChannelHandler.Sharable
public class ChatServerHandler extends SimpleChannelInboundHandler<String> {

    private static final ChannelGroup GROUP =
            new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        GROUP.add(ctx.channel());
        GROUP.writeAndFlush("system: " + ctx.channel().remoteAddress() + " joined\n");
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        GROUP.remove(ctx.channel());
        GROUP.writeAndFlush("system: " + ctx.channel().remoteAddress() + " left\n");
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) {
        String text = "[" + ctx.channel().remoteAddress() + "] " + msg + "\n";
        // 广播给除发送者外的所有连接
        GROUP.writeAndFlush(text, channel -> channel != ctx.channel());
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

装配到服务端：

```java
bootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) {
        ch.pipeline()
                .addLast(new LineBasedFrameDecoder(8192))
                .addLast(new StringDecoder(StandardCharsets.UTF_8))
                .addLast(new StringEncoder(StandardCharsets.UTF_8))
                .addLast(new ChatServerHandler());
    }
});
```

`ChatServerHandler` 加了 `@Sharable`，可以复用一个实例；如果 handler 里保存了每个连接独有的状态，就不能共享，应改为每个 channel 新建实例，但 `ChannelGroup` 仍要放在共享的组件里。

## 连接生命周期管理

`DefaultChannelGroup` 会在 channel 关闭时自动移除，但业务层通常还需要维护 `userId -> Channel` 的映射：

```java
private final Map<String, Channel> sessions = new ConcurrentHashMap<>();

@Override
public void channelActive(ChannelHandlerContext ctx) {
    // 实际项目从握手参数或鉴权结果中取 userId
    sessions.put(ctx.channel().id().asLongText(), ctx.channel());
    GROUP.add(ctx.channel());
}

@Override
public void channelInactive(ChannelHandlerContext ctx) {
    sessions.remove(ctx.channel().id().asLongText());
    GROUP.remove(ctx.channel());
}
```

推荐用 `ChannelId` 而不是 `remoteAddress` 做 key，NAT 环境下不同客户端可能共享公网 IP。用户重新登录时，要先关闭旧连接再替换映射，避免同一账号收到两份消息。

## 广播失败怎么处理

```java
ChannelGroupFuture future = GROUP.writeAndFlush("market tick\n");
future.addListener(f -> {
    if (!f.isSuccess()) {
        System.err.println("broadcast failed: " + f.cause());
    }
});
```

`ChannelGroupFuture` 是所有子写的聚合结果。某个客户端写失败不会影响其他连接，但业务层要记录失败 channel 并关闭它，否则半开连接会一直占着资源。对于重要消息，不要只依赖一次广播，应该配合离线消息表或消息队列。

## 常见坑

- 用 `ChannelGroup` 广播大文件，慢客户端导致写缓冲区堆积；应限制单条消息大小并设置写水位。
- 在 `channelRead0` 里同步遍历 `GROUP` 做复杂业务，阻塞 EventLoop；广播本身很快，业务处理应异步化。
- 忘记移除已关闭连接，虽然 `DefaultChannelGroup` 会自动清理，但自定义集合不会。
- 把 `ChannelGroup` 当成用户在线状态表，用户多端登录时无法区分设备。
- 广播消息不加协议头，客户端把系统消息和业务消息混在一起解析。

`ChannelGroup` 适合“当前在线连接”的即时广播。需要可靠投递、历史消息、按用户定向推送时，应该在它之上再加一层会话与消息服务。
