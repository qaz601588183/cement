<template>
    <v-card class="my-4">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">混凝土强度推演与参数优化</span>
        </v-card-title>
        <v-divider></v-divider>

        <!-- 推演 Loading 状态 -->
        <div v-if="isAnalyzing" class="text-center pa-10">
            <!-- Vuetify 加载动画 -->
            <div class="loading-container mb-6">
                <v-progress-circular
                    :model-value="analysisProgress"
                    :size="200"
                    :width="15"
                    color="primary"
                    class="mb-4"
                >
                    <div class="text-h4 font-weight-bold text-primary">
                        {{ Math.ceil(analysisProgress) }}%
                    </div>
                </v-progress-circular>
            </div>
            <div class="mt-6">
                <div class="text-h5 mb-4 font-weight-bold">{{ analysisStage }}</div>
                <v-progress-linear
                    :model-value="analysisProgress"
                    :color="getProgressColor(analysisProgress)"
                    :bg-color="getProgressColor(analysisProgress)"
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

            <!-- 分析步骤列表 -->
            <v-timeline
                side="end"
                align="start"
                density="compact"
                truncate-line="both"
                class="mt-8 mx-auto training-timeline"
                style="max-width: 600px"
            >
                <v-timeline-item
                    v-for="(stage, index) in analysisStages"
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

        <!-- 参数调整界面 -->
        <div v-else class="pa-4">
            <v-alert type="info" variant="tonal" class="mb-4">
                <template v-slot:text>
                    <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-tune</v-icon>
                        <div>
                            <strong>智能推演模式：</strong
                            >通过调整关键参数，实时预测混凝土强度变化。您可以尝试不同的配合比和养护条件，直观了解各因素对强度的影响。
                        </div>
                    </div>
                </template>
            </v-alert>

            <!-- 实验检测数据展示 -->
            <v-card v-if="hasDetectionData" class="mb-4">
                <v-card-title class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                        <v-icon class="mr-2" color="success">mdi-test-tube</v-icon>
                        <span>智慧实验室检测数据</span>
                    </div>
                    <v-chip color="success" size="small">
                        <v-icon start size="small">mdi-check-circle</v-icon>
                        已获取
                    </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row>
                        <!-- 水泥检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.cement">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-package-variant</v-icon>
                                    水泥 (Cement)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">不溶物:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.cement.insoluble_matter_percent,
                                                    0,
                                                    1.5
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.cement.insoluble_matter_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤1.5%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">氧化镁:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.cement.magnesium_oxide_percent,
                                                    0,
                                                    5.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.cement.magnesium_oxide_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤5.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">氧化硫:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.cement.sulfur_trioxide_percent,
                                                    0,
                                                    4.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.cement.sulfur_trioxide_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤4.0%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 粉煤灰检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.fly_ash">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-grain</v-icon>
                                    粉煤灰 (Fly Ash)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">烧失量:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fly_ash.loss_on_ignition_percent,
                                                    0,
                                                    5.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fly_ash.loss_on_ignition_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤5.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">含水量:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fly_ash.moisture_content_percent,
                                                    0,
                                                    1.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fly_ash.moisture_content_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤1.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">三氧化硫:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fly_ash.sulfur_trioxide_percent,
                                                    0,
                                                    3.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fly_ash.sulfur_trioxide_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤3.0%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 高炉矿渣检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.blast_furnace_slag">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-cube-outline</v-icon>
                                    高炉矿渣 (Slag)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">三氧化硫:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.blast_furnace_slag
                                                        .sulfur_trioxide_percent,
                                                    0,
                                                    4.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.blast_furnace_slag.sulfur_trioxide_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤4.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">氯离子:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.blast_furnace_slag
                                                        .chloride_ion_percent,
                                                    0,
                                                    0.06
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.blast_furnace_slag.chloride_ion_percent.toFixed(
                                                    3
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤0.06%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 水检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.water">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-water</v-icon>
                                    水 (Water)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">pH值:</span>
                                        <span
                                            :class="
                                                getStatusClassForPh(
                                                    detectionData.water.ph_value,
                                                    4.5
                                                )
                                            "
                                        >
                                            {{ detectionData.water.ph_value.toFixed(2) }}
                                        </span>
                                        <span class="detection-range">≥4.5</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">不溶物:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.water.insoluble_matter_mg_per_L,
                                                    0,
                                                    2000
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.water.insoluble_matter_mg_per_L.toFixed(
                                                    0
                                                )
                                            }}
                                            mg/L
                                        </span>
                                        <span class="detection-range">≤2000 mg/L</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 高效减水剂检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.superplasticizer">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-flask</v-icon>
                                    高效减水剂 (SP)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">含水率(粉):</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.superplasticizer
                                                        .moisture_content_percent_powder,
                                                    0,
                                                    5.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.superplasticizer.moisture_content_percent_powder.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤5.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">密度偏差:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.superplasticizer
                                                        .density_tolerance_g_per_cm3,
                                                    0,
                                                    0.03
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.superplasticizer.density_tolerance_g_per_cm3.toFixed(
                                                    3
                                                )
                                            }}
                                            g/cm³
                                        </span>
                                        <span class="detection-range">≤±0.03</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">氯离子:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.superplasticizer
                                                        .chloride_ion_percent,
                                                    0,
                                                    0.2
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.superplasticizer.chloride_ion_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤0.20%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 粗骨料检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.coarse_aggregate">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-texture-box</v-icon>
                                    粗骨料 (CA)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">针片状:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.coarse_aggregate
                                                        .flaky_elongated_particles_percent,
                                                    0,
                                                    15.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.coarse_aggregate.flaky_elongated_particles_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤15.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">含泥量:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.coarse_aggregate
                                                        .clay_content_percent,
                                                    0,
                                                    2.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.coarse_aggregate.clay_content_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤2.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">压碎指标:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.coarse_aggregate
                                                        .crushing_value_percent,
                                                    0,
                                                    10.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.coarse_aggregate.crushing_value_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤10.0%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- 细骨料检测数据 -->
                        <v-col cols="12" md="6" lg="4" v-if="detectionData?.fine_aggregate">
                            <v-card variant="outlined" class="detection-item-card">
                                <v-card-title class="text-subtitle-1 pb-2">
                                    <v-icon class="mr-2" size="small">mdi-grain</v-icon>
                                    细骨料 (FA)
                                </v-card-title>
                                <v-card-text class="pt-0">
                                    <div class="detection-item">
                                        <span class="detection-label">含泥量:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fine_aggregate
                                                        .clay_content_percent,
                                                    0,
                                                    3.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fine_aggregate.clay_content_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤3.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">云母含量:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fine_aggregate
                                                        .mica_content_percent,
                                                    0,
                                                    2.0
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fine_aggregate.mica_content_percent.toFixed(
                                                    2
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤2.0%</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">氯离子:</span>
                                        <span
                                            :class="
                                                getStatusClass(
                                                    detectionData.fine_aggregate
                                                        .chloride_ion_percent,
                                                    0,
                                                    0.02
                                                )
                                            "
                                        >
                                            {{
                                                detectionData.fine_aggregate.chloride_ion_percent.toFixed(
                                                    3
                                                )
                                            }}%
                                        </span>
                                        <span class="detection-range">≤0.02%</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 预设配置选择 -->
            <v-card class="mb-4">
                <v-card-title>
                    <v-icon class="mr-2">mdi-book-open-variant</v-icon>
                    快速预设配置
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="3" v-for="preset in presetConfigs" :key="preset.name">
                            <v-btn
                                block
                                :variant="selectedPreset === preset.name ? 'flat' : 'tonal'"
                                :color="preset.color"
                                @click="applyPreset(preset.name)"
                                :prepend-icon="
                                    selectedPreset === preset.name
                                        ? 'mdi-check-circle'
                                        : 'mdi-clipboard-text'
                                "
                            >
                                {{ preset.label }}
                            </v-btn>
                            <div class="text-caption text-center mt-1 text-grey">
                                {{ preset.description }}
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 可调参数面板 - 8个关键参数 -->
            <v-card class="mb-4">
                <v-card-title>
                    <v-icon class="mr-2">mdi-tune-variant</v-icon>
                    配合比参数调整 - 实时推演
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-row>
                        <!-- 参数1: 水泥用量 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-package-variant-closed</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >水泥用量</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">C</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.cement }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.cement"
                                    :min="200"
                                    :max="600"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">600</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    水泥用量直接影响强度，最优范围350-450kg/m³
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数2: 高炉矿渣 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-cube-outline</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >高炉矿渣</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">S</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.blast_furnace_slag }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.blast_furnace_slag"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    后期水化，改善耐久性
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数3: 粉煤灰 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-grain</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">粉煤灰</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >FA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.fly_ash }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.fly_ash"
                                    :min="0"
                                    :max="200"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">200</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    微粉填充，后期强度发展
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数4: 水用量 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-water</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">水用量</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat">W</v-chip>
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.water }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.water"
                                    :min="100"
                                    :max="250"
                                    :step="5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">100</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">250</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    水灰比=水/水泥，越低强度越高
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数5: 高效减水剂 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-flask</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold"
                                            >高效减水剂</span
                                        >
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >SP</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.superplasticizer }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.superplasticizer"
                                    :min="0"
                                    :max="15"
                                    :step="0.5"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">0</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">15</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    保持低水灰比，提升强度
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数6: 粗骨料 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-texture-box</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold">粗骨料</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >CA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.coarse_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.coarse_aggregate"
                                    :min="800"
                                    :max="1300"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">800</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">1300</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    提供骨架，最优范围1000-1200kg/m³
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数7: 细骨料 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2">mdi-grain</v-icon>
                                        <span class="text-subtitle-1 font-weight-bold">细骨料</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >FA</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.fine_aggregate }} kg/m³
                                </div>
                                <v-slider
                                    v-model="editableParams.fine_aggregate"
                                    :min="500"
                                    :max="900"
                                    :step="10"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">500</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">900</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    影响工作性和密实度
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 参数8: 龄期 -->
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="pa-4 param-card">
                                <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center">
                                        <v-icon color="primary" class="mr-2"
                                            >mdi-calendar-clock</v-icon
                                        >
                                        <span class="text-subtitle-1 font-weight-bold">龄期</span>
                                    </div>
                                    <v-chip size="x-small" color="primary" variant="flat"
                                        >Age</v-chip
                                    >
                                </div>
                                <div class="text-h5 text-center mb-2 font-weight-bold text-primary">
                                    {{ editableParams.age }} 天
                                </div>
                                <v-slider
                                    v-model="editableParams.age"
                                    :min="7"
                                    :max="90"
                                    :step="1"
                                    color="primary"
                                    track-color="grey-lighten-2"
                                    thumb-label
                                    @update:model-value="handleParameterChange"
                                >
                                    <template v-slot:prepend>
                                        <v-chip size="x-small">7天</v-chip>
                                    </template>
                                    <template v-slot:append>
                                        <v-chip size="x-small">90天</v-chip>
                                    </template>
                                </v-slider>
                                <div class="text-caption text-grey text-center">
                                    <v-icon size="x-small">mdi-lightbulb-outline</v-icon>
                                    标准测试龄期为28天，最小为7天
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- 计算指标显示 -->
                    <v-divider class="my-6"></v-divider>

                    <!-- 强度预测卡片 -->
                    <v-row>
                        <v-col cols="12">
                            <v-card
                                class="strength-compare-card"
                                elevation="3"
                                color="primary"
                                variant="tonal"
                            >
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- 生成报告按钮 -->
            <div class="d-flex justify-end mt-4">
                <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-file-chart"
                    @click="generateReport"
                    :loading="isGeneratingReport"
                >
                    生成分析报告
                    <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import PredictAPI, { type PredictRequest } from '@/api/predict';
