<template>
  <div class="articles-page">
    <section class="page-head">
      <div class="page-head-in">
        <span class="eyebrow"><i class="dot"></i>{{ content.articles.eyebrow }}</span>
        <h1 v-html="content.articles.titleHtml"></h1>
        <p class="head-desc">{{ content.articles.desc }}</p>
        <div class="head-stats">
          <span><i></i><b>{{ total }}</b> {{ content.common.articlesUnit }}</span>
          <span><i></i><b>{{ categories.length }}</b> {{ content.common.categoriesUnit }}</span>
          <span><i></i>{{ content.common.updated }}</span>
        </div>
      </div>
      <PageHeadAnimation variant="papers" />
    </section>

    <div class="toolbar-wrap">
      <div class="toolbar site-glass">
        <div class="chips" role="group" :aria-label="content.common.filterByCategory">
          <button
            type="button"
            class="chip"
            :class="{ on: activeCategory === null }"
            @click="selectCategory(null)">
            {{ content.articles.all }}<span class="n">{{ totalAll }}</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="chip"
            :class="{ on: activeCategory === cat.id }"
            @click="selectCategory(cat.id)">
            {{ cat.name }}<span class="n">{{ cat.articleCount || 0 }}</span>
          </button>
        </div>
        <label class="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
          </svg>
          <input v-model="keyword" type="search" :placeholder="content.articles.searchPlaceholder" autocomplete="off" @input="onSearchInput">
        </label>
      </div>
    </div>

    <div class="list-meta">
      <span>{{ rangeText }}</span>
      <span>{{ content.articles.sort }}</span>
    </div>

    <section v-if="articles.length" class="post-list" aria-live="polite">
      <router-link
        v-for="(article, i) in articles"
        :key="article.id"
        :to="'/article/' + article.id"
        class="post-row"
        :style="{ animationDelay: (i * 45) + 'ms' }">
        <span class="post-idx">{{ pad((page - 1) * pageSize + i + 1) }}</span>
        <div class="post-main">
          <div class="post-meta">
            <span>{{ formatDate(article.createTime) }}</span>
            <span class="cat">{{ article.categoryName || content.common.uncategorized }}</span>
            <span>{{ article.viewCount || 0 }} {{ content.articles.viewsUnit }}</span>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ summary(article) }}</p>
        </div>
        <div class="post-thumb">
          <img v-if="article.coverUrl" :src="article.coverUrl" alt="" loading="lazy">
          <span v-else class="thumb-placeholder"></span>
        </div>
        <span class="post-arrow">↗</span>
      </router-link>
    </section>

    <div v-else-if="!loading" class="empty">
      <b>{{ content.articles.emptyTitle }}</b>
      <p>{{ content.articles.emptyDesc }}</p>
      <button type="button" @click="clearFilters">{{ content.articles.clear }}</button>
    </div>

    <div v-if="loading" class="loading">{{ content.common.loading }}</div>

    <nav v-if="pages > 1" class="pager" :aria-label="content.common.pagination">
      <button type="button" :disabled="page === 1" @click="goPage(page - 1)">{{ content.common.prevPage }}</button>
      <template v-for="(p, idx) in pageList">
        <span v-if="p === '...'" :key="'gap' + idx" class="gap">…</span>
        <button v-else :key="p" type="button" :class="{ on: p === page }" @click="goPage(p)">{{ p }}</button>
      </template>
      <button type="button" :disabled="page === pages" @click="goPage(page + 1)">{{ content.common.nextPage }}</button>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArticles, getCategories, searchArticles } from '../api/blog'
import { cleanHtml } from '../utils/helpers'
import { formatText } from '../content/site'
import PageHeadAnimation from '../components/PageHeadAnimation.vue'

