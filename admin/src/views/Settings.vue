<template>
  <div class="space-y-6 max-w-2xl">
    <!-- 页头 -->
    <div>
      <h2 class="text-xl font-bold text-slate-800">系统设置</h2>
      <p class="text-slate-500 text-sm mt-0.5">配置小程序联系电话、COS 存储等系统参数</p>
    </div>

    <!-- 小程序配置卡片 -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">小程序配置</h3>
          <p class="text-xs text-slate-400 mt-0.5">配置小程序端显示的联系电话等信息</p>
        </div>
      </div>

      <el-form :model="miniProgramForm" ref="miniProgramFormRef" label-width="110px" class="pr-2">
        <el-form-item label="公司名称" prop="companyName">
          <el-input
            v-model="miniProgramForm.companyName"
            placeholder="请输入小程序端显示的公司名称"
            maxlength="50"
            clearable
          />
          <template #extra>
            <span class="text-xs text-slate-400">该名称将在小程序「关于我们」页面显示</span>
          </template>
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="miniProgramForm.contactPhone"
            placeholder="请输入小程序端显示的联系电话"
            maxlength="11"
            clearable
          />
          <template #extra>
            <span class="text-xs text-slate-400">该号码将在小程序「我的」页面和「关于我们」页面显示</span>
          </template>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="!rounded-xl !px-6" :loading="savingMiniProgram" @click="handleSaveMiniProgram">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- COS 配置卡片 -->
    <div class="bg-white rounded-2xl shadow-sm p-6">
      <div class="flex items-center gap-3 mb-6">
        <!-- COS 图标 -->
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 2.625v5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-5.625" />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">腾讯云 COS 存储配置</h3>
          <p class="text-xs text-slate-400 mt-0.5">PDF 文件将上传至配置的存储桶中</p>
        </div>
        <!-- 状态 badge -->
        <div class="ml-auto">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              cosStatus.configured
                ? 'bg-green-50 text-green-600'
                : 'bg-slate-100 text-slate-500'
            ]"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', cosStatus.configured ? 'bg-green-500' : 'bg-slate-400']"></span>
            {{ cosStatus.configured ? '已配置' : '未配置' }}
          </span>
        </div>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px" class="pr-2">
        <el-form-item label="SecretId" prop="secretId">
          <el-input
            v-model="form.secretId"
            placeholder="请输入腾讯云 SecretId"
            :show-password="false"
            clearable
          />
          <template #extra>
            <span class="text-xs text-slate-400">在腾讯云控制台 → 访问管理 → API 密钥中获取</span>
          </template>
        </el-form-item>

        <el-form-item label="SecretKey" prop="secretKey">
          <el-input
            v-model="form.secretKey"
            type="password"
            placeholder="请输入腾讯云 SecretKey"
            show-password
          />
        </el-form-item>

        <el-form-item label="Bucket 名称" prop="bucket">
          <el-input
            v-model="form.bucket"
            placeholder="如：pv-docs-1234567890"
          />
          <template #extra>
            <span class="text-xs text-slate-400">格式为 BucketName-APPID，例如 pv-docs-1234567890</span>
          </template>
        </el-form-item>

        <el-form-item label="Region" prop="region">
          <el-select v-model="form.region" placeholder="请选择存储桶所在地域" class="!w-full">
            <el-option label="华北地区（北京）ap-beijing" value="ap-beijing" />
            <el-option label="华东地区（上海）ap-shanghai" value="ap-shanghai" />
            <el-option label="华南地区（广州）ap-guangzhou" value="ap-guangzhou" />
            <el-option label="华南地区（深圳）ap-shenzhen" value="ap-shenzhen" />
            <el-option label="西南地区（成都）ap-chengdu" value="ap-chengdu" />
            <el-option label="西南地区（重庆）ap-chongqing" value="ap-chongqing" />
            <el-option label="东北地区（沈阳）ap-shenyang" value="ap-shenyang" />
            <el-option label="华东地区（南京）ap-nanjing" value="ap-nanjing" />
            <el-option label="港澳台地区（香港）ap-hongkong" value="ap-hongkong" />
            <el-option label="亚太东南（新加坡）ap-singapore" value="ap-singapore" />
          </el-select>
        </el-form-item>

        <el-form-item label="自定义域名">
          <el-input
            v-model="form.domain"
            placeholder="如：https://cdn.example.com（留空则使用默认域名）"
          />
          <template #extra>
            <span class="text-xs text-slate-400">配置 CDN 加速域名可提高访问速度，留空则使用 COS 默认域名</span>
          </template>
        </el-form-item>

        <el-form-item label="文件前缀">
          <el-input v-model="form.prefix" placeholder="如：pdfs/（默认 pdfs/）" />
          <template #extra>
            <span class="text-xs text-slate-400">PDF 文件在存储桶中的路径前缀</span>
          </template>
        </el-form-item>

        <el-form-item>
          <div class="flex gap-3">
            <el-button type="primary" class="!rounded-xl !px-6" :loading="saving" @click="handleSave">
              保存配置
            </el-button>
            <el-button class="!rounded-xl !px-5" :loading="testing" @click="handleTest" :disabled="!cosStatus.configured && !isDirty">
              测试连接
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 帮助说明 -->
    <div class="bg-amber-50 rounded-2xl p-5 border border-amber-100">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-amber-700 mb-2">配置说明</p>
          <ol class="text-xs text-amber-700/80 space-y-1.5 list-decimal list-inside">
            <li>前往 <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="underline hover:text-amber-900">腾讯云 API 密钥管理</a> 获取 SecretId 和 SecretKey</li>
            <li>在 <a href="https://console.cloud.tencent.com/cos" target="_blank" class="underline hover:text-amber-900">对象存储控制台</a> 创建存储桶，建议开启公有读私有写</li>
            <li>存储桶的 CORS 配置中需允许来自管理后台域名的跨域请求</li>
            <li>配置完成后点击「测试连接」验证配置是否正确</li>
            <li>配置保存后，资料管理中上传 PDF 会自动存储到 COS</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const formRef = ref(null)
