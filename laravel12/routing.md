---
title: 路由系统
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/directory-structure
next: /laravel12/eloquent
---

# 路由系统

Laravel 路由提供了优雅的方式定义 URL 与控制器之间的映射关系。

## 基本路由

### 路由文件

Laravel 路由定义在 `routes/` 目录：

| 文件 | 用途 |
|------|------|
| `routes/web.php` | Web 界面路由 |
| `routes/api.php` | API 路由（自动添加 `/api` 前缀） |
| `routes/console.php` | 命令行路由 |
| `routes/channels.php` | 广播频道路由 |

### 基本定义

```php
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// 基础 GET 路由
Route::get('/', function () {
    return view('welcome');
});

// 返回字符串
Route::get('/hello', fn() => 'Hello World');

// 返回视图
Route::view('/about', 'pages.about', ['title' => '关于我们']);

// 控制器路由
Route::get('/users', [UserController::class, 'index']);

// 可调用控制器（单一动作）
Route::get('/dashboard', DashboardController::class);
```

## HTTP 方法

```php
// GET 请求
Route::get('/posts', [PostController::class, 'index']);

// POST 请求
Route::post('/posts', [PostController::class, 'store']);

// PUT 请求（完整更新）
Route::put('/posts/{id}', [PostController::class, 'update']);

// PATCH 请求（部分更新）
Route::patch('/posts/{id}', [PostController::class, 'updatePartial']);

// DELETE 请求
Route::delete('/posts/{id}', [PostController::class, 'destroy']);

// OPTIONS 请求
Route::options('/posts', [PostController::class, 'options']);

// 匹配多个方法
Route::match(['get', 'post'], '/posts/create', [PostController::class, 'create']);

// 匹配所有方法
Route::any('/catch-all', [CatchAllController::class, 'handle']);
```

## 路由参数

### 必需参数

```php
// 单个参数
Route::get('/users/{id}', function (string $id) {
    return "User ID: {$id}";
});

// 多个参数
Route::get('/users/{userId}/posts/{postId}', function (string $userId, string $postId) {
    return "User: {$userId}, Post: {$postId}";
});

// 控制器接收参数
Route::get('/users/{id}', [UserController::class, 'show']);

// 控制器方法
public function show(string $id)
{
    $user = User::findOrFail($id);
    return view('users.show', compact('user'));
}
```

### 可选参数

```php
// 可选参数（带默认值）
Route::get('/posts/{category?}', function (?string $category = 'all') {
    return "Category: {$category}";
});
```

### 参数约束

```php
// 正则约束
Route::get('/users/{id}', function (string $id) {
    return "User: {$id}";
})->where('id', '[0-9]+');

// 多个约束
Route::get('/posts/{category}/{slug}', function (string $category, string $slug) {
    return "Category: {$category}, Slug: {$slug}";
})->where(['category' => '[a-z]+', 'slug' => '[a-z0-9-]+']);

// 辅助方法
Route::get('/users/{id}', fn(int $id) => $id)->whereNumber('id');
Route::get('/users/{name}', fn(string $name) => $name)->whereAlpha('name');
Route::get('/users/{slug}', fn(string $slug) => $slug)->whereAlphaNumeric('slug');
Route::get('/users/{uuid}', fn(string $uuid) => $uuid)->whereUuid('uuid');
Route::get('/users/{ulid}', fn(string $ulid) => $ulid)->whereUlid('ulid');
```

### 全局约束

```php
// RouteServiceProvider 中定义
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
    Route::pattern('slug', '[a-z0-9-]+');
}
```

## 命名路由

```php
// 定义命名路由
Route::get('/users/profile', [UserController::class, 'profile'])
    ->name('user.profile');

// 生成 URL
$url = route('user.profile');

// 带参数
Route::get('/users/{id}', [UserController::class, 'show'])
    ->name('users.show');

$url = route('users.show', ['id' => 1]);
$url = route('users.show', $user);  // 路由模型绑定

// 检查当前路由
if (request()->routeIs('users.*')) {
    // 匹配 users.show, users.index 等
}
```

