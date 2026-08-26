import { useNotificationContext } from "@/app/providers/NotificationContext.ts";

interface PayWithSnapOptions {
    onSuccess?: () => void;
    onPending?: () => void;
    onError?: () => void;
    onClose?: () => void;
}

export const useSnapPayment = () => {
    const { successNotificationClient, errorNotificationClient, infoNotificationClient } = useNotificationContext();

    const payWithSnap = (token: string, options?: PayWithSnapOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: () => {
                        successNotificationClient("Payment completed successfully!");
                        if (options?.onSuccess) options.onSuccess();
                        resolve(true);
                    },
                    onPending: () => {
                        infoNotificationClient("Payment is pending. Please complete payment.");
                        if (options?.onPending) options.onPending();
                        resolve(true); // Treat as resolved since payment flow is valid
                    },
                    onError: () => {
                        errorNotificationClient("Payment failed.");
                        if (options?.onError) options.onError();
                        reject(new Error("Payment failed"));
                    },
                    onClose: () => {
                        infoNotificationClient("Payment popup closed.");
                        if (options?.onClose) options.onClose();
                        resolve(false);
                    },
                });
            } else {
                errorNotificationClient("Payment gateway is initializing. Please refresh the page.");
                reject(new Error("Payment gateway not ready"));
            }
        });
    };

    return { payWithSnap };
};
