declare module 'jsencrypt' {
  export default class JSEncrypt {
    setPublicKey(key: string): void
    setPrivateKey(key: string): void
    encrypt(plainText: string): string | false
    decrypt(cipherText: string): string | false
  }
}

