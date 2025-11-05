---
sidebar: auto
prev: ./builder
next: ./bridge
---

# 适配器模式

适配器（Adapter）模式通过引入一个中间层，把**不兼容的接口转换成调用方期望的接口**。当现有类无法直接复用时，适配器可以避免修改旧代码，实现“接口兼容”。

## 适用场景

- 需要复用一个已经存在的类，但它的接口与当前系统不匹配。
- 新旧系统并存，调用方希望继续使用旧接口，而底层能力已经升级。
- 第三方 SDK、RPC、消息协议等出现协议差异，需要做统一封装。

## 结构角色

| 角色 | 职责 |
| --- | --- |
| Target（目标接口） | 客户端期望访问的接口。 |
| Adaptee（被适配者） | 已存在但接口不兼容的类。 |
| Adapter（适配器） | 将 Target 的调用转换为 Adaptee 能理解的形式。 |

适配器有两种常见实现方式：

- **类适配器**：通过继承被适配者、实现目标接口来完成适配。
- **对象适配器**（推荐）：通过组合持有被适配者实例，把调用委托给它。

## 示例：统一云存储下载接口

项目中已经使用 `AliyunOssClient` 处理文件下载，现在接入了 MinIO。为了兼容原有接口，使用适配器把 MinIO 客户端统一成 `CloudFileDownloader`。

```java
// 客户端期望的接口
public interface CloudFileDownloader {
    InputStream download(String bucket, String objectKey);
}

// 原有实现 - 直接对接阿里云 OSS
public class AliyunOssDownloader implements CloudFileDownloader {
    private final AliyunOssClient client;

    public AliyunOssDownloader(AliyunOssClient client) {
        this.client = client;
    }

    @Override
    public InputStream download(String bucket, String objectKey) {
        return client.getObject(bucket, objectKey);
    }
}

// 第三方提供的 MinIO 客户端，方法签名不兼容
public class MinioClient {
    public InputStream getObject(GetObjectArgs args) {
        // ...
    }
}

// 适配器：把统一接口的调用转换成 MinIO 需要的参数
public class MinioDownloaderAdapter implements CloudFileDownloader {
    private final MinioClient client;

    public MinioDownloaderAdapter(MinioClient client) {
        this.client = client;
    }

    @Override
    public InputStream download(String bucket, String objectKey) {
        GetObjectArgs args = GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectKey)
                .build();
        return client.getObject(args);
    }
}
```

客户端可以通过依赖注入在运行时选择不同的实现：

```java
@Service
public class FilePreviewService {
    private final CloudFileDownloader downloader;

    public FilePreviewService(CloudFileDownloader downloader) {
        this.downloader = downloader;
    }

    public byte[] preview(String bucket, String key) {
        try (InputStream input = downloader.download(bucket, key)) {
            return IOUtils.toByteArray(input);
        }
    }
}
```

## 优缺点

**优点**
- 解耦调用方与具体实现，复用既有代码。
- 符合开闭原则，新增适配器即可支持新的后端实现。
- 便于在六边形架构中构建入站、出站适配器。

**缺点**
- 引入额外层次，可能增加调用链复杂度。
- 如果过度使用，容易形成“适配器套适配器”的维护负担。

## 实践建议

- 在业务层保持 Target 接口的语义稳定，适配器只负责协议转换。
- 对复杂转换逻辑，适配器内部应保持单一职责，可引入转换器类拆分。
- 若调用方只需要少量能力，可以考虑使用门面模式，避免暴露过多方法。
