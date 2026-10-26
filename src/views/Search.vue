<template>
  <div class="search-page">
    <!-- Banner -->
    <div class="search-banner">
      <div class="search-banner-overlay"></div>
      <div class="search-banner-content">
        <h1 class="search-title">搜索文章</h1>
        <div class="search-box">
          <el-input
            v-model="keyword"
            placeholder="输入关键词搜索..."
            size="large"
            clearable
            @keyup.enter.native="doSearch"
            class="search-input">
            <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
          </el-input>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="search-results">
      <div v-if="loading" class="loading-area">
        <el-card v-for="i in 3" :key="i" class="article-card" style="margin-bottom: 1rem">
          <el-skeleton :rows="3" animated />
        </el-card>
      </div>

      <template v-else-if="articles.length > 0">
        <div class="search-info">
          找到 <strong>{{ total }}</strong> 篇关于 "<em>{{ searchedKeyword }}</em>" 的文章
        </div>

        <el-card
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          shadow="hover"
          @click.native="$router.push('/article/' + article.id)">
          <div class="card-layout">
            <div class="card-cover" v-if="article.coverUrl">
              <el-image :src="article.coverUrl" fit="cover" lazy>
                <div slot="placeholder" class="image-placeholder">
                  <i class="el-icon-loading"></i>
                </div>
              </el-image>
            </div>
            <div class="card-body" :class="{ 'no-cover': !article.coverUrl }">
              <div class="card-meta">
                <el-tag size="mini" type="primary" effect="plain" v-if="article.categoryName">
                  {{ article.categoryName }}
                </el-tag>
                <span class="card-date">{{ article.createTime?.slice(0, 10) }}</span>
              </div>
              <h3 class="card-title" v-html="highlight(article.title)"></h3>
              <p class="card-summary" v-if="article.summary" v-html="highlight(article.summary)"></p>
              <p class="card-summary" v-else>{{ cleanHtml(article.content, 150) }}</p>
              <div class="card-footer">
                <div class="card-tags" v-if="article.tagNames && article.tagNames.length">
                  <el-tag
                    v-for="tag in article.tagNames"
                    :key="tag"
                    size="mini"
                    effect="plain"
                    type="info"
                    class="card-tag-item">
                    #{{ tag }}
                  </el-tag>
                </div>
                <div class="card-stats">
                  <span><i class="el-icon-view"></i> {{ article.viewCount || 0 }}</span>
                  <span><i class="el-icon-chat-dot-round"></i> {{ article.commentCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            @current-change="onPageChange">
          </el-pagination>
        </div>
      </template>

      <div v-else-if="searched" class="empty-area">
        <el-empty description="未找到相关文章">
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </el-empty>
      </div>

      <div v-else class="empty-area">
        <el-empty description="输入关键词开始搜索" :image-size="120" />
      </div>
    </div>
  </div>
</template>

<script>
import { searchArticles } from '@/api/blog'
import { cleanHtml } from '@/utils/helpers'

export default {
  name: 'Search',
  data() {
    return {
      keyword: '',
      searchedKeyword: '',
      articles: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      loading: false,
      searched: false
    }
  },
  watch: {
    '$route.query.q': {
      immediate: true,
      handler(val) {
        if (val) {
          this.keyword = val
          this.searchedKeyword = val
          this.currentPage = 1
          this.doSearch()
        }
      }
    }
  },
  methods: {
    async doSearch() {
      const q = this.keyword.trim()
      if (!q) return

      this.searchedKeyword = q
      this.loading = true
      this.searched = true
      try {
        const res = await searchArticles(q, this.currentPage - 1, this.pageSize)
        const data = res.data
        this.articles = data.content || data.data || data || []
        this.total = data.totalElements || data.total || this.articles.length
        this.$router.replace({ query: { q } }).catch(() => {})
      } catch (e) {
        this.articles = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    onPageChange(page) {
      this.currentPage = page
      this.doSearch()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    highlight(text) {
      if (!text || !this.searchedKeyword) return text
      const escaped = this.searchedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escaped})`, 'gi')
      return text.replace(regex, '<em class="highlight">$1</em>')
    },
    cleanHtml
  }
}
</script>

<style scoped>
.search-page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0;
}

/* ========== Banner ========== */
.search-banner {
  position: relative;
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-gradient);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
  margin-bottom: 2rem;
}
.search-banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
}
.search-banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.search-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 1.25rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.search-box {
  max-width: 520px;
  margin: 0 auto;
}
.search-box >>> .el-input-group__append {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.search-box >>> .el-input-group__append:hover {
  background: rgba(255, 255, 255, 0.35);
}
.search-box >>> .el-input__inner {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.search-box >>> .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.search-box >>> .el-input__inner:focus {
  border-color: rgba(255, 255, 255, 0.6);
}

/* ========== Results ========== */
.search-results {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

.search-info {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-dim);
}
.search-info strong {
  color: var(--text-accent);
}
.search-info em {
  font-style: normal;
  color: var(--text-bright);
}

/* ========== Article Card ========== */
.article-card {
  margin-bottom: 1rem;
  cursor: pointer;
  border-radius: 0.75rem;
  transition: all 0.25s ease;
  border: 1px solid var(--text-faint);
}
.article-card:hover {
  transform: translateY(-2px);
}
.article-card >>> .el-card__body {
  padding: 0;
}

.card-layout {
  display: flex;
  min-height: 160px;
}

.card-cover {
  width: 240px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 0.75rem 0 0 0.75rem;
}
.card-cover .el-image {
  width: 100%;
  height: 100%;
  min-height: 160px;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-secondary);
  font-size: 1.5rem;
  color: var(--text-dim);
}

.card-body {
  flex: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-body.no-cover {
  padding: 1.5rem 1.75rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.card-date {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-bright);
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
}

.card-summary {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0 0 0.75rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.card-tag-item {
  cursor: default;
}

.card-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-left: auto;
}
.card-stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Highlight */
.highlight {
  font-style: normal;
  color: var(--text-accent);
  background: var(--bg-accent-15);
  border-radius: 2px;
  padding: 0 2px;
}

/* ========== Pagination ========== */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* ========== Empty ========== */
.empty-area {
  padding: 3rem 0;
}
.loading-area {
  padding: 0;
}

@media (max-width: 640px) {
  .search-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .search-title {
    font-size: 1.6rem;
  }
  .search-box {
    max-width: 90vw;
  }
  .search-results {
    padding: 0 1rem 2rem;
  }
  .card-layout {
    flex-direction: column;
  }
  .card-cover {
    width: 100%;
    height: 180px;
    border-radius: 0.75rem 0.75rem 0 0;
  }
  .card-cover .el-image {
    min-height: 180px;
  }
  .card-body {
    padding: 1rem 1.25rem;
  }
  .card-body.no-cover {
    padding: 1.25rem;
  }
}
</style>
