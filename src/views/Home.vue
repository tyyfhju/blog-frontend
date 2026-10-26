<template>
  <div class="home-page">
    <div class="home-inner">
      <div class="main-grid">
        <div class="main-content">
          <!-- Featured Article -->
          <div v-if="featuredArticle" class="article-container" @click="goTo(featuredArticle.id)">
            <div class="article-tag"><b>Featured</b></div>
            <div class="feature-article" :class="{ 'no-thumb': !featuredArticle.coverUrl }">
              <div class="feature-thumbnail" v-if="featuredArticle.coverUrl">
                <img :src="featuredArticle.coverUrl" alt="" />
                <span class="thumbnail-screen" :style="{ background: 'var(--main-gradient)' }"></span>
              </div>
              <div class="feature-content">
                <b>{{ featuredArticle.categoryName || '未分类' }}</b>
                <ul>
                  <li>{{ featuredArticle.createTime?.slice(0, 10) }}</li>
                  <li>{{ (featuredArticle.viewCount || 0) }} 阅读</li>
                </ul>
                <h1>{{ featuredArticle.title }}</h1>
                <p>{{ cleanHtml(featuredArticle.content, 120) }}</p>
                <div class="article-footer">
                  <span>{{ siteInfo.author || '博主' }}</span>
                  <span style="margin-left:auto">{{ featuredArticle.commentCount || 0 }} 评论</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Articles -->
          <div v-if="recommendedArticles.length > 0" class="recommend-section">
            <h3 class="section-heading">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              推荐文章
            </h3>
            <div class="recommend-grid">
              <div v-for="rec in recommendedArticles" :key="rec.id" class="recommend-card" @click="goTo(rec.id)">
                <div class="recommend-img" v-if="rec.coverUrl">
                  <img :src="rec.coverUrl" alt="" />
                </div>
                <div class="recommend-img rec-placeholder" v-else></div>
                <div class="recommend-info">
                  <span class="rec-cat">{{ rec.categoryName || '未分类' }}</span>
                  <h4>{{ rec.title }}</h4>
                  <div class="rec-meta">
                    <span>{{ rec.createTime?.slice(0, 10) }}</span>
                    <span>{{ rec.viewCount || 0 }} 阅读</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" style="text-align:center;padding:3rem">
            <div class="ob-skeleton" style="height:200px;margin-bottom:1rem"></div>
            <div class="ob-skeleton" style="height:200px;margin-bottom:1rem"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="articles.length === 0" style="text-align:center;padding:4rem;color:var(--text-dim)">
            <p>还没有文章，赶紧来发布第一篇吧~</p>
          </div>

          <!-- 筛选提示 -->
          <div v-if="filterLabel" style="display:flex;align-items:center;gap:0.5rem;margin-top:1.5rem;color:var(--text-accent);font-weight:600">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {{ filterLabel }}
          </div>

          <!-- Article Card Grid (Aurora style) -->
          <section class="article-card-grid">
            <div v-for="art in articles" :key="art.id" class="aurora-card" @click="goTo(art.id)">
              <span v-if="art.isTop || art.top" class="aurora-card-tag"><b>📌 置顶</b></span>
              <span v-else-if="art.isFeatured" class="aurora-card-tag"><b>🔥 推荐</b></span>
              <div class="aurora-card-inner">
                <div class="aurora-card-thumb">
                  <img v-if="art.coverUrl" v-lazy="art.coverUrl" alt="" />
                  <div v-else class="aurora-card-thumb-placeholder"></div>
                  <span class="aurora-card-thumb-overlay" :style="{ background: 'var(--main-gradient)' }"></span>
                </div>
                <div class="aurora-card-body">
                  <span class="aurora-card-cats">
                    <b v-if="art.categoryName">{{ art.categoryName }}</b>
                    <ul v-if="art.createTime"><li><em>{{ art.createTime?.slice(0, 10) }}</em></li></ul>
                  </span>
                  <h1 class="aurora-card-title">{{ art.title }}</h1>
                  <p class="aurora-card-excerpt">{{ cleanHtml(art.content, 120) }}</p>
                  <div class="aurora-card-footer">
                    <span>{{ siteInfo.author || '博主' }} · {{ art.viewCount || 0 }} 阅读</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Pagination -->
          <div v-if="totalPages > 1" style="display:flex;justify-content:center;margin-top:2rem">
            <el-pagination background layout="prev, pager, next"
              :total="totalElements" :page-size="pageSize"
              :current-page.sync="currentPage" @current-change="toPage" />
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="sidebar">
          <!-- 个人介绍卡片 -->
          <div class="sidebar-box">
            <div style="text-align:center">
              <img v-if="siteInfo.avatar" :src="siteInfo.avatar" class="sidebar-avatar ob-avatar circle-avatar" />
              <div v-else class="sidebar-avatar ob-avatar circle-avatar" style="background:var(--main-gradient);margin:0 auto"></div>
              <h3 style="color:var(--text-bright);font-weight:700;margin-top:0.5rem">{{ siteInfo.author || '博主' }}</h3>
              <p style="color:var(--text-dim);font-size:0.85rem">{{ welcomeText || siteInfo.welcomeText || siteInfo.bio || siteInfo.subtitle || '这个人很懒，什么都没写~' }}</p>
              <p v-if="techStack || siteInfo.techStack" style="color:var(--text-dim);font-size:0.78rem;white-space:pre-line;margin-top:0.5rem;line-height:1.6">{{ techStack || siteInfo.techStack }}</p>
              <div style="display:flex;justify-content:center;gap:2rem;margin-top:1rem">
                <div><b style="color:var(--text-bright)">{{ siteInfo.articleCount || 0 }}</b><br/><small style="color:var(--text-dim)">文章</small></div>
                <div><b style="color:var(--text-bright)">{{ siteInfo.categoryCount || 0 }}</b><br/><small style="color:var(--text-dim)">分类</small></div>
                <div><b style="color:var(--text-bright)">{{ siteInfo.tagCount || 0 }}</b><br/><small style="color:var(--text-dim)">标签</small></div>
              </div>
              <div v-if="hasSocialLinks" class="social-links">
                <a v-if="siteInfo.githubUrl" :href="fixUrl(siteInfo.githubUrl)" target="_blank" title="GitHub">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <span v-if="siteInfo.qqNumber" class="social-icon-btn" title="QQ" @click.stop="showPopup('QQ号', siteInfo.qqNumber)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2c-1.2 0-2.2.4-3 1.1-.6-.5-1.3-.8-2-.8-1.7 0-3 1.3-3 3v3.4c0 1.3.5 2.5 1.3 3.4-.9 1.3-1.5 2.8-1.7 4.4-.3 2.3.5 4.5 2.1 6.1.8.8 1.8 1.5 2.9 1.9v.5c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-.5c1.1-.4 2.1-1.1 2.9-1.9 1.6-1.6 2.4-3.8 2.1-6.1-.2-1.6-.8-3.1-1.7-4.4.8-.9 1.3-2.1 1.3-3.4V6.1c0-1.7-1.3-3-3-3-.7 0-1.4.3-2 .8-.8-.7-1.8-1.1-3-1.1zm0 2c.9 0 1.6.5 2 1-.4.2-.8.6-1 1.1-.3-.1-.7-.1-1-.1s-.7 0-1 .1c-.2-.5-.6-.9-1-1.1.4-.5 1.1-1 2-1zm-5 2.1c0-.6.4-1 1-1 .3 0 .5.1.7.2-.2.3-.4.6-.5 1-.1.3-.2.7-.2 1v2.4c0 .3.1.6.2.9-.7.2-1.2.8-1.2 1.5s.6 1.3 1.3 1.5c.1.3.3.6.5.8-.3.2-.5.5-.5.9 0 .6.2 1 .5 1.3-.3.2-.5.6-.5 1 0 .6.4 1 1 1h.5c.8 0 1.5-.3 2-.8.5.5 1.2.8 2 .8.8 0 1.5-.3 2-.8.5.5 1.2.8 2 .8h.5c.6 0 1-.4 1-1 0-.4-.2-.8-.5-1 .3-.3.5-.7.5-1.3 0-.4-.2-.6-.5-.9.2-.2.4-.5.5-.8.7-.1 1.3-.7 1.3-1.5s-.6-1.3-1.3-1.5c.1-.3.2-.5.2-.9V6.2c0-.3 0-.7-.2-1-.1-.4-.3-.7-.5-1 .2-.1.4-.2.7-.2.6 0 1 .4 1 1v2.4c0 1.2-.5 2.3-1.3 3-.4.4-.9.6-1.4.8.3.9.5 1.8.5 2.8 0 2.2-.9 4.1-2.5 5.3-.5.4-1 .6-1.5.8v.9h-2.5v-.9c-.5-.2-1-.4-1.5-.8-1.6-1.2-2.5-3.1-2.5-5.3 0-1 .2-1.9.5-2.8-.5-.1-1-.4-1.4-.8-.8-.7-1.3-1.8-1.3-3V4.1z"/></svg>
                </span>
                <span v-if="siteInfo.wechatId" class="social-icon-btn" title="微信" @click.stop="showPopup('微信号', siteInfo.wechatId)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.133 0 .241-.108.241-.245 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.076 13.2c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/></svg>
                </span>
                <span v-if="siteInfo.email" class="social-icon-btn" title="邮箱" @click.stop="showPopup('邮箱', siteInfo.email)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </span>
              </div>

              <!-- 社交弹窗 -->
              <el-dialog :title="popupTitle" :visible.sync="popupVisible" width="360px" append-to-body custom-class="social-popup-dialog">
                <p style="text-align:center;font-size:18px;word-break:break-all;padding:12px 0">{{ popupContent }}</p>
                <span slot="footer">
                  <el-button @click="popupVisible = false">关闭</el-button>
                  <el-button type="primary" @click="copyPopupContent">复制</el-button>
                </span>
              </el-dialog>
            </div>
          </div>

          <!-- 最新文章 -->
          <div class="sidebar-box">
            <h4 class="sidebar-title">最新文章</h4>
            <div v-for="item in latestArticles" :key="item.id" class="sidebar-item" @click="goTo(item.id)">
              <span class="sidebar-item-title">{{ item.title }}</span>
              <small>{{ item.createTime?.slice(0, 10) }}</small>
            </div>
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArticles, getBlogSetting, getRecommendedArticles, getHomeCounts } from '../api/blog'
import { cleanHtml, fixUrl } from '../utils/helpers'

