<template>
    <v-container fluid class="chat-container">
        <v-card class="chat-card" elevation="2">
            <v-card-title class="d-flex align-center pa-4">
                <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
                <span class="text-h6">AI 智能对话</span>
                <v-spacer></v-spacer>
                <v-chip color="success" size="small" variant="flat">
                    <v-icon start size="small">mdi-circle</v-icon>
                    在线
                </v-chip>
            </v-card-title>
            <v-divider></v-divider>

            <!-- 消息列表区域 -->
            <v-card-text class="chat-messages pa-0">
                <div class="messages-wrapper" ref="messagesContainer">
                    <div
                        v-for="(message, index) in messages"
                        :key="index"
                        :class="[
                            'message-item',
                            message.role === 'user' ? 'user-message' : 'ai-message',
                        ]"
                    >
                        <div class="message-avatar">
                            <v-avatar
                                :color="message.role === 'user' ? 'primary' : 'success'"
                                size="36"
                            >
                                <v-icon v-if="message.role === 'user'" color="white"
                                    >mdi-account</v-icon
                                >
                                <v-icon v-else color="white">mdi-robot</v-icon>
                            </v-avatar>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble">
                                <div
                                    class="message-text"
                                    v-html="formatMessage(message.content)"
                                ></div>
                                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 加载中状态 -->
                    <div v-if="isLoading" class="message-item ai-message">
                        <div class="message-avatar">
                            <v-avatar color="success" size="36">
                                <v-icon color="white">mdi-robot</v-icon>
                            </v-avatar>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble">
                                <div class="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <!-- 输入区域 -->
            <v-card-actions class="chat-input pa-4">
                <v-textarea
                    v-model="inputMessage"
                    placeholder="输入您的问题..."
                    variant="outlined"
                    rows="2"
                    auto-grow
                    hide-details
                    class="flex-grow-1 mr-2"
                    @keydown.enter.exact.prevent="handleEnter"
                    @keydown.enter.shift.exact="handleShiftEnter"
                ></v-textarea>
                <v-btn
                    color="primary"
                    size="large"
                    :disabled="!inputMessage.trim() || isLoading"
                    :loading="isLoading"
                    @click="sendMessage"
                    elevation="2"
                >
                    <v-icon>mdi-send</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ChatAPI } from '@/api/chat';
import { nextTick, onMounted, ref } from 'vue';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const messages = ref<Message[]>([
    {
        role: 'ai',
        content:
            '您好！我是 AI 智能助手，可以帮您解答关于混凝土配比设计的相关问题。有什么可以帮您的吗？',
        timestamp: new Date(),
    },
]);

const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
// 用于取消流式请求的函数（保留以备将来使用，如添加取消按钮）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let cancelRequest: (() => void) | null = null;

// 打字机效果函数：逐字显示文本（正确处理 emoji 和多字节字符）
const typeText = async (messageIndex: number, text: string, speed = 30) => {
    // 使用 Array.from 或 [...text] 来正确分割包含 emoji 的字符串
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
        messages.value[messageIndex].content += chars[i];

        // 每隔几个字符滚动一次（优化性能）
        if (i % 5 === 0) {
            await nextTick();
            scrollToBottom();
        }

        // 延迟
        await new Promise((resolve) => setTimeout(resolve, speed));
    }

    // 最后滚动一次
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

    // 滚动到底部
    await nextTick();
    scrollToBottom();

    // 创建 AI 消息占位符
    const aiMessage: Message = {
        role: 'ai',
        content: '',
        timestamp: new Date(),
    };
    messages.value.push(aiMessage);

    // 获取当前消息的索引（用于响应式更新）
    const aiMessageIndex = messages.value.length - 1;

    // 调用流式接口
    cancelRequest = ChatAPI.analyzeStream(
        { query },
        // 接收到数据块时的回调
        async (message, content) => {
            // 使用打字机效果显示每段内容
            if (content) {
                await typeText(aiMessageIndex, content, 20);
            }

            // 如果是 end 类型，标记完成
            if (message.type === 'end') {
                isLoading.value = false;
                cancelRequest = null;
            }
        },
        // 流式响应完成时的回调（确保流结束）
        () => {
            isLoading.value = false;
            cancelRequest = null;
            nextTick(() => {
                scrollToBottom();
            });
        },
        // 错误回调
        (error: Error) => {
            console.error('流式请求错误:', error);
            messages.value[aiMessageIndex].content =
                `抱歉，处理您的请求时出现了错误：${error.message}`;
            isLoading.value = false;
            cancelRequest = null;
            nextTick(() => {
                scrollToBottom();
            });
        }
    );
};

// 格式化消息内容（支持简单的换行）
const formatMessage = (content: string): string => {
    return content.replace(/\n/g, '<br>');
};

// 格式化时间
const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// 处理 Enter 键（发送）
const handleEnter = () => {
    if (!inputMessage.value.trim() || isLoading.value) return;
    sendMessage();
};

// 处理 Shift+Enter（换行）
const handleShiftEnter = () => {
    // 允许换行，不做任何处理
};

// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        // messagesContainer 现在直接引用 .messages-wrapper 元素
        const scrollElement = messagesContainer.value as HTMLElement;
        if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }
};

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped lang="scss">
.chat-container {
    height: calc(100vh - 120px);
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.chat-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    background-color: rgb(var(--v-theme-surface));
}

.messages-wrapper {
    padding: 16px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.message-item {
    display: flex;
    gap: 12px;
    animation: fadeIn 0.3s ease-in;

    &.user-message {
        flex-direction: row-reverse;

        .message-content {
            align-items: flex-end;
        }

        .message-bubble {
            background: rgb(var(--v-theme-primary));
            color: white;
            border-radius: 18px 18px 4px 18px;
        }
    }

    &.ai-message {
        .message-bubble {
            background: rgb(var(--v-theme-surface-variant));
            color: rgb(var(--v-theme-on-surface-variant));
            border-radius: 18px 18px 18px 4px;
        }
    }
}

.message-avatar {
    flex-shrink: 0;
}

.message-content {
    max-width: 70%;
    display: flex;
    flex-direction: column;
}

.message-bubble {
    padding: 12px 16px;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-text {
    line-height: 1.6;
    margin-bottom: 4px;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 4px;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 8px 0;

    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: rgb(var(--v-theme-on-surface-variant));
        opacity: 0.6;
        animation: typing 1.4s infinite ease-in-out;

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

.chat-input {
    background-color: rgb(var(--v-theme-surface));
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

@keyframes typing {
    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.6;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .chat-container {
        height: calc(100vh - 80px);
        padding: 8px;
    }

    .message-content {
        max-width: 85%;
    }

    .messages-wrapper {
        padding: 12px;
        gap: 12px;
    }
}
</style>
