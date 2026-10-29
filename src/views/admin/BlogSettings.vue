<template>
  <div>
    <h2 style="margin-bottom:20px;">博客设置</h2>
    <el-card>
      <el-form :model="form" label-width="130px">
        <el-form-item label="博客标题">
          <el-input v-model="form.siteTitle" placeholder="网站标题" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.siteSubtitle" placeholder="英文副标题" />
        </el-form-item>
        <el-form-item label="作者名">
          <el-input v-model="form.authorName" placeholder="作者名" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.authorBio" type="textarea" :rows="2" placeholder="一句话介绍" />
        </el-form-item>
        <el-form-item label="欢迎语">
          <el-input v-model="form.welcomeText" type="textarea" :rows="3" placeholder="欢迎来到我的个人博客！这里记录技术分享、生活随笔与折腾日常。" />
        </el-form-item>

        <el-divider content-position="left">首页与页面文案</el-divider>
        <el-form-item label="首页主标题">
          <el-input v-model="pageCopy.homeTitleHtml" type="textarea" :rows="2" placeholder="写代码，也写为什么这样写。" />
          <div class="field-hint">支持 HTML；换行用 br 标签。保留 span.grad-text 可以保留标题里的渐变高亮。</div>
        </el-form-item>
        <el-form-item label="首页描述">
          <el-input v-model="pageCopy.homeDesc" type="textarea" :rows="2" placeholder="Java、Spring 与前端工程的实践记录。不是教程的搬运，而是每次取舍背后的理由。" />
        </el-form-item>
        <el-form-item label="首页动画说明">
          <el-input v-model="pageCopy.homeCaption" placeholder="SILK FLOW · 柔软地穿过复杂" />
        </el-form-item>
        <el-form-item label="文章页描述">
          <el-input v-model="pageCopy.articlesDesc" type="textarea" :rows="2" placeholder="按时间倒序排列。用分类缩小范围，或者直接搜索标题、摘要和标签。" />
        </el-form-item>
        <el-form-item label="归档页描述">
          <el-input v-model="pageCopy.archiveDesc" type="textarea" :rows="2" placeholder="按年份整理的时间线。文章还在继续写，这里只记录它们出现的顺序。" />
        </el-form-item>
        <el-form-item label="分类页描述">
          <el-input v-model="pageCopy.categoriesDesc" type="textarea" :rows="2" placeholder="按主题整理的文章索引。点进任意分类，就是该分类下的文章列表。" />
        </el-form-item>
        <el-form-item label="相册页描述">
          <el-input v-model="pageCopy.photosDesc" type="textarea" :rows="2" placeholder="没有被写进文章里的画面，按相册收好。点开看大图。" />
        </el-form-item>

        <el-divider content-position="left">关于页文案</el-divider>
        <el-form-item label="页面小标题">
          <el-input v-model="aboutPage.eyebrow" placeholder="ABOUT · 关于" />
        </el-form-item>
        <el-form-item label="页面标题">
          <el-input v-model="aboutPage.titleHtml" placeholder="关于<span class=&quot;grad-text&quot;>.</span>" />
          <div class="field-hint">支持 HTML；留空使用默认标题「关于.」，最后的点带渐变色。</div>
        </el-form-item>
        <el-form-item label="页面描述">
          <el-input v-model="aboutPage.desc" type="textarea" :rows="2" placeholder="关于这个站，以及一些不重要但想说的话。" />
        </el-form-item>
        <el-form-item label="关于本站标题">
          <el-input v-model="aboutPage.aboutTitle" placeholder="关于本站" />
        </el-form-item>
        <el-form-item label="留言区标题">
          <el-input v-model="aboutPage.messageTitle" placeholder="留言" />
        </el-form-item>
        <el-form-item label="关于页正文">
          <mavon-editor v-model="form.aboutContent" :toolbars="aboutToolbars" :ishljs="false" style="min-height:420px;" />
          <div class="field-hint">支持 Markdown / HTML。填写后，关于页正文只显示这里的内容；留空则使用默认三段文案。</div>
        </el-form-item>
        <el-form-item label="博主头像">
          <el-input v-model="form.avatarUrl" placeholder="博主头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
          <div class="field-hint">显示在关于页、文章详情页的作者信息中。</div>
        </el-form-item>
        <el-form-item label="用户默认头像">
          <el-input v-model="form.defaultUserAvatarUrl" placeholder="用户默认头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadDefaultUserAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
          <div class="field-hint">普通用户未设置头像时的默认头像。</div>
        </el-form-item>
        <el-form-item label="管理员默认头像">
          <el-input v-model="form.defaultAdminAvatarUrl" placeholder="管理员默认头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadDefaultAdminAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
          <div class="field-hint">管理员未设置头像时的默认头像（评论区、导航栏等）。</div>
        </el-form-item>
        <el-form-item label="首页大图">
          <el-input v-model="form.homeImageUrl" placeholder="首页大图链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadHomeImage" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
          <div class="field-hint">显示在首页首屏左侧的大图背景中，流丝动画会盖在图片上；留空则隐藏。</div>
        </el-form-item>

        <el-divider content-position="left">社交链接</el-divider>
        <el-form-item label="GitHub">
          <el-input v-model="form.githubUrl" placeholder="https://github.com/yourname" />
        </el-form-item>
        <el-form-item label="B站">
          <el-input v-model="form.bilibiliUrl" placeholder="https://space.bilibili.com/xxx" />
        </el-form-item>
        <el-form-item label="QQ号">
          <el-input v-model="form.qqNumber" type="textarea" :rows="2" maxlength="120" placeholder="123456789&#10;987654321" />
          <div class="field-hint">支持多个 QQ 号，用换行、空格、逗号或分号分隔。关于页点击 QQ 会弹出复制面板。</div>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="textarea" :rows="3" maxlength="240" placeholder="your@email.com&#10;another@outlook.com" />
          <div class="field-hint">支持多个邮箱，用换行、空格、逗号或分号分隔。关于页点击邮箱会弹出复制面板，可逐条复制或一键复制全部。</div>
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="form.wechatId" type="textarea" :rows="2" maxlength="120" placeholder="your_wechat_id&#10;another_wechat_id" />
          <div class="field-hint">支持多个微信号，用换行、空格、逗号或分号分隔。关于页点击微信会弹出复制面板。</div>
        </el-form-item>

        <el-form-item label="底部文本">
          <el-input v-model="form.footerText" type="textarea" :rows="2" placeholder="支持HTML" />
        </el-form-item>
        <el-form-item label="ICP备案号">
          <el-input v-model="form.icp" placeholder="京ICP备12345678号" />
        </el-form-item>
        <el-form-item label="公安备案号">
          <el-input v-model="form.police" placeholder="京公网安备 11010102001234号" />
        </el-form-item>

        <el-divider content-position="left">前台文案</el-divider>
        <el-form-item label="文案覆盖 JSON">
          <el-input
            v-model="form.frontendContent"
            type="textarea"
            :rows="14"
            class="json-editor"
            placeholder='留空使用前端默认文案。可填写 JSON，例如 {"home":{"hero":{"desc":"这里换成你自己的介绍"}}}' />
          <div class="field-hint">前台所有可见文字都从这里覆盖；只写要改的字段即可，其余保持默认。首页、页面描述和关于页的字段以上方表单为准，这里用于覆盖其他位置。保存前会校验 JSON 格式。</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save" :loading="saving">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { getBlogSetting, updateBlogSetting, uploadImage } from '../../api/admin'