import {
    useConcreteStore,
    type DetectionResults,
    type MixProportionParams,
} from '@/stores/useConcreteStore';
import { calculateConcreteStrength, type ConcreteParameters } from '@/utils/concreteStrengthModel';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// 获取store和router
const concreteStore = useConcreteStore();
const router = useRouter();

// 状态
const isAnalyzing = ref(false);
const analysisProgress = ref(0);
const analysisStage = ref('');
const estimatedTime = ref(2);
const isGeneratingReport = ref(false);
const selectedPreset = ref<string | null>(null);

// 可编辑的参数 - 从store初始化
const editableParams = ref<MixProportionParams>({
    ...concreteStore.forwardData.mixProportionParams,
});

// 检测数据 - 从store获取
const detectionData = computed<any>(() => {
    return concreteStore.concreteData || null;
});

// 是否有检测数据
const hasDetectionData = computed(() => {
    return detectionData.value !== null && Object.keys(detectionData.value).length > 0;
});

// 预设配置
const presetConfigs = [
    {
        name: 'c30',
        label: 'C30普通混凝土',
        description: '适用于一般建筑结构',
        color: 'primary',
        params: {
            cement: 300,
            blast_furnace_slag: 0,
            fly_ash: 0,
            water: 185,
            superplasticizer: 3,
            coarse_aggregate: 1050,
            fine_aggregate: 850,
            age: 28,
        },
    },
    {
        name: 'c40',
        label: 'C40高性能混凝土',
        description: '适用于高层建筑、桥梁',
        color: 'success',
        params: {
            cement: 380,
            blast_furnace_slag: 50,
            fly_ash: 30,
            water: 170,
            superplasticizer: 8,
            coarse_aggregate: 1000,
            fine_aggregate: 800,
            age: 28,
        },
    },
    {
        name: 'c50',
        label: 'C50高强混凝土',
        description: '适用于超高层、重要结构',
        color: 'warning',
        params: {
            cement: 450,
            blast_furnace_slag: 100,
            fly_ash: 50,
            water: 160,
            superplasticizer: 12,
            coarse_aggregate: 980,
            fine_aggregate: 780,
            age: 28,
        },
    },
    {
        name: 'lowwater',
        label: '低水灰比混凝土',
        description: '适用于耐久性要求高的工程',
        color: 'info',
        params: {
            cement: 400,
            blast_furnace_slag: 150,
            fly_ash: 80,
            water: 150,
            superplasticizer: 15,
            coarse_aggregate: 950,
            fine_aggregate: 750,
            age: 28,
        },
    },
];

