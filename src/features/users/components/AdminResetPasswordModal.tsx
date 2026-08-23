import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import { useResetPasswordMutation } from "../hooks/useUsers.ts";
import type { UserItem } from "../types/user.types.ts";
import { HiOutlineLockClosed, HiOutlineKey } from "react-icons/hi";

interface AdminResetPasswordModalProps {
  show: boolean;
  onClose: () => void;
  user: UserItem | null;
}

export const AdminResetPasswordModal: React.FC<
  AdminResetPasswordModalProps
> = ({ show, onClose, user }) => {
  const { mutateAsync: resetPassword, isPending: resetLoading } =
    useResetPasswordMutation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }, [show, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        userId: user.userId,
        payload: { newPassword },
      });
      onClose();
    } catch {
      // Error handled by hook notification
    }
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      title="Reset User Password"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {user && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <HiOutlineKey className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.email} &bull;{" "}
                <span className="font-semibold uppercase text-amber-600 dark:text-amber-400">
                  {user.roleName}
                </span>
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set a new password for this user. Their existing active sessions will
          be immediately invalidated for security.
        </p>

        {error && (
          <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
            {error}
          </div>
        )}

        <InputIcon
          label="New Password"
          type="password"
          icon={<HiOutlineLockClosed />}
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <InputIcon
          label="Confirm New Password"
          type="password"
          icon={<HiOutlineLockClosed />}
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={resetLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={resetLoading}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminResetPasswordModal;
