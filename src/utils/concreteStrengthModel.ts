/**
 * 混凝土强度推演算法模块
 * 基于建筑工程学理论和经验公式
 */

/**
 * 影响因素接口定义（基于关键参数）
 */
export interface ConcreteParameters {
    // 关键参数1: 水泥用量 (kg/m³) [200-600]
    cement_content: number;

    // 关键参数2: 水灰比 (W/C) [0.25-0.65]
    water_cement_ratio: number;

    // 关键参数3: 高效减水剂掺量 (%) [0-3]
    water_reducer_dosage: number;

    // 关键参数4: 养护温度×龄期（成熟度）
    curing_temperature: number; // 养护温度 (°C) [5-40]
    curing_days: number; // 养护龄期 (天) [1-90]

    // 关键参数5: 粉煤灰/矿渣掺量 (%) [0-40]
    fly_ash_dosage: number; // 粉煤灰掺量
    slag_dosage: number; // 矿渣掺量

    // 关键参数6: 粗骨料用量 (kg/m³) [900-1300]
    coarse_aggregate_content: number;

    // 关键参数7: 细骨料用量 & 砂率
    fine_aggregate_content: number; // 细骨料用量 (kg/m³) [500-800]
    sand_ratio: number; // 砂率 (%) [30-45]

    // 辅助参数（保持兼容性）
    cement_strength_grade?: number; // 水泥强度等级 (32.5, 42.5, 52.5)
    cement_fineness?: number; // 水泥细度 (比表面积 m²/kg)
    curing_humidity?: number; // 养护湿度 (%)
    curing_method?: string; // 养护方式
    aggregate_mud_content?: number; // 骨料含泥量 (%)
    aggregate_quality_score?: number; // 骨料质量评分 (0-100)
    admixture_type?: string; // 外加剂类型
    admixture_dosage?: number; // 外加剂掺量 (%)
}

/**
 * 基于关键参数计算混凝土抗压强度
 * 核心公式：fc = f(C, W/C, R, M, FA, CA, SA, SR)
 * C: 水泥用量, W/C: 水灰比, R: 减水剂掺量, M: 成熟度
 * FA: 粉煤灰/矿渣, CA: 粗骨料, SA: 细骨料, SR: 砂率
 */
export function calculateConcreteStrength(params: ConcreteParameters): number {
    // 1. 基于水泥用量和水灰比的基础强度
    const baseStrength = calculateBaseStrengthNew(params.cement_content, params.water_cement_ratio);

    // 2. 高效减水剂影响系数
    const waterReducerFactor = calculateWaterReducerFactor(params.water_reducer_dosage);

    // 3. 成熟度影响系数（温度×龄期）
    const maturityFactor = calculateMaturityFactor(params.curing_temperature, params.curing_days);

    // 4. 矿物掺合料影响系数（粉煤灰+矿渣）
    const mineralAdmixtureFactor = calculateMineralAdmixtureFactor(
        params.fly_ash_dosage,
        params.slag_dosage
    );

    // 5. 骨料配比影响系数（粗骨料+细骨料+砂率）
    const aggregateFactor = calculateAggregateFactorNew(
        params.coarse_aggregate_content,
        params.fine_aggregate_content,
        params.sand_ratio
    );

    // 综合计算最终强度
    const finalStrength =
        baseStrength *
        waterReducerFactor *
        maturityFactor *
        mineralAdmixtureFactor *
        aggregateFactor;

    return Math.round(finalStrength * 10) / 10; // 保留一位小数
}

/**
 * 基于水泥用量和水灰比计算基础强度（改进的鲍罗米公式）
 * fc = K * C / (1 + α * W/C)
 * C: 水泥用量, W/C: 水灰比
 */
function calculateBaseStrengthNew(cementContent: number, waterCementRatio: number): number {
    // 水泥用量系数（每100kg/m³水泥约贡献8-10MPa强度）
    const K = 0.095; // 回归系数
    const α = 6.5; // 水灰比影响系数

    // 基础强度计算
    const strength = (K * cementContent) / (1 + α * waterCementRatio);

    return strength;
}

/**
 * 计算高效减水剂影响系数
 * 减水剂可以降低用水量，提高强度
 */
