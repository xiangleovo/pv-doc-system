<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-full max-w-md">
      <!-- Logo & 标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400 mb-4 shadow-lg shadow-yellow-400/30">
          <svg class="w-9 h-9 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">光伏资料管理系统</h1>
        <p class="text-slate-400 mt-1 text-sm">管理员登录</p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username" class="mb-5">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              class="login-input"
            >
              <template #prefix>
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password" class="mb-6">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              show-password
              class="login-input"
            >
              <template #prefix>
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="w-full !rounded-xl !h-12 !text-base !font-semibold"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form>
      </div>

      <p class="text-center text-slate-500 text-xs mt-6">光伏组件资料管理系统 · 内部专用</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin } from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    loading.value = true
    const res = await adminLogin(loginForm)
    setToken(res.data.token)
    setUserInfo(res.data.user)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}
.login-input :deep(.el-input__wrapper:hover),
.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(255, 255, 255, 0.4) !important;
  background: rgba(255, 255, 255, 0.12) !important;
}
.login-input :deep(.el-input__inner) {
  color: #fff !important;
}
.login-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}
.login-input :deep(.el-input__password) {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
