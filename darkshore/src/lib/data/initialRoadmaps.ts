// ─────────────────────────────────────────────────────────────────────────────
//  黑海岸·守望站  —  知识星图初始数据
//  五大星域：Frontend | Backend | AI | GameDev | Python
//  参考 roadmap.sh 知识体系，每域 10-12 个核心节点
// ─────────────────────────────────────────────────────────────────────────────

export type NodeStatus = "locked" | "available" | "completed";
export type NodeCategory = "frontend" | "backend" | "ai" | "gamedev" | "python";

export interface RawKnowledgeNode {
  id: string;           // 本地唯一标识（用于 prerequisiteId 引用）
  title: string;
  description: string;
  category: NodeCategory;
  depth: number;        // 0=领域中心星，1=主轨迹，2=子技能
  status: NodeStatus;
  slug?: string;        // 关联 markdown 文件
  posX: number;         // -1.0 ~ 1.0 相对坐标（力导向图初始位置提示）
  posY: number;
  weight: number;       // 节点视觉权重（影响星的大小）
  prerequisiteId?: string;
  tags: string[];
}

// ═══════════════════════════════════════════════
//  🌐 FRONTEND 星域
// ═══════════════════════════════════════════════
const frontendNodes: RawKnowledgeNode[] = [
  {
    id: "fe-root", title: "前端开发", description: "构建用户界面与交互体验的完整技术体系",
    category: "frontend", depth: 0, status: "completed",
    posX: 0, posY: 0, weight: 3.0, tags: ["frontend", "core"],
  },
  {
    id: "fe-html", title: "HTML 语义化", description: "文档结构、语义标签、无障碍访问 (a11y)",
    category: "frontend", depth: 1, status: "completed",
    posX: -0.6, posY: -0.5, weight: 1.8, prerequisiteId: "fe-root",
    slug: "html-semantics", tags: ["html", "a11y"],
  },
  {
    id: "fe-css", title: "CSS 现代布局", description: "Flexbox、Grid、动画、自定义属性",
    category: "frontend", depth: 1, status: "completed",
    posX: 0.1, posY: -0.7, weight: 1.8, prerequisiteId: "fe-root",
    slug: "css-modern-layout", tags: ["css", "layout"],
  },
  {
    id: "fe-js", title: "JavaScript 核心", description: "原型链、闭包、事件循环、ES2024+",
    category: "frontend", depth: 1, status: "available",
    posX: 0.7, posY: -0.3, weight: 2.2, prerequisiteId: "fe-root",
    slug: "javascript-core", tags: ["javascript", "es6"],
  },
  {
    id: "fe-ts", title: "TypeScript", description: "静态类型系统、泛型、类型体操",
    category: "frontend", depth: 2, status: "available",
    posX: 0.85, posY: 0.3, weight: 1.6, prerequisiteId: "fe-js",
    slug: "typescript-fundamentals", tags: ["typescript"],
  },
  {
    id: "fe-react", title: "React 生态", description: "Hooks、Context、并发模式、RSC",
    category: "frontend", depth: 2, status: "available",
    posX: 0.3, posY: 0.75, weight: 2.0, prerequisiteId: "fe-js",
    slug: "react-ecosystem", tags: ["react", "hooks"],
  },
  {
    id: "fe-nextjs", title: "Next.js", description: "App Router、SSR、ISR、Server Actions",
    category: "frontend", depth: 2, status: "available",
    posX: -0.3, posY: 0.8, weight: 1.7, prerequisiteId: "fe-react",
    slug: "nextjs-app-router", tags: ["nextjs", "ssr"],
  },
  {
    id: "fe-state", title: "状态管理", description: "Zustand、Jotai、Redux Toolkit 对比选型",
    category: "frontend", depth: 2, status: "locked",
    posX: -0.75, posY: 0.4, weight: 1.4, prerequisiteId: "fe-react",
    tags: ["state", "zustand"],
  },
  {
    id: "fe-perf", title: "性能优化", description: "Core Web Vitals、代码分割、懒加载",
    category: "frontend", depth: 2, status: "locked",
    posX: -0.8, posY: -0.1, weight: 1.5, prerequisiteId: "fe-js",
    tags: ["performance", "cwv"],
  },
  {
    id: "fe-test", title: "前端测试", description: "Vitest、Testing Library、E2E with Playwright",
    category: "frontend", depth: 2, status: "locked",
    posX: -0.5, posY: 0.65, weight: 1.3, prerequisiteId: "fe-react",
    tags: ["testing", "vitest"],
  },
  {
    id: "fe-d3", title: "数据可视化", description: "D3.js、Canvas API、WebGL 基础",
    category: "frontend", depth: 2, status: "locked",
    posX: 0.5, posY: -0.65, weight: 1.4, prerequisiteId: "fe-js",
    slug: "data-visualization-d3", tags: ["d3", "canvas", "webgl"],
  },
];

