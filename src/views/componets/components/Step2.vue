<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土质量可视化分析</span>
            <div>
                <v-btn
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="emit('back')"
                    class="mr-2"
                >
                    返回分析
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

        <v-card-text>
            <!-- 图表1：水灰比与强度关系分析 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-blue-grey-lighten-5">
                    <v-icon class="mr-2">mdi-water</v-icon>
                    水灰比与强度关系分析
                </v-card-title>
                <v-card-text>
                    <div id="waterCementChart" style="width: 100%; height: 400px"></div>

                    <!-- 结论 -->
                    <v-alert type="info" variant="tonal" class="mt-4">
                        <v-alert-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-chart-line</v-icon>
                            分析结论
                        </v-alert-title>
                        <div class="conclusion-text">
                            <p>
                                <strong>本报告数据点：</strong>水灰比
                                {{ data.water_cement_ratio }}，{{
                                    data.predicted_strength ? '推演' : '实测'
                                }}强度 {{ displayStrength }} MPa
                                <v-chip
                                    v-if="data.predicted_strength"
                                    size="x-small"
                                    color="success"
                                    class="ml-2"
                                >
                                    <v-icon size="x-small" class="mr-1">mdi-brain</v-icon>
                                    AI推演
                                </v-chip>
                            </p>
                            <p>
                                <strong>理论分析：</strong
                                >根据鲍罗米公式，混凝土强度与水灰比成反比关系。当前水灰比{{
                                    getWaterCementRatioLevel(data.water_cement_ratio)
                                }}，{{ getWaterCementRatioAdvice(data.water_cement_ratio) }}
                            </p>
                            <p>
                                <strong>建议：</strong
                                >{{
                                    getWaterCementOptimization(
                                        data.water_cement_ratio,
                                        data.actual_strength,
                                        getDesignStrength(data.strength_grade)
                                    )
                                }}
                            </p>
                        </div>
                    </v-alert>
                </v-card-text>
            </v-card>

            <!-- 图表2：养护条件对强度发展的影响 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-green-lighten-5">
                    <v-icon class="mr-2">mdi-calendar-clock</v-icon>
                    养护龄期强度发展曲线
                </v-card-title>
                <v-card-text>
                    <div id="curingChart" style="width: 100%; height: 400px"></div>

                    <!-- 结论 -->
                    <v-alert type="success" variant="tonal" class="mt-4">
                        <v-alert-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-chart-timeline-variant</v-icon>
                            分析结论
                        </v-alert-title>
                        <div class="conclusion-text">
                            <p><strong>养护条件：</strong>{{ data.curing_condition }}</p>
                            <p>
                                <strong>强度发展：</strong>28天{{
                                    data.predicted_strength ? '推演' : '实测'
                                }}强度 {{ displayStrength }} MPa，达到设计强度
                                {{ getDesignStrength(data.strength_grade) }} MPa 的
                                {{
                                    getStrengthPercentage(
                                        displayStrength,
                                        getDesignStrength(data.strength_grade)
                                    )
                                }}%
                            </p>
                            <p>
                                <strong>评价：</strong
                                >{{
                                    getCuringQualityComment(
                                        data.curing_condition,
                                        data.actual_strength,
                                        getDesignStrength(data.strength_grade)
                                    )
                                }}
                            </p>
                            <p>
                                <strong>建议：</strong>{{ getCuringAdvice(data.curing_condition) }}
                            </p>
                        </div>
                    </v-alert>
                </v-card-text>
            </v-card>

            <!-- 图表3：配合比影响因素雷达图 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-orange-lighten-5">
                    <v-icon class="mr-2">mdi-chart-box-multiple-outline</v-icon>
                    配合比综合评价雷达图
                </v-card-title>
                <v-card-text>
                    <div id="radarChart" style="width: 100%; height: 400px"></div>

                    <!-- 结论 -->
                    <v-alert type="warning" variant="tonal" class="mt-4">
                        <v-alert-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-star-circle</v-icon>
                            分析结论
                        </v-alert-title>
                        <div class="conclusion-text">
                            <p><strong>配合比评分：</strong></p>
                            <ul>
                                <li>
                                    水灰比控制：{{ getMixRatioScore(data.water_cement_ratio) }}分 -
                                    {{ getMixRatioComment(data.water_cement_ratio) }}
                                </li>
                                <li>
                                    水泥质量：{{ getCementScore(data.cement_type) }}分 -
                                    {{ data.cement_type }}
                                </li>
                                <li>
                                    骨料质量：{{ getAggregateScore(data.aggregate_info) }}分 -
                                    {{ getAggregateComment(data.aggregate_info) }}
                                </li>
                                <li>
                                    外加剂使用：{{ getAdmixtureScore(data.admixture) }}分 -
                                    {{ data.admixture }}
                                </li>
                            </ul>
                            <p><strong>综合评价：</strong>{{ getOverallMixComment(data) }}</p>
                            <p><strong>优化建议：</strong>{{ getOptimizationAdvice(data) }}</p>
                        </div>
                    </v-alert>
                </v-card-text>
            </v-card>

            <!-- 图表4：混凝土质量神经网络权重图 -->
            <v-card class="mb-6" elevation="2">
                <v-card-title class="bg-purple-lighten-5">
                    <v-icon class="mr-2">mdi-brain</v-icon>
                    混凝土质量影响因素神经网络权重图
                </v-card-title>
                <v-card-text>
                    <div id="neuralNetworkChart" style="width: 100%; height: 600px"></div>

                    <!-- 结论 -->
                    <v-alert type="info" variant="tonal" class="mt-4">
                        <v-alert-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-network</v-icon>
                            神经网络分析
                        </v-alert-title>
                        <div class="conclusion-text">
                            <p>
                                <strong>模型说明：</strong
                                >该神经网络图展示了7个关键因素对混凝土强度的影响权重。线条粗细代表权重大小，颜色深浅代表当前因素的质量评分。
                            </p>
                            <p><strong>权重排序（由高到低）：</strong></p>
                            <ol>
                                <li>水泥用量(40-45%) - "胶凝老大"，是决定强度的首要因素</li>
                                <li>水灰比(25-30%) - 强度"生命线"，每降0.1强度提升5-7MPa</li>
                                <li>高效减水剂(10-12%) - 保住低w/c又可施工，间接抬高强度</li>
                                <li>养护成熟度(8-10%) - 温度每低5°C，相同龄期强度低5%左右</li>
                                <li>粉煤灰/矿渣(5-7%) - 早期稀释效应，后期微粉填充+二次水化</li>
                                <li>粗骨料(3-5%) - 提供骨架，但自身强度远高于界面</li>
                                <li>细骨料&砂率(2-4%) - 主要影响工作性，对强度边际贡献最小</li>
                            </ol>
                            <p>
                                <strong>优化策略：</strong
                                >优先优化权重较高的因素（水泥用量、水灰比、减水剂），可获得最大的强度提升效果，投入产出比最高。
                            </p>
                        </div>
                    </v-alert>
                </v-card-text>
            </v-card>

            <!-- 质量报告总结 -->
            <v-card elevation="3" class="report-summary">
                <v-card-title class="bg-gradient">
                    <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                    质量评估报告总结
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="summary-section">
                                <h4 class="mb-3">
                                    <v-icon size="small" class="mr-1">mdi-clipboard-check</v-icon>
                                    基本信息
                                </h4>
                                <div class="summary-item">
                                    <span class="label">报告编号：</span>
                                    <span class="value">{{ data.reportNumber }}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">工程名称：</span>
                                    <span class="value">{{ data.projectName }}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">检测日期：</span>
                                    <span class="value">{{ data.testDate }}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">检测标准：</span>
                                    <span class="value">{{ data.test_method }}</span>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="summary-section">
                                <h4 class="mb-3">
                                    <v-icon size="small" class="mr-1">mdi-chart-line</v-icon>
                                    强度指标
                                </h4>
                                <div class="summary-item highlight">
                                    <span class="label">设计强度等级：</span>
                                    <span class="value">
                                        <v-chip color="primary" size="small">{{
                                            data.strength_grade
                                        }}</v-chip>
                                    </span>
                                </div>
                                <div class="summary-item highlight">
                                    <span class="label">{{
                                        data.predicted_strength ? '推演强度：' : '实测强度：'
                                    }}</span>
                                    <span class="value">
                                        <span class="text-h6 text-success font-weight-bold">{{
                                            displayStrength
                                        }}</span>
                                        MPa
                                        <v-chip
                                            v-if="data.predicted_strength"
                                            size="x-small"
                                            color="success"
                                            class="ml-2"
                                        >
                                            AI推演
                                        </v-chip>
                                    </span>
                                </div>
                                <div class="summary-item highlight">
                                    <span class="label">达标率：</span>
                                    <span class="value">
                                        <span
                                            :class="
                                                getStrengthPercentage(
                                                    displayStrength,
                                                    getDesignStrength(data.strength_grade)
                                                ) >= 100
                                                    ? 'text-success'
                                                    : 'text-error'
                                            "
                                        >
                                            {{
                                                getStrengthPercentage(
                                                    displayStrength,
                                                    getDesignStrength(data.strength_grade)
                                                )
                                            }}%
                                        </span>
                                    </span>
                                </div>
                                <div class="summary-item highlight">
                                    <span class="label">检测结论：</span>
                                    <span class="value">
                                        <v-chip
                                            :color="
                                                data.conclusion.includes('优')
                                                    ? 'success'
                                                    : data.conclusion.includes('合格')
                                                      ? 'primary'
                                                      : 'warning'
                                            "
                                            size="small"
                                        >
                                            {{ data.conclusion }}
                                        </v-chip>
                                    </span>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-divider class="my-4"></v-divider>
                            <div class="final-conclusion">
                                <h4 class="mb-3">
                                    <v-icon size="small" class="mr-1">mdi-clipboard-text</v-icon>
                                    最终结论
                                </h4>
                                <p class="conclusion-text">
                                    {{ getFinalConclusion(data) }}
                                </p>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {
    calculateConcreteStrength,
    calculateStrengthDevelopment,
    type ConcreteParameters,
} from '@/utils/concreteStrengthModel';
import * as echarts from 'echarts';
import { computed, nextTick, onMounted, watch } from 'vue';

