<script setup>
import { reactive, ref, watch } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['form-change']);

// 创建表单数据的本地副本（仅保留核心参数）
const formData = reactive({
    cell_source: '',
    differentiation_timeline: '',
    stage_specific_compounds: '',
    efficiency_assessment_metrics: '',
});

// 解析时间线为阶段数组
const stages = ref([]);

// 常用细胞来源
const cellSourceOptions = [
    'hESC (人胚胎干细胞)',
    'iPSC (诱导多能干细胞)',
    'MSC (间充质干细胞)',
    'NSC (神经干细胞)',
    '其他',
];

// 核心分化因子和化合物（按功能分类）
const compoundCategories = [
    {
        name: '生长因子',
        icon: 'mdi-sprout',
        color: 'success',
        compounds: [
            { name: 'BDNF', desc: '脑源性神经营养因子' },
            { name: 'GDNF', desc: '胶质细胞源性神经营养因子' },
            { name: 'CNTF', desc: '睫状神经营养因子' },
            { name: 'IGF-1', desc: '胰岛素样生长因子' },
            { name: 'FGF2', desc: '成纤维细胞生长因子' },
        ],
    },
    {
        name: '形态发生素',
        icon: 'mdi-arrow-decision',
        color: 'primary',
        compounds: [
            { name: 'Retinoic acid (RA)', desc: '维甲酸，尾化因子' },
            { name: 'SHH', desc: '音猬因子，腹化因子' },
            { name: 'Wnt3a', desc: 'Wnt信号激活剂' },
            { name: 'GDF11', desc: '生长分化因子' },
        ],
    },
    {
        name: '小分子激动剂/抑制剂',
        icon: 'mdi-molecule',
        color: 'info',
        compounds: [
            { name: 'Purmorphamine', desc: 'SHH通路激动剂' },
            { name: 'SAG', desc: 'Smoothened激动剂' },
            { name: 'CHIR99021', desc: 'GSK3β抑制剂' },
            { name: 'SB431542', desc: 'TGF-β抑制剂' },
            { name: 'LDN-193189', desc: 'BMP抑制剂' },
            { name: 'DAPT', desc: 'Notch抑制剂' },
        ],
    },
    {
        name: '培养基补充剂',
        icon: 'mdi-test-tube',
        color: 'warning',
        compounds: [
            { name: 'Ascorbic acid', desc: '抗氧化剂' },
            { name: 'N2 supplement', desc: '神经分化培养基' },
            { name: 'B27 supplement', desc: '神经元成熟培养基' },
            { name: 'cAMP', desc: '信号分子' },
        ],
    },
];

// 解析时间线
const parseTimeline = (timeline) => {
    if (!timeline) return [];

    const stageList = [];
    const parts = timeline.split(';');

    parts.forEach((part, index) => {
        const dayMatch = part.match(/(\d+)[-+]?(\d+)?/);
        if (dayMatch) {
            const startDay = parseInt(dayMatch[1]);
            const endDay = dayMatch[2] ? parseInt(dayMatch[2]) : startDay;
            const description = part
                .replace(dayMatch[0], '')
                .trim()
                .replace(/^[,，]\s*/, '');

            stageList.push({
                id: index,
                startDay,
                endDay,
                description: description || `阶段 ${index + 1}`,
            });
        }
    });

    return stageList;
};

// 将阶段数组转换为时间线字符串
const stagesToTimeline = (stageList) => {
    return stageList
        .map((stage) => `${stage.startDay}-${stage.endDay}, ${stage.description}`)
        .join('; ');
};

// 添加新阶段
const addStage = () => {
    const lastStage = stages.value[stages.value.length - 1];
    const newStartDay = lastStage ? lastStage.endDay + 1 : 0;

    stages.value.push({
        id: Date.now(),
        startDay: newStartDay,
        endDay: newStartDay + 7,
        description: `新阶段 ${stages.value.length + 1}`,
    });

    updateTimeline();
};

// 删除阶段
const removeStage = (index) => {
    stages.value.splice(index, 1);
    updateTimeline();
};

// 更新时间线
const updateTimeline = () => {
    formData.differentiation_timeline = stagesToTimeline(stages.value);
};

// 监听props变化，更新本地表单数据
watch(
    () => props.data,
    (newData) => {
        Object.assign(formData, newData);
        stages.value = parseTimeline(newData.differentiation_timeline);
    },
    { immediate: true, deep: true }
);

// 监听表单数据变化，发送事件
watch(
    formData,
    (newFormData) => {
        emit('form-change', { ...newFormData });
    },
    { deep: true }
);

// 添加化合物到配方
const addCompound = (compoundName) => {
    if (formData.stage_specific_compounds) {
        formData.stage_specific_compounds += `; ${compoundName}`;
    } else {
        formData.stage_specific_compounds = compoundName;
    }
};
</script>

