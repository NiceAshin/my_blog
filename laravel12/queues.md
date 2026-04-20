---
title: 队列系统
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/api
next: /laravel12/events
---

# 队列系统

Laravel 队列系统提供了统一的 API 来处理异步任务，支持多种队列后端，包括 Redis、Database、Beanstalkd 等。本章将深入讲解队列系统的使用和最佳实践。

## 队列配置

### 配置文件

```php
// config/queue.php
'default' => env('QUEUE_CONNECTION', 'database'),

'connections' => [
    'sync' => [
        'driver' => 'sync',
    ],

    'database' => [
        'driver' => 'database',
        'connection' => env('DB_QUEUE_CONNECTION'),
        'table' => env('DB_QUEUE_TABLE', 'jobs'),
        'queue' => 'default',
        'retry_after' => 90,
        'after_commit' => true,
    ],

    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => 5,
        'after_commit' => true,
    ],
],
```

### 创建队列表

```bash
# 数据库队列
php artisan queue:table
php artisan migrate

# 失败任务表
php artisan queue:failed-table
php artisan migrate
```

## 创建任务

### 生成任务类

```bash
php artisan make:job ProcessPodcast
php artisan make:job SendEmailNotification
```

### 任务类结构

```php
// app/Jobs/ProcessPodcast.php
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 10;

    public function __construct(
        public Podcast $podcast,
        public User $user
    ) {
        $this->onQueue('processing');
    }

    public function handle(AudioProcessor $processor): void
    {
        $processor->process($this->podcast);

        // 更新状态
        $this->podcast->update(['status' => 'processed']);
    }

    public function failed(Throwable $exception): void
    {
        $this->podcast->update(['status' => 'failed']);
    }
}
```

### 唯一任务

```php
class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $uniqueId;

    public function uniqueId(): string
    {
        return 'podcast:' . $this->podcast->id;
    }

    public function uniqueFor(): int
    {
        return 3600; // 1小时内唯一
    }
}
```

## 分发任务

### 基础分发

```php
use App\Jobs\ProcessPodcast;

// 立即分发
ProcessPodcast::dispatch($podcast);

// 同步执行（不进队列）
ProcessPodcast::dispatchSync($podcast);

// 延迟分发
ProcessPodcast::dispatch($podcast)
    ->delay(now()->addMinutes(10));

// 指定队列
ProcessPodcast::dispatch($podcast)
    ->onQueue('processing');

// 指定连接
ProcessPodcast::dispatch($podcast)
    ->onConnection('redis')
    ->onQueue('high');
```

### 批量分发

```php
use Illuminate\Support\Facades\Bus;

Bus::batch([
    new ProcessPodcast(1),
    new ProcessPodcast(2),
    new ProcessPodcast(3),
])->then(function (Batch $batch) {
    // 所有任务完成
})->catch(function (Batch $batch, Throwable $e) {
    // 有任务失败
})->finally(function (Batch $batch) {
    // 无论成功失败
})->dispatch();
```

### 链式任务

```php
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new ExtractPodcast($podcastId),
    new ProcessPodcast($podcastId),
    new ReleasePodcast($podcastId),
])->catch(function (Throwable $e) {
    // 链中任务失败
})->dispatch();
```

## 运行 Worker

### 启动 Worker

```bash
# 基本启动
php artisan queue:work

# 指定连接和队列
php artisan queue:work redis --queue=high,default,low

# 守护进程模式
php artisan queue:work --daemon

# 指定最大任务数
php artisan queue:work --max-jobs=1000

# 指定最大时间
php artisan queue:work --max-time=3600

# 指定内存限制
php artisan queue:work --memory=128
```

### Supervisor 配置

```ini
# /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/app/artisan queue:work redis --queue=high,default,low --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/www/app/storage/logs/worker.log
stopwaitsecs=3600
```

### 处理所有任务后停止

```bash
# 处理完当前任务后停止
php artisan queue:work --stop-when-empty

# 优雅停止
php artisan queue:restart
```

## 失败处理

### 重试机制

```php
class ProcessPodcast implements ShouldQueue
{
    public int $tries = 3;

    public int $backoff = 10; // 首次重试等待秒数

    public function backoff(): array
    {
        return [10, 30, 60]; // 每次重试的等待时间
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2); // 超时时间
    }
}
```

### 失败回调

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Queue;
use Illuminate\Queue\Events\JobFailed;

