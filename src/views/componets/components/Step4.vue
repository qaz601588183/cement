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
                                {{ data.water_cement_ratio }}，实测强度
                                {{ data.actual_strength }} MPa
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
                                <strong>强度发展：</strong>28天实测强度
                                {{ data.actual_strength }} MPa，达到设计强度
                                {{ getDesignStrength(data.strength_grade) }} MPa 的
                                {{
                                    getStrengthPercentage(
                                        data.actual_strength,
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
                                    <span class="label">实测强度：</span>
                                    <span class="value">
                                        <span class="text-h6 text-success font-weight-bold">{{
                                            data.actual_strength
                                        }}</span>
                                        MPa
                                    </span>
                                </div>
                                <div class="summary-item highlight">
                                    <span class="label">达标率：</span>
                                    <span class="value">
                                        <span
                                            :class="
                                                getStrengthPercentage(
                                                    data.actual_strength,
                                                    getDesignStrength(data.strength_grade)
                                                ) >= 100
                                                    ? 'text-success'
                                                    : 'text-error'
                                            "
                                        >
                                            {{
                                                getStrengthPercentage(
                                                    data.actual_strength,
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
import * as echarts from 'echarts';
import { nextTick, onMounted, watch } from 'vue';

const props = defineProps<{
    data: any;
}>();

const emit = defineEmits<{
    back: [];
    export: [];
}>();

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
    });
};

// 图表1：水灰比与强度关系
const initWaterCementChart = () => {
    const chartDom = document.getElementById('waterCementChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 理论曲线数据（基于鲍罗米公式）
    const waterCementRatios = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6];
    const designStrength = getDesignStrength(props.data.strength_grade);
    const theoreticalStrengths = waterCementRatios.map((ratio) => {
        // 简化的鲍罗米公式: fc = A * fce / (1 + B * W/C)
        return Math.round((designStrength * 1.5) / (1 + 2.5 * ratio));
    });

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
                data: [[props.data.water_cement_ratio, props.data.actual_strength]],
                symbolSize: 20,
                itemStyle: {
                    color: '#ee6666',
                },
                label: {
                    show: true,
                    formatter: `实测: ${props.data.actual_strength} MPa\nW/C: ${props.data.water_cement_ratio}`,
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
    const actualStrength = props.data.actual_strength;

    // 标准养护下的强度发展曲线（经验公式）
    const days = [1, 3, 7, 14, 28];
    const standardCurve = days.map((day) => {
        return Math.round((actualStrength * Math.log(day + 1)) / Math.log(29));
    });

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
            text: '混凝土配合比综合评价',
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

// 评分函数
const getMixRatioScore = (ratio: number): number => {
    if (ratio <= 0.35) return 95;
    if (ratio <= 0.4) return 90;
    if (ratio <= 0.45) return 80;
    if (ratio <= 0.5) return 70;
    return 60;
};

const getCementScore = (type: string): number => {
    if (type.includes('52.5')) return 95;
    if (type.includes('42.5R')) return 90;
    if (type.includes('42.5')) return 85;
    return 80;
};

const getAggregateScore = (info: string): number => {
    let score = 85;
    if (info.includes('含泥量') && parseFloat(info.match(/含泥量([\d.]+)/)?.[1] || '1') < 0.5)
        score += 10;
    if (info.includes('连续级配')) score += 5;
    return Math.min(score, 100);
};

const getAdmixtureScore = (admixture: string): number => {
    if (admixture.includes('高效减水剂')) return 90;
    if (admixture.includes('减水剂')) return 85;
    return 75;
};

const getCuringScore = (condition: string): number => {
    if (condition.includes('标准养护')) return 95;
    if (condition.includes('蒸汽养护')) return 85;
    if (condition.includes('保温')) return 80;
    return 75;
};

// 评价函数
const getWaterCementRatioLevel = (ratio: number): string => {
    if (ratio <= 0.35) return '极优';
    if (ratio <= 0.4) return '优秀';
    if (ratio <= 0.45) return '良好';
    if (ratio <= 0.5) return '合格';
    return '偏高';
};

const getWaterCementRatioAdvice = (ratio: number): string => {
    if (ratio <= 0.4) return '水灰比控制良好，有利于获得高强度混凝土。';
    if (ratio <= 0.45) return '水灰比处于中等水平，强度发展正常。';
    if (ratio <= 0.5) return '水灰比略高，建议通过使用高效减水剂来降低。';
    return '水灰比偏高，严重影响强度，建议优化配合比。';
};

const getWaterCementOptimization = (ratio: number, actual: number, design: number): string => {
    if (actual >= design * 1.15) return '强度储备充足，配合比经济合理。';
    if (actual >= design) return '强度满足要求，可考虑适当优化配合比以提高经济性。';
    return '强度略低于设计值，建议降低水灰比或提高水泥强度等级。';
};

const getMixRatioComment = (ratio: number): string => {
    if (ratio <= 0.35) return '控制优秀，适用于高强混凝土';
    if (ratio <= 0.45) return '控制良好，满足常规要求';
    return '有待优化';
};

const getAggregateComment = (info: string): string => {
    if (info.includes('含泥量') && parseFloat(info.match(/含泥量([\d.]+)/)?.[1] || '1') < 0.5) {
        return '骨料质量优良';
    }
    return '骨料质量合格';
};

const getCuringQualityComment = (condition: string, actual: number, design: number): string => {
    const rate = (actual / design) * 100;
    if (rate >= 120) return '养护效果优秀，强度发展充分。';
    if (rate >= 100) return '养护效果良好，强度正常发展。';
    return '养护条件可能不够理想，影响强度发展。';
};

const getCuringAdvice = (condition: string): string => {
    if (condition.includes('标准养护')) return '继续保持标准养护条件，确保温度20±2°C，湿度≥95%。';
    if (condition.includes('现场')) return '现场养护需加强洒水养护频次，保持混凝土表面湿润。';
    if (condition.includes('低温') || condition.includes('冬季'))
        return '低温环境下需做好保温措施，必要时使用早强剂。';
    return '保持良好的养护条件，确保混凝土强度正常发展。';
};

const getOverallMixComment = (data: any): string => {
    const score =
        (getMixRatioScore(data.water_cement_ratio) +
            getCementScore(data.cement_type) +
            getAggregateScore(data.aggregate_info) +
            getAdmixtureScore(data.admixture)) /
        4;

    if (score >= 90) return '配合比设计优秀，各项指标均达到较高水平。';
    if (score >= 80) return '配合比设计良好，能够满足工程质量要求。';
    if (score >= 70) return '配合比基本合理，个别指标有优化空间。';
    return '配合比需要优化，建议进行调整试验。';
};

const getOptimizationAdvice = (data: any): string => {
    const advices = [];

    if (data.water_cement_ratio > 0.45) {
        advices.push('建议降低水灰比至0.45以下');
    }

    if (!data.admixture.includes('高效')) {
        advices.push('考虑使用高效减水剂以改善工作性');
    }

    if (
        data.aggregate_info.includes('含泥量') &&
        parseFloat(data.aggregate_info.match(/含泥量([\d.]+)/)?.[1] || '1') > 0.7
    ) {
        advices.push('严格控制骨料含泥量在0.5%以下');
    }

    if (!data.cement_type.includes('42.5') && !data.cement_type.includes('52.5')) {
        advices.push('建议使用42.5级或以上水泥');
    }

    return advices.length > 0
        ? advices.join('；') + '。'
        : '当前配合比合理，保持现有技术措施即可。';
};

const getFinalConclusion = (data: any): string => {
    const designStrength = getDesignStrength(data.strength_grade);
    const percentage = getStrengthPercentage(data.actual_strength, designStrength);

    let conclusion = `经检测，${data.projectName}混凝土试件的28天抗压强度为${data.actual_strength} MPa，`;

    if (percentage >= 120) {
        conclusion += `超过设计强度${percentage - 100}%，强度储备充足，质量优秀。`;
    } else if (percentage >= 110) {
        conclusion += `超过设计强度${percentage - 100}%，质量良好。`;
    } else if (percentage >= 100) {
        conclusion += `满足设计强度${data.strength_grade}的要求，质量合格。`;
    } else {
        conclusion += `略低于设计强度要求，建议加强养护并进行配合比优化。`;
    }

    conclusion += `\n\n关键影响因素分析表明：水灰比${data.water_cement_ratio}（${getWaterCementRatioLevel(data.water_cement_ratio)}），`;
    conclusion += `${data.cement_type}，`;
    conclusion += `${data.curing_condition}。`;
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
