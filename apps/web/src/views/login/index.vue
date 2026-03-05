<script setup lang="ts">
import Motion from './utils/motion'
import { useRouter } from 'vue-router'
import { message } from '@web/utils/message'
import { loginRules } from './utils/rule'
import { ref, reactive, toRaw, onMounted } from 'vue'
import { debounce } from '@pureadmin/utils'
import { useNav } from '@web/layout/hooks/useNav'
import { useEventListener } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { useLayout } from '@web/layout/hooks/useLayout'
import { useUserStoreHook } from '@web/store/modules/user'
import { initRouter, getTopMenu } from '@web/router/utils'
import { bg, avatar, illustration } from './utils/static'
import { useRenderIcon } from '@web/components/ReIcon/src/hooks'
import { useDataThemeChange } from '@web/layout/hooks/useDataThemeChange'
import { captcha, enableCaptcha, type LoginParams } from '@web/api/auth'

import dayIcon from '@web/assets/svg/day.svg?component'
import darkIcon from '@web/assets/svg/dark.svg?component'
import Lock from '~icons/ri/lock-fill'
import User from '~icons/ri/user-3-fill'

defineOptions({
  name: 'Login'
})

const router = useRouter()
const loading = ref(false)
const disabled = ref(false)
const ruleFormRef = ref<FormInstance>()

const { initStorage } = useLayout()
initStorage()

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange()
dataThemeChange(overallStyle.value)
const { title } = useNav()

// 验证码相关状态
const hasCaptcha = ref(false)
const captchaImage = ref('')

const ruleForm = reactive({
  username: 'admin',
  password: 'admin123',
  captcha_code: '',
  captcha_uuid: ''
})

/** 获取验证码图片 */
const getCaptcha = async () => {
  try {
    const res = await captcha()
    captchaImage.value = `data:image;base64,${res.data.captcha_img}`
    ruleForm.captcha_uuid = res.data.captcha_uuid
    ruleForm.captcha_code = ''
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

/** 刷新验证码 */
const refreshCode = () => {
  getCaptcha()
}

/** 检查是否需要验证码 */
const checkEnableCaptcha = async () => {
  try {
    const res = await enableCaptcha()
    hasCaptcha.value = res.data
    if (hasCaptcha.value) {
      await getCaptcha()
    }
  } catch (error) {
    console.error('检查验证码状态失败:', error)
  }
}

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      loading.value = true
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password,
          captcha_code: ruleForm.captcha_code,
          captcha_uuid: ruleForm.captcha_uuid
        } as LoginParams)
        .then((res) => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message('登录成功', { type: 'success' })
                })
                .finally(() => (disabled.value = false))
            })
          } else {
            message('登录失败', { type: 'error' })
            // 登录失败，刷新验证码
            if (hasCaptcha.value) {
              refreshCode()
            }
          }
        })
        .catch((error) => {
          message('登录失败: ' + (error.message || '未知错误'), { type: 'error' })
          // 登录失败，刷新验证码
          if (hasCaptcha.value) {
            refreshCode()
          }
        })
        .finally(() => (loading.value = false))
    }
  })
}

const immediateDebounce: any = debounce((formRef) => onLogin(formRef), 1000, true)

useEventListener(document, 'keydown', ({ code }) => {
  if (['Enter', 'NumpadEnter'].includes(code) && !disabled.value && !loading.value)
    immediateDebounce(ruleFormRef.value)
})

// 组件挂载时检查验证码状态
onMounted(checkEnableCaptcha)
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-hidden">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion v-if="hasCaptcha" :delay="200">
              <el-form-item
                prop="captcha_code"
                :rules="[
                  {
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                  }
                ]"
              >
                <div class="flex w-full gap-2">
                  <el-input
                    v-model="ruleForm.captcha_code"
                    clearable
                    placeholder="验证码"
                    class="flex-1"
                  />
                  <div
                    class="captcha-image"
                    :title="'点击刷新'"
                    @click="refreshCode"
                  >
                    <img
                      v-if="captchaImage"
                      :src="captchaImage"
                      alt="验证码"
                      class="h-full w-full cursor-pointer rounded"
                    />
                  </div>
                </div>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4!"
                size="default"
                type="primary"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('@web/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.captcha-image {
  width: 100px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background-color: #fdfdfd;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
