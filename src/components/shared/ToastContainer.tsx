import React, {useState, useCallback} from "react";
import {
    HiCheckCircle,
    HiExclamationCircle,
    HiInformationCircle,
    HiXCircle,
    HiX,
} from "react-icons/hi";
import {useNotificationContext, type Toast} from "@/app/providers/NotificationContext.ts";

const iconMap = {
    success: <HiCheckCircle className="text-emerald-500 text-xl shrink-0" />,
    error: <HiXCircle className="text-rose-500 text-xl shrink-0" />,
    warning: <HiExclamationCircle className="text-amber-500 text-xl shrink-0" />,
    info: <HiInformationCircle className="text-sky-500 text-xl shrink-0" />,
};

const borderMap = {
    success: "border-l-emerald-500",
    error: "border-l-rose-500",
    warning: "border-l-amber-500",
    info: "border-l-sky-500",
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({toast, onClose}) => {
    const [exiting, setExiting] = useState(false);

    const handleClose = useCallback(() => {
        setExiting(true);
        setTimeout(() => onClose(toast.id), 250);
    }, [toast.id, onClose]);

    return (
        <div
            className={`flex items-start gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 border-l-4 ${
                borderMap[toast.type]
            } rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-4 w-full transition-all duration-200 ${
                exiting ? "opacity-0 translate-x-10 scale-95" : "opacity-100 translate-x-0 scale-100 animate-slide-in-right"
            }`}
            role="alert"
        >
            <div className="mt-0.5">{iconMap[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words leading-relaxed">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={handleClose}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                aria-label="Close notification"
            >
                <HiX className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const {toasts, removeToast} = useNotificationContext();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
