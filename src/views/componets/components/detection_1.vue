<template>
    <div class="sample-list-page">
        <v-card elevation="0">
            <v-card-title class="text-h5 font-weight-bold mb-4">
                <v-icon class="mr-2" color="primary">mdi-flask</v-icon>
                试样列表（待检区）
            </v-card-title>

            <v-card-text>
                <!-- 搜索框 -->
                <v-text-field
                    v-model="searchQuery"
                    prepend-inner-icon="mdi-magnify"
                    label="搜索样品编号或名称"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    class="mb-4"
                ></v-text-field>

                <!-- 样品列表 -->
                <v-data-table
                    :headers="sampleHeaders"
                    :items="filteredSamples"
                    :items-per-page="10"
                    class="elevation-1"
                    item-value="id"
                >
                    <template v-slot:item.status="{ item }">
                        <v-chip
                            :color="item.isSubsampled ? 'success' : 'warning'"
                            size="small"
                            variant="flat"
                        >
                            {{ item.isSubsampled ? '已缩分' : '未缩分' }}
                        </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            :color="item.isSubsampled ? 'primary' : 'grey'"
                            size="small"
                            @click="startDetection(item)"
                            :disabled="!item.isSubsampled"
                            variant="flat"
                        >
                            {{ item.isSubsampled ? '开始实验' : '不可操作' }}
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// 类型定义
interface Sample {
    id: number;
    code: string;
    name: string;
    isSubsampled: boolean;
}

// 定义事件
const emit = defineEmits<{
    (e: 'start-detection', sample: Sample): void;
}>();

// 样品数据
const samples = ref<Sample[]>([
    { id: 1, code: 'SY20250401', name: '机制砂', isSubsampled: true },
    { id: 2, code: 'SY20250402', name: '天然砂', isSubsampled: true },
    { id: 3, code: 'SY20250403', name: '碎石', isSubsampled: false },
    { id: 4, code: 'SY20250404', name: '细砂', isSubsampled: false },
    { id: 5, code: 'SY20250405', name: '粗砂', isSubsampled: true },
    { id: 6, code: 'SY20250406', name: '特细砂', isSubsampled: false },
    { id: 7, code: 'SY20250407', name: '混合砂', isSubsampled: true },
    { id: 8, code: 'SY20250408', name: '石灰岩碎石', isSubsampled: false },
]);

const searchQuery = ref('');

const sampleHeaders = [
    { title: '样品编号', key: 'code', align: 'start' as const },
    { title: '样品名称', key: 'name', align: 'start' as const },
    { title: '状态', key: 'status', align: 'center' as const },
    { title: '操作', key: 'actions', align: 'center' as const, sortable: false },
];

// 搜索过滤
const filteredSamples = computed(() => {
    if (!searchQuery.value) return samples.value;
    const query = searchQuery.value.toLowerCase();
    return samples.value.filter(
        (sample) =>
            sample.code.toLowerCase().includes(query) || sample.name.toLowerCase().includes(query)
    );
});

// 开始检测
const startDetection = (sample: Sample) => {
    if (sample.isSubsampled) {
        emit('start-detection', sample);
    }
};
</script>

<style lang="scss" scoped>
</style>
