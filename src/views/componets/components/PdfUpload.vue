<script setup>
import { ref } from 'vue';

const emit = defineEmits(['pdf-parsed']);
const files = ref([]);
const loading = ref(false);
const dragOver = ref(false);
const uploadStatus = ref('');
const uploadError = ref('');

// 模拟PDF解析数据
const mockParseResult = [
    {
        year: '2007',
        journal: 'STEM CELLS',
        cell_source: 'hESC, H1, H9, RUES1-eGFP; cynomolgus parthenogenetic line (Cyno1)',
        differentiation_timeline:
            '0-28, neural induction on MS5 stromal cells; 28-35, rosette isolation and P1 stage; 35-50, P2 stage with RA/SHH treatment; 50+, terminal differentiation in absence of RA/SHH but presence of GDNF, BDNF, AA',
        stage_specific_compounds:
            "Dulbecco's modified Eagle's medium, 15% knockout serum replacement, 2 mM L-glutamine, 10 μM β-mercaptoethanol (neural induction); N2 medium, ascorbic acid (0.2 mM), BDNF (20 ng/ml), retinoic acid (1 μM), SHH (500 ng/ml) (P1 and P2 stages); N2 medium with ascorbic acid (0.2 mM), BDNF (20 ng/ml), GDNF (20 ng/ml) (terminal differentiation)",
        efficiency_assessment_metrics:
            'HB9, ChAT, Isl1, Lhx3, Olig2, Nkx6.1 immunostaining; Hox gene expression (HoxC6, HoxC8); electrophysiology (action potentials); acetylcholine secretion (HPLC); in vivo engraftment, axonal projection, ChAT+ fiber outgrowth',
        doi: '10.1634/stemcells.2007-0097',
        citation:
            'Lee H, Shamy GA, Elkabetz Y et al. Directed Differentiation and Transplantation of Human Embryonic Stem Cell-Derived Motoneurons. STEM CELLS, 2007, 25(8):1931–1939.',
    },
    {
        year: '2010',
        journal: 'Nature Biotechnology',
        cell_source: 'Human iPSC lines derived from fibroblasts',
        differentiation_timeline:
            '0-7, neural induction; 7-14, neural progenitor expansion; 14-21, motor neuron patterning; 21-35, motor neuron maturation',
        stage_specific_compounds:
            'Dual SMAD inhibition (SB431542, LDN-193189); RA (1 μM), Purmorphamine (1 μM); BDNF (10 ng/ml), GDNF (10 ng/ml), CNTF (10 ng/ml)',
        efficiency_assessment_metrics:
            'HB9, ISL1, CHAT immunostaining; electrophysiological properties; functional synapse formation',
        doi: '10.1038/nbt.1639',
        citation:
            'Dimos JT, Rodolfa KT, Niakan KK et al. Induced pluripotent stem cells generated from patients with ALS can be differentiated into motor neurons. Science, 2008, 321(5893):1218-1221.',
    },
];

// 处理文件选择
const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    files.value = selectedFiles;
    uploadError.value = '';
    processFiles(selectedFiles);
};

// 处理拖拽
const handleDrop = (event) => {
    dragOver.value = false;
    const droppedFiles = Array.from(event.dataTransfer.files);
    files.value = droppedFiles;
    uploadError.value = '';
    processFiles(droppedFiles);
};

// 处理文件上传和解析
const processFiles = async (fileList) => {
    if (fileList.length === 0) return;

    loading.value = true;
    uploadStatus.value = '正在上传文件...';
    uploadError.value = '';

    try {
        const results = [];

        // 逐个上传文件
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            uploadStatus.value = `正在上传文件 ${i + 1}/${fileList.length}: ${file.name}`;

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(
                'https://n8n.aijsti.com/webhook/9cc54a30-80e3-40e8-9bf8-e318866cf55f',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`上传失败: ${response.statusText}`);
            }

            const result = await response.json();
            results.push(result);
        }

        uploadStatus.value = '文件上传成功，正在处理数据...';

        // 发送解析结果
        emit('pdf-parsed', results);
        uploadStatus.value = '数据处理完成';

        // 3秒后清除状态信息
        setTimeout(() => {
            uploadStatus.value = '';
        }, 3000);
    } catch (error) {
        console.error('文件处理错误:', error);
        uploadError.value = `上传失败: ${error.message}`;

        // 如果真实上传失败，使用模拟数据
        console.log('使用模拟数据代替');
        uploadStatus.value = '使用模拟数据代替...';

        // 模拟延迟
        await new Promise((resolve) => setTimeout(resolve, 1500));

        emit('pdf-parsed', mockParseResult);
        uploadStatus.value = '模拟数据加载完成';

        // 3秒后清除状态信息
        setTimeout(() => {
            uploadStatus.value = '';
        }, 3000);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <v-card class="pa-4">
        <v-card-title class="text-h5 mb-4">PDF文件上传</v-card-title>

        <v-card-text>
            <div
                class="drop-zone pa-8 rounded-lg border-dashed border-2"
                :class="dragOver ? 'border-primary bg-grey-lighten-4' : 'border-grey'"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="handleDrop"
            >
                <v-row justify="center" class="flex-column align-center">
                    <v-icon size="48" color="primary" class="mb-4">mdi-cloud-upload</v-icon>
                    <div class="text-center">
                        <p class="text-h6 mb-2">拖拽PDF文件到此处或点击上传</p>
                        <p class="text-body-2 text-grey-darken-1">支持一个或多个PDF文件</p>
                    </div>
                    <v-btn
                        color="primary"
                        variant="outlined"
                        class="mt-4"
                        @click="$refs.fileInput.click()"
                        :disabled="loading"
                    >
                        选择文件
                    </v-btn>
                </v-row>
            </div>

            <input
                ref="fileInput"
                type="file"
                accept=".pdf"
                multiple
                style="display: none"
                @change="handleFileChange"
            />

            <v-progress-linear
                v-if="loading"
                indeterminate
                color="primary"
                class="mt-4"
            ></v-progress-linear>

            <v-alert
                v-if="uploadStatus"
                type="info"
                variant="tonal"
                class="mt-4"
                :text="uploadStatus"
            ></v-alert>

            <v-alert
                v-if="uploadError"
                type="error"
                variant="tonal"
                class="mt-4"
                :text="uploadError"
            ></v-alert>

            <div v-if="files.length > 0 && !loading" class="mt-4">
                <v-chip
                    v-for="(file, index) in files"
                    :key="index"
                    class="ma-1"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-file-pdf"
                >
                    {{ file.name }}
                </v-chip>
            </div>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.drop-zone {
    transition: all 0.3s ease;
    cursor: pointer;
}

.drop-zone:hover {
    background-color: rgba(25, 118, 210, 0.04);
}
</style>
