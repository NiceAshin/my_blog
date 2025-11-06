---
date: 2020-09-17 09:00:00
sidebar: auto
prev: ./template
next: ./access
---

# 命令模式

> 预计阅读时间：5 分钟

命令（Command）模式把一个请求封装为对象，使我们可以**用不同的命令参数化调用者**、将请求排队或记录日志，并支持撤销/重做等操作。

## 适用场景

- GUI、CLI 等需要对用户操作做抽象，支持撤销重做。
- 需要在系统中排队执行任务，如批量操作、延迟执行、异步队列。
- 希望记录操作日志或支持宏命令（组合多个命令一次执行）。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Command（命令接口） | 声明执行操作的方法。 |
| ConcreteCommand（具体命令） | 绑定接收者，调用接收者完成操作。 |
| Receiver（接收者） | 真正执行请求的对象。 |
| Invoker（调用者） | 持有命令，在合适的时机触发执行。 |

## 示例：文本编辑撤销功能

```java
// 命令接口
public interface Command {
    void execute();
    void undo();
}

// 接收者：真正修改文档内容
public class TextDocument {
    private final StringBuilder content = new StringBuilder();

    public void append(String text) {
        content.append(text);
    }

    public void delete(int length) {
        content.delete(content.length() - length, content.length());
    }

    public String content() {
        return content.toString();
    }
}

// 具体命令：插入文本
public class AppendCommand implements Command {
    private final TextDocument document;
    private final String text;

    public AppendCommand(TextDocument document, String text) {
        this.document = document;
        this.text = text;
    }

    @Override
    public void execute() {
        document.append(text);
    }

    @Override
    public void undo() {
        document.delete(text.length());
    }
}

// 调用者：负责触发执行并维护历史
public class CommandInvoker {
    private final Deque<Command> history = new ArrayDeque<>();

    public void execute(Command command) {
        command.execute();
        history.push(command);
    }

    public void undo() {
        if (!history.isEmpty()) {
            history.pop().undo();
        }
    }
}
```

客户端：

```java
TextDocument document = new TextDocument();
CommandInvoker invoker = new CommandInvoker();

invoker.execute(new AppendCommand(document, "Hello"));
invoker.execute(new AppendCommand(document, " World"));
System.out.println(document.content()); // Hello World

invoker.undo();
System.out.println(document.content()); // Hello
```

## 优缺点

**优点**
- 把请求封装成对象，方便扩展、排队、记录日志等操作。
- 命令对象可复用，且易于组合成宏命令。
- 支持撤销/重做等功能，命令对象可以保存执行状态。

**缺点**
- 命令类数量增加，需妥善管理。
- 命令过多时可能带来性能与维护开销。

## 实践建议

- 对于批量命令可实现组合命令（Composite Command），避免逐个执行。
- 可以结合事件溯源或审计日志记录命令执行情况。
- 在复杂系统中，命令对象可实现序列化，支持持久化或分布式传输。
