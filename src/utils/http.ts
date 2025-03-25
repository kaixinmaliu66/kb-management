interface RequestOptions extends RequestInit {
    timeout?: number; // 请求超时设置
}

const defaultOptions: RequestOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
};

const fetchWrapper = async (url: string, options: RequestOptions = defaultOptions): Promise<any> => {
    const { timeout = 5000, ...restOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...restOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw new Error(error.message || '请求失败');
    }
};

// 处理文件下载
const handleDownload = async (response: Response) => {
    const blob = await response.blob();
    const urlObject = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;

    let filename = 'download';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(urlObject);
    document.body.removeChild(link);
    return { success: true, filename };
};

// 封装 GET 请求
export const get = (url: string, params: any, options: RequestOptions = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return fetchWrapper(fullUrl, { ...options, method: 'GET' }).then(res => res.json());
};

// 封装 POST 请求
export const post = (url: string, body: any, options: RequestOptions = {}) => {
    return fetchWrapper(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
    }).then(res => res.json());
};

// 封装 PUT 请求
export const put = (url: string, body: any, options: RequestOptions = {}) => {
    return fetchWrapper(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
    }).then(res => res.json());
};

// 封装 DELETE 请求
export const del = (url: string, options: RequestOptions = {}) => {
    return fetchWrapper(url, { ...options, method: 'DELETE' }).then(res => res.json());
};

// 封装 DOWNLOAD 请求
export const download = (url: string, params: any = {}, options: RequestOptions = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return fetchWrapper(fullUrl, { ...options, method: 'GET' }).then(response => handleDownload(response));
};