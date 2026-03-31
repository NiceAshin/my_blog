---
title: 目录结构
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/installation
next: /laravel12/routing
---

# 目录结构

Laravel 项目有清晰的目录结构，遵循"约定优于配置"原则。

## 根目录概览

```
my-app/
├── app/                  # 应用核心代码
├── bootstrap/            # 框架引导文件
├── config/               # 配置文件
├── database/             # 数据库相关
├── public/               # Web 入口
├── resources/            # 视图、前端资源
├── routes/               # 路由定义
├── storage/              # 存储目录
├── tests/                # 测试文件
├── vendor/               # Composer 依赖
├── .env                  # 环境配置
├── artisan               # 命令行工具
├── composer.json         # PHP 依赖配置
├── package.json          # Node 依赖配置
└── vite.config.js        # Vite 配置
```

## app/ 目录

应用核心代码所在，包含业务逻辑：

```
app/
├── Console/              # Artisan 命令
│   └── Commands/         # 自定义命令
├── Exceptions/           # 异常处理
│   └── Handler.php       # 全局异常处理器
├── Http/                 # HTTP 层
│   ├── Controllers/      # 控制器
│   ├── Middleware/       # 中间件
│   ├── Requests/         # 表单请求验证
│   └── Kernel.php        # HTTP 内核
├── Models/               # Eloquent 模型
├── Providers/            # 服务提供者
│   ├── AppServiceProvider.php
│   ├── AuthServiceProvider.php
│   ├── EventServiceProvider.php
│   └── RouteServiceProvider.php
├── Policies/             # 授权策略
├── Services/             # 业务服务类
└── Helpers.php           # 辅助函数
```

### Models 目录

```php
// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime'];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

### Http 目录

```
app/Http/
├── Controllers/          # 控制器
│   ├── Controller.php    # 基础控制器
│   └── Api/              # API 控制器
├── Middleware/           # 中间件
│   ├── Authenticate.php
│   ├── EncryptCookies.php
│   ├── PreventRequestsDuringMaintenance.php
│   ├── RedirectIfAuthenticated.php
│   ├── TrimStrings.php
│   ├── TrustHosts.php
│   ├── TrustProxies.php
│   ├── ValidateSignature.php
│   └── VerifyCsrfToken.php
├── Requests/             # 表单请求
│   └── StorePostRequest.php
└── Kernel.php            # 中间件配置
```

### Services 目录（推荐创建）

```php
// app/Services/PaymentService.php
namespace App\Services;

use App\Models\Order;
use App\Contracts\PaymentGateway;

class PaymentService
{
    public function __construct(
        private PaymentGateway $gateway
    ) {}

    public function process(Order $order): bool
    {
        return $this->gateway->charge(
            $order->amount,
            $order->user->payment_method
        );
    }
}
```

## bootstrap/ 目录

框架启动引导文件：

```
bootstrap/
├── app.php               # 应用实例创建
├── cache/                # 框架缓存
│   └── services.php      # 服务缓存
└── providers.php         # 服务提供者列表
```

### bootstrap/app.php

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\MyMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

## config/ 目录

所有配置文件：

```
config/
├── app.php               # 应用配置
├── auth.php              # 认证配置
├── broadcasting.php      # 广播配置
├── cache.php             # 缓存配置
├── cors.php              # CORS 配置
├── database.php          # 数据库配置
├── filesystems.php       # 文件系统配置
├── hashing.php           # 哈希配置
├── logging.php           # 日志配置
├── mail.php              # 邮件配置
├── queue.php             # 队列配置
├── sanctum.php           # API 认证配置
├── services.php          # 第三方服务配置
├── session.php           # Session 配置
└── view.php              # 视图配置
```

## database/ 目录

数据库相关文件：

```
database/
├── factories/            # 模型工厂
│   └── UserFactory.php
├── migrations/           # 数据库迁移
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   └── 0001_01_01_000002_create_jobs_table.php
└── seeders/              # 数据填充
    └── DatabaseSeeder.php
