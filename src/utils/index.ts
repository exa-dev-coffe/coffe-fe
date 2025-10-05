import axios, {type AxiosRequestConfig} from "axios";
import type {ZodError, ZodType} from "zod";
import apiClient from "./axios.ts";

export const fetchWithRetry = async <TR>({
                                             url,
                                             method,
                                             body,
                                             config,
                                         }: {
    url: string;
    method: "get" | "post" | "put" | "delete";
    body?: object | FormData;
    config?: AxiosRequestConfig
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
    const formattedDate = new Date(dateString); // langsung baca timezone-nya

    return formattedDate.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};


export const formatDateTimeShortString = (dateString: string) => {
    const formattedDate = new Date(dateString); // langsung baca timezone-nya

    return formattedDate.toLocaleString('id-ID', {
        day: 'numeric',
        timeZone: "Asia/Jakarta",
        month: 'short',
        year: 'numeric',
    });
}