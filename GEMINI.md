# AshinBlog: 技术知识库与博客

这是一个基于 VuePress 构建的个人技术博客和知识库，专注于现代软件工程、架构设计以及云原生技术。

> **最后更新时间:** 2026-02-27

## 项目概览

- **核心技术:** [VuePress v1.x](https://vuepress.vuejs.org/)
- **主题:** [vuepress-theme-reco](https://vuepress-reco.recoluan.com/)
- **作者:** AshinZhang
- **内容聚焦:** 
    - **架构设计:** 领域驱动设计 (DDD)、微服务实践、设计模式。
    - **编程语言:** Java (JVM、并发编程、Netty、响应式流)、Go 语言。
    - **基础设施:** Docker、Kubernetes (K8s)、服务网格 (Service Mesh)、中间件运维 (MySQL, Redis, Kafka 等)、Linux。
    - **人工智能:** YOLOv8 实践、OCR 集成、Codex/Cursor 指南。

## 目录结构说明

- `.vuepress/`: VuePress 核心配置、主题设置、导航菜单及静态资源。
    - `config.js`: 主配置文件。
    - `nav/zh.js`: 中文导航菜单定义。
    - `public/`: 图片、图标等公共静态资源。
- `ai/`: AI 相关研究与实践指南。
- `cloud-native/`: 云原生相关笔记，涵盖 K8s、Ingress、网络、Serverless 及服务网格。
- `ddd/`: 领域驱动设计的战略与战术。
- `design/`: 经典设计模式的实现细节。
- `docker/`: Docker 及 Docker Compose 的命令与部署实践。
- `go/`: Go 语言并发模式、DDD 在 Go 中的应用及服务可观测性。
- `ground/`: 基础设施中间件运维 (ES, Kafka, Mongo, MySQL, Postgres, Redis, SRS)。
- `java/`: Java 技术深度探索 (JVM, Netty, 并发包, 响应式编程)。
- `linux/`: Linux 常用命令、FRPC 穿透及 Git 多端同步。
- `microservice/`: 微服务设计、可观测性及治理。
- `more/`: 综合性技术文章、问题排查经验及接口文档专区。

## 构建与运行

### 开发环境
启动本地开发服务器：
```bash
npm run dev
```
启动后可通过 `http://localhost:8080` (或配置的端口) 访问。

### 生产构建
生成静态站点文件：
```bash
npm run build
```
构建产物将存放在 `.vuepress/dist` 目录下。

## 开发规范

- **内容创作:** 所有内容均使用 Markdown (`.md`) 编写。
- **Frontmatter:** 在 `.md` 文件顶部使用 YAML Frontmatter 定义元数据（日期、标题、标签等）。
- **目录组织:** 新的主题应组织在相应的一级目录下，每个目录通常包含一个 `README.md` 作为入口。
- **导航更新:** 增加一级分类或调整主导航结构时，需同步修改 `.vuepress/nav/zh.js`。
- **内部链接:** 建议使用相对路径进行 Markdown 文件间的跳转 (例如：`[链接](./other-file.md)`)。
- **资源管理:** 图片可存放在 `.vuepress/public/` or 相关本地目录，并按需引用。
