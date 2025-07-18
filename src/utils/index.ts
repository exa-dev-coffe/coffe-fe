import axios from "axios";

const apiClient = axios.create(
    {
        baseURL: import.meta.env.VITE_APP_API_URL,
    }
)

export const fetchWithRetry = async <TR>({
                                             url,
                                             method,
                                             body,
                                             config,
                                         }: {
    url: string;
    method: "get" | "post" | "put" | "delete";
    body?: object | FormData;
    config: {
        headers?: {
            Authorization: string;
            "Content-Type"?: "application/json" | "multipart/form-data";
        };
    };
}) => {
    let retries = 3;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (retries) {
        try {
            switch (method) {
                case "get": {
                    return await apiClient.get<TR>(url, config);
                }
                case "post": {
                    return await apiClient.post<TR>(url, body, config);
                }
                case "put": {
                    return await apiClient.put<TR>(url, body, config);
                }
                case "delete": {
                    return await apiClient.delete<TR>(url, config);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response?.status >= 400 && error.response?.status < 500) {
                    throw new Error("Unauthorized access, please login again.");
                }
            }
            if (retries === 1) throw error;
            retries -= 1;
            await delay(1000);
        }
    }
}