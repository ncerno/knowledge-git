// ─────────────────────────────────────────────────────────────
// 黑海岸·守望站 — 知识星图数据（基于 roadmap.sh 真实路线图）
// 五大星域：Frontend · Backend · AI/DataScience · GameDev · Python
// ─────────────────────────────────────────────────────────────

export type NodeStatus = "locked" | "available" | "completed";
export type NodeCategory = "frontend" | "backend" | "ai" | "gamedev" | "python";

export interface RawKnowledgeNode {
  id: string;
  title: string;
  description?: string;
  category: NodeCategory;
  depth: number;          // 0=domain-root, 1=section, 2=leaf
  status: NodeStatus;
  slug?: string;
  posX: number;
  posY: number;
  weight: number;
  prerequisiteId?: string;
  tags: string[];
}

// ═══════════════════════════════════════════════════
// 1. FRONTEND — 基于 roadmap.sh/frontend
// ═══════════════════════════════════════════════════
const frontendNodes: RawKnowledgeNode[] = [
  { id: "fe-root", title: "前端开发", category: "frontend", depth: 0, status: "available", posX: 0, posY: 0, weight: 2, tags: ["root"], slug: "frontend-root" },
  { id: "fe-html", title: "HTML", description: "语义化标记、表单、SEO、无障碍访问", category: "frontend", depth: 1, status: "available", posX: -0.6, posY: -0.8, weight: 1.3, prerequisiteId: "fe-root", tags: ["html","semantic","a11y"], slug: "fe-html" },
  { id: "fe-css", title: "CSS", description: "选择器、盒模型、Flexbox、Grid、动画、响应式设计", category: "frontend", depth: 1, status: "available", posX: 0, posY: -0.8, weight: 1.3, prerequisiteId: "fe-root", tags: ["css","flexbox","grid","responsive"], slug: "fe-css" },
  { id: "fe-js", title: "JavaScript", description: "DOM操作、事件、ES6+、闭包、Promise/async", category: "frontend", depth: 1, status: "available", posX: 0.6, posY: -0.8, weight: 1.5, prerequisiteId: "fe-root", tags: ["javascript","es6","dom","async"], slug: "fe-javascript" },
  { id: "fe-ts", title: "TypeScript", description: "类型系统、泛型、工具类型、声明文件", category: "frontend", depth: 1, status: "locked", posX: 0.6, posY: -0.3, weight: 1.4, prerequisiteId: "fe-js", tags: ["typescript","types"], slug: "fe-typescript" },
  { id: "fe-git", title: "Git & GitHub", description: "版本控制、分支策略、PR流程、协作开发", category: "frontend", depth: 1, status: "available", posX: -0.8, posY: -0.3, weight: 1.1, prerequisiteId: "fe-root", tags: ["git","vcs","github"], slug: "fe-git" },
  { id: "fe-pkg", title: "包管理器", description: "npm / yarn / pnpm、依赖管理、scripts", category: "frontend", depth: 1, status: "locked", posX: -0.3, posY: -0.3, weight: 1, prerequisiteId: "fe-js", tags: ["npm","yarn","pnpm"], slug: "fe-package-managers" },
  { id: "fe-react", title: "React", description: "组件化、Hooks、状态管理、Context、生命周期", category: "frontend", depth: 1, status: "locked", posX: -0.4, posY: 0.2, weight: 1.6, prerequisiteId: "fe-ts", tags: ["react","hooks","jsx"], slug: "fe-react" },
  { id: "fe-nextjs", title: "Next.js", description: "SSR/SSG/ISR、App Router、API路由、中间件", category: "frontend", depth: 2, status: "locked", posX: -0.4, posY: 0.6, weight: 1.4, prerequisiteId: "fe-react", tags: ["nextjs","ssr","ssg"], slug: "fe-nextjs" },
  { id: "fe-vue", title: "Vue.js", description: "Composition API、响应式系统、Pinia状态管理", category: "frontend", depth: 1, status: "locked", posX: 0.3, posY: 0.2, weight: 1.3, prerequisiteId: "fe-ts", tags: ["vue","composition-api"], slug: "fe-vue" },
  { id: "fe-build", title: "构建工具", description: "Vite、Webpack、esbuild、Turbopack", category: "frontend", depth: 2, status: "locked", posX: 0.7, posY: 0.2, weight: 1.1, prerequisiteId: "fe-pkg", tags: ["vite","webpack","bundler"], slug: "fe-build-tools" },
  { id: "fe-test", title: "前端测试", description: "Vitest、Jest、Testing Library、Cypress E2E", category: "frontend", depth: 2, status: "locked", posX: 0, posY: 0.5, weight: 1.2, prerequisiteId: "fe-react", tags: ["testing","jest","vitest","e2e"], slug: "fe-testing" },
  { id: "fe-perf", title: "Web性能优化", description: "Core Web Vitals、懒加载、代码分割、缓存策略", category: "frontend", depth: 2, status: "locked", posX: 0.6, posY: 0.6, weight: 1.2, prerequisiteId: "fe-build", tags: ["performance","cwv","lazy-loading"], slug: "fe-web-performance" },
  { id: "fe-a11y", title: "无障碍访问", description: "ARIA属性、屏幕阅读器、色彩对比、键盘导航", category: "frontend", depth: 2, status: "locked", posX: -0.8, posY: 0.5, weight: 1, prerequisiteId: "fe-html", tags: ["accessibility","aria","a11y"], slug: "fe-accessibility" },
  { id: "fe-tailwind", title: "Tailwind CSS", description: "Utility-first、JIT编译、自定义主题、插件系统", category: "frontend", depth: 2, status: "locked", posX: -0.2, posY: 0.8, weight: 1.1, prerequisiteId: "fe-css", tags: ["tailwind","utility-css"], slug: "fe-tailwind" },
];

