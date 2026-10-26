<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2>标签管理</h2>
      <el-button type="primary" @click="showAddDialog">+ 新建标签</el-button>
    </div>
    <el-card>
      <el-table :data="tags" style="width:100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="delTag(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="新建标签" :visible.sync="dialogVisible" width="400px">
      <el-form>
        <el-form-item label="标签名称">
          <el-input v-model="newTagName" placeholder="输入标签名称" @keyup.enter.native="createTagHandler" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createTagHandler">创建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTags, createTag, deleteTag } from '../../api/admin'

export default {
  data() {
    return {
      tags: [],
      loading: false,
      dialogVisible: false,
      newTagName: ''
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await listTags()
        this.tags = res.data || []
      } catch(e) { this.$message.error('加载失败') }
      finally { this.loading = false }
    },
    showAddDialog() {
      this.newTagName = ''
      this.dialogVisible = true
    },
    async createTagHandler() {
      if (!this.newTagName.trim()) { this.$message.warning('请输入标签名'); return }
      try {
        await createTag({ name: this.newTagName.trim() })
        this.$message.success('创建成功')
        this.dialogVisible = false
        this.load()
      } catch(e) { this.$message.error(e.response?.data?.message || '创建失败') }
    },
    async delTag(row) {
      try {
        await this.$confirm('确认删除标签 "' + row.name + '"？', '提示', { type: 'warning' })
        await deleteTag(row.id)
        this.$message.success('删除成功')
        this.load()
      } catch(e) { if (e !== 'cancel') this.$message.error('删除失败') }
    }
  }
}
</script>
