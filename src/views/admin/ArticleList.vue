
<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2 style="margin:0;">文章管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="$router.push('/cpanel/articles/new')">新建文章</el-button>
    </div>
    <el-card>
      <el-table :data="articles" stripe style="width:100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryId" label="分类ID" width="100" />
        <el-table-column label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="{row}">
            <el-button size="mini" @click="$router.push('/cpanel/articles/' + row.id + '/edit')">编辑</el-button>
            <el-button size="mini" type="danger" @click="del(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { listArticles, deleteArticle } from '../../api/admin'

export default {
  data() { return { articles: [] } },
  mounted() { this.fetch() },
  methods: {
    async fetch() {
      try {
        const res = await listArticles(0, 100)
        this.articles = res.data.content || []
      } catch (e) { console.error(e) }
    },
    async del(id) {
      try {
        await this.$confirm('确定删除该文章？', '提示', { type: 'warning' })
        await deleteArticle(id)
        this.$message.success('删除成功')
        this.fetch()
      } catch (e) {}
    }
  }
}
</script>