function calculateWaterReducerFactor(dosage: number): number {
    if (dosage <= 0) return 0.92; // 无减水剂，强度较低
    if (dosage >= 0.5 && dosage <= 2.5) return 1.08 + (dosage - 0.5) * 0.02; // 最优范围
    if (dosage > 2.5) return 1.12 - (dosage - 2.5) * 0.03; // 过量反而降低
    return 1.0 + dosage * 0.08; // 线性增长
}

/**
 * 计算成熟度影响系数（温度×龄期）
 * M = T × t (成熟度理论)
 */
function calculateMaturityFactor(temperature: number, days: number): number {
    // 计算成熟度
    const maturity = temperature * days;

    // 标准成熟度为 20°C × 28天 = 560
    const standardMaturity = 560;

    // 龄期影响（对数曲线）
    let ageFactor = 1.0;
    if (days >= 28) {
        ageFactor = 1.0 + Math.log10(days / 28) * 0.08; // 28天后缓慢增长
    } else if (days >= 14) {
        ageFactor = 0.85 + ((days - 14) / 14) * 0.15;
    } else if (days >= 7) {
        ageFactor = 0.7 + ((days - 7) / 7) * 0.15;
    } else if (days >= 3) {
        ageFactor = 0.5 + ((days - 3) / 4) * 0.2;
    } else {
        ageFactor = 0.3 + (days / 3) * 0.2;
    }

    // 温度影响
    let tempFactor = 1.0;
    if (temperature >= 18 && temperature <= 22) {
        tempFactor = 1.0; // 最优温度
    } else if (temperature >= 15 && temperature < 18) {
        tempFactor = 0.95;
    } else if (temperature < 15) {
        tempFactor = 0.88 - (15 - temperature) * 0.02;
    } else if (temperature > 22 && temperature <= 30) {
        tempFactor = 0.98;
    } else if (temperature > 30) {
        tempFactor = 0.9 - (temperature - 30) * 0.015;
    }

    return ageFactor * tempFactor;
}

/**
 * 计算矿物掺合料影响系数（粉煤灰+矿渣）
 * 适量掺加可以改善后期强度，但早期强度会降低
 */
function calculateMineralAdmixtureFactor(flyAshDosage: number, slagDosage: number): number {
    const totalDosage = flyAshDosage + slagDosage;

    if (totalDosage === 0) return 1.0; // 无掺合料

    // 粉煤灰影响（10-20%最优）
    let flyAshFactor = 1.0;
    if (flyAshDosage > 0) {
        if (flyAshDosage >= 10 && flyAshDosage <= 20) {
            flyAshFactor = 1.02 + (flyAshDosage - 10) * 0.002;
        } else if (flyAshDosage < 10) {
            flyAshFactor = 1.0 + flyAshDosage * 0.002;
        } else {
            flyAshFactor = 1.04 - (flyAshDosage - 20) * 0.008; // 过量降低早期强度
        }
    }

    // 矿渣影响（10-30%最优）
    let slagFactor = 1.0;
    if (slagDosage > 0) {
        if (slagDosage >= 10 && slagDosage <= 30) {
            slagFactor = 1.03 + (slagDosage - 10) * 0.001;
        } else if (slagDosage < 10) {
            slagFactor = 1.0 + slagDosage * 0.003;
        } else {
            slagFactor = 1.05 - (slagDosage - 30) * 0.01;
        }
    }

    // 总掺量不宜超过40%
    let totalFactor = flyAshFactor * slagFactor;
    if (totalDosage > 40) {
        totalFactor *= 1 - (totalDosage - 40) * 0.015;
    }

    return Math.max(totalFactor, 0.85); // 最低不低于0.85
}

/**
 * 计算骨料配比影响系数（粗骨料+细骨料+砂率）
 */
