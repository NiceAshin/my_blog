---
date: 2020-10-24 09:00:00
sidebar: auto
next: ./combination
prev: ./bridge
---
# 装饰者模式

> 预计阅读时间：6 分钟

装饰者（Decorator）模式在不改变原有对象结构的前提下，**动态地为对象增加额外行为或责任**。与继承相比，装饰者使用组合方式，可在运行期灵活叠加功能。

## 适用场景

- 不希望通过继承创建大量子类，只为了在原有功能前后插入逻辑。
- 运行时需要按需组合多个功能，例如日志、鉴权、限流。
- 对象在不同场景下需要不同的行为扩展。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Component（抽象组件） | 定义对象的核心接口。 |
| ConcreteComponent（具体组件） | 被装饰的原始对象，实现核心功能。 |
| Decorator（抽象装饰者） | 持有 Component 引用，并实现同样的接口。 |
| ConcreteDecorator | 在调用前后添加增强逻辑。 |

## 示例：HTTP 客户端增强

已有一个基础的 `HttpClient` 负责发起请求，现在希望在不同场景下增加“重试、鉴权、埋点”等能力，可以使用装饰者按需叠加。

```java
public interface HttpClient {
    HttpResponse execute(HttpRequest request);
}

public class SimpleHttpClient implements HttpClient {
    @Override
    public HttpResponse execute(HttpRequest request) {
        // 实际调用第三方 SDK
        return doExecute(request);
    }
}

public abstract class HttpClientDecorator implements HttpClient {
    protected final HttpClient delegate;

    protected HttpClientDecorator(HttpClient delegate) {
        this.delegate = delegate;
    }
}

// 鉴权装饰者
public class AuthHttpClient extends HttpClientDecorator {
    private final TokenProvider tokenProvider;

    public AuthHttpClient(HttpClient delegate, TokenProvider tokenProvider) {
        super(delegate);
        this.tokenProvider = tokenProvider;
    }

    @Override
    public HttpResponse execute(HttpRequest request) {
        request.addHeader("Authorization", tokenProvider.token());
        return delegate.execute(request);
    }
}

// 重试装饰者
public class RetryHttpClient extends HttpClientDecorator {
    private final int maxRetry;

    public RetryHttpClient(HttpClient delegate, int maxRetry) {
        super(delegate);
        this.maxRetry = maxRetry;
    }

    @Override
    public HttpResponse execute(HttpRequest request) {
        int attempt = 0;
        while (true) {
            try {
                return delegate.execute(request);
            } catch (IOException ex) {
                if (++attempt > maxRetry) {
                    throw ex;
                }
            }
        }
    }
}
```

使用时可以按需组合：

```java
HttpClient client = new RetryHttpClient(
        new AuthHttpClient(new SimpleHttpClient(), tokenProvider),
        3
);
HttpResponse response = client.execute(HttpRequest.get("/api/resource"));
```

## 优缺点

**优点**
- 采用组合代替继承，可在运行时动态叠加功能。
- 每个装饰者职责单一，易于复用与单元测试。
- 新增装饰者无需修改原始类，符合开闭原则。

**缺点**
- 组合层次过深时，排查问题困难。
- 客户端需要了解如何搭配各个装饰者。

## 实践建议

- 控制装饰链的长度，必要时引入编排器统一管理装饰组合。
- 装饰者内部不应破坏原对象契约，避免改变入参或返回值语义。
- 对于通用的增强（如日志追踪）可以结合 AOP 或代理模式统一处理。
