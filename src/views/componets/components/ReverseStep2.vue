<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">反向推演结果 - 优化配合比方案</span>
            <div>
                <v-btn
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="emit('back')"
                    class="mr-2"
                >
                    返回修改
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-6">
            <!-- 强度优化对比图表 -->
            <v-card class="mb-6">
                <v-card-text>
                    <div ref="strengthComparisonChartRef" style="width: 100%; height: 400px"></div>
                </v-card-text>
            </v-card>

            <!-- 配比参数对比图表 -->
            <v-card class="mb-6">
                <v-card-text>
                    <div ref="paramComparisonChartRef" style="width: 100%; height: 400px"></div>
                </v-card-text>
            </v-card>

            <!-- 调整详情图表 -->
            <v-card class="mb-6" v-if="optimizeResult.adjustments?.length > 0">
                <v-card-text>
                    <div ref="adjustmentDetailsChartRef" style="width: 100%; height: 400px"></div>
                </v-card-text>
            </v-card>

            <!-- 配比雷达图对比 -->
            <v-card class="mb-6">
                <v-card-text>
                    <div ref="radarChartRef" style="width: 100%; height: 500px"></div>
                </v-card-text>
            </v-card>

            <!-- 成分占比对比 -->
            <v-row class="mb-6">
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-title class="text-center">基准配比成分占比</v-card-title>
                        <v-card-text>
                            <div ref="basePieChartRef" style="width: 100%; height: 400px"></div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-title class="text-center">优化配比成分占比</v-card-title>
                        <v-card-text>
                            <div
                                ref="optimizedPieChartRef"
                                style="width: 100%; height: 400px"
                            ></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- 详细数据对比表格 -->
            <v-card class="mb-6">
                <v-card-title>
                    <v-icon class="mr-2">mdi-table</v-icon>
                    详细数据对比
                </v-card-title>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left">参数名称</th>
                                <th class="text-right">基准值</th>
                                <th class="text-right">优化值</th>
                                <th class="text-right">变化量</th>
                                <th class="text-right">变化率</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="key in paramKeys" :key="key">
                                <td>
                                    <v-icon size="small" class="mr-2">{{
                                        paramLabels[key]?.icon
                                    }}</v-icon>
                                    {{ paramLabels[key]?.label }}
                                </td>
                                <td class="text-right">
                                    {{ formatValue(optimizeResult.base_config?.[key]) }}
                                    {{ paramLabels[key]?.unit }}
                                </td>
                                <td class="text-right">
                                    {{ formatValue(optimizeResult.optimized_config?.[key]) }}
                                    {{ paramLabels[key]?.unit }}
                                </td>
                                <td class="text-right" :class="getChangeClass(key)">
                                    {{ formatChange(key) }}
                                </td>
                                <td class="text-right" :class="getChangeClass(key)">
                                    {{ formatChangePercent(key) }}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="font-weight-bold">
                                <td>混凝土强度</td>
                                <td class="text-right">
                                    {{ formatValue(optimizeResult.base_strength) }} MPa
                                </td>
                                <td class="text-right">
                                    {{ formatValue(optimizeResult.predicted_strength) }} MPa
                                </td>
                                <td class="text-right text-success">
                                    {{
                                        formatValue(
                                            optimizeResult.predicted_strength -
                                                optimizeResult.base_strength
                                        )
                                    }}
                                    MPa
                                </td>
                                <td class="text-right text-success">
                                    +{{ formatValue(optimizeResult.improvement_percent) }}%
                                </td>
                            </tr>
                        </tfoot>
                    </v-table>
                </v-card-text>
            </v-card>

            <!-- 优化建议 -->
            <v-card class="mb-6">
                <v-card-title>
                    <v-icon class="mr-2">mdi-lightbulb-on-outline</v-icon>
                    优化建议
                </v-card-title>
                <v-card-text class="pa-4">
                    <div class="text-body-1" style="white-space: pre-line">
                        {{ optimizeResult.recommendations || '暂无建议' }}
                    </div>
                </v-card-text>
            </v-card>

            <!-- 操作按钮 -->
            <div class="d-flex justify-space-between mt-6">
                <v-btn
                    color="grey"
                    variant="outlined"
                    prepend-icon="mdi-arrow-left"
                    @click="emit('back')"
                >
                    返回修改参数
                </v-btn>
                <v-btn color="primary" prepend-icon="mdi-check-circle" @click="applyOptimization">
                    应用此优化方案
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { OptimizeResponse } from '@/api/predict';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    data: OptimizeResponse;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    back: [];
    apply: [config: any];
}>();

// ECharts实例引用
const strengthComparisonChartRef = ref<HTMLDivElement>();
const paramComparisonChartRef = ref<HTMLDivElement>();
const adjustmentDetailsChartRef = ref<HTMLDivElement>();
const radarChartRef = ref<HTMLDivElement>();
const basePieChartRef = ref<HTMLDivElement>();
const optimizedPieChartRef = ref<HTMLDivElement>();

