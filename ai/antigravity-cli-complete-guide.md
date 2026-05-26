---
title: Antigravity CLI 终极全景实战指南
date: 2025-12-14
categories:
  - AI
tags:
  - AI
  - Antigravity
  - CLI
  - Agent
  - 自动驾驶开发
---

# Antigravity CLI 终极全景实战指南：从零重力思想到大规模工程重构

在生成式 AI 爆发的当下，很多开发者依然停留在“聊天框式编程”（Chat-based Coding）或简单的“行级补全”（Coplit-style Completion）阶段。然而，当面对包含数万行代码、复杂依赖关系、高并发架构的商业级遗留系统时，这种浅层次的交互模式就会迅速失效。

**Antigravity CLI**（“零重力”命令行工具）应运而生。它不是一个普通的终端聊天界面，而是一个具备**自主环境感知、长程规划推理、物理工具操纵、多智能体协同**以及**状态沙箱恢复**的“智能体双人驾驶舱”。它专为解决复杂工程重构、海量代码审计与零摩擦自动化交付而设计。

本指南将深入拆解 Antigravity CLI 0.35.0+ 版本的底层架构，并提供一份**阅读与实践时间不少于 20 分钟**的硬核技术字典。

---

## 1. 零重力哲学与底层架构

在掌握具体的指令之前，我们首先需要理解 Antigravity 的核心设计哲学：**“将 AI Agent 作为具备全权物理能力的双 pilot，而非只说不做的咨询顾问。”**

```
+-----------------------------------------------------------------------+
|                         Antigravity Core CLI                          |
+-----------------------------------------------------------------------+
        |                                                       ^
        v (1. Intent Input)                                     | (4. State Back)
+-----------------------+                               +-----------------------+
|  Intent & Constraints |                               |      Walkthrough      |
+-----------------------+                               +-----------------------+
        |                                                       ^
        v (2. Plan & Strategy)                                  | (3. Action & Verify)
+-----------------------------------------------------------------------+
|      [Planner]  ->  [Research]  ->  [Write/Execute]  ->  [Verify]     |
+-----------------------------------------------------------------------+
        |                  |                 |                 |
        v                  v                 v                 v
   (GEMINI.md)       (grep_search)      (run_command)     (npm run test)
```

### 1.1 四阶段闭环工作流 (PRWV)
传统的 AI 工具在收到任务后会立即开始写代码，这在复杂项目里往往会导致“按下葫芦起了瓢”的灾难。Antigravity 强制执行 **PRWV 四阶段循环**：

1. **Research（研究阶段）**：Agent 严禁在第一步修改任何源码。它会使用 `grep_search`、`list_dir` 以及 `view_file` 工具，在本地代码库建立临时的 AST 依赖图，深度分析关联接口与潜在的破坏性影响。
2. **Planner（规划阶段）**：生成包含改动范围、回滚预案、验证方法的 `implementation_plan.md` 交付文档，向人类驾驶员申请授权。
3. **Write/Execute（执行阶段）**：在获得明确授权后，调用 `replace_file_content`（精确上下文行级匹配）或 `run_command` 进行实质性代码写入和脚本执行。
4. **Verify（验证阶段）**：自动运行项目内定义的测试命令（如 `npm run test` 或 `pytest`），通过本地浏览器渲染测试，生成 `walkthrough.md` 报告。

### 1.2 沙箱与状态回溯机制
Antigravity 最强大的防御设计是其**非破坏性隔离沙箱**。
- **分支独立性**：默认情况下，当任务较为庞大或具有高风险时，可以通过 `Workspace: branch` 派生一个完全隔离的文件系统分支。
- **自动快照**：每一次实质性的工具写入，CLI 都会在内部维护一个以 SHA-256 命名的状态快照。一旦编译或测试失败，Agent 可以选择瞬间 `/rewind`（时光回溯），将代码精确恢复到上一个稳定点。

---

## 2. 内置斜杠指令 (Slash Commands) 终极字典

斜杠指令（Slash Commands）是人类驾驶员在终端中与 Antigravity 交互的最高效媒介。以下是核心指令的深剖与交互范例。

