---
title: Eloquent ORM
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/routing
next: /laravel12/blade
---

# Eloquent ORM

Eloquent 是 Laravel 内置的 ORM（对象关系映射），提供优雅的 ActiveRecord 实现。

## 模型定义

### 创建模型

```bash
# 创建模型
php artisan make:model Post

# 创建模型和迁移
php artisan make:model Post -m

# 创建模型、迁移、工厂、Seeder
php artisan make:model Post -mfsc
```

### 基本模型

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    // 表名（默认为类名复数形式）
    protected $table = 'posts';

    // 主键（默认为 id）
    protected $primaryKey = 'id';

    // 主键是否自增
    public $incrementing = true;

    // 主键类型
    protected $keyType = 'int';

    // 是否自动维护时间戳
    public $timestamps = true;

    // 时间戳字段名
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    // 可批量赋值的字段
    protected $fillable = [
        'title',
        'content',
        'status',
        'user_id',
    ];

    // 不可批量赋值的字段
    protected $guarded = ['id'];

    // 字段类型转换
    protected $casts = [
        'status' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'options' => 'array',
        'settings' => 'collection',
        'price' => 'decimal:2',
    ];

    // 访问器/修改器属性
    protected $appends = ['excerpt'];

    // 隐藏字段
    protected $hidden = ['password', 'remember_token'];

    // 可见字段
    protected $visible = ['id', 'title', 'content'];
}
```

## 数据查询

### 基础查询

```php
// 获取所有记录
$posts = Post::all();
$posts = Post::get();

// 获取单个记录
$post = Post::find(1);
$post = Post::findOrFail(1);  // 找不到抛出 404
$post = Post::firstWhere('title', 'Hello');
$post = Post::where('title', 'Hello')->firstOrFail();

// 获取特定字段
$titles = Post::pluck('title');
$titles = Post::pluck('title', 'id');  // 键值对

// 获取单个字段值
$title = Post::where('id', 1)->value('title');
```

### 条件查询

```php
// 基本条件
$posts = Post::where('status', 1)->get();
$posts = Post::where('status', '>=', 1)->get();
$posts = Post::where('status', '!=', 1)->get();

// 多条件
$posts = Post::where('status', 1)
    ->where('views', '>', 100)
    ->get();

// OR 条件
$posts = Post::where('status', 1)
    ->orWhere('featured', true)
    ->get();

// WHERE IN
$posts = Post::whereIn('status', [1, 2, 3])->get();
$posts = Post::whereNotIn('status', [0, 4])->get();

// WHERE NULL
$posts = Post::whereNull('deleted_at')->get();
$posts = Post::whereNotNull('published_at')->get();

// WHERE BETWEEN
$posts = Post::whereBetween('views', [100, 500])->get();
$posts = Post::whereNotBetween('views', [100, 500])->get();

// LIKE
$posts = Post::where('title', 'like', '%laravel%')->get();
$posts = Post::where('title', 'ilike', '%LARAVEL%')->get(); // 不区分大小写

// JSON 查询
$users = User::where('options->language', 'en')->get();
$users = User::whereJsonContains('options->languages', 'en')->get();
$users = User::whereJsonLength('options->languages', '>', 1)->get();
```

### 高级查询

```php
// 条件闭包（分组）
$posts = Post::where(function ($query) {
    $query->where('status', 1)
        ->where('views', '>', 100);
})->orWhere(function ($query) {
    $query->where('featured', true)
        ->where('priority', 'high');
})->get();

// 子查询
$posts = Post::whereIn('user_id', function ($query) {
    $query->select('id')->from('users')->where('active', true);
})->get();

// EXISTS
$posts = Post::whereExists(function ($query) {
    $query->select('id')->from('comments')
        ->whereColumn('post_id', 'posts.id');
})->get();

// 条件查询（动态条件）
$posts = Post::when($request->search, function ($query, $search) {
    $query->where('title', 'like', "%{$search}%");
})->when($request->status, function ($query, $status) {
    $query->where('status', $status);
})->get();