function calculateAggregateFactorNew(
    coarseAggregate: number,
    fineAggregate: number,
    sandRatio: number
): number {
    // 粗骨料影响（1000-1200 kg/m³最优）
    let coarseFactor = 1.0;
    if (coarseAggregate >= 1000 && coarseAggregate <= 1200) {
        coarseFactor = 1.02;
    } else if (coarseAggregate < 1000) {
        coarseFactor = 0.98 - (1000 - coarseAggregate) * 0.0001;
    } else {
        coarseFactor = 1.02 - (coarseAggregate - 1200) * 0.0001;
    }

    // 细骨料影响（600-700 kg/m³最优）
    let fineFactor = 1.0;
    if (fineAggregate >= 600 && fineAggregate <= 700) {
        fineFactor = 1.0;
    } else if (fineAggregate < 600) {
        fineFactor = 0.98;
    } else {
        fineFactor = 1.0 - (fineAggregate - 700) * 0.0002;
    }

    // 砂率影响（35-40%最优）
    let sandRatioFactor = 1.0;
    if (sandRatio >= 35 && sandRatio <= 40) {
        sandRatioFactor = 1.02;
    } else if (sandRatio < 35) {
        sandRatioFactor = 1.0 - (35 - sandRatio) * 0.01;
    } else {
        sandRatioFactor = 1.02 - (sandRatio - 40) * 0.008;
    }

    return coarseFactor * fineFactor * sandRatioFactor;
}

// ========== 以下保留旧函数以兼容旧代码 ==========

/**
 * 计算基础强度（鲍罗米公式）- 旧版本
 */
function calculateBaseStrength(waterCementRatio: number, cementGrade: number): number {
    // 经验系数
    const A = 0.46; // 回归系数A
    const B = 0.07; // 回归系数B

    // 水泥实际强度 (考虑安全系数)
    const cementStrength = cementGrade * 1.13;

    // 鲍罗米公式
    const strength = (A * cementStrength) / (1 + B * cementStrength * waterCementRatio);

    return strength;
}

/**
 * 计算水泥细度修正系数
 * 水泥越细,水化反应越充分,强度越高
 */
function calculateFinenessFactor(fineness: number): number {
    // 标准细度: 350 m²/kg
    const standardFineness = 350;

    if (fineness >= 400) return 1.08; // 超细水泥
    if (fineness >= 380) return 1.05;
    if (fineness >= 360) return 1.02;
    if (fineness >= 340) return 1.0; // 标准范围
    if (fineness >= 320) return 0.98;
    return 0.95; // 粗糙水泥
}

/**
 * 计算骨料质量修正系数
 * 含泥量越低,骨料质量越好,强度越高
 */
function calculateAggregateFactor(mudContent: number, qualityScore: number): number {
    // 含泥量影响 (每增加0.5%,强度降低约2%)
    const mudContentFactor = 1 - mudContent * 0.04;

    // 骨料质量评分影响
    const qualityFactor = 0.85 + (qualityScore / 100) * 0.15;

    return mudContentFactor * qualityFactor;
}

/**
 * 计算外加剂修正系数
 */
function calculateAdmixtureFactor(type: string, dosage: number): number {
    let baseFactor = 1.0;

    // 根据外加剂类型确定基础系数
    if (type.includes('高效减水剂') || type.includes('聚羧酸')) {
        baseFactor = 1.15; // 高效减水剂可提高强度15%
    } else if (type.includes('减水剂')) {
        baseFactor = 1.08; // 普通减水剂提高8%
    }

    // 考虑掺量影响 (最优掺量在1.5-2.0%)
    if (dosage >= 1.5 && dosage <= 2.0) {
        return baseFactor * 1.02; // 最优掺量额外提升2%
    } else if (dosage > 2.5) {
        return baseFactor * 0.98; // 过量掺加反而降低
    }

    return baseFactor;
}

/**
 * 计算养护条件修正系数
 * 这是影响强度发展的重要因素
 */