const props = defineProps<{
    data: any;
}>();

const emit = defineEmits<{
    back: [];
    export: [];
}>();

// 获取推演参数（如果存在）
const concreteParams = computed<ConcreteParameters | null>(() => {
    return props.data.__concreteParams || null;
});

// 使用推演强度或实测强度
const displayStrength = computed(() => {
    return props.data.predicted_strength || props.data.actual_strength;
});

// 获取设计强度数值
const getDesignStrength = (strengthGrade: string): number => {
    const match = strengthGrade?.match(/C(\d+)/);
    return match ? parseInt(match[1]) : 30;
};

// 计算达标率
const getStrengthPercentage = (actual: number, design: number): number => {
    return Math.round((actual / design) * 100);
};

// 初始化图表
const initCharts = () => {
    nextTick(() => {
        initWaterCementChart();
        initCuringChart();
        initRadarChart();
        initNeuralNetworkChart();
    });
};

// 图表1：水灰比与强度关系
const initWaterCementChart = () => {
    const chartDom = document.getElementById('waterCementChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 理论曲线数据（基于鲍罗米公式或AI模型）
    const waterCementRatios = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];
    const designStrength = getDesignStrength(props.data.strength_grade);

    let theoreticalStrengths: number[];

    // 如果有推演参数，使用AI模型计算
    if (concreteParams.value) {
        theoreticalStrengths = waterCementRatios.map((ratio) => {
            const params = { ...concreteParams.value!, water_cement_ratio: ratio };
            return calculateConcreteStrength(params);
        });
    } else {
        // 否则使用简化的鲍罗米公式
        theoreticalStrengths = waterCementRatios.map((ratio) => {
            return Math.round((designStrength * 1.5) / (1 + 2.5 * ratio));
        });
    }

    const option = {
        title: {
            text: '水灰比对混凝土强度的影响',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
        },
        legend: {
            data: ['理论强度曲线', '本报告实测点', '设计强度基准线'],
            top: 30,
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'value',
            name: '水灰比',
            min: 0.2,
            max: 0.65,
            axisLabel: {
                formatter: '{value}',
            },
        },
        yAxis: {
            type: 'value',
            name: '抗压强度 (MPa)',
        },
        series: [
            {
                name: '理论强度曲线',
                type: 'line',
                data: waterCementRatios.map((ratio, index) => [ratio, theoreticalStrengths[index]]),
                smooth: true,
                lineStyle: {
                    color: '#5470c6',
                    width: 2,
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                        { offset: 1, color: 'rgba(84, 112, 198, 0.05)' },
                    ]),
                },
            },
            {
                name: '本报告实测点',
                type: 'scatter',
                data: [[props.data.water_cement_ratio, displayStrength.value]],
                symbolSize: 20,
                itemStyle: {
                    color: '#ee6666',
                },
                label: {
                    show: true,
                    formatter: concreteParams.value
                        ? `推演: ${displayStrength.value} MPa\nW/C: ${props.data.water_cement_ratio}`
                        : `实测: ${displayStrength.value} MPa\nW/C: ${props.data.water_cement_ratio}`,
                    position: 'top',
                    color: '#ee6666',
                    fontWeight: 'bold',
                },
            },
            {
                name: '设计强度基准线',
                type: 'line',
                data: [
                    [0.2, designStrength],
                    [0.65, designStrength],
                ],
                lineStyle: {
                    color: '#91cc75',
                    type: 'dashed',
                    width: 2,
                },
            },
        ],
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
};

