---
title: Vibe Coding 核心
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Vibe Coding
  - MCP
---

# AI Vibe Coding：从语法驱动到意图驱动

Vibe Coding 代表了 AI 时代编程范式的转变：开发者不再纠结于具体的 API 调用或语法细节，而是通过构建完善的上下文（Context）和规则（Rules），让 AI 代理（Agent）根据“感觉（Vibe）”自动完成工作。

## 1. 核心三大支柱

### MCP (Model Context Protocol)
MCP 是 AI 代理与外部世界通讯的标准化协议。它允许 Agent 访问本地文件、数据库或第三方 API，打破了模型只能处理静态文本的限制。

### Rules (指令规则)
通过 `.clauderules` 或 `GEMINI.md` 定义的系统级指令。它们是 Agent 的“性格”和“规范”，确保 AI 生成的代码符合项目的架构审美。

### Skills (原子技能)
技能是 Agent 能力的模块化扩展。例如：
- `git-pushing`: 自动化的代码同步。
- `review-bugs`: 逻辑缺陷的深度审计。
- `ui-ux-pro-max`: 设计系统的智能生成。

## 2. 为什么 Vibe Coding 有效？
因为它将人类的职责从“搬砖工”提升到了“总建筑师”。你只需要提供清晰的意图，由 Skills 组成的自动化链路会处理剩下的执行细节。
