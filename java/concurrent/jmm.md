---
prev: ./thread
next: ./sync
sidebar: auto
---
# Java内存模型

在并发编程中, 需要处理两个关键问题: 线程之间如何通信以及线程之间如何同步. 通信指的是线程之间通过何种机制来交换信息.
在命令式编程中, 线程之间的通信机制有两种: 共享内存和消息传递.

在共享内存的并发模型中, 线程之间共享程序的公共状态, 通过写-读内存中的公共状态进行隐式通信. 在消息传递的并发模型中, 线程之间没有公共状态, 线程之间必须通过
发送消息来显式通信. 

同步指的是程序中用于控制不同线程间操作发生相对顺序的机制. 在共享内存模型中, 同步是显式进行的. 程序员必须显示制定某个方法或代码块需要在线程之间互斥执行.
在消息传递的并发模型里, 由于消息的发送必须在消息接收之前, 因此同步是隐式进行的.

java的并发采用的是共享内存模型, 线程之间通信是隐式进行的. 

java中, 所有实例域, 静态域和数组元素都存放在堆中, 堆在线程之间是共享的. 局部变量, 方法定义参数和异常处理器参数是线程私有的, 因此不会有可见性问题, 也不会受内存模型影响. 

java线程之间的通信由JMM控制, **JMM决定一个线程对共享变量的写入何时对其他线程可见.**

JMM中线程与主内存之间的抽象关系是: **共享变量存储在主内存中, 每个线程私有一个本地内存, 存储该线程读写共享变量的副本.** 本地内存是一个抽象概念, 并不真实存在.

## 指令重排

程序执行时, 为了提高性能, 编译器和处理器往往会对指令做重排序.
重排序分为三种:
- 编译器重排序. 编译器在不改变单线程程序语义的前提下, 可以重新安排语句的执行顺序.
- 指令级重排序. 现代处理器采用了指令级重排序技术来讲多条指令重新排序. 如果不存在数据依赖性, 处理器可以改变语句对应机器指令的执行顺序.
- 内存系统的重排序. 由于处理器使用缓存和读/写缓冲区, 使得加载和存储操作看上去可能是在乱序执行.
> 指令级重排序和内存系统的重排序都属于处理器的重排序. 

在经过三个重排序之后, 才会确定最终的指令序列.这些重排序可能会导致多线程程序出现内存可见性的问题. 对于编译器, JMM的编译器重排序规则会禁止特定类型的编译器重排序, 对于处理器, JMM的
处理器重排序规则会要求java编译器在生成指令序列时, 插入特定的内存屏障, 通过内存屏障来禁止特定类型的处理器重排序. 

### 数据依赖性

---
两个操作对统一变量的访问具有数据依赖性, 分为三种
- 写后读. 写一个变量后,再读这个变量. 例: a=1; b=a;
- 写后写. 写一个变量后, 再次写这个变量. 例: a=1; a=2;
- 读后写. 读一个变量后, 再写这个变量. 例: a=b; a = 1;

以上三种情况, 只要重排序两个操作的执行顺序, 程序的执行结果就会改变. 
编译器和处理器的重排序会遵循数据依赖性, 编译器的处理器不会改变存在数据依赖关系的两个操作顺序. 
### as-if-serial

---
不管怎么重排序, 单线程的执行结果不会改变

### 顺序一致性

---
在概念上, 顺序一致性模型有一个单一的全局内存, 这个内存通过一个开关可以连接到任意一个线程. 同时每一个线程必须按照程序的顺序来执行内存读/写.

JMM对正确同步的多线程程序的内存一致性做了如下保证: 如果程序是正确同步的, 那么程序的执行将具备顺序一致性, 即程序的执行结果与该程序在顺序一致性内存模型中的执行结果相同.

<span id="jmm-seq-con">顺序一致性模型</span>中, 所有线程都只能看到一个单一的操作执行顺序. 每个操作都必须原子执行并立刻对所有线程可见. 这个单一的操作执行顺序, 对多线程来说可能是无序的顺序, 但每个线程看到的顺序都一样.
比如线程A执行A1 -> A2 -> A3操作, 线程B执行B1 -> B2 -> B3操作, 在没有进行同步的情况下, 执行顺序可能是B1 -> B2 -> A1 -> B3 -> A2 -> A3, 虽然整体的执行顺序是无序的, 但在每个线程看来, 执行的顺序是一样的. 这是因为在顺序一致性模型中,
每个操作必须立刻对其他线程可见. 

**但是JMM不保证所有线程能看到一致的操作执行顺序, 这是因为JMM内存模型中每个线程具有本地内存, 线程吧写过的数据缓存到本地内存, 在没有刷新到主内存之前, 这个操作只对当前线程可见. 对于其他线程, 会认为这个操作并没有执行过**.  

JMM不保证对64位long类型和double类型的写操作具有原子性

JMM的顺序一致性: **临界区(同步代码块)内的代码可以重排序, 但由于监视器互斥执行的特性, 其他线程无法观察到当前线程的在临界区内的重排序**
## 内存屏障

