<template>
  <div class="article-page" v-if="article">
    <!-- 阅读进度条 -->
    <div class="reading-progress" :style="{ width: progressPercent + '%' }"></div>

    <!-- Banner 头部 -->
    <div class="post-header-banner" :style="article.coverUrl ? { backgroundImage: 'url(' + article.coverUrl + ')' } : {}">
      <div class="post-header-overlay"></div>
      <div class="post-header-content">
        <!-- 分类 + 标签 -->
        <div class="banner-tags" v-if="article.categoryName || (article.tagNames && article.tagNames.length)">
          <b class="meta-cat" v-if="article.categoryName">{{ article.categoryName }}</b>
          <em class="meta-tag" v-for="(name, i) in (article.tagNames || [])" :key="i">#{{ name.length > 10 ? name.slice(0,10)+'…' : name }}</em>
        </div>
        <!-- 标题 -->
        <h1 class="post-title">{{ article.title }}</h1>
        <!-- 作者 + 日期 -->
        <div class="banner-author">
          <img :src="siteInfo.avatar || 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff'" alt="" class="banner-avatar" />
          <span class="banner-name">{{ siteInfo.author || '博主' }}</span>
          <span class="banner-date">{{ formatDate(article.createTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-grid">
      <div class="content-area">
        <!-- 统计行 -->
        <div class="post-meta-bar">
          <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ article.viewCount || 0 }} 阅读</span>
          <span class="like-btn" :class="{ liked: isLiked }" @click="toggleLike">
            <svg v-if="!isLiked" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ article.likeCount || 0 }} 点赞
          </span>
          <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {{ article.commentCount || 0 }} 评论</span>
          <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ wordCount }} 字</span>
          <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ readingTime }} 分钟</span>
        </div>

        <!-- Markdown 内容 -->
        <div class="post-html markdown-body" v-highlight ref="postContent" v-html="compiledHtml"></div>

        <!-- 文章标签 -->
        <div class="article-tags-row" v-if="article.tagNames && article.tagNames.length">
          <router-link v-for="(name, i) in article.tagNames" :key="i" to="/tags" class="article-tag-link">
            #{{ name.length > 15 ? name.slice(0,15)+'…' : name }}
          </router-link>
        </div>

        <!-- 上一篇 / 下一篇 -->
        <div class="adjacent">
          <div class="adj-item" v-if="previousArticle && previousArticle.id" @click="goTo(previousArticle.id)">
            <span class="adj-label">← 上一篇</span>
            <a>{{ previousArticle.title }}</a>
          </div>
          <div class="adj-item text-right" v-if="nextArticle && nextArticle.id" @click="goTo(nextArticle.id)">
            <span class="adj-label">下一篇 →</span>
            <a>{{ nextArticle.title }}</a>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div class="related-section" v-if="relatedArticles.length">
          <h3 class="related-title">相关推荐</h3>
          <div class="related-grid">
            <div v-for="item in relatedArticles" :key="item.id" class="related-card" @click="$router.push('/article/' + item.id)">
              <div class="related-cover" v-if="item.coverUrl">
                <img :src="item.coverUrl" :alt="item.title" loading="lazy" />
              </div>
              <div class="related-body">
                <div class="related-meta">
                  <span v-if="item.categoryName" class="related-cat">{{ item.categoryName }}</span>
                  <span class="related-date">{{ item.createTime?.slice(0, 10) }}</span>
                </div>
                <h4 class="related-card-title">{{ item.title }}</h4>
                <div class="related-stats">
                  <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ item.viewCount || 0 }}</span>
                  <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {{ item.likeCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comment-wrapper">
          <CommentSection :articleId="Number(article.id)" />
        </div>
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-box">
          <h4 class="sidebar-title">目录</h4>
          <div class="toc-list" v-html="tocHtml"></div>
        </div>
        <div class="sidebar-box">
          <h4 class="sidebar-title">关于作者</h4>
          <div class="author-card">
            <img v-if="siteInfo.avatar" :src="siteInfo.avatar" class="sidebar-avatar" />
            <div v-else class="sidebar-avatar placeholder-avatar"></div>
            <p class="author-name">{{ siteInfo.author || '博主' }}</p>
            <p class="author-bio">{{ siteInfo.bio || '这个人很懒，什么都没写~' }}</p>
            <div v-if="hasSocialLinks" class="author-social-links">
              <a v-if="siteInfo.githubUrl" :href="siteInfo.githubUrl" target="_blank" title="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a v-if="siteInfo.bilibiliUrl" :href="siteInfo.bilibiliUrl" target="_blank" title="B站">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>
              </a>
              <a v-if="siteInfo.qqNumber" :href="'https://wpa.qq.com/msgrd?v=3&uin=' + siteInfo.qqNumber + '&site=qq&menu=yes'" target="_blank" title="QQ">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 00-1.51-3.306c.85-1.693 1.17-3.267.76-4.58-.46-1.475-2.025-2.27-3.945-2.27-.51 0-1.05.075-1.59.225-.18-.48-.39-.96-.63-1.41C13.27 1.56 11.85.6 10.26.6c-1.62 0-3.06.975-4.26 2.655-.39.45-.63.96-.63 1.41-.54-.15-1.08-.225-1.59-.225-1.92 0-3.485.795-3.945 2.27-.41 1.313-.09 2.887.76 4.58a39.548 39.548 0 00-1.51 3.306c-.57 1.545-.33 2.88.675 3.735.33.285.72.45 1.14.51-.12.39-.195.81-.195 1.245 0 2.28 1.665 4.005 4.2 4.635.18.045.36.075.54.09-.15.42-.255.84-.255 1.245 0 1.08.585 1.875 1.5 2.295.15.075.3.12.465.165-.06.15-.09.315-.09.48 0 .87.855 1.5 1.92 1.5s1.92-.63 1.92-1.5c0-.165-.03-.33-.09-.48.165-.045.315-.09.465-.165.915-.42 1.5-1.215 1.5-2.295 0-.405-.105-.825-.255-1.245.18-.015.36-.045.54-.09 2.535-.63 4.2-2.355 4.2-4.635 0-.435-.075-.855-.195-1.245.42-.06.81-.225 1.14-.51.99-.855 1.245-2.19.675-3.735z"/></svg>
              </a>
              <a v-if="siteInfo.email" :href="'mailto:' + siteInfo.email" title="邮箱">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </a>
              <span v-if="siteInfo.wechatId" class="author-social-wechat" title="微信" @click="copyWechat">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.133 0 .241-.108.241-.245 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.076 13.2c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/></svg>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArticleDetail, getRelatedArticles, likeArticle, unlikeArticle } from '../api/blog'
import CommentSection from '@/components/CommentSection.vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

export default {
  components: { CommentSection },
  data() {
    return {
      article: null,
      tocHtml: '',
      previousArticle: null,
      nextArticle: null,
      wordCount: 0,
      readingTime: 0,
      progressPercent: 0,
      isLiked: false,
      relatedArticles: []
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    hasSocialLinks() {
      const s = this.siteInfo
      return s.githubUrl || s.bilibiliUrl || s.qqNumber || s.email || s.wechatId
    },
    compiledHtml() {
      if (!this.article?.content) return ''
      const html = md.render(this.article.content)
      let toc = ''
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const headings = doc.querySelectorAll('h1, h2, h3')
      headings.forEach((h, i) => {
        const id = 'heading-' + i
        h.id = id
        const level = parseInt(h.tagName[1])
        toc += '<div style="padding-left:' + ((level - 1) * 12) + 'px;margin-bottom:6px;font-size:0.85rem"><a href="#' + id + '">' + h.textContent + '</a></div>'
      })
      this.tocHtml = toc || '<p style="color:var(--text-dim);font-size:0.85rem">暂无目录</p>'
      const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, '')
      this.wordCount = text.length
      this.readingTime = Math.max(1, Math.ceil(text.length / 500))
      return html
    }
  },
  watch: { '$route.params.id'() { this.loadArticle() } },
  mounted() {
    this.loadArticle()
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  updated() {
    this.addCopyButtons()
  },
  methods: {
    async loadArticle() {
      const id = this.$route.params.id
      if (!id) return
      try {
        const res = await getArticleDetail(id)
        // 新API返回 { article, previous, next, liked }
        const data = res.data
        if (data.article) {
          this.article = data.article
          this.previousArticle = data.previous || null
          this.nextArticle = data.next || null
          this.isLiked = data.liked || false
        } else {
          this.article = data
        }
        // SEO 标题
        if (this.article) {
          document.title = this.article.title + ' - tyyfhju的博客'
        }
        // 加载相关推荐
        this.loadRelated(id)
      } catch (e) {
        this.$message?.error('文章加载失败')
      }
    },
    async loadRelated(id) {
      try {
        const res = await getRelatedArticles(id)
        this.relatedArticles = res.data || []
      } catch (e) { /* 静默 */ }
    },

    // ========== 点赞 ==========
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
          this.$message.warning('请先登录后再点赞')
        }
      }
    },

    // ========== 阅读进度条 ==========
    onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      this.progressPercent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
    },

    // ========== 代码块复制按钮 ==========
    addCopyButtons() {
      const blocks = this.$refs.postContent?.querySelectorAll('pre') || []
      blocks.forEach((pre) => {
        if (pre.querySelector('.copy-btn')) return
        const btn = document.createElement('button')
        btn.className = 'copy-btn'
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
        btn.title = '复制代码'
        btn.addEventListener('click', () => {
          const code = pre.querySelector('code')
          const text = code ? code.innerText : pre.innerText
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
              btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
              setTimeout(() => {
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
              }, 2000)
            })
          } else {
            const textarea = document.createElement('textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
            setTimeout(() => {
              btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
            }, 2000)
          }
        })
        pre.style.position = 'relative'
        pre.appendChild(btn)
      })
    },

    formatDate(d) {
      if (!d) return ''
      const date = new Date(d)
      const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
      return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
    },
    goTo(id) { this.$router.push('/article/' + id) },
    copyWechat() {
      const id = this.siteInfo.wechatId
      if (navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => this.$message.success('微信号已复制：' + id))
      } else {
        const input = document.createElement('input')
        input.value = id
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        this.$message.success('微信号已复制：' + id)
      }
    }
  }
}
</script>

