<template>
  <canvas ref="cv" class="silk-canvas" aria-hidden="true"></canvas>
</template>

<script>
import { mapState } from 'vuex'

const TAU = Math.PI * 2

export default {
  name: 'SilkFlowCanvas',
  computed: {
    ...mapState(['theme']),
    dark() { return this.theme === 'dark' }
  },
  watch: {
    theme() {
      if (this.reduced) this.draw(0)
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.destroyed = true
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.io) this.io.disconnect()
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('mousemove', this.moveHandler)
  },
  methods: {
    init() {
      this.canvas = this.$refs.cv
      if (!this.canvas) return
      this.ctx = this.canvas.getContext('2d')
      this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      this.W = 0
      this.H = 0
      this.dpr = 1
      this.raf = 0
      this.last = 0
      this.visible = true
      this.mx = 0
      this.my = 0
      this.tx = 0
      this.ty = 0

      this.setupParticles()

      this.resizeHandler = this.resize.bind(this)
      this.moveHandler = this.onMove.bind(this)
      window.addEventListener('resize', this.resizeHandler)
      window.addEventListener('mousemove', this.moveHandler)

      this.resize()

      if ('IntersectionObserver' in window) {
        this.io = new IntersectionObserver(entries => {
          this.visible = entries[0].isIntersecting
        }, { threshold: 0 })
        this.io.observe(this.$el)
      }

      if (this.reduced) {
        this.draw(0)
      } else {
        this.loop = this.loop.bind(this)
        this.raf = requestAnimationFrame(this.loop)
      }
    },

    onMove(e) {
      this.mx = (e.clientX / window.innerWidth - 0.5) * 2
      this.my = (e.clientY / window.innerHeight - 0.5) * 2
    },

    resize() {
      if (!this.canvas) return
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      this.W = this.canvas.clientWidth
      this.H = this.canvas.clientHeight
      this.canvas.width = Math.round(this.W * this.dpr)
      this.canvas.height = Math.round(this.H * this.dpr)
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      if (this.reduced) this.draw(0)
    },

    loop(ts) {
      if (this.visible && ts - this.last >= 1000 / 30) {
        this.last = ts
        this.draw(ts)
      }
      this.raf = requestAnimationFrame(this.loop)
    },

    setupParticles() {
      this.parts = []
      for (let i = 0; i < 54; i++) {
        this.parts.push({
          p: Math.random(),
          a: Math.random() * TAU,
          r: 0.65 + Math.random() * 0.55,
          sp: 0.000018 + Math.random() * 0.000040,
          s: 0.6 + Math.random() * 1.9,
          ph: Math.random() * TAU
        })
      }
    },

    palette() {
      return this.dark
        ? ['96,165,250', '34,211,238', '129,140,248', '167,139,250', '56,189,248', '196,181,253']
        : ['37,99,235', '8,145,178', '79,70,229', '124,58,237', '14,165,233', '59,130,246']
    },

    project(x, y, z, cx, cy, fov, cosY, sinY, cosX, sinX) {
      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX
      const persp = fov / (fov + z2)
      return [cx + x1 * persp, cy + y1 * persp, z2, persp]
    },

    draw(t) {
      if (!this.W || !this.H) return
      const ctx = this.ctx
      const W = this.W
      const H = this.H
      ctx.clearRect(0, 0, W, H)

      const narrow = W < 900
      const cx = narrow ? W * 0.5 : W * 0.315
      const cy = narrow ? H * 0.285 : H * 0.50
      const min = Math.min(W, H)
      const R = min * (narrow ? 0.185 : 0.165)
      const HGT = min * (narrow ? 0.72 : 0.67)
      const fov = Math.max(520, min * 1.05)
      const pal = this.palette()
      const darkMode = this.dark
      const beat = 0.5 + 0.5 * Math.sin(t * 0.00055)

      this.tx += (this.mx - this.tx) * 0.06
      this.ty += (this.my - this.ty) * 0.06

      // ambient halo
      const gr = min * (0.52 + 0.035 * Math.sin(t * 0.0004))
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr)
      glow.addColorStop(0, 'rgba(' + (darkMode ? '59,130,246' : '37,99,235') + ',' + (darkMode ? 0.15 : 0.09) + ')')
      glow.addColorStop(0.42, 'rgba(' + (darkMode ? '34,211,238' : '6,182,212') + ',' + (darkMode ? 0.075 : 0.045) + ')')
      glow.addColorStop(1, 'rgba(6,182,212,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const cosY = Math.cos(t * 0.000065 + this.tx * 0.22)
      const sinY = Math.sin(t * 0.000065 + this.tx * 0.22)
      const cosX = Math.cos(0.16 + this.ty * 0.14)
      const sinX = Math.sin(0.16 + this.ty * 0.14)

      // pearl core behind the ribbons
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, min * 0.24)
      coreGlow.addColorStop(0, 'rgba(255,255,255,' + (darkMode ? 0.14 : 0.24) + ')')
      coreGlow.addColorStop(0.32, 'rgba(' + (darkMode ? '125,211,252' : '14,165,233') + ',' + (darkMode ? 0.10 : 0.09) + ')')
      coreGlow.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = coreGlow
      ctx.fillRect(cx - min * 0.26, cy - min * 0.26, min * 0.52, min * 0.52)

      const ribbons = []
      const N = 6
      for (let i = 0; i < N; i++) {
        const turns = 0.86 + i * 0.075
        const phase = i * 1.05 + t * (0.000070 + i * 0.000006)
        const rScale = 0.68 + 0.32 * Math.sin(i * 1.9 + 0.6)
        const xOff = R * 0.16 * Math.cos(i * 1.7)
        const yOff = HGT * 0.035 * Math.sin(i * 1.9)
        const pts = []
        let zsum = 0
        const SEG = 90
        for (let j = 0; j <= SEG; j++) {
          const p = j / SEG
          const ang = p * TAU * turns + phase
          const env = 0.52 + 0.48 * Math.sin(p * Math.PI)
          const rr = R * env * rScale * (0.94 + 0.06 * Math.sin(t * 0.00042 + i * 1.7))
          const wob = Math.sin(p * Math.PI * 2.2 + t * 0.00030 + i * 0.9) * R * 0.07
          const bend = Math.sin((p - 0.5) * Math.PI * 1.15 + t * 0.00022) * R * 0.24
          const x = Math.cos(ang) * rr + xOff + wob + bend
          const y = (p - 0.5) * HGT + yOff + Math.sin(p * Math.PI * 2 + t * 0.00034 + i * 0.7) * H * 0.012
          const z = Math.sin(ang) * rr
          const q = this.project(x, y, z, cx, cy, fov, cosY, sinY, cosX, sinX)
          pts.push(q)
          zsum += q[2]
        }
        const avgZ = zsum / pts.length
        const depth = Math.max(0, Math.min(1, (R - avgZ) / (R * 2)))
        ribbons.push({ pts, i, depth, wide: i % 3 === 0, fine: i >= 4 })
      }
      ribbons.sort((a, b) => b.depth - a.depth)

      for (const rb of ribbons) {
        const pts = rb.pts
        const wBase = min * (rb.fine ? 0.008 : rb.wide ? 0.043 : 0.024)
        const left = []
        const right = []
        const center = []
        let minY = Infinity
        let maxY = -Infinity
        for (let j = 0; j < pts.length; j++) {
          const p = pts[j]
          const a = pts[Math.max(0, j - 1)]
          const b = pts[Math.min(pts.length - 1, j + 1)]
          let nx = -(b[1] - a[1])
          let ny = b[0] - a[0]
          const len = Math.hypot(nx, ny) || 1
          nx /= len
          ny /= len
          const t01 = j / (pts.length - 1)
          const w = wBase * (0.22 + 0.78 * Math.sin(t01 * Math.PI)) * p[3]
          left.push([p[0] + nx * w * 0.5, p[1] + ny * w * 0.5])
          right.push([p[0] - nx * w * 0.5, p[1] - ny * w * 0.5])
          center.push([p[0], p[1]])
          if (p[1] < minY) minY = p[1]
          if (p[1] > maxY) maxY = p[1]
        }
        const c1 = pal[rb.i % pal.length]
        const c2 = pal[(rb.i + 2) % pal.length]
        const grad = ctx.createLinearGradient(0, minY, 0, maxY)
        const al = darkMode ? (rb.fine ? 0.30 : 0.22) : (rb.fine ? 0.40 : 0.30)
        grad.addColorStop(0, 'rgba(' + c1 + ',0)')
        grad.addColorStop(0.16, 'rgba(' + c1 + ',' + (al * 0.55) + ')')
        grad.addColorStop(0.48, 'rgba(' + c2 + ',' + al + ')')
        grad.addColorStop(0.76, 'rgba(' + c1 + ',' + (al * 0.85) + ')')
        grad.addColorStop(1, 'rgba(' + c2 + ',0)')

        ctx.beginPath()
        ctx.moveTo(left[0][0], left[0][1])
        for (let j = 1; j < left.length; j++) ctx.lineTo(left[j][0], left[j][1])
        for (let j = right.length - 1; j >= 0; j--) ctx.lineTo(right[j][0], right[j][1])
        ctx.closePath()
        ctx.globalAlpha = 0.55 + rb.depth * 0.45
        ctx.fillStyle = grad
        ctx.fill()
        ctx.globalAlpha = 1

        // satin edge
        ctx.beginPath()
        ctx.moveTo(left[0][0], left[0][1])
        for (let j = 1; j < left.length; j++) ctx.lineTo(left[j][0], left[j][1])
        ctx.strokeStyle = 'rgba(255,255,255,' + (darkMode ? 0.30 : 0.55) + ')'
        ctx.lineWidth = 0.9 + rb.depth * 0.7
        ctx.stroke()

        if (rb.wide) {
          ctx.beginPath()
          ctx.moveTo(center[0][0], center[0][1])
          for (let j = 1; j < center.length; j++) ctx.lineTo(center[j][0], center[j][1])
          ctx.strokeStyle = 'rgba(255,255,255,' + (darkMode ? 0.14 : 0.24) + ')'
          ctx.lineWidth = 1.3
          ctx.stroke()
        }
      }

      // loose silk threads
      for (let k = 0; k < 4; k++) {
        const pts = []
        const turns = 1.26 + k * 0.22
        const phase = k * 2.1 + t * 0.00009 * (k % 2 === 0 ? 1 : -1)
        for (let j = 0; j <= 80; j++) {
          const p = j / 80
          const ang = p * TAU * turns + phase
          const env = 0.42 + 0.58 * Math.sin(p * Math.PI)
          const rr = R * 1.08 * env
          const x = Math.cos(ang) * rr + Math.sin(t * 0.00023 + k) * R * 0.12
          const y = (p - 0.5) * HGT * 1.06 + Math.sin(p * Math.PI * 2.4 + t * 0.0003 + k) * H * 0.01
          const z = Math.sin(ang) * rr
          pts.push(this.project(x, y, z, cx, cy, fov, cosY, sinY, cosX, sinX))
        }
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1])
        ctx.strokeStyle = 'rgba(' + pal[(k + 1) % pal.length] + ',' + (darkMode ? 0.38 : 0.30) + ')'
        ctx.lineWidth = 0.75
        ctx.stroke()
      }

      // drifting particles
      for (const pt of this.parts) {
        const ang = pt.a + t * pt.sp * 6
        const env = 0.55 + 0.45 * Math.sin(pt.p * Math.PI)
        const rr = R * env * pt.r + R * 0.10
        const x = Math.cos(ang) * rr + Math.sin(t * 0.0003 + pt.ph) * R * 0.06
        const y = (pt.p - 0.5) * HGT + Math.sin(t * 0.0004 + pt.ph) * H * 0.02
        const z = Math.sin(ang) * rr
        const q = this.project(x, y, z, cx, cy, fov, cosY, sinY, cosX, sinX)
        if (q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) continue
        const depth = Math.max(0, Math.min(1, (R - q[2]) / (R * 2)))
        const alpha = (0.10 + depth * 0.40) * (0.65 + 0.35 * Math.sin(t * 0.001 + pt.ph))
        const color = pal[(pt.ph * 3 | 0) % pal.length]
        ctx.beginPath()
        ctx.arc(q[0], q[1], pt.s * (0.7 + depth * 0.6), 0, TAU)
        ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')'
        ctx.fill()
        if (pt.s > 1.7) {
          ctx.beginPath()
          ctx.arc(q[0], q[1], pt.s * 3.2, 0, TAU)
          ctx.fillStyle = 'rgba(' + color + ',' + (alpha * 0.16).toFixed(3) + ')'
          ctx.fill()
        }
      }

      // inner light
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, min * 0.16)
      core.addColorStop(0, 'rgba(255,255,255,' + (darkMode ? 0.10 : 0.16) + ')')
      core.addColorStop(0.4, 'rgba(' + (darkMode ? '125,211,252' : '14,165,233') + ',' + (0.06 + beat * 0.03) + ')')
      core.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = core
      ctx.fillRect(cx - min * 0.2, cy - min * 0.2, min * 0.4, min * 0.4)
    }
  }
}
</script>

<style scoped>
.silk-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
