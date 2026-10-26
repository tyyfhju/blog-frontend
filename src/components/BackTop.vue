<template>
  <transition name="fade">
    <div v-show="visible" class="back-top" @click="scrollToTop">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BackTop',
  data() {
    return { visible: false }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.visible = window.scrollY > 400
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.back-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 900;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--background-secondary);
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-dim);
  transition: all 0.3s;
  border: 2px solid var(--background-trans);
}
.back-top:hover {
  transform: translateY(-3px);
  box-shadow: var(--accent-shadow);
  color: var(--text-accent);
  border-color: var(--text-accent);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
