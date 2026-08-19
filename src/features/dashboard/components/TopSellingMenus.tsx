import React, { useMemo } from "react";
import Card from "@/components/ui/Card.tsx";
import type { TopMenu } from "@/features/orders/types/order.types.ts";
import { useMenusQuery } from "@/features/menu/hooks/useMenu.ts";
import type { MenuItem } from "@/features/menu/types/menu.types";

interface Props {
  data: TopMenu[];
}

export const TopSellingMenus: React.FC<Props> = ({ data }) => {
  // Fetch up to 100 menus to map IDs to Names and Photos
  const { data: menusData } = useMenusQuery(1, 100);
  const menus = menusData?.data || [];

  const topItems = useMemo(() => {
    return data.map((item) => {
      const menu = menus.find((m: MenuItem) => m.id === item.menuId);
      return {
        ...item,
        name: menu?.name || `Menu #${item.menuId}`,
        photo: menu?.photo || "",
      };
    });
  }, [data, menus]);

  return (
    <Card variant="dashboard" className="p-6 flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        Top 5 Best-Selling Menus
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Most popular items in the selected period.
      </p>

      {topItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
          No data available
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topItems.map((item, index) => (
            <div key={item.menuId} className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold text-sm">
                #{index + 1}
              </div>
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-10 h-10 shrink-0 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 shadow-sm" />
              )}
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.totalQty} sold
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TopSellingMenus;
