---
title: OCR 工具选型
date: 2025-07-24
categories:
  - AI
tags:
  - AI
  - OCR
---

# 开源 OCR 工具选型指南

OCR 选型很容易陷入“只看排行榜准确率”的误区。真实项目里，决定成败的往往是版式复杂度、语言、部署环境、调用量和人工复核成本。下面从评估方法、主流工具对比和落地建议三个层面展开。

## 1. 先定义评估指标

- **识别准确率**：不能只看整图准确率，要分别看文字检测召回、单字准确率、字段级准确率。票据场景更关心金额、日期、税号等关键字段是否全对。
- **版式适应性**：是否支持旋转、倾斜、表格、多栏、印章遮挡、手写体。
- **推理性能**：单张延迟、批量吞吐、GPU/CPU 占用。CPU 上跑检测模型，延迟可能是 GPU 的 5–10 倍。
- **部署难度**：是否支持 Docker、离线模型、国产化操作系统与 ARM 架构。
- **成本**：开源软件本身免费，但 GPU、运维、模型调优和人工复核都是成本。
- **数据合规**：票据、证件能否出境或上传第三方云服务。

建议先准备 100–300 张真实样本，覆盖清晰、倾斜、低分辨率、盖章、手写五类，再统一跑同一套指标。不要用官方 demo 图片做决策。

## 2. 主流工具对比

| 工具 | 核心特点 | 中文印刷体 | 复杂版式/手写 | 部署 | 成本 | 适用场景 |
| --- | --- | --- | --- | --- | --- | --- |
| **PaddleOCR** | 百度开源，检测+识别+方向分类完整 | 好 | 较好 | Python，可 Docker/GPU | 开源，GPU 成本自担 | 中文票据、表格、工业级 |
| **Tesseract** | 历史悠久，语言包丰富 | 一般 | 弱 | 本地库，CPU 即可 | 开源，几乎零边际成本 | 离线、简单印刷体、低并发 |
| **EasyOCR** | Python 实现，安装简单 | 中等 | 中等 | Python，依赖 PyTorch | 开源，模型较大 | 原型验证、多语言快速接入 |
| **云 OCR** | 识别与版式分析成熟，带 SLA | 好 | 好 | HTTP API | 按调用量计费 | 高准确率、低运维、可上云 |

准确率数字强依赖样本。清晰的印刷体，Tesseract 与 PaddleOCR 都可能达到 90% 以上；一到手写、盖章、透视变形，差距会迅速拉开。云 OCR 通常在复杂版式上更稳，但要把调用费和数据合规算进去。

## 3. 决策路径

1. **内网、离线、预算极低**：优先 Tesseract。用 `chi_sim+eng` 语言包，配合灰度、二值化、去噪，能覆盖简单单据。
2. **中文为主、版式复杂、可维护 Python 服务**：优先 PaddleOCR。把 OCR 封装成 HTTP 服务，Java/Go 业务只负责上传与解析，避免多语言绑定。
3. **准确率优先、调用量可控、数据可上云**：选云 OCR，把人工复核成本降到最低。
4. **混合方案**：PaddleOCR 先跑，置信度低的字段再送云 OCR 复核。这样既控制成本，又保住关键字段准确率。

## 4. 一个可复现的对比方法

准备样本目录：

```text
ocr-bench/
├── images/
├── truth/
└── run.py
```

`truth` 中每张图对应一个同名 `.txt`，只写关键字段，避免全文比对被标点差异干扰。用 PaddleOCR 批量跑：

```python
from pathlib import Path
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang="ch")
Path("pred").mkdir(exist_ok=True)
for img in sorted(Path("images").glob("*.*")):
    result = ocr.ocr(str(img), cls=True)
    lines = [item[1][0] for page in result for item in (page or [])]
    Path("pred", img.stem + ".txt").write_text("\n".join(lines), encoding="utf-8")
```

再用脚本计算字段级准确率：

```python
from pathlib import Path

def normalize(text):
    return "".join(text.split())

total = correct = 0
for truth_file in Path("truth").glob("*.txt"):
    pred_file = Path("pred") / truth_file.name
    truth = normalize(truth_file.read_text(encoding="utf-8"))
    pred = normalize(pred_file.read_text(encoding="utf-8")) if pred_file.exists() else ""
    total += len(truth)
    correct += sum(1 for a, b in zip(truth, pred) if a == b)
print(f"char accuracy: {correct / total:.2%}")
```

这段代码只做字符级对比，适合快速筛选；正式评估应使用编辑距离或字段完全匹配。

## 5. 常见坑

- 只测清晰样本，上线后被手机拍照的倾斜、反光图片打穿。
- 忽略图片方向，OCR 把 90 度旋转的文字识别成乱码。
- PDF 直接送 OCR，没有先渲染成 200–300 DPI 的图片。
- 用整图准确率掩盖关键字段错误，金额错一位比识别少几个字更严重。
- 把开源模型直接暴露为公网接口，没有鉴权、限流和图片大小限制。
- 忽略模型首次加载时间，容器冷启动时请求超时。

选型的终点不是“哪个模型最强”，而是“在可接受的成本下，关键字段是否稳定正确”。先用小样本做 POC，再算清 GPU、运维和人工复核的账，结论通常比排行榜可靠。
