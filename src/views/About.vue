<template>
  <div class="about-page">
    <section class="page-head">
      <div class="page-head-in">
        <span class="eyebrow"><i class="dot"></i>{{ content.about.eyebrow }}</span>
        <h1 v-html="content.about.titleHtml"></h1>
        <p class="head-desc">{{ content.about.desc }}</p>
        <div class="head-stats">
          <span><i></i>{{ siteInfo.author || content.about.authorFallback }}</span>
          <span><i></i>{{ content.common.updated }}</span>
        </div>
      </div>
      <PageHeadAnimation variant="aura" />
    </section>

    <div class="about-wrap">
      <section class="profile site-glass">
        <div class="av" :class="{ 'has-img': !!siteInfo.avatar }">
          <img v-if="siteInfo.avatar" :src="siteInfo.avatar" alt="">
          <span v-else>{{ authorInitial }}</span>
        </div>
        <div class="profile-main">
          <h2>{{ siteInfo.author || content.about.authorFallback }}</h2>
          <p>{{ siteInfo.bio || content.about.desc }}</p>
          <div v-if="hasSocial" class="socials">
            <a v-if="siteInfo.githubUrl" :href="fixUrl(siteInfo.githubUrl)" target="_blank" rel="noopener">{{ content.about.github }}</a>
            <a v-if="siteInfo.bilibiliUrl" :href="fixUrl(siteInfo.bilibiliUrl)" target="_blank" rel="noopener">{{ content.about.bilibili }}</a>
            <button v-if="emails.length" type="button" class="social-contact" aria-haspopup="dialog" @click="openContact('email')">
              {{ content.about.email }}<span v-if="emails.length > 1" class="social-count">{{ emails.length }}</span>
            </button>
            <button v-if="qqList.length" type="button" class="social-contact" aria-haspopup="dialog" @click="openContact('qq')">
              {{ content.about.qq }}<span v-if="qqList.length > 1" class="social-count">{{ qqList.length }}</span>
            </button>
            <button v-if="wechatList.length" type="button" class="social-contact" aria-haspopup="dialog" @click="openContact('wechat')">
              {{ content.about.wechat }}<span v-if="wechatList.length > 1" class="social-count">{{ wechatList.length }}</span>
            </button>
          </div>
        </div>
        <div class="profile-meta">
          <span><b>{{ siteInfo.articleCount || 0 }}</b>{{ content.about.articleLabel }}</span>
          <span><b>{{ siteInfo.categoryCount || 0 }}</b>{{ content.about.categoryLabel }}</span>
        </div>
      </section>

      <section class="about-grid">
        <div class="about-label">
          <span>01 / ABOUT</span>
          <h2>{{ content.about.aboutTitle }}</h2>
        </div>
        <div class="about-copy">
          <p v-if="siteInfo.welcomeText" class="welcome" v-html="siteInfo.welcomeText"></p>
          <div v-if="aboutHtml" class="about-html" v-html="aboutHtml"></div>
          <template v-else-if="!siteInfo.welcomeText">
            <p v-for="(p, i) in content.about.paragraphs" :key="i">{{ p }}</p>
          </template>
        </div>
      </section>

      <section class="about-grid" id="messages">
        <div class="about-label">
          <span>02 / MESSAGE</span>
          <h2>{{ content.about.messageTitle }}</h2>
        </div>
        <div class="message-grid">
          <form class="msg-form site-glass" @submit.prevent="sendMessage">
            <input
              v-if="!isLoggedIn"
              v-model="msgNickname"
              type="text"
              maxlength="30"
              :placeholder="content.about.nicknamePlaceholder"
              autocomplete="nickname">
            <div v-else class="msg-as">{{ asUserText }}</div>
            <textarea
              v-model="msgContent"
              maxlength="500"
              :placeholder="content.about.messagePlaceholder"
              required></textarea>
            <button type="submit" :disabled="msgLoading">{{ content.about.submit }}</button>
          </form>

          <div class="msg-list">
            <div v-for="item in messages" :key="item.id" class="msg-item">
              <span class="av">{{ initialOf(item.nickname) }}</span>
              <div>
                <div class="msg-meta">
                  <b>{{ item.nickname || content.about.visitor }}</b>
                  <time>{{ formatTime(item.createTime) }}</time>
                </div>
                <p>{{ item.content }}</p>
              </div>
            </div>
            <div v-if="!messages.length" class="msg-empty">{{ content.about.emptyMessage }}</div>
          </div>
        </div>
      </section>
    </div>

    <ContactModal
      :visible="contactOpen"
      :type="contactType"
      :items="contactItems"
      @close="contactOpen = false" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getMessages, postMessage } from '../api/blog'
