<template>
  <div class="admin-page">
    <div class="page-header"><h2>留言管理</h2></div>
    <el-table :data="messages" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="nickname" label="昵称" width="130" />
      <el-table-column label="头像" width="80">
        <template slot-scope="scope">
          <img :src="scope.row.avatarUrl || defaultAvatar" style="width:36px;height:36px;border-radius:50%" />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip />
      <el-table-column prop="createTime" label="时间" width="170">
        <template slot-scope="scope">{{ scope.row.createTime ? scope.row.createTime.substring(0, 16) : '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" style="color:#f56c6c" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listMessages, deleteMessage } from '@/api/admin'
export default {
  data() {
    return { messages: [], defaultAvatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff' }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      try { const r = await listMessages(); this.messages = r.data || [] } catch (e) { console.error(e) }
    },
    async del(id) {
      try {
        await this.$confirm('确认删除该留言？', '提示', { type: 'warning' })
        await deleteMessage(id)
        this.$message.success('删除成功')
        this.load()
      } catch (e) { if (e !== 'cancel') this.$message.error('删除失败') }
    }
  }
}
</script>
<style scoped>
.admin-page { background: #fff; border-radius: 8px; padding: 24px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 18px; }
</style>
