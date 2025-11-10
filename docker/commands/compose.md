---
date: 2024-04-27 00:00:00
title: Docker Compose 常用命令
sidebar: auto
---

> 预计阅读时间：6 分钟

## 常用概念

- **服务（service）**：在 `docker-compose.yml` 中定义的容器模板，通常与单个镜像对应。
- **项目（project）**：一组服务构成的应用栈，默认以 `docker-compose.yml` 所在目录命名。
- **编排文件（docker-compose.yml）**：声明服务、网络、卷等资源的配置文件。

## 基础命令

### 查看帮助

```bash
docker compose --help
```

### 启动/停止服务

```bash
# 后台启动所有服务
docker compose up -d

# 以前台模式启动（便于查看日志）
docker compose up

# 停止所有服务
docker compose stop

# 停止并移除容器、网络等资源
docker compose down

# 保留数据卷（避免数据丢失）
docker compose down --volumes
```

### 构建镜像

```bash
# 按照 compose 文件中的 build 配置构建
docker compose build

# 强制重新构建并不使用缓存
docker compose build --no-cache

# 构建并立即启动
docker compose up --build
```

### 查看运行状态

```bash
# 查看所有服务状态
docker compose ps

# 查看所有服务日志（默认会持续输出）
docker compose logs

# 仅查看指定服务的日志
docker compose logs <service>

# 跟随日志输出
docker compose logs -f
```

### 进入容器与执行命令

```bash
# 以交互模式进入容器
docker compose exec <service> /bin/bash

# 直接执行单次命令
docker compose exec <service> <command>

# 对尚未运行的服务执行命令（会自动启动）
docker compose run --rm <service> <command>
```

### 管理资源

```bash
# 查看定义的网络和卷
docker compose config --services

docker compose config --volumes

# 列出项目使用的网络
docker compose ls

# 查看指定项目详情
docker compose ls --all
```

### 扩缩容服务

```bash
# 将名为 web 的服务扩容到 3 个副本
docker compose up -d --scale web=3
```

### 环境变量与覆盖文件

```bash
# 使用 .env 中的变量（默认行为）
docker compose up -d

# 指定额外的 Compose 文件覆盖默认配置
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# 指定环境变量文件
docker compose --env-file prod.env up -d
```

## 调试技巧

- 使用 `docker compose config` 可以合并并校验所有 Compose 文件，帮助提前发现语法错误。
- 在 CI/CD 环境中，配合 `docker compose pull` 提前拉取镜像，可缩短部署时间。
- 对于一次性任务（如数据库迁移），推荐使用 `docker compose run --rm`，任务结束后自动清理容器。

## 常见组合操作

```bash
# 拉取最新镜像并重新部署
docker compose pull && docker compose up -d

# 清理所有停止的容器、无用网络和悬空镜像
docker system prune
```

通过熟悉以上命令，可以高效地管理多容器应用的生命周期，实现开发、测试与部署流程的自动化。