// 分析阶段
const analysisStages = ref([
    {
        title: '参数解析',
        description: '解析配合比参数',
        active: false,
        completed: false,
    },
    {
        title: '强度计算',
        description: '基于AI模型计算预测强度',
        active: false,
        completed: false,
    },
    {
        title: '因素分析',
        description: '分析各因素影响权重',
        active: false,
        completed: false,
    },
    {
        title: '完成',
        description: '准备展示结果',
        active: false,
        completed: false,
    },
]);

// 计算属性

// 水灰比
const waterCementRatio = computed(() => {
    if (editableParams.value.cement === 0) return 0;
    return (editableParams.value.water / editableParams.value.cement).toFixed(2);
});

// 胶凝材料总量
const totalCementitious = computed(() => {
    return (
        editableParams.value.cement +
        editableParams.value.blast_furnace_slag +
        editableParams.value.fly_ash
    );
});

// 砂率
const sandRatio = computed(() => {
    const total = editableParams.value.fine_aggregate + editableParams.value.coarse_aggregate;
    if (total === 0) return 0;
    return ((editableParams.value.fine_aggregate / total) * 100).toFixed(1);
});

// 预测强度
const predictedStrength = computed(() => {
    // 将配合比参数转换为ConcreteParameters
    const params: ConcreteParameters = {
        cement_content: editableParams.value.cement,
        water_cement_ratio: parseFloat(String(waterCementRatio.value)),
        water_reducer_dosage:
            (editableParams.value.superplasticizer / editableParams.value.cement) * 100, // 转换为百分比
        curing_temperature: 20, // 假设标准养护温度
        curing_days: editableParams.value.age,
        fly_ash_dosage: (editableParams.value.fly_ash / totalCementitious.value) * 100,
        slag_dosage: (editableParams.value.blast_furnace_slag / totalCementitious.value) * 100,
        coarse_aggregate_content: editableParams.value.coarse_aggregate,
        fine_aggregate_content: editableParams.value.fine_aggregate,
        sand_ratio: parseFloat(String(sandRatio.value)),
    };

    return calculateConcreteStrength(params);
});

