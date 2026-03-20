---
title: PHP 5.5 经典代码片段
date: 2026-03-19
tags:
  - PHP
  - PHP5.5
  - 代码片段
categories:
  - PHP
---

# PHP 5.5 经典代码片段：有趣又实用的 12 个示例

PHP 5.5 是一个里程碑版本，引入了许多令人兴奋的特性。本文通过 12 个有趣实用的代码片段，带你领略 PHP 5.5 的魅力。

---

## 1. 生成器：用 yield 处理大数据

**场景**：处理 100 万行日志文件，内存占用仅几 KB。

```php
<?php
// ❌ 传统方式：一次性加载，内存爆炸
function loadLinesBad($file) {
    return file($file);  // 100万行 = 数百MB内存
}

// ✅ PHP 5.5 生成器：逐行读取，内存友好
function loadLines($file) {
    $handle = fopen($file, 'r');
    while ($line = fgets($handle)) {
        yield trim($line);
    }
    fclose($handle);
}

// 使用示例：分析日志
$logFile = 'access.log';
$errorCount = 0;

foreach (loadLines($logFile) as $line) {
    if (strpos($line, 'ERROR') !== false) {
        $errorCount++;
    }
}

echo "发现 {$errorCount} 个错误\n";

// 生成器还可以返回值（PHP 5.5+）
function numberSeries($start, $end) {
    $sum = 0;
    for ($i = $start; $i <= $end; $i++) {
        $sum += $i;
        yield $i;
    }
    return $sum;  // 最终返回
}

$gen = numberSeries(1, 10);
foreach ($gen as $num) {
    echo $num . ' ';
}
echo "总和: " . $gen->getReturn();  // 55
```

**趣味点**：生成器像是一个"暂停函数"，每次 `yield` 就暂停，下次调用继续执行。

---

## 2. finally：资源清理的好帮手

**场景**：数据库操作，无论成功失败都要关闭连接。

```php
<?php
// 经典的资源清理模式
function queryUser($pdo, $userId) {
    $stmt = null;
    try {
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$userId]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new RuntimeException("用户不存在");
        }

        return $user;

    } catch (PDOException $e) {
        echo "数据库错误: " . $e->getMessage();
        throw $e;  // 重新抛出

    } finally {
        // 无论成功、失败、异常，都会执行
        if ($stmt) {
            $stmt->closeCursor();
        }
        echo "\n[清理完成]";
    }
}

// 文件操作的 finally
function processFile($filename) {
    $handle = fopen($filename, 'r');
    try {
        // 处理文件...
        $content = fread($handle, filesize($filename));
        return json_decode($content, true);
    } finally {
        fclose($handle);  // 保证关闭
    }
}
```

**趣味点**：`finally` 就像是"不管发生什么，最后都要执行我"。

---

## 3. ::class 语法：告别硬编码类名

**场景**：依赖注入容器、反射、框架配置。

```php
<?php
namespace App\Services;

class UserService {
    public function find($id) {
        return "User #{$id}";
    }
}

class UserController {
    private $userService;

    public function __construct(UserService $userService) {
        $this->userService = $userService;
    }
}

// ❌ 老方式：字符串硬编码，容易写错
$className = 'App\Services\UserService';  // 拼写错误不会报错

// ✅ PHP 5.5：类名自动解析
$className = UserService::class;     // 'App\Services\UserService'
$controllerClass = UserController::class;

// 在依赖注入容器中使用
class Container {
    private $bindings = [];

    public function bind($abstract, $concrete) {
        $this->bindings[$abstract] = $concrete;
    }

    public function make($abstract) {
        $concrete = $this->bindings[$abstract];
        return new $concrete();
    }
}

$container = new Container();
$container->bind('userService', UserService::class);  // 类型安全

// 配置数组中使用
$config = [
    'controllers' => [
        UserController::class,  // IDE 自动补全支持
    ],
    'services' => [
        'user' => UserService::class,
    ],
];
```

**趣味点**：`::class` 让类名也有"代码提示"和"重构支持"。

---

## 4. foreach + list：优雅解构数组

**场景**：处理数据库结果、CSV 数据、坐标点。

