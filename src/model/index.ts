import type {AxiosError} from "axios";

export type BaseResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    total_data: number;
}

export type ExtendedAxiosError = AxiosError & {
    response?: {
        data: BaseResponse<null>
    };
}
export type ResponseGetDashboard = BaseResponse<{
    count_barista: number;
    count_table: number;
    count_menu: number;
    count_category: number;
}>

export type queryPaginate = {
    search: string;
    category_id?: number
}

export type ResponseUploadFoto = BaseResponse<{
    file_path: string;
    preview_url: string;
}>