export default {
  name: 'Home',
  data() {
    return {
      articles: [],
      featuredArticle: null,
      recommendedArticles: [],
      latestArticles: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0,
      welcomeText: '',
      techStack: '',
      popupVisible: false,
      popupTitle: '',
      popupContent: ''
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    hasSocialLinks() {
      const s = this.siteInfo
      return s.githubUrl || s.qqNumber || s.email || s.wechatId
    },
    filterCategoryId() {
      const q = this.$route.query.categoryId
      return q ? Number(q) : null
    },
    filterTagId() {
      const q = this.$route.query.tagId
      return q ? Number(q) : null
    },
    filterLabel() {
      if (this.filterTagId) return '标签筛选'
      if (this.filterCategoryId) return '分类筛选'
      return ''
    }
  },
  watch: {
    '$route.query': {
      handler() {
        this.currentPage = 1
        this.loadArticles()
      },
      deep: true
    }
  },
  mounted() {
    if (this.filterCategoryId || this.filterTagId) {
      this.loadArticles()
    } else {
      this.loadFeaturedArticle()
    }
    this.loadRecommended()
    this.loadSidebar()
    this.loadSiteInfo()
    this.loadCounts()
  },
  methods: {
    async loadFeaturedArticle() {
      try {
        const res = await getArticles(0, 50)
        const data = res.data
        const list = Array.isArray(data) ? data : (data.content || data.records || [])
        if (list.length > 0) {
          const topIdx = list.findIndex(a => a.isTop || a.top)
          if (topIdx > -1) {
            this.featuredArticle = list[topIdx]
          } else {
            this.featuredArticle = list[0]
          }
        }
      } catch (e) {}
      this.loadArticles()
    },
    async loadArticles() {
      this.loading = true
      try {
        const res = await getArticles(this.currentPage - 1, this.pageSize, this.filterCategoryId, this.filterTagId)
        const data = res.data
        const list = Array.isArray(data) ? data : (data.content || data.records || [])
        this.articles = this.featuredArticle
          ? list.filter(a => a.id !== this.featuredArticle.id)
          : list
        this.totalPages = data.totalPages || 1
        this.totalElements = data.total || list.length
      } catch (e) {}
      finally { this.loading = false }
    },
    async loadRecommended() {
      try {
        const res = await getRecommendedArticles()
        this.recommendedArticles = res.data || []
      } catch (e) {}
    },
    async loadSidebar() {
      try {
        const res = await getArticles(0, 5)
        const data = res.data
        this.latestArticles = (Array.isArray(data) ? data : (data.content || data.records || [])).slice(0, 5)
      } catch (e) {}
    },
    async loadCounts() {
      try {
        const res = await getHomeCounts()
        const d = res.data
        if (d) {
          this.$store.commit('SET_SITE_INFO', {
            articleCount: d.articles || 0,
            categoryCount: d.categories || 0,
            tagCount: d.tags || 0
          })
        }
      } catch (e) {}
    },
    async loadSiteInfo() {
      try {
        const res = await getBlogSetting()
        const d = res.data
        if (d) {
          this.welcomeText = d.welcomeText || d.welcome_text || ''
          this.techStack = d.techStack || d.tech_stack || ''
          
          // 同时更新 Vuex
          const info = {
            title: d.siteTitle || this.siteInfo.title,
            subtitle: d.siteSubtitle || '',
            author: d.authorName || '博主',
            bio: d.authorBio || '',
            avatar: d.avatarUrl || '',
            icp: d.icp || '',
            police: d.police || '',
            footerText: d.footerText || d.footer_text || '',
            defaultUserAvatarUrl: d.defaultUserAvatarUrl || d.default_user_avatar_url || '',
            welcomeText: this.welcomeText,
            techStack: this.techStack
          }
          this.$store.commit('SET_SITE_INFO', info)
        }
      } catch (e) {}
    },
    toPage(p) { this.currentPage = p; this.loadArticles(); window.scrollTo({ top: 0, behavior: 'smooth' }) },
    goTo(id) { this.$router.push('/article/' + id) },
    showPopup(title, content) {
      this.popupTitle = title
      this.popupContent = content
      this.popupVisible = true
    },
    copyPopupContent() {
      const text = this.popupContent
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => this.$message.success('已复制'))
      } else {
        const input = document.createElement('input')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        this.$message.success('已复制')
      }
    },
    cleanHtml,
    fixUrl
  }
}
</script>