// 图表2：养护龄期强度发展
const initCuringChart = () => {
    const chartDom = document.getElementById('curingChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const designStrength = getDesignStrength(props.data.strength_grade);

    // 标准养护下的强度发展曲线
    const days = [1, 3, 7, 14, 28];
    let standardCurve: number[];

    // 如果有推演参数，使用AI模型计算强度发展曲线
    if (concreteParams.value) {
        const strengthDevelopment = calculateStrengthDevelopment(
            concreteParams.value,
            displayStrength.value
        );
        standardCurve = strengthDevelopment.map((item) => item.strength);
    } else {
        // 否则使用经验公式
        const actualStrength = props.data.actual_strength;
        standardCurve = days.map((day) => {
            return Math.round((actualStrength * Math.log(day + 1)) / Math.log(29));
        });
    }

    const option = {
        title: {
            text: '混凝土强度发展曲线',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['实际强度发展', '设计强度要求'],
            top: 30,
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: days.map((d) => `${d}天`),
            name: '养护龄期',
        },
        yAxis: {
            type: 'value',
            name: '抗压强度 (MPa)',
        },
        series: [
            {
                name: '实际强度发展',
                type: 'line',
                data: standardCurve,
                smooth: true,
                lineStyle: {
                    color: '#5470c6',
                    width: 3,
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(84, 112, 198, 0.4)' },
                        { offset: 1, color: 'rgba(84, 112, 198, 0.1)' },
                    ]),
                },
                markPoint: {
                    data: [{ type: 'max', name: '28天强度' }],
                },
                markLine: {
                    data: [{ type: 'average', name: '平均值' }],
                },
            },
            {
                name: '设计强度要求',
                type: 'line',
                data: Array(days.length).fill(designStrength),
                lineStyle: {
                    color: '#91cc75',
                    type: 'dashed',
                    width: 2,
                },
            },
        ],
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
};

