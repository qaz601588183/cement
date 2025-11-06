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
                src="/priment.html"
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
    </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { onMounted, onUnmounted, ref } from 'vue';
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

// 开始检测 (暂时保留，供未来使用)
// const handleStartDetection = (sample: Sample) => {
//     selectedSample.value = sample;
//     showExperiments.value = true;
// };

// 返回样品列表 (暂时保留，供未来使用)
// const handleGoBack = () => {
//     showExperiments.value = false;
// };

// 处理结果上传
const handleUploadResults = (data: any) => {
    console.log('上传检测结果：', data);

    // 这里可以调用实际的API接口
    // await api.uploadResults(data);

    // 显示成功提示
    showUploadSnackbar.value = true;

    // 可选：上传成功后返回样品列表
    setTimeout(() => {
        showExperiments.value = false;
        location.replace('/#/components/deduce');
    }, 2000);
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
