import React, {useState} from "react";
import {useNavigate} from "react-router";
import {useCartContext} from "@/app/providers/CartContext.ts";
import {useNotificationContext} from "@/app/providers/NotificationContext.ts";
import { useCheckoutMutation } from "@/features/cart/hooks/useCartMutation.ts";
import CartItemCard from "@/features/cart/components/CartItemCard.tsx";
import CheckoutPinModal from "@/features/cart/components/CheckoutPinModal.tsx";
import TablePickerModal from "@/features/home/components/TablePickerModal.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import Input from "@/components/ui/Input.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import {
    HiOutlineShoppingCart,
    HiOutlineDesktopComputer,
    HiOutlineArrowRight,
    HiOutlineShieldCheck,
} from "react-icons/hi";

export const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const {cart, setDatas, setOrderFor, resetCart, checkedTotalPrice} = useCartContext();
    const {successNotificationClient, errorNotificationClient} = useNotificationContext();

    const [showPinModal, setShowPinModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const { mutateAsync: checkout, isPending: checkoutLoading } = useCheckoutMutation();

    const checkedItems = cart.datas.filter((item) => item.checked);
    const isAllChecked = cart.datas.length > 0 && cart.datas.every((item) => item.checked);

    const handleToggleSelectAll = () => {
        const nextState = !isAllChecked;
        const updated = cart.datas.map((item) => ({...item, checked: nextState}));
        setDatas(updated);
    };

    const handleToggleItem = (id: number) => {
        const updated = cart.datas.map((item) =>
            item.id === id ? {...item, checked: !item.checked} : item
        );
        setDatas(updated);
    };

    const handleUpdateQuantity = (id: number, qty: number) => {
        const updated = cart.datas.map((item) =>
            item.id === id ? {...item, amount: qty} : item
        );
        setDatas(updated);
    };

    const handleUpdateNotes = (id: number, notes: string) => {
        const updated = cart.datas.map((item) =>
            item.id === id ? {...item, notes} : item
        );
        setDatas(updated);
    };

    const handleRemoveItem = (id: number) => {
        const updated = cart.datas.filter((item) => item.id !== id);
        setDatas(updated);
        successNotificationClient("Item removed from cart");
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
                    breadcrumb={[
                        {label: "Home", to: "/"},
                        {label: "My Cart"},
                    ]}
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

                                {/* Price Breakdown */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>Selected Items ({checkedItems.length})</span>
                                        <span>{formatCurrency(checkedTotalPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>Tax & Service</span>
                                        <span className="text-emerald-600 font-semibold">Included</span>
                                    </div>
                                    <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span>Total Payment</span>
                                        <span className="text-xl text-amber-600 dark:text-amber-400">
                                            {formatCurrency(checkedTotalPrice)}
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
                    totalAmount={checkedTotalPrice}
                    tableName={cart.tableName}
                    orderFor={cart.orderFor}
                    onClose={() => setShowPinModal(false)}
                    onConfirm={handleConfirmCheckout}
                    loading={checkoutLoading}
                />
            </div>
        </div>
    );
};

export default CartPage;
