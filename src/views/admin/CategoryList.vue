<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showAddDialog">+ 新建分类</el-button>
    </div>
    <el-card>
      <el-table :data="categories" style="width:100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="delCat(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="新建分类" :visible.sync="dialogVisible" width="400px">
      <el-form>
        <el-form-item label="分类名称">
          <el-input v-model="newCatName" placeholder="输入分类名称" @keyup.enter.native="createCatHandler" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createCatHandler">创建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCategories, createCategory, deleteCategory } from '../../api/admin'

export default {
  data() {
    return {
      categories: [],
      loading: false,
      dialogVisible: false,
      newCatName: ''
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await listCategories()
        this.categories = res.data || []
      } catch(e) { this.$message.error('加载失败') }
      finally { this.loading = false }
    },
    showAddDialog() {
      this.newCatName = ''
      this.dialogVisible = true
    },
    async createCatHandler() {
      if (!this.newCatName.trim()) { this.$message.warning('请输入分类名'); return }
      try {
        await createCategory({ name: this.newCatName.trim() })
        this.$message.success('创建成功')
        this.dialogVisible = false
        this.load()
      } catch(e) { this.$message.error(e.response?.data?.message || '创建失败') }
    },
    async delCat(row) {
      try {
        await this.$confirm('确认删除分类 "' + row.name + '"？', '提示', { type: 'warning' })
        await deleteCategory(row.id)
        this.$message.success('删除成功')
        this.load()
      } catch(e) { if (e !== 'cancel') this.$message.error('删除失败') }
    }
  }
}
</script>
