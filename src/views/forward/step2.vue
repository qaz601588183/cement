<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土强度预测分析报告</span>
            <div>
                <v-btn
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="goBack"
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
                    <v-card color="primary" variant="tonal">
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

            <!-- 智能优化建议 -->
            <v-card class="mb-6">
                <v-card-title>
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

            <!-- 配合比参数显示 -->
            <v-card class="mb-6">
                <v-card-title>
                    <v-icon class="mr-2">mdi-flask-outline</v-icon>
                    输入配合比参数
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row>
                        <v-col cols="6" md="3" v-for="(param, key) in mixParams" :key="key">
                            <v-card variant="tonal" class="pa-3 text-center">
                                <div class="text-caption text-grey-darken-2">{{ param.label }}</div>
                                <div class="text-h6 font-weight-bold mt-1">
                                    {{ param.value }} {{ param.unit }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 因素权重分析图表 -->
            <v-card class="mb-6">
                <v-card-text>
                    <div ref="factorWeightChartRef" style="width: 100%; height: 400px"></div>
                </v-card-text>
            </v-card>

            <!-- 置信区间图表 -->
            <v-row class="mb-6">
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-text>
                            <div ref="confidenceChartRef" style="width: 100%; height: 350px"></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-text>
                            <div ref="radarChartRef" style="width: 100%; height: 350px"></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 参数分布对比图表 -->
            <v-card class="mb-6" v-if="apiResult.similar_samples?.length">
                <v-card-text>
                    <div ref="paramDistributionChartRef" style="width: 100%; height: 350px"></div>
                </v-card-text>
            </v-card>

            <!-- 工程评估 -->
            <v-card class="mb-6">
                <v-card-title>
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
            <v-card class="mb-6" v-if="apiResult.similar_samples?.length">
                <v-card-title>
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
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useConcreteStore } from '@/stores/useConcreteStore';
import { useRouter } from 'vue-router';

// 获取store和router
const concreteStore = useConcreteStore();
const router = useRouter();

// ECharts实例引用
const factorWeightChartRef = ref<HTMLDivElement>();
const confidenceChartRef = ref<HTMLDivElement>();
const radarChartRef = ref<HTMLDivElement>();
const paramDistributionChartRef = ref<HTMLDivElement>();

let factorWeightChart: echarts.ECharts | null = null;
let confidenceChart: echarts.ECharts | null = null;
let radarChart: echarts.ECharts | null = null;
let paramDistributionChart: echarts.ECharts | null = null;

// 获取API返回结果（从store读取）
const apiResult = computed(() => concreteStore.forwardData?.analysisResult || {});

