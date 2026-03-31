---
title: 数据库操作对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/middleware-comparison
next: /laravel12/service-container
---

# 数据库操作对比

## 数据库配置对比

### Yii2 数据库配置

```php
// config/db.php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=mydb',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'tablePrefix' => 'tbl_',

    // 缓存 schema
    'enableSchemaCache' => true,
    'schemaCacheDuration' => 3600,
    'schemaCache' => 'cache',

    // 查询缓存
    'enableQueryCache' => true,
    'queryCacheDuration' => 3600,
];

// 多数据库连接
'db' => [...],
'db2' => [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=backup;dbname=mydb',
],
```

### Laravel12 数据库配置

```php
// config/database.php
return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
        ],

        'sqlite' => [
            'driver' => 'sqlite',
            'database' => database_path('database.sqlite'),
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', '127.0.0.1'),
            // ...
        ],
    ],
];
```

## 查询构建器对比

### Yii2 查询构建器

```php
use yii\db\Query;

// 基本查询
$query = new Query();
$rows = $query->select(['id', 'title'])
    ->from('posts')
    ->where(['status' => 1])
    ->orderBy(['created_at' => SORT_DESC])
    ->limit(10)
    ->all();

// 或使用 ActiveRecord
$posts = Post::find()
    ->select(['id', 'title'])
    ->where(['status' => 1])
    ->orderBy('created_at DESC')
    ->all();

// 条件查询
$query->where(['status' => 1])
    ->andWhere(['>', 'views', 100])
    ->orWhere(['featured' => true]);

// 原生 SQL
$sql = 'SELECT * FROM posts WHERE status = :status';
$posts = Yii::$app->db->createCommand($sql, ['status' => 1])->queryAll();

// 命令执行
Yii::$app->db->createCommand()->insert('posts', ['title' => 'New Post'])->execute();
Yii::$app->db->createCommand()->update('posts', ['status' => 0], 'id = :id', ['id' => 1])->execute();
Yii::$app->db->createCommand()->delete('posts', 'id = :id', ['id' => 1])->execute();
```

### Laravel12 查询构建器

```php
use Illuminate\Support\Facades\DB;

// 基本查询
$posts = DB::table('posts')
    ->select('id', 'title')
    ->where('status', 1)
    ->orderByDesc('created_at')
    ->limit(10)
    ->get();

// 或使用 Eloquent
$posts = Post::query()
    ->select('id', 'title')
    ->where('status', 1)
    ->orderByDesc('created_at')
    ->take(10)
    ->get();

// 条件查询
DB::table('posts')
    ->where('status', 1)
    ->where('views', '>', 100)
    ->orWhere('featured', true);

// 原生 SQL
$posts = DB::select('SELECT * FROM posts WHERE status = ?', [1]);

// 命令执行
DB::table('posts')->insert(['title' => 'New Post']);
DB::table('posts')->where('id', 1)->update(['status' => 0]);
DB::table('posts')->where('id', 1)->delete();
```

## 条件表达式对比

### Yii2 条件语法

```php
// 哈希条件
$query->where(['status' => 1, 'author_id' => 2]);

// 比较条件
$query->where(['>', 'views', 100]);
$query->where(['<=', 'created_at', '2026-01-01']);

// LIKE
$query->where(['like', 'title', 'yii']);
$query->where(['like', 'title', '%yii%', false]); // 不自动加 %

// IN
$query->where(['in', 'status', [1, 2, 3]]);
$query->where(['not in', 'status', [0, 4]]);

// BETWEEN
$query->where(['between', 'views', 100, 500]);

// EXISTS
$query->where(['exists', (new Query())->select('id')->from('comments')->where(['post_id' => new Expression('id'))]);

// NULL
$query->where(['is', 'deleted_at', null]);
$query->where(['is not', 'deleted_at', null]);

// 组合条件
$query->where([
    'and',
    ['status' => 1],
    ['>', 'views', 100],
    ['or', ['featured' => true], ['priority' => 'high']],
]);
```

### Laravel12 条件语法

```php
// 哈希条件
DB::table('posts')->where(['status' => 1, 'author_id' => 2]);

// 比较条件
DB::table('posts')->where('views', '>', 100);
DB::table('posts')->where('created_at', '<=', '2026-01-01');

// LIKE
DB::table('posts')->where('title', 'like', '%yii%');
DB::table('posts')->where('title', 'like', 'yii%');

// IN
DB::table('posts')->whereIn('status', [1, 2, 3]);
DB::table('posts')->whereNotIn('status', [0, 4]);

// BETWEEN
DB::table('posts')->whereBetween('views', [100, 500]);

// NULL
DB::table('posts')->whereNull('deleted_at');
DB::table('posts')->whereNotNull('deleted_at');

// EXISTS
DB::table('posts')->whereExists(function ($query) {
    $query->select('id')->from('comments')->whereColumn('post_id', 'posts.id');
});

// 闭包条件（分组）
DB::table('posts')->where(function ($query) {
    $query->where('status', 1)
          ->where('views', '>', 100);
})->orWhere(function ($query) {
    $query->where('featured', true)
          ->where('priority', 'high');
});

// JSON 条件（MySQL）
DB::table('users')->where('options->language', 'en');
DB::table('users')->whereJsonContains('options->languages', 'en');
```