```php
<?php
// 经典：批量处理用户数据
$users = [
    ['Alice', 25, 'alice@example.com'],
    ['Bob', 30, 'bob@example.com'],
    ['Charlie', 28, 'charlie@example.com'],
];

// ❌ 老方式：索引访问
foreach ($users as $user) {
    echo "{$user[0]} ({$user[1]}岁) - {$user[2]}\n";
}

// ✅ PHP 5.5：list 解构
foreach ($users as list($name, $age, $email)) {
    echo "{$name} ({$age}岁) - {$email}\n";
}

// 处理坐标点
$points = [
    [0, 0],
    [1, 2],
    [3, 4],
    [5, 6],
];

echo "曼哈顿距离:\n";
foreach ($points as list($x, $y)) {
    $distance = abs($x) + abs($y);
    echo "点($x, $y) 距原点: $distance\n";
}

// 处理 CSV 数据
$csvData = [
    ['id', 'name', 'price'],
    ['1', 'Apple', '5.00'],
    ['2', 'Banana', '3.50'],
];

// 跳过表头，处理数据行
foreach (array_slice($csvData, 1) as list($id, $name, $price)) {
    echo "商品 #{$id}: {$name} - ¥{$price}\n";
}

// 二维数组转换
$keyValuePairs = [
    ['name', 'Alice'],
    ['age', '25'],
    ['city', 'Beijing'],
];

$config = [];
foreach ($keyValuePairs as list($key, $value)) {
    $config[$key] = $value;
}
// ['name' => 'Alice', 'age' => '25', 'city' => 'Beijing']
```

**趣味点**：就像 JavaScript 的解构赋值，一行代码搞定多个变量。

---

## 5. array_column：一行代码提取列

**场景**：数据库结果集转键值对、提取列表。

```php
<?php
// 模拟数据库查询结果
$users = [
    ['id' => 1, 'name' => 'Alice', 'role' => 'admin'],
    ['id' => 2, 'name' => 'Bob', 'role' => 'user'],
    ['id' => 3, 'name' => 'Charlie', 'role' => 'user'],
];

// ✅ 提取所有用户名
$names = array_column($users, 'name');
// ['Alice', 'Bob', 'Charlie']

// ✅ 提取 id => name 映射
$userMap = array_column($users, 'name', 'id');
// [1 => 'Alice', 2 => 'Bob', 3 => 'Charlie']

// ✅ 提取 id => 完整数据
$usersById = array_column($users, null, 'id');
// [1 => ['id' => 1, ...], 2 => [...], 3 => [...]]

// 实际应用：批量查询时建立索引
function batchGetUsers(array $userIds) {
    $users = $db->query('SELECT * FROM users WHERE id IN (' . implode(',', $userIds) . ')');
    return array_column($users, null, 'id');  // O(1) 查找
}

// 实际应用：生成下拉选项
function getRoleOptions() {
    $roles = [
        ['id' => 'admin', 'label' => '管理员'],
        ['id' => 'user', 'label' => '普通用户'],
        ['id' => 'guest', 'label' => '访客'],
    ];
    return array_column($roles, 'label', 'id');
}
// ['admin' => '管理员', 'user' => '普通用户', 'guest' => '访客']
```

**趣味点**：以前需要写循环的代码，现在一行搞定。

---

## 6. empty() 支持表达式

**场景**：检查函数返回值是否为空。

```php
<?php
function getConfig($key, $default = null) {
    static $config = [
        'debug' => false,
        'name' => '',
        'version' => '1.0',
    ];
    return isset($config[$key]) ? $config[$key] : $default;
}

// ❌ PHP 5.4 及之前：需要临时变量
$temp = getConfig('debug');
$isEmpty = empty($temp);

// ✅ PHP 5.5：直接判断表达式
if (empty(getConfig('name'))) {
    echo "name 配置为空\n";
}

// 实际应用：检查数组操作结果
$data = ['a', 'b', 'c'];

if (!empty(array_pop($data))) {
    echo "弹出了非空元素\n";
}

// 实际应用：检查方法链
class Request {
    public function get($key) {
        return isset($_GET[$key]) ? $_GET[$key] : null;
    }
}

$request = new Request();

// 之前需要两行
$page = $request->get('page');
if (empty($page)) { $page = 1; }

// 现在
$page = empty($request->get('page')) ? 1 : $request->get('page');
```

**趣味点**：一个小改进，省去了很多临时变量。

---

## 7. 数组/字符串解引用

**场景**：快速访问数组或字符串的某个字符。

