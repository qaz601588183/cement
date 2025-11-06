<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">反向推演 - 智能优化配合比</span>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')">
                返回
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- 优化 Loading 状态 -->
        <div v-if="isOptimizing" class="text-center pa-10">
            <v-progress-circular
                :model-value="optimizeProgress"
                :rotate="360"
                :size="100"
                :width="10"
                color="primary"
                class="mb-4"
            >
                <template v-slot:default>
                    <div class="text-h5">{{ Math.ceil(optimizeProgress) }}%</div>
                </template>
            </v-progress-circular>
            <div class="mt-6">
                <div class="text-h5 mb-4 font-weight-bold">{{ optimizeStage }}</div>
                <v-progress-linear
                    :model-value="optimizeProgress"
                    :color="getProgressColor(optimizeProgress)"
                    height="24"
                    rounded
                    striped
                    class="mx-auto"
                    style="max-width: 600px"
                >
                    <template v-slot:default="{ value }">
                        <strong class="text-white">{{ Math.ceil(value) }}%</strong>
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
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.cement"
                                label="水泥用量"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                                :rules="[(v) => !!v || '必填']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.water"
                                label="水用量"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                                :rules="[(v) => !!v || '必填']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.blast_furnace_slag"
                                label="高炉矿渣"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.fly_ash"
                                label="粉煤灰"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.superplasticizer"
                                label="高效减水剂"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.coarse_aggregate"
                                label="粗骨料"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                                :rules="[(v) => !!v || '必填']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.fine_aggregate"
                                label="细骨料"
                                suffix="kg/m³"
                                type="number"
                                variant="outlined"
                                :rules="[(v) => !!v || '必填']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="baseConfig.age"
                                label="龄期"
                                suffix="天"
                                type="number"
                                variant="outlined"
                            ></v-text-field>
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
import { OptimizeAPI, type OptimizeRequest, type ObservedConfig } from '@/api/predict';
import { computed, ref } from 'vue';

const emit = defineEmits<{
    back: [];
    next: [];
    'form-change': [data: any];
}>();

// 配置
const OPTIMIZE_DURATION = 2000; // 2秒优化时间

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
    estimatedTime.value = Math.ceil(OPTIMIZE_DURATION / 1000);

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

    // 启动进度模拟
    simulateOptimization();

    try {
        // 调用优化接口
        const result = await OptimizeAPI.optimizeConfig(request);
        console.log('优化接口返回结果:', result);

        // 等待进度条完成
        await waitForOptimizationComplete();

        // 传递结果给父组件
        emit('form-change', result);

        // 跳转到结果页
        emit('next');
    } catch (error) {
        console.error('调用优化接口失败:', error);

        // 停止loading
        isOptimizing.value = false;

        // 显示错误提示
        alert('优化接口调用失败: ' + (error as Error).message);
    }
};

// 模拟优化进度
const simulateOptimization = () => {
    let currentStageIndex = 0;
    optimizeStages.value[0].active = true;
    optimizeStage.value = optimizeStages.value[0].title;

    const interval = setInterval(() => {
        if (!isOptimizing.value) {
            clearInterval(interval);
            return;
        }

        optimizeProgress.value += 100 / (OPTIMIZE_DURATION / 100);
        estimatedTime.value = Math.ceil(
            ((100 - optimizeProgress.value) / 100) * (OPTIMIZE_DURATION / 1000)
        );

        // 更新阶段
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

        if (optimizeProgress.value >= 100) {
            clearInterval(interval);
            optimizeStages.value[currentStageIndex].active = false;
            optimizeStages.value[currentStageIndex].completed = true;
            optimizeProgress.value = 100;
            estimatedTime.value = 0;
        }
    }, 100);
};

// 等待优化完成
const waitForOptimizationComplete = (): Promise<void> => {
    return new Promise((resolve) => {
        const checkComplete = setInterval(() => {
            if (optimizeProgress.value >= 100) {
                clearInterval(checkComplete);
                setTimeout(() => {
                    isOptimizing.value = false;
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
</script>

<style lang="scss" scoped>
// 样式与Step1保持一致
</style>

