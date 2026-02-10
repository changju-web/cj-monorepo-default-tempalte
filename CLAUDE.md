# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 pnpm workspace 的 Monorepo 架构项目，使用 Vue 3 + TypeScript + Element Plus 构建企业级管理后台。项目基于 [vue-pure-admin](https://pure-admin.cn/) 进行二次开发。

## 核心架构

### Monorepo 结构

- **apps/** - 应用目录，每个应用独立运行、构建、部署
  - `apps/web` - Web 管理后台（当前主应用）
- **packages/** - 共享包目录，可被多个应用引用
  - `@cj/tsconfig` - TypeScript 配置预设
  - `@cj/eslint-config` - ESLint 配置预设
  - `@cj/stylelint-config` - Stylelint 配置预设
  - `@cj/shared` - 共享工具函数、类型、常量

### 路径别名规范

为避免多应用间别名冲突，采用应用前缀命名：

```typescript
// Web 应用
import { useUserStore } from '@web/store/modules/user'
import { getPluginsList } from '@web-build/plugins'
```

### TypeScript 配置分离

遵循环境分离原则，避免类型污染：

- `tsconfig.app.json` - 浏览器环境（包含 DOM 类型，编译 `src/`、`mock/`、`types/`）
- `tsconfig.node.json` - Node 环境（包含 Node 类型，编译 `vite.config.ts`、`build/`）
- `tsconfig.json` - 组合配置（通过 Project References 引用上述两个配置）

## 常用命令

### 开发

```bash
# 启动 web 应用开发服务器（默认端口 8848）
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

# 预览构建结果
pnpm preview
```

### 代码质量

```bash
# 类型检查（检查所有包）
pnpm typecheck

# 运行所有 lint 检查
pnpm lint

# 单独运行
pnpm lint:eslint    # ESLint 检查并自动修复
pnpm lint:prettier  # Prettier 格式化
pnpm lint:stylelint # Stylelint 检查并自动修复
```

### 清理

```bash
# 清理所有 node_modules
pnpm clean

# 清理缓存和 lock 文件
pnpm clean:cache
```

## 开发规范

### Commit 规范

使用 Conventional Commits 规范，支持的类型：

- `feat` - 新功能
- `fix` - 修复 bug
- `perf` - 性能优化
- `style` - 代码格式调整
- `docs` - 文档更新
- `test` - 测试相关
- `refactor` - 重构
- `build` - 构建系统或外部依赖变更
- `ci` - CI 配置变更
- `chore` - 其他不修改 src 或测试文件的变更
- `revert` - 回退提交
- `wip` - 进行中的工作
- `workflow` - 工作流改进
- `types` - 类型定义变更
- `release` - 发布版本

示例：`feat: 添加用户管理模块`

### 内部包引用

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

### 环境变量

环境变量文件位于 `apps/web/` 目录下：

- `.env` - 所有环境共享的基础配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.staging` - 预发布环境配置

关键环境变量：

- `VITE_PORT` - 开发服务器端口（默认 8848）
- `VITE_PUBLIC_PATH` - 公共路径
- `VITE_ROUTER_HISTORY` - 路由模式
- `VITE_CDN` - 是否启用 CDN
- `VITE_COMPRESSION` - 构建压缩方式（none/gzip/brotli/both）

## 技术栈

### 核心框架

- Vue 3.5+ (Composition API)
- TypeScript 5.9+
- Vite 7+
- Vue Router 4
- Pinia 3

### UI 组件库

- Element Plus 2.11+
- @pureadmin/table - 增强表格组件
- @pureadmin/descriptions - 描述列表组件

### 工具库

- @vueuse/core - Vue 组合式工具集
- dayjs - 日期处理
- axios - HTTP 客户端
- echarts - 图表库
- sortablejs - 拖拽排序

## 项目特性

### 布局系统

支持多种布局模式（位于 `apps/web/src/layout/`）：

- 垂直布局（NavVertical）
- 水平布局（NavHorizontal）
- 混合布局（NavMix）

### 权限系统

- 基于角色的权限控制（RBAC）
- 指令式权限：`v-auth`、`v-perms`
- 组件式权限：`<ReAuth>`、`<RePerms>`

### 自定义组件

位于 `apps/web/src/components/`：

- `ReDialog` - 增强对话框
- `ReIcon` - 图标组件（支持 Iconify、本地 SVG、Iconfont）
- `RePureTableBar` - 表格工具栏
- `ReSegmented` - 分段控制器
- `ReText` - 文本组件

### 自定义指令

位于 `apps/web/src/directives/`：

- `v-auth` - 权限控制
- `v-copy` - 复制文本
- `v-longpress` - 长按事件
- `v-optimize` - 性能优化
- `v-ripple` - 波纹效果

## 扩展指南

### 新增应用

1. 在 `apps/` 目录下创建新应用目录
2. 创建 `package.json`，设置应用名称（如 `@cj/h5`）
3. 创建 TypeScript 配置文件（继承 `@cj/tsconfig`）
4. 配置路径别名（如 `@h5/*`）
5. 在根目录 `package.json` 添加对应脚本

### 新增共享包

1. 在 `packages/` 目录下创建新包目录
2. 创建 `package.json`，设置包名称（如 `@cj/utils`）
3. 创建 `tsconfig.json`（继承 `@cj/tsconfig/base.json`）
4. 在根目录 `tsconfig.json` 的 `references` 中添加引用

## 环境要求

- Node.js: `^20.19.0 || >=22.13.0`
- pnpm: `>=9`
- 包管理器：`pnpm@9.15.0`（通过 `packageManager` 字段锁定）

## 构建配置

### Vite 配置

位于 `apps/web/vite.config.ts`，关键配置：

- 构建目标：ES2015
- 代码分割：静态资源按类型分类打包到 `static/` 目录
- 预热文件：`index.html`、`src/{views,components}/*`
- 开发服务器：端口 8848，host 0.0.0.0

### 构建脚本

位于 `apps/web/build/`：

- `plugins.ts` - Vite 插件配置
- `optimize.ts` - 依赖预构建配置
- `utils.ts` - 构建工具函数（路径解析、环境变量处理、包大小计算）

## Mock 数据

Mock 数据位于 `apps/web/mock/`，使用 `vite-plugin-fake-server` 插件。

## 注意事项

- 所有应用和包的 TypeScript 配置必须继承自 `@cj/tsconfig`
- 路径别名必须使用应用前缀，避免冲突
- 环境变量必须以 `VITE_` 开头才能在客户端代码中访问
- 构建前会自动清理 `dist` 目录
- 开发模式下 Node 内存限制为 4GB，构建时为 8GB