// 方法

// 应用预设配置
const applyPreset = (presetName: string) => {
    const preset = presetConfigs.find((p) => p.name === presetName);
    if (preset) {
        editableParams.value = { ...preset.params };
        selectedPreset.value = presetName;
        console.log('应用预设配置:', presetName, editableParams.value);
    }
};

// 参数变化处理
const handleParameterChange = () => {
    // 实时更新到store
    concreteStore.updateForwardData({
        mixProportionParams: editableParams.value,
    });
    console.log('参数已更新:', editableParams.value);
    console.log('预测强度:', predictedStrength.value, 'MPa');
};

// 生成报告
const generateReport = async () => {
    // 先显示loading
    isAnalyzing.value = true;
    analysisProgress.value = 0;
    estimatedTime.value = 10; // 初始估计10秒

    // 重置分析阶段
    analysisStages.value.forEach((stage) => {
        stage.active = false;
        stage.completed = false;
    });

    // 准备请求参数
    const requestData: PredictRequest = {
        age: editableParams.value.age,
        blast_furnace_slag: editableParams.value.blast_furnace_slag,
        cement: editableParams.value.cement,
        coarse_aggregate: editableParams.value.coarse_aggregate,
        fine_aggregate: editableParams.value.fine_aggregate,
        fly_ash: editableParams.value.fly_ash,
        superplasticizer: editableParams.value.superplasticizer,
        water: editableParams.value.water,
    };

    console.log('正在调用预测接口，参数:', requestData);

    // 记录开始时间
    const startTime = Date.now();

    // 启动真实进度模拟
    const progressInterval = simulateRealProgress(startTime);

    try {
        // 调用预测接口（使用封装的API）
        const result = await PredictAPI.predictStrength(requestData);
        console.log('接口返回结果:', result);

        // 停止进度模拟
        clearInterval(progressInterval);

        // 确保进度达到100%
        await completeProgress();

        // 将结果保存到store
        const reportData = {
            ...result, // 完整的API返回结果
            mixProportionParams: editableParams.value, // 附加当前的配合比参数供参考
        };

        concreteStore.updateForwardData({
            analysisResult: reportData,
        });

        // 跳转到Step2
        router.push('/concrete-design/forward-step2');
    } catch (error) {
        console.error('调用预测接口失败:', error);

        // 停止进度模拟
        clearInterval(progressInterval);

        // 停止loading
        isAnalyzing.value = false;

        // 显示错误提示
        alert('预测接口调用失败: ' + (error as Error).message);
    }
};

