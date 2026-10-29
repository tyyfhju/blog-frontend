
<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-logo">管理后台</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1a1c2b"
        text-color="#b0b3c7"
        active-text-color="#409eff"
      >
        <el-menu-item index="/cpanel">
          <i class="el-icon-s-data"></i>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/articles">
          <i class="el-icon-document"></i>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/categories">
          <i class="el-icon-folder"></i>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/tags">
          <i class="el-icon-collection-tag"></i>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/users">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/settings">
          <i class="el-icon-setting"></i>
          <span>博客设置</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/photos">
          <i class="el-icon-picture"></i>
          <span>相册管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/comments">
          <i class="el-icon-chat-dot-square"></i>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/cpanel/messages">
          <i class="el-icon-message"></i>
          <span>留言管理</span>
        </el-menu-item>
      </el-menu>
      <div class="admin-logout" @click="logout">
        <i class="el-icon-switch-button"></i> 退出登录
      </div>
    </aside>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  computed: {
    activeMenu() {
      const p = this.$route.path
      if (p === '/cpanel') return '/cpanel'
      if (p.startsWith('/cpanel/articles')) return '/cpanel/articles'
      return p
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/secret-login')
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}
.admin-sidebar {
  width: 240px;
  background: #1a1c2b;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.admin-logo {
  padding: 24px 20px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #2a2d3e;
  text-align: center;
  letter-spacing: 1px;
}
.admin-sidebar .el-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}
.admin-logout {
  padding: 16px 24px;
  cursor: pointer;
  border-top: 1px solid #2a2d3e;
  color: #b0b3c7;
  font-size: 14px;
  text-align: center;
  transition: color 0.2s;
}
.admin-logout:hover { color: #ff4d4f; }
.admin-content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
}
</style>
