<template>
  <div class="talks-page">
    <!-- Banner -->
    <div class="talks-banner">
      <div class="talks-banner-overlay"></div>
      <div class="talks-banner-content">
        <h1 class="talks-banner-title">说说</h1>
        <p class="talks-banner-subtitle">Moments</p>
      </div>
    </div>

    <div class="talks-container">
      <div class="talks-timeline">
        <div
          v-for="(talk, idx) in talks"
          :key="talk.id"
          class="talk-item"
          :class="{ 'talk-item--left': idx % 2 === 0, 'talk-item--right': idx % 2 !== 0 }"
        >
          <div class="talk-card">
            <div class="talk-time">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ talk.createTime?.slice(0, 10) }}</span>
              <span v-if="talk.createTime">{{ talk.createTime.slice(11, 16) }}</span>
            </div>
            <div v-if="talk.images && talk.images.length" class="talk-images">
              <img v-for="(img, i) in talk.images" :key="i" :src="img" loading="lazy" @click="previewImage = img" class="talk-img" />
            </div>
            <div class="talk-content" v-html="talk.content"></div>
          </div>
          <div class="talk-dot"></div>
        </div>

        <div v-if="!talks.length && !loading" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>还没有说说哦~</p>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="el-icon-loading" style="font-size:28px;color:var(--text-accent)"></i>
          <span>加载中...</span>
        </div>
      </div>

      <div v-if="previewImage" class="lightbox" @click="previewImage = null">
        <img :src="previewImage" alt="preview" />
      </div>

      <div class="pagination-wrap" v-if="totalPages > 1">
        <el-pagination background layout="prev, pager, next"
          :total="totalElements" :page-size="size"
          :current-page.sync="page" @current-change="toPage" />
      </div>
    </div>
  </div>
</template>

<script>
import { getTalks } from '../api/blog'

export default {
  name: 'Talks',
  data() {
    return {
      talks: [], page: 1, size: 10, totalPages: 0,
      totalElements: 0, loading: true, previewImage: null
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await getTalks(this.page - 1, this.size)
        this.talks = (res.data.content || res.data || []).map((t, i) => ({ ...t, index: i }))
        this.totalPages = res.data.totalPages || 0
        this.totalElements = res.data.totalElements || 0
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    toPage(p) { this.page = p; this.load(); window.scrollTo({ top: 400, behavior: 'smooth' }) }
  }
}
</script>

<style scoped>
.talks-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.talks-banner {
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
.talks-banner-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.06);
}
.talks-banner-content {
  position: relative; z-index: 2;
  text-align: center; padding: 2rem;
}
.talks-banner-title {
  font-size: 2.5rem; font-weight: 800;
  color: #fff; margin: 0 0 0.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.talks-banner-subtitle {
  font-size: 0.9rem; color: rgba(255,255,255,0.75);
  margin: 0; text-transform: uppercase; letter-spacing: 3px;
}

/* ========== Content ========== */
.talks-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 0 2rem 3rem;
}
.talks-timeline {
  position: relative;
  padding: 1rem 0;
}
.talk-item {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-start;
}
.talk-item--right {
  justify-content: flex-end;
}
.talk-card {
  width: 45%;
  background: var(--background-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--accent-shadow);
  position: relative;
}
.talk-dot {
  position: absolute;
  left: 50%;
  top: 1.5rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--main-gradient);
  transform: translateX(-50%);
  border: 3px solid var(--background-primary);
}
.talk-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 1rem;
}
.talk-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform .2s;
}
.talk-img:hover { transform: scale(1.05); }
.talk-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .75rem;
  color: var(--text-dim);
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--background-trans);
}
.talk-content {
  font-size: .95rem;
  line-height: 1.7;
  color: var(--text-normal);
}
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9);
  z-index: 999; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 4px; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-dim); }
.pagination-wrap { margin-top: 2rem; display: flex; justify-content: center; }

@media (max-width: 768px) {
  .talks-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .talks-banner-title { font-size: 1.8rem; }
  .talks-container { padding: 0 1rem 2rem; }
  .talk-card { width: 100%; }
  .talk-dot { display: none; }
}
</style>
