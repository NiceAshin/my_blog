---
title: 缓存系统
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/events
next: /laravel12/filesystem
---

# 缓存系统

Laravel 缓存系统提供了统一的 API 来存储和检索缓存数据，支持多种缓存驱动，包括 Redis、Memcached、Database、File 等。本章将深入讲解缓存系统的使用和最佳实践。

## 缓存配置

### 配置文件

```php
// config/cache.php
'default' => env('CACHE_STORE', 'database'),

'stores' => [
    'apc' => [
        'driver' => 'apc',
    ],

    'array' => [
        'driver' => 'array',
        'serialize' => false,
    ],

    'database' => [
        'driver' => 'database',
        'connection' => env('DB_CACHE_CONNECTION'),
        'table' => env('DB_CACHE_TABLE', 'cache'),
        'lock_connection' => env('DB_CACHE_LOCK_CONNECTION'),
        'lock_table' => env('DB_CACHE_LOCK_TABLE'),
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
            [
                'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                'port' => env('MEMCACHED_PORT', 11211),
                'weight' => 100,
            ],
        ],
    ],

    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_CACHE_CONNECTION', 'cache'),
        'lock_connection' => env('REDIS_CACHE_LOCK_CONNECTION', 'default'),
    ],
],
```

### 创建缓存表

```bash
php artisan cache:table
php artisan migrate
```

## 基础缓存操作

### 获取缓存

```php
use Illuminate\Support\Facades\Cache;

// 获取缓存值
$value = Cache::get('key');

// 带默认值
$value = Cache::get('key', 'default');

// 闭包默认值
$value = Cache::get('key', function () {
    return expensiveOperation();
});

// 获取并删除
$value = Cache::pull('key');
```

### 存储缓存

```php
// 永久存储
Cache::forever('key', $value);

// 指定时间存储（秒）
Cache::put('key', $value, 3600);

// 指定时间存储（DateTime）
Cache::put('key', $value, now()->addHours(2));

// 仅当不存在时存储
Cache::add('key', $value, 3600);

// 仅当存在时更新
Cache::replace('key', $value, 3600);
```

### 删除缓存

```php
// 删除单个
Cache::forget('key');

// 删除多个
Cache::forget(['key1', 'key2', 'key3']);

// 清空所有
Cache::flush();

// 删除并返回值
$value = Cache::pull('key');
```

### 检查存在

```php
// 检查键是否存在
if (Cache::has('key')) {
    // 存在
}

// 检查键是否缺失
if (Cache::missing('key')) {
    // 缺失
}
```

## 原子操作

### 自增自减

```php
// 自增
Cache::increment('counter');       // +1
Cache::increment('counter', 5);    // +5

// 自减
Cache::decrement('counter');       // -1
Cache::decrement('counter', 10);   // -10
```

### remember 方法

```php
// 获取或存储
$value = Cache::remember('users.active', 3600, function () {
    return User::where('active', true)->get();
});

// 永久存储
$value = Cache::rememberForever('users.active', function () {
    return User::where('active', true)->get();
});

// 仅当不存在时获取
$value = Cache::sear('key', function () {
    return expensiveOperation();
});
```

## 缓存标签

### 使用标签

```php
// 存储带标签的缓存
Cache::tags(['users', 'admins'])->put('admin.list', $admins, 3600);

// 获取带标签的缓存
$admins = Cache::tags(['users', 'admins'])->get('admin.list');

// 获取或存储
$admins = Cache::tags(['users', 'admins'])->remember('admin.list', 3600, function () {
    return User::where('role', 'admin')->get();
});

// 删除标签下所有缓存
Cache::tags(['users'])->flush();

// 删除多个标签的缓存
Cache::tags(['users', 'posts'])->flush();
```

### 实际应用

```php
class PostService
{
    public function getPost(int $id): Post
    {
        return Cache::tags(['posts'])->remember("post.{$id}", 3600, function () use ($id) {
            return Post::with(['author', 'tags', 'comments'])->findOrFail($id);
        });
    }

    public function updatePost(Post $post, array $data): Post
    {
        $post->update($data);

        // 清除相关缓存
        Cache::tags(['posts'])->flush();

        return $post;
    }
}
```

## 原子锁

### 获取锁

```php
use Illuminate\Support\Facades\Cache;

// 获取锁
$lock = Cache::lock('process-order', 10);

if ($lock->get()) {
    // 获取锁成功，执行操作

    $lock->release(); // 释放锁
}

// 带回调释放
$lock->get(function () {
    // 执行操作，自动释放锁
});
```

