<template>
  <div class="header-container">
    <header class="site-header">
      <!-- Logo -->
      <router-link to="/" class="logo-link">
        <img v-if="siteInfo.avatar" :src="siteInfo.avatar" class="logo-image" alt="logo" />
        <span class="logo-text">{{ siteInfo.title || 'tyyfhju的博客' }}</span>
      </router-link>

      <!-- Navigation -->
      <nav class="nav-menu">
        <router-link v-for="item in navList" :key="item.path" :to="item.path"
          class="nav-link" :class="{ active: isActive(item.path) }">
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Controls -->
      <div class="header-controls">
        <!-- Search -->
        <div class="search-wrapper" :class="{ active: showSearchBar }">
          <transition name="search-fade">
            <el-input v-show="showSearchBar" ref="searchInput" v-model="searchKey"
              size="small" placeholder="搜索文章..."
              prefix-icon="el-icon-search"
              clearable
              @keyup.enter.native="doSearch"
              @clear="hideSearch"
              class="search-input">
            </el-input>
          </transition>
          <span v-show="!showSearchBar" @click="toggleSearchBar" class="ctrl-icon" title="搜索">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
        </div>

        <!-- Theme toggle -->
        <span @click="toggleTheme" class="ctrl-icon" title="切换主题">
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </span>

        <!-- User menu -->
        <div v-if="isLoggedIn" class="user-menu" style="position:relative">
          <img :src="userAvatar" class="avatar-img" @click="showUserMenu = !showUserMenu" alt="user" />
          <div v-if="showUserMenu" class="user-dropdown">
            <router-link v-if="isAdmin" to="/cpanel">后台管理</router-link>
            <router-link v-else to="/user/profile">个人中心</router-link>
            <a href="javascript:void(0)" @click="logout">退出登录</a>
          </div>
        </div>
        <router-link v-else to="/login" class="login-link">登录</router-link>
      </div>
    </header>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AppHeader',
  data() {
    return {
      showSearchBar: false,
      searchKey: '',
      showUserMenu: false,
      navList: [
        { path: '/', label: '首页' },
        { path: '/archive', label: '归档' },
        { path: '/category', label: '分类' },
        { path: '/tags', label: '标签' },
        { path: '/photos', label: '相册' },
        { path: '/talks', label: '说说' },
        { path: '/about', label: '关于' }
      ]
    }
  },
  computed: {
    ...mapState(['siteInfo', 'theme']),
    ...mapGetters(['isLoggedIn', 'isAdmin', 'userAvatar'])
  },
  mounted() {
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) this.showUserMenu = false
    })
  },
  methods: {
    isActive(p) {
      if (p === '/') return this.$route.path === '/'
      return this.$route.path.startsWith(p)
    },
    toggleSearchBar() {
      this.showSearchBar = !this.showSearchBar
      if (this.showSearchBar) {
        this.$nextTick(() => {
          const el = this.$refs.searchInput
          if (el) {
            if (typeof el.focus === 'function') {
              el.focus()
            } else if (el.$el) {
              el.$el.querySelector('input')?.focus()
            }
          }
        })
      }
    },
    hideSearch() { setTimeout(() => { if (!this.searchKey) this.showSearchBar = false }, 200) },
    toggleTheme() { this.$store.dispatch('toggleTheme') },
    doSearch() {
      if (!this.searchKey.trim()) {
        this.$root.$emit('open-search')
        return
      }
      this.$router.push({ path: '/search', query: { q: this.searchKey } })
      this.searchKey = ''
      this.showSearchBar = false
    },
    logout() {
      this.$store.dispatch('logout')
      this.showUserMenu = false
      this.$message.success('已退出登录')
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
  }
}
</script>

<style scoped>
.header-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: transparent;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
}
.site-header {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}
.logo-link {
  flex-shrink: 0;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}
.logo-image {
  opacity: 0.05;
  border-radius: 9999px;
  width: 200px;
  max-width: 200px;
  height: 200px;
  position: absolute;
  top: -60px;
  left: -60px;
}
.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  background: var(--main-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

/* Navigation */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  margin-right: auto;
}
.nav-link {
  position: relative;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-weight: 500;
  transition: all .15s;
  z-index: 0;
}
.nav-link:before {
  z-index: -1;
  background-color: var(--background-secondary);
  opacity: 0;
  content: "";
  border-radius: .5rem;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  transition: all .15s;
  position: absolute;
  top: -4px;
  left: -4px;
}
.nav-link:hover { color: #fff; }
.nav-link:hover:before { opacity: .3; background-color: rgba(255,255,255,0.15); }
.nav-link.active {
  color: #fff;
  background: var(--main-gradient);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.nav-link.active:hover { color: #fff; opacity: 1; }
.nav-link.active:before { display: none; }

/* Controls */
.header-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.ctrl-icon {
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  justify-content: center;
  align-items: center;
  padding: 0.35rem;
  transition: opacity .25s;
  display: flex;
}
.ctrl-icon:hover { opacity: .5; }
.ctrl-icon svg { pointer-events: none; width: 2rem; height: 2rem; }

.header-controls .search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.header-controls .search-wrapper .search-input {
  width: 200px;
}
.header-controls .search-wrapper .search-input >>> .el-input__inner {
  background-color: var(--background-primary);
  border-color: rgba(255,255,255,.2);
  color: var(--text-normal);
  border-radius: 20px;
}
.header-controls .search-wrapper .search-input >>> .el-input__inner::placeholder {
  color: var(--text-dim);
}
.header-controls .search-wrapper .search-input >>> .el-input__inner:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(233,55,150,.15);
}
.header-controls .search-wrapper .search-input >>> .el-input__prefix {
  color: var(--text-dim);
}

.search-fade-enter-active { animation: searchFadeIn .25s ease; }
.search-fade-leave-active { animation: searchFadeIn .2s ease reverse; }
@keyframes searchFadeIn {
  from { opacity: 0; transform: translateX(10px) scale(.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

/* Avatar */
.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all .8s cubic-bezier(.4,0,.2,1);
}
.avatar-img:hover { border-color: var(--text-accent); transform: rotate(360deg); }

/* Login button */
.login-link {
  padding: 5px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #fff;
  background: var(--main-gradient);
  text-decoration: none;
  font-weight: 500;
  transition: opacity .2s;
}
.login-link:hover { opacity: .8; }

/* User dropdown */
.user-dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  background: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  padding: 6px 0;
  min-width: 120px;
  z-index: 10;
}
.user-dropdown a {
  display: block;
  padding: 8px 18px;
  font-size: 0.88rem;
  color: var(--text-normal);
  text-decoration: none;
  transition: background .15s;
}
.user-dropdown a:hover { background: var(--background-primary); opacity: 1; }

@media (max-width: 768px) {
  .site-header { padding: 0.75rem 1rem; overflow-x: auto; }
  .nav-link { font-size: 0.8rem; padding: 4px 8px; white-space: nowrap; }
}
</style>