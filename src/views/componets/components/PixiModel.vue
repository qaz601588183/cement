<script setup>
import * as d3 from 'd3';
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const d3Container = ref(null);
let svg = null;
const simulation = null;

// 解析分化时间线
const parseTimeline = (timeline) => {
    if (!timeline) return [];

    // 简单解析时间线，提取天数和阶段
    const stages = [];
    const parts = timeline.split(';');

    parts.forEach((part) => {
        const dayMatch = part.match(/(\d+)[-+]?(\d+)?/);
        if (dayMatch) {
            const startDay = parseInt(dayMatch[1]);
            const endDay = dayMatch[2] ? parseInt(dayMatch[2]) : startDay;
            const description = part.replace(dayMatch[0], '').trim();

            stages.push({
                startDay,
                endDay,
                description: description || `阶段 ${stages.length + 1}`,
            });
        }
    });

    return stages;
};

// 初始化D3可视化
const initD3Visualization = () => {
    if (!d3Container.value) {
        console.warn('PixiModel: d3Container not ready');
        return;
    }

    if (!props.data || !props.data.differentiation_timeline) {
        console.warn('PixiModel: Missing data or timeline', props.data);
        return;
    }

    console.log('PixiModel: Initializing with data:', props.data);

    // 清除之前的内容
    d3.select(d3Container.value).selectAll('*').remove();

    // 设置尺寸和边距
    const margin = { top: 60, right: 30, bottom: 100, left: 80 };
    const width = d3Container.value.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // 创建SVG
    svg = d3
        .select(d3Container.value)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // 添加渐变定义
    const defs = svg.append('defs');

    // 细胞渐变
    const cellGradient = defs
        .append('radialGradient')
        .attr('id', 'cell-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

    cellGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffeb3b')
        .attr('stop-opacity', 0.8);

    cellGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffc107')
        .attr('stop-opacity', 1);

    // 分化细胞渐变
    const diffGradient = defs
        .append('radialGradient')
        .attr('id', 'diff-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

    diffGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4fc3f7')
        .attr('stop-opacity', 0.8);

    diffGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2196f3')
        .attr('stop-opacity', 1);

    // 阶段渐变
    const stageGradient = defs
        .append('linearGradient')
        .attr('id', 'stage-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

    stageGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4caf50')
        .attr('stop-opacity', 0.7);

    stageGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2196f3')
        .attr('stop-opacity', 0.7);

    // 添加标题
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text('干细胞分化过程可视化');

    // 添加细胞来源信息
    if (props.data && props.data.cell_source) {
        const cellSource = String(props.data.cell_source);
        svg.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('font-size', '12px')
            .style('fill', '#555')
            .text(`细胞来源: ${cellSource.substring(0, 80)}${cellSource.length > 80 ? '...' : ''}`);
    }

    // 渲染可视化
    renderVisualization(width, height);
};

// 渲染可视化
const renderVisualization = (width, height) => {
    if (!svg) return;
    if (!props.data || !props.data.differentiation_timeline) {
        console.warn('PixiModel: 缺少分化时间线数据');
        return;
    }

    // 解析时间线
    const stages = parseTimeline(props.data.differentiation_timeline);
    if (stages.length === 0) {
        console.warn('PixiModel: 无法解析分化时间线');
        return;
    }

    // 计算最大天数
    const maxDay = Math.max(...stages.map((s) => s.endDay));

    // 创建比例尺
    const xScale = d3.scaleLinear().domain([0, maxDay]).range([0, width]);

    // 清除之前的内容（保留标题和defs）
    svg.selectAll('.visualization-element').remove();

    // 创建可视化组
    const visGroup = svg.append('g').attr('class', 'visualization-element');

    // 绘制时间轴
    const timeline = visGroup
        .append('g')
        .attr('class', 'timeline')
        .attr('transform', `translate(0, ${height - 50})`);

    // 时间轴线
    timeline
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

    // 时间刻度
    const tickValues = stages.flatMap((s) => [s.startDay, s.endDay]);
    timeline
        .selectAll('.tick')
        .data(tickValues)
        .enter()
        .append('g')
        .attr('class', 'tick')
        .attr('transform', (d) => `translate(${xScale(d)}, 0)`)
        .each(function (d) {
            const tick = d3.select(this);

            // 刻度线
            tick.append('line')
                .attr('y1', 0)
                .attr('y2', 10)
                .attr('stroke', '#333')
                .attr('stroke-width', 2);

            // 刻度标签
            tick.append('text')
                .attr('y', 25)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', '#333')
                .text(`${d}天`);
        });

    // 绘制阶段
    const stageGroup = visGroup.append('g').attr('class', 'stages');

    stages.forEach((stage, index) => {
        const startX = xScale(stage.startDay);
        const endX = xScale(stage.endDay);
        const stageWidth = endX - startX;
        const stageY = 100 + index * 80;

        // 阶段背景
        stageGroup
            .append('rect')
            .attr('x', startX)
            .attr('y', stageY - 30)
            .attr('width', stageWidth)
            .attr('height', 60)
            .attr('fill', 'url(#stage-gradient)')
            .attr('rx', 5)
            .attr('opacity', 0.3);

        // 阶段标签
        stageGroup
            .append('text')
            .attr('x', startX + stageWidth / 2)
            .attr('y', stageY - 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text(
                stage.description.substring(0, 40) + (stage.description.length > 40 ? '...' : '')
            );

        // 创建细胞节点
        const cellData = [];
        const numCells = 5;
        for (let i = 0; i < numCells; i++) {
            const progress = i / (numCells - 1);
            const x = startX + stageWidth * progress;
            const size = 20 - i * 2;
            const color = i === 0 ? '#ffeb3b' : i < numCells - 1 ? '#4caf50' : '#2196f3';

            cellData.push({
                x,
                y: stageY,
                size,
                color,
                index: i,
                stageIndex: index,
            });
        }

        // 绘制连接线
        const line = d3
            .line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveMonotoneX);

        stageGroup
            .append('path')
            .datum(cellData)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.6);

        // 绘制细胞
        const cells = stageGroup
            .selectAll('.cell')
            .data(cellData)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

        // 细胞圆形
        cells
            .append('circle')
            .attr('r', 0)
            .transition()
            .duration(800)
            .delay((d, i) => index * 200 + i * 100)
            .attr('r', (d) => d.size)
            .attr('fill', (d) => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

        // 细胞脉冲效果
        cells
            .append('circle')
            .attr('r', 0)
            .attr('fill', 'none')
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', 2)
            .attr('opacity', 0.6)
            .transition()
            .duration(1500)
            .delay((d, i) => index * 200 + i * 100 + 800)
            .attr('r', (d) => d.size * 1.5)
            .attr('opacity', 0)
            .on('end', function repeat() {
                d3.select(this)
                    .transition()
                    .duration(1500)
                    .attr('r', (d) => d.size * 1.5)
                    .attr('opacity', 0)
                    .transition()
                    .duration(0)
                    .attr('r', 0)
                    .attr('opacity', 0.6)
                    .transition()
                    .duration(1500)
                    .attr('r', (d) => d.size * 1.5)
                    .attr('opacity', 0)
                    .on('end', repeat);
            });
    });

    // 添加交互效果
    visGroup
        .selectAll('.cell')
        .on('mouseover', function (event, d) {
            d3.select(this)
                .select('circle')
                .transition()
                .duration(200)
                .attr('r', d.size * 1.2)
                .attr('opacity', 1);
        })
        .on('mouseout', function (event, d) {
            d3.select(this)
                .select('circle')
                .transition()
                .duration(200)
                .attr('r', d.size)
                .attr('opacity', 0.8);
        });
};

// 监听数据变化，重新渲染
watch(
    () => props.data,
    (newData) => {
        if (newData && newData.differentiation_timeline) {
            console.log('PixiModel: Data changed, re-rendering...');
            nextTick(() => {
                setTimeout(() => {
                    initD3Visualization();
                }, 150);
            });
        }
    },
    { deep: true, immediate: true }
);

// 组件挂载后初始化
onMounted(() => {
    console.log('PixiModel: Component mounted');
    // 使用双重 nextTick 和延迟确保 DOM 完全渲染
    nextTick(() => {
        setTimeout(() => {
            if (props.data && props.data.differentiation_timeline) {
                initD3Visualization();
            }
        }, 200);
    });
});

// 窗口大小变化时重新渲染
const handleResize = () => {
    if (d3Container.value) {
        initD3Visualization();
    }
};

// 添加窗口大小变化监听
window.addEventListener('resize', handleResize);

// 组件卸载时清理
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
            <v-icon class="mr-2" color="primary">mdi-timeline-clock</v-icon>
            分化时间线可视化
        </v-card-title>

        <v-card-text>
            <div ref="d3Container" class="d3-container"></div>

            <v-divider class="my-4"></v-divider>

            <v-alert type="info" variant="tonal" density="compact">
                <template v-slot:text>
                    <small>
                        此图展示干细胞在不同阶段的分化过程。每个阶段用不同颜色的细胞表示，细胞大小和颜色表示分化程度。
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
