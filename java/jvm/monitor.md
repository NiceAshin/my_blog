---
title: 性能监控与故障处理
date: 2021-10-20
prev: ./gc
next: ./optimization
sidebar: auto
---
# 性能监控与故障处理

> 预计阅读时间：8 分钟

线上 Java 服务的故障，大多可以先归到三类：CPU 打满、内存持续上涨、线程卡死。排查时不要一上来就 dump，先确认现象、时间点和最近变更，再用 JDK 自带工具做低成本观测，最后才做堆转储和线程转储。

## 先做三步定位

1. `top -Hp <pid>` 看是哪个线程吃 CPU；
2. `jstat -gcutil <pid> 1000 10` 看 GC 频率与老年代占用；
3. `jstack -l <pid>` 看线程栈，确认是业务死锁、连接池耗尽还是 GC 线程忙于回收。

把这三步的输出按时间顺序保存下来，比单独一张截图更有价值。

## JDK 自带工具

### jps：确认进程

```bash
jps -lvm
```

输出包含 PID、主类、JVM 参数。容器里如果看不到进程，先确认 `jps` 与 Java 进程是否在同一 PID 命名空间。

### jstat：看 GC 趋势

```bash
jstat -gcutil <pid> 1000 10
```

重点列：

- `E`：Eden 使用率；长期接近 100% 说明分配速率高。
- `O`：老年代使用率；持续上涨且 Full GC 后不下降，优先怀疑内存泄漏。
- `M`：元空间使用率；不断上涨常见于动态生成类或类加载器泄漏。
- `YGC/YGCT`：Young GC 次数与总耗时。
- `FGC/FGCT`：Full GC 次数与总耗时。

### jmap / jcmd：看对象与堆

```bash
jcmd <pid> GC.heap_info
jcmd <pid> GC.class_histogram | head -30
jmap -dump:live,format=b,file=/data/dump/heap-$(date +%s).hprof <pid>
```

`jmap -histo:live` 会触发一次 Full GC，生产环境慎用；Java 8+ 更推荐 `jcmd`。dump 前确认磁盘空间足够，dump 文件通常接近堆大小。堆特别大时可以用 `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/data/dump` 让 JVM 在 OOM 时自动落盘。

### jstack：看线程状态

```bash
jstack -l <pid> > /data/dump/thread-$(date +%s).txt
```

连续抓 3 次、间隔 5 秒，才能区分“偶发阻塞”和“持续卡住”。重点搜索 `BLOCKED`、`WAITING`、`TIMED_WAITING`，以及业务线程是否都停在同一个连接池或锁上。`-l` 会额外输出锁信息，便于定位死锁。

## Arthas 常用命令

Arthas 适合在线诊断，不需要重启服务：

```bash
java -jar arthas-boot.jar <pid>
```

进入交互后：

```bash
dashboard                 # 整体线程、内存、GC 概览
thread -n 3               # CPU 最高的 3 个线程及栈
thread -b                 # 查找阻塞其他线程的锁
trace com.example.OrderService create '#cost > 200'
watch com.example.OrderService create '{params, returnObj, throwExp}' -x 2
heapdump /data/dump/arthas.hprof
profiler start            # 采样 CPU，默认事件 cpu
profiler stop --format html
```

`trace` 和 `watch` 有性能开销，排查完立即 `stop`，不要长期挂在高频方法上。

## 一次 OOM 排查过程

现象：订单服务每 6 小时左右触发一次 Full GC，老年代从 60% 涨到 98%，随后容器被 OOM Killer 杀掉。

1. 从启动参数确认堆上限 `-Xmx2g`，容器 limit 2.5GB，排除“堆比容器还大”；
2. `jstat` 显示 Full GC 后老年代只降到 92%，判断是对象持续被引用，不是单纯分配过快；
3. 导出 heap dump，用 MAT 打开，看 Dominator Tree，发现 `OrderCache` 静态 Map 占用 1.1GB；
4. 查代码，缓存 key 包含请求时间戳，等于只增不减；
5. 改为 Caffeine 并设置 `maximumSize(100_000)` 与 `expireAfterWrite(10, MINUTES)`，同时补监控指标。

修复后老年代稳定在 40%–60%，Full GC 从每天十余次降到 0–1 次。这个案例说明：dump 只是证据，真正的修复一定落在对象生命周期和容量边界上。

## 常见坑

- 只抓一次 `jstack` 就下结论，可能刚好抓到 safepoint 或空闲线程。
- 在容器里用宿主机的 `jmap`，PID 对不上；应进入容器执行。
- dump 文件写到容器临时层，容器一重启就丢；挂载到持久卷。
- 把 `jstat` 的 `O` 使用率当成实时值，忽略了 GC 周期的波动。
- 开了 Arthas 就长期不退出，`trace` 的字节码增强会拖慢业务。

监控的目标不是工具用得多，而是能在 10 分钟内回答三个问题：问题发生在哪个资源、从什么时候开始、最近改了什么。把这三件事固定成排查模板，故障处理会快很多。
