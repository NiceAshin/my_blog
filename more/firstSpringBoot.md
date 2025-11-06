---
date: 2025-07-14 23:33:51
---

> 预计阅读时间：41 分钟

**完整的 Spring Boot + Vue3 + Element Plus** 的项目实现，包括：

- 使用 IntelliJ IDEA 创建 Spring Boot 项目
- 集成 MySQL
- 实现日志按时间、模块分类（使用 Logback）
- 提供完整的 Controller、Service、Mapper（使用 MyBatis-Plus）
- 使用 Vue3 + Vite + Element Plus 实现前端
- 前端使用 Axios 调用后端接口
- 实现图片上传与展示

------

## ✅ 一、后端：Spring Boot 项目搭建（IDEA）

### 1. 创建 Spring Boot 项目（使用 IDEA）

1. 打开 IntelliJ IDEA
2. 选择 `New Project` → `Spring Initializr`
3. 填写项目信息：
   - Group: `com.example`
   - Artifact: `demo`
   - Name: `demo`
   - Packaging: `Jar`
   - Java Version: `17`（或 8/11）
4. 添加依赖：
   - Spring Web
   - Spring Data JPA 或 MyBatis Framework（我们选 **MyBatis Plus**）
   - MySQL Driver
   - Lombok
   - DevTools（可选）

> 注意：MyBatis Plus 不在默认选项中，需手动添加依赖。

------

### 2. `pom.xml` 依赖配置（关键部分）

xml深色版本

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.2</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>

        <!-- MyBatis Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.6</version>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- DevTools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.springframework.boot</groupId>
                            <artifactId>spring-boot-configuration-processor</artifactId>
                        </exclude>
                    </excludes>
                    <image>
                        <builder>paketobuildpacks/builder-jammy-base:latest</builder>
                    </image>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

------

### 3. 配置 `application.yml`

yaml深色版本

```
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

# MyBatis Plus 配置
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 日志配置（Logback）
logging:
  config: classpath:logback-spring.xml
```

------

### 4. 创建数据库和表（MySQL）

sql深色版本

```
CREATE DATABASE demo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE demo_db;

CREATE TABLE image_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    module VARCHAR(50) NOT NULL, -- 模块分类，如 avatar, product 等
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

------

### 5. 实体类 `ImageInfo.java`

java深色版本

```
package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("image_info")
public class ImageInfo {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String filename;
    private String filepath;
    private String module;
    private LocalDateTime uploadTime;
}
```

------

### 6. Mapper 接口

java深色版本

```
package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.ImageInfo;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ImageInfoMapper extends BaseMapper<ImageInfo> {
}
```

------

### 7. Service 接口与实现

java深色版本

```
// Service 接口
package com.example.demo.service;

