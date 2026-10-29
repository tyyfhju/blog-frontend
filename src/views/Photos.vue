<template>
  <div class="photos-page">
    <section class="page-head">
      <div class="page-head-in">
        <span class="eyebrow"><i class="dot"></i>{{ content.photos.eyebrow }}</span>
        <h1 v-html="content.photos.titleHtml"></h1>
        <p class="head-desc">{{ content.photos.desc }}</p>
        <div class="head-stats">
          <span><i></i><b>{{ photos.length }}</b> {{ content.common.photosUnit }}</span>
          <span><i></i><b>{{ albums.length }}</b> {{ content.common.albumsUnit }}</span>
          <span><i></i>{{ content.common.updated }}</span>
        </div>
      </div>
      <PageHeadAnimation variant="aperture" />
    </section>

    <div class="toolbar-wrap">
      <div class="toolbar site-glass">
        <div class="chips" role="group" :aria-label="content.common.filterByAlbum">
          <button type="button" class="chip" :class="{ on: currentAlbum === null }" @click="setAlbum(null)">
            {{ content.photos.all }}<span class="n">{{ photos.length }}</span>
          </button>
          <button
            v-for="album in albums"
            :key="album.id"
            type="button"
            class="chip"
            :class="{ on: currentAlbum === album.id }"
            @click="setAlbum(album.id)">
            {{ album.name }}<span class="n">{{ countOf(album.id) }}</span>
          </button>
        </div>
        <span class="count">{{ countText }}</span>
      </div>
    </div>

    <section class="wall" aria-live="polite">
      <button
        v-for="(p, i) in filteredPhotos"
        :key="p.id"
        type="button"
        class="photo"
        @click="openLightbox(i)">
        <img :src="p.url" :alt="p.description || ''" loading="lazy">
        <span class="photo-cap">
          <b>{{ p.description || albumName(p) }}</b>
          <span>{{ albumName(p) }}<template v-if="p.createTime"> · {{ formatDate(p.createTime) }}</template></span>
        </span>
      </button>
      <div v-if="!filteredPhotos.length" class="empty">{{ content.photos.empty }}</div>
    </section>

    <div v-if="lightboxIndex > -1 && currentPhoto" class="lightbox" @click.self="closeLightbox">
      <button class="lb-close" type="button" :aria-label="content.photos.close" @click="closeLightbox">×</button>
      <button class="lb-btn lb-prev" type="button" :aria-label="content.photos.previous" @click="step(-1)">←</button>
      <figure>
        <img :src="currentPhoto.url" :alt="currentPhoto.description || ''">
        <figcaption>
          {{ currentPhoto.description || albumName(currentPhoto) }}
          <template v-if="currentPhoto.createTime"> · {{ formatDate(currentPhoto.createTime) }}</template>
          <span class="lb-index"> {{ lightboxIndex + 1 }} / {{ filteredPhotos.length }}</span>
        </figcaption>
      </figure>
      <button class="lb-btn lb-next" type="button" :aria-label="content.photos.next" @click="step(1)">→</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getPhotos, getPhotoAlbums } from '../api/blog'
import { formatText } from '../content/site'
import PageHeadAnimation from '../components/PageHeadAnimation.vue'

