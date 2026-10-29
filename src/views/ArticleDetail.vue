<template>
  <div class="article-page">
    <div class="reading-progress" :style="{ width: progressPercent + '%' }"></div>

    <template v-if="article">
      <div v-if="article.coverUrl" class="article-bg" :class="{ on: bgOn }">
        <img :src="article.coverUrl" alt="">
      </div>

      <section ref="intro" class="intro">
        <div class="intro-pin">
          <div class="intro-bg"></div>
          <ArticleIntroCanvas :progress="introProgress" :variant="introVariant" />
          <div class="intro-copy" :style="introCopyStyle">
            <div class="hero-meta">
              <span>{{ formatDate(article.createTime) }}</span>
              <span v-if="article.categoryName" class="cat">{{ article.categoryName }}</span>
              <span>{{ readingTime }} {{ content.article.minutes }}{{ content.article.reading }}</span>
            </div>
            <h1>{{ article.title }}</h1>
            <div class="hero-author">
              <img v-if="siteInfo.avatar" :src="siteInfo.avatar" class="av" alt="">
              <span v-else class="av">{{ authorInitial }}</span>
              <span>{{ siteInfo.author || content.about.authorFallback }}</span>
              <span class="author-words">· {{ formatWords(wordCount) }} {{ content.article.words }}</span>
            </div>
          </div>
          <div class="intro-hint"><i></i>{{ content.article.scrollHint }}</div>
        </div>
      </section>

      <div class="layout">
        <div ref="body" class="body">
          <div class="meta-bar">
            <span>👁 <b class="lit">{{ formatNumber(article.viewCount) }}</b> {{ content.article.views }}</span>
            <span class="like-btn" :class="{ liked: isLiked }" @click="toggleLike">
              ♥ <b class="lit">{{ formatNumber(article.likeCount) }}</b> {{ content.article.likes }}
            </span>
            <span>💬 <b class="lit">{{ formatNumber(article.commentCount) }}</b> {{ content.article.comments }}</span>
            <span>⏱ <b class="lit">{{ readingTime }}</b> {{ content.article.minutes }}</span>
          </div>

          <div ref="postContent" class="prose markdown-body" v-highlight v-html="compiledHtml"></div>

          <div v-if="tags.length" ref="tags" class="tags">
            <span v-for="(name, i) in tags" :key="i" class="tag">#{{ name }}</span>
          </div>

          <nav ref="adjacent" class="adjacent">
            <div v-if="previousArticle && previousArticle.id" class="adj site-glass" @click="goTo(previousArticle.id)">
              <small>{{ content.article.previous }}</small>
              <b>{{ previousArticle.title }}</b>
            </div>
            <div v-if="nextArticle && nextArticle.id" class="adj site-glass right" @click="goTo(nextArticle.id)">
              <small>{{ content.article.next }}</small>
              <b>{{ nextArticle.title }}</b>
            </div>
          </nav>

          <section ref="comments" class="comments site-glass">
            <CommentSection :articleId="Number(article.id)" @count-change="onCommentCount" />
          </section>
        </div>
      </div>

      <div class="variant-ui site-glass">
        <span>{{ variantBadge }}</span>
        <button type="button" @click="nextVariant">{{ content.article.variant.next }}</button>
      </div>
    </template>

    <div v-else class="article-loading">{{ loadError ? content.article.loadFail : content.common.loading }}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArticleDetail, likeArticle, unlikeArticle } from '../api/blog'
import CommentSection from '@/components/CommentSection.vue'
import ArticleIntroCanvas from '@/components/ArticleIntroCanvas.vue'
import { formatText } from '../content/site'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const lang = info.split(/\s+/g)[0]
  const label = lang ? lang.toUpperCase() : 'CODE'
  const cls = 'hljs' + (lang ? ' language-' + md.utils.escapeHtml(lang) : '')
  return '<div class="code">'
    + '<div class="code-bar"><i></i><i></i><i></i><span>' + md.utils.escapeHtml(label) + '</span>'
    + '<button class="code-copy-btn" type="button">复制</button></div>'
    + '<pre><code class="' + cls + '">' + md.utils.escapeHtml(token.content) + '</code></pre>'
    + '</div>'
}

