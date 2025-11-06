---
date: 2020-11-11 09:00:00
sidebar: auto
prev: ./combination
next: ./meta
---

# 门面模式

> 预计阅读时间：5 分钟

门面（Facade）模式为复杂子系统提供一个**统一且易于使用的外观接口**，调用方只需要面对门面对象，而无需了解内部细节。常用于封装基础设施或遗留系统，降低使用门槛。

## 适用场景

- 子系统内部结构复杂，不希望业务代码直接依赖多个组件。
- 需要对外暴露一个稳定接口，隐藏底层实现变化。
- 作为微服务或组件的“防腐层”，把第三方能力转换为领域语言。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Facade（门面） | 提供简化后的高层接口，协调各个子系统。 |
| Subsystem Classes（子系统） | 完成具体的业务逻辑，对外接口较细粒度。 |

## 示例：短信网关门面

短信服务内部划分了签名管理、模板管理、发送网关等多个组件。业务只想调用一个接口发送短信，于是对外提供 `SmsFacade`：

```java
public class SmsFacade {
    private final TemplateService templateService;
    private final SignatureService signatureService;
    private final SmsGateway smsGateway;

    public SmsFacade(TemplateService templateService,
                     SignatureService signatureService,
                     SmsGateway smsGateway) {
        this.templateService = templateService;
        this.signatureService = signatureService;
        this.smsGateway = smsGateway;
    }

    public void send(String templateCode, String phone, Map<String, Object> params) {
        Template template = templateService.get(templateCode);
        Signature signature = signatureService.defaultSignature();
        String content = template.render(params, signature);
        smsGateway.deliver(phone, content);
    }
}
```

业务层只需依赖门面：

```java
@Service
public class LoginService {
    private final SmsFacade smsFacade;

    public LoginService(SmsFacade smsFacade) {
        this.smsFacade = smsFacade;
    }

    public void sendVerifyCode(String phone) {
        String code = RandomStringUtils.randomNumeric(6);
        Map<String, Object> params = Map.of("code", code, "expire", "5分钟");
        smsFacade.send("LOGIN_CODE", phone, params);
    }
}
```

## 优缺点

**优点**
- 调用方只面对一个接口，降低学习成本。
- 便于做安全控制、限流、监控等统一管理。
- 门面内部可组合多种模式（适配器、模板方法等），对外保持稳定。

**缺点**
- 门面容易演变成“巨无霸类”，需要警惕职责膨胀。
- 如果门面封装过度，可能限制调用方对底层能力的灵活使用。

## 实践建议

- 保持门面接口语义清晰，围绕业务场景设计方法。
- 内部子系统仍需维持良好边界，可通过依赖注入组合。
- 对门面暴露的接口做充足测试，确保内部变化不会影响外部调用。
