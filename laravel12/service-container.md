---
title: 服务容器与依赖注入
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: database-comparison
next: false
---

# 服务容器与依赖注入

## 核心概念对比

Yii2 和 Laravel12 都实现了依赖注入，但实现方式不同。

### Yii2 服务定位器

Yii2 使用**服务定位器**模式，通过静态方法访问服务：

```php
// 静态访问服务
Yii::$app->db;
Yii::$app->cache;
Yii::$app->request;
Yii::$app->user;

// 配置组件
'components' => [
    'db' => [
        'class' => 'yii\db\Connection',
        'dsn' => 'mysql:host=localhost;dbname=mydb',
    ],
    'cache' => [
        'class' => 'yii\caching\FileCache',
    ],
],
```

### Laravel12 服务容器

Laravel 使用**依赖注入容器**，通过构造函数或方法注入：

```php
// 依赖注入
class PostController extends Controller
{
    public function __construct(
        private PostRepository $posts,
        private Cache $cache
    ) {}

    public function index()
    {
        return $this->posts->all();
    }
}

// 或通过 app() 函数
$db = app('db');
$cache = app('cache');

// 配置服务
// config/app.php
'providers' => [
    App\Providers\AppServiceProvider::class,
],
```

## 关键差异对比表

| 特性 | Yii2 | Laravel12 |
|------|------|-----------|
| 模式 | 服务定位器 | 依赖注入容器 |
| 访问方式 | 静态方法 `Yii::$app->xxx` | 注入或 `app()` |
| 配置位置 | `components` 数组 | Service Provider |
| 绑定方式 | 数组配置 | `$app->bind()/singleton()` |
| 自动解析 | 有限支持 | 完整支持 |
| 接口绑定 | 需手动处理 | `$app->bind(Interface::class, Impl::class)` |
| 上下文绑定 | 不支持 | `$app->when()->needs()->give()` |

## 服务注册对比

### Yii2 组件注册

```php
// config/web.php
'components' => [
    // 类名
    'cache' => 'yii\caching\FileCache',

    // 配置数组
    'db' => [
        'class' => 'yii\db\Connection',
        'dsn' => 'mysql:host=localhost;dbname=mydb',
        'username' => 'root',
        'password' => '',
    ],

    // 闭包
    'mailer' => function () {
        $mailer = new \yii\swiftmailer\Mailer();
        $mailer->setTransport(['dsn' => 'smtp://localhost']);
        return $mailer;
    },
],

// 获取组件
$cache = Yii::$app->cache;
$db = Yii::$app->db;
```

### Laravel12 服务注册

```php
// app/Providers/AppServiceProvider.php
public function register(): void
{
    // 简单绑定（每次创建新实例）
    $this->app->bind(PostRepository::class, function ($app) {
        return new PostRepository($app->make(Post::class));
    });

    // 单例绑定（共享实例）
    $this->app->singleton(Logger::class, function ($app) {
        return new Logger(storage_path('logs/app.log'));
    });

    // 绑定接口到实现
    $this->app->bind(
        PaymentGatewayInterface::class,
        StripeGateway::class
    );

    // 绑定实例
    $api = new ApiService('api-key');
    $this->app->instance(ApiService::class, $api);
}
```

## 依赖注入使用对比

### Yii2 依赖注入

```php
// Yii2 主要通过服务定位器，DI 使用有限
class PostController extends Controller
{
    public function actionView($id)
    {
        // 服务定位器
        $cache = Yii::$app->cache;
        $db = Yii::$app->db;

        // 或使用 DI 容器
        $container = Yii::$container;
        $service = $container->get(MyService::class);
    }
}

// 配置 DI 容器
Yii::$container->set('app\services\MailerInterface', 'app\services\SmtpMailer');
```

### Laravel12 依赖注入

