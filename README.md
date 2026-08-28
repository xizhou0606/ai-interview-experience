# AI 实战手册

一个从本地真实 AI 项目源码反向提炼的中文技术学习官网。站点使用 React 19 + TypeScript + Vite，包含学习路线、框架百科、项目案例、工程模式、全局搜索和本地学习进度。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://127.0.0.1:4173`。

## 质量检查

```bash
npm run typecheck
npm run build
```

## 内容可信度

- `源码事实`：来自仓库 manifest、配置、入口文件与真实调用链。
- `官方文档`：框架定义、API 和版本资料。
- `工程经验`：从项目问题和权衡归纳，明确标注为经验。

技术选型、成功案例和模块边界见 [ADR 0001](docs/architecture/0001-frontend-stack-and-content-architecture.md)。
