(window.webpackJsonp=window.webpackJsonp||[]).push([[99],{661:function(t,s,r){"use strict";r.r(s);var a=r(13),e=Object(a.a)({},(function(){var t=this,s=t.$createElement,r=t._self._c||s;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"服务质量"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#服务质量"}},[t._v("#")]),t._v(" 服务质量")]),t._v(" "),r("p",[t._v("服务质量保证主要分为鉴权, 可配置性, 可观测性, 服务基地四个部分.")]),t._v(" "),r("h2",{attrs:{id:"鉴权"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#鉴权"}},[t._v("#")]),t._v(" 鉴权")]),t._v(" "),r("p",[t._v("采用API Gateway认证身份, 使用JWT传递身份和角色")]),t._v(" "),r("p",[t._v("JWT是自包含的, 要防止token泄露")]),t._v(" "),r("p",[t._v("发布较短时间的JWT, 使用Oauth2.0规范")]),t._v(" "),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("Oauth2.0")]),r("ul",[r("li",[t._v("授权服务器.  用于验证身份")]),t._v(" "),r("li",[t._v("token. token分为两个. 一个access token, 有效时间较短, 一个refresh token, 长效的可撤销的token, 用于刷新access token.")]),t._v(" "),r("li",[t._v("资源服务器. 被客户端使用token访问的单个服务")])])]),r("h2",{attrs:{id:"可配置性"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#可配置性"}},[t._v("#")]),t._v(" 可配置性")]),t._v(" "),r("p",[t._v("这里的可配置性指的是单个服务的运行环境的可配置性与相同服务多个实例的环境变量的可配置性, 服务的配置可分为推送模式和拉取模式两类")]),t._v(" "),r("h3",{attrs:{id:"推送模式"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#推送模式"}},[t._v("#")]),t._v(" 推送模式")]),t._v(" "),r("ul",[r("li",[t._v("命令行参数")]),t._v(" "),r("li",[t._v("spring_application_json, 包含json的操作系统变量和jvm系统属性")]),t._v(" "),r("li",[t._v("jvm系统属性")]),t._v(" "),r("li",[t._v("操作系统环境变量")]),t._v(" "),r("li",[t._v("当前目录中的配置文件")])]),t._v(" "),r("h3",{attrs:{id:"拉取模式"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#拉取模式"}},[t._v("#")]),t._v(" 拉取模式")]),t._v(" "),r("p",[t._v("可采用"),r("a",{attrs:{href:"https://cloud.spring.io/spring-cloud-config/reference/html/",target:"_blank",rel:"noopener noreferrer"}},[t._v("spring cloud config"),r("OutboundLink")],1),t._v(" 配合"),r("a",{attrs:{href:"https://spring.io/projects/spring-cloud-bus",target:"_blank",rel:"noopener noreferrer"}},[t._v("spring cloud bus"),r("OutboundLink")],1),t._v("可达到热更新的效果")]),t._v(" "),r("h2",{attrs:{id:"可观测性"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#可观测性"}},[t._v("#")]),t._v(" 可观测性")]),t._v(" "),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("健康检查API")]),r("p",[t._v("可以公开的返回服务运行状况")]),t._v(" "),r("p",[t._v("可以使用的组件:"),r("a",{attrs:{href:"https://www.baeldung.com/spring-boot-actuators",target:"_blank",rel:"noopener noreferrer"}},[t._v("spring boot actuator"),r("OutboundLink")],1),t._v(" , 可以可是服务实例与外部服务(如数据库)的连接")]),t._v(" "),r("p",[t._v("配置eureka 定期调用健康检查API, 来确定是否将流量路由到服务实例")]),t._v(" "),r("p",[t._v("docker add curl 定时调用检查API")])]),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("日志聚合")]),r("p",[t._v("Elasticsearch + logstash + kibana")])]),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("应用程序指标")]),r("p",[t._v("服务运维指标, 如计数器(例: order事件技术), 并公开指标服务")])]),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("审核日志记录")]),r("p",[t._v("记录用户操作, 实现方式可采用切面编程或"),r("RouterLink",{attrs:{to:"/ddd/event-source.html"}},[t._v("事件溯源")])],1)]),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("分布式追踪")]),r("p",[r("a",{attrs:{href:"https://spring.io/projects/spring-cloud-sleuth",target:"_blank",rel:"noopener noreferrer"}},[t._v("spring cloud sleuth"),r("OutboundLink")],1),t._v("追踪工具类库 + "),r("a",{attrs:{href:"https://zipkin.io/",target:"_blank",rel:"noopener noreferrer"}},[t._v("OpenZipkin"),r("OutboundLink")],1),t._v("追踪服务器")]),t._v(" "),r("p",[t._v("sleuth将追踪日志发送到追踪服务器, 服务器进行存储并供客户端查询")])]),r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"},[t._v("异常追踪")]),r("p",[t._v("向异常跟踪服务报告异常, 异常跟踪服务可以对异常进行重复数据删除, 向开发人员发出警报, 并跟踪每个异常的解决方案")])]),r("h2",{attrs:{id:"微服务基底"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#微服务基底"}},[t._v("#")]),t._v(" 微服务基底")]),t._v(" "),r("p",[t._v("微服务基底是一个或一组框架, 处理服务通信与服务观察问题 "),r("a",{attrs:{href:"https://github.com/ytg2097/spring-coud-quick-starters",target:"_blank",rel:"noopener noreferrer"}},[t._v("spring-coud-quick-starters"),r("OutboundLink")],1)]),t._v(" "),r("h2",{attrs:{id:"服务网格"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#服务网格"}},[t._v("#")]),t._v(" "),r("RouterLink",{attrs:{to:"/cloud-native/service-mesh/service-mesh-1.html"}},[t._v("服务网格")])],1)])}),[],!1,null,null,null);s.default=e.exports}}]);