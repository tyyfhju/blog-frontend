<template>
  <div class="home-page">
    <!-- 首屏：流丝 -->
    <section class="portal portal-hero">
      <div v-if="siteInfo.homeImageUrl" class="portal-photo" :style="{ backgroundImage: 'url(' + siteInfo.homeImageUrl + ')' }" aria-hidden="true"></div>
      <SilkFlowCanvas class="portal-canvas" />
      <div class="portal-in">
        <div class="portal-copy">
          <span class="eyebrow">
            <i class="dot"></i>
            <span>{{ clockText }}</span>
            <span class="sep">·</span>
            <span :class="{ today: holidayToday }">{{ holidayText }}</span>
          </span>
          <h1 v-html="content.home.hero.titleHtml"></h1>
          <p>{{ content.home.hero.desc }}</p>
          <div class="hero-actions">
            <router-link class="btn btn-primary" to="/articles">{{ content.home.hero.primaryText }}</router-link>
            <router-link class="btn btn-ghost" to="/archive">{{ content.home.hero.secondaryText }}</router-link>
          </div>
          <div class="portal-meta">
            <span><i></i><b>{{ siteInfo.articleCount || latest.length }}</b> {{ content.common.articlesUnit }}</span>
            <span><i></i><b>{{ siteInfo.categoryCount || categories.length }}</b> {{ content.common.categoriesUnit }}</span>
            <span><i></i>{{ content.common.updated }}</span>
          </div>
          <div class="mono-caption">{{ content.home.hero.caption }}</div>
        </div>
      </div>
    </section>

    <!-- 精选 -->
    <section v-if="features.length" class="section" id="featured">
      <div class="section-head reveal">
        <div>
          <h2>{{ content.home.featured.title }}</h2>
          <p>{{ content.home.featured.desc }}</p>
        </div>
        <router-link to="/articles">{{ content.home.featured.more }}</router-link>
      </div>
      <div class="feature-grid">
        <article v-for="(article, i) in features" :key="article.id" class="feature-card site-glass reveal">
          <div class="feature-visual">
            <GeometryCanvas :variant="i === 0 ? 'cell' : 'cy'" />
          </div>
          <div class="feature-body">
            <div class="feature-article">
              <router-link class="feature-cover" :to="'/article/' + article.id">
                <img v-if="article.coverUrl" :src="article.coverUrl" alt="">
                <span v-else class="cover-placeholder"></span>
              </router-link>
              <div class="feature-article-text">
                <div class="meta">
                  <span>{{ formatDate(article.createTime) }}</span>
                  <span class="cat">{{ article.categoryName || content.common.uncategorized }}</span>
                  <span>{{ article.viewCount || 0 }} {{ content.common.views }}</span>
                </div>
                <h4><router-link :to="'/article/' + article.id">{{ article.title }}</router-link></h4>
                <p>{{ summary(article) }}</p>
                <router-link class="more" :to="'/article/' + article.id">{{ content.home.readMore }}</router-link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 最新文章 -->
    <section v-if="latest.length" class="section" id="latest">
      <div class="section-head reveal">
        <div>
          <h2>{{ content.home.latest.title }}</h2>
          <p>{{ content.home.latest.desc }}</p>
        </div>
        <router-link to="/articles">{{ content.home.latest.more }}</router-link>
      </div>
      <div class="post-list">
        <router-link
          v-for="(article, i) in latest"
          :key="article.id"
          :to="'/article/' + article.id"
          class="post-row reveal">
          <span class="post-idx">{{ pad(i + 1) }}</span>
          <div class="post-main">
            <div class="post-meta">
              <span>{{ formatDate(article.createTime) }}</span>
              <span class="cat">{{ article.categoryName || content.common.uncategorized }}</span>
              <span>{{ article.viewCount || 0 }} {{ content.common.views }}</span>
            </div>
            <h3>{{ article.title }}</h3>
            <p>{{ summary(article) }}</p>
          </div>
          <div class="post-thumb">
            <img v-if="article.coverUrl" :src="article.coverUrl" alt="" loading="lazy">
            <span v-else class="cover-placeholder"></span>
          </div>
          <span class="post-arrow">↗</span>
        </router-link>
      </div>
    </section>

    <!-- 分类 -->
    <section v-if="topCategories.length" class="section" id="categories" style="padding-top:0">
      <div class="section-head reveal">
        <div>
          <h2>{{ content.home.categories.title }}</h2>
          <p>{{ content.home.categories.desc }}</p>
        </div>
        <router-link to="/category">{{ content.home.categories.more }}</router-link>
      </div>
      <div class="topics">
        <router-link
          v-for="(cat, i) in topCategories"
          :key="cat.id"
          :to="{ path: '/articles', query: { categoryId: cat.id } }"
          class="topic reveal">
          <span class="idx">{{ pad(i + 1) }}</span>
          <div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.articleCount || 0 }} {{ content.common.articlesUnit }}</p>
          </div>
          <span class="count">{{ cat.articleCount || 0 }} {{ content.common.articleShortUnit }}</span>
          <span class="arrow">→</span>
        </router-link>
      </div>
    </section>

    <div v-if="!loading && !features.length && !latest.length" class="home-empty">
      {{ content.home.empty }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import GeometryCanvas from '../components/GeometryCanvas.vue'
import SilkFlowCanvas from '../components/SilkFlowCanvas.vue'
import { getArticles, getCategories, getRecommendedArticles, getHomeCounts } from '../api/blog'
import { cleanHtml } from '../utils/helpers'
import { formatText } from '../content/site'

const LOCAL_HOLIDAYS = [
  { name: '元旦', dates: ['2026-01-01', '2027-01-01', '2028-01-01'] },
  { name: '春节', dates: ['2026-02-17', '2027-02-06', '2028-01-26'] },
  { name: '元宵节', dates: ['2026-03-03', '2027-02-20', '2028-02-09'] },
  { name: '清明节', dates: ['2026-04-05', '2027-04-05', '2028-04-04'] },
  { name: '劳动节', dates: ['2026-05-01', '2027-05-01', '2028-05-01'] },
  { name: '端午节', dates: ['2026-06-19', '2027-06-09', '2028-05-28'] },
  { name: '七夕节', dates: ['2026-08-19', '2027-08-08', '2028-08-26'] },
  { name: '中秋节', dates: ['2026-09-25', '2027-09-15', '2028-10-03'] },
  { name: '重阳节', dates: ['2026-10-18', '2027-10-08', '2028-10-26'] },
  { name: '国庆节', dates: ['2026-10-01', '2027-10-01', '2028-10-01'] },
  { name: '冬至', dates: ['2026-12-21', '2027-12-22', '2028-12-21'] }
]

export default {
  name: 'Home',
  components: { GeometryCanvas, SilkFlowCanvas },
  data() {
    return {
      features: [],
      latest: [],
      categories: [],
      loading: true,
      clockText: '--',
      holidayText: '',
      holidayToday: false,
      chosenHoliday: null,
      holidayPickedAt: 0,
      clockTimer: null,
      revealObserver: null,
      reduced: false
    }
  },
  computed: {
    ...mapState(['content', 'siteInfo']),
    topCategories() {
      return this.categories
        .slice()
        .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
        .slice(0, 3)
    }
  },
  mounted() {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.holidayText = this.content.home.holiday.calculating
    this.loadAll()
    this.startClock()
  },
  beforeDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer)
    if (this.revealObserver) this.revealObserver.disconnect()
  },
  methods: {
    async loadAll() {
      this.loading = true
      try {
        const [recRes, artRes, catRes, countRes] = await Promise.all([
          getRecommendedArticles().catch(() => ({ data: [] })),
          getArticles(0, 6).catch(() => ({ data: [] })),
          getCategories().catch(() => ({ data: [] })),
          getHomeCounts().catch(() => ({ data: {} }))
        ])
        const rec = this.listOf(recRes)
        const arts = this.listOf(artRes)
        this.latest = arts.slice(0, 6)
        let features = rec.slice(0, 2)
        if (features.length < 2) {
          const extra = arts.filter(a => !features.some(f => f.id === a.id))
          features = features.concat(extra.slice(0, 2 - features.length))
        }
        this.features = features.slice(0, 2)
        this.categories = this.listOf(catRes)
        const counts = countRes.data || {}
        this.$store.commit('SET_SITE_INFO', {
          articleCount: counts.articles || this.latest.length,
          categoryCount: counts.categories || this.categories.length
        })
      } catch (e) {
        this.features = []
        this.latest = []
      } finally {
        this.loading = false
        this.$nextTick(this.initReveal)
      }
    },
    listOf(res) {
      const data = (res && res.data !== undefined) ? res.data : res
      if (Array.isArray(data)) return data
      return (data && (data.content || data.records || data.data)) || []
    },
    summary(article) {
      return cleanHtml(article.summary || article.content || '', 120)
    },
    formatDate(t) {
      return t ? String(t).slice(0, 10) : ''
    },
    pad(n) {
      return n < 10 ? '0' + n : String(n)
    },
    initReveal() {
      if (this.revealObserver) this.revealObserver.disconnect()
      const els = this.$el.querySelectorAll('.reveal')
      if (this.reduced || !('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('in'))
        return
      }
      this.revealObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            this.revealObserver.unobserve(en.target)
          }
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
      els.forEach(el => this.revealObserver.observe(el))
    },
    startClock() {
      const pad2 = n => (n < 10 ? '0' + n : String(n))
      const parse = str => {
        const p = str.split('-')
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]))
      }
      const upcoming = now => {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const list = []
        LOCAL_HOLIDAYS.forEach(h => h.dates.forEach(d => {
          const dt = parse(d)
          if (dt >= today) list.push({ name: h.name, date: dt })
        }))
        list.sort((a, b) => a.date - b.date)
        return list
      }
      const update = () => {
        const now = new Date()
        this.clockText = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate())
          + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds())
        if (!this.chosenHoliday || now - this.holidayPickedAt > 10000) {
          const pool = upcoming(now).slice(0, 3)
          this.chosenHoliday = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
          this.holidayPickedAt = now
        }
        if (!this.chosenHoliday) {
          this.holidayText = ''
          return
        }
        const diff = this.chosenHoliday.date - now
        if (diff <= 0) {
          this.holidayText = formatText(this.content.home.holiday.today, { name: this.chosenHoliday.name })
          this.holidayToday = true
        } else {
          const days = Math.floor(diff / 86400000)
          const hours = Math.floor((diff % 86400000) / 3600000)
          const mins = Math.floor((diff % 3600000) / 60000)
          const secs = Math.floor((diff % 60000) / 1000)
          this.holidayText = formatText(this.content.home.holiday.countdown, {
            name: this.chosenHoliday.name,
            d: days,
            h: pad2(hours),
            m: pad2(mins),
            s: pad2(secs)
          })
          this.holidayToday = false
        }
      }
      update()
      this.clockTimer = setInterval(update, 1000)
    }
  }
}
</script>

