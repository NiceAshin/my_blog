---
title: DDD 战术设计
date: 2023-10-15
categories:
  - 架构
tags:
  - DDD
  - 战术设计
  - 聚合
  - 实体
  - 值对象
---

# DDD 战术设计：聚合与模式

战术设计提供了一套具体的模式来开发领域的业务逻辑。在战略设计划定的限界上下文内，我们使用这些模式来组织代码，构建丰富的领域模型。

---

## 1. 战术设计元素概览

```
┌──────────────────────────────────────────────────────────────┐
│                    领域模型元素                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  聚合 (Aggregate)                     │   │
│   │  ┌───────────────────────────────────────────────┐  │   │
│   │  │              聚合根 (Aggregate Root)           │  │   │
│   │  │  ┌─────────────┐                              │  │   │
│   │  │  │   实体       │    一致性边界                 │  │   │
│   │  │  │  Entity     │                              │  │   │
│   │  │  └─────────────┘                              │  │   │
│   │  │  ┌─────────────┐  ┌─────────────┐             │  │   │
│   │  │  │   实体       │  │   值对象    │             │  │   │
│   │  │  │  Entity     │  │Value Object│             │  │   │
│   │  │  └─────────────┘  └─────────────┘             │  │   │
│   │  └───────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│   │  领域服务   │  │  领域事件   │  │     工厂        │     │
│   │Domain Svc  │  │Domain Event│  │    Factory      │     │
│   └─────────────┘  └─────────────┘  └─────────────────┘     │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐                          │
│   │   仓储      │  │   资源库    │                          │
│   │ Repository │  │ Repository │                          │
│   └─────────────┘  └─────────────┘                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 实体 (Entity)

### 2.1 定义

**实体是具有唯一标识的对象**，其 identity 在整个生命周期中保持不变，即使属性发生变化。

### 2.2 实体特征

```
┌─────────────────────────────────────────────────────────────┐
│                      实体判断标准                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 有唯一标识（ID）                                        │
│   ✅ 生命周期中有状态变化                                     │
│   ✅ 通过 ID 判断相等性，而非属性                             │
│   ✅ 封装业务行为                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 实体实现示例

```java
// 订单实体
public class Order extends Entity<OrderId> {

    private OrderId id;              // 唯一标识
    private CustomerId customerId;   // 客户ID
    private OrderStatus status;      // 状态
    private List<OrderItem> items;   // 订单项
    private Money totalAmount;       // 总金额
    private Instant createdAt;       // 创建时间

    // 构造方法
    private Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
        this.status = OrderStatus.CREATED;
        this.items = new ArrayList<>();
        this.createdAt = Instant.now();
    }

    // 工厂方法
    public static Order create(CustomerId customerId) {
        return new Order(OrderId.generate(), customerId);
    }

    // 业务行为：添加商品
    public void addItem(Product product, int quantity) {
        // 业务规则：已支付的订单不能修改
        if (status == OrderStatus.PAID) {
            throw new OrderCannotModifyException("已支付订单不能添加商品");
        }

        OrderItem item = OrderItem.create(product, quantity);
        items.add(item);
        recalculateTotal();
    }

    // 业务行为：支付
    public void pay(Payment payment) {
        // 业务规则：只有待支付状态才能支付
        if (status != OrderStatus.CREATED) {
            throw new InvalidOrderStatusException("当前状态不允许支付");
        }

        // 业务规则：支付金额必须匹配
        if (!payment.getAmount().equals(totalAmount)) {
            throw new PaymentAmountMismatchException("支付金额不匹配");
        }

        this.status = OrderStatus.PAID;

        // 发布领域事件
        registerEvent(new OrderPaidEvent(this.id, this.customerId, this.totalAmount));
    }

    // 业务行为：取消
    public void cancel(String reason) {
        if (status == OrderStatus.SHIPPED) {
            throw new OrderCannotCancelException("已发货订单不能取消");
        }

        this.status = OrderStatus.CANCELLED;
        registerEvent(new OrderCancelledEvent(this.id, reason));
    }

    // 内部方法：重新计算总额
    private void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }

    @Override
    public OrderId getId() {
        return id;
    }

    // 通过 ID 判断相等性
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(id, order.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

---

## 3. 值对象 (Value Object)

### 3.1 定义

**值对象通过属性值定义，没有唯一标识**，两个值对象所有属性相同即认为相等。

### 3.2 值对象特征

```
┌─────────────────────────────────────────────────────────────┐
│                     值对象判断标准                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 无唯一标识，通过属性判断相等性                           │
│   ✅ 不可变（Immutable）                                     │
│   ✅ 可以自由替换（相同值可互相替换）                         │
│   ✅ 封装业务概念，提高代码可读性                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 值对象实现示例

