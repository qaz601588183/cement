<template>
    <div class="detection-page">
        <v-container fluid>
            <!-- 显示样品列表 -->
            <detection-1 v-if="!showExperiments" @start-detection="handleStartDetection" />

            <!-- 显示实验检测 -->
            <detection-2
                v-else
                :current-sample="selectedSample"
                @go-back="handleGoBack"
                @upload-results="handleUploadResults"
            />
        </v-container>

        <!-- 上传成功提示 -->
        <v-snackbar v-model="showUploadSnackbar" :timeout="3000" color="success">
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            检测结果已成功上传分析！
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Detection1 from './components/detection_1.vue';
import Detection2 from './components/detection_2.vue';

// 类型定义
interface Sample {
    id: number;
    code: string;
    name: string;
    isSubsampled: boolean;
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

// 开始检测
const handleStartDetection = (sample: Sample) => {
    selectedSample.value = sample;
    showExperiments.value = true;
};

// 返回样品列表
const handleGoBack = () => {
    showExperiments.value = false;
};

// 处理结果上传
const handleUploadResults = (data: any) => {
    console.log('上传检测结果：', data);

    // 这里可以调用实际的API接口
    // await api.uploadResults(data);

    // 显示成功提示
    showUploadSnackbar.value = true;

    // 可选：上传成功后返回样品列表
    // setTimeout(() => {
    //     showExperiments.value = false;
    // }, 2000);
};
</script>

<style lang="scss" scoped>
.detection-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 16px;
}
</style>
