<template>
  <div class="am" role="dialog" aria-modal="true" aria-labelledby="amTitle">
    <div class="am-backdrop" @click="close"></div>
    <div class="am-box" @click.stop>
      <div class="am-hero">
        <canvas ref="authCanvas" aria-hidden="true"></canvas>
        <div class="am-hero-copy">
          <span class="am-eyebrow">{{ content.auth.eyebrow }}</span>
          <h2 id="amTitle">{{ heroTitle }}</h2>
          <p>{{ heroSub }}</p>
        </div>
        <button class="am-close" type="button" :aria-label="content.common.close" @click="close">×</button>
      </div>

      <div class="am-body">
        <div class="am-tabs" role="tablist">
          <button
            class="am-tab"
            :class="{ on: mode === 'login' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'login' ? 'true' : 'false'"
            @click="setMode('login')">{{ content.auth.login }}</button>
          <button
            class="am-tab"
            :class="{ on: mode === 'register' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'register' ? 'true' : 'false'"
            @click="setMode('register')">{{ content.auth.register }}</button>
        </div>

        <form class="am-form" :class="{ hidden: mode !== 'login' }" novalidate @submit.prevent="submitLogin">
          <label class="am-field">
            <span>{{ content.auth.email }}</span>
            <input
              ref="loginEmail"
              v-model.trim="loginForm.email"
              type="email"
              :placeholder="content.auth.emailPlaceholder"
              autocomplete="email">
          </label>
          <label class="am-field">
            <span>{{ content.auth.password }}</span>
            <div class="am-pass">
              <input
                ref="loginPass"
                v-model="loginForm.password"
                :type="showLoginPass ? 'text' : 'password'"
                :placeholder="content.auth.passwordPlaceholder"
                autocomplete="current-password">
              <button class="am-toggle" type="button" @click="showLoginPass = !showLoginPass">
                {{ showLoginPass ? content.auth.hide : content.auth.show }}
              </button>
            </div>
          </label>
          <div class="am-aux">
            <button class="am-forgot" type="button" @click="goForgot">{{ content.auth.forgot }}</button>
          </div>
          <button class="am-submit" type="submit" :disabled="loading">
            {{ content.auth.login }}
          </button>
        </form>

        <form class="am-form" :class="{ hidden: mode !== 'register' }" novalidate @submit.prevent="submitRegister">
          <label class="am-field">
            <span>{{ content.auth.email }}</span>
            <input
              ref="regEmail"
              v-model.trim="registerForm.email"
              type="email"
              :placeholder="content.auth.emailPlaceholder"
              autocomplete="email">
          </label>
          <label class="am-field">
            <span>{{ content.auth.captcha }}</span>
            <div class="am-captcha">
              <input
                v-model.trim="registerForm.captchaCode"
                maxlength="6"
                :placeholder="content.auth.captchaPlaceholder"
                autocomplete="off">
              <button
                class="am-captcha-box"
                type="button"
                :title="content.auth.captchaRefresh"
                :aria-label="content.auth.captchaRefresh"
                @click="refreshCaptcha">
                <img v-if="captchaImage" :src="captchaImage" alt="">
                <span v-else>{{ content.auth.captchaRefresh }}</span>
              </button>
            </div>
          </label>
          <label class="am-field">
            <span>{{ content.auth.emailCode }}</span>
            <div class="am-code-row">
              <input
                v-model.trim="registerForm.emailCode"
                maxlength="6"
                inputmode="numeric"
                :placeholder="content.auth.emailCodePlaceholder"
                autocomplete="one-time-code">
              <button class="am-code-btn" type="button" :disabled="countdown > 0" @click="sendCode">
                {{ codeBtnText }}
              </button>
            </div>
          </label>
          <label class="am-field">
            <span>{{ content.auth.password }}</span>
            <div class="am-pass">
              <input
                ref="regPass"
                v-model="registerForm.password"
                :type="showRegPass ? 'text' : 'password'"
                :placeholder="content.auth.passwordNewPlaceholder"
                autocomplete="new-password">
              <button class="am-toggle" type="button" @click="showRegPass = !showRegPass">
                {{ showRegPass ? content.auth.hide : content.auth.show }}
              </button>
            </div>
          </label>
          <button class="am-submit" type="submit" :disabled="loading">
            {{ content.auth.register }}
          </button>
          <p class="am-note">{{ content.auth.note }}</p>
        </form>

        <div class="am-msg" :class="msgType">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getCaptcha, sendEmailCode, register, login } from '../api/auth'
