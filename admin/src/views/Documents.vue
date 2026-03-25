<template>
  <div class="space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">资料管理</h2>
        <p class="text-slate-500 text-sm mt-0.5">共 {{ pagination.total }} 条资料，按名称首字母排序</p>
      </div>
      <el-button type="primary" class="!rounded-xl !px-5" @click="handleAdd">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        添加资料
      </el-button>
    </div>

    <!-- 搜索过滤区 -->
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索资料标题..."
          clearable
          class="!w-full sm:!w-52"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          </template>
        </el-input>
        <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable class="!w-full sm:!w-40" @change="handleSearch">
          <el-option v-for="cat in flatCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-select v-model="searchForm.brandId" placeholder="全部品牌" clearable class="!w-full sm:!w-40" @change="handleSearch">
          <el-option v-for="brand in brandList" :key="brand.id" :label="brand.name" :value="brand.id" />
        </el-select>
        <el-button type="primary" class="!rounded-lg" @click="handleSearch">搜索</el-button>
        <el-button class="!rounded-lg" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 按首字母分组展示 -->
    <div v-if="!tableLoading && groupedDocuments.length > 0" class="space-y-5">
      <div v-for="group in groupedDocuments" :key="group.letter">
        <!-- 字母标签 -->
        <div class="flex items-center gap-3 mb-3">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-blue-200">
            {{ group.letter }}
          </div>
          <div class="h-px flex-1 bg-slate-100"></div>
          <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{{ group.items.length }} 条</span>
        </div>

        <!-- 该字母下的资料卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="doc in group.items"
            :key="doc.id"
            class="bg-white rounded-xl p-4 hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {{ doc.title }}
                </h4>
                <div class="flex flex-wrap items-center gap-1.5 mt-2">
                  <span v-if="doc.category" class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
                    {{ doc.category.name }}
                  </span>
                  <span v-if="doc.brand" class="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs">
                    {{ doc.brand.name }}
                  </span>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs',
                    doc.panelType === 'single' ? 'bg-green-50 text-green-600' :
                    doc.panelType === 'double' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-500']">
                    {{ doc.panelType === 'single' ? '单玻' : doc.panelType === 'double' ? '双玻' : '通用' }}
                  </span>
                </div>
                <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                    {{ doc.views || 0 }}
                  </span>
                </div>
              </div>
              <!-- 操作按钮 -->
              <div class="flex flex-col gap-1.5 shrink-0">
                <button
                  class="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
                  @click="handleEdit(doc)"
                >编辑</button>
                <button
                  class="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium"
                  @click="handleDelete(doc)"
                >删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="tableLoading" class="bg-white rounded-2xl p-12 flex items-center justify-center shadow-sm">
      <div class="text-center">
        <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-slate-400 text-sm">加载中...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!tableLoading && groupedDocuments.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm">
      <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
      </div>
      <p class="text-slate-400 text-sm">暂无资料，点击右上角添加</p>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="flex justify-center sm:justify-end">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadDocuments"
        @current-change="loadDocuments"
        background
      />
    </div>
  </div>

  <!-- 添加/编辑对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑资料' : '添加资料'"
    width="90%"
    style="max-width: 580px"
    class="!rounded-2xl"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" class="pt-2">
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择分类" class="!w-full">
          <el-option v-for="cat in flatCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="brandId">
        <el-select v-model="form.brandId" placeholder="请选择品牌" class="!w-full">
          <el-option v-for="brand in brandList" :key="brand.id" :label="brand.name" :value="brand.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入资料标题" />
      </el-form-item>
      <el-form-item label="PDF 文件" prop="pdfUrl">
        <!-- 上传方式切换 -->
        <div class="w-full space-y-3">
          <el-radio-group v-model="pdfInputMode" size="small">
            <el-radio-button value="upload">上传文件到 COS</el-radio-button>
            <el-radio-button value="url">直接填写链接</el-radio-button>
          </el-radio-group>

          <!-- 上传文件模式 -->
          <div v-if="pdfInputMode === 'upload'">
            <div
              class="relative border-2 border-dashed rounded-xl p-5 transition-colors"
              :class="uploading ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/30'"
            >
              <!-- 已上传显示 -->
              <div v-if="form.pdfUrl && pdfInputMode === 'upload'" class="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-slate-100">
                <svg class="w-8 h-8 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-700 truncate">{{ uploadedFileName || 'PDF 文件' }}</p>
                  <p class="text-xs text-slate-400 truncate">{{ form.pdfUrl }}</p>
                </div>
                <button class="text-slate-400 hover:text-red-500 transition-colors" @click="clearPdf">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <!-- 上传进度 -->
              <div v-if="uploading" class="mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-blue-600">正在上传...</span>
                  <span class="text-xs text-blue-600">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-blue-100 rounded-full h-1.5">
                  <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" :style="{width: uploadProgress + '%'}"></div>
                </div>
              </div>

              <!-- 选择文件按钮 -->
              <div class="flex items-center justify-center gap-3" v-if="!uploading">
                <label
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg bg-white border text-sm transition-colors shadow-sm',
                    canUploadPdf
                      ? 'cursor-pointer border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                      : 'cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50'
                  ]"
                  :title="!canUploadPdf ? '请先选择分类和品牌' : ''"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                  选择 PDF 文件
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    class="hidden"
                    @change="handlePdfUpload"
                    ref="pdfFileInput"
                    :disabled="!canUploadPdf"
                  />
                </label>
                <span class="text-xs text-slate-400">
                  {{ canUploadPdf ? '支持 PDF 格式，最大 200MB' : '请先选择分类和品牌' }}
                </span>
              </div>
            </div>

            <!-- COS 未配置提示 -->
            <p v-if="!cosConfigured" class="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>
              未检测到 COS 配置，请先前往
              <a href="/settings" class="underline hover:text-amber-700" @click.prevent="$router.push('/settings')">系统设置</a>
              完成配置
            </p>
          </div>

          <!-- 直接填写链接模式 -->
          <el-input
            v-if="pdfInputMode === 'url'"
            v-model="form.pdfUrl"
            type="textarea"
            :rows="3"
            placeholder="请输入 PDF 文件链接，如：https://example.com/file.pdf"
          />
        </div>
      </el-form-item>
      <el-form-item label="产品型号">
        <el-input v-model="form.productModel" placeholder="请输入产品型号（可选）" />
      </el-form-item>
      <el-form-item label="组件类型">
        <el-radio-group v-model="form.panelType">
          <el-radio-button value="both">通用</el-radio-button>
          <el-radio-button value="single">单玻</el-radio-button>
          <el-radio-button value="double">双玻</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex gap-3 justify-end">
        <el-button class="!rounded-xl" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="!rounded-xl !px-6" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '确认添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/api/document'
