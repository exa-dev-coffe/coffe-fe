import React from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { useLogoutContext } from "@/app/providers/LogoutContext.ts";
import { useLogoutMutation } from "@/core/hooks/useAuthMutation.ts";
import { HiOutlineLogout } from "react-icons/hi";

export const LogoutModal: React.FC = () => {
    const { logout, closeLogoutModal } = useLogoutContext();
    const { mutateAsync: performLogout, isPending: loading } = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await performLogout();
        } finally {
            closeLogoutModal();
        }
    };

    return (
        <Modal show={logout.show} handleClose={closeLogoutModal} size="sm" noHeader>
            <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-3xl">
                    <HiOutlineLogout />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Sign Out
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
                        Are you sure you want to end your current session?
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={closeLogoutModal}
                        disabled={loading}
                        className="w-28"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        loading={loading}
                        className="w-28"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LogoutModal;
