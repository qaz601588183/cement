import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 配合比参数接口（来自你同事的数据）
 */
export interface MixProportionParams {
    cement: number; // 水泥用量 (kg/m³)
    blast_furnace_slag: number; // 高炉矿渣 (kg/m³)
    fly_ash: number; // 粉煤灰 (kg/m³)
    water: number; // 水用量 (kg/m³)
    superplasticizer: number; // 高效减水剂 (kg/m³)
    coarse_aggregate: number; // 粗骨料 (kg/m³)
    fine_aggregate: number; // 细骨料 (kg/m³)
    age: number; // 龄期 (天)
}

/**
 * 混凝土数据接口
 */
export interface ConcreteData {
    // 配合比参数
    mixProportionParams: MixProportionParams;

    // 可以添加其他需要的字段
    [key: string]: any;
}

/**
 * 混凝土数据管理Store
 * 用于存储和管理从外部传入的混凝土检测数据
 */
export const useConcreteStore = defineStore('concrete', () => {
    // 当前混凝土数据（用于检测页面传递数据）
    const concreteData = ref<ConcreteData | null>(null);

    // 正向推演数据
    const forwardData = ref<any>({
        mixProportionParams: {
            cement: 380,
            blast_furnace_slag: 50,
            fly_ash: 60,
            water: 170,
            superplasticizer: 5,
            coarse_aggregate: 1100,
            fine_aggregate: 650,
            age: 28,
        },
        // 存储步骤2的分析结果
        analysisResult: null,
    });

    // 反向推演数据
    const reverseData = ref<any>(null);

    /**
     * 设置混凝土数据
     * @param data 混凝土检测数据
     */
    const setConcreteData = (data: ConcreteData) => {
        concreteData.value = data;
    };

    /**
     * 更新混凝土数据（部分更新）
     * @param partialData 部分数据
     */
    const updateConcreteData = (partialData: Partial<ConcreteData>) => {
        if (concreteData.value) {
            concreteData.value = {
                ...concreteData.value,
                ...partialData,
            };
        }
    };

    /**
     * 清空混凝土数据
     */
    const clearConcreteData = () => {
        concreteData.value = null;
    };

    /**
     * 检查是否有数据
     */
    const hasData = () => {
        return concreteData.value !== null;
    };

    // ========== 正向推演相关方法 ==========

    /**
     * 设置正向推演数据
     * @param data 正向推演数据
     */
    const setForwardData = (data: any) => {
        forwardData.value = data;
    };

    /**
     * 更新正向推演数据（部分更新）
     * @param partialData 部分数据
     */
    const updateForwardData = (partialData: Partial<any>) => {
        if (forwardData.value) {
            forwardData.value = {
                ...forwardData.value,
                ...partialData,
            };
        }
    };

    /**
     * 清空正向推演数据
     */
    const clearForwardData = () => {
        forwardData.value = {
            mixProportionParams: {
                cement: 380,
                blast_furnace_slag: 50,
                fly_ash: 60,
                water: 170,
                superplasticizer: 5,
                coarse_aggregate: 1100,
                fine_aggregate: 650,
                age: 28,
            },
            analysisResult: null,
        };
    };

    // ========== 反向推演相关方法 ==========

    /**
     * 设置反向推演数据
     * @param data 反向推演数据
     */
    const setReverseData = (data: any) => {
        reverseData.value = data;
    };

    /**
     * 更新反向推演数据（部分更新）
     * @param partialData 部分数据
     */
    const updateReverseData = (partialData: Partial<any>) => {
        if (reverseData.value) {
            reverseData.value = {
                ...reverseData.value,
                ...partialData,
            };
        } else {
            reverseData.value = partialData;
        }
    };

    /**
     * 清空反向推演数据
     */
    const clearReverseData = () => {
        reverseData.value = null;
    };

    return {
        // 原有数据和方法
        concreteData,
        setConcreteData,
        updateConcreteData,
        clearConcreteData,
        hasData,
        // 正向推演
        forwardData,
        setForwardData,
        updateForwardData,
        clearForwardData,
        // 反向推演
        reverseData,
        setReverseData,
        updateReverseData,
        clearReverseData,
    };
});
