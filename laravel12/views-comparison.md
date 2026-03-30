---
title: 视图对比
date: 2026-03-30
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: models-comparison
next: routing-comparison
---

# 视图对比

## 模板系统对比

Yii2 使用原生 PHP 模板，Laravel12 使用 Blade 模板引擎。Blade 提供了更强大、更简洁的模板语法。

### Yii2 视图（原生 PHP）

```php
<!-- views/post/view.php -->
<?php
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/** @var yii\web\View $this */
/** @var app\models\Post $model */
?>

<h1><?= Html::encode($model->title) ?></h1>

<div class="content">
    <?= Html::encode($model->content) ?>
</div>

<?php if ($model->status == 1): ?>
    <span class="status">已发布</span>
<?php endif; ?>

<?php foreach ($model->comments as $comment): ?>
    <div class="comment">
        <?= Html::encode($comment->content) ?>
    </div>
<?php endforeach; ?>

<?= Html::a('编辑', ['edit', 'id' => $model->id], ['class' => 'btn']) ?>
```

### Laravel12 Blade 模板

```blade
<!-- resources/views/post/show.blade.php -->
@extends('layouts.app')

@section('title', $post->title)

@section('content')
<h1>{{ $post->title }}</h1>

<div class="content">
    {{ $post->content }}
</div>

@if($post->status == 1)
    <span class="status">已发布</span>
@endif

@foreach($post->comments as $comment)
    <div class="comment">
        {{ $comment->content }}
    </div>
@endforeach

<a href="{{ route('post.edit', $post->id) }}" class="btn">编辑</a>
@endsection
```

## 关键差异对比表

| 特性 | Yii2 | Laravel12 Blade |
|------|------|-----------------|
| 文件位置 | `views/` 目录 | `resources/views/` |
| 文件扩展名 | `.php` | `.blade.php` |
| 模板继承 | `beginContent()`/`endContent()` | `@extends` / `@section` |
| 输出转义 | `Html::encode()` | `{{ }}` 自动转义 |
| 原始输出 | 直接输出 | `{!! !!}` |
| 条件语句 | `<?php if(): ?>` | `@if` `@endif` |
| 循环语句 | `<?php foreach(): ?>` | `@foreach` `@endforeach` |
| 包含子视图 | `$this->render()` | `@include` |
| 布局 | 布局文件 + `$content` | `@extends` + `@section` |
| 组件 | Widget | Blade组件 / Livewire |

## Blade 基本语法

### 输出数据

```blade
<!-- 转义输出（安全） -->
{{ $variable }}
{{ $post->title }}
{{ strtoupper($post->title) }}

<!-- 原始输出（不转义，谨慎使用） -->
{!! $htmlContent !!}

<!-- 未转义但安全（Blade 7.x+） -->
{{ $variable }}         <!-- 自动转义 HTML -->
{!! $variable !!}       <!-- 不转义 -->

<!-- 注释 -->
{{-- 这是 Blade 注释，不会出现在 HTML 中 --}}
```

### 条件语句

```blade
@if($post->status == 1)
    <span>已发布</span>
@elseif($post->status == 0)
    <span>草稿</span>
@else
    <span>未知状态</span>
@endif

@unless($post->is_published)
    <span>未发布</span>
@endunless

@isset($post->title)
    <h1>{{ $post->title }}</h1>
@endisset

@empty($post->comments)
    <p>暂无评论</p>
@endempty

<!-- 三元运算符 -->
{{ $post->status ? '已发布' : '草稿' }}
```

### 循环语句

```blade
@foreach($posts as $post)
    <div>
        {{ $loop->index }}      <!-- 当前索引（从0开始） -->
        {{ $loop->iteration }}  <!-- 当前迭代次数（从1开始） -->
        {{ $loop->first }}      <!-- 是否第一个 -->
        {{ $loop->last }}       <!-- 是否最后一个 -->
        {{ $loop->count }}      <!-- 总数量 -->
        {{ $post->title }}
    </div>
@endforeach

@forelse($posts as $post)
    <div>{{ $post->title }}</div>
@empty
    <p>暂无文章</p>
@endforelse

@for($i = 0; $i < 10; $i++)
    {{ $i }}
@endfor

@while(true)
    <!-- 无限循环需手动 break -->
@endwhile
```

## 布局系统对比

### Yii2 布局

```php
<!-- views/layouts/main.php -->
<?php
use yii\helpers\Html;
use yii\widgets\Breadcrumbs;

$this->beginPage();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
</head>
<body>
<?php $this->beginBody() ?>

    <?= Breadcrumbs::widget(['links' => $this->params['breadcrumbs']]) ?>

    <?= $content ?>

<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>

<!-- 子布局 -->
<!-- views/layouts/column2.php -->
<?php $this->beginContent('@app/views/layouts/main.php'); ?>
<div class="container">
    <div class="sidebar"><?= $this->blocks['sidebar'] ?></div>
    <div class="content"><?= $content ?></div>
</div>
<?php $this->endContent(); ?>
```

