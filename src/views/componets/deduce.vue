<template>
    <div class="modern-landing">
        <!-- Hero Section with Glassmorphism -->
        <div class="hero-wrapper">
            <div class="animated-bg">
                <div class="gradient-orb orb-1"></div>
                <div class="gradient-orb orb-2"></div>
                <div class="gradient-orb orb-3"></div>
            </div>

            <v-container class="hero-content">
                <v-row justify="center" align="center">
                    <v-col cols="12" lg="10">
                        <div class="text-center glass-card hero-card">
                            <div class="badge-pill mb-6">
                                <v-icon size="20" class="mr-2">mdi-sparkles</v-icon>
                                智能配比设计平台
                            </div>

                            <h1 class="hero-title mb-4">
                                混凝土配比<br />
                                <span class="gradient-text">智能设计系统</span>
                            </h1>

                            <p class="hero-subtitle mb-8">
                                AI 驱动的全流程智能化管理，从需求分析到配比优化<br />
                                让混凝土设计更高效、更精准、更智能
                            </p>

                            <v-btn
                                size="x-large"
                                class="cta-button"
                                elevation="0"
                                @click="startWorkflow"
                            >
                                <v-icon class="mr-2">mdi-rocket-launch-outline</v-icon>
                                开始智能设计
                                <v-icon class="ml-2">mdi-arrow-right</v-icon>
                            </v-btn>

                            <!-- Stats -->
                            <div class="stats-row mt-12">
                                <div class="stat-item">
                                    <div class="stat-number">5</div>
                                    <div class="stat-label">智能步骤</div>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat-item">
                                    <div class="stat-number">AI</div>
                                    <div class="stat-label">驱动模型</div>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat-item">
                                    <div class="stat-number">99%</div>
                                    <div class="stat-label">精准度</div>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </div>

        <!-- Workflow Steps - Bento Grid Style -->
        <v-container class="workflow-container">
            <div class="section-header text-center mb-10">
                <div class="badge-pill-dark mb-4">
                    <v-icon size="18" class="mr-2">mdi-format-list-numbered</v-icon>
                    工作流程
                </div>
                <h2 class="section-title mb-3">五步完成智能配比设计</h2>
                <p class="section-subtitle">全流程自动化，智能推荐最优方案</p>
            </div>

            <!-- Bento Grid Layout -->
            <div class="bento-grid">
                <div
                    v-for="(step, index) in steps"
                    :key="index"
                    class="bento-card"
                    :class="`bento-${index + 1}`"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                >
                    <div class="bento-card-inner">
                        <div class="step-badge" :style="{ background: step.gradient }">
                            {{ index + 1 }}
                        </div>

                        <div :class="`step-icon-bg step-icon-bg-${index + 1}`">
                            <v-icon :color="step.color" size="48">{{ step.icon }}</v-icon>
                        </div>

                        <h3 class="step-title">{{ step.title }}</h3>
                        <p class="step-role">{{ step.role }}</p>
                        <p class="step-desc">{{ step.description }}</p>

                        <div class="step-arrow" v-if="index < 4">
                            <v-icon color="grey-lighten-1">mdi-arrow-right</v-icon>
                        </div>
                    </div>
                </div>
            </div>
        </v-container>

        <!-- Features Section -->
        <v-container class="features-container">
            <div class="section-header text-center mb-10">
                <div class="badge-pill-dark mb-4">
                    <v-icon size="18" class="mr-2">mdi-star-four-points</v-icon>
                    核心优势
                </div>
                <h2 class="section-title">为什么选择我们</h2>
            </div>

            <v-row>
                <v-col cols="12" md="4" v-for="(feature, index) in features" :key="index">
                    <div
                        class="feature-card glass-card"
                        :style="{ animationDelay: `${index * 0.15}s` }"
                    >
                        <div class="feature-icon-wrapper" :style="{ background: feature.gradient }">
                            <v-icon color="white" size="32">{{ feature.icon }}</v-icon>
                        </div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-desc">{{ feature.description }}</p>
                    </div>
                </v-col>
            </v-row>

            <!-- Final CTA -->
            <div class="text-center mt-16 pb-12">
                <div class="final-cta glass-card">
                    <h3 class="mb-4">准备好开始了吗？</h3>
                    <p class="mb-6 text-grey">立即体验 AI 驱动的混凝土配比设计</p>
                    <v-btn
                        size="large"
                        class="cta-button-secondary"
                        elevation="0"
                        @click="startWorkflow"
                    >
                        <v-icon class="mr-2">mdi-play-circle-outline</v-icon>
                        开始试验
                    </v-btn>
                </div>
            </div>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const startWorkflow = () => {
    router.push('/concrete-design/reverse-step1');
};

