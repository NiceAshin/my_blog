---
title: 从零写一个 Agent Skill：规范、实操与 12 个娱乐向玩法
date: 2026-10-25
categories:
  - AI
tags:
  - Agent Skills
  - Claude Code
  - AI Agent
---

# 从零写一个 Agent Skill：规范、实操与 12 个娱乐向玩法

> 适合读者：想让 AI 助手"记住自己那套做事方法"的开发者、重度 AI 工具用户。
> 预计阅读：18 分钟。
> 读完你会得到一个能跑的最小 Skill、一套避坑清单，以及一份可以直接抄的娱乐向 Skill 清单。

## 1. Skill 到底是什么

一句话：**Skill 是把"你脑子里那套做事流程"打包成 Agent 能自己发现、自己加载的文件夹。**

Anthropic 在 2025 年底把 Agent Skills 做成了开放标准（规范现由 [agentskills.io](https://agentskills.io/specification) 维护），官方说明里有个很贴切的类比——给 Agent 写 Skill，就像给新入职的同事写一份 onboarding 手册：不是教他"什么是 PDF"，而是告诉他"我们公司填这份 PDF 表单的流程是这几步，脚本在这个目录"。

它和另外两个常被混淆的概念要分清：

| 概念 | 解决的问题 | 形态 |
| --- | --- | --- |
| Prompt / 系统提示词 | 这一次对话怎么表现 | 一段文本 |
| MCP | 能连上哪些外部工具和数据 | 一个服务端 |
| **Skill** | **这类任务应该按什么流程做** | **一个目录 + SKILL.md** |

Skill 只描述流程与知识，不提供新能力；真要读数据库、调 API，仍然靠 MCP 或命令行。所以两者是互补的：MCP 给它手，Skill 给它 SOP。

### 核心设计：渐进式披露

Skill 之所以能做到"装几十个也不撑爆上下文"，靠的是三层加载：

| 层级 | 内容 | 何时进上下文 | 体量建议 |
| --- | --- | --- | --- |
| 第一层 | `name` + `description` | 启动时全量预载 | 每个约 100 tokens |
| 第二层 | `SKILL.md` 正文 | Agent 判断相关后才读 | 建议小于 5000 tokens、500 行以内 |
| 第三层 | `scripts/`、`references/`、`assets/` | 执行到需要时才按需读 | 不设上限 |

理解这一点，后面所有设计决策都顺了：**description 决定"会不会被想起来"，SKILL.md 正文决定"想到了做得对不对"，附属文件决定"做复杂任务时够不够用"。**

## 2. 最小可用 Skill：5 行

官方模板 `template-skill` 的全部内容就是这么点东西：

```markdown
---
name: template-skill
description: Replace with description of the skill and when Claude should use it.
---

# Insert instructions below
```

目录结构：

```text
template-skill/
└── SKILL.md
```

就这么简单——一个以 skill 名命名的目录，里面一个带 YAML front matter 的 `SKILL.md`。没有注册表，没有编译，没有依赖（除非你自己加）。

## 3. 硬性规范：front matter 别写错

`SKILL.md` 必须以 YAML front matter 开头。字段规则按官方 spec：

| 字段 | 必填 | 约束 |
| --- | --- | --- |
| `name` | 是 | 1–64 字符；只允许小写字母、数字、连字符；不能以连字符开头或结尾；不能出现连续连字符；**必须与父目录名完全一致** |
| `description` | 是 | 1–1024 字符；要同时说明"做什么"和"什么时候用"；建议塞入具体关键词 |
| `license` | 否 | 简短写许可证名或指向随附的许可证文件 |
| `compatibility` | 否 | 1–500 字符；仅当有特殊环境要求时写（需要的系统包、网络、目标产品） |
| `metadata` | 否 | 字符串键值对，客户端可存放自定义属性，键名建议加前缀避免冲突 |
| `allowed-tools` | 否 | 空格分隔的预授权工具列表，实验性字段，各家客户端支持度不一 |

两个最容易踩的：

- `name` 写成 `MovieNight` 或 `movie_night` → 非法，只能 `movie-night`；
- 目录叫 `movie-night`，front matter 里写 `name: movie-picker` → 非法，规范要求两者一致。

写完可以用官方的 `skills-ref` 校验库过一遍，比人肉检查可靠。

## 4. 目录怎么分：三个约定目录

规范只要求 `SKILL.md`，其余都是推荐约定，但按约定来能显著降低上下文开销：

```text
movie-night/
├── SKILL.md              # 触发条件 + 主流程（保持精简）
├── references/
│   ├── mood-genres.md    # 情绪→类型映射表，需要时再读
│   └── platforms.md      # 各平台片库特点
├── scripts/
│   └── dedupe_history.py # 确定性逻辑交给代码
└── assets/
    └── output-template.md # 固定输出模板
```

分工原则一句话：**流程写正文，知识放 references，确定性逻辑写成脚本，模板素材放 assets。**

尤其是"确定性"这件事：让模型排序 200 条记录既贵又可能出错，让 Python 跑排序算法既便宜又稳定。官方说明里说得很直白——用 token 生成去做排序，不如直接执行代码；而且代码可重复。

## 5. 实操一：写一个"今晚看什么"Skill

这是最适合练手的题目：需求真实、边界清楚、还能立刻自用。

### 5.1 先写 description，再写正文

绝大多数 Skill 失效不是正文写得差，是 description 没写触发条件。对比一下：

```yaml
# 差：只说了做什么，Agent 不知道什么时候该想起来
description: 推荐电影。

# 好：说清做什么 + 用户可能怎么开口 + 输出预期
description: 帮用户决定今晚看什么影视内容。当用户说"今晚看什么""推荐部电影""找不到片看""想刷剧""按心情/时长/平台选片""片荒"时使用。输出 3 个候选并说明理由，避开近 30 天推荐过的片。
```

把用户真实会说的口语词塞进去，命中率会明显提升。

### 5.2 完整 SKILL.md

```markdown
---
name: movie-night
description: 帮用户决定今晚看什么影视内容。当用户说"今晚看什么""推荐部电影""找不到片看""想刷剧""按心情/时长/平台选片""片荒"时使用。输出 3 个候选并说明理由，避开近 30 天推荐过的片。
license: MIT
---

# 今晚看什么

## 何时使用

用户需要在有限时间内选一部影视内容，且没有明确目标片名。若用户已指定片名，只做信息补充，不要走本流程。

## 收集条件

优先从对话里推断，缺什么才问什么，**一次最多问两个问题**，避免把选片变成问卷。

| 条件 | 缺省值 |
| --- | --- |
| 可用时长 | 120 分钟 |
| 心情 | 放松 |
| 平台 | 不限 |
| 雷区 | 无（恐怖、血腥默认排除） |

## 执行步骤

1. 读 `references/mood-genres.md`，把心情映射为 2–3 个类型。
2. 每个类型挑 1 个候选，优先时长落在可用时长内的作品。
3. 运行 `python3 scripts/dedupe_history.py --days 30`，剔除近 30 天已推荐过的标题。
4. 按下方格式输出 3 条，每条的"为什么今晚合适"必须落在具体条件上（时长、心情、平台），不要写"口碑很好"这类空话。

## 输出格式（固定，不要增删段落）

1. **片名（年份）** — 平台 · 时长
   一句话钩子（不超过 30 字，不剧透关键情节）
   为什么今晚合适：……

## 边界

- 不剧透结尾、反转、凶手。
- 平台版权随时变动，标注"以平台实际片库为准"，不要断言"一定能看"。
- 用户明确拒绝某一类型后，本轮不再推荐该类型。
```

### 5.3 配套脚本

```python
#!/usr/bin/env python3
"""过滤近 N 天推荐过的片名。

用法: python3 dedupe_history.py --days 30
输入: 同目录下 history.json，格式 [{"title": "...", "date": "2026-10-01"}, ...]
输出: stdout 打印可推荐的片名列表（每行一个），并就地清理过期记录。
"""
import argparse
import datetime
import json
import pathlib
import sys

HISTORY = pathlib.Path(__file__).with_name("history.json")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()

    if not HISTORY.exists():
        print("", end="")  # 没有历史记录，全部可推荐
        return 0

    try:
        records = json.loads(HISTORY.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"history.json 格式错误: {exc}", file=sys.stderr)
        return 1

    cutoff = datetime.date.today() - datetime.timedelta(days=args.days)
    fresh = [r for r in records if datetime.date.fromisoformat(r["date"]) >= cutoff]
    HISTORY.write_text(json.dumps(fresh, ensure_ascii=False, indent=2), encoding="utf-8")

    for r in fresh:
        print(r["title"])
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

正文第 3 步写的是"运行该脚本"，不是"阅读该脚本"——这个措辞很关键。模型默认倾向把文件读进上下文，明确说"运行，不要读入"，它才会真的去执行。

### 5.4 references 只放会变的知识

`references/mood-genres.md` 这种映射表是典型的"知识型"内容，写一次能用很久；而"某平台这个月上了什么新片"这种高频变化的信息**不要写进 Skill**，交给脚本或检索实时拿。把易过期数据写死在正文里，是 Skill 三个月后开始胡说八道的主要原因。

## 6. 实操二：给工作流加"计算"和"模板"

再举一个更接近日常的例子：`weekly-menu`（周末吃什么 + 自动生成采购清单）。

```text
weekly-menu/
├── SKILL.md
├── references/
│   └── pantry.md          # 家里常备调料，避免重复买
├── scripts/
│   └── sum_ingredients.py # 合并同类食材、按克数累加、按超市分区排序
└── assets/
    └── shopping-list.md   # 采购清单模板
```

它的设计要点有三处值得抄：

1. **分工清晰**：模型负责"想菜"和"换口味"，脚本负责"把 7 道菜的食材合并成一张清单"——后者是纯计算，交给代码。
2. **模板外置**：采购清单要按"生鲜 / 冷藏 / 粮油 / 日杂"分区打印，把模板放 `assets/`，正文只说"按 assets/shopping-list.md 的骨架填"，改版式时不用动流程。
3. **状态文件**：`pantry.md` 记录常备品，每次生成清单前读一次，避免"家里有三瓶生抽还让你买"。

把这两个例子抽象一下，几乎所有实用 Skill 都是同一个骨架：

```text
触发条件（description）
  → 补全输入（能从上下文推断就别问）
  → 读知识（references）
  → 跑计算（scripts）
  → 按模板输出（assets）
  → 声明边界（不许做什么）
```

## 7. 写完怎么测：三组检查

Skill 不是写完就完事的东西，它是会被模型"阅读理解"的代码，得测。

| 检查 | 做法 | 期望 |
| --- | --- | --- |
| 触发测试 | 用 10 句不同口语表达问一遍，混入 3 句不该触发的 | 该触发的都触发，不该触发的不误触 |
| 边界测试 | 故意缺关键输入、给矛盾条件 | 只问必要的 1–2 个问题，不卡死 |
| 回归测试 | 同一指令跑 3 次 | 输出结构一致，字段不漂移 |

进阶做法是记录 Agent 的执行轨迹：它是先读 references 还是先跑脚本？有没有反复读同一个文件？有没有在脚本报错后自己瞎编结果？这些观察比读十遍规范更能定位问题。官方也建议让模型自己复盘——任务跑偏后直接问它"这次哪里理解错了"，然后把结论沉淀回 Skill。

官方还提供了两个元技能可以直接借：

- `skill-creator`：引导你把一次成功对话提炼成 Skill；
- `template-skill`：最小骨架，避免从零敲 front matter。

## 8. 九个常见坑

| 现象 | 根因 | 修法 |
| --- | --- | --- |
| 从不触发 | description 只写功能，没写使用场景 | 补上用户原话与触发关键词 |
| 到处乱触发 | description 太泛（"帮助用户处理数据"） | 收敛到具体对象、具体动作 |
| 加载报错/不被识别 | 目录名与 `name` 不一致，或用了下划线 | 统一小写连字符，二者同名 |
| 上下文被吃光 | `SKILL.md` 写了上千行 | 拆到 `references/`，保持一层引用 |
| 每次输出都不一样 | 没规定输出格式 | 固定模板与字段顺序 |
| 脚本一跑就崩 | 缺依赖、缺参数校验 | 写清依赖，`compatibility` 声明环境，脚本自己报错 |
| 三个月后开始胡说 | 价格、版本、片单写死在正文 | 挪到 references 或交给脚本实时取 |
| 模型只读不跑 | 没说明脚本用途 | 明确"运行该脚本，不要读入上下文" |
| 触发忽好忽坏 | 中英同义词堆砌，语义互相稀释 | 中文场景用中文触发词，专有名词保留英文 |

还有两条不属于"坑"但必须守的纪律：

- **`SKILL.md` 控制在 500 行内**，这不是审美问题，是第二层加载的成本问题；
- **引用一层深**，别搞 `SKILL.md → a.md → b.md → c.md` 的套娃，模型容易走丢。

## 9. 安全：Skill 是可以执行代码的

这一点必须单独说。Skill 里可以带脚本，脚本会被 Agent 直接执行；Skill 里也可以写指令，指令会被 Agent 当成"该怎么做事"的依据。两者叠加，一个恶意 Skill 完全可以做到读取本地文件、往外发请求、诱导 Agent 做出意外操作。

Anthropic 的安全建议很明确：**只从可信来源安装 Skill；从不太可信的来源安装前，把包里每个文件读一遍**，重点看代码依赖、随附的图片/脚本资源，以及有没有让你去连陌生域名的指令。

落到日常：

1. 装之前先 `ls -R` 看目录，有没有来路不明的可执行文件；
2. `grep -r "http" ` 扫一遍网络出口；
3. `allowed-tools` 这种预授权字段，看到就要格外小心——它等于提前放行某些工具；
4. 涉及删文件、发消息、上传数据的 Skill，先在小项目里试。

## 10. 娱乐向 Skills 推荐：12 个能立刻玩起来的

下面这些仓库与 Skill 均实际存在（star 数为 2026-10-25 通过 GitHub API 抓取，会变动），按玩法分四组。挑之前先看一眼第 9 节的审计建议。

### 10.1 生成艺术与表情包

| Skill | 出处 | 玩什么 |
| --- | --- | --- |
| `algorithmic-art` | [anthropics/skills](https://github.com/anthropics/skills)（官方，约 183k star） | 用 p5.js 做生成艺术：种子随机、流场、粒子系统，每次出一张不重样的图 |
| `canvas-design` | 同上 | 按设计哲学产出 png/pdf 视觉作品，做海报、封面、朋友圈长图很顺手 |
| `slack-gif-creator` | 同上 | 生成符合 Slack 体积限制的动态表情包，适合做群里的固定梗 |
| `theme-factory` | 同上 | 10 套预设主题一键套到产物上，懒得配色时的救命工具 |

官方仓库里的 19 个 Skill 是学写 Skill 最好的教材——`pdf`、`docx`、`pptx`、`xlsx` 这四个文档类 Skill 展示了"正文精简 + 附属文件按需加载"的标准写法，`skill-creator` 和 `template-skill` 则是元技能本身。

### 10.2 音乐：从写歌到歌单

| Skill | 出处 | 玩什么 |
| --- | --- | --- |
| `buddy-sings` | [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills)（约 13.7k star） | 读取你 Agent 宠物的"性格"，匹配音色风格、按上下文写词作曲，让它开口唱 |
| `minimax-music-gen` | 同上 | 核心生成引擎，支持人声歌曲、纯音乐、翻唱三种模式 |
| `minimax-music-playlist` | 同上 | 分析听歌偏好建"品味画像"，直接生成一整张原创歌单 |
| `harmonic-mixing` | [karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills) | 查曲目 BPM 与调性，规划 DJ 式歌单过渡，接歌不打架 |
| `identify-song` | 同上 | 从链接或音频文件识别曲目，听到好听的片段不用再靠耳朵猜 |
| `claude-ai-music-skills` | [bitwize-music-studio/claude-ai-music-skills](https://github.com/bitwize-music-studio/claude-ai-music-skills)（约 0.6k star） | 面向 Suno 的完整音乐制作流：写词、风格提示词、分轨混音、母带、发行 |

音乐这一组是目前社区里最热闹的方向，特点是"Skill + 外部生成服务"组合——Skill 负责创意与提示词工程，真正出声靠后端模型或 API。

### 10.3 影像与叙事

| Skill | 出处 | 玩什么 |
| --- | --- | --- |
| `claude-real-video` | [HUANGCHIHHUNGLeo/claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video)（约 2.3k star） | 让模型真的"看"视频：场景感知抽帧 + 带时间戳的转写，问"第几分钟说了什么"不再靠猜 |
| `vox-director` | [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director)（约 2.4k star） | 一个主题 → 一条 Vox 风纸拼贴解说视频，脚本、配音、剪辑串起来自动跑 |
| `motion-skills` | [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills)（约 1.0k star） | 50 个动效/动画/视频 Skill 分 14 个包，做片头、转场、数据动画 |
| `ruxi-skill` | karanb192/awesome-claude-skills | 从选定书籍场景生成单文件视觉小说，带原文出处链接的分支选项 |
| `claude-epub-skill` | 社区精选合集（travisvn / BehiSecc 的 awesome 列表均有收录） | 把 markdown、聊天记录、调研报告转成 epub，直接推到 Kindle |

### 10.4 游戏、桌游与生活玩法

| Skill | 出处 | 玩什么 |
| --- | --- | --- |
| `table-sheet` | karanb192/awesome-claude-skills | 把 D&D Beyond 角色卡转成跑团速查指南 + 开团前检查清单 |
| `puzzlegenio` | 同上 | 选谜题类型，生成预填参数的链接，产出可打印的填字/数独类谜题 |
| `gif-sticker-maker` | MiniMax-AI/skills | 做聊天表情贴纸，比 `slack-gif-creator` 更偏"社交平台尺寸" |

顺带提一个"泛娱乐"的基础件：官方 `theme-factory` + `canvas-design` 组合起来，可以批量产出统一风格的周报封面、播客封面、书单卡片；`claude-real-video` 用来给长视频做"章节索引"，追剧、听播客、看会议录像都省时间。

### 10.5 一个提醒

社区汇总仓库（`travisvn/awesome-claude-skills` 约 15.5k star、`BehiSecc/awesome-claude-skills` 约 10.3k star、`karanb192/awesome-claude-skills`）适合当索引，但里面的条目质量参差，很多 Skill 依赖付费 API 或需要自有账号，装之前看清 `compatibility` 与 README 的 Key 要求——特别是音乐、视频类，几乎都要后端服务，别以为装完就能离线出声。

## 11. 怎么装

不同客户端目录略有差异，通用做法是两级：

```text
~/.claude/skills/<skill-name>/SKILL.md   # 个人级，所有项目可用
<project>/.claude/skills/<skill-name>/SKILL.md  # 项目级，随仓库走
```

安装即"把 skill 目录放进去"，不需要构建。社区也有 `npx skills add <repo>` 之类的安装器，用法以对应仓库 README 为准。

装完验证三件事：

1. Agent 启动后能看到这个 skill 的名字（说明 front matter 被解析）；
2. 用一句"该触发"的话问它，看会不会加载（说明 description 有效）；
3. 让它跑一次带脚本的流程，确认脚本能执行、路径没写死。

## 12. 写在最后

Skill 的价值不在"这次对话答得更好"，而在**把一次性对话变成可复用资产**。

我自己的经验是：每当某个任务让我重复解释第三遍——"封面要黑白配色""周报按这四段写""这个目录的文件先归到年份文件夹"——那就该写 Skill 了。写完的收益也不是线性的：一次写对，后面几百次都不用再说。

如果你想今天就开始，三步就够：

1. 翻聊天记录，找出你重复交代最多的一件事；
2. 按第 5 节的骨架写一个 30 行的 `SKILL.md`，先只写触发条件和输出格式；
3. 用一周，每踩一次坑就往里补一条，坑补完，Skill 就成型了。

至于娱乐向的那些——先挑一个装上玩十分钟。兴趣是最好的 feedstock，玩明白了，你自然会知道下一个 Skill 该写什么。

## 参考资料

- Agent Skills 规范：https://agentskills.io/specification
- Anthropic 工程博客《Equipping agents for the real world with Agent Skills》：https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- 官方 Skill 仓库：https://github.com/anthropics/skills
- MiniMax 开源 Music Skills：https://github.com/MiniMax-AI/skills
- 社区索引：https://github.com/travisvn/awesome-claude-skills 、https://github.com/BehiSecc/awesome-claude-skills 、https://github.com/karanb192/awesome-claude-skills

