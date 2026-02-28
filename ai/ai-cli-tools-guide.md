---
title: AI CLI 工具实战
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Claude
  - Gemini
  - CLI
  - 终端工具
---

# 终端霸主：Claude Code 与 Gemini CLI 深度指南

对于追求极致效率的开发者，终端（CLI）是 Vibe Coding 的天然土壤。以下是目前最强大的两款 AI CLI 工具的实战解析。

## 1. Claude Code (Claude CLI)

Claude Code 是 Anthropic 推出的原生 CLI 工具，以其极其深厚的工程推理能力著称。

### 核心操作指令
- **`claude`**: 进入交互式 Agent 模式。它会自动扫描当前目录并建立索引。
- **`/files`**: 列出当前 Agent 正在关注的文件，这对于管理上下文窗口至关重要。
- **`/compact`**: 当对话过长导致 Token 消耗过快时，压缩当前上下文并保留关键信息。
- **`/cost`**: 实时查看当前会话的 Token 成本消耗。
- **`/reset`**: 清空当前记忆，开启一个全新的任务。

### 进阶特性
- **自主执行能力**：它可以根据你的要求，自主在终端运行测试命令（如 `npm test`），分析错误日志并自动修复代码，形成“尝试-失败-修复”的闭环。
- **TTY 模式管理**：在执行如 `vim` 或 `ssh` 等交互式命令时，它能提供更好的环境支持。

## 2. Gemini CLI (npx @google/gemini-cli)

Gemini CLI（即我们现在使用的工具）的设计哲学是**高度的可扩展性**和**技能驱动**。

### 核心命令详解
- **`npx skills find [query]`**: 极其强大的技能发现系统。例如输入 `find git push` 即可找到自动化同步工具。
- **`npx skills add <owner/repo@skill>`**: 快速安装来自 GitHub 或社区的第三方技能。
- **`activate_skill`**: 激活特定技能，获取其专属的指令集。
- **`run_shell_command`**: 在 Agent 安全沙箱内执行本地 shell 指令。它会在执行前向用户请求权限，确保安全。
- **`codebase_investigator`**: 专用于分析大规模代码库的子代理（Sub-agent），能跨越海量文件进行架构映射。

## 3. 两者对比与协同

| 维度 | Claude Code | Gemini CLI |
| --- | --- | --- |
| **逻辑推理** | 极强，擅长跨文件复杂重构 | 强，侧重于任务的原子化拆解 |
| **扩展性** | 封闭系统，依赖官方更新 | 开放生态，支持海量第三方 Skills |
| **部署便利性** | 原生二进制安装 | 基于 Node.js，即装即用 |
| **最佳用途** | 深度的业务逻辑开发 | 自动化的工程流与运维辅助 |

**实战建议**：使用 Claude Code 进行核心业务逻辑的架构设计与实现；使用 Gemini CLI 配合多样化的 Skills（如 `review-bugs`, `git-pushing`）来完成质量把控和工作流同步。
