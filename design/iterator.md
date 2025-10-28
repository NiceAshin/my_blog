---
sidebar: auto
prev: ./access
next: ./observer
---

# 迭代器模式

迭代器（Iterator）模式提供一种**顺序访问聚合对象内部元素的方法，而无需暴露其内部表示**。它把遍历逻辑从集合对象中解耦，使集合可以有多种遍历方式。

## 适用场景

- 自定义集合需要向外提供遍历能力，又不想暴露内部存储结构。
- 同一个集合希望支持多种遍历策略（顺序、逆序、过滤等）。
- 需要在遍历过程中保持统一接口，屏蔽集合差异。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Aggregate（聚合接口） | 创建迭代器对象。 |
| ConcreteAggregate | 具体集合，负责存储元素并返回迭代器。 |
| Iterator（迭代器接口） | 定义 `hasNext`、`next` 等遍历方法。 |
| ConcreteIterator | 持有当前遍历状态，实现迭代逻辑。 |

## 示例：分页日志迭代器

日志存储在数据库中，提供一个按时间顺序的迭代器，每次按页加载：

```java
public interface LogIterator {
    boolean hasNext();
    LogRecord next();
}

public class PagedLogIterator implements LogIterator {
    private final LogRepository repository;
    private final int pageSize;
    private Iterator<LogRecord> currentPage = Collections.emptyIterator();
    private LocalDateTime cursor;

    public PagedLogIterator(LogRepository repository, int pageSize, LocalDateTime startCursor) {
        this.repository = repository;
        this.pageSize = pageSize;
        this.cursor = startCursor;
    }

    @Override
    public boolean hasNext() {
        loadIfNecessary();
        return currentPage.hasNext();
    }

    @Override
    public LogRecord next() {
        loadIfNecessary();
        if (!currentPage.hasNext()) {
            throw new NoSuchElementException();
        }
        LogRecord record = currentPage.next();
        cursor = record.getCreatedAt();
        return record;
    }

    private void loadIfNecessary() {
        if (currentPage.hasNext()) {
            return;
        }
        List<LogRecord> records = repository.findAfter(cursor, pageSize);
        currentPage = records.iterator();
    }
}
```

聚合对象负责创建迭代器：

```java
public class LogAggregate {
    private final LogRepository repository;

    public LogAggregate(LogRepository repository) {
        this.repository = repository;
    }

    public LogIterator iterator(int pageSize, LocalDateTime startCursor) {
        return new PagedLogIterator(repository, pageSize, startCursor);
    }
}
```

客户端只依赖迭代器接口：

```java
LogIterator iterator = logAggregate.iterator(100, LocalDateTime.MIN);
while (iterator.hasNext()) {
    LogRecord record = iterator.next();
    process(record);
}
```

## 优缺点

**优点**
- 遍历逻辑与集合结构解耦，集合内部实现可自由变化。
- 同一聚合可提供多个迭代器实例，实现不同遍历策略。
- 简化客户端代码，提供统一遍历接口。

**缺点**
- 为每种遍历方式创建独立迭代器，类数量增加。
- 并发修改集合时需要额外处理（如快照、失败快速）。

## 实践建议

- 对于集合较小、结构简单的场景，可直接使用语言内置迭代器。
- 若需要多种遍历策略，可让聚合返回不同的迭代器实现（过滤器迭代器等）。
- 注意迭代器与集合的生命周期，避免长时间持有导致资源无法释放。