let strengthComparisonChart: echarts.ECharts | null = null;
let paramComparisonChart: echarts.ECharts | null = null;
let adjustmentDetailsChart: echarts.ECharts | null = null;
let radarChart: echarts.ECharts | null = null;
let basePieChart: echarts.ECharts | null = null;
let optimizedPieChart: echarts.ECharts | null = null;

// 优化结果
const optimizeResult = computed(() => props.data);

// 参数标签映射
const paramLabels: Record<string, { label: string; unit: string; icon: string }> = {
    cement: { label: '水泥用量', unit: 'kg/m³', icon: 'mdi-package-variant-closed' },
    blast_furnace_slag: { label: '高炉矿渣', unit: 'kg/m³', icon: 'mdi-cube-outline' },
    fly_ash: { label: '粉煤灰', unit: 'kg/m³', icon: 'mdi-grain' },
    water: { label: '水用量', unit: 'kg/m³', icon: 'mdi-water' },
    superplasticizer: { label: '高效减水剂', unit: 'kg/m³', icon: 'mdi-flask' },
    coarse_aggregate: { label: '粗骨料', unit: 'kg/m³', icon: 'mdi-texture-box' },
    fine_aggregate: { label: '细骨料', unit: 'kg/m³', icon: 'mdi-grain' },
    age: { label: '龄期', unit: '天', icon: 'mdi-calendar' },
};

// 参数键列表
const paramKeys = [
    'cement',
    'blast_furnace_slag',
    'fly_ash',
    'water',
    'superplasticizer',
    'coarse_aggregate',
    'fine_aggregate',
    'age',
];

// 格式化数值
const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return num.toFixed(2);
};

// 格式化变化量
const formatChange = (key: string): string => {
    const baseValue = optimizeResult.value.base_config?.[key];
    const optimizedValue = optimizeResult.value.optimized_config?.[key];

    if (baseValue === undefined || optimizedValue === undefined) return '-';

    const change = Number(optimizedValue) - Number(baseValue);
    if (isNaN(change)) return '-';

    return `${change > 0 ? '+' : ''}${change.toFixed(2)}`;
};

