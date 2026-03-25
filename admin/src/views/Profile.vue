<template>
  <div class="max-w-2xl space-y-5">
    <!-- 页头 -->
    <div>
      <h2 class="text-xl font-bold text-slate-800">个人设置</h2>
      <p class="text-slate-500 text-sm mt-0.5">修改您的个人信息和登录密码</p>
    </div>

    <!-- 个人信息 -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
        <div class="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {{ userInitial }}
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">{{ currentUser.nickname || currentUser.username }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <el-tag :type="currentUser.role === 'super_admin' ? 'danger' : 'primary'" size="small">
              {{ currentUser.role === 'super_admin' ? '超级管理员' : '管理员' }}
            </el-tag>
            <span class="text-xs text-slate-400">{{ currentUser.username }}</span>
          </div>
        </div>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="联系电话（可选）" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱（可选）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="!rounded-xl !px-6" :loading="saving" @click="handleUpdateProfile">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 修改密码 -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <h3 class="font-semibold text-slate-800 mb-5 flex items-center gap-2">
        <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
        修改密码
      </h3>
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="90px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="!rounded-xl !px-6" :loading="changingPwd" @click="handleUpdatePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateAdmin } from '@/api/admin'

const formRef = ref(null)
const passwordFormRef = ref(null)
const saving = ref(false)
const changingPwd = ref(false)

const currentUser = ref({ username: '', nickname: '', role: '', phone: '', email: '', id: null })
const userInitial = computed(() => (currentUser.value.nickname || currentUser.value.username || 'A').charAt(0).toUpperCase())

const form = ref({ nickname: '', phone: '', email: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (_, value, cb) => {
        if (value !== passwordForm.value.newPassword) cb(new Error('两次密码不一致'))
        else cb()
      }, trigger: 'blur'
    }
  ]
}

const getUserInfo = () => {
  try {
    const str = localStorage.getItem('userInfo') || localStorage.getItem('user') || '{}'
    const user = JSON.parse(str)
    currentUser.value = user
    form.value = { nickname: user.nickname || '', phone: user.phone || '', email: user.email || '' }
  } catch {}
}

const handleUpdateProfile = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await updateAdmin(currentUser.value.id, form.value)
    ElMessage.success('信息更新成功')
    const updated = { ...currentUser.value, ...form.value }
    localStorage.setItem('userInfo', JSON.stringify(updated))
    currentUser.value = updated
  } finally { saving.value = false }
}

const handleUpdatePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return
  changingPwd.value = true
  try {
    await updateAdmin(currentUser.value.id, {
      oldPassword: passwordForm.value.oldPassword,
      password: passwordForm.value.newPassword,
    })
    ElMessage.success('密码修改成功，请重新登录')
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } finally { changingPwd.value = false }
}

onMounted(getUserInfo)
</script>
