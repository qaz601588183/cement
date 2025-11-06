<template>
    <div class="experiment-detection-page">
        <v-card elevation="0" class="mb-4">
            <v-card-title class="text-h5 font-weight-bold">
                <v-icon class="mr-2" color="primary">mdi-test-tube</v-icon>
                试验检测
            </v-card-title>
            <v-card-subtitle>
                <v-alert type="info" variant="tonal" density="compact">
                    <strong>检测样品：</strong>{{ currentSample.code }} - {{ currentSample.name }}
                </v-alert>
            </v-card-subtitle>
        </v-card>

        <!-- 实验流程展示 -->
        <v-row>
            <v-col v-for="experiment in experiments" :key="experiment.id" cols="12" md="6">
                <v-card :class="`experiment-card experiment-${experiment.id}`" elevation="2">
                    <v-card-title
                        :class="`text-h6 font-weight-bold text-white bg-${experiment.color}`"
                    >
                        <v-icon class="mr-2">{{ experiment.icon }}</v-icon>
                        {{ experiment.title }}
                    </v-card-title>

                    <v-card-text>
                        <!-- 实验进度条 -->
                        <div class="mb-4">
                            <v-progress-linear
                                :model-value="getExperimentProgress(experiment)"
                                :color="experiment.color"
                                height="8"
                                rounded
                            ></v-progress-linear>
                            <div class="text-caption mt-1">
                                进度: {{ getExperimentProgress(experiment) }}%
                            </div>
                        </div>

                        <!-- 实验步骤时间轴 -->
                        <v-timeline density="compact" align="start" side="end">
                            <v-timeline-item
                                v-for="(step, index) in experiment.steps"
                                :key="index"
                                :dot-color="getStepDotColor(experiment, index)"
                                :icon="getStepIcon(experiment, index)"
                                size="small"
                            >
                                <div>
                                    <div class="font-weight-bold">{{ step.name }}</div>
                                    <div class="text-caption">
                                        <v-tooltip location="top">
                                            <template v-slot:activator="{ props }">
                                                <span v-bind="props" class="device-name">
                                                    {{ step.device }}
                                                </span>
                                            </template>
                                            <span>{{ getDeviceStatusText(step.device) }}</span>
                                        </v-tooltip>
                                    </div>
                                </div>
                            </v-timeline-item>
                        </v-timeline>

                        <!-- 实验说明 -->
                        <v-divider class="my-3"></v-divider>
                        <div class="text-caption">
                            <strong>说明：</strong>{{ experiment.description }}
                        </div>

                        <!-- 实验结果 -->
                        <div v-if="experiment.completed" class="mt-3">
                            <v-chip
                                :color="experiment.color"
                                variant="flat"
                                prepend-icon="mdi-check-circle"
                                size="small"
                            >
                                实验完成
                            </v-chip>
                            <div class="mt-2 text-caption">结果: {{ experiment.result }}</div>
                        </div>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn
                            v-if="!experiment.completed && !experiment.running"
                            :color="experiment.color"
                            variant="flat"
                            size="small"
                            @click="startExperiment(experiment)"
                            prepend-icon="mdi-play"
                        >
                            开始实验
                        </v-btn>
                        <v-btn
                            v-if="experiment.running"
                            color="warning"
                            variant="flat"
                            size="small"
                            @click="pauseExperiment(experiment)"
                            prepend-icon="mdi-pause"
                        >
                            暂停
                        </v-btn>
                        <v-btn
                            v-if="experiment.completed"
                            color="success"
                            variant="flat"
                            size="small"
                            prepend-icon="mdi-check"
                            disabled
                        >
                            已完成
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- 操作按钮 -->
        <v-card elevation="0" class="mt-6">
            <v-card-actions class="justify-space-between">
                <v-btn
                    color="grey"
                    variant="outlined"
                    @click="goBack"
                    prepend-icon="mdi-arrow-left"
                >
                    返回样品列表
                </v-btn>

                <div>
                    <v-btn
                        color="primary"
                        variant="flat"
                        @click="uploadResults"
                        :disabled="!allExperimentsCompleted"
                        prepend-icon="mdi-cloud-upload"
                    >
                        检测结果上传分析
                    </v-btn>
                    <v-btn
                        color="warning"
                        variant="outlined"
                        class="ml-2"
                        @click="resetExperiments"
                        prepend-icon="mdi-refresh"
                    >
                        重置实验
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// 类型定义
type DeviceStatus = 'idle' | 'in-use' | 'reserved';

