---
prev: ./memory
next: ./monitor
sidebar: auto
---

# GC

本篇内容记录了GC如何判断对象实例是否需要回收, 如何回收, 常见GC的实现

## 确定对象死亡

确定对象死亡有两种算法. 

### 引用计数法

当有地方引用对象时, 对象的计数值 + 1, 引用失效时, 计数值 - 1. 

这种算法有一项缺陷, 它无法解决循环引用问题: 

```java 

    public class Obj{
        private Obj instance;
        
        public static void main(String[] args){
            Obj obj1 = new Obj();
            Obj obj2 = new Obj();
            obj1.instance = obj2;
            obj2.instance = obj1;
        } 
    }
```

### 可达性算法 

可达性算法会回收GC Roots对象的不可达对象, 他有两次标记过程.

::: tip GC Roots
- 虚拟机栈中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中JNI引用的对象
::: 

1. 若对象没有与GC Roots对象相连接的引用链, 将会被第一次标记, 并进行一次筛选, 筛选的条件是是否有必要执行finalize()方法. 

>没有覆盖finalize()方法, 或已被虚拟机调用过, 都被认为没有必要执行
> 
>当被认为有必要执行finalize()时, 这个对象将会被放置在一个F-Queue队列中, 稍后虚拟机会触发一个线程去执行finalize()方法.

::: tip finalize()

finalize()方法现在普遍的认识是不要使用, 原因是只要finalize()方法没有执行, 那么这些对象就会一直存在堆中, 如果需要执行finalize()的对象过多, 那么在FinalizerThread在执行F-Queue队列中对象的finalize()方法之前
这些对象就会一直占用内存. 如果这个大小超过设定的最大堆内存大小, 就会发生内存溢出. 
:::

2. 对F-Queue队列中的对象二次标记. finalize中重新与引用链上的一个对象简历关联就可以在二次标记中移除即将回收的集合
## 引用的类型

对象的引用按照强弱分为四种, GC除了回收已死亡的对象之外, 还会回收特定引用的对象.

### 强引用
```java 
Object o = new Object();
```
只要强引用存在, 对象就永远不会回收

### 软引用

软引用描述一些有用但非必须的对象, 软引用关联的对象将在内存溢出之前, 将这些对象列入回收范围中, 若这次回收还没有足够内存, 将抛出内存溢出异常. JDK1.2之后提供SoftReference实现软引用

```java 

    public class Test{
    
        public static void main(String[] args){
            Test test = new Test;
            // 创建一个软引用
            SoftReference sr = new SoftReference(test);
            // 取消test的强引用
            test = null;
            // 召唤GC
            System.gc();
            log.info("GC之后, 如果内存够用, 软引用还会存在, 软引用:{}" ,sr.get());
        }
    }
```

### 弱引用

描述非必须对象, 强度比软引用更软一些, 被软引用关联的对象只能存货到下次垃圾回收前, 当回收时, 无论内存是否够用, 都会被回收掉. JDK1.2之后提供WeakReference实现弱引用

```java 

    public class Test{
    
        public static void main(String[] args){
            ReferenceQueue rq = new ReferenceQueue();
            log.info("引用队列中专门存放引用, 此时队列中的元素: {}", rq.poll());
            Test test = new Test;
            // 创建一个弱引用
            WeakReference wr = new WeakReference(test,rq);
            // 取消test的强引用
            test = null;
            // 召唤GC
            System.gc();
            log.info("GC之后, 无论内存够用, 弱引用都会回收:{}" ,wr.get() == null);
            log.info("当软引用, 弱引用, 虚引用对应的对象被回收后, 引用会自动加入到引用队列中, 此时队列中的元素: {}", rq.poll());
        }
    }
```
### 虚引用

一个对象是否有虚引用, 完全不会对其生存时间造成影响, 也无法通过虚引用来去的对象实例, 虚引用的唯一目地是能够在对象被回收时收到一个系统通知. JDK1.2之后提供PhantomReference实现弱引用, 虚引用必须与引用队列关联.

## 分代式GC策略

GC分为MinorGC(YoungGC), MajorGC(OldGC)与FullGC. 

MinorGC只回收年轻代. 它的触发条件是年轻代的Eden区满. MajorGC是只针对于老年代的GC.

FullGC回收整个堆和方法区(或元空间), 触发条件:

1. System.gc(). gc方法会建议JVM进行FullGC, 但只是建议, 是否执行由JVM自行判断.
2. 老年代空间不足.
3. 方法区或元空间内存不足.
4. YoungGC统计晋升到老年代的的平均大小大于老年代的剩余空间. 

之所以将堆空间进行分代回收, 是因为大部分分配的对象生命周期都很短, 将这些朝生夕死的对象集中放置到一个区域进行回收要比扫描整个堆空间的效率高很多. 
### GC算法

- **标记-清算算法**

标记清算算法会先将需要GC的对象标记, 再回收标记对象. 

