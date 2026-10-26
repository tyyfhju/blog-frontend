<template>
  <div class="friend-link-applications">
    <h2 style="margin-bottom: 20px;">友链审核</h2>
    <el-table :data="applications" border stripe>
      <el-table-column prop="name" label="网站名称" min-width="120"></el-table-column>
      <el-table-column prop="url" label="网站地址" min-width="180"></el-table-column>
      <el-table-column prop="description" label="描述" min-width="150"></el-table-column>
      <el-table-column prop="userEmail" label="申请人" width="180"></el-table-column>
      <el-table-column label="状态" width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'approved'" type="success" size="small">已通过</el-tag>
          <el-tag v-else-if="scope.row.status === 'rejected'" type="danger" size="small">已拒绝</el-tag>
          <el-tag v-else type="warning" size="small">待审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="150">
        <template slot-scope="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 'pending'"
            type="success"
            size="mini"
            @click="approve(scope.row.id)"
          >通过</el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            type="danger"
            size="mini"
            @click="reject(scope.row.id)"
          >拒绝</el-button>
          <el-button
            type="text"
            size="mini"
            style="color: #999; margin-left: 8px;"
            @click="delRecord(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getFriendLinkApplications, approveFriendLinkApplication, rejectFriendLinkApplication, deleteFriendLinkApplication } from '@/api/admin'

export default {
  name: 'FriendLinkApplicationList',
  data() {
    return {
      applications: []
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      try {
        const res = await getFriendLinkApplications()
        this.applications = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载友链申请失败', e)
      }
    },
    formatTime(t) {
      if (!t) return ''
      return t.replace('T', ' ').substring(0, 16)
    },
    async approve(id) {
      try {
        await approveFriendLinkApplication(id)
        this.$message.success('已通过，已同步到友链列表')
        this.load()
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    async reject(id) {
      try {
        await rejectFriendLinkApplication(id)
        this.$message.success('已拒绝')
        this.load()
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    async delRecord(id) {
      try {
        await this.$confirm('确定删除此申请记录？', '提示', { type: 'warning' })
        await deleteFriendLinkApplication(id)
        this.$message.success('已删除')
        this.load()
      } catch (e) {
        // 取消
      }
    }
  }
}
</script>

<style scoped>
.friend-link-applications {
  padding: 20px;
}
</style>
