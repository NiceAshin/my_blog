---
title: 文件存储
date: 2026-04-20
tags:
  - Laravel12
  - PHP
categories:
  - PHP
prev: /laravel12/cache
next: /laravel12/mail
---

# 文件存储

Laravel 文件存储系统基于 Flysystem 提供了统一的 API，支持本地存储和云存储服务（如 Amazon S3、FTP 等）。本章将深入讲解文件存储的使用和最佳实践。

## 文件系统配置

### 配置文件

```php
// config/filesystems.php
'default' => env('FILESYSTEM_DISK', 'local'),

'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'throw' => false,
    ],

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],

    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
        'throw' => false,
    ],

    'ftp' => [
        'driver' => 'ftp',
        'host' => env('FTP_HOST'),
        'username' => env('FTP_USERNAME'),
        'password' => env('FTP_PASSWORD'),
    ],
],
```

### 创建符号链接

```bash
# 创建 public/storage 到 storage/app/public 的符号链接
php artisan storage:link
```

## Storage 门面

### 获取磁盘实例

```php
use Illuminate\Support\Facades\Storage;

// 默认磁盘
$disk = Storage::disk();

// 指定磁盘
$disk = Storage::disk('s3');
$disk = Storage::disk('local');
```

## 文件操作

### 读取文件

```php
// 读取文件内容
$content = Storage::get('file.txt');

// 读取为流
$stream = Storage::readStream('file.pdf');

// 检查文件是否存在
if (Storage::exists('file.txt')) {
    // 文件存在
}

// 检查文件是否缺失
if (Storage::missing('file.txt')) {
    // 文件不存在
}
```

### 写入文件

```php
// 写入内容
Storage::put('file.txt', 'Hello World');

// 写入流
Storage::writeStream('file.pdf', $stream);

// 追加内容
Storage::append('file.txt', 'Appended content');

// 前置内容
Storage::prepend('file.txt', 'Prepended content');

// 复制文件
Storage::copy('old/file.txt', 'new/file.txt');

// 移动文件
Storage::move('old/file.txt', 'new/file.txt');
```

### 删除文件

```php
// 删除单个文件
Storage::delete('file.txt');

// 删除多个文件
Storage::delete(['file1.txt', 'file2.txt']);

// 条件删除
Storage::deleteIfExists('file.txt');
```

### 获取文件信息

```php
// 获取文件大小（字节）
$size = Storage::size('file.txt');

// 获取最后修改时间（时间戳）
$time = Storage::lastModified('file.txt');

// 获取文件路径
$path = Storage::path('file.txt');

// 获取 MIME 类型
$mime = Storage::mimeType('file.txt');
```

## 目录操作

### 遍历目录

```php
// 获取目录下所有文件
$files = Storage::files('directory');

// 获取目录下所有文件（包括子目录）
$files = Storage::allFiles('directory');

// 获取目录下所有子目录
$directories = Storage::directories('directory');

// 获取所有子目录（包括嵌套）
$directories = Storage::allDirectories('directory');
```

### 创建删除目录

```php
// 创建目录
Storage::makeDirectory('path/to/directory');

// 删除目录
Storage::deleteDirectory('directory');

// 删除目录及其所有内容
Storage::deleteDirectory('directory', true);
```

## 文件上传

### 基础上传

```php
// 控制器中
public function upload(Request $request)
{
    $request->validate([
        'file' => 'required|file|max:10240', // 最大 10MB
    ]);

    $path = $request->file('file')->store('uploads');

    return response()->json(['path' => $path]);
}

// 指定磁盘
$path = $request->file('file')->store('uploads', 's3');

// 指定文件名
$path = $request->file('file')->storeAs(
    'uploads',
    'custom-name.'.$request->file('file')->extension()
);
```

### 处理上传文件

```php
// 获取原始文件名
$name = $request->file('file')->getClientOriginalName();

// 获取扩展名
$extension = $request->file('file')->extension();

// 获取 MIME 类型
$mime = $request->file('file')->getMimeType();

// 获取文件大小
$size = $request->file('file')->getSize();

// 移动到指定位置
$request->file('file')->move(
    public_path('uploads'),
    'new-name.txt'
);
```

### 多文件上传

```php
public function uploadMultiple(Request $request)
{
    $request->validate([
        'files.*' => 'required|file|max:10240',
    ]);

    $paths = [];

    foreach ($request->file('files') as $file) {
        $paths[] = $file->store('uploads');
    }

    return response()->json(['paths' => $paths]);
}
```

## 文件下载

