<template>
  <canvas ref="cv" class="geo-canvas" aria-hidden="true"></canvas>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'GeometryCanvas',
  props: {
    variant: {
      type: String,
      default: 'cell' // cell | cy
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.io) this.io.disconnect()
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    init() {
      this.canvas = this.$refs.cv
      if (!this.canvas) return
      this.ctx = this.canvas.getContext('2d')
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      this.w = 0
      this.h = 0
      this.dpr = 1
      this.visible = true
      this.booted = false
      this.snap = null
      this.snapAt = 0
      this.nextRefresh = 0
      this.last = 0

      this.setup()

      this.onResize = this.resize.bind(this)
      window.addEventListener('resize', this.onResize)
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

    isDark() {
      return this.theme === 'dark'
    },

    palette() {
      return this.isDark()
        ? ['96,165,250', '34,211,238', '129,140,248', '167,139,250', '56,189,248', '147,197,253']
        : ['37,99,235', '6,182,212', '99,102,241', '139,92,246', '14,165,233', '59,130,246']
    },

    bgGlow(ctx, w, h, cx, cy, r, rgb) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(' + rgb + ',.07)')
      g.addColorStop(0.55, 'rgba(' + rgb + ',.03)')
      g.addColorStop(1, 'rgba(' + rgb + ',0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },

    setup() {
      if (this.variant === 'cy') this.setupCY()
      else this.setupCell()
    },

    resize() {
      if (!this.canvas) return
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      this.w = this.canvas.clientWidth
      this.h = this.canvas.clientHeight
      this.canvas.width = Math.round(this.w * this.dpr)
      this.canvas.height = Math.round(this.h * this.dpr)
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      if (this.reduced) this.draw(0)
    },

    loop(ts) {
      if (this.visible && ts - this.last >= 1000 / 30) {
        this.last = ts
        this.tick(ts)
        this.draw(ts)
      }
      this.raf = requestAnimationFrame(this.loop)
    },

    tick(ts) {
      if (!this.booted) {
        this.booted = true
        this.nextRefresh = ts + 10000
        return
      }
      if (ts >= this.nextRefresh) this.refresh(ts)
    },

    refresh(ts) {
      if (!this.w) return
      try {
        const off = document.createElement('canvas')
        off.width = this.canvas.width
        off.height = this.canvas.height
        off.getContext('2d').drawImage(this.canvas, 0, 0)
        this.snap = off
        this.snapAt = ts
      } catch (e) {
        this.snap = null
      }
      this.reroll()
      this.nextRefresh = ts + 10000
    },

    reroll() {
      if (this.variant === 'cy') {
        this.aTgt = 0.20 + Math.random() * 0.48
        this.rxBase = 0.25 + Math.random() * 0.40
        this.scaleK = 0.225 + Math.random() * 0.03
        this.shift = (this.shift + 1 + Math.floor(Math.random() * 5)) % 6
      } else {
        this.aSpd = 0.00010 + Math.random() * 0.00014
        this.bSpd = 0.00006 + Math.random() * 0.00012
        this.proj = 0.72 + Math.random() * 0.20
        this.rxBase = 0.22 + Math.random() * 0.55
        this.scaleK = 0.155 + Math.random() * 0.035
        this.shift = (this.shift + 1 + Math.floor(Math.random() * 5)) % 6
      }
    },

    drawSnap(ts) {
      if (!this.snap) return
      const p = (ts - this.snapAt) / 1400
      if (p >= 1) {
        this.snap = null
        return
      }
      const e = p * p * (3 - 2 * p)
      this.ctx.save()
      this.ctx.globalAlpha = 1 - e
      this.ctx.drawImage(this.snap, 0, 0, this.w, this.h)
      this.ctx.restore()
    },

    draw(t) {
      if (!this.w || !this.h) return
      if (this.variant === 'cy') this.drawCY(t)
      else this.drawCell(t)
    },

    /* ---------- 2. 24-cell ---------- */
    setupCell() {
      this.aSpd = 0.00016
      this.bSpd = 0.00011
      this.proj = 0.85
      this.rxBase = 0.45
      this.scaleK = 0.17
      this.shift = 0
      this.cellVerts = []
      this.cellEdges = []
      const signs = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
      const pos = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
      for (let p = 0; p < pos.length; p++) {
        for (let s = 0; s < signs.length; s++) {
          const v = [0, 0, 0, 0]
          v[pos[p][0]] = signs[s][0]
          v[pos[p][1]] = signs[s][1]
          this.cellVerts.push(v)
        }
      }
      for (let i = 0; i < this.cellVerts.length; i++) {
        for (let j = i + 1; j < this.cellVerts.length; j++) {
          let d = 0
          for (let k = 0; k < 4; k++) {
            const df = this.cellVerts[i][k] - this.cellVerts[j][k]
            d += df * df
          }
          if (Math.abs(d - 2) < 1e-6) this.cellEdges.push([i, j])
        }
      }
    },

    rot4(p, a, b) {
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const x = p[0] * ca - p[1] * sa
      const y = p[0] * sa + p[1] * ca
      const cb = Math.cos(b)
      const sb = Math.sin(b)
      const z = p[2] * cb - p[3] * sb
      const w = p[2] * sb + p[3] * cb
      return [x, y, z, w]
    },

    rot3(p, rx, ry) {
      const cy = Math.cos(ry)
      const sy = Math.sin(ry)
      const x1 = p[0] * cy - p[2] * sy
      const z1 = p[0] * sy + p[2] * cy
      const cx = Math.cos(rx)
      const sx = Math.sin(rx)
      const y1 = p[1] * cx - z1 * sx
      const z2 = p[1] * sx + z1 * cx
      return [x1, y1, z2]
    },

    drawCell(t) {
      const ctx = this.ctx
      const W = this.w
      const H = this.h
      ctx.clearRect(0, 0, W, H)
      const narrow = W < 900
      const compact = H < 420
      const cx = (narrow || compact) ? W * 0.5 : W * 0.68
      const cy = compact ? H * 0.5 : (narrow ? H * 0.34 : H * 0.50)
      const scale = Math.min(W, H) * (compact ? 0.36 : (narrow ? this.scaleK * 1.3 : this.scaleK))
      this.bgGlow(ctx, W, H, cx, cy, scale * 3.2, '6,182,212')
      const pal = this.palette()
      const a = t * this.aSpd
      const b = t * this.bSpd
      const rx = this.rxBase
      const ry = t * 0.00009
      const P = []
      for (let i = 0; i < this.cellVerts.length; i++) {
        const r4 = this.rot4(this.cellVerts[i], a, b)
        const k = 3.2 / (3.2 - r4[3] * this.proj)
        const rp = this.rot3([r4[0] * k, r4[1] * k, r4[2] * k], rx, ry)
        const fov = 5.0
        const d = fov / (fov + rp[2])
        P.push([cx + rp[0] * scale * d, cy + rp[1] * scale * d, rp[2]])
      }
      for (let e = 0; e < this.cellEdges.length; e++) {
        const A = P[this.cellEdges[e][0]]
        const B = P[this.cellEdges[e][1]]
        const dep = Math.max(0, Math.min(1, (1.8 - (A[2] + B[2]) / 2) / 3.6))
        ctx.beginPath()
        ctx.moveTo(A[0], A[1])
        ctx.lineTo(B[0], B[1])
        ctx.strokeStyle = 'rgba(' + pal[((this.cellEdges[e][0] + this.cellEdges[e][1]) + this.shift) % 6] + ',' + (0.10 + dep * 0.55).toFixed(3) + ')'
        ctx.lineWidth = 0.6 + dep * 1.3
        ctx.stroke()
      }
      for (let n = 0; n < P.length; n++) {
        const pt = P[n]
        const dep2 = Math.max(0, Math.min(1, (1.8 - pt[2]) / 3.6))
        ctx.beginPath()
        ctx.arc(pt[0], pt[1], 1.2 + dep2 * 2.6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(6,182,212,' + (0.25 + dep2 * 0.65).toFixed(3) + ')'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pt[0], pt[1], 4 + dep2 * 8, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(37,99,235,' + (0.03 + dep2 * 0.08).toFixed(3) + ')'
        ctx.fill()
      }
      this.drawSnap(t)
    },

    /* ---------- 3. Calabi–Yau ---------- */
    setupCY() {
      this.CY_N = 5
      this.CY_GP = 8
      this.aCur = 0.4
      this.aTgt = 0.4
      this.rxBase = 0.45
      this.scaleK = 0.24
      this.shift = 0
      this.cyCurves = []
      const X0 = 0
      const X1 = Math.PI / 2
      const Y0 = -Math.PI / 2
      const Y1 = Math.PI / 2
      for (let k1 = 0; k1 < this.CY_N; k1++) {
        for (let k2 = 0; k2 < this.CY_N; k2++) {
          const ci = (k1 + k2 * 2) % 6
          for (let iy = 0; iy <= this.CY_GP; iy++) {
            const y = Y0 + (Y1 - Y0) * iy / this.CY_GP
            const pts = []
            for (let ix = 0; ix <= this.CY_GP; ix++) {
              pts.push(this.cyPoint(X0 + (X1 - X0) * ix / this.CY_GP, y, k1, k2))
            }
            this.cyCurves.push({ pts, ci, a: 0.16 })
          }
          for (let ix = 0; ix <= this.CY_GP; ix++) {
            const x = X0 + (X1 - X0) * ix / this.CY_GP
            const pts = []
            for (let iy = 0; iy <= this.CY_GP; iy++) {
              pts.push(this.cyPoint(x, Y0 + (Y1 - Y0) * iy / this.CY_GP, k1, k2))
            }
            this.cyCurves.push({ pts, ci: (ci + 3) % 6, a: 0.12 })
          }
        }
      }
    },

    cpow(re, im, p) {
      const r = Math.hypot(re, im)
      const th = Math.atan2(im, re)
      const rr = Math.pow(r, p)
      return [rr * Math.cos(p * th), rr * Math.sin(p * th)]
    },

    cosC(x, y) {
      return [Math.cos(x) * Math.cosh(y), -Math.sin(x) * Math.sinh(y)]
    },

    sinC(x, y) {
      return [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)]
    },

    cyPoint(x, y, k1, k2) {
      const c1 = this.cosC(x, y)
      const s1 = this.sinC(x, y)
      const c = this.cpow(c1[0], c1[1], 2 / this.CY_N)
      const sn = this.cpow(s1[0], s1[1], 2 / this.CY_N)
      const a1 = 2 * Math.PI * k1 / this.CY_N
      const a2 = 2 * Math.PI * k2 / this.CY_N
      const z1r = c[0] * Math.cos(a1) - c[1] * Math.sin(a1)
      const z1i = c[0] * Math.sin(a1) + c[1] * Math.cos(a1)
      const z2r = sn[0] * Math.cos(a2) - sn[1] * Math.sin(a2)
      const z2i = sn[0] * Math.sin(a2) + sn[1] * Math.cos(a2)
      return [z1r, z2r, z1i, z2i]
    },

    drawCY(t) {
      const ctx = this.ctx
      const W = this.w
      const H = this.h
      ctx.clearRect(0, 0, W, H)
      const narrow = W < 900
      const compact = H < 420
      const cx = (narrow || compact) ? W * 0.5 : W * 0.33
      const cy = compact ? H * 0.5 : (narrow ? H * 0.34 : H * 0.50)
      this.aCur += (this.aTgt - this.aCur) * 0.06
      const ca = Math.cos(this.aCur)
      const sa = Math.sin(this.aCur)
      const scale = Math.min(W, H) * (compact ? 0.26 : (narrow ? this.scaleK * 1.15 : this.scaleK))
      const rx = this.rxBase
      const ry = t * 0.00010
      this.bgGlow(ctx, W, H, cx, cy, scale * 3.0, '99,102,241')
      const pal = this.palette()
      const out = []
      for (let i = 0; i < this.cyCurves.length; i++) {
        const cv = this.cyCurves[i]
        const pp = []
        let zs = 0
        for (let j = 0; j < cv.pts.length; j++) {
          const p4 = cv.pts[j]
          const rp = this.rot3([p4[0], p4[1], p4[2] * ca + p4[3] * sa], rx, ry)
          const fov = 6.5
          const d = fov / (fov + rp[2])
          pp.push([cx + rp[0] * scale * d, cy + rp[1] * scale * d, rp[2]])
          zs += rp[2]
        }
        out.push({ p: pp, z: zs / pp.length, rgb: pal[(cv.ci + this.shift) % 6], a: cv.a })
      }
      out.sort((a, b) => b.z - a.z)
      for (let q = 0; q < out.length; q++) {
        const o = out[q]
        const dep = Math.max(0, Math.min(1, (1.4 - o.z) / 2.8))
        ctx.beginPath()
        for (let m = 0; m < o.p.length; m++) {
          const pt = o.p[m]
          if (m === 0) ctx.moveTo(pt[0], pt[1])
          else ctx.lineTo(pt[0], pt[1])
        }
        ctx.strokeStyle = 'rgba(' + o.rgb + ',' + (o.a * (0.35 + dep * 1.2)).toFixed(3) + ')'
        ctx.lineWidth = 0.5 + dep * 0.8
        ctx.stroke()
      }
      this.drawSnap(t)
    }
  }
}
</script>

<style scoped>
.geo-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
