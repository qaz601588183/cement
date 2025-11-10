<template>
    <a-config-provider :theme="antdTheme">
        <div class="chat-page">
            <div class="chat-main">
                <!-- 消息列表 -->
                <div class="messages-container" ref="messagesContainer">
                <div v-for="(message, index) in messages" :key="index" class="message-item">
                    <div class="message-content" :class="message.role">
                        <div class="message-avatar">
                            <a-avatar
                                :size="32"
                                :style="{
                                    backgroundColor:
                                        message.role === 'user' ? '#5436DA' : '#19C37D',
                                }"
                            >
                                <template #icon>
                                    <user-outlined v-if="message.role === 'user'" />
                                    <robot-outlined v-else />
                                </template>
                            </a-avatar>
                        </div>
                        <div class="message-body">
                            <div
                                class="message-text"
                                :class="{
                                    typing:
                                        message.role === 'ai' &&
                                        isLoading &&
                                        index === messages.length - 1,
                                }"
                                v-html="formatMessage(message.content)"
                            ></div>

                            <!-- 结果提示集 -->
                            <Prompts
                                v-if="
                                    message.role === 'ai' &&
                                    message.analysisType &&
                                    message.isCompleted
                                "
                                :title="getPromptsTitle(message.analysisType)"
                                :items="getPromptsItems(message.analysisType)"
                                @item-click="handlePromptClick"
                                :style="{ marginTop: '16px' }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 输入框 -->
            <div class="input-container">
                <div class="input-wrapper">
                    <a-textarea
                        v-model:value="inputMessage"
                        placeholder="发送消息给 AI 助手..."
                        :auto-size="{ minRows: 1, maxRows: 6 }"
                        :bordered="false"
                        @keydown.enter.exact.prevent="sendMessage"
                        @keydown.enter.shift.exact="() => {}"
                        class="message-input"
                    />
                    <a-button
                        type="text"
                        :disabled="!inputMessage.trim() || isLoading"
                        @click="sendMessage"
                        class="send-button"
                    >
                        <send-outlined :style="{ fontSize: '20px' }" />
                    </a-button>
                </div>
            </div>
        </div>
    </div>
    </a-config-provider>
</template>