```java
// 金额值对象
public class Money implements ValueObject {

    private final BigDecimal amount;
    private final Currency currency;

    // 私有构造，保证不可变
    private Money(BigDecimal amount, Currency currency) {
        if (amount == null || currency == null) {
            throw new IllegalArgumentException("金额和货币不能为空");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("金额不能为负数");
        }
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    // 静态工厂方法
    public static Money of(BigDecimal amount, String currencyCode) {
        return new Money(amount, Currency.getInstance(currencyCode));
    }

    public static Money of(double amount, String currencyCode) {
        return new Money(BigDecimal.valueOf(amount), Currency.getInstance(currencyCode));
    }

    public static final Money ZERO = Money.of(0, "CNY");

    // 业务行为：加法
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException("货币类型不匹配");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    // 业务行为：乘法
    public Money multiply(int quantity) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(quantity)), this.currency);
    }

    // 业务行为：比较
    public boolean isGreaterThan(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException("货币类型不匹配");
        }
        return this.amount.compareTo(other.amount) > 0;
    }

    // 所有属性相等才相等
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.equals(money.amount) && currency.equals(money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
}

// 地址值对象
public class Address implements ValueObject {

    private final String province;
    private final String city;
    private final String district;
    private final String detail;

    // 不可变：所有字段 final
    private Address(String province, String city, String district, String detail) {
        this.province = province;
        this.city = city;
        this.district = district;
        this.detail = detail;
    }

    public static Address of(String province, String city, String district, String detail) {
        return new Address(province, city, district, detail);
    }

    // 返回新对象，而非修改
    public Address withDetail(String newDetail) {
        return new Address(this.province, this.city, this.district, newDetail);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(province, address.province) &&
               Objects.equals(city, address.city) &&
               Objects.equals(district, address.district) &&
               Objects.equals(detail, address.detail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(province, city, district, detail);
    }
}
```

### 3.4 值对象 vs 实体选择

| 判断依据 | 实体 | 值对象 |
|----------|------|--------|
| 是否需要唯一标识 | 是 | 否 |
| 生命周期中状态变化 | 有变化 | 不变 |
| 相等性判断 | 通过 ID | 通过所有属性 |
| 示例 | Order, Customer, Account | Money, Address, DateRange |

---

## 4. 聚合 (Aggregate)

### 4.1 定义

**聚合是一组相关对象的集合，作为数据修改的单元**。每个聚合有一个根，外部只能通过根访问聚合内部对象。

### 4.2 聚合的作用

```
┌─────────────────────────────────────────────────────────────┐
│                    聚合的一致性边界                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   聚合保证：                                                 │
│   1. 事务一致性：聚合内的所有修改保持一致                      │
│   2. 业务规则：聚合根负责维护内部不变性                       │
│   3. 访问控制：外部只能通过聚合根访问内部对象                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    订单聚合                          │  │
│   │  ┌───────────────────────────────────────────────┐  │  │
│   │  │              Order (聚合根)                    │  │  │
│   │  │                                               │  │  │
│   │  │   ┌──────────┐    ┌──────────┐               │  │  │
│   │  │   │OrderItem │    │ Shipping │               │  │  │
│   │  │   │  (实体)   │    │ Address  │               │  │  │
│   │  │   └──────────┘    │ (值对象)  │               │  │  │
│   │  │                   └──────────┘               │  │  │
│   │  └───────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   外部访问：order.addItem() ✅                               │
│   外部访问：orderItem.setPrice() ❌ 禁止直接访问              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 聚合设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                   聚合设计四原则                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 在聚合边界内保护业务不变性                                 │
│     所有业务规则由聚合根验证和维护                            │
│                                                             │
│  2. 聚合要设计得小                                           │
│     只包含必要的实体和值对象，减小事务范围                     │
│                                                             │
│  3. 只能通过聚合根修改                                        │
│     外部不能直接操作聚合内部对象                              │
│                                                             │
│  4. 使用 ID 引用其他聚合                                      │
│     聚合之间通过 ID 关联，而非对象引用                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 聚合实现示例

```java
// 订单聚合根
@Entity
@Table(name = "t_order")
public class Order implements AggregateRoot<OrderId> {