import { defaultSiteContent } from '../../content/site'

export default {
  components: { mavonEditor },
  data() {
    return {
      form: {
        siteTitle: '',
        siteSubtitle: '',
        authorName: '',
        authorBio: '',
        avatarUrl: '',
        defaultUserAvatarUrl: '',
        defaultAdminAvatarUrl: '',
        homeImageUrl: '',
        githubUrl: '',
        bilibiliUrl: '',
        qqNumber: '',
        email: '',
        wechatId: '',
        footerText: '',
        welcomeText: '',
        aboutContent: '',
        frontendContent: '',
        icp: '',
        police: ''
      },
      pageCopy: {
        homeTitleHtml: defaultSiteContent.home.hero.titleHtml,
        homeDesc: defaultSiteContent.home.hero.desc,
        homeCaption: defaultSiteContent.home.hero.caption,
        articlesDesc: defaultSiteContent.articles.desc,
        archiveDesc: defaultSiteContent.archive.desc,
        categoriesDesc: defaultSiteContent.categories.desc,
        photosDesc: defaultSiteContent.photos.desc
      },
      aboutPage: {
        eyebrow: '',
        titleHtml: '',
        desc: '',
        aboutTitle: '',
        messageTitle: ''
      },
      aboutToolbars: {
        bold: true, italic: true, header: true, underline: true, strikethrough: true,
        quote: true, ol: true, ul: true, link: true, imagelink: true, code: true,
        table: true, fullscreen: true, htmlcode: true
      },
      saving: false
    }
  },
  mounted() { this.load() },
  methods: {
    async load() {
      try {
        const res = await getBlogSetting()
        if (res.data) {
          Object.keys(this.form).forEach(k => {
            const val = res.data[k]
            if (val !== undefined && val !== null) {
              this.form[k] = val
            }
          })
          this.readContentOverrides(res.data.frontendContent)
        }
      } catch (e) { this.$message.error('获取设置失败') }
    },
    readContentOverrides(raw) {
      let content = raw
      if (typeof content === 'string') {
        try { content = JSON.parse(content) } catch (e) { content = null }
      }
      const asObject = value => (value && typeof value === 'object' && !Array.isArray(value)) ? value : {}
      const pick = (value, fallback) => (value === undefined || value === null) ? fallback : value
      const about = asObject(content && content.about)
      this.aboutPage = {
        eyebrow: about.eyebrow || '',
        titleHtml: about.titleHtml || '',
        desc: about.desc || '',
        aboutTitle: about.aboutTitle || '',
        messageTitle: about.messageTitle || ''
      }
      const home = asObject(content && content.home)
      const hero = asObject(home.hero)
      const articles = asObject(content && content.articles)
      const archive = asObject(content && content.archive)
      const categories = asObject(content && content.categories)
      const photos = asObject(content && content.photos)
      this.pageCopy = {
        homeTitleHtml: pick(hero.titleHtml, defaultSiteContent.home.hero.titleHtml),
        homeDesc: pick(hero.desc, defaultSiteContent.home.hero.desc),
        homeCaption: pick(hero.caption, defaultSiteContent.home.hero.caption),
        articlesDesc: pick(articles.desc, defaultSiteContent.articles.desc),
        archiveDesc: pick(archive.desc, defaultSiteContent.archive.desc),
        categoriesDesc: pick(categories.desc, defaultSiteContent.categories.desc),
        photosDesc: pick(photos.desc, defaultSiteContent.photos.desc)
      }
    },
    async save() {
      const raw = (this.form.frontendContent || '').trim()
      let content = {}
      if (raw) {
        try {
          content = JSON.parse(raw)
        } catch (e) {
          this.$message.error('前台文案 JSON 格式不正确，请检查后再保存')
          return
        }
        if (!content || typeof content !== 'object' || Array.isArray(content)) {
          this.$message.error('前台文案必须是一个 JSON 对象')
          return
        }
      }
      const asObject = value => (value && typeof value === 'object' && !Array.isArray(value)) ? value : {}
      const setPage = (obj, key, value, fallback) => {
        const text = value == null ? '' : String(value)
        if (!text.trim() || text.trim() === String(fallback == null ? '' : fallback).trim()) {
          delete obj[key]
        } else {
          obj[key] = value
        }
      }

      const home = Object.assign({}, asObject(content.home))
      const hero = Object.assign({}, asObject(home.hero))
      setPage(hero, 'titleHtml', this.pageCopy.homeTitleHtml, defaultSiteContent.home.hero.titleHtml)
      setPage(hero, 'desc', this.pageCopy.homeDesc, defaultSiteContent.home.hero.desc)
      setPage(hero, 'caption', this.pageCopy.homeCaption, defaultSiteContent.home.hero.caption)
      if (Object.keys(hero).length) home.hero = hero
      else delete home.hero
      if (Object.keys(home).length) content.home = home
      else delete content.home

      const articles = Object.assign({}, asObject(content.articles))
      setPage(articles, 'desc', this.pageCopy.articlesDesc, defaultSiteContent.articles.desc)
      if (Object.keys(articles).length) content.articles = articles
      else delete content.articles

      const archive = Object.assign({}, asObject(content.archive))
      setPage(archive, 'desc', this.pageCopy.archiveDesc, defaultSiteContent.archive.desc)
      if (Object.keys(archive).length) content.archive = archive
      else delete content.archive

      const categories = Object.assign({}, asObject(content.categories))
      setPage(categories, 'desc', this.pageCopy.categoriesDesc, defaultSiteContent.categories.desc)
      if (Object.keys(categories).length) content.categories = categories
      else delete content.categories

      const photos = Object.assign({}, asObject(content.photos))
      setPage(photos, 'desc', this.pageCopy.photosDesc, defaultSiteContent.photos.desc)
      if (Object.keys(photos).length) content.photos = photos
      else delete content.photos

      const about = Object.assign({}, asObject(content.about))
      const setAbout = (key, value) => {
        const trimmed = (value || '').trim()
        if (trimmed) about[key] = value
        else delete about[key]
      }
      setAbout('eyebrow', this.aboutPage.eyebrow)
      setAbout('titleHtml', this.aboutPage.titleHtml)
      setAbout('desc', this.aboutPage.desc)
      setAbout('aboutTitle', this.aboutPage.aboutTitle)
      setAbout('messageTitle', this.aboutPage.messageTitle)
      if (Object.keys(about).length) content.about = about
      else delete content.about
      this.form.frontendContent = Object.keys(content).length ? JSON.stringify(content, null, 2) : ''
      this.saving = true
      try {
        await updateBlogSetting(this.form)
        this.$message.success('保存成功！请刷新前台页面查看效果')
      } catch (e) {
        this.$message.error(e.response?.data?.message || '保存失败')
      } finally {
        this.saving = false
      }
    },
    async uploadDefaultUserAvatar({ file }) {
      try {
        const res = await uploadImage(file)
        this.form.defaultUserAvatarUrl = res.data.url || res.data
        this.$message.success('上传成功')
      } catch (e) { this.$message.error('上传失败') }
    },
    async uploadDefaultAdminAvatar({ file }) {
      try {
        const res = await uploadImage(file)
        this.form.defaultAdminAvatarUrl = res.data.url || res.data
        this.$message.success('上传成功')
      } catch (e) { this.$message.error('上传失败') }
    },
    async uploadHomeImage({ file }) {
      try {
        const res = await uploadImage(file)
        this.form.homeImageUrl = res.data.url || res.data
        this.$message.success('上传成功')
      } catch (e) { this.$message.error('上传失败') }
    },
    async uploadAvatar({ file }) {
      try {
        const res = await uploadImage(file)
        this.form.avatarUrl = res.data.url || res.data
        this.$message.success('上传成功')
      } catch (e) { this.$message.error('上传失败') }
    }
  }
}
</script>

<style scoped>
.json-editor >>> textarea {
  font-family: "JetBrains Mono", Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
}
.field-hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin-top: 6px;
}
</style>