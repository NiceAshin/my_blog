---
date: 2022/03/21 09:00:00
next: ./help
sidebar: auto
---
## 常用其他命令

> 预计阅读时间：21 分钟

**后台启动容器**

```shell
# 命令 docker run -d 镜像名
[root@hsStudy ~]# docker run -d centos


# docker ps ， 发现centos停止了

# 常见的坑，docker 容器使用后台运行，就必须要有一个前台进程，docker发现没有应用，就会自动停止
#nagix，容器启动后，发现自己没有提供服务，就会立即停止，没有程序了 
```

**查看日志命令**

```shell
docker logs -f -t --tail 容器 没有日志

# 自己编写一段shell脚本
[root@hsStudy /]# docker run -d centos /bin/sh -c "while true;do echo hansuo;sleep;done"

[root@hsStudy /]# docker ps
CONTAINER ID   IMAGE     
4466628037e0   centos   

#显示日志
-tf           #显示日志
--tail number # 要显示的日志条数
docker logs -f -t --tail 10 4466628037e0
```

**查看容器中的进程信息**

```shell
# 命令 docker top 容器id
[root@hsStudy /]# docker top 4466628037e0
UID                 PID                 PPID                C                   STIME               TTY     
root                9218                9198                10                  15:47               ?       
```

**查看镜像的元数据**

```shell
#命令
docker inspect 容器id
#测试
[root@hsStudy /]# docker inspect 4466628037e0
[
    {
        "Id": "4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc",
        "Created": "2021-05-17T07:47:30.586569937Z",
        "Path": "/bin/sh",
        "Args": [
            "-c",
            "while true;do echo hansuo;sleep;done"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 9218,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2021-05-17T07:47:31.685399957Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
        "Image": "sha256:300e315adb2f96afe5f0b2780b87f28ae95231fe3bdd1e16b9ba606307728f55",
        "ResolvConfPath": "/var/lib/docker/containers/4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc/hostname",
        "HostsPath": "/var/lib/docker/containers/4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc/hosts",
        "LogPath": "/var/lib/docker/containers/4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc/4466628037e0a5569ae183f618a106c8ebd98f11e65acbb282276b9c88f473dc-json.log",
        "Name": "/blissful_bhaskara",
        "RestartCount": 0,
        "Driver": "overlay2",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": null,
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "default",
            "PortBindings": {},
            "RestartPolicy": {
                "Name": "no",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": null,
            "CapAdd": null,
            "CapDrop": null,
            "CgroupnsMode": "host",
            "Dns": [],
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "private",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "ConsoleSize": [
                0,
                0
            ],
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": null,
            "BlkioDeviceWriteBps": null,
            "BlkioDeviceReadIOps": null,
            "BlkioDeviceWriteIOps": null,
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DeviceRequests": null,
            "KernelMemory": 0,
            "KernelMemoryTCP": 0,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": false,
            "PidsLimit": null,
            "Ulimits": null,
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/asound",
                "/proc/acpi",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/sys/firmware"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/048f06ef329878a39add412dea76392c91178bfec3ba34ce424579fe1425571f-init/diff:/var/lib/docker/overlay2/d12fc223dac190888a8caa8a54840f9aa68bdf8654f93dd646b1c83aa54370c3/diff",
                "MergedDir": "/var/lib/docker/overlay2/048f06ef329878a39add412dea76392c91178bfec3ba34ce424579fe1425571f/merged",
                "UpperDir": "/var/lib/docker/overlay2/048f06ef329878a39add412dea76392c91178bfec3ba34ce424579fe1425571f/diff",
                "WorkDir": "/var/lib/docker/overlay2/048f06ef329878a39add412dea76392c91178bfec3ba34ce424579fe1425571f/work"
            },
            "Name": "overlay2"
        },
        "Mounts": [],
        "Config": {
            "Hostname": "4466628037e0",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "while true;do echo hansuo;sleep;done"
            ],
            "Image": "centos",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {
                "org.label-schema.build-date": "20201204",
                "org.label-schema.license": "GPLv2",
                "org.label-schema.name": "CentOS Base Image",
                "org.label-schema.schema-version": "1.0",
                "org.label-schema.vendor": "CentOS"
            }
        },
        "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "8cfd6fed1e85e2710959f24b7c63fec99428d3877ffd7d579bed34b802d9fe56",
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "Ports": {},
            "SandboxKey": "/var/run/docker/netns/8cfd6fed1e85",
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "db2ba7ee6715a91f9bf76dcaf30f360467a289cf633fff1694c9148b87c4955b",
            "Gateway": "172.17.0.1",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "172.17.0.2",
            "IPPrefixLen": 16,
            "IPv6Gateway": "",
            "MacAddress": "02:42:ac:11:00:02",
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "NetworkID": "7c039e41b323dbbfa30070d6e269624aa576f33b46f2f5fadbf0375f3f0df0c1",
                    "EndpointID": "db2ba7ee6715a91f9bf76dcaf30f360467a289cf633fff1694c9148b87c4955b",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:11:00:02",
                    "DriverOpts": null
                }
            }
        }
    }
]
```