<style scoped>
.article-page { max-width: var(--max-width); margin: 0 auto; padding: 0; }

/* ========== 阅读进度条 ========== */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--main-gradient);
  z-index: 999;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}

/* ========== Banner ========== */
.post-header-banner {
  position: relative; width: 100%; min-height: 350px;
  display: flex; align-items: center; justify-content: center;
  background: var(--main-gradient); background-size: cover; background-position: center;
}
.post-header-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.35); z-index: 1; }
.post-header-content { position: relative; z-index: 2; padding: 3rem 2rem; max-width: 800px; width: 100%; text-align: center; }

.banner-tags { margin-bottom: 1rem; display: flex; justify-content: center; gap: .5rem; flex-wrap: wrap; align-items: center; }
.meta-cat { background: var(--main-gradient); color: #fff; padding: 3px 12px; border-radius: 3px; font-weight: 600; font-size: .75rem; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
.meta-tag { color: rgba(255,255,255,.8); font-size: .72rem; font-style: normal; opacity: .85; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }

.post-title {
  font-size: clamp(1.5rem, 1rem + 5vw, 2.25rem);
  line-height: 1.3; color: #fff; font-weight: 700;
  text-shadow: 0 2px 6px rgba(0,0,0,.4); margin: 0 0 1.25rem;
  word-break: break-word; overflow-wrap: break-word;
}

.banner-author { display: flex; align-items: center; justify-content: center; gap: .5rem; }
.banner-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,.4); }
.banner-name { color: rgba(255,255,255,.9); font-size: .88rem; font-weight: 600; }
.banner-date { color: rgba(255,255,255,.7); font-size: .8rem; }

