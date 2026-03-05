import JSEncrypt from 'jsencrypt'
import { publicKeyByRsa } from '@web/api/auth'

let publicKeyValue = ''
let pendingRequest: Promise<string> | null = null

/**
 * 获取 RSA 公钥
 */
async function getPublicKey(): Promise<string> {
  if (publicKeyValue) {
    return publicKeyValue
  }

  if (pendingRequest) {
    return pendingRequest
  }

  pendingRequest = publicKeyByRsa()
    .then((res) => {
      publicKeyValue = res.data
      return publicKeyValue
    })
    .catch((err) => {
      console.error('获取 RSA 公钥失败:', err)
      return ''
    })
    .finally(() => {
      pendingRequest = null
    })

  return pendingRequest
}

/**
 * RSA 加密
 */
export async function rsaEncrypt(text: string): Promise<string> {
  const key = await getPublicKey()
  if (!key) {
    console.error('RSA 公钥为空，无法加密')
    return ''
  }

  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(key)
  const result = encrypt.encrypt(text)
  return result || ''
}

/**
 * 设置公钥（用于测试或手动设置）
 */
export function setPublicKey(key: string) {
  publicKeyValue = key
}