标记清算算法有空间问题, 当标记清除之后会产生大量不连续的内存碎片, 碎片过多可能会导致后续分配较大对象时, 无法得到足够的连续内存而导致再次触发GC. 同时它的效率也不高

- **复制算法**(针对新生代)

复制算法将堆内存的年轻代划分为Eden和两个Survivor(from, to), 比例为8/:1:1, 每次只是用Eden和其中一块Survivor.

当GC时, 将Eden和From-Survivor中还存活着的对象一次性复制到另外一块To-Survivor中, 最后再清理Eden和刚用过的From-Survivor空间.

当To-Survivor空间不足时, 会依赖老年代进行分配担保

- **标记-整理算法**

标记的过程与标记-清算算法的标记过程一样. 

标记之后将存活对象移动到内存的一端, 然后清理掉端边界以外的内存.
- **分代收集算法**

新生代采用复制算法, 老年代采用标记整理或标记清算算法.


## Hotspot的GC算法实现

### 枚举根节点

root节点主要是方法区中的全局性引用, 与执行上下文(栈)中的引用. 

为节省root节点的扫描时间和确保GC停顿时的一致性, Hotspot使用一组成为OopMap的数据结构来实现, 在类加载的时候Hotspot就把对象内什么偏移量上是什么类型的数据计算出来, 在编译过程中, 
也会在特定位置记录下栈和寄存器中哪些位置是引用

### 安全点

因为可能导致引用关系变化, OopMap内容变化的指令非常多, 为每一条指令都生成对应的OopMap,会需要大量的额外空间. 这样GC的空间成本会很高.

Hotspot采用安全点的方式节省OopMap的空间, 即程序执行时并非所有地方都能停顿下来GC, 而是到达安全点后才暂停, 安全点的选定以**是否具有让程序长时间执行**为标准

长时间执行的明显特征是指令序列复用, 如方法调用, 循环跳转, 异常跳转等. 具有这些功能的指令才会产生安全点. 

使GC发生在所有线程都跑到最近的安全点停顿下来的方案: 

#### 抢先式中断

当GC时, 首先中断所有线程, 发现有线程中断不再安全点上时, 恢复运行到安全点再中断.
#### 主动式中断
当GC需要中断线程时, 不直接对线程操作, 而是设立一个标志, 这个标志与安全点重合, 各个线程去轮询标志, 匹配时自己中断挂起.

### 安全区域

安全点机制保证了程序执行时, 在不太长的时间内就可以遇到可进入的GC的安全点, 安全区域机制用于解决程序不执行时的状态, 典型是线程sleep或blocked, 线程无法响应jvm的中断请求. 

安全区域可以看作扩展的安全点. 当代码直行到安全区域时, jvm发起GC, 就不用管标示自己为安全区域的线程了, 当线程离开安全区域的时, 首先检查是否已经完成了root节点的选举. 
## 垃圾收集器

| 名称 | 描述| 
| --- | --- |
| Serial收集器| 单线程收集器, 适用于单个CPU环境, 新生代采用复制算法, 老年代采用标记整理算法|
| ParNew收集器| Serial的多线程版本, 新生代采用多线程复制算法, 老年代采用标记整理算法, 可以与CMS收集器搭配|
|Paralled Scavenge收集器| 并行的多线程收集器, 关注点是系统的吞吐量: 运行用户代码时间 / (运行用户代码时间 + GC时间), 不能搭配CMS|
|Serial Old收集器| Serial收集器的老年代版本, CMS的后备预案|
| Paralled Old收集器| Paralled的老年代版本|
### CMS收集器

CMS收集器目标是获取最短GC停顿时间, 对CPU要求敏感, 默认启动线程数(CPU数量 + 3) /4. 

CMS收集器基于标记-清除算法, 会产生大量碎片空间. 它无法处理浮动垃圾, 会导致FullGC
> 并发处理阶段用户线程还在运行, 新的垃圾不断产生, 需要预留足够空间提供并发收集时的用户线程运作使用

#### 流程

>1. **初始标记**. 需要停顿, 只标记GCRoot能直接关联的对象
>2. **并发标记**. GC Roots Tracing的过程
>3. **重新标记**. 修正并发标记期间因用户程序运作而导致标记变动的那一部分的标记记录
>4. **并发清除**.

### G1收集器

G1收集器采用并行 + 并发的方式独自管理GC堆. 它将堆内存化整为零, 分为多个大小相等的Region, 同时保留新生代和老年代概念, 但不是物理隔离, 都是一部分Region的集合.
跟踪每个Region里的垃圾堆积的价值大小(回收所获得的空间大小和回收所需时间), 优先回收价值高的Region. 是可预测的GC停顿时间模型.

#### 流程

>1. **初始标记**
>2. **并发标记**
>3. **最终标记**. 类似CMS收集器的重新标记, 将这段时间内的对象变化记录到Remembered Set Logs中, 并将其合并到Remembered Set中.
>4. **筛选回收**. 对Region回收价值排序, 按照用户期望的GC停顿时间指定回收计划

它整体看来基于标记-整理, 局部看基于复制算法.