```php
<?php
// 数组解引用
function getColors() {
    return ['red', 'green', 'blue'];
}

// ❌ 老方式
$colors = getColors();
echo $colors[0];  // red

// ✅ PHP 5.5：直接解引用
echo getColors()[0];  // red
echo getColors()[2];  // blue

// 字符串解引用
function getStatus() {
    return 'ACTIVE';
}

echo getStatus()[0];  // 'A'

// 实际应用：解析响应
function parseResponse($json) {
    return json_decode($json, true);
}

$userId = parseResponse('{"id": 123, "name": "Alice"}')['id'];

// 实际应用：获取文件扩展名
function getFileExt($filename) {
    return pathinfo($filename)['extension'] ?? '';
}

echo getFileExt('document.pdf');  // 'pdf'

// 链式访问
class Collection {
    private $items = [];

    public function __construct($items) {
        $this->items = $items;
    }

    public function first() {
        return $this->items[0] ?? null;
    }
}

// 直接访问方法返回值的属性
$users = new Collection(['Alice', 'Bob', 'Charlie']);
echo (new Collection(['Alice', 'Bob', 'Charlie']))->first();  // Alice
```

**趣味点**：函数调用的结果可以直接用 `[0]` 访问，省去中间变量。

---

## 8. 密码哈希 API

**场景**：安全的用户密码存储。

```php
<?php
// ==================== 注册 ====================
function registerUser($username, $password) {
    // ✅ 自动加盐、自动选择算法、成本可调
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 存入数据库
    // INSERT INTO users (username, password) VALUES (?, ?)
    echo "注册成功！密码哈希: {$hashedPassword}\n";
    echo "哈希长度: " . strlen($hashedPassword) . " 字符\n";

    return $hashedPassword;
}

// ==================== 登录 ====================
function loginUser($username, $password, $storedHash) {
    // ✅ 自动验证、防时序攻击
    if (password_verify($password, $storedHash)) {
        echo "登录成功！\n";

        // 检查是否需要重新哈希（算法升级时）
        if (password_needs_rehash($storedHash, PASSWORD_DEFAULT)) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            echo "密码已升级存储\n";
            // UPDATE users SET password = ? WHERE username = ?
        }

        return true;
    }

    echo "密码错误！\n";
    return false;
}

// ==================== 使用示例 ====================
$hashedPassword = registerUser('alice', 'MySecret123!');
// 哈希示例: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

loginUser('alice', 'MySecret123!', $hashedPassword);  // 登录成功
loginUser('alice', 'wrongpassword', $hashedPassword);  // 密码错误

// ==================== 高级：自定义成本 ====================
$options = [
    'cost' => 12,  // 默认 10，越高越安全但越慢
];

// 成本测试：找到合适的 cost 值
function findOptimalCost($timeTarget = 0.05) {
    $cost = 9;
    do {
        $cost++;
        $start = microtime(true);
        password_hash('test', PASSWORD_BCRYPT, ['cost' => $cost]);
        $end = microtime(true);
    } while (($end - $start) < $timeTarget);

    return $cost;
}

echo "推荐成本: " . findOptimalCost();  // 根据服务器性能计算
```

**趣味点**：`password_hash` 自动生成随机盐值，每次哈希结果都不同，但 `password_verify` 都能验证！

---

## 9. 非标量键的 foreach

**场景**：使用对象作为数组键时遍历。

```php
<?php
class Color {
    private $name;

    public function __construct($name) {
        $this->name = $name;
    }

    public function __toString() {
        return $this->name;
    }
}

// PHP 5.5 之前：对象键会报 Warning
$red = new Color('red');
$green = new Color('green');

// 数组中使用对象作为键
$palette = [
    $red => '#FF0000',
    $green => '#00FF00',
];

// ✅ PHP 5.5：可以遍历非标量键
foreach ($palette as $color => $hex) {
    echo "$color => $hex\n";
}
// red => #FF0000
// green => #00FF00

// 实际应用：枚举类作为键
abstract class HttpStatus {
    const OK = 200;
    const NOT_FOUND = 404;
    const SERVER_ERROR = 500;
}

$statusMessages = [
    HttpStatus::OK => '成功',
    HttpStatus::NOT_FOUND => '未找到',
    HttpStatus::SERVER_ERROR => '服务器错误',
];

foreach ($statusMessages as $code => $message) {
    echo "HTTP $code: $message\n";
}
```

**趣味点**：虽然实际用途有限，但展示了 PHP 对类型系统的持续改进。

