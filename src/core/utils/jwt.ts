import {jwtDecode} from "jwt-decode";
import Cookie from "@/core/utils/cookie.ts";
import type { PermissionAction } from "@/app/providers/AuthContext.ts";

export interface JwtPayload {
    role: string;
    fullName: string;
    type: string;
    userId: number;
    email: string;
    roleId?: number;
    permissions?: Record<string, PermissionAction>;
    iat: number;
    exp: number;
}

export class Jwt {
    static decode(token: string): JwtPayload | null {
        try {
            const raw = jwtDecode<Record<string, unknown>>(token);
            const typeVal = typeof raw.type === "string" ? raw.type : typeof raw.Type === "string" ? raw.Type : "";
            if (typeVal.toLowerCase() === "access") {
                const payload: JwtPayload = {
                    role: (raw.role as string) || (raw.Role as string) || "",
                    fullName: (raw.fullName as string) || (raw.FullName as string) || "",
                    type: typeVal,
                    userId: (raw.userId as number) || (raw.UserId as number) || 0,
                    email: (raw.email as string) || (raw.Email as string) || "",
                    roleId: (raw.roleId as number) || (raw.RoleId as number),
                    permissions: (raw.permissions as Record<string, PermissionAction>) || (raw.Permissions as Record<string, PermissionAction>),
                    iat: (raw.iat as number) || 0,
                    exp: (raw.exp as number) || 0,
                };
                return payload;
            } else {
                Cookie.erase("token");
                return null;
            }
        } catch {
            Cookie.erase("token");
            return null;
        }
    }

    static isExpired(token: string): boolean {
        const decoded = this.decode(token);
        if (decoded && decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        return true;
    }
}

export default Jwt;
