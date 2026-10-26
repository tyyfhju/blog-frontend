<template>
  <div id="search-modal" @click.self="$emit('close')">
    <div class="search-container" @click.stop>
      <div class="search-form">
        <input ref="input" v-model="query" class="search-input" placeholder="Type something..." @keyup.enter="search" @keydown.esc="$emit('close')" />
        <button class="search-btn" @click="search">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
      <div class="search-dropdown">
        <div v-if="results.length" class="search-hit-label">搜索结果</div>
        <div v-for="item in results" :key="item.id" class="search-hit" @click="goTo(item.id)">
          <a href="javascript:void(0)" :class="{ active: false }">
            <div class="search-hit-container">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="search-hit-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <div class="search-hit-content-wrapper">
                <div class="search-hit-title">{{ item.title }}</div>
                <div class="search-hit-path">{{ item.categoryName || '' }}</div>
              </div>
            </div>
          </a>
        </div>
        <div v-if="query && !results.length && !loading" class="search-startscreen">
          <p>没有找到相关文章</p>
        </div>
        <div v-if="!query" class="search-startscreen">
          <p>输入关键词搜索文章...</p>
        </div>
      </div>
      <div class="search-footer">
        <div class="search-logo">
          <span class="search-label">搜索文章</span>
        </div>
        <ul class="search-commands">
          <li><span class="search-commands-key">ESC</span><span class="search-commands-label">关闭</span></li>
          <li><span class="search-commands-key">↵</span><span class="search-commands-label">搜索</span></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getArticles } from '../api/blog'

export default {
  name: 'SearchModal',
  data() {
    return { query: '', results: [], loading: false }
  },
  mounted() {
    this.$nextTick(() => this.$refs.input?.focus())
  },
  methods: {
    async search() {
      if (!this.query.trim()) return
      this.loading = true
      try {
        const res = await getArticles(0, 10)
        const list = res.data.content || res.data.records || res.data || []
        const q = this.query.toLowerCase()
        this.results = list.filter(a => a.title?.toLowerCase().includes(q) || (a.content || '').replace(/<[^>]+>/g, '').toLowerCase().includes(q))
      } catch (e) {
        this.results = []
      } finally {
        this.loading = false
      }
    },
    goTo(id) {
      this.$router.push('/article/' + id)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
#search-modal {
  z-index: 250;
  background-color: rgba(0,0,0,.7);
  width: 100vw;
  height: 100vh;
  transition: background-color .15s;
  position: fixed;
  top: 0;
  left: 0;
}
.search-container {
  background-color: var(--background-primary);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
  max-width: 36rem;
  border-radius: 1rem;
  margin: 4rem auto auto;
  position: relative;
}
.search-form {
  border-width: 2px;
  border-color: var(--text-accent);
  background-color: var(--background-secondary);
  border: 2px solid var(--text-accent);
  box-shadow: none;
  width: 100%;
  height: 3.5rem;
  border-radius: .75rem;
  align-items: center;
  padding: 0 .75rem;
  display: flex;
  position: relative;
}
.search-input {
  appearance: none;
  width: 80%;
  height: 100%;
  color: var(--text-normal);
  outline: none;
  background-color: transparent;
  border-width: 0;
  flex: 1;
  padding-left: .5rem;
  font-size: 1.25rem;
}
.search-input::placeholder { color: var(--text-dim); }
.search-btn {
  cursor: pointer;
  appearance: none;
  color: var(--text-dim);
  background-image: none;
  border-width: 0;
  border-radius: 9999px;
  padding: .125rem;
}
.search-btn:hover { color: var(--text-accent); }
.search-dropdown {
  min-height: 12px;
  max-height: 400px;
  scrollbar-width: thin;
  margin-top: .5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  overflow-y: auto;
}
.search-hit-label {
  z-index: 10;
  background-color: var(--background-primary);
  color: var(--text-accent);
  padding: .5rem .25rem;
  font-size: .875rem;
  font-weight: 600;
  position: sticky;
  top: 0;
}
.search-hit {
  border-radius: .25rem;
  padding-bottom: .5rem;
  display: flex;
  position: relative;
  cursor: pointer;
}
.search-hit a {
  box-sizing: border-box;
  border: 1px solid var(--text-faint);
  background-color: var(--background-secondary);
  box-shadow: none;
  width: 100%;
  border-radius: .5rem;
  padding-left: .75rem;
  display: block;
  text-decoration: none;
  transition: border-color .15s;
}
.search-hit a:hover { border-color: var(--text-accent); }
.search-hit-container {
  height: 3.5rem;
  color: var(--text-normal);
  align-items: center;
  padding-right: .75rem;
  display: flex;
}
.search-hit-icon { stroke-width: 2px; color: var(--text-dim); }
.search-hit-content-wrapper {
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-direction: column;
  flex: auto;
  justify-content: center;
  width: 80%;
  margin-left: .5rem;
  margin-right: .5rem;
  font-weight: 500;
  display: flex;
  overflow: hidden;
}
.search-hit-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 91.6667%;
  font-size: .875rem;
  overflow: hidden;
}
.search-hit-path { color: var(--text-dim); font-size: .75rem; }
.search-footer {
  user-select: none;
  background-color: var(--background-secondary);
  width: 100%;
  height: 2.75rem;
  border-top: 1px solid var(--text-faint);
  z-index: 300;
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  padding: 0 .75rem;
  display: flex;
}
.search-label { color: var(--text-dim); margin-right: .5rem; font-size: .75rem; }
.search-commands { color: var(--text-dim); margin: 0; padding: 0; list-style: none; display: flex; }
.search-commands li { align-items: center; margin-right: .5rem; display: flex; }
.search-commands-key {
  background: var(--search-modal-key-gradient);
  box-shadow: var(--search-modal-key-shadow);
  border-radius: .125rem;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 18px;
  margin-right: .4em;
  display: flex;
}
.search-commands-label { color: var(--text-dim); }
.search-startscreen {
  text-align: center;
  width: 80%;
  margin: 0 auto;
  padding: 2.25rem 0;
}
.search-startscreen p { color: var(--text-dim); font-size: .875rem; }
</style>
