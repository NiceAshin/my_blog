---
prev: ./cmd
sidebar: auto
date: 2022/05/15 09:00:00
tags:
- linux
---

# frpc-内网穿透搭建和使用教程

> 预计阅读时间：5 分钟



## 工具地址：[GitHup](https://github.com/fatedier/frp/releases/)

将 frps 及 frps.ini 放到具有公网 IP 的机器上。

将 frpc 及 frpc.ini 放到处于内网环境的机器上。

#### 

## 1、内网穿透

很多时候需要借助通过外网访问本地的电脑服务，但是本地电脑的ip不是公网ip。因此无法访问，因此需要借助一个公网ip作为跳板。

1、假设本地电脑A需要搭建一个服务，需要电脑B通过外网进行访问，A、B不在一个局域网内

2、有一台服务器C，公网ip是41.103.38.194

3、B需要通过访问C的ip进而访问到A。

原理其实很简单，

**在服务器C上启动一个代理服务，本地电脑A上启动一个代理客户端，C上的代理服务端与A上的代理客户端进行保持长连接，并进行一定的端口映射。**

**当访问C服务器对应的端口的时候，C服务器对应的代理服务会将消息转发到客户端A对应的端口上。**



## 2、下载FRP

已经上传到百度盘。版本是0.38

链接：[https://pan.baidu.com/s/1pbKf4-5POazuk76EmzS8YQ](https://link.zhihu.com/?target=https%3A//pan.baidu.com/s/1pbKf4-5POazuk76EmzS8YQ) 提取码：l3li

解压后如下图：

![v2-382ca08e87fdf6c6195792e13b3a21a4_720w (1)](https://cdn.jsdelivr.net/gh/NiceAshin/FileStore/blogImage/v2-382ca08e87fdf6c6195792e13b3a21a4_720w%20(1).jpeg)

## 3、启动配置服务端

### 3.1配置

首先打开frps.ini。如下。port为服务端监听的端口**（注意不是转发的端口，监听转发的端口在客户端的frpc.ini中的remote_port配置）**

```bash
[common]
bind_port = 7000
token = 1234567820222022ccc
```

### 3.2 启动

注意使用-c 指定配置文件，开始不知道，没有指定配置文件，一直报错

```text
frps.exe -c ./frps.ini
```

## 4、启动配置客户端

### 4.1 、配置客户端

首先打开frpc.ini。如下。

具体的含义注释有写。全部的可以查看frps_full.ini配置文件

```bash
[common]
#frp服务所在的服务器的地址
server_addr = 41.103.38.194
#填写对应的服务端frp配置的接口
server_port = 7000
#校验客户端用的，要与服务端的匹配。作用就是用于服务端认证客户端的，不然谁都可以连。相当于密码
token = 1234567820222022ccc

#项目名，可以有多个，自定义
[gitlib1]
# 协议类型。
type = tcp
# 本地的ip
local_ip = 127.0.0.1
#本地要开放的服务的端口，如开放apache的80
local_port = 80
#这个需要填写一个服务器放行的端口，最终其实就是访问服务器端的这个端口来转发到本地的服务上的。
remote_port = 8080
```

### 4.2、启动客户端

```text
frpc.exe -c ./frpc.ini
```
