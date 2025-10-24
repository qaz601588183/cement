/**
 * 混凝土强度推演算法模块
 * 基于建筑工程学理论和经验公式
 */

/**
 * 影响因素接口定义
 */
export interface ConcreteParameters {
    // 配合比因素
    water_cement_ratio: number; // 水灰比 (0.2-0.7)
    cement_strength_grade: number; // 水泥强度等级 (32.5, 42.5, 52.5)
    cement_fineness: number; // 水泥细度 (比表面积 m²/kg)

    // 骨料因素
    aggregate_mud_content: number; // 骨料含泥量 (%)
    aggregate_quality_score: number; // 骨料质量评分 (0-100)

    // 外加剂因素
    admixture_type: string; // 外加剂类型
    admixture_dosage: number; // 外加剂掺量 (%)

    // 养护因素
    curing_temperature: number; // 养护温度 (°C)
    curing_humidity: number; // 养护湿度 (%)
    curing_days: number; // 养护龄期 (天)
    curing_method: string; // 养护方式
}

/**
 * 基于鲍罗米公式计算混凝土抗压强度
 * fc = A * fce / (1 + B * W/C)
 * fc: 混凝土抗压强度
 * fce: 水泥28天抗压强度
 * W/C: 水灰比
 * A, B: 经验系数
 */
export function calculateConcreteStrength(params: ConcreteParameters): number {
    // 1. 基础强度计算（鲍罗米公式）
    const baseStrength = calculateBaseStrength(
        params.water_cement_ratio,
        params.cement_strength_grade
    );

    // 2. 水泥细度修正系数
    const finenessFactor = calculateFinenessFactor(params.cement_fineness);

    // 3. 骨料质量修正系数
    const aggregateFactor = calculateAggregateFactor(
        params.aggregate_mud_content,
        params.aggregate_quality_score
    );

    // 4. 外加剂修正系数
    const admixtureFactor = calculateAdmixtureFactor(
        params.admixture_type,
        params.admixture_dosage
    );

    // 5. 养护条件修正系数
    const curingFactor = calculateCuringFactor(
        params.curing_temperature,
        params.curing_humidity,
        params.curing_days,
        params.curing_method
    );

    // 综合计算最终强度
    const finalStrength =
        baseStrength * finenessFactor * aggregateFactor * admixtureFactor * curingFactor;

    return Math.round(finalStrength * 10) / 10; // 保留一位小数
}

/**
 * 计算基础强度（鲍罗米公式）
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

    // 1. 水灰比影响 (最关键因素, 权重40%)
    let waterCementInfluence = 0;
    let waterCementDesc = '';
    let waterCementOpt = '';

    if (params.water_cement_ratio <= 0.35) {
        waterCementInfluence = 95;
        waterCementDesc = '水灰比控制优秀，对强度贡献最大';
        waterCementOpt = '保持当前水灰比';
    } else if (params.water_cement_ratio <= 0.4) {
        waterCementInfluence = 90;
        waterCementDesc = '水灰比控制良好';
        waterCementOpt = '可考虑进一步降低至0.35以下';
    } else if (params.water_cement_ratio <= 0.45) {
        waterCementInfluence = 75;
        waterCementDesc = '水灰比中等水平';
        waterCementOpt = '建议降低至0.4以下以提高强度';
    } else if (params.water_cement_ratio <= 0.5) {
        waterCementInfluence = 60;
        waterCementDesc = '水灰比偏高，限制强度发展';
        waterCementOpt = '建议降低水灰比或使用高效减水剂';
    } else {
        waterCementInfluence = 40;
        waterCementDesc = '水灰比过高，严重影响强度';
        waterCementOpt = '必须降低水灰比至0.45以下';
    }

    influences.push({
        factor: '水灰比',
        influence: waterCementInfluence,
        description: waterCementDesc,
        optimization: waterCementOpt,
    });

    // 2. 水泥质量影响 (权重25%)
    let cementInfluence = 70 + (params.cement_strength_grade - 32.5) * 2;
    const fineness = params.cement_fineness;
    if (fineness >= 380) cementInfluence += 8;
    else if (fineness >= 360) cementInfluence += 5;
    else if (fineness < 340) cementInfluence -= 5;

    influences.push({
        factor: '水泥质量',
        influence: Math.min(cementInfluence, 100),
        description: `${params.cement_strength_grade}级水泥，细度${fineness} m²/kg`,
        optimization:
            params.cement_strength_grade < 42.5 ? '建议使用42.5级或以上水泥' : '水泥质量符合要求',
    });

    // 3. 养护条件影响 (权重20%)
    let curingInfluence = 60;
    if (params.curing_temperature >= 18 && params.curing_temperature <= 22) {
        curingInfluence += 15;
    } else if (params.curing_temperature < 15 || params.curing_temperature > 28) {
        curingInfluence -= 10;
    }

    if (params.curing_humidity >= 95) {
        curingInfluence += 15;
    } else if (params.curing_humidity < 85) {
        curingInfluence -= 10;
    }

    if (params.curing_days >= 28) {
        curingInfluence += 10;
    } else if (params.curing_days < 14) {
        curingInfluence -= 15;
    }

    influences.push({
        factor: '养护条件',
        influence: Math.max(Math.min(curingInfluence, 100), 0),
        description: `温度${params.curing_temperature}°C，湿度${params.curing_humidity}%，龄期${params.curing_days}天`,
        optimization: curingInfluence < 80 ? '建议改善养护条件，保持标准温湿度' : '养护条件良好',
    });

    // 4. 骨料质量影响 (权重10%)
    let aggregateInfluence = params.aggregate_quality_score;
    if (params.aggregate_mud_content > 1.0) {
        aggregateInfluence -= 15;
    } else if (params.aggregate_mud_content < 0.5) {
        aggregateInfluence += 5;
    }

    influences.push({
        factor: '骨料质量',
        influence: Math.max(Math.min(aggregateInfluence, 100), 0),
        description: `含泥量${params.aggregate_mud_content}%`,
        optimization:
            params.aggregate_mud_content > 0.7 ? '建议严格控制含泥量在0.5%以下' : '骨料质量合格',
    });

    // 5. 外加剂影响 (权重5%)
    let admixtureInfluence = 75;
    if (params.admixture_type.includes('高效') || params.admixture_type.includes('聚羧酸')) {
        admixtureInfluence = 90;
    }

    influences.push({
        factor: '外加剂',
        influence: admixtureInfluence,
        description: params.admixture_type,
        optimization: admixtureInfluence < 85 ? '建议使用高效减水剂' : '外加剂选择合理',
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
