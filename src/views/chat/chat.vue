<script lang="tsx">
import { ChatAPI } from "@/api/chat";
import {
    ArrowRightOutlined,
    ExperimentOutlined,
    RobotOutlined,
    RocketOutlined,
    SendOutlined,
    UserOutlined,
} from "@ant-design/icons-vue";
import {
    Avatar as AAvatar,
    Button as AButton,
    ConfigProvider as AConfigProvider,
    Textarea as ATextarea,
} from "ant-design-vue";
import { defineComponent, h, nextTick, onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";

// 导入图片资源
import forwardImg from "@/assets/forward.jpg";
import reverseImg from "@/assets/reverse.jpg";
import wisdomImg from "@/assets/wisdom.jpg";

// 类型定义
interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    resultData?: any;
    analysisType?: "attribution" | "intervention" | string;
    isCompleted?: boolean;
}

export default defineComponent({
    name: "ChatPage",
    setup() {
        const router = useRouter();

        // Ant Design 主题配置（暗色）
        const antdTheme = {
            token: {
                colorPrimary: "#5436DA",
                borderRadius: 8,
                colorBgContainer: "#1f1f1f",
                colorBorder: "#3f3f3f",
                colorText: "#ececec",
                colorTextSecondary: "#9ca3af",
                colorBgElevated: "#2a2a2a",
                colorTextPlaceholder: "#6b7280",
            },
            components: {
                Input: {
                    borderRadius: 24,
                    colorBgContainer: "#2a2a2a",
                    colorBorder: "#3f3f3f",
                    colorText: "#ececec",
                    colorTextPlaceholder: "#6b7280",
                },
                Button: {
                    colorText: "#ececec",
                    colorBgTextHover: "#3f3f3f",
                    colorBgTextActive: "#4a4a4a",
                },
                Avatar: {
                    colorTextLightSolid: "#ffffff",
                },
            },
        };

        // 响应式数据
        const messages = ref<Message[]>([
            {
                role: "ai",
                content: `您好！我是您的混凝土配比智能助手，我擅长用自然语言帮您完成强度预测、因果分析与配比优化。您可以这样提问：\n
探索性："哪些因素最影响28天强度？""把粉煤灰从80提到120，强度能涨多少？"\n
精确优化："当前配比42.3 MPa，想拉到50 MPa，只调水泥和减水剂，给出具体千克数。""C30基准，目标+10 %，能否只增减水剂实现？"\n
反事实对比："如果龄期从7天延长到14天，强度增益多少？""水泥降30 kg，用矿渣补，水化热和强度怎样变化？"\n
资源约束："在水泥≤380 kg、水胶比≤0.45条件下，最高能做到多少强度？"
`,
                timestamp: new Date(),
            },
        ]);

        const inputMessage = ref("");
        const isLoading = ref(false);
        const messagesContainer: Ref<HTMLElement | null> = ref(null);

        // 打字机队列
        let typewriterQueue: Promise<void> = Promise.resolve();

        // 获取提示集标题
        const getPromptsTitle = (analysisType: string) => {
            if (
                analysisType === "attribution" ||
                analysisType === "intervention"
            ) {
                return "💡 您可能还想：";
            }
            return "";
        };

        // 获取提示集项目
        const getPromptsItems = (analysisType: string) => {
            if (analysisType === "attribution") {
                return [
                    {
                        key: "reverse-step1",
                        icon: ArrowRightOutlined,
                        iconColor: "#1890ff",
                        label: "前往反向推演",
                        description: "基于分析结果进行反向推演配比设计",
                        image: reverseImg,
                        route: "/concrete-design/reverse-step1",
                    },
                ];
            }

            if (analysisType === "intervention") {
                return [
                    {
                        key: "forward-step1",
                        icon: RocketOutlined,
                        iconColor: "#52c41a",
                        label: "前往正向推演",
                        description: "根据当前配比进行正向推演优化",
                        image: forwardImg,
                        route: "/concrete-design/forward-step1",
                    },
                    {
                        key: "detection",
                        icon: ExperimentOutlined,
                        iconColor: "#faad14",
                        label: "前往智慧实验室",
                        description: "在实验室中验证和测试配比方案",
                        image: wisdomImg,
                        route: "/concrete-design/detection",
                    },
                ];
            }

            return [];
        };

        // 处理提示项点击
        const handlePromptClick = (route: string) => {
            window.open(`#${route}`, "_blank");
        };

        // 打字机效果
        const typeText = async (
            messageIndex: number,
            text: string,
            speed = 20
        ) => {
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
                role: "user",
                content: inputMessage.value.trim(),
                timestamp: new Date(),
            };

            messages.value.push(userMessage);
            const query = inputMessage.value.trim();
            inputMessage.value = "";
            isLoading.value = true;

            await nextTick();
            scrollToBottom();

            const aiMessage: Message = {
                role: "ai",
                content: "",
                timestamp: new Date(),
            };
            messages.value.push(aiMessage);

            const aiMessageIndex = messages.value.length - 1;
            typewriterQueue = Promise.resolve();

            ChatAPI.analyzeStream(
                { query },
                (message, content) => {
                    if (/[─]{20,}/.test(content)) {
                        content = "─────────────────────────────────────";
                    }
                    if (/[═]{20,}/.test(content)) {
                        content = "═════════════════════════════════════";
                    }
                    if (content || content === "") {
                        typewriterQueue = typewriterQueue.then(() =>
                            typeText(aiMessageIndex, content + "\n", 15)
                        );
                    }

                    // 处理 result 类型，保存分析类型
                    if (message.type === "result" && message.data) {
                        const currentMessage = messages.value[aiMessageIndex];
                        if (currentMessage) {
                            currentMessage.resultData = message.data;
                            currentMessage.analysisType =
                                message.data.analysis_type;

                            // 如果有 recommendations 字段，将其内容添加到消息中
                            if (message.data.recommendations) {
                                typewriterQueue = typewriterQueue.then(() =>
                                    typeText(
                                        aiMessageIndex,
                                        "\n\n" + message.data.recommendations,
                                        15
                                    )
                                );
                            }
                        }
                    }

                    if (message.type === "end") {
                        typewriterQueue.then(() => {
                            const currentMessage =
                                messages.value[aiMessageIndex];
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
                    console.error("流式请求错误:", error);
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
                .replace(/\n/g, "<br>")
                .replace(/`([^`]+)`/g, "<code>$1</code>")
                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        };

        // 滚动到底部
        const scrollToBottom = () => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop =
                    messagesContainer.value.scrollHeight;
            }
        };

        // 生命周期
        onMounted(() => {
            scrollToBottom();
        });

        // 返回 JSX render 函数
        return () => (
            <AConfigProvider theme={antdTheme}>
                <div class="chat-page">
                    <div class="chat-main">
                        {/* 消息列表 */}
                        <div class="messages-container" ref={messagesContainer}>
                            {messages.value.map((message, index) => (
                                <div key={index} class="message-item">
                                    <div
                                        class={[
                                            "message-content",
                                            message.role,
                                        ]}
                                    >
                                        <div class="message-avatar">
                                            <AAvatar
                                                size={32}
                                                style={{
                                                    backgroundColor:
                                                        message.role === "user"
                                                            ? "#5436DA"
                                                            : "#19C37D",
                                                }}
                                            >
                                                {{
                                                    icon: () =>
                                                        message.role ===
                                                        "user" ? (
                                                            <UserOutlined />
                                                        ) : (
                                                            <RobotOutlined />
                                                        ),
                                                }}
                                            </AAvatar>
                                        </div>
                                        <div class="message-body">
                                            <div
                                                class={[
                                                    "message-text",
                                                    {
                                                        typing:
                                                            message.role ===
                                                                "ai" &&
                                                            isLoading.value &&
                                                            index ===
                                                                messages.value
                                                                    .length -
                                                                    1,
                                                    },
                                                ]}
                                                innerHTML={formatMessage(
                                                    message.content
                                                )}
                                            ></div>

                                            {/* 结果提示集 */}
                                            {message.role === "ai" &&
                                                message.analysisType &&
                                                message.isCompleted && (
                                                    <div class="custom-prompts">
                                                        <div class="prompts-title">
                                                            {getPromptsTitle(
                                                                message.analysisType
                                                            )}
                                                        </div>
                                                        <div class="prompts-grid">
                                                            {getPromptsItems(
                                                                message.analysisType
                                                            ).map((item) => (
                                                                <div
                                                                    key={
                                                                        item.key
                                                                    }
                                                                    class="prompt-card"
                                                                    onClick={() =>
                                                                        handlePromptClick(
                                                                            item.route
                                                                        )
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.label
                                                                        }
                                                                        class="prompt-image"
                                                                    />
                                                                    <div class="prompt-content">
                                                                        <div class="prompt-header">
                                                                            {h(
                                                                                item.icon,
                                                                                {
                                                                                    style: {
                                                                                        color: item.iconColor,
                                                                                        fontSize:
                                                                                            "18px",
                                                                                    },
                                                                                }
                                                                            )}
                                                                            <span class="prompt-label">
                                                                                {
                                                                                    item.label
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div class="prompt-description">
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 输入框 */}
                        <div class="input-container">
                            <div class="input-wrapper">
                                <ATextarea
                                    value={inputMessage.value}
                                    onUpdate:value={(val: string) =>
                                        (inputMessage.value = val)
                                    }
                                    placeholder="发送消息给 AI 助手..."
                                    autoSize={{ minRows: 1, maxRows: 6 }}
                                    bordered={false}
                                    onKeydown={(e: KeyboardEvent) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    class="message-input"
                                />
                                <AButton
                                    type="text"
                                    disabled={
                                        !inputMessage.value.trim() ||
                                        isLoading.value
                                    }
                                    onClick={sendMessage}
                                    class="send-button"
                                >
                                    <SendOutlined
                                        style={{ fontSize: "20px" }}
                                    />
                                </AButton>
                            </div>
                        </div>
                    </div>
                </div>
            </AConfigProvider>
        );
    },
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
        content: "|";
        color: #6b7280;
        animation: blink 1s step-end infinite;
        margin-left: 2px;
    }

    :deep(code) {
        background: #2a2a2a;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: "SF Mono", "Consolas", monospace;
        font-size: 0.9em;
        color: #60a5fa;
    }

    :deep(strong) {
        font-weight: 600;
        color: #ffffff;
    }

    :deep(br) {
        display: block;
        content: "";
        margin: 8px 0;
    }
}

.input-container {
    // position: fixed;
    // bottom: 0;
    // left: 50%;
    transform: translateY(-120%);
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

// 自定义 Prompts 样式（暗色主题）
.custom-prompts {
    margin-top: 16px;
    background: #2a2a2a;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #3f3f3f;

    .prompts-title {
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 12px;
    }

    .prompts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
    }

    .prompt-card {
        position: relative;
        background: #2f2f2f;
        border: 1px solid #3f3f3f;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            border-color: #5436da;
            box-shadow: 0 4px 16px rgba(84, 54, 218, 0.4);
            transform: translateY(-2px);

            .prompt-image {
                transform: scale(1.05);
            }
        }

        &:active {
            transform: translateY(0);
        }
    }

    .prompt-image {
        width: 100%;
        height: 160px;
        object-fit: cover;
        transition: transform 0.3s ease;
        display: block;
    }

    .prompt-content {
        padding: 14px;
    }

    .prompt-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .prompt-label {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
    }

    .prompt-description {
        font-size: 13px;
        color: #9ca3af;
        line-height: 1.5;
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

    .custom-prompts {
        .prompts-grid {
            grid-template-columns: 1fr;
        }

        .prompt-image {
            height: 140px;
        }
    }
}
</style>