**进去当前正在运行的容器**

```shell
# 我们通常容器都是是同后台方式进行的，修改一些配置

#命令
docker exec -it 容器id bashShell

#测试
[root@hsStudy /]# docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS     NAMES
4466628037e0   centos    "/bin/sh -c 'while t…"   16 minutes ago   Up 16 minutes             blissful_bhaskara
[root@hsStudy /]# docker exec -it 4466628037e0 /bin/bash
[root@4466628037e0 /]# ls
bin  etc   lib	  lost+found  mnt  proc  run   srv  tmp  var
dev  home  lib64  media       opt  root  sbin  sys  usr
[root@4466628037e0 /]# ps -ef
UID         PID   PPID  C STIME TTY          TIME CMD
root          1      0 10 07:47 ?        00:02:01 /bin/sh -c while true;do echo hansuo;sleep;done
root      49735      0  0 08:05 pts/0    00:00:00 /bin/bash
root      51738  49735  5 08:05 pts/0    00:00:00 ps -ef
root      51745      1  0 08:05 ?        00:00:00 [sh]

#方式二
docker attach 容器id
#测试
[root@hsStudy /]# docker attach 4466628037e0
正在执行当前的代码...

#decker exec     #进入容器后开启一个新的终端，可以在里面操作（常用）
#docker attach   #进入容器正在执行的终端，不会启动新的进程！
```

**从容器内拷贝文件到主机上**

```shell
docker cp 容器id:容器内路径 目的的主机

#查看当前主机目录下
[root@hsStudy home]# ls
depp  hansuo.java
[root@hsStudy home]# docker ps
CONTAINER ID   IMAGE     COMMAND       CREATED         STATUS         PORTS     NAMES
afb3e7611084   centos    "/bin/bash"   3 minutes ago   Up 3 minutes             epic_galileo

#进入docker容器内部
[root@hsStudy home]# docker attach afb3e7611084
[root@afb3e7611084 /]# cd /home
[root@afb3e7611084 home]# ls

#在容器内新建一个文件
[root@afb3e7611084 home]# touch test.java
[root@afb3e7611084 home]# ls
test.java
[root@afb3e7611084 home]# exit
exit
[root@hsStudy home]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
[root@hsStudy home]# docker ps -a
CONTAINER ID   IMAGE     COMMAND       CREATED         STATUS                     PORTS     NAMES
afb3e7611084   centos    "/bin/bash"   5 minutes ago   Exited (0) 8 seconds ago             epic_galileo

#将这个文件拷贝出来到我们的主机上
[root@hsStudy home]# docker cp afb3e7611084:/home/test.java /home
[root@hsStudy home]# ls
depp  hansuo.java  test.java
[root@hsStudy home]# 

#拷贝是一个手动过程，未来我们使用 -v 卷的技术可以实现，自动同步 /home
```
