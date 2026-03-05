import { service } from '@web/service'
import type { Res } from '@gx-web/tool'

export interface LoginParams {
  username: string
  password: string
  captcha_code?: string
  captcha_uuid?: string
  grant_type?: string
  scope?: string
}

export interface LoginData {
  access_token: string
  refresh_token: string
  expires_in: number
}

export type LoginResult = Res<LoginData>

export interface CaptchaData {
  captcha_img: string
  captcha_uuid: string
}

export type CaptchaResult = Res<CaptchaData>

const APP_CLIENT =
  'gx-cloud AQAzMiJdACn+oy9ddVYzexJCTBCEjGZz3T9ge4TtGM3AG8QBllsklghBw1bOT+o59+gg8ueNUPNfn4RB6a/xZAcVEdbNAke2+MoRhDtniRYFKNfVBQyWr+0CebO+3Y7OHFFARE407SDYKzZoVeoNBWpbwCDk/xhYowEs1BKEQsyQE6MpJrb89BmuUUAj8oNB1SPcjOLz8qEyCBLhDW1gjVfoa7NmC+iPdLcRpQAJIYtvLOo4hd83AIzDp0iTr30XxyaClkCXQiyhJ/ovGxsOf58ZV96xmewGNc1nX6rKZfFL8pQPgIN5g16NMF3pIbivNQwtfO6ohJjjR0TPouBrZyS3FoPOZaQAdgn7KSZu+dCNX7K/IrShWay+PD9QJUi20lqFSfDwMzw4zuvpCloQ3/pdaKFKke5cOIQNXsDU+Sg8hw=='

const GRANT_TYPE = 'gx_cloud'

/**
 * 登录
 */
export const login = (data: LoginParams) => {
  return service.request<LoginResult>({
    method: 'post',
    url: '/auth/oauth/login',
    data: {
      ...data,
      grant_type: GRANT_TYPE
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: APP_CLIENT
    },
    transformRequest: [
      (data) => {
        return new URLSearchParams(data).toString()
      }
    ]
  })
}

/**
 * 刷新 Token
 */
export const refreshToken = (refreshToken: string) => {
  return service.request<LoginResult>({
    method: 'post',
    url: '/auth/oauth/login',
    data: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: APP_CLIENT
    },
    transformRequest: [
      (data) => {
        return new URLSearchParams(data as any).toString()
      }
    ]
  })
}

/**
 * 获取验证码图片
 */
export const captcha = () => {
  return service.request<CaptchaResult>({
    method: 'get',
    url: '/captcha'
  })
}

/**
 * 检查是否需要验证码
 */
export const enableCaptcha = () => {
  return service.request<Res<boolean>>({
    method: 'get',
    url: '/enableCaptcha'
  })
}

/**
 * 获取 RSA 公钥
 */
export const publicKeyByRsa = () => {
  return service.request<Res<string>>({
    method: 'get',
    url: '/rsa/publicKey'
  })
}

/**
 * 获取 SM2 公钥
 */
export const publicKeyBySm2 = () => {
  return service.request<Res<string>>({
    method: 'get',
    url: '/sm2/publicKey'
  })
}

/**
 * 登出
 */
export const logout = () => {
  return service.request<Res<void>>({
    method: 'post',
    url: '/auth/oauth/logout'
  })
}