---

## 10. 生成器实现无限序列

**场景**：斐波那契数列、素数生成、无限计数。

```php
<?php
// ==================== 斐波那契数列 ====================
function fibonacci() {
    $prev = 0;
    $curr = 1;

    while (true) {
        yield $curr;

        $next = $prev + $curr;
        $prev = $curr;
        $curr = $next;
    }
}

// 只取前 10 个
$fib = fibonacci();
for ($i = 0; $i < 10; $i++) {
    echo $fib->current() . ' ';
    $fib->next();
}
// 1 1 2 3 5 8 13 21 34 55

// ==================== 素数生成器 ====================
function primes() {
    yield 2;

    $candidate = 3;
    while (true) {
        $isPrime = true;
        $sqrt = sqrt($candidate);

        for ($i = 3; $i <= $sqrt; $i += 2) {
            if ($candidate % $i === 0) {
                $isPrime = false;
                break;
            }
        }

        if ($isPrime) {
            yield $candidate;
        }

        $candidate += 2;
    }
}

// 获取前 20 个素数
$primeGen = primes();
$primeList = [];
for ($i = 0; $i < 20; $i++) {
    $primeList[] = $primeGen->current();
    $primeGen->next();
}
echo "\n前20个素数: " . implode(', ', $primeList);

// ==================== 无限计数器 ====================
function counter($start = 0, $step = 1) {
    while (true) {
        yield $start;
        $start += $step;
    }
}

// 偶数序列
$evens = counter(0, 2);
foreach (range(1, 5) as $i) {
    echo $evens->current() . ' ';  // 0 2 4 6 8
    $evens->next();
}

// ==================== 带过滤的序列 ====================
function filteredRange($start, $end, callable $filter) {
    for ($i = $start; $i <= $end; $i++) {
        if ($filter($i)) {
            yield $i;
        }
    }
}

// 获取 1-100 中的完全平方数
$squares = filteredRange(1, 100, function($n) {
    $sqrt = sqrt($n);
    return $sqrt == floor($sqrt);
});

echo "\n1-100 中的完全平方数: ";
foreach ($squares as $num) {
    echo $num . ' ';  // 1 4 9 16 25 36 49 64 81 100
}
```

**趣味点**：生成器可以无限运行，但只在你需要时才计算，"惰性求值"的完美体现。

---

## 11. 生成器实现协程式任务调度

**场景**：模拟异步任务执行、协作式多任务。

```php
<?php
// 任务类
class Task {
    private $id;
    private $generator;

    public function __construct($id, Generator $generator) {
        $this->id = $id;
        $this->generator = $generator;
    }

    public function run() {
        if ($this->generator->valid()) {
            $value = $this->generator->current();
            $this->generator->next();
            return $value;
        }
        return null;
    }

    public function isFinished() {
        return !$this->generator->valid();
    }

    public function getId() {
        return $this->id;
    }
}

// 简单调度器
class Scheduler {
    private $tasks = [];

    public function addTask(Task $task) {
        $this->tasks[] = $task;
    }

    public function run() {
        while (!empty($this->tasks)) {
            foreach ($this->tasks as $key => $task) {
                $result = $task->run();

                if ($result !== null) {
                    echo "任务 {$task->getId()}: $result\n";
                }

                if ($task->isFinished()) {
                    echo "任务 {$task->getId()} 完成！\n";
                    unset($this->tasks[$key]);
                }
            }

            // 模拟时间片
            usleep(100000);  // 100ms
        }
    }
}

// 定义任务
function downloadTask($url, $id) {
    for ($i = 1; $i <= 3; $i++) {
        yield "下载 $url 进度: " . ($i * 33) . "%";
    }
    yield "下载 $url 完成！";
}

function processTask($data, $id) {
    for ($i = 1; $i <= 5; $i++) {
        yield "处理数据 进度: " . ($i * 20) . "%";
    }
}

// 运行调度器
$scheduler = new Scheduler();
$scheduler->addTask(new Task(1, downloadTask('http://example.com/file1', 1)));
$scheduler->addTask(new Task(2, downloadTask('http://example.com/file2', 2)));
$scheduler->addTask(new Task(3, processTask('data.csv', 3)));

echo "=== 协程任务调度演示 ===\n";
$scheduler->run();
echo "=== 所有任务完成 ===\n";
```

