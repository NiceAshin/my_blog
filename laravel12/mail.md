---
title: 邮件发送
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/filesystem
next: false
---

# 邮件发送

Laravel 邮件系统提供了简洁的 API 来发送邮件，支持多种邮件驱动和丰富的功能，包括队列发送、附件、模板等。本章将深入讲解邮件系统的使用和最佳实践。

## 邮件配置

### 配置文件

```php
// config/mail.php
'default' => env('MAIL_MAILER', 'smtp'),

'mailers' => [
    'smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', 'smtp.mailgun.org'),
        'port' => env('MAIL_PORT', 587),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'timeout' => null,
        'auth_mode' => null,
    ],

    'ses' => [
        'transport' => 'ses',
    ],

    'postmark' => [
        'transport' => 'postmark',
    ],

    'sendmail' => [
        'transport' => 'sendmail',
        'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
    ],

    'log' => [
        'transport' => 'log',
        'channel' => env('MAIL_LOG_CHANNEL'),
    ],

    'array' => [
        'transport' => 'array',
    ],
],

'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

## 创建 Mailable

### 生成 Mailable 类

```bash
php artisan make:mail OrderShipped
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
```

### Mailable 类结构

```php
// app/Mail/OrderShipped.php
namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Shipped',
            from: 'noreply@example.com',
            replyTo: 'support@example.com',
            cc: ['manager@example.com'],
            bcc: ['archive@example.com'],
            tags: ['order', 'shipment'],
            metadata: [
                'order_id' => $this->order->id,
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.shipped',
            with: [
                'order' => $this->order,
                'trackingUrl' => $this->order->tracking_url,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/file.pdf')
                ->as('invoice.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
```

## 发送邮件

### 基础发送

```php
use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

// 发送到单个收件人
Mail::to('user@example.com')->send(new OrderShipped($order));

// 发送到多个收件人
Mail::to(['user1@example.com', 'user2@example.com'])
    ->cc('manager@example.com')
    ->bcc('archive@example.com')
    ->send(new OrderShipped($order));

// 链式调用
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

### 指定邮件驱动

```php
// 使用特定驱动
Mail::mailer('postmark')
    ->to($user)
    ->send(new OrderShipped($order));
```

## 邮件模板

### Blade 模板

```blade
{{-- resources/views/emails/orders/shipped.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Order Shipped</title>
</head>
<body>
    <h1>Your order has been shipped!</h1>

    <p>Order #{{ $order->id }}</p>
    <p>Tracking Number: {{ $order->tracking_number }}</p>

    <a href="{{ $trackingUrl }}">Track your order</a>

    <p>Thank you for your purchase!</p>
</body>
</html>
```

### Markdown 模板

```php
// Mailable 中使用 Markdown
public function content(): Content
{
    return new Content(
        markdown: 'emails.orders.shipped',
        with: [
            'order' => $this->order,
        ],
    );
}
```

```blade
{{-- resources/views/emails/orders/shipped.blade.php --}}
@component('mail::message')
# Order Shipped

Your order has been shipped!

@component('mail::button', ['url' => $trackingUrl])
Track Order
@endcomponent

**Order Details:**
- Order ID: {{ $order->id }}
- Tracking: {{ $order->tracking_number }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

### Markdown 组件

```blade
{{-- 按钮 --}}
@component('mail::button', ['url' => $url, 'color' => 'blue'])
Click Here
@endcomponent

{{-- 面板 --}}
@component('mail::panel')
This is a panel.
@endcomponent

{{-- 表格 --}}
@component('mail::table')
| Item | Price |
|------|-------|
| Item 1 | $10 |
| Item 2 | $20 |
@endcomponent

{{-- 子标题 --}}
@component('mail::subheading')
Section Title
@endcomponent
```

## 队列发送

### 实现 ShouldQueue

```php
class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public Order $order
    ) {
        $this->onQueue('emails');
    }
}
```

### 延迟发送

```php
use Carbon\Carbon;

// 延迟发送
Mail::to($user)
    ->later(now()->addMinutes(5), new OrderShipped($order));

// 指定时间发送
Mail::to($user)
    ->later(Carbon::parse('2024-01-01 09:00:00'), new OrderShipped($order));
```

## 附件

### 文件路径附件

```php
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file.pdf')
            ->as('invoice.pdf')
            ->withMime('application/pdf'),
    ];
}
```

### Storage 附件

```php
use Illuminate\Mail\Mailables\Attachment;

