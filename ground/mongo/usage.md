---
title: 使用 Docker Compose 快速体验 MongoDB 并集成 Spring Data
date: 2024-05-05 10:30:00
sidebar: auto
---

# 使用 Docker Compose 快速体验 MongoDB 并集成 Spring Data

> 预计阅读时间：8 分钟

本文展示如何通过 Docker Compose 部署单节点 MongoDB，并使用 Spring Data MongoDB 完成基本的 CRUD 操作，帮助运维和开发快速验证业务场景。

## 目录结构

```
mongo-demo/
├── docker-compose.yml
└── init-mongo.js
```

## Docker Compose 配置

`docker-compose.yml`：

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    container_name: demo-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
    volumes:
      - ./data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
```

`init-mongo.js` 用于初始化账号与数据库：

```js
db.createUser({
  user: "blog_user",
  pwd: "blog_pass",
  roles: [
    { role: "readWrite", db: "blog" }
  ]
});
```

启动服务：

```bash
docker compose up -d
```

> 首次启动会创建 `blog` 数据库并绑定 `blog_user` 账号。

## 常用运维命令

```bash
# 登录容器执行命令
docker exec -it demo-mongo mongosh -u blog_user -p blog_pass --authenticationDatabase blog

# 查看数据库
show dbs

# 查看集合
use blog
show collections

# 创建索引
db.article.createIndex({ slug: 1 }, { unique: true })
```

## Java 集成示例

Gradle 依赖：

```kts
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
}
```

实体与仓库：

```java
@Document("article")
public class Article {
    @Id
    private String id;
    private String title;
    private String slug;
    private Instant publishedAt;
}

public interface ArticleRepository extends MongoRepository<Article, String> {
    Optional<Article> findBySlug(String slug);
}
```

配置连接：

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://blog_user:blog_pass@localhost:27017/blog
```

基础用法：

```java
@Service
public class ArticleService {

    private final ArticleRepository repository;

    public ArticleService(ArticleRepository repository) {
        this.repository = repository;
    }

    public Article publish(String title, String slug) {
        Article article = new Article();
        article.setTitle(title);
        article.setSlug(slug);
        article.setPublishedAt(Instant.now());
        return repository.save(article);
    }

    public Optional<Article> getBySlug(String slug) {
        return repository.findBySlug(slug);
    }
}
```

## 数据备份与恢复

```bash
# 备份 blog 数据库
docker exec demo-mongo mongodump -u admin -p admin123 --authenticationDatabase admin --db blog --out /backup

# 恢复
docker exec demo-mongo mongorestore -u admin -p admin123 --authenticationDatabase admin /backup
```

## 总结

通过 Docker Compose 可以迅速搭建 MongoDB 测试环境，并借助 Spring Data 完成应用层集成。在迁移至生产环境时，可进一步扩展为副本集或分片集群，并配合备份策略保证数据安全。
