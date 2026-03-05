/// <reference types="vite/client" />

/**
 * 全局自定义环境变量的类型声明
 */
interface ViteEnv {
  /** 平台标题 */
  readonly VITE_APP_TITLE: string
  /** 平台本地运行端口号 */
  readonly VITE_APP_PORT: number
  /** 请求地址(用于反向代理请求) */
  readonly VITE_APP_API_URL: string
  /** 请求前缀 */
  readonly VITE_APP_BASE_URL: string
  /** 路径前缀 */
  readonly VITE_APP_PATH: string
  /** 是否隐藏首页 */
  readonly VITE_HIDE_HOME: boolean
  /** 压缩方式 */
  readonly VITE_COMPRESSION: ViteCompression
}

/**
 * 全局自定义环境变量的类型声明
 * @see {@link https://vitejs.cn/vite3-cn/guide/env-and-mode.html}
 */
interface ImportMetaEnv extends ViteEnv {}

/**
 * 打包压缩格式的类型声明
 */
type ViteCompression =
  | 'none'
  | 'gzip'
  | 'brotli'
  | 'both'
  | 'gzip-clear'
  | 'brotli-clear'
  | 'both-clear'

interface ImportMeta {
  readonly env: ImportMetaEnv
}