// 图表3：配合比评价雷达图
const initRadarChart = () => {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    const option = {
        title: {
            left: 'center',
        },
        tooltip: {},
        legend: {
            data: ['实际配合比', '理想配合比'],
            top: 30,
        },
        radar: {
            indicator: [
                { name: '水灰比控制', max: 100 },
                { name: '水泥质量', max: 100 },
                { name: '骨料质量', max: 100 },
                { name: '外加剂效果', max: 100 },
                { name: '养护条件', max: 100 },
            ],
            shape: 'polygon',
            splitNumber: 5,
        },
        series: [
            {
                type: 'radar',
                data: [
                    {
                        value: [
                            getMixRatioScore(props.data.water_cement_ratio),
                            getCementScore(props.data.cement_type),
                            getAggregateScore(props.data.aggregate_info),
                            getAdmixtureScore(props.data.admixture),
                            getCuringScore(props.data.curing_condition),
                        ],
                        name: '实际配合比',
                        itemStyle: { color: '#5470c6' },
                        areaStyle: { opacity: 0.3 },
                    },
                    {
                        value: [95, 90, 95, 85, 95],
                        name: '理想配合比',
                        itemStyle: { color: '#91cc75' },
                        areaStyle: { opacity: 0.1 },
                    },
                ],
            },
        ],
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
};

// 图表4：混凝土质量神经网络权重图
const initNeuralNetworkChart = () => {
    const chartDom = document.getElementById('neuralNetworkChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 7个输入因素及其权重
    const factors = [
        {
            name: '水泥用量',
            weight: 0.425,
            weightRange: '40-45%',
            score: getCementScore(props.data.cement_type),
            rank: 1,
        },
        {
            name: '水灰比',
            weight: 0.275,
            weightRange: '25-30%',
            score: getMixRatioScore(props.data.water_cement_ratio),
            rank: 2,
        },
        {
            name: '高效减水剂',
            weight: 0.11,
            weightRange: '10-12%',
            score: getAdmixtureScore(props.data.admixture),
            rank: 3,
        },
        {
            name: '养护成熟度',
            weight: 0.09,
            weightRange: '8-10%',
            score: getCuringScore(props.data.curing_condition),
            rank: 4,
        },
        { name: '粉煤灰/矿渣', weight: 0.06, weightRange: '5-7%', score: 85, rank: 5 },
        {
            name: '粗骨料',
            weight: 0.04,
            weightRange: '3-5%',
            score: getAggregateScore(props.data.aggregate_info),
            rank: 6,
        },
        { name: '细骨料&砂率', weight: 0.03, weightRange: '2-4%', score: 80, rank: 7 },
    ];

    // 输出节点：混凝土强度
    const outputStrength = displayStrength.value;
    const designStrength = getDesignStrength(props.data.strength_grade);
    const strengthPercentage = getStrengthPercentage(outputStrength, designStrength);

    // 计算节点位置
    const inputX = 100; // 输入层X坐标
    const outputX = 700; // 输出层X坐标
    const startY = 50;
    const ySpacing = 80;

    // 构建节点数据
    const nodes: any[] = [];
    const links: any[] = [];

    // 输入层节点（7个因素）
    factors.forEach((factor, index) => {
        const nodeY = startY + index * ySpacing;

        // 根据评分确定节点颜色（分数越高颜色越绿）
        let nodeColor = '#e74c3c'; // 红色（差）
        if (factor.score >= 90)
            nodeColor = '#27ae60'; // 绿色（优秀）
        else if (factor.score >= 80)
            nodeColor = '#2ecc71'; // 浅绿（良好）
        else if (factor.score >= 70)
            nodeColor = '#f39c12'; // 橙色（中等）
        else if (factor.score >= 60) nodeColor = '#e67e22'; // 深橙（偏低）

        nodes.push({
            name: factor.name,
            x: inputX,
            y: nodeY,
            value: factor.score,
            symbolSize: 50 + factor.weight * 100, // 根据权重调整大小
            itemStyle: {
                color: nodeColor,
                borderColor: '#fff',
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'left',
                formatter: `{name|${factor.name}}\n{weight|权重: ${(factor.weight * 100).toFixed(1)}%}\n{score|评分: ${factor.score}}`,
                rich: {
                    name: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: '#333',
                    },
                    weight: {
                        fontSize: 11,
                        color: '#666',
                    },
                    score: {
                        fontSize: 11,
                        color: nodeColor,
                        fontWeight: 'bold',
                    },
                },
            },
        });

        // 创建连接线（权重越大线越粗）
        links.push({
            source: factor.name,
            target: '混凝土强度',
            lineStyle: {
                width: 2 + factor.weight * 15, // 权重越大线越粗
                color: nodeColor,
                opacity: 0.6,
                curveness: 0.2,
            },
            label: {
                show: true,
                formatter: `${(factor.weight * 100).toFixed(1)}%`,
                fontSize: 10,
                color: '#666',
            },
        });
    });

    // 输出层节点（混凝土强度）
    const outputColor =
        strengthPercentage >= 100 ? '#27ae60' : strengthPercentage >= 95 ? '#f39c12' : '#e74c3c';
    nodes.push({
        name: '混凝土强度',
        x: outputX,
        y: startY + (factors.length / 2 - 0.5) * ySpacing, // 居中对齐
        value: outputStrength,
        symbolSize: 80,
        itemStyle: {
            color: outputColor,
            borderColor: '#fff',
            borderWidth: 3,
        },
        label: {
            show: true,
            position: 'right',
            formatter: `{name|混凝土强度}\n{value|${outputStrength} MPa}\n{design|设计值: ${designStrength} MPa}\n{rate|达标率: ${strengthPercentage}%}`,
            rich: {
                name: {
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: '#333',
                },
                value: {
                    fontSize: 14,
                    color: outputColor,
                    fontWeight: 'bold',
                },
                design: {
                    fontSize: 11,
                    color: '#666',
                },
                rate: {
                    fontSize: 11,
                    color: outputColor,
                    fontWeight: 'bold',
                },
            },
        },
    });

    const option = {
        title: {
            text: '混凝土强度影响因素神经网络模型',
            subtext: '线条粗细代表权重大小，颜色代表质量评分',
            left: 'center',
            top: 10,
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params: any) {
                if (params.dataType === 'node') {
                    if (params.name === '混凝土强度') {
                        return `<b>${params.name}</b><br/>
                                实际强度: ${outputStrength} MPa<br/>
                                设计强度: ${designStrength} MPa<br/>
                                达标率: ${strengthPercentage}%<br/>
                                状态: ${strengthPercentage >= 100 ? '✓ 合格' : '✗ 不合格'}`;
                    }
                    const factor = factors.find((f) => f.name === params.name);
                    return `<b>${params.name}</b><br/>
                            权重: ${factor?.weightRange}<br/>
                            评分: ${factor?.score}/100<br/>
                            排序: 第${factor?.rank}位`;
                } else if (params.dataType === 'edge') {
                    const factor = factors.find((f) => f.name === params.data.source);
                    return `<b>${params.data.source} → ${params.data.target}</b><br/>
                            影响权重: ${(factor!.weight * 100).toFixed(1)}%<br/>
                            贡献值: ${(factor!.weight * factor!.score).toFixed(1)}`;
                }
                return '';
            },
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                type: 'graph',
                layout: 'none',
                coordinateSystem: null,
                symbolSize: 50,
                roam: false,
                label: {
                    show: true,
                },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [0, 10],
                data: nodes,
                links: links,
                lineStyle: {
                    opacity: 0.6,
                    curveness: 0.2,
                },
            },
        ],
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
};

// ============ 基于图片权重区间优化的评分函数 ============
// 权重参考: 水泥用量(40-45%), 水灰比(25-30%), 减水剂(10-12%), 养护(8-10%),
// 粉煤灰/矿渣(5-7%), 粗骨料(3-5%), 细骨料&砂率(2-4%)

/**
 * 水灰比评分 - 权重最高(25-30%)
 * 水灰比是强度"生命线", w/c降0.1强度约升5-7MPa
 */
const getMixRatioScore = (ratio: number): number => {
    if (ratio <= 0.3) return 98; // 极优控制
    if (ratio <= 0.35) return 95; // 优秀
    if (ratio <= 0.4) return 88; // 良好
    if (ratio <= 0.45) return 75; // 中等
    if (ratio <= 0.5) return 60; // 偏高
    if (ratio <= 0.55) return 45; // 过高
    return 30; // 严重影响
};

/**
 * 水泥质量评分 - 权重最高(40-45%)
 * "胶凝老大",每多10kg/m³强度通常涨1-1.5MPa
 */
const getCementScore = (type: string): number => {
    if (type.includes('52.5R')) return 98; // 早强高强
    if (type.includes('52.5')) return 95; // 高强水泥
    if (type.includes('42.5R')) return 90; // 早强普通
    if (type.includes('42.5')) return 85; // 标准普通
    if (type.includes('32.5R')) return 75; // 早强低标号
    if (type.includes('32.5')) return 70; // 低标号
    return 65; // 其他类型
};

/**
 * 骨料质量评分 - 粗骨料权重(3-5%)
 * 提供骨架,但自身强度远高于界面,权重相对小
 */
const getAggregateScore = (info: string): number => {
    let score = 75; // 基础分

    // 含泥量影响 (关键指标)
    const mudMatch = info.match(/含泥量([\d.]+)/);
    if (mudMatch) {
        const mudContent = parseFloat(mudMatch[1]);
        if (mudContent <= 0.3)
            score += 15; // 优秀
        else if (mudContent <= 0.5)
            score += 10; // 良好
        else if (mudContent <= 0.7)
            score += 5; // 中等
        else if (mudContent <= 1.0)
            score += 0; // 合格线
        else score -= 10; // 超标
    }

    // 级配影响
    if (info.includes('连续级配')) score += 5;
    else if (info.includes('二级配')) score += 3;

    // 针片状含量影响
    const needleMatch = info.match(/针片状.*?([\d.]+)%/);
    if (needleMatch && parseFloat(needleMatch[1]) < 5) score += 5;

    return Math.min(Math.max(score, 50), 100);
};