<template>
    <v-card class="pa-4" elevation="2">
        <v-card-title class="text-h5 mb-4 d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-dna</v-icon>
            分化协议参数调整
        </v-card-title>

        <v-card-text>
            <v-form>
                <!-- 细胞来源 -->
                <v-combobox
                    v-model="formData.cell_source"
                    :items="cellSourceOptions"
                    label="细胞来源"
                    variant="outlined"
                    class="mb-4"
                    prepend-inner-icon="mdi-bacteria"
                    hint="选择或输入细胞类型"
                    persistent-hint
                ></v-combobox>

                <v-divider class="mb-4"></v-divider>

                <!-- 分化时间线编辑器 -->
                <div class="mb-4">
                    <div class="d-flex align-center mb-2">
                        <label class="text-subtitle-1 font-weight-bold">分化阶段时间线</label>
                        <v-spacer></v-spacer>
                        <v-btn
                            size="small"
                            color="primary"
                            variant="tonal"
                            prepend-icon="mdi-plus"
                            @click="addStage"
                        >
                            添加阶段
                        </v-btn>
                    </div>

                    <v-expansion-panels variant="accordion" class="mb-2">
                        <v-expansion-panel
                            v-for="(stage, index) in stages"
                            :key="stage.id"
                            :title="`阶段 ${index + 1}: ${stage.startDay}-${stage.endDay}天`"
                        >
                            <v-expansion-panel-text>
                                <div class="pa-2">
                                    <div class="mb-4">
                                        <label class="text-caption mb-1 d-block"
                                            >起始天数: {{ stage.startDay }}天</label
                                        >
                                        <v-slider
                                            v-model="stage.startDay"
                                            :min="0"
                                            :max="Math.min(stage.endDay - 1, 100)"
                                            :step="1"
                                            color="success"
                                            thumb-label
                                            @update:model-value="updateTimeline"
                                        ></v-slider>
                                    </div>

                                    <div class="mb-4">
                                        <label class="text-caption mb-1 d-block"
                                            >结束天数: {{ stage.endDay }}天</label
                                        >
                                        <v-slider
                                            v-model="stage.endDay"
                                            :min="stage.startDay + 1"
                                            :max="200"
                                            :step="1"
                                            color="error"
                                            thumb-label
                                            @update:model-value="updateTimeline"
                                        ></v-slider>
                                    </div>

                                    <v-text-field
                                        v-model="stage.description"
                                        label="阶段描述"
                                        variant="outlined"
                                        density="compact"
                                        @update:model-value="updateTimeline"
                                    ></v-text-field>

                                    <v-btn
                                        size="small"
                                        color="error"
                                        variant="text"
                                        prepend-icon="mdi-delete"
                                        @click="removeStage(index)"
                                        class="mt-2"
                                    >
                                        删除此阶段
                                    </v-btn>
                                </div>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>

                    <v-alert type="info" variant="tonal" density="compact" class="mb-2">
                        <template v-slot:text>
                            <small
                                >总共 {{ stages.length }} 个阶段，持续时间:
                                {{ stages.length > 0 ? stages[stages.length - 1].endDay : 0 }}
                                天</small
                            >
                        </template>
                    </v-alert>
                </div>

                <v-divider class="mb-4"></v-divider>

                <!-- 核心分化因子库 -->
                <div class="mb-4">
                    <label class="text-subtitle-1 font-weight-bold mb-3 d-block">
                        <v-icon size="small" class="mr-1">mdi-flask</v-icon>
                        分化因子和化合物库
                    </label>

                    <v-expansion-panels variant="accordion" multiple>
                        <v-expansion-panel
                            v-for="category in compoundCategories"
                            :key="category.name"
                        >
                            <v-expansion-panel-title>
                                <v-icon :color="category.color" class="mr-2">
                                    {{ category.icon }}
                                </v-icon>
                                <span class="font-weight-medium">{{ category.name }}</span>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-chip-group column>
                                    <v-chip
                                        v-for="compound in category.compounds"
                                        :key="compound.name"
                                        :color="category.color"
                                        variant="outlined"
                                        size="small"
                                        @click="addCompound(compound.name)"
                                        class="compound-chip"
                                    >
                                        {{ compound.name }}
                                        <v-tooltip activator="parent" location="top">
                                            {{ compound.desc }}
                                        </v-tooltip>
                                    </v-chip>
                                </v-chip-group>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>

                    <v-textarea
                        v-model="formData.stage_specific_compounds"
                        label="当前分化因子配方"
                        variant="outlined"
                        rows="4"
                        class="mt-3"
                        prepend-inner-icon="mdi-beaker"
                        hint="点击上方因子快速添加，用分号(;)分隔不同阶段"
                        persistent-hint
                    ></v-textarea>
                </div>

                <v-divider class="mb-4"></v-divider>

                <!-- 评估指标 -->
                <v-textarea
                    v-model="formData.efficiency_assessment_metrics"
                    label="分化效率评估指标"
                    variant="outlined"
                    rows="3"
                    prepend-inner-icon="mdi-chart-box"
                    hint="如：HB9, ChAT, ISL1等标志物表达比例"
                    persistent-hint
                ></v-textarea>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.v-card-text {
    max-height: 600px;
    overflow-y: auto;
}

/* 自定义滚动条样式 */
.v-card-text::-webkit-scrollbar {
    width: 8px;
}

.v-card-text::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.v-card-text::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.compound-chip {
    cursor: pointer;
    transition: all 0.2s;
}

.compound-chip:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
