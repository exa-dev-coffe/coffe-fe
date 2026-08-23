import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useRolesListQuery,
} from "../hooks/useUsers.ts";
import type { UserItem } from "../types/user.types.ts";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import type { RoleItem } from "@/features/roles/types/role.types.ts";

interface UserFormModalProps {
  show: boolean;
  onClose: () => void;
  userToEdit: UserItem | null;
  currentUserId?: number;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onClose,
  userToEdit,
  currentUserId,
}) => {
  const isEdit = Boolean(userToEdit);
  const isSelf = Boolean(
    userToEdit && currentUserId && userToEdit.userId === currentUserId,
  );
  const isSuperAdmin = Boolean(userToEdit && userToEdit.userId === 1);

  const { data: roles = [], isLoading: rolesLoading } = useRolesListQuery();
  const { mutateAsync: createUser, isPending: createLoading } =
    useCreateUserMutation();
  const { mutateAsync: updateUser, isPending: updateLoading } =
    useUpdateUserMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: 2, // default customer
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName || "",
        email: userToEdit.email || "",
        password: "",
        roleId: userToEdit.roleId || 2,
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        roleId: roles.length > 0 ? roles[0].roleId : 2,
      });
    }
    setValidationError(null);
  }, [userToEdit, show, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) {
      setValidationError("Full Name is required");
      return;
    }

    if (!isEdit) {
      if (!formData.email.trim()) {
        setValidationError("Email is required");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setValidationError("Password must be at least 6 characters");
        return;
      }
    }

    try {
      if (isEdit && userToEdit) {
        await updateUser({
          userId: userToEdit.userId,
          payload: {
            fullName: formData.fullName.trim(),
            roleId: formData.roleId,
          },
        });
      } else {
        await createUser({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          roleId: formData.roleId,
        });
      }
      onClose();
    } catch {
      // Error handled by hook notifications
    }
  };

  const loading = createLoading || updateLoading;

  return (
    <Modal
      show={show}
      handleClose={onClose}
      title={isEdit ? "Edit User Account" : "Create New User Account"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
            {validationError}
          </div>
        )}

        <InputIcon
          label="Full Name"
          icon={<HiOutlineUser />}
          placeholder="e.g. Budi Santoso"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />

        {!isEdit ? (
          <>
            <InputIcon
              label="Email Address"
              type="email"
              icon={<HiOutlineMail />}
              placeholder="user@diskusicoffee.id"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <InputIcon
              label="Password"
              type="password"
              icon={<HiOutlineLockClosed />}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 text-sm">
              {formData.email}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Email cannot be changed after registration.
            </p>
          </div>
        )}

        {/* Dynamic Role Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <HiOutlineShieldCheck className="text-amber-500 text-base" />
            <span>Assigned Role</span>
          </label>
          <select
            value={formData.roleId}
            disabled={isSelf || isSuperAdmin || rolesLoading}
            onChange={(e) =>
              setFormData({ ...formData, roleId: Number(e.target.value) })
            }
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {rolesLoading ? (
              <option>Loading roles...</option>
            ) : (
              roles.map((role: RoleItem) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName.toUpperCase()}
                  {role.roleId === 1 ? " (Super Admin)" : ""}
                </option>
              ))
            )}
          </select>
          {isSelf && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              You cannot modify your own role to prevent loss of admin access.
            </p>
          )}
          {isSuperAdmin && !isSelf && (
            <p className="text-[11px] text-slate-400 mt-1">
              Super Admin role is permanently protected.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