/* ========== 统计行 ========== */
.post-meta-bar {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  padding: .6rem 1.5rem; gap: 1rem;
  background: var(--background-secondary); border-radius: .75rem;
  margin: -1.25rem auto 1.5rem; border: 1px solid var(--text-faint);
  position: relative; z-index: 3; max-width: 800px;
}
.post-meta-bar > span { color: var(--text-dim); font-size: .72rem; display: flex; align-items: center; gap: 3px; white-space: nowrap; }
.post-meta-bar svg { flex-shrink: 0; opacity: .5; width: 13px; height: 13px; }
.like-btn {
  cursor: pointer;
  user-select: none;
  transition: color .2s;
}
.like-btn:hover { color: var(--text-accent); }
.like-btn.liked { color: var(--text-accent); }
.like-btn.liked svg { opacity: 1; }

/* ========== 代码块复制按钮 ========== */
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(128,128,128,0.2);
  border: 1px solid rgba(128,128,128,0.3);
  border-radius: 6px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
}
.copy-btn:hover {
  background: rgba(128,128,128,0.4);
  color: #fff;
}

/* ========== Main Layout ========== */
.main-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 2rem 0; margin: 0 auto; }
@media (min-width: 1024px) { .main-grid { grid-template-columns: minmax(0,1fr) 300px; } }
.content-area { min-width: 0; }

