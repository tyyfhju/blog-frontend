<template>
  <div class="about-page">
    <!-- Banner -->
    <div class="about-banner">
      <div class="about-banner-overlay"></div>
      <div class="about-banner-content">
        <h1 class="about-banner-title">关于</h1>
        <p class="about-banner-subtitle">About</p>
      </div>
    </div>

    <div class="about-container">
      <div class="about-card">
        <h2 class="about-heading">关于本站</h2>
        <div class="about-content">
          <div class="about-desc">
            <p v-if="siteInfo.welcomeText || siteInfo.bio" class="welcome-text">{{ siteInfo.welcomeText || siteInfo.bio }}</p>
            <div v-if="siteInfo.techStack" class="tech-stack" v-html="siteInfo.techStack.replace(/\n/g, '<br>')"></div>
            <div v-if="siteInfo.aboutContent" class="about-html" v-html="siteInfo.aboutContent"></div>
          </div>
        </div>
      </div>

      <div class="about-card">
        <h2 class="about-heading">留言</h2>
        <div class="message-form">
          <el-input
            v-if="!isLoggedIn"
            v-model="msgNickname"
            placeholder="昵称（必填）"
            class="msg-input"
            maxlength="30"
          />
          <el-input
            v-model="msgContent"
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
            :loading="msgLoading"
            @click="sendMessage"
          >
            提交留言
          </el-button>
        </div>
        <div class="message-list">
          <div v-for="item in messages" :key="item.id" class="msg-item">
            <div class="msg-avatar">
              <img :src="item.avatarUrl || siteInfo.defaultUserAvatarUrl || siteInfo.avatar" alt="avatar" />
            </div>
            <div class="msg-body">
              <div class="msg-meta">
                <span class="msg-nickname">{{ item.nickname }}</span>
                <span class="msg-time">{{ item.createTime | formatTime }}</span>
              </div>
              <div class="msg-content">{{ item.content }}</div>
            </div>
          </div>
          <div v-if="!messages.length" class="msg-empty">
            <p>暂无留言，来说点什么吧~</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages, postMessage } from '@/api/blog'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'About',
  data() {
    return {
      msgNickname: '',
      msgContent: '',
      msgLoading: false,
      messages: []
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    ...mapGetters(['isLoggedIn', 'userNickname'])
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    async loadMessages() {
      try {
        const res = await getMessages()
        this.messages = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载留言失败', e)
      }
    },
    async sendMessage() {
      const nickname = this.isLoggedIn ? (this.userNickname || '匿名用户') : this.msgNickname
      if (!nickname || !nickname.trim()) {
        this.$message.warning('请输入昵称')
        return
      }
      if (!this.msgContent || !this.msgContent.trim()) {
        this.$message.warning('请输入留言内容')
        return
      }
      this.msgLoading = true
      try {
        await postMessage({
          nickname: nickname.trim(),
          content: this.msgContent.trim(),
          avatarUrl: this.siteInfo.defaultUserAvatarUrl || ''
        })
        this.$message.success('留言成功')
        this.msgContent = ''
        this.loadMessages()
      } catch (e) {
        this.$message.error('留言失败')
      } finally {
        this.msgLoading = false
      }
    }
  }
}
</script>

<style scoped>
.about-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.about-banner {
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
.about-banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.06);
}
.about-banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.about-banner-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.about-banner-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.75);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* ========== Content ========== */
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}
.about-card {
  background: var(--background-secondary);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--text-faint);
}
.about-heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-bright);
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--background-trans);
  position: relative;
}
.about-heading:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: var(--main-gradient);
  border-radius: 2px;
}

.welcome-text {
  font-size: 1rem;
  line-height: 1.9;
  color: var(--text-normal);
  margin-bottom: 1.5rem;
  word-break: break-word;
  overflow-wrap: break-word;
}
.tech-stack {
  font-size: 0.9rem;
  line-height: 2;
  color: var(--text-dim);
  padding: 1.25rem;
  background: var(--background-primary);
  border-radius: 0.75rem;
  border-left: 3px solid;
  border-image: var(--main-gradient) 1;
  word-break: break-word;
  overflow-wrap: break-word;
}
.about-html {
  margin-top: 1.5rem;
  line-height: 1.8;
  color: var(--text-normal);
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 留言表单 */
.message-form {
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

/* 留言列表 */
.message-list {
  margin-top: 2rem;
  border-top: 1px solid var(--background-trans);
  padding-top: 1.5rem;
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
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-time {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.msg-content {
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--text-normal);
  word-break: break-word;
  overflow-wrap: break-word;
}
.msg-empty {
  text-align: center;
  color: var(--text-dim);
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .about-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .about-banner-title {
    font-size: 1.8rem;
  }
  .about-container {
    padding: 0 1rem 2rem;
  }
  .about-card {
    padding: 1.5rem;
  }
}
</style>