public function boot(): void
{
    Queue::failing(function (JobFailed $event) {
        Log::error('Job failed', [
            'job' => $event->job->getName(),
            'exception' => $event->exception->getMessage(),
        ]);
    });
}
```

### 重试失败任务

```bash
# 查看失败任务
php artisan queue:failed

# 重试单个失败任务
php artisan queue:retry 5

# 重试所有失败任务
php artisan queue:retry all

# 删除失败任务
php artisan queue:forget 5

# 清空失败任务
php artisan queue:flush
```

## 任务中间件

### 创建中间件

```php
// app/Jobs/Middleware/RateLimited.php
class RateLimited
{
    public function __construct(
        protected string $key,
        protected int $limit = 5
    ) {}

    public function handle($job, $next): void
    {
        Redis::throttle($this->key)
            ->allow($this->limit)->every(60)
            ->then(function () use ($job, $next) {
                $next($job);
            }, function () use ($job) {
                $job->release(10);
            });
    }
}
```

### 使用中间件

```php
class ProcessPodcast implements ShouldQueue
{
    public function middleware(): array
    {
        return [
            new RateLimited('podcast-processing'),
            new WithoutOverlapping($this->podcast->id),
            new SkipIfBatchCancelled(),
        ];
    }
}
```

## 任务批处理

### 创建批处理

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Bus\Batch;

$batch = Bus::batch([
    new ImportCsv(1),
    new ImportCsv(2),
    new ImportCsv(3),
])->before(function (Batch $batch) {
    // 批处理开始前
})->progress(function (Batch $batch) {
    // 每个任务完成后
    $percentage = ($batch->processedJobs() / $batch->totalJobs) * 100;
})->then(function (Batch $batch) {
    // 全部完成
})->catch(function (Batch $batch, Throwable $e) {
    // 有任务失败
})->finally(function (Batch $batch) {
    // 完成（无论成功失败）
})->name('Import CSV Files')
  ->onConnection('redis')
  ->onQueue('imports')
  ->dispatch();
```

### 查询批处理状态

```php
use Illuminate\Support\Facades\Bus;

// 通过 ID 查询
$batch = Bus::findBatch($batchId);

// 检查状态
$batch->pendingJobs;     // 待处理数量
$batch->processedJobs(); // 已处理数量
$batch->failedJobs;      // 失败数量
$batch->totalJobs;       // 总数量
$batch->progress();      // 完成百分比
$batch->finished();      // 是否完成
$batch->cancelled();     // 是否取消

// 操作
$batch->cancel();       // 取消
$batch->delete();       // 删除
```

## Horizon 监控

### 安装 Horizon

```bash
composer require laravel/horizon
php artisan horizon:install
```

### 配置

```php
// config/horizon.php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'maxProcesses' => 10,
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 128,
            'tries' => 3,
            'timeout' => 60,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default'],
            'balance' => 'auto',
            'minProcesses' => 1,
            'maxProcesses' => 5,
        ],
    ],
],
```

### 启动 Horizon

```bash
php artisan horizon
```

## 最佳实践

### 1. 任务幂等性

```php
class ProcessPayment implements ShouldQueue
{
    public function handle(): void
    {
        // 检查是否已处理
        if ($this->payment->is_processed) {
            return;
        }

        DB::transaction(function () {
            $this->payment->process();
            $this->payment->update(['is_processed' => true]);
        });
    }
}
```

### 2. 合理设置超时

```php
class ProcessVideo implements ShouldQueue
{
    public int $timeout = 600; // 10分钟

    public function handle(): void
    {
        // 长时间处理
    }
}
```

### 3. 任务链与批处理

```php
// 需要顺序执行用链
Bus::chain([
    new ValidateOrder($order),
    new ProcessPayment($order),
    new SendConfirmation($order),
])->dispatch();

// 可并行执行用批处理
Bus::batch([
    new SendNotification(1),
    new SendNotification(2),
    new SendNotification(3),
])->dispatch();
```

### 4. 监控和告警

```php
// app/Providers/AppServiceProvider.php
Queue::after(function (JobProcessed $event) {
    Log::info('Job processed', [
        'job' => $event->job->getName(),
    ]);
});

Queue::exceptionOccurred(function (JobExceptionOccurred $event) {
    Notification::route('mail', 'admin@example.com')
        ->notify(new JobFailedNotification($event));
});
```

## 参考资源

- [Laravel 队列文档](https://laravel.com/docs/12.x/queues)
- [Laravel Horizon 文档](https://laravel.com/docs/12.x/horizon)
- [Supervisor 文档](http://supervisord.org/)
