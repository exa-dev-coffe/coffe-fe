import React, { useState, useEffect } from "react";
import {
  useRoles,
  useRolePermissions,
  useUpdateRolePermissions,
  useCreateRole,
} from "@/features/roles/hooks/useRoles.ts";
import { normalizeRolePermissions } from "@/features/roles/api/roleApi.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Modal from "@/components/ui/Modal.tsx";
import Input from "@/components/ui/Input.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSparkles,
  HiOutlineSave,
  HiOutlineRefresh,
  HiOutlineExclamation,
} from "react-icons/hi";
import type {
  RoleFeaturePermissionItem,
  PermissionActionFlags,
  UpdateRolePermissionItemPayload,
  RoleItem,
} from "@/features/roles/types/role.types.ts";

export const RoleManagementPage: React.FC = () => {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Filter out storefront customer/user roles from staff role matrix
  const displayRoles = (roles || []).filter(
    (r) =>
      r.roleId !== 2 &&
      r.roleName.toLowerCase() !== "user" &&
      r.roleName.toLowerCase() !== "customer",
  );

  // Set default selected role (e.g. barista or first non-admin if available, or first role)
  useEffect(() => {
    if (displayRoles.length > 0 && selectedRoleId === null) {
      const defaultRole =
        displayRoles.find((r) => r.roleName.toLowerCase() === "barista") ||
        displayRoles[0];
      setSelectedRoleId(defaultRole.roleId);
    }
  }, [displayRoles, selectedRoleId]);

  const { data: rolePermissions, isLoading: permLoading } =
    useRolePermissions(selectedRoleId);

  const { mutateAsync: updatePermissions, isPending: isUpdating } =
    useUpdateRolePermissions();
  const { mutateAsync: createRoleMutation, isPending: isCreatingRole } =
    useCreateRole();

  // Local editable permissions state
  const [editableFeatures, setEditableFeatures] = useState<
    RoleFeaturePermissionItem[]
  >([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sync state when rolePermissions fetch finishes or selectedRoleId changes
  useEffect(() => {
    if (rolePermissions?.features && rolePermissions.features.length > 0) {
      setEditableFeatures(JSON.parse(JSON.stringify(rolePermissions.features)));
      setIsDirty(false);
    } else if (rolePermissions) {
      const normalized = normalizeRolePermissions(rolePermissions);
      setEditableFeatures(normalized.features);
      setIsDirty(false);
    }
  }, [rolePermissions]);

  const selectedRole = roles?.find((r) => r.roleId === selectedRoleId);
  const isAdminRole =
    selectedRoleId === 1 || selectedRole?.roleName?.toLowerCase() === "admin";

  // Toggle individual action permission
  const handleToggle = (
    featureId: number,
    action: keyof PermissionActionFlags,
  ) => {
    if (isAdminRole) return; // Admin is immutable

    setEditableFeatures((prev) =>
      prev.map((f) => {
        if (f.featureId === featureId) {
          return {
            ...f,
            permissions: {
              ...f.permissions,
              [action]: !f.permissions[action],
            },
          };
        }
        return f;
      }),
    );
    setIsDirty(true);
  };

  // Toggle entire feature row
  const handleToggleRow = (featureId: number, grantAll: boolean) => {
    if (isAdminRole) return;

    setEditableFeatures((prev) =>
      prev.map((f) => {
        if (f.featureId === featureId) {
          return {
            ...f,
            permissions: {
              view: grantAll,
              create: grantAll,
              edit: grantAll,
              delete: grantAll,
            },
          };
        }
        return f;
      }),
    );
    setIsDirty(true);
  };

  // Global toggle for all features
  const handleToggleAll = (grantAll: boolean) => {
    if (isAdminRole) return;

    setEditableFeatures((prev) =>
      prev.map((f) => ({
        ...f,
        permissions: {
          view: grantAll,
          create: grantAll,
          edit: grantAll,
          delete: grantAll,
        },
      })),
    );
    setIsDirty(true);
  };

  // Discard changes
  const handleDiscard = () => {
    if (rolePermissions?.features) {
      setEditableFeatures(JSON.parse(JSON.stringify(rolePermissions.features)));
      setIsDirty(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedRoleId || isAdminRole || !isDirty) return;

    const payload: UpdateRolePermissionItemPayload[] = editableFeatures.map(
      (f) => ({
        featureId: f.featureId,
        view: f.permissions.view,
        create: f.permissions.create,
        edit: f.permissions.edit,
        delete: f.permissions.delete,
      }),
    );

    await updatePermissions({
      roleId: selectedRoleId,
      payload: { permissions: payload },
    });
    setIsDirty(false);
  };

  // Create new role modal state
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [addRoleError, setAddRoleError] = useState("");

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setAddRoleError("Role name is required");
      return;
    }

    try {
      const created = await createRoleMutation({
        roleName: newRoleName.trim().toLowerCase(),
      });
      setIsAddRoleModalOpen(false);
      setNewRoleName("");
      setAddRoleError("");
      if (created?.roleId) {
        setSelectedRoleId(created.roleId);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || "Failed to create role";
      setAddRoleError(errorMsg);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <PageHeader
        title="Role & Permission Matrix"
        subtitle="Fine-grained policy-based access control (PBAC). Configure feature permissions and privileges dynamically for each role."
        action={
          <Button
            variant="primary"
            size="md"
            leftIcon={<HiOutlinePlus className="text-lg" />}
            onClick={() => {
              setNewRoleName("");
              setAddRoleError("");
              setIsAddRoleModalOpen(true);
            }}
          >
            Create New Role
          </Button>
        }
      />

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {rolesLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        ) : (
          displayRoles.map((role: RoleItem) => {
            const isSelected = role.roleId === selectedRoleId;
            const isRoleAdmin =
              role.roleId === 1 || role.roleName.toLowerCase() === "admin";
            return (
              <button
                key={role.roleId}
                onClick={() => {
                  if (isDirty) {
                    if (
                      window.confirm(
                        "You have unsaved permission changes. Switch role and discard changes?",
                      )
                    ) {
                      setSelectedRoleId(role.roleId);
                    }
                  } else {
                    setSelectedRoleId(role.roleId);
                  }
                }}
                className={`group flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25 scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 shadow-sm"
                }`}
              >
                {isRoleAdmin ? (
                  <HiOutlineLockClosed className="text-base shrink-0" />
                ) : (
                  <HiOutlineShieldCheck className="text-base shrink-0" />
                )}
                <span className="capitalize">{role.roleName}</span>
                {isRoleAdmin && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    Super Admin
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Admin Locked Banner */}
      {isAdminRole && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-800 dark:text-amber-300 animate-fade-in shadow-sm">
          <HiOutlineLockClosed className="text-xl shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
              Super Admin Role (Immutable System Root)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The{" "}
              <strong className="text-amber-600 dark:text-amber-400">
                admin
              </strong>{" "}
              role has full permanent access (
              <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono text-[11px]">
                view
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono text-[11px]">
                create
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono text-[11px]">
                edit
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono text-[11px]">
                delete
              </code>
              ) across all system features to safeguard platform integrity.
            </p>
          </div>
        </div>
      )}

      {/* Matrix Card */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-0">
        {/* Table Toolbar */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
              <HiOutlineSparkles />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {selectedRole?.roleName || "Selected"} Role Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage granular action permissions for this role
              </p>
            </div>
          </div>

          {!isAdminRole && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<HiOutlineCheckCircle className="text-base" />}
                onClick={() => handleToggleAll(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:border-emerald-500"
              >
                Grant All
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<HiOutlineXCircle className="text-base" />}
                onClick={() => handleToggleAll(false)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:border-rose-500"
              >
                Revoke All
              </Button>
            </div>
          )}
        </div>

        {/* Permissions Table */}
        {permLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 dark:bg-slate-800/90 text-xs uppercase font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-6 min-w-[240px]">
                    Feature & Description
                  </th>
                  <th className="py-4 px-4 text-center w-28">View</th>
                  <th className="py-4 px-4 text-center w-28">Create</th>
                  <th className="py-4 px-4 text-center w-28">Edit</th>
                  <th className="py-4 px-4 text-center w-28">Delete</th>
                  {!isAdminRole && (
                    <th className="py-4 px-6 text-center w-36">Row Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                {editableFeatures.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdminRole ? 5 : 6}
                      className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium"
                    >
                      No feature permissions available or loading data...
                    </td>
                  </tr>
                ) : (
                  editableFeatures.map((feat) => {
                    const allGranted =
                      feat.permissions.view &&
                      feat.permissions.create &&
                      feat.permissions.edit &&
                      feat.permissions.delete;

                    return (
                      <tr
                        key={feat.featureId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Feature Info */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {feat.featureName}
                              </span>
                              <code className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700/80">
                                {feat.featureKey}
                              </code>
                            </div>
                            {feat.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                                {feat.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* View Action */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isAdminRole}
                              checked={feat.permissions.view}
                              onChange={() =>
                                handleToggle(feat.featureId, "view")
                              }
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </label>
                        </td>

                        {/* Create Action */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isAdminRole}
                              checked={feat.permissions.create}
                              onChange={() =>
                                handleToggle(feat.featureId, "create")
                              }
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </label>
                        </td>

                        {/* Edit Action */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isAdminRole}
                              checked={feat.permissions.edit}
                              onChange={() =>
                                handleToggle(feat.featureId, "edit")
                              }
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </label>
                        </td>

                        {/* Delete Action */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isAdminRole}
                              checked={feat.permissions.delete}
                              onChange={() =>
                                handleToggle(feat.featureId, "delete")
                              }
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </label>
                        </td>

                        {/* Quick Row Toggle */}
                        {!isAdminRole && (
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleRow(feat.featureId, !allGranted)
                                }
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                                  allGranted
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                }`}
                              >
                                {allGranted ? "Revoke Row" : "Grant Row"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions / Sticky Floating Bar */}
        {!isAdminRole && isDirty && (
          <div className="p-4 bg-amber-50 dark:bg-slate-800/90 border-t border-amber-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <HiOutlineExclamation className="text-base" />
              <span>You have unsaved changes on this role matrix.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<HiOutlineRefresh className="text-base" />}
                onClick={handleDiscard}
                disabled={isUpdating}
              >
                Discard Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiOutlineSave className="text-base" />}
                onClick={handleSave}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create New Role Modal */}
      <Modal
        show={isAddRoleModalOpen}
        handleClose={() => setIsAddRoleModalOpen(false)}
        title="Create New System Role"
      >
        <form onSubmit={handleCreateRole} className="space-y-5">
          {addRoleError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {addRoleError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Role Name
            </label>
            <Input
              type="text"
              placeholder="e.g. supervisor, cashier, manager"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Role name should be unique and will be used as a role identifier.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddRoleModalOpen(false)}
              disabled={isCreatingRole}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isCreatingRole}
              disabled={isCreatingRole}
            >
              Create Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;
