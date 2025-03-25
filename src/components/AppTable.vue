<template>
    <div>
        <div>总数据：{{ props.filteredData.length }}，过滤后：{{ filteredResult.length }}</div>

        <el-table :data="paginatedData" border stripe height="800" v-loading="loading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" width="200" />
            <el-table-column prop="hosts" label="Hosts" show-overflow-tooltip>
                <template #header>
                    <el-input v-model="keyword" placeholder="输入 host 进行过滤" clearable />
                </template>
                <template #default="{ row }">
                    <div @click="console.log(row.hosts)">
                        <a>{{ row.hosts.length }}</a>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredResult.length"
            layout="prev, pager, next, jumper" class="mt-4 text-center" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import _ from "lodash";

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(100); // 每页显示 100 条
const filteredResult = ref([...props.filteredData]);

// 过滤数据
const filterData = () => {
    currentPage.value = 1; // 过滤时重置到第一页
    if (_.isEmpty(keyword.value)) {
        filteredResult.value = [...props.filteredData];
    } else {
        filteredResult.value = _.filter(props.filteredData, (data) =>
            _.some(_.castArray(data.hosts), (host) => host.includes(keyword.value))
        );
    }
};

// 防抖处理，300ms 内输入变化只执行最后一次过滤
const debouncedFilter = _.debounce(filterData, 300);

// 监听 `keyword` 和 `filteredData`
watch([keyword, () => props.filteredData], debouncedFilter, { immediate: true });

// 计算当前页数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredResult.value.slice(start, start + pageSize.value);
});
</script>