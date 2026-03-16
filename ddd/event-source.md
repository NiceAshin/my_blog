---
title: 事件溯源
date: 2023-10-18
categories:
  - 架构
tags:
  - DDD
  - 事件溯源
  - Event Sourcing
  - CQRS
---

# 事件溯源 (Event Sourcing)

事件溯源是一种数据持久化模式，它**不存储对象的当前状态，而是存储导致状态变化的所有事件**。通过重放事件序列，可以还原任意时间点的对象状态。

---

## 1. 传统持久化的问题

### 1.1 状态存储模式

传统 ORM 将对象当前状态映射到数据库表：

```
┌─────────────────────────────────────────────────────────────┐
│                    传统状态存储                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   对象状态                    数据库表                        │
│   ┌─────────────┐            ┌─────────────────────────┐   │
│   │ Order       │            │ t_order                 │   │
│   │ - id: 123   │  ────────▶ │ id | status | amount    │   │
│   │ - status:   │            │ 123| PAID   | 100.00    │   │
│   │   PAID      │            └─────────────────────────┘   │
│   │ - amount:   │                                          │
│   │   100       │            只存储最终状态                  │
│   └─────────────┘            历史变更丢失                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 传统模式的局限

| 问题 | 说明 |
|------|------|
| 历史丢失 | 只能看到最终状态，无法追溯变化过程 |
| 审计困难 | 需要额外设计审计日志表 |
| 时态查询难 | 无法查询"昨天此时的状态" |
| 并发冲突 | 乐观锁只能检测冲突，无法分析原因 |
| 业务洞察 | 错过用户行为数据，难以分析业务趋势 |

---

## 2. 事件溯源原理

### 2.1 核心思想

```
┌─────────────────────────────────────────────────────────────┐
│                    事件溯源模式                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   不存储状态，存储事件流：                                    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    事件流                            │  │
│   │                                                     │  │
│   │  OrderCreated ──▶ ItemAdded ──▶ ItemAdded ──▶       │  │
│   │  (状态:创建)      (状态:更新)    (状态:更新)         │  │
│   │                                                     │  │
│   │  ──▶ OrderPaid ──▶ OrderShipped ──▶ OrderCompleted  │  │
│   │       (状态:已付)   (状态:已发货)     (状态:完成)    │  │
│   │                                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   当前状态 = 重放所有事件                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 状态重建

```java
// 订单聚合根
public class Order {

    private OrderId id;
    private OrderStatus status;
    private List<OrderItem> items;
    private Money totalAmount;

    // 从事件流重建状态
    public static Order fromEvents(List<OrderEvent> events) {
        Order order = new Order();
        events.forEach(order::apply);
        return order;
    }

    // 应用事件（状态变更）
    private void apply(OrderEvent event) {
        if (event instanceof OrderCreated e) {
            this.id = e.getOrderId();
            this.status = OrderStatus.CREATED;
            this.items = new ArrayList<>();
            this.totalAmount = Money.ZERO;
        }
        else if (event instanceof OrderItemAdded e) {
            OrderItem item = new OrderItem(
                e.getProductId(),
                e.getProductName(),
                e.getUnitPrice(),
                e.getQuantity()
            );
            items.add(item);
            totalAmount = totalAmount.add(e.getUnitPrice().multiply(e.getQuantity()));
        }
        else if (event instanceof OrderPaid e) {
            this.status = OrderStatus.PAID;
        }
        else if (event instanceof OrderShipped e) {
            this.status = OrderStatus.SHIPPED;
        }
        else if (event instanceof OrderCompleted e) {
            this.status = OrderStatus.COMPLETED;
        }
    }

    // 执行命令，产生事件
    public List<OrderEvent> addItem(AddItemCommand cmd) {
        if (status != OrderStatus.CREATED) {
            throw new OrderCannotModifyException("订单状态不允许修改");
        }

        // 创建事件而非直接修改状态
        OrderItemAdded event = new OrderItemAdded(
            this.id,
            cmd.getProductId(),
            cmd.getProductName(),
            cmd.getUnitPrice(),
            cmd.getQuantity(),
            Instant.now()
        );

        // 应用事件到自身
        apply(event);

        return List.of(event);
    }

    public List<OrderEvent> pay(PayCommand cmd) {
        if (status != OrderStatus.CREATED) {
            throw new InvalidOrderStatusException("只能支付待支付订单");
        }
        if (!totalAmount.equals(cmd.getAmount())) {
            throw new PaymentAmountMismatchException("支付金额不匹配");
        }

        OrderPaid event = new OrderPaid(this.id, cmd.getPaymentId(), Instant.now());
        apply(event);

        return List.of(event);
    }
}
```

