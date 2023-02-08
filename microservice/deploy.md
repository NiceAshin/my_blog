---
next: ./CQRS
prev: ./quality
sidebar: auto
---

# 服务部署

本文记录三种服务部署方式, 根据实际业务量使用. 1 打包部署, 2 docker , 3 k8s

## 打包部署

打包部署在微服务架构中已经无法满足需求, 它缺乏对技术栈的封装, 也无法约束服务对资源的消耗. 并且在同一机器上运行多个服务, 缺少隔离.
## docker

容器是一种部署机制, 是一种操作系统级的虚拟化机制, 它通常包含一个或多个在沙箱中运行的进程, 沙箱将其与其他容器隔离, 每个容器有自己的ip, 可以消除端口冲突. 创建容器时可以指定资源分配的大小

**容器部署服务步骤**
1. 创建Dockerfile文件, 用于描述如何构建Docker镜像

::: tip Dockerfile编写
 1. 指定基础镜像
 2. 安装curl用于执行健康检查(可选的)
 3. 将jar复制到镜像中
 4. 容器启动时启动jar
:::

2. 将镜像上传到仓库中(dockerhub的私库)

3. 运行镜像,可以使用docker compose以组的形式启动和停止

## k8s

k8s是docker的编排框架, docker之上的软件层, 可以将一组计算机硬件资源转变为用于运行服务的单一资源池

k8s在一组机器上运行(集群), 集群中的角色分为主节点和普通节点, 主节点负责管理集群, 普通节点是工作借点, 运行一个或多个pod

### k8s的架构

#### 主节点

- **API服务器**. 用于部署和管理服务的REST API
- **Etcd**. 存储集群数据键值的NOSQL
- **调度器**. 选择要运行的pod的借点
- **控制器管理器**. 运行控制器, 确保集群状态和预期状态, 如自动启动和终止实例确保实例运行数量
### 普通节点

- **kubelet** 创建和管理节点上运行的服务
- **kube-proxy** 管理网络 包括pods的负载均衡
- **pods** 应用程序服务

#### 关键概念

::: tip pod
k8s的基本部署单元, 由一个或多个共享IP和存储卷的容器组成, 一个微服务通常由单个容器组成, 例如JVM容器, 某些情况下, 会包含一个或多个实现支持功能的边车(sidecar)容器, 如nignx服务器有一个边车容器, 定期执行git pull更新最新版本的htm
:::

::: tip Depoyment
Pod的声明规范, deplyment是一个控制器 . 用于确保始终运行的pod实例数量 , 通过滚动升级和回滚进行版本控制, 微服务架构中的每个服务都是一个depolyment
::: 
::: tip service
向应用程序服务的客户端提供一个静态/稳定的网络地址, 是基础设施提供的服务发下的一种形式, 内个service有一个具有一个ip和一个可解析为该ip地址的dns, 并跨一个或多个pod对tcp和udp流量进行负载均衡, 这个ip和dns只能在k8s内部访问(外部访问可配置)
:::
::: tip configmap
用于定义一个或多个应用程序服务的外部化配置, pod容器的定义可以引用configmap来定义容器的环境变量 . 还可以使用configmap在容器内创建配置文件
::: 