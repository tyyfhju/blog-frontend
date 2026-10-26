<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">找回密码</h2>
      <p class="auth-subtitle">{{ step === 1 ? '输入注册邮箱获取验证码' : '设置新密码' }}</p>
      <el-form v-if="step === 1" :model="form" ref="formRef1">
        <el-form-item>
          <el-input v-model="form.email" placeholder="注册邮箱" prefix-icon="el-icon-message" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="sendCode" :loading="sending" :disabled="countdown > 0" style="width:100%">
            {{ countdown > 0 ? countdown + 's后重发' : '发送验证码' }}
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-else :model="form" ref="formRef2">
        <el-form-item>
          <el-input v-model="form.newPassword" type="password" placeholder="新密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认新密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item>
          <div class="code-row">
            <el-input v-model="form.code" placeholder="邮箱验证码" style="flex:1" />
            <el-button :disabled="countdown > 0" @click="sendCode" size="small">
              {{ countdown > 0 ? countdown + 's' : '重发' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleReset" :loading="loading" style="width:100%">重置密码</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-links">
        <router-link to="/login">← 返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { sendForgotPasswordCode, resetPassword } from '../api/auth'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      step: 1,
      form: { email: '', code: '', newPassword: '', confirmPassword: '' },
      countdown: 0,
      sending: false,
      loading: false
    }
  },
  methods: {
    isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) },
    async sendCode() {
      if (!this.form.email) return this.$message.warning('请先输入邮箱')
      if (!this.isValidEmail(this.form.email)) return this.$message.warning('邮箱格式不正确')
      this.sending = true
      try {
        await sendForgotPasswordCode(this.form.email)
        this.$message.success('验证码已发送')
        this.step = 2
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) clearInterval(timer)
        }, 1000)
      } catch (e) {
        this.$message.error(e.response?.data?.message || '发送失败')
      } finally {
        this.sending = false
      }
    },
    async handleReset() {
      if (!this.form.newPassword || !this.form.confirmPassword || !this.form.code) {
        return this.$message.warning('请填写所有字段')
      }
      if (this.form.newPassword !== this.form.confirmPassword) {
        return this.$message.warning('两次输入的密码不一致')
      }
      this.loading = true
      try {
        await resetPassword({
          email: this.form.email,
          code: this.form.code,
          newPassword: this.form.newPassword
        })
        this.$message.success('密码重置成功，请使用新密码登录')
        this.$router.push('/login')
      } catch (e) {
        this.$message.error(e.response?.data?.message || '重置失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 3;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  background: var(--background-secondary);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
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
.code-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.auth-links {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
}
.auth-links a { color: var(--text-sub-accent); }
.auth-links a:hover { color: var(--text-accent); }
</style>