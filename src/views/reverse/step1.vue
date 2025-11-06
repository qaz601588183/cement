<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">反向推演 - 智能优化配合比</span>
        </v-card-title>
        <v-divider></v-divider>

        <!-- 优化 Loading 状态 -->
        <div v-if="isOptimizing" class="text-center pa-10">
            <!-- Vuetify 加载动画 -->
            <div class="loading-container mb-6">
                <v-progress-circular
                    :model-value="optimizeProgress"
                    :size="200"
                    :width="15"
                    color="primary"
                    class="mb-4"
                >
                    <div class="text-h4 font-weight-bold text-primary">
                        {{ Math.ceil(optimizeProgress) }}%
                    </div>
                </v-progress-circular>
            </div>
            <div class="mt-6">
                <div class="text-h5 mb-4 font-weight-bold">{{ optimizeStage }}</div>
                <v-progress-linear
                    :model-value="optimizeProgress"
                    :color="getProgressColor(optimizeProgress)"
                    :bg-color="getProgressColor(optimizeProgress)"
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

            <!-- 优化步骤 -->
            <v-timeline
                side="end"
                align="start"
                density="compact"
                truncate-line="both"
                class="mt-8 mx-auto"
                style="max-width: 600px"
            >
                <v-timeline-item
                    v-for="(stage, index) in optimizeStages"
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
                    >
                        <v-card-text class="py-2">
                            <div class="font-weight-bold">{{ stage.title }}</div>
                            <div class="text-caption text-grey">{{ stage.description }}</div>
                        </v-card-text>
                    </v-card>
                </v-timeline-item>
            </v-timeline>
        </div>

        <!-- 参数输入界面 -->
        <div v-else class="pa-4">
            <v-alert type="info" variant="tonal" class="mb-4">
                <template v-slot:text>
                    <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-auto-fix</v-icon>
                        <div>
                            <strong>智能优化模式：</strong
                            >输入目标强度和基础配比，选择可调整的参数，系统将自动优化配合比以达到目标强度。
                        </div>
                    </div>
                </template>
            </v-alert>

            <!-- 目标强度输入 -->
            <v-card class="mb-4">
                <v-card-title>
                    <v-icon class="mr-2">mdi-target</v-icon>
                    目标强度
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-text-field
                        v-model.number="targetStrength"
                        label="期望达到的抗压强度"
                        suffix="MPa"
                        type="number"
                        :min="20"
                        :max="80"
                        variant="outlined"
                        :rules="[
                            (v) => !!v || '请输入目标强度',
                            (v) => v >= 20 || '目标强度不能低于20 MPa',
                            (v) => v <= 80 || '目标强度不能超过80 MPa',
                        ]"
                        hint="建议范围：20-80 MPa"
                        persistent-hint
                    ></v-text-field>
                </v-card-text>
            </v-card>

            <!-- 基础配比参数 -->
            <v-card class="mb-4">
                <v-card-title>
                    <v-icon class="mr-2">mdi-flask-outline</v-icon>
                    基础配比参数
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
                                    {{ baseConfig.cement }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.cement"
                                    :min="200"
                                    :max="600"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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
                                    水泥用量直接影响强度
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数2: 水用量 -->
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
                                    {{ baseConfig.water }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.water"
                                    :min="100"
                                    :max="250"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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

                        <!-- 参数3: 高炉矿渣 -->
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
                                    {{ baseConfig.blast_furnace_slag }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.blast_furnace_slag"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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

                        <!-- 参数4: 粉煤灰 -->
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
                                    {{ baseConfig.fly_ash }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.fly_ash"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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
                                    {{ baseConfig.superplasticizer }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.superplasticizer"
                                    :min="0"
                                    :max="15"
                                    :step="0.5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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
                                    {{ baseConfig.coarse_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.coarse_aggregate"
                                    :min="800"
                                    :max="1300"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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
                                    {{ baseConfig.fine_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="baseConfig.fine_aggregate"
                                    :min="500"
                                    :max="900"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
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
                                    {{ baseConfig.age }} 天
                                </div>
                                <v-slider
                                    v-model="baseConfig.age"
                                    :min="7"
                                    :max="90"
                                    :step="1"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">7天</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">90天</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    标准测试龄期为28天，最小为7天
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 可调整参数选择 -->
            <v-card class="mb-4">
                <v-card-title>
                    <v-icon class="mr-2">mdi-tune-variant</v-icon>
                    选择可调整的参数
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-alert type="warning" variant="tonal" class="mb-4" density="compact">
                        请至少选择一个参数进行优化
                    </v-alert>
                    <v-row>
                        <v-col
                            cols="12"
                            md="6"
                            v-for="factor in availableFactors"
                            :key="factor.value"
                        >
                            <v-checkbox
                                v-model="adjustFactors"
                                :value="factor.value"
                                :label="factor.label"
                                color="primary"
                                hide-details
                            >
                                <template v-slot:label>
                                    <div class="d-flex align-center">
                                        <v-icon size="small" class="mr-2">{{ factor.icon }}</v-icon>
                                        <span>{{ factor.label }}</span>
                                    </div>
                                </template>
                            </v-checkbox>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 开始优化按钮 -->
            <div class="d-flex justify-end mt-4">
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-auto-fix"
                    @click="startOptimization"
                    :disabled="!canOptimize"
                >
                    开始智能优化
                    <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { OptimizeAPI, type ObservedConfig, type OptimizeRequest } from '@/api/predict';
import { computed, ref } from 'vue';
import { useConcreteStore } from '@/stores/useConcreteStore';
import { useRouter } from 'vue-router';

// 获取store和router
const concreteStore = useConcreteStore();
const router = useRouter();

// 状态
const isOptimizing = ref(false);
const optimizeProgress = ref(0);
const optimizeStage = ref('');
const estimatedTime = ref(2);

// 目标强度
const targetStrength = ref(45);

// 基础配比
const baseConfig = ref<ObservedConfig>({
    cement: 300,
    blast_furnace_slag: 0,
    fly_ash: 0,
    water: 185,
    superplasticizer: 3,
    coarse_aggregate: 1050,
    fine_aggregate: 850,
    age: 28,
});

// 可调整参数
const adjustFactors = ref<string[]>(['cement', 'fly_ash']);

// 可选因素
const availableFactors = [
    { value: 'cement', label: '水泥用量', icon: 'mdi-package-variant-closed' },
    { value: 'blast_furnace_slag', label: '高炉矿渣', icon: 'mdi-cube-outline' },
    { value: 'fly_ash', label: '粉煤灰', icon: 'mdi-grain' },
    { value: 'water', label: '水用量', icon: 'mdi-water' },
    { value: 'superplasticizer', label: '高效减水剂', icon: 'mdi-flask' },
    { value: 'coarse_aggregate', label: '粗骨料', icon: 'mdi-texture-box' },
    { value: 'fine_aggregate', label: '细骨料', icon: 'mdi-grain' },
];

// 优化阶段
const optimizeStages = ref([
    {
        title: '参数验证',
        description: '验证输入参数的合理性',
        active: false,
        completed: false,
    },
    {
        title: '基准强度计算',
        description: '计算当前配比的基准强度',
        active: false,
        completed: false,
    },
    {
        title: '智能优化',
        description: '使用因果模型寻找最优配比',
        active: false,
        completed: false,
    },
    {
        title: '完成',
        description: '生成优化方案',
        active: false,
        completed: false,
    },
]);

// 是否可以优化
const canOptimize = computed(() => {
    return (
        targetStrength.value >= 20 &&
        targetStrength.value <= 80 &&
        baseConfig.value.cement > 0 &&
        baseConfig.value.water > 0 &&
        baseConfig.value.coarse_aggregate > 0 &&
        baseConfig.value.fine_aggregate > 0 &&
        adjustFactors.value.length > 0
    );
});

// 开始优化
const startOptimization = async () => {
    if (!canOptimize.value) {
        alert('请检查输入参数');
        return;
    }

    // 显示loading
    isOptimizing.value = true;
    optimizeProgress.value = 0;
    estimatedTime.value = 15; // 初始估计15秒

    // 重置优化阶段
    optimizeStages.value.forEach((stage) => {
        stage.active = false;
        stage.completed = false;
    });

    // 准备请求参数
    const request: OptimizeRequest = {
        base_config: {
            cement: baseConfig.value.cement,
            blast_furnace_slag: baseConfig.value.blast_furnace_slag || 0,
            fly_ash: baseConfig.value.fly_ash || 0,
            water: baseConfig.value.water,
            superplasticizer: baseConfig.value.superplasticizer || 0,
            coarse_aggregate: baseConfig.value.coarse_aggregate,
            fine_aggregate: baseConfig.value.fine_aggregate,
            age: baseConfig.value.age || 28,
        },
        target_strength: targetStrength.value,
        adjust_factors: adjustFactors.value,
    };

    console.log('正在调用优化接口，参数:', request);

    // 记录开始时间
    const startTime = Date.now();

    // 启动真实进度模拟
    const progressInterval = simulateRealOptimizeProgress(startTime);

    try {
        // 调用优化接口
        const result = await OptimizeAPI.optimizeConfig(request);
        console.log('优化接口返回结果:', result);

        // 停止进度模拟
        clearInterval(progressInterval);

        // 确保进度达到100%
        await completeOptimizeProgress();

        // 保存结果到store
        concreteStore.setReverseData(result);

        // 跳转到结果页
        router.push('/concrete-design/reverse-step2');
    } catch (error) {
        console.error('调用优化接口失败:', error);

        // 停止进度模拟
        clearInterval(progressInterval);

        // 停止loading
        isOptimizing.value = false;

        // 显示错误提示
        alert('优化接口调用失败: ' + (error as Error).message);
    }
};

// 真实优化进度模拟（基于实际请求时间）
const simulateRealOptimizeProgress = (startTime: number) => {
    let currentStageIndex = 0;
    optimizeStages.value[0].active = true;
    optimizeStage.value = optimizeStages.value[0].title;

    const interval = setInterval(() => {
        if (!isOptimizing.value) {
            return;
        }

        const elapsed = Date.now() - startTime;

        // 优化过程可能更耗时，使用更保守的进度曲线
        let progress: number;
        if (elapsed < 2000) {
            // 前2秒：0-30%（参数验证快）
            progress = (elapsed / 2000) * 30;
        } else if (elapsed < 5000) {
            // 2-5秒：30-55%（基准计算）
            progress = 30 + ((elapsed - 2000) / 3000) * 25;
        } else if (elapsed < 15000) {
            // 5-15秒：55-85%（智能优化主要阶段）
            progress = 55 + ((elapsed - 5000) / 10000) * 30;
        } else if (elapsed < 40000) {
            // 15-40秒：85-92%
            progress = 85 + ((elapsed - 15000) / 25000) * 7;
        } else {
            // 40秒后：92-95%，几乎不动
            progress = 92 + Math.min(((elapsed - 40000) / 80000) * 3, 3);
        }

        optimizeProgress.value = Math.min(progress, 95);

        // 动态估算剩余时间
        if (elapsed > 2000 && progress > 10) {
            const estimatedTotal = (elapsed / progress) * 100;
            estimatedTime.value = Math.ceil((estimatedTotal - elapsed) / 1000);
        }

        // 更新阶段（基于进度）
        const targetStage = Math.floor(
            (optimizeProgress.value / 100) * optimizeStages.value.length
        );
        if (targetStage > currentStageIndex && targetStage < optimizeStages.value.length) {
            optimizeStages.value[currentStageIndex].active = false;
            optimizeStages.value[currentStageIndex].completed = true;
            currentStageIndex = targetStage;
            optimizeStages.value[currentStageIndex].active = true;
            optimizeStage.value = optimizeStages.value[currentStageIndex].title;
        }
    }, 200);

    return interval;
};

// 完成优化进度（确保到达100%）
const completeOptimizeProgress = (): Promise<void> => {
    return new Promise((resolve) => {
        // 快速完成剩余进度
        const completeInterval = setInterval(() => {
            if (optimizeProgress.value < 100) {
                optimizeProgress.value += (100 - optimizeProgress.value) * 0.3;
                if (optimizeProgress.value > 99.5) {
                    optimizeProgress.value = 100;
                }
            } else {
                clearInterval(completeInterval);

                // 完成所有阶段
                optimizeStages.value.forEach((stage) => {
                    stage.active = false;
                    stage.completed = true;
                });

                estimatedTime.value = 0;

                setTimeout(() => {
                    isOptimizing.value = false;
                    resolve();
                }, 500);
            }
        }, 50);
    });
};

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};
</script>

<style lang="scss" scoped>
// 加载动画容器样式
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

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
</style>