## 路由分组

### 中间件分组

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/profile', [ProfileController::class, 'edit']);
});
```

### 命名空间分组

```php
use App\Http\Controllers\Admin;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', Admin\UserController::class);
    Route::resource('posts', Admin\PostController::class);
});
// 生成路由: admin.users.index, admin.posts.store 等
```

### 路由前缀

```php
// 路径前缀
Route::prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    // URL: /admin/users
});

// 名称前缀
Route::name('admin.')->group(function () {
    Route::get('/users', [AdminController::class, 'users'])
        ->name('users');
    // 路由名: admin.users
});

// 组合使用
Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])
        ->name('dashboard');
    // URL: /admin/dashboard, Name: admin.dashboard
});
```

### 域名分组

```php
// 子域名路由
Route::domain('{account}.myapp.com')->group(function () {
    Route::get('/', function (string $account) {
        return "Account: {$account}";
    });
});

// 固定子域名
Route::domain('admin.myapp.com')->group(function () {
    Route::get('/', [AdminController::class, 'index']);
});
```

## 资源路由

### 基本资源路由

```php
// 创建资源路由
Route::resource('posts', PostController::class);

// 自动生成以下路由：
// GET    /posts              -> index()   -> posts.index
// GET    /posts/create       -> create()  -> posts.create
// POST   /posts              -> store()   -> posts.store
// GET    /posts/{post}       -> show()    -> posts.show
// GET    /posts/{post}/edit  -> edit()    -> posts.edit
// PUT    /posts/{post}       -> update()  -> posts.update
// DELETE /posts/{post}       -> destroy() -> posts.destroy
```

### 部分资源路由

```php
// 仅指定方法
Route::resource('posts', PostController::class)->only([
    'index', 'show'
]);

// 排除方法
Route::resource('posts', PostController::class)->except([
    'create', 'store', 'edit', 'update', 'destroy'
]);
```

### API 资源路由

```php
// API 资源（无 create/edit 页面路由）
Route::apiResource('posts', PostController::class);

// 生成：
// GET    /posts        -> index()
// POST   /posts        -> store()
// GET    /posts/{post} -> show()
// PUT    /posts/{post} -> update()
// DELETE /posts/{post} -> destroy()
```

### 嵌套资源路由

```php
// 嵌套资源
Route::resource('posts.comments', CommentController::class);
// URL: /posts/{post}/comments/{comment}

// 浅层嵌套（避免过深 URL）
Route::shallow()->name('posts.comments.')->group(function () {
    Route::resource('posts.comments', CommentController::class);
});
// index/create: /posts/{post}/comments
// show/update/destroy: /comments/{comment}
```

### 资源参数名称

```php
Route::resource('posts', PostController::class)
    ->parameter('posts', 'post');

// 路由参数从 {posts} 变为 {post}
```

## 路由模型绑定

### 隐式绑定

```php
// 路由定义
Route::get('/users/{user}', function (User $user) {
    return $user;
});

// 自动查询 users 表，找不到返回 404
```

### 自定义键名

```php
// 使用 slug 而非 id
Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});

// 或在模型中定义
class Post extends Model
{
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
```

### 显式绑定

```php
// RouteServiceProvider 中定义
public function boot(): void
{
    Route::model('user', User::class);
    Route::bind('post', fn(string $value) => Post::where('slug', $value)->firstOrFail());
}
```

### 软删除模型

```php
// 包含软删除记录
Route::get('/posts/{post}', function (Post $post) {
    return $post;
})->withTrashed();
```

## 回退路由

```php
// 404 回退路由（必须放在最后）
Route::fallback(function () {
    return view('errors.404');
})->name('fallback');
```

## 重定向路由

```php
// 基本重定向
Route::redirect('/old-url', '/new-url');

// 自定义状态码
Route::redirect('/old-url', '/new-url', 301);

// 永久重定向
Route::permanentRedirect('/old-url', '/new-url');

// 重定向到命名路由
Route::redirect('/old-posts', '/posts');
```

## 路由中间件

```php
// 单个中间件
Route::get('/profile', [ProfileController::class, 'edit'])
    ->middleware('auth');

// 多个中间件
Route::get('/admin', [AdminController::class, 'index'])
    ->middleware(['auth', 'admin', 'verified']);

// 中间件组
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('posts', PostController::class);
});