// 格式化变化百分比
const formatChangePercent = (key: string): string => {
    const baseValue = optimizeResult.value.base_config?.[key];
    const optimizedValue = optimizeResult.value.optimized_config?.[key];

    if (baseValue === undefined || optimizedValue === undefined || baseValue === 0) return '-';

    const change = Number(optimizedValue) - Number(baseValue);
    const changePercent = (change / Number(baseValue)) * 100;

    if (isNaN(changePercent)) return '-';

    return `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
};

// 获取变化的CSS类
const getChangeClass = (key: string): string => {
    const baseValue = optimizeResult.value.base_config?.[key];
    const optimizedValue = optimizeResult.value.optimized_config?.[key];

    if (baseValue === undefined || optimizedValue === undefined) return '';

    const change = Number(optimizedValue) - Number(baseValue);

    if (change > 0) return 'text-success';
    if (change < 0) return 'text-warning';
    return '';
};

// 应用优化
const applyOptimization = () => {
    console.log('应用优化方案:', optimizeResult.value.optimized_config);
    emit('apply', optimizeResult.value.optimized_config);
    // 可以跳转到正向推演，使用优化后的配比进行验证
};

// 初始化强度对比图表
const initStrengthComparisonChart = () => {
    if (!strengthComparisonChartRef.value) return;

    strengthComparisonChart = echarts.init(strengthComparisonChartRef.value);

    const baseStrength = optimizeResult.value.base_strength || 0;
    const predictedStrength = optimizeResult.value.predicted_strength || 0;
    const improvementPercent = optimizeResult.value.improvement_percent || 0;

    const option: EChartsOption = {
        title: {
            text: '强度优化对比',
            left: 'center',
            textStyle: {
                fontSize: 18,
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
                return `
                    <div style="padding: 8px;">
                        <strong>${data.name}</strong><br/>
                        强度: <strong>${data.value.toFixed(2)} MPa</strong><br/>
                        ${data.seriesIndex === 1 ? `提升: <strong>+${improvementPercent.toFixed(2)}%</strong>` : ''}
                    </div>
                `;
            },
        },
        legend: {
            data: ['基准强度', '优化后强度'],
            top: '10%',
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '10%',
            top: '25%',
        },
        xAxis: {
            type: 'category',
            data: ['强度对比'],
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
                name: '基准强度',
                type: 'bar',
                data: [baseStrength],
                itemStyle: {
                    color: '#42a5f5',
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => `${params.value.toFixed(2)} MPa`,
                    fontSize: 14,
                    fontWeight: 'bold',
                },
                barWidth: '30%',
            },
            {
                name: '优化后强度',
                type: 'bar',
                data: [predictedStrength],
                itemStyle: {
                    color: '#4caf50',
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) =>
                        `${params.value.toFixed(2)} MPa\n(+${improvementPercent.toFixed(2)}%)`,
                    fontSize: 14,
                    fontWeight: 'bold',
                },
                barWidth: '30%',
            },
        ],
    };

    strengthComparisonChart.setOption(option);
};

// 初始化参数对比图表
const initParamComparisonChart = () => {
    if (!paramComparisonChartRef.value) return;

    paramComparisonChart = echarts.init(paramComparisonChartRef.value);

    const base = optimizeResult.value.base_config || {};
    const optimized = optimizeResult.value.optimized_config || {};

    const paramKeys = [
        'cement',
        'blast_furnace_slag',
        'fly_ash',
        'water',
        'superplasticizer',
        'coarse_aggregate',
        'fine_aggregate',
    ];

    const paramNames = paramKeys.map((key) => paramLabels[key]?.label || key);
    const baseValues = paramKeys.map((key) => base[key] || 0);
    const optimizedValues = paramKeys.map((key) => optimized[key] || 0);

    const option: EChartsOption = {
        title: {
            text: '配比参数优化对比',
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params: any) => {
                const name = params[0].axisValue;
                const baseValue = params[0].value;
                const optimizedValue = params[1].value;
                const change = optimizedValue - baseValue;
                const changePercent =
                    baseValue !== 0 ? ((change / baseValue) * 100).toFixed(2) : '0.00';
                return `
                    <div style="padding: 8px;">
                        <strong>${name}</strong><br/>
                        基准: <strong>${baseValue.toFixed(2)}</strong><br/>
                        优化: <strong>${optimizedValue.toFixed(2)}</strong><br/>
                        变化: <strong style="color: ${change >= 0 ? '#4caf50' : '#ff9800'}">${change > 0 ? '+' : ''}${change.toFixed(2)} (${change > 0 ? '+' : ''}${changePercent}%)</strong>
                    </div>
                `;
            },
        },
        legend: {
            data: ['基准配比', '优化配比'],
            top: '10%',
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
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
                name: '基准配比',
                type: 'bar',
                data: baseValues,
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
                name: '优化配比',
                type: 'bar',
                data: optimizedValues,
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

    paramComparisonChart.setOption(option);
};

// 初始化调整详情图表（瀑布图）
const initAdjustmentDetailsChart = () => {
    if (!adjustmentDetailsChartRef.value) return;

    adjustmentDetailsChart = echarts.init(adjustmentDetailsChartRef.value);

    const adjustments = optimizeResult.value.adjustments || [];

    if (adjustments.length === 0) return;

    const names = adjustments.map((adj: any) => paramLabels[adj.factor]?.label || adj.factor);
    const changes = adjustments.map((adj: any) => adj.change || 0);
    const changePercents = adjustments.map((adj: any) => adj.change_percent || 0);

    const option: EChartsOption = {
        title: {
            text: '参数调整详情',
            left: 'center',
            textStyle: {
                fontSize: 18,
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
                const adj = adjustments[index];
                return `
                    <div style="padding: 8px;">
                        <strong>${names[index]}</strong><br/>
                        原始值: <strong>${adj.original_value?.toFixed(2)}</strong><br/>
                        优化值: <strong>${adj.optimized_value?.toFixed(2)}</strong><br/>
                        变化量: <strong style="color: ${data.value >= 0 ? '#4caf50' : '#ff9800'}">${data.value > 0 ? '+' : ''}${data.value.toFixed(2)}</strong><br/>
                        变化率: <strong>${changePercents[index] > 0 ? '+' : ''}${changePercents[index].toFixed(2)}%</strong>
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
            name: '变化量',
            axisLabel: {
                formatter: (value: number) => value.toFixed(2),
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
                name: '参数变化',
                type: 'bar',
                data: changes.map((change: number) => ({
                    value: change,
                    itemStyle: {
                        color: change >= 0 ? '#4caf50' : '#ff9800',
                    },
                })),
                label: {
                    show: true,
                    position: 'right',
                    formatter: (params: any) => {
                        const index = params.dataIndex;
                        return `${params.value > 0 ? '+' : ''}${params.value.toFixed(2)} (${
                            changePercents[index] > 0 ? '+' : ''
                        }${changePercents[index].toFixed(2)}%)`;
                    },
                    fontSize: 11,
                },
                barWidth: '60%',
            },
        ],
    };

    adjustmentDetailsChart.setOption(option);
};

