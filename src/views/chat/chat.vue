<template>
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
                            <div class="message-text" v-html="formatMessage(message.content)"></div>
                        </div>
                    </div>
                </div>

                <!-- 加载中 -->
                <div v-if="isLoading" class="message-item">
                    <div class="message-content ai">
                        <div class="message-avatar">
                            <a-avatar :size="32" :style="{ backgroundColor: '#19C37D' }">
                                <template #icon>
                                    <robot-outlined />
                                </template>
                            </a-avatar>
                        </div>
                        <div class="message-body">
                            <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
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
</template>

<script setup lang="ts">
import { ChatAPI } from '@/api/chat';
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons-vue';
import { Avatar as AAvatar, Button as AButton, Textarea as ATextarea } from 'ant-design-vue';
import { nextTick, onMounted, ref } from 'vue';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    resultData?: any;
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

// 打字机队列
let typewriterQueue: Promise<void> = Promise.resolve();

// 打字机效果
const typeText = async (messageIndex: number, text: string, speed = 20) => {
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
        messages.value[messageIndex].content += chars[i];

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

            if (message.type === 'end') {
                typewriterQueue.then(() => {
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
            messages.value[aiMessageIndex].content = `抱歉，出现了错误：${error.message}`;
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
    background: #f7f7f8;
    display: flex;
    justify-content: center;
}

.chat-main {
    width: 100%;
    max-width: 768px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
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
        background: #d1d5db;
        border-radius: 3px;

        &:hover {
            background: #9ca3af;
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
            background: #f4f4f4;
        }
    }

    &.ai {
        .message-body {
            background: transparent;
        }
    }
}

.message-avatar {
    flex-shrink: 0;
    margin-top: 4px;
}

.message-body {
    flex: 1;
    padding: 12px 0;
    min-width: 0;
}

.message-text {
    font-size: 15px;
    line-height: 1.75;
    color: #1f2937;
    word-wrap: break-word;
    white-space: pre-wrap;

    :deep(code) {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.9em;
        color: #e63946;
    }

    :deep(strong) {
        font-weight: 600;
        color: #111827;
    }

    :deep(br) {
        display: block;
        content: '';
        margin: 8px 0;
    }
}

.typing-indicator {
    display: flex;
    gap: 6px;
    padding: 8px 0;

    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: bounce 1.4s infinite ease-in-out;

        &:nth-child(1) {
            animation-delay: 0s;
        }

        &:nth-child(2) {
            animation-delay: 0.2s;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
        }
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
    background: linear-gradient(to top, #f7f7f8 80%, transparent);
}

.input-wrapper {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    display: flex;
    align-items: flex-end;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;

    &:focus-within {
        border-color: #5436da;
        box-shadow: 0 4px 12px rgba(84, 54, 218, 0.15);
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

    :deep(textarea) {
        &::placeholder {
            color: #9ca3af;
        }
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
    transition: all 0.2s;

    &:not(:disabled) {
        color: #5436da;

        &:hover {
            background: #f3f0ff;
        }

        &:active {
            background: #e9e5ff;
        }
    }

    &:disabled {
        color: #d1d5db;
        cursor: not-allowed;
    }
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

@keyframes bounce {
    0%,
    60%,
    100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-8px);
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