import { getUserProfile } from '../api/user'
import { formatText } from '../content/site'
import { decodeJwt } from '../utils/helpers'

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const AUTH_PALETTE = ['59,130,246', '34,211,238', '129,140,248', '167,139,250', '56,189,248', '45,212,191']

function buildHypercube() {
  const verts = []
  const edges = []
  for (let i = 0; i < 64; i++) {
    const p = []
    for (let d = 0; d < 6; d++) p.push((i >> d) & 1 ? 1 : -1)
    verts.push(p)
  }
  for (let i = 0; i < 64; i++) {
    for (let j = i + 1; j < 64; j++) {
      let diff = 0
      let dim = -1
      for (let k = 0; k < 6; k++) {
        if (verts[i][k] !== verts[j][k]) {
          diff++
          dim = k
        }
      }
      if (diff === 1) edges.push([i, j, dim])
    }
  }
  return { verts, edges }
}

const HYPER = buildHypercube()

function rot6(p, a, b, c, d) {
  let t
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  t = p[0] * ca - p[1] * sa
  p[1] = p[0] * sa + p[1] * ca
  p[0] = t
  const cb = Math.cos(b)
  const sb = Math.sin(b)
  t = p[2] * cb - p[3] * sb
  p[3] = p[2] * sb + p[3] * cb
  p[2] = t
  const cc = Math.cos(c)
  const sc = Math.sin(c)
  t = p[4] * cc - p[5] * sc
  p[5] = p[4] * sc + p[5] * cc
  p[4] = t
  const cd = Math.cos(d)
  const sd = Math.sin(d)
  t = p[1] * cd - p[4] * sd
  p[4] = p[1] * sd + p[4] * cd
  p[1] = t
  return p
}

