<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">模型训练与参数微调</span>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="emit('back')">
                返回列表
            </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- Training Loading 状态 -->
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

            <!-- 训练步骤列表 -->
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

        <!-- 参数微调表单 -->
        <div v-else class="pa-4">
            <v-alert type="success" variant="tonal" class="mb-4">
                <template v-slot:text> 模型训练完成！现在您可以根据需求调整分化参数。 </template>
            </v-alert>

            <DataForm :data="formData" @form-change="handleFormChange" />

            <div class="d-flex justify-end mt-4">
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-chart-line"
                    @click="emit('next')"
                >
                    生成可视化模型
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
// @ts-ignore
import DataForm from './DataForm.vue';

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

const handleFormChange = (data: any) => {
    emit('form-change', data);
};

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};
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
</style>
