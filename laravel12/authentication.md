---
title: 认证系统
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/facades
next: /laravel12/api
---

# 认证系统

Laravel 提供了完整的用户认证解决方案，包括用户登录、注册、密码重置、邮箱验证等功能。本章将深入讲解 Laravel12 的认证系统。

## 快速入门

### Starter Kits

Laravel 提供了官方的 Starter Kits 快速搭建认证系统：

```bash
# Laravel Breeze - 简洁轻量
composer require laravel/breeze --dev
php artisan breeze:install

# Laravel Jetstream - 功能丰富（支持双因素认证）
composer require laravel/jetstream
php artisan jetstream:install livewire
# 或使用 Inertia
php artisan jetstream:install inertia
```

### 手动实现认证

如果需要完全自定义认证逻辑：

```php
// routes/web.php
use App\Http\Controllers\AuthController;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

Route::post('logout', [AuthController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
```

```php
// app/Http/Controllers/AuthController.php
class AuthController extends Controller
{
    public function create()
    {
        return view('auth.login');
    }

    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
```

## 认证守卫（Guards）

### 配置守卫

```php
// config/auth.php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],

    'admin' => [
        'driver' => 'session',
        'provider' => 'admins',
    ],
],

'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => App\Models\User::class,
    ],

    'admins' => [
        'driver' => 'eloquent',
        'model' => App\Models\Admin::class,
    ],
],
```

### 使用守卫

```php
// 获取默认守卫的用户
$user = auth()->user();
$user = Auth::user();

// 使用特定守卫
$admin = Auth::guard('admin')->user();
$admin = auth('admin')->user();

// 检查认证状态
if (Auth::check()) {
    // 用户已登录
}

// 尝试认证
if (Auth::attempt(['email' => $email, 'password' => $password])) {
    // 认证成功
    $request->session()->regenerate();
}

// 记住我功能
if (Auth::attempt($credentials, $remember)) {
    // 带记住我的认证
}

// 单次登录（不持久化）
if (Auth::once($credentials)) {
    // 本次请求有效
}
```

## 用户授权

### Gates

Gate 是基于闭包的授权方式：

```php
// app/Providers/AuthServiceProvider.php
use App\Models\Post;
use App\Policies\PostPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class => PostPolicy::class,
    ];

    public function boot(): void
    {
        // 定义 Gate
        Gate::define('access-admin', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('update-post', function (User $user, Post $post) {
            return $user->id === $post->user_id;
        });

        // 使用策略
        Gate::resource('posts', PostPolicy::class);
    }
}
```

### 使用 Gate

```php
// 控制器中
if (Gate::denies('update-post', $post)) {
    abort(403);
}

// 隐式授权检查
if ($request->user()->cannot('update-post', $post)) {
    abort(403);
}

// 授权通过后继续
Gate::authorize('update-post', $post);

// 返回授权结果
$canUpdate = Gate::allows('update-post', $post);
```

```blade
{{-- Blade 模板中 --}}
@can('update-post', $post)
    <a href="{{ route('posts.edit', $post) }}">编辑</a>
@endcan

@cannot('delete-post', $post)
    <span class="text-muted">无权删除</span>
@endcannot
```

### Policies

Policy 是针对模型的授权策略：

```php
// 生成 Policy
php artisan make:policy PostPolicy --model=Post

// app/Policies/PostPolicy.php
class PostPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Post $post): bool
    {
        return $post->is_published || $user->id === $post->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Post $post): bool
    {
        return $this->update($user, $post);
    }
}
```

### 控制器授权

```php
class PostController extends Controller
{
    public function __construct()
    {
        // 控制器中间件授权
        $this->authorizeResource(Post::class, 'post');
    }

    public function edit(Post $post)
    {
        // 自动授权检查
        return view('posts.edit', compact('post'));
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        // 手动授权
        $this->authorize('update', $post);

        $post->update($request->validated());
        return redirect()->route('posts.show', $post);
    }
}
```

## 密码确认