/**
 * 外加剂评分 - 减水剂权重(10-12%)
 * 保住低w/c又可施工,间接抬高强度
 */
const getAdmixtureScore = (admixture: string): number => {
    let score = 65; // 基础分

    // 减水剂类型
    if (admixture.includes('聚羧酸') && admixture.includes('高效'))
        score += 25; // 最优
    else if (admixture.includes('高效减水剂')) score += 20;
    else if (admixture.includes('聚羧酸')) score += 18;
    else if (admixture.includes('减水剂')) score += 12;

    // 掺量判断 (最优1.5-2.5%)
    const dosageMatch = admixture.match(/掺量([\d.]+)%/);
    if (dosageMatch) {
        const dosage = parseFloat(dosageMatch[1]);
        if (dosage >= 1.5 && dosage <= 2.5)
            score += 5; // 最优掺量
        else if (dosage > 2.5) score -= 3; // 过量
    }

    return Math.min(score, 100);
};

/**
 * 养护条件评分 - 养护成熟度权重(8-10%)
 * 温度每低5°C,相同龄期强度低5%左右
 */
const getCuringScore = (condition: string): number => {
    let score = 70; // 基础分

    // 养护方式
    if (condition.includes('标准养护')) {
        score += 25; // 最优条件
        if (condition.includes('98%') || condition.includes('99%')) score += 3; // 超高湿度
    } else if (condition.includes('蒸汽养护')) {
        score += 20; // 早期强度高
    } else if (condition.includes('保温养护')) {
        score += 15; // 冬季良好措施
    } else if (condition.includes('覆盖') || condition.includes('洒水')) {
        score += 10; // 现场一般养护
    } else if (condition.includes('自然')) {
        score += 5; // 条件一般
    }

    // 温度判断
    if (condition.includes('20±'))
        score += 5; // 标准温度
    else if (condition.includes('低温') || condition.match(/-\d+°C/))
        score -= 10; // 低温
    else if (condition.match(/3[0-9]°C/)) score -= 5; // 高温

    return Math.min(Math.max(score, 50), 100);
};

// ============ 基于图片规则优化的评价函数 ============

/**
 * 水灰比等级评价 - 基于权重区间0.25-0.30 (排序第2)
 * 强度"生命线"; w/c降0.1,强度约升5-7 MPa
 */
const getWaterCementRatioLevel = (ratio: number): string => {
    if (ratio <= 0.3) return '极优(强度潜力最高)';
    if (ratio <= 0.35) return '优秀(高强混凝土水平)';
    if (ratio <= 0.4) return '良好(常规高质量)';
    if (ratio <= 0.45) return '中等(标准范围)';
    if (ratio <= 0.5) return '偏高(接近上限)';
    if (ratio <= 0.55) return '过高(严重影响)';
    return '不合格(强度大幅下降)';
};

/**
 * 水灰比建议 - 基于图片第2排序因子的权重分析
 */
const getWaterCementRatioAdvice = (ratio: number): string => {
    if (ratio <= 0.3) {
        return '水灰比控制极优,已达高性能混凝土标准。每降0.1可提升5-7MPa,但当前已接近工艺极限,继续降低需配合高效减水剂。';
    }
    if (ratio <= 0.4) {
        return '水灰比控制良好,处于强度生命线的优质区间。保持当前水平可获得稳定高强度,如需进一步提升可配合优质减水剂降至0.35以下。';
    }
    if (ratio <= 0.45) {
        return '水灰比处于中等水平,强度发展基本正常。建议通过添加聚羧酸高效减水剂(掺量1.5-2.0%)来降低至0.40以下,预计强度可提升10-15%。';
    }
    if (ratio <= 0.5) {
        return '水灰比偏高,已进入强度快速衰减区。必须采取措施:①增加高效减水剂掺量至2.0%以上;②提高水泥强度等级至42.5R或52.5;③降低w/c至0.45以下。';
    }
    return '水灰比严重超标,强度大幅下降!根据鲍罗米公式,当前配比强度损失可达30%以上。紧急建议:①立即调整配合比,将w/c降至0.45以下;②增加水泥用量10kg/m³;③使用高效减水剂。';
};

/**
 * 水灰比优化建议 - 结合实际强度
 */
const getWaterCementOptimization = (ratio: number, actual: number, design: number): string => {
    const strengthRatio = actual / design;
    if (actual >= design * 1.15) {
        return `强度储备充足(超出${((strengthRatio - 1) * 100).toFixed(1)}%),配合比经济合理。可考虑适当提高水灰比至${Math.min(ratio + 0.02, 0.5).toFixed(2)}以降低成本,但需试验验证。`;
    }
    if (actual >= design * 1.05) {
        return `强度满足要求,有一定安全储备。当前配比可保持,如需进一步提升经济性可微调水灰比,但建议保持在${ratio}左右。`;
    }
    if (actual >= design) {
        return `强度刚好达标,安全储备不足。建议降低水灰比至${Math.max(ratio - 0.03, 0.3).toFixed(2)},或提高水泥用量10kg/m³,预计强度可提升3-5MPa。`;
    }
    const shortage = ((1 - strengthRatio) * 100).toFixed(1);
    return `强度不足(低${shortage}%),必须立即调整!①降低水灰比至${Math.max(ratio - 0.05, 0.3).toFixed(2)};②增加水泥用量15-20kg/m³;③提高水泥强度等级或增加减水剂掺量至2.0%。`;
};

/**
 * 水灰比简评 - 用于配合比雷达图
 */
const getMixRatioComment = (ratio: number): string => {
    if (ratio <= 0.3) return '控制极优,高性能混凝土';
    if (ratio <= 0.35) return '控制优秀,适用于高强混凝土';
    if (ratio <= 0.4) return '控制良好,常规优质混凝土';
    if (ratio <= 0.45) return '控制中等,满足常规要求';
    if (ratio <= 0.5) return '控制一般,有待优化';
    return '控制不足,急需改进';
};

/**
 * 骨料质量评价 - 权重3-5% (排序第6)
 * 提供骨架,但自身强度远高于界面,权重相对小
 */
