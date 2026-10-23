---
title: Netty 编解码器
date: 2023-03-27
sidebar: auto
prev: ./init
next: ./package
---

# Netty 编解码器

> 预计阅读时间：8 分钟

TCP 是字节流协议，没有消息边界。业务层收到的可能是半条消息，也可能是两条消息粘在一起。Netty 的编解码器就是用来把 `ByteBuf` 转成业务对象（入站），再把业务对象转成字节（出站）。理解 pipeline 的方向，比记住某个 Decoder 的名字更重要。

## pipeline 的入站与出站

- **入站（inbound）**：数据从 Socket 读入，沿 pipeline 从头到尾经过 `ChannelInboundHandler`。
- **出站（outbound）**：数据从业务 handler 写出，沿 pipeline 从尾到头经过 `ChannelOutboundHandler`。

因此，解码器和编码器都要放在业务 handler 之前（pipeline 列表中靠前的位置）：解码器处理入站字节，编码器处理业务 handler 写出的对象。一个常见的长度字段协议 pipeline：

```java
pipeline.addLast(new LengthFieldBasedFrameDecoder(1024 * 1024, 0, 4, 0, 4));
pipeline.addLast(new StringDecoder(StandardCharsets.UTF_8));
pipeline.addLast(new LengthFieldPrepender(4));
pipeline.addLast(new StringEncoder(StandardCharsets.UTF_8));
pipeline.addLast(new SimpleChannelInboundHandler<String>() {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) {
        ctx.writeAndFlush("echo:" + msg);
    }
});
```

`LengthFieldBasedFrameDecoder` 读取前 4 个字节作为长度，`initialBytesToStrip=4` 表示把长度字段本身剥掉，后面的 `StringDecoder` 只看到消息体。出站方向，`StringEncoder` 先把字符串编码成字节，`LengthFieldPrepender` 再在头部补 4 字节长度。

## 自定义协议解码器

如果协议包含魔数、版本号和长度字段，可以自己继承 `ByteToMessageDecoder`。关键点是：**数据不够时不要消费字节**，用 `markReaderIndex/resetReaderIndex` 恢复读指针。

```java
public class MessageDecoder extends ByteToMessageDecoder {

    private static final int HEADER = 7; // magic(2) + version(1) + length(4)

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        if (in.readableBytes() < HEADER) {
            return;
        }
        in.markReaderIndex();
        short magic = in.readShort();
        byte version = in.readByte();
        int length = in.readInt();

        if (magic != (short) 0xCAFE || version != 1 || length < 0 || length > 1024 * 1024) {
            ctx.close();
            return;
        }
        if (in.readableBytes() < length) {
            in.resetReaderIndex();
            return;
        }

        byte[] body = new byte[length];
        in.readBytes(body);
        out.add(new String(body, StandardCharsets.UTF_8));
    }
}
```

编码器对应地把头部写回去：

```java
public class MessageEncoder extends MessageToByteEncoder<String> {

    @Override
    protected void encode(ChannelHandlerContext ctx, String msg, ByteBuf out) {
        byte[] body = msg.getBytes(StandardCharsets.UTF_8);
        out.writeShort(0xCAFE);
        out.writeByte(1);
        out.writeInt(body.length);
        out.writeBytes(body);
    }
}
```

服务端装配：

```java
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(new NioEventLoopGroup(1), new NioEventLoopGroup())
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch) {
                ch.pipeline()
                        .addLast(new MessageDecoder())
                        .addLast(new MessageEncoder())
                        .addLast(new SimpleChannelInboundHandler<String>() {
                            @Override
                            protected void channelRead0(ChannelHandlerContext ctx, String msg) {
                                ctx.writeAndFlush("server received: " + msg);
                            }
                        });
            }
        });
bootstrap.bind(9000).sync().channel().closeFuture().sync();
```

客户端发送时也要使用同一套编码器，否则服务端读到的魔数和长度都是错的。上线前至少用三条消息验证：单条短消息、超过 1KB 的长消息、一次性写入两条消息。

## 选择现成解码器还是自定义

| 场景 | 推荐 |
| --- | --- |
| 固定长度消息 | `FixedLengthFrameDecoder` |
| 换行分隔的文本协议 | `LineBasedFrameDecoder` |
| 自定义分隔符 | `DelimiterBasedFrameDecoder` |
| 头部带长度字段（最常见） | `LengthFieldBasedFrameDecoder` |
| 魔数、版本、校验和等复杂头部 | 继承 `ByteToMessageDecoder` |

## 常见坑

- 解码器顺序放反，业务 handler 收到的是 `ByteBuf` 而不是字符串。
- 数据不足时直接 `readInt()`，抛 `IndexOutOfBoundsException` 或丢掉半包。
- 自定义解码器没有限制最大长度，遇到恶意长度字段直接申请巨大数组。
- 只加了解码器，忘了出站编码器，客户端收到的响应没有长度头，服务端无法解析。
- 在 `channelRead0` 里做阻塞数据库查询，阻塞 EventLoop 线程，导致所有连接一起变慢。

编解码器的正确性要靠边界测试保证：半包、粘包、超长包、错误魔数、空包，这五种情况都覆盖后，再谈性能优化。
