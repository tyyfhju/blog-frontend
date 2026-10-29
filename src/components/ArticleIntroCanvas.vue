<template>
  <canvas ref="canvas" class="intro-canvas" aria-hidden="true"></canvas>
</template>

<script>
/* 文章详情入场动画：二十面体 + 三个新的视觉变体 */
const PHI = (1 + Math.sqrt(5)) / 2

const BASE_PTS = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
].map(v => {
  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  return [v[0] / l, v[1] / l, v[2] / l]
})

const CORE_EDGES = []
for (let i = 0; i < BASE_PTS.length; i++) {
  for (let j = i + 1; j < BASE_PTS.length; j++) {
    const dx = BASE_PTS[i][0] - BASE_PTS[j][0]
    const dy = BASE_PTS[i][1] - BASE_PTS[j][1]
    const dz = BASE_PTS[i][2] - BASE_PTS[j][2]
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.15) CORE_EDGES.push([i, j])
  }
}

const CORE_PARTICLES = []
for (let i = 0; i < 60; i++) {
  const a = Math.random() * Math.PI * 2
  const b = Math.acos(2 * Math.random() - 1)
  const r = 1.4 + Math.random() * 1.7
  CORE_PARTICLES.push({
    x: r * Math.sin(b) * Math.cos(a),
    y: r * Math.sin(b) * Math.sin(a),
    z: r * Math.cos(b),
    s: 0.5 + Math.random() * 1.4,
    o: 0.12 + Math.random() * 0.45
  })
}

function project(pt, rotX, rotY, cx, cy, scale) {
  const x = pt[0]
  const y = pt[1]
  const z = pt[2]
  const cY = Math.cos(rotY)
  const sY = Math.sin(rotY)
  const x1 = x * cY - z * sY
  const z1 = x * sY + z * cY
  const cX = Math.cos(rotX)
  const sX = Math.sin(rotX)
  const y1 = y * cX - z1 * sX
  const z2 = y * sX + z1 * cX
  const fov = 3.4
  const s = fov / (fov + z2)
  return { x: cx + x1 * scale * s, y: cy + y1 * scale * s, z: z2, s }
}