某些敏感操作需要用户重新输入密码确认：

```php
// 路由定义
Route::get('/confirm-password', [PasswordController::class, 'create'])
    ->middleware('auth')
    ->name('password.confirm');

Route::post('/confirm-password', [PasswordController::class, 'store'])
    ->middleware('auth');
```

```php
// 控制器
class DangerousController extends Controller
{
    public function __construct()
    {
        // 需要密码确认的路由
        $this->middleware(['auth', 'password.confirm']);
    }

    public function deleteAccount()
    {
        // 执行敏感操作
    }
}
```

```php
// 密码确认控制器
class PasswordController extends Controller
{
    public function create()
    {
        return view('auth.confirm-password');
    }

    public function store(Request $request)
    {
        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['密码错误'],
            ]);
        }

        $request->session()->passwordConfirmed();

        return redirect()->intended();
    }
}
```

## 社交登录

使用 Laravel Socialite 实现社交登录：

```bash
composer require laravel/socialite
```

```php
// config/services.php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => env('GITHUB_REDIRECT_URI'),
],

'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

```php
// 路由
Route::get('auth/github', [GithubController::class, 'redirectToProvider']);
Route::get('auth/github/callback', [GithubController::class, 'handleProviderCallback']);

// 控制器
class GithubController extends Controller
{
    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
    }

    public function handleProviderCallback()
    {
        $githubUser = Socialite::driver('github')->user();

        $user = User::firstOrCreate(
            ['github_id' => $githubUser->id],
            [
                'name' => $githubUser->name,
                'email' => $githubUser->email,
                'avatar' => $githubUser->avatar,
            ]
        );

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
```

## 密码重置

```php
// 路由
Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
    ->middleware('guest')
    ->name('password.request');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest');

Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
    ->middleware('guest')
    ->name('password.reset');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest');
```

```php
// 发送重置链接
class PasswordResetLinkController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }
}
```

## 邮箱验证

```php
// 路由
Route::get('/email/verify', [VerificationController::class, 'notice'])
    ->middleware('auth')
    ->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [VerificationController::class, 'send'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');
```

```php
// 中间件检查已验证
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

## API Token 认证

### Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

```php
// 发放 Token
$token = $user->createToken('api-token')->plainTextToken;

// 使用 Token 认证
// 请求头: Authorization: Bearer {token}

// 检查权限
if ($user->tokenCan('post:create')) {
    // 有创建文章权限
}

// 撤销 Token
$user->tokens()->delete(); // 撤销所有
$user->currentAccessToken()->delete(); // 撤销当前
```

```php
// 定义 Token 能力
$token = $user->createToken('api-token', ['post:create', 'post:update'])->plainTextToken;

// 路由中间件
Route::middleware(['auth:sanctum', 'abilities:post:create'])->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
});
```

## 最佳实践

### 1. 密码安全

```php
// 使用强哈希
Hash::make($password); // 自动使用 bcrypt

// 验证密码
Hash::check($inputPassword, $hashedPassword);

// 密码规则
Password::min(12)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised();
```

### 2. Session 安全

```php
// 登录后重新生成 Session
Auth::login($user);
$request->session()->regenerate();

// 登出时销毁 Session
Auth::logout();
$request->session()->invalidate();
$request->session()->regenerateToken();
```

### 3. 登录限制

```php
// 使用 throttle 中间件
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 每分钟最多5次

// 自定义登录限制
class LoginRequest extends FormRequest
{
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }
}
```

### 4. 权限缓存

```php
// 缓存用户权限
class User extends Authenticatable
{
    public function cachedPermissions(): Collection
    {
        return Cache::remember(
            "user.{$this->id}.permissions",
            now()->addHours(6),
            fn() => $this->permissions
        );
    }
}
```

## 参考资源

- [Laravel 认证文档](https://laravel.com/docs/12.x/authentication)
- [Laravel 授权文档](https://laravel.com/docs/12.x/authorization)
- [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum)
- [Laravel Socialite](https://laravel.com/docs/12.x/socialite)