export default {
  name: 'Articles',
  components: { PageHeadAnimation },
  data() {
    return {
      articles: [],
      categories: [],
      total: 0,
      totalAll: 0,
      page: 1,
      pageSize: 6,
      activeCategory: null,
      keyword: '',
      loading: false,
      searchTimer: null
    }
  },
  computed: {
    ...mapState(['content']),
    pages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
    rangeText() {
      if (!this.total) return this.content.articles.zeroRange
      const start = (this.page - 1) * this.pageSize + 1
      const end = Math.min(this.page * this.pageSize, this.total)
      return formatText(this.content.articles.range, { start, end, total: this.total })
    },
    pageList() {
      const total = this.pages
      const cur = this.page
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      const list = [1]
      if (cur > 3) list.push('...')
      for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) list.push(p)
      if (cur < total - 2) list.push('...')
      list.push(total)
      return list
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
  methods: {
    async init() {
      await this.loadCategories()
      const q = Number(this.$route.query.categoryId)
      if (q) this.activeCategory = q
      await this.load()
    },
    async loadCategories() {
      try {
        const res = await getCategories()
        this.categories = res.data || []
        this.totalAll = this.categories.reduce((sum, c) => sum + (c.articleCount || 0), 0)
      } catch (e) {
        this.categories = []
      }
    },
    async load() {
      this.loading = true
      try {
        const q = this.keyword.trim()
        const res = q
          ? await searchArticles(q, this.page - 1, this.pageSize)
          : await getArticles(this.page - 1, this.pageSize, this.activeCategory)
        const data = res.data
        const list = Array.isArray(data) ? data : (data.content || data.records || data.data || [])
        this.articles = list
        const total = data && data.totalElements !== undefined ? data.totalElements : (data && data.total)
        this.total = total !== undefined ? total : list.length
      } catch (e) {
        this.articles = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    selectCategory(id) {
      if (this.activeCategory === id && !this.keyword) return
      this.activeCategory = id
      this.keyword = ''
      this.page = 1
      this.updateQuery()
      this.load()
    },
    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.page = 1
        this.load()
      }, 300)
    },
    clearFilters() {
      this.keyword = ''
      this.activeCategory = null
      this.page = 1
      this.updateQuery()
      this.load()
    },
    goPage(p) {
      if (p < 1 || p > this.pages || p === this.page) return
      this.page = p
      this.load()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    updateQuery() {
      const query = this.activeCategory ? { categoryId: this.activeCategory } : {}
      this.$router.replace({ path: '/articles', query }).catch(() => {})
    },
    formatDate(t) {
      return t ? String(t).slice(0, 10) : ''
    },
    summary(article) {
      return cleanHtml(article.summary || article.content || '', 120)
    },
    pad(n) {
      return n < 10 ? '0' + n : String(n)
    }
  }
}
</script>

<style scoped>
.articles-page {
  position: relative;
  min-height: 70vh;
  padding-bottom: 40px;
}

/* 页头 */
.page-head {
  position: relative;
  padding: 150px 0 46px;
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
  animation: articlesPulse 2.4s infinite;
}
@keyframes articlesPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .35; }
}
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
  max-width: 520px;
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
.head-stats span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.head-stats i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.head-stats b {
  color: var(--text);
  font-weight: 700;
  font-size: 11.5px;
}
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
  animation: articlesSpin 46s linear infinite;
}
.head-orbit i:nth-child(2) {
  inset: 56px;
  border-style: solid;
  border-color: var(--brand);
  opacity: .22;
  animation: articlesSpin 30s linear infinite reverse;
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
@keyframes articlesSpin {
  to { transform: rotate(360deg); }
}

/* 吸顶筛选 */
.toolbar-wrap {
  position: sticky;
  top: 88px;
  z-index: 60;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 12px;
  border-radius: 999px;
}
.chips {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chips::-webkit-scrollbar { display: none; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-2);
  white-space: nowrap;
  transition: all .18s var(--ease);
}
.chip:hover { color: var(--text); background: var(--grad-soft); }
.chip.on {
  background: var(--grad);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 6px 18px var(--glow);
}
.chip .n {
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: .55;
}
.chip.on .n { opacity: .85; }
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  min-width: 230px;
  transition: border-color .18s var(--ease);
}
.search:focus-within { border-color: var(--brand); }
.search svg { flex-shrink: 0; color: var(--text-3); }
.search input {
  border: none;
  outline: none;
  background: none;
  font-size: 13px;
  color: var(--text);
  width: 100%;
  font-family: inherit;
}
.search input::placeholder { color: var(--text-3); }

