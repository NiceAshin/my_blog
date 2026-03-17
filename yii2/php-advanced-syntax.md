---
title: PHP 高阶语法
date: 2026-03-17
tags:
  - PHP
  - 高阶语法
categories:
  - PHP
---

# PHP 高阶语法速查手册（PHP 5.6 及之前）

本文汇总 PHP 5.6 及之前版本的高阶语法和内置函数，适合 Java 开发者快速上手 PHP。

---

## 1. 数组高阶函数

### 1.1 array_column - 提取数组列

从多维数组中提取指定列，常用于数据库结果集处理。

```php
<?php
$users = [
    ['id' => 1, 'name' => 'Alice', 'age' => 25],
    ['id' => 2, 'name' => 'Bob', 'age' => 30],
    ['id' => 3, 'name' => 'Charlie', 'age' => 28],
];

// 提取 name 列
$names = array_column($users, 'name');
// ['Alice', 'Bob', 'Charlie']

// 提取 name 列，以 id 为键
$nameMap = array_column($users, 'name', 'id');
// [1 => 'Alice', 2 => 'Bob', 3 => 'Charlie']
```

**Java 对比**：
```java
// Java 8+ Stream 方式
List<String> names = users.stream()
    .map(u -> u.getName())
    .collect(Collectors.toList());

Map<Integer, String> nameMap = users.stream()
    .collect(Collectors.toMap(User::getId, User::getName));
```

---

### 1.2 array_map - 数组映射

对数组的每个元素应用回调函数。

```php
<?php
$numbers = [1, 2, 3, 4, 5];

// 每个元素平方
$squares = array_map(function($n) {
    return $n * $n;
}, $numbers);
// [1, 4, 9, 16, 25]

// 多数组操作
$a = [1, 2, 3];
$b = [4, 5, 6];
$sum = array_map(function($x, $y) {
    return $x + $y;
}, $a, $b);
// [5, 7, 9]
```

**Java 对比**：
```java
List<Integer> squares = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());
```

---

### 1.3 array_filter - 数组过滤

过滤数组，只保留满足条件的元素。

```php
<?php
$numbers = [1, 2, 3, 4, 5, 6];

// 过滤偶数
$evens = array_filter($numbers, function($n) {
    return $n % 2 === 0;
});
// [2, 4, 6]（注意：键保留原索引）

// 使用 ARRAY_FILTER_USE_KEY 访问键
$arr = ['a' => 1, 'b' => 2, 'c' => 3];
$filtered = array_filter($arr, function($key) {
    return $key !== 'b';
}, ARRAY_FILTER_USE_KEY);
// ['a' => 1, 'c' => 3]
```

**Java 对比**：
```java
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

---

### 1.4 array_reduce - 数组归约

将数组归约为单个值。

```php
<?php
$numbers = [1, 2, 3, 4, 5];

// 求和
$sum = array_reduce($numbers, function($carry, $item) {
    return $carry + $item;
}, 0);
// 15

// 构建关联数组
$pairs = [['a', 1], ['b', 2]];
$map = array_reduce($pairs, function($carry, $item) {
    $carry[$item[0]] = $item[1];
    return $carry;
}, []);
// ['a' => 1, 'b' => 2]
```

**Java 对比**：
```java
int sum = numbers.stream()
    .reduce(0, Integer::sum);

// 或
int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b);
```

---

### 1.5 array_walk - 数组遍历

遍历数组并修改元素（引用传递）。

```php
<?php
$fruits = ['apple', 'banana', 'orange'];

// 修改每个元素
array_walk($fruits, function(&$value, $key) {
    $value = strtoupper($value);
});
// ['APPLE', 'BANANA', 'ORANGE']

// 带用户数据
$prefix = 'fruit_';
array_walk($fruits, function(&$value, $key, $prefix) {
    $value = $prefix . $value;
}, $prefix);
// ['fruit_APPLE', 'fruit_BANANA', 'fruit_ORANGE']
```

**Java 对比**：
```java
// Java 需要使用 for 循环或替换为 Stream
List<String> result = fruits.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

---

### 1.6 array_merge vs array_replace

```php
<?php
// array_merge：合并数组，字符串键会被覆盖
$a = ['a' => 1, 'b' => 2];
$b = ['b' => 3, 'c' => 4];
$merged = array_merge($a, $b);
// ['a' => 1, 'b' => 3, 'c' => 4]

// 数字键会重新索引
$x = [0 => 'a', 1 => 'b'];
$y = [0 => 'c', 1 => 'd'];
$merged = array_merge($x, $y);
// [0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd']

// array_replace：替换元素，保留键
$replaced = array_replace($x, $y);
// [0 => 'c', 1 => 'd']
```

