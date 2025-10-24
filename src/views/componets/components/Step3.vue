<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土强度推演与参数优化</span>
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

        <!-- 参数调整与推演界面 -->
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

            <!-- 强度预测对比卡片 -->
            <v-row class="mb-4">
                <v-col cols="12" md="6">
                    <v-card class="strength-compare-card" elevation="3">
                        <v-card-text>
                            <div class="text-subtitle-2 text-grey mb-2">原始实测强度</div>
                            <div class="d-flex align-center">
                                <v-icon size="large" color="blue-grey" class="mr-3"
                                    >mdi-clipboard-check</v-icon
                                >
                                <div>
                                    <div class="text-h4 font-weight-bold text-blue-grey">
                                        {{ originalStrength }}
                                    </div>
                                    <div class="text-caption text-grey">MPa</div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card
                        class="strength-compare-card"
                        elevation="3"
                        :color="strengthChangeColor"
                        variant="tonal"
                    >
                        <v-card-text>
                            <div class="text-subtitle-2 mb-2">
                                <v-icon size="small" class="mr-1">mdi-brain</v-icon>
                                AI推演预测强度
                            </div>
                            <div class="d-flex align-center justify-space-between">
                                <div class="d-flex align-center">
                                    <v-icon size="large" class="mr-3">mdi-chart-line</v-icon>
                                    <div>
                                        <div class="text-h4 font-weight-bold">
                                            {{ predictedStrength }}
                                        </div>
                                        <div class="text-caption">MPa</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <v-chip
                                        :color="strengthChangeColor"
                                        size="small"
                                        variant="flat"
                                        class="font-weight-bold"
                                    >
                                        <v-icon size="small" class="mr-1">{{
                                            strengthDifference >= 0
                                                ? 'mdi-arrow-up'
                                                : 'mdi-arrow-down'
                                        }}</v-icon>
                                        {{ strengthDifference >= 0 ? '+' : ''
                                        }}{{ strengthDifference.toFixed(1) }} MPa
                                    </v-chip>
                                    <div class="text-caption mt-1">
                                        {{ strengthChangePercent >= 0 ? '+' : ''
                                        }}{{ strengthChangePercent.toFixed(1) }}%
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 可调参数面板 -->
            <v-card class="mb-4" elevation="2">
                <v-card-title class="bg-gradient-primary">
                    <v-icon class="mr-2">mdi-tune-variant</v-icon>
                    关键参数调整 - 实时推演
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-row>
                        <!-- 水灰比调整 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="deep-orange" class="mr-2"
                                        >mdi-water-percent</v-icon
                                    >
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >水灰比（最关键因素）</span
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.water_cement_ratio }}
                                </div>
                                <v-slider
                                    v-model="editableParams.water_cement_ratio"
                                    :min="0.25"
                                    :max="0.65"
                                    :step="0.01"
                                    color="deep-orange"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small" color="success">0.25</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small" color="error">0.65</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    水灰比越低，强度越高（建议≤0.45）
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 水泥强度等级 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="indigo" class="mr-2">mdi-package-variant</v-icon>
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >水泥强度等级</span
                                    >
                                </div>
                                <v-radio-group
                                    v-model="editableParams.cement_strength_grade"
                                    inline
                                    @update:model-value="handleParameterChange"
                                >
                                    <v-radio label="32.5级" :value="32.5" color="indigo"></v-radio>
                                    <v-radio label="42.5级" :value="42.5" color="indigo"></v-radio>
                                    <v-radio label="52.5级" :value="52.5" color="indigo"></v-radio>
                                </v-radio-group>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    等级越高，强度发展越好
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 水泥细度 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="purple" class="mr-2">mdi-grain</v-icon>
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >水泥细度 (m²/kg)</span
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.cement_fineness }}
                                </div>
                                <v-slider
                                    v-model="editableParams.cement_fineness"
                                    :min="300"
                                    :max="450"
                                    :step="10"
                                    color="purple"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">300</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">450</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    细度越高，水化反应越充分（标准350）
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 养护温度 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="orange" class="mr-2">mdi-thermometer</v-icon>
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >养护温度 (°C)</span
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.curing_temperature }}°C
                                </div>
                                <v-slider
                                    v-model="editableParams.curing_temperature"
                                    :min="5"
                                    :max="40"
                                    :step="1"
                                    color="orange"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small" color="blue">5°C</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small" color="red">40°C</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    最佳温度18-22°C
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 养护湿度 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="blue" class="mr-2">mdi-water</v-icon>
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >养护湿度 (%)</span
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.curing_humidity }}%
                                </div>
                                <v-slider
                                    v-model="editableParams.curing_humidity"
                                    :min="50"
                                    :max="100"
                                    :step="5"
                                    color="blue"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">50%</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small" color="success">100%</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    标准养护要求≥95%
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 养护龄期 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4">
                                <div class="d-flex align-center mb-3">
                                    <v-icon color="teal" class="mr-2">mdi-calendar-clock</v-icon>
                                    <span class="text-subtitle-1 font-weight-bold"
                                        >养护龄期 (天)</span
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.curing_days }} 天
                                </div>
                                <v-slider
                                    v-model="editableParams.curing_days"
                                    :min="1"
                                    :max="90"
                                    :step="1"
                                    color="teal"
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
                                    标准龄期为28天
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- 快速预设方案 -->
                    <v-divider class="my-6"></v-divider>
                    <div class="text-subtitle-2 font-weight-bold mb-4">
                        <v-icon class="mr-2" size="small">mdi-flash</v-icon>
                        快速预设方案
                    </div>
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-btn
                                block
                                variant="outlined"
                                color="success"
                                prepend-icon="mdi-star"
                                @click="applyPreset('optimal')"
                            >
                                最优方案
                            </v-btn>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-btn
                                block
                                variant="outlined"
                                color="primary"
                                prepend-icon="mdi-check"
                                @click="applyPreset('standard')"
                            >
                                标准方案
                            </v-btn>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-btn
                                block
                                variant="outlined"
                                color="warning"
                                prepend-icon="mdi-undo"
                                @click="applyPreset('reset')"
                            >
                                恢复原始
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 影响因素分析雷达图 -->
            <v-card class="mb-4" elevation="2">
                <v-card-title class="bg-blue-grey-lighten-5">
                    <v-icon class="mr-2">mdi-chart-radar</v-icon>
                    各因素影响程度分析
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col
                            v-for="(factor, index) in factorInfluences"
                            :key="index"
                            cols="12"
                            md="4"
                        >
                            <v-card variant="outlined" class="pa-3">
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <span class="font-weight-bold">{{ factor.factor }}</span>
                                    <v-chip
                                        :color="getInfluenceColor(factor.influence)"
                                        size="small"
                                    >
                                        {{ factor.influence }}分
                                    </v-chip>
                                </div>
                                <v-progress-linear
                                    :model-value="factor.influence"
                                    :color="getInfluenceColor(factor.influence)"
                                    height="10"
                                    rounded
                                    class="mb-2"
                                ></v-progress-linear>
                                <div class="text-caption text-grey">{{ factor.description }}</div>
                                <div class="text-caption text-primary mt-1">
                                    <v-icon size="x-small">mdi-lightbulb</v-icon>
                                    {{ factor.optimization }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 推演结果评估 -->
            <v-card class="mt-4" elevation="3">
                <v-card-title class="bg-gradient-success">
                    <v-icon class="mr-2">mdi-clipboard-text</v-icon>
                    推演结果评估
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="mb-4">
                                <div class="text-subtitle-2 text-grey mb-2">原始状态</div>
                                <div class="d-flex align-items-center">
                                    <v-chip color="blue-grey" class="mr-2">
                                        实测强度: {{ originalStrength }} MPa
                                    </v-chip>
                                    <v-chip color="primary">
                                        设计等级: {{ formData.strength_grade }}
                                    </v-chip>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="mb-4">
                                <div class="text-subtitle-2 text-grey mb-2">推演结果</div>
                                <div class="d-flex align-items-center">
                                    <v-chip :color="strengthChangeColor" class="mr-2">
                                        预测强度: {{ predictedStrength }} MPa
                                    </v-chip>
                                    <v-chip
                                        :color="strengthDifference >= 0 ? 'success' : 'error'"
                                        variant="flat"
                                    >
                                        <v-icon size="small" class="mr-1">{{
                                            strengthDifference >= 0
                                                ? 'mdi-trending-up'
                                                : 'mdi-trending-down'
                                        }}</v-icon>
                                        {{ strengthDifference >= 0 ? '+' : ''
                                        }}{{ strengthChangePercent.toFixed(1) }}%
                                    </v-chip>
                                </div>
                            </div>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <div class="assessment-text">
                        <p class="text-h6 mb-3">
                            <v-icon class="mr-2" color="primary">mdi-lightbulb</v-icon>
                            推演分析结论
                        </p>
                        <p>
                            基于当前调整的参数，AI推演系统预测混凝土强度为
                            <strong class="text-primary text-h6">{{ predictedStrength }} MPa</strong
                            >，
                            <span
                                v-if="strengthDifference >= 0"
                                class="text-success font-weight-bold"
                            >
                                相比原始实测强度提升了
                                {{ Math.abs(strengthDifference).toFixed(1) }} MPa（{{
                                    strengthChangePercent.toFixed(1)
                                }}%）
                            </span>
                            <span v-else class="text-error font-weight-bold">
                                相比原始实测强度降低了
                                {{ Math.abs(strengthDifference).toFixed(1) }} MPa（{{
                                    Math.abs(strengthChangePercent).toFixed(1)
                                }}%）
                            </span>
                        </p>

                        <div class="mt-4 pa-4 bg-blue-grey-lighten-5 rounded">
                            <p class="font-weight-bold mb-2">
                                <v-icon size="small" class="mr-1">mdi-chart-line</v-icon>
                                关键发现：
                            </p>
                            <ul class="ml-4">
                                <li
                                    v-for="(factor, index) in factorInfluences.slice(0, 3)"
                                    :key="index"
                                    class="mb-1"
                                >
                                    <strong>{{ factor.factor }}</strong
                                    >（影响度：{{ factor.influence }}分）-
                                    {{ factor.description }}
                                </li>
                            </ul>
                        </div>

                        <div class="mt-4">
                            <p class="font-weight-bold mb-2">
                                <v-icon size="small" class="mr-1" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                优化建议：
                            </p>
                            <v-alert
                                v-if="strengthDifference >= 5"
                                type="success"
                                variant="tonal"
                                class="mb-2"
                            >
                                参数优化效果显著！建议采用当前调整后的配合比和养护方案，可有效提升混凝土强度。
                            </v-alert>
                            <v-alert
                                v-else-if="strengthDifference >= 0"
                                type="info"
                                variant="tonal"
                                class="mb-2"
                            >
                                参数调整有一定优化效果，可考虑在实际施工中采纳。
                            </v-alert>
                            <v-alert v-else type="warning" variant="tonal" class="mb-2">
                                当前参数可能导致强度下降，建议调整水灰比或改善养护条件。
                            </v-alert>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <div class="d-flex justify-space-between mt-4">
                <v-btn variant="outlined" size="large" @click="applyPreset('reset')">
                    <v-icon class="mr-2">mdi-refresh</v-icon>
                    重新推演
                </v-btn>
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-chart-line"
                    @click="emit('next')"
                >
                    查看详细可视化分析
                    <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
    calculateConcreteStrength,
    analyzeFactorInfluence,
    type ConcreteParameters,
    type FactorInfluence,
} from '@/utils/concreteStrengthModel';

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

