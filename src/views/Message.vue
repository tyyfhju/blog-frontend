<template>
  <div class="message-page">
    <!-- Banner -->
    <div class="msg-banner">
      <div class="msg-banner-overlay"></div>
      <div class="msg-banner-content">
        <h1 class="msg-banner-title">留言板</h1>
        <p class="msg-banner-subtitle">Messages</p>
      </div>
    </div>

    <div class="msg-container">
      <div class="msg-card">
        <h3 class="msg-heading">写下留言</h3>
        <div class="msg-form">
          <el-input
            v-if="!isLoggedIn"
            v-model="nickname"
            placeholder="昵称（必填）"
            class="msg-input"
            maxlength="30"
          />
          <el-input
            v-model="content"
            type="textarea"
            :rows="3"
            placeholder="说点什么吧..."
            class="msg-textarea"
            maxlength="500"
            show-word-limit
          />
          <el-button
            type="primary"
            class="msg-btn"
            :loading="loading"
            @click="submitMessage"
          >
            提交留言
          </el-button>
        </div>
      </div>

      <div class="msg-card" v-if="messages.length > 0">
        <h3 class="msg-heading">全部留言 ({{ messages.length }})</h3>
        <div v-for="msg in messages" :key="msg.id" class="msg-item">
          <div class="msg-avatar">
            <img :src="msg.avatarUrl || defaultUserAvatar" alt="avatar" />
          </div>
          <div class="msg-body">
            <div class="msg-meta">
              <span class="msg-nickname">{{ msg.nickname }}</span>
              <span class="msg-time">{{ formatTime(msg.createTime) }}</span>
            </div>
            <div class="msg-content">{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <div v-else class="msg-card msg-empty-card">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1" opacity="0.4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>暂无留言，来说点什么吧~</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages, postMessage } from '@/api/blog'
import { mapGetters } from 'vuex'

export default {
  name: 'Message',
  data() {
    return {
      nickname: '',
      content: '',
      loading: false,
      messages: []
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'userNickname']),
    defaultUserAvatar() {
      return this.$store.state.siteInfo.defaultUserAvatarUrl
        || this.$store.state.siteInfo.avatar
        || 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'
    },
    myAvatar() {
      const user = this.$store.state.auth.user || {}
      const fallback = user.role === 'admin'
        ? (this.$store.state.siteInfo.defaultAdminAvatarUrl || this.$store.state.siteInfo.avatar)
        : (this.$store.state.siteInfo.defaultUserAvatarUrl || this.$store.state.siteInfo.avatar)
      return user.avatarUrl || fallback || 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'
    }
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    formatTime(t) {
      return t ? String(t).replace('T', ' ').slice(0, 16) : ''
    },
    async loadMessages() {
      try {
        const res = await getMessages()
        this.messages = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载留言失败', e)
      }
    },
    async submitMessage() {
      const nick = this.isLoggedIn ? (this.userNickname || '匿名用户') : this.nickname
      if (!nick || !nick.trim()) {
        this.$message.warning('请输入昵称')
        return
      }
      if (!this.content || !this.content.trim()) {
        this.$message.warning('请输入留言内容')
        return
      }
      this.loading = true
      try {
        await postMessage({
          nickname: nick.trim(),
          content: this.content.trim(),
          avatarUrl: this.myAvatar
        })
        this.$message.success('留言成功')
        this.content = ''
        this.loadMessages()
      } catch (e) {
        this.$message.error('留言失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.message-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.msg-banner {
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
.msg-banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.06);
}
.msg-banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.msg-banner-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.msg-banner-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.75);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* ========== Content ========== */
.msg-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}
.msg-card {
  background: var(--background-secondary);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--text-faint);
}
.msg-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-bright);
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--background-trans);
  position: relative;
}
.msg-heading:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: var(--main-gradient);
  border-radius: 2px;
}

.msg-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.msg-input, .msg-textarea {
  width: 100%;
}
.msg-btn {
  align-self: flex-end;
  background: var(--main-gradient) !important;
  border: none !important;
  color: #fff;
  font-weight: 600;
}

.msg-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--background-trans);
}
.msg-item:last-child { border-bottom: none; }
.msg-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.msg-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.3rem;
}
.msg-nickname {
  font-weight: 600;
  background: var(--main-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.9rem;
}
.msg-time {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.msg-content {
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--text-normal);
}
.msg-empty-card {
  text-align: center;
  color: var(--text-dim);
  padding: 3rem 2rem;
}

@media (max-width: 640px) {
  .msg-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .msg-banner-title {
    font-size: 1.8rem;
  }
  .msg-container {
    padding: 0 1rem 2rem;
  }
  .msg-card {
    padding: 1.5rem;
  }
}
</style>