### 阻塞等待锁

```php
// 等待最多 5 秒
$lock = Cache::lock('process-order', 10)->block(5);

if ($lock) {
    // 获取锁成功
    $lock->release();
}

// 带回调
Cache::lock('process-order', 10)->block(5, function () {
    // 执行操作
});
```

### 锁所有权

```php
// 指定所有者
$lock = Cache::store('redis')->lock('process-order', 10, 'owner-token');

// 使用相同令牌释放
Cache::store('redis')->lock('process-order', 10, 'owner-token')->release();
```

## 缓存装饰器模式

### 创建缓存装饰器

```php
// app/Services/CachedUserRepository.php
class CachedUserRepository implements UserRepositoryInterface
{
    public function __construct(
        protected UserRepositoryInterface $repository,
        protected int $ttl = 3600
    ) {}

    public function find(int $id): ?User
    {
        return Cache::remember("user.{$id}", $this->ttl, function () use ($id) {
            return $this->repository->find($id);
        });
    }

    public function findActive(): Collection
    {
        return Cache::tags(['users'])
            ->remember('users.active', $this->ttl, function () {
                return $this->repository->findActive();
            });
    }

    public function update(User $user, array $data): User
    {
        $user = $this->repository->update($user, $data);

        // 清除相关缓存
        Cache::forget("user.{$user->id}");
        Cache::tags(['users'])->flush();

        return $user;
    }
}
```

## 缓存中间件

### 缓存响应

```php
// routes/web.php
Route::get('/api/posts', [PostController::class, 'index'])
    ->middleware('cache.headers:public;max_age=2628000;etag');
```

### HTTP 缓存

```php
// 使用 ETag
Route::get('/posts/{post}', function (Post $post, Request $request) {
    $etag = md5($post->updated_at);

    if ($request->header('If-None-Match') === $etag) {
        return response('', 304);
    }

    return response()->json($post)
        ->setEtag($etag)
        ->setLastModified($post->updated_at);
});
```

## 最佳实践

### 1. 合理设置过期时间

```php
// 根据数据更新频率设置
Cache::put('config', $config, now()->addDay());        // 配置数据
Cache::put('user.stats', $stats, now()->addHour());    // 统计数据
Cache::put('page.html', $html, now()->addMinutes(5));  // 页面缓存
```

### 2. 使用缓存键前缀

```php
// 配置前缀
'prefix' => env('CACHE_PREFIX', 'myapp_'),

// 动态前缀
Cache::put("user:{$userId}:settings", $settings, 3600);
```

### 3. 缓存失效策略

```php
class PostService
{
    public function getPost(int $id): Post
    {
        return Cache::remember("post.{$id}", 3600, function () use ($id) {
            return Post::findOrFail($id);
        });
    }

    public function updatePost(Post $post, array $data): Post
    {
        $post->update($data);

        // 清除单个缓存
        Cache::forget("post.{$post->id}");

        // 清除列表缓存
        Cache::tags(['posts', 'user.posts'])->flush();

        return $post->fresh();
    }
}
```

### 4. 缓存穿透保护

```php
public function getUser(int $id): ?User
{
    return Cache::remember("user.{$id}", 3600, function () use ($id) {
        $user = User::find($id);

        // 缓存空值防止穿透
        return $user ?? false;
    }) ?: null;
}
```

### 5. 缓存预热

```php
class CacheWarmer
{
    public function warmUp(): void
    {
        // 预热热门数据
        $popularPosts = Post::popular()->take(100)->get();

        foreach ($popularPosts as $post) {
            Cache::remember("post.{$post->id}", 3600, fn() => $post);
        }

        // 预热配置
        Cache::remember('app.config', 86400, fn() => Config::all());
    }
}
```

### 6. 监控缓存命中率

```php
class CacheMetrics
{
    protected int $hits = 0;
    protected int $misses = 0;

    public function get(string $key): mixed
    {
        $value = Cache::get($key);

        if ($value !== null) {
            $this->hits++;
        } else {
            $this->misses++;
        }

        return $value;
    }

    public function hitRate(): float
    {
        $total = $this->hits + $this->misses;
        return $total > 0 ? $this->hits / $total : 0;
    }
}
```

## 参考资源

- [Laravel 缓存文档](https://laravel.com/docs/12.x/cache)
- [Redis 文档](https://redis.io/docs/)
- [Memcached 文档](https://memcached.org/)