import { fixUrl } from '../utils/helpers'
import { formatText } from '../content/site'
import PageHeadAnimation from '../components/PageHeadAnimation.vue'
import ContactModal from '../components/ContactModal.vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

function splitContactValues(raw) {
  return Array.from(new Set(
    String(raw || '')
      .split(/[\s,，;；、|]+/)
      .map(value => value.trim())
      .filter(Boolean)
  ))
}

export default {
  name: 'About',
  components: { PageHeadAnimation, ContactModal },
  data() {
    return {
      messages: [],
      msgNickname: '',
      msgContent: '',
      msgLoading: false,
      contactOpen: false,
      contactType: 'email'
    }
  },
  computed: {
    ...mapState(['siteInfo', 'content']),
    ...mapGetters(['isLoggedIn']),
    userNickname() {
      const user = this.$store.state.auth.user || {}
      return user.nickname || user.username || user.email || ''
    },
    accountEmail() {
      const user = this.$store.state.auth.user || {}
      return user.email || user.nickname || user.username || ''
    },
    authorInitial() {
      return String(this.siteInfo.author || 'T').charAt(0)
    },
    hasSocial() {
      const s = this.siteInfo
      return s.githubUrl || s.bilibiliUrl ||
        this.emails.length || this.qqList.length || this.wechatList.length
    },
    emails() {
      return splitContactValues(this.siteInfo.email)
    },
    qqList() {
      return splitContactValues(this.siteInfo.qqNumber)
    },
    wechatList() {
      return splitContactValues(this.siteInfo.wechatId)
    },
    contactItems() {
      const values = this.contactType === 'email'
        ? this.emails
        : (this.contactType === 'qq' ? this.qqList : this.wechatList)
      return values.map(value => ({ value, label: this.contactLabel(value, this.contactType) }))
    },
    aboutHtml() {
      const raw = this.siteInfo.aboutContent
      if (!raw || !String(raw).trim()) return ''
      return md.render(String(raw))
    },
    asUserText() {
      return formatText(this.content.about.asUser, {
        name: this.accountEmail || this.content.about.anonymous
      })
    }
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    async loadMessages() {
      try {
        const res = await getMessages()
        const data = res.data
        this.messages = (data && data.data) || data || []
        if (!Array.isArray(this.messages)) this.messages = []
      } catch (e) {
        this.messages = []
      }
    },
    async sendMessage() {
      const nickname = this.isLoggedIn ? (this.userNickname || this.content.about.anonymous) : this.msgNickname.trim()
      if (!nickname) {
        this.$message.warning(this.content.about.nicknameRequired)
        return
      }
      if (!this.msgContent || !this.msgContent.trim()) {
        this.$message.warning(this.content.about.messageRequired)
        return
      }
      this.msgLoading = true
      try {
        const user = this.$store.state.auth.user || {}
        const fallback = user.role === 'admin'
          ? (this.siteInfo.defaultAdminAvatarUrl || this.siteInfo.avatar || '')
          : (this.siteInfo.defaultUserAvatarUrl || '')
        await postMessage({
          nickname,
          content: this.msgContent.trim(),
          avatarUrl: user.avatarUrl || fallback
        })
        this.$message.success(this.content.about.messageSuccess)
        this.msgContent = ''
        this.loadMessages()
      } catch (e) {
        this.$message.error(this.content.about.messageFail)
      } finally {
        this.msgLoading = false
      }
    },
    initialOf(name) {
      return String(name || this.content.about.visitor).charAt(0)
    },
    formatTime(t) {
      return t ? String(t).replace('T', ' ').slice(0, 16) : ''
    },
    fixUrl,
    openContact(type) {
      const list = type === 'email'
        ? this.emails
        : (type === 'qq' ? this.qqList : this.wechatList)
      if (!list.length) return
      this.contactType = type
      this.contactOpen = true
    },
    contactLabel(value, type) {
      if (type === 'qq') return 'QQ'
      if (type === 'wechat') return 'WECHAT'
      const domain = String(value).split('@')[1] || ''
      const groups = [
        [/qq\.com|foxmail\.com/i, 'QQ 邮箱'],
        [/outlook\.|hotmail\.|live\./i, 'OUTLOOK'],
        [/gmail\./i, 'GMAIL'],
        [/163\.com|126\.com|yeah\.net/i, '网易邮箱'],
        [/sina\./i, '新浪邮箱'],
        [/aliyun\.com/i, '阿里邮箱'],
        [/icloud\.com|me\.com/i, 'ICLOUD'],
        [/proton/i, 'PROTON']
      ]
      const found = groups.find(group => group[0].test(domain))
      return found ? found[1] : 'MAIL'
    }
  }
}
</script>