| 指令 | 核心功能分类 | 适用场景 | 效率提升度 |
| :--- | :--- | :--- | :--- |
| `/goal` | 守护进程级长程运行 | 挂机执行需要多步骤、长时间的重构任务 | 🚀🚀🚀🚀🚀 |
| `/schedule` | 定时轮询与一shot定时器 | 监控构建状态、定期拉取代码与自动健康检查 | 🚀🚀🚀 |
| `/browser` | 动态网页抓取与交互 | 阅读最新在线框架文档，解决 API 变更盲区 | 🚀🚀🚀🚀 |
| `/grill-me` | 交互式对齐面试 | 方案制定前，AI 对人类进行灵魂拷问，明晰隐性需求 | 🚀🚀🚀🚀 |
| `/rewind` | 时光机版本回溯 | AI 改写逻辑出错导致大面积崩溃时瞬间回滚 | 🚀🚀🚀🚀🚀 |
| `/restore` | 应急撤销机制 | 从自动检查点恢复受损的单个核心文件 | 🚀🚀🚀 |
| `/reset` | 上下文归零 | 切换完全不相关的新任务，防止历史噪声干扰 | 🚀🚀 |

---

### 2.1 长时运行守护指令：`/goal`

当人类需要对大型项目进行整体迁移（例如将几十个控制器的 PHP Yii2 项目迁移到 Laravel 12）时，单次的问答交互显然无法承载。`/goal` 能够将 Agent 托管到后台，使其作为守护进程不懈努力，直到目标 100% 达成。

#### 交互范例与工作流展示：
```bash
> /goal 将当前项目所有的旧版控制器重构为符合 Laravel 12 规范的单职责 Action 类，并通过自动化测试。
```

当输入该指令后，Antigravity CLI 会进入如下处理逻辑：
1. **生成异步任务 ID**：例如 `task_goal_20260525_001`。
2. **挂起终端**：你可以安全地关闭终端或做其他开发，AI 在后台静默运行。
3. **主动唤醒机制**：当后台任务在编译时遇到未解之谜（如由于环境缺失导致的三方依赖冲突），它会通过系统通知发送一条 `High-priority notification` 唤醒你，要求你输入 `/goal send_input --id 001 "已经安装了对应依赖"` 继续执行。

---

### 2.2 动态网络雷达：`/browser`

离线大模型的最大痛点是知识库滞后。当你使用的是 2026 年刚刚发布的框架新特性时，AI 往往会给出过时的废弃 API。`/browser` 能够让 Agent 拥有视觉和实时动态抓取能力。

#### 实战命令序列：
```bash
# 指示 AI 使用内置浏览器引擎，爬取 Laravel 官方关于 2026 年 Laravel 12 新发布路由特性的页面，并提取 Markdown
> /browser "https://laravel.com/docs/12.x/routing"

# 或者让 AI 针对特定的 bug 进行全网实时排查
> /browser "site:stackoverflow.com 'vite hot reload failed in windows wsl2'"
```

通过 `/browser` 指令，Agent 会启动一个无头浏览器（Headless Browser），支持：
- 绕过传统的静态 `curl` 无法解析的单页面应用（SPA）。
- 自动渲染页面 DOM，抓取最新的 API 签名。
- 支持将网页截图并进行多模态视觉分析，这在调试 CSS 错位或前端组件错色时极其致命且有效。

---

### 2.3 需求对齐神盾：`/grill-me`

很多时候，开发者提出的需求是模糊的（例如：“帮我加一个认证功能”）。如果 AI 盲目开始写，写出来的代码往往与你的架构设计格格不入。`/grill-me` 启动一个**交互式对齐机制**。

#### 典型交互过程：
```bash
> /grill-me 帮我给 Go 语言的后台系统增加 JWT 认证

[Antigravity CLI] 正在启动对齐面试，为了提供完美的架构方案，请回答以下 3 个核心决策：
1) 密钥管理：您倾向于将密钥存储在环境变量中，还是集成外部 HashiCorp Vault？
2) 令牌失效机制：我们是否需要使用 Redis 存储黑名单（支持主动注销），还是采用纯无状态的短过期时间？
3) 中间件范围：JWT 验证需要全局应用，还是只针对特定的路由组（例如 /api/v1/admin/*）？

> 1. 环境变量即可；2. 纯无状态；3. 只针对 /api/v2/* 路由组。
```
通过这种高度聚焦的灵魂拷问，AI 在编码前就将所有隐性边界条件完全闭环，避免了无意义的返工。

---

## 3. Antigravity CLI 核心配置字典

Antigravity CLI 的行为完全由其配置文件控制。默认全局配置位于 `~/.antigravity/config.json`，而项目级覆盖配置则存放在项目根目录下的 `.antigravity.json` 中。

以下是一份生产环境级别的核心配置字典：

