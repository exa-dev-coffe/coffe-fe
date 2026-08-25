import { useAuthContext } from "@/app/providers/AuthContext.ts";

export type FeatureKey =
  | "catalog"
  | "category"
  | "table"
  | "voucher"
  | "promotion"
  | "barista"
  | "order"
  | "inventory"
  | "report"
  | "role_management"
  | "user_management"
  | "pos";

export type ActionType = "view" | "create" | "edit" | "delete";

export const usePermission = () => {
  const { auth } = useAuthContext();

  const isAdmin = auth.role?.toLowerCase() === "admin" || auth.roleId === 1;

  const can = (feature: string, action: ActionType = "view"): boolean => {
    if (!auth.isAuth) return false;
    // Super Admin has full permanent access across all features
    if (isAdmin) return true;

    const featKey = feature.toLowerCase();
    const perm = auth.permissions?.[featKey];
    if (!perm) return false;

    return Boolean(perm[action]);
  };

  const canView = (feature: string) => can(feature, "view");
  const canCreate = (feature: string) => can(feature, "create");
  const canEdit = (feature: string) => can(feature, "edit");
  const canDelete = (feature: string) => can(feature, "delete");

  return {
    isAdmin,
    role: auth.role,
    roleId: auth.roleId,
    permissions: auth.permissions,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};

export default usePermission;
