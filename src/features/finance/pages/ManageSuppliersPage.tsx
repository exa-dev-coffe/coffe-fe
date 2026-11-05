import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import Modal from "@/components/ui/Modal.tsx";
import {
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../hooks/useFinance.ts";
import type { Supplier, SupplierFormData } from "../types/finance.types.ts";

export const ManageSuppliersPage: React.FC = () => {
  const { canEdit, canCreate, canDelete } = usePermission();

  const { data: rawSuppliers = [], isLoading: loadingSuppliers } = useSuppliersQuery();
  const suppliers = Array.isArray(rawSuppliers) ? rawSuppliers : [];

  const { mutateAsync: createSupplier, isPending: creatingSupplier } = useCreateSupplierMutation();
  const { mutateAsync: updateSupplier, isPending: updatingSupplier } = useUpdateSupplierMutation();
  const { mutateAsync: deleteSupplier } = useDeleteSupplierMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<SupplierFormData>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    payment_terms: "NET 30",
  });

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      payment_terms: "NET 30",
    });
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierFormData({
      name: s.name,
      contact_person: s.contact_person || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      payment_terms: s.payment_terms || "NET 30",
    });
    setSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name) return;

    if (editingSupplier) {
      await updateSupplier({ id: editingSupplier.id, data: supplierFormData });
    } else {
      await createSupplier(supplierFormData);
    }
    setSupplierModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Suppliers & Vendors"
        subtitle="Manage approved ingredient suppliers, dairy vendors, and packaging contacts"
        action={
          canCreate("supplier") && (
            <Button variant="primary" onClick={handleOpenCreateSupplier}>
              <HiOutlinePlus className="text-base mr-1.5" /> Add New Supplier
            </Button>
          )
        }
      />

      {/* Search and Count Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name, contact person, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Total Suppliers:</span>
          <Badge variant="neutral" size="sm">
            {filteredSuppliers.length}
          </Badge>
        </div>
      </div>

      {loadingSuppliers ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers registered"
          description={
            searchQuery
              ? `No supplier matches "${searchQuery}". Try a different search query.`
              : "Register coffee bean farms, dairy suppliers, and packaging manufacturers to begin issuing purchase orders."
          }
          icon={<HiOutlineTruck />}
        />
      ) : (
        <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Vendor Name</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5">Phone & Email</th>
                  <th className="px-5 py-3.5">Payment Terms</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {s.contact_person || "-"}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>{s.phone || "-"}</div>
                      <div className="text-[11px] text-slate-400">{s.email || ""}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="neutral" size="sm">
                        {s.payment_terms || "NET 30"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 max-w-xs truncate">
                      {s.address || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit("supplier") && (
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="Edit Supplier"
                          >
                            <HiOutlinePencil className="text-base" />
                          </button>
                        )}
                        {canDelete("supplier") && (
                          <button
                            onClick={() => deleteSupplier(s.id)}
                            className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                            title="Delete Supplier"
                          >
                            <HiOutlineTrash className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: ADD / EDIT SUPPLIER */}
      <Modal
        show={supplierModalOpen}
        handleClose={() => setSupplierModalOpen(false)}
        title={editingSupplier ? "Edit Supplier" : "Register New Supplier"}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company / Vendor Name *
            </label>
            <input
              type="text"
              required
              value={supplierFormData.name}
              onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="e.g. PT Biji Kopi Nusantara"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={supplierFormData.contact_person}
                onChange={(e) =>
                  setSupplierFormData({ ...supplierFormData, contact_person: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                placeholder="e.g. Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Terms
              </label>
              <select
                value={supplierFormData.payment_terms}
                onChange={(e) =>
                  setSupplierFormData({ ...supplierFormData, payment_terms: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="NET 14">NET 14 Days</option>
                <option value="NET 30">NET 30 Days</option>
                <option value="NET 60">NET 60 Days</option>
                <option value="COD">Cash On Delivery (COD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={supplierFormData.phone}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                placeholder="e.g. +62 812-3456-7890"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={supplierFormData.email}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                placeholder="e.g. orders@supplier.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={supplierFormData.address}
              onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="Warehouse / Office address"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingSupplier || updatingSupplier}>
              {editingSupplier ? "Save Changes" : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSuppliersPage;