import com.example.demo.entity.ImageInfo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {
    ImageInfo uploadImage(MultipartFile file, String module) throws Exception;
    List<ImageInfo> getImagesByModule(String module);
}
```

java深色版本

```
// Service 实现
package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.ImageInfo;
import com.example.demo.mapper.ImageInfoMapper;
import com.example.demo.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ImageServiceImpl extends ServiceImpl<ImageInfoMapper, ImageInfo> implements ImageService {

    private static final Logger logger = LoggerFactory.getLogger("ImageModuleLogger");

    @Value("${upload.path:/uploads/}")
    private String uploadPath;

    @Override
    public ImageInfo uploadImage(MultipartFile file, String module) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件为空");
        }

        // 按模块和时间创建目录
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path moduleDir = Paths.get(uploadPath, module, dateDir);
        Files.createDirectories(moduleDir);

        String originalFilename = file.getOriginalFilename();
        String fileName = System.currentTimeMillis() + "_" + originalFilename;
        Path filePath = moduleDir.resolve(fileName);

        file.transferTo(filePath.toFile());

        // 保存到数据库
        ImageInfo imageInfo = new ImageInfo();
        imageInfo.setFilename(originalFilename);
        imageInfo.setFilepath("/uploads/" + module + "/" + dateDir + "/" + fileName);
        imageInfo.setModule(module);
        imageInfo.setUploadTime(LocalDateTime.now());

        this.save(imageInfo);

        // 记录日志（按模块分类）
        logger.info("[模块:{}] 上传图片: {}, 路径: {}", module, originalFilename, filePath);

        return imageInfo;
    }

    @Override
    public List<ImageInfo> getImagesByModule(String module) {
        return lambdaQuery().eq(ImageInfo::getModule, module).list();
    }
}
```

------

### 8. Controller

java深色版本

```
package store.ashin.ashin_demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import store.ashin.ashin_demo.domain.po.ImageInfo;
import store.ashin.ashin_demo.service.ImageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageInfoController {

    @Value("${upload.path:/uploads/}")
    private String uploadPath;

    @Autowired
    private ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("module") String module) {
        try {
            ImageInfo info = imageService.uploadImage(file, module);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<ImageInfo>> getImages(@RequestParam String module) {
        List<ImageInfo> images = imageService.getImagesByModule(module);
        return ResponseEntity.ok(images);
    }
    @GetMapping("/view")
    public ResponseEntity<Resource> viewImage(
            @RequestParam String module,
            @RequestParam String filepath) {

        // 构建文件路径：D:/uploads/avatar/2025/07/31/filename.svg
        Path path = Paths.get(uploadPath,filepath);

        Resource resource;
        try {
            resource = new UrlResource(path.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        // 推断 Content-Type
        String contentType = null;
        try {
            contentType = Files.probeContentType(path);
        } catch (IOException e) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}

```

------

### 9. 日志配置：`src/main/resources/logback-spring.xml`

xml深色版本

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_PATH" value="./logs"/>

    <!-- 控制台输出 -->
    <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 按模块分类的日志文件（如 image-module.log） -->
    <appender name="ImageModuleFile" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/image-module.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/image-module.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 按时间滚动的总日志 -->
    <appender name="RollingFile" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 为特定 logger 指定 appender -->
    <logger name="ImageModuleLogger" level="INFO" additivity="false">
        <appender-ref ref="ImageModuleFile"/>
        <appender-ref ref="Console"/>
    </logger>

    <!-- 根日志器 -->
    <root level="INFO">
        <appender-ref ref="RollingFile"/>
        <appender-ref ref="Console"/>
    </root>
</configuration>
```

------

## ✅ 二、前端：Vue3 + Element Plus + Axios

### 1. 创建 Vue3 项目

bash深色版本

```
npm create vue@latest frontend
# 选择 Vue Router, Pinia, ESLint, Prettier
cd frontend
npm install element-plus axios
```

------

### 2. `src/components/ImageUpload.vue`

vue深色版本

```
<template>
  <div class="upload-container">
    <el-upload
      class="upload-box"
      action="/api/images/upload"
      :auto-upload="false"
      :on-change="handleChange"
      :file-list="fileList"
      :http-request="customUpload"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <el-button type="primary" @click="submitUpload" style="margin-top: 10px;">
      上传图片
    </el-button>

    <el-select v-model="module" placeholder="选择模块" style="margin-top: 10px;">
      <el-option label="头像" value="avatar" />
      <el-option label="商品" value="product" />
    </el-select>

    <div class="image-list" v-if="images.length > 0">
      <h3>已上传图片（{{ module }}）</h3>
      <el-image
        v-for="img in images"
        :key="img.id"
        :src="'http://localhost:8080' + img.filepath"
        :alt="img.filename"
        style="width: 150px; height: 150px; margin: 5px;"
        :preview-src-list="imageUrls"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([])
const module = ref('avatar')
const currentFile = ref(null)
const images = ref([])

// 自定义上传方法
const customUpload = ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', module.value)

  axios.post('http://localhost:8080/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  .then(res => {
    ElMessage.success('上传成功')
    loadImages()
  })
  .catch(err => {
    ElMessage.error('上传失败: ' + err.message)
  })
}

const handleChange = (file) => {
  currentFile.value = file.raw
}

const submitUpload = () => {
  if (!currentFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  customUpload({ file: currentFile.value })
}

// 获取图片列表
const loadImages = () => {
  axios.get(`http://localhost:8080/api/images/list?module=${module.value}`)
    .then(res => {
      images.value = res.data
    })
}

// 图片预览地址
const imageUrls = computed(() => {
  return images.value.map(img => 'http://localhost:8080' + img.filepath)
})

// 初始化加载
loadImages()
</script>

<style scoped>
.upload-container {
  padding: 20px;
}
.image-list {
  margin-top: 20px;
}
</style>
```

------

### 3. `src/router/index.js`（简要）

js深色版本

```
import { createRouter, createWebHistory } from 'vue-router'
import ImageUpload from '../components/ImageUpload.vue'

const routes = [
  { path: '/', component: ImageUpload }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
```

------

### 4. `src/main.js`

js深色版本

```
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

------

## ✅ 三、运行项目

### 后端

1. 创建 `uploads` 目录（与项目同级或指定路径）
2. 启动 Spring Boot 应用
3. 访问 `http://localhost:8080`

### 前端

bash深色版本

```
cd frontend
npm run dev
```

访问 `http://localhost:5173`

------

## ✅ 四、功能演示

- 选择图片 → 选择模块（avatar/product）→ 点击上传
- 图片上传到 `uploads/avatar/2025/07/31/xxx.jpg`
- 数据库存入记录
- 日志写入 `logs/image-module.log` 和 `logs/app.log`
- 前端展示已上传图片并支持预览

------

## ✅ 五、注意事项

1. **CORS 跨域**：后端需添加跨域支持（开发环境）

java深色版本

```
// 文件：src/main/java/com/example/demo/config/CorsConfig.java
package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // 拦截的路径
                .allowedOriginPatterns("http://localhost:5173") // 允许的前端地址
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

axios.defaults.withCredentials = true; // 全局设置

axios.get('http://localhost:8080/api/images/list', {
    params: { module: 'avatar' },
    withCredentials: true
})
```

1. **生产环境路径安全**：建议使用 Nginx 托管上传文件
2. **文件类型校验**：前端/后端都应校验图片类型

------

✅ **完成！**

你现在拥有一个完整的：
 **Spring Boot（日志分类 + MySQL + MyBatis Plus） + Vue3（Element Plus + Axios）** 的图片上传系统。

如需打包部署、Docker 化、Nginx 配置等，可继续提问。





```
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入默认主题样式

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```