---

## 3. 事件存储

### 3.1 事件表设计

```sql
-- 事件存储表
CREATE TABLE event_store (
    sequence_number BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_aggregate_version UNIQUE (aggregate_type, aggregate_id, version)
);

-- 索引
CREATE INDEX idx_aggregate ON event_store(aggregate_type, aggregate_id);
CREATE INDEX idx_event_type ON event_store(event_type);
CREATE INDEX idx_created_at ON event_store(created_at);
```

### 3.2 事件存储实现

```java
// 事件存储接口
public interface EventStore {

    // 追加事件
    void append(String aggregateType, String aggregateId,
                List<DomainEvent> events, int expectedVersion);

    // 加载事件流
    EventStream load(String aggregateType, String aggregateId);

    // 订阅事件
    void subscribe(EventSubscriber subscriber);
}

// 事件流
public class EventStream {

    private final List<DomainEvent> events;
    private final int version;

    public EventStream(List<DomainEvent> events, int version) {
        this.events = events;
        this.version = version;
    }

    public List<DomainEvent> getEvents() {
        return Collections.unmodifiableList(events);
    }

    public int getVersion() {
        return version;
    }
}

// 实现
@Repository
public class PostgresEventStore implements EventStore {

    private final JdbcTemplate jdbcTemplate;
    private final EventSerializer serializer;
    private final List<EventSubscriber> subscribers = new CopyOnWriteArrayList<>();

    @Override
    @Transactional
    public void append(String aggregateType, String aggregateId,
                       List<DomainEvent> events, int expectedVersion) {

        // 乐观锁检查
        Integer currentVersion = jdbcTemplate.queryForObject(
            "SELECT COALESCE(MAX(version), 0) FROM event_store " +
            "WHERE aggregate_type = ? AND aggregate_id = ?",
            Integer.class, aggregateType, aggregateId
        );

        if (currentVersion != expectedVersion) {
            throw new ConcurrencyException(
                "并发冲突：期望版本 " + expectedVersion + "，实际版本 " + currentVersion
            );
        }

        // 追加事件
        int version = expectedVersion;
        for (DomainEvent event : events) {
            version++;
            jdbcTemplate.update(
                "INSERT INTO event_store " +
                "(aggregate_type, aggregate_id, event_type, event_data, version, created_at) " +
                "VALUES (?, ?, ?, ?::jsonb, ?, ?)",
                aggregateType,
                aggregateId,
                event.getClass().getSimpleName(),
                serializer.serialize(event),
                version,
                event.getOccurredAt()
            );
        }

        // 通知订阅者
        events.forEach(event ->
            subscribers.forEach(sub -> sub.onEvent(event))
        );
    }

    @Override
    public EventStream load(String aggregateType, String aggregateId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            "SELECT event_type, event_data, version FROM event_store " +
            "WHERE aggregate_type = ? AND aggregate_id = ? " +
            "ORDER BY version ASC",
            aggregateType, aggregateId
        );

        List<DomainEvent> events = rows.stream()
            .map(row -> serializer.deserialize(
                (String) row.get("event_type"),
                (String) row.get("event_data")
            ))
            .collect(Collectors.toList());

        int version = rows.isEmpty() ? 0 :
            (Integer) rows.get(rows.size() - 1).get("version");

        return new EventStream(events, version);
    }

    @Override
    public void subscribe(EventSubscriber subscriber) {
        subscribers.add(subscriber);
    }
}
```

### 3.3 事件溯源仓储

