---
title: Kubernetes 集群实践
date: 2026-10-23
sidebar: false
---

# Kubernetes 集群实践

> 本目录共 7 篇，覆盖集群搭建、Pod 组网、入口流量、持久化存储与权限控制，按“先跑起来、再补能力”的顺序组织。

## 文章清单

### 入门与集群

| 文章 | 主题 | 更新时间 |
| --- | --- | --- |
| [k8s 快速入门](./k8s) | 核心对象与声明式模型 | 2022-05-18 |
| [安装 k8s 集群](./k8s-cluster) | 集群初始化与节点加入 | 2022-04-30 |

### 网络与入口

| 文章 | 主题 | 更新时间 |
| --- | --- | --- |
| [Pod 通信与服务发现](./network) | Pod 组网与服务发现 | 2022-06-04 |
| [Kubernetes Ingress 实战详解](./ingress) | 七层入口与流量路由 | 2022-04-12 |

### 存储与权限

| 文章 | 主题 | 更新时间 |
| --- | --- | --- |
| [Kubernetes 持久化存储：PV 与 PVC](./pv-pvc) | 持久卷供给与绑定 | 2022-06-22 |
| [Kubernetes RBAC 权限模型](./rbac) | 角色授权与权限边界 | 2022-07-09 |

### 有状态服务

| 文章 | 主题 | 更新时间 |
| --- | --- | --- |
| [StatefulSet 有状态服务原地升级](./statefulset-in-place-update) | 有状态服务原地升级 | 2026-06-10 |

## 推荐阅读顺序

1. [k8s 快速入门](./k8s)
2. [安装 k8s 集群](./k8s-cluster)
3. [Pod 通信与服务发现](./network)
4. [Kubernetes Ingress 实战详解](./ingress)
5. [Kubernetes 持久化存储：PV 与 PVC](./pv-pvc)
6. [Kubernetes RBAC 权限模型](./rbac)
7. [StatefulSet 有状态服务原地升级](./statefulset-in-place-update)
