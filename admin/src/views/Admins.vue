<template>
  <div class="space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">管理员管理</h2>
        <p class="text-slate-500 text-sm mt-0.5">管理系统后台账号</p>
      </div>
      <el-button v-if="isSuperAdmin" type="primary" class="!rounded-xl !px-5" @click="handleAdd">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        添加管理员
      </el-button>
    </div>

    <!-- 管理员卡片网格 -->
    <div v-if="adminList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="admin in adminList"
        :key="admin.id"
        class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
      >
        <!-- 卡片头部：头像 + 名称 + 角色 -->
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
            :class="admin.role === 'super_admin' ? 'bg-gradient-to-br from-red-400 to-rose-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'"
          >
            {{ (admin.nickname || admin.username || 'A').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800 text-sm truncate">{{ admin.nickname || admin.username }}</p>
            <p class="text-xs text-slate-400 truncate mt-0.5">@{{ admin.username }}</p>
          </div>
          <!-- 状态点 -->
          <div :class="['w-2 h-2 rounded-full shrink-0', admin.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300']" />
        </div>

        <!-- 标签行 -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <el-tag :type="admin.role === 'super_admin' ? 'danger' : 'primary'" size="small">
            {{ admin.role === 'super_admin' ? '超级管理员' : '管理员' }}
          </el-tag>
          <el-tag :type="admin.status === 'active' ? 'success' : 'info'" size="small">
            {{ admin.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </div>

        <!-- 联系信息 -->
        <div class="space-y-1">
          <p v-if="admin.phone" class="text-xs text-slate-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
            {{ admin.phone }}
          </p>
          <p v-if="admin.email" class="text-xs text-slate-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            {{ admin.email }}
          </p>
          <p v-if="!admin.phone && !admin.email" class="text-xs text-slate-300">暂无联系方式</p>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-2 pt-1 border-t border-slate-100 mt-auto">
          <button
            class="flex-1 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium disabled:opacity-40"
            @click="handleEdit(admin)"
            :disabled="admin.role === 'super_admin' && !isSuperAdmin"
          >编辑</button>
          <button
            class="flex-1 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium disabled:opacity-40"
            @click="handleDelete(admin)"
            :disabled="admin.role === 'super_admin' || admin.id === currentUserId"
          >删除</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="adminList.length === 0" class="bg-white rounded-2xl shadow-sm py-16 text-center">
      <p class="text-slate-400 text-sm">暂无管理员数据</p>
    </div>
  </div>

  <!-- 对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑管理员' : '添加管理员'"
    width="90%"
    style="max-width: 480px"
    class="!rounded-2xl"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" class="pt-2">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" :placeholder="isEdit ? '留空则不修改' : '请输入密码'" show-password />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" class="!w-full">
          <el-option label="管理员" value="admin" />
          <el-option label="超级管理员" value="super_admin" :disabled="!isSuperAdmin" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="联系电话（可选）" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="邮箱（可选）" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.status" active-value="active" inactive-value="inactive" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex gap-3 justify-end">
        <el-button class="!rounded-xl" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="!rounded-xl !px-6" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/api/admin'

const adminList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const currentUser = computed(() => {
  try { return JSON.parse(localStorage.getItem('userInfo') || localStorage.getItem('user') || '{}') } catch { return {} }
})
const currentUserId = computed(() => currentUser.value?.id)
const isSuperAdmin = computed(() => currentUser.value?.role === 'super_admin')

const form = ref({ id: null, username: '', password: '', nickname: '', role: 'admin', phone: '', email: '', status: 'active' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadAdmins = async () => {
  const res = await getAdmins()
  adminList.value = res.data
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, username: '', password: '', nickname: '', role: 'admin', phone: '', email: '', status: 'active' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row, password: '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    const submitData = { ...form.value }
    if (isEdit.value && !submitData.password) delete submitData.password
    if (isEdit.value) {
      await updateAdmin(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createAdmin(submitData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadAdmins()
  } catch (e) { console.error(e) }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除管理员「${row.nickname || row.username}」吗？`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    await deleteAdmin(row.id)
    ElMessage.success('删除成功')
    loadAdmins()
  }).catch(() => {})
}

onMounted(loadAdmins)
</script>
