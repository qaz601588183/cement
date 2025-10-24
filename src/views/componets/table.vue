<template>
    <div class="tables_page">
        <!-- 步骤1：查询表单 -->
        <Step1 v-show="currentStep === 1" :loading="loading" @query="handleQuery" />

        <!-- 步骤2：数据列表展示 -->
        <Step2
            v-show="currentStep === 2"
            :loading="loading"
            :data-list="dataList"
            :total-pages="pagination.totalPages"
            @back="backToStep1"
            @view-detail="handleViewDetail"
            @process="handleProcess"
            @page-change="handlePageChange"
            @pdf-imported="handlePdfImported"
        />

        <!-- 步骤3：模型训练与参数微调 -->
        <Step3
            v-show="currentStep === 3"
            :training="training"
            :training-progress="trainingProgress"
            :training-stage="trainingStage"
            :estimated-time="estimatedTime"
            :training-stages="trainingStages"
            :form-data="currentItemData"
            @back="backToStep2"
            @next="goToVisualization"
            @form-change="handleFormChange"
        />

        <!-- 步骤4：模型可视化 -->
        <Step4
            v-if="currentStep === 4"
            :data="currentItemData"
            @back="backToStep3"
            @export="handleExport"
        />

        <!-- 详情对话框 -->
        <v-dialog v-model="detailDialog" width="900">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>检测报告详情</span>
                    <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <div v-if="currentDetailItem">
                        <v-row>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">报告编号：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.reportNumber }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">报告类型：</div>
                                    <div class="detail-value">
                                        <v-chip
                                            :color="
                                                currentDetailItem.reportType === '工程现场抽查'
                                                    ? 'orange'
                                                    : 'blue'
                                            "
                                            size="small"
                                        >
                                            {{ currentDetailItem.reportType }}
                                        </v-chip>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">工程名称：</div>
                                    <div class="detail-value font-weight-bold">
                                        {{ currentDetailItem.projectName }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="detail-item">
                                    <div class="detail-label">检测日期：</div>
                                    <div class="detail-value">{{ currentDetailItem.testDate }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="detail-item">
                                    <div class="detail-label">强度等级：</div>
                                    <div class="detail-value">
                                        <v-chip color="primary" variant="outlined">{{
                                            currentDetailItem.strength_grade
                                        }}</v-chip>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="detail-item">
                                    <div class="detail-label">实测强度：</div>
                                    <div class="detail-value">
                                        <span class="text-h6 font-weight-bold text-success">{{
                                            currentDetailItem.actual_strength
                                        }}</span>
                                        <span class="text-caption text-grey ml-1">MPa</span>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-divider class="my-2"></v-divider>
                                <div class="text-subtitle-2 text-grey mb-2">原材料信息</div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">水泥类型：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.cement_type }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">水泥细度：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.cement_fineness }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">骨料信息：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.aggregate_info }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-divider class="my-2"></v-divider>
                                <div class="text-subtitle-2 text-grey mb-2">配合比信息</div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">水灰比：</div>
                                    <div class="detail-value">
                                        <v-chip color="primary" size="small">{{
                                            currentDetailItem.water_cement_ratio
                                        }}</v-chip>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="detail-item">
                                    <div class="detail-label">养护龄期：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.curing_age }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">外加剂：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.admixture }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-divider class="my-2"></v-divider>
                                <div class="text-subtitle-2 text-grey mb-2">养护信息</div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">养护条件：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.curing_condition }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-divider class="my-2"></v-divider>
                                <div class="text-subtitle-2 text-grey mb-2">检测信息</div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">检测标准：</div>
                                    <div class="detail-value">
                                        {{ currentDetailItem.test_method }}
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">结论：</div>
                                    <div class="detail-value">
                                        <v-chip
                                            :color="
                                                currentDetailItem.conclusion?.includes('优')
                                                    ? 'success'
                                                    : currentDetailItem.conclusion?.includes('合格')
                                                      ? 'primary'
                                                      : currentDetailItem.conclusion?.includes(
                                                              '基本'
                                                          )
                                                        ? 'warning'
                                                        : 'grey'
                                            "
                                            variant="flat"
                                        >
                                            {{ currentDetailItem.conclusion }}
                                        </v-chip>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div class="detail-item">
                                    <div class="detail-label">文件名：</div>
                                    <div class="detail-value text-caption text-grey">
                                        {{ currentDetailItem.filename }}
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { mockData } from './mock';
// @ts-ignore
import Step1 from './components/Step1.vue';
// @ts-ignore
import Step2 from './components/Step2.vue';
// @ts-ignore
import Step3 from './components/Step3.vue';
// @ts-ignore
import Step4 from './components/Step4.vue';