public function attachments(): array
{
    return [
        Attachment::fromStorage('invoices/invoice.pdf')
            ->as('invoice.pdf')
            ->withMime('application/pdf'),
    ];
}
```

### 数据流附件

```php
public function attachments(): array
{
    return [
        Attachment::fromData(fn () => $this->generatePdf(), 'report.pdf')
            ->withMime('application/pdf'),
    ];
}
```

## 内嵌图片

### 嵌入图片

```blade
{{-- Blade 模板中 --}}
<img src="{{ $message->embed($pathToFile) }}">

{{-- 嵌入 Storage 中的图片 --}}
<img src="{{ $message->embedFromStorage('path/to/image.jpg') }}">

{{-- 嵌入数据 --}}
<img src="{{ $message->embedData($data, 'image.jpg') }}">
```

## 本地化邮件

```php
// 设置邮件语言
Mail::to($user)
    ->locale('zh')
    ->send(new OrderShipped($order));

// 用户模型设置首选语言
class User extends Model
{
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}

// 自动使用用户首选语言
Mail::to($user)->send(new OrderShipped($order));
```

## 测试邮件

### 使用 log 驱动

```php
// .env
MAIL_MAILER=log

// 邮件会写入日志文件
```

### 测试代码

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderShipped;

public function testOrderShippedEmail()
{
    Mail::fake();

    // 执行发送邮件的操作
    $order = Order::factory()->create();
    Mail::to('test@example.com')->send(new OrderShipped($order));

    // 断言邮件已发送
    Mail::assertSent(OrderShipped::class, function ($mail) use ($order) {
        return $mail->order->id === $order->id;
    });

    // 断言发送次数
    Mail::assertSent(OrderShipped::class, 1);

    // 断言发送给特定收件人
    Mail::assertSent(OrderShipped::class, function ($mail) {
        return $mail->hasTo('test@example.com');
    });
}
```

## 邮件事件

### 监听邮件事件

```php
// app/Providers/EventServiceProvider.php
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Mail\Events\MessageSent;

protected $listen = [
    MessageSending::class => [
        LogOutgoingEmail::class,
    ],
    MessageSent::class => [
        RecordEmailSent::class,
    ],
];
```

### 事件监听器

```php
class LogOutgoingEmail
{
    public function handle(MessageSending $event): void
    {
        Log::info('Sending email', [
            'to' => $event->message->getTo(),
            'subject' => $event->message->getSubject(),
        ]);
    }
}
```

## 最佳实践

### 1. 使用队列发送

```php
// 所有邮件都应该队列化
class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
}
```

### 2. 避免在 Mailable 中处理重逻辑

```php
// 不好的做法
class OrderShipped extends Mailable
{
    public function content(): Content
    {
        $report = $this->generateReport(); // 重逻辑

        return new Content(view: 'emails.report', with: ['report' => $report]);
    }
}

// 好的做法：在控制器或服务中处理
class ReportController
{
    public function send(ReportService $service)
    {
        $report = $service->generate();

        Mail::to($user)->send(new ReportMail($report));
    }
}
```

### 3. 使用模板继承

```blade
{{-- resources/views/emails/layouts/base.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        .header { background: #f5f5f5; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
    </div>

    <div class="content">
        @yield('content')
    </div>

    <div class="footer">
        @yield('footer')
    </div>
</body>
</html>
```

```blade
{{-- resources/views/emails/orders/shipped.blade.php --}}
@extends('emails.layouts.base')

@section('content')
    <h1>Your order has been shipped</h1>
    <p>Order #{{ $order->id }}</p>
@endsection
```

### 4. 预览邮件

```php
// 路由用于预览邮件
Route::get('/mailable/preview', function () {
    $order = Order::find(1);
    return new App\Mail\OrderShipped($order);
});

// 保存为 HTML 文件
Route::get('/mailable/html', function () {
    $order = Order::find(1);
    return (new App\Mail\OrderShipped($order))->render();
});
```

### 5. 处理发送失败

```php
class OrderShipped extends Mailable implements ShouldQueue
{
    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send order shipped email', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
        ]);

        // 通知管理员
        Notification::route('mail', 'admin@example.com')
            ->notify(new EmailFailedNotification($this->order, $exception));
    }
}
```

## 参考资源

- [Laravel 邮件文档](https://laravel.com/docs/12.x/mail)
- [Symfony Mailer 文档](https://symfony.com/doc/current/mailer.html)
- [Mailgun 文档](https://documentation.mailgun.com/)
- [Postmark 文档](https://postmarkapp.com/developer)
