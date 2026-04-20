---
title: API 开发
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/authentication
next: /laravel12/queues
---

# API 开发

Laravel 提供了完整的 RESTful API 开发支持，包括资源响应、API 认证、版本控制和文档生成。本章将深入讲解 API 开发的最佳实践。

## RESTful API 设计原则

### 资源命名

```php
// 使用复数名词
GET    /api/users           // 获取用户列表
GET    /api/users/{id}      // 获取单个用户
POST   /api/users           // 创建用户
PUT    /api/users/{id}      // 更新用户（完整）
PATCH  /api/users/{id}      // 更新用户（部分）
DELETE /api/users/{id}      // 删除用户

// 嵌套资源
GET    /api/users/{id}/posts
POST   /api/users/{id}/posts
```

### 路由设计

```php
// routes/api.php
use App\Http\Controllers\Api\V1\PostController;

Route::prefix('v1')->group(function () {
    // 公开接口
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{post}', [PostController::class, 'show']);

    // 需要认证的接口
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{post}', [PostController::class, 'update']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    });
});
```

## API 资源响应

### 创建资源类

```bash
php artisan make:resource UserResource
php artisan make:resource UserCollection
```

### 单个资源

```php
// app/Http/Resources/UserResource.php
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar_url,
            'role' => $this->role->value,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // 条件字段
            $this->mergeWhen($request->user()?->isAdmin(), [
                'email_verified' => $this->hasVerifiedEmail(),
            ]),

            // 关联数据
            'posts_count' => $this->whenCounted('posts'),
            'latest_posts' => PostResource::collection(
                $this->whenLoaded('posts')
            ),
        ];
    }
}
```

### 资源集合

```php
// app/Http/Resources/UserCollection.php
class UserCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'total_pages' => $this->lastPage(),
            ],
            'links' => [
                'self' => $this->url($this->currentPage()),
                'first' => $this->url(1),
                'last' => $this->url($this->lastPage()),
                'next' => $this->nextPageUrl(),
                'prev' => $this->previousPageUrl(),
            ],
        ];
    }
}
```

### 使用资源

```php
class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('posts')
            ->withCount('posts')
            ->paginate($request->per_page ?? 15);

        return new UserCollection($users);
    }

    public function show(User $user)
    {
        return new UserResource($user->load('posts'));
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        return new UserResource($user);
    }
}
```

### 自定义响应

```php
class PostResource extends JsonResource
{
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->setStatusCode(201);
        $response->header('X-Resource-Type', 'post');
    }

    public function additional(array $data): static
    {
        return parent::additional([
            'status' => 'success',
            ...$data
        ]);
    }
}
```

## API 认证

### Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

```php
// 配置中间件
// app/Http/Kernel.php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

```php
// 发放 Token
class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->first();

        $token = $user->createToken(
            'api-token',
            ['post:read', 'post:write']
        )->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
```

```php
// 使用 Token 能力中间件
Route::middleware(['auth:sanctum', 'ability:post:write'])->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
});
```

### Laravel Passport (OAuth2)

```bash
composer require laravel/passport
php artisan migrate
php artisan passport:install
```

```php
// app/Models/User.php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // 使用 Passport Token
    public function tokens()
    {
        return $this->morphMany(Token::class, 'tokenable');
    }
}
```

## 速率限制

### 配置限制器

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)
            ->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)
            ->by($request->email)
            ->response(function () {
                return response()->json([
                    'message' => 'Too many login attempts'
                ], 429);
            });
    });
}
```

### 应用限制器

```php
// routes/api.php
Route::middleware('throttle:api')->group(function () {
    // API 路由
});

Route::middleware('throttle:auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});
```

## API 版本控制

### URL 版本控制

```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::apiResource('posts', V1\PostController::class);
});

Route::prefix('v2')->group(function () {
    Route::apiResource('posts', V2\PostController::class);
});
```

### Header 版本控制

```php
// 自定义中间件
class ApiVersionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $version = $request->header('Accept-Version', 'v1');

        $request->attributes->set('api_version', $version);

        return $next($request);
    }
}

// 控制器中使用
class PostController extends Controller
{
    public function index(Request $request)
    {
        $version = $request->attributes->get('api_version');

        $resourceClass = match($version) {
            'v2' => PostResourceV2::class,
            default => PostResource::class,
        };

        return $resourceClass::collection(Post::paginate());
    }
}
```

## 错误处理

### 统一错误响应

```php
// app/Exceptions/Handler.php
public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        return match(true) {
            $exception instanceof ModelNotFoundException => response()->json([
                'success' => false,
                'message' => 'Resource not found',
                'error' => 'NOT_FOUND'
            ], 404),

            $exception instanceof AuthenticationException => response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'error' => 'UNAUTHENTICATED'
            ], 401),

            $exception instanceof AuthorizationException => response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'error' => 'FORBIDDEN'
            ], 403),

            $exception instanceof ValidationException => response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422),

            default => parent::render($request, $exception),
        };
    }

    return parent::render($request, $exception);
}
```

### 自定义异常

```php
// app/Exceptions/ApiException.php
class ApiException extends Exception
{
    public function __construct(
        string $message,
        public string $errorCode,
        public int $statusCode = 400
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error' => $this->errorCode,
        ], $this->statusCode);
    }
}

// 使用
throw new ApiException('Post not found', 'POST_NOT_FOUND', 404);
```

## 表单验证

### 请求类验证

```php
// app/Http/Requests/Api/StorePostRequest.php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:100'],
            'category_id' => ['required', 'exists:categories,id'],
            'tags' => ['array', 'max:5'],
            'tags.*' => ['exists:tags,id'],
            'status' => ['in:draft,published'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '标题不能为空',
            'content.min' => '内容至少需要100个字符',
        ];
    }
}
```

## API 文档

### 使用 OpenAPI/Swagger

```bash
composer require darkaonline/l5-swagger
php artisan l5-swagger:generate
```

```php
// 使用注解
/**
 * @OA\Post(
 *     path="/api/v1/posts",
 *     summary="Create a new post",
 *     tags={"Posts"},
 *     security={{"sanctum": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(ref="#/components/schemas/StorePostRequest")
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Post created successfully",
 *         @OA\JsonContent(ref="#/components/schemas/Post")
 *     ),
 *     @OA\Response(response=401, description="Unauthenticated"),
 *     @OA\Response(response=422, description="Validation error")
 * )
 */
public function store(StorePostRequest $request) {}
```

## 最佳实践

### 1. 统一响应格式

```php
trait ApiResponse
{
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    protected function errorResponse(string $message = 'Error', int $code = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    protected function paginatedResponse($data, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }
}
```

### 2. 包含关联数据

```php
// 支持客户端自定义包含
GET /api/posts?include=author,tags,comments.author

// 实现
public function index(Request $request)
{
    $includes = explode(',', $request->get('include', ''));

    $posts = Post::with($includes)->paginate();

    return PostResource::collection($posts);
}
```

### 3. 缓存响应

```php
public function index(Request $request)
{
    $cacheKey = 'posts:' . md5($request->fullUrl());

    $posts = Cache::remember($cacheKey, 300, function () {
        return Post::with('author', 'tags')->paginate();
    });

    return PostResource::collection($posts);
}
```

## 参考资源

- [Laravel API 资源文档](https://laravel.com/docs/12.x/eloquent-resources)
- [Laravel Sanctum 文档](https://laravel.com/docs/12.x/sanctum)
- [Laravel Passport 文档](https://laravel.com/docs/12.x/passport)
- [OpenAPI 规范](https://swagger.io/specification/)
