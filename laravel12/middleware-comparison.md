---
title: 中间件对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/routing-comparison
next: /laravel12/database-comparison
---

# 中间件对比

## 概念对比

Yii2 的**过滤器**和 Laravel12 的**中间件**功能相似，都是在控制器动作执行前后拦截请求。

### Yii2 过滤器

```php
// 在控制器 behaviors() 方法中声明
public function behaviors()
{
    return [
        'access' => [
            'class' => AccessControl::class,
            'only' => ['create', 'update'],
            'rules' => [
                ['allow' => true, 'roles' => ['@']],
            ],
        ],
        'verbs' => [
            'class' => VerbFilter::class,
            'actions' => [
                'delete' => ['POST'],
            ],
        ],
    ];
}
```

### Laravel12 中间件

```php
// 在控制器构造函数中声明
public function __construct()
{
    $this->middleware('auth')->only(['create', 'update']);
    $this->middleware('throttle:60,1')->except('index');
}

// 或在路由中声明
Route::middleware(['auth'])->group(function () {
    Route::resource('posts', PostController::class);
});
```

## 关键差异对比表

| 特性 | Yii2 过滤器 | Laravel12 中间件 |
|------|------------|------------------|
| 定义方式 | `behaviors()` 方法 | 独立类文件 |
| 位置 | 控制器内或配置文件 | `app/Http/Middleware/` |
| 执行时机 | `beforeAction` / `afterAction` | `handle()` 方法 |
| 应用范围 | `only` / `except` | `only` / `except` |
| 全局中间件 | 应用/模块配置 | `bootstrap.php` 或 `$middleware` |
| 顺序控制 | 数组顺序 | Kernel 中 `$middlewarePriority` |
| 终止请求 | `return false` | `return response()` 或异常 |
| 依赖注入 | 不支持 | 支持完整依赖注入 |

## 创建中间件对比

### Yii2 创建过滤器

```php
namespace app\components;

use Yii;
use yii\base\ActionFilter;

class ActionTimeFilter extends ActionFilter
{
    private $startTime;

    public function beforeAction($action)
    {
        $this->startTime = microtime(true);
        return true; // 返回 false 终止执行
    }

    public function afterAction($action, $result)
    {
        $time = microtime(true) - $this->startTime;
        Yii::debug("Action '{$action->uniqueId}' spent {$time} seconds.");
        return $result; // 可修改结果
    }
}

// 使用
public function behaviors()
{
    return [
        'timing' => ActionTimeFilter::class,
    ];
}
```

### Laravel12 创建中间件

```bash
# 创建中间件
php artisan make:middleware LogExecutionTime
```

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogExecutionTime
{
    public function handle(Request $request, Closure $next): Response
    {
        // 前置逻辑（执行前）
        $startTime = microtime(true);

        // 执行请求
        $response = $next($request);

        // 后置逻辑（执行后）
        $time = microtime(true) - $startTime;
        Log::info("Request took {$time} seconds");

        return $response; // 可修改响应
    }

    // 终止中间件（响应发送后执行）
    public function terminate(Request $request, Response $response): void
    {
        // 记录日志、清理等
    }
}
```

## 核心中间件对比

### Yii2 内置过滤器

| 过滤器 | 功能 | Laravel 对应 |
|-------|------|--------------|
| `AccessControl` | 访问控制 | `auth` + `can` 中间件 |
| `VerbFilter` | HTTP 方法限制 | 路由定义 |
| `ContentNegotiator` | 内容格式协商 | 自定义中间件 |
| `HttpCache` | HTTP 缓存 | 自定义中间件 |
| `PageCache` | 页面缓存 | 自定义中间件 |
| `RateLimiter` | 速率限制 | `throttle` 中间件 |
| `Cors` | 跨域 | `cors` 中间件 |
| `HttpBasicAuth` | Basic认证 | `auth.basic` 中间件 |

### Laravel12 内置中间件

```php
// app/Http/Kernel.php（或 bootstrap/app.php）

// 全局中间件（每个请求都执行）
protected $middleware = [
    \Illuminate\Http\Middleware\TrustProxies::class,
    \Illuminate\Http\Middleware\HandleCors::class,       // CORS
    \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
    \Illuminate\Http\Middleware\ValidatePostSize::class,
    \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
    \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
];

// 路由中间件（按需应用）
protected $middlewareAliases = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'can' => \Illuminate\Foundation\Http\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
];
```

## 访问控制对比

### Yii2 AccessControl

```php
use yii\filters\AccessControl;