export default {
  name: 'ArticleDetail',
  components: { CommentSection, ArticleIntroCanvas },
  data() {
    return {
      article: null,
      previousArticle: null,
      nextArticle: null,
      wordCount: 0,
      readingTime: 0,
      progressPercent: 0,
      introProgress: 0,
      introVariant: 1,
      bgOn: false,
      isLiked: false,
      loadError: false,
      revealObserver: null,
      bgObserver: null,
      scrollTick: false
    }
  },
  computed: {
    ...mapState(['siteInfo', 'content']),
    authorInitial() {
      return String(this.siteInfo.author || 'T').charAt(0).toUpperCase()
    },
    tags() {
      if (!this.article) return []
      const raw = this.article.tagNames || this.article.tags || []
      return raw.map(t => (typeof t === 'string' ? t : (t && t.name) || '')).filter(Boolean)
    },
    compiledHtml() {
      if (!this.article || !this.article.content) return ''
      const html = md.render(this.article.content)
      const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, '')
      this.wordCount = text.length
      this.readingTime = Math.max(1, Math.ceil(text.length / 500))
      return html
    },
    introCopyStyle() {
      return {
        opacity: Math.max(0, 1 - this.introProgress / 0.58),
        transform: 'translate3d(0,' + (this.introProgress * -70) + 'px,0)'
      }
    },
    variantBadge() {
      const names = this.content.article.variant.names || []
      return formatText(this.content.article.variant.badge, {
        n: this.introVariant,
        name: names[this.introVariant - 1] || ''
      })
    }
  },
  watch: {
    '$route.params.id'() {
      this.loadArticle()
    }
  },
  created() {
    this.pickInitialVariant()
  },
  mounted() {
    this.loadArticle()
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
    this.disconnectObservers()
  },
  methods: {
    pickInitialVariant() {
      const queryVariant = Number(this.$route.query.v)
      this.introVariant = queryVariant >= 1 && queryVariant <= 4
        ? queryVariant
        : Math.floor(Math.random() * 4) + 1
    },
    nextVariant() {
      this.introVariant = (this.introVariant % 4) + 1
    },
    async loadArticle() {
      const id = this.$route.params.id
      if (!id) return
      this.disconnectObservers()
      this.article = null
      this.loadError = false
      this.bgOn = false
      this.introProgress = 0
      try {
        const res = await getArticleDetail(id)
        const data = res.data
        if (data.article) {
          this.article = data.article
          this.previousArticle = data.previous || null
          this.nextArticle = data.next || null
          this.isLiked = data.liked || false
        } else {
          this.article = data
        }
        if (this.article) {
          document.title = this.article.title + ' - ' + (this.siteInfo.title || 'tyyfhju')
        }
        this.$nextTick(() => {
          this.setupDecorations()
          this.updateScroll()
        })
      } catch (e) {
        this.loadError = true
        this.$message?.error(this.content.article.loadFail)
      }
    },
    onCommentCount(count) {
      if (this.article) this.article.commentCount = count
    },
    setupDecorations() {
      this.setupReveal()
      this.setupBackground()
      this.setupCodeCopy()
    },
    setupReveal() {
      const root = this.$refs.postContent
      if (!root) return
      const proseEls = Array.prototype.slice.call(root.children).filter(el => (
        el.tagName === 'P' || el.tagName === 'H2' || el.tagName === 'H3' ||
        el.tagName === 'BLOCKQUOTE' || el.classList.contains('code')
      ))
      const extraEls = [this.$refs.tags, this.$refs.adjacent, this.$refs.comments].filter(Boolean)
      const all = proseEls.concat(extraEls)
      if (!all.length) return

      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || !('IntersectionObserver' in window)) {
        all.forEach(el => el.classList.add('reveal', 'in'))
        return
      }

      this.revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            this.revealObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

      all.forEach(el => {
        el.classList.add('reveal')
        this.revealObserver.observe(el)
      })
    },
    setupBackground() {
      if (!this.article || !this.article.coverUrl || !this.$refs.body) return
      if (!('IntersectionObserver' in window)) {
        this.bgOn = true
        return
      }
      this.bgObserver = new IntersectionObserver(entries => {
        this.bgOn = entries[0] && entries[0].isIntersecting
      }, { rootMargin: '-8% 0px -8% 0px', threshold: 0 })
      this.bgObserver.observe(this.$refs.body)
    },
    setupCodeCopy() {
      const root = this.$refs.postContent
      if (!root) return
      const buttons = root.querySelectorAll('.code-copy-btn')
      buttons.forEach(btn => {
        btn.textContent = this.content.article.copyCode
        if (btn._bound) return
        btn._bound = true
        btn.addEventListener('click', () => {
          const code = btn.closest('.code')?.querySelector('code')
          const text = code ? code.innerText : ''
          const done = () => {
            btn.textContent = this.content.article.copied
            setTimeout(() => { btn.textContent = this.content.article.copyCode }, 1600)
          }
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(done)
          } else {
            const textarea = document.createElement('textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            done()
          }
        })
      })
    },
    async toggleLike() {
      const id = this.article.id
      try {
        if (this.isLiked) {
          const res = await unlikeArticle(id)
          if (res.data.success) {
            this.isLiked = false
            this.article.likeCount = Math.max(0, (this.article.likeCount || 0) - 1)
            this.$message.success(res.data.message)
          } else {
            this.$message.warning(res.data.message)
          }
        } else {
          const res = await likeArticle(id)
          if (res.data.success) {
            this.isLiked = true
            this.article.likeCount = (this.article.likeCount || 0) + 1
            this.$message.success(res.data.message)
          } else {
            this.$message.warning(res.data.message)
          }
        }
      } catch (e) {
        if (e.response?.status === 401 || e.response?.status === 403) {
          this.$message.warning(this.content.article.likeHint)
        }
      }
    },
    onScroll() {
      if (this.scrollTick) return
      this.scrollTick = true
      requestAnimationFrame(() => {
        this.updateScroll()
        this.scrollTick = false
      })
    },
    updateScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      this.progressPercent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      const intro = this.$refs.intro
      if (!intro) return
      const total = intro.offsetHeight - window.innerHeight
      if (total <= 0) {
        this.introProgress = 0
        return
      }
      const top = intro.getBoundingClientRect().top
      this.introProgress = Math.max(0, Math.min(1, -top / total))
    },
    disconnectObservers() {
      if (this.revealObserver) {
        this.revealObserver.disconnect()
        this.revealObserver = null
      }
      if (this.bgObserver) {
        this.bgObserver.disconnect()
        this.bgObserver = null
      }
    },
    formatDate(t) {
      return t ? String(t).slice(0, 10) : ''
    },
    formatWords(n) {
      if (!n) return '0'
      return n > 999 ? (n / 1000).toFixed(1) + 'k' : String(n)
    },
    formatNumber(n) {
      return Number(n || 0).toLocaleString('en-US')
    },
    goTo(id) {
      this.$router.push('/article/' + id)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }
}
</script>