/* 列表 */
.list-meta {
  max-width: var(--maxw);
  margin: 30px auto 16px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: .06em;
}
.post-list {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
}
.post-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 184px 26px;
  gap: 24px;
  align-items: center;
  padding: 20px 12px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: background .25s var(--ease), padding-left .25s var(--ease);
  animation: articlesRise .55s var(--ease) backwards;
}
.post-row:hover {
  background: var(--grad-soft);
  padding-left: 20px;
}
@keyframes articlesRise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
.post-idx {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-3);
  letter-spacing: .08em;
}
.post-main { min-width: 0; }
.post-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: .04em;
}
.post-meta .cat { color: var(--accent); font-weight: 600; }
.post-main h3 {
  font-size: 21px;
  font-weight: 750;
  letter-spacing: -.02em;
  line-height: 1.35;
  margin: 7px 0 5px;
  color: var(--text);
  transition: color .2s var(--ease);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.post-row:hover .post-main h3 { color: var(--brand); }
.post-main p {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-thumb {
  aspect-ratio: 16/10;
  border-radius: 12px;
  overflow: hidden;
  background: var(--grad-soft);
  box-shadow: 0 8px 22px rgba(15, 23, 42, .08);
}
.post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .45s var(--ease);
}
.thumb-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--grad-soft);
}
.post-row:hover .post-thumb img { transform: scale(1.06); }
.post-arrow {
  font-size: 17px;
  color: var(--text-3);
  transition: all .2s var(--ease);
}
.post-row:hover .post-arrow {
  color: var(--brand);
  transform: translate(3px, -3px);
}

/* 空状态 / 加载 */
.empty {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 78px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.empty b {
  display: block;
  font-size: 17px;
  color: var(--text);
  margin-bottom: 6px;
}
.empty p { font-size: 13.5px; color: var(--text-3); }
.empty button {
  margin-top: 18px;
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
}
.empty button:hover { border-color: var(--brand); color: var(--brand); }
.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-3);
  font-size: 13px;
}

/* 分页 */
.pager {
  max-width: var(--maxw);
  margin: 40px auto 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.pager button {
  min-width: 38px;
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--text-2);
  cursor: pointer;
  transition: all .18s var(--ease);
}
.pager button:hover:not(:disabled):not(.on) { border-color: var(--brand); color: var(--brand); }
.pager button.on {
  background: var(--grad);
  border-color: transparent;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 18px var(--glow);
}
.pager button:disabled { opacity: .35; cursor: default; }
.pager .gap {
  color: var(--text-3);
  padding: 0 2px;
  font-family: var(--font-mono);
  font-size: 12px;
}

@media (max-width: 900px) {
  .head-orbit { display: none; }
  .page-head { padding-top: 130px; }
  .toolbar-wrap { top: 82px; }
  .toolbar { flex-wrap: wrap; border-radius: 22px; padding: 10px; }
  .chips { flex-basis: 100%; }
  .search { width: 100%; min-width: 0; }
  .post-row { grid-template-columns: 44px minmax(0, 1fr) 140px 22px; gap: 16px; }
  .post-main h3 { font-size: 19px; }
}
@media (max-width: 760px) {
  .post-row { grid-template-columns: 36px minmax(0, 1fr) 100px; gap: 12px; padding: 16px 4px; }
  .post-main h3 {
    font-size: 17.5px;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .post-main p { display: none; }
  .post-arrow { display: none; }
  .post-thumb { aspect-ratio: 4/3; border-radius: 10px; }
}
@media (max-width: 520px) {
  .page-head { padding: 120px 0 34px; }
  .head-stats { gap: 12px; }
  .list-meta { flex-direction: column; align-items: flex-start; gap: 4px; }
  .pager { gap: 6px; }
  .pager button { min-width: 34px; height: 34px; padding: 0 10px; font-size: 11.5px; }
}
</style>
