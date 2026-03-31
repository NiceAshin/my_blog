---
title: 控制器对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/
next: /laravel12/models-comparison
---

# 控制器对比

## 基本结构对比

### Yii2 控制器

```php
namespace app\controllers;

use Yii;
use yii\web\Controller;

class PostController extends Controller
{
    // 默认动作
    public $defaultAction = 'index';

    // 动作方法以 action 开头
    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionView($id)
    {
        $model = Post::findOne($id);
        if ($model === null) {
            throw new NotFoundHttpException;
        }
        return $this->render('view', ['model' => $model]);
    }

    public function actionCreate()
    {
        $model = new Post();
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        }
        return $this->render('create', ['model' => $model]);
    }
}
```

### Laravel12 控制器

```php
namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PostController extends Controller
{
    // 动作方法不需要特殊前缀
    public function index()
    {
        return view('post.index');
    }

    public function show($id)
    {
        $post = Post::findOrFail($id); // 自动抛出 404
        return view('post.show', compact('post'));
    }

    public function create()
    {
        return view('post.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);

        $post = Post::create($validated);
        return redirect()->route('post.show', $post->id);
    }
}
```

## 关键差异对比表

| 特性 | Yii2 | Laravel12 |
|------|------|-----------|
| 命名空间 | `app\controllers` | `App\Http\Controllers` |
| 基类 | `yii\web\Controller` | `Illuminate\Routing\Controller` |
| 动作方法名 | `actionXxx()` | 直接用方法名 `xxx()` |
| 默认动作 | `$defaultAction` 属性 | 路由中定义 |
| 渲染视图 | `$this->render()` | `view()` 全局函数 |
| 获取请求 | `Yii::$app->request` | 注入 `Request` 对象 |
| 重定向 | `$this->redirect()` | `redirect()` 函数 |
| 404处理 | `throw NotFoundHttpException` | `findOrFail()` 或 `abort(404)` |

## 路由定义对比

### Yii2 路由（URL管理器配置）

```php
// config/web.php
'urlManager' => [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
        'post/<id:\d+>' => 'post/view',
        'posts' => 'post/index',
    ],
],

// URL 格式: /post/view?id=1 或 /post/1
```

### Laravel12 路由（routes/web.php）

```php
use App\Http\Controllers\PostController;

// 直接定义路由
Route::get('/posts', [PostController::class, 'index'])->name('post.index');
Route::get('/posts/{id}', [PostController::class, 'show'])->name('post.show');
Route::get('/posts/create', [PostController::class, 'create'])->name('post.create');
Route::post('/posts', [PostController::class, 'store'])->name('post.store');

// 资源路由（类似 Yii2 CRUD）
Route::resource('posts', PostController::class);
// 自动生成: index, create, store, show, edit, update, destroy

// 路由组
Route::middleware(['auth'])->group(function () {
    Route::resource('posts', PostController::class);
});
```

## 请求处理对比

### Yii2 获取请求参数

```php
// GET 参数
$id = Yii::$app->request->get('id');
$allParams = Yii::$app->request->queryParams;

// POST 数据
$postData = Yii::$app->request->post();
$title = Yii::$app->request->post('title');

// 请求方法
$method = Yii::$app->request->method;
$isPost = Yii::$app->request->isPost;

// 请求体（JSON）
$data = Yii::$app->request->bodyParams;
```

### Laravel12 获取请求参数

```php
public function store(Request $request)
{
    // GET/POST 参数
    $id = $request->input('id');
    $allParams = $request->all();

    // 仅 GET 参数
    $queryParams = $request->query();

    // 仅 POST 数据
    $postData = $request->post();

    // 请求方法
    $method = $request->method();
    $isPost = $request->isMethod('post');

    // JSON 数据
    $data = $request->json()->all();

    // 动态属性访问
    $title = $request->title;
}
```

## 响应处理对比

### Yii2 响应

```php
// 返回字符串
return 'Hello World';

// 渲染视图
return $this->render('view', ['data' => $data]);

// JSON 响应
Yii::$app->response->format = Response::FORMAT_JSON;
return ['status' => 'success', 'data' => $model];

// 重定向
return $this->redirect(['view', 'id' => $id]);
return $this->redirect('https://example.com');
```

