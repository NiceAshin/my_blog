---
title: 路由对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/views-comparison
next: /laravel12/middleware-comparison
---

# 路由对比

## 路由系统对比

Yii2 使用 URL Manager 配置路由规则，Laravel12 使用独立路由文件定义路由，更加直观和灵活。

### Yii2 路由配置

```php
// config/web.php
'urlManager' => [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
        // 基本规则
        'posts' => 'post/index',
        'post/<id:\d+>' => 'post/view',

        // 正则规则
        [
            'pattern' => 'post/<year:\d{4}>/<month:\d{2}>',
            'route' => 'post/archive',
        ],

        // RESTful 规则
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => 'post',
        ],
    ],
],

// 路由格式: ControllerID/ActionID
// URL: /post/view?id=1 或 /post/1 (美化后)
```

### Laravel12 路由定义

```php
// routes/web.php
use App\Http\Controllers\PostController;

// 基本路由
Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::get('/posts/{id}', [PostController::class, 'show'])->name('posts.show');

// 参数约束
Route::get('/posts/{year}/{month}', [PostController::class, 'archive'])
    ->where(['year' => '[0-9]{4}', 'month' => '[0-9]{2}']);

// RESTful 资源路由
Route::resource('posts', PostController::class);
// 自动生成: index, create, store, show, edit, update, destroy
```

## 关键差异对比表

| 特性 | Yii2 | Laravel12 |
|------|------|-----------|
| 配置位置 | `config/web.php` | `routes/*.php` 文件 |
| 路由定义 | 规则数组 | 直接方法调用 |
| HTTP 方法 | 规则中指定或 VerbFilter | `Route::get/post/put/delete` |
| 路径参数 | `<param:regex>` | `{param}` + `where()` |
| 命名路由 | 规则中指定 | `->name('route.name')` |
| 路由分组 | 模块或配置 | `Route::group()` |
| 中间件 | `behaviors()` | `->middleware()` |
| RESTful | `yii\rest\UrlRule` | `Route::resource()` |
| 路由缓存 | 无内置 | `php artisan route:cache` |

## 基本路由定义

### Yii2 基本路由

```php
'urlManager' => [
    'rules' => [
        // 简单规则
        '' => 'site/index',                    // 首页
        'about' => 'site/about',               // 静态页面
        'contact' => 'site/contact',

        // 带参数
        'user/<id:\d+>' => 'user/view',
        'category/<slug>' => 'category/view',

        // 带可选参数
        'search/<keyword>' => 'search/index',  // keyword 可选
    ],
],
```

### Laravel12 基本路由

```php
// routes/web.php

// 简单路由
Route::get('/', [SiteController::class, 'index'])->name('home');
Route::get('/about', [SiteController::class, 'about']);
Route::get('/contact', [SiteController::class, 'contact']);

// 带参数
Route::get('/user/{id}', [UserController::class, 'show']);
Route::get('/category/{slug}', [CategoryController::class, 'show']);

// 可选参数
Route::get('/search/{keyword?}', [SearchController::class, 'index']);

// 多参数
Route::get('/user/{userId}/post/{postId}', [PostController::class, 'show']);
```

## HTTP 方法路由

### Yii2 HTTP 方法（VerbFilter）

```php
// 在控制器中通过 VerbFilter 限制
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

// URL Manager 中不区分方法
'urlManager' => [
    'rules' => [
        'post/create' => 'post/create',
    ],
],
```

### Laravel12 HTTP 方法路由

```php
// 直接在路由中定义方法
Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::put('/posts/{id}', [PostController::class, 'update']);
Route::patch('/posts/{id}', [PostController::class, 'update']);
Route::delete('/posts/{id}', [PostController::class, 'destroy']);

// match 多方法
Route::match(['get', 'post'], '/posts/create', [PostController::class, 'create']);

// any 所有方法
Route::any('/api/test', [ApiController::class, 'test']);
```

## 参数约束

### Yii2 参数约束

```php
'urlManager' => [
    'rules' => [
        // 数字参数
        'post/<id:\d+>' => 'post/view',

        // 正则参数
        'post/<slug:[a-z0-9-]+>' => 'post/view-by-slug',

        // 年月参数
        'archive/<year:\d{4}>/<month:\d{2}>' => 'post/archive',

        // 可选参数（默认值在控制器中处理）
        'post/<id:\d+>/<action>' => 'post/action',
    ],
],
```

### Laravel12 参数约束

```php
// where 方法
Route::get('/post/{id}', [PostController::class, 'show'])
    ->where('id', '[0-9]+');

Route::get('/post/{slug}', [PostController::class, 'showBySlug'])
    ->where('slug', '[a-z0-9-]+');

Route::get('/archive/{year}/{month}', [PostController::class, 'archive'])
    ->where(['year' => '[0-9]{4}', 'month' => '[0-9]{2}']);

// 全局约束（在 RouteServiceProvider 中）
Route::pattern('id', '[0-9]+');
// 之后所有 {id} 参数都使用此约束

// 正则辅助方法
Route::get('/user/{id}', fn($id) => $id)
    ->whereNumber('id'); // 只允许数字

Route::get('/user/{name}', fn($name) => $name)
    ->whereAlpha('name'); // 只允许字母

Route::get('/user/{slug}', fn($slug) => $slug)
    ->whereAlphaNumeric('slug'); // 字母和数字
```

