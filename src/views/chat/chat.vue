<template>
    <div class="chat-container">
        <div class="chat-header">
            <div class="header-title">
                <robot-outlined
                    :style="{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }"
                />
                <span class="title-text">AI 智能对话</span>
            </div>
            <a-tag color="success">
                <template #icon>
                    <check-circle-outlined />
                </template>
                在线
            </a-tag>
        </div>

        <div class="chat-messages" ref="messagesContainer">
            <div v-for="(message, index) in messages" :key="index" class="message-wrapper">
                <Bubble
                    :content="message.content"
                    :placement="message.role === 'user' ? 'end' : 'start'"
                    :typing="false"
                    :class="`message-bubble ${message.role === 'user' ? 'user-bubble' : 'ai-bubble'}`"
                >
                    <template #avatar>
                        <a-avatar
                            :style="{
                                backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
                            }"
                        >
                            <template #icon>
                                <user-outlined v-if="message.role === 'user'" />
                                <robot-outlined v-else />
                            </template>
                        </a-avatar>
                    </template>
                    <template #header>
                        <div class="message-header">
                            <span class="message-role">{{
                                message.role === 'user' ? '你' : 'AI 助手'
                            }}</span>
                            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                        </div>
                    </template>
                </Bubble>
            </div>

            <!-- 加载中状态 -->
            <div v-if="isLoading" class="message-wrapper">
                <Bubble
                    content="正在思考中..."
                    placement="start"
                    :typing="true"
                    class="message-bubble ai-bubble"
                >
                    <template #avatar>
                        <a-avatar :style="{ backgroundColor: '#52c41a' }">
                            <template #icon>
                                <robot-outlined />
                            </template>
                        </a-avatar>
                    </template>
                    <template #header>
                        <div class="message-header">
                            <span class="message-role">AI 助手</span>
                        </div>
                    </template>
                </Bubble>
            </div>
        </div>

        <div class="chat-input-wrapper">
            <Sender
                v-model:value="inputMessage"
                placeholder="输入您的问题... (Enter 发送，Shift+Enter 换行)"
                :loading="isLoading"
                :disabled="isLoading"
                @submit="sendMessage"
                :style="{ width: '100%' }"
            >
                <template #actions>
                    <a-button
                        type="primary"
                        :disabled="!inputMessage.trim() || isLoading"
                        :loading="isLoading"
                        @click="sendMessage"
                        size="large"
                    >
                        <send-outlined />
                    </a-button>
                </template>
            </Sender>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChatAPI } from '@/api/chat';
import {
    CheckCircleOutlined,
    RobotOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons-vue';
import { Avatar as AAvatar, Button as AButton, Tag as ATag } from 'ant-design-vue';
import { Bubble, Sender } from 'ant-design-x-vue';
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
        content:
            '您好！我是 AI 智能助手，可以帮您解答关于混凝土配比设计的相关问题。有什么可以帮您的吗？',
        timestamp: new Date(),
    },
]);

const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// 打字机队列：确保串行执行
let typewriterQueue: Promise<void> = Promise.resolve();

// 打字机效果函数：逐字显示文本（正确处理 emoji 和多字节字符）
const typeText = async (messageIndex: number, text: string, speed = 30) => {
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
        messages.value[messageIndex].content += chars[i];

        if (i % 5 === 0) {
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

    // 重置打字机队列
    typewriterQueue = Promise.resolve();

    ChatAPI.analyzeStream(
        { query },
        (message, content) => {
            if (content) {
                typewriterQueue = typewriterQueue.then(() => typeText(aiMessageIndex, content, 20));
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
                nextTick(() => {
                    scrollToBottom();
                });
            });
        },
        (error: Error) => {
            console.error('流式请求错误:', error);
            messages.value[aiMessageIndex].content =
                `抱歉，处理您的请求时出现了错误：${error.message}`;
            isLoading.value = false;
            nextTick(() => {
                scrollToBottom();
            });
        }
    );
};

// 格式化时间
const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
.chat-container {
    height: calc(100vh - 120px);
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    border-radius: 8px;
}

.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: white;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;

    .header-title {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 600;
        color: #262626;

        .title-text {
            background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: white;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .message-wrapper {
        margin-bottom: 24px;
        animation: fadeIn 0.3s ease-in;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .message-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .message-role {
            font-weight: 600;
            font-size: 14px;
            color: #262626;
        }

        .message-time {
            font-size: 12px;
            color: #8c8c8c;
        }
    }
}

.chat-input-wrapper {
    background: white;
    padding: 16px 24px;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.user-bubble) {
    .ant-bubble-content {
        background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
        color: white;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }
}

:deep(.ai-bubble) {
    .ant-bubble-content {
        background: #f5f5f5;
        color: #262626;
        border-radius: 18px 18px 18px 4px;
        border: 1px solid #e8e8e8;
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

// 移动端适配
@media (max-width: 768px) {
    .chat-container {
        height: calc(100vh - 80px);
        padding: 8px;
    }

    .chat-header {
        padding: 12px 16px;

        .header-title {
            font-size: 18px;
        }
    }

    .chat-messages {
        padding: 12px;

        .message-wrapper {
            margin-bottom: 16px;
        }
    }

    .chat-input-wrapper {
        padding: 12px 16px;
    }
}
</style>
