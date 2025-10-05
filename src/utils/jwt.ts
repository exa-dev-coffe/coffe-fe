import type {PayloadJWT} from "../model/auth.ts";
import {jwtDecode} from "jwt-decode";
import cookie from "./cookie.ts";

class Jwt {
    static decode(token: string): PayloadJWT | null {
        try {
            const payload = jwtDecode<PayloadJWT>(token)
            if (payload.type.toLowerCase() === "access") {
                return payload
            } else {
                cookie.erase(token)
                console.error("Invalid token type:", payload.type);
                return null
            }
        } catch (error) {
            console.error("Failed to decode JWT:", error);
            cookie.erase(token)
            return null;
        }
    }

    static isExpired(token: string): boolean {
        const decoded = this.decode(token);
        if (decoded && decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        return true; // If we can't decode the token or it has no exp, consider it expired
    }
}

export default Jwt;