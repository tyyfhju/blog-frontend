<template>
  <div class="profile-page">
    <div class="profile-card">
      <h2 class="profile-title">用户中心</h2>
      <p class="profile-subtitle">该页面的信息，本网站将严格保密</p>

      <div class="avatar-section">
        <img :src="avatarSrc" class="avatar-preview" />
        <div class="avatar-actions">
          <el-button size="small" @click="showLinkInput = !showLinkInput">填写链接</el-button>
          <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="image/*">
            <el-button size="small">本地上传</el-button>
          </el-upload>
        </div>
        <div v-if="showLinkInput" class="link-input-row">
          <el-input v-model="avatarLink" placeholder="输入头像图片URL" size="small" style="width:260px" />
          <el-button size="small" type="primary" @click="setAvatarLink">确定</el-button>
        </div>
      </div>

      <el-form :model="form" label-width="90px" style="margin-top:20px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" disabled />
        </el-form-item>
        <el-form-item label="个人网站">
          <el-input v-model="form.website" placeholder="https://" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="Introduce yourself" />
        </el-form-item>
        <el-form-item label="订阅">
          <el-checkbox v-model="form.subscribe" :true-label="1" :false-label="0">
            订阅（当有新文章时邮件通知我）
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile" :loading="saving">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getUserProfile, updateUserProfile, uploadAvatar } from '../api/user'
import { getBlogSetting } from '../api/blog'
import { mapState } from 'vuex'

export default {
  name: 'UserProfile',
  data() {
    return {
      form: {
        nickname: '',
        email: '',
        website: '',
        bio: '',
        subscribe: 0,
        avatarUrl: ''
      },
      defaultAvatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff',
      showLinkInput: false,
      avatarLink: '',
      saving: false
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    avatarSrc() {
      return this.form.avatarUrl || this.siteInfo.defaultUserAvatarUrl || this.defaultAvatar
    }
  },
  mounted() { this.fetch() },
  methods: {
    async fetch() {
      try {
        const res = await getUserProfile()
        const u = res.data
        this.form = {
          nickname: u.nickname || '',
          email: u.email || '',
          website: u.website || '',
          bio: u.bio || '',
          subscribe: u.subscribe || 0,
          avatarUrl: u.avatarUrl || ''
        }
      } catch (e) { this.$message.error('获取用户信息失败') }
    },
    async handleUpload({ file }) {
      try {
        const res = await uploadAvatar(file)
        this.form.avatarUrl = res.data.url || res.data
        this.$message.success('上传成功')
        // 上传后自动保存，同步导航栏头像
        await this.saveProfile()
      } catch (e) {
        if (e.response?.data?.message) {
          this.$message.error(e.response.data.message)
        } else {
          this.$message.error('上传失败')
        }
      }
    },
    async setAvatarLink() {
      if (this.avatarLink.trim()) {
        this.form.avatarUrl = this.avatarLink.trim()
        this.showLinkInput = false
        this.avatarLink = ''
        await this.saveProfile()
      }
    },
    async saveProfile() {
      this.saving = true
      try {
        await updateUserProfile(this.form)
        // 同步更新 store 和 localStorage 中的用户信息
        const user = { ...this.$store.state.auth.user }
        Object.assign(user, this.form)
        localStorage.setItem('user', JSON.stringify(user))
        this.$store.commit('SET_AUTH', { loggedIn: true, user })
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error(e.response?.data?.message || '保存失败')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 60vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4rem 2rem 2rem;
  position: relative;
  z-index: 3;
}
.profile-card {
  width: 100%;
  max-width: 600px;
  padding: 2.5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}
.profile-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-bright);
  text-align: center;
  margin-bottom: 0.25rem;
}
.profile-subtitle {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.avatar-section {
  text-align: center;
}
.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--bg-primary);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  margin-bottom: 12px;
}
.avatar-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.link-input-row {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>