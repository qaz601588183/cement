export const predictRes = {
    success: true,
    predicted_strength: 66.47795656355034,
    water_binder_ratio: 0.0,
    total_binder: 0.0,
    sand_ratio: 0.0,
    confidence_interval: {
        lower: 62.44879811294341,
        upper: 70.50711501415726,
    },
    interpretation:
        '\n根据您输入的配合比参数，预测结果如下：\n\n📊 输入配合比（9个原始字段）：\n  • 水泥 (Cement): 400.0 kg/m³\n  • 高炉矿渣 (Blast Furnace Slag): 150.0 kg/m³\n  • 粉煤灰 (Fly Ash): 80.0 kg/m³\n  • 水 (Water): 150.0 kg/m³\n  • 高效减水剂 (Superplasticizer): 15.0 kg/m³\n  • 粗骨料 (Coarse Aggregate): 950.0 kg/m³\n  • 细骨料 (Fine Aggregate): 750.0 kg/m³\n  • 龄期 (Age): 28 天\n\n🎯 预测抗压强度: 66.48 MPa\n📊 95%置信区间: [62.45, 70.51] MPa\n\n💡 工程评估：\n  • 高强度混凝土，适用于高层建筑、桥梁等重要结构\n',
    similar_samples: [
        {
            cement: 379.5,
            water: 153.9,
            blast_furnace_slag: 151.2,
            actual_strength: 52.2,
            age: 28,
        },
        {
            cement: 389.9,
            water: 145.9,
            blast_furnace_slag: 189.0,
            actual_strength: 74.5,
            age: 28,
        },
        {
            cement: 356.0,
            water: 160.0,
            blast_furnace_slag: 119.0,
            actual_strength: 59.0,
            age: 28,
        },
    ],
    feature_weights: {
        superplasticizer: {
            name: '高效减水剂',
            weight_pct: 42.05984988894842,
            causal_effect: 4.734265101104653,
            score: 85,
            direction: '正向',
        },
        age: {
            name: '养护成熟度',
            weight_pct: 27.4601799712276,
            causal_effect: 3.090923340218468,
            score: 75,
            direction: '正向',
        },
        water: {
            name: '水用量',
            weight_pct: 15.321358731075568,
            causal_effect: -1.7245751978086687,
            score: 90,
            direction: '负向',
        },
        cement: {
            name: '水泥用量',
            weight_pct: 9.313937129458735,
            causal_effect: 1.0483786228981664,
            score: 85,
            direction: '正向',
        },
        blast_furnace_slag: {
            name: '高炉矿渣',
            weight_pct: 3.3934222780473036,
            causal_effect: 0.38196428914245145,
            score: 80,
            direction: '正向',
        },
        fine_aggregate: {
            name: '细骨料',
            weight_pct: 1.7607544859090027,
            causal_effect: -0.19819087648343653,
            score: 80,
            direction: '负向',
        },
        coarse_aggregate: {
            name: '粗骨料',
            weight_pct: 0.6723943781699008,
            causal_effect: -0.0756848454560263,
            score: 80,
            direction: '负向',
        },
        fly_ash: {
            name: '粉煤灰',
            weight_pct: 0.018103137163480932,
            causal_effect: -0.002037692733565799,
            score: 80,
            direction: '负向',
        },
    },
    error: null,
};

export const optimizeRes = {
    success: true,
    base_config: {
        cement: 300.0,
        blast_furnace_slag: 0.0,
        fly_ash: 0.0,
        water: 185.0,
        superplasticizer: 3.0,
        coarse_aggregate: 1050.0,
        fine_aggregate: 850.0,
        age: 28,
    },
    base_strength: 33.75,
    optimized_config: {
        cement: 449.71,
        blast_furnace_slag: 0.0,
        fly_ash: 0.0,
        water: 185.0,
        superplasticizer: 3.0,
        coarse_aggregate: 1050.0,
        fine_aggregate: 850.0,
        age: 28,
    },
    predicted_strength: 44.51,
    improvement_percent: 31.9,
    adjustments: [
        {
            factor: 'cement',
            name: '水泥',
            original_value: 300.0,
            optimized_value: 449.71,
            change: 149.71,
            change_percent: 49.9,
        },
    ],
    recommendations:
        '\n🎯 优化方案摘要\n\n基准强度：33.75 MPa\n优化强度：44.51 MPa\n实际提升：+31.9%\n目标强度：45.00 MPa\n误差：0.49 MPa\n\n📝 配比调整建议：\n\n• 水泥: 300.0 → 449.7 kg/m³ (+49.9%)\n\n💡 实施建议：\n1. 建议按照优化后的配比进行试配\n2. 关注施工和易性的变化\n3. 必要时微调减水剂用量\n4. 建议至少制作3组试块验证强度\n',
    error: null,
};

export const openMock = true;
