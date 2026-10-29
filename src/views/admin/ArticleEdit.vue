
<template>
  <div>
    <h2 style="margin-bottom:20px;">{{ isNew ? '新建文章' : '编辑文章' }}</h2>
    <el-card>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="文章标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width:200px">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="form.tagIds"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            style="width:400px"
          >
            <el-option v-for="t in allTags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
          <span style="margin-left:10px;color:#999;font-size:12px;">可输入新标签名称并回车创建</span>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="文章摘要" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.coverUrl" placeholder="封面图片URL">
            <template slot="append">
              <el-upload action="#" :http-request="uploadCoverLocal" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="选项">
          <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" active-text="置顶" />
          <el-switch v-model="form.isRecommend" :active-value="1" :inactive-value="0" active-text="推荐" style="margin-left:20px" />
        </el-form-item>
        <el-form-item label="内容">
          <mavon-editor ref="md" v-model="form.content" :toolbars="toolbars" :ishljs="false" @imgAdd="handleImgAdd" style="min-height:500px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { createArticle, updateArticle, getArticle, uploadImage, listCategories, listTags, createTag } from '../../api/admin'

export default {
  components: { mavonEditor },
  props: { id: { default: null } },
  data() {
    return {
      form: {
        title: '',
        content: '',
        summary: '',
        categoryId: null,
        tagIds: [],
        coverUrl: '',
        status: 1,
        isTop: 0,
        isRecommend: 0
      },
      categories: [],
      allTags: [],
      toolbars: {
        bold: true, italic: true, header: true, underline: true, strikethrough: true,
        quote: true, ol: true, ul: true, link: true, imagelink: true, code: true,
        table: true, fullscreen: true, htmlcode: true
      }
    }
  },
  computed: {
    isNew() { return !this.id }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [catRes, tagRes] = await Promise.all([
          listCategories(),
          listTags()
        ])
        this.categories = catRes.data || []
        this.allTags = tagRes.data || []
      } catch(e) { console.error(e) }
      if (this.id) {
        try {
          const res = await getArticle(this.id)
          const a = res.data
          this.form = {
            title: a.title || '',
            content: a.content || '',
            summary: a.summary || '',
            categoryId: a.categoryId,
            tagIds: a.tags ? a.tags.map(t => t.id) : [],
            coverUrl: a.coverUrl || '',
            status: a.status || 1,
            isTop: a.isTop || 0,
            isRecommend: a.isRecommend || 0
          }
        } catch(e) { console.error(e) }
      }
    },
    async handleImgAdd(pos, file) {
      try {
        const res = await uploadImage(file)
        this.$refs.md.$img2Url(pos, res.data.url || res.data)
      } catch(e) {
        this.$message.error('图片上传失败')
      }
    },
    async uploadCoverLocal({ file }) {
      try {
        const res = await uploadImage(file)
        this.form.coverUrl = res.data.url || res.data
        this.$message.success('封面上传成功')
      } catch (e) { this.$message.error('封面上传失败') }
    },
    async save() {
      if (!this.form.title.trim()) {
        this.$message.warning('请输入标题')
        return
      }
      try {
        // Resolve new tag names -> create tags first
        const tagIdsToSend = []
        for (const tagId of this.form.tagIds) {
          if (typeof tagId === 'string' && tagId.length > 0) {
            // It's a new tag name, create it
            try {
              const existingTag = this.allTags.find(t => t.name === tagId)
              if (existingTag) {
                tagIdsToSend.push(existingTag.id)
              } else {
                const newTagRes = await createTag({ name: tagId })
                tagIdsToSend.push(newTagRes.data.id)
              }
            } catch(e) {
              this.$message.error('创建标签失败: ' + tagId)
              return
            }
          } else if (typeof tagId === 'number') {
            tagIdsToSend.push(tagId)
          }
        }

        const payload = { ...this.form, tagIds: tagIdsToSend }
        if (this.isNew) {
          await createArticle(payload)
          this.$message.success('创建成功')
        } else {
          await updateArticle(this.id, payload)
          this.$message.success('更新成功')
        }
        this.$router.push('/cpanel/articles')
      } catch (e) {
        const msg = e.response?.data?.message || '保存失败'
        this.$message.error(msg)
      }
    }
  }
}
</script>
