<template>
  <div id="app" :class="themeClass">
    <div id="loading-bar-wrapper"></div>
    <div class="app-wrapper">
      <AppHeader />
      <div class="app-banner">
        <div class="app-banner-screen"></div>
      </div>
      <div class="app-container">
        <router-view />
      </div>
      <AppFooter />
    </div>
    <AuroraDia />
    <BackTop />
    <AIChatBot />
    <SearchModal v-if="showSearchModal" @close="showSearchModal = false" />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AuroraDia from './components/AuroraDia.vue'
import SearchModal from './components/SearchModal.vue'
import BackTop from './components/BackTop.vue'
import AIChatBot from './components/AIChatBot.vue'
import { mapState } from 'vuex'
import { getBlogSetting } from './api/blog'

export default {
  name: 'App',
  components: { AppHeader, AppFooter, AuroraDia, SearchModal, BackTop, AIChatBot },
  data() {
    return { showSearchModal: false }
  },
  computed: {
    ...mapState(['theme']),
    themeClass() { return 'theme-' + this.theme }
  },
  async mounted() {
    document.documentElement.className = 'theme-' + this.theme
    this.$root.$on('open-search', () => { this.showSearchModal = true })
    try {
      const res = await getBlogSetting()
      if (res.data) {
        this.$store.commit('SET_SITE_INFO', {
          title: res.data.siteTitle,
          subtitle: res.data.siteSubtitle || '',
          author: res.data.authorName || '博主',
          bio: res.data.authorBio || '',
          avatar: res.data.avatarUrl || '',
          icp: res.data.icp || '',
          police: res.data.police || '',
          footerText: res.data.footerText || '',
          welcomeText: res.data.welcomeText || '',
          techStack: res.data.techStack || '',
          githubUrl: res.data.githubUrl || '',
          bilibiliUrl: res.data.bilibiliUrl || '',
          qqNumber: res.data.qqNumber || '',
          email: res.data.email || '',
          wechatId: res.data.wechatId || '',
          defaultUserAvatarUrl: res.data.defaultUserAvatarUrl || ''
        })
      }
    } catch (e) { /* 静默失败 */ }
  }
}
</script>

