---
title: AI CLI 工具指南
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Claude
  - Gemini
  - CLI
---

# 开发者利器：Claude & Gemini CLI 实战

在终端中直接与 AI 交互是 Vibe Coding 的最佳实践。以下是两大主流工具的核心命令详解。

## 1. Claude CLI (Claude Code)

Claude CLI 提供了极强的自主性，能够直接在文件系统上执行复杂的工程任务。

- **`claude`**: 启动交互式会话。
- **`claude config`**: 配置代理参数或权限。
- **`claude login`**: 认证身份。
- **快捷键指令**:
    - `/help`: 查看帮助。
    - `/reset`: 清空当前上下文。
    - `/compact`: 压缩上下文以节省 Token。

## 2. Gemini CLI (npx @google/gemini-cli)

Gemini CLI 侧重于技能驱动（Skill-driven）的扩展性，适合通过组合不同技能完成特定任务。

- **`npx skills find [query]`**: 在生态中搜索特定功能的技能。
- **`npx skills add <skill-name>`**: 安装新技能。
- **`npx skills check`**: 检查已安装技能的安全性。
- **`run_shell_command`**: 在 Agent 内部安全地执行本地命令。

## 3. 场景对比

| 场景 | 推荐工具 | 原因 |
| --- | --- | --- |
| 跨文件重构 | Claude CLI | 更好的推理深度与复杂任务规划 |
| 流程自动化 | Gemini CLI | 极其灵活的 Skills 系统与插件化架构 |
| 交互式 Debug | 两者结合 | 用 Claude 找 Bug，用 Gemini 执行自动化修复 |
