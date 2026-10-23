---
title: Go 并发与调度
date: 2024-04-24
categories:
  - Go
tags:
  - Go
  - 并发
  - 调度
---

# Go 并发模式与调度深入解析

Go 的并发模型常被概括为“不要通过共享内存来通信，而要通过通信来共享内存”。这句话落地到工程里，核心就是 goroutine、channel、select 与 context 的组合。理解 GMP 调度，能解释很多“为什么这段并发代码看起来对、压测却抖”的问题。

## GMP 调度是什么

- **G（Goroutine）**：用户态轻量协程，初始栈约 2KB，可动态扩缩。
- **M（Machine）**：操作系统线程，真正执行 G 的载体。
- **P（Processor）**：逻辑处理器，持有本地可运行队列、内存缓存等资源；数量由 `GOMAXPROCS` 决定，默认等于 CPU 核数。

运行时维护全局队列和每个 P 的本地队列。M 必须绑定 P 才能执行 G；当 G 发生网络 I/O、channel 阻塞或系统调用时，M 可能被挂起，P 会转交给其他 M，避免整个处理器空转。本地队列为空时，P 会从全局队列或其他 P 的队列“偷”一半 G，这就是 work-stealing。

这也解释了两个实践原则：CPU 密集任务不要把 `GOMAXPROCS` 设得过大；阻塞型任务要关注 goroutine 数量，避免大量 goroutine 同时等待。

## channel 与 select

channel 是带类型的通信管道。无缓冲 channel 要求发送与接收同时就绪；有缓冲 channel 在缓冲区未满/非空时可以先返回。`select` 则用于在多个 channel 操作之间等待，配合 `default` 可实现非阻塞尝试，配合 `ctx.Done()` 可实现取消。

```go
select {
case jobs <- task:
    // 发送成功
case <-ctx.Done():
    // 收到取消信号，停止生产
    return
default:
    // 队列已满，降级或丢弃
}
```

一个常见误区是用 `close(ch)` 表示“没有数据了”，但仍有多个生产者时关闭 channel 会 panic。正确做法是由唯一的发送方关闭，或使用 `sync.WaitGroup` 等所有生产者结束后再关闭。

## 可运行的 worker pool

下面的程序启动 3 个 worker，生产者投递 10 个任务，2 秒后整体取消。`go run -race main.go` 可以直接检查数据竞争：

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func worker(ctx context.Context, id int, jobs <-chan int,
	results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-ctx.Done():
			return
		case job, ok := <-jobs:
			if !ok {
				return
			}
			select {
			case results <- job * job:
			case <-ctx.Done():
				return
			}
		}
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	jobs := make(chan int)
	results := make(chan int)
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(ctx, i, jobs, results, &wg)
	}

	go func() {
		defer close(jobs)
		for i := 1; i <= 10; i++ {
			select {
			case jobs <- i:
			case <-ctx.Done():
				return
			}
		}
	}()

	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		fmt.Println(result)
	}
}
```

这段代码有三个关键点：生产者只负责关闭 `jobs`；`wg.Wait()` 在所有 worker 退出后关闭 `results`；所有可能阻塞的发送都监听 `ctx.Done()`。少任何一个，都可能出现 goroutine 泄漏或 `send on closed channel`。

## context 取消与超时

`context.WithTimeout` 适合给一次请求设置总预算，`context.WithCancel` 适合由上游主动终止。把 ctx 作为函数第一个参数向下传递，不要塞进结构体长期保存。下游收到 `<-ctx.Done()` 后应尽快返回，并把 `ctx.Err()` 包装成业务错误。

```go
func query(ctx context.Context, db *sql.DB) error {
	rows, err := db.QueryContext(ctx, "select id from orders limit 10")
	if err != nil {
		return fmt.Errorf("query orders: %w", err)
	}
	defer rows.Close()
	// ...
	return nil
}
```

## 共享状态与锁

channel 不是万能的。计数器、缓存这类简单共享状态，用 `sync.Mutex` 或 `atomic` 更直接。注意 `sync.Mutex` 不可复制，包含锁的结构体不要按值传递。读多写少可以用 `sync.RWMutex`，但不要在高频路径上为了“看起来高级”引入额外复杂度。

## 常见坑

- 在循环里用 `go func(){ ... }()` 直接引用循环变量，旧版本 Go 会全部捕到最后一个值；Go 1.22 起循环变量按迭代创建，但显式传参依旧更清晰。
- 无缓冲 channel 上先发送后接收，单 goroutine 会永久阻塞。
- 只取消 context 不关闭 channel，消费者可能仍在 `range` 上等待。
- worker 数量远大于任务数，调度开销反而超过收益。
- 用 `time.Sleep` 做并发编排，测试会变慢且不稳定，优先用 channel 或 `WaitGroup`。

并发代码的正确性优先于技巧。先用 `-race` 跑通，再用压测和 pprof 看 goroutine、锁竞争与调度延迟，最后才考虑池化和批量优化。