**Java 对比**：
```java
// 合并 Map
Map<String, Integer> merged = new HashMap<>(a);
merged.putAll(b);

// 或 Java 9+
Map<String, Integer> merged = Stream.of(a, b)
    .flatMap(m -> m.entrySet().stream())
    .collect(Collectors.toMap(
        Map.Entry::getKey,
        Map.Entry::getValue,
        (v1, v2) -> v2  // 冲突时取后者
    ));
```

---

### 1.7 array_flip - 键值互换

```php
<?php
$orig = ['a' => 1, 'b' => 2, 'c' => 3];
$flipped = array_flip($orig);
// [1 => 'a', 2 => 'b', 3 => 'c']
```

**Java 对比**：
```java
Map<V, K> flipped = original.entrySet().stream()
    .collect(Collectors.toMap(
        Map.Entry::getValue,
        Map.Entry::getKey
    ));
```

---

### 1.8 array_combine - 合并为关联数组

```php
<?php
$keys = ['name', 'age', 'city'];
$values = ['Alice', 25, 'Beijing'];
$result = array_combine($keys, $values);
// ['name' => 'Alice', 'age' => 25, 'city' => 'Beijing']
```

**Java 对比**：
```java
// Java 需要手动构建
Map<String, Object> result = new HashMap<>();
result.put("name", "Alice");
result.put("age", 25);
result.put("city", "Beijing");
```

---

### 1.9 array_chunk - 数组分块

```php
<?php
$numbers = [1, 2, 3, 4, 5, 6, 7];
$chunks = array_chunk($numbers, 3);
// [[1, 2, 3], [4, 5, 6], [7]]

// 保留原键
$chunks = array_chunk($numbers, 3, true);
// [[0 => 1, 1 => 2, 2 => 3], [3 => 4, 4 => 5, 5 => 6], [6 => 7]]
```

**Java 对比**：
```java
// Java 需要第三方库或手动实现
List<List<Integer>> chunks = IntStream.range(0, (numbers.size() + 2) / 3)
    .mapToObj(i -> numbers.subList(i * 3, Math.min((i + 1) * 3, numbers.size())))
    .collect(Collectors.toList());
```

---

### 1.10 array_slice - 数组切片

```php
<?php
$arr = ['a', 'b', 'c', 'd', 'e'];

// 从索引 2 开始取 2 个
$slice = array_slice($arr, 2, 2);
// ['c', 'd']

// 负数表示从末尾开始
$slice = array_slice($arr, -2);
// ['d', 'e']

// 保留键
$slice = array_slice($arr, 2, 2, true);
// [2 => 'c', 3 => 'd']
```

**Java 对比**：
```java
List<String> slice = arr.subList(2, 4);  // [c, d]
```

---

## 2. 数组排序函数

### 2.1 排序函数对比

| 函数 | 排序依据 | 键是否保留 | 排序顺序 |
|------|----------|-----------|----------|
| `sort()` | 值 | ❌ 重新索引 | 升序 |
| `rsort()` | 值 | ❌ 重新索引 | 降序 |
| `asort()` | 值 | ✅ 保留 | 升序 |
| `arsort()` | 值 | ✅ 保留 | 降序 |
| `ksort()` | 键 | ✅ 保留 | 升序 |
| `krsort()` | 键 | ✅ 保留 | 降序 |
| `usort()` | 自定义 | ❌ 重新索引 | 自定义 |
| `uasort()` | 自定义 | ✅ 保留 | 自定义 |
| `uksort()` | 自定义(键) | ✅ 保留 | 自定义 |

### 2.2 使用示例

```php
<?php
// 基础排序
$arr = [3, 1, 4, 1, 5, 9];
sort($arr);   // [1, 1, 3, 4, 5, 9]
rsort($arr);  // [9, 5, 4, 3, 1, 1]

// 关联数组排序（保留键）
$ages = ['Alice' => 25, 'Bob' => 30, 'Charlie' => 20];
asort($ages);   // 按值升序：['Charlie' => 20, 'Alice' => 25, 'Bob' => 30]
arsort($ages);  // 按值降序：['Bob' => 30, 'Alice' => 25, 'Charlie' => 20]
ksort($ages);   // 按键升序：['Alice' => 25, 'Bob' => 30, 'Charlie' => 20]

// 自定义排序
$users = [
    ['name' => 'Alice', 'age' => 25],
    ['name' => 'Bob', 'age' => 30],
    ['name' => 'Charlie', 'age' => 20],
];

usort($users, function($a, $b) {
    return $a['age'] <=> $b['age'];  // 按年龄升序
});
```

