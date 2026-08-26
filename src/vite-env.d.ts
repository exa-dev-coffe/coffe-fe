/// <reference types="vite/client" />

export interface ResultSnap {
    status_code: string;
    status_message: string[];
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    va_numbers?: {
        bank: string;
        va_number: string;
    }[];
    bca_va_number?: string;
    bill_key?: string;
    biller_code?: string;
    pdf_url?: string;
    finish_redirect_url?: string;
}

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options?: {
                    onSuccess?: (result: ResultSnap | unknown) => void;
                    onPending?: (result: ResultSnap | unknown) => void;
                    onError?: (error: ResultSnap | unknown) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}
