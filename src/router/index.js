import Vue from 'vue'
import VueRouter from 'vue-router'

// 前台页面
import Home from '../views/Home.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import Archive from '../views/Archive.vue'
import Articles from '../views/Articles.vue'
import Category from '../views/Category.vue'
import Photos from '../views/Photos.vue'
import About from '../views/About.vue'
import UserProfile from '../views/UserProfile.vue'  // 新增
import Search from '../views/Search.vue'
import Message from '../views/Message.vue'

// 后台页面
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import Dashboard from '../views/admin/Dashboard.vue'
import ArticleList from '../views/admin/ArticleList.vue'
import ArticleEdit from '../views/admin/ArticleEdit.vue'
import CategoryList from '../views/admin/CategoryList.vue'
import TagList from '../views/admin/TagList.vue'
import UserList from '../views/admin/UserList.vue'
import BlogSettings from '../views/admin/BlogSettings.vue'
import MessageList from '../views/admin/MessageList.vue'
import CommentList from '../views/admin/CommentList.vue'
Vue.use(VueRouter)

const routes = [
  // 前台路由
  { path: '/', component: Home, name: 'home' },
  { path: '/login', redirect: { path: '/', query: { auth: 'login' } } },
  { path: '/register', redirect: { path: '/', query: { auth: 'register' } } },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/article/:id', component: ArticleDetail, props: true },
  { path: '/articles', component: Articles, name: 'articles' },
  { path: '/archive', component: Archive },
  { path: '/category/:id?', component: Category, props: true },
  { path: '/photos', component: Photos },
  { path: '/about', component: About },
  { path: '/search', component: Search, name: 'search' },
  { path: '/message', component: Message },
  // 用户中心（需登录）
  { path: '/user/profile', component: UserProfile, meta: { requiresAuth: true } },

  // 管理员登录页
  { path: '/secret-login', component: AdminLogin },
  // 后台管理（需管理员权限）
  {
    path: '/cpanel',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', component: Dashboard },
      { path: 'articles', component: ArticleList },
      { path: 'articles/new', component: ArticleEdit, props: { id: null } },
      { path: 'articles/:id/edit', component: ArticleEdit, props: true },
      { path: 'categories', component: CategoryList },
      { path: 'tags', component: TagList },
      { path: 'users', component: UserList },
      { path: 'settings', component: BlogSettings },
      { path: 'photos', component: () => import('../views/admin/PhotoManagement.vue'), name: 'adminPhotos' },
      { path: 'messages', component: MessageList },
      { path: 'comments', component: CommentList },
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 需要登录权限的路由（用户中心等）
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
  // 需要管理员权限的路由（后台管理）
  else if (to.matched.some(record => record.meta.requiresAdmin)) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      next('/secret-login')
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'admin') {
          localStorage.removeItem('adminToken')
          next('/secret-login')
        } else {
          next()
        }
      } catch (e) {
        localStorage.removeItem('adminToken')
        next('/secret-login')
      }
    }
  }
  // 公开页面直接放行
  else {
    next()
  }
})

// SEO: 动态更新页面标题
const titleMap = {
  '/': '首页',
  '/articles': '文章',
  '/archive': '归档',
  '/category': '分类',
  '/photos': '相册',
  '/about': '关于',
  '/search': '搜索',
  '/message': '留言',
  '/login': '登录',
  '/register': '注册',
  '/forgot-password': '忘记密码',
  '/user/profile': '个人中心'
}
router.afterEach((to) => {
  const baseTitle = 'tyyfhju的博客'
  const pageName = titleMap[to.path] || ''
  document.title = pageName ? pageName + ' - ' + baseTitle : baseTitle
})

export default router