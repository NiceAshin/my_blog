---
date: 2023-07-24
sidebar: auto
prev: ./codec
next: ./protobuf
---

# Netty处理半包粘包

> 预计阅读时间：8 分钟

“半包”和“粘包”不是 Netty 的 bug，而是 TCP 字节流协议的固有特性。发送方调用两次 `write`，接收方可能一次读到两条消息，也可能只读到第一条消息的一半。应用层如果没有消息边界，就无法判断一条业务消息从哪里开始、到哪里结束。

## 为什么会粘包和半包

TCP 只保证字节顺序，不保证每次 `read` 的边界与 `write` 一致。常见原因包括：

- 发送方开启了 Nagle 算法，多个小包被合并；
- 接收方缓冲区较大，一次读取了多条消息；
- 消息体超过 MSS，被 IP 分片；
- 网络中间设备、代理层做了缓冲或拆分。

所以解决思路不是“让 TCP 不粘包”，而是**在应用层定义可解析的帧格式**。常见有四类：固定长度、分隔符、长度字段，以及由协议框架自带的消息边界。

## 四类常见拆包器

| 拆包器 | 帧格式 | 适用场景 | 注意点 |
| --- | --- | --- | --- |
| `FixedLengthFrameDecoder` | 每条消息长度固定 | 协议简单、定长指令 | 消息长度变化时要补齐，浪费带宽 |
| `LineBasedFrameDecoder` | 以 `\n` 或 `\r\n` 结尾 | 文本日志、简单命令 | 消息体不能包含换行 |
| `DelimiterBasedFrameDecoder` | 自定义分隔符 | Redis 协议、自定义文本协议 | 分隔符需要转义 |
| `LengthFieldBasedFrameDecoder` | 头部携带长度字段 | 二进制协议、最常见的生产方案 | 参数多，长度字段含义要对齐 |

生产环境优先推荐长度字段方案：解析成本低，不受消息内容影响，也容易限制最大帧长。

## LengthFieldBasedFrameDecoder 参数

构造函数：

```java
new LengthFieldBasedFrameDecoder(
        int maxFrameLength,
        int lengthFieldOffset,
        int lengthFieldLength,
        int lengthAdjustment,
        int initialBytesToStrip)
```

假设协议为：`魔数(2) + 版本(1) + 长度(4) + 消息体(N)`，长度字段只表示消息体长度：

- `maxFrameLength = 1024 * 1024`，防止恶意超大包；
- `lengthFieldOffset = 3`，跳过魔数和版本；
- `lengthFieldLength = 4`；
- `lengthAdjustment = 0`，因为长度字段后面就是消息体；
- `initialBytesToStrip = 7`，把整个头部剥掉，业务 handler 只拿到消息体。

```java
pipeline.addLast(new LengthFieldBasedFrameDecoder(
        1024 * 1024, 3, 4, 0, 7));
pipeline.addLast(new StringDecoder(StandardCharsets.UTF_8));
```

如果长度字段表示“整个包的长度”，则 `lengthAdjustment = -(lengthFieldOffset + lengthFieldLength)`，把头部长度减掉。这个符号最容易写错，建议用一条真实报文做单元测试。

## 可运行的编解码示例

服务端：

```java
public class PacketServer {

    public static void main(String[] args) throws Exception {
        EventLoopGroup boss = new NioEventLoopGroup(1);
        EventLoopGroup worker = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(boss, worker)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ch.pipeline()
                                    .addLast(new LengthFieldBasedFrameDecoder(
                                            1024 * 1024, 0, 4, 0, 4))
                                    .addLast(new StringDecoder(StandardCharsets.UTF_8))
                                    .addLast(new LengthFieldPrepender(4))
                                    .addLast(new StringEncoder(StandardCharsets.UTF_8))
                                    .addLast(new SimpleChannelInboundHandler<String>() {
                                        @Override
                                        protected void channelRead0(
                                                ChannelHandlerContext ctx, String msg) {
                                            System.out.println("收到: " + msg);
                                            ctx.writeAndFlush("ok:" + msg);
                                        }
                                    });
                        }
                    });
            bootstrap.bind(9000).sync().channel().closeFuture().sync();
        } finally {
            boss.shutdownGracefully();
            worker.shutdownGracefully();
        }
    }
}
```

客户端发送时，`LengthFieldPrepender(4)` 会自动在消息前补 4 字节长度，服务端才能按同一规则解析。不要一端用长度字段、另一端用换行分隔，这是联调时最常见的错误。

## 常见坑

- `maxFrameLength` 设置过大，攻击者伪造长度字段导致内存暴涨；按业务最大包设置，并配合鉴权。
- `initialBytesToStrip` 设置错误，业务层拿到的字符串开头带着乱码。
- 只加了解码器，没有加 `LengthFieldPrepender`，响应包没有长度头。
- 在解码器之前加业务 handler，导致收到的是 `ByteBuf` 而不是字符串。
- 用 `LineBasedFrameDecoder` 处理可能包含换行的 JSON，消息会被意外截断。

验证时不要只发一条“hello”。至少测试：两条消息一次写入、一条消息分两次写入、空消息、最大长度消息、超长消息。编解码器的健壮性，基本取决于这些边界用例。
