# CJ Monorepo

## 介绍

长聚大仓库默认模板项目，基于 pnpm workspace 的 Monorepo 架构。

当前模板是基于 [vue-pure-admin](https://pure-admin.cn/) 进行二次开发，具体文档可参考该仓库官网。

## 目录结构

```
cj-monorepo/
├── apps/                           # 应用目录
│   └── web/                        # Web 应用（基于 vue-pure-admin）
│       ├── build/                  # 构建脚本
│       ├── mock/                   # Mock 数据
│       ├── public/                 # 静态资源
│       ├── src/                    # 源代码
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json           # 组合配置（引用 app + node）
│       ├── tsconfig.app.json       # 浏览器环境配置
│       ├── tsconfig.node.json      # Node 环境配置
│       ├── postcss.config.js
│       ├── .env.*                  # 环境变量文件
│       └── package.json
│
├── packages/                       # 共享包目录
│   ├── tsconfig/                   # TypeScript 配置包
│   │   ├── base.json               # 基础配置
│   │   ├── vue-app.json            # Vue 应用配置
│   │   ├── node.json               # Node 环境配置
│   │   └── package.json
│   │
│   ├── eslint-config/              # ESLint 配置包
│   │   ├── src/index.js
│   │   └── package.json
│   │
│   ├── stylelint-config/           # Stylelint 配置包
│   │   ├── src/index.js
│   │   └── package.json
│   │
│   └── shared/                     # 共享工具包
│       ├── src/
│       │   ├── utils/              # 工具函数
│       │   ├── types/              # 类型定义
│       │   ├── constants/          # 常量
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── .husky/                         # Git Hooks
├── .vscode/                        # VS Code 配置
├── .prettierrc.js                  # Prettier 配置
├── commitlint.config.js            # Commitlint 配置
├── .lintstagedrc                   # Lint-staged 配置
├── eslint.config.js                # ESLint 配置（根目录统一）
├── stylelint.config.js             # Stylelint 配置（根目录统一）
├── .npmrc                          # pnpm 配置
├── .gitignore
├── pnpm-workspace.yaml             # 工作区配置
├── tsconfig.json                   # 根目录 TypeScript 配置
├── package.json                    # 根目录脚本
└── README.md
```

## 设计理念

### Monorepo 架构

采用 pnpm workspace 管理多包项目，实现：

- **代码复用**：共享配置、工具函数、类型定义
- **统一规范**：ESLint、Stylelint、TypeScript 配置集中管理
- **独立部署**：各应用可独立构建和部署
- **依赖管理**：统一的依赖版本管理，避免版本冲突

### 应用（apps）

应用是完整的可运行项目，放置在 `apps/` 目录下：

- `apps/web` - 当前的 Web 管理后台
- 后续可扩展 `apps/h5`（移动端）、`apps/mini-program`（小程序）等

### 共享包（packages）

共享包是可复用的模块，放置在 `packages/` 目录下：

| 包名 | 说明 |
|------|------|
| `@cj/tsconfig` | TypeScript 配置预设 |
| `@cj/eslint-config` | ESLint 配置预设 |
| `@cj/stylelint-config` | Stylelint 配置预设 |
| `@cj/shared` | 共享工具函数、类型、常量 |

### TypeScript 配置分离

遵循环境分离原则，避免类型污染：

- `tsconfig.app.json` - 浏览器环境（包含 DOM 类型）
- `tsconfig.node.json` - Node 环境（包含 Node 类型）
- `tsconfig.json` - 组合配置，通过 Project References 引用

### 路径别名规范

为避免多应用间的别名冲突，采用应用前缀命名：

| 应用 | 源码别名 | 构建别名 |
|------|----------|----------|
| web | `@web/*` | `@web-build/*` |
| h5（预留） | `@h5/*` | `@h5-build/*` |

## 环境要求

- Node.js: `^20.19.0 || >=22.13.0`
- pnpm: `>=9`

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动 web 应用开发服务器
pnpm dev
# 或
pnpm dev:web
```

### 构建

```bash
# 生产环境构建
pnpm build
# 或
pnpm build:web

# 预发布环境构建
pnpm build:staging
```

### 预览

```bash
# 预览构建结果
pnpm preview
# 或
pnpm preview:web
```

### 类型检查

```bash
# 检查所有包的类型
pnpm typecheck
```

### 代码检查

```bash
# 运行所有 lint 检查
pnpm lint

# 单独运行
pnpm lint:eslint    # ESLint 检查
pnpm lint:prettier  # Prettier 格式化
pnpm lint:stylelint # Stylelint 检查
```

### 清理

```bash
# 清理所有 node_modules
pnpm clean

# 清理缓存
pnpm clean:cache
```

## 内部包引用

在应用中引用内部包，使用 `workspace:*` 协议：

```json
{
  "dependencies": {
    "@cj/shared": "workspace:*"
  },
  "devDependencies": {
    "@cj/tsconfig": "workspace:*"
  }
}
```

在代码中使用：

```typescript
// 引用共享包
import { someUtil } from '@cj/shared'

// 引用应用内模块（以 web 为例）
import { useUserStore } from '@web/store/modules/user'
```

## 新增应用

1. 在 `apps/` 目录下创建新应用目录
2. 创建 `package.json`，设置应用名称（如 `@cj/h5`）
3. 创建 TypeScript 配置文件（继承 `@cj/tsconfig`）
4. 配置路径别名（如 `@h5/*`）
5. 在根目录 `package.json` 添加对应脚本

## 新增共享包

1. 在 `packages/` 目录下创建新包目录
2. 创建 `package.json`，设置包名称（如 `@cj/utils`）
3. 创建 `tsconfig.json`（继承 `@cj/tsconfig/base.json`）
4. 在根目录 `tsconfig.json` 的 `references` 中添加引用

## 许可证

[MIT © 2020-present, pure-admin](./LICENSE)
