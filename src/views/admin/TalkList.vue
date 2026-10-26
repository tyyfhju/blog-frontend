<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>说说管理</h2>
      <el-button type="primary" size="small" @click="openAdd">+ 发布说说</el-button>
    </div>

    <el-table :data="talks" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="isTop" label="置顶" width="70">
        <template slot-scope="scope">{{ scope.row.isTop === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70">
        <template slot-scope="scope">{{ scope.row.status === 1 ? '发布' : '草稿' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="时间" width="170">
        <template slot-scope="scope">{{ scope.row.createTime ? scope.row.createTime.substring(0, 16) : '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color:#f56c6c" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > pageSize"
      style="margin-top:20px;text-align:right"
      background layout="prev, pager, next" :total="total" :page-size="pageSize"
      :current-page.sync="page" @current-change="load" />

    <el-dialog :title="editingId ? '编辑说说' : '发布说说'" :visible.sync="dialogVisible" width="560px" top="10vh">
      <el-form :model="form" label-width="70px">
        <el-form-item label="内容"><el-input type="textarea" :rows="4" v-model="form.content" placeholder="说说内容..." /></el-form-item>
        <el-form-item label="图片">
          <el-input v-model="form.images" placeholder="图片URL，逗号分隔">
            <template slot="append">
              <el-upload action="#" :http-request="uploadTalkImage" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="置顶"><el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="发布"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listTalks, createTalk, updateTalk, deleteTalk, uploadImage } from '@/api/admin'
export default {
  data() {
    return {
      talks: [], page: 1, pageSize: 10, total: 0,
      dialogVisible: false, editingId: null,
      form: { content: '', images: '', isTop: 0, status: 1 }
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      try {
        const r = await listTalks(this.page - 1, this.pageSize)
        this.talks = r.data.content || r.data || []
        this.total = r.data.totalElements || 0
      } catch (e) { console.error(e) }
    },
    openAdd() {
      this.editingId = null
      this.form = { content: '', images: '', isTop: 0, status: 1 }
      this.dialogVisible = true
    },
    openEdit(row) {
      this.editingId = row.id
      this.form = {
        content: row.content || '',
        images: row.images || '',
        isTop: row.isTop || 0,
        status: row.status != null ? row.status : 1
      }
      this.dialogVisible = true
    },
    async save() {
      if (!this.form.content.trim()) { this.$message.warning('请输入内容'); return }
      try {
        if (this.editingId) {
          await updateTalk(this.editingId, this.form)
          this.$message.success('更新成功')
        } else {
          await createTalk(this.form)
          this.$message.success('发布成功')
        }
        this.dialogVisible = false
        this.load()
      } catch (e) { this.$message.error('操作失败') }
    },
    async uploadTalkImage({ file }) {
      try {
        const res = await uploadImage(file)
        const url = res.data.url || res.data
        if (this.form.images) {
          this.form.images += ',' + url
        } else {
          this.form.images = url
        }
        this.$message.success('上传成功')
      } catch (e) { this.$message.error('上传失败') }
    },
    async del(id) {
      try {
        await this.$confirm('确认删除该说说？', '提示', { type: 'warning' })
        await deleteTalk(id)
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
