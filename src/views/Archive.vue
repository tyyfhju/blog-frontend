<template>
  <div class="archive-page">
    <section class="page-head">
      <div class="page-head-in">
        <span class="eyebrow"><i class="dot"></i>{{ content.archive.eyebrow }}</span>
        <h1 v-html="content.archive.titleHtml"></h1>
        <p class="head-desc">{{ content.archive.desc }}</p>
        <div class="head-stats">
          <span><i></i><b>{{ articles.length }}</b> {{ content.common.articlesUnit }}</span>
          <span><i></i><b>{{ years.length }}</b> {{ content.archive.yearUnit }}</span>
          <span><i></i>{{ content.common.updated }}</span>
        </div>
      </div>
      <PageHeadAnimation variant="time" />
    </section>

    <section class="archive-body">
      <div v-for="group in groupedArticles" :key="group.year" class="year-group">
        <div class="year-head">
          <span class="year-label">{{ group.year }}</span>
          <span class="year-line"></span>
          <span class="year-count">{{ group.items.length }} {{ content.archive.articleUnit }}</span>
        </div>

        <div class="archive-list">
          <router-link
            v-for="article in group.items"
            :key="article.id"
            :to="'/article/' + article.id"
            class="archive-row">
            <span class="row-date">{{ formatMonthDay(article.createTime) }}</span>
            <span class="row-main">
              <b>{{ article.title }}</b>
              <small>{{ summary(article) }}</small>
            </span>
            <span class="row-cat">{{ article.categoryName || content.common.uncategorized }}</span>
            <span class="row-arrow">↗</span>
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="archive-empty">{{ content.common.loading }}</div>
      <div v-else-if="!articles.length" class="archive-empty">{{ content.archive.empty }}</div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArchives } from '@/api/blog'
import { cleanHtml } from '@/utils/helpers'
import PageHeadAnimation from '@/components/PageHeadAnimation.vue'

export default {
  name: 'Archive',
  components: { PageHeadAnimation },
  data() {
    return {
      articles: [],
      loading: true
    }
  },
  computed: {
    ...mapState(['content']),
    years() {
      return this.groupedArticles.map(g => g.year)
    },
    groupedArticles() {
      const groups = {}
      this.articles.forEach(article => {
        const date = new Date(article.createTime)
        if (Number.isNaN(date.getTime())) return
        const year = String(date.getFullYear())
        if (!groups[year]) groups[year] = []
        groups[year].push(article)
      })
      return Object.keys(groups)
        .sort((a, b) => Number(b) - Number(a))
        .map(year => ({
          year,
          items: groups[year].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        }))
    }
  },
  mounted() {
    this.loadArchives()
  },
  methods: {
    async loadArchives() {
      this.loading = true
      try {
        const res = await getArchives()
        const data = res.data
        this.articles = Array.isArray(data) ? data : (data.content || data.records || data.data || [])
      } catch (e) {
        this.articles = []
      } finally {
        this.loading = false
      }
    },
    formatMonthDay(value) {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    },
    summary(article) {
      return cleanHtml(article.summary || article.content || '', 90)
    }
  }
}
</script>

<style scoped>
.archive-page {
  position: relative;
  min-height: 70vh;
  padding-bottom: 40px;
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
  animation: archivePulse 2.4s infinite;
}
@keyframes archivePulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.page-head h1 {
  font-size: clamp(38px, 5.2vw, 58px);
  line-height: 1.08;
  letter-spacing: -.045em;
  font-weight: 800;
  margin: 20px 0 14px;
  color: var(--text);
}
.head-desc {
  font-size: 14.5px;
  color: var(--text-2);
  max-width: 540px;
  line-height: 1.85;
}
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
.head-stats b { color: var(--text); font-weight: 700; font-size: 11.5px; }
.head-orbit {
  position: absolute;
  right: 5%;
  top: 118px;
  width: 250px;
  height: 250px;
  pointer-events: none;
  opacity: .8;
}
.head-orbit i {
  position: absolute;
  inset: 0;
  border: 1px dashed var(--brand);
  opacity: .16;
  border-radius: 50%;
  animation: archiveSpin 46s linear infinite;
}
.head-orbit i:nth-child(2) {
  inset: 56px;
  border-style: solid;
  border-color: var(--brand);
  opacity: .22;
  animation: archiveSpin 30s linear infinite reverse;
}
.head-orbit b {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: var(--grad);
  box-shadow: 0 0 0 9px var(--glow);
}
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
@keyframes archiveSpin { to { transform: rotate(360deg); } }

/* 归档列表 */
.archive-body {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px 24px 40px;
}
.year-group { margin-top: 42px; }
.year-group:first-child { margin-top: 10px; }
.year-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}
.year-label {
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -.04em;
  color: var(--text);
}
.year-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}
.year-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: .08em;
  white-space: nowrap;
}
.archive-list { border-top: 1px solid var(--border); }
.archive-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 18px;
  padding: 17px 6px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: background .18s var(--ease), padding .18s var(--ease);
}
.archive-row:hover {
  background: var(--grad-soft);
  padding-left: 12px;
  padding-right: 12px;
}
.row-date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: .04em;
}
.row-main { min-width: 0; }
.row-main b {
  display: block;
  font-size: 16.5px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-main small {
  display: block;
  margin-top: 3px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-cat {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.row-arrow {
  font-size: 15px;
  color: var(--text-3);
  text-align: right;
  transition: all .18s var(--ease);
}
.archive-row:hover .row-arrow { color: var(--brand); transform: translate(2px, -2px); }

.archive-empty {
  text-align: center;
  padding: 64px 20px;
  color: var(--text-3);
  font-size: 13.5px;
  border: 1px dashed var(--border);
  border-radius: 20px;
  background: var(--surface);
  margin-top: 20px;
}

@media (max-width: 900px) {
  .head-orbit { display: none; }
  .page-head { padding-top: 130px; }
}
@media (max-width: 640px) {
  .page-head { padding: 120px 0 32px; }
  .head-stats { gap: 12px; }
  .archive-body { padding: 8px 20px 32px; }
  .year-group { margin-top: 32px; }
  .archive-row { grid-template-columns: 46px minmax(0, 1fr); gap: 10px; padding: 14px 4px; }
  .row-cat, .row-arrow { display: none; }
  .row-main b { font-size: 15px; }
  .row-main small { font-size: 11.5px; }
}
</style>