import { getCategories } from '@/api/category'
import { getBrands } from '@/api/brand'
import { getCosConfig, uploadPdfToCos } from '@/api/settings'

const router = useRouter()

const documentList = ref([])
const flatCategories = ref([])
const brandList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableLoading = ref(false)
const formRef = ref(null)

// PDF 上传相关
const pdfInputMode = ref('upload') // 'upload' | 'url'
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const pdfFileInput = ref(null)
const cosConfigured = ref(false)

const searchForm = ref({ keyword: '', categoryId: null, brandId: null })

// 是否可以上传 PDF（必须先选分类和品牌）
const canUploadPdf = computed(() => {
  return !!form.value.categoryId && !!form.value.brandId
})

const pagination = ref({ page: 1, pageSize: 50, total: 0 })

const form = ref({
  id: null, categoryId: null, brandId: null,
  title: '', pdfUrl: '', productModel: '', panelType: 'both', thumbnail: ''
})

const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  pdfUrl: [{ required: true, message: '请上传或填写PDF链接', trigger: 'blur' }]
}

// 按首字母排序并分组
const groupedDocuments = computed(() => {
  const sorted = [...documentList.value].sort((a, b) =>
    a.title.localeCompare(b.title, 'zh-CN')
  )

  const groups = {}
  sorted.forEach(doc => {
    const first = doc.title.charAt(0)
    // 判断是否为中文字符
    const isChinese = /[\u4e00-\u9fa5]/.test(first)
    let letter
    if (isChinese) {
      // 中文转拼音首字母（简单映射）
      const pinyinMap = getPinyinFirstLetter(first)
      letter = pinyinMap || first
    } else {
      letter = first.toUpperCase()
    }
    // 非字母字符归入 #
    if (!/[A-Z]/.test(letter)) letter = '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(doc)
  })

  return Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b)
  }).map(letter => ({ letter, items: groups[letter] }))
})

