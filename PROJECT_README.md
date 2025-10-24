# 干细胞分化数据处理系统

一个基于 Vue 3 + Vuetify 3 + D3.js 的干细胞分化数据处理和可视化平台。

## ✨ 核心功能

🔍 **步骤1 - 信息源查询**

-   必填字段验证（信息源名称、权重、信息类型）
-   智能表单验证
-   快速查询（2秒调试模式）

📊 **步骤2 - 数据列表展示**

-   16条真实学术论文数据
-   置信度可视化（80-100%）
-   详情查看 + 数据处理功能
-   分页浏览

🤖 **步骤3 - 模型训练与参数微调**

-   5阶段智能训练流程
-   实时进度展示
-   可视化参数编辑器
-   分化时间线拖拽编辑

🎨 **步骤4 - 模型可视化**

-   D3.js 分化时间线动画
-   化合物作用网络力导向图
-   交互式图表操作
-   JSON 数据导出

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173/#/components/table
```

## 🔑 登录信息

-   用户名：`admin`
-   密码：`123456`

## ⚙️ 调试配置

在 `src/views/componets/table.vue` 中调整时间：

```typescript
const FETCH_DATA_DURATION = 2000; // 数据抓取：2秒（调试）/ 25000（生产）
const MODEL_TRAINING_DURATION = 2000; // 模型训练：2秒（调试）/ 25000（生产）
```

## 📁 核心文件

```
src/views/componets/
├── table.vue              # 主容器（状态管理）
├── mock.ts                # 16条论文数据
└── components/
    ├── Step1.vue          # 查询表单
    ├── Step2.vue          # 数据列表
    ├── Step3.vue          # 训练与调参
    ├── Step4.vue          # 可视化
    ├── DataForm.vue       # 参数编辑器
    ├── PixiModel.vue      # 时间线可视化
    └── CompoundNetwork.vue # 网络图可视化
```

## 🎯 技术亮点

-   ✅ **组件化架构**：四步独立组件，易维护易扩展
-   ✅ **TypeScript**：完整类型定义
-   ✅ **D3.js 可视化**：流畅动画，交互式操作
-   ✅ **响应式设计**：支持桌面端和移动端
-   ✅ **数据驱动**：基于真实学术论文数据

## 📚 详细文档

查看 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) 获取完整开发文档。

## 🐛 已知问题修复

-   ✅ Step3 v-model prop 错误
-   ✅ 退出登录失败问题
-   ✅ 登录页面居中问题
-   ✅ 可视化数据验证

## 📊 数据说明

包含16篇干细胞分化相关高质量学术论文：

-   Nature Biotechnology
-   STEM CELLS
-   Nature Communications
-   Cell Stem Cell
-   PLoS Biology

## 🔄 工作流程

```
查询表单 → 数据抓取(2s) → 列表展示 → 点击处理
→ 模型训练(2s/5阶段) → 参数微调 → 可视化展示 → 导出结果
```

## 💡 开发提示

1. **修改数据**：编辑 `src/views/componets/mock.ts`
2. **调整时间**：修改 `table.vue` 顶部配置常量
3. **自定义验证**：编辑 `Step1.vue` 的 rules
4. **样式调整**：每个组件都有独立的 scoped 样式

## 🎨 界面预览

-   **Material Design 风格**：使用 Vuetify 3 组件库
-   **优雅动画**：流畅的过渡效果和加载动画
-   **清晰导航**：步骤式引导，操作直观

---

**版本：** 1.0.0
**最后更新：** 2024年1月
