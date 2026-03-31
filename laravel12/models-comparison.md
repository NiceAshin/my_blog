---
title: 模型对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/controllers-comparison
next: /laravel12/views-comparison
---

# 模型对比

## 基本结构对比

### Yii2 模型

```php
namespace app\models;

use yii\db\ActiveRecord;

class Post extends ActiveRecord
{
    // 表名（默认为类名）
    public static function tableName()
    {
        return 'posts';
    }

    // 验证规则
    public function rules()
    {
        return [
            [['title', 'content'], 'required'],
            ['title', 'string', 'max' => 255],
            ['status', 'in', 'range' => [0, 1, 2]],
        ];
    }

    // 属性标签
    public function attributeLabels()
    {
        return [
            'title' => '标题',
            'content' => '内容',
        ];
    }

    // 关联关系
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getComments()
    {
        return $this->hasMany(Comment::class, ['post_id' => 'id']);
    }
}
```

### Laravel12 Eloquent 模型

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    // 表名（默认为类名复数形式）
    protected $table = 'posts';

    // 可批量赋值的字段
    protected $fillable = [
        'title',
        'content',
        'status',
        'user_id',
    ];

    // 或使用 guarded（反向）
    protected $guarded = ['id']; // 只有 id 不可批量赋值

    // 字段类型转换
    protected $casts = [
        'status' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'tags' => 'array',
    ];

    // 关联关系
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

## 关键差异对比表

| 特性 | Yii2 ActiveRecord | Laravel12 Eloquent |
|------|-------------------|---------------------|
| 命名空间 | `app\models` | `App\Models` |
| 基类 | `yii\db\ActiveRecord` | `Illuminate\Database\Eloquent\Model` |
| 表名规则 | 类名（需定义 `tableName()`） | 类名复数形式（蛇形命名） |
| 批量赋值 | 通过 `rules()` 定义安全属性 | `$fillable` 或 `$guarded` |
| 验证规则 | `rules()` 方法 | Form Request 或 `$rules` 属性 |
| 类型转换 | 无内置支持 | `$casts` 属性 |
| 时间戳 | 手动管理 | 自动管理 `created_at`, `updated_at` |
| 关联关系 | `hasOne`, `hasMany` | 返回关系对象（类型提示） |
| 软删除 | 需手动实现 | `SoftDeletes` trait |

## 数据查询对比

### Yii2 查询

```php
// 查找单个记录
$post = Post::findOne(1);
$post = Post::findOne(['title' => 'Hello']);
$post = Post::find()->where(['id' => 1])->one();

// 查找多个记录
$posts = Post::findAll([1, 2, 3]);
$posts = Post::find()->where(['status' => 1])->all();
$posts = Post::find()->orderBy('created_at DESC')->limit(10)->all();

// 条件查询
$posts = Post::find()
    ->where(['status' => 1])
    ->andWhere(['>', 'views', 100])
    ->orWhere(['featured' => 1])
    ->all();

// 统计
$count = Post::find()->where(['status' => 1])->count();

// SQL 查询
$posts = Post::findBySql('SELECT * FROM posts WHERE status = :status', ['status' => 1])->all();
```

### Laravel12 Eloquent 查询

```php
// 查找单个记录
$post = Post::find(1);           // 找不到返回 null
$post = Post::findOrFail(1);     // 找不到抛出 404
$post = Post::firstWhere('title', 'Hello');
$post = Post::where('id', 1)->first();

// 查找多个记录
$posts = Post::find([1, 2, 3]);
$posts = Post::where('status', 1)->get();
$posts = Post::orderBy('created_at', 'desc')->take(10)->get();

// 条件查询
$posts = Post::where('status', 1)
    ->where('views', '>', 100)
    ->orWhere('featured', 1)
    ->get();

// 统计
$count = Post::where('status', 1)->count();

// 原生 SQL
$posts = Post::whereRaw('status = ?', [1])->get();
$posts = DB::select('SELECT * FROM posts WHERE status = ?', [1]);
```

## 查询构建器对比

### Yii2 Query Builder

```php
$query = Post::find()
    ->select(['id', 'title'])
    ->where(['status' => 1])
    ->andWhere(['>', 'views', 100])
    ->orderBy(['created_at' => SORT_DESC])
    ->limit(10)
    ->offset(0);

// 分页
$pagination = new Pagination([
    'totalCount' => $query->count(),
    'pageSize' => 20,
]);
$posts = $query->offset($pagination->offset)
    ->limit($pagination->limit)
    ->all();

// JOIN
$posts = Post::find()
    ->joinWith('user')
    ->where(['user.status' => 1])
    ->all();
```

