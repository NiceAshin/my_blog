(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{429:function(s,a,t){"use strict";t.r(a);var n=t(2),e=Object(n.a)({},(function(){var s=this,a=s._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"使用docker-buildx构架多架构镜像"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用docker-buildx构架多架构镜像"}},[s._v("#")]),s._v(" 使用Docker buildx构架多架构镜像")]),s._v(" "),a("p",[s._v("新入手了一台arm架构的mbp，在打包镜像发布到公司的容器云平台时遇到了兼容性问题，特记录一下解决方法。")]),s._v(" "),a("p",[s._v("查看容器日志得到以下错误")]),s._v(" "),a("blockquote",[a("p",[s._v("standard_init_linux.go:228: exec user process caused: exec format error")])]),s._v(" "),a("p",[s._v("查看镜像信息")]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("yangtg@dce-10-20-24-11 ~"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("$ "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" inspect 84a1\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("\n\t\t\t\t"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n        "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Architecture"')]),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"arm64"')]),s._v(",\n        "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Os"')]),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"linux"')]),s._v(",\n\t\t\t\t"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br")])]),a("p",[s._v("镜像的系统架构为arm64，而k8s集群为amd64。原因找到，修改镜像架构为amd即可。")]),s._v(" "),a("hr"),s._v(" "),a("h4",{attrs:{id:"前言"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#前言"}},[s._v("#")]),s._v(" 前言")]),s._v(" "),a("p",[s._v("大部分发行镜像一个标签下都会存在多个不同架构的镜像版本， 比如openjdk，就同时存在amd与arm两个版本镜像。")]),s._v(" "),a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/NiceAshin/FileStore/blogImage/image-20211222163506210.jpeg"}}),s._v(" "),a("p",[s._v("在执行"),a("code",[s._v("docker pull")]),s._v("或"),a("code",[s._v("docker run")]),s._v("时， docker会自动根据当前系统架构去拉取相同架构的镜像。")]),s._v(" "),a("hr"),s._v(" "),a("h4",{attrs:{id:"使用docker-buildx"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用docker-buildx"}},[s._v("#")]),s._v(" 使用Docker buildx")]),s._v(" "),a("p",[s._v("那么我们如何去构建多架构的镜像呢？")]),s._v(" "),a("p",[s._v("默认的"),a("code",[s._v("docker build")]),s._v(" 是不支持构架跨平台镜像的，但在 Docker 19.03+ 版本中可以使用 "),a("code",[s._v("docker buildx build")]),s._v(" 命令使用 "),a("code",[s._v("BuildKit")]),s._v(" 构建镜像。该命令支持 "),a("code",[s._v("--platform")]),s._v(" 参数可以同时构建支持多种系统架构的 Docker 镜像。使用"),a("code",[s._v("docker buildx build")]),s._v("命令的"),a("code",[s._v("--platform")]),s._v("参数可以指定要构建哪种架构的镜像。")]),s._v(" "),a("p",[s._v("在macOS，windows，和linux发行版的docker中都内置了"),a("code",[s._v("docker buildx")]),s._v("，不需要再重新安装。")]),s._v(" "),a("p",[s._v("由于docker默认的builder实例默认不支持同时指定多个"),a("code",[s._v("--platform")]),s._v("， 所以首先需要创建一个builder实例。")]),s._v(" "),a("blockquote",[a("p",[s._v("创建builder实例")])]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("ytg@yangtonggangdeMacBook-Pro bin % "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" buildx create "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--use")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--name")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("mutil-platform-builder \nmutil-platform-builder\nytg@yangtonggangdeMacBook-Pro bin % "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" buildx "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ls")]),s._v("\nNAME/NODE                 DRIVER/ENDPOINT             STATUS   PLATFORMS\nmutil-platform-builder *  docker-container\n  mutil-platform-builder0 unix:///var/run/docker.sock inactive\ndesktop-linux             "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v("\n  desktop-linux           desktop-linux               running  linux/arm64, linux/amd64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6\ndefault                   "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v("\n  default                 default                     running  linux/arm64, linux/amd64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6\nytg@yangtonggangdeMacBook-Pro bin % "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" buildx use mutil-platform-builder\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])]),a("h4",{attrs:{id:"测试"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#测试"}},[s._v("#")]),s._v(" 测试")]),s._v(" "),a("p",[s._v("写一个简单的helloworld测试一下， 代码如下：")]),s._v(" "),a("blockquote",[a("p",[s._v("Main.go")])]),s._v(" "),a("div",{staticClass:"language-go line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-go"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("package")]),s._v(" main\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("import")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"fmt"')]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"runtime"')]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("func")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("main")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        fmt"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Println")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Hello world!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n        fmt"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("Printf")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Running in [%s] architecture.\\n"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" runtime"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("GOARCH"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])]),a("blockquote",[a("p",[s._v("Dockerfile")])]),s._v(" "),a("div",{staticClass:"language-dockerfile line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[a("code",[a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token options"}},[a("span",{pre:!0,attrs:{class:"token property"}},[s._v("--platform")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("$BUILDPLATFORM")])]),s._v(" golang:1.17 "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("as")]),s._v(" builder")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ARG")]),s._v(" TARGETARCH")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WORKDIR")]),s._v(" /app")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" main.go /app/main.go")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" GOOS=linux GOARCH="),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("$TARGETARCH")]),s._v(" go build -a -o output/main main.go")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" alpine:latest")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WORKDIR")]),s._v(" /root")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token options"}},[a("span",{pre:!0,attrs:{class:"token property"}},[s._v("--from")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("builder")])]),s._v(" /app/output/main .")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token instruction"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("CMD")]),s._v(" /root/main")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br")])]),a("p",[s._v("打包镜像")]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("ytg@yangtonggangdeMacBook-Pro GolandProjects % "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" buildx build "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--platform")]),s._v(" linux/arm64,linux/amd64 "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-t")]),s._v(" ytg2097/buildx-test:0.1 "),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v("\nWARN"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("0000"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" No output specified "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("for")]),s._v(" docker-container driver. Build result will only remain "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("in")]),s._v(" the build cache. To push result image into registry use "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--push")]),s._v(" or to load image into "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" use "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--load")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br")])]),a("p",[s._v("提示"),a("code",[s._v("No output specified for docker-container driver.")]),s._v("，之后"),a("code",[s._v("docker images")]),s._v("也没有刚刚打包的镜像，这是因为buildx会将"),a("code",[s._v("--platfrom")]),s._v("中指定的所有平台的构建结果合并为一个整体的镜像列表输出， 因此无法直接输出到本地的images里。")]),s._v(" "),a("p",[s._v("所以我们需要指定一个buildx的输出方式， buildx支持一下几种输出方式：")]),s._v(" "),a("ul",[a("li",[s._v("local：构建结果将以文件系统格式写入 "),a("code",[s._v("dest")]),s._v(" 指定的本地路径， 如 "),a("code",[s._v("--output type=local,dest=./output")]),s._v("。")]),s._v(" "),a("li",[s._v("tar：构建结果将在打包后写入 "),a("code",[s._v("dest")]),s._v(" 指定的本地路径。")]),s._v(" "),a("li",[s._v("oci：构建结果以 OCI 标准镜像格式写入 "),a("code",[s._v("dest")]),s._v(" 指定的本地路径。")]),s._v(" "),a("li",[s._v("docker：构建结果以 Docker 标准镜像格式写入 "),a("code",[s._v("dest")]),s._v(" 指定的本地路径或加载到 "),a("code",[s._v("docker")]),s._v(" 的镜像库中。同时指定多个目标平台时无法使用该选项。")]),s._v(" "),a("li",[s._v("image：以镜像或者镜像列表输出，并支持 "),a("code",[s._v("push=true")]),s._v(" 选项直接推送到远程仓库，同时指定多个目标平台时可使用该选项。")]),s._v(" "),a("li",[s._v("registry："),a("code",[s._v("type=image,push=true")]),s._v(" 的精简表示。")])]),s._v(" "),a("p",[s._v("这里我直接推送到我的镜像仓库中去， 完整的命令如下")]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" buildx build "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--platform")]),s._v(" linux/arm64,linux/amd64 "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-t")]),s._v(" ytg2097/buildx-test:0.1  "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-o")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("type")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("registry "),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br")])]),a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/NiceAshin/FileStore/blogImage/image-20211222172124018.png"}}),s._v(" "),a("hr"),s._v(" "),a("p",[s._v("打包之后到dockerhub查看刚刚push的镜像")]),s._v(" "),a("p",[a("img",{attrs:{src:"https://image.ytg2097.com/image-20211222172607971.png",alt:"image-20211222172607971"}})]),s._v(" "),a("p",[s._v("仓库中同时存在amd64和arm64架构的两个版本，pull或者run时可以指定sha256来拉取特定架构的镜像。")]),s._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--rm")]),s._v(" ytg2097/buildx-demo:0.1@sha256"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("e7c8f88eff9280ec107cf6b223c9982a87e387eef27b6c790a9264dec5d2928d\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br")])]),a("p",[s._v("也可以在本地通过"),a("code",[s._v("docker buildx imagetools inspect ytg2097/buildx-demo:0.1")]),s._v(" 查看")]),s._v(" "),a("p",[a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/NiceAshin/FileStore/blogImage/image-20211222173200369.png",alt:""}})]),s._v(" "),a("p",[a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/NiceAshin/FileStore/blogImage/image-20220714145919637.png",alt:"image-20220714145919637"}})])])}),[],!1,null,null,null);a.default=e.exports}}]);