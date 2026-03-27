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
| 企业微信 | 简单 | 群机器人 Webhook |

---

## 企业微信对接

OpenClaw 支持通过企业微信机器人实现消息推送和交互，让你在公司群里也能使用小龙虾。

### 方式一：群机器人 Webhook（推荐）

适合在群聊中使用，配置简单。

#### 1. 创建群机器人

1. 打开企业微信手机端或桌面端
2. 进入目标群聊 → 点击右上角 `···` → `群机器人` → `添加机器人`
3. 自定义机器人名称（如：小龙虾助手）
4. 复制 **Webhook 地址**（格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx`）

#### 2. 配置 OpenClaw 通道

```bash
openclaw channels add wecom-webhook \
  --webhook "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key" \
  --name "公司群机器人"
```

#### 3. 测试消息发送

```bash
openclaw message send \
  --channel wecom-webhook \
  --message "小龙虾已上线！@所有人"
```

#### 4. 在 OpenClaw 中配置自动推送

编辑 `~/.openclaw/config.json`，添加自动规则：

```json
{
  "channels": {
    "wecom-webhook": {
      "type": "wecom",
      "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key",
      "enabled": true
    }
  },
  "rules": [
    {
      "trigger": "schedule",
      "cron": "0 9 * * 1-5",
      "message": "早安！今日工作提醒：检查 Jira 任务",
      "channel": "wecom-webhook"
    }
  ]
}
```

#### 5. 群机器人消息格式

```bash
# 文本消息
openclaw message send --channel wecom-webhook \
  --type text \
  --message "这是一条文本消息" \
  --mentioned-list "@all"

# Markdown 消息
openclaw message send --channel wecom-webhook \
  --type markdown \
  --message "## 今日日报\n> **完成**: 3\n> **进行中**: 5\n> [查看详情](https://jira.company.com)"

# 图文消息
openclaw message send --channel wecom-webhook \
  --type news \
  --title "项目进度更新" \
  --description "本周完成了核心功能开发..." \
  --url "https://docs.company.com/weekly" \
  --picurl "https://company.com/logo.png"
```

### 方式二：企业微信应用（高级）

适合私聊交互，需要管理员权限。

#### 1. 创建企业微信应用

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/wework_admin/frame)
2. 应用管理 → 自建应用 → 创建应用
3. 记录以下信息：
   - **AgentId**：应用 ID
   - **Secret**：应用密钥
   - **企业 ID（CorpId）**：我的企业 → 企业信息

#### 2. 配置可信域名

在应用设置中添加可信域名：
```
your-server.com
```

如果是本地开发，可以使用内网穿透工具（如 ngrok、frp）。

#### 3. 配置 OpenClaw

```bash
openclaw channels add wecom-app \
  --type wecom \
  --corpid "你的企业ID" \
  --agentid "你的应用AgentId" \
  --secret "你的应用Secret" \
  --token "自定义Token" \
  --encodingaeskey "自定义EncodingAESKey"
```

#### 4. 启动接收服务

```bash
# 启动 Gateway 并监听企业微信回调
openclaw gateway --port 18789 --enable-callback
```

#### 5. 设置回调 URL

在企业微信应用设置中，配置回调 URL：
```
https://your-server.com/wecom/callback
```

### 企业微信交互示例

配置完成后，你可以在企业微信中这样使用小龙虾：

```
用户: @小龙虾 帮我查一下今天的会议
小龙虾: 今天有 3 个会议：
       1. 10:00 产品评审（会议室A）
       2. 14:00 技术分享（线上）
       3. 16:00 1:1 沟通（会议室B）

用户: @小龙虾 生成周报
小龙虾: 好的，根据本周的工作记录，已生成周报：

       ## 本周工作总结
       ### 已完成
       - 完成用户模块重构
       - 修复 3 个 P1 bug
       - ...

       已发送到你的邮箱。
```

### 企业微信配置完整示例

```json
// ~/.openclaw/config.json
{
  "channels": {
    "wecom-group": {
      "type": "wecom-webhook",
      "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
      "name": "技术群机器人",
      "enabled": true
    },
    "wecom-app": {
      "type": "wecom-app",
      "corpid": "ww1234567890abcdef",
      "agentid": "1000001",
      "secret": "abc123xyz789",
      "token": "mytoken123",
      "encodingaeskey": "1234567890abcdefghijklmnopqrstuvwxyzABCDEF",
      "name": "小龙虾助手",
      "enabled": true
    }
  },
  "skills": {
    "enabled": ["calendar", "jira", "email"]
  }
}
```

### 企业微信常见问题

**Q: Webhook 发送消息失败？**

检查 Webhook URL 是否正确，可以在浏览器直接访问测试：
```bash
curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key' \
  -H 'Content-Type: application/json' \
  -d '{"msgtype":"text","text":{"content":"测试消息"}}'
```

**Q: 应用收不到消息？**

1. 检查回调 URL 是否可访问
2. 确认 Token 和 EncodingAESKey 配置正确
3. 查看企业微信管理后台的错误日志

**Q: 如何实现 @指定人？**

```bash
openclaw message send --channel wecom-webhook \
  --type text \
  --message "请及时处理" \
  --mentioned-list "zhangsan,lisi"  # 企业微信用户ID
  # 或使用手机号
  --mentioned-mobile-list "13800138000"
```

**Q: 如何发送卡片消息？**

```json
{
  "msgtype": "template_card",
  "template_card": {
    "card_type": "text_notice",
    "main_title": {
      "title": "任务提醒",
      "desc": "您有一个新任务待处理"
    },
    "sub_title_text": "点击查看详情",
    "card_action": {
      "type": 1,
      "url": "https://jira.company.com/task/123"
    }
  }
}
```

### 企业微信 vs 其他通道对比

| 特性 | 企业微信群机器人 | 企业微信应用 | Telegram | Discord |
|------|-----------------|-------------|----------|---------|
| 配置难度 | 简单 | 中等 | 简单 | 中等 |
| 私聊支持 | ❌ | ✅ | ✅ | ✅ |
| 群聊支持 | ✅ | ✅ | ✅ | ✅ |
| @提醒 | ✅ | ✅ | ✅ | ✅ |
| 交互按钮 | ❌ | ✅ | ✅ | ✅ |
| 企业合规 | ✅ | ✅ | ❌ | ❌ |

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

*最后更新：2026-03-23*