// 初始化雷达图
const initRadarChart = () => {
    if (!radarChartRef.value) return;

    radarChart = echarts.init(radarChartRef.value);

    const base = optimizeResult.value.base_config || {};
    const optimized = optimizeResult.value.optimized_config || {};

    // 定义雷达图的维度
    const indicators = [
        { name: '水泥', max: 600 },
        { name: '高炉矿渣', max: 200 },
        { name: '粉煤灰', max: 200 },
        { name: '水', max: 250 },
        { name: '减水剂', max: 15 },
        { name: '粗骨料', max: 1300 },
        { name: '细骨料', max: 900 },
    ];

    const baseData = [
        base.cement || 0,
        base.blast_furnace_slag || 0,
        base.fly_ash || 0,
        base.water || 0,
        base.superplasticizer || 0,
        base.coarse_aggregate || 0,
        base.fine_aggregate || 0,
    ];

    const optimizedData = [
        optimized.cement || 0,
        optimized.blast_furnace_slag || 0,
        optimized.fly_ash || 0,
        optimized.water || 0,
        optimized.superplasticizer || 0,
        optimized.coarse_aggregate || 0,
        optimized.fine_aggregate || 0,
    ];

    const option: EChartsOption = {
        title: {
            text: '配比参数雷达对比',
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'item',
        },
        legend: {
            data: ['基准配比', '优化配比'],
            top: '10%',
        },
        radar: {
            indicator: indicators,
            center: ['50%', '55%'],
            radius: '65%',
        },
        series: [
            {
                name: '配比对比',
                type: 'radar',
                data: [
                    {
                        value: baseData,
                        name: '基准配比',
                        itemStyle: {
                            color: '#42a5f5',
                        },
                        areaStyle: {
                            color: 'rgba(66, 165, 245, 0.3)',
                        },
                    },
                    {
                        value: optimizedData,
                        name: '优化配比',
                        itemStyle: {
                            color: '#66bb6a',
                        },
                        areaStyle: {
                            color: 'rgba(102, 187, 106, 0.3)',
                        },
                    },
                ],
            },
        ],
    };

    radarChart.setOption(option);
};

// 初始化基准配比饼图
const initBasePieChart = () => {
    if (!basePieChartRef.value) return;

    basePieChart = echarts.init(basePieChartRef.value);

    const base = optimizeResult.value.base_config || {};

    const data = [
        { value: base.cement || 0, name: '水泥' },
        { value: base.blast_furnace_slag || 0, name: '高炉矿渣' },
        { value: base.fly_ash || 0, name: '粉煤灰' },
        { value: base.water || 0, name: '水' },
        { value: base.superplasticizer || 0, name: '减水剂' },
        { value: base.coarse_aggregate || 0, name: '粗骨料' },
        { value: base.fine_aggregate || 0, name: '细骨料' },
    ].filter((item) => item.value > 0); // 过滤掉值为0的项

    const option: EChartsOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} kg/m³ ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle',
        },
        series: [
            {
                name: '基准配比',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                },
                data: data,
            },
        ],
    };

    basePieChart.setOption(option);
};

// 初始化优化配比饼图
const initOptimizedPieChart = () => {
    if (!optimizedPieChartRef.value) return;

    optimizedPieChart = echarts.init(optimizedPieChartRef.value);

    const optimized = optimizeResult.value.optimized_config || {};

    const data = [
        { value: optimized.cement || 0, name: '水泥' },
        { value: optimized.blast_furnace_slag || 0, name: '高炉矿渣' },
        { value: optimized.fly_ash || 0, name: '粉煤灰' },
        { value: optimized.water || 0, name: '水' },
        { value: optimized.superplasticizer || 0, name: '减水剂' },
        { value: optimized.coarse_aggregate || 0, name: '粗骨料' },
        { value: optimized.fine_aggregate || 0, name: '细骨料' },
    ].filter((item) => item.value > 0); // 过滤掉值为0的项

    const option: EChartsOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} kg/m³ ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle',
        },
        series: [
            {
                name: '优化配比',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                },
                data: data,
            },
        ],
    };

    optimizedPieChart.setOption(option);
};

// 初始化所有图表
const initAllCharts = async () => {
    await nextTick();
    initStrengthComparisonChart();
    initParamComparisonChart();
    initAdjustmentDetailsChart();
    initRadarChart();
    initBasePieChart();
    initOptimizedPieChart();
};

// 窗口resize时重新调整图表大小
const handleResize = () => {
    strengthComparisonChart?.resize();
    paramComparisonChart?.resize();
    adjustmentDetailsChart?.resize();
    radarChart?.resize();
    basePieChart?.resize();
    optimizedPieChart?.resize();
};

// 生命周期
onMounted(() => {
    initAllCharts();
    window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onBeforeUnmount(() => {
    strengthComparisonChart?.dispose();
    paramComparisonChart?.dispose();
    adjustmentDetailsChart?.dispose();
    radarChart?.dispose();
    basePieChart?.dispose();
    optimizedPieChart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
// 使用Vuetify默认样式
</style>