```php
// 构造函数注入
class PostController extends Controller
{
    public function __construct(
        private PostRepository $posts,
        private Cache $cache,
        private Logger $logger
    ) {}

    public function index()
    {
        $this->logger->info('Viewing posts');
        return $this->posts->all();
    }
}

// 方法注入
public function store(Request $request, PostRepository $posts)
{
    $validated = $request->validate([...]);
    $posts->create($validated);
}

// 接口注入
class PaymentController extends Controller
{
    public function __construct(
        private PaymentGatewayInterface $gateway
    ) {}

    public function process()
    {
        return $this->gateway->charge(100);
    }
}
```

## Facade 对比

### Yii2 静态访问

```php
// Yii2 没有类似 Facade 的概念，直接使用静态方法
Yii::$app->db->table('users')->all();
Yii::$app->cache->get('key');
Yii::$app->queue->push(new Job());
```

### Laravel12 Facade

Laravel Facade 提供类似静态访问的语法，但底层使用依赖注入：

```php
// Facade 语法
DB::table('users')->get();
Cache::get('key');
Queue::push(new Job());

// 常用 Facade
Route::get('/', fn() => view('welcome'));
View::make('welcome');
Log::info('Message');
Mail::to($user)->send(new WelcomeEmail());
Storage::disk('s3')->put('file.txt', 'content');

// Facade 对应的服务类
// DB -> Illuminate\Database\DatabaseManager
// Cache -> Illuminate\Cache\CacheManager
// Queue -> Illuminate\Queue\QueueManager
```

## 服务提供者对比

### Yii2 Bootstrap 组件

```php
// config/web.php
'bootstrap' => [
    'log',          // 日志组件
    'debug',        // 调试模块（开发环境）
    'gii',          // Gii 模块（开发环境）
],

// 模块或组件实现 BootstrapInterface
class MyModule extends \yii\base\Module implements BootstrapInterface
{
    public function bootstrap($app)
    {
        $app->getUrlManager()->addRules([
            'my-route' => 'my/controller/action',
        ]);
    }
}
```

### Laravel12 服务提供者

```php
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // 注册服务
    public function register(): void
    {
        $this->app->singleton(MyService::class, function ($app) {
            return new MyService($app->make(Config::class));
        });
    }

    // 引导服务（所有服务已注册）
    public function boot(): void
    {
        // 注册路由
        Route::middleware('api')->group(base_path('routes/api.php'));

        // 发布配置
        $this->publishes([
            __DIR__.'/../../config/my-package.php' => config_path('my-package.php'),
        ]);

        // 加载迁移
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');

        // 注册观察者
        Post::observe(PostObserver::class);
    }
}

// 注册提供者
// config/app.php
'providers' => [
    App\Providers\AppServiceProvider::class,
    App\Providers\EventServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
],

// 延迟加载提供者
class MyServiceProvider extends ServiceProvider implements DeferrableProvider
{
    public function provides(): array
    {
        return [MyService::class];
    }
}
```

## 配置管理对比

### Yii2 配置

```php
// config/web.php
return [
    'id' => 'my-app',
    'components' => [
        'db' => [...],
        'cache' => [...],
    ],
    'params' => [
        'adminEmail' => 'admin@example.com',
        'pageSize' => 20,
    ],
];

// 获取配置
$email = Yii::$app->params['adminEmail'];
$pageSize = Yii::$app->params['pageSize'];

// 环境配置（多个配置文件）
// config/main.php
// config/main-local.php（本地覆盖）
```

### Laravel12 配置

```php
// config/app.php
return [
    'name' => env('APP_NAME', 'Laravel'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'timezone' => 'UTC',
];

// config/services.php
return [
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],
];

// 获取配置
$name = config('app.name');
$key = config('services.stripe.key');
$pageSize = config('app.pagination.per_page', 20);

// .env 文件
APP_NAME=MyApp
APP_ENV=local
APP_DEBUG=true
DB_HOST=127.0.0.1
```

## 事件系统对比

### Yii2 事件

```php
// 定义事件
class User extends ActiveRecord
{
    const EVENT_AFTER_REGISTER = 'afterRegister';

    public function afterRegister()
    {
        $this->trigger(self::EVENT_AFTER_REGISTER);
    }
}

// 监听事件
Event::on(User::class, User::EVENT_AFTER_REGISTER, function ($event) {
    Mailer::send($event->sender->email, 'Welcome!');
});

// 或在组件配置中
'on afterRegister' => function ($event) {
    // ...
},
```

