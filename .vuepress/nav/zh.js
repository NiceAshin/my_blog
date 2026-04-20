module.exports = [
    {
        text: '架构设计',
        items: [
            {
                text: '领域驱动设计',
                link: '/ddd/',
                items: [
                    { text: 'DDD 概览', link: '/ddd/' },
                    { text: '战略设计', link: '/ddd/stratgy' },
                    { text: '战术设计', link: '/ddd/tactics' },
                    { text: '事件溯源', link: '/ddd/event-source' },
                    { text: '微服务拆分', link: '/ddd/DDD-microservice' }
                ]
            },
            { text: '微服务实践', link: '/microservice/' },
            { text: '设计模式', link: '/design/' }
        ]
    },
    {
        text: '编程语言',
        items: [
            { text: 'Java 栈', link: '/java/' },
            { text: 'Go 语言', link: '/go/' },
            { text: 'PHP(Yii2)', link: '/yii2/' },
            {
                text: 'PHP(Laravel12)',
                link: '/laravel12/',
                items: [
                    { text: 'Laravel12 概览', link: '/laravel12/' },
                    { text: '安装与配置', link: '/laravel12/installation' },
                    { text: '目录结构', link: '/laravel12/directory-structure' },
                    { text: '路由系统', link: '/laravel12/routing' },
                    { text: 'Eloquent ORM', link: '/laravel12/eloquent' },
                    { text: 'Blade 模板', link: '/laravel12/blade' }
                ]
            }
        ]
    },
    {
        text: '基础设施',
        items: [
            { text: 'Docker', link: '/docker/' },
            { text: '云原生', link: '/cloud-native/' },
            { text: '中间件', link: '/ground/' },
            { text: 'Linux', link: '/linux/' }
        ]
    },
    {
        text: 'AI 实践',
        items: [
            {
                text: 'AI 探索',
                link: '/ai/',
                items: [
                    { text: 'AI 概览', link: '/ai/' },
                    { text: 'AI Agent 工程化落地', link: '/ai/ai-agent-engineering-guide' },
                    { text: 'RAG 系统设计实战', link: '/ai/rag-system-design-guide' },
                    { text: '上下文工程实战', link: '/ai/context-engineering-guide' },
                    { text: 'Vibe Coding 核心概念', link: '/ai/vibe-coding-concepts' },
                    { text: 'AI CLI 工具实战', link: '/ai/ai-cli-tools-guide' },
                    { text: 'YOLOv8 全景指南', link: '/ai/ultralytics-yolov8-guide' },
                    { text: 'YOLO 模型选型', link: '/ai/yolo-model-selection' },
                    { text: '目标跟踪算法实战', link: '/ai/object-tracking-guide' },
                    { text: 'OCR 工具选型', link: '/ai/ocr-tool-selection' },
                    { text: 'Java OCR 集成', link: '/ai/java-ocr-integration' }
                ]
            }
        ]
    },
    {
        text: '工程实践',
        items: [
            { text: '问题排查', link: '/more/#问题排查与经验' },
            { text: '配置实战', link: '/more/#项目与配置实战' },
            { text: '接口文档', link: '/more/#接口文档专区' }
        ]
    }
]