export default {
  name: 'ArticleIntroCanvas',
  props: {
    progress: { type: Number, default: 0 },
    variant: { type: Number, default: 1 }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      W: 0,
      H: 0,
      DPR: 1,
      raf: 0,
      lastTs: 0,
      time: 0,
      reduced: false,
      destroyed: false,
      ribbons: [],
      ribbonDust: [],
      orbits: [
        { radius: 0.94, tiltX: 0.52, tiltY: 0.20, tiltZ: 0.12, speed: 0.00018, color: '59,130,246', color2: '34,211,238', satellites: [0.2, 2.4, 4.7] },
        { radius: 0.76, tiltX: 1.12, tiltY: 0.90, tiltZ: 0.55, speed: -0.00014, color: '34,211,238', color2: '103,232,249', satellites: [1.1, 4.1] },
        { radius: 0.58, tiltX: -0.62, tiltY: 1.45, tiltZ: -0.42, speed: 0.00022, color: '167,139,250', color2: '196,181,253', satellites: [2.8] }
      ]
    }
  },
  computed: {
    dark() {
      return this.$store.state.theme === 'dark'
    }
  },
  watch: {
    variant() {
      this.initVariant()
    }
  },
  mounted() {
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null
    this.initVariant()
    this.resize()
    window.addEventListener('resize', this.onResize)
    if (this.reduced) {
      this.draw(0)
    } else {
      this.raf = requestAnimationFrame(this.loop)
    }
  },
  beforeDestroy() {
    this.destroyed = true
    if (this.raf) cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.resize()
      if (this.reduced) this.draw(0)
    },
    resize() {
      if (!this.canvas || !this.ctx) return
      this.DPR = Math.min(window.devicePixelRatio || 1, 2)
      this.W = this.canvas.clientWidth
      this.H = this.canvas.clientHeight
      this.canvas.width = Math.round(this.W * this.DPR)
      this.canvas.height = Math.round(this.H * this.DPR)
      this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0)
    },
    initVariant() {
      if (this.variant === 2) this.initRibbons()
    },
    initRibbons() {
      const palette = [
        ['96,165,250', '34,211,238'],
        ['59,130,246', '129,140,248'],
        ['34,211,238', '45,212,191'],
        ['167,139,250', '99,102,241'],
        ['56,189,248', '59,130,246']
      ]
      this.ribbons = palette.map((colors, i) => ({
        c1: colors[0],
        c2: colors[1],
        phase: i * 1.37,
        speed: 0.00007 + i * 0.000012,
        freq: 1.8 + i * 0.55,
        amp: 46 + i * 10,
        offset: (i - 2) * 62,
        width: 54 + i * 8
      }))
      this.ribbonDust = Array.from({ length: 74 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        vx: 0.000003 + Math.random() * 0.000009,
        r: 0.6 + Math.random() * 1.7,
        a: 0.12 + Math.random() * 0.34,
        phase: Math.random() * Math.PI * 2,
        color: palette[i % palette.length][0]
      }))
    },
    loop(ts) {
      if (this.destroyed) return
      if (ts - this.lastTs >= 1000 / 30) {
        this.lastTs = ts
        this.time = ts || 0
        this.draw(ts || 0)
      }
      this.raf = requestAnimationFrame(this.loop)
    },
    draw(ts) {
      if (!this.ctx || !this.W || !this.H) return
      this.time = ts || this.time
      const p = {
        cx: this.W * 0.5,
        cy: this.H * (0.48 - 0.02 * this.progress),
        scale: Math.min(this.W, this.H) * (0.27 - 0.13 * this.progress),
        rotX: this.time * 0.00011 + this.progress * Math.PI * 0.6,
        rotY: this.time * 0.00016 + this.progress * Math.PI * 1.4
      }
      if (this.variant === 1) this.drawIcosa(p)
      else if (this.variant === 2) this.drawRibbons(p)
      else if (this.variant === 3) this.drawOrbits(p)
      else this.drawHelix(p)
    },

    /* 1. 二十面体 */
    drawIcosa(p) {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.W, this.H)
      const glow = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.scale * 2.6)
      glow.addColorStop(0, 'rgba(6,182,212,.14)')
      glow.addColorStop(0.55, 'rgba(37,99,235,.05)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(p.cx, p.cy, p.scale * 2.6, 0, Math.PI * 2)
      ctx.fill()

      const pts = BASE_PTS.map(v => project(v, p.rotX, p.rotY, p.cx, p.cy, p.scale))
      for (let e = 0; e < CORE_EDGES.length; e++) {
        const A = pts[CORE_EDGES[e][0]]
        const B = pts[CORE_EDGES[e][1]]
        const depth = (A.z + B.z) / 2
        const alpha = 0.18 + Math.max(0, Math.min(0.58, (1.2 - depth) * 0.32))
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.strokeStyle = 'rgba(37,99,235,' + alpha.toFixed(3) + ')'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      for (let v = 0; v < pts.length; v++) {
        const pt = pts[v]
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, Math.max(1.3, 3 * pt.s), 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(6,182,212,' + (0.32 + (1.2 - pt.z) * 0.32).toFixed(3) + ')'
        ctx.fill()
      }
      for (let k = 0; k < CORE_PARTICLES.length; k++) {
        const pp = CORE_PARTICLES[k]
        const q = project([pp.x, pp.y, pp.z], p.rotX * 1.12, p.rotY * 1.08, p.cx, p.cy, p.scale)
        ctx.beginPath()
        ctx.arc(q.x, q.y, pp.s * q.s, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(37,99,235,' + (pp.o * (0.45 + this.progress * 0.55)).toFixed(3) + ')'
        ctx.fill()
      }
    },

    /* 2. 极光绸带 */
    drawRibbons(p) {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.W, this.H)
      const cx = this.W * 0.5
      const cy = this.H * (0.50 - 0.025 * this.progress)
      const alpha = this.dark ? 0.30 : 0.19
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(this.W, this.H) * 0.62)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.10)' : 'rgba(37,99,235,.06)')
      glow.addColorStop(1, 'rgba(6,182,212,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, Math.min(this.W, this.H) * 0.62, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.globalCompositeOperation = this.dark ? 'lighter' : 'source-over'
      const step = Math.max(12, this.W / 120)
      for (let r = 0; r < this.ribbons.length; r++) {
        const ribbon = this.ribbons[r]
        const pts = []
        const phase = this.time * ribbon.speed + ribbon.phase
        const baseY = cy + ribbon.offset
        for (let x = -100; x <= this.W + 100; x += step) {
          const nx = (x / this.W) * 2 - 1
          const wave = Math.sin(nx * ribbon.freq + phase) * ribbon.amp
            + Math.sin(nx * ribbon.freq * 2.6 + phase * 0.7) * ribbon.amp * 0.28
          const thick = ribbon.width * (0.76 + 0.24 * Math.sin(nx * 2.4 + phase * 1.3))
          pts.push({ x, y: baseY + wave, w: thick })
        }
        const grad = ctx.createLinearGradient(0, 0, this.W, 0)
        grad.addColorStop(0, 'rgba(' + ribbon.c1 + ',0)')
        grad.addColorStop(0.16, 'rgba(' + ribbon.c1 + ',' + (alpha * 0.55).toFixed(3) + ')')
        grad.addColorStop(0.50, 'rgba(' + ribbon.c2 + ',' + alpha.toFixed(3) + ')')
        grad.addColorStop(0.84, 'rgba(' + ribbon.c1 + ',' + (alpha * 0.55).toFixed(3) + ')')
        grad.addColorStop(1, 'rgba(' + ribbon.c1 + ',0)')

        ctx.beginPath()
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]
          if (i === 0) ctx.moveTo(pt.x, pt.y - pt.w / 2)
          else ctx.lineTo(pt.x, pt.y - pt.w / 2)
        }
        for (let i = pts.length - 1; i >= 0; i--) {
          const pt = pts[i]
          ctx.lineTo(pt.x, pt.y + pt.w / 2)
        }
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]
          if (i === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.strokeStyle = 'rgba(' + ribbon.c1 + ',' + (this.dark ? 0.46 : 0.28).toFixed(3) + ')'
        ctx.lineWidth = 1.2
        ctx.shadowColor = 'rgba(' + ribbon.c2 + ',' + (this.dark ? 0.55 : 0.30).toFixed(3) + ')'
        ctx.shadowBlur = 16
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      for (let i = 0; i < this.ribbonDust.length; i++) {
        const d = this.ribbonDust[i]
        const x = ((d.x + this.time * d.vx) % 1) * (this.W + 80) - 40
        const y = d.y * this.H + Math.sin(this.time * 0.00045 + d.phase) * 14
        const a = d.a * (0.45 + 0.55 * Math.sin(this.time * 0.0011 + d.phase))
        ctx.beginPath()
        ctx.arc(x, y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + d.color + ',' + Math.max(0, a).toFixed(3) + ')'
        ctx.fill()
      }
      ctx.restore()
    },

    /* 3. 轨道星环 */
    drawOrbits(p) {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.W, this.H)
      const cx = this.W * 0.5
      const cy = this.H * (0.50 - 0.02 * this.progress)
      const R = Math.min(this.W, this.H) * (0.33 - 0.09 * this.progress)
      const rotBase = this.time * 0.00012 + this.progress * 0.55

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.12)' : 'rgba(37,99,235,.07)')
      glow.addColorStop(0.55, this.dark ? 'rgba(59,130,246,.05)' : 'rgba(6,182,212,.03)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2)
      ctx.fill()

      for (let o = 0; o < this.orbits.length; o++) {
        const orbit = this.orbits[o]
        const cX = Math.cos(orbit.tiltX)
        const sX = Math.sin(orbit.tiltX)
        const cZ = Math.cos(orbit.tiltZ)
        const sZ = Math.sin(orbit.tiltZ)
        const rotY = rotBase + orbit.tiltY
        const cY = Math.cos(rotY)
        const sY = Math.sin(rotY)
        const pts = []
        const segments = 132
        for (let i = 0; i <= segments; i++) {
          const u = i / segments * Math.PI * 2
          const x = Math.cos(u) * orbit.radius
          const y = Math.sin(u) * orbit.radius
          const z = 0
          const y1 = y * cX - z * sX
          const z1 = y * sX + z * cX
          const x1 = x * cZ - y1 * sZ
          const y2 = x * sZ + y1 * cZ
          const x2 = x1 * cY - z1 * sY
          const z2 = x1 * sY + z1 * cY
          pts.push(project([x2, y2, z2], 0, 0, cx, cy, R))
        }
        const segs = []
        for (let i = 0; i < pts.length - 1; i++) {
          const A = pts[i]
          const B = pts[i + 1]
          segs.push({
            x1: A.x, y1: A.y, x2: B.x, y2: B.y,
            z: (A.z + B.z) / 2,
            s: (A.s + B.s) / 2
          })
        }
        segs.sort((a, b) => b.z - a.z)
        for (let i = 0; i < segs.length; i++) {
          const seg = segs[i]
          const dep = Math.max(0, Math.min(1, (1.15 - seg.z) / 2.3))
          ctx.beginPath()
          ctx.moveTo(seg.x1, seg.y1)
          ctx.lineTo(seg.x2, seg.y2)
          ctx.strokeStyle = 'rgba(' + orbit.color + ',' + (0.13 + dep * 0.38).toFixed(3) + ')'
          ctx.lineWidth = 0.9 + dep * 1.55
          ctx.stroke()
        }

        for (let i = 0; i < pts.length - 1; i += 7) {
          const pt = pts[i]
          const dep = Math.max(0, Math.min(1, (1.15 - pt.z) / 2.3))
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 0.9 + dep * 1.3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(' + orbit.color2 + ',' + (0.10 + dep * 0.42).toFixed(3) + ')'
          ctx.fill()
        }

        for (let s = 0; s < orbit.satellites.length; s++) {
          const u = this.time * orbit.speed + orbit.satellites[s]
          const x = Math.cos(u) * orbit.radius
          const y = Math.sin(u) * orbit.radius
          const z = 0
          const y1 = y * cX - z * sX
          const z1 = y * sX + z * cX
          const x1 = x * cZ - y1 * sZ
          const y2 = x * sZ + y1 * cZ
          const x2 = x1 * cY - z1 * sY
          const z2 = x1 * sY + z1 * cY
          const q = project([x2, y2, z2], 0, 0, cx, cy, R)
          const dep = Math.max(0, Math.min(1, (1.15 - q.z) / 2.3))
          const size = 2.4 + dep * 2.6
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, size * 4)
          g.addColorStop(0, 'rgba(255,255,255,.9)')
          g.addColorStop(0.22, 'rgba(' + orbit.color2 + ',.75)')
          g.addColorStop(1, 'rgba(' + orbit.color + ',0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(q.x, q.y, size * 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(q.x, q.y, size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.30)
      core.addColorStop(0, 'rgba(255,255,255,.96)')
      core.addColorStop(0.18, 'rgba(103,232,249,.78)')
      core.addColorStop(0.58, 'rgba(59,130,246,.25)')
      core.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.30, 0, Math.PI * 2)
      ctx.fill()
    },

    /* 4. 光之双螺旋 */
    drawHelix(p) {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.W, this.H)
      const cx = this.W * 0.5
      const cy = this.H * (0.50 - 0.02 * this.progress)
      const R = Math.min(this.W, this.H) * (0.235 - 0.035 * this.progress)
      const hh = Math.min(this.W, this.H) * (0.72 - 0.06 * this.progress)
      const turns = 3.2
      const N = 150
      const rotY = this.time * 0.00026 + this.progress * 0.72
      const rotX = 0.20 + Math.sin(this.time * 0.00018) * 0.05
      const C1 = this.dark ? '96,165,250' : '37,99,235'
      const C2 = this.dark ? '34,211,238' : '6,182,212'
      const C3 = this.dark ? '167,139,250' : '124,58,237'

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.09)' : 'rgba(37,99,235,.05)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 3, 0, Math.PI * 2)
      ctx.fill()

      const strands = [[], []]
      for (let s = 0; s < 2; s++) {
        for (let i = 0; i <= N; i++) {
          const t = i / N
          const angle = t * Math.PI * 2 * turns + s * Math.PI + this.time * 0.00022
          const x = Math.cos(angle)
          const z = Math.sin(angle)
          const y = (t - 0.5) * hh / R
          strands[s].push(project([x, y, z], rotX, rotY, cx, cy, R))
        }
      }

      // 横向连接：让两条链在空间里互相缠绕
      for (let i = 0; i <= N; i += 7) {
        const A = strands[0][i]
        const B = strands[1][i]
        const dep = Math.max(0, Math.min(1, (1.4 - (A.z + B.z) / 2) / 2.8))
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.strokeStyle = 'rgba(' + C3 + ',' + (0.04 + dep * 0.13).toFixed(3) + ')'
        ctx.lineWidth = 0.6 + dep * 0.7
        ctx.stroke()
      }

      const segs = []
      for (let s = 0; s < 2; s++) {
        const color = s === 0 ? C1 : C2
        for (let i = 0; i < N; i++) {
          const A = strands[s][i]
          const B = strands[s][i + 1]
          segs.push({
            x1: A.x, y1: A.y, x2: B.x, y2: B.y,
            z: (A.z + B.z) / 2,
            color
          })
        }
      }
      segs.sort((a, b) => b.z - a.z)
      ctx.lineCap = 'round'
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i]
        const dep = Math.max(0, Math.min(1, (1.4 - seg.z) / 2.8))
        ctx.beginPath()
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.strokeStyle = 'rgba(' + seg.color + ',' + (0.12 + dep * 0.40).toFixed(3) + ')'
        ctx.lineWidth = 0.9 + dep * 1.1
        ctx.stroke()
      }

      // 节点光点
      for (let s = 0; s < 2; s++) {
        const color = s === 0 ? C1 : C2
        for (let i = 0; i <= N; i += 6) {
          const pt = strands[s][i]
          const dep = Math.max(0, Math.min(1, (1.4 - pt.z) / 2.8))
          const r = 1 + dep * 2.3
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 4)
          g.addColorStop(0, 'rgba(255,255,255,.85)')
          g.addColorStop(0.25, 'rgba(' + color + ',.6)')
          g.addColorStop(1, 'rgba(' + color + ',0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}
</script>

<style scoped>
.intro-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: block;
}
</style>