export default {
  name: 'Photos',
  components: { PageHeadAnimation },
  data() {
    return {
      photos: [],
      albums: [],
      currentAlbum: null,
      lightboxIndex: -1
    }
  },
  computed: {
    ...mapState(['content']),
    filteredPhotos() {
      if (this.currentAlbum === null) return this.photos
      return this.photos.filter(p => p.albumId === this.currentAlbum)
    },
    currentPhoto() {
      return this.filteredPhotos[this.lightboxIndex] || null
    },
    countText() {
      return formatText(this.content.photos.count, { n: this.filteredPhotos.length })
    }
  },
  watch: {
    lightboxIndex(v) {
      document.body.style.overflow = v > -1 ? 'hidden' : ''
    }
  },
  mounted() {
    this.load()
    document.addEventListener('keydown', this.onKey)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKey)
    document.body.style.overflow = ''
  },
  methods: {
    async load() {
      try {
        const [photoRes, albumRes] = await Promise.all([
          getPhotos(),
          getPhotoAlbums()
        ])
        this.photos = photoRes.data || []
        this.albums = albumRes.data || []
      } catch (e) {
        this.photos = []
        this.albums = []
      }
    },
    setAlbum(id) {
      this.currentAlbum = id
      this.lightboxIndex = -1
    },
    countOf(id) {
      return this.photos.filter(p => p.albumId === id).length
    },
    albumName(p) {
      if (p.album && p.album.name) return p.album.name
      const album = this.albums.find(a => a.id === p.albumId)
      return album ? album.name : this.content.common.uncategorized
    },
    formatDate(t) {
      return t ? String(t).slice(0, 10) : ''
    },
    openLightbox(i) {
      this.lightboxIndex = i
    },
    closeLightbox() {
      this.lightboxIndex = -1
    },
    step(delta) {
      if (!this.filteredPhotos.length) return
      const len = this.filteredPhotos.length
      this.lightboxIndex = (this.lightboxIndex + delta + len) % len
    },
    onKey(e) {
      if (this.lightboxIndex < 0) return
      if (e.key === 'Escape') this.closeLightbox()
      else if (e.key === 'ArrowLeft') this.step(-1)
      else if (e.key === 'ArrowRight') this.step(1)
    }
  }
}
</script>

<style scoped>
.photos-page {
  position: relative;
  min-height: 70vh;
  padding-bottom: 40px;
}

/* 页头 */
.page-head {
  position: relative;
  padding: 150px 0 46px;
  overflow: hidden;
  background: radial-gradient(ellipse 50% 70% at 78% 12%, rgba(37, 99, 235, .09), transparent 68%),
              radial-gradient(ellipse 40% 55% at 20% 30%, rgba(6, 182, 212, .06), transparent 70%);
}
.page-head-in {
  position: relative;
  z-index: 1;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: .14em;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--brand);
}
.eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--glow);
  animation: photosPulse 2.4s infinite;
}
@keyframes photosPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.page-head h1 {
  font-size: clamp(38px, 5.2vw, 58px);
  line-height: 1.08;
  letter-spacing: -.045em;
  font-weight: 800;
  margin: 20px 0 14px;
  color: var(--text);
}
.head-desc { font-size: 14.5px; color: var(--text-2); max-width: 520px; line-height: 1.85; }
.head-stats {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 20px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-3);
  letter-spacing: .1em;
}
.head-stats span { display: inline-flex; align-items: center; gap: 7px; }
.head-stats i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.head-stats b { color: var(--text); font-weight: 700; font-size: 11.5px; }
.head-stack { position: absolute; right: 5%; top: 104px; width: 320px; height: 260px; pointer-events: none; }
.head-stack span {
  position: absolute;
  width: 152px;
  height: 196px;
  border-radius: 18px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--glass-border);
  box-shadow: 0 24px 60px rgba(15, 23, 42, .18);
  transform: rotate(var(--r));
}
.head-stack img { width: 100%; height: 100%; object-fit: cover; }
.head-stack .hs0 { left: 0; top: 30px; --r: -9deg; z-index: 1; }
.head-stack .hs1 { left: 76px; top: 8px; --r: 3deg; z-index: 2; }
.head-stack .hs2 { left: 152px; top: 38px; --r: 12deg; z-index: 3; }

/* 筛选 */
.toolbar-wrap {
  position: sticky;
  top: 88px;
  z-index: 60;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
}
.toolbar { display: flex; align-items: center; gap: 14px; padding: 9px 12px; border-radius: 999px; }
.chips {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chips::-webkit-scrollbar { display: none; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-2);
  white-space: nowrap;
  border: none;
  background: none;
  cursor: pointer;
  transition: all .18s var(--ease);
}
.chip:hover { color: var(--text); background: var(--grad-soft); }
.chip.on { background: var(--grad); color: #fff; font-weight: 600; box-shadow: 0 6px 18px var(--glow); }
.chip .n { font-family: var(--font-mono); font-size: 10px; opacity: .55; }
.chip.on .n { opacity: .85; }
.count { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-3); letter-spacing: .06em; white-space: nowrap; }

