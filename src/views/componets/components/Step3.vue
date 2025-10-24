<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土质量推演与影响因素分析</span>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')">
                返回列表
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- 推演 Loading 状态 -->
        <div v-if="training" class="text-center pa-10">
            <v-progress-circular
                :model-value="trainingProgress"
                :rotate="360"
                :size="100"
                :width="10"
                color="primary"
                class="mb-4"
            >
                <template v-slot:default>
                    <div class="text-h5">{{ Math.ceil(trainingProgress) }}%</div>
                </template>
            </v-progress-circular>
            <div class="mt-6">
                <div class="text-h5 mb-4 font-weight-bold">{{ trainingStage }}</div>
                <v-progress-linear
                    :model-value="trainingProgress"
                    :color="getProgressColor(trainingProgress)"
                    :bg-color="getProgressColor(trainingProgress)"
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

            <!-- 推演步骤列表 -->
            <v-timeline
                side="end"
                align="start"
                density="compact"
                truncate-line="both"
                class="mt-8 mx-auto training-timeline"
                style="max-width: 600px"
            >
                <v-timeline-item
                    v-for="(stage, index) in trainingStages"
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

        <!-- 影响因素分析 -->
        <div v-else class="pa-4">
            <v-alert type="success" variant="tonal" class="mb-4">
                <template v-slot:text>
                    质量推演完成！以下是影响混凝土强度的关键因素分析。
                </template>
            </v-alert>

            <!-- 基本信息回显 -->
            <v-card class="mb-4" variant="outlined">
                <v-card-title class="bg-blue-grey-lighten-5">
                    <v-icon class="mr-2">mdi-information-outline</v-icon>
                    检测报告基本信息
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="3">
                            <div class="info-item">
                                <div class="info-label">报告编号</div>
                                <div class="info-value">{{ formData.reportNumber }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="3">
                            <div class="info-item">
                                <div class="info-label">工程名称</div>
                                <div class="info-value">{{ formData.projectName }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="3">
                            <div class="info-item">
                                <div class="info-label">强度等级</div>
                                <div class="info-value">
                                    <v-chip color="primary" size="small">{{
                                        formData.strength_grade
                                    }}</v-chip>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="3">
                            <div class="info-item">
                                <div class="info-label">实测强度</div>
                                <div class="info-value">
                                    <span class="text-success font-weight-bold">{{
                                        formData.actual_strength
                                    }}</span>
                                    MPa
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 三大影响因素 -->
            <v-row>
                <!-- 原材料因素 -->
                <v-col cols="12" md="4">
                    <v-card class="factor-card" elevation="2">
                        <v-card-title class="bg-indigo-lighten-5">
                            <v-icon class="mr-2" color="indigo">mdi-package-variant</v-icon>
                            原材料因素
                        </v-card-title>
                        <v-card-text>
                            <div class="factor-item">
                                <div class="factor-label">水泥类型</div>
                                <div class="factor-value">{{ formData.cement_type }}</div>
                            </div>
                            <div class="factor-item">
                                <div class="factor-label">水泥细度</div>
                                <div class="factor-value">{{ formData.cement_fineness }}</div>
                                <div class="factor-tip">
                                    <v-icon size="x-small" color="info">mdi-information</v-icon>
                                    水泥越细，水化反应越充分
                                </div>
                            </div>
                            <div class="factor-item">
                                <div class="factor-label">骨料信息</div>
                                <div class="factor-value">{{ formData.aggregate_info }}</div>
                                <div class="factor-tip">
                                    <v-icon size="x-small" color="warning"
                                        >mdi-alert-circle-outline</v-icon
                                    >
                                    含泥量会影响粘结强度
                                </div>
                            </div>
                            <v-divider class="my-2"></v-divider>
                            <div class="text-caption text-grey">原材料质量是混凝土强度的基础</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- 配合比因素 -->
                <v-col cols="12" md="4">
                    <v-card class="factor-card" elevation="2">
                        <v-card-title class="bg-deep-orange-lighten-5">
                            <v-icon class="mr-2" color="deep-orange">mdi-flask-outline</v-icon>
                            配合比因素
                        </v-card-title>
                        <v-card-text>
                            <div class="factor-item">
                                <div class="factor-label">水灰比（关键）</div>
                                <div class="factor-value">
                                    <v-chip
                                        :color="
                                            formData.water_cement_ratio <= 0.4
                                                ? 'success'
                                                : formData.water_cement_ratio <= 0.5
                                                  ? 'warning'
                                                  : 'error'
                                        "
                                        size="small"
                                    >
                                        {{ formData.water_cement_ratio }}
                                    </v-chip>
                                </div>
                                <div class="factor-tip">
                                    <v-icon size="x-small" color="error">mdi-alert</v-icon>
                                    最决定性因素，与强度成反比
                                </div>
                            </div>
                            <div class="factor-item">
                                <div class="factor-label">外加剂</div>
                                <div class="factor-value">{{ formData.admixture }}</div>
                                <div class="factor-tip">
                                    <v-icon size="x-small" color="success">mdi-check-circle</v-icon>
                                    减水剂可降低水灰比，提高强度
                                </div>
                            </div>
                            <v-divider class="my-2"></v-divider>
                            <div class="text-caption text-grey">水灰比是影响强度的最决定性因素</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- 养护条件因素 -->
                <v-col cols="12" md="4">
                    <v-card class="factor-card" elevation="2">
                        <v-card-title class="bg-teal-lighten-5">
                            <v-icon class="mr-2" color="teal">mdi-weather-partly-cloudy</v-icon>
                            养护条件因素
                        </v-card-title>
                        <v-card-text>
                            <div class="factor-item">
                                <div class="factor-label">养护条件</div>
                                <div class="factor-value">{{ formData.curing_condition }}</div>
                            </div>
                            <div class="factor-item">
                                <div class="factor-label">养护龄期</div>
                                <div class="factor-value">{{ formData.curing_age }}</div>
                                <div class="factor-tip">
                                    <v-icon size="x-small" color="info">mdi-clock-outline</v-icon>
                                    标准养护28天，强度才能充分发展
                                </div>
                            </div>
                            <v-divider class="my-2"></v-divider>
                            <div class="text-caption text-grey">
                                适当的温度和湿度对强度发展至关重要
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 综合评估 -->
            <v-card class="mt-4" variant="tonal" color="blue-grey">
                <v-card-title>
                    <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
                    综合质量评估
                </v-card-title>
                <v-card-text>
                    <div class="assessment-text">
                        根据检测报告数据分析，该混凝土试件的实测强度为
                        <strong class="text-success">{{ formData.actual_strength }} MPa</strong>，
                        设计强度等级为 <strong>{{ formData.strength_grade }}</strong
                        >。 <br /><br />
                        <strong>关键影响因素：</strong>
                        <ul>
                            <li>
                                水灰比 {{ formData.water_cement_ratio }}（{{
                                    getWaterCementRatioComment(formData.water_cement_ratio)
                                }}）
                            </li>
                            <li>
                                {{ formData.cement_type }}（{{
                                    getCementTypeComment(formData.cement_type)
                                }}）
                            </li>
                            <li>
                                {{ formData.curing_condition }}（{{
                                    getCuringComment(formData.curing_condition)
                                }}）
                            </li>
                        </ul>
                        <br />
                        <strong>结论：</strong>{{ formData.conclusion }}
                    </div>
                </v-card-text>
            </v-card>

            <div class="d-flex justify-end mt-4">
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-chart-line"
                    @click="emit('next')"
                >
                    查看可视化分析
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
    training: boolean;
    trainingProgress: number;
    trainingStage: string;
    estimatedTime: number;
    trainingStages: Array<{
        title: string;
        description: string;
        active: boolean;
        completed: boolean;
    }>;
    formData: any;
}>();

const emit = defineEmits<{
    back: [];
    next: [];
    'form-change': [data: any];
}>();

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};

