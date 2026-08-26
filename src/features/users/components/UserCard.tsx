import React from "react";
import type { UserItem } from "@/features/users/types/user.types.ts";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {
  HiOutlinePencil,
  HiOutlineKey,
  HiOutlineTrash,
  HiOutlineShieldCheck,
} from "react-icons/hi";

interface UserCardProps {
  user: UserItem;
  currentUserId?: number;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  canEdit,
  canDelete,
  onEdit,
  onResetPassword,
  onDelete,
}) => {
  const isSuperAdmin = user.userId === 1;
  const isSelf = Boolean(currentUserId && user.userId === currentUserId);

  const getRoleBadgeVariant = (roleName: string, roleId: number) => {
    if (roleId === 1 || roleName.toLowerCase() === "admin") return "primary";
    if (roleId === 3 || roleName.toLowerCase() === "barista") return "success";
    if (roleId === 2 || roleName.toLowerCase() === "user") return "neutral";
    return "info";
  };

  return (
    <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header with Avatar and Role */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar src={user.photo} name={user.fullName} size="md" />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {user.fullName}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <Badge
            variant={getRoleBadgeVariant(user.roleName, user.roleId)}
            size="sm"
            className="uppercase font-bold shrink-0 tracking-wider text-[10px]"
          >
            {user.roleName}
          </Badge>
        </div>

        {/* Info Tags */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-4 px-1">
          <span className="flex items-center gap-1">
            <HiOutlineShieldCheck className="text-slate-400 text-xs" />
            ID: #{user.userId}
          </span>
          {isSelf && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
              You
            </span>
          )}
          {isSuperAdmin && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
              Primary Admin
            </span>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {canEdit && (
            <>
              <button
                onClick={() => onEdit(user)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-medium cursor-pointer"
                title="Edit Account Details / Role"
              >
                <HiOutlinePencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                onClick={() => onResetPassword(user)}
                className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors text-xs flex items-center gap-1 font-medium cursor-pointer"
                title="Reset User Password"
              >
                <HiOutlineKey className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Pwd</span>
              </button>
            </>
          )}
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(user)}
            disabled={isSuperAdmin || isSelf}
            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs flex items-center gap-1"
            title={
              isSuperAdmin
                ? "Super Admin cannot be deleted"
                : isSelf
                  ? "Cannot delete your own account"
                  : "Delete User Account"
            }
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