export default {
  name: 'AuthModal',
  props: {
    initialMode: {
      type: String,
      default: 'login'
    }
  },
  data() {
    return {
      mode: this.initialMode === 'register' ? 'register' : 'login',
      loginForm: { email: '', password: '' },
      registerForm: { email: '', password: '', captchaCode: '', emailCode: '' },
      showLoginPass: false,
      showRegPass: false,
      captchaKey: '',
      captchaImage: '',
      countdown: 0,
      timer: null,
      loading: false,
      msg: '',
      msgType: '',
      raf: 0,
      canvas: null,
      ctx: null,
      W: 0,
      H: 0,
      DPR: 1,
      lastTs: 0,
      destroyed: false
    }
  },
  computed: {
    ...mapState(['content']),
    heroTitle() {
      return this.mode === 'login' ? this.content.auth.loginTitle : this.content.auth.registerTitle
    },
    heroSub() {
      return this.mode === 'login' ? this.content.auth.loginSub : this.content.auth.registerSub
    },
    codeBtnText() {
      if (this.countdown > 0) return formatText(this.content.auth.resend, { n: this.countdown })
      return this.content.auth.sendCode
    }
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', this.onKeydown)
    this.$nextTick(() => {
      this.initCanvas()
      this.focusField()
    })
    if (this.mode === 'register') this.refreshCaptcha()
  },
  beforeDestroy() {
    this.destroyed = true
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.timer) clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('keydown', this.onKeydown)
    document.body.style.overflow = ''
  },
  methods: {
    setMode(next) {
      this.mode = next
      this.msg = ''
      this.msgType = ''
      if (next === 'register' && !this.captchaImage) this.refreshCaptcha()
      this.$nextTick(this.focusField)
    },
    focusField() {
      const el = this.mode === 'login' ? this.$refs.loginEmail : this.$refs.regEmail
      if (el) el.focus()
    },
    close() {
      this.$emit('close')
    },
    goForgot() {
      this.close()
      if (this.$route.path !== '/forgot-password') {
        this.$router.push('/forgot-password').catch(() => {})
      }
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.close()
    },
    isValidEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    },
    setMsg(text, type) {
      this.msg = text
      this.msgType = type || ''
    },
    async refreshCaptcha() {
      try {
        const res = await getCaptcha()
        this.captchaKey = res.data.captchaKey || ''
        this.captchaImage = res.data.captchaImage || ''
      } catch (e) {
        this.captchaImage = ''
        this.setMsg(this.content.auth.captchaFail, 'err')
      }
    },
    startCountdown() {
      if (this.timer) clearInterval(this.timer)
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.countdown = 0
        }
      }, 1000)
    },
    async sendCode() {
      if (this.countdown > 0) return
      const email = this.registerForm.email.trim()
      if (!this.isValidEmail(email)) {
        this.setMsg(this.content.auth.emailFirst, 'err')
        this.$refs.regEmail.focus()
        return
      }
      try {
        await sendEmailCode(email)
        this.setMsg(this.content.auth.codeSent, 'ok')
        this.startCountdown()
      } catch (e) {
        this.setMsg(this.errorMessage(e, this.content.auth.sendFail), 'err')
      }
    },
    async submitLogin() {
      const email = this.loginForm.email.trim()
      if (!this.isValidEmail(email)) {
        this.setMsg(this.content.auth.emailInvalid, 'err')
        this.$refs.loginEmail.focus()
        return
      }
      if (!this.loginForm.password) {
        this.setMsg(this.content.auth.passwordRequired, 'err')
        this.$refs.loginPass.focus()
        return
      }
      this.loading = true
      this.setMsg('', '')
      try {
        const res = await login({ email, password: this.loginForm.password })
        const body = res.data || {}
        const token = body.token || (body.data && body.data.token) || (typeof body === 'string' ? body : '')
        if (!token) throw new Error('NO_TOKEN')
        const payload = decodeJwt(token)
        const baseUser = Object.assign({}, payload, { email: payload.email || payload.sub || email })
        await this.$store.dispatch('loginSuccess', { token, user: baseUser })
        try {
          const profileRes = await getUserProfile()
          const profile = profileRes.data || {}
          await this.$store.dispatch('loginSuccess', {
            token,
            user: Object.assign({}, baseUser, profile)
          })
        } catch (e) { /* 导航栏先使用 JWT 中的基础信息 */ }
        if (payload.role === 'admin') localStorage.setItem('adminToken', token)
        this.$message.success(this.content.auth.loginSuccess)
        this.close()
        if (payload.role === 'admin') {
          if (this.$route.path !== '/cpanel') this.$router.push('/cpanel')
        }
      } catch (e) {
        this.setMsg(this.errorMessage(e, this.content.auth.loginFail), 'err')
      } finally {
        this.loading = false
      }
    },
    async submitRegister() {
      const email = this.registerForm.email.trim()
      if (!this.isValidEmail(email)) {
        this.setMsg(this.content.auth.emailInvalid, 'err')
        this.$refs.regEmail.focus()
        return
      }
      if (!this.registerForm.captchaCode) {
        this.setMsg(this.content.auth.captchaRequired, 'err')
        return
      }
      if (!this.registerForm.emailCode) {
        this.setMsg(this.content.auth.emailCodeRequired, 'err')
        return
      }
      if (this.registerForm.password.length < 6) {
        this.setMsg(this.content.auth.passwordShort, 'err')
        this.$refs.regPass.focus()
        return
      }
      this.loading = true
      this.setMsg('', '')
      try {
        await register({
          email,
          password: this.registerForm.password,
          captchaKey: this.captchaKey,
          captchaCode: this.registerForm.captchaCode.toUpperCase(),
          emailCode: this.registerForm.emailCode
        })
        this.$message.success(this.content.auth.registerSuccess)
        this.loginForm.email = email
        this.registerForm.password = ''
        this.registerForm.captchaCode = ''
        this.registerForm.emailCode = ''
        this.setMode('login')
        this.setMsg(this.content.auth.registerSuccess, 'ok')
      } catch (e) {
        this.setMsg(this.errorMessage(e, this.content.auth.registerFail), 'err')
        this.refreshCaptcha()
      } finally {
        this.loading = false
      }
    },
    errorMessage(e, fallback) {
      const data = e && e.response && e.response.data
      return (data && (data.message || data.error)) || fallback
    },
    initCanvas() {
      this.canvas = this.$refs.authCanvas
      if (!this.canvas) return
      this.ctx = this.canvas.getContext('2d')
      this.handleResize()
      window.addEventListener('resize', this.handleResize)
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        this.draw(0)
      } else {
        this.raf = requestAnimationFrame(this.loop)
      }
    },
    handleResize() {
      if (!this.canvas || !this.ctx) return
      this.DPR = Math.min(window.devicePixelRatio || 1, 1.5)
      this.W = this.canvas.clientWidth
      this.H = this.canvas.clientHeight
      this.canvas.width = Math.round(this.W * this.DPR)
      this.canvas.height = Math.round(this.H * this.DPR)
      this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0)
    },
    loop(ts) {
      if (this.destroyed) return
      if (ts - this.lastTs >= 1000 / 30) {
        this.lastTs = ts
        this.draw(ts || 0)
      }
      this.raf = requestAnimationFrame(this.loop)
    },
    draw(t) {
      const ctx = this.ctx
      const canvas = this.canvas
      if (!ctx || !canvas || !this.W || !this.H || !canvas.offsetParent) return
      ctx.clearRect(0, 0, this.W, this.H)
      const cx = this.W * 0.68
      const cy = this.H * 0.52
      const scale = Math.min(this.W * 0.50, this.H) * 0.38 * (1 + Math.sin(t * 0.0006) * 0.025)
      const a = t * 0.00013
      const b = t * 0.00009
      const c = t * 0.00017
      const d = t * 0.00005

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 2.8)
      glow.addColorStop(0, 'rgba(37,99,235,.26)')
      glow.addColorStop(0.55, 'rgba(6,182,212,.08)')
      glow.addColorStop(1, 'rgba(6,182,212,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, scale * 2.8, 0, Math.PI * 2)
      ctx.fill()

      const pts = HYPER.verts.map(v => {
        const q = rot6(v.slice(), a, b, c, d)
        const k = 1 / (1 + 0.14 * (q[3] + q[4] + q[5]))
        const x = (q[0] + 0.55 * q[3]) * k
        const y = (q[1] + 0.55 * q[4]) * k
        const z = (q[2] + 0.55 * q[5]) * k
        const fov = 3.6
        const s = fov / (fov + z * 0.95)
        return { x: cx + x * scale * s, y: cy + y * scale * s, z }
      })

      const segs = HYPER.edges.map(e => {
        const A = pts[e[0]]
        const B = pts[e[1]]
        return { x1: A.x, y1: A.y, x2: B.x, y2: B.y, z: (A.z + B.z) / 2, dim: e[2] }
      })
      segs.sort((m, n) => n.z - m.z)

      ctx.lineCap = 'round'
      for (let s = 0; s < segs.length; s++) {
        const seg = segs[s]
        const dep = Math.max(0, Math.min(1, (1.8 - seg.z) / 3.6))
        ctx.beginPath()
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.strokeStyle = 'rgba(' + AUTH_PALETTE[seg.dim] + ',' + (0.14 + dep * 0.58).toFixed(3) + ')'
        ctx.lineWidth = 0.6 + dep * 1.35
        ctx.stroke()
      }

      for (let v = 0; v < pts.length; v++) {
        const pt = pts[v]
        const dep = Math.max(0, Math.min(1, (1.8 - pt.z) / 3.6))
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 0.7 + dep * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(103,232,249,' + (0.20 + dep * 0.70).toFixed(3) + ')'
        ctx.fill()
      }

    }
  }
}
</script>