// 真实进度模拟（基于实际请求时间）
const simulateRealProgress = (startTime: number) => {
    let currentStageIndex = 0;
    analysisStages.value[0].active = true;
    analysisStage.value = analysisStages.value[0].title;

    const interval = setInterval(() => {
        if (!isAnalyzing.value) {
            return;
        }

        const elapsed = Date.now() - startTime;

        // 使用对数函数模拟真实进度：前期快速增长，后期缓慢
        // 前3秒快速到50%，之后逐渐减缓，最大到95%
        let progress: number;
        if (elapsed < 3000) {
            // 前3秒：0-50%
            progress = (elapsed / 3000) * 50;
        } else if (elapsed < 10000) {
            // 3-10秒：50-80%
            progress = 50 + ((elapsed - 3000) / 7000) * 30;
        } else if (elapsed < 30000) {
            // 10-30秒：80-90%
            progress = 80 + ((elapsed - 10000) / 20000) * 10;
        } else {
            // 30秒后：90-95%，几乎不动
            progress = 90 + Math.min(((elapsed - 30000) / 60000) * 5, 5);
        }

        analysisProgress.value = Math.min(progress, 95);

        // 动态估算剩余时间
        if (elapsed > 1000 && progress > 5) {
            const estimatedTotal = (elapsed / progress) * 100;
            estimatedTime.value = Math.ceil((estimatedTotal - elapsed) / 1000);
        }

        // 更新阶段（基于进度）
        const targetStage = Math.floor(
            (analysisProgress.value / 100) * analysisStages.value.length
        );
        if (targetStage > currentStageIndex && targetStage < analysisStages.value.length) {
            analysisStages.value[currentStageIndex].active = false;
            analysisStages.value[currentStageIndex].completed = true;
            currentStageIndex = targetStage;
            analysisStages.value[currentStageIndex].active = true;
            analysisStage.value = analysisStages.value[currentStageIndex].title;
        }
    }, 200);

    return interval;
};