// ==================== 响应式数据 ====================

// 原始强度
const originalStrength = ref(0);

// 可编辑的参数
const editableParams = ref<ConcreteParameters>({
    water_cement_ratio: 0.45,
    cement_strength_grade: 42.5,
    cement_fineness: 350,
    aggregate_mud_content: 0.8,
    aggregate_quality_score: 85,
    admixture_type: '聚羧酸高效减水剂',
    admixture_dosage: 1.2,
    curing_temperature: 20,
    curing_humidity: 95,
    curing_days: 28,
    curing_method: '标准养护',
});

// 原始参数备份（用于重置）
const originalParams = ref<ConcreteParameters>({ ...editableParams.value });

// ==================== 计算属性 ====================

// 预测强度
const predictedStrength = computed(() => {
    return calculateConcreteStrength(editableParams.value);
});

// 强度差值
const strengthDifference = computed(() => {
    return predictedStrength.value - originalStrength.value;
});

// 强度变化百分比
const strengthChangePercent = computed(() => {
    if (originalStrength.value === 0) return 0;
    return (strengthDifference.value / originalStrength.value) * 100;
});

// 强度变化颜色
const strengthChangeColor = computed(() => {
    const diff = strengthDifference.value;
    if (diff >= 5) return 'success';
    if (diff >= 2) return 'primary';
    if (diff >= 0) return 'info';
    if (diff >= -2) return 'warning';
    return 'error';
});