<style scoped>
.am {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.am-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 8, 16, .55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.am-box {
  position: relative;
  width: 460px;
  max-width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  box-shadow: 0 40px 100px rgba(0, 0, 0, .45);
  animation: amIn .25s var(--ease);
}
@keyframes amIn {
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to { opacity: 1; transform: none; }
}

/* 顶部 6D 动画 */
.am-hero {
  position: relative;
  height: 170px;
  flex-shrink: 0;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(ellipse 60% 70% at 30% 30%, rgba(37, 99, 235, .38), transparent 66%),
    radial-gradient(ellipse 55% 60% at 85% 80%, rgba(6, 182, 212, .26), transparent 70%),
    linear-gradient(145deg, #07101F 0%, #0A1B33 58%, #072A33 100%);
}
.am-hero canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: .95;
}
.am-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(7, 16, 31, .88) 0%, rgba(7, 16, 31, .48) 48%, rgba(7, 16, 31, .02) 82%);
}
.am-hero-copy {
  position: relative;
  z-index: 2;
  padding: 26px 26px 0;
}
.am-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .16em;
  color: rgba(255, 255, 255, .5);
}
.am-hero h2 {
  font-size: 26px;
  line-height: 1.2;
  letter-spacing: -.035em;
  font-weight: 800;
  margin: 10px 0 4px;
}
.am-hero p {
  font-size: 12px;
  color: rgba(255, 255, 255, .58);
}
.am-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
  color: rgba(255, 255, 255, .8);
  background: rgba(255, 255, 255, .10);
  border: 1px solid rgba(255, 255, 255, .18);
  transition: background .18s var(--ease);
}
.am-close:hover { background: rgba(255, 255, 255, .20); }