## 聚合查询对比

### Yii2 聚合

```php
// 计数
$count = Post::find()->where(['status' => 1])->count();

// SUM
$totalViews = Post::find()->sum('views');

// AVG
$avgViews = Post::find()->average('views');

// MIN/MAX
$minViews = Post::find()->min('views');
$maxViews = Post::find()->max('views');

// GROUP BY
$stats = Post::find()
    ->select(['status', 'COUNT(*) as count'])
    ->groupBy('status')
    ->asArray()
    ->all();

// HAVING
$query->groupBy('category_id')
    ->having(['>', 'COUNT(*)', 5]);
```

### Laravel12 聚合

```php
// 计数
$count = Post::where('status', 1)->count();

// SUM
$totalViews = Post::sum('views');

// AVG
$avgViews = Post::avg('views');

// MIN/MAX
$minViews = Post::min('views');
$maxViews = Post::max('views');

// GROUP BY
$stats = Post::select('status', DB::raw('COUNT(*) as count'))
    ->groupBy('status')
    ->get();

// 或使用聚合方法
$stats = Post::selectRaw('status, COUNT(*) as count')
    ->groupBy('status')
    ->pluck('count', 'status');

// HAVING
DB::table('posts')
    ->select('category_id', DB::raw('COUNT(*) as count'))
    ->groupBy('category_id')
    ->having('count', '>', 5)
    ->get();
```

## JOIN 查询对比

### Yii2 JOIN

```php
// 内连接
$posts = Post::find()
    ->innerJoin('users', 'posts.user_id = users.id')
    ->where(['users.status' => 1])
    ->all();

// 左连接
$posts = Post::find()
    ->leftJoin('comments', 'posts.id = comments.post_id')
    ->all();

// joinWith（使用关联）
$posts = Post::find()
    ->joinWith('user')
    ->where(['user.status' => 1])
    ->all();

// 多表关联
$posts = Post::find()
    ->joinWith('user.profile')
    ->all();
```

### Laravel12 JOIN

```php
// 内连接
$posts = DB::table('posts')
    ->join('users', 'posts.user_id', '=', 'users.id')
    ->where('users.status', 1)
    ->get();

// 左连接
$posts = DB::table('posts')
    ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
    ->get();

// 右连接
$posts = DB::table('posts')
    ->rightJoin('comments', 'posts.id', '=', 'comments.post_id')
    ->get();

// 高级 JOIN 条件
$posts = DB::table('posts')
    ->join('users', function ($join) {
        $join->on('posts.user_id', '=', 'users.id')
             ->where('users.status', 1);
    })
    ->get();

// 使用关联预加载
$posts = Post::with('user')->whereHas('user', fn($q) => $q->where('status', 1))->get();
```

## 子查询对比

### Yii2 子查询

```php
// 子查询作为条件
$subQuery = (new Query())->select('post_id')->from('comments')->where(['status' => 1]);

$posts = Post::find()
    ->where(['in', 'id', $subQuery])
    ->all();

// 子查询作为字段
$query->select([
    'id',
    'title',
    'comment_count' => (new Query())
        ->select('COUNT(*)')
        ->from('comments')
        ->where(['post_id' => new Expression('id')),
]);
```

### Laravel12 子查询

```php
// 子查询作为条件
$posts = Post::whereIn('id', function ($query) {
    $query->select('post_id')->from('comments')->where('status', 1);
})->get();

// 子查询作为字段
$posts = Post::addSelect([
    'comment_count' => Comment::selectRaw('COUNT(*)')
        ->whereColumn('post_id', 'posts.id')
])->get();

// whereExists 子查询
$posts = Post::whereExists(function ($query) {
    $query->select('id')
        ->from('comments')
        ->whereColumn('post_id', 'posts.id')
        ->where('status', 1);
})->get();
```

## 分页对比

### Yii2 分页

```php
// 使用 Pagination 对象
$query = Post::find()->where(['status' => 1]);

$pagination = new Pagination([
    'totalCount' => $query->count(),
    'pageSize' => 20,
    'page' => Yii::$app->request->get('page', 0),
]);

$posts = $query
    ->offset($pagination->offset)
    ->limit($pagination->limit)
    ->all();

// 视图中显示分页
echo LinkPager::widget(['pagination' => $pagination]);

// 或使用 ActiveDataProvider
$dataProvider = new ActiveDataProvider([
    'query' => Post::find(),
    'pagination' => ['pageSize' => 20],
]);

// GridView 中使用
GridView::widget([
    'dataProvider' => $dataProvider,
]);
```

### Laravel12 分页

