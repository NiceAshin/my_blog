---
sidebar: auto
prev: ./meta
next: ./template
---

# 代理模式

代理（Proxy）模式为其他对象提供一个**控制访问的代理对象**。代理实现与真实对象相同的接口，但在调用前后可添加额外逻辑，如权限校验、懒加载、远程访问、缓存等。

## 常见代理类型

- **远程代理**：屏蔽网络通信细节，例如 RPC 框架生成的客户端 Stub。
- **虚拟代理**：延迟创建开销大的对象，如图片预览占位。
- **保护代理**：控制访问权限，校验调用者身份。
- **智能引用**：在引用对象时附加统计或生命周期管理能力。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Subject（抽象主题） | 定义客户端可调用的方法。 |
| RealSubject（真实主题） | 实现核心业务逻辑。 |
| Proxy（代理） | 持有真实主题引用，在调用前后执行附加操作。 |

## 示例：仓储服务的权限代理

仓储服务提供 `StockService` 操作库存，但只有特定角色可执行扣减。使用代理对真实服务进行权限校验：

```java
public interface StockService {
    void deduct(String sku, int quantity);
}

public class DefaultStockService implements StockService {
    @Override
    public void deduct(String sku, int quantity) {
        // 执行真实的库存扣减逻辑
    }
}

public class AuthorizationProxy implements StockService {
    private final StockService delegate;
    private final PermissionChecker permissionChecker;

    public AuthorizationProxy(StockService delegate, PermissionChecker permissionChecker) {
        this.delegate = delegate;
        this.permissionChecker = permissionChecker;
    }

    @Override
    public void deduct(String sku, int quantity) {
        if (!permissionChecker.allowed("stock:deduct")) {
            throw new AccessDeniedException("当前用户无权操作库存");
        }
        delegate.deduct(sku, quantity);
    }
}
```

通过依赖注入或工厂统一返回代理对象：

```java
@Bean
public StockService stockService(PermissionChecker checker) {
    StockService target = new DefaultStockService();
    return new AuthorizationProxy(target, checker);
}
```

## 与装饰者的区别

- 装饰者强调增强功能，通常对客户端透明；代理更侧重**控制访问**。
- 代理常由框架自动生成（动态代理），装饰者更多依赖手工组合。
- 两者都使用组合，但动机不同：装饰者围绕职责扩展，代理关注非功能性需求。

## 实践建议

- Java 开发中可以使用动态代理（JDK Proxy、CGLIB）减少样板代码。
- 代理应尽量保持轻量，不要在代理中编写复杂业务逻辑。
- 对于远程代理，要对网络异常、超时、重试等场景做健壮处理。
