---
title: YOLOv8 指南
date: 2025-10-04
categories:
  - AI
tags:
  - AI
  - YOLO
  - computer-vision
---

# Ultralytics YOLOv8 全景指南

YOLOv8 是 Ultralytics 在 2023 年发布的目标检测框架，除了检测，还覆盖实例分割、姿态估计、图像分类和旋转框检测。它的价值不只在模型结构，更在于把数据配置、训练、验证、导出和推理统一到一套 Python API 与 CLI 中，适合从原型快速走到部署。

## 1. 环境准备

推荐使用独立虚拟环境，避免和系统里的 PyTorch 冲突：

```bash
conda create -n yolo8 python=3.10 -y
conda activate yolo8
pip install ultralytics
```

安装后验证：

```bash
yolo checks
```

`yolo checks` 会输出 Python、PyTorch、CUDA、GPU 型号与依赖状态。如果要指定 CUDA 版本的 PyTorch，先按 PyTorch 官网命令安装，再安装 `ultralytics`。CPU 也能训练小模型，但速度通常只有 GPU 的几十分之一。

## 2. 先用预训练模型跑通推理

命令行：

```bash
yolo predict model=yolov8n.pt source='https://ultralytics.com/images/bus.jpg' save=True
```

Python：

```python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
results = model.predict(
    source="bus.jpg",
    imgsz=640,
    conf=0.25,
    iou=0.7,
    save=True,
)
for box in results[0].boxes:
    cls_id = int(box.cls.item())
    conf = float(box.conf.item())
    xyxy = box.xyxy[0].tolist()
    print(model.names[cls_id], round(conf, 3), [round(v, 1) for v in xyxy])
```

`conf` 是置信度阈值，`iou` 是 NMS 的 IoU 阈值。检测小目标时可适当降低 `conf`、提高输入尺寸；误检多时先提高 `conf`，不要一上来就改模型。

## 3. 模型规格怎么选

| 模型 | 参数量（约） | COCO mAP（约） | 适用场景 |
| --- | --- | --- | --- |
| `yolov8n` | 3.2M | 37% | 边缘设备、CPU、实时性优先 |
| `yolov8s` | 11.2M | 45% | 普通 GPU、性价比均衡 |
| `yolov8m` | 25.9M | 50% | 精度优先、GPU 资源充足 |
| `yolov8l` | 43.7M | 53% | 离线高精度场景 |
| `yolov8x` | 68.2M | 54% | 服务器端、追求最高精度 |

数据以官方文档和实际版本为准。参数量与 mAP 只是起点，最终要在自己的验证集上比较。小模型在简单场景可能只差 1–2 个点，但推理成本低一个数量级。

## 4. 准备自定义数据集

YOLO 检测标注格式为一行一个目标：

```text
<class_id> <x_center> <y_center> <width> <height>
```

坐标都是相对图片宽高的 0–1 小数。目录建议：

```text
dataset/
├── images/
│   ├── train/
│   └── val/
├── labels/
│   ├── train/
│   └── val/
└── data.yaml
```

`data.yaml`：

```yaml
path: /data/dataset
train: images/train
val: images/val

names:
  0: person
  1: helmet
```

注意 `names` 的下标必须和标注文件中的 `class_id` 一致。训练前用脚本抽查：图片能打开、标注坐标在 0–1 之间、每张图都有对应 label、类别没有越界。

## 5. 训练

```bash
yolo detect train \
  model=yolov8s.pt \
  data=dataset/data.yaml \
  epochs=100 \
  imgsz=640 \
  batch=16 \
  device=0 \
  workers=8 \
  project=runs/train \
  name=helmet_v1
```

常用参数：

- `epochs`：小数据集 50–100 起步，观察验证集是否早停；
- `imgsz`：训练与推理保持一致，常用 640；
- `batch`：受显存限制，OOM 时先减半；
- `device=0` 指定第一块 GPU，`device=cpu` 强制 CPU；
- `patience`：验证指标长期不提升时提前停止；
- `cache=True`：小数据集可缓存到内存，加快读取。

训练产物在 `runs/train/helmet_v1/`，其中 `weights/best.pt` 是验证集表现最好的权重，`results.png`、`confusion_matrix.png` 用于分析。

## 6. 验证与调优

```bash
yolo detect val model=runs/train/helmet_v1/weights/best.pt data=dataset/data.yaml imgsz=640
```

重点看每类 AP、混淆矩阵和召回率。整体 mAP 高但某一类召回低，说明该类样本不足或标注不一致。常见调优顺序：

1. 先修数据：补样本、统一标注规范、清理漏标；
2. 再调推理参数：`conf`、`iou`、`imgsz`；
3. 最后换模型或加数据增强：`mosaic`、`hsv_h`、`degrees`、`scale`。

不要用验证集反复调参几十轮，否则指标会虚高。应该留一份从未参与训练的测试集做最终评估。

## 7. 导出与部署

```bash
yolo export model=runs/train/helmet_v1/weights/best.pt format=onnx imgsz=640 opset=12 simplify=True
yolo export model=runs/train/helmet_v1/weights/best.pt format=engine imgsz=640 half=True device=0
```

- ONNX：跨平台通用，适合 ONNX Runtime、OpenVINO；
- TensorRT Engine：NVIDIA GPU 上延迟最低，但和显卡、TensorRT 版本绑定；
- OpenVINO：Intel CPU/GPU 场景；
- CoreML / TFLite：移动端与 Apple 生态。

导出后必须用同一张图对比原模型与导出模型的输出，确认预处理、letterbox、NMS 和坐标反变换一致。部署侧常见错误是只做 resize 不做 letterbox，导致框位置整体偏移。

## 8. 常见坑

- 训练集和验证集来自同一段视频的相邻帧，指标很高但上线就崩；应按场景或时间切分。
- 标注类别下标从 1 开始，训练时全部错位。
- 图片和 label 文件名没对齐（`a.jpg` 对应 `a.txt`），训练时被静默跳过。
- `imgsz` 训练 640、推理 1280，小目标效果变化很大，必须重新评估。
- 显存不足时只减 batch，不减 `imgsz`，仍然 OOM。
- 导出 TensorRT 时开了 `half=True`，但输入仍是 FP32，精度或速度不符合预期。
- 生产环境没有固定 `ultralytics` 与 PyTorch 版本，重训结果无法复现。

建议把数据版本、训练命令、随机种子、依赖版本和评估报告一起归档。YOLOv8 的上手成本不高，真正拉开差距的是数据质量和评估纪律。
