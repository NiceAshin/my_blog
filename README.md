---
home: true
heroText: AshinBlog
tagline: 专注于 PHP, Java, Go 与云原生的极客空间
# heroImage: /logo.png
heroImageStyle: {
  maxWidth: '200px',
  width: '100%',
  display: block,
  margin: '6rem auto 1.5rem',
  borderRadius: '50%',
  boxShadow: '0 5px 18px rgba(0,0,0,0.2)'
}
bgImage: '/images/home-bg.jpg'
bgImageStyle: {
  height: '450px'
}
isShowTitleInHome: false
actionText: 阅读文章 →
actionLink: /views/other/guide
features:
- title: 架构深度
  details: 从 DDD 到微服务，探索复杂系统的拆解与演进之道。
- title: 基础设施
  details: 玩转 K8s, Docker 与 Service Mesh，构建高效的云原生底座。
- title: 全栈探索
  details: 深度剖析 Java, Go, PHP(Yii2) 与 AI 智能工具的应用实战。
---

# AshinBlog

一个基于 VuePress 的技术博客，记录 PHP、Java、Go 与云原生方向的实践。

## 本地运行

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器预览
npm run build      # 构建静态站点到 .vuepress/dist
```

## 目录说明

| 目录 | 内容 |
| --- | --- |
| `ai` | AI 工具与智能体实践 |
| `go` / `java` / `yii2` / `laravel12` | 各语言专题 |
| `cloud-native` / `docker` / `microservice` | 云原生与微服务 |
| `ddd` / `design` | 架构设计与领域建模 |
| `linux` / `ground` / `scripts` | 系统基础环境与运维脚本 |
