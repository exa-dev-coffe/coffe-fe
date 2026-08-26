import React from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";

export interface ConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "amber";
    loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
}) => {
    return (
        <Modal show={show} handleClose={onClose} size="sm" title={title}>
            <div className="space-y-6 text-center py-2">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {description}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                        className="w-28"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        loading={loading}
                        className="w-28"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
