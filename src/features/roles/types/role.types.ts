export interface RoleItem {
    roleId: number;
    roleName: string;
}

export interface FeatureItem {
    featureId: number;
    featureKey: string;
    featureName: string;
    description?: string;
}

export interface PermissionActionFlags {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface RoleFeaturePermissionItem {
    featureId: number;
    featureKey: string;
    featureName: string;
    description?: string;
    permissions: PermissionActionFlags;
}

export interface RolePermissionMatrix {
    roleId: number;
    roleName: string;
    features: RoleFeaturePermissionItem[];
}

export interface UpdateRolePermissionItemPayload {
    featureId: number;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface UpdateRolePermissionPayload {
    permissions: UpdateRolePermissionItemPayload[];
}

export interface CreateRolePayload {
    roleName: string;
}
