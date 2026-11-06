import React, { useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import Modal from "@/components/ui/Modal.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineReceiptTax,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import { useIngredientsQuery } from "@/features/inventory/hooks/useInventory.ts";
import {
  usePurchasesQuery,
  usePurchaseDetailQuery,
  useCreatePurchaseMutation,
  useReceivePurchaseMutation,
  usePayPurchaseMutation,
  useSuppliersQuery,
} from "../hooks/useFinance.ts";
import type { PurchaseItemPayload, PurchaseOrder } from "../types/finance.types.ts";
import ReceivePOModal from "../components/ReceivePOModal.tsx";

export const ManagePurchasesPage: React.FC = () => {
  const { canEdit, canCreate } = usePermission();

  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<string>("");
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesQuery(
    undefined,
    purchaseStatusFilter || undefined
  );
  const { data: suppliers = [] } = useSuppliersQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();

  const supplierOptions: DropdownOption[] = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.payment_terms || "NET 30"})`,
      })),
    [suppliers]
  );

  const ingredientOptions: DropdownOption[] = useMemo(
    () =>
      rawIngredients.map((ing) => ({
        value: ing.id,
        label: `${ing.name} (${ing.unit})`,
      })),
    [rawIngredients]
  );

  const statusFilterOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Statuses" },
      { value: "DRAFT", label: "DRAFT" },
      { value: "ORDERED", label: "ORDERED" },
      { value: "PARTIALLY_RECEIVED", label: "PARTIALLY_RECEIVED" },
      { value: "RECEIVED", label: "RECEIVED" },
      { value: "CANCELLED", label: "CANCELLED" },
    ],
    []
  );

  const { mutateAsync: createPurchase, isPending: creatingPO } = useCreatePurchaseMutation();
  const { mutateAsync: receivePurchase, isPending: receivingPO } = useReceivePurchaseMutation();
  const { mutateAsync: payPurchase, isPending: payingPO } = usePayPurchaseMutation();

  // PO Modal State
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [poNotes, setPoNotes] = useState<string>("");
  const [poLineItems, setPoLineItems] = useState<PurchaseItemPayload[]>([]);

  // Receive PO Modal State
  const [receivingPOData, setReceivingPOData] = useState<PurchaseOrder | null>(null);

  // Detail Modal State
  const [activePurchaseDetailId, setActivePurchaseDetailId] = useState<string | null>(null);
  const { data: purchaseDetail } = usePurchaseDetailQuery(activePurchaseDetailId || undefined);

  const handleOpenCreatePO = () => {
    setSelectedSupplierId(suppliers[0]?.id || "");
    setPoNotes("");
    if (rawIngredients.length > 0) {
      setPoLineItems([
        {
          ingredient_id: rawIngredients[0].id,
          quantity: 1,
          unit_cost: rawIngredients[0].cost_per_unit,
        },
      ]);
    } else {
      setPoLineItems([]);
    }
    setPoModalOpen(true);
  };

  const handleAddPOLine = () => {
    const firstIng = rawIngredients[0];
    setPoLineItems((prev) => [
      ...prev,
      {
        ingredient_id: firstIng ? firstIng.id : "",
        quantity: 1,
        unit_cost: firstIng ? firstIng.cost_per_unit : 0,
      },
    ]);
  };

  const handleRemovePOLine = (idx: number) => {
    setPoLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poLineItems.length === 0) return;

    await createPurchase({
      supplier_id: selectedSupplierId,
      notes: poNotes,
      items: poLineItems.map((l) => ({
        ingredient_id: l.ingredient_id,
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost),
      })),
    });
    setPoModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage vendor purchase orders, receive ingredient stocks, and track PO payments"
        action={
          canCreate("purchase_order") && (
            <Button variant="primary" onClick={handleOpenCreatePO}>
              <HiOutlinePlus className="text-base mr-1.5" /> Create Purchase Order (PO)
            </Button>
          )
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-64">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <Dropdown
            size="sm"
            options={statusFilterOptions}
            value={statusFilterOptions.find((o) => o.value === purchaseStatusFilter) || statusFilterOptions[0]}
            setValue={(opt) => setPurchaseStatusFilter(opt?.value ? String(opt.value) : "")}
          />
        </div>
      </div>

      {loadingPurchases ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : !Array.isArray(purchases) || purchases.length === 0 ? (
        <EmptyState
          title="No purchase orders"
          description="Create a purchase order to acquire raw coffee beans, milk, or syrups from vendors."
          icon={<HiOutlineReceiptTax />}
        />
      ) : (
        <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">PO Number & Date</th>
                  <th className="px-5 py-3.5">Supplier</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Order Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {purchases.map((po) => {
                  const canReceive = po.status === "ORDERED" || po.status === "DRAFT" || po.status === "PARTIALLY_RECEIVED";
                  const canPay = po.payment_status === "UNPAID";

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{po.po_number}</div>
                        <div className="text-[11px] text-slate-400">{formatDateTime(po.created_at)}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {po.supplier_name || "Unknown Supplier"}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                        {formatCurrency(po.total_amount)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            po.status === "RECEIVED"
                              ? "success"
                              : po.status === "PARTIALLY_RECEIVED"
                              ? "warning"
                              : po.status === "ORDERED"
                              ? "primary"
                              : po.status === "CANCELLED"
                              ? "danger"
                              : "neutral"
                          }
                          size="sm"
                          dot
                        >
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={po.payment_status === "PAID" ? "success" : "warning"} size="sm">
                          {po.payment_status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActivePurchaseDetailId(po.id)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="View PO Details"
                          >
                            <HiOutlineEye className="text-base" />
                          </button>
                          {canReceive && canEdit("purchase_order") && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setReceivingPOData(po)}
                              title="Receive Items & Auto-Replenish Inventory"
                            >
                              <HiOutlineCheckCircle className="text-base mr-1" /> Receive
                            </Button>
                          )}
                          {canPay && canEdit("purchase_order") && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => payPurchase(po.id)}
                              loading={payingPO}
                              title="Mark Paid & Book RAW_MATERIAL Expense"
                            >
                              <HiOutlineCreditCard className="text-base mr-1" /> Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      <Modal show={poModalOpen} handleClose={() => setPoModalOpen(false)} title="Create Purchase Order (PO)">
        <form onSubmit={handleSubmitPO} className="space-y-4">
          <div>
            <Dropdown
              label="Select Supplier *"
              placeholder="Select supplier..."
              options={supplierOptions}
              value={supplierOptions.find((s) => s.value === selectedSupplierId) || null}
              setValue={(opt) => setSelectedSupplierId(opt?.value ? String(opt.value) : "")}
              required
            />
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered Materials</span>
              <Button variant="secondary" size="sm" type="button" onClick={handleAddPOLine}>
                <HiOutlinePlus className="text-sm mr-1" /> Add Line
              </Button>
            </div>
            {poLineItems.map((line, idx) => {
              const subtotal = line.quantity * line.unit_cost;

              return (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="flex-1">
                    <Dropdown
                      size="sm"
                      placeholder="Select ingredient..."
                      options={ingredientOptions}
                      value={ingredientOptions.find((ing) => ing.value === line.ingredient_id) || null}
                      setValue={(opt) => {
                        const val = opt?.value ? String(opt.value) : "";
                        const selectedIng = rawIngredients.find((i) => i.id === val);
                        setPoLineItems((prev) =>
                          prev.map((r, i) =>
                            i === idx
                              ? {
                                  ...r,
                                  ingredient_id: val,
                                  unit_cost: selectedIng?.cost_per_unit || r.unit_cost,
                                }
                              : r
                          )
                        );
                      }}
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="Qty"
                      value={line.quantity || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPoLineItems((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, quantity: val } : r))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      placeholder="Unit Cost"
                      value={line.unit_cost || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPoLineItems((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, unit_cost: val } : r))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="w-24 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(subtotal)}
                  </div>

                  {poLineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePOLine(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <HiOutlineTrash className="text-base" />
                    </button>
                  )}
                </div>
              );
            })}

            <div className="text-right text-xs text-slate-500 pt-1">
              PO Est. Total:{" "}
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {formatCurrency(
                  poLineItems.reduce((acc, curr) => acc + curr.quantity * curr.unit_cost, 0)
                )}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="e.g., Deliver before Friday 10:00 AM"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setPoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingPO}>
              Create Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW PURCHASE DETAIL */}
      {activePurchaseDetailId && purchaseDetail && (
        <Modal
          show={!!activePurchaseDetailId}
          handleClose={() => setActivePurchaseDetailId(null)}
          title={`Purchase Order: ${purchaseDetail.po_number}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Supplier</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {purchaseDetail.supplier_name || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <Badge variant={purchaseDetail.status === "RECEIVED" ? "success" : "primary"} size="sm">
                  {purchaseDetail.status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block">Payment</span>
                <Badge variant={purchaseDetail.payment_status === "PAID" ? "success" : "warning"} size="sm">
                  {purchaseDetail.payment_status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block">Total PO</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {formatCurrency(purchaseDetail.total_amount)}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Ingredient</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit Cost</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchaseDetail.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                        {it.ingredient_name || "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        {it.quantity} {it.unit || ""}
                      </td>
                      <td className="px-3 py-2.5">{formatCurrency(it.unit_cost)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {purchaseDetail.notes && (
              <div className="text-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2.5 rounded-xl">
                <span className="font-bold">Notes:</span> {purchaseDetail.notes}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: RECEIVE PO (FULL OR PARTIAL) */}
      <ReceivePOModal
        show={!!receivingPOData}
        purchase={receivingPOData}
        onClose={() => setReceivingPOData(null)}
        onConfirm={async (payload) => {
          await receivePurchase(payload);
          setReceivingPOData(null);
        }}
        loading={receivingPO}
      />
    </div>
  );
};

export default ManagePurchasesPage;
