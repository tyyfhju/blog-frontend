<template>
  <div class="category-page">
    <section class="page-head">
      <div class="page-head-in">
        <span class="eyebrow"><i class="dot"></i>{{ content.categories.eyebrow }}</span>
        <h1 v-html="content.categories.titleHtml"></h1>
        <p class="head-desc">{{ content.categories.desc }}</p>
        <div class="head-stats">
          <span><i></i><b>{{ categories.length }}</b> {{ content.common.categoriesUnit }}</span>
          <span><i></i><b>{{ totalArticles }}</b> {{ content.common.articlesUnit }}</span>
          <span><i></i>{{ content.common.updated }}</span>
        </div>
      </div>
      <PageHeadAnimation variant="constellation" />
    </section>

    <section class="cat-wrap">
      <div v-if="categories.length" class="cat-grid">
        <router-link
          v-for="(cat, i) in categories"
          :key="cat.id"
          :to="{ path: '/articles', query: { categoryId: cat.id } }"
          class="cat-card">
          <span class="cat-idx">{{ pad(i + 1) }}</span>
          <div class="cat-main">
            <div class="cat-top">
              <h2>{{ cat.name }}</h2>
              <span class="cat-count">{{ cat.articleCount || 0 }} {{ content.categories.articleUnit }}</span>
            </div>
            <p class="cat-desc">{{ cardDesc(cat) }}</p>
            <div class="cat-links">
              <span v-for="(title, j) in (samples[cat.id] || [])" :key="j">{{ title }}</span>
              <span v-if="!(samples[cat.id] || []).length">{{ content.categories.emptyArticles }}</span>
            </div>
          </div>
          <span class="cat-arrow">↗</span>
        </router-link>
      </div>

      <div class="all-link">
        <router-link to="/articles">{{ content.categories.allArticles }}</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getCategories, getArchives } from '../api/blog'
import { formatText } from '../content/site'
import PageHeadAnimation from '../components/PageHeadAnimation.vue'

export default {
  name: 'Category',
  components: { PageHeadAnimation },
  data() {
    return {
      categories: [],
      samples: {},
      totalArticles: 0,
      loading: true
    }
  },
  computed: {
    ...mapState(['content'])
  },
  mounted() {
    const id = this.$route.params.id
    if (id) {
      this.$router.replace({ path: '/articles', query: { categoryId: id } }).catch(() => {})
      return
    }
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const [catRes, arcRes] = await Promise.all([
          getCategories(),
          getArchives().catch(() => ({ data: [] }))
        ])
        this.categories = catRes.data || []
        const data = arcRes.data
        const list = Array.isArray(data) ? data : (data.content || data.records || data.data || [])
        this.totalArticles = list.length || this.categories.reduce((sum, c) => sum + (c.articleCount || 0), 0)
        const map = {}
        list.forEach(art => {
          if (!map[art.categoryId]) map[art.categoryId] = []
          if (map[art.categoryId].length < 3) map[art.categoryId].push(art.title)
        })
        this.samples = map
      } catch (e) {
        this.categories = []
      } finally {
        this.loading = false
      }
    },
    pad(n) {
      return n < 10 ? '0' + n : String(n)
    },
    cardDesc(cat) {
      return formatText(this.content.categories.cardDesc, { name: cat.name })
    }
  }
}
</script>

<style scoped>
.category-page {
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
  animation: categoryPulse 2.4s infinite;
}
@keyframes categoryPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
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
  animation: categorySpin 46s linear infinite;
}
.head-orbit i:nth-child(2) {
  inset: 56px;
  border-style: solid;
  border-color: var(--brand);
  opacity: .22;
  animation: categorySpin 30s linear infinite reverse;
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
@keyframes categorySpin { to { transform: rotate(360deg); } }

/* 分类卡片 */
.cat-wrap { max-width: var(--maxw); margin: 0 auto; padding: 14px 24px 30px; }
.cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.cat-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 24px;
  gap: 18px;
  padding: 28px;
  border-radius: 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s var(--ease);
  animation: categoryRise .55s var(--ease) backwards;
}
.cat-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--grad-soft);
  opacity: 0;
  transition: opacity .3s var(--ease);
  pointer-events: none;
}
.cat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 64px rgba(15, 23, 42, .14);
  border-color: transparent;
}
.cat-card:hover::before { opacity: 1; }
.cat-card > * { position: relative; z-index: 1; }
@keyframes categoryRise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
.cat-idx {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-3);
  letter-spacing: .08em;
  padding-top: 6px;
}
.cat-top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.cat-top h2 { font-size: 24px; font-weight: 800; letter-spacing: -.03em; line-height: 1.2; color: var(--text); }
.cat-count { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-3); }
.cat-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.75; margin: 8px 0 14px; }
.cat-links { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: var(--text-3); }
.cat-links span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cat-links span::before { content: "—"; margin-right: 8px; color: var(--accent); }
.cat-arrow {
  font-size: 17px;
  color: var(--text-3);
  align-self: center;
  transition: all .2s var(--ease);
}
.cat-card:hover .cat-arrow { color: var(--brand); transform: translate(3px, -3px); }
.all-link { text-align: center; margin-top: 38px; }
.all-link a {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  text-decoration: none;
  transition: all .18s var(--ease);
}
.all-link a:hover { border-color: var(--brand); color: var(--brand); }

@media (max-width: 900px) {
  .head-orbit { display: none; }
  .page-head { padding-top: 130px; }
}
@media (max-width: 760px) {
  .cat-grid { grid-template-columns: 1fr; }
  .cat-card { padding: 22px; grid-template-columns: 36px minmax(0, 1fr) 20px; gap: 14px; }
  .cat-top h2 { font-size: 21px; }
}
@media (max-width: 520px) {
  .page-head { padding: 120px 0 32px; }
  .head-stats { gap: 12px; }
  .cat-wrap { padding: 10px 20px 24px; }
}
</style>