const steps = [
    {
        title: '需求输入',
        role: '施工方',
        description: '输入强度需求和施工条件',
        icon: 'mdi-file-document-edit',
        color: '#004EA3',
        gradient: 'linear-gradient(135deg, #004EA3 0%, #0066CC 100%)',
    },
    {
        title: '智能计算',
        role: '预判模型',
        description: 'AI 模型快速生成配比方案',
        icon: 'mdi-brain',
        color: '#0066CC',
        gradient: 'linear-gradient(135deg, #0066CC 0%, #0080FF 100%)',
    },
    {
        title: '材料检测',
        role: '智慧实验室',
        description: '精确检测材料属性参数',
        icon: 'mdi-flask',
        color: '#0099CC',
        gradient: 'linear-gradient(135deg, #0080FF 0%, #00B3E6 100%)',
    },
    {
        title: '配比优化',
        role: '优化算法',
        description: '基于检测结果智能优化',
        icon: 'mdi-tune',
        color: '#006699',
        gradient: 'linear-gradient(135deg, #0099CC 0%, #006699 100%)',
    },
    {
        title: '方案产出',
        role: '最终报告',
        description: '生成完整配比设计方案',
        icon: 'mdi-check-decagram',
        color: '#003366',
        gradient: 'linear-gradient(135deg, #004EA3 0%, #003366 100%)',
    },
];

const features = [
    {
        icon: 'mdi-robot-outline',
        title: 'AI 智能分析',
        description: '基于深度学习模型，精准预测混凝土强度，智能推荐最优配比方案',
        gradient: 'linear-gradient(135deg, #004EA3 0%, #0066CC 100%)',
    },
    {
        icon: 'mdi-lightning-bolt',
        title: '极速响应',
        description: '全流程自动化处理，从需求到方案仅需几分钟，大幅提升工作效率',
        gradient: 'linear-gradient(135deg, #0066CC 0%, #0080FF 100%)',
    },
    {
        icon: 'mdi-shield-check',
        title: '数据可靠',
        description: '基于海量历史数据训练，结合实验室检测，确保方案科学可靠',
        gradient: 'linear-gradient(135deg, #0080FF 0%, #00B3E6 100%)',
    },
];
</script>

<style lang="scss" scoped>
.modern-landing {
    min-height: 100vh;
    background: #0f0f1e;
    overflow-x: hidden;
}

// ===== Hero Section =====
.hero-wrapper {
    position: relative;
    min-height: 90vh;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.animated-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 100%);
    overflow: hidden;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    animation: float-orb 20s infinite ease-in-out;
}

.orb-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #004ea3 0%, transparent 70%);
    top: -10%;
    left: -10%;
    animation-delay: 0s;
}

.orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #0066cc 0%, transparent 70%);
    top: 20%;
    right: -5%;
    animation-delay: 5s;
}

.orb-3 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, #0080ff 0%, transparent 70%);
    bottom: -10%;
    left: 30%;
    animation-delay: 10s;
}

