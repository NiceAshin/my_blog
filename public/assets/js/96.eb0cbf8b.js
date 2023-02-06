(window.webpackJsonp=window.webpackJsonp||[]).push([[96],{658:function(v,_,t){"use strict";t.r(_);var r=t(13),a=Object(r.a)({},(function(){var v=this,_=v.$createElement,t=v._self._c||_;return t("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[t("h1",{attrs:{id:"服务间通信"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#服务间通信"}},[v._v("#")]),v._v(" 服务间通信")]),v._v(" "),t("h2",{attrs:{id:"一、服务发现"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#一、服务发现"}},[v._v("#")]),v._v(" 一、服务发现")]),v._v(" "),t("p",[v._v("服务实例具有动态分配的网络位置. 此外, 由于自动扩展, 故障和升级, 实例集合会动态更改, 因此客户端代码必须使用服务发现")]),v._v(" "),t("h3",{attrs:{id:"应用层发现模式"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#应用层发现模式"}},[v._v("#")]),v._v(" 应用层发现模式")]),v._v(" "),t("p",[v._v("常用的应用层服务发现组件如eureka,nacos")]),v._v(" "),t("ul",[t("li",[v._v("服务机器客户端直接与服务注册表交互")]),v._v(" "),t("li",[v._v("通过部署基础设施来时间服务发现")])]),v._v(" "),t("h3",{attrs:{id:"平台服务发现模式"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#平台服务发现模式"}},[v._v("#")]),v._v(" 平台服务发现模式")]),v._v(" "),t("p",[v._v("现代部署平台中内置服务注册表和服务发现机制. 如docker + k8s")]),v._v(" "),t("p",[v._v("部署平台中的注册器观察服务实例, 为其分配DNS名称, 虚拟IP(VIP)和解析为VIP的DNS名称, 客户端想dns名称和vip发起请求, 部署平台自动将请求路由到其中一个可用的服务实例.")]),v._v(" "),t("p",[v._v("优点是服务发现的所有方面完全由部署平台处理, 服务和客户端都不包含任何服务发现代码. 对语言和框架没有限制")]),v._v(" "),t("h2",{attrs:{id:"二、基于同步的远程过程调用模式的通信"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#二、基于同步的远程过程调用模式的通信"}},[v._v("#")]),v._v(" 二、基于同步的远程过程调用模式的通信")]),v._v(" "),t("h3",{attrs:{id:"rest"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#rest"}},[v._v("#")]),v._v(" REST")]),v._v(" "),t("p",[v._v("REST是一种(总是)使用http协议的进程间通讯机制, 关键概念是资源, 采用http动词操作资源.")]),v._v(" "),t("h4",{attrs:{id:"成熟度模型-从低到高"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#成熟度模型-从低到高"}},[v._v("#")]),v._v(" 成熟度模型(从低到高)")]),v._v(" "),t("ol",[t("li",[v._v("客户端只是向服务端发起POST请求, 进行服务调用, 每个请求都指明了需要执行的操作和这个操作针对的目标")]),v._v(" "),t("li",[v._v("要执行对资源的操作, 客户端需要发出指定要执行的操作和包含任何参数的POST的请求")]),v._v(" "),t("li",[v._v("使用HTTP动词进行操作")]),v._v(" "),t("li",[v._v("基于HATEOAS(hypertext as the engine of application state) 设计原则, 基本思想是在由GET请求返回的资源中包含链接, 这些连接能够执行该资源允许的操作")])]),v._v(" "),t("h4",{attrs:{id:"定义"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#定义"}},[v._v("#")]),v._v(" 定义")]),v._v(" "),t("p",[v._v("将操作映射为HTTP动词")]),v._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[v._v("    "),t("span",{pre:!0,attrs:{class:"token constant"}},[v._v("POST")]),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v(":")]),v._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("user  \t新建用户\n    "),t("span",{pre:!0,attrs:{class:"token constant"}},[v._v("GET")]),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v(":")]),v._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("user"),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("id \t获取某个用户信息\n    "),t("span",{pre:!0,attrs:{class:"token constant"}},[v._v("DELETE")]),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v(":")]),v._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("user"),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("id \t删除某个用户\n    "),t("span",{pre:!0,attrs:{class:"token constant"}},[v._v("PUT")]),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v(":")]),t("span",{pre:!0,attrs:{class:"token operator"}},[v._v("/")]),v._v("user    \t修改某个用户信息\n")])]),v._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[v._v("1")]),t("br"),t("span",{staticClass:"line-number"},[v._v("2")]),t("br"),t("span",{staticClass:"line-number"},[v._v("3")]),t("br"),t("span",{staticClass:"line-number"},[v._v("4")]),t("br")])]),t("h4",{attrs:{id:"弊端"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#弊端"}},[v._v("#")]),v._v(" 弊端")]),v._v(" "),t("ul",[t("li",[v._v("只支持请求/响应的通信")]),v._v(" "),t("li",[v._v("可能导致可用性降低. 由于客户端和服务端直接通信没有代理缓冲消息, 因此必须保证双方在调用期间都在线")]),v._v(" "),t("li",[v._v("客户端必须知道服务实例的位置")]),v._v(" "),t("li",[v._v("单个请求中获取多个资源具有挑战性")]),v._v(" "),t("li",[v._v("将多个更新操作映射到HTTP动词困难")])]),v._v(" "),t("h3",{attrs:{id:"grpc"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#grpc"}},[v._v("#")]),v._v(" gRPC")]),v._v(" "),t("p",[v._v("gRPC可以是REST的替代品")]),v._v(" "),t("p",[v._v("gRPC是一种基于二进制消息的协议.")]),v._v(" "),t("p",[v._v("gRPC API 由一个或多个服务和请求/响应消息定义组成, 服务定义类似于JAVA接口, 是强类型方法的集合")]),v._v(" "),t("p",[v._v("gRPC使用Protocol Buffers作为消息格式, 这是一种高效且紧凑的二进制格式, 是一种标记格式")]),v._v(" "),t("blockquote",[t("p",[v._v("Protocol Buffers消息的每个字段都有编号, 并且有一个类型代码")]),v._v(" "),t("p",[v._v("消息接收方可以提起所需字段, 并跳过他无法识别的字段, 因此gRPC能够保持向后兼容的同时进行变更")])]),v._v(" "),t("h4",{attrs:{id:"好处"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#好处"}},[v._v("#")]),v._v(" 好处")]),v._v(" "),t("ul",[t("li",[v._v("设计具有复杂更新操作的API非常简单")]),v._v(" "),t("li",[v._v("具有高效, 紧凑的进程间通信机制, 尤其是在交换大量消息时")]),v._v(" "),t("li",[v._v("支持在远程过程调用和消息传递过程中使用双向流式消息方式")]),v._v(" "),t("li",[v._v("实现了客户端和各种语言编写的服务端之间的互操作性")])]),v._v(" "),t("h4",{attrs:{id:"弊端-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#弊端-2"}},[v._v("#")]),v._v(" 弊端")]),v._v(" "),t("ul",[t("li",[v._v("与基于REST/JSON的API机制相比, js客户端使用基于gRPC的API需要更多的操作")]),v._v(" "),t("li",[v._v("旧式防火墙可能不支持HTTP/2")])]),v._v(" "),t("h3",{attrs:{id:"处理服务端无响应故障"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#处理服务端无响应故障"}},[v._v("#")]),v._v(" 处理服务端无响应故障")]),v._v(" "),t("ul",[t("li",[v._v("断路器模式")])]),v._v(" "),t("blockquote",[t("p",[v._v("监控客户端发出请求的成功和失败数量, 失败比例超过一定阈值后启动断路器, 让后续调用立刻失效, 进过一定时间后客户端应该继续尝试, 如果调用成功, 解除断路器. 常用的断路器: Spring Cloud Hystrix")])]),v._v(" "),t("ul",[t("li",[v._v("网络超时")])]),v._v(" "),t("blockquote",[t("p",[v._v("不要做成无限阻塞, 要设置timeout")])]),v._v(" "),t("ul",[t("li",[v._v("限制客户端请求数量")])]),v._v(" "),t("blockquote",[t("p",[v._v("把客户端能够向特定服务发起的请求设置一个上线, 若请求达到上限, 请求立刻失败. 常见的手段: 令牌桶")])]),v._v(" "),t("ul",[t("li",[v._v("从服务失效故障中恢复")])]),v._v(" "),t("blockquote",[t("p",[v._v("服务只需向其他客户端返回错误")]),v._v(" "),t("p",[v._v("返回备用值(默认值或者缓存响应). 如果查询操作中存在调用多个服务的场景, 每个服务的数据对客户来说重要性不同, 重要数据应返回其数据的缓存版本或错误; 非重要数据可以返回缓存版本或直接忽略.")])]),v._v(" "),t("h2",{attrs:{id:"三、基于异步消息模式的通信"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#三、基于异步消息模式的通信"}},[v._v("#")]),v._v(" 三、基于异步消息模式的通信")]),v._v(" "),t("h3",{attrs:{id:"消息类型"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#消息类型"}},[v._v("#")]),v._v(" 消息类型")]),v._v(" "),t("ul",[t("li",[t("strong",[v._v("文档")]),v._v(": 仅包含数据的通用信息")]),v._v(" "),t("li",[t("strong",[v._v("命令")]),v._v(": 等同于RPC请求的消息, 指定要调用的操作及其参数")]),v._v(" "),t("li",[t("strong",[v._v("事件")]),v._v(": 标示发生方发生了重要的事件, 事件通常是领域事件, 标示领域对象的状态更改")])]),v._v(" "),t("h3",{attrs:{id:"有代理型消息架构"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#有代理型消息架构"}},[v._v("#")]),v._v(" 有代理型消息架构")]),v._v(" "),t("p",[v._v("消息代理是所有消息的中间节点, 发送放写入消息到消息代理, 消息代理将消息发送到接收方")]),v._v(" "),t("p",[t("strong",[v._v("优点")])]),v._v(" "),t("ul",[t("li",[v._v("松耦合")]),v._v(" "),t("li",[v._v("消息可以缓存")]),v._v(" "),t("li",[v._v("通信灵活")])]),v._v(" "),t("blockquote",[t("ul",[t("li",[v._v("支持请求/响应模式")]),v._v(" "),t("li",[v._v("支持请求/异步响应模式")]),v._v(" "),t("li",[v._v("支持发布/订阅")]),v._v(" "),t("li",[v._v("支持单向通知")]),v._v(" "),t("li",[v._v("支持发布/异步响应模式")])]),v._v(" "),t("blockquote",[t("p",[v._v("通过把发布/订阅和请求/响应两种方式组合实现")]),v._v(" "),t("p",[v._v("客户端发布消息, 小系统中指定回复通道, 这个回复通道也是一个发布/订阅通道; 消费者将包含相关性ID的回复消息写入回复通道, 客户端通过使用相关性ID收集响应")])]),v._v(" "),t("ul",[t("li",[v._v("明确的进程间通信")])])]),v._v(" "),t("p",[t("strong",[v._v("缺点")])]),v._v(" "),t("ul",[t("li",[v._v("消息代理潜在的性能瓶颈(可以通过集群解决)")]),v._v(" "),t("li",[v._v("潜在的单点故障(大多数高可用, 无须担心)")]),v._v(" "),t("li",[v._v("额外的操作复杂性")])]),v._v(" "),t("blockquote",[t("ul",[t("li",[v._v("并发与保证顺序")])]),v._v(" "),t("blockquote",[t("ol",[t("li",[v._v("通道进行分片, 每个分片的行为类似一个通道")]),v._v(" "),t("li",[v._v("发送方在消息头部指定分片key, 消息代理通过key分配到指定分片")]),v._v(" "),t("li",[v._v("消息代理将多个接收方实例组合, 并视为相同的逻辑接收方. 如kafka的group")])]),v._v(" "),t("p",[v._v("以上三步保证特定消息分配到同一个分片, 并且该分片中的消息始终有同一个接收方实例读取, 由此来保证顺序处理")])]),v._v(" "),t("ul",[t("li",[v._v("处理复杂操作")])]),v._v(" "),t("blockquote",[t("p",[v._v("消息中进行幂等处理\n跟踪消息并丢弃重复项, 如messageId 唯一键")])])]),v._v(" "),t("p",[t("strong",[v._v("消息代理技术选型影响因素")])]),v._v(" "),t("ul",[t("li",[v._v("支持的编程语言")]),v._v(" "),t("li",[v._v("支持的消息标准. 是否支持多种, 还是仅支持专用")]),v._v(" "),t("li",[v._v("消息是否有序")]),v._v(" "),t("li",[v._v("提供什么样的投递保证")]),v._v(" "),t("li",[v._v("持久性. 是否可以持久化到磁盘并在崩溃后恢复")]),v._v(" "),t("li",[v._v("耐久性. 接收方重连后能否收到断开连接时发送的消息")]),v._v(" "),t("li",[v._v("可扩展性")]),v._v(" "),t("li",[v._v("延迟")]),v._v(" "),t("li",[v._v("竞争性接收方. 如kafka中一个group智能一个订阅者接收消息")])]),v._v(" "),t("p",[t("strong",[v._v("基于消息机制的API规范")])]),v._v(" "),t("p",[v._v("必须指定消息通道的名称, 通过通道交换的信息类型及其格式.")]),v._v(" "),t("p",[v._v("记录异步操作的API规范")]),v._v(" "),t("ul",[t("li",[v._v("请求/异步响应式API.")])]),v._v(" "),t("blockquote",[t("p",[v._v("包括服务的命令消息通道, 服务接收的命令式消息的具体类型和格式")])]),v._v(" "),t("ul",[t("li",[v._v("单向通知式API")])]),v._v(" "),t("blockquote",[t("p",[v._v("包括服务的命令消息通道, 以及服务接收的命令式消息的具体类型和格式")])]),v._v(" "),t("p",[v._v("记录事件发布, 通过发布/订阅的方式对外发布事件, 包括事件通道和发布到通道的事件式消息的类型和格式")]),v._v(" "),t("h3",{attrs:{id:"无代理型消息架构"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#无代理型消息架构"}},[v._v("#")]),v._v(" 无代理型消息架构")]),v._v(" "),t("p",[v._v("服务可以直接交换消息, 典型代表是ZeroMQ, 它及时规范, 也是适用于不同编程语言的库, 支持各种传输协议, 包括TCP, UNIX风格的套接字和多播")]),v._v(" "),t("p",[v._v("好处是更轻的网络流量与更低的延迟, 没有消息代理成为性能瓶颈和单点故障的可能性")]),v._v(" "),t("p",[v._v("缺点是发送放和接收方必须同时在线, 并且服务需要了解彼此的位置")]),v._v(" "),t("h3",{attrs:{id:"事务性消息"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#事务性消息"}},[v._v("#")]),v._v(" 事务性消息")]),v._v(" "),t("p",[v._v("服务通常需要在更新数据库的事务中发布消息, 如发布领域事件时. 要保证数据库更新和消息发送在事务中进行可以采取事务表的方式, 将数据库作为消息队列")]),v._v(" "),t("ol",[t("li",[v._v("发送的消息插入到消息表中, 作为增删改业务对象的数据库事务的一部分, 因为是本地事务, 可以保证原子性")]),v._v(" "),t("li",[v._v("将消息表中的消息发布到消息队列中.")])]),v._v(" "),t("p",[t("strong",[v._v("发布事务消息的方式")])]),v._v(" "),t("ul",[t("li",[v._v("轮询事务表发布消息, 但这会降低性能, 并且在NOSQL中可能无法查询指定消息")]),v._v(" "),t("li",[v._v("切面发布, doAround后发布消息表中的消息(最优)")]),v._v(" "),t("li",[v._v("事务日志拖尾模式发布")])]),v._v(" "),t("blockquote",[t("p",[v._v("每次应用程序更新数据库都对应着数据库事务日志的一个条目, 事务日志挖掘起可以读取事务日志, 把每条跟消息有关的记录发送给消息代理")])]),v._v(" "),t("h3",{attrs:{id:"使用异步消息提高可用性"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#使用异步消息提高可用性"}},[v._v("#")]),v._v(" 使用异步消息提高可用性")]),v._v(" "),t("p",[v._v("例如创建订单的创建, 在操作order服务的同时会涉及customer和restaurant服务")]),v._v(" "),t("div",{staticClass:"language- line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[v._v("    public void createOrder(OrderCreateCommand command){\n    \n        boolean customerCheckResult = customerService.check(command.getCustomer());\n        boolean restaurantCheckResult = restaurantService.check(command.getRestaurant());\n        \n        if(customerCheckResult && restaurantCheckResult){\n            Order order = orderFactory.create(command);\n            orderRepository.save(order);\n        }\n    }\n")])]),v._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[v._v("1")]),t("br"),t("span",{staticClass:"line-number"},[v._v("2")]),t("br"),t("span",{staticClass:"line-number"},[v._v("3")]),t("br"),t("span",{staticClass:"line-number"},[v._v("4")]),t("br"),t("span",{staticClass:"line-number"},[v._v("5")]),t("br"),t("span",{staticClass:"line-number"},[v._v("6")]),t("br"),t("span",{staticClass:"line-number"},[v._v("7")]),t("br"),t("span",{staticClass:"line-number"},[v._v("8")]),t("br"),t("span",{staticClass:"line-number"},[v._v("9")]),t("br"),t("span",{staticClass:"line-number"},[v._v("10")]),t("br")])]),t("p",[t("strong",[v._v("实现方式")])]),v._v(" "),t("ul",[t("li",[t("p",[v._v("所有交互全部异步")]),v._v(" "),t("ol",[t("li",[v._v("客户端发起create请求")]),v._v(" "),t("li",[v._v("orderService收到请求, 分别异步请求customerService和restaurantService验证信息")]),v._v(" "),t("li",[v._v("orderService收到验证信息, 完成orderCreate操作, 返回响应")])])]),v._v(" "),t("li",[t("p",[v._v("复制数据(消除上帝类的另一可用之处)")])])]),v._v(" "),t("p",[v._v("orderService自包含customer和restaurant中需压迫验证的相关数据, 直接在本服务中验证.")]),v._v(" "),t("p",[v._v("customer中数据变更时发出消息, orderService订阅更新自包含数据")]),v._v(" "),t("p",[v._v("优点是不需要服务交互即可完成订单创建, 缺点是复制数据量过大会导致性能降低, 并且数据复制不能保证同步")]),v._v(" "),t("ul",[t("li",[t("p",[v._v("先返回响应, 再完成处理")]),v._v(" "),t("ol",[t("li",[v._v("order直接创建返回响应")]),v._v(" "),t("li",[v._v("异步请求其他服务验证信息")]),v._v(" "),t("li",[v._v("其他服务返回错误状态, orderService收到消息, 将order改为对应的错误状态")]),v._v(" "),t("li",[v._v("orderService通知客户端刚创建的order验证失败")])])])]),v._v(" "),t("p",[v._v("但这种做法会使客户端更复杂, 客户端知道order创建成功, 但不久后返回失败")])])}),[],!1,null,null,null);_.default=a.exports}}]);