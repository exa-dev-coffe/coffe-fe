import type {ResultSnap} from "./index.ts";

export {};

declare global {
    interface Window {
        snap: {
            pay: (
                token: string,
                options?: {
                    onSuccess?: (result: ResultSnap) => void;
                    onPending?: (result: ResultSnap) => void;
                    onError?: (error: ResultSnap) => void;
                    onClose?: () => void;
                }
            ) => void;
        }
    }
}