<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土强度推演与参数优化</span>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')"> 返回 </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- 推演 Loading 状态 -->
        <div v-if="isAnalyzing" class="text-center pa-10">
            <v-progress-circular
                :model-value="analysisProgress"
                :rotate="360"
                :size="100"
                :width="10"
                color="primary"
                class="mb-4"
            >
                <template v-slot:default>
                    <div class="text-h5">{{ Math.ceil(analysisProgress) }}%</div>
                </template>
            </v-progress-circular>
            <div class="mt-6">
                <div class="text-h5 mb-4 font-weight-bold">{{ analysisStage }}</div>
                <v-progress-linear
                    :model-value="analysisProgress"
                    :color="getProgressColor(analysisProgress)"
                    :bg-color="getProgressColor(analysisProgress)"
                    bg-opacity="0.15"
                    height="24"
                    rounded
                    striped
                    class="mx-auto progress-bar-enhanced"
                    style="max-width: 600px"
                >
                    <template v-slot:default="{ value }">
                        <strong class="progress-text">{{ Math.ceil(value) }}%</strong>
                    </template>
                </v-progress-linear>
                <div class="d-flex justify-center align-center mt-4 text-subtitle-1">
                    <v-icon size="small" color="grey" class="mr-2">mdi-clock-outline</v-icon>
                    <span class="text-grey"
                        >预计剩余时间: <strong>{{ estimatedTime }}</strong> 秒</span
                    >
                </div>
            </div>

            <!-- 分析步骤列表 -->
            <v-timeline
                side="end"
                align="start"
                density="compact"
                truncate-line="both"
                class="mt-8 mx-auto training-timeline"
                style="max-width: 600px"
            >
                <v-timeline-item
                    v-for="(stage, index) in analysisStages"
                    :key="index"
                    :dot-color="
                        stage.completed ? 'success' : stage.active ? 'primary' : 'grey-lighten-1'
                    "
                    size="small"
                    :hide-opposite="true"
                >
                    <template v-slot:icon>
                        <v-icon v-if="stage.completed" size="small">mdi-check</v-icon>
                        <v-progress-circular
                            v-else-if="stage.active"
                            indeterminate
                            size="16"
                            width="2"
                        ></v-progress-circular>
                        <v-icon v-else size="x-small">mdi-circle-outline</v-icon>
                    </template>
                    <v-card
                        :variant="stage.active ? 'tonal' : 'flat'"
                        :color="stage.active ? 'primary' : ''"
                        class="timeline-card"
                    >
                        <v-card-text class="py-2">
                            <div class="font-weight-bold">{{ stage.title }}</div>
                            <div class="text-caption text-grey">{{ stage.description }}</div>
                        </v-card-text>
                    </v-card>
                </v-timeline-item>
            </v-timeline>
        </div>

        <!-- 参数调整界面 -->
        <div v-else class="pa-4">
            <v-alert type="info" variant="tonal" class="mb-4">
                <template v-slot:text>
                    <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-tune</v-icon>
                        <div>
                            <strong>智能推演模式：</strong
                            >通过调整关键参数，实时预测混凝土强度变化。您可以尝试不同的配合比和养护条件，直观了解各因素对强度的影响。
                        </div>
                    </div>
                </template>
            </v-alert>

            <!-- 强度预测卡片 -->
            <v-row class="mb-4">
                <v-col cols="12">
                    <v-card
                        class="strength-compare-card"
                        elevation="3"
                        color="primary"
                        variant="tonal"
                    >
                        <v-card-text>
                            <div class="text-subtitle-2 mb-2">
                                <v-icon size="small" class="mr-1">mdi-brain</v-icon>
                                AI推演预测强度
                            </div>
                            <div class="d-flex align-center">
                                <v-icon size="large" class="mr-3">mdi-chart-line</v-icon>
                                <div>
                                    <div class="text-h4 font-weight-bold">
                                        {{ predictedStrength }}
                                    </div>
                                    <div class="text-caption">MPa</div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 可调参数面板 - 8个关键参数 -->
            <v-card class="mb-4" elevation="2">
                <v-card-title class="bg-gradient-primary">
                    <v-icon class="mr-2">mdi-tune-variant</v-icon>
                    配合比参数调整 - 实时推演
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-row>
                        <!-- 参数1: 水泥用量 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-package-variant-closed</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >水泥用量</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">C</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.cement }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.cement"
                                    :min="200"
                                    :max="600"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">600</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    水泥用量直接影响强度，最优范围350-450kg/m³
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数2: 高炉矿渣 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-cube-outline</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >高炉矿渣</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">S</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.blast_furnace_slag }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.blast_furnace_slag"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    后期水化，改善耐久性
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数3: 粉煤灰 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-grain</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">粉煤灰</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >FA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.fly_ash }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.fly_ash"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    微粉填充，后期强度发展
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数4: 水用量 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-water</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">水用量</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">W</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.water }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.water"
                                    :min="100"
                                    :max="250"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">100</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">250</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    水灰比=水/水泥，越低强度越高
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数5: 高效减水剂 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-flask</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >高效减水剂</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >SP</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.superplasticizer }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.superplasticizer"
                                    :min="0"
                                    :max="15"
                                    :step="0.5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">15</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    保持低水灰比，提升强度
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数6: 粗骨料 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-texture-box</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold">粗骨料</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >CA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.coarse_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.coarse_aggregate"
                                    :min="800"
                                    :max="1300"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">800</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">1300</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    提供骨架，最优范围1000-1200kg/m³
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数7: 细骨料 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-grain</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">细骨料</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >FA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.fine_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.fine_aggregate"
                                    :min="500"
                                    :max="900"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">500</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">900</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    影响工作性和密实度
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数8: 龄期 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-calendar-clock</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold">龄期</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >Age</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.age }} 天
                                </div>
                                <v-slider
                                    v-model="editableParams.age"
                                    :min="1"
                                    :max="90"
                                    :step="1"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">1天</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">90天</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    标准测试龄期为28天
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- 计算指标显示 -->
                    <v-divider class="my-6"></v-divider>
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-card variant="tonal" color="info" class="pa-3">
                                <div class="text-caption text-grey-darken-2">水灰比 (W/C)</div>
                                <div class="text-h5 font-weight-bold">
                                    {{ waterCementRatio }}
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-card variant="tonal" color="success" class="pa-3">
                                <div class="text-caption text-grey-darken-2">胶凝材料总量</div>
                                <div class="text-h5 font-weight-bold">
                                    {{ totalCementitious }} kg/m³
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-card variant="tonal" color="warning" class="pa-3">
                                <div class="text-caption text-grey-darken-2">砂率</div>
                                <div class="text-h5 font-weight-bold">{{ sandRatio }}%</div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 生成报告按钮 -->
            <div class="d-flex justify-end mt-4">
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-file-chart"
                    @click="generateReport"
                    :loading="isGeneratingReport"
                >
                    生成分析报告
                    <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { useConcreteStore, type MixProportionParams } from '@/stores/useConcreteStore';