function calculateCuringFactor(
    temperature: number,
    humidity: number,
    days: number,
    method: string
): number {
    // 1. 温度影响系数
    let tempFactor = 1.0;
    if (temperature >= 18 && temperature <= 22) {
        tempFactor = 1.0; // 标准温度
    } else if (temperature >= 15 && temperature < 18) {
        tempFactor = 0.95; // 略低温度
    } else if (temperature < 15) {
        tempFactor = 0.88; // 低温
    } else if (temperature > 22 && temperature <= 28) {
        tempFactor = 0.98; // 略高温度
    } else if (temperature > 28) {
        tempFactor = 0.92; // 高温
    }

    // 2. 湿度影响系数
    let humidityFactor = 1.0;
    if (humidity >= 95) {
        humidityFactor = 1.0; // 标准湿度
    } else if (humidity >= 85) {
        humidityFactor = 0.97;
    } else if (humidity >= 75) {
        humidityFactor = 0.93;
    } else {
        humidityFactor = 0.88; // 湿度不足
    }

    // 3. 龄期影响系数 (基于对数曲线)
    let ageFactor = 1.0;
    if (days >= 28) {
        ageFactor = 1.0; // 标准28天
    } else if (days >= 14) {
        ageFactor = 0.85 + ((days - 14) / 14) * 0.15; // 14-28天线性增长
    } else if (days >= 7) {
        ageFactor = 0.7 + ((days - 7) / 7) * 0.15; // 7-14天
    } else if (days >= 3) {
        ageFactor = 0.5 + ((days - 3) / 4) * 0.2; // 3-7天
    } else {
        ageFactor = 0.4; // 3天内
    }

    // 4. 养护方式影响系数
    let methodFactor = 1.0;
    if (method.includes('标准养护')) {
        methodFactor = 1.0;
    } else if (method.includes('蒸汽养护')) {
        methodFactor = 1.05; // 早期强度高
        if (days < 7) methodFactor = 1.15; // 早期优势明显
    } else if (method.includes('保温')) {
        methodFactor = 0.95;
    } else if (method.includes('现场') || method.includes('自然')) {
        methodFactor = 0.92; // 现场养护条件较差
    }

    return tempFactor * humidityFactor * ageFactor * methodFactor;
}

/**
 * 计算不同龄期的强度发展曲线
 * 返回各个时间点的强度值
 */
export function calculateStrengthDevelopment(
    params: ConcreteParameters,
    targetStrength: number
): { day: number; strength: number }[] {
    const days = [1, 3, 7, 14, 28];

    return days.map((day) => {
        const modifiedParams = { ...params, curing_days: day };
        const strength = calculateConcreteStrength(modifiedParams);

        return {
            day,
            strength: Math.round(strength * 10) / 10,
        };
    });
}

/**
 * 分析参数变化对强度的影响程度
 * 返回各因素的影响权重
 */
export interface FactorInfluence {
    factor: string;
    influence: number; // 影响程度 0-100
    description: string;
    optimization: string; // 优化建议
}

