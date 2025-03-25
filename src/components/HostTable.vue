<template>
    <div>
        <div>总数据：{{ props.tableData.length }}</div>
        <el-table :data="paginatedData" border stripe height="800">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="host" label="host" />
            <el-table-column prop="count" label="count" width="200" />
        </el-table>

        <!-- 分页 -->
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="props.tableData.length"
            layout="prev, pager, next, jumper" class="mt-4 text-center" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    tableData: {
        type: Array,
        required: true
    }
});

const currentPage = ref(1);
const pageSize = ref(100); // 每页显示 100 条

// 计算当前页显示的数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return props.tableData.slice(start, start + pageSize.value);
});
</script>