```java
// 事件溯源仓储
public class EventSourcingRepository<T extends AggregateRoot> {

    private final EventStore eventStore;
    private final String aggregateType;
    private final Function<List<DomainEvent>, T> factory;

    public EventSourcingRepository(EventStore eventStore,
                                   String aggregateType,
                                   Function<List<DomainEvent>, T> factory) {
        this.eventStore = eventStore;
        this.aggregateType = aggregateType;
        this.factory = factory;
    }

    // 加载聚合
    public T findById(String aggregateId) {
        EventStream stream = eventStore.load(aggregateType, aggregateId);
        if (stream.getEvents().isEmpty()) {
            return null;
        }
        return factory.apply(stream.getEvents());
    }

    // 保存聚合
    public void save(T aggregate) {
        List<DomainEvent> newEvents = aggregate.pullEvents();
        if (!newEvents.isEmpty()) {
            eventStore.append(
                aggregateType,
                aggregate.getId().toString(),
                newEvents,
                aggregate.getVersion() - newEvents.size()
            );
        }
    }
}

// 使用示例
@Configuration
public class RepositoryConfig {

    @Bean
    public EventSourcingRepository<Order> orderRepository(EventStore eventStore) {
        return new EventSourcingRepository<>(
            eventStore,
            "Order",
            events -> Order.fromEvents(events)
        );
    }
}
```

---

## 4. 快照优化

### 4.1 为什么需要快照

```
┌─────────────────────────────────────────────────────────────┐
│                    快照解决的问题                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   问题：事件流过长时，重建状态耗时过长                         │
│                                                             │
│   订单有 10000 个事件：                                       │
│   - 加载 10000 条记录                                        │
│   - 执行 10000 次 apply()                                    │
│   - 耗时可能达到数秒                                         │
│                                                             │
│   解决：定期保存状态快照                                       │
│   - 快照保存第 5000 个事件后的状态                            │
│   - 只需加载快照 + 后续 5000 个事件                           │
│   - 加载时间减半                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 快照存储

```sql
-- 快照表
CREATE TABLE snapshot_store (
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    snapshot_data JSONB NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (aggregate_type, aggregate_id)
);
```

### 4.3 快照实现

```java
// 快照接口
public interface Snapshot<T> {
    T getState();
    int getVersion();
}

// 订单快照
@Data
public class OrderSnapshot implements Snapshot<Order> {

    private OrderId orderId;
    private CustomerId customerId;
    private OrderStatus status;
    private List<OrderItem> items;
    private Money totalAmount;
    private int version;

    @Override
    public Order getState() {
        Order order = new Order();
        order.setId(orderId);
        order.setCustomerId(customerId);
        order.setStatus(status);
        order.setItems(new ArrayList<>(items));
        order.setTotalAmount(totalAmount);
        order.setVersion(version);
        return order;
    }

    public static OrderSnapshot of(Order order) {
        OrderSnapshot snapshot = new OrderSnapshot();
        snapshot.setOrderId(order.getId());
        snapshot.setCustomerId(order.getCustomerId());
        snapshot.setStatus(order.getStatus());
        snapshot.setItems(new ArrayList<>(order.getItems()));
        snapshot.setTotalAmount(order.getTotalAmount());
        snapshot.setVersion(order.getVersion());
        return snapshot;
    }
}

// 带快照的仓储
public class SnapshotRepository<T extends AggregateRoot> {

    private final EventStore eventStore;
    private final SnapshotStore snapshotStore;
    private final String aggregateType;
    private final Function<List<DomainEvent>, T> factory;
    private final int snapshotThreshold;  // 每隔多少事件生成快照

    @Override
    public T findById(String aggregateId) {
        // 1. 尝试加载快照
        Optional<Snapshot<T>> snapshot = snapshotStore.load(aggregateType, aggregateId);

        if (snapshot.isPresent()) {
            // 从快照恢复
            T aggregate = snapshot.get().getState();
            int version = snapshot.get().getVersion();

            // 加载快照之后的事件
            EventStream stream = eventStore.loadFromVersion(
                aggregateType, aggregateId, version
            );

            // 应用后续事件
            stream.getEvents().forEach(aggregate::apply);

            return aggregate;
        } else {
            // 无快照，从头加载所有事件
            EventStream stream = eventStore.load(aggregateType, aggregateId);
            if (stream.getEvents().isEmpty()) {
                return null;
            }
            return factory.apply(stream.getEvents());
        }
    }