const miniProgramFormRef = ref(null)
const saving = ref(false)
const savingMiniProgram = ref(false)
const testing = ref(false)
const cosStatus = ref({ configured: false })
const originalForm = ref({})

const form = reactive({
  secretId: '',
  secretKey: '',
  bucket: '',
  region: '',
  domain: '',
  prefix: 'pdfs/'
})

const miniProgramForm = reactive({
  contactPhone: '',
  companyName: ''
})

const rules = {
  secretId: [{ required: true, message: '请输入 SecretId', trigger: 'blur' }],
  secretKey: [{ required: true, message: '请输入 SecretKey', trigger: 'blur' }],
  bucket: [{ required: true, message: '请输入 Bucket 名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择 Region', trigger: 'change' }]
}

// 判断表单是否有变动（用于测试按钮的启用状态）
const isDirty = computed(() => {
  return form.secretId || form.secretKey || form.bucket || form.region
})

const loadConfig = async () => {
  try {
    // 加载 COS 配置
    const cosRes = await request({ url: '/settings/cos', method: 'get' })
    cosStatus.value = cosRes.data
    // 只回填非敏感字段
    form.bucket = cosRes.data.bucket || ''
    form.region = cosRes.data.region || ''
    form.domain = cosRes.data.domain || ''
    form.prefix = cosRes.data.prefix || 'pdfs/'
    // SecretId / SecretKey 留空（安全起见不回显）
  } catch (e) {
    console.error('加载 COS 配置失败:', e)
  }

  try {
    // 批量加载小程序配置
    const configRes = await request({ url: '/configs/values?keys=contact_phone,company_name', method: 'get' })
    if (configRes.data) {
      miniProgramForm.contactPhone = configRes.data.contact_phone || ''
      miniProgramForm.companyName = configRes.data.company_name || ''
    }
  } catch (e) {
    console.error('加载小程序配置失败:', e)
  }
}

const handleSaveMiniProgram = async () => {
  try {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (miniProgramForm.contactPhone && !phoneRegex.test(miniProgramForm.contactPhone)) {
      ElMessage.error('手机号格式不正确')
      return
    }

    savingMiniProgram.value = true

    // 保存公司名称
    await request({
      url: '/configs',
      method: 'post',
      data: {
        key: 'company_name',
        value: miniProgramForm.companyName,
        description: '小程序端显示的公司名称'
      }
    })

    // 保存联系电话
    await request({
      url: '/configs',
      method: 'post',
      data: {
        key: 'contact_phone',
        value: miniProgramForm.contactPhone,
        description: '小程序端显示的联系电话'
      }
    })

    ElMessage.success('小程序配置已保存')
  } catch (e) {
    console.error('保存失败:', e)
    ElMessage.error('保存失败')
  } finally {
    savingMiniProgram.value = false
  }
}

const handleSave = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    saving.value = true
    await request({
      url: '/settings/cos',
      method: 'post',
      data: { ...form }
    })
    ElMessage.success('COS 配置已保存')
    cosStatus.value.configured = true
    // 保存后清空密钥输入框
    form.secretId = ''
    form.secretKey = ''
    loadConfig()
  } catch (e) {
    console.error('保存失败:', e)
  } finally {
    saving.value = false
  }
}

const handleTest = async () => {
  try {
    testing.value = true
    await request({ url: '/settings/cos/test', method: 'post' })
    ElMessage.success('连接成功！COS 配置有效')
  } catch (e) {
    console.error('测试失败:', e)
  } finally {
    testing.value = false
  }
}

onMounted(loadConfig)
</script>
