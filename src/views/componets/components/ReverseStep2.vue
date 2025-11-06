<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">反向推演结果 - 优化配合比方案</span>
            <div>
                <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')" class="mr-2">
                    返回修改
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-6">
            <!-- 核心结果卡片 -->
            <v-card class="mb-6" color="primary" variant="tonal">
                <v-card-text class="pa-6">
                    <v-row align="center">
                        <v-col cols="12" md="4" class="text-center">
                            <div class="text-caption mb-2">基准强度</div>
                            <div class="text-h4 font-weight-bold">
                                {{ optimizeResult.base_strength?.toFixed(2) || 0 }}
                                <span class="text-h6">MPa</span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4" class="text-center">
                            <v-icon size="64" color="success">mdi-arrow-right-bold</v-icon>
                            <div class="text-h6 text-success font-weight-bold mt-2">
                                +{{ optimizeResult.improvement_percent?.toFixed(2) || 0 }}%
                            </div>
                        </v-col>
                        <v-col cols="12" md="4" class="text-center">
                            <div class="text-caption mb-2">优化后强度</div>
                            <div class="text-h4 font-weight-bold text-success">
                                {{ optimizeResult.predicted_strength?.toFixed(2) || 0 }}
                                <span class="text-h6">MPa</span>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 参数对比表格 -->
            <v-card class="mb-6">
                <v-card-title>
                    <v-icon class="mr-2">mdi-compare</v-icon>
                    配比参数对比
                </v-card-title>
                <v-card-text class="pa-0">
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left">参数名称</th>
                                <th class="text-right">基准配比</th>
                                <th class="text-right">优化配比</th>
                                <th class="text-center">调整状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="param in comparisonParams"
                                :key="param.key"
                            >
                                <td class="font-weight-medium">
                                    <v-icon size="small" class="mr-2" :color="param.changed ? 'primary' : 'grey'">
                                        {{ param.icon }}
                                    </v-icon>
                                    {{ param.label }}
                                </td>
                                <td class="text-right">{{ formatValue(param.baseValue) }} {{ param.unit }}</td>
                                <td class="text-right font-weight-bold" :class="{ 'text-primary': param.changed }">
                                    {{ formatValue(param.optimizedValue) }} {{ param.unit }}
                                </td>
                                <td class="text-center">
                                    <v-chip
                                        v-if="param.changed"
                                        :color="param.changePercent > 0 ? 'success' : 'warning'"
                                        size="small"
                                        label
                                    >
                                        {{ param.changePercent > 0 ? '+' : '' }}{{ param.changePercent.toFixed(1) }}%
                                    </v-chip>
                                    <v-chip v-else color="grey" size="small" variant="text">
                                        未调整
                                    </v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>

            <!-- 调整详情 -->
            <v-card class="mb-6" v-if="optimizeResult.adjustments?.length > 0">
                <v-card-title>
                    <v-icon class="mr-2">mdi-information-outline</v-icon>
                    详细调整说明
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-list lines="two">
                        <v-list-item
                            v-for="(adjustment, index) in optimizeResult.adjustments"
                            :key="index"
                            class="mb-2"
                        >
                            <template v-slot:prepend>
                                <v-avatar :color="adjustment.change > 0 ? 'success' : 'warning'">
                                    <v-icon>{{ adjustment.change > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                                </v-avatar>
                            </template>
                            <v-list-item-title class="font-weight-bold">
                                {{ getParamLabel(adjustment.factor) }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                从 {{ adjustment.original_value?.toFixed(2) }} 调整为 {{ adjustment.optimized_value?.toFixed(2) }}，
                                变化 {{ adjustment.change > 0 ? '+' : '' }}{{ adjustment.change?.toFixed(2) }}
                                ({{ adjustment.change_percent > 0 ? '+' : '' }}{{ adjustment.change_percent?.toFixed(1) }}%)
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
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
                <v-btn
                    color="primary"
                    prepend-icon="mdi-check-circle"
                    @click="applyOptimization"
                >
                    应用此优化方案
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { OptimizeResponse } from '@/api/predict';
import { computed } from 'vue';

interface Props {
    data: OptimizeResponse;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    back: [];
    apply: [config: any];
}>();

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

// 获取参数标签
const getParamLabel = (key: string) => {
    return paramLabels[key]?.label || key;
};

// 格式化数值
const formatValue = (value: any) => {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return value || 0;
};

// 参数对比数据
const comparisonParams = computed(() => {
    const base = optimizeResult.value.base_config || {};
    const optimized = optimizeResult.value.optimized_config || {};
    const params = [];

    for (const key in paramLabels) {
        const baseValue = base[key] || 0;
        const optimizedValue = optimized[key] || 0;
        const changed = Math.abs(baseValue - optimizedValue) > 0.01;
        const changePercent = baseValue !== 0 ? ((optimizedValue - baseValue) / baseValue) * 100 : 0;

        params.push({
            key,
            label: paramLabels[key].label,
            unit: paramLabels[key].unit,
            icon: paramLabels[key].icon,
            baseValue,
            optimizedValue,
            changed,
            changePercent,
        });
    }

    return params;
});

// 应用优化
const applyOptimization = () => {
    console.log('应用优化方案:', optimizeResult.value.optimized_config);
    emit('apply', optimizeResult.value.optimized_config);
    // 可以跳转到正向推演，使用优化后的配比进行验证
};
</script>

<style lang="scss" scoped>
// 使用Vuetify默认样式
</style>

