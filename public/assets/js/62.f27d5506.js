(window.webpackJsonp=window.webpackJsonp||[]).push([[62],{624:function(s,e,t){"use strict";t.r(e);var a=t(13),r=Object(a.a)({},(function(){var s=this,e=s.$createElement,t=s._self._c||e;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"k8s部署redis集群"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#k8s部署redis集群"}},[s._v("#")]),s._v(" K8s部署Redis集群")]),s._v(" "),t("h2",{attrs:{id:"调研"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#调研"}},[s._v("#")]),s._v(" 调研")]),s._v(" "),t("h3",{attrs:{id:"redis集群方案"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#redis集群方案"}},[s._v("#")]),s._v(" Redis集群方案")]),s._v(" "),t("h4",{attrs:{id:"主从复制"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#主从复制"}},[s._v("#")]),s._v(" 主从复制")]),s._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/img/image-20210823152755829.png",alt:"replication"}})]),s._v(" "),t("p",[s._v("主从复制模式的redis与mysql类似. master数据库的所有写命令都会保存到文件中(一般是rdb文件), slave数据库启动后会向master请求这个文件并回放文件中的命令. 在之后master每执行一个写命令都会同步给slave.")]),s._v(" "),t("p",[s._v("主从复制模式的集群因为可以创建多个slave实例, 搭配负载均衡策略可以有效的分摊读操作的压力.")]),s._v(" "),t("p",[t("strong",[s._v("缺点")])]),s._v(" "),t("ul",[t("li",[t("p",[s._v("故障恢复难: master节点故障时, 需要手动将一个slave节点升级为master节点, 并且让其他slave节点去复制新的master节点. 这个过程需要人工干预, 比较繁琐.")])]),s._v(" "),t("li",[t("p",[s._v("复制中断问题: 复制中断后, slave会发起psync(部分重同步), 如果此时同步失败就会进行全量重同步. 全量重同步可能会造成主库的卡顿. 内存溢出. IO. CPU. 带宽异常, 导致阻塞客户端请求")]),s._v(" "),t("blockquote",[t("p",[s._v("重同步用于将slave的状态更新到master当前所处的状态.")])])]),s._v(" "),t("li",[t("p",[s._v("master的写和存储能力受单机限制")])])]),s._v(" "),t("h4",{attrs:{id:"哨兵模式"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#哨兵模式"}},[s._v("#")]),s._v(" 哨兵模式")]),s._v(" "),t("p",[s._v("哨兵模式基于主从复制, 引入了哨兵监控和自动故障处理.")]),s._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/img/image-20210823154202526.png",alt:"sentinel-cluster"}})]),s._v(" "),t("p",[s._v("哨兵模式的集群分为两个部分: redis sentinel集群和redis replication集群. 其中sentinel集群有若干个哨兵节点组成, 哨兵节点的功能主要是监控master和slave是否正常运行; 监控到master故障时, 自动将slave转换为master; 哨兵互相监控.")]),s._v(" "),t("p",[s._v("哨兵模式继承了主从复制模式的优点, 且解决了主从模式的master切换问题. 但是难易在线扩容.")]),s._v(" "),t("h4",{attrs:{id:"redis-cluster"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#redis-cluster"}},[s._v("#")]),s._v(" redis cluster")]),s._v(" "),t("p",[s._v("redis-cluster是redis3.0后推出的集群方案. 集群是去中心化的. 采用分区的多主多从的设计,  每一个分区都由一个master和多个slave组成. 分区之间相互平行. 他解决了主从复制模式不能在线扩容, master受限于单机限制的问题.")]),s._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/img/redis-cluster-setup.c1d7206d.png",alt:"redis-cluster"}})]),s._v(" "),t("p",[s._v("cluster模式没有统一入口, 客户端与任意redis节点直连, 不需要代理. 集群内所有节点相互通信.  在cluster模式中, 每个节点上都有一个插槽, 这个插槽的取值范围是16383, 每当客户端存取一个key时, redis根据CRC算法对key算出一个值然后拿这个值对16383取余, 这样每个key都会在插槽中对应一个在0到16383之间的hash槽. 然后再找到插槽所对应的节点. 如果key所在的节点不是当前节点的话, 客户端请求的当前节点会通过重定向命令引导客户端去访问包含key的节点. 这就解决了主从复制模式中master受限于单机限制的问题. 因为在cluster模式中, 每一个master节点只维护一部分槽, 以及槽所映射的键值对. 而且hash槽的方式方便与扩缩容节点, 只需要移动槽和数据到对应节点就可以.")]),s._v(" "),t("p",[s._v("同时为了保证HA, cluster模式也是有主从复制的, 一个master对应多个slave, master挂掉的时候会自动升级一个slave替补.")]),s._v(" "),t("p",[t("strong",[s._v("缺点")])]),s._v(" "),t("ul",[t("li",[s._v("同样是因为插槽的设计, 集群的数据是分散存储的. 如果出现问题, 可能会需要回滚整个集群.")]),s._v(" "),t("li",[s._v("多key操作受限比如事务. 因为rediscluster要求key在同一个slot中才能执行. 要解决这个限制需要使用rediscluster提供的hashtag去映射一组key到slot, 这也就需要我们的客户端去适配这种协议")]),s._v(" "),t("li",[s._v("reduscluster只支持一个数据库 : 0")])]),s._v(" "),t("h4",{attrs:{id:"代理分区"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#代理分区"}},[s._v("#")]),s._v(" 代理分区")]),s._v(" "),t("p",[s._v("代理分区模式的代表是codis, codis是豌豆荚用go语言自研的是一个分布式redis集群. 他在redis服务器与客户端之间增加了一个代理层, 客户端的命令发送到代理层, 然后代理层去做请求的分发. 他不需要客户端去适配协议, 客户端可以像使用单机redis一样使用codis")]),s._v(" "),t("p",[s._v("codis与rediscluster类似, 也是通过hash槽来进行分片, 所以codis同样不支持多key操作.  codis不是去中心化的, codis使用zookeeper来维护hash槽位与实例之间的关系.")]),s._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/img/image-20210824091044018.png",alt:"codis"}})]),s._v(" "),t("p",[s._v("参考文档: https://gitee.com/mirrors/Codis?utm_source=alading&utm_campaign=repo#/mirrors/Codis/blob/release3.2/doc/tutorial_zh.md")]),s._v(" "),t("h3",{attrs:{id:"取舍"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#取舍"}},[s._v("#")]),s._v(" 取舍")]),s._v(" "),t("p",[s._v("最后决定采用redis官方的集群方案.")]),s._v(" "),t("p",[s._v("首先我们需要部署到k8s, 所以我们一定会有扩缩容的需求, 所以首先pass掉主从复制和哨兵模式. 然后, codis比较与redis-cluster多了对其他中间件的依赖, 对运维的要求更高一点. 相比之下redis-cluster更简单易用一些.")]),s._v(" "),t("h2",{attrs:{id:"实施"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#实施"}},[s._v("#")]),s._v(" 实施")]),s._v(" "),t("h3",{attrs:{id:"什么是operator"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#什么是operator"}},[s._v("#")]),s._v(" 什么是Operator")]),s._v(" "),t("p",[s._v("k8s使用statefulset来处理有状态的容器, 结合headless和PV/PVC实现了对pod的拓扑状态和存储状态的维护. 但是statefulset只能提供受限的管理, 我们还是需要编写脚本判断编号来区别节点的关系: master or slave. 以及他们之间的拓扑关系. 如果应用无法通过上述方式进行状态管理, 那就代表statefukset已经无法解决应用的部署问题了.")]),s._v(" "),t("p",[s._v("k8s中的声明式模型中要求我们向k8s提交一个API对象的描述, 然后k8s的controller会通过无限循WATCH这些API对象的变化, 确保API对象的状态与声明的状态保持一致. "),t("strong",[s._v("operator就是k8s的controller, 只不过是针对特定的CRD(CustomResourceDifinition)实现的")]),s._v('.  CRD用于描述operator要控制的应用, 比如redis-cluster. CRD的作用就是为了让k8s能够认识我们的应用. 然后我们再去实现一个自定义controller去WATCH用户提交的CRD实例. 这样当用户告诉k8s: "我想要一个这样的应用". 之后针对这个应用的operator就会通过WATCH协调应用的状态达到CRD描述的状态.')]),s._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/img/15b4c3dc71f7221589fd3d66202a727b.png",alt:"operator"}})]),s._v(" "),t("p",[t("strong",[s._v("operator是一个针对于特殊应用的controller")]),s._v(", 它提供了一种在k8s API上构建应用并在k8s上部署应用的方法, 它允许开发者扩展k8s API增加新功能, 像管理k8s原生组件一样管理自定义资源. 如果想运行一个redis哨兵模式的主从集群, 那么只需要提交一个声明就可以了, 而不需要去关心这些分布式应用需要的相关领域的知识, operator本身就可以做到创建应用, 监控应用状态, 扩缩容, 升级, 故障恢复, 以及资源清理等.")]),s._v(" "),t("h3",{attrs:{id:"redis-operator部署"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#redis-operator部署"}},[s._v("#")]),s._v(" Redis Operator部署")]),s._v(" "),t("h4",{attrs:{id:"安装helm"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装helm"}},[s._v("#")]),s._v(" 安装helm")]),s._v(" "),t("p",[s._v("helm是k8s的包管理工具, 安装步骤见官方文档https://helm.sh/zh/docs/intro/install/")]),s._v(" "),t("h4",{attrs:{id:"安装redis-cluster集群"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装redis-cluster集群"}},[s._v("#")]),s._v(" 安装redis-cluster集群")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# helm repo add ot-helm https://ot-container-kit.github.io/helm-charts/")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# helm upgrade redis-cluster ot-helm/redis-cluster   --set redisCluster.clusterSize=3,redisCluster.redisSecret.secretName=redis-secret,redisCluster.redisSecret.secretKey=password --install")]),s._v("\nRelease "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster"')]),s._v(" has been upgraded. Happy Helming"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("!")]),s._v("\nNAME: redis-cluster\nLAST DEPLOYED: Tue Aug "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("24")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("16")]),s._v(":50:50 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2021")]),s._v("\nNAMESPACE: default\nSTATUS: deployed\nREVISION: "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("\nTEST SUITE: None\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br")])]),t("p",[s._v("这里指定了集群大小为3, redis密码为password.")]),s._v(" "),t("p",[s._v("查看redis集群状态")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl get pods")]),s._v("\nNAME                                      READY   STATUS    RESTARTS   AGE\nmysql-0                                   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          6h22m\nmysql-1                                   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v("          4d3h\nmysql-2                                   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          6h22m\nnfs-client-provisioner-864c877bf6-bszsz   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("/1     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v("          4d5h\nredis-cluster-follower-0                  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          13m\nredis-cluster-follower-1                  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          14m\nredis-cluster-follower-2                  "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          16m\nredis-cluster-leader-0                    "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          7m16s\nredis-cluster-leader-1                    "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          14m\nredis-cluster-leader-2                    "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/2     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          16m\nredis-operator-67ff7665db-fm89s           "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("/1     Running   "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("          30m\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl exec -it redis-cluster-leader-0  -- redis-cli -a password cluster nodes")]),s._v("\nDefaulted container "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster-leader"')]),s._v(" out of: redis-cluster-leader, redis-exporter\nWarning: Using a password with "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-a'")]),s._v(" or "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-u'")]),s._v(" option on the "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("command")]),s._v(" line interface may not be safe.\n6e418e911aee8e80c9c6864591694d54fb10ccc0 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.30:6379@16379 slave 7cfa62aaf91e0c5a528b59aad46054c7f4d057ca "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795376574")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v(" connected\n4cc6a047f5f4f72ecced7be6b495738156e489a7 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.31:6379@16379 master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795376000")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("5461")]),s._v("-10922\n7cfa62aaf91e0c5a528b59aad46054c7f4d057ca "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.29:6379@16379 master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795376874")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10923")]),s._v("-16383\n640844a5d9f5d27fcf308a70cf97ee8c87605330 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.32:6379@16379 slave 4cc6a047f5f4f72ecced7be6b495738156e489a7 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795376574")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(" connected\nc2eb9dfdbdb20de0444a3fe1f78945c775dbd781 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.33:6379@16379 slave b4bd803d634042b569ff4faea3d1adee808a54f5 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795375000")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(" connected\nb4bd803d634042b569ff4faea3d1adee808a54f5 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".135.26:6379@16379 myself,master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795375000")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("-5460\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br"),t("span",{staticClass:"line-number"},[s._v("20")]),t("br"),t("span",{staticClass:"line-number"},[s._v("21")]),t("br"),t("span",{staticClass:"line-number"},[s._v("22")]),t("br")])]),t("p",[s._v("当前主从节点如下")]),s._v(" "),t("table",[t("thead",[t("tr",[t("th",[s._v("角色")]),s._v(" "),t("th",[s._v("IP")])])]),s._v(" "),t("tbody",[t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.104.31")])]),s._v(" "),t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.104.29")])]),s._v(" "),t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.135.26, myself")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.104.30")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.104.32")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.104.33")])])])]),s._v(" "),t("p",[s._v("读写个数据试试")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl exec -it redis-cluster-leader-0 -- redis-cli -a password -c set tony stark")]),s._v("\nDefaulted container "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster-leader"')]),s._v(" out of: redis-cluster-leader, redis-exporter\nWarning: Using a password with "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-a'")]),s._v(" or "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-u'")]),s._v(" option on the "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("command")]),s._v(" line interface may not be safe.\nOK\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl exec -it redis-cluster-leader-0 -- redis-cli -a password -c get tony")]),s._v("\nDefaulted container "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster-leader"')]),s._v(" out of: redis-cluster-leader, redis-exporter\nWarning: Using a password with "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-a'")]),s._v(" or "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-u'")]),s._v(" option on the "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("command")]),s._v(" line interface may not be safe.\n"),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"stark"')]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br")])]),t("p",[s._v("试一下master补位")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl delete pod redis-cluster-leader-0 ")]),s._v("\npod "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster-leader-0"')]),s._v(" deleted\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@node1 ~"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# kubectl exec -it redis-cluster-leader-0 -- redis-cli -a password cluster nodes")]),s._v("\nDefaulted container "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"redis-cluster-leader"')]),s._v(" out of: redis-cluster-leader, redis-exporter\nWarning: Using a password with "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-a'")]),s._v(" or "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'-u'")]),s._v(" option on the "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("command")]),s._v(" line interface may not be safe.\n4cc6a047f5f4f72ecced7be6b495738156e489a7 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.31:6379@16379 master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795657138")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("5461")]),s._v("-10922\nb4bd803d634042b569ff4faea3d1adee808a54f5 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".135.27:6379@16379 myself,slave c2eb9dfdbdb20de0444a3fe1f78945c775dbd781 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795657000")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(" connected\n640844a5d9f5d27fcf308a70cf97ee8c87605330 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.32:6379@16379 slave 4cc6a047f5f4f72ecced7be6b495738156e489a7 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795657639")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(" connected\nc2eb9dfdbdb20de0444a3fe1f78945c775dbd781 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.33:6379@16379 master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795656131")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v("-5460\n7cfa62aaf91e0c5a528b59aad46054c7f4d057ca "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.29:6379@16379 master - "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795657138")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v(" connected "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10923")]),s._v("-16383\n6e418e911aee8e80c9c6864591694d54fb10ccc0 "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10.100")]),s._v(".104.30:6379@16379 slave 7cfa62aaf91e0c5a528b59aad46054c7f4d057ca "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1629795656532")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v(" connected\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br")])]),t("p",[s._v("此时的主从节点如下")]),s._v(" "),t("table",[t("thead",[t("tr",[t("th",[s._v("角色")]),s._v(" "),t("th",[s._v("IP")])])]),s._v(" "),t("tbody",[t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.104.31")])]),s._v(" "),t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.104.29")])]),s._v(" "),t("tr",[t("td",[s._v("master")]),s._v(" "),t("td",[s._v("10.100.104.33")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.104.30")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.104.32")])]),s._v(" "),t("tr",[t("td",[s._v("slave")]),s._v(" "),t("td",[s._v("10.100.135.27, myself")])])])]),s._v(" "),t("p",[s._v("至此一个简单的redis集群部署完成, 与上一篇的mysql集群一样, 这次的部署"),t("strong",[s._v("目前仅做技术调研和测试使用, 若要进一步用于生产环境还需要做进一步论证和调整")])]),s._v(" "),t("p",[s._v("参考文档:")]),s._v(" "),t("ul",[t("li",[s._v("https://helm.sh/zh/docs/")]),s._v(" "),t("li",[s._v("https://www.infoq.cn/article/pPP3LRqf8BApcg3azNL3")]),s._v(" "),t("li",[s._v("https://ot-container-kit.github.io/redis-operator/")])])])}),[],!1,null,null,null);e.default=r.exports}}]);