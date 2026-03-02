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

对于追求极致效率的开发者，终端（CLI）是 Vibe Coding 的天然土壤。以下是目前最强大的两款 AI CLI 工具的实战解析，重点关注它们的内置语法与核心命令。

## 1. Gemini CLI (npx @google/gemini-cli)

Gemini CLI 的核心哲学是**交互式控制**与**技能驱动**。它通过一套丰富的“斜杠指令（Slash Commands）”赋予开发者对 Agent 状态的精准操控。

### 核心交互语法 (Slash Commands)

- **`/rewind` —— 时光机回溯**
    - **含义**：逐步回溯对话历史。
    - **功能**：不仅仅是撤销对话，它允许你预览并选择性地回滚“对话状态”、“代码更改”或两者。当你发现 Agent 走偏了，这是纠偏最快的手段。
- **`/plan` —— 计划先行**
    - **功能**：进入计划模式。在执行复杂重构前，要求 Agent 先输出一份“架构规划书”。你可以在确认计划后再让它动手，极大降低了大范围改错的风险。
- **`/chat` —— 会话分支管理**
    - `save <tag>`: 给当前的思维状态打个快照。
    - `resume <tag>`: 随时跳回之前的任何一个思维分支。
- **`/memory` —— 上下文宪法**
    - **功能**：管理基于 `GEMINI.md` 的层级指令。通过 `/memory show` 可以实时查看 Agent 到底记住了哪些项目规则。
- **`/rewind` vs `/restore`**
    - `/rewind` 侧重于回溯对话流，而 `/restore` 专门用于从自动创建的检查点中恢复被 AI 修改坏了的文件。

### 核心工作流命令
- **`npx skills find`**: 在生态中发现新技能（如 `git`, `docker`, `testing`）。
- **`codebase_investigator`**: 调动专门的子代理进行全库扫描，生成代码地图。

---

## 2. Claude Code (Claude CLI)

Claude Code 以其深厚的工程推理能力著称，其指令系统更侧重于自动化任务的自主执行。

### 常用快捷指令
- **`/files`**: 列出 Agent 正在“盯着”的文件。在处理大型项目时，控制上下文窗口的大小是防乱码的关键。
- **`/compact`**: 当对话达到数万 Token 时，手动触发上下文压缩，只保留核心逻辑，节省 Token 费用的同时也提高了推理准确度。
- **`/cost`**: 实时透明地显示当前任务消耗了多少美元。

### 自主执行语法
Claude CLI 最强大的地方在于它可以直接运行并理解 shell 命令：
- “运行所有测试，如果失败了请修好它们。”
- Agent 会自主执行 `npm test` -> 捕获报错 -> `read_file` 分析 -> 尝试修复 -> 重新运行测试，直到闭环。

---

## 3. 工具选型与实战策略

| 需求场景 | 推荐工具 | 核心指令 |
| --- | --- | --- |
| **精准思维回溯** | Gemini CLI | `/rewind`, `/chat resume` |
| **大规模自动修复** | Claude CLI | `/compact`, 直接执行 shell |
| **架构与规范强约束** | Gemini CLI | `/memory`, `GEMINI.md` |
| **UI 系统快速生成** | Gemini CLI | `activate_skill ui-ux-pro-max` |

**实战总结**：
如果您在开发过程中需要频繁进行“尝试与撤销”，Gemini CLI 的 `/rewind` 和状态管理功能是您的救星；如果您需要 AI 独立承担一个耗时较长的“自动重构”任务，Claude Code 的自主性则更具优势。
