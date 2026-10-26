<template>
  <div class="photos-page">
    <!-- Banner -->
    <div class="photos-banner">
      <div class="photos-banner-overlay"></div>
      <div class="photos-banner-content">
        <h1 class="photos-banner-title">相册</h1>
        <p class="photos-banner-subtitle">Gallery</p>
      </div>
    </div>

    <div class="photos-container">
      <div class="album-tabs" v-if="albums.length">
        <span :class="{ active: !currentAlbum }" @click="currentAlbum = null; load()">全部</span>
        <span v-for="a in albums" :key="a.id" :class="{ active: currentAlbum === a.id }" @click="currentAlbum = a.id; load()">
          {{ a.name }}
        </span>
      </div>
      <div class="photo-grid" v-if="photos.length">
        <div v-for="p in photos" :key="p.id" class="photo-item" @click="previewPhoto = p.url">
          <img :src="p.url" alt="photo" loading="lazy" />
        </div>
      </div>
      <div v-else class="empty-state">暂无照片</div>
    </div>
    <div v-if="previewPhoto" class="lightbox" @click="previewPhoto = null">
      <img :src="previewPhoto" alt="preview" />
    </div>
  </div>
</template>

<script>
import { getPhotos, getPhotoAlbums } from '../api/blog'

export default {
  name: 'Photos',
  data() { return { photos: [], albums: [], currentAlbum: null, previewPhoto: null } },
  mounted() { this.loadAlbums(); this.load() },
  methods: {
    loadAlbums() { getPhotoAlbums().then(r => this.albums = r.data || []).catch(() => {}) },
    load() {
      getPhotos(this.currentAlbum ? { albumId: this.currentAlbum } : {})
        .then(r => this.photos = r.data || []).catch(() => {})
    }
  }
}
</script>

<style scoped>
.photos-page {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ========== Banner ========== */
.photos-banner {
  position: relative;
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-gradient);
  clip-path: polygon(0 0, 100% 0, 100% 72%, 0 100%);
  margin-bottom: 2rem;
}
.photos-banner-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.06);
}
.photos-banner-content {
  position: relative; z-index: 2;
  text-align: center; padding: 2rem;
}
.photos-banner-title {
  font-size: 2.5rem; font-weight: 800;
  color: #fff; margin: 0 0 0.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.photos-banner-subtitle {
  font-size: 0.9rem; color: rgba(255,255,255,0.75);
  margin: 0; text-transform: uppercase; letter-spacing: 3px;
}

/* ========== Content ========== */
.photos-container {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--background-secondary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--accent-shadow);
}
.album-tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.album-tabs span {
  padding: 6px 16px; background: var(--background-primary); border-radius: 20px;
  cursor: pointer; font-size: 0.9rem; color: var(--text-normal); transition: all 0.3s;
}
.album-tabs span.active { background: var(--main-gradient); color: #fff; }
.album-tabs span:hover:not(.active) { background: rgba(0,0,0,0.06); }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.photo-item { border-radius: 10px; overflow: hidden; cursor: pointer; }
.photo-item img {
  width: 100%; aspect-ratio: 1; object-fit: cover; transition: transform 0.3s;
}
.photo-item:hover img { transform: scale(1.05); }
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9);
  z-index: 999; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 4px; }
.empty-state { text-align: center; padding: 3rem; color: var(--text-dim); }

@media (max-width: 640px) {
  .photos-banner {
    min-height: 180px;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  .photos-banner-title { font-size: 1.8rem; }
  .photos-container { padding: 1.5rem; }
}
</style>
