<script setup>
import * as d3 from 'd3';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const d3Container = ref(null);
let svg = null;
let simulation = null;

// 解析时间线，获取阶段信息
const parseTimeline = (timeline) => {
    if (!timeline) return [];
    const stages = [];
    const parts = timeline.split(';');

    parts.forEach((part, index) => {
        const dayMatch = part.match(/(\d+)[-+]?(\d+)?/);
        if (dayMatch) {
            const startDay = parseInt(dayMatch[1]);
            const endDay = dayMatch[2] ? parseInt(dayMatch[2]) : startDay;
            const description = part
                .replace(dayMatch[0], '')
                .trim()
                .replace(/^[,，]\s*/, '');
            stages.push({
                id: `stage-${index}`,
                name: description || `阶段 ${index + 1}`,
                startDay,
                endDay,
                index,
            });
        }
    });

    return stages;
};

// 解析化合物数据（按阶段分组）
const parseCompoundsByStage = (compoundsText) => {
    if (!compoundsText) return [];

    // 分割化合物（按分号分隔）
    const parts = compoundsText.split(/[;；]/);
    const compoundsByStage = [];

    parts.forEach((part, stageIndex) => {
        // 提取常见化合物名称
        const matches = part.match(
            /\b(BDNF|GDNF|CNTF|RA|SHH|FGF2?|EGF|IGF[-]?1?|TGF[β-]|BMP|Wnt3a|Notch|Ascorbic acid|Purmorphamine|SAG|SB431542|LDN[-]?193189|CHIR99021|retinoic acid|β-mercaptoethanol|N2|B27|DAPT|cAMP|GDF11)\b/gi
        );

        if (matches) {
            const uniqueMatches = [...new Set(matches.map((m) => m.toUpperCase()))];
            uniqueMatches.forEach((match) => {
                compoundsByStage.push({
                    name: match,
                    id: `${match.toLowerCase()}-${stageIndex}`,
                    stage: stageIndex,
                });
            });
        }
    });

    return compoundsByStage;
};

// 生成节点和连接（按阶段）
const generateNetworkData = () => {
    if (!props.data) {
        console.warn('CompoundNetwork: 缺少数据');
        return {
            nodes: [
                { id: 'stem-cell', name: '干细胞', group: 'cell', size: 40, stage: -1 },
                { id: 'target-cell', name: '目标细胞', group: 'cell', size: 35, stage: 999 },
            ],
            links: [{ source: 'stem-cell', target: 'target-cell', value: 2 }],
        };
    }

    const stages = parseTimeline(props.data.differentiation_timeline);
    const compounds = parseCompoundsByStage(props.data.stage_specific_compounds);

    if (compounds.length === 0) {
        // 如果没有化合物，按阶段创建节点
        const stageNodes = stages.map((stage) => ({
            id: stage.id,
            name: stage.name.substring(0, 15),
            group: 'stage',
            size: 28,
            stage: stage.index,
        }));

        const nodes = [
            { id: 'stem-cell', name: '干细胞', group: 'cell', size: 40, stage: -1 },
            ...stageNodes,
            { id: 'target-cell', name: '目标细胞', group: 'cell', size: 35, stage: stages.length },
        ];

        const links = [];
        links.push({ source: 'stem-cell', target: stageNodes[0]?.id || 'target-cell', value: 2 });
        for (let i = 0; i < stageNodes.length - 1; i++) {
            links.push({ source: stageNodes[i].id, target: stageNodes[i + 1].id, value: 2 });
        }
        if (stageNodes.length > 0) {
            links.push({
                source: stageNodes[stageNodes.length - 1].id,
                target: 'target-cell',
                value: 2,
            });
        }

        return { nodes, links };
    }

    // 创建节点：干细胞 -> 阶段节点 -> 化合物节点 -> 目标细胞
    const stageNodes = stages.map((stage) => ({
        id: stage.id,
        name: `${stage.name.substring(0, 12)}\n(D${stage.startDay}-${stage.endDay})`,
        group: 'stage',
        size: 30,
        stage: stage.index,
    }));

    const compoundNodes = compounds.map((c) => ({
        id: c.id,
        name: c.name,
        group: 'compound',
        size: 18,
        stage: c.stage,
    }));

    const nodes = [
        { id: 'stem-cell', name: '干细胞', group: 'cell', size: 45, stage: -1 },
        ...stageNodes,
        ...compoundNodes,
        { id: 'target-cell', name: '目标细胞', group: 'cell', size: 40, stage: stages.length },
    ];

    // 创建连接：按阶段流程连接
    const links = [];

    // 干细胞到第一阶段
    if (stageNodes.length > 0) {
        links.push({ source: 'stem-cell', target: stageNodes[0].id, value: 3 });
    }

    // 阶段之间的连接 + 阶段到化合物的连接
    stageNodes.forEach((stage, i) => {
        // 阶段到化合物
        const stageCompounds = compoundNodes.filter((c) => c.stage === i);
        stageCompounds.forEach((compound) => {
            links.push({ source: stage.id, target: compound.id, value: 1.5 });
        });

        // 化合物指向下一阶段
        if (i < stageNodes.length - 1) {
            if (stageCompounds.length > 0) {
                stageCompounds.forEach((compound) => {
                    links.push({ source: compound.id, target: stageNodes[i + 1].id, value: 1.5 });
                });
            } else {
                links.push({ source: stage.id, target: stageNodes[i + 1].id, value: 2 });
            }
        }
    });

    // 最后阶段到目标细胞
    if (stageNodes.length > 0) {
        const lastStageCompounds = compoundNodes.filter((c) => c.stage === stageNodes.length - 1);
        if (lastStageCompounds.length > 0) {
            lastStageCompounds.forEach((compound) => {
                links.push({ source: compound.id, target: 'target-cell', value: 2 });
            });
        } else {
            links.push({
                source: stageNodes[stageNodes.length - 1].id,
                target: 'target-cell',
                value: 3,
            });
        }
    }

    return { nodes, links };
};

