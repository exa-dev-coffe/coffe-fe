import React, { useState } from "react";
import { Outlet } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "@/app/layouts/DashboardLayout/DashboardSidebar.tsx";
import DashboardHeader from "@/app/layouts/DashboardLayout/DashboardHeader.tsx";
import useSSE from "@/core/hooks/useSSE.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import env from "@/core/config/env.ts";
import type { OrderItem } from "@/features/orders/types/order.types.ts";
import type { PaginationData } from "@/core/api/client.ts";

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { successNotificationDashboard } = useNotificationContext();
  const { auth, refetchProfile } = useAuthContext();
  const { canView, canEdit } = usePermission();

  const canManageOrders = canView("order") || canEdit("order");

  // SSE: real-time updates for permissions
  useSSE<{ event: "role_permission_updated"; roleId?: number; roleName?: string }>({
    baseUrl: `${env.API_URL}${ENDPOINTS.EVENTS}?type=role_permission_updated`,
    autoConnect: auth.isAuth,
    onMessage: async (dataSSE) => {
      if (dataSSE.event === "role_permission_updated") {
        if (!dataSSE.roleId || dataSSE.roleId === auth.roleId || auth.role === "admin") {
          await refetchProfile();
          queryClient.invalidateQueries();
          successNotificationDashboard(
            "Access permissions updated in real-time.",
          );
        }
      }
    },
  });

  // SSE: real-time updates for orders (creation and status updates)
  useSSE<{ event: "new_order" | "update_order_status"; data: OrderItem }>({
    baseUrl: `${env.API_URL}${ENDPOINTS.EVENTS}?type=order`,
    autoConnect: canManageOrders,
    onMessage: (dataSSE) => {
      if (dataSSE.event === "new_order") {
        successNotificationDashboard(
          `New order #${dataSSE.data.id} has arrived!`,
        );

        // 1. Prepend order to page 1 list cache
        queryClient.setQueriesData<PaginationData<OrderItem[]>>(
          { queryKey: ["orders"] },
          (oldData?: PaginationData<OrderItem[]>) => {
            if (!oldData || !oldData.data) return oldData as PaginationData<OrderItem[]>;
            if (oldData.currentPage === 1) {
              if (oldData.data.some((o) => o.id === dataSSE.data.id))
                return oldData;
              return {
                ...oldData,
                data: [dataSSE.data, ...oldData.data],
                totalData: oldData.totalData + 1,
              };
            }
            return {
              ...oldData,
              totalData: oldData.totalData + 1,
            };
          },
        );

        // 2. Invalidate to sync totalPages, page counts, and inventory menus
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["menus"] });
      } else if (dataSSE.event === "update_order_status") {
        // 1. Update order in any cached list page
        queryClient.setQueriesData<PaginationData<OrderItem[]>>(
          { queryKey: ["orders"] },
          (oldData?: PaginationData<OrderItem[]>) => {
            if (!oldData || !oldData.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((order) =>
                order.id === dataSSE.data.id ? dataSSE.data : order,
              ),
            };
          },
        );

        // 2. Update order in specific detail cache
        queryClient.setQueryData<OrderItem>(
          ["orderDetail", dataSSE.data.id],
          dataSSE.data,
        );

        // 3. Trigger background refetch for active orders lists
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto page-fade-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