### Laravel12 Blade 布局

```blade
<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>@yield('title', '默认标题')</title>
    @stack('styles')
</head>
<body>
    @include('partials.navbar')

    @yield('content')

    @stack('scripts')
</body>
</html>

<!-- 子布局 -->
<!-- resources/views/layouts/admin.blade.php -->
@extends('layouts.app')

@section('content')
<div class="container">
    <div class="sidebar">@yield('sidebar')</div>
    <div class="content">
        @parent    <!-- 包含父级 content -->
        @yield('main')
    </div>
</div>
@endsection
```

## 视图内容块对比

### Yii2 数据块

```php
<!-- 内容视图中定义 -->
<?php $this->beginBlock('sidebar'); ?>
<ul class="menu">
    <li>菜单1</li>
    <li>菜单2</li>
</ul>
<?php $this->endBlock(); ?>

<!-- 布局中使用 -->
<?= $this->blocks['sidebar'] ?? '默认内容' ?>
```

### Laravel12 Blade section

```blade
<!-- 内容视图中定义 -->
@extends('layouts.app')

@section('sidebar')
<ul class="menu">
    <li>菜单1</li>
    <li>菜单2</li>
</ul>
@endsection

@section('content')
<h1>{{ $post->title }}</h1>
@endsection

<!-- 布局中使用 -->
@yield('sidebar', '默认内容')
```

## 包含子视图对比

### Yii2 包含视图

```php
<!-- 在控制器中 -->
return $this->render('view', [
    'model' => $model,
    'items' => $items,
]);

<!-- 在视图中 -->
<?= $this->render('_item', ['item' => $item]) ?>

<!-- 传递部分数据 -->
<?= $this->render('_list', [
    'items' => $items,
    'showDate' => true,
]) ?>
```

### Laravel12 Blade include

```blade
<!-- 在控制器中 -->
return view('post.view', compact('post', 'comments'));

<!-- 在视图中 -->
@include('partials.item', ['item' => $item])

<!-- 包含存在检查 -->
@includeIf('partials.maybe-exists', ['data' => $data])

<!-- 条件包含 -->
@includeWhen($showFooter, 'partials.footer')

<!-- 包含循环 -->
@foreach($items as $item)
    @include('partials.item', ['item' => $item])
@endforeach

<!-- 或使用 each 方法 -->
@includeEach('partials.item', $items, 'item')
```

## 视图组件对比

### Yii2 小部件

```php
<!-- 使用小部件 -->
<?php $form = ActiveForm::begin(['id' => 'login-form']); ?>
    <?= $form->field($model, 'username') ?>
    <?= $form->field($model, 'password')->passwordInput() ?>
    <?= Html::submitButton('登录') ?>
<?php ActiveForm::end(); ?>

<!-- DatePicker 小部件 -->
<?= DatePicker::widget([
    'name' => 'date',
    'language' => 'zh-CN',
]) ?>

<!-- 自定义小部件 -->
<?= MenuWidget::widget(['items' => $menuItems]) ?>
```

### Laravel12 Blade 组件

```blade
<!-- 使用 Blade 组件 -->
<x-form :action="route('login')">
    <x-input name="username" :model="$user" />
    <x-input type="password" name="password" />
    <x-button>登录</x-button>
</x-form>

<!-- 属性传递 -->
<x-alert type="error" message="出错了！" />

<!-- 或使用插槽 -->
<x-alert type="error">
    <x-slot:title>
        错误提示
    </x-slot:title>
    出错了！请检查输入。
</x-alert>

<!-- 创建组件 -->
<!-- php artisan make:component Alert -->

<!-- resources/views/components/alert.blade.php -->
<div class="alert alert-{{ $type }}">
    @if(isset($title))
        <h4>{{ $title }}</h4>
    @endif
    {{ $slot }}
</div>
```

## 表单对比

### Yii2 ActiveForm

```php
<?php $form = ActiveForm::begin([
    'id' => 'post-form',
    'action' => ['post/update', 'id' => $model->id],
]); ?>

    <?= $form->field($model, 'title')->textInput(['maxlength' => 255]) ?>

    <?= $form->field($model, 'content')->textarea(['rows' => 5]) ?>

    <?= $form->field($model, 'status')->dropDownList([
        0 => '草稿',
        1 => '已发布',
    ]) ?>

    <?= $form->field($model, 'tags')->checkboxList(['php', 'laravel', 'yii']) ?>

    <?= Html::submitButton('保存', ['class' => 'btn btn-primary']) ?>

<?php ActiveForm::end(); ?>

<!-- 带验证错误显示 -->
<!-- 自动显示模型验证错误 -->
```

### Laravel12 表单