现代处理器使用写缓冲区来临时保存写入的数据. 写缓冲区可以保证指令流水线运行, 可以避免由于处理器停顿下来等待向内存写入数据而产生的延迟. 同时通过以批处理的方式刷新写缓冲区, 以及合并写缓冲区
中对同一内存地址的多次写, 减少对内存总线的占用. 但是每个处理器的写缓冲区支队它所在的处理器可见. 这个特性对内存操作的执行顺序产生重要的影响: 处理器对内存的读/写操作的执行顺序, 不一定与内存实际发生的读/写顺序一致.

**内存屏障的类型**

| 屏障类型 | 指令示例 | 说明 |
| ---- | ---- | ---- |
| LoadLoadBarriers| Load1;LoadLoad;Load2| 确保Load1数据的装载先于Load2及所有后续装载指令的装载|
| StoreStoreBarriers| Store1; StoreStore;Store2| 确保Store1数据对其他处理器可见(刷新到内存)先于Store2及所有后续存储指令的存储|
| LoadStoreBarriers| Load1;LoadStore;Store2| 确保Load1数据装载先于Store2及后续所有的存储指令刷新到内存|
| StoreLoadBarriers| Store1; StoreLoad;Load2| 确保Store1数据对其他处理器可见(刷新到内存), 先于Load2及所有后续所有装载指令的装载. StoreLoadBarriers会使该屏障之前的所有内存访问指令(存储和装载指令)完成之后, 才执行该屏障之后的内存访问指令|

StoreLoadBarriers是全能型的屏障, 同时具有其他三个屏障的效果.

## happens-before

happens-before并不要求前一个操作必须在后一个操作之前, 只要求前一个操作执行的结果对后一个操作可见.如一个锁的解锁happens-before于随后对这个锁的加锁; volatile变量的写happens-before于任意后续对这个变量的读.

## volatile在JMM中的内存语义

volatile变量的单个读/写, 可以看作是使用同一个锁对这些个读写操作做了同步. 

锁的happens-before规则保证释放锁和获取锁的两个线程之间的可见性
> 写操作等于锁释放, 读操作等于锁获取. 当读线程读取volatile变量时, 写操作已经刷新到主内存, 读线程本地内存的值无效, 必须重新到主内存读取内存.
>
> volatile变量的读写操作本质上是在做线程间通信, 写线程向读线程发消息表示共享内存被修改
## 锁在JMM中的内存语义

线程释放锁时, 会立刻将本地内存中的共享变量刷新到主内存中.

## final内存语义

构造函数内写入final域随后将这个对象的引用赋值给一个引用变量的操作之间不能重排序. 实际上是在final域的写之后,构造函数的return前插入了一个StoreStore屏障禁止将
final域的写重排序到构造函数之外. 

final域所在对象的读与final域的读之间会插入一个LoadLoad屏障, 这个屏障是针对处理器的, 因为final域所在对象的读域与final域的读之间存在间接依赖, 所以编译器不会重排序.

**为什么final引用不能从构造函数逸出?**

```
 class A {
    final i;
    static A obj;
    
    A(){
        i = 1;
        obj = this;
    }
    
    static void writer(){
        new A();
    }
 
    static void reader(){
        if(obj != null){
            int temp = obj.i;
        }
    }
 }
```
因为在构造函数返回前, final域可能还没有初始化. 


## 双重检查锁定与延迟初始化的问题

多线程程序中, 有时候会采用延迟初始化提高效率. 这时可能会用到双重检查锁定的方式. 

```
    pubic class A {
    
        private static A instance;
        
        public static A getInstance(){
            if (A  == null) {
                synchronized(A.class){
                    if(A == null){
                        insance = new A();
                    }
                }
            }
            return instance;
        }
    }
```

但这种方法其实是错误的优化. instance = new A(); //可以分解为三步:

```
    memory = allocate(); // 1分配内存 
    ctorInstance(memory); // 2初始化对象
    instance = memory; // 3将分配内存地址指向instance
```

第二步和第三步可能会被重排序, 因为它并没有改变单线程的执行结果. 反而可以提高性能. 并发访问时, 可能会出现外层instance != null, 但
instance内部并没有初始化完毕的情况.

可以将instance声明为volatile, 会在二三之间插入StoreLoad内存屏障禁止重排序. 

也可以采用静态内部类方式延迟初始化:

```
    public class A {
        
        private static class Holder{
            public static A instance = new A();
        }
        
        public static A getInstance(){
            return Holer.instance;
        }
    }
```

JVM会在类的初始化(即类被加载后, 被线程使用前)期间去获取一个锁, 这个锁可以同步多个线程对同一个类的初始化.

## 总结

JMM在设计时参照了顺序一致性模型(不是完全参照, 因为会限制优化), 但做了一些放松. 他会在执行命令序列的适当位置插入一些内存屏障来限制处理器的重排序.

JMM的内存可见性保证: 

- 单线程内不会出现内存可见性问题.
- 多线程正确同步时不会出现内存可见性问题. 正确同步的多线程程序的执行结果与顺序一致性模型的执行结果相同.
- 未同步或未正确同步的多线程程序, JMM只保证最小安全性保障: 线程执行时读取到的值, 要么是之前某个线程写入的值, 要么是默认值.

JMM基于内存屏障提供了volatile,final关键字和 synchronized关键字实现了内存可见性(实现了顺序一致性)