## 资源路由（RESTful）

### Yii2 RESTful

```php
'urlManager' => [
    'rules' => [
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => 'post',
            // 自动生成:
            // GET /posts          -> post/index
            // GET /posts/{id}     -> post/view
            // POST /posts         -> post/create
            // PUT /posts/{id}     -> post/update
            // DELETE /posts/{id}  -> post/delete
        ],
    ],
],

// 或手动定义
'urlManager' => [
    'rules' => [
        'posts' => 'post/index',
        'posts/<id:\d+>' => 'post/view',
        'posts/<id:\d+>/edit' => 'post/update',
    ],
],
```

### Laravel12 资源路由

```php
// 基本资源路由
Route::resource('posts', PostController::class);

// 自动生成以下路由:
// GET    /posts           -> index    -> posts.index
// GET    /posts/create    -> create   -> posts.create
// POST   /posts           -> store    -> posts.store
// GET    /posts/{id}      -> show     -> posts.show
// GET    /posts/{id}/edit -> edit     -> posts.edit
// PUT    /posts/{id}      -> update   -> posts.update
// DELETE /posts/{id}      -> destroy  -> posts.destroy

// 部分资源路由
Route::resource('posts', PostController::class)->only([
    'index', 'show'
]);

Route::resource('posts', PostController::class)->except([
    'create', 'store', 'edit', 'update', 'destroy'
]);

// API 资源路由（无 create/edit 页面路由）
Route::apiResource('posts', PostController::class);
// 只生成: index, store, show, update, destroy

// 嵌套资源路由
Route::resource('posts.comments', PostCommentController::class);
// URL: /posts/{postId}/comments/{commentId}
```

## 路由分组

### Yii2 路由分组（模块）

```php
// 通过模块实现分组
// 配置模块
'modules' => [
    'admin' => [
        'class' => 'app\modules\admin\Module',
    ],
],

// URL: /admin/post/index
// 控制器: app\modules\admin\controllers\PostController

// 或在 urlManager 中批量配置
'urlManager' => [
    'rules' => [
        // 分组前缀
        [
            'class' => 'yii\web\GroupUrlRule',
            'prefix' => 'admin',
            'rules' => [
                'post' => 'post/index',
                'post/<id:\d+>' => 'post/view',
            ],
        ],
    ],
],
```

### Laravel12 路由分组

```php
// 基本分组
Route::group(['prefix' => 'admin'], function () {
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::get('/users', [AdminController::class, 'users']);
});

// 分组属性
Route::group([
    'prefix' => 'admin',
    'middleware' => ['auth', 'admin'],
    'namespace' => 'App\Http\Controllers\Admin',
    'name' => 'admin.',
], function () {
    Route::get('/posts', [PostController::class, 'index'])
        ->name('posts.index'); // 完整名称: admin.posts.index
});

// 简化写法
Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/posts', [PostController::class, 'index']);
});

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('posts', PostController::class);
});

// 嵌套分组
Route::prefix('admin')->group(function () {
    Route::prefix('v1')->group(function () {
        Route::get('/posts', [PostController::class, 'index']);
    });
});
```

## 命名路由

### Yii2 命名路由

```php
'urlManager' => [
    'rules' => [
        [
            'pattern' => 'post/<id:\d+>',
            'route' => 'post/view',
            'name' => 'post-view', // 自定义名称（非标准用法）
        ],
    ],
],

// URL 创建
$url = Url::to(['post/view', 'id' => 1]);
$url = Url::toRoute(['post/view', 'id' => 1]);
```

### Laravel12 命名路由

```php
// 定义命名路由
Route::get('/posts/{id}', [PostController::class, 'show'])
    ->name('posts.show');

// 使用命名路由生成 URL
$url = route('posts.show', ['id' => 1]);
$url = route('posts.show', $post); // 路由模型绑定
$url = route('posts.show', ['id' => 1, 'page' => 2]);

// 在视图中
<a href="{{ route('posts.show', $post->id) }}">查看</a>

// 重定向到命名路由
return redirect()->route('posts.show', $post->id);

// 检查当前路由
if (request()->routeIs('posts.*')) {
    // 匹配 posts.show, posts.index 等
}

if (request()->routeIs('posts.show')) {
    // 精确匹配
}
```

## 路由中间件

### Yii2 路由过滤器

```php
// 在控制器 behaviors 中定义
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
    ];
}

// 或在模块/应用配置中
'as access' => [
    'class' => AccessControl::class,
    'rules' => [
        ['allow' => true, 'roles' => ['@']],
    ],
],
```

### Laravel12 路由中间件

