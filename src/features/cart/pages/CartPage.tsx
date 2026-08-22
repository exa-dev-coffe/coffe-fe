import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useCartContext } from "@/app/providers/CartContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import {
  useCheckoutMutation,
  useValidateVoucherMutation,
} from "@/features/cart/hooks/useCartMutation.ts";
import CartItemCard from "@/features/cart/components/CartItemCard.tsx";
import CheckoutPinModal from "@/features/cart/components/CheckoutPinModal.tsx";
import TablePickerModal from "@/features/home/components/TablePickerModal.tsx";
import VoucherPickerModal from "@/features/cart/components/VoucherPickerModal.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import Input from "@/components/ui/Input.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineShoppingCart,
  HiOutlineDesktopComputer,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineTicket,
  HiOutlineSparkles,
} from "react-icons/hi";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, setDatas, setOrderFor, resetCart, checkedTotalPrice } =
    useCartContext();
  const { successNotificationClient, errorNotificationClient } =
    useNotificationContext();

  const [showPinModal, setShowPinModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const { mutateAsync: checkout, isPending: checkoutLoading } =
    useCheckoutMutation();
  const { mutateAsync: validateVoucher, isPending: validateLoading } =
    useValidateVoucherMutation();

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
    finalTotal: number;
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    maxDiscount?: number;
    minPurchase?: number;
  } | null>(null);

  const isAllChecked =
    cart.datas.length > 0 && cart.datas.every((item) => item.checked);
  const checkedItems = cart.datas.filter((item) => item.checked);

  const originalSubtotal = checkedItems.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.amount,
    0,
  );

  const productPromoSavings = checkedItems.reduce(
    (acc, item) =>
      acc +
      (item.originalPrice && item.originalPrice > item.price
        ? (item.originalPrice - item.price) * item.amount
        : 0),
    0,
  );
  const voucherSavings = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const totalSavings = productPromoSavings + voucherSavings;

  const handleApplyVoucherCode = async (codeToApply: string) => {
    if (!codeToApply) return;
    try {
      const res = await validateVoucher({
        code: codeToApply,
        orderTotal: checkedTotalPrice,
      });
      if (res.valid) {
        setAppliedVoucher({
          code: codeToApply,
          discountAmount: res.discountAmount,
          finalTotal: res.finalTotal,
          discountType: res.discountType as "PERCENTAGE" | "FIXED" | undefined,
          discountValue: res.discountValue,
          maxDiscount: res.maxDiscount,
          minPurchase: res.minPurchase,
        });
        successNotificationClient(
          res.message || "Voucher applied successfully!",
        );
      } else {
        errorNotificationClient(res.message || "Voucher code is invalid.");
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    handleApplyVoucherCode(voucherInput.trim().toUpperCase());
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  const handleToggleSelectAll = () => {
    const nextState = !isAllChecked;
    const updated = cart.datas.map((item) => ({ ...item, checked: nextState }));
    setDatas(updated);
    // Clear voucher on item selection change as total price changes
    setAppliedVoucher(null);
  };

  const handleToggleItem = (id: number) => {
    const updated = cart.datas.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    setDatas(updated);
    // Clear voucher on item selection change as total price changes
    setAppliedVoucher(null);
  };

  const handleUpdateQuantity = (id: number, qty: number) => {
    const updated = cart.datas.map((item) =>
      item.id === id ? { ...item, amount: qty } : item,
    );
    setDatas(updated);
    // Clear voucher on item selection change as total price changes
    setAppliedVoucher(null);
  };

  const handleUpdateNotes = (id: number, notes: string) => {
    const updated = cart.datas.map((item) =>
      item.id === id ? { ...item, notes } : item,
    );
    setDatas(updated);
  };

  const handleRemoveItem = (id: number) => {
    const updated = cart.datas.filter((item) => item.id !== id);
    setDatas(updated);
    successNotificationClient("Item removed from cart");
    // Clear voucher on item selection change as total price changes
    setAppliedVoucher(null);
  };

  const handleOpenCheckout = () => {
    if (checkedItems.length === 0) {
      errorNotificationClient("Please select at least 1 item to checkout");
      return;
    }

    if (!cart.tableId || cart.tableId === 0) {
      setShowTableModal(true);
      errorNotificationClient("Please choose your table number first");
      return;
    }

    if (!cart.orderFor.trim()) {
      errorNotificationClient("Please provide a name for this order");
      return;
    }

    setShowPinModal(true);
  };

  const handleConfirmCheckout = async (pin: string): Promise<boolean> => {
    try {
      const payload = {
        pin,
        orderFor: cart.orderFor,
        tableId: cart.tableId,
        voucherCode: appliedVoucher?.code || undefined,
        datas: checkedItems.map((item) => ({
          menuId: item.id,
          qty: item.amount,
          notes: item.notes || "",
        })),
      };

      await checkout(payload);

      // Remove only checked items
      const remaining = cart.datas.filter((item) => !item.checked);
      setDatas(remaining);
      setShowPinModal(false);
      setAppliedVoucher(null);
      setVoucherInput("");
      navigate("/my-transaction");
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 sm:px-6 space-y-8 max-w-6xl">
        <PageHeader
          title="My Coffee Cart"
          subtitle="Review your selected items, configure table delivery, and complete your order."
          breadcrumb={[{ label: "Home", to: "/" }, { label: "My Cart" }]}
        />

        {cart.datas.length === 0 ? (
          <EmptyState
            icon={<HiOutlineShoppingCart />}
            title="Your Cart is Empty"
            description="Explore our specialty single-origin coffees, signature drinks, and fresh bakery."
            actionLabel="Browse Menu"
            onAction={() => navigate("/menu")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                <Checkbox
                  label="Select All Items"
                  checked={isAllChecked}
                  onChange={handleToggleSelectAll}
                />
                <button
                  type="button"
                  onClick={resetCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.datas.map((item) => (
                  <CartItemCard
                    key={item.id}
                    id={item.id}
                    name={item.nameProduct}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    discount={item.discount}
                    photo={item.photo}
                    amount={item.amount}
                    checked={item.checked}
                    notes={item.notes}
                    onToggleChecked={handleToggleItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    onUpdateNotes={handleUpdateNotes}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="space-y-4 sticky top-24">
              <Card variant="elevated" className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Order Summary
                </h3>

                {/* Dine-in Table Selector */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <HiOutlineDesktopComputer className="text-amber-500 text-sm" />
                      Dine-in Seating
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTableModal(true)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {cart.tableId > 0 ? "Change" : "Select"}
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {cart.tableId > 0
                      ? `Table #${cart.tableName}`
                      : "No Table Selected"}
                  </p>
                </div>

                {/* Order For Input */}
                <div>
                  <Input
                    label="Customer Name"
                    placeholder="Name on order ticket"
                    value={cart.orderFor}
                    onChange={(e) => setOrderFor(e.target.value)}
                    required
                  />
                </div>

                {/* Promo Voucher Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <HiOutlineTicket className="text-amber-500 text-sm" />
                    Promo Voucher
                  </label>
                  {appliedVoucher ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-wider px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {appliedVoucher.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              appliedVoucher.discountType === "PERCENTAGE"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {appliedVoucher.discountType === "PERCENTAGE"
                              ? `${appliedVoucher.discountValue}% OFF`
                              : `${formatCurrency(appliedVoucher.discountValue || appliedVoucher.discountAmount)} OFF`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Terms & Conditions Details List */}
                      <div className="text-[11px] space-y-1 pt-2 border-t border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                        <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <HiOutlineSparkles className="text-amber-500" />
                          Saved {formatCurrency(
                            appliedVoucher.discountAmount,
                          )}{" "}
                          on this order
                        </div>
                        {typeof appliedVoucher.minPurchase === "number" ? (
                          appliedVoucher.minPurchase > 0 ? (
                            <div>
                              • Syarat Min. Belanja:{" "}
                              {formatCurrency(appliedVoucher.minPurchase)}
                            </div>
                          ) : (
                            <div>• Syarat: Tanpa Minimal Belanja</div>
                          )
                        ) : null}
                        {appliedVoucher.discountType === "PERCENTAGE" &&
                        typeof appliedVoucher.maxDiscount === "number" &&
                        appliedVoucher.maxDiscount > 0 ? (
                          <div>
                            • Maksimal Potongan Diskon:{" "}
                            {formatCurrency(appliedVoucher.maxDiscount)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Masukkan kode voucher"
                          value={voucherInput}
                          onChange={(e) =>
                            setVoucherInput(e.target.value.toUpperCase())
                          }
                          className="flex-1 px-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring uppercase font-bold tracking-wider"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleApplyVoucher}
                          loading={validateLoading}
                          disabled={
                            !voucherInput.trim() || checkedItems.length === 0
                          }
                        >
                          Apply
                        </Button>
                      </div>

                      {/* Modal Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setShowVoucherModal(true)}
                        className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-xs font-bold">
                          <HiOutlineSparkles className="text-amber-500 text-base" />
                          Lihat Daftar Voucher Promo
                        </span>
                        <span className="text-[11px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg">
                          Pilih
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Items Subtotal ({checkedItems.length})</span>
                    <span>{formatCurrency(originalSubtotal)}</span>
                  </div>
                  {productPromoSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Product Promo Discount</span>
                      <span>-{formatCurrency(productPromoSavings)}</span>
                    </div>
                  )}
                  {appliedVoucher && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Voucher ({appliedVoucher.code})</span>
                      <span>
                        -{formatCurrency(appliedVoucher.discountAmount)}
                      </span>
                    </div>
                  )}
                  {totalSavings > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>Total Savings</span>
                      <span>{formatCurrency(totalSavings)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Tax & Service</span>
                    <span className="text-emerald-600 font-semibold">
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Payment</span>
                    <span className="text-xl text-amber-600 dark:text-amber-400">
                      {formatCurrency(
                        appliedVoucher
                          ? appliedVoucher.finalTotal
                          : checkedTotalPrice,
                      )}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={checkedItems.length === 0}
                  rightIcon={<HiOutlineArrowRight />}
                  onClick={handleOpenCheckout}
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                  <HiOutlineShieldCheck className="text-emerald-500 text-sm" />
                  <span>Instant payment from your Digital Wallet</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Table Picker Dialog */}
        <TablePickerModal
          show={showTableModal}
          onClose={() => setShowTableModal(false)}
        />

        {/* Checkout PIN Verification Dialog */}
        <CheckoutPinModal
          show={showPinModal}
          totalAmount={
            appliedVoucher ? appliedVoucher.finalTotal : checkedTotalPrice
          }
          tableName={cart.tableName}
          orderFor={cart.orderFor}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmCheckout}
          loading={checkoutLoading}
        />

        {/* Voucher Picker Dialog */}
        <VoucherPickerModal
          show={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          orderTotal={checkedTotalPrice}
          appliedVoucherCode={appliedVoucher?.code}
          onSelectVoucher={handleApplyVoucherCode}
          onRemoveVoucher={handleRemoveVoucher}
        />
      </div>
    </div>
  );
};

export default CartPage;
