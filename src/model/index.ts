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