<style>
/* 文章详情：严格按 .work/mockup/scroll-article.html 的布局与排版 */
.article-page {
  position: relative;
  min-height: 70vh;
  padding-bottom: 40px;
}
.article-page .reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--grad);
  z-index: 200;
  transition: width .08s linear;
  border-radius: 0 2px 2px 0;
}

/* 背景板 */
.article-page .article-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity .9s var(--ease);
  overflow: hidden;
}
.article-page .article-bg.on { opacity: 1; }
.article-page .article-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(58px) saturate(125%);
  transform: scale(1.2);
}
.article-page .article-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--bg) 0%, var(--bg-veil) 16%, var(--bg-veil) 84%, var(--bg) 100%);
}

/* 入场动画 */
.article-page .intro {
  position: relative;
  height: 170vh;
}
.article-page .intro-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.article-page .intro-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 45%, var(--grad-soft), transparent 70%);
}
.article-page .intro-copy {
  position: relative;
  z-index: 2;
  max-width: 940px;
  width: 100%;
  padding: 0 24px;
  text-align: center;
  will-change: transform, opacity;
}
.article-page .hero-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-3);
  margin-bottom: 16px;
}
.article-page .hero-meta .cat {
  background: var(--grad-soft);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--brand);
  font-weight: 600;
}
.article-page .intro-copy h1 {
  color: var(--text);
  font-size: clamp(30px, 4.6vw, 52px);
  line-height: 1.22;
  letter-spacing: -.04em;
  font-weight: 800;
  margin-bottom: 20px;
}
.article-page .hero-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-2);
}
.article-page .hero-author .av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--grad);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  object-fit: cover;
  flex-shrink: 0;
}
.article-page .author-words { opacity: .6; }
.article-page .intro-hint {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  z-index: 3;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: .2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.article-page .intro-hint i {
  width: 1px;
  height: 28px;
  background: linear-gradient(to bottom, var(--brand), transparent);
  animation: articleHint 1.8s infinite;
}
@keyframes articleHint {
  0%, 100% { opacity: .25; transform: scaleY(.7); }
  50% { opacity: 1; transform: scaleY(1); }
}

/* 版心 */
.article-page .layout {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.article-page .body {
  padding: 0 0 80px;
  min-width: 0;
}
.article-page .meta-bar {
  margin: 28px 0 42px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-start;
  flex-wrap: wrap;
  position: relative;
  z-index: 5;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-3);
}
.article-page .meta-bar span { display: flex; align-items: center; gap: 6px; }
.article-page .meta-bar .lit { color: var(--brand); font-weight: 700; }
.article-page .like-btn { cursor: pointer; transition: color .18s var(--ease); }
.article-page .like-btn:hover,
.article-page .like-btn.liked { color: var(--brand); }

/* 正文 */
.article-page .prose {
  max-width: none;
  margin: 0;
  font-size: 16.5px;
  line-height: 1.95;
  color: var(--text-2);
}
.article-page .prose p { margin: 0 0 26px; }
.article-page .prose h2 {
  font-size: clamp(22px, 2.6vw, 28px);
  line-height: 1.35;
  letter-spacing: -.03em;
  font-weight: 800;
  color: var(--text);
  margin: 56px 0 20px;
  position: relative;
  padding-bottom: 12px;
}
.article-page .prose h2::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background: var(--grad);
  border-radius: 2px;
  transition: width .8s var(--ease);
}
.article-page .prose h2.in::after { width: 64px; }
.article-page .prose h3 {
  font-size: 19px;
  font-weight: 750;
  color: var(--text);
  margin: 38px 0 14px;
}
.article-page .prose strong { color: var(--text); font-weight: 700; }
.article-page .prose em { color: inherit; }
.article-page .prose a { color: var(--brand); border-bottom: 1px solid var(--glow); text-decoration: none; }
.article-page .prose ul,
.article-page .prose ol { margin: 0 0 26px; padding-left: 22px; }
.article-page .prose ul { list-style: disc; }
.article-page .prose ol { list-style: decimal; }
.article-page .prose li { margin-bottom: 8px; }
.article-page .prose blockquote,
.article-page .prose .custom-quote {
  margin: 34px 0;
  padding: 22px 26px;
  border: 0;
  border-left: 3px solid var(--accent);
  background: var(--grad-soft);
  border-radius: 0 14px 14px 0;
  color: var(--text);
  font-size: 15.5px;
}
.article-page .prose blockquote::before,
.article-page .prose blockquote::after,
.article-page .prose .custom-quote::before,
.article-page .prose .custom-quote::after { content: none !important; }
.article-page .prose img {
  width: 50%;
  max-width: 360px;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
  border-radius: 16px;
  margin: 28px auto;
  box-shadow: var(--glass-shadow);
}
.article-page .prose figure { margin: 34px 0; text-align: center; }
.article-page .prose figcaption {
  text-align: center;
  font-size: 12px;
  color: var(--text-3);
  margin-top: 10px;
}
.article-page .prose hr {
  border: none;
  height: 1px;
  background: var(--border);
  margin: 40px 0;
}
.article-page .prose table {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 24px 0;
  width: 100%;
}
.article-page .prose th,
.article-page .prose td { border: 1px solid var(--border); padding: 8px 12px; }
.article-page .prose th { background: var(--surface); color: var(--text); font-weight: 700; }

