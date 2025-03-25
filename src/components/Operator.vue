<template>
    <el-card v-loading="loading">
        <el-form>
            <el-divider class="mb-6">
                <span class="text-base">预处理算子</span>
            </el-divider>
            <el-form-item label-position="top">
                <el-button @click="getAbnormalHosts(filteredData)" type="danger" class="w-full mb-2">导出异常
                    Hosts</el-button>
                <div class="flex gap-2 items-center">
                    <span> host重复项总数：</span>
                    <span>{{ repeatedHostsCount }}</span>
                    <el-button @click="getRepeatedHosts(filteredData)" size="small">去重</el-button>
                </div>
            </el-form-item>
            <el-divider class="my-6">
                <span class="text-base"> 统计类算子</span>
            </el-divider>
            <el-form-item label-position="top">
                <div class="w-full flex flex-col gap-3">
                    <el-button @click="countM2a(filteredData)" type="primary" plain class="w-full">count-m2a</el-button>
                    <el-input v-model="inputM" class="w-full">
                        <template #append>
                            <el-button @click="keywordM(filteredData, inputM)" type="primary">keyword-m</el-button>
                        </template>
                    </el-input>
                    <el-button @click="countH2a(filteredData)" type="primary" plain class="w-full">count-h2a</el-button>
                    <el-input v-model="inputH" class="w-full">
                        <template #append>
                            <el-button @click="keywordH(filteredData, inputH)" type="primary">keyword-h</el-button>
                        </template>
                    </el-input>
                </div>
            </el-form-item>
            <el-divider class="my-6">
                <span class="text-base"> 拆分类算子</span>
            </el-divider>
            <el-form-item label-position="top">
                <div class="w-full flex">
                    <el-input-number v-model="host_num" :min="1" :max="99" :controls="false" class="w-full" />
                    <el-button @click="splitByHostCount(filteredData, host_num)" type="success">切分文件</el-button>
                </div>
            </el-form-item>
            <el-divider class="my-6">
                <span class="text-base"> 碰撞筛选算子</span>
            </el-divider>
            <div class="flex flex-col gap-2 text-sm">
                <p>特征库:{{ selectedKnowledgeFile }}</p>
                <el-radio-group v-model="radio" class="px-4">
                    <el-radio :value="1">删除</el-radio>
                    <!-- <el-radio :value="2">Option B</el-radio> -->
                    <!-- <el-radio :value="3">Option C</el-radio> -->
                </el-radio-group>
                <p>Host集合:{{ selectedHostFile }}</p>
                <div class="ml-auto">
                    <el-button type="primary" round @click="filterHosts">执 行
                    </el-button>

                    <el-button round @click="filterHosts(-1)">重置</el-button>
                </div>
            </div>
        </el-form>
    </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import useApp from '../useApp.js'
import _ from 'lodash';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
})
const {
    loading, repeatedHosts, selectedKnowledgeFile, selectedHostFile, getAbnormalHosts,
    getRepeatedHosts, countM2a, keywordM, countH2a, keywordH, splitByHostCount,
    filterHosts
} = useApp()

const repeatedHostsCount = computed(() => {
    let count = 0;
    repeatedHosts.value.forEach(hosts => {
        count += hosts.length; // 统计所有数组中的 host 数量
    });
    return count;
});

const inputM = ref('');
const inputH = ref('');
const radio = ref(1);
const host_num = ref(3);

</script>