// 影响因素分析
const factorInfluences = computed<FactorInfluence[]>(() => {
    return analyzeFactorInfluence(editableParams.value);
});

// ==================== 方法 ====================

// 初始化参数
const initializeParams = () => {
    if (!props.formData) return;

    // 从formData中提取参数
    originalStrength.value = props.formData.actual_strength || 0;

    // 解析水泥强度等级
    const cementType = props.formData.cement_type || '';
    let cementGrade = 42.5;
    if (cementType.includes('52.5')) {
        cementGrade = 52.5;
    } else if (cementType.includes('32.5')) {
        cementGrade = 32.5;
    }

    // 解析水泥细度
    const finenesMatch = props.formData.cement_fineness?.match(/(\d+)\s*m/);
    const fineness = finenesMatch ? parseInt(finenesMatch[1]) : 350;

    // 解析骨料含泥量
    const mudContentMatch = props.formData.aggregate_info?.match(/含泥量([\d.]+)%/);
    const mudContent = mudContentMatch ? parseFloat(mudContentMatch[1]) : 0.8;

    // 解析养护温度
    let curingTemp = 20;
    const tempMatch = props.formData.curing_condition?.match(/温度\s*([\d-]+)/);
    if (tempMatch) {
        const temps = tempMatch[1].split('-');
        curingTemp = parseInt(temps[0]);
    }

    // 解析养护湿度
    let curingHumidity = 95;
    const humidityMatch = props.formData.curing_condition?.match(/湿度\s*[≥>=]*\s*(\d+)/);
    if (humidityMatch) {
        curingHumidity = parseInt(humidityMatch[1]);
    }

    // 解析养护龄期
    const ageMatch = props.formData.curing_age?.match(/(\d+)\s*天/);
    const curingDays = ageMatch ? parseInt(ageMatch[1]) : 28;

    // 确定养护方式
    const curingMethod = props.formData.curing_condition || '标准养护';

    // 解析外加剂类型
    const admixtureType = props.formData.admixture || '聚羧酸高效减水剂';
    const admixtureMatch = props.formData.admixture?.match(/([\d.]+)%/);
    const admixtureDosage = admixtureMatch ? parseFloat(admixtureMatch[1]) : 1.2;

    // 设置参数
    editableParams.value = {
        water_cement_ratio: props.formData.water_cement_ratio || 0.45,
        cement_strength_grade: cementGrade,
        cement_fineness: fineness,
        aggregate_mud_content: mudContent,
        aggregate_quality_score: 85,
        admixture_type: admixtureType,
        admixture_dosage: admixtureDosage,
        curing_temperature: curingTemp,
        curing_humidity: curingHumidity,
        curing_days: curingDays,
        curing_method: curingMethod,
    };

    // 备份原始参数
    originalParams.value = { ...editableParams.value };
};