// ==================== 配置变量 ====================
// 数据抓取等待时间（毫秒）- 生产环境建议 25000 (25秒)
const FETCH_DATA_DURATION = 2000; // 2秒，用于调试

// 模型训练等待时间（毫秒）- 生产环境建议 25000 (25秒)
const MODEL_TRAINING_DURATION = 2000; // 2秒，用于调试
// =================================================

// 步骤相关
const currentStep = ref(1);

// Loading状态
const loading = ref(false);

// 数据列表
const dataList = ref<any[]>([]);

// 分页
const pagination = reactive({
    page: 1,
    pageSize: 10,
    totalPages: 1,
});

// 详情对话框
const detailDialog = ref(false);
const currentDetailItem = ref<any>(null);

// 当前处理的项目数据
const currentItemData = ref<any>({
    year: '',
    journal: '',
    cell_source: '',
    differentiation_timeline: '',
    stage_specific_compounds: '',
    efficiency_assessment_metrics: '',
    doi: '',
    citation: '',
});

// 训练状态
const training = ref(false);
const trainingProgress = ref(0);
const trainingStage = ref('');
const estimatedTime = ref(30);

// 训练阶段列表
const trainingStages = ref([
    {
        title: '数据预处理',
        description: '解析和清洗论文数据',
        active: false,
        completed: false,
    },
    {
        title: '特征提取',
        description: '提取关键分化参数和化合物信息',
        active: false,
        completed: false,
    },
    {
        title: '模型构建',
        description: '基于深度学习构建分化预测模型',
        active: false,
        completed: false,
    },
    {
        title: '参数优化',
        description: '自动调整和优化模型参数',
        active: false,
        completed: false,
    },
    {
        title: '验证测试',
        description: '验证模型准确性和稳定性',
        active: false,
        completed: false,
    },
]);

// 处理查询
const handleQuery = async () => {
    loading.value = true;
    currentStep.value = 2;

    // 模拟数据抓取时间
    setTimeout(() => {
        // 转换数据格式 - 使用水泥质量报告字段
        dataList.value = mockData.map((item, index) => {
            const content = item.extractContent;
            return {
                id: `#${String(index + 1).padStart(4, '0')}`,
                type: 'PDF',
                filename: item.filename,
                // 水泥质量报告字段
                reportNumber: content.reportNumber,
                reportType: content.reportType,
                projectName: content.projectName,
                testDate: content.testDate,
                strength_grade: content.strength_grade,
                actual_strength: content.actual_strength,
                cement_type: content.cement_type,
                cement_fineness: content.cement_fineness,
                water_cement_ratio: content.water_cement_ratio,
                aggregate_info: content.aggregate_info,
                admixture: content.admixture,
                curing_condition: content.curing_condition,
                curing_age: content.curing_age,
                test_method: content.test_method,
                conclusion: content.conclusion,
            };
        });

        pagination.totalPages = Math.ceil(dataList.value.length / pagination.pageSize);
        loading.value = false;
    }, FETCH_DATA_DURATION);
};

// 返回步骤1
const backToStep1 = () => {
    currentStep.value = 1;
    dataList.value = [];
    pagination.page = 1;
};

// 返回步骤2
const backToStep2 = () => {
    currentStep.value = 2;
    training.value = false;
    trainingProgress.value = 0;
};

