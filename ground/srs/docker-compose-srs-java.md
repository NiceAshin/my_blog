---
title: 使用 Docker Compose 部署 SRS 并通过 Java 调用
date: 2024-05-05 10:00:00
sidebar: auto
---

# 使用 Docker Compose 部署 SRS 并通过 Java 调用

> 预计阅读时间：10 分钟

SRS（Simple Realtime Server）是一款轻量级的实时音视频服务器，适合搭建 RTMP、WebRTC 等直播流服务。本文介绍如何使用 Docker Compose 快速部署 SRS，并通过 Java 代码调用其 RESTful 接口实现推流状态管理。

## 环境准备

- Docker 20+
- Docker Compose v2
- JDK 8+（示例代码基于 Spring Boot 3）

## Docker Compose 部署

创建 `docker-compose.yml` 文件，定义 SRS 服务和一个示例的 Nginx-RTMP 推流容器：

```yaml
version: '3.8'
services:
  srs:
    image: ossrs/srs:5
    container_name: srs
    ports:
      - "1935:1935"   # RTMP
      - "1985:1985"   # API
      - "8080:8080"   # Web 统计页面
    volumes:
      - ./conf/srs.conf:/usr/local/srs/conf/srs.conf:ro
    environment:
      - CANDIDATE=127.0.0.1

  rtmp-publisher:
    image: alfg/nginx-rtmp
    container_name: rtmp-publisher
    ports:
      - "1936:1935"
    depends_on:
      - srs
```

与 Compose 同级新建 `conf/srs.conf`，启用 API 与 DASH/FLV 输出：

```conf
listen              1935;
max_connections     1000;
http_api {
    enabled on;
    listen 1985;
}
http_server {
    enabled on;
    listen 8080;
    dir ./objs/nginx/html;
}
vhost __defaultVhost__ {
    gop_cache on;
    hls {
        enabled on;
        hls_path ./objs/nginx/html;
        hls_fragment 6;
    }
}
```

启动服务：

```bash
docker compose up -d
```

完成后访问 `http://localhost:8080` 可查看 SRS 监控页面。

## 推流验证

使用 FFmpeg 推送测试流：

```bash
ffmpeg -re -i demo.mp4 -c copy -f flv rtmp://localhost:1935/live/test
```

推流成功后，在 SRS 仪表盘的 Streams 章节可以看到在线流信息。

## Java 调用 SRS REST API

SRS 暴露 `http://localhost:1985/api/v1/streams` 等 REST 接口用于管理流和会话。以下示例展示了如何通过 Spring Boot 定时轮询当前在线流。

```java
@RestController
@RequestMapping("/srs")
public class SrsController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/streams")
    public List<SrsStream> listStreams() {
        String url = "http://localhost:1985/api/v1/streams";
        ResponseEntity<SrsStreamResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );
        return Optional.ofNullable(response.getBody())
                .map(SrsStreamResponse::getStreams)
                .orElse(Collections.emptyList());
    }
}
```

配套的响应实体：

```java
@Data
public class SrsStreamResponse {
    private Integer code;
    private List<SrsStream> streams;
}

@Data
public class SrsStream {
    private String id;
    private String name;
    private String vhost;
    private Integer clients;
}
```

> SRS API 返回 `code == 0` 表示成功。可结合推流状态实现异常告警、自动重试等能力。

## 常见问题

- **端口冲突**：确保本地 1935/1985/8080 未被占用，可在 Compose 中调整映射。
- **防火墙**：如部署在云服务器，需要开放对应端口供推流与播放。
- **多网卡机器**：设置 `CANDIDATE` 环境变量为公网 IP，保证 WebRTC 信令中发布正确地址。

## 总结

借助 Docker Compose 可以快速完成 SRS 单机部署，通过 Java 访问其 REST 接口可实现业务系统对直播流的监控与管理，适合中小规模的实时音视频场景。
