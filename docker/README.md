---
date: 2022-04-28 02:26:09
title: Docker学习
next: ./commands/help
sidebar: auto
---

## 简介

> 预计阅读时间：11 分钟

[什么是docker]: 

## Docker常用命令
- [Docker帮助命令](commands/help.md)
- [Docker镜像命令](commands/images.md)
- [Docker容器命令](commands/container.md)
- [Docker其他命令](commands/other.md)

## Centos7安装docker

1、Docker 要求 CentOS 系统的内核版本高于 3.10 ，查看本页面的前提条件来验证你的CentOS 版本是否支持 Docker 。

通过 uname -r命令查看你当前的内核版本

```
$ uname -r
```

2、使用 root 权限登录 Centos。确保 yum 包更新到最新。

```
$ sudo yum update
```

3、卸载旧版本(如果安装过旧版本的话)

$ sudo yum remove docker docker-common docker-selinux docker-engine

4、安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的

```
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

5、设置yum源

```
$ sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

 ![img](https://s2.loli.net/2022/04/15/1GOoJ7feKNkci2d.jpg) 

6、可以查看所有仓库中所有docker版本，并选择特定版本安装

```
$ yum list docker-ce --showduplicates | sort -r
```

![img](https://s2.loli.net/2022/04/15/PdzKJ7gwuX6tGxo.jpg) 

7、安装docker

```dockerfile
#由于repo中默认只开启stable仓库，故这里安装的是最新稳定版
$ sudo yum install docker-ce 
#下载指定版本
$ sudo yum install <FQPN> 
# 例如：sudo yum install docker-ce-17.12.0.ce
```

![img](https://s2.loli.net/2022/04/15/gTWL3kdDtheuqJr.jpg) 

8、启动并加入开机启动

```
$ sudo systemctl start docker 
$ sudo systemctl enable docker
```

9、验证安装是否成功(有client和service两部分表示docker安装启动都成功了)

```
$ docker version
```



## Docker部署Mariadb

##### 搜索Mariadb

```dockerfile
docker search mariadb
```

##### 下载MariaDB

```dockerfile
docker pull docker.io/mariadb:10.2.23
```

![image-20220415153028404](https://s2.loli.net/2022/04/15/eKN7qaojI4UtCYy.png)

```
docker images
```

![image-20220415153100547](https://s2.loli.net/2022/04/15/9gcU5dsWJhx7r2S.png)

##### 启动MariaDB

```dockerfile
docker run -p 3306:3306 -v 
/usr/local/mariadb/master/conf:/etc/mysql/conf.d -v /usr/local/mariadb/master/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_ROOT_HOST=% --privileged=true --name mariadb-master -d --restart=unless-stopped docker.io/mariadb:10.2.23 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

## Docker安装redis

##### 搜索redis镜像

```dockerfile
docker search redis
```

##### 下载MariaDB镜像

```
docker pull redis
```

![image-20220415153816216](https://s2.loli.net/2022/04/15/HNvLf6gPEDc4WMG.png)

##### 查看redis镜像

```
docker images
```

![image-20220415153832284](https://s2.loli.net/2022/04/15/PXfGV3qs1u5LE9n.png)

##### 启动redis

```
docker run --restart=unless-stopped -p 6379:6379 --name redis -d redis redis-server --appendonly yes
```

![image-20220415154013257](https://s2.loli.net/2022/04/15/K8pDyPRNGFkfuIw.png)



## Docker安装MongoDB

##### 搜索MongoDB镜像

```dockerfile
docker search mongo
```

##### 下载MongoDB镜像

```
docker pull mongo:3.2
```

![](https://s2.loli.net/2022/04/15/aXHGWAoxEhMrkyt.png)

##### 查看MongoDB镜像

```
docker images
```

![](https://s2.loli.net/2022/04/15/XVp2dvcQElTYiSz.png)

##### 启动MongoDB

```
docker run --restart=unless-stopped --name mongodb-server -v /usr/local/mongo/configdb:/data/configdb -v /usr/local/mongo/db:/data/db -p 27017:27017 -d mongo:3.2 --auth
```

![image-20220415154247348](https://s2.loli.net/2022/04/15/ya6oCKpLb8JBm3S.png)

##### 进入MongoDB进行配置

```
#1、docker进入MongoDB
docker exec -it mongodb-server mongo admin
#2、创建admin用户
db.createUser( {
user: "admin",
pwd: "admin",
roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
```

##### 验证是否可以连接

![image-20220415154518763](https://s2.loli.net/2022/04/15/qUmwpPo8nAG7LNQ.png)

![](https://s2.loli.net/2022/04/15/qUmwpPo8nAG7LNQ.png)

## Docker安装RabbitMQ

##### 下载包含管理界面的RabbitMQ镜像

```
docker pull rabbitmq:management
```

![](https://s2.loli.net/2022/04/15/5nrtQ2evbU47DfC.png)

##### 查看RabbitMQ镜像

```
docker images
```

![](https://s2.loli.net/2022/04/15/9uQFEKarI78JCzW.png)

##### 启动RabbitMQ

```
docker run --restart=unless-stopped -d -p 5672:5672 -p 15672:15672 --name rabbitmq -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin rabbitmq:management
```

![](https://s2.loli.net/2022/04/15/nIrEV5uKb6TW9C4.png)

##### 验证是否可以连接

​	浏览器访问：http://ip:5672

![image-20220415154903266](https://s2.loli.net/2022/04/15/6qlKBLcQf3vmPhJ.png)
