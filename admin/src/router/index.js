import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue'),
        meta: { title: '资料管理' }
      },
      {
        path: 'brands',
        name: 'Brands',
        component: () => import('@/views/Brands.vue'),
        meta: { title: '品牌管理' }
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('@/views/Admins.vue'),
        meta: { title: '管理员管理', requiresSuperAdmin: false }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 光伏组件资料管理系统` : '光伏组件资料管理系统'

  if (to.meta.requiresAuth && !getToken()) {
    next('/login')
  } else {
    next()
  }
})

export default router