    @EmbeddedId
    private OrderId id;

    @Embedded
    private CustomerId customerId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // 使用 ID 引用其他聚合
    // @ManyToOne ❌ 不要这样关联其他聚合
    // private Customer customer;

    // 聚合内部对象：订单项
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    @Embedded
    private Money totalAmount;

    @Embedded
    private Address shippingAddress;

    // 领域事件
    @Transient
    private final List<DomainEvent> events = new ArrayList<>();

    // 添加订单项（通过聚合根操作）
    public void addItem(ProductId productId, String productName,
                        Money unitPrice, int quantity) {
        // 业务规则检查
        if (status != OrderStatus.CREATED) {
            throw new OrderCannotModifyException("订单状态不允许修改");
        }

        // 创建内部实体
        OrderItem item = OrderItem.create(
            OrderItemId.generate(),
            productId,
            productName,
            unitPrice,
            quantity
        );

        items.add(item);
        recalculateTotal();
    }

    // 移除订单项
    public void removeItem(OrderItemId itemId) {
        if (status != OrderStatus.CREATED) {
            throw new OrderCannotModifyException("订单状态不允许修改");
        }

        items.removeIf(item -> item.getId().equals(itemId));
        recalculateTotal();
    }

    // 修改收货地址
    public void changeShippingAddress(Address newAddress) {
        if (status == OrderStatus.SHIPPED) {
            throw new OrderCannotModifyException("已发货订单不能修改地址");
        }
        this.shippingAddress = newAddress;
    }

    // 支付
    public void pay(PaymentId paymentId) {
        if (status != OrderStatus.CREATED) {
            throw new InvalidOrderStatusException("当前状态不允许支付");
        }
        this.status = OrderStatus.PAID;

        // 发布领域事件
        registerEvent(new OrderPaidEvent(
            this.id,
            this.customerId,
            this.totalAmount,
            paymentId
        ));
    }

    // 发货
    public void ship(String trackingNumber) {
        if (status != OrderStatus.PAID) {
            throw new InvalidOrderStatusException("只有已支付订单可以发货");
        }
        this.status = OrderStatus.SHIPPED;

        registerEvent(new OrderShippedEvent(this.id, trackingNumber));
    }

    // 内部方法：重算总额
    private void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }

    // 注册领域事件
    private void registerEvent(DomainEvent event) {
        this.events.add(event);
    }

    @Override
    public List<DomainEvent> pullEvents() {
        List<DomainEvent> result = new ArrayList<>(events);
        events.clear();
        return result;
    }
}

// 订单项（聚合内部实体）
@Entity
@Table(name = "t_order_item")
public class OrderItem implements Entity<OrderItemId> {

    @EmbeddedId
    private OrderItemId id;

    @Embedded
    private ProductId productId;

    private String productName;

    @Embedded
    private Money unitPrice;

    private int quantity;

    // 包内可见，供聚合根调用
    static OrderItem create(OrderItemId id, ProductId productId,
                            String productName, Money unitPrice, int quantity) {
        OrderItem item = new OrderItem();
        item.id = id;
        item.productId = productId;
        item.productName = productName;
        item.unitPrice = unitPrice;
        item.quantity = quantity;
        return item;
    }

    public Money getSubtotal() {
        return unitPrice.multiply(quantity);
    }

    // 不提供 public setter，防止外部直接修改
}
```

---

## 5. 领域服务 (Domain Service)

### 5.1 定义

**领域服务承载不属于任何实体或值对象的业务逻辑**，通常涉及多个聚合的协调。

### 5.2 何时使用领域服务

```
┌─────────────────────────────────────────────────────────────┐
│                   使用领域服务的场景                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 操作涉及多个聚合                                         │
│   ✅ 操作无状态，不属于某个实体                                │
│   ✅ 需要访问外部资源（通过接口）                              │
│                                                             │
│   ❌ 如果可以放在实体中，优先放在实体                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 领域服务示例

