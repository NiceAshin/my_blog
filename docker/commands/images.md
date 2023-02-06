---
next: ./container
sidebar: auto
---
## 镜像命令

#### docker images

```shell
[root@hsStudy ~]# docker images
REPOSITORY                TAG       IMAGE ID       CREATED         SIZE
hello-world               latest    d1165f221234   2 months ago    13.3kB
centos/mysql-57-centos7   latest    f83a2938370c   19 months ago   452MB
# 解释
REPOSITORY 镜像的仓库源
TAG        镜像的标签
IMAGE ID   镜像的创建时间
SIZE       镜像的大小

#可选项
Options:
  -a, --all             # 列出所有的镜像
  -q, --quiet           # 只显示镜像的ID
  
```

#### **docker search搜索镜像**

```
[root@hsStudy ~]# docker search mysql
NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   10881     [OK]
mariadb                           MariaDB Server is a high performing open sou…   4104      [OK]       

# 可选项，通过收藏来过滤
--filter=STARS=3000  搜索出来的镜像就是STARS大于3000的

```

#### **docker pull 下载命令**

```shell
#下载镜像 docker pull 镜像名[:tag]
[root@hsStudy ~]# docker pull mysql
Using default tag: latest   #如果不写tag，默认就是latest
latest: Pulling from library/mysql
69692152171a: Pull complete #分层下载，docker images核心 联合文件地址
1651b0be3df3: Pull complete 
951da7386bc8: Pull complete 
0f86c95aa242: Pull complete 
37ba2d8bd4fe: Pull complete 
6d278bb05e94: Pull complete 
497efbd93a3e: Pull complete 
f7fddf10c2c2: Pull complete 
16415d159dfb: Pull complete 
0e530ffc6b73: Pull complete 
b0a4a1a77178: Pull complete 
cd90f92aa9ef: Pull complete 
Digest: sha256:d50098d7fcb25b1fcb24e2d3247cae3fc55815d64fec640dc395840f8fa80969
Status: Downloaded newer image for mysql:latest
docker.io/library/mysql:latest #真实地址

# 等价于
docker pull mysql
docker pull docker.io/library/mysql:latest

# 指定版本下载
[root@hsStudy ~]# docker pull mysql:5.7 
5.7: Pulling from library/mysql
69692152171a: Already exists 
1651b0be3df3: Already exists 
951da7386bc8: Already exists 
0f86c95aa242: Already exists 
37ba2d8bd4fe: Already exists 
6d278bb05e94: Already exists 
497efbd93a3e: Already exists 
a023ae82eef5: Pull complete 
e76c35f20ee7: Pull complete 
e887524d2ef9: Pull complete 
ccb65627e1c3: Pull complete 
Digest: sha256:a682e3c78fc5bd941e9db080b4796c75f69a28a8cad65677c23f7a9f18ba21fa
Status: Downloaded newer image for mysql:5.7
docker.io/library/mysql:5.7

```

![image](https://s2.loli.net/2022/04/15/pXgJyoQTj2H8efz.png)

#### docker rmi 删除镜像

```shell
[root@hsStudy ~]# docker rmi -f 镜像id #删除指定的镜像
[root@hsStudy ~]# docker rmi -f 镜像id 容器id 容器id #删除多个指定的镜像
[root@hsStudy ~]# docker rmi -f $(docker images -aq) # 删除全部镜像

```