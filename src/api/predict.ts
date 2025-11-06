import request from './axios';
import { openMock, optimizeRes, predictRes } from './mock';

/**
 * 强度预测请求参数
 */
export interface PredictRequest {
    /** 水泥用量 (kg/m³) */
    cement: number;
    /** 高炉矿渣 (kg/m³) */
    blast_furnace_slag: number;
    /** 粉煤灰 (kg/m³) */
    fly_ash: number;
    /** 水用量 (kg/m³) */
    water: number;
    /** 高效减水剂 (kg/m³) */
    superplasticizer: number;
    /** 粗骨料 (kg/m³) */
    coarse_aggregate: number;
    /** 细骨料 (kg/m³) */
    fine_aggregate: number;
    /** 龄期 (天) */
    age: number;
}

/**
 * 置信区间
 */
export interface ConfidenceInterval {
    lower: number;
    upper: number;
}

/**
 * 相似样本
 */
export interface SimilarSample {
    cement?: number;
    water?: number;
    blast_furnace_slag?: number;
    actual_strength?: number;
    age?: number;
    [key: string]: any;
}

/**
 * 因素权重
 */
export interface FeatureWeight {
    name: string;
    weight_pct: number;
    causal_effect: number;
    score: number;
    direction: '正向' | '负向';
}

/**
 * 强度预测响应
 */
export interface PredictResponse {
    /** 请求是否成功 */
    success: boolean;
    /** 预测抗压强度 (MPa) */
    predicted_strength: number;
    /** 水胶比 */
    water_binder_ratio: number;
    /** 胶凝材料总量 (kg/m³) */
    total_binder: number;
    /** 砂率 (%) */
    sand_ratio: number;
    /** 95%置信区间 */
    confidence_interval?: ConfidenceInterval;
    /** 工程评估解释 */
    interpretation: string;
    /** 相似配合比样本 */
    similar_samples?: SimilarSample[];
    /** 影响因素权重 */
    feature_weights?: Record<string, FeatureWeight>;
    /** 错误信息 */
    error?: string | null;
}

/**
 * 验证错误详情
 */
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

/**
 * HTTP验证错误响应
 */
export interface HTTPValidationError {
    detail?: ValidationError[];
}

/**
 * 预测API
 */
export class PredictAPI {
    /**
     * 预测混凝土抗压强度
     *
     * 根据用户输入的配合比参数，使用因果模型预测28天抗压强度
     *
     * @param data 配合比参数
     * @returns 预测结果
     *
     * @example
     * ```typescript
     * const result = await PredictAPI.predictStrength({
     *   cement: 280,
     *   blast_furnace_slag: 100,
     *   fly_ash: 50,
     *   water: 180,
     *   superplasticizer: 8,
     *   coarse_aggregate: 1000,
     *   fine_aggregate: 800,
     *   age: 28
     * });
     * ```
     */
    static async predictStrength(data: PredictRequest): Promise<PredictResponse> {
        // 如果开启 mock 模式，返回 mock 数据
        if (openMock) {
            console.log('🔧 Mock模式已开启，返回预测接口mock数据');
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
            return Promise.resolve(predictRes as PredictResponse);
        }

        // 正常请求接口
        return request({
            url: '/api/predict',
            method: 'POST',
            data,
        });
    }
}

/**
 * 观测配比数据（用于反事实分析）
 */
export interface ObservedConfig {
    /** 水泥用量 (kg/m³) */
    cement: number;
    /** 高炉矿渣 (kg/m³) */
    blast_furnace_slag?: number;
    /** 粉煤灰 (kg/m³) */
    fly_ash?: number;
    /** 水用量 (kg/m³) */
    water: number;
    /** 高效减水剂 (kg/m³) */
    superplasticizer?: number;
    /** 粗骨料 (kg/m³) */
    coarse_aggregate: number;
    /** 细骨料 (kg/m³) */
    fine_aggregate: number;
    /** 龄期 (天) */
    age?: number;
}

/**
 * 智能优化请求参数
 */
export interface OptimizeRequest {
    /** 基准配比 */
    base_config: ObservedConfig;
    /** 目标强度 (MPa) */
    target_strength: number;
    /** 要调整的因素列表 */
    adjust_factors: string[];
}

/**
 * 调整详情
 */
export interface Adjustment {
    factor: string;
    original_value: number;
    optimized_value: number;
    change: number;
    change_percent: number;
    [key: string]: any;
}

/**
 * 智能优化响应
 */
export interface OptimizeResponse {
    /** 请求是否成功 */
    success: boolean;
    /** 基准配比 */
    base_config: Record<string, any>;
    /** 基准强度 (MPa) */
    base_strength: number;
    /** 优化后的配比 */
    optimized_config: Record<string, any>;
    /** 预测强度 (MPa) */
    predicted_strength: number;
    /** 强度提升百分比 */
    improvement_percent: number;
    /** 调整详情 */
    adjustments: Adjustment[];
    /** 建议 */
    recommendations: string;
    /** 错误信息 */
    error?: string | null;
}

/**
 * 优化API
 */
export class OptimizeAPI {
    /**
     * 智能优化混凝土配合比
     *
     * 根据基准配比、目标强度和可调整因素，自动优化配合比以达到目标强度
     *
     * @param data 优化请求参数
     * @returns 优化结果
     *
     * @example
     * ```typescript
     * const result = await OptimizeAPI.optimizeConfig({
     *   base_config: {
     *     cement: 300,
     *     blast_furnace_slag: 0,
     *     fly_ash: 0,
     *     water: 185,
     *     superplasticizer: 3,
     *     coarse_aggregate: 1050,
     *     fine_aggregate: 850,
     *     age: 28
     *   },
     *   target_strength: 45,
     *   adjust_factors: ['cement', 'fly_ash']
     * });
     * ```
     */
    static async optimizeConfig(data: OptimizeRequest): Promise<OptimizeResponse> {
        // 如果开启 mock 模式，返回 mock 数据
        if (openMock) {
            console.log('🔧 Mock模式已开启，返回优化接口mock数据');
            // 模拟网络延迟（优化接口通常较慢）
            await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
            return Promise.resolve(optimizeRes as OptimizeResponse);
        }

        // 正常请求接口
        return request({
            url: '/api/optimize',
            method: 'POST',
            data,
        });
    }
}

/**
 * 默认导出
 */
export default PredictAPI;
