---
title: 微服务契约测试与自动化校验实践
date: 2021/08/13 09:00:00
tags:
  - microservice
  - testing
  - contract-testing
---

# 微服务契约测试与自动化校验实践

> 预计阅读时间：8 分钟

## 1. 背景来源
综合 ThoughtWorks 的契约测试方法论、Pact 与 Spring Cloud Contract 的社区案例，以及我们在保险理赔系统构建 API 契约平台的经验。

## 2. 现状问题
- **接口文档滞后**：手写文档与实际服务不一致，跨团队协作频繁踩坑。
- **联调成本高**：依赖真实服务联调，环境不稳定。
- **回归风险大**：服务端更新后无法保证消费方仍可正常运行。

## 3. 契约测试价值
- 以自动化测试脚本替代口头约定，保障服务方/消费方对协议的一致理解。
- 在 CI/CD 中引入契约校验，提前发现兼容性问题。
- 与 API 网关、文档平台联动，实现契约的可视化与审批。

## 4. 技术栈选择
| 方案 | 特点 | 适用场景 |
| --- | --- | --- |
| **Pact** | 支持多语言，社区成熟，提供 Pact Broker。 | 多语言微服务，消费方驱动契约 |
| **Spring Cloud Contract** | 与 Spring 生态融合，支持 CDC 流程。 | Java/Kotlin 服务为主 |
| **OpenAPI + Schemathesis** | 以 OpenAPI 规范为中心，兼顾文档与测试。 | API First 团队 |

## 5. 落地步骤
### 5.1 契约定义
- 采用 OpenAPI 定义 API，使用 JSON Schema 约束字段。
- 消费方通过 Pact DSL 定义期望交互，并提交到 Broker。

```groovy
PactBuilder builder = new PactBuilder()
    .serviceConsumer('policy-frontend')
    .hasPactWith('claim-service')

builder.uponReceiving('create claim')
    .path('/claims')
    .method('POST')
    .body(
        new PactDslJsonBody()
            .stringType('policyId', 'P20240418')
            .stringType('accidentType', 'Car')
            .decimalType('estimate', 9000.0)
    )
    .willRespondWith()
    .status(201)
```

### 5.2 CI/CD 流程
1. 消费方在构建阶段运行 Pact 测试，生成契约文件并上传 Broker。
2. 服务方流水线在集成测试阶段拉取最新契约，运行 Provider Verification。
3. 部署前检查契约状态，确保所有消费方验证通过。

### 5.3 环境治理
- 为契约测试准备 Mock Server，降低对真实环境的依赖。
- 构建契约审批流程，避免未经评审的 breaking change。
- 契约变更触发自动化通知，提醒相关团队更新客户端 SDK。

## 6. 业务实践
在保险理赔系统中：
- 契约平台对接公司 API 门户，审批通过后自动同步到网关。
- 通过 Pact Broker Dashboard 监控契约健康状态，红灯表示需紧急处理。
- 对关键接口设置回放测试，验证生产流量在新版本下的兼容性。

## 7. 常见问题与解决
- **契约爆炸**：为版本引入命名空间，定期清理历史契约。
- **测试执行慢**：在 CI 中使用并行执行，必要时只运行变更影响的契约。
- **组织协同难**：明确契约 Owner，建立跨团队评审会。

## 8. 参考资料
- [Pact Official Documentation](https://docs.pact.io)
- [Spring Cloud Contract Reference]
- [API First Design 指南]

契约测试让微服务之间的合作变得可验证、可度量，为复杂业务的稳定演进打下坚实基础。
