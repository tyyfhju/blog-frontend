<template>
  <transition name="cm-fade">
    <div v-if="visible" class="cm" role="dialog" aria-modal="true" :aria-label="title">
      <div class="cm-backdrop" @click="close"></div>

      <div class="cm-panel" @click.stop>
        <span class="cm-grid" aria-hidden="true"></span>
        <span class="cm-scan" aria-hidden="true"></span>
        <i class="cm-corner tl" aria-hidden="true"></i>
        <i class="cm-corner tr" aria-hidden="true"></i>
        <i class="cm-corner bl" aria-hidden="true"></i>
        <i class="cm-corner br" aria-hidden="true"></i>

        <button ref="closeBtn" class="cm-close" type="button" :aria-label="labels.close" @click="close">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <header class="cm-head">
          <div class="cm-sigil" :class="'is-' + type">
            <span class="cm-sigil-ring" aria-hidden="true"></span>
            <svg v-if="type === 'email'" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="m3.6 6.6 7.1 5.4a2.2 2.2 0 0 0 2.6 0l7.1-5.4" />
            </svg>
            <svg v-else-if="type === 'qq'" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 11.4c0 4.3-3.6 7.6-8 7.6-1.2 0-2.4-.25-3.4-.7L4 20l1.3-3.6A7.2 7.2 0 0 1 4 11.4C4 7.1 7.6 3.8 12 3.8s8 3.3 8 7.6Z" />
              <path d="M8.6 10.2h.01M15.4 10.2h.01" />
              <path d="M9.4 13.6c1.5 1.1 3.7 1.1 5.2 0" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.4 4.4c-3.5 0-6.2 2.3-6.2 5.2 0 1.6.9 3.1 2.3 4.1l-.6 2 2.2-1.1c.7.2 1.5.3 2.3.3" />
              <path d="M14.6 8.2c-3.2 0-5.8 2.1-5.8 4.8 0 1.5.8 2.8 2.1 3.7l-.5 1.8 2-1c.7.2 1.4.3 2.2.3 3.2 0 5.8-2.1 5.8-4.8s-2.6-4.8-5.8-4.8Z" />
            </svg>
          </div>

          <div class="cm-heading">
            <span class="cm-eyebrow"><b>CONTACT</b><i>//</i>{{ typeKey }}</span>
            <h3>{{ title }}</h3>
            <p>{{ subtitle }}</p>
          </div>
        </header>

        <div class="cm-list">
          <div
            v-for="(item, i) in items"
            :key="item.value + '-' + i"
            class="cm-item"
            :class="{ done: copiedIndex === i }"
            @click="copyOne(item.value, i)">
            <span class="cm-idx">{{ pad(i + 1) }}</span>
            <div class="cm-value">
              <small v-if="item.label">{{ item.label }}</small>
              <b>{{ item.value }}</b>
            </div>
            <button
              type="button"
              class="cm-copy"
              :class="{ done: copiedIndex === i }"
              :aria-label="copiedIndex === i ? labels.copied : labels.copy"
              @click.stop="copyOne(item.value, i)">
              <svg v-if="copiedIndex !== i" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <rect x="8" y="8" width="11" height="11" rx="2" />
                <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7" />
              </svg>
              <span>{{ copiedIndex === i ? labels.copied : labels.copy }}</span>
            </button>
          </div>
        </div>

        <footer class="cm-foot">
          <span class="cm-hint"><i></i>{{ labels.hint }}</span>
          <button v-if="items.length > 1" type="button" class="cm-all" :class="{ done: copiedAll }" @click="copyAll">
            <svg v-if="!copiedAll" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="8" width="11" height="11" rx="2" />
              <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7" />
            </svg>
            <span>{{ copiedAll ? labels.copiedAll : labels.copyAll }}</span>
            <b>{{ items.length }}</b>
          </button>
        </footer>

        <span class="cm-sr" role="status">{{ statusText }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

function fallbackCopy(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-9999px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch (e) { ok = false }
  document.body.removeChild(area)
  return ok
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text))
  }
  return Promise.resolve(fallbackCopy(text))
}