### Laravel12 响应

```php
use Illuminate\Http\JsonResponse;

// 返回字符串
return 'Hello World';

// 渲染视图
return view('view', ['data' => $data]);

// JSON 响应
return response()->json(['status' => 'success', 'data' => $model]);

// 响应对象
return response('Content', 200)
    ->header('Content-Type', 'text/plain');

// 重定向
return redirect()->route('post.show', $id);
return redirect('https://example.com');
return back(); // 返回上一页
return redirect()->with('status', 'Message saved!'); // 带消息跳转
```

## 控制器中间件对比

### Yii2 过滤器（在控制器中声明）

```php
public function behaviors()
{
    return [
        'access' => [
            'class' => AccessControl::class,
            'only' => ['create', 'update', 'delete'],
            'rules' => [
                [
                    'allow' => true,
                    'roles' => ['@'],
                ],
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
// 方式1：在控制器构造函数中
public function __construct()
{
    $this->middleware('auth')->only(['create', 'update', 'delete']);
    $this->middleware('can:update,post')->only('update');
}

// 方式2：在路由定义中
Route::middleware(['auth'])->group(function () {
    Route::resource('posts', PostController::class);
});

// 方式3：路由中单独指定
Route::post('/posts/{id}/delete', [PostController::class, 'destroy'])
    ->middleware(['auth', 'can:delete,post']);
```

## 单一动作控制器

### Yii2 独立动作

```php
// app/components/HelloAction.php
namespace app\components;

use yii\base\Action;

class HelloAction extends Action
{
    public function run()
    {
        return "Hello World";
    }
}

// 在控制器中注册
public function actions()
{
    return [
        'hello' => 'app\components\HelloAction',
    ];
}
```

### Laravel12 单一动作控制器

```php
// app/Http/Controllers/HelloController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HelloController extends Controller
{
    // 只有一个 __invoke 方法
    public function __invoke()
    {
        return 'Hello World';
    }
}

// 路由定义（不需要指定方法名）
Route::get('/hello', HelloController::class);
```

## 表单验证对比

### Yii2 模型验证

```php
// 在 Model 中定义规则
public function rules()
{
    return [
        [['title', 'content'], 'required'],
        ['title', 'string', 'max' => 255],
        ['email', 'email'],
    ];
}

// 控制器中使用
$model = new Post();
if ($model->load(Yii::$app->request->post()) && $model->save()) {
    // 成功
} else {
    // 失败，错误在 $model->errors
}
```

### Laravel12 表单请求验证

```php
// 创建表单请求类
php artisan make:request StorePostRequest

// app/Http/Requests/StorePostRequest.php
public function rules(): array
{
    return [
        'title' => 'required|max:255',
        'content' => 'required',
        'email' => 'email',
    ];
}

// 控制器中使用
public function store(StorePostRequest $request)
{
    // 验证已自动通过，直接获取验证数据
    $validated = $request->validated();
    Post::create($validated);
}

// 或在控制器中直接验证
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|max:255',
        'content' => 'required',
    ]);
    Post::create($validated);
}
```

## 资源控制器完整示例

### Laravel12 资源控制器

```php
php artisan make:controller PostController --resource

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::all();
        return view('post.index', compact('posts'));
    }

    public function create()
    {
        return view('post.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);
        Post::create($validated);
        return redirect()->route('posts.index');
    }

    public function show(Post $post) // 路由模型绑定
    {
        return view('post.show', compact('post'));
    }

    public function edit(Post $post)
    {
        return view('post.edit', compact('post'));
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);
        $post->update($validated);
        return redirect()->route('posts.show', $post);
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return redirect()->route('posts.index');
    }
}
```

## 最佳实践对比

### Yii2 控制器最佳实践

- 控制器应精简，复杂逻辑移至 Model
- 可访问请求数据
- 可调用模型方法和服务组件
- 不应嵌入 HTML 代码

### Laravel12 控制器最佳实践

- 保持控制器简洁
- 使用 Form Request 处理验证
- 使用 Route Model Binding 简化代码
- 复杂业务逻辑放至 Service 类
- 使用资源类转换 API 响应