<style>
/* ========== CSS Variables ========== */
:root {
  --max-width: 1600px;
  --content-width: 780px;
  --gap: 2rem;
  --main-gradient: linear-gradient(130deg, #2563eb, #3b82f6 41.07%, #6366f1 76.05%);
  --theme-transition: all 250ms ease;
  --strong-gradient: linear-gradient(62deg, #2563eb 0%, #6366f1 100%) !important;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

/* ========== Light Theme (原版) ========== */
.theme-light {
  --background-primary: #f1f3f9;
  --background-primary-alt: #fafafa;
  --background-secondary: #ffffff;
  --background-secondary-alt: #2e3236;
  --background-trans: rgba(0, 0, 0, 0.15);
  --text-bright: #000000;
  --text-normal: #333333;
  --text-accent: #2563eb;
  --text-sub-accent: #3b82f6;
  --text-faint: #b2b2b2;
  --text-dim: #858585;
  --text-title-h1: #333;
  --text-title-h2: #333;
  --text-title-h3: #333;
  --text-title-h4: #333;
  --text-title-h5: #333;
  --text-link: #b4b4b4;
  --text-a: #db4d52;
  --text-a-hover: #db4d52;
  --bg-accent-55: rgba(37, 99, 235, 0.55);
  --bg-sub-accent-55: rgba(59, 130, 246, 0.55);
  --bg-accent-05: rgba(37, 99, 235, 0.05);
  --gradient-cover: linear-gradient(
    90deg,
    hsla(0, 0%, 98%, 0) 0,
    hsla(0, 0%, 98%, 0.013) 8.1%,
    hsla(0, 0%, 98%, 0.049) 15.5%,
    hsla(0, 0%, 98%, 0.104) 22.5%,
    hsla(0, 0%, 98%, 0.175) 29%,
    hsla(0, 0%, 98%, 0.259) 35.3%,
    hsla(0, 0%, 98%, 0.352) 41.2%,
    hsla(0, 0%, 98%, 0.45) 47.1%,
    hsla(0, 0%, 98%, 0.55) 52.9%,
    hsla(0, 0%, 98%, 0.648) 58.8%,
    hsla(0, 0%, 98%, 0.741) 64.7%,
    hsla(0, 0%, 98%, 0.825) 71%,
    hsla(0, 0%, 98%, 0.896) 77.5%,
    hsla(0, 0%, 98%, 0.951) 84.5%,
    hsla(0, 0%, 98%, 0.987) 91.9%,
    var(--background-secondary)
  );
  --article-cover: linear-gradient(
    180deg,
    hsla(0, 0%, 98%, 0) 0,
    hsla(0, 0%, 98%, 0.013) 8.1%,
    hsla(0, 0%, 98%, 0.049) 15.5%,
    hsla(0, 0%, 98%, 0.104) 22.5%,
    hsla(0, 0%, 98%, 0.175) 29%,
    hsla(0, 0%, 98%, 0.259) 35.3%,
    hsla(0, 0%, 98%, 0.352) 41.2%,
    hsla(0, 0%, 98%, 0.45) 47.1%,
    hsla(0, 0%, 98%, 0.55) 52.9%,
    hsla(0, 0%, 98%, 0.648) 58.8%,
    hsla(0, 0%, 98%, 0.741) 64.7%,
    hsla(0, 0%, 98%, 0.825) 71%,
    hsla(0, 0%, 98%, 0.896) 77.5%,
    hsla(0, 0%, 98%, 0.951) 84.5%,
    hsla(0, 0%, 98%, 0.987) 91.9%,
    var(--background-secondary)
  );
  --trans-ease: all 250ms ease;
  --accent-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.06), 0 10px 10px -5px rgba(30, 64, 175, 0.1);
  --sub-accent-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.06), 0 10px 10px -5px rgba(30, 64, 175, 0.1);
  --search-modal-key-gradient: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
  --search-modal-key-shadow: inset 0 -2px 0 0 #cdcde6, inset 0 0 1px 1px #fff, 0 1px 2px 1px rgba(30, 35, 90, 0.4);
  --custom-quote-tip: #2563eb;
  --custom-quote-warning: #e98503;
  --custom-quote-danger: #dd2500;
  --custom-quote: #2563eb;
  --skeleton-bg: #e9ecef;
  --skeleton-hl: #f8f9fa;
}

/* ========== Dark Theme (暗色主题) ========== */
.theme-dark {
  --background-primary: #1a1a1a;
  --background-primary-alt: #0d0b12;
  --background-secondary: #212121;
  --background-secondary-alt: #0d0b12;
  --background-trans: rgba(255, 255, 255, 0.15);
  --skeleton-bg: #2e2e2e;
  --skeleton-hl: #363636;
  --text-bright: #fff;
  --text-normal: #bebebe;
  --text-accent: #60a5fa;
  --text-sub-accent: #93c5fd;
  --text-dim: #6d6d6d;
  --text-faint: #64748b;
  --text-title-h1: var(--text-accent);
  --text-title-h2: #cbdbe5;
  --text-title-h3: #cbdbe5;
  --text-title-h4: #cbdbe5;
  --text-title-h5: #cbdbe5;
  --text-link: #b4b4b4;
  --text-a: #60a5fa;
  --text-a-hover: #60a5fa;
  --bg-sub-accent-55: rgba(147, 197, 253, 0.55);
  --bg-accent-55: rgba(96, 165, 250, 0.55);
  --bg-accent-05: rgba(96, 165, 250, 0.05);
  --strong-gradient: linear-gradient(62deg, #60a5fa 0%, #93c5fd 100%) !important;
  --gradient-cover: linear-gradient(
    90deg,
    hsla(0, 0%, 13%, 0) 0,
    hsla(0, 0%, 13%, 0.013) 8.1%,
    hsla(0, 0%, 13%, 0.049) 15.5%,
    hsla(0, 0%, 13%, 0.104) 22.5%,
    hsla(0, 0%, 13%, 0.175) 29%,
    hsla(0, 0%, 13%, 0.259) 35.3%,
    hsla(0, 0%, 13%, 0.352) 41.2%,
    hsla(0, 0%, 13%, 0.45) 47.1%,
    hsla(0, 0%, 13%, 0.55) 52.9%,
    hsla(0, 0%, 13%, 0.648) 58.8%,
    hsla(0, 0%, 13%, 0.741) 64.7%,
    hsla(0, 0%, 13%, 0.825) 71%,
    hsla(0, 0%, 13%, 0.896) 77.5%,
    hsla(0, 0%, 13%, 0.951) 84.5%,
    hsla(0, 0%, 13%, 0.987) 91.9%,
    var(--background-secondary)
  );
  --article-cover: linear-gradient(
    180deg,
    hsla(0, 0%, 13%, 0) 0,
    hsla(0, 0%, 13%, 0.013) 8.1%,
    hsla(0, 0%, 13%, 0.049) 15.5%,
    hsla(0, 0%, 13%, 0.104) 22.5%,
    hsla(0, 0%, 13%, 0.175) 29%,
    hsla(0, 0%, 13%, 0.259) 35.3%,
    hsla(0, 0%, 13%, 0.352) 41.2%,
    hsla(0, 0%, 13%, 0.45) 47.1%,
    hsla(0, 0%, 13%, 0.55) 52.9%,
    hsla(0, 0%, 13%, 0.648) 58.8%,
    hsla(0, 0%, 13%, 0.741) 64.7%,
    hsla(0, 0%, 13%, 0.825) 71%,
    hsla(0, 0%, 13%, 0.896) 77.5%,
    hsla(0, 0%, 13%, 0.951) 84.5%,
    hsla(0, 0%, 13%, 0.987) 91.9%,
    var(--background-secondary)
  );
  --trans-ease: all 250ms ease;
  --accent-shadow: 0 20px 25px -5px rgba(11, 42, 59, 0.35), 0 10px 10px -5px rgba(11, 42, 59, 0.14);
  --sub-accent-shadow: 0 20px 25px -5px rgba(53, 11, 59, 0.35), 0 10px 10px -5px rgba(53, 11, 59, 0.14);
  --search-modal-key-gradient: linear-gradient(-225deg, #3f3e3e, #2c2c2c);
  --search-modal-key-shadow: inset 0 -2px 0 0 #363636, inset 0 0 1px 1px #2e2e2e, 0 1px 2px 1px rgba(30, 35, 90, 0.4);
  --custom-quote-tip: #60a5fa;
  --custom-quote-warning: #cbcb00;
  --custom-quote-danger: #dd2500;
  --custom-quote: #60a5fa;
}

/* ========== Base Reset ========== */
*, :before, :after { box-sizing: border-box; border: 0 solid #e5e7eb; }
html { -webkit-text-size-adjust: 100%; tab-size: 4; font-family: ui-sans-serif,system-ui,sans-serif; line-height: 1.5; }
body { line-height: inherit; margin: 0; }
hr { height: 0; color: inherit; border-top-width: 1px; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
a { color: inherit; text-decoration: inherit; transition-property: all; transition-duration: .15s; }
a:hover { opacity: .5; }
img, svg, video, canvas { vertical-align: middle; display: block; }
img, video { max-width: 100%; height: auto; }
button, [role=button] { cursor: pointer; }
:focus { outline: none; }

body {
  font-family: Rubik, Avenir, Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--background-primary-alt);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* ========== Scrollbar ========== */
html { scrollbar-color: #333 transparent; }
html::-webkit-scrollbar { width: 8px; height: 8px; }
html::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
html::-webkit-scrollbar-track { background: transparent; }
div::-webkit-scrollbar { width: 6px; height: 6px; }
div::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
div::-webkit-scrollbar-track { background: transparent; }

/* ========== App Layout ========== */
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
#app .app-wrapper {
  background: transparent;
  transform-origin: 0 42%;
  width: 100%;
  height: 100%;
  padding-bottom: 3rem;
  transition-property: transform,border-radius;
  transition-duration: .35s;
  transition-timing-function: ease;
}
#app .app-container {
  color: var(--text-normal);
  margin: 0 auto;
  position: relative;
  z-index: 10;
  padding: 0 1.5rem;
  max-width: 100%;
  overflow-x: hidden;
}
@media (max-width: 640px) {
  #app .app-container { padding: 0 0.75rem; }
}

/* ========== Banner ========== */
.app-banner {
  content: '';
  display: block;
  height: 600px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  background: var(--main-gradient);
  clip-path: polygon(100% 0,0 0,0 77.5%,1% 77.4%,2% 77.1%,3% 76.6%,4% 75.9%,5% 75.05%,6% 74.05%,7% 72.95%,8% 71.75%,9% 70.55%,10% 69.3%,11% 68.05%,12% 66.9%,13% 65.8%,14% 64.8%,15% 64%,16% 63.35%,17% 62.85%,18% 62.6%,19% 62.5%,20% 62.65%,21% 63%,22% 63.5%,23% 64.2%,24% 65.1%,25% 66.1%,26% 67.2%,27% 68.4%,28% 69.65%,29% 70.9%,30% 72.15%,31% 73.3%,32% 74.35%,33% 75.3%,34% 76.1%,35% 76.75%,36% 77.2%,37% 77.45%,38% 77.5%,39% 77.3%,40% 76.95%,41% 76.4%,42% 75.65%,43% 74.75%,44% 73.75%,45% 72.6%,46% 71.4%,47% 70.15%,48% 68.9%,49% 67.7%,50% 66.55%,51% 65.5%,52% 64.55%,53% 63.75%,54% 63.15%,55% 62.75%,56% 62.55%,57% 62.5%,58% 62.7%,59% 63.1%,60% 63.7%,61% 64.45%,62% 65.4%,63% 66.45%,64% 67.6%,65% 68.8%,66% 70.05%,67% 71.3%,68% 72.5%,69% 73.6%,70% 74.65%,71% 75.55%,72% 76.35%,73% 76.9%,74% 77.3%,75% 77.5%,76% 77.45%,77% 77.25%,78% 76.8%,79% 76.2%,80% 75.4%,81% 74.45%,82% 73.4%,83% 72.25%,84% 71.05%,85% 69.8%,86% 68.55%,87% 67.35%,88% 66.2%,89% 65.2%,90% 64.3%,91% 63.55%,92% 63%,93% 62.65%,94% 62.5%,95% 62.55%,96% 62.8%,97% 63.3%,98% 63.9%,99% 64.75%,100% 65.7%);
}
.app-banner-screen {
  z-index: 2;
  opacity: 0.91;
  background: var(--main-gradient);
  width: 100%;
  height: 100%;
}

/* ========== Header Wave ========== */
#app .header-wave {
  z-index: 1;
  position: absolute;
  top: 100px;
  left: 0;
}

/* ========== Utility Classes ========== */
.ob-text-bright { color: var(--text-bright); }
.ob-drop-shadow { filter: drop-shadow(0 2px 5px #0000004d); }
.ob-avatar {
  --tw-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;
  width: 7rem; height: 7rem;
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow);
  margin: 0;
}
.footer-avatar {
  opacity: .4;
  --tw-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;
  width: 5rem; height: 5rem;
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow);
  margin: 0;
}
.diamond-avatar { clip-path: polygon(50% 3%,91% 25%,91% 75%,50% 97%,9% 75%,9% 25%); }
.circle-avatar { border-color: var(--background-primary); border-width: 6px; border-radius: 9999px; }
.rounded-avatar { border-color: var(--background-primary); border-width: 6px; border-radius: 1rem; }

.main-grid, .inverted-main-grid { flex-direction: column; display: flex; }
@media (min-width: 1024px) {
  .main-grid { gap: var(--gap); grid-template-columns: minmax(0,1fr) 320px; display: grid; }
  .inverted-main-grid { gap: var(--gap); grid-template-columns: 245px minmax(0,1fr); display: grid; }
}

/* ========== NProgress ========== */
#loading-bar-wrapper { z-index: 2000; background: 0 0; border-radius: 8px; width: 100px; height: 8px; position: fixed; top: 8px; left: 50%; overflow: hidden; transform: translate(-50%); }
#loading-bar-wrapper #nprogress { pointer-events: none; }
#loading-bar-wrapper #nprogress .bar { background: var(--main-gradient); z-index: 3000; width: 100%; height: 8px; position: absolute; top: 0; left: 0; }
#loading-bar-wrapper #nprogress .peg { opacity: 0; width: 100px; height: 8px; box-shadow: none; display: none; position: absolute; right: 0; transform: rotate(3deg)translateY(-4px); }
#loading-bar-wrapper #nprogress .spinner { z-index: 3000; display: block; position: fixed; top: 15px; right: 15px; }
#loading-bar-wrapper #nprogress .spinner-icon { box-sizing: border-box; border: 2px solid #0000; border-top-color: var(--text-accent); border-left-color: var(--text-accent); border-radius: 50%; width: 18px; height: 18px; animation: .4s linear infinite nprogress-spinner; }
#loading-bar-wrapper.nprogress-custom-parent { background: var(--background-secondary); box-shadow: 0 1px 2px #0000001a; }
@keyframes nprogress-spinner { 0%{transform:rotate(0)} to{transform:rotate(360deg)} }

/* ========== Gradient Text & Skeleton ========== */
.animation-text {
  -webkit-text-fill-color: transparent;
  -webkit-box-decoration-break: clone;
  background-color: #ccc;
  background-image: linear-gradient(90deg,#ccc,#fff,#ccc);
  -webkit-background-clip: text;
  animation: 1.5s ease-in-out infinite SkeletonLoading;
}
@keyframes SkeletonLoading {
  0%{background-position:-200px 0}
  to{background-position:calc(200px + 100%) 0}
}
.ob-skeleton {
  width: 100%;
  height: inherit;
  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-hl) 37%, var(--skeleton-bg) 63%);
  background-size: 400% 100%;
  animation: 1.4s ease infinite SkeletonLoading;
  border-radius: 10px;
  line-height: 1;
  display: inline-block;
}

/* ========== Post HTML (文章内容样式) ========== */
.post-html {
  background-color: var(--background-secondary);
  border-radius: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1);
}
@media (min-width: 1024px) { .post-html { margin-bottom: 0; padding: 3.5rem; } }

.post-html h1, .post-html h2, .post-html h3, .post-html h4, .post-html h5, .post-html h6 {
  color: var(--text-bright);
  margin-bottom: 1rem;
  padding-top: 1.75rem;
  padding-bottom: 0.5rem;
  font-weight: 600;
  position: relative;
  display: flex;
  align-items: center;
}
.post-html h1:after, .post-html h2:after, .post-html h3:after, .post-html h4:after, .post-html h5:after, .post-html h6:after {
  content: '';
  position: absolute;
  bottom: 0;
  height: 4px;
  width: 6rem;
  border-radius: 9999px;
  background: var(--main-gradient);
}
.post-html h1 { font-size: 1.875rem; line-height: 2.25rem; }
@media (min-width: 1024px) { .post-html h1 { font-size: 2.25rem; line-height: 2.5rem; } }
.post-html h2 { font-size: 1.5rem; line-height: 2rem; }
@media (min-width: 1024px) { .post-html h2 { font-size: 1.875rem; line-height: 2.25rem; } }
.post-html h3 { font-size: 1.25rem; line-height: 1.75rem; }
@media (min-width: 1024px) { .post-html h3 { font-size: 1.5rem; line-height: 2rem; } }
.post-html h4 { font-size: 1.125rem; line-height: 1.75rem; }
@media (min-width: 1024px) { .post-html h4 { font-size: 1.25rem; line-height: 1.75rem; } }
.post-html h5, .post-html h6 { font-size: 1rem; line-height: 1.5rem; }

.post-html p { margin-top: 0.75rem; margin-bottom: 0.75rem; line-height: 2; }
.post-html p img { margin-top: 0.75rem; margin-bottom: 0.75rem; }

/* Lists */
.post-html ul { margin: 1.5rem 0; }
.post-html ul ul { position: relative; margin: 0; }
.post-html ul > li > ul:before {
  content: '';
  border-left: 1px solid var(--text-accent);
  position: absolute;
  opacity: 0.35;
  left: -1em;
  top: 0;
  bottom: 0;
}
.post-html ul li, .post-html ol li { margin-bottom: 0.75rem; line-height: 2; margin-left: 2rem; }
.post-html ul, .post-html ul ul, .post-html ol ul, .post-html ul ul ul, .post-html ol ul ul { list-style: none; }
.post-html li > p { display: inline-block; margin-top: 0; margin-bottom: 0; }

.post-html ul li:before {
  float: left;
  content: "•";
  color: var(--text-accent);
  display: inline-block;
  width: 1em;
  margin-left: -1.15em;
  padding: 0;
  font-weight: 700;
  text-shadow: 0 0 0.5em var(--bg-accent-55);
}
.post-html ul ul li:before, .post-html ul ul ul li:before { content: "•"; }

.post-html ol { list-style: none; counter-reset: li; }
.post-html ol > li { counter-increment: li; }
.post-html ol > li:before,
.post-html ul ol > li:before,
.post-html ul ul ol > li:before,
.post-html ul ul ul ol > li:before {
  content: "." counter(li);
  color: var(--text-accent);
  font-weight: 400;
  display: inline-block;
  width: 1em;
  margin-left: -1.5em;
  margin-right: 0.5em;
  text-align: right;
  direction: rtl;
  overflow: visible;
  word-break: keep-all;
  white-space: nowrap;
}

/* Blockquote */
.post-html blockquote { margin-inline-start: 0; }
.post-html .custom-quote,
.post-html blockquote {
  position: relative;
  padding: 0.5rem 1rem 0.5rem 2rem;
  color: var(--text-normal);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  margin-bottom: 2em;
  margin-top: 2em;
  margin-right: 0 !important;
  border-left: 3px var(--text-accent) solid;
  border-top: transparent;
  border-bottom: transparent;
  border-right: transparent;
  background: linear-gradient(135deg, var(--background-primary), var(--background-primary) 41.07%, var(--background-secondary) 76.05%, var(--background-secondary));
}
.post-html .custom-quote:before,
.post-html blockquote:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  width: 76%;
  background: linear-gradient(90deg, var(--text-accent), var(--background-secondary) 76.05%);
}
.post-html .custom-quote:after,
.post-html blockquote:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 45%;
  background: linear-gradient(90deg, var(--text-accent), var(--background-primary) 45%);
}

