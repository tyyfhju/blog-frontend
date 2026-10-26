<template>
  <footer class="app-footer">
    <!-- 顶部装饰线 -->
    <div class="footer-divider"></div>

    <div class="footer-inner"></div>

    <!-- 底部版权 -->
    <div class="footer-bottom">
      <p>{{ siteInfo.footerText || ('© ' + year + ' ' + (siteInfo.title || 'tyyfhju的博客')) }}</p>
      <p v-if="siteInfo.icp" class="footer-icp">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ siteInfo.icp }}</a>
      </p>
      <p v-if="siteInfo.police" class="footer-police">
        <a href="http://www.beian.gov.cn/" target="_blank" rel="noopener">{{ siteInfo.police }}</a>
      </p>
    </div>
  </footer>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AppFooter',
  computed: {
    ...mapState(['siteInfo']),
    year() { return new Date().getFullYear() }
  }
}
</script>

<style scoped>
.app-footer {
  background: var(--background-secondary);
  margin-top: 4rem;
  position: relative;
}

/* 顶部渐变装饰线 */
.footer-divider {
  height: 3px;
  background: var(--main-gradient);
  opacity: 0.6;
}

.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* 底部版权 */
.footer-bottom {
  border-top: 1px solid var(--background-trans);
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1.5rem 2rem;
  text-align: center;
}
.footer-bottom p {
  font-size: 0.78rem;
  color: var(--text-faint);
  margin: 0;
  line-height: 1.6;
}
.footer-icp,
.footer-police {
  margin-top: 0.15rem !important;
}
.footer-icp a,
.footer-police a {
  font-size: 0.75rem;
  color: var(--text-faint);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-icp a:hover,
.footer-police a:hover {
  color: var(--text-accent);
  opacity: 1;
}

@media (max-width: 768px) {
  .footer-bottom {
    padding: 1rem 1.5rem;
  }
}
</style>
