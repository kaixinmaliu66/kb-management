<template>
  <div class="p-4 ">
    <el-card>
      <!-- 特征库文件上传 -->
      <div class="mb-2 flex gap-2 items-center">
        <span class="text-red-500 dark:text-blue-500">特征库文件：</span>
        <el-upload :show-file-list="false" :on-change="handleKnowledgeUpload" :auto-upload="false" multiple>
          <el-button type="warning" plain>上传文件</el-button>
        </el-upload>
        <el-radio-group v-model="selectedKnowledgeFile" @click="activeTab = '0'">
          <el-radio-button v-for="[key] in knowledgeFiles" :key="key" :label="key" :value="key" />
        </el-radio-group>
      </div>

      <!-- Host 集合上传 -->
      <div class="mb-2 flex gap-2 items-center">
        <span>Host 集 合 ：</span>
        <el-upload :show-file-list="false" :on-change="handleHostSetUpload" :auto-upload="false" multiple>
          <el-button type="warning" plain>上传文件</el-button>
        </el-upload>
        <el-radio-group v-model="selectedHostFile" @click="activeTab = '1'">
          <el-radio-button v-for="[key] in hostFiles" :key="key" :label="key" :value="key" />
        </el-radio-group>
      </div>
    </el-card>

    <el-row :gutter="12" class="mt-2">
      <el-col :span="6">

        <Operator :filtered-data="appTableData" />

      </el-col>
      <el-col :span="18">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="特征库">
              <AppTable :filteredData="appTableData" />
            </el-tab-pane>
            <el-tab-pane label="Host集合">
              <HostTable :tableData="hostTableData" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from 'vue';
import Papa from 'papaparse';
import { ElMessage } from 'element-plus';
import useApp from './useApp'
const { activeTab, appTableData, hostTableData, selectedKnowledgeFile, selectedHostFile } = useApp();

const AppTable = defineAsyncComponent(() => import("./components/AppTable.vue"));
const HostTable = defineAsyncComponent(() => import("./components/HostTable.vue"));
const Operator = defineAsyncComponent(() => import("./components/Operator.vue"));

// 存储上传的文件数据
const knowledgeFiles = ref(new Map()); // 特征库文件（文件名 -> 数据）
const hostFiles = ref(new Map()); // Host 集合文件（文件名 -> 数据）

// 解析特征库 CSV 数据
const parseKnowledgeFile = (csvText) => {
  const parsedData = Papa.parse(csvText, { delimiter: '\t', skipEmptyLines: true });

  return parsedData.data
    .map(row => (row.length < 3 ? null : {
      id: row[0].trim(),
      name: row[1].trim(),
      hosts: row[2].split(',').map(h => h.trim())
    }))
    .filter(Boolean);
};

// 处理特征库文件上传
const handleKnowledgeUpload = (data) => {
  if (!data?.raw) {
    ElMessage.error("无效的文件");
    return;
  }

  const fileName = data.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    knowledgeFiles.value.set(fileName, parseKnowledgeFile(event.target.result));
    ElMessage.success(`${fileName} 已成功上传`);
  };

  reader.onerror = () => ElMessage.error("文件读取失败");
  reader.readAsText(data.raw, 'utf-8');
};

// 处理 Host 集合上传
const handleHostSetUpload = (data) => {
  if (!data?.raw) {
    ElMessage.error("无效的文件");
    return;
  }

  const fileName = data.name;
  const reader = new FileReader();

  reader.onload = (event) => {
    const parsedData = Papa.parse(event.target.result, {
      delimiter: '\t', // 确保使用制表符分隔
      skipEmptyLines: true
    });

    const hostList = parsedData.data.map(row => {
      if (row.length < 2) return null; // 确保至少有两列数据
      const host = row[0]?.trim();
      const count = parseInt(row[1]?.trim(), 10) || 0; // 解析 `count`，默认 0
      return host ? { host, count } : null;
    }).filter(Boolean); // 过滤掉无效数据

    if (hostList.length === 0) {
      ElMessage.error("文件内容无效");
      return;
    }

    hostFiles.value.set(fileName, hostList);

    ElMessage.success(`${fileName} 已成功上传`);
  };

  reader.onerror = () => ElMessage.error("文件读取失败");
  reader.readAsText(data.raw, 'utf-8');
};

watch(selectedKnowledgeFile, () => {
  appTableData.value = knowledgeFiles.value.get(selectedKnowledgeFile.value) || [];
})

watch(selectedHostFile, () => {
  hostTableData.value = hostFiles.value.get(selectedHostFile.value) || [];
})
</script>