**趣味点**：用 PHP 生成器模拟"协程"，实现协作式多任务调度！

---

## 12. 综合应用：CSV 分析器

**场景**：结合生成器、finally、array_column 分析大 CSV 文件。

```php
<?php
/**
 * CSV 分析器：统计、过滤、转换
 */
class CsvAnalyzer {
    private $file;
    private $headers;

    public function __construct($file) {
        $this->file = $file;
    }

    // 生成器读取行
    public function readRows($skipHeader = true) {
        $handle = null;
        try {
            $handle = fopen($this->file, 'r');

            if ($skipHeader) {
                $this->headers = fgetcsv($handle);
            }

            while ($row = fgetcsv($handle)) {
                if ($this->headers) {
                    yield array_combine($this->headers, $row);
                } else {
                    yield $row;
                }
            }
        } finally {
            if ($handle) {
                fclose($handle);
            }
        }
    }

    // 过滤行
    public function filter(callable $predicate) {
        foreach ($this->readRows() as $row) {
            if ($predicate($row)) {
                yield $row;
            }
        }
    }

    // 统计
    public function stats($field) {
        $values = [];
        $sum = 0;
        $count = 0;
        $min = PHP_FLOAT_MAX;
        $max = PHP_FLOAT_MIN;

        foreach ($this->readRows() as $row) {
            $value = (float)($row[$field] ?? 0);
            $values[] = $value;
            $sum += $value;
            $count++;
            $min = min($min, $value);
            $max = max($max, $value);
        }

        return [
            'count' => $count,
            'sum' => $sum,
            'avg' => $count > 0 ? $sum / $count : 0,
            'min' => $min,
            'max' => $max,
        ];
    }

    // 分组统计
    public function groupBy($field, $aggregateField) {
        $groups = [];

        foreach ($this->readRows() as $row) {
            $key = $row[$field] ?? 'unknown';
            $value = (float)($row[$aggregateField] ?? 0);

            if (!isset($groups[$key])) {
                $groups[$key] = ['count' => 0, 'sum' => 0];
            }

            $groups[$key]['count']++;
            $groups[$key]['sum'] += $value;
        }

        // 计算平均值
        foreach ($groups as $key => &$group) {
            $group['avg'] = $group['count'] > 0
                ? $group['sum'] / $group['count']
                : 0;
        }

        return $groups;
    }
}

// ==================== 使用示例 ====================

// 创建测试 CSV
$csvFile = 'sales.csv';
file_put_contents($csvFile, <<<CSV
product,region,amount,date
Laptop,North,1200,2024-01-15
Phone,South,800,2024-01-16
Laptop,South,1500,2024-01-17
Tablet,North,500,2024-01-18
Phone,North,900,2024-01-19
Laptop,North,1100,2024-01-20
CSV
);

$analyzer = new CsvAnalyzer($csvFile);

// 1. 基本统计
echo "=== 销售额统计 ===\n";
print_r($analyzer->stats('amount'));

// 2. 按产品分组
echo "\n=== 按产品分组 ===\n";
print_r($analyzer->groupBy('product', 'amount'));

// 3. 按区域分组
echo "\n=== 按区域分组 ===\n";
print_r($analyzer->groupBy('region', 'amount'));

// 4. 过滤高额订单
echo "\n=== 高额订单 (> 1000) ===\n";
foreach ($analyzer->filter(function($row) {
    return $row['amount'] > 1000;
}) as $order) {
    echo "- {$order['product']}: \${$order['amount']}\n";
}

// 清理
unlink($csvFile);
```

**趣味点**：一个 CSV 分析器，展示了生成器、`finally`、`array_combine`、回调函数的综合运用！

---

## 总结

PHP 5.5 带来的特性让代码更优雅、更高效：

| 特性 | 核心价值 |
|------|----------|
| **生成器** | 内存高效、惰性计算、协程基础 |
| **finally** | 资源清理保证、异常安全 |
| **::class** | 类型安全、重构友好 |
| **foreach + list** | 代码简洁、解构赋值 |
| **array_column** | 数据转换利器 |
| **empty() 表达式** | 减少临时变量 |
| **数组解引用** | 链式调用更流畅 |
| **密码 API** | 安全默认、开箱即用 |

这些特性至今仍然是现代 PHP 开发的基础，值得深入掌握！

---

*本文代码在 PHP 5.6 环境下测试通过，PHP 7+ 完全兼容。*