// 获取水灰比评价
const getWaterCementRatioComment = (ratio: number): string => {
    if (ratio <= 0.35) return '极优，适用于高强混凝土';
    if (ratio <= 0.4) return '优秀，强度发展良好';
    if (ratio <= 0.45) return '良好，满足一般要求';
    if (ratio <= 0.5) return '合格，但有优化空间';
    return '偏高，建议降低以提高强度';
};

// 获取水泥类型评价
const getCementTypeComment = (type: string): string => {
    if (type.includes('52.5')) return '高强度等级，强度发展快';
    if (type.includes('42.5R') || type.includes('早强')) return '早强型，早期强度高';
    if (type.includes('42.5')) return '常用等级，性能稳定';
    if (type.includes('低热') || type.includes('中热')) return '水化热低，适用于大体积混凝土';
    return '标准水泥';
};

// 获取养护条件评价
const getCuringComment = (condition: string): string => {
    if (condition.includes('标准养护')) return '理想养护条件';
    if (condition.includes('蒸汽养护')) return '加速养护，早期强度快';
    if (condition.includes('保温')) return '冬季保温养护';
    if (condition.includes('现场')) return '现场养护，受环境影响';
    return '常规养护';
};
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

// 信息项样式
.info-item {
    .info-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
    }
    .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #333;
    }
}

// 因素卡片样式
.factor-card {
    height: 100%;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-4px);
    }
}

.factor-item {
    margin-bottom: 16px;

    .factor-label {
        font-size: 13px;
        color: #666;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .factor-value {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
    }

    .factor-tip {
        font-size: 11px;
        color: #999;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
    }
}

// 评估文本
.assessment-text {
    line-height: 1.8;
    font-size: 14px;

    ul {
        margin: 12px 0;
        padding-left: 24px;

        li {
            margin: 8px 0;
        }
    }
}
</style>
