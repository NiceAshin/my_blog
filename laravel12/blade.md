---
title: Blade 模板引擎
date: 2026-03-31
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/eloquent
next: false
---

# Blade 模板引擎

Blade 是 Laravel 内置的强大模板引擎，提供简洁的语法和丰富的功能。

## 基本语法

### 输出数据

```blade
{{-- 转义输出（推荐，防止 XSS） --}}
{{ $title }}
{{ $post->title }}
{{ strtoupper($title) }}

{{-- 原始输出（不转义，谨慎使用） --}}
{!! $htmlContent !!}

{{-- 未定义变量默认值 --}}
{{ $title ?? '默认标题' }}

{{-- 转义 JSON --}}
@json($data)
@json($data, JSON_PRETTY_PRINT)

{{-- 注释（不会出现在 HTML 中） --}}
{{-- 这是 Blade 注释 --}}
```

### Blade 指令

```blade
{{-- @if @elseif @else @endif --}}
@if($post->status === 'published')
    <span class="badge">已发布</span>
@elseif($post->status === 'draft')
    <span class="badge">草稿</span>
@else
    <span class="badge">未知</span>
@endif

{{-- @unless --}}
@unless($post->is_featured)
    <span>普通文章</span>
@endunless

{{-- @isset @empty --}}
@isset($post->title)
    <h1>{{ $post->title }}</h1>
@endisset

@empty($post->comments)
    <p>暂无评论</p>
@endempty

{{-- @auth @guest --}}
@auth
    <p>欢迎，{{ auth()->user()->name }}</p>
@endauth

@guest
    <a href="{{ route('login') }}">登录</a>
@endguest

{{-- @production @env --}}
@production
    <script src="{{ asset('js/app.js') }}"></script>
@endproduction

@env('local')
    <p>开发环境</p>
@endenv
```

### 循环指令

```blade
{{-- @for --}}
@for($i = 0; $i < 10; $i++)
    <li>{{ $i }}</li>
@endfor

{{-- @foreach --}}
@foreach($posts as $post)
    <article>
        {{ $loop->index }}       {{-- 索引（从0开始） --}}
        {{ $loop->iteration }}   {{-- 迭代次数（从1开始） --}}
        {{ $loop->first }}       {{-- 是否第一个 --}}
        {{ $loop->last }}        {{-- 是否最后一个 --}}
        {{ $loop->count }}       {{-- 总数量 --}}
        {{ $loop->even }}        {{-- 是否偶数项 --}}
        {{ $loop->odd }}         {{-- 是否奇数项 --}}
        {{ $post->title }}
    </article>
@endforeach

{{-- @forelse（空数据时显示默认内容） --}}
@forelse($posts as $post)
    <div>{{ $post->title }}</div>
@empty
    <p>暂无文章</p>
@endforelse

{{-- @while --}}
@while(true)
    {{-- 需要手动 break --}}
@endwhile

{{-- @continue @break --}}
@foreach($posts as $post)
    @continue($post->status === 'draft')
    <div>{{ $post->title }}</div>
    @break($loop->iteration > 10)
@endforeach

{{-- 循环变量 --}}
@foreach($posts as $post)
    @if($loop->first)
        <div class="first">{{ $post->title }}</div>
    @elseif($loop->last)
        <div class="last">{{ $post->title }}</div>
    @else
        <div>{{ $post->title }}</div>
    @endif
@endforeach
```

## 布局系统

### 模板继承

```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', '我的网站')</title>
    @stack('styles')
</head>
<body>
    @include('partials.header')

    <main>
        @yield('content')
    </main>

    @include('partials.footer')

    @stack('scripts')
</body>
</html>
```

```blade
{{-- 子模板 --}}
@extends('layouts.app')

@section('title', '文章列表')

@section('content')
<div class="posts">
    @foreach($posts as $post)
        <article>{{ $post->title }}</article>
    @endforeach
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/posts.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/posts.js') }}"></script>
@endpush
```

### @section 和 @yield

```blade
{{-- 定义区块 --}}
@section('sidebar')
    <div class="sidebar">
        {{-- 内容 --}}
    </div>
@endsection

{{-- 输出区块 --}}
@yield('sidebar')

{{-- 带默认值 --}}
@yield('title', '默认标题')

{{-- 追加内容 --}}
@section('sidebar')
    @parent  {{-- 保留父级内容 --}}
    <div>追加内容</div>
@endsection
```

### @stack 和 @push

