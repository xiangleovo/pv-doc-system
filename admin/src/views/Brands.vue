<template>
  <div class="space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">品牌管理</h2>
        <p class="text-slate-500 text-sm mt-0.5">管理光伏组件品牌信息及所属分类</p>
      </div>
      <el-button type="primary" class="!rounded-xl !px-5" @click="handleAdd">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        添加品牌
      </el-button>
    </div>

    <!-- 品牌卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="brand in brandList"
        :key="brand.id"
        class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col hover:-translate-y-0.5"
      >
        <!-- Logo -->
        <div class="flex items-center justify-center h-24 mb-4 bg-slate-50 rounded-xl overflow-hidden">
          <el-image
            v-if="brand.logo"
            :src="brand.logo"
            fit="contain"
            class="w-full h-full"
            :preview-src-list="[brand.logo]"
          />
          <div v-else class="flex flex-col items-center gap-2 text-slate-300">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            <span class="text-xs">无 Logo</span>
          </div>
        </div>

        <!-- 品牌信息 -->
        <h3 class="font-semibold text-slate-800 text-center text-sm">{{ brand.name }}</h3>
        
        <!-- 所属分类标签 -->
        <div class="mt-2 flex flex-wrap justify-center gap-1">
          <el-tag 
            v-for="catId in (brand.categoryIds || [])" 
            :key="catId"
            size="small"
            type="info"
            class="!rounded-lg"
          >
            {{ getCategoryName(catId) }}
          </el-tag>
          <span v-if="!(brand.categoryIds || []).length" class="text-xs text-slate-400">未设置分类</span>
        </div>
        
        <p v-if="brand.description" class="text-xs text-slate-400 text-center mt-2 line-clamp-2 leading-relaxed">{{ brand.description }}</p>
        <div class="flex-1"></div>

        <!-- 操作 -->
        <div class="flex gap-2 mt-4">
          <button
            class="flex-1 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
            @click="handleEdit(brand)"
          >编辑</button>
          <button
            class="flex-1 py-2 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium"
            @click="handleDelete(brand)"
          >删除</button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="brandList.length === 0" class="sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-white rounded-2xl shadow-sm p-16 text-center">
        <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.595.33a18.095 18.095 0 005.223-5.223c.542-.815.369-1.896-.33-2.595L9.568 3z"/></svg>
        </div>
        <p class="text-slate-400 text-sm">暂无品牌，点击右上角添加</p>
      </div>
    </div>
  </div>

  <!-- 对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑品牌' : '添加品牌'"
    width="90%"
    style="max-width: 500px"
    class="!rounded-2xl"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="pt-2">
      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入品牌名称" />
      </el-form-item>
      
      <!-- 所属分类多选 -->
      <el-form-item label="所属分类">
        <el-select
          v-model="form.categoryIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择所属分类（可多选）"
          class="!w-full"
        >
          <el-option
            v-for="cat in categoryList"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
        <p class="text-xs text-slate-400 mt-1">选择一个或多个分类，品牌将在这些分类下显示</p>
      </el-form-item>
      
      <el-form-item label="品牌 Logo">
        <el-tabs v-model="logoInputType" class="w-full">
          <el-tab-pane label="上传图片" name="upload">
            <el-upload
              class="logo-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
            >
              <div class="w-32 h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                <el-image v-if="form.logo" :src="form.logo" fit="contain" class="w-full h-full" />
                <div v-else class="text-center text-slate-400">
                  <svg class="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  <p class="text-xs">点击上传</p>
                </div>
              </div>
            </el-upload>
            <p class="text-xs text-slate-400 mt-2">支持 JPG/PNG，不超过 2MB</p>
          </el-tab-pane>
          <el-tab-pane label="图片链接" name="url">
            <el-input v-model="form.logo" placeholder="请输入图片 URL" clearable />
            <div v-if="form.logo" class="mt-3 w-32 h-32 border border-slate-200 rounded-xl overflow-hidden">
              <el-image :src="form.logo" fit="contain" class="w-full h-full" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      
      <el-form-item label="品牌描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入品牌描述（可选）" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/api/brand'
import { getCategories } from '@/api/category'

const brandList = ref([])
const categoryList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const logoInputType = ref('upload')

const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/upload`
const uploadHeaders = ref({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` })

const form = ref({ id: null, name: '', logo: '', description: '', categoryIds: [], sort: 0 })
const rules = { name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }] }

// 获取分类名称
const getCategoryName = (catId) => {
  const cat = categoryList.value.find(c => c.id === catId)
  return cat ? cat.name : '未知分类'
}

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categoryList.value = res.data || []
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

const loadBrands = async () => {
  try {
    const res = await getBrands()
    brandList.value = res.data || []
  } catch (e) {
    console.error(e)
    ElMessage.error('加载品牌失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  logoInputType.value = 'upload'
  form.value = { id: null, name: '', logo: '', description: '', categoryIds: [], sort: 0 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  logoInputType.value = row.logo ? 'url' : 'upload'
  form.value = { 
    ...row,
    categoryIds: row.categoryIds || []
  }
  dialogVisible.value = true
}

const beforeUpload = (file) => {
  const ok = ['image/jpeg', 'image/png'].includes(file.type)
  if (!ok) { ElMessage.error('只支持 JPG/PNG 格式'); return false }
  if (file.size / 1024 / 1024 > 2) { ElMessage.error('图片不能超过 2MB'); return false }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.success) {
    form.value.logo = response.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    if (isEdit.value) {
      await updateBrand(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createBrand(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadBrands()
  } catch (e) { console.error(e) }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除品牌「${row.name}」吗？`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    await deleteBrand(row.id)
    ElMessage.success('删除成功')
    loadBrands()
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  loadBrands()
})
</script>
