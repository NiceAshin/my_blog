---
date: 2021-03-20 13:55:23
sidebar: auto
prev: ./cmd
next: ./iterator
---

# 访问者模式

> 预计阅读时间：8 分钟

访问者（Visitor）模式允许我们在**不修改原有对象结构的前提下，为对象结构增加新的操作**。它通过把操作封装在访问者中，节点只负责接受访问者并回调对应方法。

## 适用场景

- 数据结构稳定，但需要频繁扩展新的操作，例如 AST、XML DOM、流程图。
- 同一组对象需要不同的处理方式，且希望避免在对象中塞入大量业务逻辑。
- 需要对对象结构做报表、统计、检查等横切操作。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Visitor（访问者接口） | 声明针对不同元素的访问方法。 |
| ConcreteVisitor | 实现具体操作。 |
| Element（元素接口） | 声明接受访问者的方法 `accept`。 |
| ConcreteElement | 实现 `accept`，把自身传给访问者。 |
| ObjectStructure | 维护元素集合，负责遍历并触发访问。 |

## 示例：代码质量扫描

一个简单的语法树包含类节点与方法节点，现在需要新增“统计代码行数”与“检查命名规范”两种操作，使用访问者模式实现：

```java
public interface AstNode {
    void accept(AstVisitor visitor);
}

public class ClassNode implements AstNode {
    private final String name;
    private final List<MethodNode> methods;

    public ClassNode(String name, List<MethodNode> methods) {
        this.name = name;
        this.methods = methods;
    }

    public String getName() { return name; }
    public List<MethodNode> getMethods() { return methods; }

    @Override
    public void accept(AstVisitor visitor) {
        visitor.visitClass(this);
    }
}

public class MethodNode implements AstNode {
    private final String name;
    private final int linesOfCode;

    public MethodNode(String name, int linesOfCode) {
        this.name = name;
        this.linesOfCode = linesOfCode;
    }

    public String getName() { return name; }
    public int getLinesOfCode() { return linesOfCode; }

    @Override
    public void accept(AstVisitor visitor) {
        visitor.visitMethod(this);
    }
}

public interface AstVisitor {
    void visitClass(ClassNode clazz);
    void visitMethod(MethodNode method);
}

public class LineCountVisitor implements AstVisitor {
    private int totalLines;

    @Override
    public void visitClass(ClassNode clazz) {
        clazz.getMethods().forEach(method -> method.accept(this));
    }

    @Override
    public void visitMethod(MethodNode method) {
        totalLines += method.getLinesOfCode();
    }

    public int totalLines() {
        return totalLines;
    }
}

public class NamingCheckVisitor implements AstVisitor {
    private final List<String> warnings = new ArrayList<>();

    @Override
    public void visitClass(ClassNode clazz) {
        if (!Character.isUpperCase(clazz.getName().charAt(0))) {
            warnings.add("类名需使用 PascalCase: " + clazz.getName());
        }
        clazz.getMethods().forEach(method -> method.accept(this));
    }

    @Override
    public void visitMethod(MethodNode method) {
        if (!Character.isLowerCase(method.getName().charAt(0))) {
            warnings.add("方法名需使用 camelCase: " + method.getName());
        }
    }

    public List<String> warnings() {
        return warnings;
    }
}
```

使用时：

```java
List<AstNode> ast = List.of(
        new ClassNode("OrderService", List.of(
                new MethodNode("placeOrder", 45),
                new MethodNode("Cancel", 18)))
);

LineCountVisitor lineVisitor = new LineCountVisitor();
ast.forEach(node -> node.accept(lineVisitor));
System.out.println("总行数:" + lineVisitor.totalLines());

NamingCheckVisitor namingVisitor = new NamingCheckVisitor();
ast.forEach(node -> node.accept(namingVisitor));
System.out.println("命名告警:" + namingVisitor.warnings());
```

## 优缺点

**优点**
- 在不修改元素类的情况下扩展新操作，符合开闭原则。
- 访问者可以维护自己的状态，方便做统计、汇总。
- 便于把不同操作封装在不同访问者中，保持关注点分离。

**缺点**
- 元素类新增类型时，需要修改所有访问者，违背开闭原则。
- 访问者获取元素内部数据，可能破坏封装性。

## 实践建议

- 对于稳定的数据结构适用；若元素类型变化频繁，可考虑双分派或策略模式。
- 访问者内部尽量只读，避免修改元素状态造成副作用。
- 在 Java 中可结合 double dispatch（`accept` + `visit`）实现，保持类型安全。