export default {
  name: 'ContactModal',
  props: {
    visible: { type: Boolean, default: false },
    type: { type: String, default: 'email' },
    items: { type: Array, default: () => [] }
  },
  data() {
    return {
      copiedIndex: -1,
      copiedAll: false,
      copyTimer: null,
      allTimer: null,
      lastFocus: null
    }
  },
  computed: {
    ...mapState(['content']),
    labels() {
      return this.content.about.contact
    },
    typeKey() {
      if (this.type === 'qq') return 'QQ'
      if (this.type === 'wechat') return 'WECHAT'
      return 'MAIL'
    },
    title() {
      return this.labels[this.type + 'Title'] || ''
    },
    subtitle() {
      return this.labels[this.type + 'Desc'] || ''
    },
    allText() {
      return this.items.map(item => item.value).join('\n')
    },
    statusText() {
      if (this.copiedAll) return this.labels.copiedAll
      if (this.copiedIndex >= 0) return this.labels.copied
      return ''
    }
  },
  watch: {
    visible(value) {
      if (value) this.onOpen()
      else this.onClose()
    }
  },
  mounted() {
    if (this.visible) this.onOpen()
  },
  beforeDestroy() {
    clearTimeout(this.copyTimer)
    clearTimeout(this.allTimer)
    document.body.style.overflow = ''
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    onOpen() {
      this.lastFocus = document.activeElement
      this.copiedIndex = -1
      this.copiedAll = false
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', this.onKeydown)
      this.$nextTick(() => {
        if (this.$refs.closeBtn) this.$refs.closeBtn.focus()
      })
    },
    onClose() {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', this.onKeydown)
      if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus()
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.close()
    },
    close() {
      this.$emit('close')
    },
    pad(n) {
      return n < 10 ? '0' + n : String(n)
    },
    async copyOne(value, index) {
      const ok = await copyText(value)
      if (!ok) return
      this.copiedAll = false
      this.copiedIndex = index
      clearTimeout(this.copyTimer)
      this.copyTimer = setTimeout(() => { this.copiedIndex = -1 }, 1800)
    },
    async copyAll() {
      if (!this.items.length) return
      const ok = await copyText(this.allText)
      if (!ok) return
      this.copiedIndex = -1
      this.copiedAll = true
      clearTimeout(this.allTimer)
      this.allTimer = setTimeout(() => { this.copiedAll = false }, 1800)
    }
  }
}
</script>

