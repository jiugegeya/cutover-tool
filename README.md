# 割接方案评估录入工具

基于 Vue 3 + Element Plus + Express + MySQL 的割接方案评估录入系统。

## 功能特性

- 📋 割接方案录入与管理
- ⚠️ 风险评估与评分
- 📊 规则配置系统
- 📈 数据统计与可视化

## 技术栈

- **前端**: Vue 3 + Element Plus + Vite
- **后端**: Express + MySQL
- **状态管理**: Pinia

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动后端服务
npm run server

# 同时启动前后端
npm run start
```

## 项目结构

```
cutover-tool/
├── src/                # 前端源码
│   ├── views/          # 页面组件
│   ├── store/          # 状态管理
│   └── engine/         # 规则引擎
├── server/             # 后端源码
└── public/             # 静态资源
```

## License

MIT