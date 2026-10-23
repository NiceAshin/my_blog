---
date: 2023-06-07
sidebar: auto
prev: ./protobuf
---

# Netty心跳检测

> 预计阅读时间：8 分钟

长连接最怕“连接还在，但对端已经不可用”。TCP 的 keepalive 默认要两小时才开始探测，很多中间设备还会提前清理空闲连接。应用层心跳的作用，是在较短时间内确认链路仍然可用，并及时释放死连接。

## IdleStateHandler 的三个参数

```java
new IdleStateHandler(
        int readerIdleTimeSeconds,
        int writerIdleTimeSeconds,
        int allIdleTimeSeconds)
```

- `readerIdleTime`：多久没读到数据，触发 `READER_IDLE`；
- `writerIdleTime`：多久没写出数据，触发 `WRITER_IDLE`；
- `allIdleTime`：读和写都空闲多久，触发 `ALL_IDLE`。

服务端通常只关心“多久没收到客户端消息”，客户端则关心“多久没发消息，该发心跳了”。注意 `IdleStateHandler` 必须放在业务 handler 之前，否则事件到不了业务层。

## 服务端：读空闲关闭连接

```java
ch.pipeline()
        .addLast(new IdleStateHandler(90, 0, 0, TimeUnit.SECONDS))
        .addLast(new LineBasedFrameDecoder(8192))
        .addLast(new StringDecoder(StandardCharsets.UTF_8))
        .addLast(new StringEncoder(StandardCharsets.UTF_8))
        .addLast(new HeartbeatServerHandler());
```

```java
public class HeartbeatServerHandler extends SimpleChannelInboundHandler<String> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) {
        if ("PING".equals(msg)) {
            ctx.writeAndFlush("PONG\n");
            return;
        }
        // 处理业务消息
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof IdleStateEvent event
                && event.state() == IdleState.READER_IDLE) {
            System.out.println("read idle, close " + ctx.channel().remoteAddress());
            ctx.close();
            return;
        }
        super.userEventTriggered(ctx, evt);
    }
}
```

服务端设置 90 秒读空闲，客户端应每 30 秒发一次心跳。这样即使丢一两次心跳，也不会立刻断线；连续 90 秒没有任何数据，才判定连接不可用。

## 客户端：定时发心跳并重连

```java
public class HeartbeatClientHandler extends SimpleChannelInboundHandler<String> {

    private final Bootstrap bootstrap;
    private final EventLoopGroup group;
    private final AtomicBoolean reconnecting = new AtomicBoolean(false);

    public HeartbeatClientHandler(Bootstrap bootstrap, EventLoopGroup group) {
        this.bootstrap = bootstrap;
        this.group = group;
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof IdleStateEvent) {
            IdleStateEvent event = (IdleStateEvent) evt;
            if (event.state() == IdleState.WRITER_IDLE) {
                ctx.writeAndFlush("PING\n");
                return;
            }
        }
        super.userEventTriggered(ctx, evt);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        scheduleReconnect();
    }

    private void scheduleReconnect() {
        if (!reconnecting.compareAndSet(false, true)) {
            return;
        }
        long delay = 3 + ThreadLocalRandom.current().nextInt(5);
        group.schedule(() -> {
            reconnecting.set(false);
            bootstrap.connect().addListener((ChannelFuture future) -> {
                if (!future.isSuccess()) {
                    scheduleReconnect();
                }
            });
        }, delay, TimeUnit.SECONDS);
    }
}
```

客户端 pipeline：

```java
ch.pipeline()
        .addLast(new IdleStateHandler(0, 30, 0, TimeUnit.SECONDS))
        .addLast(new ReadTimeoutHandler(90, TimeUnit.SECONDS))
        .addLast(new LineBasedFrameDecoder(8192))
        .addLast(new StringDecoder(StandardCharsets.UTF_8))
        .addLast(new StringEncoder(StandardCharsets.UTF_8))
        .addLast(handler);
```

`ReadTimeoutHandler` 是硬超时：90 秒内没有读到任何数据就直接抛异常并关闭 channel，避免半开连接一直占用资源。

## 重连策略

固定 3 秒重连在服务端故障时会形成“惊群”：几万个客户端同时重连，把刚恢复的服务再次打挂。建议：

- 指数退避，例如 1s、2s、4s、8s，上限 60s；
- 加随机抖动，避免同一时刻重连；
- 只在 `channelInactive` 或连接失败时调度一次，用 `AtomicBoolean` 防重入；
- 重连成功后重置退避计数；
- 鉴权失败等不可恢复错误不要无限重连。

## 常见坑

- 服务端和客户端都设置很短的读空闲，网络抖动就断线；心跳周期要大于正常网络 RTT 和 GC 停顿。
- 心跳包走业务解码器，却没有对应的消息类型，业务层把它当普通请求处理。
- 只在客户端发心跳，服务端不回 `PONG`，客户端无法确认对端真的收到。
- 断线重连没有上限，服务端宕机时客户端持续打满 CPU。
- 使用 `IdleStateHandler` 后忘记在 `userEventTriggered` 里调用 `super`，其他事件被吞掉。
- 容器化部署时探针、负载均衡的空闲超时小于心跳周期，连接会被中间层先断开。

心跳的参数没有绝对标准，推荐从“客户端 30 秒发一次、服务端 90 秒读空闲、客户端 90 秒读超时”起步，再根据网络质量和业务实时性调整。关键是让客户端、服务端和中间设备的超时时间形成合理梯度。