// 配合比参数（从store读取）
const mixParams = computed(() => {
    const params = concreteStore.forwardData?.mixProportionParams || {};
    return {
        cement: {
            label: '水泥',
            value: params.cement || 0,
            unit: 'kg/m³',
        },
        water: {
            label: '水',
            value: params.water || 0,
            unit: 'kg/m³',
        },
        blast_furnace_slag: {
            label: '高炉矿渣',
            value: params.blast_furnace_slag || 0,
            unit: 'kg/m³',
        },
        fly_ash: {
            label: '粉煤灰',
            value: params.fly_ash || 0,
            unit: 'kg/m³',
        },
        superplasticizer: {
            label: '高效减水剂',
            value: params.superplasticizer || 0,
            unit: 'kg/m³',
        },
        coarse_aggregate: {
            label: '粗骨料',
            value: params.coarse_aggregate || 0,
            unit: 'kg/m³',
        },
        fine_aggregate: {
            label: '细骨料',
            value: params.fine_aggregate || 0,
            unit: 'kg/m³',
        },
        age: {
            label: '龄期',
            value: params.age || 0,
            unit: '天',
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

// 返回上一步
const goBack = () => {
    router.push('/concrete-design/forward-step1');
};

// 导出报告
const handleExport = () => {
    console.log('导出报告', apiResult.value);
    // 这里可以添加实际的导出逻辑
};

// 初始化因素权重图表（横向柱状图）
const initFactorWeightChart = () => {
    if (!factorWeightChartRef.value) return;

    factorWeightChart = echarts.init(factorWeightChartRef.value);

    const factors = sortedFeatureWeights.value;
    const names = factors.map((f) => f.name);
    const weights = factors.map((f) => f.weight_pct);

    const option: EChartsOption = {
        title: {
            text: '影响因素权重分析',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params: any) => {
                const data = params[0];
                const index = data.dataIndex;
                const factor = factors[index];
                return `
                    <div style="padding: 8px;">
                        <strong>${factor.name}</strong><br/>
                        权重占比: <strong>${factor.weight_pct.toFixed(2)}%</strong><br/>
                        因果效应: <strong>${factor.causal_effect > 0 ? '+' : ''}${factor.causal_effect.toFixed(2)} MPa</strong><br/>
                        影响方向: <strong>${factor.direction}</strong><br/>
                        评分: <strong>${factor.score}分</strong>
                    </div>
                `;
            },
        },
        grid: {
            left: '15%',
            right: '10%',
            bottom: '10%',
            top: '15%',
        },
        xAxis: {
            type: 'value',
            name: '权重占比 (%)',
            axisLabel: {
                formatter: (value: number) => `${value.toFixed(2)}%`,
            },
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLabel: {
                fontSize: 12,
            },
        },
        series: [
            {
                name: '权重占比',
                type: 'bar',
                data: weights.map((w, i) => ({
                    value: w,
                    itemStyle: {
                        color: factors[i].direction === '正向' ? '#4caf50' : '#ff9800',
                    },
                })),
                label: {
                    show: true,
                    position: 'right',
                    formatter: (params: any) => `${params.value.toFixed(2)}%`,
                    fontSize: 11,
                },
                barWidth: '60%',
            },
        ],
    };

    factorWeightChart.setOption(option);
};

// 初始化置信区间图表
const initConfidenceChart = () => {
    if (!confidenceChartRef.value) return;

    confidenceChart = echarts.init(confidenceChartRef.value);

    const predicted = apiResult.value.predicted_strength || 0;
    const lower = apiResult.value.confidence_interval?.lower || 0;
    const upper = apiResult.value.confidence_interval?.upper || 0;

    const option: EChartsOption = {
        title: {
            text: '强度预测与置信区间',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'axis',
            formatter: () => {
                return `
                    <div style="padding: 8px;">
                        <strong>强度预测</strong><br/>
                        预测值: <strong>${predicted.toFixed(2)} MPa</strong><br/>
                        下限: <strong>${lower.toFixed(2)} MPa</strong><br/>
                        上限: <strong>${upper.toFixed(2)} MPa</strong><br/>
                        置信度: <strong>95%</strong>
                    </div>
                `;
            },
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '20%',
        },
        xAxis: {
            type: 'category',
            data: ['预测强度'],
            axisLabel: {
                fontSize: 14,
                fontWeight: 'bold',
            },
        },
        yAxis: {
            type: 'value',
            name: '强度 (MPa)',
            axisLabel: {
                formatter: (value: number) => value.toFixed(2),
            },
        },
        series: [
            {
                name: '置信区间',
                type: 'bar',
                data: [[0, lower, upper]],
                itemStyle: {
                    color: 'rgba(66, 165, 245, 0.2)',
                    borderColor: '#42a5f5',
                    borderWidth: 2,
                },
                barWidth: '40%',
            },
            {
                name: '预测值',
                type: 'scatter',
                data: [predicted],
                symbolSize: 20,
                itemStyle: {
                    color: '#4caf50',
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => `${params.value.toFixed(2)} MPa`,
                    fontSize: 14,
                    fontWeight: 'bold',
                },
                z: 10,
            },
        ],
    };

    confidenceChart.setOption(option);
};

// 初始化雷达图（配合比参数）
const initRadarChart = () => {
    if (!radarChartRef.value) return;

    radarChart = echarts.init(radarChartRef.value);

    const params = props.data?.mixProportionParams || {};

    // 定义各参数的合理范围（用于归一化）
    const ranges = {
        cement: { max: 600, name: '水泥' },
        blast_furnace_slag: { max: 300, name: '矿渣' },
        fly_ash: { max: 200, name: '粉煤灰' },
        water: { max: 250, name: '水' },
        superplasticizer: { max: 20, name: '减水剂' },
        coarse_aggregate: { max: 1200, name: '粗骨料' },
        fine_aggregate: { max: 1000, name: '细骨料' },
        age: { max: 90, name: '龄期' },
    };

    const indicator = Object.entries(ranges).map(([, { max, name }]) => ({
        name,
        max,
    }));

    const values = Object.keys(ranges).map((key) => params[key] || 0);

    const option: EChartsOption = {
        title: {
            text: '配合比参数雷达图',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'item',
        },
        radar: {
            indicator,
            shape: 'polygon',
            splitNumber: 4,
            axisName: {
                color: '#666',
                fontSize: 12,
            },
            splitLine: {
                lineStyle: {
                    color: ['#ddd', '#ddd', '#ddd', '#ddd'],
                },
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: ['rgba(66, 165, 245, 0.1)', 'rgba(66, 165, 245, 0.05)'],
                },
            },
        },
        series: [
            {
                name: '配合比参数',
                type: 'radar',
                data: [
                    {
                        value: values,
                        name: '当前配比',
                        areaStyle: {
                            color: 'rgba(66, 165, 245, 0.3)',
                        },
                        lineStyle: {
                            color: '#42a5f5',
                            width: 2,
                        },
                        itemStyle: {
                            color: '#42a5f5',
                        },
                    },
                ],
            },
        ],
    };

    radarChart.setOption(option);
};

// 初始化参数分布对比图
const initParamDistributionChart = () => {
    if (!paramDistributionChartRef.value) return;

    paramDistributionChart = echarts.init(paramDistributionChartRef.value);

    const params = props.data?.mixProportionParams || {};
    const similarSamples = apiResult.value.similar_samples || [];

    // 准备数据：当前配比 vs 相似样本平均值
    const paramKeys = [
        'cement',
        'water',
        'blast_furnace_slag',
        'fly_ash',
        'superplasticizer',
        'coarse_aggregate',
        'fine_aggregate',
    ];

    const paramNames = ['水泥', '水', '矿渣', '粉煤灰', '减水剂', '粗骨料', '细骨料'];

    const currentValues = paramKeys.map((key) => params[key] || 0);

    const similarAvgValues = paramKeys.map((key) => {
        if (similarSamples.length === 0) return 0;
        const sum = similarSamples.reduce(
            (acc: number, sample: any) => acc + (sample[key] || 0),
            0
        );
        return sum / similarSamples.length;
    });

    const option: EChartsOption = {
        title: {
            text: '当前配比 vs 相似样本平均',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
        },
        legend: {
            data: ['当前配比', '相似样本平均'],
            top: '10%',
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '10%',
            top: '20%',
        },
        xAxis: {
            type: 'category',
            data: paramNames,
            axisLabel: {
                rotate: 45,
                fontSize: 11,
            },
        },
        yAxis: {
            type: 'value',
            name: '用量 (kg/m³)',
            axisLabel: {
                formatter: (value: number) => value.toFixed(2),
            },
        },
        series: [
            {
                name: '当前配比',
                type: 'bar',
                data: currentValues,
                itemStyle: {
                    color: '#42a5f5',
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => params.value.toFixed(2),
                    fontSize: 10,
                },
            },
            {
                name: '相似样本平均',
                type: 'bar',
                data: similarAvgValues,
                itemStyle: {
                    color: '#66bb6a',
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => params.value.toFixed(2),
                    fontSize: 10,
                },
            },
        ],
    };

    paramDistributionChart.setOption(option);
};

// 初始化所有图表
const initAllCharts = async () => {
    await nextTick();
    initFactorWeightChart();
    initConfidenceChart();
    initRadarChart();
    initParamDistributionChart();
};

// 窗口resize时重新调整图表大小
const handleResize = () => {
    factorWeightChart?.resize();
    confidenceChart?.resize();
    radarChart?.resize();
    paramDistributionChart?.resize();
};

// 生命周期
onMounted(() => {
    initAllCharts();
    window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onBeforeUnmount(() => {
    factorWeightChart?.dispose();
    confidenceChart?.dispose();
    radarChart?.dispose();
    paramDistributionChart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
// 使用Vuetify默认样式
.interpretation-text {
    line-height: 1.8;
}
</style>