```java
// 转账领域服务（涉及两个账户聚合）
public interface TransferService {

    // 转账操作
    TransferResult transfer(TransferCommand command);
}

// 实现
@Service
public class TransferServiceImpl implements TransferService {

    private final AccountRepository accountRepository;
    private final ExchangeRateService exchangeRateService;

    public TransferServiceImpl(
            AccountRepository accountRepository,
            ExchangeRateService exchangeRateService) {
        this.accountRepository = accountRepository;
        this.exchangeRateService = exchangeRateService;
    }

    @Override
    public TransferResult transfer(TransferCommand command) {
        // 加载两个聚合
        Account sourceAccount = accountRepository.findById(command.getSourceAccountId())
            .orElseThrow(() -> new AccountNotFoundException("转出账户不存在"));

        Account targetAccount = accountRepository.findById(command.getTargetAccountId())
            .orElseThrow(() -> new AccountNotFoundException("转入账户不存在"));

        // 获取汇率（如果跨币种）
        Money transferAmount = command.getAmount();
        if (!sourceAccount.getCurrency().equals(targetAccount.getCurrency())) {
            ExchangeRate rate = exchangeRateService.getRate(
                sourceAccount.getCurrency(),
                targetAccount.getCurrency()
            );
            transferAmount = rate.convert(transferAmount);
        }

        // 执行转账（两个聚合的协调）
        sourceAccount.debit(command.getAmount());
        targetAccount.credit(transferAmount);

        // 保存
        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        return TransferResult.success(
            sourceAccount.getId(),
            targetAccount.getId(),
            command.getAmount()
        );
    }
}
```

---

## 6. 仓储 (Repository)

### 6.1 定义

**仓储封装数据访问逻辑**，为领域对象提供类似集合的接口。

### 6.2 仓储设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    仓储设计原则                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 为每个聚合定义一个仓储                                   │
│      Order -> OrderRepository                               │
│                                                             │
│   2. 只为聚合根定义仓储                                       │
│      OrderItem 不需要单独的仓储                              │
│                                                             │
│   3. 接口定义在领域层，实现在基础设施层                        │
│                                                             │
│   4. 提供类似集合的操作接口                                   │
│      findById, save, delete                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 仓储实现示例

```java
// 领域层：仓储接口
public interface OrderRepository {

    Order findById(OrderId id);

    List<Order> findByCustomerId(CustomerId customerId);

    List<Order> findByStatus(OrderStatus status);

    void save(Order order);

    void delete(Order order);

    // 下一个 ID
    OrderId nextId();
}

// 基础设施层：仓储实现
@Repository
public class JpaOrderRepository implements OrderRepository {

    private final OrderJpaRepository jpaRepository;
    private final OrderMapper mapper;

    @Override
    public Order findById(OrderId id) {
        OrderPO po = jpaRepository.findById(id.getValue())
            .orElse(null);
        return po != null ? mapper.toDomain(po) : null;
    }

    @Override
    public void save(Order order) {
        OrderPO po = mapper.toPO(order);
        jpaRepository.save(po);

        // 发布领域事件
        order.pullEvents().forEach(eventPublisher::publish);
    }

    @Override
    public OrderId nextId() {
        return OrderId.of(UUID.randomUUID().toString());
    }
}
```

---

## 7. 领域事件 (Domain Event)

### 7.1 定义

**领域事件表示领域中发生的事实**，用于解耦聚合之间的协作。

### 7.2 领域事件特征

```
┌─────────────────────────────────────────────────────────────┐
│                   领域事件特征                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✅ 用过去时态命名：OrderCreated, PaymentCompleted          │
│   ✅ 不可变：事件发生后不能修改                               │
│   ✅ 包含事件发生时间和相关数据                               │
│   ✅ 由聚合根产生并发布                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 领域事件实现

```java
// 领域事件基类
public abstract class DomainEvent {

    private final Instant occurredAt;
    private final String eventId;

    protected DomainEvent() {
        this.occurredAt = Instant.now();
        this.eventId = UUID.randomUUID().toString();
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public String getEventId() {
        return eventId;
    }
}

// 订单已支付事件
public class OrderPaidEvent extends DomainEvent {

    private final OrderId orderId;
    private final CustomerId customerId;
    private final Money amount;
    private final PaymentId paymentId;

    public OrderPaidEvent(OrderId orderId, CustomerId customerId,
                          Money amount, PaymentId paymentId) {
        super();
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.paymentId = paymentId;
    }

    // getters...
}

// 事件发布器
public interface EventPublisher {
    void publish(DomainEvent event);
}

// 事件处理器
@Component
public class OrderPaidEventHandler {

    private final NotificationService notificationService;
    private final InventoryService inventoryService;

    @EventListener
    public void handle(OrderPaidEvent event) {
        // 发送通知
        notificationService.sendOrderPaidNotification(
            event.getCustomerId(),
            event.getOrderId()
        );

        // 预留库存
        inventoryService.reserveInventory(event.getOrderId());
    }
}
```

---

## 8. 实战：完整聚合示例

```java
// ========== 领域层 ==========

// 聚合根
public class Order implements AggregateRoot<OrderId> {

