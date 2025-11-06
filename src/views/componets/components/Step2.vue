<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土强度预测分析报告</span>
            <div>
                <v-btn
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="emit('back')"
                    class="mr-2"
                >
                    返回调整
                </v-btn>
                <v-btn
                    variant="tonal"
                    color="success"
                    prepend-icon="mdi-download"
                    @click="handleExport"
                >
                    导出报告
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-6">
            <!-- 核心预测结果 -->
            <v-row class="mb-6">
                <v-col cols="12">
                    <v-card elevation="8" class="gradient-card">
                        <v-card-text class="pa-6">
                            <div class="text-center">
                                <div class="text-h3 font-weight-bold mb-2">
                                    {{ apiResult.predicted_strength?.toFixed(2) || 0 }} MPa
                                </div>
                                <div class="text-h6 mb-4 text-grey-darken-1">预测抗压强度</div>

                                <v-divider class="my-4"></v-divider>

                                <div class="text-subtitle-1 mb-2">
                                    <v-icon size="small" class="mr-1">mdi-chart-bell-curve</v-icon>
                                    95% 置信区间
                                </div>
                                <div class="text-h5 font-weight-medium">
                                    [{{ apiResult.confidence_interval?.lower.toFixed(2) || 0 }},
                                    {{ apiResult.confidence_interval?.upper.toFixed(2) || 0 }}] MPa
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 配合比参数显示 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-primary">
                    <v-icon class="mr-2">mdi-flask-outline</v-icon>
                    输入配合比参数
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row>
                        <v-col cols="6" md="3" v-for="(param, key) in mixParams" :key="key">
                            <v-card variant="tonal" :color="param.color" class="pa-3 text-center">
                                <div class="text-caption text-grey-darken-2">{{ param.label }}</div>
                                <div class="text-h6 font-weight-bold mt-1">
                                    {{ param.value }} {{ param.unit }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 因素权重分析 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-primary">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    影响因素权重分析
                </v-card-title>
                <v-card-text class="pa-4">
                    <div v-for="(factor, key) in sortedFeatureWeights" :key="key" class="mb-4">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="d-flex align-center">
                                <v-chip
                                    :color="getFactorColor(factor.direction)"
                                    size="small"
                                    class="mr-2"
                                >
                                    {{ factor.direction === '正向' ? '↑' : '↓' }}
                                </v-chip>
                                <span class="font-weight-bold">{{ factor.name }}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-h6 font-weight-bold mr-2">
                                    {{ factor.weight_pct.toFixed(1) }}%
                                </span>
                                <v-chip size="x-small" :color="getScoreColor(factor.score)">
                                    {{ factor.score }}分
                                </v-chip>
                            </div>
                        </div>
                        <v-progress-linear
                            :model-value="factor.weight_pct"
                            :color="getFactorColor(factor.direction)"
                            height="20"
                            rounded
                        >
                            <template v-slot:default="{ value }">
                                <strong class="text-white">{{ value.toFixed(1) }}%</strong>
                            </template>
                        </v-progress-linear>
                        <div class="text-caption text-grey mt-1">
                            因果效应: {{ factor.causal_effect > 0 ? '+' : ''
                            }}{{ factor.causal_effect.toFixed(2) }} MPa
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- 工程评估 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-info">
                    <v-icon class="mr-2">mdi-lightbulb-on</v-icon>
                    工程评估与建议
                </v-card-title>
                <v-card-text>
                    <v-alert type="info" variant="tonal" prominent>
                        <div
                            class="interpretation-text"
                            v-html="formatInterpretation(apiResult.interpretation)"
                        ></div>
                    </v-alert>
                </v-card-text>
            </v-card>

            <!-- 相似样本参考 -->
            <v-card class="mb-6" elevation="2" v-if="apiResult.similar_samples?.length">
                <v-card-title class="bg-primary">
                    <v-icon class="mr-2">mdi-database-search</v-icon>
                    相似配合比样本参考
                </v-card-title>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th>水泥 (kg/m³)</th>
                                <th>水 (kg/m³)</th>
                                <th>高炉矿渣 (kg/m³)</th>
                                <th>龄期 (天)</th>
                                <th>实测强度 (MPa)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(sample, index) in apiResult.similar_samples" :key="index">
                                <td>{{ sample.cement }}</td>
                                <td>{{ sample.water }}</td>
                                <td>{{ sample.blast_furnace_slag }}</td>
                                <td>{{ sample.age }}</td>
                                <td class="font-weight-bold text-success">
                                    {{ sample.actual_strength }}
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>

            <!-- 优化建议 -->
            <v-card elevation="2">
                <v-card-title class="bg-primary">
                    <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                    智能优化建议
                </v-card-title>
                <v-card-text>
                    <v-list>
                        <v-list-item
                            v-for="(suggestion, index) in getOptimizationSuggestions()"
                            :key="index"
                            :prepend-icon="suggestion.icon"
                        >
                            <v-list-item-title>{{ suggestion.title }}</v-list-item-title>
                            <v-list-item-subtitle>{{
                                suggestion.description
                            }}</v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    data: any;
}>();