### Laravel12 Query Builder

```php
$posts = Post::query()
    ->select(['id', 'title'])
    ->where('status', 1)
    ->where('views', '>', 100)
    ->orderByDesc('created_at')
    ->skip(0)
    ->take(10)
    ->get();

// 分页（内置）
$posts = Post::where('status', 1)->paginate(20);
$posts = Post::where('status', 1)->simplePaginate(20);

// JOIN
$posts = Post::join('users', 'posts.user_id', 'users.id')
    ->where('users.status', 1)
    ->get();

// 或用关联
$posts = Post::with('user')
    ->whereHas('user', fn($q) => $q->where('status', 1))
    ->get();
```

## 关联关系对比

### Yii2 关联

```php
class Post extends ActiveRecord
{
    // 一对一
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    // 一对多
    public function getComments()
    {
        return $this->hasMany(Comment::class, ['post_id' => 'id']);
    }

    // 多对多
    public function getTags()
    {
        return $this->hasMany(Tag::class, ['id' => 'tag_id'])
            ->viaTable('post_tag', ['post_id' => 'id']);
    }

    // 使用
    $user = $post->user;          // 查询一次
    $comments = $post->comments;  // 查询一次
}

// 预加载（避免 N+1）
$posts = Post::find()->with('user', 'comments')->all();
foreach ($posts as $post) {
    echo $post->user->name; // 不额外查询
}
```

### Laravel12 关联

```php
class Post extends Model
{
    // 一对一（反向）
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 一对多
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // 多对多
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // 使用
    $user = $post->user;          // 查询一次
    $comments = $post->comments;  // 查询一次
}

// 预加载（避免 N+1）
$posts = Post::with('user', 'comments')->get();
foreach ($posts as $post) {
    echo $post->user->name; // 不额外查询
}

// 嵌套预加载
$posts = Post::with('user.profile', 'comments.user')->get();

// 延迟预加载
$posts = Post::all();
$posts->load('user', 'comments');
```

## 数据保存对比

### Yii2 保存数据

```php
// 创建
$post = new Post();
$post->title = 'Title';
$post->content = 'Content';
$post->save();

// 或批量赋值（需在 rules 中声明安全属性）
$post = new Post();
$post->load(Yii::$app->request->post());
$post->save();

// 更新
$post = Post::findOne(1);
$post->title = 'New Title';
$post->save();

// 批量更新
Post::updateAll(['status' => 0], ['created_at <' => '2026-01-01']);

// 删除
$post = Post::findOne(1);
$post->delete();

// 批量删除
Post::deleteAll(['status' => 0]);
```

### Laravel12 保存数据

```php
// 创建（使用 fillable）
$post = Post::create([
    'title' => 'Title',
    'content' => 'Content',
]);

// 或逐个赋值
$post = new Post();
$post->title = 'Title';
$post->content = 'Content';
$post->save();

// 更新
$post = Post::find(1);
$post->title = 'New Title';
$post->save();

// 快速更新
Post::where('id', 1)->update(['title' => 'New Title']);

// 批量更新
Post::where('created_at', '<', '2026-01-01')->update(['status' => 0]);

// 删除
$post = Post::find(1);
$post->delete();

// 快速删除
Post::destroy(1);
Post::destroy([1, 2, 3]);

// 批量删除
Post::where('status', 0)->delete();
```

## 验证对比

### Yii2 验证（在模型中）

```php
class Post extends ActiveRecord
{
    public function rules()
    {
        return [
            [['title', 'content'], 'required'],
            ['title', 'string', 'max' => 255],
            ['email', 'email'],
            ['status', 'default', 'value' => 0],
            ['status', 'in', 'range' => [0, 1, 2]],
            ['created_at', 'date', 'format' => 'php:Y-m-d'],
        ];
    }

    // 场景验证
    public function scenarios()
    {
        return [
            'create' => ['title', 'content', '!status'],
            'update' => ['title', 'content'],
        ];
    }
}

// 使用
$post = new Post();
$post->scenario = 'create';
if ($post->load($data) && $post->validate()) {
    $post->save();
}
```

### Laravel12 验证（Form Request）

