<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>机器人台词管理</h2>
      <el-button type="primary" size="small" @click="openDialog()">新增台词</el-button>
    </div>
    <el-table :data="dialogues" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="content" label="台词内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.enabled === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170">
        <template slot-scope="scope">{{ scope.row.createTime ? scope.row.createTime.substring(0, 16) : '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color:#f56c6c" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="form.id ? '编辑台词' : '新增台词'" :visible.sync="dialogVisible" width="480px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content" :rows="3" placeholder="请输入台词内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0"
                     active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!form.content.trim()" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRobotDialogues, createRobotDialogue, updateRobotDialogue, deleteRobotDialogue } from '@/api/admin'

export default {
  data() {
    return {
      dialogues: [],
      dialogVisible: false,
      form: { id: null, content: '', enabled: 1 }
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      try { const r = await listRobotDialogues(); this.dialogues = r.data || [] } catch (e) { console.error(e) }
    },
    openDialog(row) {
      if (row) {
        this.form = { id: row.id, content: row.content, enabled: row.enabled }
      } else {
        this.form = { id: null, content: '', enabled: 1 }
      }
      this.dialogVisible = true
    },
    async save() {
      const content = this.form.content.trim()
      if (!content) return
      try {
        if (this.form.id) {
          await updateRobotDialogue(this.form.id, { content, enabled: this.form.enabled })
          this.$message.success('更新成功')
        } else {
          await createRobotDialogue({ content, enabled: this.form.enabled })
          this.$message.success('新增成功')
        }
        this.dialogVisible = false
        this.load()
      } catch (e) { this.$message.error('操作失败') }
    },
    async del(id) {
      try {
        await this.$confirm('确认删除该台词？', '提示', { type: 'warning' })
        await deleteRobotDialogue(id)
        this.$message.success('删除成功')
        this.load()
      } catch (e) { if (e !== 'cancel') this.$message.error('删除失败') }
    }
  }
}
</script>
<style scoped>
.admin-page { background: #fff; border-radius: 8px; padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 18px; }
</style>
