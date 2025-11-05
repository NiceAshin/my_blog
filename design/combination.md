---
date: 2020/10/06 09:00:00
sidebar: auto
prev: ./decorator
next: ./face
---

# 组合模式

> 预计阅读时间：6 分钟

组合（Composite）模式把**一组对象与单个对象统一对待**，通过树形结构表达“整体-部分”层级，使客户端无需关心当前处理的是叶子还是容器节点。

## 适用场景

- 业务模型天然呈树状结构，如组织架构、菜单、分类目录、工作流节点。
- 客户端在遍历时希望使用统一接口，避免写大量 `instanceof` 判断。
- 需要在树中递归地执行某项操作，并保持各层行为一致。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Component（抽象组件） | 定义组合对象与叶子对象的统一接口。 |
| Leaf（叶子节点） | 真实的末端元素，不再包含子节点。 |
| Composite（组合节点） | 容器节点，持有子节点集合，实现增删查等操作。 |

## 示例：权限菜单树

系统的菜单与按钮权限存储在数据库中，需要转换成一棵树供前端渲染。使用组合模式可以统一菜单与按钮的处理方式。

```java
public interface PermissionNode {
    String id();
    String name();
    void print(String indent);
}

// 叶子节点：按钮
public class ButtonNode implements PermissionNode {
    private final String id;
    private final String name;

    public ButtonNode(String id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String id() {
        return id;
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public void print(String indent) {
        System.out.println(indent + "- 按钮:" + name);
    }
}

// 组合节点：菜单
public class MenuNode implements PermissionNode {
    private final String id;
    private final String name;
    private final List<PermissionNode> children = new ArrayList<>();

    public MenuNode(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public MenuNode addChild(PermissionNode node) {
        children.add(node);
        return this;
    }

    @Override
    public String id() {
        return id;
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public void print(String indent) {
        System.out.println(indent + "菜单:" + name);
        for (PermissionNode child : children) {
            child.print(indent + "  ");
        }
    }
}
```

客户端构建树后统一打印：

```java
MenuNode root = new MenuNode("dashboard", "控制台")
        .addChild(new ButtonNode("refresh", "刷新"))
        .addChild(new MenuNode("report", "报表")
                .addChild(new ButtonNode("export", "导出"))
                .addChild(new ButtonNode("download", "下载")));

root.print("");
```

## 优缺点

**优点**
- 客户端无需区分单个对象或组合对象，调用体验一致。
- 节点结构自由扩展，组合节点与叶子节点都可独立变化。
- 方便在树形结构上执行递归算法，如聚合统计、权限判定等。

**缺点**
- 树结构过大会引入管理复杂度，尤其是在需要频繁修改父子关系时。
- 某些场景下叶子节点和组合节点的行为差异较大，硬要统一接口会牺牲清晰度。

## 实践建议

- 设计接口时聚焦公共行为，差异较大的方法可下沉到具体实现。
- 对于大规模树，可引入缓存或延迟加载避免一次性加载全部节点。
- 组合模式可以与责任链、访问者模式结合，实现更灵活的树形操作。
