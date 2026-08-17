import React, { useState } from "react";
import {
    useBaristaQuery,
    useAddBaristaMutation,
    useDeleteBaristaMutation,
} from "@/features/barista/hooks/useBarista.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import BaristaCard from "@/features/barista/components/BaristaCard.tsx";
import Input from "@/components/ui/Input.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import Card from "@/components/ui/Card.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
    HiOutlineUserGroup,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineLockClosed,
    HiOutlineMail,
    HiX,
} from "react-icons/hi";

export const ManageBaristaPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const searchDebounce = useDebounce((val: string) => {
        setDebouncedSearch(val);
        setPage(1);
    }, 400);

    const { data: baristaData, isLoading: queryLoading } = useBaristaQuery(
        page,
        10,
        debouncedSearch
    );
    const { mutateAsync: addBarista, isPending: addLoading, error: addError } = useAddBaristaMutation();
    const { mutateAsync: deleteBarista, isPending: deleteLoading } = useDeleteBaristaMutation();

    const data = baristaData?.data || [];
    const totalData = baristaData?.totalData || 0;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [deleteModalState, setDeleteModalState] = useState<{
        open: boolean;
        id: number | null;
    }>({
        open: false,
        id: null,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        searchDebounce(val);
    };

    const handleOpenAdd = () => {
        setFormData({ fullName: "", email: "", password: "" });
        setDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addBarista(formData);
            setDrawerOpen(false);
            setFormData({ fullName: "", email: "", password: "" });
        } catch {
            // Errors handled via mutation error
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalState.id) return;
        try {
            await deleteBarista(deleteModalState.id);
            setDeleteModalState({ open: false, id: null });
        } catch {
            setDeleteModalState({ open: false, id: null });
        }
    };

    const errors = (addError as unknown as Record<string, string>) || {};

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manage Baristas"
                subtitle="Create barista team accounts and manage station permissions."
                breadcrumb={[
                    { label: "Dashboard", to: "/dashboard/menu" },
                    { label: "Baristas" },
                ]}
                action={
                    <Button
                        variant="primary"
                        leftIcon={<HiOutlinePlus />}
                        onClick={handleOpenAdd}
                    >
                        Register Barista
                    </Button>
                }
            />

            {/* Inline Add Barista Card */}
            {drawerOpen && (
                <Card variant="dashboard" className="border-amber-500/30 bg-amber-500/5 animate-fade-in">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Register New Barista Account
                        </h3>
                        <button
                            onClick={() => setDrawerOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
                        <Input
                            label="Full Name"
                            placeholder="Barista Full Name"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData({ ...formData, fullName: e.target.value })
                            }
                            error={errors.fullName}
                            required
                        />

                        <InputIcon
                            label="Email Address"
                            type="email"
                            icon={<HiOutlineMail />}
                            placeholder="barista@diskusicoffee.id"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            error={errors.email}
                            required
                        />

                        <InputIcon
                            label="Temporary Password"
                            type="password"
                            icon={<HiOutlineLockClosed />}
                            placeholder="Minimum 6 characters"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            error={errors.password}
                            required
                        />

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={addLoading}
                            >
                                Register Account
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setDrawerOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search baristas by name..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
                    />
                </div>
            </div>

            {/* Content List */}
            {queryLoading && data.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                        >
                            <Skeleton variant="circular" width={48} height={48} />
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <EmptyState
                    icon={<HiOutlineUserGroup />}
                    title="No Baristas Found"
                    description="You haven't registered any barista accounts yet."
                    actionLabel="Register Barista"
                    onAction={handleOpenAdd}
                />
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.map((barista) => (
                            <BaristaCard
                                key={barista.user_id}
                                id={barista.user_id}
                                fullName={barista.full_name}
                                email={barista.email}
                                photo={barista.photo}
                                onDelete={(id) =>
                                    setDeleteModalState({ open: true, id })
                                }
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
                title="Remove Barista"
                description="Are you sure you want to delete this barista account? They will lose access to the barista dashboard immediately."
                confirmText="Remove"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
};

export default ManageBaristaPage;
