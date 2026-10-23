---
date: 2021-12-15
prev: ./monitor
next: ./jvmconfig
sidebar: auto
---

# 调优

> 预计阅读时间：9 分钟

调优的目标不是把 GC 次数降到零，而是在吞吐、延迟和内存占用之间找到业务能接受的平衡点。很多“调优”之所以无效，是因为一开始没有量化问题：到底是 Full GC 太频繁、单次停顿太长，还是堆外内存或线程数导致了瓶颈。

## 先量化，再改参数

至少采集三类数据：

1. GC 日志：Young GC / Full GC 的频率、耗时、回收前后各分区占用；
2. 业务指标：P95/P99 延迟、QPS、错误率；
3. 资源指标：容器内存 limit、RSS、CPU throttling、线程数。

只看 `jstat` 的 `FGC` 次数不够，因为一次 20ms 的 Full GC 和一次 2s 的 Full GC 影响完全不同。先确认停顿是否真的影响业务，再决定是否调整。

## 打开可读的 GC 日志

Java 11+ 统一日志：

```bash
-Xms4g -Xmx4g
-XX:MaxMetaspaceSize=512m
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-Xlog:gc*,gc+heap=info:file=/data/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=50M
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/data/dump
```

Java 8：

```bash
-Xms4g -Xmx4g
-XX:MaxMetaspaceSize=512m
-XX:+UseG1GC
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:/data/logs/gc.log
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=10
-XX:GCLogFileSize=50M
```

`-Xms` 与 `-Xmx` 设为相同值，可以避免堆动态伸缩带来的额外停顿；但容器里要确保 `-Xmx` 小于 memory limit，给元空间、直接内存、线程栈和 JVM 自身留出余量。一般按 limit 的 70%–80% 设置堆上限，再通过压测修正。

## 读懂一次 G1 GC

```text
[12.345s][info][gc,heap] GC(42) Eden regions: 120->0(120)
[12.345s][info][gc,heap] GC(42) Survivor regions: 8->8(8)
[12.345s][info][gc,heap] GC(42) Old regions: 300->310
[12.345s][info][gc,heap] GC(42) Humongous regions: 12->12
[12.345s][info][gc      ] GC(42) Pause Young (Normal) (G1 Evacuation Pause) 430M->318M(4096M) 23.456ms
```

这段日志说明：这是一次 Young GC，堆从 430MB 降到 318MB，停顿 23ms。如果 `Old regions` 在多次 Young GC 后持续上升，说明对象在晋升；如果 `Humongous regions` 很多，说明存在大量超过 region 一半大小的对象，应该检查大数组、大字符串和批量查询。

## Full GC 频繁的常见原因

| 现象 | 可能原因 | 处理方向 |
| --- | --- | --- |
| Full GC 后老年代仍接近满 | 内存泄漏、缓存无上限 | 做 heap dump，修对象生命周期 |
| 晋升失败（to-space exhausted） | 晋升速率高于回收速度 | 增大堆、降低 IHOP、减少短命大对象 |
| Humongous 分配频繁 | 大对象超过 region 50% | 调整 region size，拆分批量对象 |
| Metaspace 持续上涨 | 动态代理/类加载器泄漏 | 限制 Metaspace，排查重复定义类 |
| 定时 Full GC | 代码调用 `System.gc()` | 排查调用点，必要时加 `-XX:+ExplicitGCInvokesConcurrent` |

G1 下可以先观察 IHOP：

```bash
-XX:InitiatingHeapOccupancyPercent=35
```

降低 IHOP 会让并发标记更早开始，减少晋升失败，但会增加 CPU 开销。不要把它当成固定配方，必须结合 GC 日志和压测结果调整。`-XX:G1HeapRegionSize=8m` 也只建议在确认存在大量 Humongous 对象后使用。

## 一个调优前后对比

某订单查询服务，原参数为 `-Xms2g -Xmx2g -XX:+UseParallelGC`，压测时 P99 约 850ms，Full GC 每天 12 次。调整为 G1、堆 4GB、开启 GC 日志并修复无上限缓存后：

| 指标 | 调整前 | 调整后 |
| --- | --- | --- |
| Full GC | 12 次/天 | 0–1 次/天 |
| Young GC 平均停顿 | 80ms | 25ms |
| P99 延迟 | 850ms | 210ms |
| 老年代峰值 | 98% | 62% |

这是特定业务的样例，不是通用承诺。真正起作用的是“修复缓存泄漏 + 合理堆上限 + 可观测性”，GC 参数只是配套。

## 常见坑

- G1 下同时设置 `-Xmn`，固定了年轻代大小，`MaxGCPauseMillis` 基本失效。
- 把 `MaxGCPauseMillis` 设成 20ms，导致 GC 更频繁、吞吐下降。
- 只加大堆，不修泄漏；堆越大，Full GC 单次停顿反而更长。
- 容器里只看 `-Xmx`，忽略堆外内存和线程栈，最后被 OOM Killer 杀掉。
- 没有保留 GC 日志，调优后无法证明是否变好。

调优的终点不是“参数看起来专业”，而是业务指标稳定、GC 行为可解释、异常时有日志可查。先修代码和容量问题，再用参数微调，顺序不能反。

## OOM

OOM 不只有“堆不够”一种。先看异常信息里的关键词，再决定排查方向：

- `Java heap space`：堆内存不足。先看 heap dump 中占用最大的对象，再判断是流量上涨、缓存无上限，还是对象被静态集合长期引用。
- `Metaspace`：元空间不足。常见于动态生成类、热部署、类加载器泄漏；不要只调大 `MaxMetaspaceSize`，要先确认类是否真的无法卸载。
- `Direct buffer memory`：直接内存不足。排查 Netty、NIO、压缩库等使用 `ByteBuffer.allocateDirect` 的组件，同时确认 `-XX:MaxDirectMemorySize` 与容器 limit。
- `unable to create native thread`：线程数超过系统限制。检查线程池是否无界、是否存在阻塞导致线程堆积，并核对 `ulimit -u` 与容器 PID 限制。

排查顺序建议固定为：确认 OOM 类型 → 检查是否配置了自动 heap dump → 用 MAT 看 Dominator Tree 与 GC Root → 对照最近发布和流量变化 → 修复对象生命周期或容量边界。容器场景还要区分“JVM OOM”和“被 cgroup OOM Killer 杀掉”：后者通常没有 Java 异常，只有退出码 137，需要同时看 `dmesg` 和容器事件。
