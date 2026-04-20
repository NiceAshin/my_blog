---
title: 事件系统
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/queues
next: /laravel12/cache
---

# 事件系统

Laravel 事件系统提供了观察者模式的实现，允许你在应用程序中订阅和监听各种事件。本章将深入讲解事件系统的使用和最佳实践。

## 事件基础

### 定义事件

```bash
php artisan make:event OrderShipped
```

```php
// app/Events/OrderShipped.php
namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order
    ) {}
}
```

### 定义监听器

```bash
php artisan make:listener SendShipmentNotification --event=OrderShipped
```

```php
// app/Listeners/SendShipmentNotification.php
namespace App\Listeners;

use App\Events\OrderShipped;
use App\Notifications\OrderShippedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    public function handle(OrderShipped $event): void
    {
        $event->order->user->notify(
            new OrderShippedNotification($event->order)
        );
    }

    public function failed(OrderShipped $event, Throwable $exception): void
    {
        Log::error('Failed to send shipment notification', [
            'order_id' => $event->order->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

## 注册事件监听器

### 在 EventServiceProvider 注册

```php
// app/Providers/EventServiceProvider.php
namespace App\Providers;

use App\Events\OrderShipped;
use App\Listeners\SendShipmentNotification;
use App\Listeners\UpdateInventory;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderShipped::class => [
            SendShipmentNotification::class,
            UpdateInventory::class,
        ],
    ];

    protected $subscribe = [
        'App\Listeners\UserEventSubscriber',
    ];
}
```

### 自动发现

Laravel 支持事件和监听器的自动发现，无需手动注册：

```bash
# 生成事件发现缓存
php artisan event:cache

# 清除事件发现缓存
php artisan event:clear
```

## 触发事件

### 使用事件辅助函数

```php
use App\Events\OrderShipped;

// 触发事件
event(new OrderShipped($order));

// 或使用 dispatch
OrderShipped::dispatch($order);
```

### 条件触发

```php
use App\Events\OrderPaid;

// 仅当订单已支付时触发
OrderPaid::dispatchIf($order->isPaid(), $order);

// 除非订单已取消才触发
OrderShipped::dispatchUnless($order->isCancelled(), $order);
```

## 事件订阅者

### 创建订阅者

```php
// app/Listeners/UserEventSubscriber.php
namespace App\Listeners;

use App\Events\UserCreated;
use App\Events\UserDeleted;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    public function handleUserCreated(UserCreated $event): void
    {
        // 处理用户创建
    }

    public function handleUserDeleted(UserDeleted $event): void
    {
        // 处理用户删除
    }

    public function subscribe(Dispatcher $events): array
    {
        return [
            UserCreated::class => 'handleUserCreated',
            UserDeleted::class => 'handleUserDeleted',
        ];
    }
}
```

### 注册订阅者

```php
// app/Providers/EventServiceProvider.php
protected $subscribe = [
    'App\Listeners\UserEventSubscriber',
];
```

## 队列化监听器

### 实现队列接口

```php
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;
    public int $backoff = 10;
    public int $timeout = 60;

    public function handle(OrderShipped $event): void
    {
        // 处理逻辑
    }

    public function shouldQueue(): bool
    {
        // 条件决定是否入队
        return $event->order->shouldNotify();
    }
}
```

### 指定队列

```php
class ProcessPayment implements ShouldQueue
{
    public $connection = 'redis';
    public $queue = 'high';
    public $delay = 10; // 秒
}
```

## 事件广播

### 配置广播

```php
// config/broadcasting.php
'default' => env('BROADCAST_DRIVER', 'pusher'),

'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'encrypted' => true,
        ],
    ],

    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
    ],
],
```

### 广播事件

```php
// app/Events/OrderStatusUpdated.php
namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.' . $this->order->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'status' => $this->order->status,
            'updated_at' => $this->order->updated_at->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastQueue(): string
    {
        return 'broadcasts';
    }
}
```

### 频道类型

```php
// 公共频道
public function broadcastOn(): array
{
    return [new Channel('orders')];
}

// 私有频道
public function broadcastOn(): array
{
    return [new PrivateChannel('user.' . $this->user->id)];
}

// 存在频道（群聊）
public function broadcastOn(): array
{
    return [new PresenceChannel('chat.' . $this->chat->id)];
}
```

### 频道认证

```php
// routes/channels.php
use Illuminate\Support\Facades\Broadcast;

// 私有频道认证
Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return $user->orders()->where('id', $orderId)->exists();
});

// 存在频道认证
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    if ($user->chats()->where('id', $chatId)->exists()) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

### 前端监听

```javascript
// 使用 Laravel Echo
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
});

// 监听私有频道
echo.private(`orders.${userId}`)
    .listen('.order.status.updated', (e) => {
        console.log('Order status updated:', e);
    });

// 监听存在频道
echo.join(`chat.${chatId}`)
    .here((users) => {
        console.log('Users in chat:', users);
    })
    .joining((user) => {
        console.log('User joined:', user);
    })
    .leaving((user) => {
        console.log('User left:', user);
    });
```

## 模型事件

### 模型事件钩子

```php
// app/Models/Post.php
class Post extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Post $post) {
            $post->slug = Str::slug($post->title);
        });

        static::updating(function (Post $post) {
            $post->updated_by = auth()->id();
        });

        static::deleting(function (Post $post) {
            $post->tags()->detach();
        });
    }
}
```

### 模型观察者

```php
// app/Observers/PostObserver.php
namespace App\Observers;

use App\Models\Post;
use App\Notifications\PostPublishedNotification;

class PostObserver
{
    public function created(Post $post): void
    {
        $post->user->notify(new PostPublishedNotification($post));
    }

    public function updated(Post $post): void
    {
        if ($post->wasChanged('status') && $post->status === 'published') {
            // 发布通知
        }
    }

    public function deleted(Post $post): void
    {
        // 清理相关数据
    }

    public function restored(Post $post): void
    {
        // 恢复操作
    }

    public function forceDeleted(Post $post): void
    {
        // 永久删除
    }
}
```

```php
// app/Providers/EventServiceProvider.php
protected $observers = [
    Post::class => [PostObserver::class],
];
```

## 最佳实践

### 1. 命名规范

```php
// 事件：过去式，描述已发生的事
OrderShipped
UserRegistered
PaymentProcessed

// 监听器：动词，描述要执行的操作
SendShipmentNotification
SendWelcomeEmail
UpdateInventory
```

### 2. 单一职责

```php
// 每个监听器只做一件事
class SendShipmentNotification
{
    public function handle(OrderShipped $event): void
    {
        // 只发送通知，不做其他事
    }
}

class UpdateInventory
{
    public function handle(OrderShipped $event): void
    {
        // 只更新库存
    }
}
```

### 3. 使用 SerializesModels

```php
// 队列化监听器中使用 SerializesModels
class SendShipmentNotification implements ShouldQueue
{
    use SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    // 只序列化模型 ID，处理时重新查询
}
```

### 4. 条件广播

```php
class OrderStatusUpdated implements ShouldBroadcast
{
    public function broadcastWhen(): bool
    {
        return $this->order->shouldBroadcast();
    }
}
```

### 5. 避免循环触发

```php
class PostObserver
{
    public function updated(Post $post): void
    {
        // 避免循环
        if (!$post->isDirty('view_count')) {
            $post->update(['view_count' => $post->view_count + 1]);
        }
    }
}
```

## 参考资源

- [Laravel 事件文档](https://laravel.com/docs/12.x/events)
- [Laravel 广播文档](https://laravel.com/docs/12.x/broadcasting)
- [Pusher 文档](https://pusher.com/docs)