```php
// 简单分页
$posts = Post::where('status', 1)->paginate(20);

// 视图中显示
@foreach ($posts as $post)
    {{ $post->title }}
@endforeach

{{ $posts->links() }}

// 分页信息
$posts->count();       // 当前页数量
$posts->total();       // 总数量
$posts->currentPage(); // 当前页码
$posts->lastPage();    // 最后页码
$posts->perPage();     // 每页数量
$posts->firstItem();   // 第一项索引
$posts->lastItem();    // 最后项索引

// 简单分页（无总数查询，更快）
$posts = Post::simplePaginate(20);

// 游标分页（大数据量高效）
$posts = Post::cursorPaginate(20);

// 自定义分页视图
{{ $posts->links('pagination.custom') }}
```

## 事务对比

### Yii2 事务

```php
// 自动事务
Yii::$app->db->transaction(function () {
    $post = new Post(['title' => 'New Post']);
    $post->save();

    $comment = new Comment(['post_id' => $post->id, 'content' => 'Comment']);
    $comment->save();
});

// 手动事务
$transaction = Yii::$app->db->beginTransaction();
try {
    $post->save();
    $comment->save();
    $transaction->commit();
} catch (\Exception $e) {
    $transaction->rollBack();
    throw $e;
}

// ActiveRecord 方法事务
$post = Post::findOne(1);
$post->delete(); // 自动事务
```

### Laravel12 事务

```php
// 自动事务
DB::transaction(function () {
    $post = Post::create(['title' => 'New Post']);
    Comment::create(['post_id' => $post->id, 'content' => 'Comment']);
});

// 手动事务
DB::beginTransaction();
try {
    $post->save();
    $comment->save();
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}

// 事务尝试次数
DB::transaction(function () {
    // ...
}, 5); // 重试5次

// 死锁处理
DB::transaction(function () {
    // ...
}, 5, function ($attempt, $e) {
    if ($attempt >= 5 || !str_contains($e->getMessage(), 'Deadlock')) {
        throw $e;
    }
    // 等待后重试
});
```

## 数据库迁移对比

### Yii2 迁移

```bash
# 创建迁移
php yii migrate/create create_post_table

# 执行迁移
php yii migrate

# 回滚
php yii migrate/down
php yii migrate/down 3
```

```php
// migrations/m240101_000000_create_post_table.php
class m240101_000000_create_post_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('posts', [
            'id' => $this->primaryKey(),
            'title' => $this->string(255)->notNull(),
            'content' => $this->text(),
            'status' => $this->smallInteger()->defaultValue(0),
            'user_id' => $this->integer(),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        $this->createIndex('idx-post-status', 'posts', 'status');
        $this->addForeignKey('fk-post-user', 'posts', 'user_id', 'users', 'id');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-post-user', 'posts');
        $this->dropTable('posts');
    }
}
```

### Laravel12 迁移

```bash
# 创建迁移
php artisan make:migration create_posts_table

# 执行迁移
php artisan migrate

# 回滚
php artisan migrate:rollback
php artisan migrate:rollback --step=3

# 重置
php artisan migrate:fresh --seed
```

```php
// database/migrations/2026_01_01_000000_create_posts_table.php
class CreatePostsTable extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('content')->nullable();
            $table->smallInteger('status')->default(0);
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
}
```

## 模型工厂对比

### Yii2 无内置工厂

```php
// 手动创建测试数据
$post = new Post([
    'title' => 'Test Title',
    'content' => 'Test Content',
    'status' => 1,
]);
$post->save();

// 或使用 fixtures
class PostFixture extends Fixture
{
    public function load()
    {
        $post = new Post(['title' => 'Test']);
        $post->save();
    }
}
```

### Laravel12 模型工厂

```php
// database/factories/PostFactory.php
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'status' => fake()->randomElement([0, 1, 2]),
            'user_id' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn() => ['status' => 1]);
    }
}

// 使用
$post = Post::factory()->create();
$posts = Post::factory()->count(10)->create();
$post = Post::factory()->published()->create();

// 测试中使用
public function test_post_creation()
{
    $post = Post::factory()->create();
    $this->assertDatabaseHas('posts', ['id' => $post->id]);
}
```

## 数据填充对比

### Yii2 数据填充

```bash
# 执行填充
php yii fixture/load Post
```

### Laravel12 数据填充

```bash
# 创建 Seeder
php artisan make:seeder PostSeeder

# 执行填充
php artisan db:seed
php artisan db:seed --class=PostSeeder
```

```php
// database/seeders/PostSeeder.php
class PostSeeder extends Seeder
{
    public function run(): void
    {
        Post::factory()->count(50)->create();
    }
}

// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PostSeeder::class,
            CommentSeeder::class,
        ]);
    }
}
```

## 最佳实践对比

### Yii2 数据库最佳实践

- 使用 `yii\db\Query` 处理复杂查询
- 使用 ActiveRecord 处理 CRUD
- 配置 `enableSchemaCache` 优化性能
- 使用 `yii\db\Transaction` 处理事务
- 使用迁移管理数据库结构

### Laravel12 数据库最佳实践

- Eloquent 用于简单 CRUD，Query Builder 用于复杂查询
- 使用 `paginate()` 避免大结果集
- 使用模型工厂简化测试数据创建
- 使用迁移和 Seeder 管理数据库
- 使用 `cursor()` 处理大数据流式处理