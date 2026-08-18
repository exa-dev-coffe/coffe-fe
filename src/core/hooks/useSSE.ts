import { useCallback, useEffect, useRef } from "react";
import Cookie from "@/core/utils/cookie.ts";
import Jwt from "@/core/utils/jwt.ts";
import apiClient, {
  type BaseResponse,
  type RefreshTokenResponse,
  refreshPromise,
  setRefreshPromise,
} from "@/core/api/client.ts";

interface UseSSEProps<T> {
  baseUrl: string;
  onMessage: (data: T) => void;
  autoConnect?: boolean;
  maxRetries?: number;
}

export function useSSE<T>({
  baseUrl,
  onMessage,
  autoConnect = true,
  maxRetries = -1,
}: UseSSEProps<T>) {
  const eventSource = useRef<EventSource | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<number | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

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
    if (eventSource.current) return;

    const token = Cookie.get("token");
    if (!token) return;

    let url = `${baseUrl}`;
    url += url.includes("?") ? `&token=${token}` : `?token=${token}`;

    const es = new EventSource(url, { withCredentials: true });
    eventSource.current = es;

    es.onopen = () => {
      retryCount.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const data: T = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    es.onerror = async () => {
      es.close();
      eventSource.current = null;
      const token = Cookie.get("token");
      if (!token) return;

      const expired = Jwt.isExpired(token);
      if (expired) {
        if (!refreshPromise) {
          setRefreshPromise(
            apiClient.post<BaseResponse<RefreshTokenResponse>>(
              "/api/1.0/auth/refresh",
              {},
              { withCredentials: true },
            ),
          );
        }
        const res = await refreshPromise;
        setRefreshPromise(null);
        if (res?.data?.success && res.data.data?.accessToken) {
          Cookie.set("token", res.data.data.accessToken, 7);
        } else {
          Cookie.erase("token");
          window.location.href = "/login";
          return;
        }
      }

      if (maxRetries === -1 || retryCount.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
        retryCount.current += 1;

        retryTimeout.current = window.setTimeout(() => {
          connect();
        }, delay);
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

  return { connect, disconnect: cleanUp };
}

export default useSSE;