```blade
{{-- 定义堆栈 --}}
<head>
    @stack('styles')
</head>
<body>
    @stack('scripts')
</body>

{{-- 推送到堆栈 --}}
@push('styles')
<link rel="stylesheet" href="{{ asset('css/custom.css') }}">
@endpush

{{-- 预置到堆栈开头 --}}
@prepend('scripts')
<script src="{{ asset('js/jquery.js') }}"></script>
@endprepend
```

## 组件系统

### 定义组件

```bash
# 创建组件
php artisan make:component Alert
php artisan make:component Components/Alert
```

```php
// app/View/Components/Alert.php
namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Alert extends Component
{
    public function __construct(
        public string $type = 'info',
        public ?string $title = null,
        public bool $dismissible = false,
    ) {}

    public function render(): View|Closure|string
    {
        return view('components.alert');
    }

    // 组件方法
    public function classes(): string
    {
        return "alert alert-{$this->type}";
    }
}
```

```blade
{{-- resources/views/components/alert.blade.php --}}
<div {{ $attributes->merge(['class' => $this->classes()]) }}>
    @if($title)
        <h4 class="alert-title">{{ $title }}</h4>
    @endif

    {{ $slot }}

    @if($dismissible)
        <button type="button" class="close" data-dismiss="alert">×</button>
    @endif
</div>
```

### 使用组件

```blade
{{-- 基本使用 --}}
<x-alert type="error" title="错误">
    操作失败，请重试。
</x-alert>

{{-- 传递属性 --}}
<x-alert type="success" dismissible class="mb-4">
    保存成功！
</x-alert>

{{-- 插槽 --}}
<x-card>
    <x-slot:title>
        <h3>卡片标题</h3>
    </x-slot:title>

    <p>卡片内容...</p>

    <x-slot:footer>
        <button>确定</button>
    </x-slot:footer>
</x-card>

{{-- 动态组件 --}}
<x-dynamic-component :component="$componentName" :data="$data" />
```

### 内联组件

```blade
{{-- resources/views/components/button.blade.php --}}
@props(['type' => 'primary'])

<button {{ $attributes->merge(['class' => "btn btn-{$type}"]) }}>
    {{ $slot }}
</button>
```

### 组件属性

```blade
{{-- 组件中访问属性 --}}
<div {{ $attributes }}>
    {{-- $attributes->get('class') --}}
    {{-- $attributes->has('class') --}}
    {{-- $attributes->merge(['class' => 'additional']) --}}
</div>

{{-- @props 指令定义属性 --}}
@props(['type' => 'info'])
<div class="alert alert-{{ $type }}">
    {{ $slot }}
</div>
```

## 包含子视图

### @include

```blade
{{-- 包含视图 --}}
@include('partials.header')

{{-- 传递数据 --}}
@include('partials.post-card', ['post' => $post])

{{-- 条件包含 --}}
@includeIf('partials.maybe-exists')

{{-- 存在时包含 --}}
@includeWhen($showFooter, 'partials.footer')

{{-- 循环包含 --}}
@includeFirst(['custom.header', 'partials.header'])
```

### @each

```blade
{{-- 循环包含 --}}
@each('partials.post-card', $posts, 'post')

{{-- 带空视图 --}}
@each('partials.post-card', $posts, 'post', 'partials.empty')
```

## 表单

### CSRF 保护

```blade
<form method="POST" action="{{ route('posts.store') }}">
    @csrf
    {{-- 等同于 --}}
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>

{{-- PUT/PATCH/DELETE 方法 --}}
<form method="POST" action="{{ route('posts.update', $post) }}">
    @csrf
    @method('PUT')
</form>
```

### 表单错误

```blade
<form action="{{ route('posts.store') }}" method="POST">
    @csrf

    <div class="form-group">
        <label for="title">标题</label>
        <input type="text" name="title" id="title" value="{{ old('title') }}"
               class="@error('title') is-invalid @enderror">
        @error('title')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>

    <div class="form-group">
        <label for="content">内容</label>
        <textarea name="content" id="content">{{ old('content') }}</textarea>
        @error('content')
            <span class="error">{{ $message }}</span>
        @enderror
    </div>

    <button type="submit">提交</button>
</form>
```

### 错误处理指令

```blade
{{-- 检查是否有错误 --}}
@if($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

{{-- @error 指令 --}}
@error('email')
    <span class="error">{{ $message }}</span>
@enderror

{{-- 检查特定字段错误 --}}
@if($errors->has('email'))
    <span class="error">{{ $errors->first('email') }}</span>
@endif
```

## 控制结构

### @php

