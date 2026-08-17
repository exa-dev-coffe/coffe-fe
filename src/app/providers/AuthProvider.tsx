import React, { useCallback, useEffect, useRef, useState } from "react";
import AuthContext, { type AuthState } from "@/app/providers/AuthContext.ts";
import Cookie from "@/core/utils/cookie.ts";
import { fetchWithRetry, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import { Spinner } from "@/components/ui/Spinner.tsx";
import IconLogo from "@/assets/images/icon.png";

interface ProfileResponse {
  fullName: string;
  email: string;
  role: string;
  photo?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuth: false,
    loading: true,
  });

  const initialized = useRef(false);

  const fetchProfile = useCallback(async () => {
    const token = Cookie.get("token");
    if (!token) {
      setAuth({ isAuth: false, loading: false });
      return;
    }

    try {
      const res = await fetchWithRetry<BaseResponse<ProfileResponse>>({
        url: ENDPOINTS.ME,
        method: "get",
      });

      if (res?.data?.success && res.data.data) {
        const profile = res.data.data;
        setAuth({
          isAuth: true,
          loading: false,
          name: profile.fullName,
          email: profile.email,
          role: profile.role,
          photo: profile.photo || "",
        });
      } else {
        Cookie.erase("token");
        setAuth({ isAuth: false, loading: false });
      }
    } catch {
      Cookie.erase("token");
      setAuth({ isAuth: false, loading: false });
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchProfile();
  }, [fetchProfile]);

  const setAuthData = useCallback(
    (data: { name: string; email: string; role: string; photo?: string }) => {
      setAuth({
        isAuth: true,
        loading: false,
        name: data.name,
        email: data.email,
        role: data.role,
        photo: data.photo || "",
      });
    },
    [],
  );

  const setNotAuth = useCallback(() => {
    Cookie.erase("token");
    setAuth({
      isAuth: false,
      loading: false,
    });
  }, []);

  const refetchProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        setAuthData,
        setNotAuth,
        refetchProfile,
      }}
    >
      {auth.loading ? (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 animate-fade-in">
          <img
            src={IconLogo}
            alt="Diskusi Coffee"
            className="w-16 h-16 animate-bounce"
          />
          <div className="flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-sm font-medium tracking-wide text-amber-400">
              Loading Diskusi Coffee...
            </span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
