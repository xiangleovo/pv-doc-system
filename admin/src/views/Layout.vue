<template>
  <!-- 移动端遮罩 -->
  <transition name="fade">
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
      @click="mobileMenuOpen = false"
    />
  </transition>

  <!-- 整体禁止横向滚动 -->
  <div class="flex h-screen bg-[#f4f6fb] overflow-hidden w-screen max-w-[100vw]">

    <!-- ───── 侧边栏 ───── -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out',
        'bg-gradient-to-b from-[#1e2742] via-[#1a2235] to-[#141c2e]',
        sidebarCollapsed ? 'w-[70px]' : 'w-[220px]',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'shadow-[4px_0_24px_rgba(0,0,0,0.15)]'
      ]"
    >
      <!-- Logo 区域 -->
      <div class="flex items-center h-[64px] px-4 shrink-0 select-none">
        <div class="flex items-center gap-3 overflow-hidden w-full">
          <!-- logo 图标 -->
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.998.539-1.875 1.328-2.384a4 4 0 10-4.657 0A4.002 4.002 0 0110 14c0-.002 0-.002 0 0h2z"/>
            </svg>
          </div>
          <transition name="slide-fade">
            <div v-if="!sidebarCollapsed" class="overflow-hidden">
              <p class="text-white font-bold text-[14px] whitespace-nowrap leading-tight">光伏资料</p>
              <p class="text-slate-400 text-[11px] whitespace-nowrap">管理系统</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="mx-4 h-px bg-white/5 shrink-0" />

      <!-- 导航菜单 -->
      <nav ref="navRef" class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 scrollbar-hide relative">
        <!-- 滑动高亮背景块 -->
        <div
          v-if="indicatorStyle.height > 0"
          class="nav-indicator absolute left-2.5 right-2.5 rounded-xl bg-white/10 pointer-events-none"
          :style="{
            height: indicatorStyle.height + 'px',
            transform: `translateY(${indicatorStyle.top}px)`,
          }"
        />

        <div class="space-y-0.5 relative">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :ref="el => setMenuRef(el, item.path)"
            :to="item.path"
            @click="mobileMenuOpen = false"
            :class="[
              'flex items-center gap-3 rounded-xl transition-colors duration-150 group relative cursor-pointer select-none no-underline',
              sidebarCollapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5',
              isActive(item.path) ? 'text-white' : 'text-slate-400 hover:text-white'
            ]"
          >
            <!-- 激活左侧竖条 -->
            <transition name="bar-fade">
              <div
                v-if="isActive(item.path)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-full"
              />
            </transition>

            <!-- 图标容器 -->
            <div :class="[
              'flex items-center justify-center rounded-lg shrink-0 transition-all duration-200',
              sidebarCollapsed ? 'w-9 h-9' : 'w-7 h-7',
              isActive(item.path) ? 'bg-amber-400/20 text-amber-400' : 'text-slate-400 group-hover:text-white'
            ]">
              <component :is="item.icon" class="w-[18px] h-[18px]" />
            </div>

            <transition name="slide-fade">
              <span v-if="!sidebarCollapsed" class="text-[13px] font-medium whitespace-nowrap">
                {{ item.title }}
              </span>
            </transition>

            <!-- 收缩时 tooltip -->
            <div
              v-if="sidebarCollapsed"
              class="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1e2742] text-white text-xs rounded-lg whitespace-nowrap
                     opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-lg
                     border border-white/10 z-50 translate-x-1 group-hover:translate-x-0"
            >
              {{ item.title }}
            </div>
          </router-link>
        </div>
      </nav>

      <!-- 底部用户区 -->
      <div class="mx-2.5 mb-4 shrink-0">
        <div class="h-px bg-white/5 mb-3" />
        <div
          :class="[
            'flex items-center rounded-xl p-2 cursor-pointer group transition-all duration-150 hover:bg-white/10',
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          ]"
          @click="handleLogout"
        >
          <!-- 头像 -->
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {{ userInitial }}
          </div>
          <transition name="slide-fade">
            <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
              <p class="text-white text-[12px] font-medium truncate leading-tight">{{ userInfo?.nickname || userInfo?.username || '管理员' }}</p>
              <p class="text-slate-500 text-[11px] group-hover:text-red-400 transition-colors mt-0.5">退出登录</p>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- ───── 主内容区 ───── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- 顶部导航 -->
      <header
        :class="[
          'h-[64px] bg-white flex items-center px-5 gap-4 shrink-0 transition-shadow duration-200',
          headerShadow ? 'shadow-md shadow-slate-200/80' : 'border-b border-slate-100/80'
        ]"
      >
        <!-- 移动端菜单按钮 -->
        <button
          class="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          @click="mobileMenuOpen = true"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <!-- 桌面端收缩按钮 -->
        <button
          class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <Bars3Icon class="w-4.5 h-4.5" />
        </button>

        <!-- 页面标题 + 面包屑 -->
        <div class="flex-1 min-w-0 flex items-center gap-2">
          <span class="text-slate-300 text-sm hidden sm:inline">/</span>
          <h1 class="text-[14px] font-semibold text-slate-700 truncate page-title-transition">{{ currentPageTitle }}</h1>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-2">
          <!-- 时间显示 -->
          <div class="hidden md:flex flex-col items-end mr-2">
            <span class="text-[11px] text-slate-400">{{ currentTime }}</span>
          </div>

          <!-- 系统设置按钮 -->
          <button
            class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
            title="系统设置"
            @click="$router.push('/settings')"
          >
            <Cog6ToothIcon class="w-4.5 h-4.5" />
          </button>

          <el-dropdown @command="handleDropdown">
            <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {{ userInitial }}
              </div>
              <span class="hidden sm:inline text-[13px] text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                {{ userInfo?.nickname || userInfo?.username }}
              </span>
              <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:rotate-180 duration-200" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <UserIcon class="w-4 h-4 mr-2 text-slate-500" />个人设置
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2 text-red-400" />
                  <span class="text-red-500">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main ref="mainRef" class="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-6 min-w-0 max-w-full" @scroll="onMainScroll">
        <router-view :key="route.path" v-slot="{ Component }">
          <component :is="Component" class="page-enter" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getUserInfo, removeToken, removeUserInfo } from '@/utils/auth'