```json
{
  "version": "0.35.0",
  "agent": {
    "model": "gemini-3.5-pro",
    "temperature": 0.1,
    "max_context_tokens": 128000,
    "context_compression_threshold": 80000
  },
  "security": {
    "allowed_commands": [
      "^npm (run dev|run build|install)$",
      "^git (status|diff|add|commit|push|pull)$",
      "^php artisan"
    ],
    "forbidden_commands": [
      "rm -rf /",
      "mkfs",
      "dd"
    ],
    "require_approval_for_write": true,
    "sandbox_mode": "share"
  },
  "tools": {
    "timeout_ms": 30000,
    "mcp_servers": {
      "github-mcp": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_PAT_HERE"
        }
      }
    }
  },
  "ux": {
    "theme": "glassmorphism-dark",
    "vim_mode": false,
    "keybindings": {
      "rewind": "ctrl+z",
      "pause": "ctrl+p"
    }
  }
}
```

### 3.1 核心参数深度原理解析：
- **`context_compression_threshold`**：当上下文达到 80,000 token 时，CLI 会自动触发 `/compress` 算法，将旧的对话记录通过语义嵌入（Semantic Embedding）压缩为高维度的摘要向量，从而在保持超长记忆的同时，**缩减 60% 以上的 API Token 开销**，并避免大模型在长上下文中产生“注意力涣散”。
- **`allowed_commands` 与 `forbidden_commands`**：基于正则表达式的物理命令防御网。任何不匹配 `allowed_commands` 的 shell 命令在执行前，都必须由人类在终端中手动输入 `y` 确认，杜绝了 AI 因为幻觉误执行危险脚本的可能。
- **`sandbox_mode: "share"`**：共享底层物理存储库（类似于 `git worktree`），这使得派生子代理分支时，不需要冗余地复制几百 MB 的 `node_modules` 文件夹，极大提升了多代理并发运行的速度。

---

## 4. MCP (Model Context Protocol) 深度整合

**Model Context Protocol (MCP)** 是由 Anthropic、Google 等联合推行的开放标准，旨在彻底打通 AI 与外部应用生态之间的壁垒。Antigravity CLI 提供了对 MCP 协议的完美原生支持。

```
+------------------+                   +------------------+
|                  | <-- Read/Write -> |  Local Filesystem|
|   Antigravity    |                   +------------------+
|   CLI Engine     | <-- Execute ----> |  Secure Sandbox  |
|                  |                   +------------------+
|                  | <-- MCP --------> |  GitHub, Slack   |
+------------------+                   +------------------+
```

### 4.1 MCP 的连接方式
通过 `/mcp` 指令或在配置文件中声明，你可以将任意标准 MCP 服务接入 Antigravity：

```bash
# 动态加载一个外部的 SQLite 数据库查询 MCP
> /mcp add sqlite-server npx -y @modelcontextprotocol/server-sqlite --db /path/to/app.db
```

### 4.2 为什么 MCP 改变了开发游戏规则？
在没有 MCP 之前，如果 AI 想要获取你在 GitHub 上的 Issues 或者 Slack 上的警报，你必须手动复制粘贴。
现在，一旦接入 GitHub MCP 服务，你可以直接对 Antigravity 说：
> “研究当前代码库，找出导致 GitHub Issue #432 报错的根源代码，写个修复补丁，并在通过测试后自动在 GitHub 上提交 PR，把修复结果发送到我们的 Slack #dev-ops 频道。”

整个跨软件、跨平台的超长链路，全由 Antigravity CLI 调度 MCP 工具链自动完成。

---

## 5. 多智能体 (Sub-agents) 协同网络

面对极其庞大的工程任务，单个 AI 会受限于单点推理能力的瓶颈。Antigravity 引入了**蜂群多智能体模型（Swarm Sub-agents Network）**。

### 5.1 智能体三剑客拓扑架构

```
               +----------------------+
               |    Antigravity CLI   | (Human Dual-Pilot)
               +----------------------+
                           |
            +--------------+--------------+
            |                             |
            v                             v
+-----------------------+     +-----------------------+
| codebase_investigator |     |      review-bugs      |
| (专职跨文件依赖挖掘)  |     | (8维度逻辑漏洞审计器) |
+-----------------------+     +-----------------------+
            |                             |
            +--------------+--------------+
                           |
                           v
               +----------------------+
               |   ui-ux-pro-max      |
               | (精细化视觉与样式生成)|
               +----------------------+
```

### 5.2 核心管理指令集：
- **`define_subagent`**：在当前运行时中动态定义一个新的专家智能体，指定其 `system_prompt` 和可调用的工具权限。
- **`invoke_subagent`**：并发启动一个或多个子智能体。
- **`send_message`**：在子智能体运行期间，主代理可以通过消息管道与其异步通信，传递新的指令或获取阶段性产物。

### 5.3 智能体协作实战代码：
以下是在处理一个高并发 Redis 缓存击穿问题时，主代理自动派生子代理协同的内部伪代码展示：