const getAggregateComment = (info: string): string => {
    const mudMatch = info.match(/含泥量([\d.]+)/);
    const mudContent = mudMatch ? parseFloat(mudMatch[1]) : 1.0;

    if (mudContent <= 0.3) {
        return '骨料质量优良(含泥量≤0.3%,对强度影响极小)';
    }
    if (mudContent <= 0.5) {
        return '骨料质量良好(含泥量≤0.5%,满足规范要求)';
    }
    if (mudContent <= 0.7) {
        return '骨料质量合格(含泥量偏高,建议加强清洗)';
    }
    if (mudContent <= 1.0) {
        return '骨料质量一般(含泥量超标,会降低强度3-5%)';
    }
    return '骨料质量较差(含泥量严重超标,强度损失可达10%以上)';
};

/**
 * 养护质量评价 - 权重8-10% (排序第4)
 * 温度每低5°C,相同龄期强度低5%左右
 */
const getCuringQualityComment = (condition: string, actual: number, design: number): string => {
    const rate = (actual / design) * 100;
    let comment = '';

    if (rate >= 120) {
        comment = '养护效果优秀,强度发展充分超出预期。';
    } else if (rate >= 110) {
        comment = '养护效果良好,强度正常发展且有储备。';
    } else if (rate >= 100) {
        comment = '养护效果合格,强度刚好达标。';
    } else if (rate >= 95) {
        comment = '养护条件略有不足,强度接近但未达标。';
    } else {
        comment = '养护条件不理想,严重影响强度发展。';
    }

    // 添加养护温度影响说明
    if (
        condition.includes('低温') ||
        condition.match(/-\d+°C/) ||
        (condition.match(/\d+°C/) && parseInt(condition.match(/(\d+)°C/)?.[1] || '20') < 15)
    ) {
        comment += '低温养护使成熟度不足,温度每降5°C强度约降5%。';
    } else if (condition.match(/3[0-9]°C/)) {
        comment += '高温养护虽加快早期反应,但可能影响后期强度发展和耐久性。';
    }

    return comment;
};

/**
 * 养护建议 - 基于第4排序因子(成熟度)
 */
const getCuringAdvice = (condition: string): string => {
    if (
        condition.includes('标准养护') &&
        (condition.includes('20±') || condition.includes('20°C'))
    ) {
        return '继续保持标准养护条件(温度20±2°C,湿度≥95%),这是最优养护方案。根据成熟度理论,当前条件可使混凝土充分水化,强度正常发展。';
    }
    if (condition.includes('标准养护')) {
        return '标准养护方案正确,建议严格控制温度20±2°C和湿度≥95%,确保成熟度达到560(20°C×28天)的标准值。';
    }
    if (condition.includes('蒸汽养护')) {
        return '蒸汽养护可加速早期强度发展,但需注意:①升温速度≤15°C/h;②最高温度≤80°C;③恒温时间4-6h。过快或过高会产生温度裂缝。';
    }
    if (condition.includes('现场') || condition.includes('覆盖') || condition.includes('洒水')) {
        return '现场养护需加强管理:①前7天每2-3h洒水一次;②覆盖塑料薄膜或麻袋保湿;③避免阳光直射。养护不当会使成熟度不足,强度损失10-20%。';
    }
    if (condition.includes('低温') || condition.includes('冬季') || condition.match(/-\d+°C/)) {
        return '低温环境下必须采取保温措施:①使用早强剂或防冻剂;②覆盖保温被;③有条件时搭设暖棚。温度每低5°C强度约降5%,严寒条件下需延长养护期至56天。';
    }
    if (condition.match(/3[0-9]°C/) || condition.includes('高温') || condition.includes('夏季')) {
        return '高温环境养护建议:①增加洒水频次至每1-2h一次;②使用缓凝剂延长凝结时间;③避开日照高峰浇筑;④覆盖遮阳网。高温加速水分蒸发,湿度不足会使强度损失15%以上。';
    }
    return '建议改善养护条件至标准养护水平,确保温度20±2°C、湿度≥95%,这样可使混凝土强度正常发展,达到设计要求。';
};

/**
 * 综合评价 - 基于加权平均分数
 * 权重: 水泥质量40%、水灰比30%、减水剂12%、骨料5%、养护13%
 */
const getOverallMixComment = (data: any): string => {
    // 按实际权重计算加权分数
    const waterCementScore = getMixRatioScore(data.water_cement_ratio);
    const cementScore = getCementScore(data.cement_type);
    const aggregateScore = getAggregateScore(data.aggregate_info);
    const admixtureScore = getAdmixtureScore(data.admixture);
    const curingScore = getCuringScore(data.curing_condition);

    // 加权平均 (水泥40% + 水灰比30% + 减水剂12% + 养护13% + 骨料5%)
    const weightedScore =
        cementScore * 0.4 +
        waterCementScore * 0.3 +
        admixtureScore * 0.12 +
        curingScore * 0.13 +
        aggregateScore * 0.05;

    if (weightedScore >= 92) {
        return `配合比设计优秀(综合评分${weightedScore.toFixed(1)}分),各项关键指标均达到高水平。水泥用量充足且质量优良(权重40%),水灰比控制优秀(权重30%),整体配比科学合理,可获得稳定高强度。`;
    }
    if (weightedScore >= 85) {
        return `配合比设计良好(综合评分${weightedScore.toFixed(1)}分),能够满足工程质量要求。关键因素水泥和水灰比(合计权重70%)控制较好,配比方案可行,建议在施工中严格执行。`;
    }
    if (weightedScore >= 75) {
        return `配合比基本合理(综合评分${weightedScore.toFixed(1)}分),但个别指标有优化空间。建议重点关注权重较高的水泥用量和水灰比控制,可通过适当调整提升5-10%强度。`;
    }
    if (weightedScore >= 65) {
        return `配合比存在不足(综合评分${weightedScore.toFixed(1)}分),需要优化关键参数。水泥用量(权重40%)或水灰比(权重30%)可能偏离最优区间,建议进行调整试验后再大规模使用。`;
    }
    return `配合比不合理(综合评分${weightedScore.toFixed(1)}分),存在明显缺陷!关键因素控制不当,强度难以保证,必须重新设计配合比并进行试配验证。`;
};

