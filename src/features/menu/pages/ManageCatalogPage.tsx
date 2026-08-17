import React, { useState } from "react";
import { Link } from "react-router";
import {
    useMenusQuery,
    useDeleteMenuMutation,
    useUpdateMenuAvailabilityMutation,
} from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import CatalogCard from "@/features/menu/components/CatalogCard.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineCollection,
} from "react-icons/hi";

export const ManageCatalogPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    const searchDebounce = useDebounce((val: string) => {
        setDebouncedSearch(val);
        setPage(1);
    }, 400);

    const { data: menuResponse, isLoading: queryLoading } = useMenusQuery(
        page,
        12,
        debouncedSearch,
        selectedCategory
    );
    const { data: categories = [] } = useCategoryOptionsQuery();

    const { mutateAsync: deleteMenu, isPending: deleteLoading } =
        useDeleteMenuMutation();
    const { mutateAsync: updateAvailableMenu } =
        useUpdateMenuAvailabilityMutation();

    const data = menuResponse?.data || [];
    const totalData = menuResponse?.totalData || 0;

    const [deleteModalState, setDeleteModalState] = useState<{
        open: boolean;
        id: number | null;
        photo?: string;
    }>({
        open: false,
        id: null,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        searchDebounce(val);
    };

    const handleCategoryChange = (catId: number | null) => {
        setSelectedCategory(catId);
        setPage(1);
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalState.id) return;
        try {
            await deleteMenu({
                id: deleteModalState.id,
                photoUrl: deleteModalState.photo,
            });
            setDeleteModalState({ open: false, id: null });
        } catch {
            setDeleteModalState({ open: false, id: null });
        }
    };

    const handleToggleAvailability = async (id: number, isAvailable: boolean) => {
        try {
            await updateAvailableMenu({ id, isAvailable });
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Catalog Management"
                subtitle="Add, edit, price, and toggle availability for all coffee shop products."
                breadcrumb={[
                    { label: "Dashboard", to: "/dashboard/menu" },
                    { label: "Catalog" },
                ]}
                action={
                    <Link to="/dashboard/manage-catalog/add-catalog">
                        <Button variant="primary" leftIcon={<HiOutlinePlus />}>
                            Add Product
                        </Button>
                    </Link>
                }
            />

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search catalog products..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={() => handleCategoryChange(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            selectedCategory === null
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryChange(Number(cat.id))}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                selectedCategory === Number(cat.id)
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Catalog Grid */}
            {queryLoading && data.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                        >
                            <Skeleton variant="rounded" height={160} />
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="40%" />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <EmptyState
                    icon={<HiOutlineCollection />}
                    title="No Products In Catalog"
                    description="Get started by adding your first coffee drink or food item to the catalog."
                    actionLabel="Add Product"
                    onAction={() => {}}
                />
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.map((item) => (
                            <CatalogCard
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                photo={item.photo}
                                rating={item.rating}
                                isAvailable={item.isAvailable}
                                onDelete={(id, photo) =>
                                    setDeleteModalState({
                                        open: true,
                                        id,
                                        photo,
                                    })
                                }
                                onToggleAvailability={handleToggleAvailability}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalData={totalData}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={deleteModalState.open}
                onClose={() => setDeleteModalState({ open: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Catalog Item"
                description="Are you sure you want to permanently delete this product from the catalog?"
                confirmText="Delete Product"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
};

export default ManageCatalogPage;
