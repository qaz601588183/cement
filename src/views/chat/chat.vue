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
            <v-card-text class="chat-messages pa-0" ref="messagesContainer">
                <div class="messages-wrapper">
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

// 发送消息
const sendMessage = async () => {
    if (!inputMessage.value.trim() || isLoading.value) return;

    const userMessage: Message = {
        role: 'user',
        content: inputMessage.value.trim(),
        timestamp: new Date(),
    };

    messages.value.push(userMessage);
    const question = inputMessage.value.trim();
    inputMessage.value = '';
    isLoading.value = true;

    // 滚动到底部
    await nextTick();
    scrollToBottom();

    // 模拟 AI 回复（这里可以替换为实际的 API 调用）
    setTimeout(
        () => {
            const aiResponse: Message = {
                role: 'ai',
                content: generateAIResponse(question),
                timestamp: new Date(),
            };
            messages.value.push(aiResponse);
            isLoading.value = false;

            nextTick(() => {
                scrollToBottom();
            });
        },
        1000 + Math.random() * 1000
    );
};

// 生成 AI 回复（示例逻辑，可以替换为实际 API）
const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('配比') || lowerQuestion.includes('配合比')) {
        return '关于混凝土配比设计，我可以帮您：<br>1. 根据强度需求推荐合适的配合比参数<br>2. 分析不同因素对强度的影响<br>3. 优化现有配比方案<br><br>您可以进入"混凝土配比设计流程"模块进行详细操作。';
    }

    if (lowerQuestion.includes('强度') || lowerQuestion.includes('抗压')) {
        return '混凝土强度受多种因素影响：<br>• 水灰比：是最关键的因素，水灰比越小强度越高<br>• 水泥用量：直接影响基础强度<br>• 养护条件：温度、湿度和龄期都很重要<br>• 外加剂：减水剂可以降低用水量提高强度<br><br>您想了解哪个方面的详细信息？';
    }

    if (lowerQuestion.includes('你好') || lowerQuestion.includes('hello')) {
        return '您好！很高兴为您服务。我是专门为混凝土配比设计提供帮助的 AI 助手。';
    }

    return `关于"${question}"，这是一个很好的问题。在混凝土配比设计中，我建议您：<br><br>1. 明确您的强度需求<br>2. 了解材料的基本属性<br>3. 使用我们的智能优化工具进行配比设计<br><br>如果您有具体的数据，可以进入相应的功能模块进行操作。`;
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
    if (!inputMessage.value.trim()) return;
    sendMessage();
};

// 处理 Shift+Enter（换行）
const handleShiftEnter = () => {
    // 允许换行，不做任何处理
};

// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        const scrollElement = messagesContainer.value.querySelector('.messages-wrapper');
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
