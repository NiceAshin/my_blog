---
date: 2021/02/11 09:00:00
sidebar: auto
prev: ./face
next: ./proxy
---

# 享元模式

> 预计阅读时间：5 分钟

享元（Flyweight）模式通过**共享内部状态**来减少对象数量、节省内存和提升性能。它把对象状态拆分为“内部状态（可共享）”与“外部状态（调用时传入）”，以避免重复创建大量相同内容的实例。

## 适用场景

- 系统中存在海量细粒度对象，且大部分状态相同，例如字符、棋子、地图格子。
- 对象创建成本高，频繁创建会造成内存压力或 GC 抖动。
- 需要实现对象池、缓存、连接复用等共享机制。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Flyweight（享元接口） | 定义对外暴露的方法，接收外部状态。 |
| ConcreteFlyweight | 持有可共享的内部状态，实现享元接口。 |
| FlyweightFactory | 负责管理享元对象的池，复用已存在的实例。 |
| Client | 组合内部状态与外部状态进行调用。 |

## 示例：地图瓦片缓存

在线地图把地球切分成多级瓦片，渲染时需要大量加载相同纹理。使用享元模式缓存瓦片纹理，避免重复解码图片。

```java
public interface Tile {
    void draw(GraphicsContext context, int x, int y, int zoom);
}

public class ImageTile implements Tile {
    private final String tileId;          // 内部状态，可被多个请求共享
    private final BufferedImage texture;  // 解码后的纹理，占用大量内存

    public ImageTile(String tileId, BufferedImage texture) {
        this.tileId = tileId;
        this.texture = texture;
    }

    @Override
    public void draw(GraphicsContext context, int x, int y, int zoom) {
        context.draw(texture, x, y, zoom);
    }
}

public class TileFactory {
    private final Map<String, Tile> cache = new ConcurrentHashMap<>();

    public Tile getTile(String tileId) {
        return cache.computeIfAbsent(tileId, id -> {
            BufferedImage image = loadTexture(id); // 只在第一次创建时执行
            return new ImageTile(id, image);
        });
    }
}
```

客户端使用时，把当前坐标、缩放等外部状态传入：

```java
public class MapRenderer {
    private final TileFactory tileFactory;

    public MapRenderer(TileFactory tileFactory) {
        this.tileFactory = tileFactory;
    }

    public void render(Collection<TileCoordinate> coordinates, GraphicsContext context) {
        for (TileCoordinate coordinate : coordinates) {
            Tile tile = tileFactory.getTile(coordinate.tileId());
            tile.draw(context, coordinate.x(), coordinate.y(), coordinate.zoom());
        }
    }
}
```

## 优缺点

**优点**
- 大幅减少对象数量，节省内存与对象创建开销。
- 通过共享内部状态，降低 GC 压力，提升系统吞吐量。

**缺点**
- 需要区分内部与外部状态，设计复杂度增加。
- 一旦共享对象被意外修改内部状态，会影响所有使用者，必须保持不可变。

## 实践建议

- 把内部状态设计为不可变对象，确保线程安全。
- 配合对象池使用时要注意过期与清理机制，防止缓存膨胀。
- 如果外部状态过多，传递成本可能抵消收益，可考虑包装成上下文对象。