import {
  Bars3Icon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  TagIcon,
  UsersIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const icons = {
  home: HomeIcon,
  folder: FolderIcon,
  document: DocumentTextIcon,
  tag: TagIcon,
  users: UsersIcon,
  shield: ShieldCheckIcon,
}

const router = useRouter()
const route = useRoute()
const userInfo = getUserInfo()
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const currentTime = ref('')
const headerShadow = ref(false)
const mainRef = ref(null)
const navRef = ref(null)

// ── 时钟 ──
let timer = null
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
onMounted(() => { updateTime(); timer = setInterval(updateTime, 1000) })
onUnmounted(() => clearInterval(timer))

// ── header 滚动投影 ──
const onMainScroll = () => {
  headerShadow.value = (mainRef.value?.scrollTop ?? 0) > 8
}

// ── 导航滑动指示器 ──
const menuRefs = ref({})
const indicatorStyle = ref({ top: 0, height: 0 })

const setMenuRef = (el, path) => {
  if (el) menuRefs.value[path] = el.$el ?? el
}

const updateIndicator = () => {
  nextTick(() => {
    const activePath = menuItems.find(m => isActive(m.path))?.path
    const el = activePath ? menuRefs.value[activePath] : null
    const nav = navRef.value
    if (!el || !nav) { indicatorStyle.value = { top: 0, height: 0 }; return }
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    indicatorStyle.value = {
      top: elRect.top - navRect.top + nav.scrollTop,
      height: elRect.height,
    }
  })
}

watch(() => route.path, updateIndicator, { immediate: true })
watch(sidebarCollapsed, updateIndicator)

const userInitial = computed(() => {
  const name = userInfo?.nickname || userInfo?.username || 'A'
  return name.charAt(0).toUpperCase()
})

const menuItems = [
  { path: '/dashboard', title: '概览', icon: icons.home },
  { path: '/categories', title: '分类管理', icon: icons.folder },
  { path: '/documents', title: '资料管理', icon: icons.document },
  { path: '/brands', title: '品牌管理', icon: icons.tag },
  { path: '/admins', title: '管理员', icon: icons.shield },
  { path: '/users', title: '用户管理', icon: icons.users },
]

const currentPageTitle = computed(() => {
  if (route.path === '/settings') return '系统设置'
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item?.title || '光伏资料管理系统'
})

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const handleDropdown = (cmd) => {
  if (cmd === 'profile') router.push('/profile')
  else if (cmd === 'logout') handleLogout()
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    removeToken()
    removeUserInfo()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
/* 隐藏滚动条但保留滚动 */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* 侧边栏文字滑入 */
.slide-fade-enter-active { transition: all 0.2s ease; }
.slide-fade-leave-active { transition: all 0.15s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(-8px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-4px); }

/* 遮罩淡入 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 激活竖条淡入 */
.bar-fade-enter-active { transition: opacity 0.2s, transform 0.2s; }
.bar-fade-enter-from { opacity: 0; transform: translateY(-50%) scaleY(0.5); }

/* 导航滑动高亮块 */
.nav-indicator {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s ease;
  top: 0;
}

/* 路由切换入场动画（CSS animation，不依赖 transitionend） */
.page-enter {
  animation: pageEnter 0.22s ease both;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
