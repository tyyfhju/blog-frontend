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
        <el-form-item label="技术栈">
          <el-input v-model="form.techStack" type="textarea" :rows="3" placeholder="技术栈：Vue2 + SpringBoot + MySQL + Redis&#10;部署：Nginx 反向代理 + Docker 容器化" />
        </el-form-item>
        <el-form-item label="博主头像">
          <el-input v-model="form.avatarUrl" placeholder="博主头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="默认用户头像">
          <el-input v-model="form.defaultUserAvatarUrl" placeholder="默认用户头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadDefaultUserAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="默认管理员头像">
          <el-input v-model="form.defaultAdminAvatarUrl" placeholder="默认管理员头像链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadDefaultAdminAvatar" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="首页大图">
          <el-input v-model="form.homeImageUrl" placeholder="首页大图链接">
            <template slot="append">
              <el-upload action="#" :http-request="uploadHomeImage" :show-file-list="false" accept="image/*">
                <el-button size="small">本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>

        <el-divider content-position="left">社交链接</el-divider>
        <el-form-item label="GitHub">
          <el-input v-model="form.githubUrl" placeholder="https://github.com/yourname" />
        </el-form-item>
        <el-form-item label="B站">
          <el-input v-model="form.bilibiliUrl" placeholder="https://space.bilibili.com/xxx" />
        </el-form-item>
        <el-form-item label="QQ号">
          <el-input v-model="form.qqNumber" placeholder="123456789" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="your@email.com" />
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="form.wechatId" placeholder="your_wechat_id" />
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
        <el-form-item>
          <el-button type="primary" @click="save" :loading="saving">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getBlogSetting, updateBlogSetting, uploadImage } from '../../api/admin'

export default {
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
        techStack: '',
        icp: '',
        police: ''
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
        }
      } catch (e) { this.$message.error('获取设置失败') }
    },
    async save() {
      this.saving = true
      try {
        const res = await updateBlogSetting(this.form)
        this.$message.success('保存成功！请刷新首页查看效果')
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