import { calculateConcreteStrength, type ConcreteParameters } from '@/utils/concreteStrengthModel';
import { computed, onMounted, ref } from 'vue';

const emit = defineEmits<{
    back: [];
    next: [];
    'form-change': [data: any];
}>();

// 获取store
const concreteStore = useConcreteStore();

// 配置
const ANALYSIS_DURATION = 2000; // 2秒分析时间

// 状态
const isAnalyzing = ref(false);
const analysisProgress = ref(0);
const analysisStage = ref('');
const estimatedTime = ref(2);
const isGeneratingReport = ref(false);

// 可编辑的参数
const editableParams = ref<MixProportionParams>({
    cement: 380,
    blast_furnace_slag: 50,
    fly_ash: 60,
    water: 170,
    superplasticizer: 5,
    coarse_aggregate: 1100,
    fine_aggregate: 650,
    age: 28,
});

// 分析阶段
const analysisStages = ref([
    {
        title: '参数解析',
        description: '解析配合比参数',
        active: false,
        completed: false,
    },
    {
        title: '强度计算',
        description: '基于AI模型计算预测强度',
        active: false,
        completed: false,
    },
    {
        title: '因素分析',
        description: '分析各因素影响权重',
        active: false,
        completed: false,
    },
    {
        title: '完成',
        description: '准备展示结果',
        active: false,
        completed: false,
    },
]);

