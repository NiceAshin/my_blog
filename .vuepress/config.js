module.exports = {
    "title": "AshinBlog",
    "description": "黑夜中前行，仍照亮前路!",
    "dest": ".vuepress/dist",
    // "base": "/my_blog/",
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
        repo: 'https://github.com/NiceAshin',
        editLinks: true,
        record: "鲁ICP备2020048949号",
        recordLink: "https://beian.miit.gov.cn/",
        docsDir: 'my_blog',
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
        "startYear": "2020",
        noFoundPageByTencent: false
    },
    "markdown": {
        "lineNumbers": true
    }
}
