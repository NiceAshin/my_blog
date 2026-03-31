---
title: 安装与配置
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/
next: /laravel12/directory-structure
---

# 安装与配置

## 系统要求

Laravel12 对环境有明确要求：

| 组件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| PHP | 8.2 | 8.3+ |
| Composer | 2.0 | 最新版 |
| MySQL | 8.0 | 8.0+ |
| PostgreSQL | 12 | 15+ |
| SQLite | 3.26.0+ | 最新版 |
| Redis | 6.0 | 7.0+ |

### PHP 扩展要求

```
- BCMath
- Ctype
- cURL
- DOM
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PCRE
- PDO
- PDO_MySQL (或其他数据库驱动)
- Tokenizer
- XML
```

## 创建项目

### 方式一：通过 Composer

```bash
# 创建新项目
composer create-project laravel/laravel my-app

# 指定版本
composer create-project laravel/laravel:^12.0 my-app
```

### 方式二：通过 Laravel Installer

```bash
# 安装 Laravel Installer
composer global require laravel/installer

# 创建新项目
laravel new my-app

# 带认证脚手架
laravel new my-app --jetstream
```

### 方式三：使用 Docker（Laravel Sail）

```bash
# 使用 Sail 创建项目
curl -s "https://laravel.build/my-app" | bash

# 启动服务
cd my-app
./vendor/bin/sail up -d
```

## 目录权限

安装完成后，需要设置目录权限：

```bash
# 设置 storage 和 bootstrap/cache 目录可写
chmod -R 775 storage bootstrap/cache

# 或在 Windows 上确保 IIS_USER 有写入权限
```

## 配置文件详解

### 环境配置（.env）

Laravel 使用 `.env` 文件管理环境配置：

```env
# 应用配置
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:xxxxx
APP_DEBUG=true
APP_URL=http://localhost

# 数据库配置
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

# 缓存配置
CACHE_DRIVER=redis
CACHE_PREFIX=laravel_cache_

# 队列配置
QUEUE_CONNECTION=redis

# Session 配置
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# 邮件配置
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 应用密钥

应用密钥用于加密 Session、密码重置令牌等：

```bash
# 生成应用密钥
php artisan key:generate
```

### 配置缓存

生产环境建议缓存配置：

```bash
# 缓存配置
php artisan config:cache

# 清除配置缓存
php artisan config:clear
```

## 主配置文件

### config/app.php

```php
return [
    // 应用名称
    'name' => env('APP_NAME', 'Laravel'),

    // 运行环境
    'env' => env('APP_ENV', 'production'),

    // 调试模式
    'debug' => (bool) env('APP_DEBUG', false),

    // 应用 URL
    'url' => env('APP_URL', 'http://localhost'),

    // 时区
    'timezone' => 'Asia/Shanghai',

    // 语言
    'locale' => 'zh_CN',

    // 备用语言
    'fallback_locale' => 'en',

    // 加密密钥
    'key' => env('APP_KEY'),

    // 服务提供者
    'providers' => [
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\EventServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
    ],
];
```

### config/database.php

```php
return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? [
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ] : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'prefer',
        ],

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DATABASE_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'prefix_indexes' => true,
        ],
    ],

    // 迁移仓库表
    'migrations' => 'migrations',

    // Redis 配置
    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', 'laravel_database_'),
        ],
        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];
```

### config/cache.php

```php
return [
    'default' => env('CACHE_STORE', 'database'),

    'stores' => [
        'apc' => ['driver' => 'apc'],
        'array' => ['driver' => 'array', 'serialize' => false],
        'database' => [
            'driver' => 'database',
            'table' => 'cache',
            'connection' => null,
            'lock_connection' => null,
        ],
        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],
        'memcached' => [
            'driver' => 'memcached',
            'persistent_id' => env('MEMCACHED_PERSISTENT_ID'),
            'sasl' => [
                env('MEMCACHED_USERNAME'),
                env('MEMCACHED_PASSWORD'),
            ],
            'options' => [],
            'servers' => [
                ['host' => env('MEMCACHED_HOST', '127.0.0.1'), 'port' => env('MEMCACHED_PORT', 11211), 'weight' => 100],
            ],
        ],
        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
            'lock_connection' => 'default',
        ],
        'dynamodb' => [
            'driver' => 'dynamodb',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
            'endpoint' => env('DYNAMODB_ENDPOINT'),
        ],
    ],

    'prefix' => env('CACHE_PREFIX', 'laravel_cache_'),
];
```

## 调试工具

### Laravel Debugbar

```bash
# 安装 Debugbar
composer require barryvdh/laravel-debugbar --dev

# 发布配置
php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"
```

### Laravel Telescope

```bash
# 安装 Telescope
composer require laravel/telescope --dev

# 安装 Telescope
php artisan telescope:install
php artisan migrate
```

访问 `/telescope` 查看调试面板。

### Laravel Ignition

Laravel12 内置 Ignition 错误页面，提供详细的错误追踪。

## 开发服务器

```bash
# 启动内置服务器
php artisan serve

# 指定端口
php artisan serve --port=8080

# 指定主机
php artisan serve --host=0.0.0.0
```

## 前端配置

### 安装依赖

```bash
# 安装 Node 依赖
npm install

# 开发模式编译
npm run dev

# 生产编译
npm run build

# 热重载
npm run hot
```

### Vite 配置（vite.config.js）

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

## 多环境配置

### 环境文件命名

```
.env                # 默认
.env.local          # 本地覆盖
.env.testing        # 测试环境
.env.production     # 生产环境
```

### 环境检测

```php
// 在代码中检测环境
if (app()->environment('local')) {
    // 本地环境
}

if (app()->environment(['local', 'testing'])) {
    // 本地或测试环境
}

// .env 中设置
APP_ENV=production
```

## 最佳实践

### 1. 安全配置

```env
# 生产环境必须设置
APP_ENV=production
APP_DEBUG=false

# 不要在 .env 中存储敏感信息
# 使用环境变量或密钥管理服务
```

### 2. 配置分离

```php
// 不要硬编码配置
// 错误
$config = ['host' => 'localhost'];

// 正确
$config = ['host' => config('database.connections.mysql.host')];
```

### 3. 使用配置缓存

```bash
# 部署时执行
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. 环境变量验证

```php
// config/app.php 中验证必要配置
'required_env' => [
    'app_key' => env('APP_KEY'),
    'db_host' => env('DB_HOST'),
],
```