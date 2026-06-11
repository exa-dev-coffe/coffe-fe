import React, {useState, useCallback} from 'react';
import {PiCheckCircleFill, PiWarningCircleFill, PiXCircleFill, PiInfoFill} from "react-icons/pi";
import {IoCloseSharp} from "react-icons/io5";
import useNotificationContext from "../hook/useNotificationContext.ts";
import type {Toast} from "../context/notification/NotificationContext.ts";

const iconMap: Record<string, React.ReactNode> = {
    success: <PiCheckCircleFill className="text-green-500 dark:text-green-400 text-2xl"/>,
    error: <PiXCircleFill className="text-red-500 dark:text-red-400 text-2xl"/>,
    warning: <PiWarningCircleFill className="text-yellow-500 dark:text-yellow-400 text-2xl"/>,
    info: <PiInfoFill className="text-blue-500 dark:text-blue-400 text-2xl"/>,
};

const bgMap: Record<string, string> = {
    success: "border-l-green-500 dark:border-l-green-400",
    error: "border-l-red-500 dark:border-l-red-400",
    warning: "border-l-yellow-500 dark:border-l-yellow-400",
    info: "border-l-blue-500 dark:border-l-blue-400",
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({toast, onClose}) => {
    const [exiting, setExiting] = useState(false);

    const handleClose = useCallback(() => {
        setExiting(true);
        setTimeout(() => onClose(toast.id), 300);
    }, [toast.id, onClose]);

    return (
        <div
            className={`${exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'} 
                flex items-start gap-3 bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                border-l-4 ${bgMap[toast.type]} 
                rounded-xl shadow-lg dark:shadow-2xl p-4 w-full max-w-sm`}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {iconMap[toast.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Close notification"
            >
                <IoCloseSharp className="text-lg"/>
            </button>
        </div>
    );
};

const ModalNotification: React.FC = () => {
    const {toasts, removeToast} = useNotificationContext();

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={removeToast}/>
            ))}
        </div>
    );
};

export default ModalNotification;