public function behaviors()
{
    return [
        'access' => [
            'class' => AccessControl::class,
            'only' => ['create', 'update', 'delete'],
            'rules' => [
                // 允许已登录用户
                [
                    'allow' => true,
                    'roles' => ['@'], // '@' = 已登录, '?' = 未登录
                ],
                // 允许特定角色
                [
                    'allow' => true,
                    'actions' => ['delete'],
                    'roles' => ['admin'],
                ],
                // 允许特定 IP
                [
                    'allow' => true,
                    'ips' => ['127.0.0.1'],
                ],
                // 允许特定用户
                [
                    'allow' => true,
                    'matchCallback' => function ($rule, $action) {
                        return Yii::$app->user->id == 1;
                    },
                ],
                // 默认拒绝
                [
                    'allow' => false,
                ],
            ],
            'denyCallback' => function ($rule, $action) {
                throw new ForbiddenHttpException('无权访问');
            },
        ],
    ];
}
```

### Laravel12 访问控制

```php
// 1. auth 中间件（认证检查）
Route::middleware('auth')->group(function () {
    Route::resource('posts', PostController::class);
});

// 未认证重定向到登录
// 在 Authenticate 中间件中配置:
protected function redirectTo(Request $request): string
{
    return route('login');
}

// 2. guest 中间件（仅允许未登录）
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show']);
});

// 3. can 中间件（权限检查）
Route::middleware('can:update,post')->group(function () {
    Route::get('/posts/{post}/edit', [PostController::class, 'edit']);
});

// 或在控制器中
public function __construct()
{
    $this->middleware('can:create,Post')->only('create');
    $this->middleware('can:update,post')->only('edit', 'update');
    $this->middleware('can:delete,post')->only('destroy');
}

// 定义权限（在 AuthServiceProvider 中）
Gate::define('update-post', function (User $user, Post $post) {
    return $user->id === $post->user_id || $user->isAdmin();
});

// 4. 角色/权限中间件（自定义）
class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            abort(403, 'Unauthorized action.');
        }
        return $next($request);
    }
}

// 使用
Route::middleware('role:admin')->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
});
```

## HTTP 方法限制对比

### Yii2 VerbFilter

```php
use yii\filters\VerbFilter;

public function behaviors()
{
    return [
        'verbs' => [
            'class' => VerbFilter::class,
            'actions' => [
                'index'  => ['GET'],
                'view'   => ['GET'],
                'create' => ['GET', 'POST'],
                'update' => ['GET', 'PUT', 'POST'],
                'delete' => ['POST', 'DELETE'],
            ],
        ],
    ];
}
```

### Laravel12 HTTP 方法限制

```php
// 直接在路由中定义（推荐）
Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);
Route::put('/posts/{id}', [PostController::class, 'update']);
Route::delete('/posts/{id}', [PostController::class, 'destroy']);

// 或使用自定义中间件验证
class ValidateRequestMethod
{
    public function handle(Request $request, Closure $next, string $method): Response
    {
        if (! $request->isMethod($method)) {
            abort(405, 'Method not allowed');
        }
        return $next($request);
    }
}
```

## CORS 对比

### Yii2 Cors 过滤器

```php
use yii\filters\Cors;

public function behaviors()
{
    return ArrayHelper::merge([
        [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['https://example.com'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 86400,
            ],
        ],
    ], parent::behaviors());
}
```

### Laravel12 CORS 中间件

```php
// Laravel 12 内置 CORS 中间件
// 配置文件: config/cors.php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://example.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];

// 全局自动应用，无需手动添加
```

## 速率限制对比

### Yii2 RateLimiter

```php
use yii\filters\RateLimiter;

public function behaviors()
{
    return [
        'rateLimiter' => [
            'class' => RateLimiter::class,
            'enableRateLimitHeaders' => true,
        ],
    ];
}

// 需要在 User 模型中实现 RateLimitInterface
class User extends ActiveRecord implements RateLimitInterface
{
    public function getRateLimit($request, $action)
    {
        return [100, 600]; // 100次/600秒
    }

    public function loadAllowance($request, $action)
    {
        return [$this->allowance, $this->allowance_updated_at];
    }

    public function saveAllowance($request, $action, $allowance, $timestamp)
    {
        $this->allowance = $allowance;
        $this->allowance_updated_at = $timestamp;
        $this->save();
    }
}
```

### Laravel12 Throttle 中间件

```php
// 基本用法
Route::middleware('throttle:60,1')->group(function () {
    Route::apiResource('posts', PostController::class);
});

// 60次/分钟 = 60,1
// 100次/小时 = 100,60

// 动态速率限制（根据用户）
Route::middleware('throttle:rate_limit,1')->group(function () {
    // 在 User 模型中定义 rateLimit 属性
});