/* 表单区 */
.am-body {
  padding: 20px 26px 22px;
  overflow: auto;
}
.am-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--grad-soft);
  border: 1px solid var(--border);
  margin-bottom: 14px;
}
.am-tab {
  flex: 1;
  height: 34px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-2);
  background: none;
  border: none;
  transition: all .18s var(--ease);
}
.am-tab.on {
  background: var(--surface);
  color: var(--brand);
  box-shadow: 0 4px 14px rgba(15, 23, 42, .08);
}
.am-form.hidden { display: none; }
.am-field {
  display: block;
  margin-top: 12px;
}
.am-field > span {
  display: block;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .12em;
  color: var(--text-3);
  margin-bottom: 5px;
}
.am-field input {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 11px;
  padding: 0 12px;
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
.am-field input::placeholder { color: var(--text-3); }
.am-field input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--glow);
}
.am-pass { position: relative; }
.am-pass input { padding-right: 56px; }
.am-toggle {
  position: absolute;
  right: 5px;
  top: 5px;
  height: 32px;
  padding: 0 9px;
  border-radius: 8px;
  border: none;
  background: none;
  font-size: 11px;
  color: var(--text-3);
  transition: all .15s var(--ease);
}
.am-toggle:hover { color: var(--brand); background: var(--grad-soft); }
.am-captcha { display: flex; gap: 8px; }
.am-captcha input { flex: 1; min-width: 0; }
.am-captcha-box {
  width: 96px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--grad-soft);
  color: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  padding: 0;
}
.am-captcha-box img { width: 100%; height: 100%; object-fit: cover; }
.am-code-row { display: flex; gap: 8px; }
.am-code-row input { flex: 1; min-width: 0; }
.am-code-btn {
  height: 42px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: all .15s var(--ease);
}
.am-code-btn:hover:not(:disabled) { border-color: var(--brand); color: var(--brand); }
.am-code-btn:disabled { opacity: .55; cursor: default; }
.am-aux {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.am-forgot {
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-3);
  font-size: 11.5px;
  cursor: pointer;
}
.am-forgot:hover { color: var(--brand); }
.am-submit {
  width: 100%;
  height: 44px;
  margin-top: 16px;
  border-radius: 999px;
  border: none;
  background: var(--grad);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  box-shadow: 0 10px 24px var(--glow);
  transition: transform .18s var(--ease), box-shadow .18s var(--ease);
}
.am-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px var(--glow);
}
.am-submit:disabled { opacity: .65; cursor: default; }
.am-msg {
  min-height: 16px;
  font-size: 11.5px;
  line-height: 1.5;
  margin-top: 10px;
  color: var(--text-3);
}
.am-msg.err { color: #EF4444; }
.am-msg.ok { color: #10B981; }
.am-note {
  font-size: 10.5px;
  color: var(--text-3);
  line-height: 1.6;
  margin-top: 12px;
  text-align: center;
}

@media (max-width: 520px) {
  .am { padding: 12px; }
  .am-box { max-height: 94vh; border-radius: 20px; }
  .am-hero { height: 148px; }
  .am-hero-copy { padding: 20px 20px 0; }
  .am-hero h2 { font-size: 23px; }
  .am-body { padding: 16px 18px 18px; }
  .am-captcha-box { width: 88px; font-size: 9px; }
  .am-hero p { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .am-box { animation: none; }
}
</style>