// 除非条件
$posts = Post::unless($isAdmin, function ($query) {
    $query->where('status', 'published');
})->get();
```

### 排序与限制

```php
// 排序
$posts = Post::orderBy('created_at', 'desc')->get();
$posts = Post::orderByDesc('created_at')->get();
$posts = Post::latest()->get();  // 按 created_at DESC
$posts = Post::latest('published_at')->get();
$posts = Post::oldest()->get();  // 按 created_at ASC

// 随机排序
$posts = Post::inRandomOrder()->get();

// 多字段排序
$posts = Post::orderBy('status', 'asc')
    ->orderBy('created_at', 'desc')
    ->get();

// 限制结果
$posts = Post::take(10)->get();
$posts = Post::limit(10)->get();

// 跳过
$posts = Post::skip(10)->take(10)->get();
$posts = Post::offset(10)->limit(10)->get();

// 分页
$posts = Post::paginate(15);
$posts = Post::simplePaginate(15);
$posts = Post::cursorPaginate(15);
```

### 聚合查询

```php
// 计数
$count = Post::count();
$count = Post::where('status', 1)->count();

// SUM
$total = Post::sum('views');

// AVG
$avg = Post::avg('rating');

// MIN/MAX
$min = Post::min('price');
$max = Post::max('price');

// 存在检查
$exists = Post::where('status', 1)->exists();
$doesntExist = Post::where('status', 0)->doesntExist();
```

### 分组查询

```php
// GROUP BY
$stats = Post::select('status', DB::raw('COUNT(*) as count'))
    ->groupBy('status')
    ->get();

// HAVING
$popular = Post::select('user_id', DB::raw('COUNT(*) as post_count'))
    ->groupBy('user_id')
    ->having('post_count', '>', 10)
    ->get();

// HAVING RAW
$results = Post::select('status', DB::raw('COUNT(*) as count'))
    ->groupBy('status')
    ->havingRaw('count > ?', [5])
    ->get();
```

## 数据插入

### 创建记录

```php
// 方式一：使用 create（批量赋值）
$post = Post::create([
    'title' => 'New Post',
    'content' => 'Content...',
    'user_id' => 1,
]);

// 方式二：实例化后保存
$post = new Post();
$post->title = 'New Post';
$post->content = 'Content...';
$post->user_id = 1;
$post->save();

// 方式三：firstOrCreate（不存在则创建）
$post = Post::firstOrCreate(
    ['slug' => 'new-post'],           // 查找条件
    ['title' => 'New Post', 'content' => '...']  // 创建数据
);

// firstOrNew（不保存到数据库）
$post = Post::firstOrNew(['slug' => 'new-post']);

// updateOrCreate（更新或创建）
$post = Post::updateOrCreate(
    ['slug' => 'new-post'],           // 查找条件
    ['title' => 'Updated Title']      // 更新数据
);
```

### 批量插入

```php
Post::insert([
    ['title' => 'Post 1', 'content' => '...'],
    ['title' => 'Post 2', 'content' => '...'],
    ['title' => 'Post 3', 'content' => '...'],
]);

// 使用 Eloquent 批量插入（触发事件）
Post::createMany([
    ['title' => 'Post 1', 'content' => '...'],
    ['title' => 'Post 2', 'content' => '...'],
]);
```

## 数据更新

### 基本更新

```php
// 更新单个记录
$post = Post::find(1);
$post->title = 'Updated Title';
$post->save();

// 批量更新
Post::where('status', 'draft')->update(['status' => 'published']);

// 更新特定字段
$post->update(['title' => 'New Title']);

// 增量更新
Post::increment('views');
Post::increment('views', 5);
Post::decrement('stock');
Post::increment('views', 1, ['last_viewed_at' => now()]);
```

## 数据删除

```php
// 删除单个记录
$post = Post::find(1);
$post->delete();

// 通过主键删除
Post::destroy(1);
Post::destroy([1, 2, 3]);
Post::destroy(1, 2, 3);

// 条件删除
Post::where('status', 'archived')->delete();

