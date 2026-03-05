import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persistedstate'

export const store = createPinia()

store.use(piniaPluginPersist)

export function setupStore(app: App<Element>) {
  app.use(store)

  return store
}
