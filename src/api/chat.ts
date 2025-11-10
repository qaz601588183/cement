/**
 * 聊天分析流式接口
 */

/**
 * 分析请求参数
 */
export interface AnalyzeRequest {
    /** 用户问题 */
    query: string;
}

/**
 * 流式响应消息类型
 */
export interface StreamMessage {
    type: 'start' | 'progress' | 'result' | 'end';
    message?: string;
    data?: any;
}

/**
 * 流式响应回调函数类型
 */
export type StreamCallback = (message: StreamMessage, content: string) => void;
export type StreamCompleteCallback = (fullContent: string) => void;
export type StreamErrorCallback = (error: Error) => void;

/**
 * 聊天分析 API
 */
export class ChatAPI {
    /**
     * 流式分析接口
     *
     * @param data 请求参数
     * @param onChunk 接收到数据块时的回调
     * @param onComplete 流式响应完成时的回调
     * @param onError 错误回调
     * @returns 取消请求的函数
     */
    static analyzeStream(
        data: AnalyzeRequest,
        onChunk: StreamCallback,
        onComplete?: StreamCompleteCallback,
        onError?: StreamErrorCallback
    ): () => void {
        const baseURL = import.meta.env.VITE_API;
        const url = `${baseURL}/api/analyze_stream`;

        // 获取 token
        const token = localStorage.getItem('accessToken') || '';

        // 创建 AbortController 用于取消请求
        const abortController = new AbortController();
        let fullContent = '';

        // 发起请求
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(data),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 检查响应类型
                const contentType = response.headers.get('content-type') || '';

                if (contentType.includes('text/event-stream')) {
                    // SSE 格式（但实际可能是 JSON Lines）
                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();

                    if (!reader) {
                        throw new Error('Response body is null');
                    }

                    let buffer = '';
                    let isStreamEnded = false;

                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            // 处理剩余的 buffer
                            if (buffer.trim()) {
                                const trimmedBuffer = buffer.trim();

                                // 尝试处理 SSE 格式
                                if (trimmedBuffer.startsWith('data: ')) {
                                    const data = trimmedBuffer.slice(6);
                                    if (data !== '[DONE]') {
                                        try {
                                            const json: StreamMessage = JSON.parse(data);
                                            const content = json.message || '';
                                            if (content) {
                                                fullContent += content;
                                            }
                                            onChunk(json, content);
                                        } catch (e) {
                                            console.warn('解析剩余 buffer 失败:', e);
                                        }
                                    }
                                } else {
                                    // 尝试作为纯 JSON 处理
                                    try {
                                        const json: StreamMessage = JSON.parse(trimmedBuffer);
                                        const content = json.message || '';
                                        if (content) {
                                            fullContent += content;
                                        }
                                        onChunk(json, content);
                                        if (json.type === 'end') {
                                            isStreamEnded = true;
                                        }
                                    } catch (e) {
                                        console.warn('解析剩余 buffer 失败:', e);
                                    }
                                }
                            }

                            if (!isStreamEnded && onComplete) {
                                onComplete(fullContent);
                            }
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) continue;

                            // 尝试处理 SSE 格式（data: 前缀）
                            if (trimmedLine.startsWith('data: ')) {
                                const data = trimmedLine.slice(6);
                                if (data === '[DONE]') {
                                    if (!isStreamEnded && onComplete) {
                                        isStreamEnded = true;
                                        onComplete(fullContent);
                                    }
                                    return;
                                }
                                try {
                                    const json: StreamMessage = JSON.parse(data);
                                    const content = json.message || '';
                                    if (content) {
                                        fullContent += content;
                                    }
                                    onChunk(json, content);

                                    if (json.type === 'end' && !isStreamEnded) {
                                        isStreamEnded = true;
                                        if (onComplete) {
                                            onComplete(fullContent);
                                        }
                                    }
                                } catch {
                                    // 如果不是 JSON，直接使用原始数据
                                    fullContent += data;
                                    onChunk({ type: 'progress', message: data }, data);
                                }
                            } else {
                                // 尝试作为纯 JSON 处理（没有 data: 前缀）
                                try {
                                    const json: StreamMessage = JSON.parse(trimmedLine);
                                    const content = json.message || '';
                                    if (content) {
                                        fullContent += content;
                                    }
                                    onChunk(json, content);

                                    if (json.type === 'end' && !isStreamEnded) {
                                        isStreamEnded = true;
                                        if (onComplete) {
                                            onComplete(fullContent);
                                        }
                                    }
                                } catch (e) {
                                    console.warn('解析 JSON 失败:', e, trimmedLine);
                                }
                            }
                        }
                    }
                } else {
                    // 流式 JSON 格式（每行一个 JSON 对象）
                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();

                    if (!reader) {
                        throw new Error('Response body is null');
                    }

                    let buffer = '';
                    let isStreamEnded = false; // 标记流是否已结束

                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            // 处理剩余的 buffer
                            if (buffer.trim()) {
                                try {
                                    const json: StreamMessage = JSON.parse(buffer.trim());
                                    const content = json.message || '';
                                    if (content) {
                                        fullContent += content;
                                    }
                                    onChunk(json, content);

                                    // 检查是否是结束消息
                                    if (json.type === 'end') {
                                        isStreamEnded = true;
                                    }
                                } catch (e) {
                                    console.warn('解析最后 buffer 失败:', e, buffer);
                                }
                            }

                            // 只在流结束时调用 onComplete
                            if (!isStreamEnded && onComplete) {
                                onComplete(fullContent);
                            }
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });

                        // 按行分割处理（支持 JSON Lines 格式）
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (trimmedLine) {
                                try {
                                    // 解析 JSON 对象
                                    const json: StreamMessage = JSON.parse(trimmedLine);

                                    // 提取内容（只累积有 message 的消息）
                                    const content = json.message || '';
                                    if (content) {
                                        fullContent += content;
                                    }

                                    // 调用回调，传递完整的消息对象和内容
                                    onChunk(json, content);

                                    // 如果是 end 类型，调用完成回调并标记
                                    if (json.type === 'end' && !isStreamEnded) {
                                        isStreamEnded = true;
                                        if (onComplete) {
                                            onComplete(fullContent);
                                        }
                                    }
                                } catch (e) {
                                    // 如果不是有效的 JSON，尝试作为纯文本处理
                                    console.warn('解析 JSON 失败:', e, trimmedLine);
                                    fullContent += trimmedLine;
                                    onChunk(
                                        { type: 'progress', message: trimmedLine },
                                        trimmedLine
                                    );
                                }
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                if (error.name === 'AbortError') {
                    console.log('请求已取消');
                    return;
                }
                console.error('流式请求错误:', error);
                if (onError) {
                    onError(error);
                }
            });

        // 返回取消函数
        return () => {
            abortController.abort();
        };
    }
}