// 强制删除（包括软删除）
Post::withTrashed()->where('status', 'archived')->forceDelete();
```

## 软删除

```php
// 模型定义
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];
}

// 软删除
$post->delete();

// 查询（自动排除软删除）
$posts = Post::all();

// 包含软删除
$posts = Post::withTrashed()->get();

// 仅软删除
$posts = Post::onlyTrashed()->get();

// 恢复软删除
$post->restore();
Post::withTrashed()->where('id', 1)->restore();

// 强制删除（永久删除）
$post->forceDelete();

// 判断是否软删除
if ($post->trashed()) {
    // 已软删除
}
```

## 关联关系

### 一对一

```php
// User hasOne Profile
class User extends Model
{
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class, 'user_id', 'id');
    }
}

// Profile belongsTo User
class Profile extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}

// 使用
$profile = $user->profile;
$user = $profile->user;

// 创建关联
$user->profile()->create(['bio' => '...']);
```

### 一对多

```php
// User hasMany Posts
class User extends Model
{
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'user_id', 'id');
    }
}

// Post belongsTo User
class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

// 使用
$posts = $user->posts;
$user = $post->user;

// 保存关联
$user->posts()->create(['title' => 'New Post']);

// 保存多个
$user->posts()->saveMany([
    new Post(['title' => 'Post 1']),
    new Post(['title' => 'Post 2']),
]);
```

### 多对多

```php
// Post belongsToMany Tags
class Post extends Model
{
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id')
            ->withPivot('created_at', 'order')
            ->withTimestamps()
            ->orderByPivot('order');
    }
}

class Tag extends Model
{
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }
}

// 使用
$tags = $post->tags;

// 附加关联
$post->tags()->attach(1);
$post->tags()->attach([1, 2, 3]);
$post->tags()->attach(1, ['order' => 1]);

// 同步关联
$post->tags()->sync([1, 2, 3]);
$post->tags()->syncWithoutDetaching([1, 2]);  // 不删除现有

// 切换关联
$post->tags()->toggle([1, 2, 3]);

// 分离关联
$post->tags()->detach(1);
$post->tags()->detach([1, 2, 3]);
$post->tags()->detach();  // 全部分离

// 更新中间表
$post->tags()->updateExistingPivot(1, ['order' => 2]);
```

### 远程一对多

```php
// Country hasManyThrough Posts (through Users)
class Country extends Model
{
    public function posts(): HasManyThrough
    {
        return $this->hasManyThrough(Post::class, User::class);
    }
}