**Java 对比**：
```java
// Java 排序
List<Integer> list = Arrays.asList(3, 1, 4, 1, 5, 9);
Collections.sort(list);  // 升序
Collections.sort(list, Collections.reverseOrder());  // 降序

// 自定义排序
users.sort(Comparator.comparingInt(u -> u.getAge()));

// 或
users.sort((a, b) -> Integer.compare(a.getAge(), b.getAge()));
```

---

## 3. 字符串处理

### 3.1 常用字符串函数

```php
<?php
// 长度与查找
strlen('Hello');           // 5
strpos('Hello World', 'o'); // 4（首次出现位置）
strrpos('Hello World', 'o'); // 7（最后出现位置）

// 截取
substr('Hello World', 0, 5);  // 'Hello'
substr('Hello World', -5);    // 'World'
substr('Hello World', 2, -2); // 'llo Wor'

// 替换
str_replace('World', 'PHP', 'Hello World');  // 'Hello PHP'
str_replace(['a', 'b'], ['x', 'y'], 'abc');  // 'xyc'

// 大小写
strtoupper('hello');  // 'HELLO'
strtolower('HELLO');  // 'hello'
ucfirst('hello');     // 'Hello'（首字母大写）
ucwords('hello world'); // 'Hello World'（每个单词首字母大写）

// 去除空白
trim('  hello  ');    // 'hello'
ltrim('  hello  ');   // 'hello  '
rtrim('  hello  ');   // '  hello'

// 分割与连接
explode(',', 'a,b,c');     // ['a', 'b', 'c']
implode('-', ['a', 'b']);  // 'a-b'

// 填充
str_pad('5', 3, '0', STR_PAD_LEFT);  // '005'
str_repeat('ab', 3);                  // 'ababab'
```

**Java 对比**：
```java
// 长度与查找
"Hello".length();                    // 5
"Hello World".indexOf("o");          // 4
"Hello World".lastIndexOf("o");      // 7

// 截取
"Hello World".substring(0, 5);       // "Hello"

// 替换
"Hello World".replace("World", "PHP");

// 大小写
"hello".toUpperCase();
"HELLO".toLowerCase();

// 去除空白
"  hello  ".trim();

// 分割与连接
"a,b,c".split(",");
String.join("-", Arrays.asList("a", "b"));

// 填充
String.format("%03d", 5);  // "005"
```

---

### 3.2 正则表达式

```php
<?php
// 匹配
preg_match('/\d+/', 'abc123def', $matches);
// $matches[0] = '123'

// 全局匹配
preg_match_all('/\d+/', 'a1b23c456', $matches);
// $matches[0] = ['1', '23', '456']

// 替换
$result = preg_replace('/\d+/', '#', 'a1b23c');
// 'a#b#c'

// 分割
$parts = preg_split('/[,;]/', 'a,b;c');
// ['a', 'b', 'c']
```

**Java 对比**：
```java
// 匹配
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher("abc123def");
if (m.find()) {
    String match = m.group();  // "123"
}

// 替换
"abc123def".replaceAll("\\d+", "#");
```

---

## 4. 回调与闭包

### 4.1 回调函数

```php
<?php
// 匿名函数
$greet = function($name) {
    return "Hello, $name!";
};
echo $greet('World');  // Hello, World!

// 使用变量（use 关键字）
$message = 'Hello';
$greet = function($name) use ($message) {
    return "$message, $name!";
};

// 引用传递
$counter = 0;
$increment = function() use (&$counter) {
    $counter++;
};
$increment();  // $counter = 1

// 作为回调
$numbers = [1, 2, 3, 4, 5];
$squares = array_map(function($n) {
    return $n * $n;
}, $numbers);
```

**Java 对比**：
```java
// Lambda 表达式
Function<String, String> greet = name -> "Hello, " + name + "!";
greet.apply("World");

// 使用外部变量（effectively final）
String message = "Hello";
Function<String, String> greet = name -> message + ", " + name + "!";

// 作为回调
List<Integer> squares = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());
```

