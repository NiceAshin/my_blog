---
title: Antigravity 实践
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Antigravity
  - Skills
---

# Antigravity：解锁 AI 编程的“零重力”体验

Antigravity 是一套专门为提升 Agent 自动化效率而设计的技能框架，它的目标是让代码的提交、同步和部署变得“轻若无物”。

## 1. 安装与配置

Antigravity 属于 `gemini-cli` 生态，可以通过以下命令安装：

```bash
npx skills add sickn33/antigravity-awesome-skills -g -y
```

## 2. 核心功能组件

### Git 自动化 (`git-pushing`)
提供 `smart_commit.sh` 脚本，能够：
- 自动分析 `git diff`。
- 根据 Conventional Commits 规范生成提交信息。
- 一键完成 `add`, `commit` 和 `push`。

### 代码审查助手
集成在 Antigravity 内部的审查逻辑，能在提交前自动捕获代码中的低级错误和潜在的安全漏洞。

## 3. 使用技巧

- **意图驱动**: 运行 `bash scripts/smart_commit.sh "feat: add user auth"`，脚本会自动帮你打理所有 git 琐事。
- **结合 Rules**: 在 `GEMINI.md` 中引用 Antigravity 的规范，可以让 AI 代理在编写代码时就考虑到后续的自动化提交流程。

## 4. 总结
Antigravity 不仅仅是一个工具包，它代表了一种高效的开发心智模型：通过 Skills 赋予 AI 代理手脚，让它能够真正落地你的每一丝创意（Vibe）。
