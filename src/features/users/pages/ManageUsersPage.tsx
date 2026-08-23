import React, { useState } from "react";
import {
  useUsersQuery,
  useRolesListQuery,
  useDeleteUserMutation,
} from "../hooks/useUsers.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import UserCard from "../components/UserCard.tsx";
import UserFormModal from "../components/UserFormModal.tsx";
import AdminResetPasswordModal from "../components/AdminResetPasswordModal.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import type { UserItem } from "../types/user.types.ts";
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
} from "react-icons/hi";

export const ManageUsersPage: React.FC = () => {
  const { auth } = useAuthContext();
  const { canCreate, canEdit, canDelete } = usePermission();

  const [page, setPage] = useState(1);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const { data: roles = [] } = useRolesListQuery();
  const { data: usersData, isLoading: queryLoading } = useUsersQuery({
    page,
    pageSize: 9,
    roleId: selectedRoleId,
    searchValue: debouncedSearch,
  });

  const { mutateAsync: deleteUser, isPending: deleteLoading } =
    useDeleteUserMutation();

  const users = usersData?.data || [];
  const totalData = usersData?.totalData || 0;

  // Modal States
  const [formModalState, setFormModalState] = useState<{
    open: boolean;
    userToEdit: UserItem | null;
  }>({
    open: false,
    userToEdit: null,
  });

  const [resetPwdModalState, setResetPwdModalState] = useState<{
    open: boolean;
    user: UserItem | null;
  }>({
    open: false,
    user: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    user: UserItem | null;
  }>({
    open: false,
    user: null,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    searchDebounce(val);
  };

  const handleRoleTabClick = (roleId?: number) => {
    setSelectedRoleId(roleId);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.user) return;
    try {
      await deleteUser(deleteModalState.user.userId);
      setDeleteModalState({ open: false, user: null });
    } catch {
      setDeleteModalState({ open: false, user: null });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        subtitle="Create accounts, assign dynamic feature roles, and manage passwords."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Users" },
        ]}
        action={
          canCreate("user_management") ? (
            <Button
              variant="primary"
              leftIcon={<HiOutlinePlus />}
              onClick={() =>
                setFormModalState({ open: true, userToEdit: null })
              }
            >
              Add New User
            </Button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-center sm:self-auto">
            Total {totalData} {totalData === 1 ? "User" : "Users"}
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium shrink-0 mr-1">
            <HiOutlineFilter className="text-sm" />
            <span>Role:</span>
          </div>

          <button
            onClick={() => handleRoleTabClick(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedRoleId === undefined
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Roles
          </button>

          {roles.map((role) => (
            <button
              key={role.roleId}
              onClick={() => handleRoleTabClick(role.roleId)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedRoleId === role.roleId
                  ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {role.roleName}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {queryLoading && users.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={44} height={44} />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              </div>
              <Skeleton variant="rectangular" height={36} />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup />}
          title="No Users Found"
          description={
            search || selectedRoleId
              ? "No user accounts match your search or filter criteria."
              : "No user accounts found in the database."
          }
          actionLabel={
            canCreate("user_management") ? "Add New User" : undefined
          }
          onAction={
            canCreate("user_management")
              ? () => setFormModalState({ open: true, userToEdit: null })
              : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user: UserItem) => (
              <UserCard
                key={user.userId}
                user={user}
                currentUserId={auth.userId}
                canEdit={canEdit("user_management")}
                canDelete={canDelete("user_management")}
                onEdit={(u) =>
                  setFormModalState({ open: true, userToEdit: u })
                }
                onResetPassword={(u) =>
                  setResetPwdModalState({ open: true, user: u })
                }
                onDelete={(u) => setDeleteModalState({ open: true, user: u })}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalData={totalData}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Add / Edit User Modal */}
      <UserFormModal
        show={formModalState.open}
        onClose={() => setFormModalState({ open: false, userToEdit: null })}
        userToEdit={formModalState.userToEdit}
        currentUserId={auth.userId}
      />

      {/* Admin Reset Password Modal */}
      <AdminResetPasswordModal
        show={resetPwdModalState.open}
        onClose={() => setResetPwdModalState({ open: false, user: null })}
        user={resetPwdModalState.user}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false, user: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        description={`Are you sure you want to delete ${deleteModalState.user?.fullName}'s account (${deleteModalState.user?.email})? This action cannot be undone.`}
        confirmText="Delete Account"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageUsersPage;
