# 混凝土配比设计流程

## 路由结构

```
/concrete-design (混凝土配比设计流程)
├── guide                    → 流程引导
├── reverse-step1            → a. 需求输入（施工方）
├── reverse-step2            → b. 模型计算（预判模型）
├── detection                → c. 属性检测（检测实验室）
├── forward-step1            → d. 配比优化（历史数据）
└── forward-step2            → e. 最终产出（混凝土建设）
```

## 业务流程

### 步骤 0: 流程引导

**路由**: `/home/chat`
**组件**: `deduce.vue`
**作用**: 引导页，用户选择进入正向推演或反向推演

---

### 步骤 1: a. 需求输入（施工方）

**路由**: `/concrete-design/reverse-step1`
**组件**: `reverse/step1.vue`
**作用**: 施工方提供具体的强度需求

-   输入基准配合比参数
-   设置目标强度
-   选择可调整因素

**跳转**: 点击"开始智能优化" → 步骤 2

---

### 步骤 2: b. 模型计算（预判模型）

**路由**: `/concrete-design/reverse-step2`
**组件**: `reverse/step2.vue`
**作用**: 预判模型根据需求快速给出初步的配合比

-   显示优化前后的配合比对比
-   显示强度提升百分比
-   提供参数调整详情

**跳转**: 点击"应用此优化方案" → 步骤 3（检测实验室）

---

### 步骤 3: c. 属性检测（检测实验室）

**路由**: `/concrete-design/detection`
**组件**: `componets/detection.vue`
**作用**: 检测实验室对材料进行材料属性检测

-   嵌入实验室检测流程（iframe: priment.html）
-   实时监听实验步骤完成事件
-   自动上传检测结果

**跳转**: 实验完成后自动 → 步骤 4

---

### 步骤 4: d. 配比优化（历史数据）

**路由**: `/concrete-design/forward-step1`
**组件**: `forward/step1.vue`
**作用**: 根据检测结果和历史数据，对初步的配合比进行调整

-   8 个关键参数实时调整
-   预设配置快速应用
-   实时预测强度变化

**跳转**: 点击"生成分析报告" → 步骤 5

---

### 步骤 5: e. 最终产出（混凝土建设）

**路由**: `/concrete-design/forward-step2`
**组件**: `forward/step2.vue`
**作用**: 生成最终的混合料配比，用于满足混凝土的建设需求

-   显示预测抗压强度和置信区间
-   因素权重分析图表
-   智能优化建议
-   导出最终报告

---

## 数据流转

### Store 管理

所有步骤通过 `useConcreteStore` 共享数据：

```typescript
// 正向推演数据
forwardData: {
  mixProportionParams: { ... },
  analysisResult: { ... }
}

// 反向推演数据
reverseData: {
  base_config: { ... },
  optimized_config: { ... },
  ...
}

// 检测页面传递的数据
concreteData: {
  mixProportionParams: { ... }
}
```

### 数据传递路径

1. **需求输入 → 模型计算**

    - `reverse-step1` 保存优化请求到 `reverseData`
    - `reverse-step2` 读取 `reverseData` 显示优化结果

2. **模型计算 → 属性检测**

    - `reverse-step2` 应用优化方案，将优化配比保存到 `forwardData`
    - 跳转到 `detection`

3. **属性检测 → 配比优化**

    - `detection` 完成实验后，数据保存到 `concreteData`
    - 自动跳转到 `forward-step1`
    - `forward-step1` 从 `concreteData` 或 `forwardData` 读取参数

4. **配比优化 → 最终产出**
    - `forward-step1` 调用预测 API，保存结果到 `forwardData.analysisResult`
    - 跳转到 `forward-step2`
    - `forward-step2` 读取 `forwardData.analysisResult` 展示报告

---

## 菜单显示

侧边菜单会显示完整的流程：

```
混凝土配比设计流程 ▼
  ├─ 流程引导
  ├─ a. 需求输入（施工方）
  ├─ b. 模型计算（预判模型）
  ├─ c. 属性检测（检测实验室）
  ├─ d. 配比优化（历史数据）
  └─ e. 最终产出（混凝土建设）
```

---

## 快捷访问

-   **首页**: `/` → 自动跳转到 `/home/chat`
-   **流程引导**: `/home/chat`
-   **直接进入某步骤**: `/concrete-design/[step-name]`

---

## 注意事项

1. 所有路由都包裹在 `Layout` 组件中，会显示侧边菜单和顶部导航
2. 每个步骤的 `meta.step` 字段标识了在流程中的位置（0-5）
3. 每个步骤的 `meta.description` 提供了简短说明
4. 用户可以随时从菜单跳转到任何步骤（如果需要严格控制流程，可以添加路由守卫）
