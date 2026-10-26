<template>
  <div class="admin-page">
    <div class="page-header"><h2>评论管理</h2></div>
    <el-table :data="comments" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="用户" width="130">
        <template slot-scope="scope">
          {{ scope.row.user ? scope.row.user.nickname : ('用户' + scope.row.userId) }}
        </template>
      </el-table-column>
      <el-table-column label="头像" width="70">
        <template slot-scope="scope">
          <img :src="scope.row.user?.avatarUrl || defaultAvatar" style="width:36px;height:36px;border-radius:50%" />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip />
      <el-table-column prop="articleId" label="文章ID" width="80" />
      <el-table-column prop="createTime" label="时间" width="170">
        <template slot-scope="scope">{{ scope.row.createTime ? scope.row.createTime.substring(0, 16) : '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" style="color:#f56c6c" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="totalPages > 1" style="text-align:center;margin-top:20px">
      <el-pagination background layout="prev, pager, next"
        :total="totalElements" :page-size="pageSize"
        :current-page.sync="currentPage" @current-change="load" />
    </div>
  </div>
</template>

<script>
import { listComments, deleteComment } from '@/api/admin'
export default {
  data() {
    return {
      comments: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0,
      defaultAvatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const r = await listComments(this.currentPage - 1, this.pageSize)
        const data = r.data
        this.comments = data.content || data.records || data || []
        this.totalPages = data.totalPages || 1
        this.totalElements = data.totalElements || data.total || this.comments.length
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    async del(id) {
      try {
        await this.$confirm('确认删除该评论？', '提示', { type: 'warning' })
        await deleteComment(id)
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