```

### 迁移示例

```php
// database/migrations/2026_01_01_create_posts_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->fullText('content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
```

### 模型工厂

```php
// database/factories/PostFactory.php
namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(5, true),
            'status' => fake()->randomElement(['draft', 'published']),
            'published_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function published(): static
    {
        return $this->state(fn() => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
```

## public/ 目录

Web 入口目录，唯一对外暴露的目录：

```
public/
├── index.php             # 入口文件
├── .htaccess             # Apache 配置
├── favicon.ico           # 网站图标
└── build/                # 编译后的前端资源
```

### public/index.php

```php
<?php

// 注册自动加载
require __DIR__.'/../vendor/autoload.php';

// 运行应用
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Illuminate\Http\Request::capture());
```

## resources/ 目录

前端资源和视图：

```
resources/
├── css/                  # CSS 文件
│   └── app.css
├── js/                   # JavaScript 文件
│   ├── app.js
│   └── components/       # Vue/React 组件
├── views/                # Blade 视图
│   ├── layouts/          # 布局模板
│   │   └── app.blade.php
│   ├── components/       # 视图组件
│   │   └── alert.blade.php
│   └── welcome.blade.php
└── lang/                 # 语言文件
    ├── en/
    └── zh_CN/
```

### 视图结构

```
resources/views/
├── layouts/
│   ├── app.blade.php     # 主布局
│   └── admin.blade.php   # 后台布局
├── partials/
│   ├── header.blade.php
│   ├── footer.blade.php
│   └── sidebar.blade.php
├── components/
│   ├── alert.blade.php
│   ├── button.blade.php
│   └── card.blade.php
├── posts/
│   ├── index.blade.php
│   ├── show.blade.php
│   ├── create.blade.php
│   └── edit.blade.php
└── errors/
    └── 404.blade.php
```

## routes/ 目录

路由定义：

```
routes/
├── web.php               # Web 路由
├── api.php               # API 路由
├── console.php           # 命令路由
└── channels.php          # 广播频道
```

### routes/web.php

```php
<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;

// 首页
Route::get('/', function () {
    return view('welcome');
})->name('home');

// 资源路由
Route::resource('posts', PostController::class);

// 路由组
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/analytics', [DashboardController::class, 'analytics']);
    });
});
```

## storage/ 目录

文件存储：

```
storage/
├── app/                  # 应用文件
│   ├── public/           # 公开文件
│   │   └── .gitignore
│   └── private/          # 私有文件
├── framework/            # 框架缓存
│   ├── cache/            # 缓存文件
│   ├── sessions/         # Session 文件
│   └── views/            # 编译视图
└── logs/                 # 日志文件
    └── laravel.log
```

### 文件存储配置

```php
// config/filesystems.php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'throw' => false,
    ],

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],

    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
        'throw' => false,
    ],
],
```

## tests/ 目录

测试文件：

```
tests/
├── Feature/              # 功能测试
│   ├── AuthenticationTest.php
│   └── PostTest.php
├── Unit/                 # 单元测试
│   └── ExampleTest.php
├── Pest.php              # Pest 配置
└── TestCase.php          # 测试基类
```

### 功能测试示例

```php
// tests/Feature/PostTest.php
namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Tests\TestCase;

class PostTest extends TestCase
{
    public function test_guest_can_view_posts(): void
    {
        $post = Post::factory()->create();

        $response = $this->get(route('posts.show', $post));

        $response->assertStatus(200);
        $response->assertSee($post->title);
    }

    public function test_authenticated_user_can_create_post(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('posts.store'), [
                'title' => 'Test Post',
                'content' => 'Test content',
            ]);

        $response->assertRedirect(route('posts.index'));
        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post',
            'user_id' => $user->id,
        ]);
    }
}
```

## vendor/ 目录

Composer 管理的依赖包，**不要手动修改**。

## 自定义目录结构

### DDD 风格结构

```
app/
├── Domain/               # 领域层
│   ├── User/
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Repositories/
│   │   └── Services/
│   └── Post/
├── Application/          # 应用层
│   ├── UseCases/
│   └── DTOs/
├── Infrastructure/       # 基础设施层
│   ├── Persistence/
│   └── External/
└── Presentation/         # 表现层
    ├── Http/
    └── Api/
```

## 目录命名规范

| 目录 | 命名规则 | 示例 |
|------|----------|------|
| 控制器 | PascalCase | `PostController.php` |
| 模型 | 单数 PascalCase | `User.php` |
| 中间件 | PascalCase | `Authenticate.php` |
| 迁移 | 蛇形命名 | `2026_01_01_create_posts_table.php` |
| 视图 | 蛇形命名 | `post_index.blade.php` |
| 配置 | 蛇形命名 | `database.php` |

## 最佳实践

### 1. 保持目录整洁

```php
// 不要在控制器中写太多逻辑
// 错误
public function store(Request $request)
{
    $data = $request->validate([...]);
    $post = Post::create($data);
    $post->tags()->sync($request->tags);
    event(new PostCreated($post));
    Mail::to($post->user)->send(new PostPublished($post));
    return redirect()->route('posts.show', $post);
}

// 正确：使用服务类
public function store(StorePostRequest $request, PostService $service)
{
    $post = $service->create($request->validated());
    return redirect()->route('posts.show', $post);
}
```

### 2. 合理使用目录

```php
// 复杂业务放 Services
app/Services/

// 数据转换放 DTOs
app/DTOs/

// 枚举放 Enums
app/Enums/

// 接口放 Contracts
app/Contracts/

// Traits 放 Concerns 或 Traits
app/Concerns/
```

### 3. 自动加载配置

```json
// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    }
}
```