// ═══════════════════════════════════════════════════
// 2. BACKEND — 基于 roadmap.sh/backend
// ═══════════════════════════════════════════════════
const backendNodes: RawKnowledgeNode[] = [
  { id: "be-root", title: "后端开发", category: "backend", depth: 0, status: "available", posX: 0, posY: 0, weight: 2, tags: ["root"], slug: "backend-root" },
  { id: "be-lang", title: "编程语言选择", description: "Node.js / Python / Go / Java / Rust", category: "backend", depth: 1, status: "available", posX: 0, posY: -0.8, weight: 1.3, prerequisiteId: "be-root", tags: ["language","nodejs","python","go"], slug: "be-languages" },
  { id: "be-git", title: "Git版本控制", description: "分支管理、Merge/Rebase、CI流水线集成", category: "backend", depth: 1, status: "available", posX: -0.7, posY: -0.6, weight: 1, prerequisiteId: "be-root", tags: ["git","vcs"], slug: "be-git" },
  { id: "be-os", title: "操作系统基础", description: "进程/线程、内存管理、I/O模型、Shell基础", category: "backend", depth: 1, status: "locked", posX: 0.7, posY: -0.6, weight: 1.1, prerequisiteId: "be-lang", tags: ["os","linux","shell"], slug: "be-os-basics" },
  { id: "be-rdb", title: "关系型数据库", description: "PostgreSQL / MySQL、SQL查询、索引、事务ACID", category: "backend", depth: 1, status: "locked", posX: -0.5, posY: -0.2, weight: 1.4, prerequisiteId: "be-lang", tags: ["sql","postgresql","mysql","acid"], slug: "be-relational-db" },
  { id: "be-nosql", title: "NoSQL数据库", description: "MongoDB、Redis、Cassandra、文档/KV/列存储", category: "backend", depth: 1, status: "locked", posX: 0.5, posY: -0.2, weight: 1.2, prerequisiteId: "be-rdb", tags: ["nosql","mongodb","redis"], slug: "be-nosql" },
  { id: "be-api", title: "API设计", description: "RESTful规范、GraphQL、gRPC、OpenAPI/Swagger", category: "backend", depth: 1, status: "locked", posX: 0, posY: 0, weight: 1.5, prerequisiteId: "be-lang", tags: ["rest","graphql","grpc","api"], slug: "be-api-design" },
  { id: "be-auth", title: "认证与授权", description: "JWT、OAuth2.0、Session、RBAC/ABAC", category: "backend", depth: 2, status: "locked", posX: -0.6, posY: 0.3, weight: 1.3, prerequisiteId: "be-api", tags: ["auth","jwt","oauth","session"], slug: "be-authentication" },
  { id: "be-cache", title: "缓存策略", description: "Redis缓存、CDN、HTTP缓存、缓存失效策略", category: "backend", depth: 2, status: "locked", posX: 0.6, posY: 0.3, weight: 1.1, prerequisiteId: "be-nosql", tags: ["cache","redis","cdn"], slug: "be-caching" },
  { id: "be-mq", title: "消息队列", description: "RabbitMQ、Kafka、事件驱动架构、发布订阅模式", category: "backend", depth: 2, status: "locked", posX: 0, posY: 0.5, weight: 1.2, prerequisiteId: "be-api", tags: ["mq","kafka","rabbitmq","event-driven"], slug: "be-message-queue" },
  { id: "be-docker", title: "容器化", description: "Docker基础、Dockerfile、Docker Compose、镜像优化", category: "backend", depth: 2, status: "locked", posX: -0.3, posY: 0.7, weight: 1.3, prerequisiteId: "be-os", tags: ["docker","container","compose"], slug: "be-docker" },
  { id: "be-ci", title: "CI/CD", description: "GitHub Actions、Jenkins、自动化测试与部署流水线", category: "backend", depth: 2, status: "locked", posX: 0.3, posY: 0.7, weight: 1.1, prerequisiteId: "be-docker", tags: ["ci","cd","github-actions","jenkins"], slug: "be-ci-cd" },
  { id: "be-arch", title: "架构模式", description: "微服务、单体、Serverless、事件溯源、CQRS", category: "backend", depth: 2, status: "locked", posX: 0.7, posY: 0.7, weight: 1.4, prerequisiteId: "be-mq", tags: ["microservices","serverless","architecture"], slug: "be-architecture" },
  { id: "be-sec", title: "Web安全", description: "OWASP Top10、XSS/CSRF/SQL注入、HTTPS、CORS", category: "backend", depth: 2, status: "locked", posX: -0.7, posY: 0.5, weight: 1.2, prerequisiteId: "be-auth", tags: ["security","owasp","xss","csrf"], slug: "be-web-security" },
  { id: "be-test", title: "后端测试", description: "单元测试、集成测试、Mock、TDD/BDD实践", category: "backend", depth: 2, status: "locked", posX: 0, posY: 0.9, weight: 1.1, prerequisiteId: "be-api", tags: ["testing","unit-test","integration","tdd"], slug: "be-testing" },
];