interface ExperimentStep {
    name: string;
    device: string;
    status: 'pending' | 'active' | 'completed';
}

interface Experiment {
    id: number;
    title: string;
    color: string;
    icon: string;
    description: string;
    steps: ExperimentStep[];
    result: string;
    completed: boolean;
    running: boolean;
    currentStep: number;
}

interface Sample {
    id: number;
    code: string;
    name: string;
    isSubsampled: boolean;
}

// Props
const props = defineProps<{
    currentSample: Sample;
}>();

// 定义事件
const emit = defineEmits<{
    (e: 'go-back'): void;
    (e: 'upload-results', data: any): void;
}>();

// 设备状态映射
const deviceStatusMap = ref<Record<string, DeviceStatus>>({
    电子天平: 'idle',
    烘箱: 'idle',
    标准筛: 'idle',
    水洗槽: 'idle',
    工业相机: 'idle',
    分选装置: 'idle',
    压力机: 'idle',
});

// 实验数据
const experiments = ref<Experiment[]>([
    {
        id: 1,
        title: '筛分',
        color: 'blue',
        icon: 'mdi-filter-variant',
        description: '样品经初步处理后进行筛分；各粒径分级记录质量。',
        steps: [
            { name: '称重', device: '电子天平', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '筛分', device: '标准筛', status: 'pending' },
            { name: '称取筛余质量', device: '电子天平', status: 'pending' },
        ],
        result: '',
        completed: false,
        running: false,
        currentStep: 0,
    },
    {
        id: 2,
        title: '含泥量',
        color: 'red',
        icon: 'mdi-water',
        description: '通过水洗去除细颗粒泥质物。',
        steps: [
            { name: '称重', device: '电子天平', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '水洗', device: '水洗槽', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '称重', device: '电子天平', status: 'pending' },
        ],
        result: '',
        completed: false,
        running: false,
        currentStep: 0,
    },
    {
        id: 3,
        title: '泥块含量',
        color: 'green',
        icon: 'mdi-cube-outline',
        description: '测定大于0.075mm的泥块含量。',
        steps: [
            { name: '称重', device: '电子天平', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '筛分', device: '标准筛', status: 'pending' },
            { name: '水洗', device: '水洗槽', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '称重', device: '电子天平', status: 'pending' },
        ],
        result: '',
        completed: false,
        running: false,
        currentStep: 0,
    },
    {
        id: 4,
        title: '针片状',
        color: 'indigo',
        icon: 'mdi-shape-outline',
        description: '采用视觉识别技术区分针片状颗粒。',
        steps: [
            { name: '分选装置识别', device: '工业相机', status: 'pending' },
            { name: '分选装置识别', device: '分选装置', status: 'pending' },
            { name: '称重（分类）', device: '电子天平', status: 'pending' },
        ],
        result: '',
        completed: false,
        running: false,
        currentStep: 0,
    },
    {
        id: 5,
        title: '压碎值',
        color: 'brown',
        icon: 'mdi-gauge',
        description: '选取特定粒级颗粒进行压碎试验。',
        steps: [
            { name: '剔除针片状', device: '分选装置', status: 'pending' },
            { name: '水洗', device: '水洗槽', status: 'pending' },
            { name: '烘干', device: '烘箱', status: 'pending' },
            { name: '标定加载', device: '压力机', status: 'pending' },
            { name: '筛分', device: '标准筛', status: 'pending' },
            { name: '称重', device: '电子天平', status: 'pending' },
        ],
        result: '',
        completed: false,
        running: false,
        currentStep: 0,
    },
]);

// 计算属性
const allExperimentsCompleted = computed(() => {
    return experiments.value.every((exp) => exp.completed);
});

// 获取实验进度
const getExperimentProgress = (experiment: Experiment): number => {
    const completedSteps = experiment.steps.filter((step) => step.status === 'completed').length;
    return Math.round((completedSteps / experiment.steps.length) * 100);
};

