import {jwtDecode} from "jwt-decode";
import Cookie from "@/core/utils/cookie.ts";

export interface JwtPayload {
    role: string;
    fullName: string;
    type: string;
    userId: number;
    email: string;
    iat: number;
    exp: number;
}

export class Jwt {
    static decode(token: string): JwtPayload | null {
        try {
            const payload = jwtDecode<JwtPayload>(token);
            if (payload.type?.toLowerCase() === "access") {
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
