---
title: Spring Boot 集成 Kafka：可靠消息生产与消费实践
date: 2026-10-23
sidebar: auto
---

# Spring Boot 集成 Kafka：可靠消息生产与消费实践

> 预计阅读时间：12 分钟

Kafka 常被用作系统间的异步解耦与流量削峰组件。真正落地时，难点通常不在“能发能收”，而在消息不丢、不重复、顺序可控，以及消费失败后如何收场。本文用一个订单事件示例，记录从本地环境、Spring Boot 配置到生产与消费可靠性的完整实践。

## 场景与目标

假设订单服务在订单创建成功后发送 `order-created` 事件，积分服务与通知服务分别订阅。实践目标如下：

- 生产者发送失败可感知，关键消息使用同步确认；
- 同一订单的事件按订单号分区，保证局部顺序；
- 消费者业务处理幂等，重复投递不会重复加积分；
- 消费异常有有限重试，最终失败进入死信主题，避免阻塞分区。

示例环境为 Spring Boot 3.2、Spring Kafka 3.1、Kafka 3.7（KRaft 模式），JDK 17。

## 本地启动 Kafka

开发环境使用单节点 KRaft 即可，无需 ZooKeeper：

```yaml
services:
  kafka:
    image: apache/kafka:3.7.0
    container_name: demo-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
```

启动后创建主题。分区数决定并行度，副本数在生产环境至少为 3：

```bash
docker compose up -d
docker exec -it demo-kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --topic order-created --partitions 3 --replication-factor 1
```

## 依赖与基础配置

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

`application.yml` 中把关键参数显式写出，避免依赖默认值：

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
        max.in.flight.requests.per.connection: 5
    consumer:
      group-id: points-service
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.example.order.event
        isolation.level: read_committed
    listener:
      ack-mode: record
```

`acks=all` 表示所有同步副本写入后才确认；开启幂等后，生产者重试不会在 broker 端产生重复消息。`max.in.flight.requests.per.connection` 保持在 5 以内，幂等性仍然有效。

## 生产者：确认、分区键与异常处理

消息键使用订单号，Kafka 会按 `hash(key) % partitions` 选择分区，同一订单的后续事件因此保持顺序。若使用 `null` 键，消息会轮询分区，顺序无法保证。

```java
@Service
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(OrderCreatedEvent event) {
        CompletableFuture<SendResult<String, OrderCreatedEvent>> future =
                kafkaTemplate.send("order-created", event.orderId(), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("订单事件发送失败, orderId={}", event.orderId(), ex);
                return;
            }
            var metadata = result.getRecordMetadata();
            log.info("订单事件发送成功, orderId={}, partition={}, offset={}",
                    event.orderId(), metadata.partition(), metadata.offset());
        });
    }
}
```

`KafkaTemplate.send` 返回 `CompletableFuture`。示例采用异步回调记录结果；对支付、扣减库存等关键事件，可以在事务提交前调用 `future.get(3, TimeUnit.SECONDS)` 做同步确认，发送失败则抛出异常触发本地事务回滚。更严谨的做法是本地消息表或事务消息模式：业务数据与“待发送消息”在同一数据库事务中落库，再由后台任务投递，避免数据库提交成功而 Kafka 发送失败的窗口。

## 消费者：幂等与失败收敛

消费者最容易踩的坑，是把“至少一次”当成“恰好一次”。网络抖动、再均衡、处理超时都可能导致同一条消息被再次投递，因此业务侧必须幂等。

```java
@Component
public class OrderCreatedConsumer {

    private final PointsService pointsService;

    public OrderCreatedConsumer(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    @KafkaListener(topics = "order-created", groupId = "points-service")
    public void onMessage(ConsumerRecord<String, OrderCreatedEvent> record) {
        OrderCreatedEvent event = record.value();
        // 以 eventId 或 orderId 建唯一索引，重复消费时直接返回
        if (!pointsService.tryMarkProcessed(event.eventId())) {
            return;
        }
        pointsService.addPoints(event.userId(), event.amount());
    }
}
```

`tryMarkProcessed` 建议依赖数据库唯一约束或 Redis `SETNX`，并设置与业务重试周期匹配的过期时间。不要先查后插，否则并发消费仍会重复。

消费异常时，Spring Kafka 的 `DefaultErrorHandler` 可配置固定退避与死信主题：

```java
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template,
            (record, ex) -> new TopicPartition("order-created-dlt", record.partition()));
    var backOff = new FixedBackOff(1000L, 3L);
    return new DefaultErrorHandler(recoverer, backOff);
}
```

失败消息进入 `order-created-dlt` 后，需要有告警与人工补偿入口。否则死信主题只是“换个地方堆积”，问题仍然没有被处理。

## 顺序与并发的取舍

Kafka 只保证单分区内有序。按订单号分区可以保证同一订单的事件顺序，但不同订单会分散到多个分区并行处理。若业务要求全局有序，只能使用单分区，代价是吞吐受限，通常不值得。

消费者并发数不要超过主题分区数，否则多余线程会空闲：

```yaml
spring:
  kafka:
    listener:
      concurrency: 3
```

扩分区可以提升并行度，但会改变键到分区的映射，导致同一订单在扩分区前后可能落到不同分区。生产环境应在容量规划阶段预留分区，避免频繁扩容。

## 验证与排查

发送几条测试消息后，可用命令行确认分区与堆积情况：

```bash
docker exec -it demo-kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic order-created --from-beginning \
  --property print.key=true --property print.partition=true

docker exec -it demo-kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --group points-service
```

重点观察 `CURRENT-OFFSET` 与 `LOG-END-OFFSET` 的差值。持续增长说明消费能力不足或消费线程被阻塞；差值不变但业务无数据，则要检查反序列化异常与死信主题。

## 小结

Kafka 的可靠性不是靠某一个配置项完成的，而是生产者确认、分区键、消费者幂等、重试与死信共同组成。先把“重复可接受、失败可发现、积压可观测”三件事做扎实，再考虑事务消息与多集群容灾，落地会稳得多。
