import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/site.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueLazyload)

// 全局 highlight.js 指令 (v11+ API)
Vue.directive('highlight', {
  inserted(el) {
    const blocks = el.querySelectorAll('pre code')
    blocks.forEach(block => {
      hljs.highlightElement(block)
    })
  },
  componentUpdated(el) {
    const blocks = el.querySelectorAll('pre code')
    blocks.forEach(block => {
      hljs.highlightElement(block)
    })
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