// 参数变化处理
const handleParameterChange = () => {
    // 触发表单变化事件，将修改后的参数传递给父组件
    const updatedFormData = {
        ...props.formData,
        water_cement_ratio: editableParams.value.water_cement_ratio,
        cement_strength_grade: getCementGradeString(editableParams.value.cement_strength_grade),
        cement_fineness: `比表面积 ${editableParams.value.cement_fineness} m²/kg`,
        curing_temperature: editableParams.value.curing_temperature,
        curing_humidity: editableParams.value.curing_humidity,
        curing_days: editableParams.value.curing_days,
        predicted_strength: predictedStrength.value,
        // 保存完整参数用于Step4
        __concreteParams: editableParams.value,
    };

    emit('form-change', updatedFormData);
};

// 获取水泥等级字符串
const getCementGradeString = (grade: number): string => {
    return `P.O ${grade}`;
};

// 应用预设方案
const applyPreset = (type: 'optimal' | 'standard' | 'reset') => {
    switch (type) {
        case 'optimal':
            // 最优方案
            editableParams.value = {
                ...editableParams.value,
                water_cement_ratio: 0.35,
                cement_strength_grade: 52.5,
                cement_fineness: 400,
                aggregate_mud_content: 0.3,
                aggregate_quality_score: 95,
                admixture_type: '聚羧酸高效减水剂',
                admixture_dosage: 2.0,
                curing_temperature: 20,
                curing_humidity: 98,
                curing_days: 28,
                curing_method: '标准养护',
            };
            break;
        case 'standard':
            // 标准方案
            editableParams.value = {
                ...editableParams.value,
                water_cement_ratio: 0.45,
                cement_strength_grade: 42.5,
                cement_fineness: 350,
                aggregate_mud_content: 0.7,
                aggregate_quality_score: 85,
                admixture_type: '聚羧酸减水剂',
                admixture_dosage: 1.5,
                curing_temperature: 20,
                curing_humidity: 95,
                curing_days: 28,
                curing_method: '标准养护',
            };
            break;
        case 'reset':
            // 恢复原始
            editableParams.value = { ...originalParams.value };
            break;
    }
    handleParameterChange();
};

// 获取影响程度颜色
const getInfluenceColor = (influence: number): string => {
    if (influence >= 90) return 'success';
    if (influence >= 80) return 'primary';
    if (influence >= 70) return 'info';
    if (influence >= 60) return 'warning';
    return 'error';
};

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};

// ==================== 生命周期 ====================

onMounted(() => {
    initializeParams();
});

// 监听formData变化
watch(
    () => props.formData,
    () => {
        if (!props.training) {
            initializeParams();
        }
    },
    { deep: true }
);
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

.bg-gradient-success {
    background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
    color: white;
}

// 评估文本
.assessment-text {
    line-height: 1.8;
    font-size: 15px;

    p {
        margin-bottom: 12px;
    }

    ul {
        margin: 12px 0;
        padding-left: 24px;

        li {
            margin: 10px 0;
            line-height: 1.6;
        }
    }
}

// 参数卡片hover效果
.v-card.outlined {
    transition: all 0.3s ease;

    &:hover {
        border-color: rgba(var(--v-theme-primary), 0.5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}
</style>