<style scoped>
.home-page { position: relative; }

/* 首屏 */
.portal {
  position: relative;
  min-height: 78vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 90px 0 70px;
  background:
    radial-gradient(ellipse 55% 60% at 30% 50%, rgba(37, 99, 235, .075), transparent 68%),
    radial-gradient(ellipse 42% 46% at 62% 80%, rgba(6, 182, 212, .065), transparent 70%),
    linear-gradient(180deg, var(--bg) 0%, var(--surface) 52%, var(--bg) 100%);
}
.portal-hero { min-height: 100vh; padding: 120px 0 80px; }
.portal-photo {
  position: absolute;
  top: 21%;
  left: 5%;
  width: 58%;
  height: 78%;
  z-index: 0;
  background-size: cover;
  background-position: center;
  opacity: .60;
  filter: saturate(1.08);
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse 46% 46% at 50% 50%, #000 0%, #000 62%, transparent 100%);
  mask-image: radial-gradient(ellipse 46% 46% at 50% 50%, #000 0%, #000 62%, transparent 100%);
}
.theme-dark .portal-photo { opacity: .52; }
.portal-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
.portal-in {
  position: relative;
  z-index: 1;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr .9fr;
  align-items: center;
  gap: 30px;
}
.portal-copy { grid-column: 2; max-width: 520px; justify-self: end; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
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
  animation: homePulse 2.4s infinite;
  flex-shrink: 0;
}
@keyframes homePulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.eyebrow .sep { opacity: .4; }
.eyebrow .today { color: #A5F3FC; font-weight: 800; }
.portal-copy h1 {
  font-size: clamp(38px, 4.6vw, 56px);
  line-height: 1.08;
  letter-spacing: -.045em;
  font-weight: 800;
  margin: 20px 0 16px;
  color: var(--text);
}
.portal-copy p { font-size: 14.5px; color: var(--text-2); line-height: 1.85; max-width: 440px; }
.hero-actions { display: flex; gap: 10px; margin-top: 26px; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: all .2s var(--ease);
}
.btn-primary { background: var(--grad); color: #fff; box-shadow: 0 10px 28px var(--glow); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 34px var(--glow); }
.btn-ghost { border: 1px solid var(--border); background: var(--surface); color: var(--text); }
.btn-ghost:hover { border-color: var(--brand); color: var(--brand); }
.portal-meta {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: .1em;
  flex-wrap: wrap;
}
.portal-meta span { display: inline-flex; align-items: center; gap: 6px; }
.portal-meta i { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
.portal-meta b { color: var(--text); font-weight: 700; }
.mono-caption { margin-top: 28px; font-family: var(--font-mono); font-size: 10px; letter-spacing: .14em; color: var(--text-3); }

/* 通用区块 */
.section { max-width: var(--maxw); margin: 0 auto; padding: 96px 24px; position: relative; }
#featured::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 300px;
  background: linear-gradient(to bottom, var(--grad-soft), transparent);
  pointer-events: none;
  z-index: 0;
  opacity: .75;
}
#featured > * { position: relative; z-index: 1; }
#featured { padding-bottom: 52px; }
#latest { padding-top: 32px; }
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}
.section-head h2 { font-size: clamp(24px, 3vw, 34px); letter-spacing: -.03em; font-weight: 800; color: var(--text); }
.section-head h2::after {
  content: "";
  display: block;
  width: 42px;
  height: 2px;
  border-radius: 2px;
  background: var(--grad);
  margin-top: 9px;
}
.section-head p { font-size: 13.5px; color: var(--text-3); margin-top: 6px; }
.section-head > a { font-size: 13.5px; color: var(--brand); font-weight: 650; text-decoration: none; }

/* 精选 */
.feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.feature-card {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  transition: transform .3s var(--ease), box-shadow .3s var(--ease);
}
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 30px 70px rgba(15, 23, 42, .14); }
.feature-visual {
  position: relative;
  height: 240px;
  overflow: hidden;
  background: radial-gradient(ellipse 60% 70% at 50% 45%, rgba(37, 99, 235, .07), transparent 72%);
}
.feature-body { padding: 26px 28px 30px; display: flex; flex-direction: column; flex: 1; }
.feature-article {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  margin-top: 0;
  padding-top: 0;
}
.feature-cover {
  display: block;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0;
  background: var(--grad-soft);
}
.feature-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--ease); }
.feature-card:hover .feature-cover img { transform: scale(1.035); }
.cover-placeholder { display: block; width: 100%; height: 100%; background: var(--grad-soft); }
.feature-article .meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
}
.feature-article .cat { color: var(--accent); font-weight: 600; }
.feature-article h4 { font-size: 17px; line-height: 1.45; font-weight: 750; letter-spacing: -.015em; margin: 8px 0; }
.feature-article h4 a { color: var(--text); text-decoration: none; }
.feature-article h4 a:hover { color: var(--brand); }
.feature-article p {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.72;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.feature-article .more { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 13px; font-weight: 650; color: var(--brand); text-decoration: none; }

/* 最新文章 */
.post-list { display: flex; flex-direction: column; border-top: 1px solid var(--border); }
.post-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 128px 26px;
  gap: 22px;
  align-items: center;
  padding: 16px 10px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: background .25s var(--ease), padding-left .25s var(--ease);
}
.post-row:hover { background: var(--grad-soft); padding-left: 18px; }
.post-idx { font-family: var(--font-mono); font-size: 12px; color: var(--text-3); letter-spacing: .08em; }
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
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -.02em;
  line-height: 1.35;
  margin: 5px 0 3px;
  color: var(--text);
  transition: color .2s var(--ease);
}
.post-row:hover .post-main h3 { color: var(--brand); }
.post-main p {
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.post-thumb { aspect-ratio: 16/10; border-radius: 10px; overflow: hidden; background: var(--grad-soft); }
.post-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s var(--ease); }
.post-row:hover .post-thumb img { transform: scale(1.06); }
.post-arrow { font-size: 16px; color: var(--text-3); transition: all .2s var(--ease); }
.post-row:hover .post-arrow { color: var(--brand); transform: translate(3px, -3px); }

