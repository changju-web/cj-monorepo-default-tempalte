# 目录设计（DirectoryDesign）

## 目录结构

```text
  monorepo业务仓库目录
  │
  ├── 📦 apps/                          # 所有应用
  │   │
  │   ├── 🔷 web/                       # 网页端（多入口）
  │   │   ├── src/
  │   │   │   ├── entries/              # 多入口配置
  │   │   │   │   ├── main/             # 主入口
  │   │   │   │   │   ├── index.html
  │   │   │   │   │   ├── main.ts
  │   │   │   │   │   ├── App.vue
  │   │   │   │   │   ├── views/        # 主入口页面
  │   │   │   │   │   │   ├── dashboard/
  │   │   │   │   │   │   ├── home/
  │   │   │   │   │   │   └── ...
  │   │   │   │   │   └── router/
  │   │   │   │   └── data-v/           # 数据可视化入口
  │   │   │   │       ├── index.html
  │   │   │   │       ├── main.ts
  │   │   │   │       ├── App.vue
  │   │   │   │       ├── views/        # 数据可视化页面
  │   │   │   │       │   ├── analysis/
  │   │   │   │       │   ├── charts/
  │   │   │   │       │   └── ...
  │   │   │   │       └── router/
  │   │   │   ├── components/           # 共享组件
  │   │   │   ├── features/             # 共享业务组件
  │   │   │   ├── config/               # 共享配置
  │   │   │   ├── hooks/                # 共享组合式函数
  │   │   │   ├── layout/               # 共享布局
  │   │   │   ├── plugins/              # 共享插件配置
  │   │   │   ├── store/                # 共享状态管理
  │   │   │   ├── styles/               # 共享样式
  │   │   │   ├── utils/                # 共享工具库
  │   │   │   ├── api/                  # 共享 API
  │   │   │   ├── types/                # 共享类型
  │   │   │   ├── constants/            # 共享常量
  │   │   │   └── assets/               # 静态资源
  │   │   ├── index.html                # 默认入口（符号链接）
  │   │   ├── vite.config.ts
  │   │   └── package.json
  │   │   └── ...
  │   ├── 🔷 h5/                        # 移动端
  │   │   ├── src/
  │   │   ├── package.json
  │   │   └── ...
  │   ├── 🔷 mini-program/              # 小程序端
  │   │   ├── src/
  │   │   ├── package.json
  │   │   └── ...
  ├── 📦 packages/                      # 所有功能包
  │   │
  │   ├── 🔷 shared/                    # 共享包
  │   │   ├── src/
  │   │   ├── package.json
  │   │   └── ...
  │   ├── 🔷 auth/                      # 鉴权包
  │   │   ├── src/
  │   │   ├── package.json
  │   │   └── ...
  │   │
  ├── 📚 docs/                          # 文档站点
  │   ├── .vitepress/
  │   │   ├── config/
  │   │   │   ├── site.ts              #   站点配置
  │   │   │   └── theme.ts             #   主题配置
  │   │   ├── theme/
  │   │   │   └── index.ts
  │   │   └── components/              #   文档自定义组件
  │   ├── guide/                       # 使用指南
  │   │   ├── getting-started.md
  │   │   ├── architecture.md
  │   │   └── ...
  │   ├── api/                         # API 文档
  │   │   ├── core.md
  │   │   ├── tool.md
  │   │   ├── ep-comp.md
  │   │   └── ...
  │   ├── demos/                       # 示例代码
  │   │   └── ...
  │   └── index.md
  ├── .gitignore
  ├── .npmrc
  ├── eslint.config.mjs
  ├── package.json                     # 根 scripts
  ├── pnpm-lock.yaml
  ├── pnpm-workspace.yaml
  ├── tsconfig.base.json
  ├── prettier.config.mjs
  ├── README.md
  ├── stylelint.config.mjs
  ├── tsconfig.base.json
  ├── tsconfig.json
  └── ...
```

## 设计思路

### apps(应用)

应用指的是一个完整的项目，一个项目可以包含多个应用，这些项目可以复用大仓内的代码、包、规范等。应用都被放置在 apps 目录下。每个应用都是独立的，可以单独运行、构建、测试、部署，可以引入不同的组件库等等。如：网页端、移动端、小程序端等。

### packages(功能包)

包指的是一个独立的模块，可以是一个组件、一个工具、一个库等。包可以被多个应用引用，也可以被其他包引用。包都被放置在 packages 目录下。如：鉴权、共享等。

### 多入口设计（web 应用）

web 应用支持多入口架构，每个入口相互独立但共享底层资源：

```text
web/src/
├── entries/          # 多入口（隔离）
│   ├── main/         # 主入口：独立页面、路由、App
│   └── data-v/       # 数据可视化入口：独立页面、路由、App
│
└── [共享资源]        # 组件、hooks、utils 等（所有入口共享）
```

**核心原则**：

- **入口隔离**：每个入口有独立的 `index.html`、`main.ts`、`App.vue`、`router/`、`views/`
- **资源共享**：组件、hooks、utils、store 等在 `src` 根目录，所有入口共享
- **按需引用**：各入口根据需要引入共享资源，避免冗余代码

**Vite 配置示例**：

```ts
// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/entries/main/index.html'),
        'data-v': resolve(__dirname, 'src/entries/data-v/index.html')
      }
    }
  }
})
```

### 统一规则导出

```text
└── src/
    ├── types/
    │   ├── common.ts
    │   ├── component.ts
    │   └── index.ts
    └── ...
```

```ts
// types/index.ts
export * from './types/common'
export * from './types/component'
```

对于目录下的文件，统一导出。如：`types/index.ts`内应该包含所有的导出文件，比如`types/common.ts`、`types/component.ts`。