---

### 4.2 callable 类型提示

```php
<?php
function process(array $data, callable $callback) {
    return array_map($callback, $data);
}

// 匿名函数
process([1, 2, 3], function($x) { return $x * 2; });

// 函数名
process([1, 2, 3], 'strtoupper');

// 静态方法
class Math {
    public static function double($x) {
        return $x * 2;
    }
}
process([1, 2, 3], ['Math', 'double']);

// 实例方法
$obj = new Math();
process([1, 2, 3], [$obj, 'double']);
```

**Java 对比**：
```java
// 函数式接口
List<Integer> process(List<Integer> data, Function<Integer, Integer> callback) {
    return data.stream().map(callback).collect(Collectors.toList());
}

// Lambda
process(Arrays.asList(1, 2, 3), x -> x * 2);

// 方法引用
process(Arrays.asList(1, 2, 3), Math::double);
```

---

## 5. 类型系统

### 5.1 类型提示（PHP 5.0+）

```php
<?php
// 标量类型提示（PHP 5.1+ 数组，PHP 5.4+ callable）
function process(array $data, callable $callback) {
    return $callback($data);
}

// 类类型提示
function save(User $user) {
    // $user 必须是 User 实例
}

// 接口类型提示
function log(LoggerInterface $logger) {
    // $logger 必须实现 LoggerInterface
}

// NULL 默认值
function greet($name = null) {
    return $name ? "Hello, $name!" : "Hello!";
}
```

**Java 对比**：
```java
// Java 天然支持类型系统
void process(List<?> data, Function<?, ?> callback) { }

void save(User user) { }

void log(Logger logger) { }
```

---

### 5.2 类型约束与严格模式（PHP 5.6）

```php
<?php
// PHP 5.6 不支持严格模式，但支持类型提示
class User {
    private $name;
    private $age;

    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }

    public function getName() {
        return $this->name;
    }
}

// instanceof 检查
$user = new User('Alice', 25);
if ($user instanceof User) {
    echo $user->getName();
}
```

---

## 6. 魔术方法

### 6.1 常用魔术方法

```php
<?php
class Magic {
    private $data = [];

    // 构造函数
    public function __construct($data = []) {
        $this->data = $data;
    }

    // 析构函数
    public function __destruct() {
        echo "Object destroyed";
    }

    // 访问不存在的属性
    public function __get($name) {
        return $this->data[$name] ?? null;
    }

    // 设置不存在的属性
    public function __set($name, $value) {
        $this->data[$name] = $value;
    }

    // 检查不存在的属性
    public function __isset($name) {
        return isset($this->data[$name]);
    }

    // 销毁不存在的属性
    public function __unset($name) {
        unset($this->data[$name]);
    }

    // 调用不存在的方法
    public function __call($name, $arguments) {
        echo "Calling $name with: " . implode(', ', $arguments);
    }

    // 调用不存在的静态方法
    public static function __callStatic($name, $arguments) {
        echo "Static call: $name";
    }

    // 对象转字符串
    public function __toString() {
        return json_encode($this->data);
    }

    // 对象作为函数调用
    public function __invoke($x) {
        return $x * 2;
    }

    // 克隆时调用
    public function __clone() {
        $this->data = [];
    }
}

// 使用示例
$obj = new Magic(['a' => 1]);
echo $obj->a;      // 1（触发 __get）
$obj->b = 2;       // 触发 __set
$obj->foo(1, 2);   // 触发 __call
echo $obj;         // 触发 __toString
echo $obj(10);     // 20（触发 __invoke）
$obj2 = clone $obj; // 触发 __clone
```

**Java 对比**：
```java
// Java 没有魔术方法，但可以用类似模式

// __get/__set → Map 或动态代理
public class Magic {
    private Map<String, Object> data = new HashMap<>();

    public Object get(String name) {
        return data.get(name);
    }

    public void set(String name, Object value) {
        data.put(name, value);
    }
}

// __toString → toString()
@Override
public String toString() {
    return data.toString();
}

// __invoke → 函数式接口
@FunctionalInterface
interface Invokable {
    int invoke(int x);
}

// 动态代理
Object proxy = Proxy.newProxyInstance(
    classLoader,
    new Class<?>[]{SomeInterface.class},
    (obj, method, args) -> {
        // 类似 __call
        return null;
    }
);
```

---

## 7. 异常处理

### 7.1 异常层级

