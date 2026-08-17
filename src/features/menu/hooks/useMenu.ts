import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { fetchWithRetry, handleApiError, type BaseResponse, type PaginationData } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import { formatErrorZod, validate } from "@/core/utils/validation.ts";
import { MenuFormSchema, type MenuFormData, type MenuItem } from "@/features/menu/types/menu.types.ts";

interface UploadResponse {
    url: string;
}

const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetchWithRetry<BaseResponse<UploadResponse>>({
            url: ENDPOINTS.UPLOAD_MENU,
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
            url: ENDPOINTS.DELETE_MENU_PHOTO,
            method: "post",
            body: { url: photoUrl },
        });
    } catch {
        // ignore
    }
};

// For Dashboard table
export const useMenusQuery = (page: number, pageSize: number, search?: string, categoryId?: number | null) => {
    const { errorNotificationDashboard } = useNotificationContext();

    return useQuery({
        queryKey: ["menus", page, pageSize, search, categoryId],
        queryFn: async () => {
            try {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("size", pageSize.toString());

                const searchKeys: string[] = [];
                const searchValues: string[] = [];

                if (search) {
                    searchKeys.push("name");
                    searchValues.push(search);
                }
                if (categoryId) {
                    searchKeys.push("categoryId");
                    searchValues.push(categoryId.toString());
                }

                if (searchKeys.length > 0) {
                    params.append("searchKey", searchKeys.join(","));
                    params.append("searchValue", searchValues.join(","));
                }

                const url = `${ENDPOINTS.MENUS}?${params.toString()}`;
                const res = await fetchWithRetry<BaseResponse<PaginationData<MenuItem[]>>>({
                    url,
                    method: "get",
                });

                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return { data: [], totalData: 0, totalPages: 0, lastPage: true } as unknown as PaginationData<MenuItem[]>;
            } catch (err) {
                handleApiError(err, "Failed to load menus", errorNotificationDashboard);
                throw err;
            }
        }
    });
};

// For Client Homepage Load More
export const useMenusInfiniteQuery = (pageSize: number, search?: string, categoryId?: number | null) => {
    const { errorNotificationClient } = useNotificationContext();

    return useInfiniteQuery({
        queryKey: ["menusInfinite", pageSize, search, categoryId],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const params = new URLSearchParams();
                params.append("page", pageParam.toString());
                params.append("size", pageSize.toString());

                const searchKeys: string[] = [];
                const searchValues: string[] = [];

                if (search) {
                    searchKeys.push("name");
                    searchValues.push(search);
                }
                if (categoryId) {
                    searchKeys.push("categoryId");
                    searchValues.push(categoryId.toString());
                }

                if (searchKeys.length > 0) {
                    params.append("searchKey", searchKeys.join(","));
                    params.append("searchValue", searchValues.join(","));
                }

                const url = `${ENDPOINTS.MENUS}?${params.toString()}`;
                const res = await fetchWithRetry<BaseResponse<PaginationData<MenuItem[]>>>({
                    url,
                    method: "get",
                });

                if (res?.data?.success && res.data.data) {
                    return {
                        data: res.data.data.data || [],
                        lastPage: res.data.data.lastPage ?? (res.data.data.data?.length < pageSize),
                        pageParam
                    };
                }
                return { data: [], lastPage: true, pageParam };
            } catch (err) {
                handleApiError(err, "Failed to load menus", errorNotificationClient);
                throw err;
            }
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.lastPage) return undefined;
            return lastPage.pageParam + 1;
        }
    });
};

