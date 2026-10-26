<template>
  <div class="links-page">
    <!-- Banner -->
    <div class="links-banner">
      <div class="links-banner-overlay"></div>
      <div class="links-banner-content">
        <h1 class="links-banner-title">友链</h1>
        <p class="links-banner-subtitle">Friends</p>
      </div>
    </div>

    <div class="links-container">
      <!-- 友链展示 -->
      <div class="links-card">
        <h3 class="links-heading">友情链接</h3>
        <div class="link-grid" v-if="friendLinks.length">
          <a
            v-for="link in friendLinks"
            :key="link.id"
            :href="formatUrl(link.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="link-item"
          >
            <img :src="link.avatarUrl || defaultAvatar" :alt="link.name" class="link-avatar" />
            <div class="link-info">
              <div class="link-name">{{ link.name }}</div>
              <div class="link-desc">{{ link.description || link.url }}</div>
            </div>
          </a>
        </div>
        <div v-else class="links-empty">
          <p>暂无友链</p>
        </div>
      </div>

      <!-- 申请友链 -->
      <div class="links-card">
        <h3 class="links-heading">申请友链</h3>
        <div v-if="!isLoggedIn" class="apply-login">
          <p>登录后即可申请友链</p>
          <el-button type="primary" class="apply-btn" @click="$router.push('/login')">去登录</el-button>
        </div>
        <div v-else class="apply-form">
          <el-input v-model="applyForm.name" placeholder="网站名称 *" class="apply-input" maxlength="30" />
          <el-input v-model="applyForm.url" placeholder="网站地址 *" class="apply-input" maxlength="255" />
          <div class="avatar-row">
            <el-input v-model="applyForm.avatarUrl" placeholder="头像URL" class="apply-input" maxlength="500" />
            <el-upload
              class="avatar-upload"
              action="#"
              :show-file-list="false"
              :before-upload="handleAvatarUpload"
              accept="image/*"
            >
              <el-button size="small" icon="el-icon-picture">上传</el-button>
            </el-upload>
          </div>
          <img v-if="applyForm.avatarUrl" :src="applyForm.avatarUrl" class="avatar-preview" />
          <el-input v-model="applyForm.description" placeholder="网站描述" type="textarea" :rows="2" maxlength="200" show-word-limit />
          <el-button type="primary" class="apply-btn" :loading="applyLoading" @click="submitApplication">提交申请</el-button>
          <p v-if="applyMsg" class="apply-msg">{{ applyMsg }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFriendLinks, applyFriendLink, uploadPublicImage } from '@/api/blog'
import { fixUrl } from '@/utils/helpers'
import { mapGetters } from 'vuex'

export default {
  name: 'Links',
  data() {
    return {
      friendLinks: [],
      applyForm: { name: '', url: '', avatarUrl: '', description: '' },
      applyLoading: false,
      applyMsg: ''
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    defaultAvatar() {
      return this.$store.state.siteInfo.defaultUserAvatarUrl
        || this.$store.state.siteInfo.avatarUrl
        || 'https://ui-avatars.com/api/?name=L&background=667eea&color=fff'
    }
  },
  mounted() {
    this.loadFriendLinks()
  },
  methods: {
    async loadFriendLinks() {
      try {
        const res = await getFriendLinks()
        this.friendLinks = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载友链失败', e)
      }
    },
    formatUrl(url) {
      if (!url) return '#'
      return fixUrl(url)
    },
    async handleAvatarUpload(file) {
      try {
        const res = await uploadPublicImage(file)
        const url = (res.data && res.data.url) || ''
        if (url) {
          this.applyForm.avatarUrl = url
          this.$message.success('头像上传成功')
        }
      } catch (e) {
        this.$message.error('头像上传失败')
      }
      return false
    },
    async submitApplication() {
      if (!this.applyForm.name.trim()) {
        this.$message.warning('请输入网站名称')
        return
      }
      if (!this.applyForm.url.trim()) {
        this.$message.warning('请输入网站地址')
        return
      }
      this.applyLoading = true
      this.applyMsg = ''
      try {
        await applyFriendLink(this.applyForm)
        this.$message.success('友链申请已提交，等待审核')
        this.applyForm = { name: '', url: '', avatarUrl: '', description: '' }
        this.applyMsg = '申请已提交，管理员审核后即可显示'
      } catch (e) {
        this.$message.error('申请失败，请稍后再试')
      } finally {
        this.applyLoading = false
      }
    }
  }
}
</script>

<style scoped>
.links-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.links-banner {
  position: relative;
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-gradient);
  clip-path: polygon(0 0, 100% 0, 100% 72%, 0 100%);
  margin-bottom: 2rem;
}
.links-banner-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.06);
}
.links-banner-content {
  position: relative; z-index: 2;
  text-align: center; padding: 2rem;
}
.links-banner-title {
  font-size: 2.5rem; font-weight: 800;
  color: #fff; margin: 0 0 0.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.links-banner-subtitle {
  font-size: 0.9rem; color: rgba(255,255,255,0.75);
  margin: 0; text-transform: uppercase; letter-spacing: 3px;
}

/* ========== Content ========== */
.links-container {
  max-width: 800px; margin: 0 auto;
  padding: 0 2rem 3rem;
}
.links-card {
  background: var(--background-secondary);
  border-radius: 1rem; padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--text-faint);
}
.links-heading {
  font-size: 1.1rem; font-weight: 700;
  color: var(--text-bright); margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--background-trans);
  position: relative;
}
.links-heading:after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 50px; height: 2px;
  background: var(--main-gradient); border-radius: 2px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}
.link-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem; border-radius: 0.75rem;
  background: var(--background-primary);
  text-decoration: none;
  transition: all 0.3s;
}
.link-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--accent-shadow);
  background: var(--background-secondary);
}
.link-avatar {
  width: 48px; height: 48px;
  border-radius: 50%; object-fit: cover;
  flex-shrink: 0;
}
.link-name {
  font-size: 0.9rem; font-weight: 600;
  color: var(--text-bright);
}
.link-desc {
  font-size: 0.78rem; color: var(--text-dim);
  margin-top: 0.2rem;
  overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; max-width: 180px;
}
.links-empty {
  text-align: center; color: var(--text-dim); padding: 2rem 0;
}

.apply-login {
  text-align: center; padding: 2rem 0; color: var(--text-dim);
}
.apply-form {
  display: flex; flex-direction: column; gap: 1rem;
}
.apply-input { width: 100%; }
.avatar-row {
  display: flex; gap: 0.5rem; align-items: center;
}
.avatar-preview {
  width: 60px; height: 60px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid var(--background-trans);
}
.apply-btn {
  align-self: flex-end;
  background: var(--main-gradient) !important;
  border: none !important;
  color: #fff; font-weight: 600;
}
.apply-msg {
  text-align: center; color: #67c23a; font-size: 0.9rem;
}

@media (max-width: 640px) {
  .links-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .links-banner-title { font-size: 1.8rem; }
  .links-container { padding: 0 1rem 2rem; }
  .links-card { padding: 1.5rem; }
  .link-grid { grid-template-columns: 1fr; }
}
</style>
