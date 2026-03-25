<template>
  <div class="space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">用户管理</h2>
        <p class="text-slate-500 text-sm mt-0.5">共 {{ total }} 位小程序用户</p>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索昵称或手机号..."
        clearable
        class="!w-full sm:!w-64"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        </template>
      </el-input>
      <el-button type="primary" class="!rounded-lg" @click="handleSearch">搜索</el-button>
      <el-button class="!rounded-lg" @click="handleReset">重置</el-button>
    </div>

    <!-- 用户卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="user in userList"
        :key="user.id"
        class="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      >
        <!-- 卡片头部：头像 + 昵称 + 状态 -->
        <div class="flex items-center gap-3">
          <el-avatar :src="user.avatar" :size="40" class="shrink-0 ring-2 ring-slate-100">
            {{ (user.nickname || 'U').charAt(0) }}
          </el-avatar>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800 text-sm truncate">{{ user.nickname || '未设置昵称' }}</p>
            <p v-if="user.phone" class="text-xs text-slate-400 truncate mt-0.5">{{ user.phone }}</p>
          </div>
          <!-- 状态点 -->
          <div :class="['w-2 h-2 rounded-full shrink-0', user.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300']" />
        </div>

        <!-- 数据行：收藏 + 最后登录 -->
        <div class="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-xl">
          <div class="flex-1 text-center">
            <p class="text-base font-bold text-slate-700">{{ user.favoriteCount || 0 }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">收藏</p>
          </div>
          <div class="w-px h-6 bg-slate-200" />
          <div class="flex-1 text-center">
            <p class="text-[11px] font-medium text-slate-600 leading-tight">{{ formatDateShort(user.lastLoginAt) }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">最后登录</p>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-2 mt-auto">
          <button
            class="flex-1 py-1.5 text-xs bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-colors font-medium"
            @click="handleViewDetail(user)"
          >详情</button>
          <button
            :class="['flex-1 py-1.5 text-xs rounded-lg transition-colors font-medium',
              user.status === 'active'
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white']"
            @click="handleToggleStatus(user)"
          >{{ user.status === 'active' ? '禁用' : '启用' }}</button>
        </div>
      </div>

      <!-- loading 骨架 -->
      <template v-if="loading">
        <div v-for="i in 8" :key="'sk'+i" class="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
              <div class="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div class="h-12 bg-slate-100 rounded-xl animate-pulse" />
          <div class="flex gap-2">
            <div class="flex-1 h-7 bg-slate-100 rounded-lg animate-pulse" />
            <div class="flex-1 h-7 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </template>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && userList.length === 0" class="bg-white rounded-2xl shadow-sm py-16 text-center">
      <p class="text-slate-400 text-sm">暂无用户数据</p>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="flex justify-center sm:justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </div>

  <!-- 用户详情弹窗 -->
  <el-dialog v-model="detailVisible" title="用户详情" width="90%" style="max-width: 560px" class="!rounded-2xl">
    <div v-if="userDetail" class="space-y-5">
      <!-- 用户头部 -->
      <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <el-avatar :src="userDetail.avatar" :size="60" class="ring-2 ring-white shadow-md">
          {{ (userDetail.nickname || 'U').charAt(0) }}
        </el-avatar>
        <div>
          <h3 class="font-semibold text-slate-800">{{ userDetail.nickname || '未设置昵称' }}</h3>
          <p class="text-sm text-slate-500 mt-0.5">用户 ID: {{ userDetail.id }}</p>
        </div>
        <div class="ml-auto">
          <el-tag :type="userDetail.status === 'active' ? 'success' : 'info'">
            {{ userDetail.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </div>
      </div>

      <!-- 详情信息 -->
      <div class="grid grid-cols-2 gap-3">
        <div v-for="item in detailFields" :key="item.label" class="bg-slate-50 rounded-xl p-3">
          <p class="text-xs text-slate-400 mb-1">{{ item.label }}</p>
          <p class="text-sm font-medium text-slate-700">{{ item.value || '-' }}</p>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div v-if="userDetail.favorites?.length">
        <h4 class="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
          收藏的资料（{{ userDetail.favorites.length }}）
        </h4>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="fav in userDetail.favorites"
            :key="fav.id"
            class="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700"
          >
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
            {{ fav.title }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, getUserById, updateUserStatus } from '@/api/user'

const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const loading = ref(false)
const detailVisible = ref(false)
const userDetail = ref(null)

const detailFields = computed(() => [
  { label: '联系电话', value: userDetail.value?.phone },
  { label: '邮箱', value: userDetail.value?.email },
  { label: '收藏数量', value: `${userDetail.value?.favoriteCount || 0} 个` },
  { label: '注册时间', value: formatDate(userDetail.value?.createdAt) },
  { label: '最后登录', value: formatDate(userDetail.value?.lastLoginAt) },
])

const loadUsers = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, pageSize: pageSize.value }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    const res = await getUsers(params)
    userList.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const handleSearch = () => { currentPage.value = 1; loadUsers() }
const handleReset = () => { searchKeyword.value = ''; currentPage.value = 1; loadUsers() }
const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1; loadUsers() }
const handleCurrentChange = (val) => { currentPage.value = val; loadUsers() }

const handleViewDetail = async (row) => {
  try {
    const res = await getUserById(row.id)
    userDetail.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取用户详情失败，请稍后重试')
  }
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}用户「${row.nickname}」吗？`, '确认操作', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    loadUsers()
  }).catch(() => {})
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatDateShort = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

onMounted(loadUsers)
</script>