export const useMenuDetailQuery = (id: number) => {
    const { errorNotificationClient } = useNotificationContext();

    return useQuery({
        queryKey: ["menuDetail", id],
        queryFn: async () => {
            try {
                const res = await fetchWithRetry<BaseResponse<MenuItem>>({
                    url: `${ENDPOINTS.MENU_DETAIL}?id=${id}`,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return null;
            } catch (err) {
                handleApiError(err, "Failed to load menu details", errorNotificationClient);
                throw err;
            }
        },
        enabled: !!id,
    });
};

export const useAddMenuMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationDashboard, errorNotificationDashboard } = useNotificationContext();

    return useMutation({
        mutationFn: async (formData: {
            name: string;
            description: string;
            price: number;
            categoryId?: number;
            photo?: File | string | null;
            isAvailable?: boolean;
        }) => {
            try {
                validate({
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    isAvailable: formData.isAvailable ?? true,
                }, MenuFormSchema);
            } catch (err) {
                if (err instanceof ZodError) throw formatErrorZod<MenuFormData>(err);
                throw err;
            }

            if (!formData.photo) {
                throw new Error("PHOTO_REQUIRED");
            }

            let photoUrl = typeof formData.photo === "string" ? formData.photo : "";
            if (formData.photo instanceof File) {
                const uploaded = await uploadPhoto(formData.photo);
                if (!uploaded) throw new Error("PHOTO_UPLOAD_FAILED");
                photoUrl = uploaded;
            }

            const res = await fetchWithRetry<BaseResponse<MenuItem>>({
                url: ENDPOINTS.MENUS,
                method: "post",
                body: {
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    categoryId: formData.categoryId || null,
                    isAvailable: formData.isAvailable ?? true,
                    photo: photoUrl,
                },
            });

            if (!res?.data?.success) throw new Error("Failed to add menu item");
            return res.data.data;
        },
        onSuccess: () => {
            successNotificationDashboard("Menu item added successfully!");
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.invalidateQueries({ queryKey: ["menusInfinite"] });
        },
        onError: (err: Error) => {
            if (err.message === "PHOTO_REQUIRED") {
                errorNotificationDashboard("Please upload a photo for the product");
            } else if (err.message === "PHOTO_UPLOAD_FAILED") {
                errorNotificationDashboard("Failed to upload product photo");
            } else if (!(err instanceof ZodError) && !err?.name) {
                handleApiError(err, "Failed to add menu item", errorNotificationDashboard);
            }
        }
    });
};

export const useUpdateMenuMutation = () => {
    const queryClient = useQueryClient();
    const { errorNotificationDashboard } = useNotificationContext();

    return useMutation({
        mutationFn: async (formData: {
            id: number;
            name: string;
            description: string;
            price: number;
            categoryId?: number;
            photo?: File | string | null;
            photoBefore?: string;
            isAvailable?: boolean;
        }) => {
            try {
                validate({
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    isAvailable: formData.isAvailable ?? true,
                }, MenuFormSchema);
            } catch (err) {
                if (err instanceof ZodError) throw formatErrorZod<MenuFormData>(err);
                throw err;
            }

            let photoUrl = typeof formData.photo === "string" ? formData.photo : formData.photoBefore || "";
            if (formData.photo instanceof File) {
                const uploaded = await uploadPhoto(formData.photo);
                if (uploaded) {
                    photoUrl = uploaded;
                    if (formData.photoBefore) {
                        await deletePhoto(formData.photoBefore);
                    }
                }
            }

            const res = await fetchWithRetry<BaseResponse<MenuItem>>({
                url: ENDPOINTS.MENUS,
                method: "put",
                body: {
                    id: formData.id,
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    categoryId: formData.categoryId || null,
                    isAvailable: formData.isAvailable ?? true,
                    photo: photoUrl,
                    photoBefore: formData.photoBefore,
                },
            });

            if (!res?.data?.success) throw new Error("Failed to update menu item");
            return res.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.invalidateQueries({ queryKey: ["menusInfinite"] });
            queryClient.invalidateQueries({ queryKey: ["menuDetail", variables.id] });
        },
        onError: (err: Error) => {
            if (!(err instanceof ZodError) && !err?.name) {
                handleApiError(err, "Failed to update menu item", errorNotificationDashboard);
            }
        }
    });
};

export const useDeleteMenuMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationDashboard, errorNotificationDashboard } = useNotificationContext();

    return useMutation({
        mutationFn: async ({ id, photoUrl }: { id: number; photoUrl?: string }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: `${ENDPOINTS.MENUS}?id=${id}`,
                method: "delete",
            });
            if (!res?.data?.success) throw new Error("Failed to delete menu item");
            
            if (photoUrl) {
                await deletePhoto(photoUrl);
            }
            return true;
        },
        onSuccess: () => {
            successNotificationDashboard("Menu item deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.invalidateQueries({ queryKey: ["menusInfinite"] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to delete menu item", errorNotificationDashboard);
        }
    });
};

export const useUpdateMenuAvailabilityMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationDashboard, errorNotificationDashboard } = useNotificationContext();

    return useMutation({
        mutationFn: async ({ id, isAvailable }: { id: number; isAvailable: boolean }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.MENUS_AVAILABILITY,
                method: "patch",
                body: { id, isAvailable },
            });
            if (!res?.data?.success) throw new Error("Failed to update item availability");
            return { id, isAvailable };
        },
        onSuccess: (data) => {
            successNotificationDashboard(data.isAvailable ? "Item marked as Available" : "Item marked as Out of Stock");
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.invalidateQueries({ queryKey: ["menusInfinite"] });
            queryClient.invalidateQueries({ queryKey: ["menuDetail", data.id] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to update item availability", errorNotificationDashboard);
        }
    });
};
