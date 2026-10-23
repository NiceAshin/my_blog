---
title: Docker 帮助命令
date: 2022-11-09
next: ./images
sidebar: auto
---
# Docker 帮助命令

## 帮助命令

> 预计阅读时间：7 分钟

Docker 的命令很多，真正需要记住的其实只有三个入口：`docker version` 确认客户端与服务端版本，`docker info` 看运行环境，`docker <命令> --help` 查具体参数。遇到问题时先跑这三条，比直接搜索报错更快。

## docker version：确认两端版本

```shell
docker version
```

输出分为 `Client` 和 `Server` 两段。Client 是当前命令行工具，Server 是 Docker Engine（dockerd）。重点看三组信息：

- `Version`：客户端与服务端版本；
- `API version`：双方协商的 API 版本；
- `OS/Arch`：操作系统与架构，排查“镜像平台不匹配”时必看。

常见现象是 Client 显示正常、Server 报 `Cannot connect to the Docker daemon`。这说明 CLI 装好了，但 Engine 没启动，或者当前用户没有访问 `/var/run/docker.sock` 的权限。

脚本里只取版本号：

```shell
docker version --format '{{.Server.Version}}'
```

如果客户端和服务端 API 版本差距过大，可能出现 `client version 1.45 is too new` 之类的错误。升级 Docker CLI 与 Engine 到同一大版本，通常可以避免。

## docker info：看运行环境

```shell
docker info
```

这条命令输出很长，建议关注以下字段：

| 字段 | 含义 | 异常时说明 |
| --- | --- | --- |
| `Server Version` | Engine 版本 | 与 Client 不一致时注意兼容性 |
| `Storage Driver` | 存储驱动，常见 `overlay2` | 非预期驱动可能影响镜像层性能 |
| `Cgroup Driver` | `systemd` 或 `cgroupfs` | Kubernetes 节点通常要求 `systemd` |
| `CPUs` / `Total Memory` | 可用资源 | 容器内看到的是宿主机还是限制值，要区分 |
| `Docker Root Dir` | 镜像与容器数据目录 | 磁盘满时先看这里 |
| `Registry Mirrors` | 镜像加速地址 | 拉取慢或 429 时检查 |
| `Live Restore Enabled` | 守护进程热恢复 | 生产环境通常开启 |
| `WARNING` | 环境警告 | 例如内存限制、桥接网络异常 |

只取 JSON 便于监控：

```shell
docker info --format '{{json .}}' | jq '.ServerVersion, .Driver, .NCPU, .MemTotal'
```

再配合磁盘占用：

```shell
docker system df
docker system df -v
```

`docker system df` 看镜像、容器、卷、构建缓存各占多少；`-v` 展开到单个镜像和卷。清理前先确认没有正在使用的卷，`docker system prune` 默认不会删除命名卷。

## docker 命令 --help：查参数

```shell
docker run --help
docker build --help
docker compose --help
```

`--help` 会列出当前子命令的全部参数、默认值和简写。它比记忆命令更可靠，因为不同版本的参数可能变化。例如 `docker run --restart` 的取值、`docker build --platform` 的支持情况，都应以本机帮助为准。

查看命令层级：

```shell
docker help
docker container --help
docker image --help
```

Docker 1.13 之后命令按对象分组：`docker container ls`、`docker image ls`、`docker volume ls`。旧写法 `docker ps`、`docker images` 仍然可用，但脚本里建议用新写法，语义更清晰。

## 常见问题定位

### 无法连接守护进程

```shell
systemctl status docker
journalctl -u docker -n 100 --no-pager
```

如果是权限问题：

```shell
sudo usermod -aG docker "$USER"
newgrp docker
```

把用户加入 `docker` 组等价于授予 root 级权限，生产机器要谨慎。远程连接时检查 `DOCKER_HOST` 和 `docker context ls`：

```shell
docker context ls
docker context use default
```

### 拉取镜像失败

先确认网络与镜像地址：

```shell
docker pull hello-world
docker info | grep -A3 'Registry Mirrors'
```

如果是私有仓库，先 `docker login registry.example.com`。证书问题可以检查 `/etc/docker/certs.d/<registry>/ca.crt`，不要用 `--tlsverify=false` 绕过生产环境的证书校验。

### 容器启动后立刻退出

```shell
docker ps -a
docker logs --tail 100 <container>
docker inspect <container> --format '{{.State.ExitCode}} {{.State.Error}}'
```

退出码 137 通常是被 SIGKILL（常见于 OOM），退出码 127 是命令不存在，126 是命令不可执行。先看日志和退出码，再决定是否进入容器调试。

帮助文档地址：https://docs.docker.com/reference/