/* Strong / Bold gradient text */
.post-html strong {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0 0.1rem;
  color: #7aa2f7;
  background-color: #7aa2f7;
  background-image: var(--strong-gradient);
}
.post-html strong::selection { -webkit-text-fill-color: var(--text-faint); }

/* Inline code */
.post-html code {
  margin: 0;
  overflow-wrap: break-word;
  background-color: var(--bg-accent-05);
  word-wrap: break-word;
  padding: 0.1rem 0.3rem;
  border-radius: 0.3rem;
  color: var(--text-accent) !important;
}

/* Code blocks */
.post-html pre {
  overflow-wrap: normal !important;
  overflow: auto !important;
  background: #282c34;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
}
.post-html pre code { padding: 0; background: transparent; color: #abb2bf !important; }

/* Images */
.post-html img { border-radius: 0.5rem; }

/* Tables */
.post-html table { border-collapse: collapse; margin: 1rem 0; display: block; overflow-x: auto; }
.post-html th { border: 1px solid var(--background-primary-alt) !important; background-color: var(--background-secondary); }
.post-html td, .post-html th { padding: 0.6em 1em; border: 1px solid var(--background-primary-alt) !important; }
.post-html tr { border-top: 1px solid var(--background-primary-alt) !important; background-color: var(--background-primary); }
.post-html tr:nth-child(2n) { background-color: var(--background-secondary); }

/* Links */
.post-html a {
  text-shadow: -1px -1px 2px var(--background-primary), -1px 1px 2px var(--background-primary), 1px -1px 2px var(--background-primary), 1px 1px 2px var(--background-primary);
  -webkit-text-fill-color: var(--text-bright);
  background-position: 0 100%;
  background-repeat: repeat-x;
  background-size: 5px 5px;
  text-decoration: none;
  transition: all 350ms ease;
  background-image: linear-gradient(to bottom, var(--bg-sub-accent-55) 0%, var(--bg-sub-accent-55) 100%);
}
.post-html a:hover {
  text-shadow: none;
  -webkit-text-fill-color: var(--text-bright);
  background-size: 4px 50px;
}
.post-html a strong {
  -webkit-background-clip: initial;
  -webkit-text-fill-color: initial;
  color: inherit;
  background-color: initial;
  background-image: none;
}

/* HR */
.post-html hr {
  position: relative;
  margin-block-start: 0;
  margin-block-end: 0;
  border: none;
  height: 1px;
  padding: 2.5em 0;
}
.post-html hr:before {
  content: '§';
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -44%) rotate(60deg);
  transform-origin: 50% 50%;
  padding: 0.25rem;
  color: var(--text-sub-accent);
  background-color: var(--background-secondary);
  z-index: 10;
  border-radius: 60%;
}
.post-html hr:after {
  position: absolute;
  content: '';
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--main-gradient);
  height: 3px;
  width: 26%;
  border-radius: 9999px;
  opacity: 0.26;
  margin: 2.5em auto;
}