/* 照片墙 */
.wall { max-width: var(--maxw); margin: 20px auto 0; padding: 0 24px; columns: 4; column-gap: 16px; }
.photo {
  display: block;
  width: 100%;
  margin: 0 0 16px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  text-align: left;
  color: inherit;
  font: inherit;
  break-inside: avoid;
  page-break-inside: avoid;
  position: relative;
  cursor: zoom-in;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .06);
  transition: border-color .25s var(--ease), box-shadow .25s var(--ease);
}
.photo:hover { border-color: transparent; box-shadow: 0 24px 56px rgba(15, 23, 42, .16); }
.photo img { width: 100%; height: auto; display: block; transition: transform .6s var(--ease); }
.photo:hover img { transform: scale(1.04); }
.photo-cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 34px 14px 12px;
  background: linear-gradient(to top, rgba(5, 9, 18, .78), transparent);
  color: #fff;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .25s var(--ease), transform .25s var(--ease);
}
.photo:hover .photo-cap { opacity: 1; transform: none; }
.photo-cap b { display: block; font-size: 13px; font-weight: 650; line-height: 1.4; }
.photo-cap span {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, .72);
  margin-top: 2px;
  letter-spacing: .03em;
}
@media (hover: none) {
  .photo-cap { opacity: 1; transform: none; }
}
.empty {
  column-span: all;
  text-align: center;
  padding: 70px 20px;
  color: var(--text-3);
  font-size: 13.5px;
  border: 1px dashed var(--border);
  border-radius: 20px;
  background: var(--surface);
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5vh 4vw;
  background: rgba(4, 8, 16, .86);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.lightbox figure {
  max-width: min(1080px, 92vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.lightbox img {
  max-width: 100%;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .5);
  animation: photosZoom .3s var(--ease);
}
@keyframes photosZoom {
  from { opacity: 0; transform: scale(.96); }
  to { opacity: 1; transform: none; }
}
.lightbox figcaption {
  color: rgba(255, 255, 255, .82);
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: .04em;
  text-align: center;
}
.lb-index { opacity: .55; margin-left: 8px; }
.lb-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, .12);
  border: 1px solid rgba(255, 255, 255, .22);
  color: #fff;
  font-size: 17px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background .18s var(--ease);
}
.lb-btn:hover { background: rgba(255, 255, 255, .22); }
.lb-prev { left: 2.5vw; }
.lb-next { right: 2.5vw; }
.lb-close {
  position: absolute;
  top: 20px;
  right: 22px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  background: rgba(255, 255, 255, .12);
  border: 1px solid rgba(255, 255, 255, .22);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.lb-close:hover { background: rgba(255, 255, 255, .22); }

@media (max-width: 1050px) { .head-stack { display: none; } }
@media (max-width: 1100px) { .wall { columns: 3; } }
@media (max-width: 900px) {
  .page-head { padding-top: 130px; }
  .toolbar-wrap { top: 82px; }
  .toolbar { flex-wrap: wrap; border-radius: 22px; padding: 10px; }
  .chips { flex-basis: 100%; }
  .count { width: 100%; text-align: right; }
}
@media (max-width: 760px) {
  .wall { columns: 2; column-gap: 12px; }
  .photo { margin-bottom: 12px; border-radius: 12px; }
  .photo-cap { padding: 28px 10px 9px; }
  .photo-cap b { font-size: 12px; }
  .photo-cap span { font-size: 9px; }
}
@media (max-width: 520px) {
  .page-head { padding: 120px 0 34px; }
  .head-stats { gap: 12px; }
  .wall { padding: 0 20px; }
  .lb-btn { width: 38px; height: 38px; font-size: 15px; }
}
</style>
