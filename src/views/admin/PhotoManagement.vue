<template>
  <div>
    <h2>相册管理</h2>

    <!-- 相册分类 -->
    <div class="section">
      <h3>相册分类</h3>
      <div class="header-bar">
        <input v-model="newAlbumName" placeholder="新相册名称" class="input" />
        <button class="btn-primary" @click="addAlbum">添加相册</button>
      </div>
      <ul class="album-list">
        <li v-for="album in albums" :key="album.id">
          <span>{{ album.name }}</span>
          <button class="btn-danger" @click="deleteAlbum(album.id)">删除</button>
        </li>
      </ul>
    </div>

    <!-- 上传照片 -->
    <div class="section">
      <h3>上传照片</h3>
      <div class="upload-area">
        <select v-model="selectedAlbumId" class="input">
          <option value="">请选择相册</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
        </select>

        <div class="custom-file-upload">
          <button class="btn-choose" @click="$refs.photoFileInput.click()">
            <span>📁</span> 选择文件
          </button>
          <span class="file-name">{{ selectedFileName || '未选择文件' }}</span>
          <input
            ref="photoFileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            style="display: none"
          />
        </div>

        <button class="btn-upload" @click="uploadPhoto" :disabled="!selectedFile">
          <span>⬆️</span> 开始上传
        </button>
      </div>
    </div>

    <!-- 照片列表 -->
    <div class="section">
      <h3>照片列表</h3>
      <select v-model="filterAlbumId" @change="fetchPhotos" class="input filter-select">
        <option value="">所有相册</option>
        <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
      </select>
      <div class="photo-grid">
        <div v-for="photo in photos" :key="photo.id" class="photo-item">
          <img :src="photo.url" alt="照片" />
          <span class="album-name" v-if="photo.album">{{ photo.album.name }}</span>
          <button class="btn-danger" @click="deletePhoto(photo.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  listAlbums,
  createAlbum,
  deleteAlbum,
  uploadPhotoApi,
  listPhotosAdmin,
  deletePhoto
} from '../../api/admin'

export default {
  name: 'PhotoManagement',
  data() {
    return {
      albums: [],
      newAlbumName: '',
      selectedAlbumId: '',
      filterAlbumId: '',
      photos: [],
      selectedFile: null,
      selectedFileName: ''
    }
  },
  mounted() {
    this.fetchAlbums()
    this.fetchPhotos()
  },
  methods: {
    async fetchAlbums() {
      try {
        const res = await listAlbums()
        this.albums = res.data
      } catch (e) {
        console.error(e)
      }
    },
    async addAlbum() {
      if (!this.newAlbumName.trim()) return
      try {
        await createAlbum({ name: this.newAlbumName.trim() })
        this.newAlbumName = ''
        this.fetchAlbums()
      } catch (e) {
        alert('添加失败')
      }
    },
    async deleteAlbum(id) {
      if (confirm('确定删除该相册？')) {
        try {
          await deleteAlbum(id)
          this.fetchAlbums()
          this.fetchPhotos()
        } catch (e) {
          alert('删除失败')
        }
      }
    },
    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.selectedFile = file
        this.selectedFileName = file.name
      } else {
        this.selectedFile = null
        this.selectedFileName = ''
      }
    },
    async uploadPhoto() {
      if (!this.selectedFile) return
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      if (this.selectedAlbumId) {
        formData.append('albumId', this.selectedAlbumId)
      }
      try {
        await uploadPhotoApi(formData)
        this.fetchPhotos()
        // 清空选择
        this.selectedFile = null
        this.selectedFileName = ''
        this.$refs.photoFileInput.value = ''
      } catch (e) {
        alert('上传失败')
      }
    },
    async fetchPhotos() {
      try {
        const params = {}
        if (this.filterAlbumId) params.albumId = this.filterAlbumId
        const res = await listPhotosAdmin(params)
        this.photos = res.data
      } catch (e) {
        console.error(e)
      }
    },
    async deletePhoto(id) {
      if (confirm('确定删除该照片？')) {
        try {
          await deletePhoto(id)
          this.fetchPhotos()
        } catch (e) {
          alert('删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}
.section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 相册分类区域 */
.header-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.input {
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  background: #fafafa;
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: #409eff;
}
.btn-primary {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-primary:hover {
  background: #337ecc;
}
.album-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.album-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.album-list li:last-child {
  border-bottom: none;
}
.btn-danger {
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 4px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-danger:hover {
  background: #ff4d4f;
  color: #fff;
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.custom-file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 2 1 300px;
}
.btn-choose {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-choose:hover {
  background: #e6e8eb;
  border-color: #409eff;
  color: #409eff;
}
.file-name {
  flex: 1;
  padding: 10px 14px;
  background: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-upload:hover:not(:disabled) {
  background: #337ecc;
}
.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 照片列表 */
.filter-select {
  width: 200px;
  margin-bottom: 16px;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.photo-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f5f5f5;
}
.photo-item img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}
.photo-item .album-name {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.photo-item .btn-danger {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 10px;
  font-size: 12px;
  background: rgba(255,255,255,0.9);
  border: none;
  color: #ff4d4f;
  border-radius: 4px;
}
.photo-item .btn-danger:hover {
  background: #ff4d4f;
  color: #fff;
}
</style>