export class Cookie {
    static set(name: string, value: string, days = 1): void {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict;Secure`;
    }

    static get(name: string): string | null {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    static erase(name: string): void {
        document.cookie = `${name}=; Max-Age=-99999999;path=/;SameSite=Strict;Secure`;
    }
}

export default Cookie;
