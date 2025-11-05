---
date: 2022/09/02 09:00:00
---
# 信息隐写溯源服务平台_Cs云服务接口文档

> 预计阅读时间：24 分钟

**简介**：

​		信息隐写云服务主要应用于企业、单位内部业务系统中电子文档的保护，云服务与这些业务系统无缝对接，对业务系统中的电子文档进行转换和隐写，在电子文档中嵌入不可视、无感知的隐写数据，用户在浏览、查看这些文档时，无感知，操作无变化。

​		通过隐写云服务处理的电子文档，具备有追踪溯源的能力，如果浏览这些文档时使用屏幕截屏、屏幕拍照、拷贝电子文件、打印成纸质文档等操作获取文档内容，这些文档内容被泄露时，通过对这些截屏图片、摄屏照片、电子文档、纸质文件的隐写数据提取，可以追溯到谁、什么时间、什么设备上取得的这些文档信息。

**联系人**:GuoYinInterface4j项目组

**Version**:版本号 2.0.1

**版本控制**

| 版本号 | 版本概要                                                     | 编者  | 时间       |
| ------ | ------------------------------------------------------------ | ----- | ---------- |
| V1.0.0 | Api文档初稿。概要编写概要接口                                | Ashin | 2023-1-04  |
| V1.0.1 | 修改请求数据类型                                             | Ashin | 2023-8-10  |
| V1.0.2 | 修改Json格式错误示例                                         | Ashin | 2023-11-16 |
| V2.0.1 | 云服务升级为四期隐写，去除"文件上传"、"文件嵌入"接口。 <br />并强制要求"文件上传并嵌入接口"的参数"outPutFileType" 为原版式文件的格式 | Ashin | 2023-12-25 |




[TOC]

# Cs云服务平台

## 前言

### 鉴权

**说明**：

​	本文档接口均采用**AccessKey(应用系统Key)和AccessSecret(应用系统秘钥)**进行接口鉴权。

​	在进行接口调试前请先联系**我方实施人员**让其提供AccessKey(应用系统Key)和AccessSecret(应用系统秘钥)。

**鉴权参数**

