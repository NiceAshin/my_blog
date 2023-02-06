module.exports = {
    "title": "AshinBlog",
    "description": "莫等闲，白了少年头，空悲切.",
    "dest": "public",
    "base": "/",
    "head": [
        ["link", {
            "rel": "icon",
            "href": "/favicon.ico"
        }
        ],
        [
            "meta",
            {
                "name": "viewport",
                "content": "width=device-width,initial-scale=1,user-scalable=no"
            }
        ]
    ],
    "theme": "reco",
    "themeConfig": {
        repo: 'https://gitee.com/ashin_zhang',
        // editLinks: true,
        record: "鲁ICP备2020048949号",
        recordLink: "https://beian.miit.gov.cn/",
        docsDir: 'packages/docs/docs',
        smoothScroll: true,
        locales: {
            '/': {
                label: '简体中文',
                selectText: '选择语言',
                ariaLabel: '选择语言',
                lastUpdated: '上次更新',
                nav: require('./nav/zh'),
            }
        },
        subSidebar: 'auto',
        "type": "blog",
        "logo": "/logo.png",
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "AshinZhang",
        "authorAvatar": "/avatar.png",
        "startYear": "2020"
    },
    "markdown": {
        "lineNumbers": true
    }
}