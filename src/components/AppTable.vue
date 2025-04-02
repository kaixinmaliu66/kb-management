<template>
    <div>
        <div class="w-full flex justify-between">
            <span>Host总量：{{ totalHostsBeforeFilter }}，已过滤Host：{{ removedHostsCount }}</span>
            <el-button @click="exportTable">导出</el-button>
        </div>

        <el-table :data="paginatedData" border stripe style="height:calc(100vh - 350px)" v-loading="loading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" width="200" />
            <el-table-column prop="hosts" label="Hosts" show-overflow-tooltip>
                <template #header>
                    <el-input v-model="keyword" placeholder="输入 host 进行过滤" clearable />
                </template>
                <template #default="{ row }">
                    <div @click="open(row)">
                        <a>{{ row.hosts.length }}</a>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination hide-on-single-page v-model:currentPage="currentPage" background :page-size="pageSize"
            :total="filteredResult.length" layout="total,prev, pager, next" class="mt-4 text-center" />
    </div>
</template>

<script setup>
import { h, ref, computed, watch } from 'vue';
import _ from "lodash";
import useApp from '../useApp.js'
import { ElNotification } from 'element-plus';

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
const { totalHostsBeforeFilter, removedHostsCount, exportToTsvFile } = useApp()
const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(100); // 每页显示 100 条

// 过滤数据
const filteredResult = computed(() => {
    if (_.isEmpty(keyword.value)) return props.filteredData;
    return props.filteredData.filter(data =>
        data.hosts?.some(host => host.includes(keyword.value))
    );
});

const open = (row) => {
    console.log(row);

    if (!row.hosts || row.hosts.length === 0) {
        ElNotification({
            title: row.name || '未命名',
            message: '该条目没有 Hosts 数据',
        });
        return;
    }

    // 生成通知
    ElNotification({
        title: row.name || '未命名',
        message: h(
            'div',
            {
                style: 'width:400px; max-height: 600px; overflow-y: auto; padding-right: 8px;', // 限制最大高度 + 滚动
            },
            [
                h(
                    'ul',
                    { style: 'margin: 0; ' },
                    row.hosts.map((host, index) => h('li', index + 1 + '. ' + host))
                ),
            ]
        ),
        offset: 10,
        duration: 3000, // 让通知不会自动关闭
    });
};


const exportTable = () => {
    // 这里可以添加导出逻辑，例如使用 `fs` 模块写入文件
    console.log(props.filteredData);
    exportToTsvFile(props.filteredData, `筛选结果.csv`);
};

// 监听 `keyword`，使用防抖优化
watch(keyword, _.debounce(() => {
    currentPage.value = 1; // 过滤时重置到第一页
}, 300));

// 计算当前页数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredResult.value.slice(start, start + pageSize.value);
});
</script>