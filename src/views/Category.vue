<template>
  <div class="category-page">
    <!-- 分类文章列表模式 -->
    <template v-if="categoryId">
      <div class="cat-banner">
        <div class="cat-banner-overlay"></div>
        <div class="cat-banner-content">
          <h1 class="cat-banner-title">{{ categoryName || '分类文章' }}</h1>
          <p class="cat-banner-subtitle">{{ totalElements }} 篇文章</p>
        </div>
      </div>
      <div class="articles-container">
        <div v-if="loading" style="text-align:center;padding:3rem">
          <div class="ob-skeleton" style="height:200px;margin-bottom:1rem"></div>
        </div>
        <div v-else-if="articles.length === 0" style="text-align:center;padding:4rem;color:var(--text-dim)">
          <p>该分类下暂无文章</p>
        </div>
        <section v-else class="article-card-grid">
          <div v-for="art in articles" :key="art.id" class="aurora-card" @click="goTo(art.id)">
            <span v-if="art.isTop || art.top" class="aurora-card-tag"><b>📌 置顶</b></span>
            <div class="aurora-card-inner">
              <div class="aurora-card-thumb">
                <img v-if="art.coverUrl" v-lazy="art.coverUrl" alt="" />
                <div v-else class="aurora-card-thumb-placeholder"></div>
                <span class="aurora-card-thumb-overlay" :style="{ background: 'var(--main-gradient)' }"></span>
              </div>
              <div class="aurora-card-body">
                <span class="aurora-card-cats">
                  <ul v-if="art.createTime"><li><em>{{ art.createTime?.slice(0, 10) }}</em></li></ul>
                </span>
                <h1 class="aurora-card-title">{{ art.title }}</h1>
                <p class="aurora-card-excerpt">{{ cleanHtml(art.content || art.summary, 120) }}</p>
                <div class="aurora-card-footer">
                  <span>{{ art.viewCount || 0 }} 阅读 · {{ art.commentCount || 0 }} 评论</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div v-if="totalPages > 1" style="display:flex;justify-content:center;margin-top:2rem">
          <el-pagination background layout="prev, pager, next"
            :total="totalElements" :page-size="pageSize"
            :current-page.sync="currentPage" @current-change="toPage" />
        </div>
      </div>
    </template>

    <!-- 分类列表模式 -->
    <template v-else>
      <div class="cat-banner">
        <div class="cat-banner-overlay"></div>
        <div class="cat-banner-content">
          <h1 class="cat-banner-title">分类</h1>
          <p class="cat-banner-subtitle">{{ categories.length }} 个分类</p>
        </div>
      </div>
      <div class="cat-container">
        <div class="category-grid" v-if="categories.length">
          <router-link v-for="c in categories" :key="c.id" :to="'/category/' + c.id" class="category-card">
            <div class="cat-icon-wrapper">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="cat-info">
              <h3>{{ c.name }}</h3>
              <span class="cat-count">{{ c.articleCount || 0 }} 篇文章</span>
            </div>
            <div class="cat-arrow">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </router-link>
        </div>
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1.5" opacity="0.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <p>暂无分类</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getCategories, getArticles } from '../api/blog'
import { cleanHtml } from '../utils/helpers'

export default {
  name: 'Category',
  props: {
    id: { type: [String, Number], default: null }
  },
  data() {
    return {
      categories: [],
      articles: [],
      categoryName: '',
      loading: true,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0
    }
  },
  computed: {
    categoryId() {
      return this.id ? Number(this.id) : null
    }
  },
  watch: {
    '$route.params.id': {
      handler(val) {
        if (val) {
          this.currentPage = 1
          this.loadArticles()
        }
      }
    }
  },
  mounted() {
    if (this.categoryId) {
      this.loadCategories()
      this.loadArticles()
    } else {
      this.loadCategories()
    }
  },
  methods: {
    async loadCategories() {
      try {
        const res = await getCategories()
        this.categories = res.data || []
        if (this.categoryId) {
          const found = this.categories.find(c => c.id === this.categoryId)
          if (found) this.categoryName = found.name
        }
      } catch (e) {
        console.error('分类加载失败:', e)
      }
    },
    async loadArticles() {
      this.loading = true
      try {
        const res = await getArticles(this.currentPage - 1, this.pageSize, this.categoryId, null)
        const data = res.data
        this.articles = Array.isArray(data) ? data : (data.content || data.records || [])
        this.totalPages = data.totalPages || 1
        this.totalElements = data.totalElements || data.total || this.articles.length
      } catch (e) {
        console.error('文章加载失败:', e)
      } finally {
        this.loading = false
      }
    },
    toPage(p) {
      this.currentPage = p
      this.loadArticles()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    goTo(id) {
      this.$router.push('/article/' + id)
    },
    cleanHtml
  }
}
</script>

<style scoped>
.category-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.cat-banner {
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
.cat-banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.06);
}
.cat-banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.cat-banner-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.cat-banner-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* ========== 文章网格 ========== */
.articles-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}
.article-card-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}
@media (min-width: 640px) {
  .article-card-grid { grid-template-columns: repeat(2, 1fr); }
}
.aurora-card {
  border-radius: 0.75rem;
  height: 100%;
  list-style-type: none;
  cursor: pointer;
  transition: transform .2s ease-in-out;
  position: relative;
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
  padding: .2rem .5rem .6rem;
  font-size: .75rem;
  font-weight: 700;
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
  background: var(--background-secondary);
  border: 1px solid var(--text-faint);
  border-radius: 0.75rem;
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
  margin-bottom: .5rem;
}
.aurora-card-cats ul {
  list-style: none;
  margin: 0;
  padding: 0;
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
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.aurora-card-footer {
  font-size: .75rem;
  color: var(--text-dim);
  margin-top: auto;
}

/* ========== 分类列表网格 ========== */
.cat-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.category-card {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: var(--background-secondary);
  border-radius: 0.75rem;
  text-decoration: none;
  color: var(--text-normal);
  transition: all 0.3s;
  border: 1px solid var(--text-faint);
  position: relative;
  overflow: hidden;
}
.category-card:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--main-gradient);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.3s;
}
.category-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--accent-shadow);
}
.category-card:hover:before {
  opacity: 1;
}
.cat-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-primary);
  border-radius: 10px;
  margin-right: 1rem;
  color: var(--text-accent);
  flex-shrink: 0;
  transition: all 0.3s;
}
.category-card:hover .cat-icon-wrapper {
  background: var(--main-gradient);
  color: #fff;
}
.cat-info {
  flex: 1;
  min-width: 0;
}
.cat-info h3 {
  margin: 0 0 3px;
  font-size: 0.95rem;
  color: var(--text-bright);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cat-count {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.cat-arrow {
  color: var(--text-dim);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
  flex-shrink: 0;
}
.category-card:hover .cat-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--text-accent);
}
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-dim);
}
.empty-state p {
  margin-top: 1rem;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .cat-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .cat-banner-title {
    font-size: 1.8rem;
  }
  .cat-container, .articles-container {
    padding: 0 1rem 2rem;
  }
}
</style>
