<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">反向推演结果 - 优化配合比方案</span>
            <div>
                <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack" class="mr-2">
                    返回修改
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-6">
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

            <!-- 配比雷达图对比 -->
            <v-card class="mb-6">
                <v-card-text>
                    <div ref="radarChartRef" style="width: 100%; height: 500px"></div>
                </v-card-text>
            </v-card>

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

            <!-- 操作按钮 -->
            <div class="d-flex justify-space-between mt-6">
                <v-btn
                    color="grey"
                    variant="outlined"
                    prepend-icon="mdi-arrow-left"
                    @click="goBack"
                >
                    返回修改参数
                </v-btn>
                <v-btn color="primary" prepend-icon="mdi-check-circle" @click="showConfirmDialog">
                    应用此优化方案
                </v-btn>
            </div>
        </v-card-text>
    </v-card>

    <!-- 确认对话框 -->
    <v-dialog v-model="confirmDialog" max-width="500">
        <v-card>
            <v-card-title class="d-flex align-center bg-primary">
                <v-icon class="mr-2">mdi-help-circle</v-icon>
                <span>确认应用优化方案</span>
            </v-card-title>

            <v-card-text class="pt-6">
                <v-alert type="info" variant="tonal" class="mb-4">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    应用此优化方案后，将自动跳转到<strong>正向推演</strong>页面，并使用优化后的配合比参数进行验证。
                </v-alert>

                <div class="text-body-1">
                    <div class="mb-3">
                        <strong>优化后的强度：</strong>
                        <span class="text-h6 text-primary ml-2">
                            {{ formatValue(optimizeResult.predicted_strength) }} MPa
                        </span>
                    </div>
                    <div>
                        <strong>强度提升：</strong>
                        <span class="text-h6 text-success ml-2">
                            +{{ formatValue(optimizeResult.improvement_percent) }}%
                        </span>
                    </div>
                </div>
            </v-card-text>

            <v-card-actions class="px-6 pb-4">
                <v-spacer></v-spacer>
                <v-btn color="grey" variant="text" @click="confirmDialog = false"> 取消 </v-btn>
                <v-btn color="primary" variant="flat" @click="applyOptimization">
                    <v-icon class="mr-1">mdi-check</v-icon>
                    确认应用
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { useConcreteStore } from '@/stores/useConcreteStore';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// 获取store和router
const concreteStore = useConcreteStore();
const router = useRouter();

// ECharts实例引用
const strengthComparisonChartRef = ref<HTMLDivElement>();
const paramComparisonChartRef = ref<HTMLDivElement>();
const radarChartRef = ref<HTMLDivElement>();

let strengthComparisonChart: echarts.ECharts | null = null;
let paramComparisonChart: echarts.ECharts | null = null;
let radarChart: echarts.ECharts | null = null;

// 优化结果（从store读取）
const optimizeResult = computed(() => concreteStore.reverseData || {});

// 确认对话框状态
const confirmDialog = ref(false);

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

// 返回上一步
const goBack = () => {
    router.push('/concrete-design/reverse-step1');
};

// 显示确认对话框
const showConfirmDialog = () => {
    confirmDialog.value = true;
};

// 应用优化
const applyOptimization = () => {
    console.log('应用优化方案:', optimizeResult.value.optimized_config);

    // 关闭对话框
    confirmDialog.value = false;

    // 将优化后的配置应用到正向推演的forwardData
    const optimizedConfig = optimizeResult.value.optimized_config;
    concreteStore.setForwardData({
        mixProportionParams: {
            cement: optimizedConfig.cement || 0,
            blast_furnace_slag: optimizedConfig.blast_furnace_slag || 0,
            fly_ash: optimizedConfig.fly_ash || 0,
            water: optimizedConfig.water || 0,
            superplasticizer: optimizedConfig.superplasticizer || 0,
            coarse_aggregate: optimizedConfig.coarse_aggregate || 0,
            fine_aggregate: optimizedConfig.fine_aggregate || 0,
            age: optimizedConfig.age || 28,
        },
        analysisResult: null,
    });

    // 跳转到正向推演页面（检测实验室）
    router.push('/concrete-design/detection');
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

    const option: any = {
        backgroundColor: '#1e1e1e',
        title: {
            text: '配比参数雷达对比',
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#e0e0e0',
            },
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: '#666',
            textStyle: {
                color: '#e0e0e0',
            },
        },
        legend: {
            data: ['基准配比', '优化配比'],
            top: '10%',
            textStyle: {
                color: '#e0e0e0',
            },
        },
        radar: {
            indicator: indicators,
            center: ['50%', '55%'],
            radius: '65%',
            name: {
                textStyle: {
                    color: '#e0e0e0',
                    fontSize: 13,
                },
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)'],
                },
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
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
                        lineStyle: {
                            color: '#42a5f5',
                            width: 2,
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
                        lineStyle: {
                            color: '#66bb6a',
                            width: 2,
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

// 初始化所有图表
const initAllCharts = async () => {
    await nextTick();
    initStrengthComparisonChart();
    initParamComparisonChart();
    initRadarChart();
};

// 窗口resize时重新调整图表大小
const handleResize = () => {
    strengthComparisonChart?.resize();
    paramComparisonChart?.resize();
    radarChart?.resize();
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
    radarChart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
// 使用Vuetify默认样式
</style>
