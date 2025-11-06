<template>
    <div class="detection-page">
        <v-container fluid>
            <!-- 显示样品列表 -->
            <!-- <detection-1 v-if="!showExperiments" @start-detection="handleStartDetection" /> -->

            <!-- 显示实验检测 -->
            <!-- <detection-2
                v-else
                :current-sample="selectedSample"
                @go-back="handleGoBack"
                @upload-results="handleUploadResults"
            /> -->
            <!-- 嵌入 priment.html 页面 -->
        </v-container>
        <div style="width: 100%; height: 100%">
            <iframe
                src="/priment-new.html"
                width="100%"
                height="1000px"
                frameborder="0"
                style="border: none; margin-top: 20px"
            ></iframe>
        </div>

        <!-- 上传成功提示 -->
        <v-snackbar v-model="showUploadSnackbar" :timeout="3000" color="success">
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            检测结果已成功上传分析！
        </v-snackbar>

        <!-- 确认对话框 -->
        <v-dialog v-model="showConfirmDialog" max-width="600" persistent>
            <v-card>
                <v-card-title class="text-h5 bg-primary text-white">
                    <v-icon class="mr-2" color="white">mdi-check-circle-outline</v-icon>
                    确认检测结果
                </v-card-title>

                <v-card-text class="pt-6">
                    <v-alert type="info" variant="tonal" class="mb-4">
                        所有实验已完成，系统已生成检测结果数据。
                    </v-alert>

                    <div class="text-body-1 mb-4">
                        <strong>检测数据摘要：</strong>
                    </div>

                    <v-list density="compact" class="bg-grey-lighten-4 rounded">
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                水泥指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                粉煤灰指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                矿渣粉指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                水质指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                外加剂指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                粗骨料指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2" color="success"
                                    >mdi-check-circle</v-icon
                                >
                                细骨料指标检测完成
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>

                    <v-alert type="warning" variant="tonal" class="mt-4">
                        <strong>注意：</strong>确认后将应用检测数据并进入配比设计流程。
                    </v-alert>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="outlined" @click="handleCancelConfirm">
                        取消
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="flat"
                        @click="handleConfirmAndProceed"
                        prepend-icon="mdi-arrow-right-circle"
                    >
                        确认并进入下一步
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { useConcreteStore } from '@/stores/useConcreteStore';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
// import Detection1 from './components/detection_1.vue';
// import Detection2 from './components/detection_2.vue';

// 类型定义
interface Sample {
    id: number;
    code: string;
    name: string;
    isSubsampled: boolean;
}

interface ExperimentCompleteData {
    laneTitle: string;
    stepTitle: string;
    laneIndex: number;
    stepIndex: number;
    timestamp: string;
}

interface AllExperimentsCompleteData {
    totalExperiments: number;
    timestamp: string;
    summary: Array<{
        title: string;
        stepCount: number;
        completedSteps: number;
        failedSteps: number;
    }>;
}

// 状态管理
const showExperiments = ref(false);
const selectedSample = ref<Sample>({
    id: 0,
    code: '',
    name: '',
    isSubsampled: false,
});
const showUploadSnackbar = ref(false);
const showConfirmDialog = ref(false);
const pendingDetectionData = ref<any>(null);

// 开始检测 (暂时保留，供未来使用)
// const handleStartDetection = (sample: Sample) => {
//     selectedSample.value = sample;
//     showExperiments.value = true;
// };

// 返回样品列表 (暂时保留，供未来使用)
// const handleGoBack = () => {
//     showExperiments.value = false;
// };
const concreteStore = useConcreteStore();
const router = useRouter();