<style scoped>
.home-page { position: relative; overflow-x: hidden; }
.home-inner { max-width: var(--max-width); margin: 0 auto; padding: 2rem; }

/* ========== 主布局 ========== */
.main-grid {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}
.main-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  order: 1;
}
.sidebar {
  flex: 0 0 280px;
  width: 280px;
  position: sticky;
  top: 5rem;
  align-self: flex-start;
  order: 2;
}
.sidebar-avatar {
  width: 7rem;
  height: 7rem;
  margin: 0 auto;
  display: block;
}

/* ========== Article 容器 ========== */
.article-container {
  border-radius: .5rem;
  height: 100%;
  list-style-type: none;
  position: relative;
  cursor: pointer;
}
.article-container:hover .article-tag { transform: translateY(-60%); }
.article-container:hover .article,
.article-container:hover .feature-article { transform: scale(1.015); }
.article-tag {
  text-transform: uppercase;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,.1);
  background: var(--main-gradient);
  border-radius: .25rem;
  align-items: flex-start;
  padding: .2rem .5rem .6rem;
  font-size: .8rem;
  font-weight: 700;
  display: flex;
  position: absolute;
  top: -.25rem;
  left: 1rem;
  z-index: 0;
  transition: transform .2s ease-in-out;
}
.article-tag > b {
  stroke: currentColor;
  color: #fff;
  text-shadow: 0 2px 2px #00000080;
  background: #00000080;
  border-radius: .25rem;
  width: 100%;
  height: 100%;
  padding: .25rem .75rem;
}

