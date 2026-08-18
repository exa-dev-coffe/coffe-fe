import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import {
  fetchWithRetry,
  handleApiError,
  type BaseResponse,
} from "@/core/api/client.ts";
import Cookie from "@/core/utils/cookie.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type { ProfileData } from "@/features/profile/types/profile.types.ts";

interface UploadResponse {
  url: string;
}

const uploadPhoto = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchWithRetry<BaseResponse<UploadResponse>>({
      url: ENDPOINTS.UPLOAD_PROFILE,
      method: "post",
      body: formData,
      config: { headers: { "Content-Type": "multipart/form-data" } },
    });
    if (res?.data?.success && res.data.data) {
      return res.data.data.url;
    }
    return null;
  } catch {
    return null;
  }
};

const deletePhoto = async (photoUrl: string) => {
  try {
    await fetchWithRetry({
      url: ENDPOINTS.DELETE_PROFILE,
      method: "post",
      body: { url: photoUrl },
    });
  } catch {
    // ignore deletion failures
  }
};

export const useProfileQuery = () => {
  const { errorNotificationDashboard, errorNotificationClient } = useNotificationContext();
  const isDashboard = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
  const notifyError = isDashboard ? errorNotificationDashboard : errorNotificationClient;

  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileData | null> => {
      try {
        const res = await fetchWithRetry<BaseResponse<ProfileData>>({
          url: ENDPOINTS.ME,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return null;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load profile",
          notifyError,
        );
        throw err;
      }
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { 
    successNotificationDashboard, 
    errorNotificationDashboard,
    successNotificationClient,
    errorNotificationClient
  } = useNotificationContext();
  
  const isDashboard = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
  const notifySuccess = isDashboard ? successNotificationDashboard : successNotificationClient;
  const notifyError = isDashboard ? errorNotificationDashboard : errorNotificationClient;

  return useMutation({
    mutationFn: async (dataParams: {
      fullName: string;
      photo?: File | string | null;
      photoBefore?: string;
    }) => {
      let finalPhotoUrl =
        typeof dataParams.photo === "string" ? dataParams.photo : "";

      if (dataParams.photo instanceof File) {
        const uploadedUrl = await uploadPhoto(dataParams.photo);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
          if (dataParams.photoBefore) {
            await deletePhoto(dataParams.photoBefore);
          }
        }
      }

      const res = await fetchWithRetry<BaseResponse<{ accessToken: string }>>({
        url: ENDPOINTS.UPDATE_PROFILE,
        method: "patch",
        body: {
          fullName: dataParams.fullName,
          photo: finalPhotoUrl,
        },
      });

      if (!res?.data?.success || !res.data.data) {
        throw new Error("Failed to update profile");
      }

      if (res.data.data.accessToken) {
        Cookie.set("token", res.data.data.accessToken, 7);
      }

      return {
        fullName: dataParams.fullName,
        photo: finalPhotoUrl
      };
    },
    onSuccess: () => {
      notifySuccess("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to update profile",
        notifyError,
      );
    },
  });
};