<style scoped>
.about-page {
  position: relative;
  min-height: 70vh;
  padding-bottom: 50px;
  overflow-x: clip;
}

/* 页头 */
.page-head {
  position: relative;
  padding: 150px 0 40px;
  overflow: hidden;
  background: radial-gradient(ellipse 50% 70% at 78% 12%, rgba(37, 99, 235, .09), transparent 68%),
              radial-gradient(ellipse 40% 55% at 20% 30%, rgba(6, 182, 212, .06), transparent 70%);
}
.page-head-in {
  position: relative;
  z-index: 1;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: .14em;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--brand);
}
.eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--glow);
  animation: aboutPulse 2.4s infinite;
}
@keyframes aboutPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.page-head h1 {
  font-size: clamp(38px, 5.2vw, 58px);
  line-height: 1.08;
  letter-spacing: -.045em;
  font-weight: 800;
  margin: 20px 0 14px;
  color: var(--text);
}
.head-desc { font-size: 14.5px; color: var(--text-2); max-width: 520px; line-height: 1.85; }
.head-stats {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 20px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: .1em;
}
.head-stats span { display: inline-flex; align-items: center; gap: 7px; }
.head-stats i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.head-orbit {
  position: absolute;
  right: 5%;
  top: 112px;
  width: 260px;
  height: 260px;
  pointer-events: none;
  opacity: .8;
}
.head-orbit i {
  position: absolute;
  inset: 0;
  border: 1px dashed var(--brand);
  opacity: .16;
  border-radius: 50%;
  animation: aboutSpin 46s linear infinite;
}
.head-orbit i:nth-child(2) {
  inset: 58px;
  border-style: solid;
  border-color: var(--brand);
  opacity: .22;
  animation: aboutSpin 30s linear infinite reverse;
}
.head-orbit b {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 70px;
  height: 70px;
  margin: -35px 0 0 -35px;
  border-radius: 22px;
  background: var(--grad);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
  overflow: hidden;
  box-shadow: 0 16px 40px var(--glow);
}
.head-orbit b img { width: 100%; height: 100%; object-fit: cover; }
.head-orbit em {
  position: absolute;
  left: 50%;
  top: -5px;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}
@keyframes aboutSpin { to { transform: rotate(360deg); } }

