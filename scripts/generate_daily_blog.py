import os
import json
import re
import urllib.request
import urllib.error
from datetime import datetime

# 基础配置
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOPICS_FILE = os.path.join(WORKSPACE_DIR, "scripts", "topics.json")

def generate_blog_content(topic):
    """调用 Gemini API 生成技术博客"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
    你是一个精通软件架构与系统运维的顶尖技术博主。请根据以下主题撰写一篇深度、硬核的中文技术博客：
    标题：{topic['title']}
    要求：
    1. 结构清晰，包含理论解析与可实际运行的代码/配置示例。
    2. 使用 Markdown 格式编写，排版美观。
    3. 预计阅读时间不少于 10 分钟，字数在 2500 字以上。
    4. 禁止废话，直接切入核心干货。
    
    具体方向指导：{topic['prompt']}
    """
    
    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            content = res_data['candidates'][0]['content']['parts'][0]['text']
            return content
    except urllib.error.HTTPError as e:
        print(f"API 调用失败 (HTTPError): {e}")
        try:
            error_body = e.read().decode("utf-8")
            print(f"Google API 返回的详细错误信息: {error_body}")
        except Exception:
            pass
        return None
    except Exception as e:
        print(f"API 调用失败: {e}")
        return None

def update_category_readme(category, title, filename):
    """自动将新文章追加到分类目录的 README.md 中"""
    readme_path = os.path.join(WORKSPACE_DIR, category, "README.md")
    if not os.path.exists(readme_path):
        print(f"警告: {readme_path} 不存在，跳过更新 README")
        return
        
    with open(readme_path, "r", encoding="utf-8") as f:
        readme_content = f.read()
        
    new_link = f"\n- [{title}](./{filename})"
    
    # 尝试在分类页面的列表前追加
    if "##" in readme_content:
        parts = readme_content.split("##", 1)
        updated_content = parts[0].strip() + "\n" + new_link + "\n\n##" + parts[1]
    else:
        updated_content = readme_content.strip() + "\n" + new_link + "\n"
        
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print(f"已更新分类主页: {readme_path}")

def main():
    if not GEMINI_API_KEY:
        print("错误: 环境变量 GEMINI_API_KEY 未设置")
        return

    # 1. 读取选题池
    if not os.path.exists(TOPICS_FILE):
        print("错误: 选题池文件不存在")
        return
        
    with open(TOPICS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    topics = data.get("topics", [])
    if not topics:
        print("今日无可用选题，请在 topics.json 中添加新题目")
        return
        
    # 取出第一个任务并更新选题池
    current_topic = topics.pop(0)
    
    with open(TOPICS_FILE, "w", encoding="utf-8") as f:
        json.dump({"topics": topics}, f, ensure_ascii=False, indent=2)
        
    print(f"今日选题: {current_topic['title']}")
    
    # 2. 生成博客内容
    raw_content = generate_blog_content(current_topic)
    if not raw_content:
        return
        
    # 3. 构造 YAML Frontmatter
    today_str = datetime.now().strftime("%Y-%m-%d")
    clean_title = current_topic['title'].replace('"', '\\"')
    
    # 将标题转为 kebab-case 文件名
    filename_base = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]+', '-', current_topic['title'].lower()).strip('-')
    filename = f"{filename_base}.md"
    
    frontmatter = f"""---
title: "{clean_title}"
date: {today_str}
categories:
  - {current_topic['category'].upper()}
tags:
"""
    for tag in current_topic['tags']:
        frontmatter += f"  - {tag}\n"
    frontmatter += "---\n\n"
    
    # 合并前置参数与正文
    full_md_content = frontmatter + raw_content
    
    # 4. 写入文件
    dest_dir = os.path.join(WORKSPACE_DIR, current_topic['category'])
    os.makedirs(dest_dir, exist_ok=True)
    file_path = os.path.join(dest_dir, filename)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_md_content)
    print(f"博客已生成并写入: {file_path}")
    
    # 5. 更新分类主页索引
    update_category_readme(current_topic['category'], current_topic['title'], filename_base)

if __name__ == "__main__":
    main()