// 返回步骤3
const backToStep3 = () => {
    currentStep.value = 3;
};

// 查看详情
const handleViewDetail = (item: any) => {
    currentDetailItem.value = item;
    detailDialog.value = true;
};

// 处理数据 - 进入步骤3
const handleProcess = (item: any) => {
    console.log('处理数据:', item);
    currentItemData.value = { ...item };
    currentStep.value = 3;
    training.value = true;
    trainingProgress.value = 0;
    estimatedTime.value = Math.ceil(MODEL_TRAINING_DURATION / 1000);

    // 重置训练阶段
    trainingStages.value.forEach((stage) => {
        stage.active = false;
        stage.completed = false;
    });

    // 模拟训练过程
    simulateTraining();
};

// 模拟训练过程
const simulateTraining = () => {
    const totalTime = MODEL_TRAINING_DURATION;
    let currentStageIndex = 0;

    trainingStages.value[0].active = true;
    trainingStage.value = trainingStages.value[0].title;

    const interval = setInterval(() => {
        trainingProgress.value += 100 / (totalTime / 200);
        estimatedTime.value = Math.ceil(
            ((100 - trainingProgress.value) / 100) * (totalTime / 1000)
        );

        // 更新训练阶段
        const targetStage = Math.floor(
            (trainingProgress.value / 100) * trainingStages.value.length
        );
        if (targetStage > currentStageIndex && targetStage < trainingStages.value.length) {
            trainingStages.value[currentStageIndex].active = false;
            trainingStages.value[currentStageIndex].completed = true;
            currentStageIndex = targetStage;
            trainingStages.value[currentStageIndex].active = true;
            trainingStage.value = trainingStages.value[currentStageIndex].title;
        }

        if (trainingProgress.value >= 100) {
            clearInterval(interval);
            trainingStages.value[currentStageIndex].active = false;
            trainingStages.value[currentStageIndex].completed = true;
            training.value = false;
            trainingProgress.value = 100;
            estimatedTime.value = 0;
        }
    }, 200);
};

// 表单变化处理
const handleFormChange = (formData: any) => {
    currentItemData.value = { ...currentItemData.value, ...formData };
};

// 进入可视化页面
const goToVisualization = () => {
    currentStep.value = 4;
};

// 导出结果
const handleExport = () => {
    console.log('导出结果');
};

// 分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    // 这里可以加载对应页的数据
};

// 处理PDF导入
const handlePdfImported = (importedData: any[]) => {
    console.log('导入的PDF数据:', importedData);

    // 将导入的数据转换为列表格式
    const newItems = importedData.map((item, index) => {
        const existingCount = dataList.value.length;
        return {
            id: `#I${String(existingCount + index + 1).padStart(4, '0')}`,
            type: 'PDF',
            filename: `导入文献 ${existingCount + index + 1}`,
            year: item.year || '-',
            journal: item.journal || '-',
            citations: Math.floor(Math.random() * 300) + 50,
            confidence: Math.floor(Math.random() * 15) + 85,
            summary: item.citation || '-',
            citation: item.citation,
            cell_source: item.cell_source,
            differentiation_timeline: item.differentiation_timeline,
            stage_specific_compounds: item.stage_specific_compounds,
            efficiency_assessment_metrics: item.efficiency_assessment_metrics,
            doi: item.doi,
            imported: true, // 标记为导入的文献
        };
    });

    // 添加到数据列表开头
    dataList.value = [...newItems, ...dataList.value];

    // 更新分页
    pagination.totalPages = Math.ceil(dataList.value.length / pagination.pageSize);

    console.log(`成功导入 ${newItems.length} 篇文献`);
};
</script>

<style lang="scss">
.tables_page {
    .detail-item {
        margin-bottom: 16px;
        .detail-label {
            font-weight: 600;
            color: #666;
            margin-bottom: 4px;
        }
        .detail-value {
            color: #333;
            line-height: 1.6;
        }
    }
}
</style>
