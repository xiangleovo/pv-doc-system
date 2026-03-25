<template>
  <router-view />
</template>

<script setup>
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

/* 全局 reset：消除原生 button / a 的浏览器默认样式
   注意：只针对不带 el- 类名的按钮，避免影响 ElementPlus 组件 */
button:not([class*="el-"]) {
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
}
button:not([class*="el-"]):focus,
button:not([class*="el-"]):focus-visible {
  outline: none;
}
a, a:focus, a:focus-visible {
  outline: none;
  text-decoration: none;
}

html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* 禁止全局横向滚动 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Element Plus 覆盖 */
.el-card {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
}

.el-button--primary {
  background: #2563eb !important;
  border-color: #2563eb !important;
}
.el-button--primary:hover {
  background: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

.el-table th.el-table__cell {
  background: #f8fafc !important;
  color: #475569 !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

.el-dialog {
  border-radius: 16px !important;
}

.el-input__wrapper, .el-textarea__inner {
  border-radius: 8px !important;
}

.el-select .el-input__wrapper {
  border-radius: 8px !important;
}
</style>
