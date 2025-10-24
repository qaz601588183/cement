<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">检测报告列表</span>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')">
                返回查询
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- Loading 状态 -->
        <div v-if="loading" class="text-center pa-10">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <div class="mt-4 text-h6">正在抓取检测报告，请稍候...</div>
            <div class="text-subtitle-2 text-grey">预计需要 20-30 秒</div>
        </div>

        <!-- 数据表格 -->
        <div v-else>
            <v-table class="ma-4 table">
                <thead>
                    <tr>
                        <th class="text-left">报告编号</th>
                        <th class="text-left">报告类型</th>
                        <th class="text-left">检测日期</th>
                        <th class="text-left">强度等级</th>
                        <th class="text-left">实测强度</th>
                        <th class="text-left" style="min-width: 300px">工程名称</th>
                        <th class="text-left">结论</th>
                        <th class="text-left">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="dataList.length === 0">
                        <td colspan="8" class="text-center py-8 text-grey">暂无数据</td>
                    </tr>
                    <tr v-for="(item, i) in dataList" :key="i">
                        <td class="py-4">
                            <div class="d-flex align-center">
                                <v-icon
                                    icon="mdi-file-document-outline"
                                    color="primary"
                                    size="small"
                                    class="mr-2"
                                ></v-icon>
                                <div class="font-weight-bold">
                                    {{ item.reportNumber || `#${i + 1}` }}
                                </div>
                            </div>
                        </td>
                        <td>
                            <v-chip
                                :color="item.reportType === '工程现场抽查' ? 'orange' : 'blue'"
                                size="small"
                            >
                                {{ item.reportType || '委托检测' }}
                            </v-chip>
                        </td>
                        <td>
                            <div class="td-info">
                                <div class="name">{{ item.testDate || '-' }}</div>
                            </div>
                        </td>
                        <td>
                            <v-chip color="primary" size="small" variant="outlined">
                                {{ item.strength_grade || 'C30' }}
                            </v-chip>
                        </td>
                        <td>
                            <div style="min-width: 120px">
                                <div class="d-flex align-center">
                                    <div class="strength-value">
                                        <span
                                            class="text-h6 font-weight-bold"
                                            :class="getStrengthClass(item)"
                                        >
                                            {{ item.actual_strength || 0 }}
                                        </span>
                                        <span class="text-caption text-grey ml-1">MPa</span>
                                    </div>
                                    <v-tooltip :text="getStrengthTip(item)" location="top">
                                        <template v-slot:activator="{ props }">
                                            <v-icon
                                                v-bind="props"
                                                :color="getStrengthIconColor(item)"
                                                size="small"
                                                class="ml-2"
                                            >
                                                {{ getStrengthIcon(item) }}
                                            </v-icon>
                                        </template>
                                    </v-tooltip>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="summary-cell">
                                <div class="text-body-2">
                                    {{ item.projectName || '-' }}
                                </div>
                            </div>
                        </td>
                        <td>
                            <v-chip
                                :color="getConclusionColor(item.conclusion)"
                                size="small"
                                variant="flat"
                            >
                                {{ item.conclusion || '合格' }}
                            </v-chip>
                        </td>
                        <td>
                            <div class="d-flex">
                                <v-tooltip text="查看详情" location="top">
                                    <template v-slot:activator="{ props }">
                                        <v-btn
                                            v-bind="props"
                                            icon="mdi-eye"
                                            size="small"
                                            variant="text"
                                            color="primary"
                                            @click="emit('view-detail', item)"
                                        ></v-btn>
                                    </template>
                                </v-tooltip>
                                <v-tooltip text="质量推演" location="top">
                                    <template v-slot:activator="{ props }">
                                        <v-btn
                                            v-bind="props"
                                            icon="mdi-chart-timeline-variant"
                                            size="small"
                                            variant="text"
                                            color="warning"
                                            class="ml-2"
                                            @click="emit('process', item)"
                                        ></v-btn>
                                    </template>
                                </v-tooltip>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </v-table>
            <v-divider class="ma-4"></v-divider>
            <div class="d-flex py-2 justify-center">
                <v-pagination
                    v-model="currentPage"
                    :length="totalPages"
                    size="small"
                    rounded="circle"
                    @update:model-value="emit('page-change', $event)"
                ></v-pagination>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    loading: boolean;
    dataList: any[];
    totalPages: number;
}>();