// ═══════════════════════════════════════════════════
// 3. AI / DATA SCIENCE — 基于 roadmap.sh/ai-data-scientist
// ═══════════════════════════════════════════════════
const aiNodes: RawKnowledgeNode[] = [
  { id: "ai-root", title: "AI & 数据科学", category: "ai", depth: 0, status: "available", posX: 0, posY: 0, weight: 2, tags: ["root"], slug: "ai-root" },
  { id: "ai-math", title: "数学基础", description: "线性代数、微积分、概率论与统计、最优化理论", category: "ai", depth: 1, status: "available", posX: -0.5, posY: -0.8, weight: 1.4, prerequisiteId: "ai-root", tags: ["math","linear-algebra","statistics","calculus"], slug: "ai-mathematics" },
  { id: "ai-python", title: "Python for AI", description: "NumPy、Pandas、Matplotlib、Jupyter Notebook", category: "ai", depth: 1, status: "available", posX: 0.5, posY: -0.8, weight: 1.3, prerequisiteId: "ai-root", tags: ["python","numpy","pandas","jupyter"], slug: "ai-python" },
  { id: "ai-eda", title: "探索性数据分析", description: "数据清洗、可视化、特征工程、缺失值处理", category: "ai", depth: 1, status: "locked", posX: 0, posY: -0.4, weight: 1.2, prerequisiteId: "ai-python", tags: ["eda","data-cleaning","visualization"], slug: "ai-eda" },
  { id: "ai-ml", title: "机器学习", description: "监督/非监督学习、决策树、SVM、随机森林、集成学习", category: "ai", depth: 1, status: "locked", posX: -0.6, posY: 0, weight: 1.6, prerequisiteId: "ai-math", tags: ["ml","supervised","unsupervised","sklearn"], slug: "ai-machine-learning" },
  { id: "ai-dl", title: "深度学习", description: "神经网络、CNN、RNN/LSTM、Transformer架构", category: "ai", depth: 1, status: "locked", posX: 0.6, posY: 0, weight: 1.5, prerequisiteId: "ai-ml", tags: ["deep-learning","cnn","rnn","transformer"], slug: "ai-deep-learning" },
  { id: "ai-nlp", title: "自然语言处理", description: "Tokenization、Embedding、Attention、BERT/GPT", category: "ai", depth: 2, status: "locked", posX: 0.3, posY: 0.4, weight: 1.3, prerequisiteId: "ai-dl", tags: ["nlp","bert","gpt","transformer"], slug: "ai-nlp" },
  { id: "ai-cv", title: "计算机视觉", description: "图像分类、目标检测、语义分割、YOLO/ResNet", category: "ai", depth: 2, status: "locked", posX: -0.3, posY: 0.4, weight: 1.2, prerequisiteId: "ai-dl", tags: ["cv","object-detection","segmentation"], slug: "ai-computer-vision" },
  { id: "ai-llm", title: "大语言模型", description: "Prompt Engineering、Fine-tuning、RAG、Agent架构", category: "ai", depth: 2, status: "locked", posX: 0.7, posY: 0.6, weight: 1.5, prerequisiteId: "ai-nlp", tags: ["llm","prompt","rag","fine-tuning"], slug: "ai-llm" },
  { id: "ai-mlops", title: "MLOps", description: "模型部署、A/B测试、模型监控、Feature Store", category: "ai", depth: 2, status: "locked", posX: -0.7, posY: 0.6, weight: 1.1, prerequisiteId: "ai-ml", tags: ["mlops","deployment","monitoring"], slug: "ai-mlops" },
  { id: "ai-agent", title: "AI Agents", description: "工具调用、多Agent协作、记忆系统、规划与推理", category: "ai", depth: 2, status: "locked", posX: 0, posY: 0.8, weight: 1.4, prerequisiteId: "ai-llm", tags: ["agent","tool-use","multi-agent"], slug: "ai-agents" },
  { id: "ai-ethics", title: "AI伦理与安全", description: "偏见检测、对抗攻击、Red Teaming、可解释AI", category: "ai", depth: 2, status: "locked", posX: -0.5, posY: 0.9, weight: 1, prerequisiteId: "ai-dl", tags: ["ethics","safety","bias","xai"], slug: "ai-ethics" },
];