```php
// app/Http/Requests/StorePostRequest.php
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'email' => 'nullable|email',
            'status' => 'sometimes|integer|in:0,1,2',
            'published_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '标题不能为空',
        ];
    }
}

// 控制器中使用
public function store(StorePostRequest $request)
{
    // 验证已通过
    Post::create($request->validated());
}

// 或在模型中定义规则（可选）
class Post extends Model
{
    public static function rules(): array
    {
        return [
            'title' => 'required|max:255',
        ];
    }
}
```

## 软删除对比

### Yii2 软删除（需手动实现）

```php
class Post extends ActiveRecord
{
    public function delete()
    {
        $this->deleted_at = date('Y-m-d H:i:s');
        $this->save(false);
        return true;
    }

    public static function find()
    {
        return parent::find()->where(['deleted_at' => null]);
    }
}

// 需要手动处理所有查询
```

### Laravel12 软删除（内置）

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];
}

// 自动过滤已删除记录
$posts = Post::all();  // 不包含软删除

// 包含软删除
$posts = Post::withTrashed()->get();

// 仅软删除
$posts = Post::onlyTrashed()->get();

// 恢复
$post = Post::withTrashed()->find(1);
$post->restore();

// 强制删除
$post->forceDelete();
```

## 访问器和修改器对比

### Yii2 属性处理

```php
class Post extends ActiveRecord
{
    // getter
    public function getTitle()
    {
        return ucfirst($this->title);
    }

    // setter
    public function setTitle($value)
    {
        $this->title = strtolower($value);
    }

    // 使用
    echo $post->title; // 调用 getter
}
```

### Laravel12 Accessor/Mutator

```php
class Post extends Model
{
    // Accessor（读取）
    protected function title(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
        );
    }

    // Mutator（写入）
    protected function content(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => strip_tags($value),
        );
    }

    // 两者结合
    protected function slug(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => strtolower($value),
            set: fn ($value) => Str::slug($value),
        );
    }
}

// 使用
echo $post->title; // 调用 accessor
$post->content = '<p>Text</p>'; // 自动 strip_tags
```

## 模型事件对比

### Yii2 事件

```php
class Post extends ActiveRecord
{
    public function init()
    {
        parent::init();
        $this->on(self::EVENT_BEFORE_INSERT, function ($event) {
            $this->created_at = date('Y-m-d H:i:s');
        });
    }

    // 或覆盖方法
    public function beforeSave($insert)
    {
        if (!parent::beforeSave($insert)) {
            return false;
        }
        if ($insert) {
            $this->created_at = date('Y-m-d H:i:s');
        }
        return true;
    }
}
```

### Laravel12 事件

```php
class Post extends Model
{
    // 使用 boot 方法
    protected static function booted()
    {
        static::creating(function ($post) {
            $post->created_at = now();
        });

        static::updating(function ($post) {
            $post->updated_at = now();
        });
    }

    // 或使用观察器
    // php artisan make:observer PostObserver --model=Post

    // app/Observers/PostObserver.php
    public function creating(Post $post): void
    {
        $post->created_at = now();
    }

    // 在 AppServiceProvider 中注册
    public function boot(): void
    {
        Post::observe(PostObserver::class);
    }
}
```

## 作用域对比

### Yii2 查询作用域

```php
class Post extends ActiveRecord
{
    public function published()
    {
        $this->andWhere(['status' => 1]);
        return $this;
    }

    public function recent($limit = 10)
    {
        $this->orderBy(['created_at' => SORT_DESC])->limit($limit);
        return $this;
    }
}

// 使用
$posts = Post::find()->published()->recent(5)->all();
```

### Laravel12 查询作用域

```php
class Post extends Model
{
    // 本地作用域
    public function scopePublished($query)
    {
        return $query->where('status', 1);
    }

    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderByDesc('created_at')->take($limit);
    }
}

// 使用
$posts = Post::published()->recent(5)->get();
```

## API 资源对比

### Yii2 数据导出

```php
class Post extends ActiveRecord
{
    public function fields()
    {
        return [
            'id',
            'title',
            'content',
            'author' => function () {
                return $this->user->name;
            },
        ];
    }
}

// 使用
$post->toArray(); // 返回 fields 定义的数据
```

### Laravel12 API 资源

```php
// php artisan make:resource PostResource

// app/Http/Resources/PostResource.php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'author' => $this->user->name,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}

// 使用
return PostResource::make($post);
return PostResource::collection($posts);
```