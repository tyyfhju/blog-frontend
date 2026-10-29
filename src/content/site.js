/**
 * 前台可见文案的统一入口。
 * 默认值用于前端兜底；后续后台会在 BlogSetting.frontendContent（JSON）里返回同结构覆盖。
 * 组件里不要再硬编码可见文字，统一从 store.state.content 读取。
 */
export const defaultSiteContent = {
  nav: {
    home: '首页',
    articles: '文章',
    archive: '归档',
    categories: '分类',
    photos: '相册',
    about: '关于'
  },
  common: {
    login: '登录',
    logout: '退出登录',
    admin: '后台管理',
    profile: '个人中心',
    search: '搜索',
    searchPlaceholder: '搜索文章标题、摘要或标签…',
    close: '关闭',
    loading: '加载中…',
    empty: '暂无内容',
    retry: '重试',
    menu: '菜单',
    lightMode: '切换到浅色',
    darkMode: '切换到深色',
    logoutSuccess: '已退出登录',
    articlesUnit: '篇文章',
    categoriesUnit: '个分类',
    photosUnit: '张照片',
    albumsUnit: '个相册',
    articleShortUnit: '篇',
    updated: '持续更新',
    uncategorized: '未分类',
    post: '文章',
    views: '阅读',
    anonymous: '匿名用户',
    visitor: '访客',
    prevPage: '← 上一页',
    nextPage: '下一页 →',
    pagination: '分页',
    filterByCategory: '按分类筛选',
    filterByAlbum: '按相册筛选',
    copyCode: '复制代码',
    loadFail: '加载失败'
  },
  home: {
    hero: {
      titleHtml: '写代码，<br>也写<span class="grad-text">为什么这样写</span>。',
      desc: 'Java、Spring 与前端工程的实践记录。不是教程的搬运，而是每次取舍背后的理由。',
      primaryText: '开始阅读 →',
      secondaryText: '查看归档',
      caption: 'SILK FLOW · 柔软地穿过复杂'
    },
    featured: {
      title: '精选',
      desc: '两篇值得慢读的长文',
      more: '查看全部 →'
    },
    latest: {
      title: '最新文章',
      desc: '按时间倒序，持续更新',
      more: '查看全部 →'
    },
    categories: {
      title: '分类',
      desc: '把散文章组织成线',
      more: '全部分类 →'
    },
    readMore: '阅读全文 →',
    holiday: {
      calculating: '计算中…',
      today: '今天是「{name}」',
      countdown: '距离「{name}」还有 {d} 天 {h} 时 {m} 分 {s} 秒'
    },
    empty: '还没有文章，赶紧来发布第一篇吧~'
  },
  articles: {
    eyebrow: 'ARTICLES · 文章',
    titleHtml: '所有文章<span class="grad-text">.</span>',
    desc: '按时间倒序排列。用分类缩小范围，或者直接搜索标题、摘要和标签。',
    searchPlaceholder: '搜索标题、摘要或标签…',
    all: '全部',
    sort: '按发布时间倒序',
    range: '第 {start}–{end} 篇 / 共 {total} 篇',
    zeroRange: '共 0 篇',
    emptyTitle: '没有匹配的文章',
    emptyDesc: '换个关键词，或者清除筛选条件试试。',
    clear: '清除筛选',
    readUnit: '分钟',
    viewsUnit: '阅读'
  },
  article: {
    back: '返回文章',
    author: '关于作者',
    related: '相关推荐',
    previous: '← 上一篇',
    next: '下一篇 →',
    comments: '评论',
    views: '阅读',
    likes: '点赞',
    words: '字',
    minutes: '分钟',
    reading: '阅读',
    scrollHint: 'SCROLL',
    likeHint: '请先登录后再点赞',
    loadFail: '文章加载失败',
    copyCode: '复制',
    copied: '已复制',
    variant: {
      badge: '视觉 {n}/4 · {name}',
      next: '换一个',
      names: ['二十面体', '极光绸带', '轨道星环', '光之双螺旋']
    }
  },
  archive: {
    eyebrow: 'ARCHIVE · 归档',
    titleHtml: '归档<span class="grad-text">.</span>',
    desc: '按年份整理的时间线。文章还在继续写，这里只记录它们出现的顺序。',
    yearUnit: '个年份',
    articleUnit: '篇',
    empty: '还没有文章'
  },
  categories: {
    eyebrow: 'CATEGORIES · 分类',
    titleHtml: '分类<span class="grad-text">.</span>',
    desc: '按主题整理的文章索引。点进任意分类，就是该分类下的文章列表。',
    allArticles: '不确定从哪看？直接浏览全部文章 →',
    articleUnit: '篇',
    cardDesc: '点击查看「{name}」下的全部文章。',
    emptyArticles: '暂无文章'
  },
  photos: {
    eyebrow: 'PHOTOS · 相册',
    titleHtml: '相册<span class="grad-text">.</span>',
    desc: '没有被写进文章里的画面，按相册收好。点开看大图。',
    all: '全部',
    count: '{n} 张照片',
    empty: '这个相册还没有照片',
    close: '关闭',
    previous: '上一张',
    next: '下一张'
  },
  about: {
    eyebrow: 'ABOUT · 关于',
    titleHtml: '关于<span class="grad-text">.</span>',
    desc: '关于这个站，以及一些不重要但想说的话。',
    aboutTitle: '关于本站',
    messageTitle: '留言',
    nicknamePlaceholder: '昵称（可留空）',
    messagePlaceholder: '说点什么吧...',
    submit: '提交留言',
    nicknameRequired: '请输入昵称',
    messageRequired: '请输入留言内容',
    messageSuccess: '留言成功',
    messageFail: '留言失败',
    emptyMessage: '暂无留言',
    authorFallback: '博主',
    anonymous: '匿名用户',
    visitor: '访客',
    asUser: '以 {name} 留言',
    github: 'GitHub ↗',
    bilibili: 'B站 ↗',
    email: '邮箱',
    qq: 'QQ',
    wechat: '微信',
    contact: {
      close: '关闭',
      hint: '点击任意一条即可复制',
      copy: '复制',
      copied: '已复制',
      copyAll: '复制全部',
      copiedAll: '已全部复制',
      emailTitle: '邮箱',
      emailDesc: '点击任意一条，复制邮箱地址。',
      qqTitle: 'QQ',
      qqDesc: '点击复制 QQ 号，在 QQ 中搜索添加。',
      wechatTitle: '微信',
      wechatDesc: '点击复制微信号，在微信中搜索添加。'
    },
    articleLabel: '文章',
    categoryLabel: '分类',
    paragraphs: [
      '这里记录 Java、Spring 与前端工程里的实践和取舍。不是教程的搬运，更多是每次做决定时的理由，以及后来被证明是错的部分。',
      '博客本身也在被持续改造：从页面结构、配色到部署方式，能自己写的地方就不偷懒。',
      '如果某篇文章帮你少踩了一个坑，或者让你有不同的看法，欢迎在下面留言。'
    ]
  },
  search: {
    title: '搜索文章',
    placeholder: '输入关键词搜索...',
    results: '搜索结果',
    recent: '最近文章',
    empty: '没有找到相关文章',
    emptyHint: '换个关键词试试。',
    viewAll: '查看全部结果 →',
    hint: '↑↓ 选择 · ↵ 打开 · ESC 关闭'
  },
  auth: {
    eyebrow: 'HYPERCUBE · 6D · NO INSIDE',
    loginEyebrow: 'WELCOME BACK',
    loginTitle: '欢迎回来',
    loginSub: '登录后继续阅读和留言。',
    registerEyebrow: 'CREATE ACCOUNT',
    registerTitle: '创建账号',
    registerSub: '注册后可以评论、留言。',
    email: '邮箱',
    password: '密码',
    captcha: '图形验证码',
    emailCode: '邮箱验证码',
    sendCode: '发送验证码',
    resend: '{n}s 后重发',
    login: '登录',
    register: '注册',
    forgot: '忘记密码？',
    show: '显示',
    hide: '隐藏',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '输入密码',
    passwordNewPlaceholder: '至少 6 位',
    captchaPlaceholder: '输入右侧字符',
    emailCodePlaceholder: '6 位验证码',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功，请登录。',
    captchaRefresh: '点击刷新验证码',
    emailInvalid: '请输入有效的邮箱地址',
    emailFirst: '请先输入有效的邮箱地址',
    passwordRequired: '请输入密码',
    passwordShort: '密码至少 6 位',
    captchaRequired: '请输入图形验证码',
    emailCodeRequired: '请输入邮箱验证码',
    codeSent: '验证码已发送',
    sendFail: '发送失败',
    captchaFail: '获取验证码失败',
    loginFail: '登录失败',
    registerFail: '注册失败',
    note: '注册需要邮箱验证码；登录后即可评论、留言。'
  },
  comments: {
    title: '评论',
    placeholder: '写下你的评论...',
    submit: '发表评论',
    loginHint: '后才能发表评论',
    login: '登录',
    empty: '暂无评论，来抢沙发吧~',
    success: '评论发表成功',
    fail: '评论失败，请登录后重试'
  },
  footer: {
    copyright: '© {year} {title}',
    icp: 'ICP备案号',
    police: '公安备案号'
  }
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

export function mergeSiteContent(base, extra) {
  if (!isPlainObject(extra)) return base
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base)
  Object.keys(extra).forEach(key => {
    if (isPlainObject(extra[key]) && isPlainObject(out[key])) {
      out[key] = mergeSiteContent(out[key], extra[key])
    } else if (extra[key] !== undefined) {
      out[key] = extra[key]
    }
  })
  return out
}

export function formatText(template, vars = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (m, key) => (
    vars[key] === undefined || vars[key] === null ? m : vars[key]
  ))
}