// ═══════════════════════════════════════════════════
// 4. GAME DEVELOPMENT — 综合游戏开发路线图
// ═══════════════════════════════════════════════════
const gameDevNodes: RawKnowledgeNode[] = [
  { id: "gd-root", title: "游戏开发", category: "gamedev", depth: 0, status: "available", posX: 0, posY: 0, weight: 2, tags: ["root"], slug: "gamedev-root" },
  { id: "gd-lang", title: "编程语言", description: "C++ / C# / GDScript、内存管理与指针", category: "gamedev", depth: 1, status: "available", posX: 0, posY: -0.8, weight: 1.3, prerequisiteId: "gd-root", tags: ["cpp","csharp","gdscript"], slug: "gd-languages" },
  { id: "gd-math", title: "游戏数学", description: "向量、矩阵、四元数、三角函数、插值", category: "gamedev", depth: 1, status: "available", posX: -0.6, posY: -0.6, weight: 1.2, prerequisiteId: "gd-root", tags: ["math","vector","quaternion"], slug: "gd-game-math" },
  { id: "gd-engine", title: "游戏引擎", description: "Unity / Unreal / Godot、组件系统、场景管理", category: "gamedev", depth: 1, status: "locked", posX: 0.6, posY: -0.6, weight: 1.5, prerequisiteId: "gd-lang", tags: ["unity","unreal","godot"], slug: "gd-game-engine" },
  { id: "gd-graphics", title: "图形渲染", description: "渲染管线、Shader编程、光照模型、后处理", category: "gamedev", depth: 1, status: "locked", posX: -0.5, posY: -0.1, weight: 1.4, prerequisiteId: "gd-math", tags: ["graphics","shader","rendering"], slug: "gd-graphics" },
  { id: "gd-physics", title: "物理系统", description: "碰撞检测、刚体模拟、角色控制器、射线检测", category: "gamedev", depth: 2, status: "locked", posX: 0.5, posY: -0.1, weight: 1.2, prerequisiteId: "gd-engine", tags: ["physics","collision","rigidbody"], slug: "gd-physics" },
  { id: "gd-gameplay", title: "玩法系统", description: "输入系统、状态机、AI行为树、关卡设计", category: "gamedev", depth: 2, status: "locked", posX: 0, posY: 0.2, weight: 1.4, prerequisiteId: "gd-engine", tags: ["gameplay","fsm","behavior-tree"], slug: "gd-gameplay" },
  { id: "gd-audio", title: "音频系统", description: "音效管理、3D空间音频、音乐过渡、FMOD/Wwise", category: "gamedev", depth: 2, status: "locked", posX: -0.7, posY: 0.3, weight: 1, prerequisiteId: "gd-engine", tags: ["audio","fmod","wwise"], slug: "gd-audio" },
  { id: "gd-ui", title: "游戏UI/UX", description: "HUD设计、菜单系统、本地化、无障碍设计", category: "gamedev", depth: 2, status: "locked", posX: 0.7, posY: 0.3, weight: 1, prerequisiteId: "gd-engine", tags: ["ui","ux","hud"], slug: "gd-ui" },
  { id: "gd-network", title: "网络同步", description: "帧同步、状态同步、延迟补偿、回滚预测", category: "gamedev", depth: 2, status: "locked", posX: -0.4, posY: 0.6, weight: 1.3, prerequisiteId: "gd-gameplay", tags: ["network","rollback","netcode"], slug: "gd-networking" },
  { id: "gd-ai", title: "游戏AI", description: "A*寻路、NavMesh、行为树、决策系统", category: "gamedev", depth: 2, status: "locked", posX: 0.4, posY: 0.6, weight: 1.2, prerequisiteId: "gd-gameplay", tags: ["pathfinding","navmesh","ai"], slug: "gd-game-ai" },
  { id: "gd-optimize", title: "性能优化", description: "LOD、对象池、Draw Call优化、Profiling工具", category: "gamedev", depth: 2, status: "locked", posX: 0, posY: 0.8, weight: 1.1, prerequisiteId: "gd-graphics", tags: ["optimization","profiling","lod"], slug: "gd-optimization" },
];

