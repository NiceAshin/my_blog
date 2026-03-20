---
title: OpenClaw 部署指南：MacBook Air 上的私人 AI 助手
date: 2026-03-20
categories:
  - AI
tags:
  - AI
  - OpenClaw
  - macOS
  - 个人助手
---

# OpenClaw 部署指南：MacBook Air 上的私人 AI 助手

想要一个**只属于你**的 AI 助手吗？它能帮你回复消息、整理日程、甚至控制你的设备——而这一切都运行在你自己的机器上，数据完全私密。OpenClaw 就是这样一只"小龙虾"！

---

## 什么是 OpenClaw？

OpenClaw 是一个**开源的个人 AI 助手**，特点如下：

- **本地运行**：数据在你自己手里，隐私安全
- **多平台支持**：WhatsApp、Telegram、Slack、Discord、微信等 20+ 平台
- **语音交互**：支持语音唤醒和对话（macOS/iOS/Android）
- **可扩展**：通过 Skills 安装各种能力

官方地址：[https://openclaw.ai](https://openclaw.ai)

---

## 准备工作

### 1. 检查 Node.js 版本

OpenClaw 需要 **Node.js 24**（推荐）或 **22.16+**。

打开终端，检查版本：

```bash
node -v
```

如果版本太低或未安装，推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js：

```bash
# 安装 nvm（如果没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 重启终端后安装 Node 24
nvm install 24
nvm use 24
```

### 2. 准备包管理器

任选其一即可：
- **npm**（Node.js 自带）
- **pnpm**（更快，推荐）：`npm install -g pnpm`
- **bun**（最快）：`brew install bun`

---

## 安装 OpenClaw

### 方法一：一键安装（推荐）

```bash
npm install -g openclaw@latest
```

或使用 pnpm：
```bash
pnpm add -g openclaw@latest
```

### 方法二：从源码安装（开发者）

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
```

---

## 首次配置：Onboard 向导

安装完成后，运行引导程序：

```bash
openclaw onboard --install-daemon
```

这个命令会：
1. 检查你的环境
2. 安装 Gateway 守护进程（开机自启）
3. 引导你配置 AI 模型和通道

---

## 启动 Gateway

Gateway 是 OpenClaw 的核心控制中心：

```bash
openclaw gateway --port 18789 --verbose
```

启动后，可以通过浏览器访问控制面板：
```
http://127.0.0.1:18789
```

---

## 配置 AI 模型

OpenClaw 支持多种 AI 模型：

### OpenAI（推荐）

1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 创建新的 API Key
3. 运行配置命令：

```bash
openclaw models add openai --api-key sk-xxx
```

### 其他支持的模型

- **Anthropic Claude**
- **Google Gemini**
- **本地模型**（Ollama、LM Studio 等）

配置示例：
```bash
openclaw models add anthropic --api-key sk-ant-xxx
openclaw models add gemini --api-key AIza-xxx
```

---

## 配置消息通道

OpenClaw 的强大之处在于能连接你常用的聊天工具。

### Telegram（最简单）

1. 找 [@BotFather](https://t.me/botfather) 创建机器人，获取 Token
2. 配置：

```bash
openclaw channels add telegram --token "123456:ABC-DEF"
```

### Discord

1. 创建 Discord Bot（参考 [Discord 开发者门户](https://discord.com/developers/applications)）
2. 获取 Token 和 Application ID
3. 配置：

```bash
openclaw channels add discord --token "xxx" --application-id "xxx"
```

### 其他通道

| 通道 | 配置难度 | 说明 |
|------|---------|------|
| Telegram | 简单 | 推荐入门使用 |
| Discord | 中等 | 需要创建应用 |
| WhatsApp | 中等 | 需要 Facebook 开发者账号 |
| Slack | 中等 | 需要创建 Slack App |
| WebChat | 简单 | 内置网页聊天 |

---

## 基本使用

### 命令行对话

```bash
# 直接与 AI 对话
openclaw agent --message "帮我写一个 Python 爬虫"

# 指定思考深度
openclaw agent --message "分析这段代码的问题" --thinking high
```

### 发送消息

```bash
# 通过配置的通道发送消息
openclaw message send --to @username --message "Hello from OpenClaw!"
```

### 聊天命令（在 Telegram/Discord 中）

| 命令 | 功能 |
|------|------|
| `/status` | 查看会话状态 |
| `/new` 或 `/reset` | 重置会话 |
| `/compact` | 压缩上下文 |
| `/think <level>` | 设置思考深度 |

---

## 安装 macOS 应用（可选）

如果你想在菜单栏快捷控制 OpenClaw：

1. 下载 [OpenClaw macOS App](https://github.com/openclaw/openclaw/releases)
2. 安装后会出现在菜单栏
3. 功能：
   - 语音唤醒
   - 快捷控制
   - 语音对话模式

---

## 常用技能安装

OpenClaw 支持通过 Skills 扩展能力：

```bash
# 查看可用技能
openclaw skills list

# 安装技能（示例）
openclaw skills install browser-control
openclaw skills install calendar
```

热门技能推荐：
- **browser-control**：让 AI 帮你操作浏览器
- **calendar**：日程管理
- **weather**：天气查询

---

## 常见问题

### Q: Gateway 启动失败？

检查端口是否被占用：
```bash
lsof -i :18789
```

换个端口试试：
```bash
openclaw gateway --port 18888
```

### Q: AI 不回复？

1. 检查模型配置：`openclaw models list`
2. 检查 API Key 是否有效
3. 查看日志：`openclaw doctor`

### Q: 如何更新？

```bash
openclaw update --channel stable
```

### Q: 如何卸载？

```bash
npm uninstall -g openclaw
```

---

## 进阶技巧

### 1. 设置开机自启

`--install-daemon` 参数会自动配置 launchd 服务：

```bash
openclaw onboard --install-daemon
```

### 2. 远程访问（Tailscale）

如果你想在手机上也能使用：

```bash
# 配置 Tailscale（需要先安装 Tailscale）
openclaw tailscale serve
```

### 3. 多模型切换

```bash
# 查看可用模型
openclaw models list

# 设置默认模型
openclaw models default gpt-4o
```

---

## 架构图

```
┌─────────────────────────────────────┐
│         你的消息平台                 │
│  Telegram / Discord / WhatsApp ...   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│           Gateway                   │
│      ws://127.0.0.1:18789           │
│         (控制中心)                   │
└─────────────────┬───────────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
   CLI 客户端   WebChat    macOS App
```

---

## 总结

| 步骤 | 命令 |
|------|------|
| 安装 | `npm install -g openclaw@latest` |
| 配置 | `openclaw onboard --install-daemon` |
| 启动 | `openclaw gateway --port 18789` |
| 添加模型 | `openclaw models add openai --api-key xxx` |
| 添加通道 | `openclaw channels add telegram --token xxx` |

完成这些步骤后，你就有了一个完全属于自己的 AI 助手！

---

## 相关资源

- [OpenClaw 官网](https://openclaw.ai)
- [官方文档](https://docs.openclaw.ai)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Discord 社区](https://discord.gg/clawd)
- [ClawHub 技能市场](https://clawhub.com)

---

*最后更新：2026-03-20*