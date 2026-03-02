---
title: Gemini CLI 终极指南
date: 2026-02-28
categories:
  - AI
tags:
  - AI
  - Gemini
  - CLI
  - 开发工具
---

# Gemini CLI (v0.30.0+)：全功能交互与语法字典

Gemini CLI 不仅仅是一个终端聊天窗口，它是一个具备**状态感知**、**技能扩展**和**全库审计**能力的 AI 软件工程师。本指南将详尽解析其每一项功能和内置指令。

---

## 1. 核心哲学：意图驱动开发
Gemini CLI 的操作逻辑遵循 **“研究 (Research) -> 策略 (Strategy) -> 执行 (Execution)”** 的三段式循环。它通过 `GEMINI.md` 建立项目宪法，利用 `Skills` 扩展原子能力。

---

## 2. 内置斜杠指令 (Slash Commands) 全解

斜杠指令是直接控制 Agent 行为、会话状态和环境配置的最快方式。

### A. 会话与状态控制 (Session Management)
- **`/rewind` (时光机)**：逐步回溯对话历史。你可以选择性地回滚对话内容、已修改的代码或两者。*快捷键：双击 Esc*。
- **`/chat` (分支管理)**：
    - `save <tag>`: 手动保存当前思维快照。
    - `resume <tag>`: 恢复到指定的对话分支。
    - `list`: 查看当前项目的所有快照。
    - `share`: 将对话导出为 Markdown/JSON。
- **`/resume`**：打开交互式浏览器，搜索并恢复历史上自动保存的所有会话。
- **`/reset`**：清空当前上下文，开启全新任务。
- **`/quit` / `/exit`**：退出当前会话。

### B. 工作区与上下文 (Workspace & Context)
- **`/memory` (内存管理)**：
    - `show`: 查看 Agent 此时此刻记住了哪些项目规则（源自 `GEMINI.md`）。
    - `refresh`: 强制重新扫描并加载项目内的所有上下文文件。
- **`/directory` (或 `/dir`)**：管理多目录工作区。支持 `add <path>` 将外部组件库加入 Agent 的扫描范围。
- **`/init`**：分析项目结构并一键生成初始的 `GEMINI.md`。
- **`/restore [id]`**：从自动创建的检查点中恢复受损文件，是撤销 AI 误修改的“后悔药”。

### C. 高级工作流 (Advanced Workflow)
- **`/plan` (计划模式)**：在执行复杂重构前，强制模型输出详细规划。支持预览、修改和二次确认后再执行。
- **`/compress` (上下文压缩)**：当对话达到数万 Token 时，将历史记录替换为语义摘要，从而保持模型的高推理精度并节省成本。
- **`/stats`**：显示当前任务的实时数据：Token 消耗、耗时、工具调用次数等。
- **`/copy`**：将 Agent 的最后一次输出一键存入系统剪贴板。

### D. 技能与扩展 (Skills & Tools)
- **`/skills`**：列出当前可用的 Agent 技能。支持 `enable/disable` 特定扩展。
- **`/tools`**：显示所有内置工具（如 `replace`, `run_shell_command`）的详细 API 描述。
- **`/mcp`**：管理 Model Context Protocol 服务器。通过 `refresh` 更新外部连接工具列表。

### E. 系统配置与偏好 (System & UI)
- **`/settings`**：打开交互式 JSON 编辑器，修改自动保存、工具调用权限等偏好。
- **`/theme`**：切换终端视觉风格。
- **`/vim`**：切换 Vim 模拟模式（INSERT/NORMAL 模式）。
- **`/terminal-setup`**：配置多行输入、快捷键映射等终端环境。

---

## 3. 核心功能模块解析

### 1. 子代理系统 (Sub-agents)
Gemini CLI 内部集成了专门的专家代理：
- **`codebase_investigator`**：专门负责跨文件阅读代码、理解架构、建立依赖图。
- **`cli_help`**：Gemini CLI 自身的活字典，回答关于本工具的所有疑问。

### 2. 自动化工具集 (Built-in Tools)
Agent 能够调用的物理工具包括：
- **文件操作**：`read_file`, `write_file`, `replace` (带上下文感知的精准替换)。
- **搜索增强**：`grep_search` (正则表达式), `glob` (文件查找)。
- **系统执行**：`run_shell_command` (在安全授权下运行本地脚本)。

### 3. 技能生态 (Skills Ecosystem)
通过 `npx skills` 命令可以安装全球社区贡献的专业技能，如：
- **`review-bugs`**：8 维度逻辑漏洞审计。
- **`git-pushing`**：全自动约定式提交与推送。
- **`ui-ux-pro-max`**：设计系统生成。

---

## 4. 实战建议：如何用好 Gemini CLI？

1. **规则先行**：始终保持 `GEMINI.md` 的更新。将项目的技术栈、禁止事项（如“禁止使用 Lombok”）写入其中。
2. **小步快跑**：每完成一个子功能，使用 `/chat save` 打快照。
3. **怀疑 AI**：在执行大规模修改前，先用 `/plan` 查看其意图。
4. **回溯有力**：如果代码编译失败，第一时间用 `/rewind` 回滚到最近一个稳定点，而不是手动修。

---
*注：本手册基于 Gemini CLI 0.30.0 版本整理，最新指令可通过内置 `/help` 查询。*