/**
 * 优化建议 - 基于图片7个因素的权重排序
 * 优先优化高权重因素: 水泥用量(40-45%) > 水灰比(25-30%) > 减水剂(10-12%)
 */
const getOptimizationAdvice = (data: any): string => {
    const advices = [];
    let priorityLevel = 0; // 0=无需优化, 1=建议优化, 2=必须优化

    // 1. 水灰比检查 (权重25-30%, 排序第2)
    if (data.water_cement_ratio > 0.5) {
        advices.push(
            `【高优先级】水灰比${data.water_cement_ratio}严重超标,必须降至0.45以下,建议目标0.38-0.42。每降0.05可提升强度3-4MPa`
        );
        priorityLevel = Math.max(priorityLevel, 2);
    } else if (data.water_cement_ratio > 0.45) {
        advices.push(
            `【中优先级】水灰比${data.water_cement_ratio}偏高,建议降至0.40-0.43,可通过增加减水剂掺量至2.0%实现`
        );
        priorityLevel = Math.max(priorityLevel, 1);
    } else if (data.water_cement_ratio > 0.42 && !data.admixture.includes('高效')) {
        advices.push(
            `水灰比${data.water_cement_ratio}尚可,但建议使用高效减水剂进一步优化至0.38-0.40`
        );
        priorityLevel = Math.max(priorityLevel, 1);
    }

    // 2. 水泥质量检查 (权重40-45%, 排序第1)
    if (!data.cement_type.includes('42.5') && !data.cement_type.includes('52.5')) {
        advices.push(
            `【高优先级】水泥强度等级偏低,建议提升至P.O 42.5或以上。"胶凝老大",水泥每提高一个等级强度可提升8-12MPa`
        );
        priorityLevel = Math.max(priorityLevel, 2);
    } else if (data.cement_type.includes('32.5')) {
        advices.push(
            `【中优先级】建议使用42.5级或52.5级水泥,可显著提高强度(水泥是最大影响因素,权重40-45%)`
        );
        priorityLevel = Math.max(priorityLevel, 1);
    }

    // 3. 减水剂检查 (权重10-12%, 排序第3)
    if (!data.admixture.includes('减水剂')) {
        advices.push(
            `【中优先级】建议添加聚羧酸高效减水剂(掺量1.5-2.0%),可在保持工作性的同时降低水灰比,间接提升强度10-15%`
        );
        priorityLevel = Math.max(priorityLevel, 1);
    } else if (!data.admixture.includes('高效') && !data.admixture.includes('聚羧酸')) {
        advices.push(`建议升级为聚羧酸高效减水剂,减水率可达25-30%,有利于降低水灰比`);
        priorityLevel = Math.max(priorityLevel, 1);
    } else {
        const dosageMatch = data.admixture.match(/掺量([\d.]+)%/);
        if (dosageMatch) {
            const dosage = parseFloat(dosageMatch[1]);
            if (dosage < 1.0) {
                advices.push(`减水剂掺量${dosage}%偏低,建议提高至1.5-2.0%以获得更好的减水效果`);
            } else if (dosage > 3.0) {
                advices.push(`减水剂掺量${dosage}%过高,可能影响凝结时间,建议降至2.5%以下`);
            }
        }
    }

    // 4. 养护条件检查 (权重8-10%, 排序第4)
    if (data.curing_condition.includes('低温') || data.curing_condition.match(/-\d+°C/)) {
        advices.push(
            `【中优先级】低温养护影响成熟度,温度每低5°C强度降5%。建议采取保温措施或使用早强剂,延长养护期至56天`
        );
        priorityLevel = Math.max(priorityLevel, 1);
    } else if (data.curing_condition.includes('现场') || data.curing_condition.includes('自然')) {
        advices.push(
            `现场养护条件一般,建议加强洒水频次(前7天每2-3h一次)并覆盖保湿,否则成熟度不足会使强度损失10-20%`
        );
    } else if (data.curing_condition.match(/3[0-9]°C/)) {
        advices.push(`高温环境需增加洒水频次并遮阳,避免湿度不足导致强度损失15%以上`);
    }

    // 5. 骨料含泥量检查 (权重3-5%, 排序第6)
    const mudMatch = data.aggregate_info.match(/含泥量([\d.]+)/);
    if (mudMatch) {
        const mudContent = parseFloat(mudMatch[1]);
        if (mudContent > 1.0) {
            advices.push(
                `【中优先级】骨料含泥量${mudContent}%严重超标,会降低强度10%以上,必须严格控制在0.5%以下`
            );
            priorityLevel = Math.max(priorityLevel, 1);
        } else if (mudContent > 0.7) {
            advices.push(`骨料含泥量${mudContent}%偏高,建议加强清洗控制至0.5%以下,可提升强度3-5%`);
        }
    }

    // 6. 粉煤灰/矿渣检查 (权重5-7%, 排序第5)
    if (data.admixture.includes('粉煤灰')) {
        const flyAshMatch = data.admixture.match(/粉煤灰.*?(\d+)%/);
        if (flyAshMatch && parseInt(flyAshMatch[1]) > 30) {
            advices.push(
                `粉煤灰掺量过高(>${flyAshMatch[1]}%),早期稀释效应明显,建议控制在15-25%以平衡早期和后期强度`
            );
        }
    }

    // 生成最终建议
    if (advices.length === 0) {
        return '当前配合比各项参数均在合理范围内,配比科学合理。建议保持现有技术措施,在施工中严格按配合比执行,做好养护管理,可获得稳定的设计强度。';
    }

    let finalAdvice = advices.join(';\n');

    if (priorityLevel === 2) {
        finalAdvice =
            '⚠️ 发现关键问题,必须立即调整:\n' +
            finalAdvice +
            '\n\n建议进行配合比调整试验,验证优化效果后再大规模应用。';
    } else if (priorityLevel === 1) {
        finalAdvice =
            '💡 存在优化空间,建议改进:\n' +
            finalAdvice +
            '\n\n以上优化措施可使强度提升5-15%,建议结合工程实际情况逐步实施。';
    } else {
        finalAdvice = '✓ 细节优化建议:\n' + finalAdvice;
    }

    return finalAdvice;
};

/**
 * 最终结论 - 基于图片7个因素的权重分析
 */