// 计算属性

// 水灰比
const waterCementRatio = computed(() => {
    if (editableParams.value.cement === 0) return 0;
    return (editableParams.value.water / editableParams.value.cement).toFixed(2);
});

// 胶凝材料总量
const totalCementitious = computed(() => {
    return (
        editableParams.value.cement +
        editableParams.value.blast_furnace_slag +
        editableParams.value.fly_ash
    );
});

// 砂率
const sandRatio = computed(() => {
    const total = editableParams.value.fine_aggregate + editableParams.value.coarse_aggregate;
    if (total === 0) return 0;
    return ((editableParams.value.fine_aggregate / total) * 100).toFixed(1);
});

// 预测强度
const predictedStrength = computed(() => {
    // 将配合比参数转换为ConcreteParameters
    const params: ConcreteParameters = {
        cement_content: editableParams.value.cement,
        water_cement_ratio: parseFloat(waterCementRatio.value),
        water_reducer_dosage:
            (editableParams.value.superplasticizer / editableParams.value.cement) * 100, // 转换为百分比
        curing_temperature: 20, // 假设标准养护温度
        curing_days: editableParams.value.age,
        fly_ash_dosage: (editableParams.value.fly_ash / totalCementitious.value) * 100,
        slag_dosage: (editableParams.value.blast_furnace_slag / totalCementitious.value) * 100,
        coarse_aggregate_content: editableParams.value.coarse_aggregate,
        fine_aggregate_content: editableParams.value.fine_aggregate,
        sand_ratio: parseFloat(sandRatio.value),
    };

    return calculateConcreteStrength(params);
});

// 方法

// 初始化参数（从store读取）
const initializeParams = () => {
    const storeData = concreteStore.concreteData;
    if (storeData && storeData.mixProportionParams) {
        editableParams.value = { ...storeData.mixProportionParams };
        console.log('从store初始化参数:', editableParams.value);
    }
};

// 参数变化处理
const handleParameterChange = () => {
    // 实时计算，不需要额外操作
    console.log('参数已更新:', editableParams.value);
    console.log('预测强度:', predictedStrength.value, 'MPa');
};

// 模拟分析过程
const simulateAnalysis = () => {
    isAnalyzing.value = true;
    analysisProgress.value = 0;
    estimatedTime.value = Math.ceil(ANALYSIS_DURATION / 1000);

    let currentStageIndex = 0;
    analysisStages.value[0].active = true;
    analysisStage.value = analysisStages.value[0].title;

    const interval = setInterval(() => {
        analysisProgress.value += 100 / (ANALYSIS_DURATION / 100);
        estimatedTime.value = Math.ceil(
            ((100 - analysisProgress.value) / 100) * (ANALYSIS_DURATION / 1000)
        );

        // 更新阶段
        const targetStage = Math.floor(
            (analysisProgress.value / 100) * analysisStages.value.length
        );
        if (targetStage > currentStageIndex && targetStage < analysisStages.value.length) {
            analysisStages.value[currentStageIndex].active = false;
            analysisStages.value[currentStageIndex].completed = true;
            currentStageIndex = targetStage;
            analysisStages.value[currentStageIndex].active = true;
            analysisStage.value = analysisStages.value[currentStageIndex].title;
        }

        if (analysisProgress.value >= 100) {
            clearInterval(interval);
            analysisStages.value[currentStageIndex].active = false;
            analysisStages.value[currentStageIndex].completed = true;
            isAnalyzing.value = false;
            analysisProgress.value = 100;
            estimatedTime.value = 0;
        }
    }, 100);
};