/* 分类 */
.topics { display: flex; flex-direction: column; gap: 0; }
.topic {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 80px 24px;
  gap: 20px;
  align-items: center;
  padding: 24px 12px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  transition: all .2s var(--ease);
}
.topic:first-child { border-top: 1px solid var(--border); }
.topic:hover { padding-left: 20px; background: var(--grad-soft); }
.topic .idx { font-family: var(--font-mono); font-size: 12px; color: var(--text-3); }
.topic h3 { font-size: 18px; font-weight: 750; letter-spacing: -.02em; color: var(--text); }
.topic p { font-size: 12.5px; color: var(--text-3); font-family: var(--font-mono); margin-top: 2px; }
.topic .count { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-3); text-align: right; }
.topic .arrow { color: var(--text-3); transition: all .2s var(--ease); }
.topic:hover .arrow { color: var(--brand); transform: translateX(4px); }

/* 出现动画 */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
.reveal.in { opacity: 1; transform: none; }
.home-empty { text-align: center; padding: 80px 20px; color: var(--text-3); font-size: 13.5px; }

@media (max-width: 900px) {
  .portal-photo {
    top: 4%;
    left: 4%;
    width: 92%;
    height: 52%;
    opacity: .48;
    background-size: cover;
    background-position: center;
    -webkit-mask-image: radial-gradient(ellipse 46% 46% at 50% 50%, #000 0%, #000 62%, transparent 100%);
    mask-image: radial-gradient(ellipse 46% 46% at 50% 50%, #000 0%, #000 62%, transparent 100%);
  }
  .theme-dark .portal-photo { opacity: .42; }
  .portal, .portal-hero { min-height: auto; padding: 30px 0 56px; }
  .portal-hero { padding-top: 120px; }
  .portal-in { display: flex; flex-direction: column; justify-content: flex-end; min-height: 64vh; padding-top: 42vh; }
  .portal-hero .portal-in { min-height: 88vh; padding-top: 56vh; }
  .portal-copy { max-width: none; width: 100%; }
  .feature-grid { grid-template-columns: 1fr; }
  .feature-visual { height: 260px; }
}
@media (max-width: 640px) {
  .portal-hero { padding-top: 100px; }
  .portal { padding: 30px 0 50px; }
  .portal-copy h1 { font-size: clamp(28px, 8.6vw, 36px); }
  .portal-copy p { font-size: 14px; }
  .post-row { grid-template-columns: 36px minmax(0, 1fr) 84px; gap: 12px; padding: 14px 4px; }
  .post-main p { display: none; }
  .post-arrow { display: none; }
  .topic { grid-template-columns: 40px minmax(0, 1fr) 20px; gap: 12px; }
  .topic .count { display: none; }
  .feature-article { grid-template-columns: 1fr; }
  .feature-visual { height: 220px; }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; }
}
</style>