```javascript
// 主代理感知到代码中存在高并发隐患，决定派生 review-bugs 子代理
const conversationId = await tool.define_subagent({
  name: "concurrency_auditor",
  description: "专门用于审计高并发下竞态条件和死锁的专家级子代理",
  system_prompt: "你是一个精通操作系统、内核屏障、锁竞争和 Redis 分布式锁的顶尖架构师。请对传入的代码段进行高并发死锁和数据一致性审计。"
});

// 并发发送审计任务，自身继续分析路由逻辑
await tool.send_message({
  Recipient: conversationId,
  Message: "请重点审计 d:\projects\src\services\CacheService.go 中的 GetOrSet 方法，找出可能引起 Redis 击穿的逻辑。"
});
```

---

## 6. 实战场景：超大型项目一键重构工作流

为了让你完全掌握零重力开发的精髓，我们来演练一个真实的企业级场景：**“将一个采用 Vue 2 + Element UI 的旧管理后台，一键重构为 Vue 3 + Tailwind CSS + Pinia 状态管理，并保证所有的路由及业务鉴权完全不受影响。”**

这是很多前端团队视作噩梦的巨大工作量，但在 Antigravity CLI 的加持下，只需要一套行云流水的工作流。

### 步骤 1：全域扫描与意图制定
首先，使用 `/grill-me` 梳理迁移范围，并将设计范式写入 `GEMINI.md` 作为项目最高法典。

```bash
# 启动需求面试
> /grill-me 启动 Vue 2 迁移 Vue 3 计划
```

### 步骤 2：启动长时重构守护进程
利用 `/goal` 锁定目标，使 AI 进入挂机重构模式。

```bash
> /goal 1. 递归扫描 src/views 下的所有 .vue 文件；
  2. 使用 codebase_investigator 智能体画出全局组件依赖树；
  3. 逐步将 Options API 改写为 Composition API (<script setup>)；
  4. 将 Element UI 标签替换为 Tailwind CSS + 原生优质设计组件，确保调用 ui-ux-pro-max 技能；
  5. 将旧的 Vuex Store 完全迁移至 Pinia；
  6. 每次成功转换一个模块，运行 npm run build 进行静态语法检查，若报错则自动 /rewind；
  7. 全局重构完成后，输出完整迁移报告。
```

### 步骤 3：多智能体并发重构
此时，主代理在后台启动多个子任务：
1. **`codebase_investigator`** 率先动作，生成一张完美的依赖图，标识出最底层的叶子节点组件（如 `Button.vue`, `Input.vue`）。重构必须**自底向上**进行，这样才能保证顶层页面在引用底层组件时不会发生类型崩溃。
2. 主代理依次读取底层组件，调用 **`ui-ux-pro-max`** 生成优雅的 Tailwind 样式，重写为 Vue 3 组件。
3. 每次写入后，自动调用 **`review-bugs`**，重点检查 Vue 3 中 `ref` 与 `reactive` 解构可能导致的响应式丢失问题。

### 步骤 4：自动化流水线验证
当所有组件转换完毕，Antigravity 会自动执行：
```bash
$ npm run build
```
如果编译阶段爆出 `Uncaught TypeError: Cannot read properties of undefined (reading '_c')`（经典的 Vue 2/3 混用错误），Agent 会自动读取构建错误日志，精准定位到出错的特定文件行数，自我修正，再次构建，直至终端跳出完美的绿色 `Build Success`。

### 步骤 5：自动规范化提交与推送
重构完成后，执行 `git-pushing` 原子技能。

```bash
> smart_commit.sh "refactor(views): complete migrating whole console panel from Vue 2 to Vue 3"
```
脚本会自动分析改动的文件，生成优雅的 Conventional Message，并自动推送到远端 Git 仓库。

---

## 7. 结语与效率飞跃法则

Antigravity CLI 的终极奥义在于：**它把人类开发者从低效的“打字员”工作中解放出来，将你的角色提升为“系统架构师与方案评审员”。**

要实现真正的“零重力”高效编码，请牢记以下三条铁律：
1. **绝对不要跳过 `/plan` 阶段**：越是在复杂的大型项目中，花 3 分钟审查 AI 方案，能为你节省 3 小时修复幻觉代码的时间。
2. **善用 `GEMINI.md` 约束**：它是你灌输给 AI 的世界观。把你的代码偏好（如“禁止使用 else 关键字”、“必须使用严格强类型”）写进去，AI 产出的代码就会像你亲手写的一样规整。
3. **拥抱 `/goal` 挂机**：学会将复杂、重复、繁重的体力活托付给后台守护进程，去喝杯咖啡，静待绿色的构建成功通知。

零重力开发的时代已经到来，现在，打开你的终端，输入你的第一个 `/goal`，开始体验真正的飞速进化吧！
