<template>
  <div class="ai-chatbot">
    <!-- 聊天面板 -->
    <transition name="chat-slide">
      <div v-if="open" class="chat-panel">
        <div class="chat-header">
          <span class="chat-header-title">
            <i class="el-icon-cpu"></i> 博客小助手
          </span>
          <el-button type="text" class="chat-close" @click="open = false">
            <i class="el-icon-close"></i>
          </el-button>
        </div>

        <div class="chat-body" ref="chatBody">
          <div v-if="messages.length === 0" class="chat-empty">
            <i class="el-icon-chat-dot-round" style="font-size:48px;color:#ccc"></i>
            <p>你好！我是博客小助手</p>
            <p style="font-size:0.8rem;color:#999">可以问我关于博客的任何问题~</p>
          </div>

          <div v-for="(m, idx) in messages" :key="idx" :class="['chat-msg', m.role]">
            <div class="chat-avatar">
              <i v-if="m.role === 'assistant'" class="el-icon-cpu"></i>
              <i v-else class="el-icon-user"></i>
            </div>
            <div class="chat-bubble">
              <div v-html="m.content"></div>
              <div v-if="m.articles && m.articles.length" class="chat-articles">
                <div class="chat-articles-title">相关文章：</div>
                <a v-for="a in m.articles" :key="a.id"
                   :href="'/article/' + a.id" target="_blank"
                   class="chat-article-link">
                  {{ a.title }}
                </a>
              </div>
            </div>
          </div>

          <div v-if="loading" class="chat-msg assistant">
            <div class="chat-avatar"><i class="el-icon-cpu"></i></div>
            <div class="chat-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <el-input v-model="input" placeholder="输入你的问题..." size="small"
                    @keyup.enter.native="send"
                    :disabled="loading">
            <el-button slot="append" icon="el-icon-s-promotion"
                       @click="send" :disabled="loading || !input.trim()"></el-button>
          </el-input>
        </div>
      </div>
    </transition>

    <!-- 浮动机器人按钮 -->
    <div class="chat-robot" :class="{ active: open }" @click.stop="toggle">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        <circle cx="12" cy="16" r="1"></circle>
        <line x1="9" y1="16" x2="9" y2="16"></line>
        <line x1="15" y1="16" x2="15" y2="16"></line>
      </svg>
    </div>
  </div>
</template>

<script>
import { chatWithAI } from '@/api/blog'

export default {
  name: 'AIChatBot',
  data() {
    return {
      open: false,
      input: '',
      loading: false,
      messages: []
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
      if (this.open) {
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    async send() {
      const msg = this.input.trim()
      if (!msg || this.loading) return

      this.messages.push({ role: 'user', content: this.escapeHtml(msg) })
      this.input = ''
      this.loading = true
      this.$nextTick(() => this.scrollToBottom())

      try {
        const res = await chatWithAI(msg)
        const data = res.data
        this.messages.push({
          role: 'assistant',
          content: this.formatReply(data.reply),
          articles: data.relatedArticles || []
        })
      } catch (e) {
        let msg = '抱歉，小助手暂时无法回复，请稍后再试。'
        if (e.response && e.response.status === 429) {
          msg = e.response.data.error || '请求太频繁，请稍后再试。'
        }
        this.messages.push({ role: 'assistant', content: msg })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    escapeHtml(text) {
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    },
    formatReply(text) {
      return this.escapeHtml(text).replace(/\n/g, '<br>')
    },
    scrollToBottom() {
      const el = this.$refs.chatBody
      if (el) el.scrollTop = el.scrollHeight
    }
  }
}
</script>

<style scoped>
.ai-chatbot {
  position: fixed;
  left: 5.5rem;
  bottom: 1.2rem;
  z-index: 1001;
}

/* 浮动机器人 */
.chat-robot {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: var(--main-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,.2);
  transition: all .3s ease;
  font-size: 1.5rem;
  color: #fff;
}
.chat-robot:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0,0,0,.3);
}
.chat-robot.active {
  transform: scale(0.9);
  opacity: 0.7;
}

/* 聊天面板 */
.chat-panel {
  position: absolute;
  bottom: 4.5rem;
  left: 0;
  width: 380px;
  max-height: 520px;
  background: var(--background-secondary);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,.08);
}

.chat-header {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-header-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-bright);
}
.chat-header-title i { margin-right: 6px; color: var(--text-accent); }
.chat-close {
  padding: 4px;
  color: var(--text-dim);
  font-size: 1rem;
}

/* 消息区域 */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  max-height: 360px;
  background: var(--background-primary);
}
.chat-empty {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-dim);
  font-size: 0.9rem;
}
.chat-empty p { margin: 0.3rem 0; }

.chat-msg {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.chat-msg.user { flex-direction: row-reverse; }

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.9rem;
  color: var(--text-accent);
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
}
.chat-msg.user .chat-avatar {
  color: #fff;
  background: var(--main-gradient);
}

.chat-bubble {
  max-width: 75%;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.55;
  word-break: break-word;
  color: var(--text-normal);
  background: var(--background-secondary);
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.chat-msg.user .chat-bubble {
  background: var(--main-gradient);
  color: #fff;
}

/* 打字动画 */
.chat-bubble.typing span {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-dim);
  margin: 0 2px;
  animation: typing-dot 1.4s infinite both;
}
.chat-bubble.typing span:nth-child(2) { animation-delay: .2s; }
.chat-bubble.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes typing-dot {
  0%,80%,100% { transform: scale(0.6); opacity: .4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 相关文章 */
.chat-articles {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,.08);
}
.chat-articles-title {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-bottom: 4px;
}
.chat-article-link {
  display: block;
  font-size: 0.8rem;
  color: var(--text-accent);
  padding: 2px 0;
  text-decoration: none;
}
.chat-article-link:hover { opacity: .7; }
.chat-msg.user .chat-article-link { color: rgba(255,255,255,.85); }
.chat-msg.user .chat-articles { border-top-color: rgba(255,255,255,.2); }
.chat-msg.user .chat-articles-title { color: rgba(255,255,255,.65); }

/* 输入区 */
.chat-footer {
  padding: 0.7rem 0.8rem;
  border-top: 1px solid rgba(0,0,0,.06);
}

/* 过渡动画 */
.chat-slide-enter-active { animation: slideUp .3s ease; }
.chat-slide-leave-active { animation: slideUp .3s ease reverse; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 420px) {
  .chat-panel { width: 90vw; max-height: 65vh; }
  .chat-body { max-height: 40vh; }
}
</style>