// ═══════════════════════════════════════════════
//  ⚙️ BACKEND 星域
// ═══════════════════════════════════════════════
const backendNodes: RawKnowledgeNode[] = [
  { id: "be-root", title: "后端开发", description: "服务、数据、认证与可扩展系统设计", category: "backend", depth: 0, status: "available", posX: 0, posY: 0, weight: 3, tags: ["backend", "core"] },
  { id: "be-http", title: "HTTP / API 基础", description: "HTTP 方法、状态码、REST、鉴权头", category: "backend", depth: 1, status: "completed", posX: -0.65, posY: -0.45, weight: 1.8, prerequisiteId: "be-root", slug: "http-api-basics", tags: ["http", "rest"] },
  { id: "be-node", title: "Node.js 运行时", description: "事件循环、流、模块系统、进程模型", category: "backend", depth: 1, status: "available", posX: 0.1, posY: -0.7, weight: 2, prerequisiteId: "be-root", slug: "nodejs-runtime", tags: ["nodejs"] },
  { id: "be-db", title: "数据库基础", description: "SQL、索引、事务、范式与查询优化", category: "backend", depth: 1, status: "available", posX: 0.75, posY: -0.2, weight: 2.1, prerequisiteId: "be-root", slug: "database-fundamentals", tags: ["sql", "database"] },
  { id: "be-framework", title: "服务框架", description: "Express、NestJS、中间件与依赖注入", category: "backend", depth: 2, status: "available", posX: 0.8, posY: 0.35, weight: 1.7, prerequisiteId: "be-node", slug: "backend-frameworks", tags: ["express", "nestjs"] },
  { id: "be-auth", title: "认证与授权", description: "Session、JWT、OAuth2、RBAC", category: "backend", depth: 2, status: "locked", posX: 0.35, posY: 0.8, weight: 1.5, prerequisiteId: "be-http", slug: "authentication-authorization", tags: ["auth", "jwt"] },
  { id: "be-cache", title: "缓存系统", description: "Redis、缓存穿透、击穿、雪崩治理", category: "backend", depth: 2, status: "locked", posX: -0.25, posY: 0.85, weight: 1.4, prerequisiteId: "be-db", tags: ["redis", "cache"] },
  { id: "be-queue", title: "消息队列", description: "RabbitMQ、Kafka、异步任务与削峰填谷", category: "backend", depth: 2, status: "locked", posX: -0.7, posY: 0.45, weight: 1.4, prerequisiteId: "be-framework", tags: ["mq", "kafka"] },
  { id: "be-devops", title: "部署与运维", description: "Docker、CI/CD、日志监控、反向代理", category: "backend", depth: 2, status: "locked", posX: -0.8, posY: -0.05, weight: 1.5, prerequisiteId: "be-framework", slug: "deployment-devops", tags: ["docker", "cicd"] },
  { id: "be-system", title: "系统设计", description: "高并发、分层架构、幂等与容灾设计", category: "backend", depth: 2, status: "locked", posX: -0.45, posY: -0.65, weight: 1.7, prerequisiteId: "be-db", slug: "system-design-basics", tags: ["system-design"] },
];

