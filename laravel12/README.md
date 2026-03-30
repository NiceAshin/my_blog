---
title: Yii2 到 Laravel12 快速迁移指南
date: 2026-03-30
tags:
  - Laravel12
  - PHP
  - 框架对比
categories:
  - PHP
prev: false
next: controllers-comparison
---

# Yii2 到 Laravel12 快速迁移指南

本章节是基于 Yii2 框架学习经验，快速掌握 Laravel12 框架的对比学习笔记。

## 为什么学习 Laravel12

Laravel 是目前全球最流行的 PHP 框架，拥有：

- **强大的生态系统**：丰富的官方包（ Sanctum、Passport、Horizon、Telescope 等）
- **优雅的语法**： expressive 代码风格，更接近现代编程理念
- **活跃的社区**：庞大的开发者社区和丰富的第三方包
- **现代化特性**：原生支持 PHP 8.3+ 特性、类型声明、属性等

## 核心概念对比总览

| 概念 | Yii2 | Laravel12 | 说明 |
|------|------|-----------|------|
| 入口文件 | `web/index.php` | `public/index.php` | 相似 |
| 应用主体 | `Yii::$app` | `$app` (服务容器) | Laravel 用依赖注入替代 |
| 配置文件 | `config/web.php` | `config/` 目录下多个文件 | Laravel 配置更分散 |
| 路由 | `urlManager` 组件 | `routes/web.php` | Laravel 路由更直观 |
| 控制器 | `Controller` 类 | `Controller` 类 | 相似，命名规则不同 |
| 模型 | `Model` / `ActiveRecord` | `Model` (Eloquent) | Eloquent 更优雅 |
| 视图 | `.php` 文件 | Blade 模板 | Blade 更强大 |
| 过滤器 | `Filter` | Middleware | 功能相似 |
| 小部件 | `Widget` | Component / Livewire | Laravel 方式更多样 |

## 目录

- [控制器对比](./controllers-comparison)
- [模型对比](./models-comparison)
- [视图对比](./views-comparison)
- [路由对比](./routing-comparison)
- [中间件对比](./middleware-comparison)
- [数据库操作对比](./database-comparison)
- [服务容器与依赖注入](./service-container)

## 快速上手步骤

### 1. 安装 Laravel12

```bash
# 通过 Composer 创建项目
composer create-project laravel/laravel my-project

# 或使用 Laravel Installer
laravel new my-project
```

### 2. 目录结构对比

```
Yii2                          Laravel12
├── config/                   ├── config/
│   ├── web.php               │   ├── app.php
│   ├── db.php                │   ├── database.php
│   └── ...                   │   └── ...
├── controllers/              ├── app/Http/Controllers/
├── models/                   ├── app/Models/
├── views/                    ├── resources/views/
├── runtime/                  ├── storage/
├── web/ (入口)               ├── public/ (入口)
└── vendor/                   ├── vendor/
```

### 3. 启动应用

```bash
# Yii2 方式
php yii serve

# Laravel12 方式
php artisan serve
```

## 思维转变要点

从 Yii2 迁移到 Laravel，需要理解以下核心差异：

### 1. 依赖注入 vs 静态调用

**Yii2 风格**：大量使用静态方法
```php
// Yii2
Yii::$app->db->createCommand()->queryAll();
Yii::$app->request->get('id');
```

**Laravel12 风格**：依赖注入
```php
// Laravel12
public function index(Request $request)
{
    $id = $request->input('id');
    // 或通过依赖注入
}
```

### 2. 门面（Facade）vs 组件

Laravel 提供类似 Yii2 静态调用的 Facade：
```php
// Laravel Facade（类似 Yii2 风格）
DB::select('SELECT * FROM users');
Request::input('id');
Cache::get('key');
```

### 3. Eloquent ORM vs Yii ActiveRecord

**Yii2 ActiveRecord**：
```php
$user = User::findOne(1);
$user->name = 'New Name';
$user->save();
```

**Laravel Eloquent**：
```php
$user = User::find(1);
$user->name = 'New Name';
$user->save();
// 或
User::where('id', 1)->update(['name' => 'New Name']);
```

## 学习路线建议

根据 Yii2 学习经验，建议按以下顺序学习 Laravel：

1. **路由系统** - Laravel 路由更加直观和灵活
2. **控制器** - 与 Yii2 相似，但有新的特性
3. **Eloquent ORM** - 比 Yii2 ActiveRecord 更强大
4. **Blade 模板** - 学习新的模板语法
5. **中间件** - 替代 Yii2 过滤器
6. **服务容器** - Laravel 核心概念
7. **Artisan 命令** - 强大的 CLI 工具

## 参考资源

- [Laravel 官方文档](https://laravel.com/docs/12.x)
- [Laravel 中文文档](https://laravel.cn)