| 参数名称  | 参数说明               | 数据类型 | 备注                                                         |
| :-------- | ---------------------- | :------- | ------------------------------------------------------------ |
| accessKey | 应用系统Key            | string   | 应用系统唯一标志Key,由我方实施人员提供                       |
| nonce     | 单次请求唯一字符串标志 | string   | 单次请求唯一字符串标志，建议使用UUID；                       |
| timestamp | 时间戳                 | long     | 13位的**时间戳**，其精度是毫秒(ms)                           |
| sign      | 单次加密秘钥           | string   | **accessSecret**:应用系统秘钥,由我方实施人员提供<br />**sign**=**SecureUtil.md5**(accessKey+timestamp+nonce+accessSecret);<br />**SecureUtil.md5()**是[Hutool](https://www.hutool.cn/docs)提供的方法 |

**[sign]()(单次加密秘钥)的接口算法**

```java
    /**
     * accessKey : 应用系统唯一标志Key,由我方实施人员提供
     * timestamp : 13位的**时间戳**，其精度是毫秒(ms)
     * nonce : 单次请求唯一字符串标志，建议使用UUID
     * accessSecret : 应用系统秘钥,由我方实施人员提供
     */
	String accessKey ="asdasdasdassdad";
	String timestamp = 1234567890123;
	String nonce = "a1a1b2b2c3c3d4d4e5e5f6f6g7g7h8h8"
	String str = accessKey+timestamp+nonce+accessSecret;

	//将字符串进行MD5哈希加密
	String sign = SecureUtil.md5(str) //SecureUtil.md5()是[Hutool](https://www.hutool.cn/docs)提供的方法
```




## 文件上传并嵌入接口

**接口地址**:`[http|https]://[ip:port|域名]{/项目名}/api/cs/fileUploadAndEmbed`

**请求方式**:`POST`

**请求数据类型**:`multipart/form-data`

**响应数据类型**:`application/json`

**接口描述**:  调用该接口可生成嵌入用户信息的文件。

​					注意：该接口并发数远远低于"文件嵌入接口"

**请求参数**:


| 参数名称 | 参数说明 | 是否必须 | 数据类型 | 长度 | 备注 |
| -------- | -------- | -------- | -------- | ------ | -------- |
| accessKey           | 应用系统唯一标志Key    | true     | String   | 24   | 应用系统唯一标志Key,由我方实施人员提供 |
| timestamp           | 时间戳                 | true     | long  | 13   | 13位的[时间戳](https://so.csdn.net/so/search?q=时间戳&spm=1001.2101.3001.7020)，其精度是毫秒(ms)； |
| nonce               | 单次请求唯一字符串标志 | true     | String   | 32   | 单次请求唯一字符串标志 |
| sign                | 单次加密秘钥           | true     | String   | 32 | **accessSecret**:应用系统秘钥,由我方实施人员提供<br />**sign**=**SecureUtil.md5**(<br />accessKey+timestamp+nonce+accessSecret);<br />**SecureUtil.md5()**是[Hutool](https://www.hutool.cn/docs)提供的方法 |
| fileId              | 文件id。               | true     | String   | 64  | 文件上传接口所上上传的文件id。 |
| fileType            | 文件类型               | true     | String   | 32   | 文件类型，用于本地文件存储、文件转换判断 <br />原始文件的准确类型：pdf、ofd |
| userName            | 用户账号               | true     | string   | 50   | 用户id。用于确定用户的唯一标志， |
| userMainInfo        | 用户主信息             | true     | string   | 400  | json格式。用于填写用户的信息。<br />示例：用户名、手机号、住址、单位、部门等。 |
| operType            | 操作类型               | true     | String   | 1    | 1-下载文件 2-轻阅读网页浏览 |
| outPutFileType      | 文件输出格式           | true     | String   |      | pdf ofd   。要求：文件输出格式和文件上传格式相同 |
| visialWatermarkInfo | 明水印信息             | false    | Stirng   | 20   | 文档明水印信息，若未开启明水印授权，则不显示 |
| fileBytes           | 文件流                 | true     |          || 文件流 |

**响应参数**:


| 参数名称 | 参数说明     | 数据类型 | 备注 |
| -------- | ------------ | -------- | ---- |
| code     | 状态码       | string   |      |
| msg      | 提示信息     | string   |      |
| data     | 返回数据对象 | object   |      |

**响应示例**:

成功示例:

```javascript
{
    "code":"000000",
    "msg":"嵌入成功！",
    "data":"http://ip:port/wmFile/xxxxxx/test.pdf",
}
```


失败示例:

```javascript
{
    "code":"CS1011",
    "msg":"请求服务器处于停用或故障状态",
    "data":null,
}
```





# Cs云服务平台状态码


| 状态码 | 说明                                                         | schema |
| ------ | ------------------------------------------------------------ | ------ |
| 000000 | 成功                                                         |        |
| CS1001 | 应用系统信息不存在                                           |        |
| CS1002 | 应用系统账号授权已过期                                       |        |
| CS1003 | 应用系统处于停用状态                                         |        |
| CS1004 | IP非法访问                                                   |        |
| CS1005 | 应用系统鉴权失败—AccessKey鉴权失败                           |        |
| CS1006 | 应用系统鉴权失败—时间戳不匹配                                |        |
| CS1007 | 禁止重复访问，nonce必须保证唯一                              |        |
| CS1008 | 参数不正确                                                   |        |
| CS1009 | 服务授权不存在或已过期！                                     |        |
| CS1010 | 服务授权不存在或已过期,或用户使用数已超过授权数量！          |        |
| CS1011 | 请求服务器处于停用或故障状态                                 |        |
| CS1012 | 文件加密失败                                                 |        |
| CS1013 | 无法获取到文件Sha256                                         |        |
| CS1100 | wmsvc连接失败                                                |        |
| CS1101 | 原始文件不存在，请先上传原始文件                             |        |
| CS1102 | 该文件状态处于“异常文件”，请先处理异常文件！                 |        |
| CS1103 | 文件处理异常                                                 |        |
| CS1204 | 文件FileId和文件md5不相等。请传输正确的FileId或重新上传。    |        |
| CS1205 | 文件转换失败或超时，该文件已被定义为异常文件！               |        |
| CS1206 | 文件上传时尝试嵌入失败，该文件已被定义为异常文件！           |        |
| CS1301 | 内部嵌入异常                                                 |        |
| CS1312 | 内部嵌入异常2                                                |        |
| CS1313 | 内部嵌入异常3                                                |        |
| CS1314 | 内部嵌入异常4                                                |        |
| CS1401 | 文件转换服务器未配置                                         |        |
| CS9998 | 内部服务调用时异常，若多次调用后仍异常，请及时联系我方运维人员！ |        |
| CS9999 | 服务内部异常，请及时联系我方运维人员！                       |        |
| 999999 | 系统内部错误                                                 |        |
| 777777 | 请勿提交重复数据                                             |        |



# Cs云服务Api调用Demo

## Java调用Demo

**所需依赖：**

```java
// maven 
<!--hutool-all https://www.hutool.cn/-->
<dependency>
       <groupId>cn.hutool</groupId>
       <artifactId>hutool-all</artifactId>
       <version>5.8.6</version>    //对版本要求不高
 </dependency>
```



**代码：**

```java
package com.guoyin.demo;

import cn.hutool.core.date.StopWatch;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.lang.Console;
import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONUtil;

import java.io.File;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * @ClassName GY_ISTSP_CSIS_ApiDemo
 * @Description TODO
 * @Author AshinZhang
 * @Date 2023/10/27 10:14
 * @Version 1.0
 * Depends {@link cn.hutool.Hutool}.
 *         <dependency>
 *             <groupId>cn.hutool</groupId>
 *             <artifactId>hutool-all</artifactId>
 *             <version>5.8.6</version>
 *         </dependency>
 */
public class GY_CsIsApiDemo {
    
    private static final String CSIS_API_URL = "http://suyuan.gohiding.cn:8081/guoyin-cs-interface4j";
    private static final String CSIS_API_ADDRESS_NEWFILEUPLOAD = "/api/cs/newFileUpload";
    private static final String CSIS_API_ADDRESS_FILEEMBED = "/api/cs/fileEmbed";
    private static final String CSIS_API_ADDRESS_FILEUPLOADANDEMBED = "/api/cs/fileUploadAndEmbed";

    // 应用系统AccessKey.由我方实施人员提供。
    private static final String accessKey = "fgfdgfjdkg232s";
    // 应用系统AccessSecret.由我方实施人员提供。
    private static final String accessSecret = "90c863e3fc2b5b48204adeb48f22e0d9";


    public static void main(String[] args) {
        StopWatch stopWatch = new StopWatch("CsIs调用demo");

        File file = new File("C:\\Users\\Dell\\Documents\\可嵌入\\2.pdf");

        stopWatch.start("文件上传接口");
        newFileUpload(file);
        stopWatch.stop();

        stopWatch.start("文件嵌入接口");
        fileEmbed(file);
        stopWatch.stop();

        stopWatch.start("文件上传并嵌入接口接口");
        fileUpadloadAndEmbed(file);
        stopWatch.stop();

        Console.log("消耗时间: {}",stopWatch.prettyPrint(TimeUnit.MILLISECONDS));
    }


    /**
     * 文件上传接口
     *
     * @param file
     */
    private static void newFileUpload(File file) {
        //时间戳
        String timestamp = String.valueOf(new Date().getTime());
        //单次请求唯一字符串标志
        String nonce = IdUtil.simpleUUID();

        String result = HttpUtil.createPost(CSIS_API_URL + CSIS_API_ADDRESS_NEWFILEUPLOAD)
                .form("accessKey", accessKey)
                .form("nonce", nonce)
                .form("timestamp", timestamp)
                .form("sign", SecureUtil.md5(accessKey + timestamp + nonce + accessSecret))
                .form("fileId", SecureUtil.sha256(file))
                .form("fileType", FileUtil.getSuffix(file.getName()))
                .form("fileInfo", JSONUtil.createObj().set("文件名", file.getName()).set("文件大小", FileUtil.size(file)).set("密级", "秘密").toString())
                .form("fileBytes", file)
                .execute().body();
        Console.log("请求接口{},结果为:{}", CSIS_API_ADDRESS_NEWFILEUPLOAD, result);
    }

    /**
     * 文件嵌入接口
     *
     * @param file
     */
    private static void fileEmbed(File file) {
        //时间戳
        String timestamp = String.valueOf(new Date().getTime());
        //单次请求唯一字符串标志
        String nonce = IdUtil.simpleUUID();

        String result = HttpUtil.createPost(CSIS_API_URL + CSIS_API_ADDRESS_FILEEMBED)
                .body(JSONUtil.createObj()
                        .set("accessKey", accessKey)
                        .set("nonce", nonce)
                        .set("timestamp", timestamp)
                        .set("sign", SecureUtil.md5(accessKey + timestamp + nonce + accessSecret))
                        .set("fileId", SecureUtil.sha256(file))
                        .set("userName", "张三"+IdUtil.nanoId(3))
                        .set("userMainInfo", JSONUtil.createObj().set("性别", "男").set("联系方式", "13213213213").toString())
                        .set("operType", OperType.DOWNLOAD_FILE.code)
                        .set("outPutFileType", FileUtil.getSuffix(file.getName()))
                        .set("visialWatermarkInfo", "").toString()
                )
                .execute().body();

        Console.log("请求接口{},结果为：{}", CSIS_API_ADDRESS_FILEEMBED, result);
    }

    /**
     * 文件上传并嵌入接口
     *
     * @param file
     */
    private static void fileUpadloadAndEmbed(File file) {

        //时间戳
        String timestamp = String.valueOf(new Date().getTime());
        //单次请求唯一字符串标志
        String nonce = IdUtil.simpleUUID();

        String result = HttpUtil.createPost(CSIS_API_URL + CSIS_API_ADDRESS_FILEUPLOADANDEMBED)
                .form("accessKey", accessKey)
                .form("nonce", nonce)
                .form("timestamp", timestamp)
                .form("sign", SecureUtil.md5(accessKey + timestamp + nonce + accessSecret))
                .form("fileId", SecureUtil.sha256(file))
                .form("fileType", FileUtil.getSuffix(file.getName()))
                .form("userName", "张三"+IdUtil.nanoId(3))
                .form("userMainInfo", JSONUtil.createObj().set("性别", "男").set("联系方式", "13213213213").toString())
                .form("operType", OperType.DOWNLOAD_FILE.code)
                .form("outPutFileType", FileUtil.getSuffix(file.getName()))
                .form("visialWatermarkInfo", "明水印")
                .form("fileBytes", file)
                .execute().body();
        Console.log("请求接口{},结果为：{}", CSIS_API_ADDRESS_FILEUPLOADANDEMBED, result);
    }

    public enum OperType {

        /**
         * 下载文件
         */
        DOWNLOAD_FILE("1"),

        /**
         * 轻阅读
         */
        HTML_READ("2");
        
        private final String code;

        OperType(String code) {
            this.code = code;
        }
    }
}
```
