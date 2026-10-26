<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">欢迎回来</h2>
      <p class="auth-subtitle">登录你的账户</p>
      <el-form :model="form" :rules="rules" ref="loginForm" @keyup.enter.native="submitForm">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱地址" prefix-icon="el-icon-message" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" show-password size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading" class="auth-btn">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-links">
        <router-link to="/register">没有账号？立即注册</router-link>
        <router-link to="/forgot-password">忘记密码？</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../api/auth'

export default {
  data() {
    return {
      form: { email: '', password: '' },
      rules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    submitForm() {
      this.$refs.loginForm.validate(async (ok) => {
        if (!ok) return
        this.loading = true
        try {
          const res = await login({ email: this.form.email, password: this.form.password })
          const token = res.data?.token || res.data
          const payload = JSON.parse(atob(token.split('.')[1]))
          // 使用 Vuex action 保持响应式更新
          await this.$store.dispatch('loginSuccess', { token, user: payload })
          this.$message.success('登录成功')
          if (payload.role === 'admin') {
            localStorage.setItem('adminToken', token)
            this.$router.push('/cpanel')
          } else {
            this.$router.push('/')
          }
        } catch (e) {
          this.$message.error(e.response?.data?.message || '登录失败')
        } finally {
          this.loading = false
        }
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
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.85rem;
}
.auth-links a { color: var(--text-sub-accent); text-decoration: none; }
.auth-links a:hover { color: var(--text-accent); }
</style>