    @Override
    public void save(T aggregate) {
        List<DomainEvent> newEvents = aggregate.pullEvents();
        if (!newEvents.isEmpty()) {
            int newVersion = aggregate.getVersion();

            eventStore.append(
                aggregateType,
                aggregate.getId().toString(),
                newEvents,
                newVersion - newEvents.size()
            );

            // 检查是否需要创建快照
            if (newVersion % snapshotThreshold == 0) {
                snapshotStore.save(aggregateType, aggregate.getId().toString(), aggregate);
            }
        }
    }
}
```

---

## 5. CQRS 模式

### 5.1 什么是 CQRS

CQRS (Command Query Responsibility Segregation) 将读写操作分离：

```
┌─────────────────────────────────────────────────────────────┐
│                      CQRS 架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     ┌─────────────┐                         │
│                     │   Command   │                         │
│                     │   (写操作)   │                         │
│                     └──────┬──────┘                         │
│                            │                                │
│                            ▼                                │
│   ┌────────────────────────────────────────────────────┐   │
│   │                 Command Model                       │   │
│   │  ┌─────────────┐     ┌─────────────┐               │   │
│   │  │  Aggregate  │────▶│ Event Store │               │   │
│   │  │  (业务逻辑)  │     │  (事件存储)  │               │   │
│   │  └─────────────┘     └──────┬──────┘               │   │
│   └────────────────────────────┼───────────────────────┘   │
│                                │                            │
│                                │ 事件发布                    │
│                                ▼                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │                  Query Model                       │   │
│   │  ┌─────────────┐     ┌─────────────┐               │   │
│   │  │   Read DB   │     │   Projector │               │   │
│   │  │  (查询优化)  │◀────│  (事件投影)  │               │   │
│   │  └─────────────┘     └─────────────┘               │   │
│   └────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│                     ┌─────────────┐                         │
│                     │    Query    │                         │
│                     │   (读操作)   │                         │
│                     └─────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 为什么结合事件溯源

| 事件溯源 | CQRS | 结合优势 |
|----------|------|----------|
| 写入优化：追加事件 | 读取优化：专用读模型 | 读写分离，各自优化 |
| 事件是事实来源 | 读模型可重建 | 读模型损坏可重建 |
| 事件流用于重建 | 查询直接读投影 | 兼顾历史追溯和查询性能 |

### 5.3 CQRS 实现示例

```java
// ========== 写端（Command 端）==========

// 命令
public class CreateOrderCommand {
    private CustomerId customerId;
    private List<OrderItemDTO> items;
    private Address shippingAddress;
}

// 命令处理器
@Service
public class OrderCommandHandler {

    private final EventSourcingRepository<Order> repository;

    public OrderId handle(CreateOrderCommand cmd) {
        Order order = Order.create(
            cmd.getCustomerId(),
            cmd.getShippingAddress()
        );

        for (var item : cmd.getItems()) {
            order.addItem(item.getProductId(), item.getProductName(),
                         item.getUnitPrice(), item.getQuantity());
        }

        repository.save(order);
        return order.getId();
    }
}

// ========== 读端（Query 端）==========

// 读模型（针对查询优化）
@Entity
@Table(name = "order_summary")
public class OrderSummary {

    @Id
    private String orderId;
    private String customerId;
    private String status;
    private BigDecimal totalAmount;
    private int itemCount;
    private Instant createdAt;

    // 针对列表查询优化，不包含详细商品列表
}

// 投影器（事件处理器）
@Component
public class OrderProjector {

    private final OrderSummaryRepository repository;

    @EventHandler
    public void on(OrderCreated event) {
        OrderSummary summary = new OrderSummary();
        summary.setOrderId(event.getOrderId().toString());
        summary.setCustomerId(event.getCustomerId().toString());
        summary.setStatus("CREATED");
        summary.setTotalAmount(BigDecimal.ZERO);
        summary.setItemCount(0);
        summary.setCreatedAt(event.getOccurredAt());

        repository.save(summary);
    }

    @EventHandler
    public void on(OrderItemAdded event) {
        repository.findById(event.getOrderId().toString())
            .ifPresent(summary -> {
                summary.setItemCount(summary.getItemCount() + 1);
                summary.setTotalAmount(
                    summary.getTotalAmount().add(
                        event.getUnitPrice().getAmount()
                            .multiply(BigDecimal.valueOf(event.getQuantity()))
                    )
                );
                repository.save(summary);
            });
    }

    @EventHandler
    public void on(OrderPaid event) {
        repository.findById(event.getOrderId().toString())
            .ifPresent(summary -> {
                summary.setStatus("PAID");
                repository.save(summary);
            });
    }
}

// 查询服务
@Service
public class OrderQueryService {

    private final OrderSummaryRepository repository;

    public Page<OrderSummary> listOrders(String customerId, Pageable pageable) {
        return repository.findByCustomerId(customerId, pageable);
    }

    public Optional<OrderSummary> getOrder(String orderId) {
        return repository.findById(orderId);
    }
}
```