@keyframes float-orb {
    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }
    33% {
        transform: translate(50px, -50px) scale(1.1);
    }
    66% {
        transform: translate(-50px, 50px) scale(0.9);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
}

.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 60px 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hero-card {
    animation: fade-in-up 0.8s ease-out;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.badge-pill {
    display: inline-flex;
    align-items: center;
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    backdrop-filter: blur(10px);
}

.badge-pill-dark {
    display: inline-flex;
    align-items: center;
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
}

.hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    color: white;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.gradient-text {
    background: linear-gradient(135deg, #004ea3 0%, #0066cc 50%, #0080ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.8;
    max-width: 700px;
    margin: 0 auto;
}

.cta-button {
    background: linear-gradient(135deg, #004ea3 0%, #0066cc 100%) !important;
    color: white !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    border-radius: 16px !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: all 0.3s ease !important;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 78, 163, 0.4) !important;
    }
}

.stats-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 48px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
}

// ===== Workflow Section =====
.workflow-container {
    padding: 100px 0;
    position: relative;
}

.section-header {
    margin-bottom: 60px;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
}

.section-subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.6);
}

// Bento Grid
.bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
    margin-bottom: 40px;
}

.bento-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fade-in-up 0.6s ease-out backwards;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

        &::before {
            opacity: 1;
        }

        .step-icon-bg {
            transform: scale(1.1) rotate(5deg);
        }
    }
}

// Responsive Bento Layout
.bento-1 {
    grid-column: span 4;
}
.bento-2 {
    grid-column: span 4;
}
.bento-3 {
    grid-column: span 4;
}
.bento-4 {
    grid-column: span 6;
}
.bento-5 {
    grid-column: span 6;
}

@media (max-width: 960px) {
    .bento-1,
    .bento-2,
    .bento-3,
    .bento-4,
    .bento-5 {
        grid-column: span 12;
    }
}

.bento-card-inner {
    position: relative;
    z-index: 1;
}

.step-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.125rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.step-icon-bg {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    transition: transform 0.3s ease;
}

.step-icon-bg-1 {
    background: linear-gradient(135deg, rgba(0, 78, 163, 0.2) 0%, rgba(0, 102, 204, 0.2) 100%);
}
.step-icon-bg-2 {
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.2) 0%, rgba(0, 128, 255, 0.2) 100%);
}
.step-icon-bg-3 {
    background: linear-gradient(135deg, rgba(0, 128, 255, 0.2) 0%, rgba(0, 179, 230, 0.2) 100%);
}
.step-icon-bg-4 {
    background: linear-gradient(135deg, rgba(0, 153, 204, 0.2) 0%, rgba(0, 102, 153, 0.2) 100%);
}
.step-icon-bg-5 {
    background: linear-gradient(135deg, rgba(0, 78, 163, 0.2) 0%, rgba(0, 51, 102, 0.2) 100%);
}

.step-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
}

.step-role {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
}

.step-desc {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
}

.step-arrow {
    position: absolute;
    bottom: 20px;
    right: 20px;
}

// ===== Features Section =====
.features-container {
    padding: 80px 0;
}

.feature-card {
    padding: 40px 32px;
    text-align: center;
    animation: fade-in-up 0.6s ease-out backwards;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(255, 255, 255, 0.3);
    }
}

.feature-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
}

.feature-desc {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
}

// ===== Final CTA =====
.final-cta {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 48px 40px;

    h3 {
        font-size: 2rem;
        font-weight: 700;
        color: white;
    }

    p {
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.6);
    }
}

.cta-button-secondary {
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    border-radius: 12px !important;
    text-transform: none !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease !important;

    &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        transform: translateY(-2px);
    }
}

// ===== Responsive =====
@media (max-width: 960px) {
    .glass-card {
        padding: 40px 24px;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .stats-row {
        gap: 24px;
    }

    .section-title {
        font-size: 2rem;
    }

    .bento-card {
        padding: 24px;
    }
}
</style>