/* ========== Aurora 文章卡片网格 ========== */
.article-card-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}
@media (min-width: 640px) {
  .article-card-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .article-card-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 639px) {
  .article-card-grid { grid-template-columns: 1fr; }
}
.aurora-card {
  border-radius: var(--radius-lg);
  height: 100%;
  list-style-type: none;
  position: relative;
  cursor: pointer;
  transition: transform .2s ease-in-out;
  min-width: 0;
}
.aurora-card:hover { transform: scale(1.02); }
.aurora-card:hover .aurora-card-tag { transform: translateY(-60%); }
.aurora-card-tag {
  text-transform: uppercase;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,.1);
  background: var(--main-gradient);
  border-radius: .25rem;
  align-items: flex-start;
  padding: .2rem .5rem .6rem;
  font-size: .75rem;
  font-weight: 700;
  display: flex;
  position: absolute;
  top: -.25rem;
  left: 1rem;
  z-index: 10;
  transition: transform .2s ease-in-out;
}
.aurora-card-tag > b {
  color: #fff;
  text-shadow: 0 2px 2px rgba(0,0,0,.5);
  background: rgba(0,0,0,.5);
  border-radius: .25rem;
  padding: .2rem .6rem;
}
.aurora-card-inner {
  z-index: 5;
  background-color: var(--background-secondary);
  border: 1px solid var(--text-faint);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  transition: all .2s ease;
}
.aurora-card:hover .aurora-card-inner {
  border-color: var(--text-accent);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);
}
.aurora-card-thumb {
  position: relative;
  overflow: hidden;
  height: 180px;
}
.aurora-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .3s ease;
}
.aurora-card:hover .aurora-card-thumb img { transform: scale(1.05); }
.aurora-card-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--main-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.aurora-card-thumb-placeholder:after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--background-secondary);
  opacity: 0.3;
}
.aurora-card-thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: .3;
  mix-blend-mode: screen;
  pointer-events: none;
}
.aurora-card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.aurora-card-cats {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
}
.aurora-card-cats b {
  text-transform: uppercase;
  color: var(--text-accent);
  font-size: .7rem;
  font-weight: 700;
}
.aurora-card-cats ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-flex;
}
.aurora-card-cats ul li em {
  font-size: .7rem;
  color: var(--text-dim);
  font-style: normal;
}
.aurora-card-title {
  color: var(--text-bright);
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 .5rem;
  line-height: 1.4;
  transition: color .2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.aurora-card:hover .aurora-card-title { color: var(--text-accent); }
.aurora-card-excerpt {
  color: var(--text-dim);
  font-size: .85rem;
  line-height: 1.6;
  margin: 0 0 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.aurora-card-footer {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-top: auto;
  font-size: .75rem;
  color: var(--text-dim);
}
.aurora-card-footer strong {
  color: var(--text-bright);
  font-weight: 600;
}
.aurora-card-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
}

/* ========== Featured 文章大卡片 ========== */
.feature-article {
  z-index: 10;
  background-color: var(--background-secondary);
  border: 1px solid var(--text-faint);
  border-radius: .5rem;
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  position: relative;
  top: 0;
  overflow: hidden;
  transition: all .2s ease-in-out;
}
.feature-article.no-thumb {
  display: flex;
  flex-direction: column;
  height: auto;
}
.article-container:hover .feature-article {
  border-color: var(--text-accent);
}
@media (min-width: 1024px) {
  .feature-article { grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; height: 28rem; grid-template-rows: none; }
}
.feature-thumbnail { grid-row: span 1 / span 1; position: relative; overflow: hidden; min-width: 0; }
@media (min-width: 1024px) { .feature-thumbnail { grid-row: auto; } }
.feature-thumbnail img {
  z-index: 20;
  object-fit: cover;
  width: 100%;
  height: 120%;
  display: block;
  position: absolute;
  left: 0;
}
@media (min-width: 1024px) { .feature-thumbnail img { width: 120%; height: 28rem; } }
.feature-thumbnail .thumbnail-screen {
  z-index: 30;
  opacity: .4;
  mix-blend-mode: screen;
  width: 100%;
  height: 120%;
  position: absolute;
  left: 0;
}
.feature-thumbnail:after {
  pointer-events: none;
  content: "";
  z-index: 35;
  background: var(--gradient-cover);
  width: 50%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 71%;
}
@media (max-width: 1023px) {
  .feature-article > div:first-of-type:after { background: var(--article-cover); width: 100%; height: 120%; top: 13%; left: 0; }
}
.feature-content {
  z-index: 40;
  flex-direction: column;
  grid-row: span 2 / span 2;
  padding: 1.5rem;
  display: flex;
  position: relative;
  min-width: 0;
}
@media (min-width: 1024px) { .feature-content { grid-row: auto; padding: 3rem; } }
.feature-content b {
  text-transform: uppercase;
  color: var(--text-accent);
  font-size: .75rem;
}
@media (min-width: 1024px) { .feature-content b { font-size: 1rem; } }
.feature-content ul {
  padding-left: 1rem;
  font-size: .75rem;
  display: inline-flex;
  list-style: none;
  margin: 0;
}
.feature-content ul li { margin-right: .75rem; color: var(--text-dim); }
.feature-content h1 {
  color: var(--text-bright);
  margin: 1rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.3;
}
@media (min-width: 1024px) { .feature-content h1 { font-size: 2.25rem; margin: 1.5rem 0 2rem; } }
.feature-content > p {
  word-wrap: break-word;
  word-break: break-all;
  margin-bottom: .5rem;
  font-size: 1rem;
  color: var(--text-dim);
  line-height: 1.5;
}

/* ========== 文章网格 (保留兼容) ========== */
.article-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.5rem;
}
/* ========== 推荐文章 ========== */
.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-bright);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 2rem 0 1rem;
  padding-left: .75rem;
  border-left: 3px solid var(--text-accent);
}
.section-heading svg {
  color: #f59e0b;
  fill: #f59e0b;
}
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 640px) {
  .recommend-grid { grid-template-columns: 1fr; }
}
.recommend-card {
  background: var(--background-secondary);
  border: 1px solid var(--text-faint);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all .2s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.recommend-card:hover {
  border-color: var(--text-accent);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}
.recommend-img {
  height: 160px;
  overflow: hidden;
}
.recommend-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rec-placeholder {
  background: var(--main-gradient);
  opacity: 0.7;
}
.recommend-info {
  padding: 1rem 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rec-cat {
  font-size: .7rem;
  text-transform: uppercase;
  color: var(--text-accent);
  background: var(--background-primary);
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-bottom: .5rem;
}
.recommend-info h4 {
  color: var(--text-bright);
  font-size: .95rem;
  font-weight: 700;
  margin: 0 0 .5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rec-meta {
  margin-top: auto;
  font-size: .75rem;
  color: var(--text-dim);
  display: flex;
  gap: 1rem;
}

/* ========== 响应式 ========== */
@media (max-width: 767px) {
  .article-card-grid { gap: 1.5rem; grid-template-columns: 1fr; }
}

/* ========== 侧边栏 ========== */
.sidebar-box {
  background-color: var(--background-secondary);
  border: 1px solid var(--text-faint);
  width: 100%;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  position: relative;
}
.sidebar-title {
  font-size: .95rem;
  font-weight: 700;
  color: var(--text-bright);
  margin-bottom: .75rem;
  padding-bottom: .5rem;
  border-bottom: 1px solid var(--text-faint);
  position: relative;
}
.sidebar-title:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 32px;
  height: 2px;
  background: var(--text-accent);
  border-radius: 2px;
}
.sidebar-item {
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px dashed var(--background-trans);
  transition: all .2s;
}
.sidebar-item:last-child { border-bottom: none; }
.sidebar-item:hover { padding-left: 8px; }
.sidebar-item-title {
  display: block;
  font-size: .88rem;
  color: var(--text-normal);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-item small { font-size: .75rem; color: var(--text-dim); }

/* ========== 社交链接 ========== */
.social-links {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(128,128,128,0.15);
}
.social-links a,
.social-links .social-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--text-dim);
  background: var(--background-trans);
  border: 1px solid var(--text-faint);
  transition: var(--trans-ease);
  cursor: pointer;
}
.social-links a:hover,
.social-links .social-icon-btn:hover {
  color: var(--text-accent);
  transform: translateY(-2px);
  opacity: 1;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .main-grid { flex-wrap: wrap; }
  .main-content { flex: 1 1 100%; }
  .sidebar { display: none; }
}
@media (max-width: 767px) {
  .home-inner { padding: 1rem; }
  .main-grid { gap: 1rem; }
  .feature-article { display: flex; flex-direction: column; height: auto !important; }
  .feature-thumbnail { height: 200px; }
  .feature-thumbnail img { position: relative; height: 100%; }
  .feature-content { padding: 1rem; }
  .feature-content h1 { font-size: 1.25rem; margin: .5rem 0; }
  .aurora-card-body { padding: 1rem; }
  .aurora-card-thumb { height: 140px; }
}
</style>