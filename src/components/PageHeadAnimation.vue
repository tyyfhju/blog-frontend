<template>
  <div class="page-head-animation" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
function rgba(rgb, alpha) {
  return 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')'
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export default {
  name: 'PageHeadAnimation',
  props: {
    variant: {
      type: String,
      default: 'papers'
    }
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
      destroyed: false,
      reduced: false,
      clusters: [],
      bokeh: [],
      auraDust: []
    }
  },
  computed: {
    dark() {
      return this.$store.state.theme === 'dark'
    }
  },
  mounted() {
    this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null
    this.initData()
    this.resize()
    window.addEventListener('resize', this.onResize)
    if (this.reduced) this.draw(0)
    else this.raf = requestAnimationFrame(this.loop)
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
      this.DPR = Math.min(window.devicePixelRatio || 1, 1.5)
      this.W = this.canvas.clientWidth
      this.H = this.canvas.clientHeight
      this.canvas.width = Math.round(this.W * this.DPR)
      this.canvas.height = Math.round(this.H * this.DPR)
      this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0)
    },
    initData() {
      if (this.variant === 'constellation') {
        const palette = [
          { x: -0.46, y: -0.18, color: '59,130,246' },
          { x: 0.38, y: -0.28, color: '34,211,238' },
          { x: 0.04, y: 0.40, color: '167,139,250' }
        ]
        this.clusters = palette.map((c, ci) => ({
          ...c,
          nodes: Array.from({ length: 11 + (ci % 2) }, () => {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 0.30
            return {
              dx: Math.cos(angle) * radius,
              dy: Math.sin(angle) * radius,
              r: 1.2 + Math.random() * 2.6,
              phase: Math.random() * Math.PI * 2
            }
          })
        }))
      }
      if (this.variant === 'aperture') {
        this.bokeh = Array.from({ length: 14 }, (_, i) => ({
          x: Math.random(),
          y: Math.random(),
          r: 3 + Math.random() * 11,
          a: 0.06 + Math.random() * 0.16,
          phase: Math.random() * Math.PI * 2,
          color: i % 3 === 0 ? '34,211,238' : '59,130,246'
        }))
      }
      if (this.variant === 'aura') {
        this.auraDust = Array.from({ length: 42 }, () => ({
          angle: Math.random() * Math.PI * 2,
          radius: 0.36 + Math.random() * 0.65,
          r: 0.6 + Math.random() * 1.6,
          speed: 0.00003 + Math.random() * 0.00008,
          phase: Math.random() * Math.PI * 2,
          a: 0.12 + Math.random() * 0.34,
          color: Math.random() > 0.5 ? '34,211,238' : '59,130,246'
        }))
      }
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
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.W, this.H)
      if (this.variant === 'papers') this.drawPapers()
      else if (this.variant === 'time') this.drawTime()
      else if (this.variant === 'aperture') this.drawAperture()
      else if (this.variant === 'constellation') this.drawConstellation()
      else this.drawAura()
    },

    /* 01 文章：漂浮的稿纸 */
    drawPapers() {
      const ctx = this.ctx
      const cx = this.W * 0.56
      const cy = this.H * 0.53
      const baseW = Math.min(this.W * 0.39, 220)
      const baseH = baseW * 1.24
      const pages = [
        { dx: -68, dy: 20, rot: -0.17, alpha: 0.38, phase: 0.4 },
        { dx: 2, dy: 2, rot: -0.03, alpha: 0.56, phase: 1.8 },
        { dx: 66, dy: -12, rot: 0.13, alpha: 0.72, phase: 3.1 }
      ]
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseW * 2.4)
      glow.addColorStop(0, this.dark ? 'rgba(37,99,235,.14)' : 'rgba(37,99,235,.06)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, baseW * 2.4, 0, Math.PI * 2)
      ctx.fill()

      pages.forEach((page, index) => {
        const bob = Math.sin(this.time * 0.0005 + page.phase) * 5
        ctx.save()
        ctx.translate(cx + page.dx, cy + page.dy + bob)
        ctx.rotate(page.rot + Math.sin(this.time * 0.00035 + page.phase) * 0.018)
        ctx.shadowColor = this.dark ? 'rgba(0,0,0,.4)' : 'rgba(37,99,235,.13)'
        ctx.shadowBlur = 24
        ctx.shadowOffsetY = 12
        roundRect(ctx, -baseW / 2, -baseH / 2, baseW, baseH, 14)
        const fill = ctx.createLinearGradient(-baseW / 2, -baseH / 2, baseW / 2, baseH / 2)
        if (this.dark) {
          fill.addColorStop(0, 'rgba(20,33,55,' + page.alpha + ')')
          fill.addColorStop(1, 'rgba(10,19,34,' + page.alpha + ')')
        } else {
          fill.addColorStop(0, 'rgba(255,255,255,' + page.alpha + ')')
          fill.addColorStop(1, 'rgba(244,248,255,' + page.alpha + ')')
        }
        ctx.fillStyle = fill
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
        ctx.strokeStyle = this.dark ? 'rgba(148,163,184,.25)' : 'rgba(37,99,235,.16)'
        ctx.lineWidth = 1
        ctx.stroke()

        const left = -baseW / 2 + 22
        ctx.strokeStyle = this.dark ? 'rgba(148,163,184,.20)' : 'rgba(71,85,105,.18)'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        const lines = index === 2 ? [0.64, 0.90, 0.52, 0.76, 0.60, 0.42] : [0.58, 0.82, 0.48, 0.68]
        lines.forEach((w, i) => {
          const y = -baseH / 2 + 42 + i * 23
          ctx.beginPath()
          ctx.moveTo(left, y)
          ctx.lineTo(left + (baseW - 44) * w, y)
          ctx.stroke()
        })
        if (index === 2) {
          ctx.fillStyle = this.dark ? 'rgba(103,232,249,.8)' : 'rgba(37,99,235,.75)'
          ctx.beginPath()
          ctx.arc(left + 4, -baseH / 2 + 24, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })
    },

    /* 02 归档：时间年轮 */
    drawTime() {
      const ctx = this.ctx
      const cx = this.W * 0.55
      const cy = this.H * 0.5
      const R = Math.min(this.W, this.H) * 0.36
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.12)' : 'rgba(37,99,235,.06)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fill()

      const ringSets = [
        { r: 0.92, dash: [2, 8], speed: 0.00006, color: '59,130,246', width: 1.2 },
        { r: 0.70, dash: [1, 11], speed: -0.00004, color: '34,211,238', width: 1.4 },
        { r: 0.48, dash: [18, 8], speed: 0.00009, color: '129,140,248', width: 1 }
      ]
      ringSets.forEach(ring => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(this.time * ring.speed)
        ctx.beginPath()
        ctx.arc(0, 0, R * ring.r, 0, Math.PI * 2)
        ctx.setLineDash(ring.dash)
        ctx.strokeStyle = rgba(ring.color, this.dark ? 0.55 : 0.35)
        ctx.lineWidth = ring.width
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      })

      for (let i = 0; i < 60; i++) {
        const angle = i / 60 * Math.PI * 2 - Math.PI / 2
        const major = i % 5 === 0
        const inner = R * (major ? 0.84 : 0.88)
        const outer = R * 0.96
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
        ctx.strokeStyle = major
          ? rgba(i % 15 === 0 ? '34,211,238' : '59,130,246', this.dark ? 0.8 : 0.45)
          : rgba('100,116,139', this.dark ? 0.34 : 0.20)
        ctx.lineWidth = major ? 1.6 : 0.8
        ctx.stroke()
      }

      const hand = this.time * 0.00035 - Math.PI / 2
      const handR = R * 0.74
      const handGrad = ctx.createLinearGradient(cx, cy, cx + Math.cos(hand) * handR, cy + Math.sin(hand) * handR)
      handGrad.addColorStop(0, rgba('34,211,238', 0.15))
      handGrad.addColorStop(1, rgba('34,211,238', 0.85))
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(hand) * handR, cy + Math.sin(hand) * handR)
      ctx.strokeStyle = handGrad
      ctx.lineWidth = 1.8
      ctx.stroke()
      const hx = cx + Math.cos(hand) * handR
      const hy = cy + Math.sin(hand) * handR
      const dot = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12)
      dot.addColorStop(0, 'rgba(255,255,255,.95)')
      dot.addColorStop(0.25, 'rgba(34,211,238,.85)')
      dot.addColorStop(1, 'rgba(34,211,238,0)')
      ctx.fillStyle = dot
      ctx.beginPath()
      ctx.arc(hx, hy, 12, 0, Math.PI * 2)
      ctx.fill()

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22)
      core.addColorStop(0, this.dark ? 'rgba(255,255,255,.85)' : 'rgba(37,99,235,.35)')
      core.addColorStop(0.4, 'rgba(34,211,238,.18)')
      core.addColorStop(1, 'rgba(34,211,238,0)')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2)
      ctx.fill()
    },

    /* 03 相册：光圈叶片 */
    drawAperture() {
      const ctx = this.ctx
      const cx = this.W * 0.56
      const cy = this.H * 0.5
      const R = Math.min(this.W, this.H) * 0.34
      const blades = 7
      const rot = this.time * 0.00011
      const inner = R * (0.27 + Math.sin(this.time * 0.0006) * 0.055)

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.55)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.12)' : 'rgba(37,99,235,.05)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < blades; i++) {
        const a0 = i / blades * Math.PI * 2 + rot
        const a1 = (i + 1) / blades * Math.PI * 2 + rot
        const p1 = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R]
        const p2 = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R]
        const p3 = [cx + Math.cos(a1 - 0.20) * inner, cy + Math.sin(a1 - 0.20) * inner]
        const p4 = [cx + Math.cos(a0 - 0.34) * inner, cy + Math.sin(a0 - 0.34) * inner]
        const color = i % 2 === 0 ? '59,130,246' : '34,211,238'
        const fill = ctx.createLinearGradient(p1[0], p1[1], p4[0], p4[1])
        fill.addColorStop(0, rgba(color, this.dark ? 0.30 : 0.18))
        fill.addColorStop(1, rgba(color, this.dark ? 0.05 : 0.025))
        ctx.beginPath()
        ctx.moveTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.lineTo(p3[0], p3[1])
        ctx.lineTo(p4[0], p4[1])
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()
        ctx.strokeStyle = rgba(color, this.dark ? 0.48 : 0.30)
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = rgba('59,130,246', this.dark ? 0.65 : 0.38)
      ctx.lineWidth = 1.4
      ctx.stroke()

      const hole = ctx.createRadialGradient(cx, cy, 0, cx, cy, inner * 1.2)
      hole.addColorStop(0, 'rgba(255,255,255,.55)')
      hole.addColorStop(0.3, 'rgba(34,211,238,.18)')
      hole.addColorStop(1, 'rgba(34,211,238,0)')
      ctx.fillStyle = hole
      ctx.beginPath()
      ctx.arc(cx, cy, inner * 1.2, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < this.bokeh.length; i++) {
        const b = this.bokeh[i]
        const x = cx + (b.x - 0.5) * R * 2.3 + Math.sin(this.time * 0.0002 + b.phase) * 12
        const y = cy + (b.y - 0.5) * R * 2 + Math.cos(this.time * 0.00017 + b.phase) * 10
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r)
        g.addColorStop(0, rgba(b.color, b.a * 1.6))
        g.addColorStop(1, rgba(b.color, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
    },

    /* 04 分类：节点星群 */
    drawConstellation() {
      const ctx = this.ctx
      const cx = this.W * 0.55
      const cy = this.H * 0.5
      const R = Math.min(this.W, this.H) * 0.55
      const rot = this.time * 0.00005
      const cosR = Math.cos(rot)
      const sinR = Math.sin(rot)

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      glow.addColorStop(0, this.dark ? 'rgba(34,211,238,.08)' : 'rgba(37,99,235,.04)')
      glow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2)
      ctx.fill()

      const centers = this.clusters.map(c => {
        const x = c.x * R
        const y = c.y * R
        return {
          x: cx + x * cosR - y * sinR,
          y: cy + x * sinR + y * cosR,
          color: c.color
        }
      })

      for (let c = 0; c < centers.length; c++) {
        for (let d = c + 1; d < centers.length; d++) {
          ctx.beginPath()
          ctx.moveTo(centers[c].x, centers[c].y)
          ctx.lineTo(centers[d].x, centers[d].y)
          ctx.strokeStyle = rgba('100,116,139', this.dark ? 0.16 : 0.10)
          ctx.setLineDash([2, 7])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      this.clusters.forEach((cluster, ci) => {
        const center = centers[ci]
        const halo = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, R * 0.36)
        halo.addColorStop(0, rgba(cluster.color, this.dark ? 0.14 : 0.08))
        halo.addColorStop(1, rgba(cluster.color, 0))
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(center.x, center.y, R * 0.36, 0, Math.PI * 2)
        ctx.fill()

        const nodes = cluster.nodes.map((node, ni) => {
          const driftX = Math.sin(this.time * 0.00035 + node.phase) * 5
          const driftY = Math.cos(this.time * 0.0003 + node.phase) * 5
          const x = node.dx * R
          const y = node.dy * R
          return {
            x: center.x + x * cosR - y * sinR + driftX,
            y: center.y + x * sinR + y * cosR + driftY,
            r: node.r,
            phase: node.phase,
            ni
          }
        })

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < R * 0.28) {
              ctx.beginPath()
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
              ctx.strokeStyle = rgba(cluster.color, this.dark ? 0.30 : 0.18)
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
        }

        nodes.forEach(node => {
          const pulse = 0.65 + 0.35 * Math.sin(this.time * 0.0012 + node.phase)
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.r * 3.6, 0, Math.PI * 2)
          ctx.fillStyle = rgba(cluster.color, (this.dark ? 0.16 : 0.10) * pulse)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.r * 0.72, 0, Math.PI * 2)
          ctx.fillStyle = this.dark ? 'rgba(230,237,247,.9)' : 'rgba(255,255,255,.95)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.r * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = rgba(cluster.color, 0.45 * pulse)
          ctx.fill()
        })
      })
    },

    /* 05 关于：呼吸光晕 */
    drawAura() {
      const ctx = this.ctx
      const cx = this.W * 0.55
      const cy = this.H * 0.5
      const R = Math.min(this.W, this.H) * 0.25
      const breathe = 1 + Math.sin(this.time * 0.00072) * 0.06
      const pulse = 0.72 + 0.28 * Math.sin(this.time * 0.0011)

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.8 * breathe)
      halo.addColorStop(0, this.dark ? 'rgba(34,211,238,.22)' : 'rgba(37,99,235,.12)')
      halo.addColorStop(0.35, this.dark ? 'rgba(59,130,246,.10)' : 'rgba(6,182,212,.06)')
      halo.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, R * 2.8 * breathe, 0, Math.PI * 2)
      ctx.fill()

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05 * breathe)
      core.addColorStop(0, 'rgba(255,255,255,.95)')
      core.addColorStop(0.18, 'rgba(103,232,249,.88)')
      core.addColorStop(0.55, 'rgba(59,130,246,.34)')
      core.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.05 * breathe, 0, Math.PI * 2)
      ctx.fill()

      for (let k = 0; k < 2; k++) {
        const orbitR = R * (1.25 + k * 0.36) * breathe
        ctx.beginPath()
        ctx.arc(cx, cy, orbitR, this.time * 0.00012 + k * 1.4, this.time * 0.00012 + k * 1.4 + Math.PI * 1.25)
        ctx.strokeStyle = rgba(k === 0 ? '34,211,238' : '167,139,250', (this.dark ? 0.42 : 0.24) * pulse)
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      this.auraDust.forEach(d => {
        const angle = d.angle + this.time * d.speed
        const orbitR = R * d.radius * (1 + Math.sin(this.time * 0.0006 + d.phase) * 0.05)
        const x = cx + Math.cos(angle) * orbitR
        const y = cy + Math.sin(angle) * orbitR * 0.82
        const a = d.a * (0.35 + 0.65 * Math.sin(this.time * 0.001 + d.phase))
        ctx.beginPath()
        ctx.arc(x, y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = rgba(d.color, Math.max(0, a))
        ctx.fill()
      })

      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.16, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,' + (this.dark ? 0.9 : 0.75) + ')'
      ctx.fill()
    }
  }
}
</script>

<style scoped>
.page-head-animation {
  position: absolute;
  right: 1.5%;
  top: 55px;
  width: min(700px, 52vw);
  height: 360px;
  z-index: 0;
  pointer-events: none;
  opacity: .95;
}
.page-head-animation canvas {
  display: block;
  width: 100%;
  height: 100%;
}
@media (max-width: 1150px) {
  .page-head-animation {
    width: 430px;
    height: 280px;
    top: 84px;
    right: 0;
    opacity: .9;
  }
}
@media (max-width: 900px) {
  .page-head-animation {
    width: 340px;
    height: 240px;
    top: 88px;
    right: -10px;
    opacity: .5;
  }
}
@media (max-width: 640px) {
  .page-head-animation {
    width: 250px;
    height: 200px;
    top: 74px;
    right: -56px;
    opacity: .32;
  }
}
</style>