// 初始化D3网络图
const initNetworkVisualization = () => {
    if (!d3Container.value) {
        console.warn('CompoundNetwork: d3Container not ready');
        return;
    }

    if (!props.data) {
        console.warn('CompoundNetwork: Missing data', props.data);
        return;
    }

    console.log('CompoundNetwork: Initializing with data:', props.data);

    // 清除之前的内容
    d3.select(d3Container.value).selectAll('*').remove();

    const width = d3Container.value.clientWidth;
    const height = 600;

    // 创建SVG
    svg = d3
        .select(d3Container.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    // 添加背景
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#fafafa');

    // 创建渐变定义
    const defs = svg.append('defs');

    // 细胞渐变
    const cellGradient = defs
        .append('radialGradient')
        .attr('id', 'cell-gradient-network')
        .attr('cx', '30%')
        .attr('cy', '30%');

    cellGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff6b6b')
        .attr('stop-opacity', 0.8);

    cellGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ee5a6f')
        .attr('stop-opacity', 1);

    // 阶段渐变
    const stageGradient = defs
        .append('radialGradient')
        .attr('id', 'stage-gradient-network')
        .attr('cx', '30%')
        .attr('cy', '30%');

    stageGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4caf50')
        .attr('stop-opacity', 0.8);

    stageGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2e7d32')
        .attr('stop-opacity', 1);

    // 化合物渐变
    const compoundGradient = defs
        .append('radialGradient')
        .attr('id', 'compound-gradient-network')
        .attr('cx', '30%')
        .attr('cy', '30%');

    compoundGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4ecdc4')
        .attr('stop-opacity', 0.8);

    compoundGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#44a3a0')
        .attr('stop-opacity', 1);

    // 添加箭头标记
    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

    // 渲染网络
    renderNetwork(width, height);
};

// 渲染网络图
const renderNetwork = (width, height) => {
    if (!svg) return;

    // 清除旧内容
    svg.selectAll('.network-group').remove();

    const networkGroup = svg.append('g').attr('class', 'network-group');

    const data = generateNetworkData();

    // 创建力导向图模拟
    simulation = d3
        .forceSimulation(data.nodes)
        .force(
            'link',
            d3
                .forceLink(data.links)
                .id((d) => d.id)
                .distance(150)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
            'collision',
            d3.forceCollide().radius((d) => d.size + 10)
        );

    // 绘制连接线
    const link = networkGroup
        .append('g')
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', (d) => Math.sqrt(d.value) * 2)
        .attr('marker-end', 'url(#arrowhead)');

    // 绘制节点组
    const node = networkGroup
        .append('g')
        .selectAll('g')
        .data(data.nodes)
        .enter()
        .append('g')
        .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    // 节点圆形
    node.append('circle')
        .attr('r', (d) => d.size)
        .attr('fill', (d) => {
            if (d.group === 'cell') return 'url(#cell-gradient-network)';
            if (d.group === 'stage') return 'url(#stage-gradient-network)';
            return 'url(#compound-gradient-network)';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .style('cursor', 'pointer');

    // 节点标签
    node.append('text')
        .text((d) => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', (d) => d.size + 20)
        .style('font-size', (d) => (d.group === 'cell' ? '14px' : '11px'))
        .style('font-weight', (d) =>
            d.group === 'cell' || d.group === 'stage' ? 'bold' : 'normal'
        )
        .style('fill', (d) => {
            if (d.group === 'cell') return '#d32f2f';
            if (d.group === 'stage') return '#2e7d32';
            return '#0277bd';
        })
        .style('pointer-events', 'none');

    // 添加节点交互效果
    node.on('mouseover', function (event, d) {
        d3.select(this)
            .select('circle')
            .transition()
            .duration(200)
            .attr('r', d.size * 1.2)
            .attr('stroke-width', 5);
    }).on('mouseout', function (event, d) {
        d3.select(this)
            .select('circle')
            .transition()
            .duration(200)
            .attr('r', d.size)
            .attr('stroke-width', 3);
    });

    // 添加脉冲效果
    node.each(function (d) {
        if (d.group === 'cell') {
            const pulseCircle = d3
                .select(this)
                .append('circle')
                .attr('r', d.size)
                .attr('fill', 'none')
                .attr('stroke', '#ff6b6b')
                .attr('stroke-width', 2)
                .attr('opacity', 0.6);

            // eslint-disable-next-line
            function pulse() {
                pulseCircle
                    .transition()
                    .duration(1500)
                    .attr('r', d.size * 1.5)
                    .attr('opacity', 0)
                    .on('end', () => {
                        pulseCircle.attr('r', d.size).attr('opacity', 0.6);
                        pulse();
                    });
            }

            pulse();
        }
    });

    // 更新位置
    simulation.on('tick', () => {
        link.attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

        node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // 拖拽函数
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
};

// 监听数据变化
watch(
    () => props.data,
    (newData) => {
        if (newData) {
            console.log('CompoundNetwork: Data changed, re-rendering...');
            nextTick(() => {
                setTimeout(() => {
                    initNetworkVisualization();
                }, 150);
            });
        }
    },
    { deep: true, immediate: true }
);

// 组件挂载
onMounted(() => {
    console.log('CompoundNetwork: Component mounted');
    // 使用双重 nextTick 和延迟确保 DOM 完全渲染
    nextTick(() => {
        setTimeout(() => {
            if (props.data) {
                initNetworkVisualization();
            }
        }, 200);
    });
});

// 窗口大小变化
const handleResize = () => {
    if (d3Container.value) {
        initNetworkVisualization();
    }
};

window.addEventListener('resize', handleResize);

// 清理
const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    if (simulation) {
        simulation.stop();
    }
};
</script>

<template>
    <v-card class="pa-4" elevation="2">
        <v-card-title class="text-h5 mb-4 d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-molecule</v-icon>
            化合物作用网络
        </v-card-title>

        <v-card-text>
            <div ref="d3Container" class="d3-container"></div>

            <v-divider class="my-4"></v-divider>

            <v-row class="mt-2">
                <v-col cols="12" md="4">
                    <v-chip prepend-icon="mdi-circle" color="error" variant="outlined" size="small">
                        红色 = 细胞状态
                    </v-chip>
                </v-col>
                <v-col cols="12" md="4">
                    <v-chip
                        prepend-icon="mdi-circle"
                        color="success"
                        variant="outlined"
                        size="small"
                    >
                        绿色 = 分化阶段
                    </v-chip>
                </v-col>
                <v-col cols="12" md="4">
                    <v-chip prepend-icon="mdi-circle" color="info" variant="outlined" size="small">
                        蓝色 = 分化因子
                    </v-chip>
                </v-col>
            </v-row>

            <v-alert type="info" variant="tonal" density="compact" class="mt-2">
                <template v-slot:text>
                    <small>
                        此网络图按阶段展示分化因子的作用关系。节点大小表示重要性，可拖拽调整布局。
                    </small>
                </template>
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.d3-container {
    width: 100%;
    height: 600px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fafafa;
}
</style>
