import React, { useState } from "react";
import {
  useTableQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} from "@/features/tables/hooks/useTable.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import TableCard from "@/features/tables/components/TableCard.tsx";
import Input from "@/components/ui/Input.tsx";
import Button from "@/components/ui/Button.tsx";
import Card from "@/components/ui/Card.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
  HiOutlineViewBoards,
  HiOutlinePlus,
  HiOutlineSearch,
  HiX,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import { extractFormErrors } from "@/core/utils/validation.ts";
import type {
  TableFormData,
  TableItem,
} from "@/features/tables/types/table.types.ts";

export const ManageTablePage: React.FC = () => {
  const { canCreate } = usePermission();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 400);

  const { data: tableData, isLoading: queryLoading } = useTableQuery(
    page,
    10,
    debouncedSearch,
  );
  const {
    mutateAsync: addTable,
    isPending: addLoading,
    error: addError,
  } = useAddTableMutation();
  const {
    mutateAsync: updateTable,
    isPending: updateLoading,
    error: updateError,
  } = useUpdateTableMutation();
  const { mutateAsync: deleteTable, isPending: deleteLoading } =
    useDeleteTableMutation();

  const data = tableData?.data || [];
  const totalData = tableData?.totalData || 0;

  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    id: number | null;
  }>({
    open: false,
    mode: "add",
    id: null,
  });
  const [nameInput, setNameInput] = useState("");
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
    setNameInput("");
    setDrawerState({ open: true, mode: "add", id: null });
  };

  const handleOpenEdit = (id: number) => {
    const item = data.find((t: TableItem) => t.id === id);
    if (item) {
      setNameInput(item.name);
      setDrawerState({ open: true, mode: "edit", id });
    }
  };

  const handleCloseDrawer = () => {
    setDrawerState({ open: false, mode: "add", id: null });
    setNameInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (drawerState.mode === "edit" && drawerState.id) {
        await updateTable({ id: drawerState.id, name: nameInput });
      } else {
        await addTable({ name: nameInput });
      }
      handleCloseDrawer();
    } catch {
      // Validation errors are thrown by mutation and caught here to avoid closing drawer
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deleteTable(deleteModalState.id);
      setDeleteModalState({ open: false, id: null });
    } catch {
      // Revert on error
      setDeleteModalState({ open: false, id: null });
    }
  };

  const getFormError = () => {
    if (drawerState.mode === "add" && addError) {
      return extractFormErrors<TableFormData>(addError).name;
    }
    if (drawerState.mode === "edit" && updateError) {
      return extractFormErrors<TableFormData>(updateError).name;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Tables"
        subtitle="Configure and organize dine-in seating tables and numbers."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Manage Tables" },
        ]}
        action={
          canCreate("table") ? (
            <Button
              variant="primary"
              leftIcon={<HiOutlinePlus />}
              onClick={handleOpenAdd}
            >
              Add Table
            </Button>
          ) : undefined
        }
      />

      {/* Inline Add / Edit Card */}
      {drawerState.open && (
        <Card
          variant="dashboard"
          className="border-amber-500/30 bg-amber-500/5 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {drawerState.mode === "add"
                ? "Create New Seating Table"
                : "Edit Seating Table"}
            </h3>
            <button
              onClick={handleCloseDrawer}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-md">
            <Input
              label="Table Name or Number"
              placeholder="e.g. Table 01, VIP Booth A"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              error={getFormError()}
              required
            />

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={addLoading || updateLoading}
              >
                {drawerState.mode === "add" ? "Create Table" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseDrawer}
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
            placeholder="Search tables..."
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
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="text" width="60%" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HiOutlineViewBoards />}
          title="No Tables Found"
          description="You haven't added any tables yet or no table matched your search."
          actionLabel="Add Table"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((table: TableItem) => (
              <TableCard
                key={table.id}
                id={table.id}
                name={table.name}
                updatedAt={table.updatedAt}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteModalState({ open: true, id })}
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
        title="Delete Seating Table"
        description="Are you sure you want to delete this table? Orders referencing this table might be affected."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageTablePage;
