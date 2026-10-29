import Vue from 'vue'
import Vuex from 'vuex'
import { defaultSiteContent, mergeSiteContent } from '../content/site'

Vue.use(Vuex)

// 初始化 auth 状态从 localStorage 读取
const initUser = () => {
  try {
    const u = localStorage.getItem('user')
    if (u) return JSON.parse(u)
  } catch (e) { /* ignore */ }
  return null
}

export default new Vuex.Store({
  state: {
    theme: localStorage.getItem('tyyfhju-theme') || 'light',
    auth: {
      loggedIn: !!localStorage.getItem('token'),
      user: initUser()
    },
    content: defaultSiteContent,
    siteInfo: {
      title: 'tyyfhju的博客',
      subtitle: '记录技术与生活',
      author: '博主',
      bio: '热爱生活、热爱技术',
      avatar: '',
      articleCount: 0,
      categoryCount: 0,
      tagCount: 0,
      icp: '',
      police: '',
      footerText: '',
      welcomeText: '',
      aboutContent: '',
      githubUrl: '',
      bilibiliUrl: '',
      qqNumber: '',
      email: '',
      wechatId: '',
      homeImageUrl: '',
      defaultUserAvatarUrl: '',
      defaultAdminAvatarUrl: '',
      defaultAvatarUrl: ''
    }
  },
  getters: {
    content: state => state.content,
    isLoggedIn: state => state.auth.loggedIn,
    isAdmin: state => {
      try { return (state.auth.user || {}).role === 'admin' } catch { return false }
    },
    userAvatar: (state, getters, rootState) => {
      try {
        const user = state.auth.user
        if (!user) return rootState.siteInfo.defaultUserAvatarUrl || rootState.siteInfo.avatar || ''
        const fallback = user.role === 'admin'
          ? (rootState.siteInfo.defaultAdminAvatarUrl || rootState.siteInfo.avatar)
          : (rootState.siteInfo.defaultUserAvatarUrl || rootState.siteInfo.avatar)
        return user.avatar || user.avatarUrl || fallback || ''
      } catch { return '' }
    }
  },
  mutations: {
    SET_THEME(state, theme) {
      state.theme = theme
      localStorage.setItem('tyyfhju-theme', theme)
      document.documentElement.className = 'theme-' + theme
    },
    SET_SITE_INFO(state, info) {
      Object.assign(state.siteInfo, info)
    },
    SET_SITE_CONTENT(state, content) {
      state.content = mergeSiteContent(defaultSiteContent, content)
    },
    SET_AUTH(state, { loggedIn, user }) {
      state.auth.loggedIn = loggedIn
      state.auth.user = user || null
    }
  },
  actions: {
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      commit('SET_THEME', newTheme)
    },
    loginSuccess({ commit }, { token, user }) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      // 切换到普通账号时清掉上一个管理员会话，避免后台权限残留
      if (!user || user.role !== 'admin') localStorage.removeItem('adminToken')
      commit('SET_AUTH', { loggedIn: true, user })
    },
    logout({ commit }) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      commit('SET_AUTH', { loggedIn: false, user: null })
    }
  }
})
