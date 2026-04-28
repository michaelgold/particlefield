# 🚀 Consumables - 快速启动指南

## ⚡ 30秒快速开始

### 1️⃣ 启动开发服务器
```bash
cd d:\TDspring26\particlefield
pnpm dev
```

### 2️⃣ 打开浏览器
- **粒子场**: http://localhost:3000
- **Consumables 游戏页**: http://localhost:3000/consumables

## 📱 响应式测试

按 `F12` 打开开发者工具，测试不同设备:
- 🔴 **手机**: 375 × 667
- 🟡 **平板**: 768 × 1024  
- 🟢 **桌面**: 1920 × 1080

## 🚢 一键部署到 Vercel

### 方法 1: CLI 部署（推荐）
```bash
# 全局安装 Vercel
npm install -g vercel

# 登录
vercel login

# 部署到生产
vercel --prod
```

### 方法 2: GitHub 自动部署
1. 将代码推送到 GitHub
2. 访问 https://vercel.com/new
3. 导入仓库
4. 完成！自动部署并获得 URL

## 🎨 页面结构

```
http://localhost:3000/consumables
│
├── 导航栏 (固定)
├── Hero 部分 (3D 背景)
├── 📖 概念部分
├── 👾 特性部分
├── 🎯 说明部分  
├── 🎬 演示部分
└── 页脚
```

## ✨ 已实现的特性

| 特性 | 状态 | 说明 |
|-----|------|------|
| Hero 标题和副标题 | ✅ | "CONSUMABLES" 恐怖超市游戏 |
| 3D 背景效果 | ✅ | Three.js 实时动画 |
| 游戏概念说明 | ✅ | 黑暗中的购物体验 |
| 6 个游戏特性 | ✅ | 动态展示卡片 |
| 4 步入门指南 | ✅ | 分步骤说明 |
| 演示部分 | ✅ | 视频占位符和链接 |
| 导航菜单 | ✅ | 平滑滚动到各部分 |
| 响应式设计 | ✅ | 完美适配所有屏幕 |
| 暗黑主题 | ✅ | 符合恐怖游戏气氛 |

## 🎬 自定义步骤

### 添加真实的游戏视频
编辑 `app/consumables/page.tsx`:
```tsx
// 替换这一行:
<div className="bg-gray-900 rounded-lg overflow-hidden border border-red-600/30 h-80">
  <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-black flex items-center justify-center">
    <div className="text-center">
      <p className="text-3xl mb-4">🎥</p>
      <p className="text-gray-400">游戏预告片</p>
      <p className="text-sm text-gray-500 mt-2">敬请期待...</p>
    </div>
  </div>
</div>

// 改为:
<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  className="rounded-lg"
></iframe>
```

### 更新项目链接
在 `app/consumables/page.tsx` 中更新:
```tsx
<a href="https://github.com/YOUR_REPO" target="_blank">
  📦 GitHub 仓库
</a>

<a href="https://itch.io/game/YOUR_GAME" target="_blank">
  🎮 Itch.io 下载
</a>
```

### 更改颜色主题
编辑 `app/consumables/page.tsx` 中的颜色:
- 红色主题: `#ff0000` 和 `#ff6600`
- 改为蓝色: `#0066ff` 和 `#00ccff`
- 改为绿色: `#00ff00` 和 `#00cc66`

## 📊 部署后检查

部署完成后，检查:
- ✅ 主域名工作正常
- ✅ /consumables 路由可访问
- ✅ 3D 动画流畅
- ✅ 移动端界面正确显示
- ✅ 所有按钮可点击
- ✅ 浏览器控制台无错误

## 🆘 常见问题

**Q: 3D 动画看起来很慢？**  
A: 降低粒子数量或关闭浏览器中的其他标签页

**Q: 移动端显示不正确？**  
A: 清除浏览器缓存并刷新页面

**Q: Vercel 部署失败？**  
A: 确保 `pnpm-lock.yaml` 已提交到 Git

## 📞 需要帮助？

1. 检查浏览器控制台（F12）查看错误
2. 查看 `CONSUMABLES_DEPLOYMENT.md` 获取详细指南
3. 检查 Vercel 构建日志

---

**现在就开始吧！** 🎮