// ═══════════════════════════════════════════════
//  🤖 AI 星域
// ═══════════════════════════════════════════════
const aiNodes: RawKnowledgeNode[] = [
  { id: "ai-root", title: "人工智能", description: "从数学基础到模型训练与应用部署", category: "ai", depth: 0, status: "available", posX: 0, posY: 0, weight: 3, tags: ["ai", "core"] },
  { id: "ai-math", title: "数学基础", description: "线性代数、概率统计、微积分、优化", category: "ai", depth: 1, status: "available", posX: -0.6, posY: -0.5, weight: 1.9, prerequisiteId: "ai-root", slug: "ai-math-foundations", tags: ["math"] },
  { id: "ai-python", title: "AI 编程基础", description: "Python、NumPy、Pandas、实验环境管理", category: "ai", depth: 1, status: "completed", posX: 0.05, posY: -0.72, weight: 1.8, prerequisiteId: "ai-root", slug: "ai-python-stack", tags: ["python", "numpy"] },
  { id: "ai-ml", title: "机器学习", description: "监督学习、无监督学习、模型评估", category: "ai", depth: 1, status: "available", posX: 0.72, posY: -0.25, weight: 2.2, prerequisiteId: "ai-math", slug: "machine-learning-basics", tags: ["ml"] },
  { id: "ai-dl", title: "深度学习", description: "神经网络、反向传播、CNN / RNN / Transformer", category: "ai", depth: 2, status: "available", posX: 0.8, posY: 0.32, weight: 2, prerequisiteId: "ai-ml", slug: "deep-learning-core", tags: ["dl", "transformer"] },
  { id: "ai-llm", title: "大语言模型", description: "预训练、微调、RAG、Agent 与推理增强", category: "ai", depth: 2, status: "available", posX: 0.35, posY: 0.82, weight: 2.1, prerequisiteId: "ai-dl", slug: "llm-rag-agent", tags: ["llm", "rag", "agent"] },
  { id: "ai-cv", title: "计算机视觉", description: "图像分类、检测、分割、多模态视觉", category: "ai", depth: 2, status: "locked", posX: -0.25, posY: 0.85, weight: 1.5, prerequisiteId: "ai-dl", tags: ["cv"] },
  { id: "ai-nlp", title: "自然语言处理", description: "分词、嵌入、序列建模、文本生成", category: "ai", depth: 2, status: "locked", posX: -0.72, posY: 0.48, weight: 1.5, prerequisiteId: "ai-dl", tags: ["nlp"] },
  { id: "ai-mle", title: "MLOps", description: "实验追踪、模型部署、监控与反馈回路", category: "ai", depth: 2, status: "locked", posX: -0.8, posY: -0.08, weight: 1.4, prerequisiteId: "ai-ml", slug: "mlops-workflow", tags: ["mlops"] },
  { id: "ai-ethics", title: "AI 安全与伦理", description: "偏见、公平性、隐私、模型安全治理", category: "ai", depth: 2, status: "locked", posX: -0.42, posY: -0.66, weight: 1.3, prerequisiteId: "ai-llm", tags: ["ethics", "safety"] },
];
// ═══════════════════════════════════════════════
//  🎮 GAME DEVELOPMENT 星域
// ═══════════════════════════════════════════════
const gameDevNodes: RawKnowledgeNode[] = [
  { id: "gd-root", title: "游戏开发", description: "从引擎基础到图形、玩法、网络与发行", category: "gamedev", depth: 0, status: "available", posX: 0, posY: 0, weight: 3, tags: ["gamedev", "core"] },
  { id: "gd-programming", title: "游戏编程基础", description: "向量、矩阵、时间步长、游戏循环", category: "gamedev", depth: 1, status: "completed", posX: -0.62, posY: -0.48, weight: 1.8, prerequisiteId: "gd-root", slug: "game-programming-basics", tags: ["game-loop", "math"] },
  { id: "gd-engine", title: "游戏引擎", description: "Unity / Unreal 的对象模型与组件系统", category: "gamedev", depth: 1, status: "available", posX: 0.08, posY: -0.72, weight: 2, prerequisiteId: "gd-root", slug: "game-engine-overview", tags: ["unity", "unreal"] },
  { id: "gd-graphics", title: "图形渲染", description: "渲染管线、Shader、光照、材质系统", category: "gamedev", depth: 1, status: "available", posX: 0.74, posY: -0.24, weight: 2.1, prerequisiteId: "gd-programming", slug: "graphics-rendering-basics", tags: ["graphics", "shader"] },
  { id: "gd-gameplay", title: "玩法系统", description: "输入、状态机、关卡、敌人与交互反馈", category: "gamedev", depth: 2, status: "available", posX: 0.82, posY: 0.28, weight: 1.8, prerequisiteId: "gd-engine", slug: "gameplay-systems", tags: ["gameplay", "fsm"] },
  { id: "gd-physics", title: "物理系统", description: "碰撞检测、刚体、角色控制器与布娃娃", category: "gamedev", depth: 2, status: "locked", posX: 0.38, posY: 0.82, weight: 1.5, prerequisiteId: "gd-engine", tags: ["physics"] },
  { id: "gd-ai", title: "游戏 AI", description: "行为树、寻路、NavMesh、决策模型", category: "gamedev", depth: 2, status: "locked", posX: -0.22, posY: 0.86, weight: 1.5, prerequisiteId: "gd-gameplay", tags: ["behavior-tree", "pathfinding"] },
  { id: "gd-network", title: "联机同步", description: "帧同步、状态同步、延迟补偿与回滚", category: "gamedev", depth: 2, status: "locked", posX: -0.72, posY: 0.46, weight: 1.5, prerequisiteId: "gd-gameplay", slug: "multiplayer-sync", tags: ["network", "rollback"] },
  { id: "gd-tools", title: "工具链与资源", description: "美术资源导入、构建管线、编辑器扩展", category: "gamedev", depth: 2, status: "locked", posX: -0.82, posY: -0.06, weight: 1.4, prerequisiteId: "gd-engine", tags: ["pipeline", "tools"] },
  { id: "gd-release", title: "发行与优化", description: "性能剖析、平台适配、打包发布与热更新", category: "gamedev", depth: 2, status: "locked", posX: -0.46, posY: -0.68, weight: 1.4, prerequisiteId: "gd-graphics", tags: ["profiling", "release"] },
];