// 生成报告
const generateReport = async () => {
    // 先显示loading
    isAnalyzing.value = true;
    analysisProgress.value = 0;
    estimatedTime.value = Math.ceil(ANALYSIS_DURATION / 1000);

    // 重置分析阶段
    analysisStages.value.forEach((stage) => {
        stage.active = false;
        stage.completed = false;
    });

    // 准备请求参数
    const requestData = {
        age: editableParams.value.age,
        blast_furnace_slag: editableParams.value.blast_furnace_slag,
        cement: editableParams.value.cement,
        coarse_aggregate: editableParams.value.coarse_aggregate,
        fine_aggregate: editableParams.value.fine_aggregate,
        fly_ash: editableParams.value.fly_ash,
        superplasticizer: editableParams.value.superplasticizer,
        water: editableParams.value.water,
    };

    console.log('正在调用预测接口，参数:', requestData);

    // 启动进度模拟
    simulateAnalysisForPrediction();

    try {
        // 调用预测接口
        const response = await fetch('http://localhost:8000/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('接口返回结果:', result);

        // 等待进度条完成
        await waitForAnalysisComplete();

        // 直接传递API返回的result，附加当前调整的配合比参数
        const reportData = {
            ...result, // 完整的API返回结果
            mixProportionParams: editableParams.value, // 附加当前的配合比参数供参考
        };

        // 触发表单变化，传递给父组件
        emit('form-change', reportData);

        // 跳转到Step2
        emit('next');
    } catch (error) {
        console.error('调用预测接口失败:', error);

        // 停止loading
        isAnalyzing.value = false;

        // 显示错误提示
        alert('预测接口调用失败: ' + (error as Error).message);
    }
};

// 模拟分析进度（用于显示loading）
const simulateAnalysisForPrediction = () => {
    let currentStageIndex = 0;
    analysisStages.value[0].active = true;
    analysisStage.value = analysisStages.value[0].title;

    const interval = setInterval(() => {
        if (!isAnalyzing.value) {
            clearInterval(interval);
            return;
        }

        analysisProgress.value += 100 / (ANALYSIS_DURATION / 100);
        estimatedTime.value = Math.ceil(
            ((100 - analysisProgress.value) / 100) * (ANALYSIS_DURATION / 1000)
        );

        // 更新阶段
        const targetStage = Math.floor(
            (analysisProgress.value / 100) * analysisStages.value.length
        );
        if (targetStage > currentStageIndex && targetStage < analysisStages.value.length) {
            analysisStages.value[currentStageIndex].active = false;
            analysisStages.value[currentStageIndex].completed = true;
            currentStageIndex = targetStage;
            analysisStages.value[currentStageIndex].active = true;
            analysisStage.value = analysisStages.value[currentStageIndex].title;
        }

        if (analysisProgress.value >= 100) {
            clearInterval(interval);
            analysisStages.value[currentStageIndex].active = false;
            analysisStages.value[currentStageIndex].completed = true;
            analysisProgress.value = 100;
            estimatedTime.value = 0;
        }
    }, 100);
};

// 等待分析完成
const waitForAnalysisComplete = (): Promise<void> => {
    return new Promise((resolve) => {
        const checkComplete = setInterval(() => {
            if (analysisProgress.value >= 100) {
                clearInterval(checkComplete);
                setTimeout(() => {
                    isAnalyzing.value = false;
                    resolve();
                }, 500);
            }
        }, 100);
    });
};

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};

// 生命周期
onMounted(() => {
    // 只初始化参数，不自动开始分析
    initializeParams();
});
</script>

<style lang="scss" scoped>
// 进度条增强样式
.progress-bar-enhanced {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .progress-text {
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        font-weight: 700;
        font-size: 14px;
    }
}

// 时间线样式优化
.training-timeline {
    :deep(.v-timeline-item) {
        padding-bottom: 16px !important;

        &:last-child {
            padding-bottom: 0 !important;
        }
    }

    :deep(.v-timeline-divider__dot) {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .timeline-card {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateX(2px);
        }
    }
}

// 强度对比卡片
.strength-compare-card {
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
}

// 渐变背景
.bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

// 参数卡片样式
.param-card {
    transition: all 0.3s ease;
    min-height: 200px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        border-color: rgba(var(--v-theme-primary), 0.4) !important;
    }
}
</style>
