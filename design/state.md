---
date: 2021-04-25 09:00:00
sidebar: auto
prev: ./interpreter
next: ./strategy
---

# 状态模式

> 预计阅读时间：8 分钟

状态（State）模式允许对象在其内部状态改变时改变行为，对象看起来像是修改了自身的类。核心思想是**把状态封装成独立对象，并在上下文中持有状态引用**，通过切换状态对象改变行为。

## 适用场景

- 对象的行为依赖于内部状态，并且需要在运行时根据状态切换行为。
- 条件判断逻辑复杂（大量 `if/else` 或 `switch`），希望用多态替代。
- 有限状态机（FSM）建模，例如订单流转、工作流审批、任务调度。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Context（上下文） | 持有当前状态对象，对外提供统一接口。 |
| State（状态接口） | 定义各个状态下的行为。 |
| ConcreteState | 具体状态实现，封装状态对应的行为及状态迁移。 |

## 示例：订单状态流转

订单可能处于“待支付、已支付、已发货、已取消”等状态。使用状态模式管理状态变化：

```java
public interface OrderState {
    void pay(OrderContext context);
    void ship(OrderContext context);
    void cancel(OrderContext context);
    String name();
}

public class OrderContext {
    private OrderState state = new PendingState();

    public void changeState(OrderState newState) {
        this.state = newState;
    }

    public void pay() { state.pay(this); }
    public void ship() { state.ship(this); }
    public void cancel() { state.cancel(this); }
    public String currentState() { return state.name(); }
}

public class PendingState implements OrderState {
    @Override
    public void pay(OrderContext context) {
        // 调用支付网关
        context.changeState(new PaidState());
    }

    @Override
    public void ship(OrderContext context) {
        throw new IllegalStateException("待支付订单不能发货");
    }

    @Override
    public void cancel(OrderContext context) {
        context.changeState(new CancelledState());
    }

    @Override
    public String name() { return "PENDING"; }
}

public class PaidState implements OrderState {
    @Override
    public void pay(OrderContext context) {
        throw new IllegalStateException("订单已支付");
    }

    @Override
    public void ship(OrderContext context) {
        // 调用仓储系统发货
        context.changeState(new ShippedState());
    }

    @Override
    public void cancel(OrderContext context) {
        // 调用退款流程
        context.changeState(new CancelledState());
    }

    @Override
    public String name() { return "PAID"; }
}

public class ShippedState implements OrderState {
    @Override
    public void pay(OrderContext context) {
        throw new IllegalStateException("已发货订单无法支付");
    }

    @Override
    public void ship(OrderContext context) {
        // 已发货，无需重复发货
    }

    @Override
    public void cancel(OrderContext context) {
        throw new IllegalStateException("已发货订单无法取消");
    }

    @Override
    public String name() { return "SHIPPED"; }
}

public class CancelledState implements OrderState {
    @Override
    public void pay(OrderContext context) {
        throw new IllegalStateException("订单已取消");
    }

    @Override
    public void ship(OrderContext context) {
        throw new IllegalStateException("已取消订单无法发货");
    }

    @Override
    public void cancel(OrderContext context) {
        // 已取消，无操作
    }

    @Override
    public String name() { return "CANCELLED"; }
}
```

客户端：

```java
OrderContext order = new OrderContext();
order.pay();
order.ship();
System.out.println(order.currentState()); // SHIPPED
```

## 优缺点

**优点**
- 用对象分离各个状态逻辑，避免大量条件分支。
- 状态迁移集中在状态类中，便于维护与扩展。
- 新增状态只需扩展新的状态类，符合开闭原则。

**缺点**
- 状态数量较多时，类文件增加。
- 状态之间可能相互引用，需要注意依赖关系。

## 实践建议

- 明确状态机的状态与事件，配合状态转移表/图表验证。
- 可结合枚举、策略模式进一步封装状态行为。
- 如果状态切换频繁，考虑状态对象复用（单例）以降低创建成本。
