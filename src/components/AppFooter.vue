<template>
  <footer class="site-footer">
    <div class="site-footer-in">
      <span v-if="siteInfo.footerText" v-html="siteInfo.footerText"></span>
      <span v-else>{{ copyrightText }}</span>
      <div class="site-footer-legal">
        <a v-if="siteInfo.icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ siteInfo.icp }}</a>
        <span v-else class="legal-slot">{{ content.footer.icp }}</span>
        <a v-if="siteInfo.police" href="https://beian.mps.gov.cn/" target="_blank" rel="noopener">{{ siteInfo.police }}</a>
        <span v-else class="legal-slot">{{ content.footer.police }}</span>
      </div>
    </div>
  </footer>
</template>

<script>
import { mapState } from 'vuex'
import { formatText } from '../content/site'

export default {
  name: 'AppFooter',
  computed: {
    ...mapState(['siteInfo', 'content']),
    year() {
      return new Date().getFullYear()
    },
    copyrightText() {
      return formatText(this.content.footer.copyright, {
        year: this.year,
        title: this.siteInfo.title || 'tyyfhju'
      })
    }
  }
}
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  margin-top: 80px;
  padding: 32px 0 96px;
  font-size: 12.5px;
  color: var(--text-3);
}
.site-footer-in {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.site-footer-legal {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
}
.site-footer-legal a {
  color: var(--text-3);
  text-decoration: none;
  transition: color .2s var(--ease);
}
.site-footer-legal a:hover { color: var(--brand); }
.legal-slot {
  color: var(--text-3);
  opacity: .55;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: .03em;
}
</style>