const getFinalConclusion = (data: any): string => {
    const designStrength = getDesignStrength(data.strength_grade);
    const strength = displayStrength.value;
    const percentage = getStrengthPercentage(strength, designStrength);
    const isPredicted = !!data.predicted_strength;

    let conclusion = isPredicted
        ? `经AI智能推演，${data.projectName}混凝土的优化后28天抗压强度预测为${strength} MPa，`
        : `经检测，${data.projectName}混凝土试件的28天抗压强度为${strength} MPa，`;

    if (percentage >= 120) {
        conclusion += `超过设计强度${percentage - 100}%，强度储备充足，质量优秀。`;
    } else if (percentage >= 110) {
        conclusion += `超过设计强度${percentage - 100}%，质量良好。`;
    } else if (percentage >= 100) {
        conclusion += `满足设计强度${data.strength_grade}的要求，质量合格。`;
    } else {
        const shortage = ((1 - percentage / 100) * 100).toFixed(1);
        conclusion += `低于设计强度要求${shortage}%，必须进行配合比优化和养护改进。`;
    }

    if (isPredicted && data.actual_strength) {
        const improvement = strength - data.actual_strength;
        const improvementPercent = ((improvement / data.actual_strength) * 100).toFixed(1);
        if (improvement > 0) {
            conclusion += `\n\n✨ 通过参数优化，相比原始实测强度${data.actual_strength} MPa，预测可提升${improvement.toFixed(1)} MPa（+${improvementPercent}%）。优化主要针对高权重因素：水泥用量、水灰比和减水剂掺量。`;
        } else if (improvement < 0) {
            conclusion += `\n\n⚠️ 注意：当前调整使强度降低${Math.abs(improvement).toFixed(1)} MPa，建议重新评估参数设置。`;
        }
    }

    // 基于7个因素权重排序的分析
    conclusion += `\n\n📊 关键影响因素分析（按权重排序）：`;

    // 第1因素: 水泥用量 (40-45%)
    conclusion += `\n【排序1】水泥用量(权重40-45%)："胶凝老大"，${data.cement_type}，水泥质量是决定强度的首要因素。`;

    // 第2因素: 水灰比 (25-30%)
    conclusion += `\n【排序2】水灰比(权重25-30%)：${data.water_cement_ratio}，${getWaterCementRatioLevel(data.water_cement_ratio).split('(')[0]}，强度"生命线"，每降0.1强度提升5-7MPa。`;

    // 第3因素: 减水剂 (10-12%)
    const hasHighEfficiency = data.admixture.includes('高效') || data.admixture.includes('聚羧酸');
    conclusion += `\n【排序3】减水剂掺量(权重10-12%)：${data.admixture}，${hasHighEfficiency ? '高效减水剂可保住低w/c又可施工' : '建议使用高效减水剂'}。`;

    // 第4因素: 养护成熟度 (8-10%)
    conclusion += `\n【排序4】养护成熟度(权重8-10%)：${data.curing_condition}，温度每低5°C强度约降5%。`;

    // 第5因素: 粉煤灰/矿渣 (5-7%)
    if (data.admixture.includes('粉煤灰') || data.admixture.includes('矿渣')) {
        conclusion += `\n【排序5】粉煤灰/矿渣(权重5-7%)：早期稀释效应，后期微粉填充+二次水化，权重较小。`;
    }

    // 第6因素: 粗骨料 (3-5%)
    conclusion += `\n【排序6】粗骨料用量(权重3-5%)：${data.aggregate_info.split(',')[0] || data.aggregate_info}，提供骨架但权重相对小。`;

    // 第7因素: 细骨料&砂率 (2-4%)
    conclusion += `\n【排序7】细骨料&砂率(权重2-4%)：主要影响工作性，对强度边际贡献最小。`;

    // 综合评价
    const weightedScore =
        getCementScore(data.cement_type) * 0.4 +
        getMixRatioScore(data.water_cement_ratio) * 0.3 +
        getAdmixtureScore(data.admixture) * 0.12 +
        getCuringScore(data.curing_condition) * 0.13 +
        getAggregateScore(data.aggregate_info) * 0.05;

    conclusion += `\n\n🎯 综合评分：${weightedScore.toFixed(1)}分（按权重加权平均）`;

    conclusion += `\n\n${getOptimizationAdvice(data)}`;

    return conclusion;
};

// 导出报告
const handleExport = () => {
    const exportData = {
        基本信息: {
            报告编号: props.data.reportNumber,
            工程名称: props.data.projectName,
            检测日期: props.data.testDate,
            检测标准: props.data.test_method,
        },
        强度指标: {
            设计强度等级: props.data.strength_grade,
            实测强度: props.data.actual_strength + ' MPa',
            达标率:
                getStrengthPercentage(
                    props.data.actual_strength,
                    getDesignStrength(props.data.strength_grade)
                ) + '%',
        },
        配合比参数: {
            水泥类型: props.data.cement_type,
            水泥细度: props.data.cement_fineness,
            水灰比: props.data.water_cement_ratio,
            骨料信息: props.data.aggregate_info,
            外加剂: props.data.admixture,
        },
        养护条件: {
            养护方式: props.data.curing_condition,
            养护龄期: props.data.curing_age,
        },
        质量评估: {
            检测结论: props.data.conclusion,
            综合评价: getOverallMixComment(props.data),
            优化建议: getOptimizationAdvice(props.data),
        },
        最终结论: getFinalConclusion(props.data),
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `混凝土质量分析报告_${props.data.reportNumber}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    emit('export');
};

onMounted(() => {
    initCharts();
});

watch(
    () => props.data,
    () => {
        initCharts();
    },
    { deep: true }
);
</script>

<style lang="scss" scoped>
.conclusion-text {
    line-height: 1.8;

    p {
        margin-bottom: 8px;
    }

    ul {
        margin: 8px 0;
        padding-left: 24px;

        li {
            margin: 6px 0;
        }
    }
}

.report-summary {
    .bg-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .summary-section {
        h4 {
            color: #666;
            font-weight: 600;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            &.highlight {
                background: #f8f9fa;
                padding: 12px;
                margin: 4px 0;
                border-radius: 4px;
                border-bottom: none;
            }

            .label {
                font-size: 14px;
                color: #666;
                font-weight: 500;
            }

            .value {
                font-size: 14px;
                color: #333;
                font-weight: 600;
            }
        }
    }

    .final-conclusion {
        h4 {
            color: #666;
            font-weight: 600;
        }

        p {
            line-height: 1.8;
            color: #333;
            white-space: pre-line;
        }
    }
}
</style>