// 中文首字拼音首字母映射（Unicode 区间粗略估算）
function getPinyinFirstLetter(char) {
  const code = char.charCodeAt(0)
  if (code >= 0x554a && code <= 0x5b64) return 'A'
  if (code >= 0x5b65 && code <= 0x60cf) return 'B'
  if (code >= 0x60d0 && code <= 0x6307) return 'C'
  if (code >= 0x6308 && code <= 0x649f) return 'D'
  if (code >= 0x64a0 && code <= 0x6643) return 'E'
  if (code >= 0x6644 && code <= 0x66f4) return 'F'
  if (code >= 0x66f5 && code <= 0x6821) return 'G'
  if (code >= 0x6822 && code <= 0x6f4a) return 'H'
  if (code >= 0x6f4b && code <= 0x78ef) return 'J'
  if (code >= 0x78f0 && code <= 0x7c5b) return 'K'
  if (code >= 0x7c5c && code <= 0x7e3f) return 'L'
  if (code >= 0x7e40 && code <= 0x8457) return 'M'
  if (code >= 0x8458 && code <= 0x860b) return 'N'
  if (code >= 0x860c && code <= 0x868c) return 'O'
  if (code >= 0x868d && code <= 0x8c43) return 'P'
  if (code >= 0x8c44 && code <= 0x8e4a) return 'Q'
  if (code >= 0x8e4b && code <= 0x9131) return 'R'
  if (code >= 0x9132 && code <= 0x96e2) return 'S'
  if (code >= 0x96e3 && code <= 0x9887) return 'T'
  if (code >= 0x9888 && code <= 0x9ced) return 'W'
  if (code >= 0x9cee && code <= 0x9f0e) return 'X'
  if (code >= 0x9f0f && code <= 0x9f43) return 'Y'
  if (code >= 0x9f44 && code <= 0x9f6b) return 'Z'
  return null
}

const loadDocuments = async () => {
  tableLoading.value = true
  try {
    const params = { page: pagination.value.page, pageSize: pagination.value.pageSize, ...searchForm.value }
    const res = await getDocuments(params)
    documentList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (e) {
    console.error(e)
  } finally {
    tableLoading.value = false
  }
}

const loadCategories = async () => {
  const res = await getCategories()
  const flatten = (items) => {
    const result = []
    items.forEach(item => {
      result.push(item)
      if (item.children?.length) result.push(...flatten(item.children))
    })
    return result
  }
  flatCategories.value = flatten(res.data)
}

const loadBrands = async () => {
  const res = await getBrands()
  brandList.value = res.data
}

const handleSearch = () => { pagination.value.page = 1; loadDocuments() }
const handleReset = () => { searchForm.value = { keyword: '', categoryId: null, brandId: null }; handleSearch() }

const handleAdd = () => {
  isEdit.value = false
  pdfInputMode.value = 'upload'
  uploadedFileName.value = ''
  form.value = { id: null, categoryId: null, brandId: null, title: '', pdfUrl: '', productModel: '', panelType: 'both', thumbnail: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  pdfInputMode.value = row.pdfUrl ? 'url' : 'upload'
  uploadedFileName.value = ''
  form.value = { ...row, panelType: row.panelType || 'both', productModel: row.productModel || '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    if (isEdit.value) {
      await updateDocument(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createDocument(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadDocuments()
  } catch (e) { console.error(e) }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除「${row.title}」吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    await deleteDocument(row.id)
    ElMessage.success('删除成功')
    loadDocuments()
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  loadBrands()
  loadDocuments()
  // 加载 COS 配置状态
  getCosConfig().then(res => {
    cosConfigured.value = res.data?.configured || false
  }).catch(() => {})
})

// ── PDF 上传处理 ──
const handlePdfUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 检查是否已选择分类和品牌
  if (!form.value.categoryId || !form.value.brandId) {
    ElMessage.warning('请先选择分类和品牌')
    return
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    ElMessage.error('请选择 PDF 格式文件')
    return
  }

  if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 200MB')
    return
  }

  if (!cosConfigured.value) {
    ElMessage.warning('请先在系统设置中配置腾讯云 COS')
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadedFileName.value = file.name

  const formData = new FormData()
  formData.append('file', file)
  formData.append('categoryId', form.value.categoryId)
  formData.append('brandId', form.value.brandId)

  try {
    const res = await uploadPdfToCos(formData, (e) => {
      if (e.total > 0) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    form.value.pdfUrl = res.data.url
    // 自动填充标题（如果标题为空）
    if (!form.value.title && res.data.title) {
      form.value.title = res.data.title
    }
    ElMessage.success('PDF 上传成功')
  } catch (e) {
    uploadedFileName.value = ''
    console.error('上传失败:', e)
  } finally {
    uploading.value = false
    if (pdfFileInput.value) pdfFileInput.value.value = ''
  }
}

const clearPdf = () => {
  form.value.pdfUrl = ''
  uploadedFileName.value = ''
  if (pdfFileInput.value) pdfFileInput.value.value = ''
}
</script>
