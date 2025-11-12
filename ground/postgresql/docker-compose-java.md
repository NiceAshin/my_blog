---
title: 使用 Docker Compose 部署 PostgreSQL 并完成 Java 接入
date: 2024-05-05 11:00:00
sidebar: auto
---

# 使用 Docker Compose 部署 PostgreSQL 并完成 Java 接入

> 预计阅读时间：9 分钟

PostgreSQL（简称 PG）是一款功能强大的开源关系型数据库。本文将通过 Docker Compose 部署单实例 PostgreSQL，并演示 Spring Boot 应用的连接与常见运维动作。

## Docker Compose 部署

目录结构：

```
pgsql-demo/
├── docker-compose.yml
└── initdb/
    └── init.sql
```

`docker-compose.yml` 内容：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: demo-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=pgadmin
      - POSTGRES_PASSWORD=pgadmin123
      - POSTGRES_DB=blog
    volumes:
      - ./data:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d
```

`initdb/init.sql` 中初始化业务库对象：

```sql
CREATE SCHEMA IF NOT EXISTS blog_app;

CREATE TABLE IF NOT EXISTS blog_app.article (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(120) NOT NULL,
    slug        VARCHAR(80)  NOT NULL UNIQUE,
    content     TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW()
);
```

启动数据库：

```bash
docker compose up -d
```

> 默认账号为 `pgadmin/pgadmin123`，可使用 `psql` 或图形化工具连接：`psql postgresql://pgadmin:pgadmin123@localhost:5432/blog`。

## 常见运维命令

```bash
# 查看容器日志
docker logs -f demo-postgres

# 进入交互式 psql
docker exec -it demo-postgres psql -U pgadmin -d blog

# 在线备份
docker exec demo-postgres pg_dump -U pgadmin -d blog > backup.sql
```

## Java 集成示例

Gradle 依赖：

```kts
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
}
```

`application.yml` 配置：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/blog
    username: pgadmin
    password: pgadmin123
    hikari:
      maximum-pool-size: 10
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        default_schema: blog_app
    open-in-view: false
```

实体与仓库：

```java
@Entity
@Table(name = "article", schema = "blog_app")
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String slug;

    private String content;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
}

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {
    Optional<ArticleEntity> findBySlug(String slug);
}
```

服务层示例：

```java
@Service
public class ArticleService {

    private final ArticleRepository repository;

    public ArticleService(ArticleRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ArticleEntity publish(String title, String slug, String content) {
        ArticleEntity entity = new ArticleEntity();
        entity.setTitle(title);
        entity.setSlug(slug);
        entity.setContent(content);
        entity.setPublishedAt(OffsetDateTime.now());
        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public Optional<ArticleEntity> findBySlug(String slug) {
        return repository.findBySlug(slug);
    }
}
```

## 性能与安全建议

- **连接池**：根据负载调整 `maximum-pool-size`，避免耗尽连接。
- **数据卷**：将 `./data` 映射至高可靠存储，定期备份。
- **权限**：生产环境中使用单独的业务账号，并限制其对系统库的访问权限。

## 总结

借助 Docker Compose 可以快速搭建 PostgreSQL 测试环境，结合 Spring Data JPA 便于实现业务读写逻辑。后续可扩展为高可用架构（如 Patroni、主从复制）以满足生产需求。
