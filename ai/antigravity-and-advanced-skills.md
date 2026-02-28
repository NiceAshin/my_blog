---
title: Antigravity 进阶
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Antigravity
  - Skills
  - 自动化
---

# Antigravity 与 AI 代理原子技能进阶

Antigravity 是一套专为赋能 AI Agent 而设计的技能全家桶。它通过一系列高度优化的原子技能，让 Agent 在执行任务时具备了超越普通人类开发者的“稳定性”和“速度感”。

## 1. 核心技能：Git 自动化 (`git-pushing`)

这是 Antigravity 中最受欢迎的组件，解决了 Agent 修改代码后“懒于提交”或“提交不规范”的痛点。

### `smart_commit.sh` 使用指南
该脚本不只是简单的 `git commit`，它集成了以下高级逻辑：
- **自动 Diff 分析**：通过 `git diff` 自动感知改动的文件类型（feat, fix, docs 等）。
- **约定式提交生成**：自动生成符合 Conventional Commits 规范的 Message。
- **Claude Footer**：在提交信息末尾自动附带 Agent 运行的上下文信息，方便后期追溯。

### 使用方法：
```bash
# 自动生成 commit message 并推送
bash scripts/smart_commit.sh 

# 使用自定义描述
bash scripts/smart_commit.sh "feat: add user login module"
```

## 2. 深度审查技能：`review-bugs`

这是一个专注于“找茬”的子代理技能。在代码真正进入提交环节前，它会对逻辑进行 8 个维度的地毯式搜索。

- **竞态条件与并发**：检查异步代码中是否存在状态冲突。
- **边界情况**：检测对 Null、空数组或极大值的处理。
- **资源泄漏**：识别未关闭的连接或内存溢出隐患。
- **逻辑缺陷**：分析布尔运算、循环次数等硬性错误。

## 3. 设计驱动技能：`ui-ux-pro-max`

通过此技能，Agent 可以从“只会写代码”进化为“懂审美”的设计师。
- **功能**：自动生成 50+ 种风格的设计系统，提供 Tailwind/React/Vue 的最佳实践。
- **命令**：通过 `python search.py "<keywords>" --design-system` 生成完整的视觉方案。

## 4. 构建您的“零重力”工作流

一个典型的 Vibe Coding 工作流应如下配置：
1. **意图输入**：告诉 Agent “我想实现一个 Yii2 的认证组件”。
2. **设计方案**：调用 `ui-ux-pro-max` 确定界面规范。
3. **代码实现**：Agent 根据设计实现业务逻辑。
4. **质量关卡**：运行 `review-bugs` 进行逻辑审计。
5. **自动化同步**：执行 `git-pushing` 一键入库。

## 5. 结语
Skills 是 Agent 的触角。通过 Antigravity 这样的技能框架，我们将零散的 AI 能力整合成了连贯的生产线，真正实现了“零重力”的开发体验。
