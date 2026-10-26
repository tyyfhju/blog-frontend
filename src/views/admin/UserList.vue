<template>
  <div>
    <h2 style="margin-bottom:20px;">用户管理</h2>
    <el-card>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column label="角色" width="120">
          <template slot-scope="{row}">
            <el-select v-model="row.role" size="small" @change="changeRole(row.id, row.role)">
              <el-option value="user" label="用户" />
              <el-option value="admin" label="管理员" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="{row}">
            <el-button type="danger" size="mini" @click="del(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { listUsers, updateUser, deleteUser } from '../../api/admin'

export default {
  data() { return { users: [], loading: false } },
  mounted() { this.fetch() },
  methods: {
    async fetch() {
      this.loading = true
      try {
        const res = await listUsers(0, 100)
        this.users = (res.data.content || []).map(u => ({ ...u }))
      } catch (e) { this.$message.error('加载用户列表失败') }
      finally { this.loading = false }
    },
    async changeRole(id, role) {
      try {
        await updateUser(id, { role })
        this.$message.success('角色更新成功')
      } catch (e) { this.$message.error('修改失败') }
    },
    async del(id) {
      try {
        await this.$confirm('确定删除该用户？', '警告', { type: 'warning' })
        await deleteUser(id)
        this.$message.success('删除成功')
        this.fetch()
      } catch (e) {}
    }
  }
}
</script>