---
date: 2022-09-03 11:52:18
title: �?Go 项目中落地领域驱动设�?
tags:
  - go
  - ddd
  - architecture
---

# �?Go 项目中落地领域驱动设�?

> 预计阅读时间�? 分钟

## 1. 来源与资�?
参�?Eric Evans �?Vaughn Vernon �?DDD 体系、Go 社区开源项目（go-kratos、entgo、ddd-hexagon）以及我们在供应链结算平台的微服务重构经验，探讨如何在静态类型、无泛型（Go1.18 前）背景下实现领域模型�?

## 2. 现状：快速交�?vs. 模型完整�?
- 很多 Go 项目起初采用脚手架快速生�?CRUD，后期难以复用领域逻辑�?
- 领域事件散落在各�?`package` 中，缺乏统一的发�?订阅约束�?
- 跨服务的聚合边界模糊，导致业务规则被重复实现甚至出现数据竞争�?

## 3. DDD �?Go 的契合点
- Go 倡导小而清晰的包结构，利于映射限界上下文�?
- 接口定义天然支持依赖反转，结合构造函数注入即可实现基础设施替换�?
- 通过 struct + 方法可封装领域不变量，搭配自定义错误类型表达业务规则�?

## 4. 目录结构设计
```text
internal/
  order/
    app/          # 应用服务�?
    domain/
      aggregate/
      entity/
      valueobject/
      event/
    infra/
      repository/
      rpc/
    interfaces/   # REST/RPC 适配�?
pkg/
  shared/
    eventbus/
    logger/
```

## 5. 核心模式与代码示�?
### 5.1 聚合根与领域服务
```go
type PurchaseOrder struct {
    id          OrderID
    status      OrderStatus
    lines       []OrderLine
    approvals   []Approval
}

func (po *PurchaseOrder) Approve(by Approver) error {
    if !po.status.CanApprove() {
        return domainErrInvalidStatus
    }
    po.approvals = append(po.approvals, NewApproval(by))
    po.status = StatusApproved
    po.raise(event.PurchaseApproved{OrderID: po.id, Approver: by})
    return nil
}
```
- 使用不可导出的字段，确保领域状态只能通过方法修改�?
- `raise` 将事件缓存在聚合根内部，应用层统一发布至事件总线�?

### 5.2 仓储与接口适配
```go
type OrderRepository interface {
    Save(ctx context.Context, order *PurchaseOrder) error
    Get(ctx context.Context, id OrderID) (*PurchaseOrder, error)
}

func NewApplication(repo OrderRepository, bus eventbus.Bus) *Application {
    return &Application{repo: repo, bus: bus}
}
```
基础设施实现可以选择 GORM、entgo、MongoDB，或者连接远端微服务；只要实现接口即可注入�?

### 5.3 应用服务协调流程
```go
func (a *Application) ApproveOrder(ctx context.Context, cmd ApproveCommand) error {
    order, err := a.repo.Get(ctx, cmd.ID)
    if err != nil {
        return err
    }
    if err := order.Approve(cmd.By); err != nil {
        return err
    }
    if err := a.repo.Save(ctx, order); err != nil {
        return err
    }
    return a.bus.Publish(ctx, order.PendingEvents()...)
}
```
应用层不处理业务规则，仅负责 orchestrate 聚合行为与外部交互�?

## 6. 业务落地案例
以供应链金融平台为例�?
- 将原本“订�?+ 付款”单体拆分为 **订单限界上下�?* �?**资金限界上下�?*，通过领域事件 `PurchaseApproved` �?`PaymentConfirmed` 解耦�?
- 结合 Saga 模式实现跨服务补偿，Go 服务通过 `outbox` �?+ CDC 将事件投递至 Kafka，保证最终一致性�?
- 通过自定义代码生成器，将 Excel 导入规则转译为领域对象，避免运营人员误操作�?

## 7. 协作与治�?
- **统一语言**：在 ADR（架构决策记录）中维护术语表，Go 代码中的结构体命名与业务语义保持一致�?
- **文档同步**：使�?PlantUML/Structurizr 绘制上下文地图，�?README 中维护链接�?
- **测试策略**：聚合根编写表驱动测试，应用服务结合 `gomock`/`testify` 模拟仓储�?

## 8. 延伸阅读
- [ddd-hexagon](https://github.com/sagikazarmark/ddd-hexagon)
- [go-kratos 实战指南](https://go-kratos.dev)
- [领域建模最佳实践——限界上下文的划分方法]

通过与业务团队共创模型，再以 Go 的简洁工具链落地，可以在保持开发效率的同时，使核心领域逻辑长期可演进、可验证�?