---

## 6. 适用场景

### 6.1 适合使用事件溯源的场景

```
┌─────────────────────────────────────────────────────────────┐
│                   推荐使用场景                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 需要完整审计追踪                                        │
│      金融交易、医疗记录、法律文档                            │
│                                                             │
│   ✅ 需要时态查询                                            │
│      "上周三用户账户余额是多少？"                            │
│                                                             │
│   ✅ 事件驱动架构                                            │
│      微服务间通过事件通信                                    │
│                                                             │
│   ✅ 复杂业务规则                                            │
│      规则频繁变化，需要灵活调整                              │
│                                                             │
│   ✅ 需要事件回放/重试                                       │
│      系统集成、数据同步                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 不推荐使用的场景

| 场景 | 原因 |
|------|------|
| 简单 CRUD | 过度设计，增加复杂度 |
| 无审计需求 | 传统存储足够 |
| 对实时一致性要求高 | 事件溯源是最终一致性 |
| 团队不熟悉 | 学习曲线陡峭 |
| 事件格式频繁变化 | 版本管理复杂 |

---

## 7. 最佳实践

### 7.1 事件版本管理

```java
// 事件版本化
public abstract class DomainEvent {

    private final int version = 1;  // 事件版本号
    private final Instant occurredAt;
    private final String eventId;

    // 事件升级器
    public interface Upgrader<T extends DomainEvent> {
        T upgrade(T event);
    }
}

// 订单创建事件 v2
public class OrderCreatedV2 extends DomainEvent {

    private final OrderId orderId;
    private final CustomerId customerId;
    private final String couponCode;  // V2 新增字段

    // 从 V1 升级
    public static OrderCreatedV2 fromV1(OrderCreatedV1 v1) {
        return new OrderCreatedV2(
            v1.getOrderId(),
            v1.getCustomerId(),
            null  // 新字段默认值
        );
    }
}

// 事件反序列化时升级
public class EventUpgrader {

    public DomainEvent upgrade(DomainEvent event) {
        if (event instanceof OrderCreatedV1 v1) {
            return OrderCreatedV2.fromV1(v1);
        }
        return event;
    }
}
```

### 7.2 事件粒度设计

```
┌─────────────────────────────────────────────────────────────┐
│                   事件粒度原则                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 事件应表示业务事实，而非技术细节                         │
│                                                             │
│   ✅ 事件名称使用业务语言                                    │
│      OrderPaid ✓  /  OrderStatusChanged ✗                  │
│                                                             │
│   ✅ 事件应足够细粒度，支持灵活重建                           │
│      ItemAdded + ItemRemoved ✓                             │
│      OrderItemsUpdated ✗                                    │
│                                                             │
│   ✅ 包含足够信息，减少关联查询                               │
│      包含 productName、unitPrice 而不只是 productId          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 性能优化建议

| 优化手段 | 说明 |
|----------|------|
| 快照 | 每隔 N 个事件保存状态快照 |
| 分区 | 按 aggregate_id 分区存储 |
| 索引 | 对常用查询字段建索引 |
| 缓存 | 热点聚合缓存到 Redis |
| 异步投影 | 读模型异步更新，提升写入性能 |

---

## 8. 小结

事件溯源核心要点：

| 概念 | 说明 |
|------|------|
| 事件存储 | 只存储事件，不存储状态 |
| 状态重建 | 通过重放事件恢复状态 |
| 快照 | 定期保存状态，加速重建 |
| CQRS | 读写分离，结合事件溯源效果更佳 |

**优势**：完整历史、审计追踪、时态查询、事件驱动
**代价**：学习曲线、复杂度增加、最终一致性

**下一步**：[DDD 指导微服务拆分](./DDD-microservice) - 将 DDD 战略设计应用于微服务架构。