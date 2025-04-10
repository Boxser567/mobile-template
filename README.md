# Mobile Template

基于 React + TypeScript + Vite 的现代化移动端开发模板

## 技术栈

- **核心框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **UI 框架**：Ant Design Mobile 5
- **状态管理**：Zustand
- **路由**：React Router 6
- **HTTP 客户端**：Axios
- **样式方案**：Less + TailwindCSS
- **国际化**：react-intl
- **工具库**：ahooks, dayjs, md5

## 项目特点

1. **工程化配置**

   - ESLint + Prettier + Stylelint 代码规范
   - Husky + Commitlint Git 提交规范
   - TypeScript 类型检查
   - 多环境配置（development/test/production）

2. **开发体验**

   - 热更新
   - 代码格式化
   - 自动修复
   - 提交信息规范化

3. **性能优化**

   - 代码分割
   - 资源压缩
   - 按需加载
   - 构建分析

4. **特色功能**

   - **响应式设计**
     - 基于 rem 的移动端适配方案
     - 支持多端自适应布局
     - 内置常用移动端组件
   - **Hooks 能力**
     - 内置常用业务 Hooks如打字机效果、弱网检查等
     - 支持自定义 Hooks 开发
     - 集成 ahooks 常用功能
   - **状态管理**
     - 基于 Zustand 的轻量级状态管理
     - 支持持久化存储
     - 模块化状态管理方案
   - **工具集成**
     - 内置 HTTP 请求封装
     - 国际化解决方案
     - 主题定制能力
     - 错误边界处理
     - 路由权限控制

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产环境
npm run build

# 代码格式化
npm run format

# 提交代码
npm run commit
```

## 注意事项

1. **代码规范**

   - 使用 TypeScript 编写代码
   - 遵循 ESLint 和 Prettier 配置
   - 提交前进行代码格式化
   - 使用规范化的提交信息

2. **开发建议**

   - 组件按功能模块划分
   - 合理使用状态管理
   - 注意性能优化
   - 保持代码可维护性
   - 优先使用内置 Hooks
   - 遵循响应式设计规范

3. **环境配置**
   - 开发环境：.env.development
   - 测试环境：.env.test
   - 生产环境：.env.production

## 项目结构

```
├── src/                # 源代码
│   ├── components/    # 公共组件
│   ├── hooks/        # 自定义 Hooks
│   ├── pages/        # 页面组件
│   ├── services/     # API 服务
│   ├── store/        # 状态管理
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   └── locales/      # 国际化资源
├── doc/               # 文档
├── public/            # 静态资源
├── .husky/            # Git hooks
├── .vscode/           # VSCode 配置
└── config/            # 配置文件
```

## 相关文档

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [Ant Design Mobile 文档](https://mobile.ant.design/)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [ahooks 文档](https://ahooks.js.org/)