/* 行内代码 */
.article-page .prose code {
  background: var(--grad-soft);
  color: var(--brand);
  padding: 2px 6px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: .9em;
}

/* 代码块：与样张一致的标题栏 + 复制按钮 */
.article-page .prose .code {
  background: var(--code-bg);
  border-radius: 16px;
  overflow: hidden;
  margin: 30px 0;
  border: 1px solid rgba(148, 163, 184, .16);
  box-shadow: var(--glass-shadow);
}
.article-page .prose .code-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, .14);
}
.article-page .prose .code-bar i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #334155;
}
.article-page .prose .code-bar i:nth-child(1) { background: #F87171; }
.article-page .prose .code-bar i:nth-child(2) { background: #FBBF24; }
.article-page .prose .code-bar i:nth-child(3) { background: #34D399; }
.article-page .prose .code-bar span {
  margin-left: 8px;
  font-size: 11px;
  color: #64748B;
  font-family: var(--font-mono);
}
.article-page .prose .code-bar button {
  margin-left: auto;
  font-size: 10.5px;
  color: #94A3B8;
  border: 1px solid rgba(148, 163, 184, .22);
  padding: 3px 9px;
  border-radius: 999px;
  background: none;
  transition: all .15s;
}
.article-page .prose .code-bar button:hover { color: #fff; border-color: #fff; }
.article-page .prose .code pre {
  margin: 0;
  padding: 20px;
  overflow: auto;
  background: transparent !important;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.article-page .prose .code pre code {
  padding: 0;
  background: transparent !important;
  color: #CBD5E1;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.8;
}
.article-page .prose .code pre code.hljs { background: transparent !important; }

/* 标签 */
.article-page .tags {
  margin: 44px 0 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.article-page .tag {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-3);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 4px 11px;
  border-radius: 999px;
  transition: all .15s var(--ease);
}
.article-page .tag:hover { color: var(--brand); border-color: var(--brand); }

/* 上下篇 */
.article-page .adjacent {
  margin: 44px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.article-page .adj {
  padding: 22px 24px;
  border-radius: 18px;
  cursor: pointer;
  transition: transform .25s var(--ease), box-shadow .25s var(--ease);
}
.article-page .adj:hover { transform: translateY(-3px); }
.article-page .adj small {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: .06em;
}
.article-page .adj b {
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-top: 6px;
  line-height: 1.5;
  color: var(--text);
}
.article-page .adj.right { text-align: right; }

/* 评论 */
.article-page .comments {
  margin: 44px 0 0;
  border-radius: 20px;
  padding: 28px;
}

/* 滚动出现 */
.article-page .reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity .7s var(--ease), transform .7s var(--ease);
}
.article-page .reveal.in { opacity: 1; transform: none; }

/* 首屏动画切换 */
.article-page .variant-ui {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 160;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px 5px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  color: var(--text-3);
  white-space: nowrap;
}
.article-page .variant-ui button {
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  border: none;
  background: var(--grad);
  color: #fff;
  cursor: pointer;
}

.article-page .article-loading {
  text-align: center;
  padding: 140px 20px;
  color: var(--text-3);
  font-size: 13px;
}

@media (max-width: 640px) {
  .article-page .intro-copy { padding: 0 20px; }
  .article-page .layout { padding: 0 20px; }
  .article-page .body { padding-bottom: 56px; }
  .article-page .meta-bar { gap: 12px; font-size: 10.5px; margin: 24px 0 34px; }
  .article-page .prose { font-size: 16px; }
  .article-page .prose img { width: 80%; max-width: 100%; }
  .article-page .adjacent { grid-template-columns: 1fr; }
  .article-page .adj.right { text-align: left; }
  .article-page .comments { padding: 20px; }
  .article-page .variant-ui { bottom: 84px; }
}
@media (prefers-reduced-motion: reduce) {
  .article-page .reveal { opacity: 1; transform: none; }
  .article-page .intro-hint i { animation: none; }
}
</style>
