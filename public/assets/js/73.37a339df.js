(window.webpackJsonp=window.webpackJsonp||[]).push([[73],{635:function(a,v,t){"use strict";t.r(v);var _=t(13),s=Object(_.a)({},(function(){var a=this,v=a.$createElement,t=a._self._c||v;return t("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[t("h1",{attrs:{id:"类加载"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#类加载"}},[a._v("#")]),a._v(" 类加载")]),a._v(" "),t("p",[a._v("类加载器只负责class文件的加载, 至于是否可以运行, 由执行引擎决定,")]),a._v(" "),t("p",[a._v("加载后的类信息保存在方法区中, 方法区中运行时常量池中的数据也是从class文件的常量池中加载的")]),a._v(" "),t("h2",{attrs:{id:"类加载过程"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#类加载过程"}},[a._v("#")]),a._v(" 类加载过程")]),a._v(" "),t("ol",[t("li",[t("p",[a._v("loading(狭义上的,  加载过程中的第一个步骤)")]),a._v(" "),t("ol",[t("li",[a._v("通过一个类的全限定名获取这个类的二进制字节流")]),a._v(" "),t("li",[a._v("将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构")]),a._v(" "),t("li",[a._v("在内存中生成一个代表这个类的Class对象, 作为方法区中这个类的各种数据的访问入口")])]),a._v(" "),t("blockquote",[t("p",[a._v("加载可以是在本地磁盘, 网络, 压缩包, 运行时动态生产如动态代理, 其他文件生成, 如jsp. 等等")])])]),a._v(" "),t("li",[t("p",[a._v("链接")]),a._v(" "),t("ol",[t("li",[t("p",[a._v("验证\n确保class文件的字节流中包含信息符合当前虚拟机的要求, 保证类加载的正确性."),t("br"),a._v("\n验证包括"),t("br"),a._v("\n文件的格式验证"),t("br"),a._v("\n元数据验证"),t("br"),a._v("\n字节码验证"),t("br"),a._v("\n符号引用验证")])]),a._v(" "),t("li",[t("p",[a._v("准备")]),a._v(" "),t("p",[a._v("为静态变量分配内存并设置默认值. 但是不包括final修饰的静态变量, final修饰的会在编译成class时就分配了, 准备阶段会显示初始化.")])]),a._v(" "),t("li",[t("p",[a._v("解析")]),a._v(" "),t("p",[t("img",{attrs:{src:"http://image.ytg2097.com/code-ref.png",alt:"符号引用"}})]),a._v(" "),t("p",[a._v("解析是将常量池中的符号引用转换为直接引用的过程.\n符号引用是一组符号来描述所引用的目标. 符号引用的字面量形式明确定义在java虚拟机规范的class文件格式中.\n直接引用就是直接指向目标的指针, 相对偏移量或一个间接定位到目标的句柄.")])])])]),a._v(" "),t("li",[t("p",[a._v("初始化")]),a._v(" "),t("p",[a._v("初始化过程就是执行类构造器方法clinit的过程.")]),a._v(" "),t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"title"},[a._v("clinit")]),t("p",[a._v("clinit方法不需要定义, 他是javac编译器自动收集类中的所有静态变量的赋值动作和静态代码块中的语句合并而来的, clinit中的指令按照语句在源文件中出现的顺序执行")]),a._v(" "),t("p",[a._v("如果没有静态变量和静态代码块, clinit方法也不会出现")]),a._v(" "),t("p",[a._v("子类的clinit执行之前会先执行父类的clinit")]),a._v(" "),t("p",[a._v("多线程执行clinit会被同步加锁")])])])]),a._v(" "),t("h2",{attrs:{id:"类加载器"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#类加载器"}},[a._v("#")]),a._v(" 类加载器")]),a._v(" "),t("p",[a._v("类加载器分为引导类加载器BootstrapClassLoader, 扩展类加载器 ExtClassLoader, 系统类加载器AppClassLoader,  用户自定义类加载器,")]),a._v(" "),t("p",[a._v("除BootstrapClassLoader, 其他加载器都是java编写.")]),a._v(" "),t("p",[a._v("我们编写的类默认是使用系统类加载器来进行加载的.")]),a._v(" "),t("hr"),a._v(" "),t("h3",{attrs:{id:"bootstrap"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#bootstrap"}},[a._v("#")]),a._v(" bootstrap")]),a._v(" "),t("p",[a._v("引导类加载器是c和c++编写嵌套在jvm内部, 他没有父加载器, 他还会加载Ext和App类加载器.")]),a._v(" "),t("p",[a._v("java核心类库使用引导类加载器加载, 如String")]),a._v(" "),t("p",[a._v("它用来加载java核心类库  JAVA_HOME/jre/lib/rt.jar, resources.jar或sun.boot.class.path路径下的类, 用于提供jvm自身需要的类")]),a._v(" "),t("p",[a._v("只加载java. javax. sun开头的类")]),a._v(" "),t("hr"),a._v(" "),t("h3",{attrs:{id:"ext"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#ext"}},[a._v("#")]),a._v(" ext")]),a._v(" "),t("hr"),a._v(" "),t("p",[a._v("classloader类的子类,  加载jre/lib/ext子目录下的类库")]),a._v(" "),t("h3",{attrs:{id:"app"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#app"}},[a._v("#")]),a._v(" app")]),a._v(" "),t("hr"),a._v(" "),t("p",[a._v("负责加载classpath或系统属性java.class.path指定路径下的类")]),a._v(" "),t("h2",{attrs:{id:"双亲委派"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#双亲委派"}},[a._v("#")]),a._v(" 双亲委派")]),a._v(" "),t("p",[a._v("如果一个类加载器收到了类加载的请求, 它不会立刻进行加载, 而是先委托给父类加载器去加载.")]),a._v(" "),t("p",[a._v("如果父类加载器还有父加载器, 就会递归到顶层的类加载器.")]),a._v(" "),t("p",[a._v("如果父类加载器可以完成类加载的任务就会成功返回, 否则子类才会自己去加载.")]),a._v(" "),t("p",[a._v("双亲委派可以避免类重复加载, 同时可以避免java核心类库API被 篡改, 即java开头, javax开头, sun开头的包下的类")]),a._v(" "),t("p",[a._v("类加载器的引用会作为类信息的一部分保存在方法区中")]),a._v(" "),t("hr"),a._v(" "),t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"title"},[a._v("判断class相同")]),t("ol",[t("li",[a._v("全限定相同")]),a._v(" "),t("li",[a._v("加载类的类加载器相同")])])])])}),[],!1,null,null,null);v.default=s.exports}}]);