```php
use Symfony\Component\HttpFoundation\StreamedResponse;

// 下载文件
return Storage::download('file.txt');

// 指定下载名称
return Storage::download('file.txt', 'custom-name.txt');

// 指定响应头
return Storage::download('file.txt', 'custom-name.txt', [
    'Content-Type' => 'text/plain',
]);
```

## 文件可见性

### 设置可见性

```php
// 设置公开
Storage::setVisibility('file.txt', 'public');

// 设置私有
Storage::setVisibility('file.txt', 'private');

// 获取可见性
$visibility = Storage::getVisibility('file.txt');
```

### 公开 URL

```php
// 获取公开 URL
$url = Storage::url('file.txt');

// 临时 URL（S3）
$url = Storage::temporaryUrl('file.txt', now()->addMinutes(5));

// 带自定义参数的临时 URL
$url = Storage::temporaryUrl(
    'file.txt',
    now()->addMinutes(5),
    ['ResponseContentType' => 'application/pdf']
);
```

## 预签名 URL

```php
// 生成上传 URL
$url = Storage::temporaryUploadUrl(
    'file.txt',
    now()->addMinutes(5)
);

// 返回 URL 和 headers
[
    'url' => 'https://...',
    'headers' => ['Content-Type' => '...']
]
```

## 文件处理

### 图像处理

```bash
composer require intervention/image
```

```php
use Intervention\Image\Facades\Image;

public function uploadImage(Request $request)
{
    $image = Image::make($request->file('image'));

    // 调整大小
    $image->resize(800, 600, function ($constraint) {
        $constraint->aspectRatio();
        $constraint->upsize();
    });

    // 编码
    $encoded = $image->encode('jpg', 75);

    // 存储
    Storage::put('uploads/image.jpg', $encoded);

    return response()->json(['success' => true]);
}
```

### 文件压缩

```php
use ZipArchive;

public function createZip()
{
    $zip = new ZipArchive();
    $zip->open(storage_path('app/archive.zip'), ZipArchive::CREATE);

    $files = Storage::files('documents');

    foreach ($files as $file) {
        $zip->addFromString(
            basename($file),
            Storage::get($file)
        );
    }

    $zip->close();

    return Storage::download('archive.zip');
}
```

## 自定义文件系统

### 创建自定义驱动

```php
// app/Services/DropboxFilesystemAdapter.php
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\Config;
use Spatie\Dropbox\Client;

class DropboxFilesystemAdapter implements FilesystemAdapter
{
    protected Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function fileExists(string $path): bool
    {
        return $this->client->exists($path);
    }

    public function read(string $path): string
    {
        return $this->client->getContent($path);
    }

    public function write(string $path, string $contents, Config $config): void
    {
        $this->client->upload($path, $contents);
    }

    // 实现其他必需方法...
}
```

### 注册自定义驱动

```php
// app/Providers/AppServiceProvider.php
use App\Services\DropboxFilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client;

public function boot(): void
{
    Storage::extend('dropbox', function ($app, $config) {
        $client = new Client($config['token']);

        $adapter = new DropboxFilesystemAdapter($client);

        return new Filesystem($adapter);
    });
}
```

## 最佳实践

### 1. 验证上传文件

```php
$request->validate([
    'avatar' => [
        'required',
        'image',
        'mimes:jpeg,png,jpg,gif',
        'max:2048',
        'dimensions:min_width=100,min_height=100',
    ],
]);
```

### 2. 使用事务处理文件

```php
DB::transaction(function () use ($request) {
    $post = Post::create($request->validated());

    if ($request->hasFile('image')) {
        $path = $request->file('image')->store("posts/{$post->id}");
        $post->update(['image_path' => $path]);
    }
});
```

### 3. 清理临时文件

```php
public function processUpload(Request $request)
{
    $tempPath = $request->file('file')->store('temp');

    try {
        // 处理文件
        $result = $this->processFile($tempPath);

        return $result;
    } finally {
        // 清理临时文件
        Storage::delete($tempPath);
    }
}
```

### 4. 使用队列处理大文件

```php
class ProcessLargeFile implements ShouldQueue
{
    public function __construct(
        public string $path
    ) {}

    public function handle(): void
    {
        $content = Storage::get($this->path);

        // 处理文件...

        // 清理
        Storage::delete($this->path);
    }
}
```

## 参考资源

- [Laravel 文件存储文档](https://laravel.com/docs/12.x/filesystem)
- [Flysystem 文档](https://flysystem.thephpleague.com/)
- [AWS S3 SDK 文档](https://docs.aws.amazon.com/sdk-for-php/)
- [Intervention Image 文档](http://image.intervention.io/)