```blade
<!-- 传统 HTML 表单 -->
<form action="{{ route('post.update', $post->id) }}" method="POST">
    @csrf
    @method('PUT')

    <div>
        <label for="title">标题</label>
        <input type="text" name="title" id="title" value="{{ old('title', $post->title) }}">
        @error('title')
            <span class="error">{{ $message }}</span>
        @enderror
    </div>

    <div>
        <label for="content">内容</label>
        <textarea name="content" id="content" rows="5">{{ old('content', $post->content) }}</textarea>
    </div>

    <button type="submit">保存</button>
</form>

<!-- 或使用 Laravel Collective（需安装） -->
<!-- composer require laravelcollective/html -->

{!! Form::open(['route' => ['post.update', $post->id], 'method' => 'PUT']) !!}
    {!! Form::text('title', $post->title) !!}
    {!! Form::textarea('content', $post->content) !!}
    {!! Form::submit('保存') !!}
{!! Form::close() !!}
```

## CSRF 保护对比

### Yii2 CSRF

```php
<!-- 自动在 ActiveForm 中添加 -->
<!-- 手动添加 -->
<?= Html::csrfMetaTags() ?>

<!-- 或在隐藏字段 -->
<?= Html::hiddenInput(Yii::$app->request->csrfParam, Yii::$app->request->csrfToken) ?>
```

### Laravel12 CSRF

```blade
<!-- Blade 自动添加 CSRF 字段 -->
<form method="POST">
    @csrf
    ...
</form>

<!-- 或手动 -->
<input type="hidden" name="_token" value="{{ csrf_token() }}">
```

## 数据共享对比

### Yii2 视图数据共享

```php
// 控制器推送数据
return $this->render('view', [
    'model' => $model,
    'data' => $data,
]);

// 视图组件 params 共享
$this->params['breadcrumbs'][] = '页面标题';

// 布局中访问 params
<?= isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [] ?>
```

### Laravel12 视图数据共享

```php
// 控制器传递数据
return view('view', compact('model', 'data'));

// 全局共享数据（View::share）
// 在 AppServiceProvider 中
View::share('siteName', 'My Blog');

// 视图 Composer（自动附加数据）
View::composer('post.*', function ($view) {
    $view->with('categories', Category::all());
});

// 视图 Creator（创建时立即执行）
View::creator('post.*', PostViewCreator::class);
```

## URL 生成对比

### Yii2 URL 生成

```php
// 控制器内
$url = $this->createUrl(['post/view', 'id' => 1]);
$url = $this->redirect(['post/view', 'id' => 1]);

// 视图中
<?= Html::a('链接', ['post/view', 'id' => 1]) ?>
<?= Url::to(['post/view', 'id' => 1]) ?>

// 绝对 URL
<?= Url::to(['post/view', 'id' => 1], true) ?>
```

### Laravel12 URL 生成

```blade
<!-- 路由名称生成 -->
{{ route('post.show', $post->id) }}
{{ route('post.show', ['id' => $post->id, 'page' => 1]) }}

<!-- 控制器动作 -->
{{ action([PostController::class, 'show'], $post->id) }}

<!-- URL 到路径 -->
{{ url('/posts/1') }}
{{ secure_url('/posts/1') }} <!-- HTTPS -->

<!-- 当前 URL -->
{{ url()->current() }}
{{ url()->full() }}
{{ url()->previous() }}

<!-- 链接生成 -->
<a href="{{ route('post.show', $post->id) }}">查看文章</a>
```

## JavaScript 和 CSS 管理

### Yii2 资源管理

```php
// 注册 CSS
$this->registerCssFile('/css/style.css');
$this->registerCss('body { background: #fff; }');

// 注册 JS
$this->registerJsFile('/js/app.js', ['position' => View::POS_END]);
$this->registerJs('alert("Hello");', View::POS_READY);

// 资源包定义
class AppAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = ['css/style.css'];
    public $js = ['js/app.js'];
    public $depends = [YiiAsset::class];
}

// 视图中注册
AppAsset::register($this);
```

### Laravel12 Vite / Mix

```blade
<!-- 使用 Vite（Laravel 9+ 默认） -->
@vite(['resources/css/app.css', 'resources/js/app.js'])

<!-- 或 Mix -->
<link rel="stylesheet" href="{{ mix('css/app.css') }}">
<script src="{{ mix('js/app.js') }}"></script>

<!-- 内联样式 -->
@push('styles')
<style>
    body { background: #fff; }
</style>
@endpush

<!-- 内联脚本 -->
@push('scripts')
<script>
    alert("Hello");
</script>
@endpush

<!-- 布局中 -->
@stack('styles')
@stack('scripts')
```

## 最佳实践对比

### Yii2 视图最佳实践

- 主要包含展示代码
- 不应包含数据查询代码
- 应避免直接访问请求数据
- 可读取模型属性但不修改
- 使用布局展示公共代码
- 使用小部件封装可重用视图块

### Laravel12 Blade 最佳实践

- 保持视图简洁
- 业务逻辑放控制器或服务类
- 使用 Blade 组件封装可复用 UI
- 使用视图 Composer 共享数据
- 使用 `@once` 防止重复渲染
- 合理使用 `@push` / `@stack` 管理资源