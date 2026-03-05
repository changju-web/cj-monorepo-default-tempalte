import Axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import qs from 'qs'

const axiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  // 请求超时时间
  timeout: 60 * 1000,
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
})

// 响应拦截器：自动解包 AxiosResponse，直接返回 data
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 创建类型安全的 service 对象
export const service = {
  request: <T = any>(config: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.request(config) as Promise<T>
  },
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.get(url, config) as Promise<T>
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.post(url, data, config) as Promise<T>
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.put(url, data, config) as Promise<T>
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.delete(url, config) as Promise<T>
  }
}


