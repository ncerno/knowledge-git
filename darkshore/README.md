# 黑海岸 · 守望站 (Darkshore)

> 在深海与星潮之间梳理你的学习航线。

个人知识管理 + AI 守望站，基于 Next.js + Prisma + SQLite，配合 AI 助手「爱弥斯」实现学习行为记录、知识星图可视化、周/月报自动生成与推送。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, Tailwind CSS 4, Framer Motion |
| 编辑器 | TipTap (富文本笔记) |
| 搜索 | Fuse.js (前端模糊搜索) |
| 数据库 | SQLite + Prisma ORM |
| AI 聊天 | OpenAI 兼容接口 (可接入任意 LLM) |
| AI 总结 | 内部同步接口 + 爱弥斯后台写入 |

---

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx prisma generate
npx prisma db push

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 4. 启动开发服务
npm run dev
```

访问 `http://localhost:3000` 即可看到守望站首页。

---

## 环境变量 (.env)

```env
# ─── 数据库 ───
DATABASE_URL="file:./darkshore.db"

# ─── AI 聊天（可选，不填则返回 fallback 提示）───
OPENAI_API_KEY="sk-your-key"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"

# ─── 内部同步接口鉴权 ───
INTERNAL_API_SECRET="darkshore-amethyst-2025"
```

---

## Linux 服务器部署

```bash
# 1. 构建生产版本
npm run build

# 2. 启动生产服务
npm run start
# 或用 pm2 守护：
pm2 start npm --name darkshore -- start

# 3. 数据库文件位置
# 默认在项目根目录：darkshore.db
# 确保运行用户对该文件有读写权限：
chmod 664 darkshore.db
```

### Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## AI 助手（爱弥斯）如何对接

### 核心接口：`POST /api/internal/sync-summary`

爱弥斯通过此接口将生成的学习总结写入数据库，前端侧栏实时展示。

#### 请求示例

```bash
curl -X POST http://localhost:3000/api/internal/sync-summary \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: darkshore-amethyst-2025" \
  -d '{
    "type": "weekly",
    "period": "2025-W28",
    "title": "第28周学习周报",
    "content": "## 本周学习概览\n\n- **前端**: 深入学习了 React Server Components\n- **后端**: 完成了 RESTful API 设计\n- **AI**: 开始接触 Transformer 架构\n\n### 关键收获\n\n> 理解了 RSC 的核心价值：将服务端渲染与客户端交互无缝结合。\n\n### 下周计划\n\n1. 完成 Next.js 中间件实战\n2. 学习 PostgreSQL 索引优化\n3. 阅读 Attention Is All You Need 论文"
  }'
```

#### 参数说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | `weekly` / `monthly` / `domain` |
| `period` | string | 是 | 如 `2025-W28`、`2025-07`、`frontend` |
| `title` | string | 否 | 总结标题，默认自动生成 |
| `content` | string | 是 | Markdown 格式的总结内容 |
| `category` | string | 否 | 领域分类，`domain` 类型时自动填充 |

#### 鉴权方式

请求头中携带以下任一：
- `x-internal-secret: <你的 INTERNAL_API_SECRET>`
- `Authorization: Bearer <你的 INTERNAL_API_SECRET>`

#### 读取总结

```bash
# 获取最近周报
curl http://localhost:3000/api/internal/sync-summary?type=weekly

# 获取前端领域总结
curl http://localhost:3000/api/internal/sync-summary?type=domain&category=frontend
```

---

## 直接访问数据库

SQLite 数据库文件位于项目根目录的 `darkshore.db`。

### 方式一：Prisma Studio（推荐）

```bash
npx prisma studio
# 浏览器打开 http://localhost:5555
```

### 方式二：命令行

```bash
sqlite3 darkshore.db

# 查看所有表
.tables

# 查看学习总结
SELECT id, type, period, title, substr(content, 1, 80) FROM LearningSummary ORDER BY updatedAt DESC LIMIT 10;

# 查看学习记录
SELECT date, category, action, source FROM StudyLog ORDER BY createdAt DESC LIMIT 20;

# 查看知识节点
SELECT id, title, category, status FROM KnowledgeNode WHERE category = 'frontend';
```

### 方式三：爱弥斯直接读写

爱弥斯可通过 HTTP 接口读写数据，无需直接操作 SQLite 文件：

```python
import requests

API = "http://localhost:3000"
SECRET = "darkshore-amethyst-2025"
HEADERS = {"Content-Type": "application/json", "x-internal-secret": SECRET}

# 写入周报
requests.post(f"{API}/api/internal/sync-summary", headers=HEADERS, json={
    "type": "weekly",
    "period": "2025-W28",
    "title": "第28周·学习周报",
    "content": "## 概览\n\n本周重点突破了..."
})

# 读取总结
resp = requests.get(f"{API}/api/internal/sync-summary?type=weekly")
print(resp.json())
```

---

## 项目结构

```
darkshore/
├── prisma/
│   └── schema.prisma          # 数据模型
├── src/
│   ├── app/
│   │   ├── page.tsx            # 首页（星图 + 数据面板）
│   │   ├── globals.css         # 全局样式 + 设计系统
│   │   ├── layout.tsx          # 根布局 + 字体
│   │   ├── api/
│   │   │   ├── chat/           # AI 聊天接口
│   │   │   ├── stats/          # 统计数据接口
│   │   │   ├── notes/          # 笔记 CRUD
│   │   │   ├── status/         # 系统状态
│   │   │   └── internal/
│   │   │       └── sync-summary/  # AI 总结同步后门
│   │   └── notes/[slug]/       # 笔记阅读/编辑页
│   ├── components/
│   │   ├── KnowledgeGraph.tsx  # 知识星图
│   │   ├── Sidebar.tsx         # 左侧导航 + 学习总结看板
│   │   ├── ChatPanel.tsx       # AI 聊天面板
│   │   ├── GlobalSearch.tsx    # 全局搜索
│   │   ├── NoteEditor.tsx      # TipTap 富文本编辑器
│   │   └── ...                 # 其他 UI 组件
│   └── lib/
│       ├── db.ts               # Prisma 客户端单例
│       ├── summaryMarkdown.ts  # Markdown → HTML 渲染
│       └── data/
│           └── initialRoadmaps.ts  # 五大领域知识树数据
├── darkshore.db                # SQLite 数据库文件
├── .env                        # 环境变量（不提交）
└── package.json
```

---

## 守望闭环

```
用户学习 → 写笔记/点亮节点 → StudyLog 记录行为
                                    ↓
                            爱弥斯后台分析
                                    ↓
                    POST /api/internal/sync-summary
                                    ↓
                        LearningSummary 入库
                                    ↓
                    前端侧栏实时展示周报/月报
                                    ↓
                        同步推送至用户 QQ
```
