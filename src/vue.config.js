module.exports = {
  runtimeCompiler: true, // 允许编译 template 字符串
  publicPath: '/',
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
n