// 或使用闭包
Route::middleware(throttle(function (Request $request) {
    return $request->user()?->vip ? 1000 : 60;
}))->group(function () {
    // VIP 用户 1000次，普通用户 60次
});

// 按用户/IP限制
Route::middleware('throttle:60|user,1')->group(...);  // 按用户
Route::middleware('throttle:60|ip,1')->group(...);    // 按IP
```

## 缓存头对比

### Yii2 HttpCache

```php
use yii\filters\HttpCache;

public function behaviors()
{
    return [
        [
            'class' => HttpCache::class,
            'only' => ['index', 'view'],
            'lastModified' => function ($action, $params) {
                return Post::max('updated_at');
            },
            'etagSeed' => function ($action, $params) {
                return serialize(Post::all());
            },
        ],
    ];
}
```

### Laravel12 Cache Headers 中间件

```php
// 使用 cache.headers 中间件
Route::middleware('cache.headers:public;max_age=2628000;etag')->group(function () {
    Route::get('/images/{path}', [ImageController::class, 'show']);
});

// 或自定义中间件
class CacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->setEtag(md5($response->content()));
        $response->setLastModified(Post::max('updated_at'));
        $response->setPublic();
        $response->setMaxAge(3600);

        if ($response->isNotModified($request)) {
            return $response; // 304 Not Modified
        }

        return $response;
    }
}
```

## 中间件参数对比

### Yii2 过滤器参数

```php
// 通过配置数组传递参数
public function behaviors()
{
    return [
        'access' => [
            'class' => AccessControl::class,
            'only' => ['create'],
            'rules' => [
                ['allow' => true, 'roles' => ['@']],
            ],
        ],
    ];
}

// 自定义参数
class MyFilter extends ActionFilter
{
    public $param1;
    public $param2;

    public function beforeAction($action)
    {
        // 使用 $this->param1, $this->param2
        return true;
    }
}

// 配置
public function behaviors()
{
    return [
        'my' => [
            'class' => MyFilter::class,
            'param1' => 'value1',
            'param2' => 'value2',
        ],
    ];
}
```

### Laravel12 中间件参数

```php
// 中间件接收参数
class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        foreach ($roles as $role) {
            if ($request->user()->hasRole($role)) {
                return $next($request);
            }
        }
        abort(403);
    }
}

// 使用时传递参数
Route::middleware('role:admin,editor')->group(function () {
    // ...
});

// 或在控制器中
$this->middleware('role:admin,editor')->only('index');
```

## 中间件执行顺序

### Yii2 过滤器顺序

```php
// 执行顺序:
// 1. 应用主体的 behaviors()
// 2. 模块的 behaviors()
// 3. 控制器的 behaviors()

// 后过滤倒序执行
public function behaviors()
{
    return [
        'filter1' => [...],  // 先执行
        'filter2' => [...],  // 后执行
    ];
}
```

### Laravel12 中间件顺序

```php
// bootstrap/app.php 或 Kernel.php

// 全局中间件（最先执行）
protected $middleware = [
    TrustProxies::class,
    HandleCors::class,
    // ...
];

// 中间件优先级（控制冲突）
protected $middlewarePriority = [
    \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
    \Illuminate\Http\Middleware\HandleCors::class,
    \App\Http\Middleware\Authenticate::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class,
    \Illuminate\Session\Middleware\AuthenticateSession::class,
];

// 路由中间件按注册顺序执行
Route::middleware(['auth', 'verified', 'throttle'])->group(...);
```

## 终止中间件

### Yii2 后过滤

```php
public function afterAction($action, $result)
{
    // 响应生成后执行
    Log::info('Action completed');
    return $result;
}
```

### Laravel12 终止中间件

```php
class LogRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    // 响应发送到浏览器后执行
    public function terminate(Request $request, Response $response): void
    {
        Log::info('Request completed', [
            'url' => $request->fullUrl(),
            'status' => $response->status(),
        ]);
    }
}

// 注册全局中间件
// 在 bootstrap/app.php 中
$app->middleware([
    LogRequest::class,
]);
```

## 最佳实践对比

### Yii2 过滤器最佳实践

- 复杂逻辑用独立过滤器类
- 合理使用 `only` 和 `except`
- `beforeAction` 返回 `false` 终止请求
- 使用 `denyCallback` 自定义拒绝行为

### Laravel12 中间件最佳实践

- 中间件类放在 `app/Http/Middleware/`
- 使用中间件别名便于引用
- 全局中间件谨慎添加（影响性能）
- 使用终止中间件处理日志等
- 利用中间件参数传递配置
- 在路由级别而非控制器级别应用