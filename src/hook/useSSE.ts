import cookie from "../utils/cookie.ts";
import {useCallback, useEffect, useRef} from "react";
import Jwt from "../utils/jwt.ts";
import apiClient, {refreshPromise, setRefreshPromise} from "../utils/axios.ts";
import type {RefreshTokenResponse} from "../model/auth.ts";

interface useSSEProps<T> {
    baseUrl: string;
    onMessage: (data: T) => void;
    autoConnect?: boolean;
    maxRetries?: number; // default unlimited (-1)
}

export default function useSSE<T>({
                                      baseUrl,
                                      onMessage,
                                      autoConnect = true,
                                      maxRetries = -1,
                                  }: useSSEProps<T>) {
    const eventSource = useRef<EventSource | null>(null);
    const retryCount = useRef(0);
    const retryTimeout = useRef<number | null | NodeJS.Timeout>(null);

    const cleanUp = useCallback(() => {
        if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
        }
        if (retryTimeout.current) {
            clearTimeout(retryTimeout.current);
            retryTimeout.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (eventSource.current) {
            console.warn("SSE is already connected.");
            return;
        }

        const token = cookie.get("token");
        if (!token) {
            console.error("No token found in cookies. Cannot connect to SSE.");
            return;
        }

        let url = `${baseUrl}`;
        url += url.includes("?") ? `&token=${token}` : `?token=${token}`;

        console.log("Connecting to SSE:", url);

        const es = new EventSource(url, {withCredentials: true});
        eventSource.current = es;

        es.onopen = () => {
            console.log("SSE connected");
            retryCount.current = 0; // reset kalau berhasil connect
        };

        es.onmessage = (event) => {
            try {
                const data: T = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error("Error parsing SSE message:", error);
            }
        };

        es.onerror = async () => {
            console.error("SSE connection error. Will retry...");
            es.close();
            eventSource.current = null;
            const token = cookie.get("token");
            if (!token) {
                console.error("No token found in cookies. Cannot reconnect to SSE.");
                return;
            }

            const expired = Jwt.isExpired(token);
            if (expired) {
                if (!refreshPromise) {
                    setRefreshPromise(apiClient.post<RefreshTokenResponse>("/api/1.0/auth/refresh", {}, {
                        withCredentials: true
                    }))
                }
                const res = await refreshPromise
                setRefreshPromise(null);
                if (res && res.data.success) {
                    cookie.set("token", res.data.data.accessToken, 1);
                } else {
                    cookie.erase("token");
                    window.location.href = "/login";
                    return;
                }
            }


            if (maxRetries === -1 || retryCount.current < maxRetries) {
                const delay = Math.min(1000 * 2 ** retryCount.current, 30000); // exponential backoff capped at 30s
                retryCount.current += 1;

                retryTimeout.current = setTimeout(() => {
                    console.log(`Retrying SSE connection (attempt ${retryCount.current})...`);
                    connect();
                }, delay);
            } else {
                console.error("Max retries reached. SSE will not reconnect.");
            }
        };
    }, [baseUrl, maxRetries]);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            cleanUp();
        };
    }, [autoConnect, connect, cleanUp]);

    return {connect, disconnect: cleanUp};
}
