<template>
    <div class="deduce-guide-page">
        <v-container fluid class="fill-height">
            <v-row justify="center" align="center">
                <v-col cols="12" md="10" lg="8">
                    <h1 class="text-h3 text-center mb-8 font-weight-bold">混凝土强度推演系统</h1>
                    <p class="text-h6 text-center text-grey mb-12">
                        智能分析混凝土配合比，精准预测强度，优化配方设计
                    </p>

                    <v-row>
                        <!-- 正向推演入口 -->
                        <v-col cols="12" md="6">
                            <v-card
                                hover
                                @click="goToForward"
                                class="pa-6 d-flex flex-column align-center justify-center"
                                height="350"
                                elevation="4"
                            >
                                <v-avatar size="100" color="primary" class="mb-4">
                                    <v-icon size="60" color="white">mdi-chart-line</v-icon>
                                </v-avatar>
                                <v-card-title class="text-h4 mb-3">正向推演</v-card-title>
                                <v-card-text class="text-center text-body-1">
                                    <p class="mb-2">基于配合比参数预测混凝土强度</p>
                                    <p class="text-grey-darken-1">提供详细的因素分析和优化建议</p>
                                </v-card-text>
                                <v-btn
                                    color="primary"
                                    variant="flat"
                                    size="large"
                                    prepend-icon="mdi-play"
                                    class="mt-4"
                                >
                                    开始推演
                                </v-btn>
                            </v-card>
                        </v-col>

                        <!-- 反向推演入口 -->
                        <v-col cols="12" md="6">
                            <v-card
                                hover
                                @click="goToReverse"
                                class="pa-6 d-flex flex-column align-center justify-center"
                                height="350"
                                elevation="4"
                            >
                                <v-avatar size="100" color="success" class="mb-4">
                                    <v-icon size="60" color="white">mdi-auto-fix</v-icon>
                                </v-avatar>
                                <v-card-title class="text-h4 mb-3">反向推演</v-card-title>
                                <v-card-text class="text-center text-body-1">
                                    <p class="mb-2">根据目标强度智能优化配合比</p>
                                    <p class="text-grey-darken-1">自动调整关键参数达到设计要求</p>
                                </v-card-text>
                                <v-btn
                                    color="success"
                                    variant="flat"
                                    size="large"
                                    prepend-icon="mdi-magic-staff"
                                    class="mt-4"
                                >
                                    开始优化
                                </v-btn>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- 功能特点 -->
                    <v-row class="mt-12">
                        <v-col cols="12">
                            <h2 class="text-h5 text-center mb-6">系统特点</h2>
                        </v-col>
                        <v-col cols="12" md="4" v-for="(feature, index) in features" :key="index">
                            <v-card variant="tonal" class="pa-4 text-center h-100">
                                <v-icon :color="feature.color" size="48" class="mb-3">{{
                                    feature.icon
                                }}</v-icon>
                                <h3 class="text-h6 mb-2">{{ feature.title }}</h3>
                                <p class="text-body-2 text-grey-darken-1">
                                    {{ feature.description }}
                                </p>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToForward = () => {
    router.push('/concrete-design/forward-step1');
};

const goToReverse = () => {
    router.push('/concrete-design/reverse-step1');
};

const features = [
    {
        icon: 'mdi-brain',
        color: 'primary',
        title: 'AI智能分析',
        description: '基于深度学习模型，精准预测混凝土强度',
    },
    {
        icon: 'mdi-chart-timeline-variant',
        color: 'success',
        title: '实时推演',
        description: '参数调整即时反馈，直观了解影响因素',
    },
    {
        icon: 'mdi-target',
        color: 'warning',
        title: '智能优化',
        description: '自动优化配合比，达到目标强度要求',
    },
];
</script>

<style lang="scss" scoped>
.deduce-guide-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background: radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
}

.v-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
    }
}
</style>
