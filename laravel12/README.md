---
title: Laravel12 框架深度学习
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: false
next: /laravel12/installation
---

# Laravel12 框架深度学习

Laravel 是目前全球最流行的 PHP 框架，以优雅的语法和强大的生态系统著称。本章节将深入学习 Laravel12 的核心概念和实战应用。

## Laravel12 简介

Laravel12 是 Laravel 框架的最新版本，要求 PHP 8.2+，充分利用了现代 PHP 特性：

- **类型声明**：全面的参数和返回类型提示
- **属性（Attributes）**：使用 PHP 8 属性定义路由、中间件等
- **命名参数**：支持更灵活的函数调用
- **枚举（Enums）**：内置枚举支持
- **匹配表达式**：更简洁的条件判断

## 核心特性

### 1. 优雅的语法

```php
// 路由定义
Route::get('/posts/{post}', [PostController::class, 'show']);

// Eloquent 查询
$posts = Post::where('status', 'published')
    ->orderByDesc('created_at')
    ->paginate(15);

// 依赖注入
public function store(Request $request, PostService $service)
{
    $service->create($request->validated());
}
```

### 2. 强大的 ORM

```php
// 模型定义
class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'content', 'status'];
    protected $casts = ['published_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}

// 查询
$post = Post::with('user', 'tags')
    ->whereHas('tags', fn($q) => $q->where('name', 'php'))
    ->firstOrFail();
```

### 3. Blade 模板引擎

```blade
@extends('layouts.app')

@section('content')
@foreach($posts as $post)
    <article>
        <h2>{{ $post->title }}</h2>
        <p>{{ $post->excerpt }}</p>
        <span class="date">{{ $post->published_at->diffForHumans() }}</span>
    </article>
@endforeach

{{ $posts->links() }}
@endsection
```

### 4. 服务容器

```php
// 接口绑定
$app->bind(PaymentGatewayInterface::class, StripeGateway::class);

// 自动注入
class PaymentController
{
    public function __construct(
        private PaymentGatewayInterface $gateway
    ) {}

    public function process(Request $request)
    {
        return $this->gateway->charge($request->amount);
    }
}
```

## 目录

### 基础篇

- [安装与配置](./installation) - 环境搭建与配置详解
- [目录结构](./directory-structure) - 项目结构深度解析
- [路由系统](./routing) - 路由定义与高级特性
- [控制器](./controllers) - 控制器设计模式
- [请求与响应](./request-response) - HTTP 请求处理

### 数据库篇

- [数据库配置](./database-config) - 多数据库连接与配置
- [查询构建器](./query-builder) - 数据库查询详解
- [Eloquent ORM](./eloquent) - 模型与关联关系
- [数据库迁移](./migrations) - 数据库版本控制
- [模型工厂与填充](./factories-seeders) - 测试数据生成

### 视图层篇

- [Blade 模板](./blade) - 模板引擎详解
- [视图组件](./view-components) - 可复用 UI 组件
- [前端资源](./frontend) - Vite 与资源管理

### 架构篇

- [中间件](./middleware) - 请求过滤与处理
- [服务容器](./container) - 依赖注入核心
- [服务提供者](./providers) - 服务注册与引导
- [门面模式](./facades) - 静态代理模式

### 功能篇

- [认证系统](./authentication) - 用户认证与授权
- [API 开发](./api) - RESTful API 构建
- [队列系统](./queues) - 异步任务处理
- [事件系统](./events) - 事件驱动架构
- [缓存系统](./cache) - 数据缓存策略
- [文件存储](./filesystem) - 文件上传与管理
- [邮件发送](./mail) - 邮件服务集成

### 工具篇

- [Artisan 命令](./artisan) - 命令行工具详解
- [调试与日志](./debugging) - 问题排查技巧
- [测试驱动](./testing) - 单元测试与功能测试

## 学习路线

```
入门阶段
├── 安装与环境配置
├── 目录结构理解
├── 路由基础
├── 控制器与视图
└── 数据库基础操作

进阶阶段
├── Eloquent 深入
├── 中间件应用
├── 服务容器理解
├── 队列与任务
└── API 开发

高级阶段
├── 架构模式
├── 性能优化
├── 测试驱动开发
├── 部署与运维
└── 扩展包开发
```

## 核心设计理念

### 1. 约定优于配置

Laravel 遵循"约定优于配置"原则：

- 模型类 `User` 默认对应 `users` 表
- 主键默认为 `id`
- 时间戳字段 `created_at`、`updated_at`
- 控制器默认放在 `App\Http\Controllers`

### 2. 优雅的语法糖

```php
// 条件查询
Post::when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%"));

// 集合操作
$users = User::all()
    ->filter(fn($user) => $user->active)
    ->map(fn($user) => $user->name);

// 响应快捷方法
return back()->with('status', '保存成功！');
return redirect()->route('posts.index');
return response()->json(['status' => 'ok']);
```

### 3. 活跃的生态系统

| 官方包 | 用途 |
|--------|------|
| Laravel Sanctum | API Token 认证 |
| Laravel Passport | OAuth2 服务器 |
| Laravel Horizon | 队列监控面板 |
| Laravel Telescope | 调试助手 |
| Laravel Nova | 管理面板 |
| Laravel Livewire | 全栈框架 |
| Laravel Inertia | SPA 开发 |

## 版本要求

| 组件 | 版本要求 |
|------|----------|
| PHP | >= 8.2 |
| Composer | >= 2.0 |
| Node.js | >= 18.0 |
| MySQL | >= 8.0 |
| PostgreSQL | >= 12 |
| Redis | >= 6.0 |

## 快速开始

```bash
# 创建项目
composer create-project laravel/laravel my-app
cd my-app

# 启动开发服务器
php artisan serve

# 前端资源编译
npm install && npm run dev
```

## 参考资源

- [Laravel 官方文档](https://laravel.com/docs/12.x)
- [Laravel 中文社区](https://laravel.cn)
- [Laravel API 文档](https://laravel.com/api/12.x)
- [Laravel News](https://laravel-news.com)