```php
// 单个路由
Route::get('/posts/{id}', [PostController::class, 'edit'])
    ->middleware('auth');

// 多个中间件
Route::get('/admin/posts', [AdminController::class, 'posts'])
    ->middleware(['auth', 'admin', 'verified']);

// 中间件分组
Route::group(['middleware' => ['auth', 'admin']], function () {
    Route::resource('posts', PostController::class);
});

// 排除中间件
Route::get('/posts', [PostController::class, 'index'])
    ->middleware('auth')
    ->withoutMiddleware('throttle');

// 在控制器构造函数中
public function __construct()
{
    $this->middleware('auth')->except('index', 'show');
    $this->middleware('can:update,post')->only('edit', 'update');
}
```

## 路由模型绑定

### Yii2 获取模型

```php
public function actionView($id)
{
    $model = Post::findOne($id);
    if ($model === null) {
        throw new NotFoundHttpException;
    }
    return $this->render('view', ['model' => $model]);
}

// 或在 beforeAction 中预加载
```

### Laravel12 路由模型绑定

```php
// 自动绑定（默认按 id）
Route::get('/posts/{post}', [PostController::class, 'show']);

// 控制器中直接接收模型实例
public function show(Post $post)
{
    // 自动查询，找不到抛出 404
    return view('post.show', compact('post'));
}

// 自定义绑定键（如 slug）
Route::get('/posts/{post:slug}', [PostController::class, 'show']);
// 或全局定义
// RouteServiceProvider 中
Route::model('post', Post::class, fn($value) => Post::where('slug', $value)->firstOrFail());

// 自定义键名（在模型中）
class Post extends Model
{
    public function getRouteKeyName()
    {
        return 'slug';
    }
}

// 软删除模型
Route::get('/posts/{post}', [PostController::class, 'show'])
    ->withTrashed(); // 包含软删除的记录
```

## 视图路由

### Yii2 静态视图

```php
// 使用 ViewAction
public function actions()
{
    return [
        'page' => [
            'class' => ViewAction::class,
        ],
    ];
}

// URL: /site/page?view=about
// 视图文件: views/site/pages/about.php
```

### Laravel12 视图路由

```php
// 直接返回视图
Route::view('/about', 'pages.about');
Route::view('/contact', 'pages.contact', ['title' => '联系我们']);

// 或使用闭包
Route::get('/welcome', function () {
    return view('welcome');
});
```

## 重定向路由

### Yii2 重定向

```php
// 在控制器中
return $this->redirect(['post/view', 'id' => 1]);
return $this->redirect('https://example.com');

// 在 URL 规则中
'urlManager' => [
    'rules' => [
        [
            'pattern' => 'old-url',
            'route' => 'post/view',
            'suffix' => false,
        ],
    ],
],
```

### Laravel12 重定向路由

```php
// 重定向到路径
Route::redirect('/old-url', '/new-url');
Route::redirect('/old-url', '/new-url', 301); // 自定义状态码

// 重定向到命名路由
Route::redirect('/old-posts', '/posts');
Route::redirectToRoute('posts.index');

// 重定向到外部 URL
Route::redirect('/external', 'https://example.com');

// 永久重定向（301）
Route::permanentRedirect('/old', '/new');
```

## API 路由

### Yii2 API 路由

```php
// config/main.php (API 应用配置)
'urlManager' => [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => ['post', 'comment'],
        ],
    ],
],

// 响应格式
'response' => [
    'format' => Response::FORMAT_JSON,
],
```

### Laravel12 API 路由

```php
// routes/api.php
use App\Http\Controllers\Api\PostController;

// 路由组（自动添加 /api 前缀）
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('posts', PostController::class);
    Route::apiResource('comments', CommentController::class);
});

// 或自定义
Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
});
```

## 路由缓存

### Yii2 路由缓存

```php
'urlManager' => [
    'enablePrettyUrl' => true,
    'cache' => 'cache', // 使用缓存组件
    'rules' => [...],
],
```

### Laravel12 路由缓存

```bash
# 缓存路由（生产环境）
php artisan route:cache

# 清除路由缓存
php artisan route:clear

# 查看所有路由
php artisan route:list
php artisan route:list --path=posts
php artisan route:list --except-vendor
```

## 路由调试

### Yii2 路由调试

```php
// 开启调试模式查看路由匹配
// Gii 模块提供路由管理

// 获取当前路由
$route = Yii::$app->requestedRoute;
$action = Yii::$app->controller->action->id;
```

### Laravel12 路由调试

```bash
# 查看所有路由
php artisan route:list

# 过滤特定路由
php artisan route:list --name=post
php artisan route:list --path=post
php artisan route:list --method=GET

# JSON 输出
php artisan route:list --json
```

```php
// 代码中获取路由信息
$route = Route::current();
$name = Route::currentRouteName();
$action = Route::currentRouteAction();
```

## 最佳实践对比

### Yii2 路由最佳实践

- 使用 `enablePrettyUrl` 开启美化 URL
- 配置 `rules` 数组定义路由规则
- 使用 RESTful 规则处理 API
- 合理使用 VerbFilter 控制方法

### Laravel12 路由最佳实践

- 使用命名路由便于维护
- 使用路由分组组织相关路由
- 使用路由模型绑定简化代码
- 生产环境使用路由缓存
- API 路由放在 `routes/api.php`
- 使用 `php artisan route:list` 查看路由