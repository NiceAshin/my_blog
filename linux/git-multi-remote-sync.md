---
date: 2019-12-15
title: Git 多仓库同步最佳实践：在不操作主仓库 master 的前提下进行跨仓库合并
tags:
  - git
  - workflow
---

# Git 多仓库同步最佳实践：在不操作主仓库 master 的前提下进行跨仓库合并

> 预计阅读时间：6 分钟

在项目实际开发中，我遇到过一个特殊的权限限制：项目绑定了两个 Git 仓库，却只能向主仓库 `origin` 的 `dev` 分支推送，完全无法触碰 `origin/master`。与此同时，副仓库 `guns-gitlab` 的最新代码都在 `master` 上。需求是**将 `guns-gitlab/master` 的更新安全地同步到 `origin/dev`，并保证整个过程不接触 `origin/master`**。

本文记录了最终采用的方案：通过 **本地自建同步分支 `sync-guns`** 串联多仓库，既安全可控，又不会破坏主仓库的权限边界。

## 🧩 项目远程仓库结构

执行 `git remote -v` 可以看到两个远程：

```
guns-gitlab     https://git.javaguns.com/... (fetch)
guns-gitlab     https://git.javaguns.com/... (push)
origin          https://gitee.com/funuo/fn-uav.git (fetch)
origin          https://gitee.com/funuo/fn-uav.git (push)
```

## 🔐 权限限制概览

| 仓库 | 分支   | 权限说明 |
| ---- | ------ | -------- |
| origin | master | ❌ 无权推送 / 不允许操作 |
| origin | dev    | ✔ 可推送 |
| guns-gitlab | master | ✔ 更新来源 |

限制的重点在于：
- **不能 checkout `origin/master`**。
- **不能基于 `origin/master` 创建任何新分支**。

## 🧭 解决方案：本地同步分支 `sync-guns`

核心同步链路如下：

```
guns-gitlab/master  →  本地 sync-guns  →  本地 dev  →  origin/dev
```

通过在本地创建一个只为同步而生的临时分支，既能吸收副仓库的更新，又能在确认无误后再合并进工作分支 `dev`，全程不触碰 `origin/master`。

## 🔧 推荐工作流（可直接复用）

1. **拉取两个远程的最新代码**
   ```bash
   git fetch origin
   git fetch guns-gitlab
   ```
2. **切换到你的工作分支 `dev`**
   ```bash
   git checkout dev
   ```
3. **创建本地同步分支（不推送）**
   ```bash
   git checkout -b sync-guns
   ```
   `sync-guns` 只在本地存在，不会影响任何远程仓库。
4. **将 `guns-gitlab/master` 合并到 `sync-guns`**
   ```bash
   git merge guns-gitlab/master
   ```
   出现冲突时，解决后执行：
   ```bash
   git add .
   git commit
   ```
5. **切回 `dev`**
   ```bash
   git checkout dev
   ```
6. **把 `sync-guns` 的内容合并进 `dev`**
   ```bash
   git merge sync-guns
   ```
   同样先解决冲突，再 `git add . && git commit`。
7. **推送到 `origin/dev`，完成跨仓同步**
   ```bash
   git push origin dev
   ```

至此，`guns-gitlab/master → origin/dev` 的同步链路闭环。

## 🔁 已提交代码的跨仓库 cherry-pick

有时并不是简单的“整分支同步”，而是需要把副仓库里某个特定提交跨仓库、跨分支地同步过来。这时推荐使用 `git cherry-pick`：

1. **在本地同步分支 `sync-guns` 上获取目标提交**
   ```bash
   git checkout sync-guns
   git fetch guns-gitlab
   git cherry-pick <guns-gitlab-commit>
   ```
2. **将 cherry-pick 结果合并回 `dev`，再推送到 `origin/dev`**
   ```bash
   git checkout dev
   git merge sync-guns
   git push origin dev
   ```

> ✅ `git cherry-pick --abort`：当 cherry-pick 过程中出现冲突或想要放弃操作时，使用该命令可立即回滚到操作前的状态。

为了更快锁定需要 cherry-pick 的提交，可搭配下面的命令：

- `git log --oneline --decorate -n 5`：快速查看最近 5 条提交、分支或 tag 装饰信息。把 `-n 5` 改成更大的数字即可查看更多历史。
- `git revert <commit>`：如果误 cherry-pick 了某个提交，可通过 revert 引入一个新的反向提交，从历史中“撤销”这次变更，而不会重写已有提交。

## 🌈 同步流程示意图

```
              guns-gitlab/master
                       ↓
         (本地临时分支，不推送)
            local branch: sync-guns
                       ↓
            merge into local dev
                       ↓
                  origin/dev
```

## 💡 为什么一定要有本地同步分支？

- ❌ 无法操作 `origin/master`，直接在其上合并不可行。
- ❌ 也不建议把 `guns-gitlab/master` 直接合进 `dev`，否则缺少缓冲地带，风险大。
- ✔ 本地分支可以自由创建/删除，安全又可控。
- ✔ `sync-guns` 随用随建，保持 `dev` 历史干净。

## 🧹 可选清理：删除临时分支

同步完成后，可在本地删除 `sync-guns`，下次需要时再重新创建：

```bash
git branch -d sync-guns
```

## 📎 完整命令速查表

```bash
git fetch origin
git fetch guns-gitlab

git checkout dev
git checkout -b sync-guns

git merge guns-gitlab/master   # 合并副仓库更新
git checkout dev
git merge sync-guns            # 将更新合入 dev

git push origin dev            # 推送到主仓库 dev

# cherry-pick 相关
git checkout sync-guns
git cherry-pick <guns-gitlab-commit>
git cherry-pick --abort        # 放弃当前 cherry-pick
git log --oneline --decorate -n 5
git revert <commit>            # 引入反向提交撤销历史
```

## 📝 总结

在不能触碰 `origin/master` 的前提下，**“本地同步分支 → 工作分支 → 可推送的远程分支”** 是最稳妥的跨仓库同步模式：

- ✔ 完全遵守权限边界。
- ✔ 本地可以随时回滚或重建同步分支。
- ✔ 提交流程安全、可控，且不会干扰团队其他成员。

下次遇到多远程仓库、主仓库受限的场景，就按照上述步骤执行即可。
