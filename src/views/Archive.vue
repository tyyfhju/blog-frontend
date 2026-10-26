<template>
  <div class="archive-page">
    <!-- Banner -->
    <div class="archive-banner">
      <div class="archive-banner-overlay"></div>
      <div class="archive-banner-content">
        <h1 class="archive-title">归档</h1>
        <p class="archive-subtitle">共 {{ articles.length }} 篇文章</p>
      </div>
    </div>

    <!-- Timeline -->
    <div class="archive-timeline">
      <div v-if="articles.length > 0">
        <div v-for="(group, year) in groupedArticles" :key="year" class="timeline-year-group">
          <!-- 年份标记 -->
          <div class="timeline-year-marker">
            <span class="year-dot"></span>
            <h2 class="year-label">{{ year }}</h2>
          </div>

          <!-- 该年份的文章列表 -->
          <div class="timeline-articles">
            <div
              v-for="article in group"
              :key="article.id"
              class="timeline-article-card"
              @click="$router.push('/article/' + article.id)"
            >
              <!-- 封面图 -->
              <div class="tl-card-cover" v-if="article.coverUrl">
                <img :src="article.coverUrl" :alt="article.title" loading="lazy" />
              </div>
              <div class="tl-card-cover tl-card-cover-placeholder" v-else></div>

              <!-- 内容区 -->
              <div class="tl-card-body">
                <div class="tl-card-meta">
                  <span class="tl-card-cat" v-if="article.categoryName">{{ article.categoryName }}</span>
                  <time class="tl-card-date">{{ formatDate(article.createTime) }}</time>
                </div>
                <h3 class="tl-card-title">{{ article.title }}</h3>
                <p class="tl-card-excerpt" v-if="article.content">{{ cleanHtml(article.content, 100) }}</p>
                <div class="tl-card-footer">
                  <span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ article.viewCount || 0 }}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {{ article.commentCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="archive-empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="var(--text-dim)" stroke-width="1" opacity="0.4">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getArchives } from '@/api/blog'
import { cleanHtml } from '@/utils/helpers'

export default {
  name: 'Archive',
  data() {
    return {
      articles: []
    }
  },
  computed: {
    groupedArticles() {
      const groups = {}
      this.articles.forEach(a => {
        const year = new Date(a.createTime).getFullYear()
        if (!groups[year]) groups[year] = []
        groups[year].push(a)
      })
      // 按年份降序排列
      const sorted = {}
      Object.keys(groups).sort((a, b) => b - a).forEach(k => { sorted[k] = groups[k] })
      return sorted
    }
  },
  mounted() {
    this.loadArchives()
  },
  methods: {
    async loadArchives() {
      try {
        const res = await getArchives()
        const data = res.data
        this.articles = data.content || data.data || data || []
      } catch (e) {
        console.error('加载归档失败', e)
      }
    },
    formatDate(d) {
      if (!d) return ''
      const date = new Date(d)
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
      const day = String(date.getDate()).padStart(2, '0')
      return months[date.getMonth()] + '-' + day
    },
    cleanHtml
  }
}
</script>

<style scoped>
.archive-page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0;
}

/* ========== Banner ========== */
.archive-banner {
  position: relative;
  width: 100%;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-gradient);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
  margin-bottom: 2rem;
}
.archive-banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.08);
}
.archive-banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.archive-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.archive-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* ========== Timeline ========== */
.archive-timeline {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  position: relative;
}

/* 年份组 */
.timeline-year-group {
  margin-bottom: 3rem;
}

/* 年份标记 */
.timeline-year-marker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-left: 0;
}
.year-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--main-gradient);
  flex-shrink: 0;
  box-shadow: 0 0 12px var(--bg-accent-55);
}
.year-label {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-bright);
  margin: 0;
}

/* 文章卡片列表 */
.timeline-articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--background-trans);
  margin-left: 5px;
}

/* 单篇文章卡片 */
.timeline-article-card {
  background: var(--background-secondary);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--text-faint);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}
.timeline-article-card:hover {
  transform: translateY(-3px);
  border-color: var(--text-accent);
  box-shadow: var(--accent-shadow);
}

/* 封面 */
.tl-card-cover {
  height: 140px;
  overflow: hidden;
  flex-shrink: 0;
}
.tl-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.timeline-article-card:hover .tl-card-cover img {
  transform: scale(1.05);
}
.tl-card-cover-placeholder {
  background: var(--main-gradient);
  opacity: 0.5;
}

/* 内容 */
.tl-card-body {
  padding: 1rem 1.25rem 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.tl-card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.tl-card-cat {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #fff;
  background: var(--main-gradient);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tl-card-date {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.tl-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-bright);
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.tl-card-excerpt {
  font-size: 0.82rem;
  color: var(--text-dim);
  line-height: 1.5;
  margin: 0 0 0.75rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tl-card-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-dim);
}
.tl-card-footer span {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 空状态 */
.archive-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-dim);
}

@media (max-width: 640px) {
  .archive-banner {
    min-height: 200px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .archive-title {
    font-size: 1.8rem;
  }
  .archive-timeline {
    padding: 0 1rem 2rem;
  }
  .timeline-articles {
    grid-template-columns: 1fr;
    padding-left: 1rem;
  }
  .tl-card-cover {
    height: 120px;
  }
}
</style>