export function analyzeFactorInfluence(params: ConcreteParameters): FactorInfluence[] {
    const influences: FactorInfluence[] = [];

    // 1. 水泥用量影响 (关键参数1, 权重20%)
    let cementContentInfluence = 0;
    let cementContentDesc = '';
    let cementContentOpt = '';

    if (params.cement_content >= 350 && params.cement_content <= 450) {
        cementContentInfluence = 92;
        cementContentDesc = `水泥用量${params.cement_content}kg/m³，配比合理`;
        cementContentOpt = '保持当前水泥用量';
    } else if (params.cement_content < 350) {
        cementContentInfluence = 70 + params.cement_content / 10;
        cementContentDesc = `水泥用量${params.cement_content}kg/m³，偏低`;
        cementContentOpt = '建议增加水泥用量至350kg/m³以上';
    } else {
        cementContentInfluence = 92 - (params.cement_content - 450) * 0.1;
        cementContentDesc = `水泥用量${params.cement_content}kg/m³，较高`;
        cementContentOpt = '水泥用量充足，但成本较高';
    }

    influences.push({
        factor: '水泥用量(C)',
        influence: Math.min(cementContentInfluence, 100),
        description: cementContentDesc,
        optimization: cementContentOpt,
    });

    // 2. 水灰比影响 (关键参数2, 权重25%)
    let waterCementInfluence = 0;
    let waterCementDesc = '';
    let waterCementOpt = '';

    if (params.water_cement_ratio <= 0.35) {
        waterCementInfluence = 98;
        waterCementDesc = `水灰比${params.water_cement_ratio}，控制优秀`;
        waterCementOpt = '保持当前水灰比';
    } else if (params.water_cement_ratio <= 0.4) {
        waterCementInfluence = 90;
        waterCementDesc = `水灰比${params.water_cement_ratio}，控制良好`;
        waterCementOpt = '可考虑进一步降低至0.35以下';
    } else if (params.water_cement_ratio <= 0.45) {
        waterCementInfluence = 75;
        waterCementDesc = `水灰比${params.water_cement_ratio}，中等水平`;
        waterCementOpt = '建议降低至0.4以下以提高强度';
    } else if (params.water_cement_ratio <= 0.5) {
        waterCementInfluence = 60;
        waterCementDesc = `水灰比${params.water_cement_ratio}，偏高`;
        waterCementOpt = '建议降低水灰比或使用高效减水剂';
    } else {
        waterCementInfluence = 40;
        waterCementDesc = `水灰比${params.water_cement_ratio}，过高`;
        waterCementOpt = '必须降低水灰比至0.45以下';
    }

    influences.push({
        factor: '水灰比(W/C)',
        influence: waterCementInfluence,
        description: waterCementDesc,
        optimization: waterCementOpt,
    });

    // 3. 高效减水剂掺量影响 (关键参数3, 权重15%)
    let waterReducerInfluence = 0;
    let waterReducerDesc = '';
    let waterReducerOpt = '';

    if (params.water_reducer_dosage >= 1.5 && params.water_reducer_dosage <= 2.5) {
        waterReducerInfluence = 95;
        waterReducerDesc = `减水剂掺量${params.water_reducer_dosage}%，最优范围`;
        waterReducerOpt = '保持当前掺量';
    } else if (params.water_reducer_dosage >= 0.8 && params.water_reducer_dosage < 1.5) {
        waterReducerInfluence = 82;
        waterReducerDesc = `减水剂掺量${params.water_reducer_dosage}%，略低`;
        waterReducerOpt = '可适当增加至1.5-2.0%';
    } else if (params.water_reducer_dosage > 2.5) {
        waterReducerInfluence = 75 - (params.water_reducer_dosage - 2.5) * 5;
        waterReducerDesc = `减水剂掺量${params.water_reducer_dosage}%，过高`;
        waterReducerOpt = '掺量过高会影响凝结，建议降低';
    } else {
        waterReducerInfluence = 65;
        waterReducerDesc = `减水剂掺量${params.water_reducer_dosage}%，不足`;
        waterReducerOpt = '建议增加减水剂掺量至1.5%以上';
    }

    influences.push({
        factor: '高效减水剂掺量',
        influence: Math.max(Math.min(waterReducerInfluence, 100), 0),
        description: waterReducerDesc,
        optimization: waterReducerOpt,
    });

    // 4. 养护成熟度影响 (关键参数4: 温度×龄期, 权重20%)
    const maturity = params.curing_temperature * params.curing_days;
    const standardMaturity = 560; // 20°C × 28天
    let maturityInfluence = 0;
    let maturityDesc = '';
    let maturityOpt = '';

    if (maturity >= standardMaturity) {
        maturityInfluence = 95;
        maturityDesc = `成熟度${maturity}(${params.curing_temperature}°C×${params.curing_days}天)，充分`;
        maturityOpt = '养护成熟度达标';
    } else if (maturity >= standardMaturity * 0.7) {
        maturityInfluence = 70 + (maturity / standardMaturity) * 25;
        maturityDesc = `成熟度${maturity}(${params.curing_temperature}°C×${params.curing_days}天)，基本足够`;
        maturityOpt = '建议延长养护龄期或提高养护温度';
    } else {
        maturityInfluence = 50 + (maturity / standardMaturity) * 20;
        maturityDesc = `成熟度${maturity}(${params.curing_temperature}°C×${params.curing_days}天)，不足`;
        maturityOpt = '养护成熟度不足，必须改善养护条件';
    }

    influences.push({
        factor: '养护成熟度(T×t)',
        influence: Math.min(maturityInfluence, 100),
        description: maturityDesc,
        optimization: maturityOpt,
    });

    // 5. 粉煤灰/矿渣掺量影响 (关键参数5, 权重8%)
    const totalMineralDosage = params.fly_ash_dosage + params.slag_dosage;
    let mineralInfluence = 0;
    let mineralDesc = '';
    let mineralOpt = '';

    if (totalMineralDosage >= 15 && totalMineralDosage <= 35) {
        mineralInfluence = 88;
        mineralDesc = `掺合料${totalMineralDosage}%(粉煤灰${params.fly_ash_dosage}%+矿渣${params.slag_dosage}%)，合理`;
        mineralOpt = '掺合料配比合理';
    } else if (totalMineralDosage < 15) {
        mineralInfluence = 80;
        mineralDesc = `掺合料${totalMineralDosage}%(粉煤灰${params.fly_ash_dosage}%+矿渣${params.slag_dosage}%)，较少`;
        mineralOpt = '可适当增加掺合料用量以降低成本';
    } else if (totalMineralDosage > 40) {
        mineralInfluence = 70;
        mineralDesc = `掺合料${totalMineralDosage}%(粉煤灰${params.fly_ash_dosage}%+矿渣${params.slag_dosage}%)，过多`;
        mineralOpt = '掺量过高会降低早期强度';
    } else {
        mineralInfluence = 85;
        mineralDesc = `掺合料${totalMineralDosage}%(粉煤灰${params.fly_ash_dosage}%+矿渣${params.slag_dosage}%)，略高`;
        mineralOpt = '掺合料配比基本合理';
    }

    influences.push({
        factor: '粉煤灰/矿渣掺量',
        influence: mineralInfluence,
        description: mineralDesc,
        optimization: mineralOpt,
    });

    // 6. 粗骨料用量影响 (关键参数6, 权重6%)
    let coarseAggInfluence = 0;
    let coarseAggDesc = '';
    let coarseAggOpt = '';

    if (params.coarse_aggregate_content >= 1000 && params.coarse_aggregate_content <= 1200) {
        coarseAggInfluence = 85;
        coarseAggDesc = `粗骨料${params.coarse_aggregate_content}kg/m³，配比合理`;
        coarseAggOpt = '粗骨料用量适宜';
    } else if (params.coarse_aggregate_content < 1000) {
        coarseAggInfluence = 75;
        coarseAggDesc = `粗骨料${params.coarse_aggregate_content}kg/m³，偏少`;
        coarseAggOpt = '适当增加粗骨料用量可降低成本';
    } else {
        coarseAggInfluence = 78;
        coarseAggDesc = `粗骨料${params.coarse_aggregate_content}kg/m³，偏多`;
        coarseAggOpt = '粗骨料用量略高，影响工作性';
    }

    influences.push({
        factor: '粗骨料用量',
        influence: coarseAggInfluence,
        description: coarseAggDesc,
        optimization: coarseAggOpt,
    });

    // 7. 细骨料用量&砂率影响 (关键参数7, 权重6%)
    let fineAggInfluence = 0;
    let fineAggDesc = '';
    let fineAggOpt = '';

    if (params.sand_ratio >= 35 && params.sand_ratio <= 40) {
        fineAggInfluence = 88;
        fineAggDesc = `细骨料${params.fine_aggregate_content}kg/m³，砂率${params.sand_ratio}%，最优`;
        fineAggOpt = '砂率控制在最优范围';
    } else if (params.sand_ratio < 35) {
        fineAggInfluence = 78;
        fineAggDesc = `细骨料${params.fine_aggregate_content}kg/m³，砂率${params.sand_ratio}%，偏低`;
        fineAggOpt = '砂率偏低，建议增加至35-40%';
    } else {
        fineAggInfluence = 75;
        fineAggDesc = `细骨料${params.fine_aggregate_content}kg/m³，砂率${params.sand_ratio}%，偏高`;
        fineAggOpt = '砂率偏高，会增加水泥用量';
    }

    influences.push({
        factor: '细骨料用量&砂率',
        influence: fineAggInfluence,
        description: fineAggDesc,
        optimization: fineAggOpt,
    });

    return influences.sort((a, b) => b.influence - a.influence);
}

