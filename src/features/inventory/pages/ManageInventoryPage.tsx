import React, { useState } from "react";
import {
  useMenusQuery,
  useUpdateMenuAvailabilityMutation,
} from "@/features/menu/hooks/useMenu.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import Modal from "@/components/ui/Modal.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {
  HiOutlineCube,
  HiOutlineSearch,
  HiOutlineSwitchHorizontal,
  HiStar,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import type { MenuItem } from "@/features/menu/types/menu.types";

export const ManageInventoryPage: React.FC = () => {
  const { canEdit } = usePermission();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 400);

  const { data: menuResponse, isLoading: loading } = useMenusQuery(
    page,
    12,
    debouncedSearch,
  );
  const { mutateAsync: updateAvailableMenu, isPending: actionLoading } =
    useUpdateMenuAvailabilityMutation();

  const data = menuResponse?.data || [];
  const totalData = menuResponse?.totalData || 0;

  const [modalState, setModalState] = useState<{
    open: boolean;
    id: number | null;
    currentAvailable: boolean;
  }>({
    open: false,
    id: null,
    currentAvailable: true,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    searchDebounce(val);
  };

  const handleSetAvailability = async (isAvailable: boolean) => {
    if (!modalState.id) return;
    try {
      await updateAvailableMenu({ id: modalState.id, isAvailable });
      setModalState({ open: false, id: null, currentAvailable: true });
    } catch {
      setModalState({ open: false, id: null, currentAvailable: true });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Inventory Availability"
        subtitle="Toggle menu stock in real-time. Sold out items will instantly be disabled across customer order screens."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Inventory Status" },
        ]}
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search menu inventory..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      {loading && data.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <Skeleton variant="rounded" height={140} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCube />}
          title="No Items Found"
          description="No menu items matched your current search."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((item: MenuItem) => (
              <Card
                key={item.id}
                variant="interactive"
                padding="none"
                className="overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.photo || DummyProduct}
                    alt={item.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DummyProduct;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={item.isAvailable ? "success" : "danger"}
                      size="sm"
                      dot
                    >
                      {item.isAvailable ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  {item.rating !== undefined && item.rating > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-amber-400 text-xs font-bold flex items-center gap-1">
                      <HiStar />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {(canEdit("inventory") || canEdit("catalog")) && (
                    <Button
                      variant={item.isAvailable ? "secondary" : "primary"}
                      size="sm"
                      fullWidth
                      leftIcon={<HiOutlineSwitchHorizontal />}
                      onClick={() =>
                        setModalState({
                          open: true,
                          id: item.id,
                          currentAvailable: item.isAvailable,
                        })
                      }
                    >
                      Change Status
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalData={totalData}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Inventory Status Toggle Modal */}
      <Modal
        show={modalState.open}
        handleClose={() =>
          setModalState({ open: false, id: null, currentAvailable: true })
        }
        size="sm"
        title="Update Kitchen Availability"
      >
        <div className="space-y-6 text-center py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Is this menu item currently ready to serve in the kitchen inventory?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              loading={actionLoading}
              onClick={() => handleSetAvailability(true)}
              className="w-full sm:w-auto"
            >
              Yes, Available In Stock
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={actionLoading}
              onClick={() => handleSetAvailability(false)}
              className="w-full sm:w-auto"
            >
              Mark as Out of Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageInventoryPage;