/* 内容 */
.about-wrap {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 14px 24px 50px;
}
.profile {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 32px;
  border-radius: 24px;
  flex-wrap: wrap;
  row-gap: 18px;
}
.profile .av {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: var(--grad);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 26px;
  font-weight: 800;
  overflow: hidden;
  box-shadow: 0 14px 34px var(--glow);
  flex-shrink: 0;
}
.profile .av img { width: 100%; height: 100%; object-fit: cover; }
.profile .av.has-img {
  background: #fff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .12);
}
.profile-main { flex: 1 1 260px; min-width: 0; }
.profile-main h2 {
  font-size: 24px;
  letter-spacing: -.02em;
  line-height: 1.25;
  color: var(--text);
  overflow-wrap: anywhere;
}
.profile-main p {
  font-size: 13.5px;
  color: var(--text-2);
  margin-top: 4px;
  max-width: 520px;
  overflow-wrap: anywhere;
  line-height: 1.7;
}
.socials {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-3);
}
.socials a,
.socials button {
  color: var(--text-3);
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
}
.socials a:hover,
.socials button:hover { color: var(--brand); }
.socials .social-contact { display: inline-flex; align-items: center; }
.socials .social-count {
  display: inline-grid;
  place-items: center;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  margin-left: 4px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--grad-soft);
  color: var(--brand);
  font-size: 8.5px;
  line-height: 1;
}
.profile-meta {
  margin-left: auto;
  display: flex;
  gap: 26px;
  text-align: center;
}
.profile-meta span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .08em;
  color: var(--text-3);
}
.profile-meta b {
  font-size: 20px;
  line-height: 1.2;
  color: var(--text);
  font-weight: 800;
  letter-spacing: -.02em;
}

.about-grid {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 44px;
  padding: 54px 0;
  border-top: 1px solid var(--border);
  align-items: start;
}
.about-grid > *,
.message-grid > * { min-width: 0; }
.about-label { min-width: 0; }
.about-label span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: .16em;
  color: var(--text-3);
}
.about-label h2 {
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -.03em;
  line-height: 1.2;
  margin-top: 8px;
  color: var(--text);
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}
@media (min-width: 901px) {
  .about-copy,
  .message-grid { padding-top: 30px; }
}
.about-copy {
  min-width: 0;
  overflow-wrap: anywhere;
}
.about-copy p {
  font-size: 15.5px;
  color: var(--text-2);
  line-height: 1.95;
  margin-bottom: 18px;
  max-width: 640px;
  overflow-wrap: anywhere;
}
.about-copy .welcome { white-space: pre-line; }
.about-copy p:last-of-type { margin-bottom: 0; }
.about-html {
  min-width: 0;
  font-size: 15.5px;
  color: var(--text-2);
  line-height: 1.95;
  overflow-wrap: anywhere;
}
.about-html ::v-deep p {
  margin: 0 0 18px;
  max-width: 640px;
  overflow-wrap: anywhere;
}
.about-html ::v-deep h2,
.about-html ::v-deep h3,
.about-html ::v-deep h4 { overflow-wrap: anywhere; }
.about-html ::v-deep li { overflow-wrap: anywhere; }
.about-html ::v-deep h2,
.about-html ::v-deep h3,
.about-html ::v-deep h4 {
  color: var(--text);
  font-weight: 750;
  letter-spacing: -.02em;
  margin: 26px 0 10px;
}
.about-html ::v-deep h2 { font-size: 21px; }
.about-html ::v-deep h3 { font-size: 18px; }
.about-html ::v-deep ul,
.about-html ::v-deep ol { margin: 0 0 18px; padding-left: 1.4em; }
.about-html ::v-deep ul { list-style: disc; }
.about-html ::v-deep ol { list-style: decimal; }
.about-html ::v-deep li { margin-bottom: 7px; line-height: 1.9; }
.about-html ::v-deep blockquote {
  margin: 18px 0;
  padding: 2px 0 2px 16px;
  border-left: 3px solid var(--brand);
  color: var(--text-2);
}
.about-html ::v-deep a { color: var(--brand); text-decoration: underline; }
.about-html ::v-deep code {
  font-family: var(--font-mono);
  font-size: .88em;
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--grad-soft);
  color: var(--brand);
}
.about-html ::v-deep pre {
  margin: 18px 0;
  padding: 14px 16px;
  overflow-x: auto;
  border-radius: 12px;
  background: var(--code-bg, #0f172a);
}
.about-html ::v-deep pre code { padding: 0; background: none; color: #e2e8f0; }
.about-html ::v-deep img { margin: 16px 0; border-radius: 12px; }

/* 留言 */
.message-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.msg-form {
  padding: 20px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
}
.msg-list { min-width: 0; }
.msg-item { min-width: 0; }
.msg-item > div { min-width: 0; }
.msg-form input,
.msg-form textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 12px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
.msg-form input:focus,
.msg-form textarea:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--glow);
}
.msg-form textarea { min-height: 112px; resize: vertical; line-height: 1.7; }
.msg-form button {
  margin-top: 2px;
  height: 40px;
  border-radius: 999px;
  background: var(--grad);
  color: #fff;
  font-size: 13px;
  font-weight: 650;
  box-shadow: 0 8px 20px var(--glow);
  transition: transform .18s var(--ease);
}
.msg-form button:hover:not(:disabled) { transform: translateY(-1px); }
.msg-form button:disabled { opacity: .6; cursor: default; }
.msg-as {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  padding: 2px 2px 0;
}
.msg-list { display: flex; flex-direction: column; }
.msg-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid var(--border); }
.msg-item:first-child { padding-top: 0; }
.msg-item .av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--grad);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}
.msg-meta { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; min-width: 0; }
.msg-meta b { font-size: 13.5px; font-weight: 700; color: var(--text); overflow-wrap: anywhere; }
.msg-meta time { font-family: var(--font-mono); font-size: 10px; color: var(--text-3); }
.msg-item p { font-size: 13.5px; color: var(--text-2); margin-top: 4px; line-height: 1.7; overflow-wrap: anywhere; }
.msg-empty { padding: 22px 0; color: var(--text-3); font-size: 13px; }