<style scoped>
.cm {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: grid;
  place-items: center;
  padding: 24px;
}
.cm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 14, .68);
  backdrop-filter: blur(14px) saturate(.9);
  -webkit-backdrop-filter: blur(14px) saturate(.9);
}
.cm-panel {
  position: relative;
  width: min(520px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  padding: 26px 26px 20px;
  border-radius: 24px;
  overflow: hidden;
  color: #DCEBFF;
  background:
    radial-gradient(120% 85% at 100% 0%, rgba(34, 211, 238, .16), transparent 56%),
    radial-gradient(95% 75% at 0% 100%, rgba(59, 130, 246, .17), transparent 62%),
    linear-gradient(158deg, rgba(10, 21, 40, .985), rgba(3, 9, 19, .99));
  border: 1px solid rgba(88, 196, 255, .26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .05),
    0 40px 120px rgba(0, 0, 0, .62),
    0 0 80px rgba(34, 211, 238, .10);
  animation: cmPanelIn .34s cubic-bezier(.16, 1, .3, 1);
}
.cm-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, .04);
  pointer-events: none;
}
.cm-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(80, 180, 255, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 180, 255, .055) 1px, transparent 1px);
  background-size: 34px 34px;
  -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 0%, transparent 76%);
  mask-image: radial-gradient(120% 90% at 50% 0%, #000 0%, transparent 76%);
  pointer-events: none;
}
.cm-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, .85), transparent);
  box-shadow: 0 0 14px rgba(34, 211, 238, .5);
  opacity: 0;
  animation: cmScan 6.4s linear infinite;
  pointer-events: none;
}
.cm-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border-color: rgba(34, 211, 238, .6);
  border-style: solid;
  pointer-events: none;
  z-index: 3;
}
.cm-corner.tl { top: 10px; left: 10px; border-width: 1px 0 0 1px; border-top-left-radius: 6px; }
.cm-corner.tr { top: 10px; right: 10px; border-width: 1px 1px 0 0; border-top-right-radius: 6px; }
.cm-corner.bl { bottom: 10px; left: 10px; border-width: 0 0 1px 1px; border-bottom-left-radius: 6px; }
.cm-corner.br { bottom: 10px; right: 10px; border-width: 0 1px 1px 0; border-bottom-right-radius: 6px; }
.cm-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 4;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 1px solid rgba(88, 170, 235, .18);
  background: rgba(12, 26, 46, .6);
  color: #7C9AB8;
  transition: color .18s, border-color .18s, background .18s;
}
.cm-close:hover {
  color: #DFF6FF;
  border-color: rgba(34, 211, 238, .55);
  background: rgba(34, 211, 238, .10);
}
.cm-head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding-right: 30px;
  flex-shrink: 0;
}
.cm-sigil {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #7FE7FF;
  background: linear-gradient(145deg, rgba(34, 211, 238, .17), rgba(59, 130, 246, .10));
  border: 1px solid rgba(34, 211, 238, .36);
  box-shadow: inset 0 0 18px rgba(34, 211, 238, .10), 0 0 30px rgba(34, 211, 238, .12);
}
.cm-sigil-ring {
  position: absolute;
  inset: -5px;
  border-radius: 19px;
  border: 1px solid rgba(34, 211, 238, .16);
  animation: cmRing 3.6s ease-in-out infinite;
  pointer-events: none;
}
.cm-heading {
  min-width: 0;
  padding-top: 1px;
}
.cm-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .2em;
  color: #5E88A8;
}
.cm-eyebrow b { color: #58C8FF; font-weight: 600; }
.cm-eyebrow i { font-style: normal; color: #2E5170; }
.cm-heading h3 {
  margin: 7px 0 0;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 750;
  letter-spacing: -.02em;
  color: #F0F8FF;
}
.cm-heading p {
  margin: 5px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #8FA8C4;
}
.cm-list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 22px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 3px;
  margin-right: -3px;
}
.cm-list::-webkit-scrollbar { width: 4px; }
.cm-list::-webkit-scrollbar-thumb { background: rgba(88, 196, 255, .22); border-radius: 4px; }
.cm-list::-webkit-scrollbar-track { background: transparent; }
.cm-item {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 14px;
  background: linear-gradient(120deg, rgba(13, 28, 50, .92), rgba(8, 18, 34, .72));
  border: 1px solid rgba(88, 170, 235, .14);
  cursor: pointer;
  transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
}
.cm-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, #22D3EE, #3B82F6);
  opacity: .5;
  transition: opacity .2s;
}
.cm-item:hover {
  border-color: rgba(88, 196, 255, .38);
  background: linear-gradient(120deg, rgba(16, 36, 64, .98), rgba(9, 22, 42, .86));
  transform: translateY(-1px);
}
.cm-item:hover::before { opacity: 1; }
.cm-item.done {
  border-color: rgba(52, 211, 153, .48);
  box-shadow: inset 0 0 0 1px rgba(52, 211, 153, .14), 0 0 26px rgba(52, 211, 153, .08);
}
.cm-idx {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .08em;
  color: #5183AD;
}
.cm-value { min-width: 0; }
.cm-value small {
  display: block;
  margin-bottom: 3px;
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: .16em;
  color: #5FBCE8;
}
.cm-value b {
  display: block;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: .01em;
  color: #EAF6FF;
  overflow-wrap: anywhere;
}
.cm-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 9px;
  border: 1px solid rgba(88, 196, 255, .25);
  background: rgba(20, 50, 84, .45);
  color: #9BD9FF;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: .06em;
  white-space: nowrap;
  transition: color .18s, border-color .18s, background .18s, box-shadow .18s;
}
.cm-copy:hover {
  color: #C8F3FF;
  border-color: rgba(34, 211, 238, .58);
  background: rgba(34, 211, 238, .13);
  box-shadow: 0 0 18px rgba(34, 211, 238, .18);
}
.cm-copy.done {
  color: #6EE7B7;
  border-color: rgba(52, 211, 153, .5);
  background: rgba(16, 185, 129, .10);
  box-shadow: none;
}
.cm-foot {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(88, 170, 235, .12);
  flex-shrink: 0;
}
.cm-hint {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .09em;
  color: #6F8BA6;
}
.cm-hint i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22D3EE;
  box-shadow: 0 0 8px rgba(34, 211, 238, .9);
  animation: cmBlink 2.2s ease-in-out infinite;
}
.cm-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid rgba(34, 211, 238, .4);
  background: linear-gradient(135deg, rgba(34, 211, 238, .16), rgba(59, 130, 246, .18));
  color: #BFEFFF;
  font-size: 11px;
  letter-spacing: .04em;
  white-space: nowrap;
  transition: transform .18s, border-color .18s, box-shadow .18s, color .18s, background .18s;
}
.cm-all b {
  font-family: var(--font-mono);
  font-size: 8.5px;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, .35);
  color: #7FE7FF;
}
.cm-all:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, .7);
  box-shadow: 0 8px 24px rgba(34, 211, 238, .18);
}
.cm-all.done {
  color: #6EE7B7;
  border-color: rgba(52, 211, 153, .55);
  background: rgba(16, 185, 129, .12);
}
.cm-all.done b { color: #6EE7B7; border-color: rgba(52, 211, 153, .4); }
.cm-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes cmPanelIn {
  from { opacity: 0; transform: translateY(14px) scale(.975); }
  to { opacity: 1; transform: none; }
}
@keyframes cmPanelOut {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateY(8px) scale(.985); }
}
@keyframes cmScan {
  0% { top: 0; opacity: 0; }
  6% { opacity: .55; }
  55% { opacity: .35; }
  76%, 100% { top: 100%; opacity: 0; }
}
@keyframes cmRing {
  0%, 100% { opacity: .35; transform: scale(1); }
  50% { opacity: .9; transform: scale(1.04); }
}
@keyframes cmBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: .3; }
}

.cm-fade-enter-active,
.cm-fade-leave-active {
  transition: opacity .26s var(--ease);
}
.cm-fade-enter,
.cm-fade-leave-to { opacity: 0; }
.cm-fade-leave-active .cm-panel { animation: cmPanelOut .22s ease forwards; }

@media (max-width: 560px) {
  .cm { padding: 16px; }
  .cm-panel { padding: 22px 18px 16px; border-radius: 21px; max-height: calc(100vh - 32px); }
  .cm-sigil { width: 46px; height: 46px; border-radius: 13px; }
  .cm-sigil svg { width: 21px; height: 21px; }
  .cm-heading h3 { font-size: 22px; }
  .cm-heading p { font-size: 12px; }
  .cm-item { grid-template-columns: 20px minmax(0, 1fr) auto; gap: 9px; padding: 12px; }
  .cm-value b { font-size: 12.5px; }
  .cm-copy { padding: 6px 9px; }
  .cm-copy span { display: none; }
  .cm-foot { flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .cm-panel,
  .cm-scan,
  .cm-sigil-ring,
  .cm-hint i { animation: none !important; }
  .cm-fade-enter-active,
  .cm-fade-leave-active { transition: none; }
}
</style>