<script setup lang="ts">
import { ChatAPI } from '@/api/chat';
import {
    ArrowRightOutlined,
    ExperimentOutlined,
    RobotOutlined,
    RocketOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons-vue';
import {
    Avatar as AAvatar,
    Button as AButton,
    ConfigProvider as AConfigProvider,
    Textarea as ATextarea,
} from 'ant-design-vue';
import { Prompts } from 'ant-design-x-vue';
import { h, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Ant Design 主题配置（暗色）
const antdTheme = {
    token: {
        colorPrimary: '#5436DA',
        borderRadius: 8,
        colorBgContainer: '#1f1f1f',
        colorBorder: '#3f3f3f',
        colorText: '#ececec',
        colorTextSecondary: '#9ca3af',
        colorBgElevated: '#2a2a2a',
        colorTextPlaceholder: '#6b7280',
    },
    components: {
        Input: {
            borderRadius: 24,
            colorBgContainer: '#2a2a2a',
            colorBorder: '#3f3f3f',
            colorText: '#ececec',
            colorTextPlaceholder: '#6b7280',
        },
        Button: {
            colorText: '#ececec',
            colorBgTextHover: '#3f3f3f',
            colorBgTextActive: '#4a4a4a',
        },
        Avatar: {
            colorTextLightSolid: '#ffffff',
        },
    },
};

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    resultData?: any;
    analysisType?: 'attribution' | 'intervention' | string;
    isCompleted?: boolean;
}

const messages = ref<Message[]>([
    {
        role: 'ai',
        content: '您好！我是 AI 智能助手，可以帮您解答关于混凝土配比设计的相关问题。',
        timestamp: new Date(),
    },
]);

const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const router = useRouter();

// 打字机队列
let typewriterQueue: Promise<void> = Promise.resolve();

// 获取提示集标题
const getPromptsTitle = (analysisType: string) => {
    if (analysisType === 'attribution' || analysisType === 'intervention') {
        return '💡 您可能还想：';
    }
    return '';
};

// 获取提示集项目
const getPromptsItems = (analysisType: string): any[] => {
    if (analysisType === 'attribution') {
        return [
            {
                key: 'reverse-step1',
                icon: h(ArrowRightOutlined, { style: { color: '#1890ff' } }),
                label: '前往反向推演',
                description: '基于分析结果进行反向推演配比设计',
            },
        ];
    }

    if (analysisType === 'intervention') {
        return [
            {
                key: 'forward-step1',
                icon: h(RocketOutlined, { style: { color: '#52c41a' } }),
                label: '前往正向推演',
                description: '根据当前配比进行正向推演优化',
            },
            {
                key: 'detection',
                icon: h(ExperimentOutlined, { style: { color: '#faad14' } }),
                label: '前往智慧实验室',
                description: '在实验室中验证和测试配比方案',
            },
        ];
    }

    return [];
};

// 处理提示项点击
const handlePromptClick = ({ data }: { data: any }) => {
    const routeMap: Record<string, string> = {
        'reverse-step1': '/concrete-design/reverse-step1',
        'forward-step1': '/concrete-design/forward-step1',
        detection: '/concrete-design/detection',
    };

    const route = routeMap[data.key];
    if (route) {
        router.push(route);
    }
};

// 打字机效果
const typeText = async (messageIndex: number, text: string, speed = 20) => {
    const chars = Array.from(text);
    const message = messages.value[messageIndex];

    if (!message) return;

    for (let i = 0; i < chars.length; i++) {
        message.content += chars[i];

        if (i % 3 === 0) {
            await nextTick();
            scrollToBottom();
        }

        await new Promise((resolve) => setTimeout(resolve, speed));
    }

    await nextTick();
    scrollToBottom();
};

// 发送消息
const sendMessage = async () => {
    if (!inputMessage.value.trim() || isLoading.value) return;

    const userMessage: Message = {
        role: 'user',
        content: inputMessage.value.trim(),
        timestamp: new Date(),
    };

    messages.value.push(userMessage);
    const query = inputMessage.value.trim();
    inputMessage.value = '';
    isLoading.value = true;

    await nextTick();
    scrollToBottom();

    const aiMessage: Message = {
        role: 'ai',
        content: '',
        timestamp: new Date(),
    };
    messages.value.push(aiMessage);

    const aiMessageIndex = messages.value.length - 1;
    typewriterQueue = Promise.resolve();

    ChatAPI.analyzeStream(
        { query },
        (message, content) => {
            if (content) {
                typewriterQueue = typewriterQueue.then(() =>
                    typeText(aiMessageIndex, content, 15)
                );
            }

            // 处理 result 类型，保存分析类型
            if (message.type === 'result' && message.data) {
                const currentMessage = messages.value[aiMessageIndex];
                if (currentMessage) {
                    currentMessage.resultData = message.data;
                    currentMessage.analysisType = message.data.analysis_type;
                }
            }

            if (message.type === 'end') {
                typewriterQueue.then(() => {
                    const currentMessage = messages.value[aiMessageIndex];
                    if (currentMessage) {
                        currentMessage.isCompleted = true;
                    }
                    isLoading.value = false;
                });
            }
        },
        () => {
            typewriterQueue.then(() => {
                isLoading.value = false;
                nextTick(() => scrollToBottom());
            });
        },
        (error: Error) => {
            console.error('流式请求错误:', error);
            const currentMessage = messages.value[aiMessageIndex];
            if (currentMessage) {
                currentMessage.content = `抱歉，出现了错误：${error.message}`;
            }
            isLoading.value = false;
            nextTick(() => scrollToBottom());
        }
    );
};

// 格式化消息
const formatMessage = (content: string): string => {
    return content
        .replace(/\n/g, '<br>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped lang="scss">
.chat-page {
    height: 100vh;
    background: #0d0d0d;
    display: flex;
    justify-content: center;
    overflow: hidden;
}

.chat-main {
    width: 100%;
    max-width: 768px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px 16px 120px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #3f3f3f;
        border-radius: 3px;

        &:hover {
            background: #525252;
        }
    }
}

.message-item {
    margin-bottom: 32px;
    animation: fadeIn 0.3s ease-out;
}

.message-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    &.user {
        .message-body {
            background: #2f2f2f;
            padding: 12px 16px;
            border-radius: 12px;
        }
    }

    &.ai {
        .message-body {
            background: transparent;
            padding: 12px 0;
        }
    }
}

.message-avatar {
    flex-shrink: 0;
    margin-top: 4px;
}

.message-body {
    flex: 1;
    min-width: 0;
}

.message-text {
    font-size: 15px;
    line-height: 1.75;
    color: #ececec;
    word-wrap: break-word;
    white-space: pre-wrap;

    &.typing::after {
        content: '|';
        color: #6b7280;
        animation: blink 1s step-end infinite;
        margin-left: 2px;
    }

    :deep(code) {
        background: #2a2a2a;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.9em;
        color: #60a5fa;
    }

    :deep(strong) {
        font-weight: 600;
        color: #ffffff;
    }

    :deep(br) {
        display: block;
        content: '';
        margin: 8px 0;
    }
}

.input-container {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 768px;
    padding: 16px;
    background: linear-gradient(to top, #0d0d0d 80%, transparent);
}

.input-wrapper {
    background: #1f1f1f;
    border: 1px solid #3f3f3f;
    border-radius: 24px;
    display: flex;
    align-items: flex-end;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;

    &:focus-within {
        border-color: #5436da;
        box-shadow: 0 4px 12px rgba(84, 54, 218, 0.3);
    }
}

.message-input {
    flex: 1;
    font-size: 15px;
    line-height: 24px;
    resize: none;

    :deep(.ant-input) {
        padding: 0;
        font-size: 15px;
        line-height: 24px;
    }
}

.send-button {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: 8px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes blink {
    0%,
    50% {
        opacity: 1;
    }
    51%,
    100% {
        opacity: 0;
    }
}

// Prompts 组件样式（暗色主题）
:deep(.ant-prompts) {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #3f3f3f;

    .ant-prompts-item {
        background: #2f2f2f;
        border: 1px solid #3f3f3f;
        border-radius: 8px;
        transition: all 0.2s;
        cursor: pointer;

        &:hover {
            border-color: #5436da;
            box-shadow: 0 2px 8px rgba(84, 54, 218, 0.3);
            transform: translateY(-1px);
            background: #333333;
        }

        &:active {
            transform: translateY(0);
        }
    }

    .ant-prompts-title {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8px;
    }

    .ant-prompts-label {
        color: #ffffff !important;
        font-weight: 500;
    }

    .ant-prompts-desc {
        color: #ffffff !important;
        opacity: 0.8;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .messages-container {
        padding: 16px 12px 100px;
    }

    .message-item {
        margin-bottom: 24px;
    }

    .message-content {
        gap: 12px;
    }

    .input-container {
        padding: 12px;
    }

    .input-wrapper {
        border-radius: 20px;
        padding: 10px 12px;
    }
}
</style>

