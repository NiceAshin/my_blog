---
date: 2020/06/18 09:00:00
sidebar: auto
prev: ./observer
next: ./memo
---

# 中介者模式

> 预计阅读时间：6 分钟

中介者（Mediator）模式通过引入一个中介对象，**集中管理对象之间的交互**，从而降低对象之间的耦合。各个同事对象不再直接通信，而是通过中介者协调。

## 适用场景

- 多个对象之间存在复杂交互，彼此直接引用导致网状依赖。
- 希望把交互逻辑抽离到中心化组件，便于维护和复用。
- GUI、聊天系统、工作流引擎等需要协调多个同事对象的场景。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Mediator（中介者接口） | 定义与同事对象交互的统一方法。 |
| ConcreteMediator | 持有同事对象引用，实现协调逻辑。 |
| Colleague（同事抽象类/接口） | 抽象各个参与者，通过中介者发送消息。 |
| ConcreteColleague | 具体同事对象，完成自身逻辑并依赖中介者通信。 |

## 示例：聊天室

实现一个简单的聊天室，同事对象是用户，通过中介者发送消息：

```java
public interface ChatMediator {
    void register(User user);
    void broadcast(User from, String message);
}

public class DefaultChatMediator implements ChatMediator {
    private final List<User> users = new CopyOnWriteArrayList<>();

    @Override
    public void register(User user) {
        users.add(user);
    }

    @Override
    public void broadcast(User from, String message) {
        for (User user : users) {
            if (!user.equals(from)) {
                user.receive(from.getName(), message);
            }
        }
    }
}

public abstract class User {
    protected final ChatMediator mediator;
    private final String name;

    protected User(ChatMediator mediator, String name) {
        this.mediator = mediator;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void send(String message) {
        mediator.broadcast(this, message);
    }

    public abstract void receive(String from, String message);
}

public class ChatUser extends User {
    public ChatUser(ChatMediator mediator, String name) {
        super(mediator, name);
    }

    @Override
    public void receive(String from, String message) {
        System.out.printf("[%s] <- %s: %s%n", getName(), from, message);
    }
}
```

使用方式：

```java
ChatMediator mediator = new DefaultChatMediator();
User alice = new ChatUser(mediator, "Alice");
User bob = new ChatUser(mediator, "Bob");
User claire = new ChatUser(mediator, "Claire");

mediator.register(alice);
mediator.register(bob);
mediator.register(claire);

alice.send("今天下午上线预发布");
bob.send("收到，我来准备数据");
```

## 优缺点

**优点**
- 降低对象之间的耦合，每个同事对象只依赖中介者。
- 把交互逻辑集中起来，便于维护、测试和复用。
- 可以在中介者中实现复杂的协调策略（如状态同步、广播/点对点等）。

**缺点**
- 中介者承担大量逻辑，容易演变成“上帝类”。
- 若交互逻辑非常复杂，中介者实现也会变得臃肿。

## 实践建议

- 保持同事对象职责单一，把交互细节交给中介者处理。
- 对中介者进行模块化设计，可拆分为多个中介者或结合事件总线实现。
- 为避免中介者过于庞大，可配合状态机或策略模式组织复杂规则。
