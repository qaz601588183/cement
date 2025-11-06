<template>
    <div class="deduce_page">
        <v-card>
            <!-- Tabs 切换 -->
            <v-tabs v-model="activeTab">
                <v-tab value="reverse">
                    <v-icon class="mr-2">mdi-auto-fix</v-icon>
                    反向推演
                </v-tab>
                <v-tab value="forward">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    正向推演
                </v-tab>
            </v-tabs>

            <!-- Tabs 内容 -->
            <v-window v-model="activeTab">
                <!-- 正向推演 -->
                <v-window-item value="forward">
                    <div class="pa-4">
                        <!-- 步骤1：参数微调与推演 -->
                        <Step1
                            v-show="forwardStep === 1"
                            :form-data="forwardData"
                            @back="handleForwardBack"
                            @next="goToForwardVisualization"
                            @form-change="handleForwardFormChange"
                        />

                        <!-- 步骤2：可视化分析 -->
                        <Step2
                            v-if="forwardStep === 2"
                            :data="forwardData"
                            @back="backToForwardStep1"
                            @export="handleForwardExport"
                        />
                    </div>
                </v-window-item>

                <!-- 反向推演 -->
                <v-window-item value="reverse">
                    <div class="pa-4">
                        <!-- 步骤1：参数输入与优化 -->
                        <ReverseStep1
                            v-show="reverseStep === 1"
                            @back="handleReverseBack"
                            @next="goToReverseResult"
                            @form-change="handleReverseFormChange"
                        />

                        <!-- 步骤2：优化结果展示 -->
                        <ReverseStep2
                            v-if="reverseStep === 2"
                            :data="reverseData"
                            @back="backToReverseStep1"
                            @apply="handleApplyOptimization"
                        />
                    </div>
                </v-window-item>
            </v-window>
        </v-card>

        <!-- 成功提示 Snackbar -->
        <v-snackbar v-model="showSnackbar" :timeout="4000" color="success" location="top">
            <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-check-circle</v-icon>
                <span>{{ snackbarMessage }}</span>
            </div>
            <template v-slot:actions>
                <v-btn variant="text" @click="showSnackbar = false">关闭</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { useConcreteStore } from '@/stores/useConcreteStore';
import { onMounted, ref, watch } from 'vue';
// @ts-ignore
import Step1 from './components/Step1.vue';
// @ts-ignore
import Step2 from './components/Step2.vue';
// @ts-ignore
import ReverseStep1 from './components/ReverseStep1.vue';
// @ts-ignore
import ReverseStep2 from './components/ReverseStep2.vue';

// 获取混凝土数据store
const concreteStore = useConcreteStore();

// Tab 控制
const activeTab = ref('forward');

// Snackbar 状态
const showSnackbar = ref(false);
const snackbarMessage = ref('');

// ========== 正向推演状态 ==========
const forwardStep = ref(1);
const forwardData = ref<any>({
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

// 正向推演：返回到上一步（对外部的回调）
const handleForwardBack = () => {
    console.log('正向推演：返回上一步');
    concreteStore.clearConcreteData();
};

// 正向推演：返回Step1（参数调整页）
const backToForwardStep1 = () => {
    forwardStep.value = 1;
};

// 正向推演：表单变化处理
const handleForwardFormChange = (formData: any) => {
    forwardData.value = { ...forwardData.value, ...formData };
};

// 正向推演：进入可视化页面
const goToForwardVisualization = () => {
    forwardStep.value = 2;
};

// 正向推演：导出结果
const handleForwardExport = () => {
    console.log('正向推演：导出结果');
};

// ========== 反向推演状态 ==========
const reverseStep = ref(1);
const reverseData = ref<any>(null);

// 反向推演：返回到上一步
const handleReverseBack = () => {
    console.log('反向推演：返回上一步');
    // 反向推演独立，不需要清空store
};

// 反向推演：返回Step1（参数输入页）
const backToReverseStep1 = () => {
    reverseStep.value = 1;
};

// 反向推演：表单变化处理
const handleReverseFormChange = (formData: any) => {
    reverseData.value = formData;
};

// 反向推演：进入结果页面
const goToReverseResult = () => {
    reverseStep.value = 2;
};

// 反向推演：应用优化结果
const handleApplyOptimization = (optimizedConfig: any) => {
    // 将优化后的配置应用到正向推演
    forwardData.value = {
        mixProportionParams: {
            cement: optimizedConfig.cement || 0,
            blast_furnace_slag: optimizedConfig.blast_furnace_slag || 0,
            fly_ash: optimizedConfig.fly_ash || 0,
            water: optimizedConfig.water || 0,
            superplasticizer: optimizedConfig.superplasticizer || 0,
            coarse_aggregate: optimizedConfig.coarse_aggregate || 0,
            fine_aggregate: optimizedConfig.fine_aggregate || 0,
            age: optimizedConfig.age || 28,
        },
    };

    // 切换到正向推演Tab
    activeTab.value = 'forward';
    forwardStep.value = 1;

    // 显示成功提示
    snackbarMessage.value = '✨ 优化配置已成功应用到正向推演！请点击"生成分析报告"进行验证';
    showSnackbar.value = true;
};

// 监听store数据变化，自动加载数据（仅影响正向推演）
watch(
    () => concreteStore.concreteData,
    (newData) => {
        if (newData) {
            console.log('从store接收到配合比参数（正向推演）:', newData);
            forwardData.value = { ...newData };

            // 重置到正向推演的第一步
            activeTab.value = 'forward';
            forwardStep.value = 1;
        }
    },
    { immediate: true }
);

// 组件挂载时检查是否有初始数据（仅影响正向推演）
onMounted(() => {
    if (concreteStore.hasData() && concreteStore.concreteData) {
        forwardData.value = { ...concreteStore.concreteData };
        activeTab.value = 'forward';
        forwardStep.value = 1;
    }
});
</script>

<style lang="scss">
.deduce_page {
    // 样式可以根据需要添加
}
</style>