/**
 * 根据目标强度推荐最优参数
 */
export function recommendOptimalParameters(
    targetStrength: number,
    currentParams: ConcreteParameters
): Partial<ConcreteParameters> {
    const recommendations: Partial<ConcreteParameters> = {};

    // 反推所需水灰比
    const recommendedWaterCementRatio = calculateOptimalWaterCementRatio(
        targetStrength,
        currentParams.cement_strength_grade
    );

    if (recommendedWaterCementRatio !== currentParams.water_cement_ratio) {
        recommendations.water_cement_ratio = recommendedWaterCementRatio;
    }

    // 推荐养护条件
    if (currentParams.curing_temperature < 18 || currentParams.curing_temperature > 22) {
        recommendations.curing_temperature = 20;
    }

    if (currentParams.curing_humidity < 95) {
        recommendations.curing_humidity = 95;
    }

    return recommendations;
}

/**
 * 计算达到目标强度所需的最优水灰比
 */
function calculateOptimalWaterCementRatio(targetStrength: number, cementGrade: number): number {
    const A = 0.46;
    const B = 0.07;
    const cementStrength = cementGrade * 1.13;

    // 反推鲍罗米公式: W/C = (A * fce - fc) / (B * fce * fc)
    const waterCementRatio =
        (A * cementStrength - targetStrength) / (B * cementStrength * targetStrength);

    // 限制在合理范围内
    return Math.max(0.25, Math.min(0.65, Math.round(waterCementRatio * 100) / 100));
}

