---
next: ./design
sidebar: none
---


## 微服务的优点

- 使大型复杂应用可以持续交付部署

    > 1. 可测试性: 自动化测试是持续交付部署的关键, 服务的小型化使服务的自动化测试编写和执行变得更加简单
    > 2. 可部署性: 服务独立运行, 部署时不需与其他人员沟通
    > 3. 可以形成**小而自治, 松散耦合的团队**, 团队之间各自管理负责的服务, 独有代码仓库, 自动化部署流水线
    
- 服务较小易于维护. 解决了单体用用代码库庞大, 导致代码提交部署周期长, bug牵一发而动全身问题
- 可以独立扩展部署. 解决了单体应用的难以扩展, 不同业务模块对资源要求不一致, 在选择服务器时还要同时满足所有需求的问题
- 容易实现新技术. 可以摆脱单体应用长期依赖过时技术栈的问题
- 容错性更高. 
- 可以实现团队自治

## 缺点

增加了应用的复杂性, 将会面临分布式应用的CAP问题

## 导航

本来主要记录微服务设计实现与落地的一些方式方法:

- [服务设计](./design.md)
- [服务拆分](./split.md)
- [服务间通信](./contact.md)
- [分布式事务](./ts.md)
- [服务质量](./quality.md)
- [服务部署](./deploy.md)
- [CQRS](./CQRS.md)