// 排除中间件
Route::get('/public', [Controller::class, 'public'])
    ->middleware('auth')
    ->withoutMiddleware('throttle');
```

## 路由限制（Rate Limiting）

```php
// 基本限流
Route::middleware('throttle:60,1')->group(function () {
    // 每分钟 60 次
});

// 按用户限流
Route::middleware('throttle:60|user,1')->group(function () {
    // 每用户每分钟 60 次
});

// 动态限流
Route::middleware(throttle(function (Request $request) {
    return $request->user()?->vip ? 1000 : 60;
}))->group(function () {
    // VIP 用户 1000 次，普通用户 60 次
});
```

## 跨域资源共享（CORS）

```php
// config/cors.php 配置
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://example.com'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

## 路由签名 URL

```php
// 生成签名 URL（防止篡改）
use Illuminate\Support\Facades\URL;

$url = URL::signedRoute('unsubscribe', ['user' => 1]);
$ temporaryUrl = URL::temporarySignedRoute('unsubscribe', now()->addHours(24), ['user' => 1]);

// 验证签名路由
Route::get('/unsubscribe/{user}', function (Request $request, User $user) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }
    // 处理取消订阅
})->name('unsubscribe');

// 或使用中间件
Route::get('/unsubscribe/{user}', function (User $user) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

## 路由缓存

```bash
# 缓存路由（生产环境）
php artisan route:cache

# 清除路由缓存
php artisan route:clear

# 查看所有路由
php artisan route:list

# 过滤路由
php artisan route:list --path=posts
php artisan route:list --name=post
php artisan route:list --method=GET

# JSON 输出
php artisan route:list --json
```

## 子域名路由

```php
// 子域名参数
Route::domain('{tenant}.myapp.com')->group(function () {
    Route::get('/', function (string $tenant) {
        return "Tenant: {$tenant}";
    });

    Route::get('/users', function (string $tenant) {
        // 获取租户用户
    });
});
```

## 路由属性（PHP 8）

```php
use App\Http\Controllers\PostController;
use Illuminate\Routing\Attributes\Get;
use Illuminate\Routing\Attributes\Post;
use Illuminate\Routing\Attributes\Middleware;
use Illuminate\Routing\Attributes\Route;

#[Route('/posts')]
#[Middleware('auth')]
class PostController extends Controller
{
    #[Get('/', name: 'posts.index')]
    public function index()
    {
        // ...
    }

    #[Post('/', name: 'posts.store')]
    public function store()
    {
        // ...
    }

    #[Get('/{post}', name: 'posts.show')]
    public function show(Post $post)
    {
        // ...
    }
}
```

## 最佳实践

### 1. 使用命名路由

```php
// 错误：硬编码 URL
return redirect('/users/profile');

// 正确：使用命名路由
return redirect()->route('users.profile');
```

### 2. 合理分组

```php
// 相关路由分组
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::resource('users', Admin\UserController::class);
    Route::resource('posts', Admin\PostController::class);
    Route::resource('settings', Admin\SettingController::class)->only(['index', 'update']);
});
```

### 3. 使用路由模型绑定

```php
// 错误
Route::get('/posts/{id}', function ($id) {
    $post = Post::findOrFail($id);
    return view('posts.show', compact('post'));
});

// 正确
Route::get('/posts/{post}', function (Post $post) {
    return view('posts.show', compact('post'));
});
```

### 4. API 路由版本控制

```php
Route::prefix('api/v1')->group(function () {
    Route::apiResource('posts', Api\V1\PostController::class);
});

Route::prefix('api/v2')->group(function () {
    Route::apiResource('posts', Api\V2\PostController::class);
});
```