    private OrderId id;
    private CustomerId customerId;
    private OrderStatus status;
    private List<OrderItem> items;
    private Money totalAmount;
    private Address shippingAddress;
    private List<DomainEvent> events = new ArrayList<>();

    // 工厂方法
    public static Order create(CustomerId customerId, Address shippingAddress) {
        Order order = new Order();
        order.id = OrderId.generate();
        order.customerId = customerId;
        order.status = OrderStatus.CREATED;
        order.items = new ArrayList<>();
        order.shippingAddress = shippingAddress;
        order.totalAmount = Money.ZERO;

        order.registerEvent(new OrderCreatedEvent(order.id, customerId));
        return order;
    }

    // 业务方法
    public void addItem(ProductId productId, String name, Money price, int qty) {
        ensureModifiable();

        OrderItem item = OrderItem.create(productId, name, price, qty);
        items.add(item);
        recalculate();
    }

    public void pay(PaymentId paymentId, Money paidAmount) {
        if (status != OrderStatus.CREATED) {
            throw new BusinessException("订单状态不正确");
        }
        if (!totalAmount.equals(paidAmount)) {
            throw new BusinessException("支付金额不正确");
        }

        status = OrderStatus.PAID;
        registerEvent(new OrderPaidEvent(id, paymentId, totalAmount));
    }

    public void ship(String trackingNo) {
        if (status != OrderStatus.PAID) {
            throw new BusinessException("只能发货已支付订单");
        }
        status = OrderStatus.SHIPPED;
        registerEvent(new OrderShippedEvent(id, trackingNo));
    }

    public void complete() {
        if (status != OrderStatus.SHIPPED) {
            throw new BusinessException("只能完成已发货订单");
        }
        status = OrderStatus.COMPLETED;
        registerEvent(new OrderCompletedEvent(id));
    }

    private void ensureModifiable() {
        if (status != OrderStatus.CREATED) {
            throw new BusinessException("订单不可修改");
        }
    }

    private void recalculate() {
        totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }

    private void registerEvent(DomainEvent event) {
        events.add(event);
    }

    @Override
    public List<DomainEvent> pullEvents() {
        var result = new ArrayList<>(events);
        events.clear();
        return result;
    }

    // getters...
}

// 订单项（内部实体）
public class OrderItem {

    private OrderItemId id;
    private ProductId productId;
    private String productName;
    private Money unitPrice;
    private int quantity;

    static OrderItem create(ProductId productId, String name, Money price, int qty) {
        var item = new OrderItem();
        item.id = OrderItemId.generate();
        item.productId = productId;
        item.productName = name;
        item.unitPrice = price;
        item.quantity = qty;
        return item;
    }

    Money getSubtotal() {
        return unitPrice.multiply(quantity);
    }
}

// ========== 应用层 ==========

@Service
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public OrderId createOrder(CreateOrderCommand cmd) {
        // 创建聚合
        Order order = Order.create(
            cmd.getCustomerId(),
            cmd.getShippingAddress()
        );

        // 添加商品
        for (var item : cmd.getItems()) {
            Product product = productRepository.findById(item.getProductId());
            order.addItem(
                product.getId(),
                product.getName(),
                product.getPrice(),
                item.getQuantity()
            );
        }

        // 保存
        orderRepository.save(order);

        // 发布事件
        publishEvents(order);

        return order.getId();
    }

    @Transactional
    public void payOrder(PayOrderCommand cmd) {
        Order order = orderRepository.findById(cmd.getOrderId());
        order.pay(cmd.getPaymentId(), cmd.getAmount());
        orderRepository.save(order);
        publishEvents(order);
    }

    private void publishEvents(Order order) {
        order.pullEvents().forEach(eventPublisher::publish);
    }
}
```

---

## 9. 小结

战术设计的核心模式：

| 模式 | 作用 |
|------|------|
| 实体 | 有唯一标识的业务对象 |
| 值对象 | 无标识、不可变的业务概念 |
| 聚合 | 一致性边界，保护业务规则 |
| 领域服务 | 跨聚合的业务协调 |
| 仓储 | 数据访问抽象 |
| 领域事件 | 聚合间解耦通信 |

**下一步**：[事件溯源](./event-source) - 了解如何使用事件存储领域状态。