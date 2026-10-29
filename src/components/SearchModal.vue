<template>
  <div class="so" role="dialog" aria-modal="true" :aria-label="content.search.title">
    <div class="so-backdrop" @click="close"></div>
    <div class="so-panel" @click.stop>
      <div class="so-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m20 20-3.5-3.5"></path>
        </svg>
        <input
          ref="input"
          v-model="query"
          type="search"
          :placeholder="content.search.placeholder"
          autocomplete="off"
          @input="onInput"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="openActive"
          @keydown.esc.prevent="close">
        <button class="so-close" type="button" :aria-label="content.common.close" @click="close">ESC</button>
      </div>

      <div class="so-body">
        <div class="so-label">{{ resultLabel }}</div>
        <button
          v-for="(item, i) in results"
          :key="item.id"
          ref="hits"
          type="button"
          class="so-hit"
          :class="{ active: i === activeIndex }"
          @mouseenter="activeIndex = i"
          @click="goTo(item)">
          <span class="so-hit-cat">{{ categoryOf(item) }}</span>
          <span class="so-hit-main">
            <b>{{ item.title }}</b>
            <small>{{ summaryOf(item) }}</small>
          </span>
          <span class="so-hit-meta">{{ dateOf(item) }}</span>
        </button>
        <div v-if="!results.length && !searching" class="so-empty">
          <b>{{ emptyTitle }}</b>
          <span>{{ emptyHint }}</span>
        </div>
        <div v-if="searching" class="so-empty">
          <span>{{ content.common.loading }}</span>
        </div>
      </div>

      <div class="so-foot">
        <span>{{ content.search.title }}</span>
        <span>{{ content.search.hint }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getArticles, searchArticles } from '../api/blog'
import { cleanHtml } from '../utils/helpers'

function cleanText(html, max) {
  const text = cleanHtml(html || '')
  return max && text.length > max ? text.slice(0, max) + '…' : text
}

export default {
  name: 'SearchModal',
  data() {
    return {
      query: '',
      results: [],
      searching: false,
      recent: [],
      activeIndex: -1,
      timer: null,
      requestId: 0
    }
  },
  computed: {
    ...mapState(['content']),
    resultLabel() {
      if (this.query.trim()) {
        return this.content.search.results + (this.results.length ? ' · ' + this.results.length : '')
      }
      return this.content.search.recent
    },
    emptyTitle() {
      return this.query.trim() ? this.content.search.empty : this.content.common.empty
    },
    emptyHint() {
      return this.query.trim() ? this.content.search.emptyHint : this.content.search.placeholder
    }
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', this.onKeydown)
    this.$nextTick(() => {
      if (this.$refs.input) this.$refs.input.focus()
    })
    this.loadRecent()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    document.removeEventListener('keydown', this.onKeydown)
    document.body.style.overflow = ''
  },
  methods: {
    async loadRecent() {
      try {
        const res = await getArticles(0, 5)
        const data = res.data
        const list = Array.isArray(data) ? data : (data.content || data.records || data.data || [])
        this.recent = list
        if (!this.query.trim()) this.results = list
      } catch (e) {
        this.recent = []
      }
    },
    onInput() {
      clearTimeout(this.timer)
      const q = this.query.trim()
      if (!q) {
        this.searching = false
        this.requestId++
        this.results = this.recent
        this.activeIndex = -1
        return
      }
      this.searching = true
      this.timer = setTimeout(() => this.doSearch(q), 280)
    },
    async doSearch(q) {
      const id = ++this.requestId
      try {
        const res = await searchArticles(q, 0, 8)
        if (id !== this.requestId) return
        const data = res.data
        this.results = Array.isArray(data) ? data : (data.content || data.records || data.data || [])
        this.activeIndex = this.results.length ? 0 : -1
      } catch (e) {
        if (id !== this.requestId) return
        this.results = []
        this.activeIndex = -1
      } finally {
        if (id === this.requestId) this.searching = false
      }
    },
    move(delta) {
      if (!this.results.length) return
      const len = this.results.length
      this.activeIndex = (this.activeIndex + delta + len) % len
      this.$nextTick(() => {
        const hits = this.$refs.hits || []
        const el = hits[this.activeIndex]
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
      })
    },
    openActive() {
      if (!this.results.length) return
      const index = this.activeIndex >= 0 ? this.activeIndex : 0
      this.goTo(this.results[index])
    },
    goTo(item) {
      if (!item || !item.id) return
      this.$router.push('/article/' + item.id).catch(() => {})
      this.close()
    },
    close() {
      this.$emit('close')
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.close()
    },
    categoryOf(item) {
      return item.categoryName || (item.category && item.category.name) || this.content.common.post
    },
    summaryOf(item) {
      return cleanText(item.summary || item.content || '', 88)
    },
    dateOf(item) {
      return item.createTime ? String(item.createTime).slice(0, 10) : ''
    }
  }
}
</script>

<style scoped>
.so {
  position: fixed;
  inset: 0;
  z-index: 400;
  padding: 10vh 20px 20px;
  overflow: auto;
}
.so-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 8, 16, .55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.so-panel {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, .35);
  overflow: hidden;
  animation: soIn .22s var(--ease);
}
@keyframes soIn {
  from { opacity: 0; transform: translateY(-8px) scale(.99); }
  to { opacity: 1; transform: none; }
}
.so-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}
.so-bar svg { color: var(--text-3); flex-shrink: 0; }
.so-bar input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 15.5px;
  color: var(--text);
  font-family: inherit;
}
.so-bar input::placeholder { color: var(--text-3); }
.so-close {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  border: 1px solid var(--border);
  background: none;
  padding: 3px 7px;
  border-radius: 6px;
  letter-spacing: .06em;
  transition: all .15s var(--ease);
}
.so-close:hover { color: var(--brand); border-color: var(--brand); }
.so-body {
  max-height: 56vh;
  overflow: auto;
  padding: 8px;
}
.so-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: .14em;
  padding: 10px 12px 6px;
}
.so-hit {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: none;
  color: inherit;
  text-align: left;
  font: inherit;
  transition: background .15s var(--ease);
}
.so-hit:hover,
.so-hit.active { background: var(--grad-soft); }
.so-hit-cat {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.so-hit-main { min-width: 0; }
.so-hit-main b {
  display: block;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.so-hit-main small {
  display: block;
  font-size: 11.5px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.so-hit-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  white-space: nowrap;
}
.so-empty {
  text-align: center;
  padding: 46px 20px;
  color: var(--text-3);
  font-size: 13px;
}
.so-empty b {
  display: block;
  color: var(--text);
  font-size: 14px;
  margin-bottom: 4px;
}
.so-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: .06em;
}
@media (max-width: 640px) {
  .so { padding: 76px 12px 12px; }
  .so-hit { grid-template-columns: auto minmax(0, 1fr); gap: 10px; }
  .so-hit-meta { display: none; }
  .so-close { display: none; }
  .so-foot { font-size: 9px; }
}
</style>