// 完成进度（确保到达100%）
const completeProgress = (): Promise<void> => {
    return new Promise((resolve) => {
        // 快速完成剩余进度
        const completeInterval = setInterval(() => {
            if (analysisProgress.value < 100) {
                analysisProgress.value += (100 - analysisProgress.value) * 0.3;
                if (analysisProgress.value > 99.5) {
                    analysisProgress.value = 100;
                }
            } else {
                clearInterval(completeInterval);

                // 完成所有阶段
                analysisStages.value.forEach((stage) => {
                    stage.active = false;
                    stage.completed = true;
                });

                estimatedTime.value = 0;

                setTimeout(() => {
                    isAnalyzing.value = false;
                    resolve();
                }, 500);
            }
        }, 50);
    });
};

// 获取进度条颜色
const getProgressColor = (progress: number) => {
    if (progress < 25) return 'info';
    if (progress < 50) return 'primary';
    if (progress < 75) return 'warning';
    return 'success';
};

// 获取检测数据状态样式（对于 ≤ 的情况）
const getStatusClass = (value: number, min: number, max: number): string => {
    if (value >= min && value <= max) {
        return 'detection-value detection-value-pass';
    }
    return 'detection-value detection-value-fail';
};

// 获取pH值状态样式（对于 ≥ 的情况）
const getStatusClassForPh = (value: number, minValue: number): string => {
    if (value >= minValue) {
        return 'detection-value detection-value-pass';
    }
    return 'detection-value detection-value-fail';
};

// 生命周期
// 监听参数变化，清除预设选中状态（用户手动调整时）
watch(
    editableParams,
    (newParams) => {
        // 检查是否是手动调整（而非预设应用）
        if (selectedPreset.value) {
            const currentPreset = presetConfigs.find((p) => p.name === selectedPreset.value);
            if (currentPreset) {
                // 检查是否与当前预设完全匹配
                const isMatch = Object.keys(currentPreset.params).every(
                    (key) =>
                        currentPreset.params[key as keyof MixProportionParams] ===
                        newParams[key as keyof MixProportionParams]
                );
                if (!isMatch) {
                    // 参数已被手动修改，清除预设选中
                    selectedPreset.value = null;
                }
            }
        }
    },
    { deep: true }
);

// 监听 store 数据变化，实时更新参数
watch(
    () => concreteStore.forwardData,
    (newData) => {
        if (newData && newData.mixProportionParams) {
            editableParams.value = { ...newData.mixProportionParams };
            console.log('从store更新参数（watch）:', editableParams.value);
            // 清除预设选中状态
            selectedPreset.value = null;
        }
    },
    { deep: true, immediate: true }
);

// 监听 concreteData (来自检测页面的数据)
watch(
    () => concreteStore.concreteData,
    (newData) => {
        if (newData && newData.mixProportionParams) {
            editableParams.value = { ...newData.mixProportionParams };
            // 同时更新到forwardData
            concreteStore.updateForwardData({
                mixProportionParams: newData.mixProportionParams,
            });
            console.log('从检测页面接收参数:', editableParams.value);
            selectedPreset.value = null;
        }
    },
    { deep: true, immediate: true }
);

onMounted(() => {
    // 初始化参数从store
    if (concreteStore.forwardData && concreteStore.forwardData.mixProportionParams) {
        editableParams.value = { ...concreteStore.forwardData.mixProportionParams };
    }
});
</script>

<style lang="scss" scoped>
// 加载动画容器样式
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

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

// 检测数据卡片样式
.detection-item-card {
    transition: all 0.3s ease;
    border: 1px solid rgb(var(--v-theme-grey-lighten-3));

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    :deep(.v-card-title) {
        background: rgb(var(--v-theme-grey-lighten-5));
        border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-3));
    }
}

.detection-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-4));

    &:last-child {
        border-bottom: none;
    }

    .detection-label {
        font-size: 0.875rem;
        color: rgb(var(--v-theme-grey-darken-2));
        flex: 0 0 auto;
        min-width: 90px;
    }

    .detection-value {
        font-weight: 600;
        font-size: 0.9375rem;
        flex: 1;
        text-align: center;
    }

    .detection-value-pass {
        color: rgb(var(--v-theme-success));
    }

    .detection-value-fail {
        color: rgb(var(--v-theme-error));
    }

    .detection-range {
        font-size: 0.75rem;
        color: rgb(var(--v-theme-grey));
        flex: 0 0 auto;
        text-align: right;
        min-width: 80px;
    }
}

// 使用Vuetify默认样式
</style>
