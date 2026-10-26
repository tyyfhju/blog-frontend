<template>
  <div class="tags-page">
    <!-- Banner -->
    <div class="tags-banner">
      <div class="tags-banner-overlay"></div>
      <div class="tags-banner-content">
        <h1 class="tags-banner-title">标签</h1>
        <p class="tags-banner-subtitle">{{ tags.length }} 个标签</p>
      </div>
    </div>

    <!-- 标签卡片网格 -->
    <div class="tags-container">
      <div class="tags-grid" v-if="tags.length">
        <router-link
          v-for="t in tags"
          :key="t.id"
          :to="'/?tagId=' + t.id"
          class="tag-card"
          :style="{ fontSize: getTagSize(t.articleCount || 0) + 'rem' }"
        >
          <div class="tag-icon-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div class="tag-info">
            <h3>{{ t.name }}</h3>
            <span class="tag-count">{{ t.articleCount || 0 }} 篇文章</span>
          </div>
          <div class="tag-arrow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </router-link>
      </div>
      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1.5" opacity="0.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <p>暂无标签</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getTags } from '@/api/blog'

export default {
  name: 'Tags',
  data() {
    return { tags: [] }
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    async loadTags() {
      try {
        const res = await getTags()
        this.tags = (res.data && res.data.data) || res.data || []
      } catch (e) {
        console.error('加载标签失败', e)
      }
    },
    getTagSize(count) {
      if (count >= 10) return 1.1
      if (count >= 5) return 1.0
      if (count >= 2) return 0.95
      return 0.9
    }
  }
}
</script>

<style scoped>
.tags-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.tags-banner {
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
.tags-banner-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.06);
}
.tags-banner-content {
  position: relative; z-index: 2;
  text-align: center; padding: 2rem;
}
.tags-banner-title {
  font-size: 2.5rem; font-weight: 800;
  color: #fff; margin: 0 0 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.tags-banner-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* ========== 标签网格 ========== */
.tags-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}
.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.tag-card {
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
.tag-card:before {
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
.tag-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--accent-shadow);
}
.tag-card:hover:before {
  opacity: 1;
}
.tag-icon-wrapper {
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
.tag-card:hover .tag-icon-wrapper {
  background: var(--main-gradient);
  color: #fff;
}
.tag-info {
  flex: 1;
  min-width: 0;
}
.tag-info h3 {
  margin: 0 0 3px;
  font-size: 1em;
  color: var(--text-bright);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag-count {
  font-size: 0.82em;
  color: var(--text-dim);
}
.tag-arrow {
  color: var(--text-dim);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
  flex-shrink: 0;
}
.tag-card:hover .tag-arrow {
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
  .tags-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .tags-banner-title { font-size: 1.8rem; }
  .tags-container { padding: 0 1rem 2rem; }
}
</style>
