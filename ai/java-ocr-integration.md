---
title: Java OCR 集成
date: 2025-06-07
categories:
  - AI
tags:
  - AI
  - OCR
  - Java
---

# 在 Java 项目中集成开源 OCR

OCR 在业务里通常出现在发票识别、证件录入、单据归档和截图取字等场景。Java 项目接入开源方案，主流选择有两类：一类是以 Tess4J 封装 Tesseract 的本地调用，另一类是把 PaddleOCR 部署成独立服务，再通过 HTTP 调用。前者依赖少、离线简单；后者中文效果更好，但需要维护 Python 运行环境。

## 方案对比

| 方案 | 优点 | 局限 | 适用场景 |
| --- | --- | --- | --- |
| Tess4J + Tesseract | 纯本地、无网络依赖、Java 直接调用 | 中文复杂版式效果一般，需要安装语言包 | 内网、简单印刷体、低并发 |
| PaddleOCR 服务 | 中文检测与识别效果较好，支持方向分类 | 需要 Python/GPU 环境，多一次网络调用 | 票据、表格、复杂排版、批量处理 |

如果只是识别清晰的扫描件，Tess4J 足够；如果中文票据占比高，建议直接上 PaddleOCR，避免在 Java 侧反复做图像修补。

## Tess4J 接入

Ubuntu/Debian 先安装 Tesseract 与中文语言包：

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-chi-sim libtesseract-dev
tesseract --list-langs
```

Maven 引入 Tess4J：

```xml
<dependency>
    <groupId>net.sourceforge.tess4j</groupId>
    <artifactId>tess4j</artifactId>
    <version>5.11.0</version>
</dependency>
```

下面是一个可直接运行的最小示例。先把图片转灰度，再交给 Tesseract，能减少彩色背景对二值化的干扰：

```java
import net.sourceforge.tess4j.ITessAPI;
import net.sourceforge.tess4j.Tesseract;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;

public class OcrDemo {

    public static void main(String[] args) throws Exception {
        File image = new File(args[0]);

        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(System.getenv().getOrDefault(
                "TESSDATA_PREFIX", "/usr/share/tesseract-ocr/5/tessdata"));
        tesseract.setLanguage("chi_sim+eng");
        tesseract.setPageSegMode(ITessAPI.TessPageSegMode.PSM_AUTO);

        String text = tesseract.doOCR(toGray(image));
        System.out.println(text);
    }

    private static BufferedImage toGray(File file) throws Exception {
        BufferedImage source = ImageIO.read(file);
        BufferedImage gray = new BufferedImage(
                source.getWidth(), source.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D graphics = gray.createGraphics();
        graphics.drawImage(source, 0, 0, null);
        graphics.dispose();
        return gray;
    }
}
```

运行：

```bash
mvn -q compile
mvn -q exec:java -Dexec.mainClass=OcrDemo -Dexec.args="/data/invoice.jpg"
```

`TESSDATA_PREFIX` 必须指向包含 `chi_sim.traineddata` 的目录。不同发行版的路径可能是 `/usr/share/tesseract-ocr/4.00/tessdata` 或 `/usr/share/tesseract-ocr/5/tessdata`，用 `tesseract --list-langs` 确认能列出 `chi_sim` 即可。

## PaddleOCR 作为服务接入

建议把 PaddleOCR 独立部署，Java 只负责上传图片和解析 JSON。Python 侧可以先固定版本，避免 API 变化：

```bash
python -m venv .venv && source .venv/bin/activate
pip install "paddlepaddle==2.6.1" "paddleocr==2.7.3" fastapi uvicorn python-multipart
```

```python
# app.py
import os
import tempfile
from fastapi import FastAPI, UploadFile
from paddleocr import PaddleOCR

app = FastAPI()
ocr = PaddleOCR(use_angle_cls=True, lang="ch")

@app.post("/ocr")
async def recognize(file: UploadFile):
    suffix = os.path.splitext(file.filename or "")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        path = tmp.name
    try:
        result = ocr.ocr(path, cls=True)
        lines = [item[1][0] for page in result for item in (page or [])]
        return {"text": "\n".join(lines)}
    finally:
        os.unlink(path)
```

启动并验证：

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
curl -F "file=@/data/invoice.jpg" http://localhost:8000/ocr
```

Java 侧用 `HttpClient` 发 multipart 请求即可：

```java
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class OcrClient {
    public static void main(String[] args) throws Exception {
        String boundary = "----ocr" + System.currentTimeMillis();
        byte[] fileBytes = Files.readAllBytes(Path.of("/data/invoice.jpg"));

        ByteArrayOutputStream body = new ByteArrayOutputStream();
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"file\"; " +
                "filename=\"invoice.jpg\"\r\n").getBytes(StandardCharsets.UTF_8));
        body.write("Content-Type: image/jpeg\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write(fileBytes);
        body.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8000/ocr"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```

## 提升识别率的三个动作

1. **控制分辨率**：短边低于 1000 像素时先放大，票据类建议 200–300 DPI；过度放大也会增加噪声。
2. **做方向校正**：手机拍摄的图片经常旋转 90 度，PaddleOCR 可开启 `use_angle_cls`，Tesseract 则可先用 `PSM_AUTO` 或 OpenCV 做倾斜校正。
3. **裁剪兴趣区域**：票据先按模板裁掉边框和广告字，再识别正文，通常比整图识别更稳。

## 常见坑

- 只装 `tesseract-ocr` 没装 `chi_sim`，运行时报 `Failed to load language`。
- 在 Windows 开发、Linux 部署时 `tessdata` 路径不同，建议用环境变量统一。
- 同步调用 OCR 阻塞 Web 线程，批量任务应放到独立线程池或消息队列。
- 直接信任识别结果做金额入账，必须加校验位、金额合计和人工复核。
- PaddleOCR 首次启动会下载模型，生产环境应提前把模型目录打进镜像，避免启动时访问外网。

清晰印刷体的中文识别率通常可以达到 90% 以上，但手写体、盖章遮挡和复杂表格仍需要预处理与人工兜底。把 OCR 当作“候选结果生成器”，而不是最终事实来源，系统会更可靠。
