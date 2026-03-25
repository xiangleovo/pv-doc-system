<template>
  <div class="space-y-6">

    <!-- 欢迎横幅 -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e2742] via-[#253155] to-[#1a3a6b] p-6 text-white">
      <!-- 装饰光圈 -->
      <div class="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5"></div>
      <div class="absolute -bottom-8 right-24 w-32 h-32 rounded-full bg-amber-400/10"></div>
      <div class="absolute top-4 right-40 w-4 h-4 rounded-full bg-amber-400/30"></div>

      <div class="relative flex items-center justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-5 bg-amber-400 rounded-full"></div>
            <h2 class="text-lg font-bold">你好，{{ userInfo?.nickname || userInfo?.username || '管理员' }}</h2>
          </div>
          <p class="text-slate-300 text-sm ml-3.5">欢迎使用光伏组件资料管理系统</p>
        </div>
        <div class="text-right">
          <p class="text-slate-400 text-xs">{{ today }}</p>
          <p class="text-slate-200 font-medium text-sm mt-0.5">PV-Doc System v1.1</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        @click="$router.push(stat.link)"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-slate-400 text-xs font-medium">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-slate-800 mt-1.5 tabular-nums">
              <span v-if="loading" class="inline-block w-10 h-7 bg-slate-100 rounded-lg animate-pulse"></span>
              <span v-else>{{ stat.value }}</span>
            </p>
          </div>
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            stat.iconBg
          ]">
            <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
          <span>点击管理</span>
          <ChevronRightIcon class="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>

    <!-- 快速操作 & 系统说明 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- 快速操作 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-amber-400 rounded-full inline-block"></span>
          快速操作
        </h3>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="action in quickActions"
            :key="action.title"
            class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer group"
            @click="$router.push(action.link)"
          >
            <div :class="['w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-105', action.bg]">
              <component :is="action.icon" :class="['w-4 h-4', action.color]" />
            </div>
            <div>
              <p class="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{{ action.title }}</p>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{{ action.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统说明 -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
          使用说明
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="tip in tips"
            :key="tip.title"
            class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
          >
            <div :class="['w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', tip.bg]">
              <component :is="tip.icon" :class="['w-4 h-4', tip.color]" />
            </div>
            <div>
              <p class="text-[13px] font-medium text-slate-700">{{ tip.title }}</p>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{{ tip.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDocuments, getCategories, getBrands } from '@/api'
import { getUsers } from '@/api/user'
import { getUserInfo } from '@/utils/auth'
import {
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
  UsersIcon,
  PlusIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const userInfo = getUserInfo()
const loading = ref(true)
const stats = ref({ documentCount: 0, categoryCount: 0, brandCount: 0, userCount: 0 })
// 动画显示值（从 0 滚动到目标值）
const animatedStats = ref({ documentCount: 0, categoryCount: 0, brandCount: 0, userCount: 0 })

const today = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

// easeOutQuart 缓动
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

// 对单个字段做计数动画
const animateCount = (key, target) => {
  if (target === 0) return
  const duration = 900 // ms
  const start = performance.now()
  const tick = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    animatedStats.value[key] = Math.round(easeOutQuart(progress) * target)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const statCards = computed(() => [
  { label: '资料总数', value: animatedStats.value.documentCount, link: '/documents', icon: DocumentTextIcon, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { label: '分类数量', value: animatedStats.value.categoryCount, link: '/categories', icon: FolderIcon, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: '品牌数量', value: animatedStats.value.brandCount, link: '/brands', icon: TagIcon, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: '用户总数', value: animatedStats.value.userCount, link: '/users', icon: UsersIcon, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
])

const quickActions = [
  { title: '添加资料', desc: '上传新的规格书或文档', link: '/documents', icon: PlusIcon, bg: 'bg-blue-50', color: 'text-blue-500' },
  { title: '管理分类', desc: '编辑资料分类结构', link: '/categories', icon: FolderIcon, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  { title: '用户管理', desc: '查看用户使用情况', link: '/users', icon: UsersIcon, bg: 'bg-violet-50', color: 'text-violet-500' },
  { title: '个人设置', desc: '修改密码和个人信息', link: '/profile', icon: Cog6ToothIcon, bg: 'bg-slate-100', color: 'text-slate-500' },
]

const tips = [
  { title: '分类管理', desc: '先建好分类层级，再添加资料，便于小程序端归类展示。', icon: FolderIcon, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  { title: '资料管理', desc: '添加资料时填写 PDF 链接，资料按名称首字母自动排序。', icon: DocumentTextIcon, bg: 'bg-blue-50', color: 'text-blue-500' },
  { title: '品牌管理', desc: '为每个品牌上传 Logo，在小程序资料卡片中展示标识。', icon: TagIcon, bg: 'bg-amber-50', color: 'text-amber-500' },
  { title: '使用提示', desc: '用户管理支持禁用异常账号，查看收藏偏好以优化内容。', icon: InformationCircleIcon, bg: 'bg-slate-100', color: 'text-slate-500' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [docRes, catRes, brandRes, userRes] = await Promise.allSettled([
      getDocuments({ page: 1, pageSize: 1 }),
      getCategories(),
      getBrands(),
      getUsers({ page: 1, pageSize: 1 })
    ])
    if (docRes.status === 'fulfilled') stats.value.documentCount = docRes.value.data.total
    if (catRes.status === 'fulfilled') stats.value.categoryCount = catRes.value.data.length
    if (brandRes.status === 'fulfilled') stats.value.brandCount = brandRes.value.data.length
    if (userRes.status === 'fulfilled') stats.value.userCount = userRes.value.data.total
  } finally {
    loading.value = false
    // 数据加载完后启动计数动画
    animateCount('documentCount', stats.value.documentCount)
    animateCount('categoryCount', stats.value.categoryCount)
    animateCount('brandCount', stats.value.brandCount)
    animateCount('userCount', stats.value.userCount)
  }
}

onMounted(loadData)
</script>
