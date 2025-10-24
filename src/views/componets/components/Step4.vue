<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">分化模型可视化</span>
            <div>
                <v-btn
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="emit('back')"
                    class="mr-2"
                >
                    返回调参
                </v-btn>
                <v-btn
                    variant="tonal"
                    color="success"
                    prepend-icon="mdi-download"
                    @click="handleExport"
                >
                    导出结果
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
            <v-row>
                <!-- 预测效率模型 -->
                <v-col cols="12">
                    <PredictionModel :data="data" />
                </v-col>

                <!-- 分化时间线可视化 -->
                <v-col cols="12" class="mt-4">
                    <PixiModel :data="data" />
                </v-col>

                <!-- 化合物网络可视化 -->
                <v-col cols="12" class="mt-4">
                    <CompoundNetwork :data="data" />
                </v-col>
            </v-row>

            <!-- 分化协议总结卡片 -->
            <v-card class="mt-4" elevation="2">
                <v-card-title class="bg-primary">
                    <v-icon class="mr-2">mdi-file-document</v-icon>
                    分化协议总结
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row>
                        <v-col cols="12">
                            <div class="summary-item">
                                <div class="summary-label">
                                    <v-icon size="small" class="mr-1">mdi-bacteria</v-icon>
                                    细胞来源
                                </div>
                                <div class="summary-value">{{ data.cell_source || '-' }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="summary-item">
                                <div class="summary-label">
                                    <v-icon size="small" class="mr-1">mdi-timeline-clock</v-icon>
                                    分化时间线
                                </div>
                                <div class="summary-value">{{ data.differentiation_timeline || '-' }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="summary-item">
                                <div class="summary-label">
                                    <v-icon size="small" class="mr-1">mdi-flask</v-icon>
                                    关键分化因子
                                </div>
                                <div class="summary-value">
                                    <v-chip-group>
                                        <v-chip
                                            v-for="(compound, i) in parseCompounds(data.stage_specific_compounds)"
                                            :key="i"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        >
                                            {{ compound }}
                                        </v-chip>
                                    </v-chip-group>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="summary-item">
                                <div class="summary-label">
                                    <v-icon size="small" class="mr-1">mdi-chart-box</v-icon>
                                    评估指标
                                </div>
                                <div class="summary-value">{{ data.efficiency_assessment_metrics || '-' }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="data.doi">
                            <div class="summary-item">
                                <div class="summary-label">
                                    <v-icon size="small" class="mr-1">mdi-link-variant</v-icon>
                                    文献引用
                                </div>
                                <div class="summary-value">
                                    <a :href="`https://doi.org/${data.doi}`" target="_blank">
                                        {{ data.doi }}
                                    </a>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
// @ts-ignore
import PredictionModel from './PredictionModel.vue';
// @ts-ignore
import PixiModel from './PixiModel.vue';
// @ts-ignore
import CompoundNetwork from './CompoundNetwork.vue';

const props = defineProps<{
    data: any;
}>();

const emit = defineEmits<{
    back: [];
    export: [];
}>();

// 调试：监听数据变化
onMounted(() => {
    console.log('Step4 mounted, data:', props.data);
});

watch(() => props.data, (newData) => {
    console.log('Step4 data changed:', newData);
}, { deep: true });

// 解析化合物
const parseCompounds = (compoundsText: string) => {
    if (!compoundsText) return [];
    const compounds = compoundsText.split(/[;；]/).map(c => c.trim()).filter(c => c);
    // 提取化合物名称（去掉浓度等信息）
    return compounds.map(c => {
        const match = c.match(/^([A-Za-z0-9-]+)/);
        return match ? match[1] : c.substring(0, 20);
    }).slice(0, 10); // 最多显示10个
};

const handleExport = () => {
    // 创建导出数据
    const exportData = {
        基本信息: {
            发表年份: props.data.year,
            期刊: props.data.journal,
            DOI: props.data.doi,
        },
        细胞来源: props.data.cell_source,
        分化时间线: props.data.differentiation_timeline,
        阶段特异性化合物: props.data.stage_specific_compounds,
        效率评估指标: props.data.efficiency_assessment_metrics,
        引用: props.data.citation,
    };

    // 转换为JSON字符串
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = `干细胞分化参数_${props.data.year}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    emit('export');
};
</script>

<style lang="scss" scoped>
.summary-item {
    margin-bottom: 12px;
    .summary-label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
        margin-bottom: 4px;
    }
    .summary-value {
        color: #333;
        font-size: 14px;
        line-height: 1.6;
        a {
            color: #1976d2;
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
