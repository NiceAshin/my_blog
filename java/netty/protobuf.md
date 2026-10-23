---
date: 2023-08-17
sidebar: auto
prev: ./package
next: ./group
---
# Netty整合Protobuf

> 预计阅读时间：9 分钟

Protobuf 是一种二进制序列化协议，相比 JSON 体积更小、解析更快，适合服务间高频通信。Netty 提供了 `ProtobufDecoder`、`ProtobufEncoder`，再配合长度字段处理器解决 TCP 粘包问题，就能搭起一条可用的二进制通信链路。

## 定义消息格式

新建 `src/main/proto/chat.proto`：

```proto
syntax = "proto3";

package demo.chat;

option java_package = "com.example.demo.proto";
option java_outer_classname = "ChatProto";

message ChatMessage {
  string user = 1;
  string content = 2;
  int64 timestamp = 3;
}
```

字段编号一旦上线不要复用，删除字段时用 `reserved` 占位。`java_outer_classname` 决定生成的外部类名，实际消息类为 `ChatProto.ChatMessage`。

## Maven 生成 Java 代码

```xml
<dependencies>
    <dependency>
        <groupId>com.google.protobuf</groupId>
        <artifactId>protobuf-java</artifactId>
        <version>3.25.3</version>
    </dependency>
    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
        <version>4.1.109.Final</version>
    </dependency>
</dependencies>

<build>
    <extensions>
        <extension>
            <groupId>kr.motd.maven</groupId>
            <artifactId>os-maven-plugin</artifactId>
            <version>1.7.1</version>
        </extension>
    </extensions>
    <plugins>
        <plugin>
            <groupId>org.xolstice.maven.plugins</groupId>
            <artifactId>protobuf-maven-plugin</artifactId>
            <version>0.6.1</version>
            <configuration>
                <protocArtifact>
                    com.google.protobuf:protoc:3.25.3:exe:${os.detected.classifier}
                </protocArtifact>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

执行：

```bash
mvn clean generate-sources
```

生成目录通常是 `target/generated-sources/protobuf/java`，IDE 需要把它标记为源码目录。

## 接入 Netty pipeline

服务端：

```java
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(new NioEventLoopGroup(1), new NioEventLoopGroup())
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch) {
                ch.pipeline()
                        .addLast(new ProtobufVarint32FrameDecoder())
                        .addLast(new ProtobufDecoder(
                                ChatProto.ChatMessage.getDefaultInstance()))
                        .addLast(new ProtobufVarint32LengthFieldPrepender())
                        .addLast(new ProtobufEncoder())
                        .addLast(new SimpleChannelInboundHandler<ChatProto.ChatMessage>() {
                            @Override
                            protected void channelRead0(
                                    ChannelHandlerContext ctx,
                                    ChatProto.ChatMessage msg) {
                                System.out.printf("%s: %s%n",
                                        msg.getUser(), msg.getContent());
                                ChatProto.ChatMessage reply = ChatProto.ChatMessage
                                        .newBuilder()
                                        .setUser("server")
                                        .setContent("received")
                                        .setTimestamp(System.currentTimeMillis())
                                        .build();
                                ctx.writeAndFlush(reply);
                            }
                        });
            }
        });
```

`ProtobufVarint32FrameDecoder` 负责按 Protobuf 的 varint 长度前缀拆帧，`ProtobufVarint32LengthFieldPrepender` 在出站时补长度前缀。两者必须成对使用；只加编码器不加解码器，服务端仍会读到半包。

客户端发送：

```java
ChatProto.ChatMessage message = ChatProto.ChatMessage.newBuilder()
        .setUser("alice")
        .setContent("hello")
        .setTimestamp(System.currentTimeMillis())
        .build();
channel.writeAndFlush(message);
```

## 与 JSON 的取舍

| 维度 | Protobuf | JSON |
| --- | --- | --- |
| 体积 | 小，字段名不传输 | 大，字段名重复传输 |
| 解析速度 | 快 | 较慢 |
| 可读性 | 需要工具解码 | 直接可读 |
| 协议演进 | 字段编号兼容性好 | 依赖约定，容易破坏兼容 |
| 调试成本 | 高 | 低 |

内部高频 RPC、移动端弱网场景适合 Protobuf；对外开放 API、调试为主的场景用 JSON 更省事。不要因为“性能更好”就全站替换，序列化通常不是第一瓶颈。

## 常见坑

- `.proto` 改了字段编号，旧客户端解析错位；只能新增编号，不能改已用编号。
- `protoc` 版本与 `protobuf-java` 版本差距过大，运行时出现 `NoSuchMethodError`。
- 忘记 `mvn generate-sources`，IDE 一直报找不到 `ChatProto`。
- 服务端和客户端的消息类型不一致，解码时报 `InvalidProtocolBufferException`。
- 直接 `writeAndFlush(byte[])`，绕过了 `ProtobufEncoder`，对端无法按 Protobuf 解析。

联调时先用一条固定消息验证编解码，再逐步加字段。二进制协议的排查成本比文本高，日志里至少打印消息类型、长度和关键业务 ID。
