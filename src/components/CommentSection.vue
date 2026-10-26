<template>
  <div class="comment-section">
    <h3 class="section-title">评论 ({{ comments.length }})</h3>
    <div v-if="user" class="comment-form">
      <textarea v-model="content" placeholder="写下你的评论..." rows="3"></textarea>
      <button @click="submit" :disabled="!content.trim()">发表评论</button>
    </div>
    <div v-else class="login-tip">
      <router-link to="/login">登录</router-link> 后才能发表评论
    </div>
    <div class="comments-list" v-if="comments.length">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-user">
          <img :src="comment.user?.avatarUrl || comment.user?.avatar || defaultUserAvatar || defaultAvatar" class="avatar-sm" />
          <span class="user-name">{{ comment.user?.nickname || comment.user?.username || comment.user?.email }}</span>
          <span class="time">{{ formatTime(comment.createTime) }}</span>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </div>
    <div v-else class="no-comments">
      <p>暂无评论，来抢沙发吧~</p>
    </div>
  </div>
</template>

<script>
import { getComments, postComment } from '../api/comment'
import { mapState } from 'vuex'

export default {
  props: { articleId: { type: Number, required: true } },
  data() {
    return {
      comments: [],
      content: '',
      defaultAvatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    user() {
      return JSON.parse(localStorage.getItem('user') || 'null')
    },
    defaultUserAvatar() {
      return this.siteInfo?.defaultUserAvatarUrl || ''
    }
  },
  mounted() { this.fetchComments() },
  methods: {
    formatTime(t) { return t ? t.substring(0, 10) : '' },
    async fetchComments() {
      try {
        const res = await getComments(this.articleId)
        this.comments = res.data || []
      } catch (e) { console.error('Comment load error:', e) }
    },
    async submit() {
      if (!this.content.trim()) return
      try {
        await postComment({ articleId: this.articleId, content: this.content.trim() })
        this.$message.success('评论发表成功')
        this.content = ''
        this.fetchComments()
      } catch (e) {
        this.$message.error(e.response?.data?.message || '评论失败，请登录后重试')
      }
    }
  }
}
</script>

<style scoped>
.comment-section {
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}
.section-title {
  color: var(--text-bright);
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}
.comment-form { margin-bottom: 1.5rem; }
.comment-form textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--background-trans);
  background: var(--background-primary);
  color: var(--text-normal);
  resize: vertical;
  font-size: 0.9rem;
  font-family: inherit;
}
.comment-form textarea:focus { outline: none; border-color: var(--text-accent); }
.comment-form button {
  margin-top: 10px;
  background: var(--main-gradient);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.comment-form button:disabled { opacity: 0.5; cursor: not-allowed; }
.comment-form button:hover:not(:disabled) { opacity: 0.9; }
.login-tip {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-dim);
  font-size: 0.9rem;
}
.login-tip a { color: var(--text-accent); }
.comments-list { margin-top: 1rem; }
.comment-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--background-trans);
}
.comment-item:last-child { border-bottom: none; }
.comment-user { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.avatar-sm {
  width: 32px; height: 32px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid var(--background-primary);
}
.user-name { font-weight: 600; color: var(--text-bright); font-size: 0.9rem; }
.time { margin-left: auto; color: var(--text-dim); font-size: 0.75rem; }
.comment-content {
  margin: 4px 0 0 42px;
  line-height: 1.7;
  color: var(--text-normal);
  font-size: 0.9rem;
}
.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-dim);
  font-size: 0.9rem;
}
</style>