// ═══════════════════════════════════════════════════
// 5. PYTHON — 基于 roadmap.sh/python
// ═══════════════════════════════════════════════════
const pythonNodes: RawKnowledgeNode[] = [
  { id: "py-root", title: "Python 生态", category: "python", depth: 0, status: "available", posX: 0, posY: 0, weight: 2, tags: ["root"], slug: "python-root" },
  { id: "py-basics", title: "基础语法", description: "变量、数据类型、流程控制、函数、异常处理", category: "python", depth: 1, status: "available", posX: -0.5, posY: -0.8, weight: 1.3, prerequisiteId: "py-root", tags: ["syntax","basics","functions"], slug: "py-basics" },
  { id: "py-ds", title: "数据结构", description: "List、Dict、Set、Tuple、Comprehensions", category: "python", depth: 1, status: "available", posX: 0.5, posY: -0.8, weight: 1.2, prerequisiteId: "py-basics", tags: ["list","dict","set","comprehension"], slug: "py-data-structures" },
  { id: "py-oop", title: "面向对象", description: "类、继承、多态、装饰器、描述器、元类", category: "python", depth: 1, status: "locked", posX: 0, posY: -0.4, weight: 1.4, prerequisiteId: "py-ds", tags: ["oop","class","decorator","metaclass"], slug: "py-oop" },
  { id: "py-modules", title: "模块与包", description: "包管理、虚拟环境、pip/poetry、__init__", category: "python", depth: 1, status: "locked", posX: -0.7, posY: -0.3, weight: 1.1, prerequisiteId: "py-basics", tags: ["modules","pip","poetry","venv"], slug: "py-modules" },
  { id: "py-async", title: "异步编程", description: "asyncio、协程、事件循环、aiohttp", category: "python", depth: 2, status: "locked", posX: 0.7, posY: -0.2, weight: 1.2, prerequisiteId: "py-oop", tags: ["asyncio","coroutine","concurrency"], slug: "py-async" },
  { id: "py-web", title: "Web框架", description: "Django、Flask、FastAPI、REST API设计", category: "python", depth: 2, status: "locked", posX: -0.5, posY: 0.2, weight: 1.4, prerequisiteId: "py-oop", tags: ["django","flask","fastapi","web"], slug: "py-web-frameworks" },
  { id: "py-data", title: "数据科学", description: "NumPy、Pandas、Matplotlib、数据清洗与分析", category: "python", depth: 2, status: "locked", posX: 0.5, posY: 0.2, weight: 1.3, prerequisiteId: "py-ds", tags: ["numpy","pandas","matplotlib","data"], slug: "py-data-science" },
  { id: "py-testing", title: "测试与质量", description: "pytest、unittest、Mock、类型检查(mypy)", category: "python", depth: 2, status: "locked", posX: -0.3, posY: 0.5, weight: 1.1, prerequisiteId: "py-oop", tags: ["pytest","unittest","mypy","testing"], slug: "py-testing" },
  { id: "py-automation", title: "自动化脚本", description: "文件处理、正则表达式、爬虫(Scrapy)、调度", category: "python", depth: 2, status: "locked", posX: 0.3, posY: 0.5, weight: 1.1, prerequisiteId: "py-modules", tags: ["automation","scrapy","regex","scripting"], slug: "py-automation" },
  { id: "py-ml", title: "机器学习生态", description: "scikit-learn、PyTorch、TensorFlow、模型训练", category: "python", depth: 2, status: "locked", posX: 0, posY: 0.7, weight: 1.4, prerequisiteId: "py-data", tags: ["sklearn","pytorch","tensorflow","ml"], slug: "py-ml-ecosystem" },
  { id: "py-devops", title: "部署与DevOps", description: "Docker、GitHub Actions、打包发布(PyPI)、日志", category: "python", depth: 2, status: "locked", posX: -0.6, posY: 0.7, weight: 1, prerequisiteId: "py-testing", tags: ["docker","cicd","pypi","logging"], slug: "py-devops" },
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


