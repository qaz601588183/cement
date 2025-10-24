<template>
    <v-card class="my-4 query-card">
        <v-card-title class="text-h6">水泥质量报告查询</v-card-title>
        <v-divider></v-divider>
        <v-form ref="formRef" @submit.prevent="handleQuery">
            <div class="search-bar ma-4">
                <v-row dense>
                    <!-- 第一行：报告名称 -->
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="query.reportName"
                            clearable
                            label="报告名称"
                            placeholder="例如：2024-001-C30混凝土抗压强度检测报告"
                            prepend-inner-icon="mdi-file-document"
                            density="compact"
                            variant="outlined"
                            :rules="[(v: any) => !!v || '请输入报告名称']"
                            hint="输入检测报告或试验报告名称"
                            persistent-hint
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="query.infoType"
                            :items="infoTypeOptions"
                            label="报告类型"
                            density="compact"
                            variant="outlined"
                            :rules="[(v: any) => !!v || '请选择报告类型']"
                            hint="选择报告来源类型"
                            persistent-hint
                        ></v-select>
                    </v-col>

                    <!-- 第二行：三个影响因素筛选 -->
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="query.materialFactor"
                            :items="materialFactorOptions"
                            label="原材料因素"
                            density="compact"
                            variant="outlined"
                            clearable
                            hint="选择原材料相关因素"
                            persistent-hint
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="query.mixRatioFactor"
                            :items="mixRatioFactorOptions"
                            label="配合比因素"
                            density="compact"
                            variant="outlined"
                            clearable
                            hint="选择配合比相关因素"
                            persistent-hint
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="query.curingFactor"
                            :items="curingFactorOptions"
                            label="养护因素"
                            density="compact"
                            variant="outlined"
                            clearable
                            hint="选择养护相关因素"
                            persistent-hint
                        ></v-select>
                    </v-col>

                    <!-- 查询按钮 -->
                    <v-col cols="12" class="d-flex justify-center">
                        <v-btn
                            class="btn"
                            variant="tonal"
                            prepend-icon="mdi-database-search"
                            color="primary"
                            size="large"
                            :loading="loading"
                            :disabled="loading"
                            @click="handleQuery"
                        >
                            {{ loading ? '正在抓取报告...' : '查询报告' }}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

defineProps<{
    loading: boolean;
}>();

const emit = defineEmits<{
    query: [];
}>();

// 表单引用
const formRef = ref<any>();

// 查询条件
const query = reactive({
    reportName: '',
    infoType: '',
    materialFactor: '',
    mixRatioFactor: '',
    curingFactor: '',
});

// 报告类型选项
const infoTypeOptions = ['工程现场抽查', '委托检测'];

// 原材料因素选项
const materialFactorOptions = [
    '水泥品种与强度等级',
    '水泥细度',
    '骨料粒形',
    '骨料级配',
    '骨料含泥量',
    '骨料杂质',
];

// 配合比因素选项
const mixRatioFactorOptions = [
    '水灰比',
    '普通减水剂',
    '高效减水剂',
    '早强剂',
    '引气剂',
    '缓凝剂',
    '膨胀剂',
];

// 养护因素选项
const curingFactorOptions = [
    '养护温度-标准温度(20±2°C)',
    '养护温度-高温',
    '养护温度-低温(<5°C)',
    '养护温度-冰点(<0°C)',
    '养护湿度-标准湿度(≥95%)',
    '养护湿度-低湿度',
    '养护龄期-7天',
    '养护龄期-28天',
    '养护龄期-90天',
];

// 处理查询
const handleQuery = async () => {
    const { valid } = await formRef.value.validate();
    if (valid) {
        emit('query');
    }
};
</script>

<style lang="scss" scoped>
.search-bar {
    :deep(.v-col) {
        padding-top: 8px;
        padding-bottom: 8px;
    }
}

.btn {
    min-width: 200px;
}
</style>