// 使用
$posts = $country->posts;
```

### 多态关联

```php
// Post 和 Video 都可以有 Comments
class Comment extends Model
{
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Video extends Model
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

// 使用
$post->comments()->create(['body' => 'Great post!']);
$comments = Comment::with('commentable')->get();
```

### 多态多对多

```php
// Post 和 Video 都可以有 Tags
class Tag extends Model
{
    public function posts(): MorphedByMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    public function videos(): MorphedByMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}

class Post extends Model
{
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

## 预加载

### 基本预加载

```php
// N+1 问题
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name;  // 每次循环都查询
}

// 预加载解决
$posts = Post::with('user')->get();
foreach ($posts as $post) {
    echo $post->user->name;  // 不额外查询
}
```

### 多个关联预加载

```php
// 预加载多个关联
$posts = Post::with(['user', 'comments', 'tags'])->get();

// 嵌套预加载
$posts = Post::with('user.profile', 'comments.user')->get();
```

### 条件预加载

```php
// 预加载时添加条件
$posts = Post::with(['comments' => function ($query) {
    $query->where('approved', true)->orderBy('created_at', 'desc');
}])->get();

// 预加载计数
$posts = Post::withCount('comments')->get();
foreach ($posts as $post) {
    echo $post->comments_count;
}

// 预加载聚合
$posts = Post::withAvg('comments', 'rating')->get();
$posts = Post::withSum('comments', 'likes')->get();
$posts = Post::withMax('comments', 'created_at')->get();
```

### 延迟预加载

```php
$posts = Post::all();

// 按需加载
$posts->load('user', 'comments');

// 条件加载
$posts->loadMissing('user.profile');
```

### 预加载存在检查

```php
// 只获取有评论的文章
$posts = Post::has('comments')->get();

// 条件计数
$posts = Post::has('comments', '>=', 5)->get();

// 条件查询
$posts = Post::whereHas('comments', function ($query) {
    $query->where('approved', true);
})->get();

// 无关联
$posts = Post::doesntHave('comments')->get();
```

## 访问器和修改器

### 访问器（Getter）

```php
class Post extends Model
{
    protected function title(): Attribute
    {
        return Attribute::make(
            get: fn(string $value) => ucfirst($value),
        );
    }

    protected function excerpt(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => Str::limit($attributes['content'], 100),
        );
    }
}

// 使用
echo $post->title;    // 自动首字母大写
echo $post->excerpt;  // 自动截取摘要
```

### 修改器（Setter）

```php
class User extends Model
{
    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn(string $value) => bcrypt($value),
        );
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn(string $value) => ucfirst($value),
            set: fn(string $value) => strtolower($value),
        );
    }
}

// 使用
$user->password = 'secret';  // 自动加密
$user->name = 'JOHN';        // 存储时变为 'john'，读取时变为 'John'
```

## 模型事件

### 事件类型

```php
// 事件顺序
// creating -> created -> saving -> saved
// updating -> updated -> saving -> saved
// deleting -> deleted
// restoring -> restored
// replicating
```

### 定义事件监听

```php
// 方式一：在模型中定义
class Post extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Post $post) {
            $post->slug = Str::slug($post->title);
        });

        static::updating(function (Post $post) {
            $post->updated_by = auth()->id();
        });

        static::deleting(function (Post $post) {
            $post->comments()->delete();
        });
    }
}

// 方式二：使用观察者
// php artisan make:observer PostObserver --model=Post

class PostObserver
{
    public function created(Post $post): void
    {
        // 新建后
    }

    public function updated(Post $post): void
    {
        // 更新后
    }

    public function deleted(Post $post): void
    {
        // 删除后
    }
}

// 注册观察者
// AppServiceProvider 中
Post::observe(PostObserver::class);
```

## 查询作用域

### 本地作用域

```php
class Post extends Model
{
    // 定义作用域
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopePopular(Builder $query, int $views = 1000): Builder
    {
        return $query->where('views', '>=', $views);
    }

    public function scopeOfCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }
}

// 使用
$posts = Post::published()->get();
$posts = Post::published()->popular(500)->get();
$posts = Post::ofCategory('tech')->published()->get();
```

## 集合操作

```php
// Eloquent 返回集合
$posts = Post::all();

// 集合方法
$published = $posts->filter(fn($post) => $post->status === 'published');
$titles = $posts->pluck('title');
$sorted = $posts->sortBy('created_at');
$grouped = $posts->groupBy('status');

// 链式操作
$activeTitles = Post::all()
    ->filter(fn($post) => $post->active)
    ->map(fn($post) => $post->title)
    ->sort()
    ->values();
```

## 模型序列化

```php
// 转换为数组
$post = Post::find(1);
$array = $post->toArray();
$json = $post->toJson();

// 隐藏/显示字段
$post->makeHidden(['content', 'user_id']);
$post->makeVisible(['deleted_at']);

// 加载关联后转换
$post->load('user', 'tags')->toArray();
```

## 最佳实践

### 1. 使用 fillable 或 guarded

```php
// 推荐使用 fillable（白名单更安全）
protected $fillable = ['title', 'content', 'user_id'];

// 或禁用批量赋值保护
protected $guarded = [];
```

### 2. 使用路由模型绑定

```php
// 控制器中
public function show(Post $post)
{
    return view('posts.show', compact('post'));
}
```

### 3. 合理使用预加载

```php
// 避免N+1问题
$posts = Post::with('user', 'tags')->paginate(15);
```

### 4. 使用事务

```php
DB::transaction(function () use ($data) {
    $post = Post::create($data);
    $post->tags()->sync($data['tags']);
});
```