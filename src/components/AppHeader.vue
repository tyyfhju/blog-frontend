<template>
  <header class="site-top">
    <div class="site-top-in site-glass">
      <router-link class="site-logo" to="/">{{ siteInfo.title || 'tyyfhju' }}<b>.</b></router-link>

      <nav class="site-nav">
        <router-link
          v-for="item in navList"
          :key="item.path"
          :to="item.path"
          class="site-nav-link"
          :class="{ on: isActive(item.path) }">
          {{ item.label }}
        </router-link>
      </nav>

      <div class="site-top-right">
        <button class="site-icon-btn" type="button" :title="content.common.search" :aria-label="content.common.search" @click="openSearch">⌕</button>
        <button class="site-icon-btn" type="button" :title="theme === 'dark' ? content.common.lightMode : content.common.darkMode" @click="toggleTheme">
          {{ theme === 'dark' ? '☀' : '☾' }}
        </button>

        <button v-if="!isLoggedIn" class="site-login" type="button" @click="openAuth">{{ content.common.login }}</button>
        <div v-else class="site-user">
          <img v-if="userAvatar" :src="userAvatar" class="site-avatar" alt="user" @click.stop="showUserMenu = !showUserMenu">
          <span v-else class="site-avatar site-avatar-ph" @click.stop="showUserMenu = !showUserMenu">{{ userInitial }}</span>
          <div v-if="showUserMenu" class="site-user-menu site-glass" @click.stop>
            <router-link v-if="isAdmin" to="/cpanel">{{ content.common.admin }}</router-link>
            <router-link v-else to="/user/profile">{{ content.common.profile }}</router-link>
            <a href="javascript:void(0)" @click="logout">{{ content.common.logout }}</a>
          </div>
        </div>

        <button class="site-menu-btn" type="button" :aria-label="content.common.menu" @click="mobileOpen = !mobileOpen">☰</button>
      </div>
    </div>

    <div v-if="mobileOpen" class="site-mobile site-glass">
      <router-link
        v-for="item in navList"
        :key="item.path"
        :to="item.path"
        :class="{ on: isActive(item.path) }"
        @click.native="mobileOpen = false">
        {{ item.label }}
      </router-link>
      <button v-if="!isLoggedIn" type="button" @click="mobileOpen = false; openAuth()">{{ content.common.login }}</button>
    </div>
  </header>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AppHeader',
  data() {
    return {
      showUserMenu: false,
      mobileOpen: false
    }
  },
  computed: {
    ...mapState(['siteInfo', 'theme', 'content']),
    ...mapGetters(['isLoggedIn', 'isAdmin', 'userAvatar']),
    userInitial() {
      const user = this.$store.state.auth.user || {}
      return String(user.nickname || user.username || user.email || 'U').charAt(0)
    },
    navList() {
      const n = this.content.nav
      return [
        { path: '/', label: n.home },
        { path: '/articles', label: n.articles },
        { path: '/archive', label: n.archive },
        { path: '/category', label: n.categories },
        { path: '/photos', label: n.photos },
        { path: '/about', label: n.about }
      ]
    }
  },
  watch: {
    $route() {
      this.mobileOpen = false
      this.showUserMenu = false
    }
  },
  mounted() {
    document.addEventListener('click', this.onDocClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick)
  },
  methods: {
    onDocClick(e) {
      if (!this.$el.contains(e.target)) this.showUserMenu = false
    },
    isActive(path) {
      if (path === '/') return this.$route.path === '/'
      if (path === '/articles') {
        return this.$route.path === '/articles' || this.$route.path.startsWith('/article/')
      }
      return this.$route.path.startsWith(path)
    },
    openSearch() {
      this.$root.$emit('open-search')
    },
    openAuth() {
      this.$root.$emit('open-auth', 'login')
    },
    toggleTheme() {
      this.$store.dispatch('toggleTheme')
    },
    logout() {
      this.$store.dispatch('logout')
      this.showUserMenu = false
      this.$message.success(this.content.common.logoutSuccess)
      if (this.$route.path !== '/') this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.site-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 14px 0;
}
.site-top-in {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 22px;
  display: flex;
  align-items: center;
  gap: 26px;
  height: 52px;
  border-radius: 999px;
}
.site-logo {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--text);
  text-decoration: none;
  white-space: nowrap;
}
.site-logo b { color: var(--brand); }
.site-nav {
  display: flex;
  gap: 4px;
  font-size: 13.5px;
}
.site-nav-link {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--text-2);
  text-decoration: none;
  transition: all .15s var(--ease);
}
.site-nav-link:hover { color: var(--text); background: var(--grad-soft); }
.site-nav-link.on { color: var(--brand); background: var(--grad-soft); font-weight: 600; }
.site-top-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.site-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: var(--text-2);
  font-size: 15px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all .15s var(--ease);
}
.site-icon-btn:hover { color: var(--brand); background: var(--grad-soft); }
.site-login {
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-2);
  white-space: nowrap;
  cursor: pointer;
  transition: all .15s var(--ease);
}
.site-login:hover { border-color: var(--brand); color: var(--brand); background: var(--grad-soft); }
.site-user { position: relative; }
.site-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  background: var(--grad-soft);
}
.site-avatar-ph {
  display: grid;
  place-items: center;
  background: var(--grad);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  user-select: none;
}
.site-user-menu {
  position: absolute;
  right: 0;
  top: 44px;
  min-width: 140px;
  padding: 6px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
}
.site-user-menu a {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  color: var(--text-2);
  text-decoration: none;
}
.site-user-menu a:hover { color: var(--brand); background: var(--grad-soft); }
.site-menu-btn {
  display: none;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: none;
  color: var(--text-2);
  font-size: 17px;
  cursor: pointer;
}
.site-mobile {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: var(--maxw);
  padding: 10px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.site-mobile a,
.site-mobile button {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  color: var(--text-2);
  text-align: left;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
}
.site-mobile a.on { color: var(--brand); background: var(--grad-soft); font-weight: 600; }
.site-mobile a:hover,
.site-mobile button:hover { background: var(--grad-soft); }

@media (max-width: 900px) {
  .site-nav { display: none; }
  .site-menu-btn { display: grid; place-items: center; }
}
@media (max-width: 520px) {
  .site-top-in { padding: 0 16px; gap: 12px; }
  .site-logo { font-size: 15px; }
  .site-login { padding: 5px 10px; font-size: 12px; }
}
</style>