```blade
{{-- 内联 PHP --}}
@php
    $count = 0;
    $status = 'active';
@endphp

{{-- 不推荐在视图中写复杂逻辑 --}}
```

### @inject

```blade
{{-- 注入服务 --}}
@inject('metrics', 'App\Services\MetricsService')

<div>
    月度收入: {{ $metrics->monthlyRevenue() }}
</div>
```

### @once

```blade
{{-- 只渲染一次 --}}
@once
    <script>
        // 这段代码在页面中只出现一次
        console.log('只执行一次');
    </script>
@endonce
```

### @spaceless

```blade
{{-- 移除空白 --}}
@spaceless
    <div>
        <span>文本</span>
    </div>
@endspaceless
```

## JavaScript 变量

```blade
{{-- @vite --}}
@vite(['resources/css/app.css', 'resources/js/app.js'])

{{-- 传递变量到 JS --}}
<script>
    const user = @json(auth()->user());
    const config = @json([
        'baseUrl' => url('/'),
        'csrfToken' => csrf_token(),
    ]);
</script>

{{-- 或使用 window 对象 --}}
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        user: @json(auth()->user())
    };
</script>
```

## 自定义指令

```php
// AppServiceProvider 中注册
use Illuminate\Support\Facades\Blade;

public function boot(): void
{
    // 自定义 @datetime 指令
    Blade::directive('datetime', function (string $expression) {
        return "<?php echo ($expression)->format('Y-m-d H:i:s'); ?>";
    });

    // 自定义 @currency 指令
    Blade::directive('currency', function (string $expression) {
        return "<?php echo '¥' . number_format($expression, 2); ?>";
    });

    // 自定义 @admin 指令
    Blade::if('admin', function () {
        return auth()->check() && auth()->user()->isAdmin();
    });
}
```

```blade
{{-- 使用自定义指令 --}}
<span>@datetime($post->created_at)</span>
<span>@currency($order->amount)</span>

@admin
    <a href="{{ route('admin.dashboard') }}">管理后台</a>
@endadmin
```

## 视图组合器

```php
// 创建视图组合器
// app/View/Composers/ProfileComposer.php
namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    public function __construct(
        protected UserRepository $users
    ) {}

    public function compose(View $view): void
    {
        $view->with('user', $this->users->current());
    }
}

// 注册视图组合器
// AppServiceProvider 中
use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades\View;

public function boot(): void
{
    // 为特定视图添加数据
    View::composer('profile', ProfileComposer::class);

    // 多个视图
    View::composer(['profile', 'dashboard'], ProfileComposer::class);

    // 通配符
    View::composer('posts.*', function (View $view) {
        $view->with('categories', Category::all());
    });

    // 视图创建器（在视图创建时立即执行）
    View::creator('profile', ProfileCreator::class);
}
```

## 最佳实践

### 1. 保持视图简洁

```blade
{{-- 错误：视图中有业务逻辑 --}}
@if(auth()->user()->posts()->where('status', 'published')->count() > 0)
    <p>有已发布的文章</p>
@endif

{{-- 正确：在控制器中处理 --}}
@if($hasPublishedPosts)
    <p>有已发布的文章</p>
@endif
```

### 2. 使用组件封装可复用 UI

```blade
{{-- 错误：重复的 HTML --}}
<div class="card">
    <div class="card-header">{{ $title }}</div>
    <div class="card-body">{{ $content }}</div>
</div>

{{-- 正确：使用组件 --}}
<x-card :title="$title">
    {{ $content }}
</x-card>
```

### 3. 合理使用布局

```blade
{{-- 多个布局 --}}
@extends('layouts.app')      {{-- 前台布局 --}}
@extends('layouts.admin')    {{-- 后台布局 --}}
@extends('layouts.print')    {{-- 打印布局 --}}
```

### 4. 避免在视图中查询数据库

```blade
{{-- 错误 --}}
@foreach(App\Models\Category::all() as $category)
    <li>{{ $category->name }}</li>
@endforeach

{{-- 正确：在控制器中预加载 --}}
@foreach($categories as $category)
    <li>{{ $category->name }}</li>
@endforeach
```

### 5. 使用视图名称约定

```
resources/views/
├── layouts/
│   ├── app.blade.php
│   └── admin.blade.php
├── partials/
│   ├── header.blade.php
│   └── footer.blade.php
├── components/
│   ├── alert.blade.php
│   └── card.blade.php
├── posts/
│   ├── index.blade.php
│   ├── show.blade.php
│   ├── create.blade.php
│   └── edit.blade.php
└── errors/
    ├── 404.blade.php
    └── 500.blade.php
```