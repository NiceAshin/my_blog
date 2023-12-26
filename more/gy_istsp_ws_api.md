# 信息隐写溯源服务平台_接口文档

**简介**:信息隐写溯源服务平台_接口文档

**联系人**:GuoYinInterface4j项目组

**Version**:1.0.3

**版本控制**

| 版本号 | 版本概要                                                     | 编者  | 时间       |
| ------ | ------------------------------------------------------------ | ----- | ---------- |
| V1.0.0 | Api文档初稿。概要编写概要接口                                | Ashin | 2021-1-04  |
| V1.0.1 | 用户隐写字体接口修改返回值（fontUrl） 、接口增加参数（oriFont） | Ashin | 2023-12-10 |
| V1.0.2 | 修改用户隐写字体接口。增加参数：oriName； 增加返回值fontUrl。 | Ashin | 2023-12-20 |
| V1.0.3 | 修改Api鉴权调用示例,使用Hutoll工具                           | Ashin | 2023-12-26 |





[TOC]

## 前言

### API鉴权说明

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




## 用户隐写字体接口


**接口地址**:`/api/ws/embedFont`


**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json`

**接口描述**:生成用户隐写字体库，并当生成成功后返回该字体的网络路径。


**请求示例**:


```javascript
{
  "accessKey": "fasdhkfahk47435423",
  "timestamp": 1702635666867,
  "nonce": "4e6380a415ef-4c03-8caa-7477e240032e",
  "sign": "ea66e812d2abf1548a26391e8f97062d",
  "userId": "ea66e812d2abf1548a26391e8f97062d",
  "userName": "张三",
  "userInfo":"{\"部门\":\"财务部\",\"密级\":\"机密\",\"手机号\":\"15868878568\"}",
  "fontName": "bjgy_msyh",
  "fontType": "woff"
}
```


**请求参数**:

| 参数名称  | 参数说明               | 是否必须 | 数据类型    | 备注                                                         |
| :-------- | ---------------------- | -------- | :---------- | ------------------------------------------------------------ |
| accessKey | 应用系统Key            | true     | string(32)  | 应用系统唯一标志Key,由我方实施人员提供                       |
| nonce     | 单次请求唯一字符串标志 | true     | string(32)  | 单次请求唯一字符串标志，建议使用UUID；                       |
| timestamp | 时间戳                 | true     | integer(13) | 13位的**时间戳**，其精度是毫秒(ms)                           |
| sign      | 单次加密秘钥           | true     | string(32)  | **accessSecret**:应用系统秘钥,由我方实施人员提供<br />**sign**=**SecureUtil.md5**(<br />accessKey+timestamp+nonce+accessSecret);<br />**SecureUtil.md5()**是[Hutool](https://www.hutool.cn/docs)提供的方法 |
| userId    | 用户唯一标识           | true     | string(200) | 用户唯一标识                                                 |
| userName  | 用户名                 | true     | string(200) | 用户姓名                                                     |
| userInfo  | 用户详细信息           | true     | string      | json格式。用于填写用户的信息。<br />示例：用户名、手机号、住址、单位、部门等。 |
| fontName  | 嵌入字体名称           | true     | string(15)  | 字体名。字典表:[隐写字体名称](#隐写字体名称[embed_front])    |
| fontType  | 嵌入字体格式           | true     | string(10)  | 字体格式。字典表:[字体格式](#字体格式[font_type])            |
| oriName   | 原始字体类别           | false    | string(10)  | 原始字体类别。字典表:[原始字体类别](#原始字体类别[ori_name])<br />若不填，则默认使用MINI |

**响应参数**:


| 参数名称           | 参数说明             | 数据类型 | 备注                                          |
| ------------------ | -------------------- | -------- | --------------------------------------------- |
| code               | 状态码               | string   |                                               |
| msg                | 提示信息             | string   |                                               |
| data               | 返回数据对象         | object   |                                               |
| fontUrl—defaultUrl | 字体路径，等同于data | string   | 返回文件存储服务默认路径，也可区分http、https |
| fontUrl—backupUrl  | 字体路径             | string   | 返回文件存储服务备用路径，也可区分http、https |

**响应示例**:

成功示例:

```javascript
{
	"msg": "字体隐写成功!",
	"code": "000000",
	"data": "http://192.168.16.193:90/ws-wmfonts/000000000000000100/bjgy_pf.woff",
	"fontUrl": {
		"defaultUrl": "http://192.168.16.193:90/ws-wmfonts/000000000000000100/bjgy_pf.woff",
		"backupUrl": "http://192.168.16.193:90/ws-wmfonts/000000000000000100/bjgy_pf.woff"
	}
}
```


失败示例:

```javascript
{
    "code":"WS1010",
    "msg":"服务授权不存在或已过期,或用户使用数已超过授权数量！",
    "data":null,
}
```



## 第三方获取明水印配置参数接口


**接口地址**:`/api/ws/getLightWaterMarkConfig`


**请求方式**:`POST`


**请求数据类型**:`application/json`

**响应数据类型**:`*/*`

**接口描述**:js生成明水印要获取的所有参数。


**请求示例**:


```javascript
{
  "accessKey": "",
  "nonce": "",
  "sign": "",
  "timestamp": 0
}
```


**请求参数**:

| 参数名称  | 参数说明               | 是否必须 | 数据类型    | 备注                                                         |
| :-------- | ---------------------- | -------- | :---------- | ------------------------------------------------------------ |
| accessKey | 应用系统Key            | true     | string      | 应用系统唯一标志Key,由我方实施人员提供                       |
| nonce     | 单次请求唯一字符串标志 | true     | string      | 单次请求唯一字符串标志，建议使用UUID；                       |
| timestamp | 时间戳                 | true     | integer(64) | 13位的**时间戳**，其精度是毫秒(ms)                           |
| sign      | 单次加密秘钥           | true     | string      | **accessSecret**:应用系统秘钥,由我方实施人员提供<br />**sign**=**md5Hex**(accessKey+timestamp+nonce+accessSecret); |

**响应参数**:


| 参数名称 | 参数说明     | 数据类型 | 备注 |
| -------- | ------------ | -------- | ---- |
| code     | 状态码       | string   |      |
| msg      | 提示信息     | string   |      |
| data     | 返回数据对象 | object   |      |



# 字典表

## 隐写字体名称[embed_front]

| key        | value         |
| ---------- | ------------- |
| 微软雅黑   | bjgy_msyh     |
| 楷体       | bjgy_simkai   |
| 楷体gb2312 | bjgy_ktgb2312 |
| 黑体       | bjgy_simhei   |
| 宋体       | bjgy_simsun   |
| 仿宋       | bjgy_simfang  |
| 仿宋gb2312 | bjgy_fsgb2312 |
| 方正仿宋   | bjgy_fzfs     |
| 萍方       | bjgy_pf       |

## 字体格式[font_type]

| key            | value |
| -------------- | ----- |
| ttf            | ttf   |
| woff           | woff  |
| ttc [不支持]   | ttc   |
| woff2 [不支持] | woff2 |
| eot [不支持]   | eot   |
| otf [不支持]   | otf   |
| svg [不支持]   | svg   |

## 原始字体类别原始字体类别[ori_name]

| key                                   | value  |
| ------------------------------------- | ------ |
| 全量字体  (适用于编辑器等)            | ALL    |
| MINI字体 （适用于网页隐写，加快速度） | MINI   |
| 用户自定义字体 （第三方用户的字体）   | USRDEF |



# 状态码


| 状态码 | 说明                                                | schema |
| ------ | --------------------------------------------------- | ------ |
| 000000 | 成功                                                |        |
| WS1001 | 应用系统信息不存在                                  |        |
| WS1002 | 应用系统账号授权已过期                              |        |
| WS1003 | 应用系统处于停用状态                                |        |
| WS1004 | IP非法访问                                          |        |
| WS1005 | 应用系统鉴权失败—AccessKey鉴权失败                  |        |
| WS1006 | 应用系统鉴权失败—时间戳不匹配                       |        |
| WS1007 | 禁止重复访问，nonce必须保证唯一                     |        |
| WS1008 | 参数不正确                                          |        |
| WS1009 | 服务授权不存在或已过期！                            |        |
| WS1010 | 服务授权不存在或已过期,或用户使用数已超过授权数量！ |        |
| WS1100 | wmfsvc连接失败                                      |        |
| WS1301 | 嵌入失败                                            |        |
| 999999 | 系统内部错误                                        |        |

# 网页Api调用Demo

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

```

```