// 获取步骤点颜色
const getStepDotColor = (experiment: Experiment, stepIndex: number): string => {
    const step = experiment.steps[stepIndex];
    if (step.status === 'completed') return experiment.color;
    if (step.status === 'active') return 'yellow';
    return 'grey';
};

// 获取步骤图标
const getStepIcon = (experiment: Experiment, stepIndex: number): string => {
    const step = experiment.steps[stepIndex];
    if (step.status === 'completed') return 'mdi-check';
    if (step.status === 'active') return 'mdi-play';
    return 'mdi-circle-outline';
};

// 获取设备状态文本
const getDeviceStatusText = (device: string): string => {
    const status = deviceStatusMap.value[device];
    switch (status) {
        case 'in-use':
            return `${device}: 正在使用中`;
        case 'reserved':
            return `${device}: 已预约`;
        default:
            return `${device}: 空闲`;
    }
};

// 开始单个实验
const startExperiment = (experiment: Experiment) => {
    experiment.running = true;
    experiment.currentStep = 0;
    processNextStep(experiment);
};

// 暂停实验
const pauseExperiment = (experiment: Experiment) => {
    experiment.running = false;
};

// 处理实验下一步
const processNextStep = (experiment: Experiment) => {
    if (!experiment.running || experiment.completed) return;

    if (experiment.currentStep >= experiment.steps.length) {
        completeExperiment(experiment);
        return;
    }

    const currentStepData = experiment.steps[experiment.currentStep];
    currentStepData.status = 'active';
    deviceStatusMap.value[currentStepData.device] = 'in-use';

    experiments.value.forEach((exp) => {
        exp.steps.forEach((step) => {
            if (
                step.device === currentStepData.device &&
                step !== currentStepData &&
                step.status === 'pending'
            ) {
                deviceStatusMap.value[step.device] = 'reserved';
            }
        });
    });

    setTimeout(
        () => {
            currentStepData.status = 'completed';
            deviceStatusMap.value[currentStepData.device] = 'idle';
            experiment.currentStep++;
            processNextStep(experiment);
        },
        2000 + Math.random() * 2000
    );
};

// 完成实验
const completeExperiment = (experiment: Experiment) => {
    experiment.running = false;
    experiment.completed = true;
    experiment.result = `${(Math.random() * 100).toFixed(2)}%`;
};

// 上传结果
const uploadResults = () => {
    const results = {
        sample: {
            code: props.currentSample.code,
            name: props.currentSample.name,
        },
        experiments: {} as Record<string, any>,
        timestamp: new Date().toISOString(),
    };

    experiments.value.forEach((experiment) => {
        results.experiments[`experiment${experiment.id}`] = {
            title: experiment.title,
            result: experiment.result,
            status: experiment.completed ? 'completed' : 'incomplete',
        };
    });

    emit('upload-results', results);
};

// 返回样品列表
const goBack = () => {
    emit('go-back');
};

// 重置实验
const resetExperiments = () => {
    experiments.value.forEach((experiment) => {
        experiment.running = false;
        experiment.completed = false;
        experiment.currentStep = 0;
        experiment.result = '';
        experiment.steps.forEach((step) => {
            step.status = 'pending';
        });
    });

    Object.keys(deviceStatusMap.value).forEach((device) => {
        deviceStatusMap.value[device] = 'idle';
    });
};
</script>

<style lang="scss" scoped>
.experiment-detection-page {
    padding: 16px;

    .experiment-card {
        height: 100%;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        margin-bottom: 16px;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .device-name {
            cursor: pointer;
            text-decoration: underline;
            text-decoration-style: dotted;
            color: #666;
        }

        &.experiment-1 {
            border-left: 4px solid #2196f3;
        }

        &.experiment-2 {
            border-left: 4px solid #f44336;
        }

        &.experiment-3 {
            border-left: 4px solid #4caf50;
        }

        &.experiment-4 {
            border-left: 4px solid #3f51b5;
        }

        &.experiment-5 {
            border-left: 4px solid #795548;
        }
    }

    .bg-blue {
        background-color: #2196f3 !important;
    }

    .bg-red {
        background-color: #f44336 !important;
    }

    .bg-green {
        background-color: #4caf50 !important;
    }

    .bg-indigo {
        background-color: #3f51b5 !important;
    }

    .bg-brown {
        background-color: #795548 !important;
    }
}
</style>
