import dayjs from 'dayjs'
import { readdir, stat } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { sum, formatBytes } from '@pureadmin/utils'
import { name, version, engines, dependencies, devDependencies } from '../package.json'

/** 启动`node`进程时所在工作目录的绝对路径 */
const root: string = process.cwd()

/**
 * @description 根据可选的路径片段生成一个新的绝对路径
 * @param dir 路径片段，默认`build`
 * @param metaUrl 模块的完整`url`，如果在`build`目录外调用必传`import.meta.url`
 */
const pathResolve = (dir = '.', metaUrl = import.meta.url) => {
  // 当前文件目录的绝对路径
  const currentFileDir = dirname(fileURLToPath(metaUrl))
  // build 目录的绝对路径
  const buildDir = resolve(currentFileDir, 'build')
  // 解析的绝对路径
  const resolvedPath = resolve(currentFileDir, dir)
  // 检查解析的绝对路径是否在 build 目录内
  if (resolvedPath.startsWith(buildDir)) {
    // 在 build 目录内，返回当前文件路径
    return fileURLToPath(metaUrl)
  }
  // 不在 build 目录内，返回解析后的绝对路径
  return resolvedPath
}

/** 设置别名 */
const alias: Record<string, string> = {
  '@web': pathResolve('../src'),
  '@web-build': pathResolve()
}

/** 平台的名称、版本、运行所需的`node`和`pnpm`版本、依赖、最后构建时间的类型提示 */
const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  lastBuildTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 处理环境变量
 * @description 将 .env 文件中的字符串值转换为对应的 TypeScript 类型
 * @param envConf - 从 loadEnv 加载的原始环境变量对象
 * @returns 处理后的环境变量对象，类型为 ImportMetaEnv
 * ```
 */
const wrapperEnv = (envConf: Recordable) => {
  return Object.keys(envConf).reduce((obj, key) => {
    let value = envConf[key].replace(/\\n/g, '\n')

    // 转换布尔值
    if (['true', 'false'].includes(value)) {
      value = Boolean(value)
    }

    // 端口转换数字类型
    if (key === 'VITE_APP_PORT') {
      value = Number(value)
    }

    // 赋值到返回对象
    obj[key] = value

    // 设置Node环境变量
    if (typeof value === 'string') {
      process.env[key] = value
    } else if (typeof value === 'object') {
      process.env[key] = JSON.stringify(value)
    }

    return obj
  }, {}) as ViteEnv
}

const fileListTotal: number[] = []

/** 获取指定文件夹中所有文件的总大小 */
const getPackageSize = (options) => {
  const { folder = 'dist', callback, format = true } = options
  readdir(folder, (err, files: string[]) => {
    if (err) throw err
    let count = 0
    const checkEnd = () => {
      ++count == files.length &&
        callback(format ? formatBytes(sum(fileListTotal)) : sum(fileListTotal))
    }
    files.forEach((item: string) => {
      stat(`${folder}/${item}`, async (err, stats) => {
        if (err) throw err
        if (stats.isFile()) {
          fileListTotal.push(stats.size)
          checkEnd()
        } else if (stats.isDirectory()) {
          getPackageSize({
            folder: `${folder}/${item}/`,
            callback: checkEnd
          })
        }
      })
    })
    files.length === 0 && callback(0)
  })
}

export { root, pathResolve, alias, __APP_INFO__, wrapperEnv, getPackageSize }