@media (max-width: 900px) {
  .head-orbit { display: none; }
  .page-head { padding-top: 130px; }
  .profile-meta {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
    gap: 28px;
    padding-top: 14px;
    padding-left: 100px;
    border-top: 1px solid var(--border);
  }
  .about-grid { grid-template-columns: 1fr; gap: 18px; padding: 38px 0; }
  .message-grid { grid-template-columns: 1fr; gap: 22px; }
  .msg-form { max-width: 560px; }
}
@media (max-width: 520px) {
  .page-head { padding: 110px 0 30px; }
  .page-head h1 { font-size: clamp(32px, 9vw, 42px); }
  .head-desc { font-size: 13.5px; line-height: 1.75; }
  .head-stats { gap: 10px 14px; }
  .about-wrap { padding: 10px 18px 38px; }
  .profile { padding: 20px; gap: 16px; border-radius: 20px; row-gap: 16px; }
  .profile .av { width: 58px; height: 58px; border-radius: 16px; font-size: 20px; }
  .profile-main { flex: 1 1 180px; }
  .profile-main h2 { font-size: 21px; }
  .profile-main p { font-size: 13px; line-height: 1.65; }
  .socials { gap: 12px; font-size: 11px; margin-top: 8px; }
  .profile-meta { gap: 24px; padding-top: 12px; padding-left: 74px; }
  .about-grid { padding: 32px 0; gap: 14px; }
  .about-label h2 { font-size: 24px; }
  .about-copy p { font-size: 14.5px; line-height: 1.9; }
  .about-html { font-size: 14.5px; }
  .about-html ::v-deep p { margin-bottom: 14px; }
  .message-grid { gap: 20px; }
  .msg-form { padding: 16px; max-width: 100%; }
  .msg-form textarea { min-height: 96px; }
  .msg-item { padding: 14px 0; gap: 10px; }
  .msg-item .av { width: 32px; height: 32px; font-size: 12px; }
}
</style>
