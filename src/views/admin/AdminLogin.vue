<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h2>管理员登录</h2>
      <el-form :model="form" :rules="rules" ref="form">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="el-icon-message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doLogin" :loading="loading" style="width:100%">管理员登录</el-button>
        </el-form-item>
      </el-form>
      <p class="back-link"><router-link to="/">← 返回首页</router-link></p>
    </div>
  </div>
</template>

<script>
import { login } from '../../api/auth'
import { getUserProfile } from '../../api/user'

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
    async doLogin() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.loading = true
      try {
        const res = await login({ email: this.form.email, password: this.form.password })
        const token = res.data?.token || res.data
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'admin') {
          this.$message.error('非管理员账号')
          return
        }
        localStorage.setItem('adminToken', token)
        const baseUser = Object.assign({}, payload, { email: payload.email || payload.sub || this.form.email })
        await this.$store.dispatch('loginSuccess', { token, user: baseUser })
        try {
          const profileRes = await getUserProfile()
          await this.$store.dispatch('loginSuccess', {
            token,
            user: Object.assign({}, baseUser, profileRes.data || {})
          })
        } catch (e) { /* 导航栏先使用 JWT 中的基础信息 */ }
        this.$message.success('登录成功')
        this.$router.push('/cpanel')
      } catch (e) {
        this.$message.error(e.response?.data?.message || '登录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.admin-login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.admin-login-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #333;
}
.back-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
}
.back-link a { color: #666; }
.back-link a:hover { color: #409eff; }
</style>