const emit = defineEmits<{
    back: [];
    'view-detail': [item: any];
    process: [item: any];
    'page-change': [page: number];
}>();

const currentPage = ref(1);

// 获取强度等级的数值（如C30 -> 30）
const getDesignStrength = (strengthGrade: string): number => {
    const match = strengthGrade?.match(/C(\d+)/);
    return match ? parseInt(match[1]) : 30;
};

// 计算实测强度相对于设计强度的百分比
const getStrengthPercentage = (item: any): number => {
    const designStrength = getDesignStrength(item.strength_grade);
    return ((item.actual_strength || 0) / designStrength) * 100;
};

// 获取强度值的CSS类
const getStrengthClass = (item: any) => {
    const percentage = getStrengthPercentage(item);
    if (percentage >= 120) return 'text-success';
    if (percentage >= 110) return 'text-light-green';
    if (percentage >= 100) return 'text-primary';
    if (percentage >= 95) return 'text-warning';
    return 'text-error';
};

// 获取强度图标
const getStrengthIcon = (item: any) => {
    const percentage = getStrengthPercentage(item);
    if (percentage >= 120) return 'mdi-chevron-triple-up';
    if (percentage >= 110) return 'mdi-chevron-double-up';
    if (percentage >= 100) return 'mdi-check-circle';
    if (percentage >= 95) return 'mdi-alert-circle-outline';
    return 'mdi-close-circle';
};

// 获取强度图标颜色
const getStrengthIconColor = (item: any) => {
    const percentage = getStrengthPercentage(item);
    if (percentage >= 120) return 'success';
    if (percentage >= 110) return 'light-green';
    if (percentage >= 100) return 'primary';
    if (percentage >= 95) return 'warning';
    return 'error';
};

// 获取强度提示
const getStrengthTip = (item: any) => {
    const designStrength = getDesignStrength(item.strength_grade);
    const percentage = getStrengthPercentage(item);
    const diff = ((item.actual_strength || 0) - designStrength).toFixed(1);

    if (percentage >= 120)
        return `优秀：超出设计强度${diff}MPa (${(percentage - 100).toFixed(0)}%)`;
    if (percentage >= 110)
        return `良好：超出设计强度${diff}MPa (${(percentage - 100).toFixed(0)}%)`;
    if (percentage >= 100) return `合格：达到设计强度要求`;
    if (percentage >= 95) return `接近合格：低于设计强度${Math.abs(parseFloat(diff))}MPa`;
    return `不合格：低于设计强度${Math.abs(parseFloat(diff))}MPa`;
};

// 获取结论颜色
const getConclusionColor = (conclusion: string) => {
    if (!conclusion) return 'grey';
    if (conclusion.includes('优秀') || conclusion.includes('优良') || conclusion.includes('卓越'))
        return 'success';
    if (conclusion.includes('合格') || conclusion.includes('满足')) return 'primary';
    if (conclusion.includes('基本') || conclusion.includes('略低')) return 'warning';
    if (conclusion.includes('不合格')) return 'error';
    return 'primary';
};
</script>

<style lang="scss" scoped>
.table {
    .td-info {
        .name {
            font-weight: 700;
            font-size: 14px;
        }
        .sub-title {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
        }
    }

    .summary-cell {
        max-width: 400px;
        .text-body-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.6;
        }
    }

    .strength-value {
        display: flex;
        align-items: baseline;
    }

    tbody tr {
        transition: background-color 0.2s;

        &:hover {
            background-color: rgba(25, 118, 210, 0.04);
        }
    }
}

@media (max-width: 960px) {
    .table {
        width: calc(100vw - 64px);
        overflow: hidden;
    }
}
</style>
