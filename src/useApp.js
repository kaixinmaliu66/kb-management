import { ref, nextTick } from 'vue';
import { saveAs } from 'file-saver';
import { ElMessage } from 'element-plus';
import _ from 'lodash';
import { parse } from 'tldts';

const loading = ref(false)
const activeTab = ref('0')

const appTableData = ref([]);
const originalAppData = ref([]);
const hostTableData = ref([]);

const repeatedHosts = ref(new Map());
const abnormalHosts = ref(new Set());

const selectedKnowledgeFile = ref(null);
const selectedHostFile = ref(null);

export default function () {
    // 提取锚点域名
    const extractAnchorDomain = (host) => {
        const { domain } = parse(host);
        return domain || host; // 若无法解析，则返回原始 host
    };

    // 统计出现次数（host 或锚点）
    const countOccurrences = (data, extractor, fileName) => {
        const countMap = _.countBy(_.flatMap(data, ({ hosts }) => _.uniq(hosts.map(extractor))));
        exportToFile(countMap, fileName);
    };

    // 统计包含关键词的 host 或锚点域名
    const countKeywordOccurrences = (data, keyword, extractor, fileName) => {
        const countMap = _.countBy(
            _.flatMap(data, ({ hosts }) => hosts.map(extractor)).filter((item) => item.includes(keyword))
        );
        exportToFile(countMap, fileName);
    };

    // 导出 TSV 文件（用于特征库）
    const exportToTsvFile = (data, fileName) => {
        if (data.length === 0) {
            ElMessage.warning(`数据为空，未导出 ${fileName}`);
            return;
        }

        const content = data.map(({ id, name, hosts }) => `${id}\t${name}\t${hosts.join(',')}`).join('\n');
        saveToFile(content, fileName, 'text/tab-separated-values');
    };

    // 导出文本文件（异常 host）
    const exportTextFile = (dataArray, fileName) => {
        if (dataArray.length === 0) {
            ElMessage.warning(`无异常 hosts，未导出 ${fileName}`);
            return;
        }

        saveToFile(dataArray.join('\n'), fileName, 'text/plain');
    };

    // 导出统计数据
    const exportToFile = (dataMap, fileName) => {
        if (Object.keys(dataMap).length === 0) {
            ElMessage.warning(`数据为空，未导出 ${fileName}`);
            return;
        }

        const sortedData = _(dataMap)
            .toPairs()
            .sortBy(([_, count]) => -count)
            .map(([key, value]) => `${key}\t${value}`)
            .join('\n');

        saveToFile(sortedData, fileName, 'text/plain');
    };

    // 通用文件保存
    const saveToFile = (content, fileName, type) => {
        const blob = new Blob([content], { type: `${type};charset=utf-8` });
        saveAs(blob, fileName);
        ElMessage.success(`文件 ${fileName} 导出成功`);
    };

    // 按 host 数量切分数据并导出 TSV
    const splitByHostCount = (data, threshold = 3) => {
        const [greater, lesser] = _.partition(data, ({ hosts }) => hosts.length > threshold);
        exportToTsvFile(greater, `大于_${threshold}_条.csv`);
        exportToTsvFile(lesser, `小于等于_${threshold}_条.csv`);
    };

    // 统计重复 hosts 并去重
    const getRepeatedHosts = () => {
        repeatedHosts.value.clear();
        appTableData.value.forEach((item) => {
            const hostCount = _.countBy(item.hosts);
            const duplicates = Object.keys(hostCount).filter((host) => hostCount[host] > 1);
            if (duplicates.length > 0) {
                repeatedHosts.value.set(item.id, duplicates);
            }
            item.hosts = Object.keys(hostCount); // 去重
        });
        console.log("重复 hosts 数据:", repeatedHosts.value);
    };

    // 过滤异常 host 并导出
    const getAbnormalHosts = () => {
        abnormalHosts.value.clear();
        appTableData.value.forEach((item) => {
            item.hosts = item.hosts.filter((host) => {
                if (typeof host !== 'string') {
                    console.warn("非字符串 host:", host);
                    return true;
                }
                const parsed = parse(host);
                if (!parsed.isIcann) {
                    abnormalHosts.value.add(host);
                    return false;
                }
                return true;
            });
        });

        if (abnormalHosts.value.size === 0) {
            ElMessage.warning('没有不正常的 hosts 需要导出');
            return;
        }
        exportTextFile([...abnormalHosts.value], 'err-host.txt');
    };


    const filterHosts = async (state) => {
        if (state === -1) {
            hostTableData.value = [];
            selectedHostFile.value = null;

            // **恢复到未过滤状态**
            appTableData.value = [...originalAppData.value];
            return;
        }

        // **如果 `originalAppData` 为空，则初始化**
        if (!originalAppData.value.length) {
            originalAppData.value = [...appTableData.value];
        }

        console.log('🚀 过滤前 appTableData:', appTableData.value);
        console.log('🚀 hostTableData:', hostTableData.value);

        // **如果 `hostTableData` 为空，恢复原数据**
        if (!hostTableData.value.length) {
            appTableData.value = [...originalAppData.value];
            return;
        }

        // **🔥 这里确保 `hostSet` 被正确声明**
        const hostSet = new Set(hostTableData.value.map(h => h.host));

        // **🚀 重新赋值 `appTableData`，确保 Vue 响应式更新**
        appTableData.value = appTableData.value.map(app => ({
            ...app,
            hosts: app.hosts.filter(host => !hostSet.has(host))
        }));

        console.log('🚀 过滤后 appTableData:', appTableData.value);

        await nextTick();
        activeTab.value = '0';
    };

    return {
        loading,
        selectedKnowledgeFile,
        selectedHostFile,
        appTableData,
        hostTableData,
        repeatedHosts,
        abnormalHosts,
        activeTab,
        getRepeatedHosts,
        getAbnormalHosts,
        countM2a: (data) => countOccurrences(data, extractAnchorDomain, 'count-m2a.csv'),
        keywordM: (data, keyword) => countKeywordOccurrences(data, keyword, extractAnchorDomain, `${keyword}-m.csv`),
        countH2a: (data) => countOccurrences(data, (h) => h, 'count-h2a.csv'),
        keywordH: (data, keyword) => countKeywordOccurrences(data, keyword, (h) => h, `${keyword}-h.csv`),
        splitByHostCount,
        filterHosts
    };
}