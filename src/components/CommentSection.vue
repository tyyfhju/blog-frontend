<template>
  <div class="comment-section">
    <h3 class="section-title">{{ content.comments.title }} ({{ comments.length }})</h3>
    <div v-if="user" class="comment-form">
      <textarea v-model="commentText" :placeholder="content.comments.placeholder" rows="3" maxlength="1000"></textarea>
      <button @click="submit" :disabled="!commentText.trim()">{{ content.comments.submit }}</button>
    </div>
    <div v-else class="login-tip">
      <a href="javascript:void(0)" @click="openAuth">{{ content.comments.login }}</a> {{ content.comments.loginHint }}
    </div>
    <div class="comments-list" v-if="comments.length">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-user">
          <img :src="avatarOf(comment)" class="avatar-sm" />
          <span class="user-name">{{ comment.user?.nickname || comment.user?.username || content.common.anonymous }}</span>
          <span class="time">{{ formatTime(comment.createTime) }}</span>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </div>
    <div v-else class="no-comments">
      <p>{{ content.comments.empty }}</p>
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
      commentText: '',
      defaultAvatar: 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'
    }
  },
  computed: {
    ...mapState(['siteInfo', 'content']),
    user() {
      return this.$store.state.auth.user
    },
    defaultUserAvatar() {
      return this.siteInfo?.defaultUserAvatarUrl || ''
    },
    defaultAdminAvatar() {
      return this.siteInfo?.defaultAdminAvatarUrl || this.siteInfo?.avatar || ''
    }
  },
  mounted() { this.fetchComments() },
  methods: {
    openAuth() {
      this.$root.$emit('open-auth', 'login')
    },
    avatarOf(comment) {
      const u = comment.user || {}
      const fallback = u.role === 'admin' ? this.defaultAdminAvatar : this.defaultUserAvatar
      return u.avatarUrl || u.avatar || fallback || this.defaultAvatar
    },
    formatTime(t) { return t ? t.substring(0, 10) : '' },
    async fetchComments() {
      try {
        const res = await getComments(this.articleId)
        this.comments = res.data || []
        this.$emit('count-change', this.comments.length)
      } catch (e) { console.error('Comment load error:', e) }
    },
    async submit() {
      if (!this.commentText.trim()) return
      try {
        await postComment({ articleId: this.articleId, content: this.commentText.trim() })
        this.$message.success(this.content.comments.success)
        this.commentText = ''
        this.fetchComments()
      } catch (e) {
        this.$message.error(e.response?.data?.message || this.content.comments.fail)
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
  color: var(--text);
  font-size: 17px;
  font-weight: 750;
  margin-bottom: 18px;
}
.comment-form { margin-bottom: 1.5rem; }
.comment-form textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
}
.comment-form textarea:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--glow);
}
.comment-form button {
  margin-top: 10px;
  background: var(--grad);
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  transition: opacity 0.2s;
}
.comment-form button:disabled { opacity: 0.5; cursor: not-allowed; }
.comment-form button:hover:not(:disabled) { opacity: 0.9; }
.login-tip {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-3);
  font-size: 13.5px;
}
.login-tip a { color: var(--brand); }
.comments-list { margin-top: 1rem; }
.comment-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.comment-item:last-child { border-bottom: none; }
.comment-user { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.avatar-sm {
  width: 36px; height: 36px;
  border-radius: 50%; object-fit: cover;
  border: 0;
}
.user-name { font-weight: 700; color: var(--text); font-size: 13.5px; }
.time { margin-left: auto; color: var(--text-3); font-family: var(--font-mono); font-size: 10.5px; }
.comment-content {
  margin: 4px 0 0 46px;
  line-height: 1.7;
  color: var(--text-2);
  font-size: 13.5px;
}
.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-3);
  font-size: 13.5px;
}
</style>