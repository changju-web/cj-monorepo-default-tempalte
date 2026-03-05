import { defineStore } from 'pinia'
import { type userType, store, router, resetRouter, routerArrays, storageLocal } from '../utils'
import type { UserResult, RefreshTokenResult } from '@web/api/user'
import { useMultiTagsStoreHook } from './multiTags'
import { type DataInfo, setToken, removeToken, userKey } from '@web/utils/auth'
import { rsaEncrypt } from '@web/utils/crypto/rsa'
import {
  login as loginApi,
  logout as logoutApi,
  type LoginParams,
  type LoginResult
} from '@web/api/auth'

export const useAuthStore = defineStore('pure-auth', {
  state: () => ({}),
  actions: {
    /** 登入 */
    loginByUsername(data: LoginParams) {
      return new Promise<UserResult>((resolve, reject) => {
        // RSA 加密密码
        rsaEncrypt(data.password)
          .then((encryptedPassword) => {
            // 调用业务登录 API
            return loginApi({
              username: data.username,
              password: encryptedPassword,
              captcha_code: data.captcha_code,
              captcha_uuid: data.captcha_uuid,
            })
          })
          .then((res: LoginResult) => {
            if (res.ok && res.data) {
              // 适配业务 API 响应格式到框架格式
              const adaptedData = {
                accessToken: res.data.access_token,
                refreshToken: res.data.refresh_token,
                expires: new Date(Date.now() + res.data.expires_in * 1000),
                // 保留用户信息的默认值，登录成功后通过 myInfo 获取
                avatar: '',
                username: data.username,
                nickname: '',
                roles: [],
                permissions: []
              }
              setToken(adaptedData)
              resolve({ success: true, data: adaptedData })
            } else {
              resolve({ success: false, data: null as any })
            }
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    /** 获取当前用户信息 */
    myInfo() {},

    /** 清空登录状态 */
    clearLoginStatus() {},
    logOut() {}
  }
})

export function useAuthStoreHook() {
  return useAuthStore(store)
}
