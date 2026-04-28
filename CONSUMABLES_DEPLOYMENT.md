# Consumables - Splash Website 部署指南

## 📋 项目结构

```
consumables/
├── app/
│   ├── page.tsx                    # 原始粒子场页面
│   ├── layout.tsx                  # 根布局
│   ├── globals.css                 # 全局样式
│   └── consumables/
│       ├── page.tsx                # Consumables 着陆页面
│       └── layout.tsx              # Consumables 元数据
├── vercel.json                     # Vercel 部署配置
└── package.json                    # 项目依赖
```

## 🚀 本地开发

### 前置要求
- Node.js 18+
- pnpm 10.28.0+

### 安装依赖
```bash
cd d:\TDspring26\particlefield
pnpm install
```

### 启动开发服务器
```bash
# 启动 Next.js 开发服务器
pnpm dev
```

### 访问应用
- **主页面（粒子场）**: http://localhost:3000
- **Consumables 着陆页面**: http://localhost:3000/consumables

## 📱 响应式设计特性

✅ **移动端优化**
- 触摸界面支持
- 适配小屏幕
- 优化的导航菜单

✅ **平板电脑**
- 中等屏幕适配
- 平衡的布局

✅ **桌面电脑**
- 完整的特性展示
- 高分辨率支持
- 3D 效果优化

## 🎨 Consumables 页面特性

### 1. **3D 背景**
- 使用 Three.js 渲染的实时 3D 效果
- 动画化的立方体和环面扭结
- 不同颜色的点光源
- 响应式窗口大小调整

### 2. **导航栏**
- 固定顶部导航
- 光玻 frosted glass 效果
- 响应式菜单
- 平滑滚动链接

### 3. **内容部分**
- **Hero 部分**: 项目标题和说明
- **概念部分**: 游戏背景和核心理念
- **特性部分**: 6 个主要游戏特性
- **说明部分**: 4 步开始指南
- **演示部分**: 演示视频占位符和项目链接
- **页脚**: 版权信息

### 4. **交互效果**
- 悬停按钮缩放效果
- 脉冲动画文本
- Glitch 效果标题
- 平滑过渡和动画

## 📦 部署到 Vercel

### 步骤 1: 准备 GitHub 仓库

```bash
# 初始化 Git 仓库（如果未初始化）
git init

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/particlefield.git

# 提交所有更改
git add .
git commit -m "feat: add Consumables splash website"

# 推送到 GitHub
git push -u origin main
```

### 步骤 2: 在 Vercel 上部署

#### 方法 A: 使用 Vercel CLI

```bash
# 全局安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

#### 方法 B: 使用 Vercel 网站

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 "particlefield" 项目
5. 配置:
   - **Framework**: Next.js
   - **Build Command**: `pnpm run build`
   - **Start Command**: `next start`
   - **Install Command**: `pnpm install`
6. 点击 "Deploy"

### 步骤 3: 配置自定义域名（可选）

在 Vercel 控制面板中:
1. 项目设置 → Domains
2. 添加你的自定义域名
3. 按照 DNS 配置指示更新域名 DNS 记录

## 🔍 验证部署

### 检查清单
- [ ] 主页面 (/) 正常工作
- [ ] Consumables 页面 (/consumables) 正常工作
- [ ] 3D 动画流畅运行
- [ ] 移动端界面响应正确
- [ ] 所有链接都可点击
- [ ] 控制台中没有错误

### 测试响应式设计

```bash
# 在浏览器中测试不同的视口大小：
# - 手机: 375x667 (iPhone SE)
# - 平板: 768x1024 (iPad)
# - 桌面: 1920x1080 (Full HD)
```

## 🌐 URL 路由

| 路由 | 描述 | 用途 |
|------|------|------|
| `/` | 粒子场页面 | 展示 3D 粒子效果 |
| `/consumables` | Consumables 着陆页面 | 游戏项目宣传 |

## ⚙️ 环境变量

如果需要环境变量，在 Vercel 项目设置中添加:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 🛠️ 常见问题

### 部署失败？
- 检查 Node.js 版本是否为 18+
- 确保 `pnpm-lock.yaml` 正确提交
- 查看 Vercel 构建日志

### 3D 效果在移动端不显示？
- 移动设备可能禁用了 WebGL
- 浏览器不支持 Three.js
- 检查浏览器控制台错误

### 页面加载缓慢？
- 优化 3D 几何复杂度
- 启用 Vercel Edge Functions
- 使用 CDN 加速

## 📈 性能优化

### 已优化项
- ✅ Turbopack 用于快速开发
- ✅ 动态导入减少初始包大小
- ✅ Image 组件优化
- ✅ CSS 模块化

### 进一步优化
```bash
# 分析包大小
next/dist/bin/next build --analyze

# 运行生产构建
pnpm run build
pnpm run start
```

## 🔐 安全性建议

1. **环境变量**: 避免在代码中硬编码敏感信息
2. **HTTPS**: Vercel 自动启用 HTTPS
3. **CSP 头**: 在必要时配置内容安全策略
4. **Rate Limiting**: 对 API 端点实现速率限制

## 📞 支持和资源

- **Next.js 文档**: https://nextjs.org/docs
- **Vercel 文档**: https://vercel.com/docs
- **Three.js 文档**: https://threejs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## 📝 更新日志

### v0.1.0 (2026-04-27)
- ✅ 创建 Consumables 着陆页面
- ✅ 添加响应式设计
- ✅ 集成 3D 背景效果
- ✅ 准备 Vercel 部署
- ✅ 添加中文本地化

---

**部署有问题？** 查看完整的故障排除指南或查阅官方文档。
