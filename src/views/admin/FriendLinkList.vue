<template>
  <div class="friend-link-manage">
    <h2 style="margin-bottom: 20px;">友链管理</h2>

    <!-- 添加/编辑表单 -->
    <el-card style="margin-bottom: 20px;">
      <div slot="header">
        <span>{{ editing ? '编辑友链' : '添加友链' }}</span>
      </div>
      <el-form :model="form" label-width="80px">
        <el-form-item label="网站名称">
          <el-input v-model="form.name" placeholder="请输入网站名称"></el-input>
        </el-form-item>
        <el-form-item label="网站地址">
          <el-input v-model="form.url" placeholder="请输入网站地址"></el-input>
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="form.avatarUrl" placeholder="请输入头像URL">
            <el-upload
              slot="append"
              action="#"
              :show-file-list="false"
              :before-upload="handleUpload"
              accept="image/*"
            >
              <el-button icon="el-icon-picture-outline" size="small">📷 本地上传</el-button>
            </el-upload>
          </el-input>
          <img v-if="form.avatarUrl" :src="form.avatarUrl" style="width:60px;height:60px;border-radius:8px;margin-top:8px;" />
        </el-form-item>
        <el-form-item label="网站描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入网站描述"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">{{ editing ? '更新' : '添加' }}</el-button>
          <el-button v-if="editing" @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 友链列表 -->
    <el-table :data="links" border stripe>
      <el-table-column prop="name" label="网站名称" width="150"></el-table-column>
      <el-table-column label="网站地址" min-width="200">
        <template slot-scope="scope">
          <a :href="appUrl(scope.row.url)" target="_blank" style="color:#5433ff;">{{ scope.row.url }}</a>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template slot-scope="scope">
          <img v-if="scope.row.avatarUrl" :src="scope.row.avatarUrl" style="width:40px;height:40px;border-radius:50%;" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" @click="edit(scope.row)">编辑</el-button>
          <el-button type="text" style="color:#f56c6c;" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listFriendLinks, createFriendLink, updateFriendLink, deleteFriendLink } from '@/api/admin'
import { uploadPublicImage } from '@/api/blog'
import { fixUrl } from '@/utils/helpers'

export default {
  name: 'FriendLinkList',
  data() {
    return {
      links: [],
      editing: false,
      form: { name: '', url: '', avatarUrl: '', description: '' },
      editId: null
    }
  },
  mounted() {
    this.loadLinks()
  },
  methods: {
    async loadLinks() {
      try {
        const res = await listFriendLinks()
        this.links = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载友链失败', e)
      }
    },
    appUrl(url) {
      if (!url) return '#'
      return fixUrl(url)
    },
    async handleUpload(file) {
      try {
        const res = await uploadPublicImage(file)
        const url = res.data || res
        this.form.avatarUrl = typeof url === 'string' ? url : (url.data || url.url || '')
        this.$message.success('上传成功')
      } catch (e) {
        this.$message.error('上传失败')
      }
      return false
    },
    async save() {
      try {
        if (this.editing) {
          await updateFriendLink(this.editId, this.form)
          this.$message.success('更新成功')
        } else {
          await createFriendLink(this.form)
          this.$message.success('添加成功')
        }
        this.cancelEdit()
        this.loadLinks()
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    edit(row) {
      this.editing = true
      this.editId = row.id
      this.form = { name: row.name, url: row.url, avatarUrl: row.avatarUrl, description: row.description }
    },
    cancelEdit() {
      this.editing = false
      this.editId = null
      this.form = { name: '', url: '', avatarUrl: '', description: '' }
    },
    async del(id) {
      try {
        await this.$confirm('确定删除该友链？删除后对应的审核申请也会同步删除', '提示', { type: 'warning' })
        await deleteFriendLink(id)
        this.$message.success('已删除，审核记录已同步清理')
        this.loadLinks()
      } catch (e) {
        // 取消
      }
    }
  }
}
</script>

<style scoped>
.friend-link-manage {
  padding: 20px;
}
</style>
