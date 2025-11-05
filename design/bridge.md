---
sidebar: auto
prev: ./adapter
next: ./decorator
---

# 桥接模式

桥接（Bridge）模式通过**分离抽象部分与实现部分**，让它们可以独立变化。通常用于维度扩展较多的场景，如果使用继承会导致子类爆炸，桥接可以让不同维度在运行时自由组合。

## 适用场景

- 业务对象有多个独立维度需要组合，例如“消息类型 × 发送渠道”“图形类型 × 渲染引擎”。
- 运行时需要替换某一维度的实现，而不希望影响其他维度。
- 需要在保持 API 稳定的同时，允许后台实现不断扩展。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Abstraction（抽象类） | 定义面向客户端的高层接口，持有 Implementor 引用。 |
| RefinedAbstraction（扩展抽象类） | 在抽象层上做特定扩展，仍依赖实现层完成核心工作。 |
| Implementor（实现接口） | 定义实现层的通用能力。 |
| ConcreteImplementor | 具体实现，实现层的不同变体。 |

抽象层依赖实现层的接口，不直接依赖具体实现，借此达到解耦目的。

## 示例：消息通知中心

需求：系统需要把业务事件推送给不同的接收者，目前支持“系统告警”和“营销通知”两种消息类型，发送渠道包括“邮件、短信、钉钉”。使用桥接模式，把“消息类型”与“发送渠道”两个维度拆分，便于扩展。

```java
// 实现层接口：定义不同发送渠道需要具备的能力
public interface MessageSender {
    void send(String target, String title, String content);
}

public class EmailSender implements MessageSender {
    @Override
    public void send(String target, String title, String content) {
        // 调用企业邮局 API
    }
}

public class DingTalkSender implements MessageSender {
    @Override
    public void send(String target, String title, String content) {
        // 调用钉钉机器人 WebHook
    }
}

// 抽象层：面向业务的统一接口
public abstract class Notification {
    protected final MessageSender sender;

    protected Notification(MessageSender sender) {
        this.sender = sender;
    }

    public abstract void notify(String target, String content);
}

public class AlarmNotification extends Notification {
    public AlarmNotification(MessageSender sender) {
        super(sender);
    }

    @Override
    public void notify(String target, String content) {
        sender.send(target, "系统告警", "[告警] " + content);
    }
}

public class MarketingNotification extends Notification {
    public MarketingNotification(MessageSender sender) {
        super(sender);
    }

    @Override
    public void notify(String target, String content) {
        sender.send(target, "营销活动", content);
    }
}
```

使用时，可以在运行时自由组装：

```java
Notification alarmByEmail = new AlarmNotification(new EmailSender());
alarmByEmail.notify("infra@example.com", "Redis 集群延迟升高");

Notification marketingByDingTalk = new MarketingNotification(new DingTalkSender());
marketingByDingTalk.notify("https://oapi.dingtalk.com/robot/send", "新品限时折扣");
```

如果后续新增“微信渠道”或“审批提醒”这种抽象层扩展，只需要增加对应类即可，不会影响其他维度。

## 优缺点

**优点**
- 多维度扩展时结构清晰，避免大量继承导致的类爆炸。
- 抽象与实现可以独立演化，遵循开闭原则。
- 运行时可替换实现，便于 A/B 测试或灰度发布。

**缺点**
- 引入额外抽象层，初次理解成本较高。
- 当维度数量较少时，可能显得结构过重。

## 实践建议

- 识别是否存在“正交维度”，若只有单一维度或不会扩展，可先采用简单实现。
- 抽象层聚焦业务语义，避免暴露实现细节；实现层专注技术协议或能力。
- 可以结合策略模式，在桥接后的实现层内进一步封装可变策略。