.article-tags-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin: 1rem auto 0; max-width: 800px;
  padding: 0 1rem;
}
.article-tag-link {
  font-size: .78rem; color: var(--text-sub-accent);
  background: var(--background-secondary);
  padding: 4px 12px; border-radius: 20px;
  text-decoration: none; transition: all .2s;
  border: 1px solid var(--text-faint);
}
.article-tag-link:hover { background: var(--text-accent); color: #fff; opacity: 1; }

/* ========== Prev / Next ========== */
.adjacent { display: flex; justify-content: space-between; gap: 1rem; margin: 2rem 0; }
.adj-item { flex: 1; padding: 1.25rem; background: var(--background-secondary); border-radius: 1rem; border: 1px solid var(--text-faint); cursor: pointer; transition: all .2s; }
.adj-item:hover { transform: translateY(-2px); border-color: var(--text-accent); }
.adj-label { display: block; font-size: .78rem; color: var(--text-dim); margin-bottom: .5rem; }
.adj-item a { color: var(--text-bright); font-weight: 600; font-size: .95rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.text-right { text-align: right; }

/* ========== 相关推荐 ========== */
.related-section {
  margin: 2rem 0;
}
.related-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-bright);
  margin-bottom: 1rem;
  padding-bottom: .5rem;
  border-bottom: 2px solid var(--background-trans);
  position: relative;
}
.related-title:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--main-gradient);
  border-radius: 2px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.related-card {
  background: var(--background-secondary);
  border-radius: .75rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--text-faint);
  transition: all .25s ease;
}
.related-card:hover {
  transform: translateY(-3px);
  border-color: var(--text-accent);
}
.related-cover {
  height: 120px;
  overflow: hidden;
}
.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.related-body {
  padding: .75rem 1rem 1rem;
}
.related-meta {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .4rem;
}
.related-cat {
  font-size: .65rem;
  background: var(--main-gradient);
  color: #fff;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
}
.related-date {
  font-size: .7rem;
  color: var(--text-dim);
}
.related-card-title {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text-bright);
  margin: 0 0 .5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.related-stats {
  display: flex;
  gap: .75rem;
  font-size: .7rem;
  color: var(--text-dim);
}
.related-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ========== Comment ========== */
.comment-wrapper { background: var(--background-secondary); border-radius: 1rem; padding: 2rem; border: 1px solid var(--text-faint); }

/* ========== Sidebar ========== */
.sidebar-box { background: var(--background-secondary); border-radius: 1rem; padding: 1.5rem; border: 1px solid var(--text-faint); margin-bottom: 1.5rem; }
.sidebar-title { font-size: 1rem; font-weight: 700; color: var(--text-bright); margin-bottom: 1rem; padding-bottom: .5rem; border-bottom: 2px solid var(--background-trans); position: relative; }
.sidebar-title:after { content: ''; position: absolute; bottom: -2px; left: 0; width: 40px; height: 2px; background: var(--main-gradient); border-radius: 2px; }
.sidebar-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto; }
.placeholder-avatar { background: var(--main-gradient); }
.author-card { text-align: center; }
.author-name { color: var(--text-bright); font-weight: 600; margin-top: .75rem; margin-bottom: .25rem; }
.author-bio { color: var(--text-dim); font-size: .85rem; margin: 0; }
.toc-list { font-size: .85rem; line-height: 2; max-height: 470px; overflow: hidden auto; }
.toc-list a { color: var(--text-normal); text-decoration: none; transition: color .2s; }
.toc-list a:hover { color: var(--text-accent); }

.author-social-links {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: .75rem;
  padding-top: .6rem;
  border-top: 1px solid rgba(128,128,128,0.15);
}
.author-social-links a,
.author-social-wechat {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--text-dim);
  background: var(--background-primary);
  transition: var(--trans-ease);
}
.author-social-links a:hover {
  color: var(--text-accent);
  transform: translateY(-2px);
  opacity: 1;
}
.author-social-wechat { cursor: pointer; }
.author-social-wechat:hover {
  color: var(--text-accent);
  transform: translateY(-2px);
}

@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; padding: 1rem 0; } .sidebar { display: none; } }
@media (max-width: 768px) {
  .post-header-banner { min-height: 260px; }
  .post-header-content { padding: 2rem 1rem; }
  .post-title { font-size: 1.4rem; }
  .post-meta-bar { flex-direction: column; align-items: center; margin: -1rem 1rem 1rem; padding: .75rem 1rem; gap: .5rem; }
  .related-grid { grid-template-columns: 1fr; }
}
</style>