```php
<?php
try {
    // 可能抛出异常的代码
    throw new InvalidArgumentException("Invalid argument");
} catch (InvalidArgumentException $e) {
    echo "Invalid argument: " . $e->getMessage();
} catch (RuntimeException $e) {
    echo "Runtime error: " . $e->getMessage();
} catch (Exception $e) {
    echo "General error: " . $e->getMessage();
} finally {
    echo "Cleanup";
}

// 自定义异常
class UserNotFoundException extends Exception {
    public function __construct($userId) {
        parent::__construct("User with ID $userId not found");
    }
}
```

**Java 对比**：
```java
try {
    throw new IllegalArgumentException("Invalid argument");
} catch (IllegalArgumentException e) {
    System.out.println("Invalid argument: " + e.getMessage());
} catch (RuntimeException e) {
    System.out.println("Runtime error: " + e.getMessage());
} catch (Exception e) {
    System.out.println("General error: " + e.getMessage());
} finally {
    System.out.println("Cleanup");
}

// 自定义异常
public class UserNotFoundException extends Exception {
    public UserNotFoundException(int userId) {
        super("User with ID " + userId + " not found");
    }
}
```

---

## 8. 生成器（PHP 5.5+）

### 8.1 yield 关键字

```php
<?php
// 简单生成器
function rangeGenerator($start, $end) {
    for ($i = $start; $i <= $end; $i++) {
        yield $i;
    }
}

foreach (rangeGenerator(1, 5) as $number) {
    echo $number . ' ';  // 1 2 3 4 5
}

// 带键的生成器
function keyValueGenerator() {
    yield 'key1' => 'value1';
    yield 'key2' => 'value2';
}

// 生成器表达式
function readLines($file) {
    $handle = fopen($file, 'r');
    while ($line = fgets($handle)) {
        yield trim($line);
    }
    fclose($handle);
}

// 内存高效处理大文件
foreach (readLines('large_file.txt') as $line) {
    processLine($line);
}
```

**Java 对比**：
```java
// Java 没有原生生成的器，但有类似的 Stream 或自定义 Iterator

// 使用 Stream（Java 8+）
IntStream.range(1, 6).forEach(System.out::println);

// 自定义 Iterator
class LineIterator implements Iterator<String> {
    private BufferedReader reader;
    private String nextLine;

    // ... hasNext(), next() 实现
}
```

---

## 9. 命名空间（PHP 5.3+）

### 9.1 定义与使用

```php
<?php
// 定义命名空间
namespace App\Services;

class UserService {
    public function find($id) {
        // ...
    }
}

// 子命名空间
namespace App\Services\Auth;

class AuthService {
    // ...
}

// 使用命名空间
use App\Services\UserService;
use App\Services\Auth\AuthService as Auth;

$service = new UserService();
$auth = new Auth();
```

**Java 对比**：
```java
// Java 包
package com.app.services;

public class UserService {
    public User find(int id) {
        // ...
    }
}

// 导入
import com.app.services.UserService;
import com.app.services.auth.AuthService;
```

---

## 10. Trait（PHP 5.4+）

### 10.1 定义与使用

```php
<?php
// 定义 Trait
trait Loggable {
    protected function log($message) {
        echo "[LOG] $message\n";
    }
}

trait Timestampable {
    public $createdAt;
    public $updatedAt;

    public function touch() {
        $this->updatedAt = new DateTime();
    }
}

// 使用 Trait
class User {
    use Loggable, Timestampable;

    public function save() {
        $this->touch();
        $this->log("User saved");
    }
}

// 解决冲突
trait A {
    public function foo() { echo "A"; }
}

trait B {
    public function foo() { echo "B"; }
}

class C {
    use A, B {
        B::foo insteadof A;  // 使用 B 的 foo
        A::foo as aFoo;      // 给 A 的 foo 起别名
    }
}
```

**Java 对比**：
```java
// Java 8+ 接口默认方法（类似但不完全相同）
interface Loggable {
    default void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

class User implements Loggable {
    public void save() {
        log("User saved");
    }
}

// Java 没有真正的 Trait，但可以用：
// 1. 接口默认方法
// 2. 组合模式
// 3. 第三方库如 Lombok @Delegate
```

---

## 11. 静态绑定与延迟静态绑定（PHP 5.3+）

### 11.1 static:: 与 self::

