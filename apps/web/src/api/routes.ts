import { http } from '@web/utils/http'

type Result = {
  success: boolean
  data: Array<any>
}

export const getAsyncRoutes = () => {
  return http.request<Result>('get', '/get-async-routes')
}
