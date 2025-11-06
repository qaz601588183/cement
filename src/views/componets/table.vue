<template>
    <div class="tables_page">
        <!-- 步骤1：参数微调与推演 -->
        <Step1
            v-show="currentStep === 1"
            :form-data="currentItemData"
            @back="handleBack"
            @next="goToVisualization"
            @form-change="handleFormChange"
        />

        <!-- 步骤2：可视化分析 -->
        <Step2
            v-if="currentStep === 2"
            :data="currentItemData"
            @back="backToStep1"
            @export="handleExport"
        />
    </div>
</template>

<script setup lang="ts">
import { useConcreteStore } from '@/stores/useConcreteStore';
import { onMounted, ref, watch } from 'vue';
// @ts-ignore
import Step1 from './components/Step1.vue';
// @ts-ignore
import Step2 from './components/Step2.vue';

// 获取混凝土数据store
const concreteStore = useConcreteStore();

// 步骤相关 (现在只有2步：Step1参数调整 -> Step2可视化)
const currentStep = ref(1);

// 当前处理的项目数据
const currentItemData = ref<any>({
    mixProportionParams: {
        cement: 380,
        blast_furnace_slag: 50,
        fly_ash: 60,
        water: 170,
        superplasticizer: 5,
        coarse_aggregate: 1100,
        fine_aggregate: 650,
        age: 28,
    },
});

// 返回到上一步（对外部的回调）
const handleBack = () => {
    console.log('返回上一步，可以通过此回调通知外部系统');
    // 可以emit事件给父组件，或者清空store数据
    concreteStore.clearConcreteData();
};

// 返回Step1（参数调整页）
const backToStep1 = () => {
    currentStep.value = 1;
};

// 表单变化处理
const handleFormChange = (formData: any) => {
    currentItemData.value = { ...currentItemData.value, ...formData };
};

// 进入可视化页面
const goToVisualization = () => {
    currentStep.value = 2;
};

// 导出结果
const handleExport = () => {
    console.log('导出结果');
};

// 监听store数据变化，自动加载数据（不自动开始训练）
watch(
    () => concreteStore.concreteData,
    (newData) => {
        if (newData) {
            console.log('从store接收到配合比参数:', newData);
            currentItemData.value = { ...newData };

            // 重置到第一步，但不开始训练（等Step3接收参数后由Step3控制）
            currentStep.value = 1;
        }
    },
    { immediate: true }
);

// 组件挂载时检查是否有初始数据
onMounted(() => {
    if (concreteStore.hasData() && concreteStore.concreteData) {
        currentItemData.value = { ...concreteStore.concreteData };
        currentStep.value = 1;
    }
});
</script>

<style lang="scss">
.tables_page {
    // 样式可以根据需要添加
}
</style>
