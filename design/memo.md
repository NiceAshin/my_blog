---
date: 2021-01-24 09:00:00
sidebar: auto
prev: ./agent
next: ./interpreter
---

# 备忘录模式

> 预计阅读时间：5 分钟

备忘录（Memento）模式用于在**不破坏封装的前提下，捕获对象内部状态并在之后恢复**。常用于实现撤销、回滚、快照等功能。

## 适用场景

- 需要实现撤销/重做功能，例如编辑器、表单、游戏存档。
- 对象内部状态复杂，恢复时希望避免暴露细节给外部调用者。
- 分布式事务或聚合根需要保存快照，以便故障后恢复。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Originator（发起者） | 负责创建备忘录对象并在需要时恢复状态。 |
| Memento（备忘录） | 存储发起者的内部状态，通常对外不可见。 |
| Caretaker（负责人） | 负责保存、管理备忘录，但不操作其内部结构。 |

## 示例：表单撤销

```java
// 发起者：表单对象
public class Form {
    private String name;
    private String email;

    public void fill(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public FormMemento save() {
        return new FormMemento(name, email);
    }

    public void restore(FormMemento memento) {
        this.name = memento.getName();
        this.email = memento.getEmail();
    }

    @Override
    public String toString() {
        return "Form{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }

    // 备忘录定义为静态内部类，外部只能以受限接口访问
    public static class FormMemento {
        private final String name;
        private final String email;

        private FormMemento(String name, String email) {
            this.name = name;
            this.email = email;
        }

        private String getName() {
            return name;
        }

        private String getEmail() {
            return email;
        }
    }
}

// 负责人：维护备忘录栈
public class FormHistory {
    private final Deque<Form.FormMemento> stack = new ArrayDeque<>();

    public void push(Form.FormMemento memento) {
        stack.push(memento);
    }

    public Form.FormMemento pop() {
        return stack.poll();
    }
}
```

使用：

```java
Form form = new Form();
FormHistory history = new FormHistory();

form.fill("张三", "zhangsan@example.com");
history.push(form.save());
form.fill("李四", "lisi@example.com");
System.out.println(form); // 最新状态

Form.FormMemento last = history.pop();
if (last != null) {
    form.restore(last);
}
System.out.println(form); // 恢复到张三
```

## 优缺点

**优点**
- 保存对象历史状态，易于实现撤销、回滚等功能。
- 备忘录可对外隐藏，实现对调用者的封装。

**缺点**
- 频繁保存状态会占用大量内存或存储空间。
- 若对象状态过于庞大，需要压缩或增量存储。

## 实践建议

- 根据业务需求控制备忘录数量，可结合快照 + 日志的混合方案。
- 备忘录对象应设计为不可变，确保状态一致性。
- 在持久化存储备忘录时注意敏感信息的加密与访问控制。
