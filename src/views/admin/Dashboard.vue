<template>
  <div class="dashboard">
    <h2 style="margin-bottom: 24px;">仪表盘</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="6" v-for="card in statCards" :key="card.label" style="margin-bottom:16px">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" :style="{ background: card.gradient }">
              <i :class="card.icon" style="font-size:24px;color:#fff"></i>
            </div>
            <div class="stat-info">
              <p class="stat-number">{{ card.value }}</p>
              <p class="stat-label">{{ card.label }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域（预留）与最近文章 -->
    <el-row :gutter="16" style="margin-top: 8px;">
      <!-- 最近文章 -->
      <el-col :span="14">
        <el-card>
          <div slot="header" class="card-header">
            <span>最近文章</span>
            <el-button type="text" size="small" @click="$router.push('/cpanel/articles')">查看全部</el-button>
          </div>
          <el-table :data="recentArticles" style="width:100%" size="small" :show-header="true">
            <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template slot-scope="{row}">
                <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="mini">
                  {{ row.status === 1 ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="140">
              <template slot-scope="{row}">
                {{ row.createTime ? row.createTime.substring(0, 10) : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 最近评论 -->
      <el-col :span="10">
        <el-card>
          <div slot="header" class="card-header">
            <span>最近评论</span>
          </div>
          <div v-if="recentComments.length === 0" class="empty-tip">暂无评论</div>
          <div v-for="c in recentComments" :key="c.id" class="comment-item">
            <div class="comment-user">
              <strong>{{ c.user ? c.user.nickname || c.user.email : '匿名' }}</strong>
              <span class="comment-time">{{ c.createTime ? c.createTime.substring(0, 10) : '-' }}</span>
            </div>
            <p class="comment-content">{{ c.content }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="card-header">
            <span>快捷入口</span>
          </div>
          <div class="quick-actions">
            <el-button type="primary" icon="el-icon-edit" @click="$router.push('/cpanel/articles/new')">写文章</el-button>
            <el-button type="success" icon="el-icon-folder-add" @click="showCategoryPanel">新建分类</el-button>
            <el-button type="warning" icon="el-icon-collection-tag" @click="showTagPanel">新建标签</el-button>
            <el-button type="info" icon="el-icon-picture" @click="$router.push('/cpanel/photos')">管理相册</el-button>
            <el-button type="default" icon="el-icon-setting" @click="$router.push('/cpanel/settings')">博客设置</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDashboardStats, listCategories, createCategory, listTags, createTag } from '../../api/admin'

export default {
  data() {
    return {
      articleCount: 0,
      userCount: 0,
      categoryCount: 0,
      tagCount: 0,
      commentCount: 0,
      messageCount: 0,
      photoCount: 0,
      recentArticles: [],
      recentComments: []
    }
  },
  computed: {
    statCards() {
      return [
        { label: '文章总数', value: this.articleCount, icon: 'el-icon-document', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { label: '用户总数', value: this.userCount, icon: 'el-icon-user', gradient: 'linear-gradient(135deg, #67c23a, #85ce61)' },
        { label: '分类总数', value: this.categoryCount, icon: 'el-icon-folder', gradient: 'linear-gradient(135deg, #e6a23c, #f3d19e)' },
        { label: '标签总数', value: this.tagCount, icon: 'el-icon-collection-tag', gradient: 'linear-gradient(135deg, #409eff, #66b1ff)' },
        { label: '评论总数', value: this.commentCount, icon: 'el-icon-chat-dot-round', gradient: 'linear-gradient(135deg, #f56c6c, #f89898)' },
        { label: '留言总数', value: this.messageCount, icon: 'el-icon-message', gradient: 'linear-gradient(135deg, #909399, #b4b4b4)' },
        { label: '照片总数', value: this.photoCount, icon: 'el-icon-picture', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)' }
      ]
    }
  },
  mounted() { this.loadStats() },
  methods: {
    async loadStats() {
      try {
        const res = await getDashboardStats()
        const d = res.data
        this.articleCount = d.articleCount || 0
        this.userCount = d.userCount || 0
        this.categoryCount = d.categoryCount || 0
        this.tagCount = d.tagCount || 0
        this.commentCount = d.commentCount || 0
        this.messageCount = d.messageCount || 0
        this.photoCount = d.photoCount || 0
        this.recentArticles = d.recentArticles || []
        this.recentComments = d.recentComments || []
      } catch (e) {
        this.$message.error('加载仪表盘数据失败: ' + (e.response?.data?.message || e.message))
      }
    },
    showCategoryPanel() {
      this.$prompt('请输入分类名称', '新建分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async ({ value }) => {
        if (!value) return
        try {
          await createCategory({ name: value })
          this.$message.success('分类创建成功')
          this.loadStats()
        } catch (e) {
          this.$message.error('创建失败')
        }
      }).catch(() => {})
    },
    showTagPanel() {
      this.$prompt('请输入标签名称', '新建标签', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async ({ value }) => {
        if (!value) return
        try {
          await createTag({ name: value })
          this.$message.success('标签创建成功')
          this.loadStats()
        } catch (e) {
          this.$message.error('创建失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info { flex: 1; }
.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin: 4px 0 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 24px 0;
  font-size: 13px;
}
.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}
.comment-item:last-child { border-bottom: none; }
.comment-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.comment-time {
  color: #c0c4cc;
  font-size: 12px;
}
.comment-content {
  margin: 4px 0 0;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