const emit = defineEmits<{
    back: [];
    export: [];
}>();

// 获取API返回结果（直接就是props.data）
const apiResult = computed(() => props.data || {});

// 配合比参数（从mixProportionParams或从interpretation中提取）
const mixParams = computed(() => {
    const params = props.data?.mixProportionParams || {};
    return {
        cement: {
            label: '水泥',
            value: params.cement || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        water: {
            label: '水',
            value: params.water || 0,
            unit: 'kg/m³',
            color: 'info',
        },
        blast_furnace_slag: {
            label: '高炉矿渣',
            value: params.blast_furnace_slag || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        fly_ash: {
            label: '粉煤灰',
            value: params.fly_ash || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        superplasticizer: {
            label: '高效减水剂',
            value: params.superplasticizer || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        coarse_aggregate: {
            label: '粗骨料',
            value: params.coarse_aggregate || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        fine_aggregate: {
            label: '细骨料',
            value: params.fine_aggregate || 0,
            unit: 'kg/m³',
            color: 'primary',
        },
        age: {
            label: '龄期',
            value: params.age || 0,
            unit: '天',
            color: 'primary',
        },
    };
});

// 排序后的因素权重（按权重百分比降序）
const sortedFeatureWeights = computed(() => {
    const weights = apiResult.value.feature_weights || {};
    return Object.entries(weights)
        .map(([key, value]: [string, any]) => ({
            key,
            ...value,
        }))
        .sort((a, b) => b.weight_pct - a.weight_pct);
});

// 获取因素颜色
const getFactorColor = (direction: string) => {
    return direction === '正向' ? 'success' : 'warning';
};

// 获取评分颜色
const getScoreColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 75) return 'info';
    return 'warning';
};

// 格式化解释文本
const formatInterpretation = (text: string) => {
    if (!text) return '';
    return text
        .replace(/\n/g, '<br>')
        .replace(/•/g, '&bull;')
        .replace(/📊/g, '<span class="text-h6">📊</span>')
        .replace(/🎯/g, '<span class="text-h6">🎯</span>')
        .replace(/💡/g, '<span class="text-h6">💡</span>');
};

// 生成优化建议
const getOptimizationSuggestions = () => {
    const suggestions = [];
    const weights = apiResult.value.feature_weights || {};

    // 根据权重最高的因素给出建议
    const topFactors = sortedFeatureWeights.value.slice(0, 3);

    topFactors.forEach((factor) => {
        if (factor.direction === '正向' && factor.causal_effect > 0) {
            suggestions.push({
                icon: 'mdi-arrow-up-bold',
                title: `增加${factor.name}`,
                description: `当前${factor.name}占比${factor.weight_pct.toFixed(1)}%，增加用量可提升约${Math.abs(factor.causal_effect).toFixed(2)} MPa`,
            });
        } else if (factor.direction === '负向' && factor.causal_effect < 0) {
            suggestions.push({
                icon: 'mdi-arrow-down-bold',
                title: `减少${factor.name}`,
                description: `当前${factor.name}占比${factor.weight_pct.toFixed(1)}%，减少用量可提升约${Math.abs(factor.causal_effect).toFixed(2)} MPa`,
            });
        }
    });

    // 根据预测强度给出建议
    const predictedStrength = apiResult.value.predicted_strength || 0;
    if (predictedStrength < 30) {
        suggestions.push({
            icon: 'mdi-alert',
            title: '强度偏低预警',
            description: '预测强度低于C30标准，建议优化配合比或延长养护时间',
        });
    } else if (predictedStrength >= 50) {
        suggestions.push({
            icon: 'mdi-check-circle',
            title: '高强度配合比',
            description: '当前配合比可达到高强度混凝土标准，适用于特殊工程需求',
        });
    }

    return suggestions;
};

// 导出报告
const handleExport = () => {
    console.log('导出报告', props.data);
    emit('export');
};
</script>

<style lang="scss" scoped>
.gradient-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.interpretation-text {
    line-height: 1.8;
    font-size: 14px;

    :deep(strong) {
        color: #1976d2;
        font-weight: 600;
    }
}
</style>