// ═══════════════════════════════════════════════
//  🐍 PYTHON 星域
// ═══════════════════════════════════════════════
const pythonNodes: RawKnowledgeNode[] = [
  { id: "py-root", title: "Python 生态", description: "从基础语法到工程化、Web、数据科学与自动化", category: "python", depth: 0, status: "completed", posX: 0, posY: 0, weight: 3, tags: ["python", "core"] },
  { id: "py-syntax", title: "基础语法", description: "变量、流程控制、函数、模块、异常处理", category: "python", depth: 1, status: "completed", posX: -0.62, posY: -0.5, weight: 1.9, prerequisiteId: "py-root", slug: "python-syntax-basics", tags: ["syntax"] },
  { id: "py-structures", title: "数据结构", description: "list / dict / set / tuple 与常见算法思维", category: "python", depth: 1, status: "completed", posX: 0.05, posY: -0.74, weight: 1.8, prerequisiteId: "py-syntax", slug: "python-data-structures", tags: ["data-structure"] },
  { id: "py-oop", title: "面向对象与高级特性", description: "类、装饰器、迭代器、生成器、上下文管理", category: "python", depth: 1, status: "available", posX: 0.72, posY: -0.24, weight: 2, prerequisiteId: "py-structures", slug: "python-advanced-features", tags: ["oop", "decorator"] },
  { id: "py-web", title: "Web 框架", description: "Flask、Django、FastAPI 的设计与实践", category: "python", depth: 2, status: "available", posX: 0.82, posY: 0.3, weight: 1.8, prerequisiteId: "py-oop", slug: "python-web-frameworks", tags: ["django", "fastapi"] },
  { id: "py-data", title: "数据科学", description: "NumPy、Pandas、可视化与数据清洗分析", category: "python", depth: 2, status: "available", posX: 0.35, posY: 0.82, weight: 2, prerequisiteId: "py-structures", slug: "python-data-science", tags: ["numpy", "pandas"] },
  { id: "py-automation", title: "自动化脚本", description: "文件处理、爬虫、办公自动化与调度", category: "python", depth: 2, status: "locked", posX: -0.22, posY: 0.86, weight: 1.4, prerequisiteId: "py-syntax", tags: ["automation", "crawler"] },
  { id: "py-testing", title: "测试与质量", description: "pytest、类型检查、lint、打包与发布", category: "python", depth: 2, status: "locked", posX: -0.72, posY: 0.46, weight: 1.3, prerequisiteId: "py-oop", tags: ["pytest", "quality"] },
  { id: "py-async", title: "异步与并发", description: "asyncio、多线程、多进程与任务编排", category: "python", depth: 2, status: "locked", posX: -0.82, posY: -0.05, weight: 1.5, prerequisiteId: "py-oop", slug: "python-async-concurrency", tags: ["asyncio"] },
  { id: "py-ml", title: "机器学习生态", description: "scikit-learn、PyTorch、实验与模型落地", category: "python", depth: 2, status: "locked", posX: -0.46, posY: -0.68, weight: 1.7, prerequisiteId: "py-data", slug: "python-ml-ecosystem", tags: ["sklearn", "pytorch"] },
];

export const initialRoadmaps: RawKnowledgeNode[] = [
  ...frontendNodes,
  ...backendNodes,
  ...aiNodes,
  ...gameDevNodes,
  ...pythonNodes,
];

export const domainMeta: Record<NodeCategory, { label: string; description: string; center: { x: number; y: number } }> = {
  frontend: { label: "前端", description: "界面、交互与可视化之海", center: { x: -420, y: -200 } },
  backend: { label: "后端", description: "服务、数据与系统稳定性之海", center: { x: 380, y: -180 } },
  ai: { label: "AI", description: "模型、推理与智能体之海", center: { x: 0, y: 320 } },
  gamedev: { label: "游戏开发", description: "玩法、渲染与沉浸体验之海", center: { x: -520, y: 260 } },
  python: { label: "Python", description: "语言生态、工程实践与数据之海", center: { x: 520, y: 240 } },
};

export function getRoadmapByCategory(category: NodeCategory) {
  return initialRoadmaps.filter((node) => node.category === category);
}

export function getDomainProgress(category: NodeCategory) {
  const nodes = getRoadmapByCategory(category).filter((node) => node.depth > 0);
  const completed = nodes.filter((node) => node.status === "completed").length;
  return { completed, total: nodes.length, ratio: nodes.length ? completed / nodes.length : 0 };
}