/* Em */
.post-html em { color: #bb9af7 !important; font-family: OperatorMonoSSmLig-Book, Rubik !important; }

/* SVG in content */
.post-html svg { display: inline-block; }

/* Details / Summary */
.post-html .custom-details {
  border-radius: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--background-primary), var(--background-primary) 41.07%, var(--background-secondary) 76.05%, var(--background-secondary));
}
.post-html .custom-details summary {
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 250ms ease;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, var(--bg-accent-55), transparent 46.07%);
  opacity: 1;
}
.post-html .custom-details summary:hover { opacity: 0.6; }

/* ========== Tab System ========== */
.tab {
  background-color: var(--background-secondary);
  border: 1px solid var(--text-faint);
  border-radius: 1rem;
  flex-flow: wrap;
  height: 3.5rem;
  margin-bottom: 2rem;
  padding-left: 1.5rem;
  padding-right: 3rem;
  transition: height .4s;
  display: flex;
  overflow-y: hidden;
}
.tab.expanded-tab { overflow-y: initial; height: auto; }
.tab li { cursor: pointer; margin: 1rem .75rem; }
.tab li:hover { opacity: .5; }
.tab li.active {
  color: #fff;
  text-shadow: 0 2px 2px #00000080;
  box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
}
.tab li span {
  white-space: nowrap;
  background-color: var(--background-primary);
  text-align: center;
  border-top-left-radius: .375rem;
  border-bottom-left-radius: .375rem;
  padding: .5rem .75rem;
  font-size: .875rem;
  line-height: 1.25rem;
}
.tab li span.first-tab { border-radius: .375rem; padding-left: 1.5rem; padding-right: 1.5rem; }
.tab li b {
  white-space: nowrap;
  background-color: var(--background-primary);
  text-align: center;
  color: var(--text-accent);
  opacity: .7;
  border-top-right-radius: .375rem;
  border-bottom-right-radius: .375rem;
  padding: .5rem;
  font-size: .875rem;
  line-height: 1.25rem;
}
</style>