```php
<?php
class ParentClass {
    protected static $name = 'Parent';

    public static function getName() {
        return self::$name;    // 绑定到定义时的类
    }

    public static function getNameLate() {
        return static::$name;  // 绑定到运行时的类
    }
}

class ChildClass extends ParentClass {
    protected static $name = 'Child';
}

echo ChildClass::getName();      // 'Parent'（self 绑定到 ParentClass）
echo ChildClass::getNameLate();  // 'Child'（static 绑定到 ChildClass）

// 工厂模式示例
abstract class Model {
    public static function find($id) {
        return new static();  // 返回实际调用类的实例
    }
}

class User extends Model {}
class Product extends Model {}

$user = User::find(1);      // 返回 User 实例
$product = Product::find(1); // 返回 Product 实例
```

**Java 对比**：
```java
// Java 中类似的行为
class ParentClass {
    protected static String name = "Parent";

    public static String getName() {
        return name;
    }
}

class ChildClass extends ParentClass {
    protected static String name = "Child";
}

// Java 静态方法不支持多态，总是调用声明类的版本
ChildClass.getName();  // "Parent"

// 工厂模式需要其他方式实现
abstract class Model {
    public static <T extends Model> T find(Class<T> clazz, int id) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

---

## 12. 常用数组函数速查表

| 函数 | 作用 | Java 等价 |
|------|------|-----------|
| `array_column()` | 提取列 | Stream.map() |
| `array_map()` | 映射 | Stream.map() |
| `array_filter()` | 过滤 | Stream.filter() |
| `array_reduce()` | 归约 | Stream.reduce() |
| `array_merge()` | 合并 | List.addAll() / Map.putAll() |
| `array_slice()` | 切片 | List.subList() |
| `array_chunk()` | 分块 | 手动实现 |
| `array_flip()` | 键值互换 | 手动实现 |
| `array_combine()` | 合并为关联数组 | 手动实现 |
| `array_keys()` | 获取所有键 | Map.keySet() |
| `array_values()` | 获取所有值 | Map.values() |
| `array_key_exists()` | 键是否存在 | Map.containsKey() |
| `in_array()` | 值是否存在 | List.contains() |
| `array_search()` | 搜索值 | List.indexOf() |
| `count()` | 计数 | Collection.size() |
| `array_sum()` | 求和 | Stream.mapToInt().sum() |
| `array_unique()` | 去重 | Set / Stream.distinct() |
| `sort/rsort` | 排序（重索引） | Collections.sort() |
| `asort/arsort` | 排序（保留键） | LinkedHashMap 排序 |
| `ksort/krsort` | 按键排序 | TreeMap |
| `usort` | 自定义排序 | Collections.sort(Comparator) |
| `array_diff()` | 差集 | Set.removeAll() |
| `array_intersect()` | 交集 | Set.retainAll() |

---

## 13. 快速参考

### 13.1 PHP vs Java 语法对照

| 特性 | PHP | Java |
|------|-----|------|
| 变量 | `$var` | `Type var` |
| 数组 | `$arr = [1, 2, 3]` | `List<Integer> list = Arrays.asList(1, 2, 3)` |
| 关联数组 | `$arr = ['a' => 1]` | `Map<String, Integer> map` |
| 匿名函数 | `function($x) { }` | `x -> { }` |
| 命名空间 | `namespace App;` | `package com.app;` |
| 继承 | `extends` | `extends` |
| 接口 | `implements` | `implements` |
| Trait | `use TraitName;` | 接口默认方法 |
| 静态方法 | `ClassName::method()` | `ClassName.method()` |
| 类型提示 | `function fn(Type $param)` | `void fn(Type param)` |
| 异常 | `throw new Exception()` | `throw new Exception()` |

### 13.2 PHP 5.x 版本特性

| 版本 | 新特性 |
|------|--------|
| PHP 5.0 | 异常处理、反射、接口 |
| PHP 5.1 | PDO、类型提示（数组）、`__isset`/`__unset` |
| PHP 5.2 | JSON 支持、类型提示（DateTime） |
| PHP 5.3 | 命名空间、闭包、延迟静态绑定、`__invoke` |
| PHP 5.4 | Trait、短数组语法 `[]`、内置 Web 服务器 |
| PHP 5.5 | 生成器 `yield`、`finally`、`::class` |
| PHP 5.6 | 可变参数 `...$args`、参数解包、常量标量表达式 |

---

*本文涵盖了 PHP 5.6 及之前版本的核心高阶语法，适合 Java 开发者快速上手。*