---
date: 2022-05-16 10:38:28
next: ./other
sidebar: auto
---
## **容器命令**

> 预计阅读时间：5 分钟

**说明：我们有了镜像才可以创建容器，linux，下载一个CentOS镜像来测试学习**

```shell
docker pull centos
```

**新建容器并启动**

```shell
docker run [可选参数] image

#参数说明
--name="Name"   容器名字  tomcat01  tomcat02 用来区分容器
-d              以后台方式运行，ja nohub
-it             使用交互模式运行，进入容器查看内容
-p              指定容器的端口 -p 8080:8080
	-p ip主机端:容器端口
	-p 主机端:容器端口   主机端口映射到容器端口 （常用）
	-p 容器端口
	容器端口
	
-P              随机指定端口

#测试，启动并进入容器
[root@hsStudy ~]# docker run -it centos /bin/bash
[root@9f8cb921299a /]#
[root@9f8cb921299a /]# ls #查看容器内的centos，基础命令很多都是不完善的
bin  etc   lib	  lost+found  mnt  proc  run   srv  tmp  var
dev  home  lib64  media       opt  root  sbin  sys  usr

#从容器中退回主机
[root@9f8cb921299a /]# exit
exit
[root@hsStudy /]# ls
bin   dev  home  lib64       media  opt   root  sbin  sys  usr
boot  etc  lib   lost+found  mnt    proc  run   srv   tmp  var
```

**列出所有运行中的容器**

```shell
# docker ps 命令
	 #列出当前正在运行的容器
-a   #列出当前正在运行的容器+带出历史运行过的容器
-n=? #显示最近创建的容器
-q   #只显示容器的编号

[root@hsStudy ~]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
[root@hsStudy ~]# docker ps -a
CONTAINER ID   IMAGE          COMMAND       CREATED         STATUS                     PORTS     NAMES
9f8cb921299a   centos         "/bin/bash"   7 minutes ago   Exited (0) 4 minutes ago             eager_keldysh
da964ff44c74   d1165f221234   "/hello"      6 hours ago     Exited (0) 6 hours ago               affectionate_shtern
```

**退出容器**

```shell
exit  #直接让容器停止并退出
Ctrl + P + Q #容器不停止退出
[root@hsStudy ~]# docker ps 
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
[root@hsStudy ~]# docker run -it centos /bin/bash
[root@49bbf686f9a3 /]# [root@hsStudy ~]# docker ps 
CONTAINER ID   IMAGE     COMMAND       CREATED          STATUS          PORTS     NAMES
49bbf686f9a3   centos    "/bin/bash"   14 seconds ago   Up 12 seconds             sharp_kilby
[root@hsStudy ~]# 
```

**删除容器**

```shell
docker rm 容器id                 #删除指定的容器，不能删除正在运行的容器，如果要强制删除，rm -f
docker rm -f $(docker ps -aq)   #删除所有的容器
docker ps -a -q|xargs docker rm #删除若有容器（使用linux管道命令）
```

**启动和停止容器的操作**

```shell
docker start 容器id     #启动容器
docker restart 容器id   #重起容器
docker stop 容器id      #停止当前正在运行的容器
docker kill 容器id      #强制停止当前容器
```
