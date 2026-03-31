# TypeScript 配置设计规范（Claude Code Rules 标准版）

## 1. 目标与适用范围

本规范用于统一 Monorepo 下 TypeScript 配置设计，确保：

- 类型边界清晰（Browser 与 Node 不污染）
- 配置职责单一（每个 tsconfig 只负责一个环境）
- 可复用、可审查、可迁移（便于新应用复制和团队评审）

适用范围：

- 根目录 `tsconfig.base.json`、`tsconfig.json`
- `apps/*` 应用目录
- `packages/*` 功能包目录

---

## 2. 强制规范（MUST）

### 2.1 配置分层

1. **MUST** 存在根级 `tsconfig.base.json` 作为共享编译选项。
2. **MUST** 在应用内拆分：`tsconfig.app.json`（Browser）与 `tsconfig.node.json`（Node）。
3. **MUST** 使用应用级 `tsconfig.json` 通过 `references` 组合，不直接承载业务编译范围。

### 2.2 环境隔离

1. `tsconfig.app.json` **MUST NOT** 包含 `node` 类型。
2. `tsconfig.node.json` **MUST NOT** 包含 `DOM` 类型库。
3. `src/**` 业务代码 **MUST** 只由 `tsconfig.app.json` 管辖。
4. `vite.config.ts` / `build/**` 脚本 **MUST** 只由 `tsconfig.node.json` 管辖。

### 2.3 路径与类型

1. `baseUrl` 与 `paths` **MUST** 在同一配置文件内定义。
2. 环境特定 `types` **MUST** 放在对应环境配置中，不得混放。
3. `tsconfig.base.json` **MUST NOT** 写 `include` / `exclude` / 环境特定 `types`。

---

## 3. 文件职责矩阵（标准）

| 文件 | 角色 | 允许内容 | 禁止内容 |
|---|---|---|---|
| `tsconfig.base.json` | 全局共享层 | 通用 `compilerOptions` | `include`、环境特定 `types` |
| `tsconfig.app.json` | Browser 应用层 | DOM lib、应用源码 include、前端 types | `types: ["node"]` |
| `tsconfig.node.json` | Node 脚本层 | Node types、构建脚本 include | `DOM` / `DOM.Iterable` |
| `tsconfig.json` | 组合入口层 | `files: []`、`references` | 直接 `include` 业务文件 |

---

## 4. 快速决策树（文件归属）

```text
文件是否运行在浏览器？
├─ 是 → tsconfig.app.json
└─ 否
   ├─ 是否是构建/脚本/配置执行于 Node？
   │  ├─ 是 → tsconfig.node.json
   │  └─ 否 → 按实际运行时重新判定（禁止“先塞 app 再说”）
```

常见归属：

- `src/**/*.ts`、`src/**/*.vue`、`mock/**/*.ts`、`types/**/*.d.ts` → `tsconfig.app.json`
- `vite.config.ts`、`build/**/*.ts`、`scripts/**/*.ts` → `tsconfig.node.json`

---

## 5. 标准模板（可直接复用）

> 说明：以下路径以 `apps/web` 为例，`extends` 相对路径按真实目录调整。

### 5.1 根目录：`tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 5.2 应用目录：`tsconfig.app.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "element-plus/global"],
    "paths": {
      "@/*": ["src/*"],
      "@build/*": ["build/*"]
    },
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "mock/**/*.ts",
    "types/**/*.d.ts"
  ]
}
```

### 5.3 应用目录：`tsconfig.node.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext"],
    "types": ["node"],
    "moduleResolution": "bundler"
  },
  "include": ["vite.config.ts", "build/**/*.ts", "scripts/**/*.ts"]
}
```

### 5.4 应用目录：`tsconfig.json`

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

### 5.5 包目录示例：`packages/shared/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"]
}
```

---

## 6. 禁止项（MUST NOT）

1. **禁止** 在单一 tsconfig 同时混入 Browser 与 Node 类型。
2. **禁止** 在 `tsconfig.json` 中直接维护大量 `include`（该文件仅做 references 聚合）。
3. **禁止** 把 `process` 可见性“误放”到前端代码环境。
4. **禁止** 把 `window`、`document` 可见性“误放”到 Node 构建脚本环境。

---

## 7. 迁移流程（存量项目）

1. 抽取共享项到根级 `tsconfig.base.json`。
2. 从原单文件配置拆出 `tsconfig.app.json` 与 `tsconfig.node.json`。
3. 将业务文件与构建脚本按运行时归类到不同 `include`。
4. 新建应用级 `tsconfig.json`，仅保留 `files: []` + `references`。
5. 运行类型检查并修正污染导致的问题。

---

## 8. 验收清单（Review Checklist）

- [ ] `tsconfig.base.json` 无 `include`、无环境特定 `types`
- [ ] `tsconfig.app.json` 仅 Browser 类型（含 DOM）
- [ ] `tsconfig.node.json` 仅 Node 类型（不含 DOM）
- [ ] 应用级 `tsconfig.json` 仅聚合 references
- [ ] 路径别名在同一配置内同时声明 `baseUrl` + `paths`
- [ ] `pnpm typecheck` 通过

---

## 9. 常见问题（精简）

### Q1: 根目录是否需要 `tsconfig.json`？
A: 需要，建议占位为：

```json
{ "files": [] }
```

### Q2: 路径别名不生效？
A: 检查 `baseUrl` 与 `paths` 是否在同一配置文件，且该配置确实覆盖了目标文件。

### Q3: 为什么前端代码里出现 `process` 不报错？
A: 通常是 `node` 类型被错误引入到了 `tsconfig.app.json` 或其继承链。

---

## 10. 推荐命令

```bash
pnpm typecheck
```

如需 CI 兜底，建议将类型检查加入流水线必过项。