### Laravel12 事件

```php
// 定义事件
// app/Events/UserRegistered.php
class UserRegistered
{
    public function __construct(public User $user) {}
}

// 定义监听器
// app/Listeners/SendWelcomeEmail.php
class SendWelcomeEmail
{
    public function handle(UserRegistered $event): void
    {
        Mail::to($event->user)->send(new WelcomeEmail());
    }
}

// 注册事件/监听器
// app/Providers/EventServiceProvider.php
protected $listen = [
    UserRegistered::class => [
        SendWelcomeEmail::class,
        AssignDefaultRole::class,
    ],
];

// 触发事件
event(new UserRegistered($user));
UserRegistered::dispatch($user);

// 或使用闭包监听
Event::listen(function (UserRegistered $event) {
    // ...
});
```

## 队列系统对比

### Yii2 队列

```php
// 配置
'components' => [
    'queue' => [
        'class' => 'yii\queue\redis\Queue',
        'redis' => 'redis',
        'channel' => 'queue',
    ],
],

// 推送任务
Yii::$app->queue->push(new SendEmailJob(['email' => 'user@example.com']));

// 任务类
class SendEmailJob implements JobInterface
{
    public $email;

    public function execute($queue)
    {
        Mailer::send($this->email, 'Subject', 'Body');
    }
}

// 监听队列
php yii queue/listen
```

### Laravel12 队列

```php
// 配置
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'default',
    ],
],

// 推送任务
SendEmailJob::dispatch($email);
SendEmailJob::dispatch($email)->onQueue('emails');
SendEmailJob::dispatchAfterResponse($email); // 响应后执行

// 任务类
class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $email) {}

    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)->send(new WelcomeEmail());
    }
}

// 监听队列
php artisan queue:work
php artisan queue:listen
```

## 缓存系统对比

### Yii2 缓存

```php
// 配置
'components' => [
    'cache' => [
        'class' => 'yii\caching\FileCache',
    ],
    'cache' => [
        'class' => 'yii\redis\Cache',
        'redis' => 'redis',
    ],
],

// 使用
Yii::$app->cache->set('key', 'value', 3600);
$value = Yii::$app->cache->get('key');
Yii::$app->cache->delete('key');

// 依赖缓存
Yii::$app->cache->set('posts', $posts, 0, new DbDependency([
    'sql' => 'SELECT MAX(updated_at) FROM posts',
]));
```

### Laravel12 缓存

```php
// 配置
// config/cache.php
'stores' => [
    'file' => ['driver' => 'file', 'path' => storage_path('framework/cache')],
    'redis' => ['driver' => 'redis', 'connection' => 'cache'],
],

// 使用
Cache::put('key', 'value', 3600);
Cache::remember('key', 3600, fn() => Post::all());
$value = Cache::get('key', 'default');
Cache::forget('key');
Cache::flush();

// 依赖缓存
Cache::remember('posts', 3600, function () {
    return Post::all();
});
```

## 最佳实践对比

### Yii2 服务管理最佳实践

- 使用 `components` 注册全局服务
- 通过 `Yii::$app->xxx` 访问服务
- 使用 `bootstrap` 引导启动服务
- 合理使用 DI 容器处理复杂依赖

### Laravel12 服务管理最佳实践

- 优先使用依赖注入而非 Facade
- 使用 Service Provider 组织服务注册
- 使用接口绑定解耦实现
- 合理使用延迟加载优化性能
- 使用 `$this->app->when()` 处理上下文绑定

## 学习建议

从 Yii2 迁移到 Laravel，重点理解：

1. **从静态调用到依赖注入**：理解为什么依赖注入更利于测试
2. **Facade 的使用**：它提供了类似 Yii2 的静态调用方式
3. **Service Provider**：组织服务注册的最佳方式
4. **.env 配置**：更灵活的环境配置管理