---
date: 2020-02-29 09:36:55
tags:
- ai
- ocr
- java
---

# 在 Java 项目中集成开源 OCR

> 预计阅读时间：9 分钟

## 1. 集成方式总览
- **嵌入式调用**：直接在 Java 应用中引入 OCR 引擎（如 Tesseract + Tess4J），适合离线部署、低延迟需求，但需要处理本地模型、原生库依赖。
- **服务化调用**：将 PaddleOCR、EasyOCR 等 Python 方案以 HTTP/gRPC 微服务形式部署，再通过 Java SDK 或 REST 客户端访问，易于横向扩容与独立运维。
- **云端 API**：阿里云、腾讯云等提供 OCR SaaS，Java 使用官方 SDK 即可；适合对合规要求高但不想自建模型的场景。本文重点关注开源自建方案。

## 2. 使用 Tess4J 集成 Tesseract OCR
### 2.1 环境准备
1. 安装 Tesseract OCR，引入所需语言包（例如 `tesseract-ocr-chi-sim`）。
2. 下载 Tessdata 训练数据，放置在 Java 应用可访问的目录。
3. 在 Maven `pom.xml` 中添加 Tess4J 依赖：

```xml
<dependency>
  <groupId>net.sourceforge.tess4j</groupId>
  <artifactId>tess4j</artifactId>
  <version>5.11.0</version>
</dependency>
```

### 2.2 基本调用示例
```java
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

public class OcrDemo {
    public static void main(String[] args) throws TesseractException {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath("/opt/tessdata");
        tesseract.setLanguage("chi_sim+eng");
        tesseract.setOcrEngineMode(ITesseract.OEM_LSTM_ONLY);

        String result = tesseract.doOCR(new java.io.File("/data/invoice.png"));
        System.out.println(result);
    }
}
```

### 2.3 常见优化
- 对扫描件执行二值化、倾斜矫正、噪点去除，提高识别准确率。
- 对票据、身份证等结构化文档，可预先裁切出关键信息区域再识别。
- 结合 `tesseract.setPageSegMode()` 调整版面分析策略；处理表格可选 `PSM_AUTO_OSD`。

## 3. Java 调用 PaddleOCR / EasyOCR 服务
### 3.1 部署 OCR 服务
- **PaddleOCR**：使用官方 `paddleocr` docker 镜像或 `paddle_serving_server` 启动服务，配置好中英文模型。
- **EasyOCR**：编写 Python Flask/FastAPI 封装，加载 EasyOCR 模型并提供 REST 接口；或使用 `JaidedAI/easyocr` 的命令行模式生成结果。

### 3.2 Java HTTP 客户端示例
```java
import okhttp3.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;

public class PaddleOcrClient {
    private static final OkHttpClient CLIENT = new OkHttpClient();
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws IOException {
        RequestBody body = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("image", "invoice.png",
                RequestBody.create(new java.io.File("/data/invoice.png"), MediaType.parse("image/png")))
            .build();

        Request request = new Request.Builder()
            .url("http://ocr-service:8866/predict/ocr_system")
            .post(body)
            .build();

        try (Response response = CLIENT.newCall(request).execute()) {
            Map<?, ?> result = MAPPER.readValue(response.body().byteStream(), Map.class);
            System.out.println(result);
        }
    }
}
```

### 3.3 gRPC / WebSocket 选项
- PaddleOCR Serving 支持 gRPC，可在 Java 使用 `grpc-java` 生成客户端，获得更高性能的长连接通讯。
- 对实时视频 OCR，可将服务封装为 WebSocket，Java 端推送帧并接收识别结果。

## 4. 生产化落地建议
- **容器化与弹性扩缩**：为 OCR 服务提供健康检查、资源限制与 autoscaling；Java 侧做好超时与重试机制。
- **缓存与队列**：对重复识别的文档缓存结果；大规模任务使用消息队列（Kafka/RabbitMQ）削峰填谷。
- **监控与告警**：记录识别耗时、失败率、CPU/GPU 占用；结合日志采集分析异常样本。
- **模型管理**：分环境存放模型文件，版本化管理；上线前做 A/B 测试验证精度。
- **安全合规**：传输过程中启用 HTTPS 或内网访问控制，对敏感文档实施脱敏与访问审计。

## 5. 延伸阅读与工具
- Tess4J 官方文档：<https://tess4j.sourceforge.net/>
- PaddleOCR Java 示例：<https://github.com/PaddlePaddle/PaddleOCR/tree/release/2.7/deploy/java>
- EasyOCR 项目：<https://github.com/JaidedAI/EasyOCR>
- MMOCR 部署指南：<https://mmocr.readthedocs.io/en/latest/>

合理选择嵌入式或服务化方案，并针对业务场景进行预处理与性能优化，能够让 Java 应用快速拥有稳定的 OCR 能力。