/**
 * 生成参数调整建议的详细报告
 */
export interface OptimizationReport {
    currentStrength: number;
    predictedStrength: number;
    strengthDifference: number;
    strengthChangePercent: number;
    factorChanges: {
        factor: string;
        oldValue: string;
        newValue: string;
        impact: string;
    }[];
    overallAssessment: string;
}

export function generateOptimizationReport(
    originalParams: ConcreteParameters,
    modifiedParams: ConcreteParameters
): OptimizationReport {
    const originalStrength = calculateConcreteStrength(originalParams);
    const predictedStrength = calculateConcreteStrength(modifiedParams);
    const difference = predictedStrength - originalStrength;
    const changePercent = Math.round((difference / originalStrength) * 1000) / 10;

    const changes = [];

    // 检查各参数变化
    if (originalParams.water_cement_ratio !== modifiedParams.water_cement_ratio) {
        const impact =
            modifiedParams.water_cement_ratio < originalParams.water_cement_ratio
                ? '降低水灰比，强度提升'
                : '提高水灰比，强度降低';
        changes.push({
            factor: '水灰比',
            oldValue: originalParams.water_cement_ratio.toString(),
            newValue: modifiedParams.water_cement_ratio.toString(),
            impact,
        });
    }

    if (originalParams.curing_temperature !== modifiedParams.curing_temperature) {
        changes.push({
            factor: '养护温度',
            oldValue: `${originalParams.curing_temperature}°C`,
            newValue: `${modifiedParams.curing_temperature}°C`,
            impact: '调整养护温度至最优范围',
        });
    }

    if (originalParams.curing_humidity !== modifiedParams.curing_humidity) {
        changes.push({
            factor: '养护湿度',
            oldValue: `${originalParams.curing_humidity}%`,
            newValue: `${modifiedParams.curing_humidity}%`,
            impact: '提高养护湿度，改善水化条件',
        });
    }

    if (originalParams.cement_strength_grade !== modifiedParams.cement_strength_grade) {
        changes.push({
            factor: '水泥强度等级',
            oldValue: originalParams.cement_strength_grade.toString(),
            newValue: modifiedParams.cement_strength_grade.toString(),
            impact: '提高水泥等级，增强基础强度',
        });
    }

    // 生成综合评价
    let assessment = '';
    if (changePercent > 10) {
        assessment = `通过参数优化，预测强度可提升${changePercent.toFixed(1)}%，效果显著。`;
    } else if (changePercent > 5) {
        assessment = `参数调整可带来${changePercent.toFixed(1)}%的强度提升，建议实施。`;
    } else if (changePercent > 0) {
        assessment = `参数优化可略微提升强度${changePercent.toFixed(1)}%，可以考虑。`;
    } else if (changePercent < -5) {
        assessment = `警告：当前参数调整会导致强度降低${Math.abs(changePercent).toFixed(1)}%，不建议采用。`;
    } else {
        assessment = '参数调整对强度影响较小。';
    }

    return {
        currentStrength: Math.round(originalStrength * 10) / 10,
        predictedStrength: Math.round(predictedStrength * 10) / 10,
        strengthDifference: Math.round(difference * 10) / 10,
        strengthChangePercent: changePercent,
        factorChanges: changes,
        overallAssessment: assessment,
    };
}
