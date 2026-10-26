<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">创建账号</h2>
      <p class="auth-subtitle">注册一个新的账户</p>
      <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter.native="handleRegister">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱地址" prefix-icon="el-icon-message" size="large" />
        </el-form-item>
        <el-form-item prop="captchaCode">
          <div class="flex-row">
            <el-input v-model="form.captchaCode" placeholder="图形验证码" style="flex:1" size="large" />
            <img :src="captchaImage" @click="refreshCaptcha" class="captcha-img" alt="点击刷新" />
          </div>
        </el-form-item>
        <el-form-item prop="emailCode">
          <div class="flex-row">
            <el-input v-model="form.emailCode" placeholder="邮箱验证码" style="flex:1" size="large" />
            <el-button :disabled="countdown > 0" @click="sendCode" size="small">
              {{ countdown > 0 ? countdown + 's' : '发送' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" show-password size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" class="auth-btn">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-links">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getCaptcha, sendEmailCode, register } from '../api/auth'

export default {
  name: 'Register',
  data() {
    return {
      form: { email: '', password: '', captchaCode: '', emailCode: '' },
      rules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        captchaCode: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }],
        emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }]
      },
      captchaKey: '',
      captchaImage: '',
      countdown: 0,
      loading: false
    }
  },
  mounted() { this.refreshCaptcha() },
  methods: {
    isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) },
    async refreshCaptcha() {
      try {
        const res = await getCaptcha()
        this.captchaKey = res.data.captchaKey
        this.captchaImage = res.data.captchaImage
      } catch (e) { this.$message.error('获取验证码失败') }
    },
    async sendCode() {
      if (!this.form.email) return this.$message.warning('请先输入邮箱')
      if (!this.isValidEmail(this.form.email)) return this.$message.warning('邮箱格式不正确')
      try {
        await sendEmailCode(this.form.email)
        this.$message.success('验证码已发送')
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) clearInterval(timer)
        }, 1000)
      } catch (e) { this.$message.error('发送失败') }
    },
    async handleRegister() {
      this.$refs.formRef.validate(async (ok) => {
        if (!ok) return
        this.loading = true
        try {
          const res = await register({
            email: this.form.email,
            password: this.form.password,
            captchaKey: this.captchaKey,
            captchaCode: this.form.captchaCode,
            emailCode: this.form.emailCode
          })
          this.$message.success('注册成功')
          this.$router.push('/login')
        } catch (e) {
          this.$message.error(e.response?.data?.message || '注册失败')
          this.refreshCaptcha()
        } finally { this.loading = false }
      })
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  background: var(--background-secondary);
  border-radius: 1rem;
  box-shadow: var(--accent-shadow);
}
.auth-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-bright);
  text-align: center;
  margin-bottom: 0.5rem;
}
.auth-subtitle {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}
.auth-btn {
  width: 100%;
  background: var(--main-gradient) !important;
  border: none !important;
  color: #fff;
  font-weight: 600;
}
.auth-links {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
}
.auth-links a { color: var(--text-sub-accent); text-decoration: none; }
.auth-links a:hover { color: var(--text-accent); }
.flex-row { display: flex; gap: 10px; align-items: center; }
.captcha-img { height: 40px; border-radius: 6px; cursor: pointer; }
</style>