---
title: "Kubernetes 中 StatefulSet 有状态服务原地升级机制"
date: 2026-06-10
categories:
  - CLOUD-NATIVE
tags:
  - K8s
  - StatefulSet
  - 云服务
---

# Kubernetes 中 StatefulSet 有状态服务原地升级机制

在云原生架构中，无状态应用（Stateless）的升级极为简单，通过 Deployment 即可轻松完成滚动更新。然而，对于数据库、分布式缓存、消息队列等**有状态应用（Stateful）**，升级过程需要格外谨慎。StatefulSet 提供了稳定的网络标识和持久化存储绑定，其升级逻辑与 Deployment 截然不同。

本文将详细剖析 Kubernetes 中 StatefulSet 的更新机制，特别是 **RollingUpdate（滚动更新）** 与 **OnDelete（手动更新）** 原理，并探讨如何在升级过程中最大程度防止数据丢失。

---

## 1. StatefulSet 的两大更新策略

StatefulSet 的 `.spec.updateStrategy.type` 定义了其升级策略，主要包含两种：

### 1.1 RollingUpdate (滚动更新)
这是 StatefulSet 的**默认更新策略**。当修改 `.spec.template` 后，StatefulSet 控制器会按照**从大到小（逆序）**的顺序，依次重建 Pod 实例。

- **顺序性**：例如拥有 3 个副本的 StatefulSet（`pod-0`、`pod-1`、`pod-2`），升级时会先删除并重建 `pod-2`。只有当 `pod-2` 重新运行并进入 **Running 且 Ready** 状态后，控制器才会开始升级 `pod-1`，以此类推。
- **灰度发布（Partition 分区机制）**：`RollingUpdate` 策略下支持配置 `.spec.updateStrategy.rollingUpdate.partition`：
  ```yaml
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 2
  ```
  - 当 `partition` 设置为 `2` 时，只有序号 **$\ge 2$** 的 Pod 会被升级（即 `pod-2` 会升级，而 `pod-0` 和 `pod-1` 保持不变）。这在需要先升级单个节点进行灰度验证（Canary）时极其实用。

### 1.2 OnDelete (手动更新)
当设置为 `OnDelete` 时，即使修改了 `.spec.template`，StatefulSet 控制器也**不会主动重建任何 Pod**。
- **触发机制**：只有当管理员手动删除某个具体的 Pod 时，控制器才会读取最新的模板并重建该 Pod。
- **适用场景**：对于某些极其敏感的数据库集群，升级通常需要配合复杂的主从切换或数据备份脚本，`OnDelete` 赋予了运维人员绝对的步调控制权。

---

## 2. 原地升级（In-Place Update）与重建升级的对比

需要注意的是，原生 Kubernetes StatefulSet 的 `RollingUpdate` 在底层实际上是**“重建升级”**，即：
1. 删除旧 Pod。
2. 调度并启动新 Pod（会重新挂载已有的 PVC 卷）。

但在很多大规模生产实践中（例如阿里巴巴开源的 OpenKruise），引入了真正的**“原地升级”（In-Place Update）**机制：

| 对比维度 | 传统重建升级 (K8s 原生) | 原地升级 (如 OpenKruise CloneSet/StatefulSet) |
| :--- | :--- | :--- |
| **升级耗时** | **较慢**（需要重新调度、拉取镜像、挂载卷、重新配置网络） | **极快**（仅更新容器镜像，无需重新调度和挂载卷） |
| **IP 变化** | 可能会发生变化（取决于 CNI 网络插件实现） | **绝对保持不变** |
| **存储挂载** | 需要卸载卷并重新挂载，可能导致 IO 挂起 | 无需重新挂载物理卷，数据持续在线 |
| **平滑度** | 应用进程完全中断，重建容器 | 仅业务容器重启，Pod 级别的辅助容器（Sidecar）不中断 |

---

## 3. StatefulSet 升级时防范数据丢失的最佳实践

对于有状态服务，升级最怕遇到由于脑裂（Brain-Split）、未刷盘数据丢失或节点下线顺序错误导致的集群瘫痪。以下是生产环境的加固方案：

### 3.1 确保 Pod 优雅停机 (Graceful Shutdown)
在 Pod 重建时，必须给业务进程留出足够的时间将内存中的数据刷写到磁盘中（或从内存缓存同步到主库）。
- 配置合理的 `.spec.terminationGracePeriodSeconds`（默认 30 秒，数据库一般建议设为 60s 或更高）。
- 使用 **`preStop` 钩子** 执行平滑下线脚本：
  ```yaml
  lifecycle:
    preStop:
      exec:
        command: ["/bin/sh", "-c", "/usr/local/bin/mysql-graceful-shutdown.sh"]
  ```

### 3.2 使用 Pod 破坏预算 (PodDisruptionBudget)
为了防止在升级期间，Kubernetes 的其他自动运维事件（如节点驱逐、缩容）与我们的滚动升级重叠，导致集群可用节点数低于安全水位，必须配置 PDB：

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: mysql-pdb
spec:
  minAvailable: 2 # 确保任何时候都有至少 2 个副本存活
  selector:
    matchLabels:
      app: mysql
```

### 3.3 结合 ReadinesProbe 与守护机制
有状态集群的升级非常依赖 **Ready** 状态。
- 如果你的数据库主从节点在升级后需要进行漫长的数据同步（Replication Catch-up），必须在 `ReadinessProbe` 中加入对同步进度的健康检查。
- 只有当数据同步完毕、节点真正能承担读写流量时，才允许 Readiness 变成 True。这能阻止 StatefulSet 控制器过早地去杀掉下一个节点，从而彻底规避“全宕机”风险。

---

## 4. 总结

StatefulSet 的升级并非简单的镜像替换，它是对底层分布式协议（如 Raft、Paxos 或传统主从结构）以及存储链路的综合大考。在日常运维中，建议遵循：
1. **灰度先行**：利用 `partition` 机制升级单个节点观察性能与日志。
2. **优雅停机**：使用 `preStop` 确保持久化落盘。
3. **水位控制**：配置 PDB 确保集群高可用。
