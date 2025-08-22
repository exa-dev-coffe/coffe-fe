import axios from "axios";
import type {ZodError, ZodType} from "zod";

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
            Authorization?: string;
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
                    throw error;
                }
            }
            if (retries === 1) throw error;
            retries -= 1;
            await delay(1000);
        }
    }
}

export const validate = (data: unknown, schema: ZodType) => {
    schema.parse(data);
}

export const formatErrorZod = <T>(error: ZodError) => {
    const errorMapData: Partial<Record<keyof T, string>> = {};
    error.issues.forEach((err) => {
        if (err.path.length > 0) {
            const key = err.path[0] as keyof T;
            errorMapData[key] = err.message;
        }
    });
    return errorMapData;
}

export const formatDateTimeShort = () => {
    const date = new Date();
    return `${date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })}`
}


export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export const formatNumberCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        currency: "IDR",
        minimumFractionDigits: 2,
    }).format(value);
}

export const formatDateTime = (dateString: string) => {
    const [date, time] = dateString.split('T');
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');

    const formattedDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Bulan dimulai dari 0
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
    );

    return formattedDate.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const formatDateTimeShortString = (dateString: string) => {
    const [date] = dateString.split('T');
    const [year, month, day] = date.split('-');

    const formattedDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Bulan dimulai dari 0
        parseInt(day),
    );

    return formattedDate.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}