// 处理结果上传
const handleUploadResults = (data: any) => {
    console.log('上传检测结果：', data);

    // 这里可以调用实际的API接口
    // await api.uploadResults(data);

    // 显示成功提示
    showUploadSnackbar.value = true;

    // 可选：上传成功后跳转到配比优化（历史数据）
    setTimeout(() => {
        showExperiments.value = false;
        // 生成模拟检测结果数据
        const mockDetectionResults = {
            cement: {
                insoluble_matter_percent: Math.random() * 1.5,
                magnesium_oxide_percent: Math.random() * 5.0,
                sulfur_trioxide_percent: Math.random() * 4.0,
            },
            fly_ash: {
                loss_on_ignition_percent: Math.random() * (5.0 * 0.2) + 5.0 * 0.8,
                moisture_content_percent: Math.random() * (1.0 * 0.2) + 1.0 * 0.8,
                sulfur_trioxide_percent: Math.random() * (3.0 * 0.2) + 3.0 * 0.8,
            },
            blast_furnace_slag: {
                sulfur_trioxide_percent: Math.random() * (4.0 * 0.2) + 4.0 * 0.8,
                chloride_ion_percent: Math.random() * (0.06 * 0.2) + 0.06 * 0.8,
            },
            water: {
                ph_value: Math.random() * (4.5 * 0.2) + 4.5 * 0.8,
                insoluble_matter_mg_per_L: Math.random() * (2000 * 0.2) + 2000 * 0.8,
            },
            superplasticizer: {
                moisture_content_percent_powder: Math.random() * (5.0 * 0.2) + 5.0 * 0.8,
                density_tolerance_g_per_cm3: Math.random() * (0.03 * 0.2) + 0.03 * 0.8,
                chloride_ion_percent: Math.random() * (0.2 * 0.2) + 0.2 * 0.8,
            },
            coarse_aggregate: {
                flaky_elongated_particles_percent: Math.random() * (15.0 * 0.2) + 15.0 * 0.8,
                clay_content_percent: Math.random() * (2.0 * 0.2) + 2.0 * 0.8,
                crushing_value_percent: Math.random() * (10.0 * 0.2) + 10.0 * 0.8,
            },
            fine_aggregate: {
                clay_content_percent: Math.random() * (3.0 * 0.2) + 3.0 * 0.8,
                mica_content_percent: Math.random() * (2.0 * 0.2) + 2.0 * 0.8,
                chloride_ion_percent: Math.random() * (0.02 * 0.2) + 0.02 * 0.8,
            },
        };

        // 保存数据并显示确认对话框
        console.log('生成的检测结果数据:', mockDetectionResults);
        pendingDetectionData.value = mockDetectionResults;
        showConfirmDialog.value = true;
    }, 2000);
};

// 确认并继续
const handleConfirmAndProceed = () => {
    if (pendingDetectionData.value) {
        // 应用数据
        concreteStore.setConcreteData(pendingDetectionData.value);
        console.log('已应用检测结果数据');

        // 关闭对话框
        showConfirmDialog.value = false;

        // 跳转到下一步
        router.push('/concrete-design/forward-step1');
    }
};

// 取消确认
const handleCancelConfirm = () => {
    showConfirmDialog.value = false;
    pendingDetectionData.value = null;
    console.log('用户取消了应用检测数据');
};

// 处理来自 iframe (priment.html) 的消息
const handleIframeMessage = (event: MessageEvent) => {
    // 安全检查：可以根据需要验证 origin
    // if (event.origin !== 'expected-origin') return;

    const message = event.data;

    if (message.type === 'experimentComplete') {
        // 单个实验步骤完成
        handleExperimentStepComplete(message.data as ExperimentCompleteData);
    } else if (message.type === 'allExperimentsComplete') {
        // 所有实验完成
        handleAllExperimentsComplete(message.data as AllExperimentsCompleteData);
    }
};

// 处理单个实验步骤完成
const handleExperimentStepComplete = (data: ExperimentCompleteData) => {
    console.log('实验步骤完成:', data);
    console.log(`[${data.laneTitle}] ${data.stepTitle} 已完成`);

    // 这里可以添加自定义逻辑，例如：
    // 1. 更新本地状态
    // 2. 发送API请求保存进度
    // 3. 显示提示信息
    // 4. 触发其他操作
};

// 处理所有实验完成
const handleAllExperimentsComplete = (data: AllExperimentsCompleteData) => {
    console.log('所有实验完成:', data);
    console.log('实验摘要:', data.summary);

    // 显示成功提示
    showUploadSnackbar.value = true;

    // 这里可以添加自定义逻辑，例如：
    // 1. 自动生成报告
    // 2. 上传实验结果到服务器
    // 3. 跳转到结果页面
    // 4. 显示完成对话框

    // 示例：自动上传结果
    setTimeout(() => {
        handleUploadResults({
            timestamp: data.timestamp,
            totalExperiments: data.totalExperiments,
            summary: data.summary,
            status: 'completed',
        });
    }, 500);
};

// 生命周期钩子
onMounted(() => {
    // 监听来自 iframe 的消息
    window.addEventListener('message', handleIframeMessage);
    console.log('已开始监听实验完成事件');
});

onUnmounted(() => {
    // 清理事件监听器
    window.removeEventListener('message', handleIframeMessage);
    console.log('已停止监听实验完成事件');
});
</script>

<style lang="scss" scoped>
.detection-page {
    min-height: 100vh;
}
</style>
