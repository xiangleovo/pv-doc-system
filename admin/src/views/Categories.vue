<template>
  <div class="space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-800">分类管理</h2>
        <p class="text-slate-500 text-sm mt-0.5">管理资料分类（仅支持一级分类）</p>
      </div>
      <el-button type="primary" class="!rounded-xl !px-5" @click="handleAdd">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <el-table :data="categoryList" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column label="图标" width="100" align="center">
          <template #default="{ row }">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto">
              <el-icon :size="20" class="text-blue-500">
                <component :is="row.icon || 'Document'" />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button
                class="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
                @click="handleEdit(row)"
              >编辑</button>
              <button
                class="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium"
                @click="handleDelete(row)"
              >删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="categoryList.length === 0 && !loading" class="py-16 text-center">
        <div class="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <el-icon :size="28" class="text-slate-300"><Folder /></el-icon>
        </div>
        <p class="text-slate-400 text-sm">暂无分类，点击右上角添加</p>
      </div>
    </div>
  </div>

  <!-- 对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑分类' : '添加分类'"
    width="90%"
    style="max-width: 480px"
    class="!rounded-2xl"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" class="pt-2">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="图标">
        <el-select v-model="form.icon" placeholder="请选择图标" clearable class="!w-full">
          <el-option value="Document" label="文档图标" />
          <el-option value="Folder" label="文件夹图标" />
          <el-option value="Files" label="文件图标" />
          <el-option value="Reading" label="阅读图标" />
          <el-option value="Notebook" label="笔记本图标" />
          <el-option value="Collection" label="收藏图标" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sort" :min="0" class="!w-full" />
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
import { Folder } from '@element-plus/icons-vue'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category'

const categoryList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = ref({ id: null, name: '', icon: '', sort: 0 })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    categoryList.value = res.data || []
  } catch (e) {
    console.error(e)
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', icon: '', sort: 0 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    if (isEdit.value) {
      await updateCategory(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (e) { console.error(e) }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  }).catch(() => {})
}

onMounted(loadCategories)
</script>
