import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import useSSE from "@/core/hooks/useSSE.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import env from "@/core/config/env.ts";
import {
  usePosMenusQuery,
  usePosCategoriesQuery,
  usePosTablesQuery,
  usePosCheckoutMutation,
  useValidatePosVoucherMutation,
  useSyncPosQrisStatusMutation,
  useChangePosPaymentMethodMutation,
  usePosTransactionsHistoryQuery,
} from "@/features/pos/hooks/usePos.ts";
import type {
  PosCartItem,
  OrderType,
  PaymentMethod,
  PosReceiptData,
} from "@/features/pos/types/pos.types.ts";
import type { MenuItem } from "@/features/menu/types/menu.types.ts";
import type { OrderItem } from "@/features/orders/types/order.types.ts";
import PosHeader from "@/features/pos/components/PosHeader.tsx";
import PosMenuGrid from "@/features/pos/components/PosMenuGrid.tsx";
import PosCartPanel from "@/features/pos/components/PosCartPanel.tsx";
import PosPaymentModal from "@/features/pos/components/PosPaymentModal.tsx";
import PosReceiptModal from "@/features/pos/components/PosReceiptModal.tsx";
import PosHistoryModal from "@/features/pos/components/PosHistoryModal.tsx";
import PosQrisModal, {
  type PosQrisModalData,
} from "@/features/pos/components/PosQrisModal.tsx";
import PosChangePaymentModal, {
  type PosChangePaymentData,
} from "@/features/pos/components/PosChangePaymentModal.tsx";
import { HiOutlineShoppingCart } from "react-icons/hi";

export const PosTerminalPage: React.FC = () => {
  const { auth } = useAuthContext();
  const { successNotificationDashboard } = useNotificationContext();

  // Queries
  const {
    data: rawMenus = [],
    isLoading: isLoadingMenus,
    refetch: refetchMenus,
    isFetching: isFetchingMenus,
  } = usePosMenusQuery();
  const { data: categories = [] } = usePosCategoriesQuery();
  const { data: tables = [] } = usePosTablesQuery();

  // Mutations
  const checkoutMutation = usePosCheckoutMutation();
  const validateVoucherMutation = useValidatePosVoucherMutation();
  const syncQrisMutation = useSyncPosQrisStatusMutation();
  const changePaymentMutation = useChangePosPaymentMethodMutation();
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTab, setHistoryTab] = useState<"ALL" | "PENDING" | "PAID">(
    "ALL",
  );
  const [historySearch, setHistorySearch] = useState("");

  const {
    data: posHistoryPagination,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = usePosTransactionsHistoryQuery({
    page: historyPage,
    size: 10,
    search: historySearch,
    paymentStatus: historyTab !== "ALL" ? historyTab : undefined,
  });

  const posOrdersHistory = posHistoryPagination?.data || [];

  // Local POS State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [customerName, setCustomerName] = useState("Walk-in Guest");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<
    string | undefined
  >(undefined);

  // Voucher state
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
    finalTotal: number;
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
  } | null>(null);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Separate QRIS Modal State
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisModalData, setQrisModalData] = useState<PosQrisModalData | null>(
    null,
  );

  // Change Payment Modal State
  const [showChangePaymentModal, setShowChangePaymentModal] = useState(false);
  const [changePaymentData, setChangePaymentData] =
    useState<PosChangePaymentData | null>(null);

  const [syncingHistoryId, setSyncingHistoryId] = useState<number | null>(null);
  const [paymentModalOverride, setPaymentModalOverride] = useState<{
    totalAmount: number;
    orderFor: string;
    orderType: string;
    tableName?: string;
    initialMethod?: PaymentMethod;
    initialQrisData?: {
      orderId?: number;
      qrString?: string;
      qrUrl?: string;
    } | null;
  } | null>(null);
  const [receiptData, setReceiptData] = useState<PosReceiptData | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [activeQrisOrderId, setActiveQrisOrderId] = useState<number | null>(
    null,
  );

  const pendingCount = useMemo(() => {
    return (posHistoryPagination?.data || []).filter(
      (o) => o.paymentStatus === "PENDING" || o.paymentStatus === "pending",
    ).length;
  }, [posHistoryPagination?.data]);

  // Real-time SSE listener for automatic POS QRIS settlement
  useSSE<{
    event: string;
    data: OrderItem;
  }>({
    baseUrl: `${env.API_URL}${ENDPOINTS.EVENTS}?type=order`,
    autoConnect: true,
    onMessage: (dataSSE) => {
      if (!dataSSE || !dataSSE.data || dataSSE.event !== "new_order") return;
      refetchHistory();
      const sseOrder = dataSSE.data;
      const orderId = Number(sseOrder.id);
      const isPaid =
        sseOrder.paymentStatus === "PAID" || sseOrder.paymentStatus === "paid";

      const activeId = Number(activeQrisOrderId || qrisModalData?.orderId || 0);

      const isMatchingOrder =
        (activeId > 0 && activeId === orderId) ||
        (qrisModalData?.orderId && Number(qrisModalData.orderId) === orderId) ||
        (activeQrisOrderId && Number(activeQrisOrderId) === orderId);

      if ((showQrisModal || activeId > 0) && isMatchingOrder && isPaid) {
        const validMethod: PaymentMethod =
          sseOrder.paymentMethod === "CASH"
            ? "CASH"
            : sseOrder.paymentMethod === "WALLET"
              ? "WALLET"
              : "MIDTRANS";

        const validOrderType: OrderType =
          sseOrder.orderType === "TAKEAWAY" ? "TAKEAWAY" : "DINE_IN";

        const newReceipt: PosReceiptData = {
          orderId: sseOrder.id,
          orderFor: sseOrder.orderBy || sseOrder.orderFor || "Walk-in Guest",
          orderType: validOrderType,
          tableId: sseOrder.tableId || undefined,
          tableName:
            sseOrder.tableName ||
            (sseOrder.tableId ? `${sseOrder.tableId}` : undefined),
          cashierName: auth.name || "Cashier Operator",
          createdAt: sseOrder.createdAt || new Date().toISOString(),
          items: sseOrder.details
            ? sseOrder.details.map((d) => ({
                menuId: d.menuId || 0,
                name: d.menuName || `Item #${d.menuId}`,
                price: d.price || 0,
                qty: d.qty || 1,
                total: d.totalPrice ?? (d.price || 0) * (d.qty || 1),
                notes: d.notes || "",
              }))
            : [],
          subtotal: sseOrder.totalPrice || 0,
          productDiscount: 0,
          voucherDiscount: sseOrder.discountAmount || 0,
          totalPrice: sseOrder.totalPrice || 0,
          paymentMethod: validMethod,
          paymentStatus: "PAID",
          cashAmount: sseOrder.cashAmount || sseOrder.totalPrice || 0,
          cashChange: sseOrder.cashChange || 0,
          qrString: sseOrder.qrString,
          qrUrl: sseOrder.qrUrl,
        };

        setReceiptData(newReceipt);
        setShowQrisModal(false);
        setQrisModalData(null);
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        setActiveQrisOrderId(null);
        handleNewOrder();
        successNotificationDashboard(
          `Payment received for Order #${orderId}! Receipt ready.`,
        );
      }
    },
  });

  const handleManualSyncQris = async () => {
    const orderId = activeQrisOrderId || qrisModalData?.orderId;
    if (!orderId) return;
    try {
      const res = await syncQrisMutation.mutateAsync(orderId);
      if (res) {
        setReceiptData({
          orderId: res.id,
          orderFor: res.orderBy || res.orderFor || "Walk-in Guest",
          orderType: res.orderType === "TAKEAWAY" ? "TAKEAWAY" : "DINE_IN",
          tableId: res.tableId || undefined,
          tableName: res.tableId ? `${res.tableId}` : undefined,
          cashierName: auth.name || "Cashier Operator",
          createdAt: res.createdAt || new Date().toISOString(),
          items: res.details
            ? res.details.map(
                (d: {
                  menuId?: number;
                  menuName?: string;
                  name?: string;
                  price?: number;
                  qty?: number;
                  totalPrice?: number;
                  notes?: string;
                }) => ({
                  menuId: d.menuId || 0,
                  name: d.menuName || d.name || `Item #${d.menuId}`,
                  price: d.price || 0,
                  qty: d.qty || 1,
                  total: d.totalPrice || (d.price || 0) * (d.qty || 1),
                  notes: d.notes || "",
                }),
              )
            : [],
          subtotal: res.totalPrice || 0,
          productDiscount: 0,
          voucherDiscount: res.discountAmount || 0,
          totalPrice: res.totalPrice || 0,
          paymentMethod: "MIDTRANS",
          paymentStatus: "PAID",
          cashAmount: res.totalPrice || 0,
          cashChange: 0,
        });
        setShowQrisModal(false);
        setQrisModalData(null);
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        setActiveQrisOrderId(null);
        handleNewOrder();
        successNotificationDashboard("Payment confirmed successfully!");
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleConfirmChangePayment = async (
    targetOrderId: number,
    newMethod: PaymentMethod,
    cashAmount?: number,
    cashChange?: number,
    walletPaymentCode?: string,
  ) => {
    try {
      const res = await changePaymentMutation.mutateAsync({
        orderId: targetOrderId,
        paymentMethod: newMethod,
        cashAmount,
        cashChange,
        walletPaymentCode,
      });

      if (res) {
        setReceiptData({
          orderId: res.id,
          orderFor: res.orderBy || res.orderFor || "Walk-in Guest",
          orderType: res.orderType === "TAKEAWAY" ? "TAKEAWAY" : "DINE_IN",
          tableId: res.tableId || undefined,
          tableName: res.tableId ? `${res.tableId}` : undefined,
          cashierName: auth.name || "Cashier Operator",
          createdAt: res.createdAt || new Date().toISOString(),
          items: res.details
            ? res.details.map(
                (d: {
                  menuId?: number;
                  menuName?: string;
                  name?: string;
                  price?: number;
                  qty?: number;
                  totalPrice?: number;
                  notes?: string;
                }) => ({
                  menuId: d.menuId || 0,
                  name: d.menuName || d.name || `Item #${d.menuId}`,
                  price: d.price || 0,
                  qty: d.qty || 1,
                  total: d.totalPrice || (d.price || 0) * (d.qty || 1),
                  notes: d.notes || "",
                }),
              )
            : [],
          subtotal: res.totalPrice || 0,
          productDiscount: 0,
          voucherDiscount: res.discountAmount || 0,
          totalPrice: res.totalPrice || 0,
          paymentMethod: newMethod,
          paymentStatus: "PAID",
          cashAmount: cashAmount || res.totalPrice || 0,
          cashChange: cashChange || 0,
        });

        setShowQrisModal(false);
        setQrisModalData(null);
        setShowChangePaymentModal(false);
        setChangePaymentData(null);
        setShowReceiptModal(true);
        setActiveQrisOrderId(null);
        handleNewOrder();
      }
    } catch {
      // Error handled by mutation
    }
  };

  // Filtered menus
  const filteredMenus = useMemo(() => {
    return rawMenus.filter((menu) => {
      const matchSearch =
        !searchQuery ||
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (menu.categoryName &&
          menu.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategoryId === null || menu.categoryId === selectedCategoryId;

      return matchSearch && matchCategory;
    });
  }, [rawMenus, searchQuery, selectedCategoryId]);

  // Cart item quantities map for fast lookup on menu cards
  const cartItemQuantities = useMemo(() => {
    const map: Record<number, number> = {};
    for (const item of cartItems) {
      map[item.id] = item.amount;
    }
    return map;
  }, [cartItems]);

  // Calculation helpers
  const effectiveSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.amount, 0);
  }, [cartItems]);

  const originalSubtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.amount,
      0,
    );
  }, [cartItems]);

  const productDiscountTotal = originalSubtotal - effectiveSubtotal;

  const currentFinalTotal = appliedVoucher
    ? appliedVoucher.finalTotal
    : effectiveSubtotal;

  // Handlers
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, amount: p.amount + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          nameProduct: item.name,
          price:
            item.discount && item.discount.savings > 0 && item.effectivePrice
              ? item.effectivePrice
              : item.price,
          originalPrice: item.price,
          discount: item.discount,
          photo: item.photo,
          amount: 1,
          notes: "",
        },
      ];
    });

    // Reset voucher if order total changed
    if (appliedVoucher) {
      setAppliedVoucher(null);
    }
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((p) => {
          if (p.id === id) {
            const nextAmount = p.amount + delta;
            return nextAmount > 0 ? { ...p, amount: nextAmount } : null;
          }
          return p;
        })
        .filter(Boolean) as PosCartItem[];
    });

    if (appliedVoucher) {
      setAppliedVoucher(null);
    }
  };

  const handleUpdateNotes = (id: number, notes: string) => {
    setCartItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p)),
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
    if (appliedVoucher) {
      setAppliedVoucher(null);
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  const handleApplyVoucher = async (code: string) => {
    if (!code) return;
    try {
      const res = await validateVoucherMutation.mutateAsync({
        code,
        orderTotal: effectiveSubtotal,
      });

      if (res?.valid) {
        setAppliedVoucher({
          code,
          discountAmount: res.discountAmount,
          finalTotal: res.finalTotal,
          discountType: res.discountType,
          discountValue: res.discountValue,
        });
      }
    } catch {
      // notification handled by hook
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
  };

  const handleConfirmPayment = async (
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    cashChange?: number,
    walletPaymentCode?: string,
  ): Promise<unknown> => {
    // If QRIS was already generated and cashier clicks "Confirm Payment"
    if (paymentMethod === "MIDTRANS" && activeQrisOrderId) {
      try {
        const synced = await syncQrisMutation.mutateAsync(activeQrisOrderId);
        if (receiptData) {
          setReceiptData({ ...receiptData, paymentStatus: "PAID" });
        }
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        setActiveQrisOrderId(null);
        return synced;
      } catch {
        return false;
      }
    }

    const payload = {
      orderType,
      tableId:
        orderType === "DINE_IN" && selectedTableId
          ? selectedTableId
          : undefined,
      orderFor: customerName || "Walk-in Guest",
      paymentMethod,
      cashAmount: paymentMethod === "CASH" ? cashAmount : undefined,
      cashChange: paymentMethod === "CASH" ? cashChange : undefined,
      walletPaymentCode:
        paymentMethod === "WALLET" ? walletPaymentCode : undefined,
      voucherCode: appliedVoucher?.code,
      datas: cartItems.map((item) => ({
        menuId: item.id,
        qty: item.amount,
        notes: item.notes || "",
      })),
    };

    try {
      const result = await checkoutMutation.mutateAsync(payload);

      // Build receipt data
      const receipt: PosReceiptData = {
        orderId: result.id,
        orderFor: payload.orderFor,
        orderType,
        tableId: payload.tableId,
        tableName: selectedTableName,
        cashierName: auth.name || "Cashier Operator",
        createdAt: result.createdAt || new Date().toISOString(),
        items: cartItems.map((i) => ({
          menuId: i.id,
          name: i.nameProduct,
          price: i.price,
          qty: i.amount,
          total: i.price * i.amount,
          notes: i.notes,
        })),
        subtotal: originalSubtotal,
        productDiscount: productDiscountTotal,
        voucherCode: appliedVoucher?.code,
        voucherDiscount: appliedVoucher?.discountAmount || 0,
        totalPrice: currentFinalTotal,
        paymentMethod,
        paymentStatus:
          result.paymentStatus ||
          (paymentMethod === "MIDTRANS" ? "PENDING" : "PAID"),
        cashAmount: cashAmount || currentFinalTotal,
        cashChange: cashChange || 0,
        qrString: result.qrString,
        qrUrl: result.qrUrl,
      };

      setReceiptData(receipt);

      if (paymentMethod === "MIDTRANS") {
        setActiveQrisOrderId(result.id);
        setShowPaymentModal(false);
        setQrisModalData({
          orderId: result.id,
          orderFor: payload.orderFor,
          orderType: payload.orderType,
          tableName: selectedTableName,
          totalPrice: currentFinalTotal,
          qrString: result.qrString,
          qrUrl: result.qrUrl,
        });
        setShowQrisModal(true);
        // Clear cart for next ticket while keeping activeQrisOrderId set for real-time SSE listener
        handleClearCart();
        setCustomerName("Walk-in Guest");
        setSelectedTableId(null);
        setSelectedTableName(undefined);
        setOrderType("DINE_IN");
        return result;
      }

      setShowPaymentModal(false);
      setShowReceiptModal(true);
      handleNewOrder();
      return result;
    } catch {
      return false;
    }
  };

  const handleNewOrder = () => {
    handleClearCart();
    setCustomerName("Walk-in Guest");
    setSelectedTableId(null);
    setSelectedTableName(undefined);
    setOrderType("DINE_IN");
    setActiveQrisOrderId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
      {/* Top Header */}
      <PosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemCount={cartItems.length}
        onClearCart={handleClearCart}
        onRefreshMenus={refetchMenus}
        isRefreshing={isFetchingMenus}
        onOpenHistory={() => setShowHistoryModal(true)}
        pendingCount={pendingCount}
      />

      {/* 2. Main Terminal Body (Split Grid & Cart) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        {/* Left Column: Menu Catalog (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
          <PosMenuGrid
            menus={filteredMenus}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            cartItemQuantities={cartItemQuantities}
            onAddToCart={handleAddToCart}
            isLoading={isLoadingMenus}
          />
        </div>

        {/* Right Column: Order Ticket Cart (5 cols on lg, 4 on xl) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col min-h-0">
          <PosCartPanel
            items={cartItems}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            selectedTableId={selectedTableId}
            selectedTableName={selectedTableName}
            onSelectTable={(id, name) => {
              setSelectedTableId(id);
              setSelectedTableName(name);
            }}
            tables={tables}
            onUpdateQty={handleUpdateQty}
            onUpdateNotes={handleUpdateNotes}
            onRemoveItem={handleRemoveItem}
            appliedVoucher={appliedVoucher}
            onApplyVoucherCode={handleApplyVoucher}
            onRemoveVoucher={handleRemoveVoucher}
            voucherInput={voucherInput}
            onVoucherInputChange={setVoucherInput}
            isVoucherLoading={validateVoucherMutation.isPending}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
          />
        </div>
      </div>

      {/* Mobile Floating Cart Trigger Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileCart(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-between transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <HiOutlineShoppingCart className="text-xl" />
              <span>
                {cartItems.reduce((acc, i) => acc + i.amount, 0)} Items in
                Ticket
              </span>
            </div>
            <span>View Ticket</span>
          </button>
        </div>
      )}

      {/* Mobile Slide-in Cart Drawer */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="mt-auto bg-white dark:bg-slate-900 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto flex flex-col space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white">
                Active Order Ticket
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileCart(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                ✕ Close
              </button>
            </div>
            <PosCartPanel
              items={cartItems}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              selectedTableId={selectedTableId}
              selectedTableName={selectedTableName}
              onSelectTable={(id, name) => {
                setSelectedTableId(id);
                setSelectedTableName(name);
              }}
              tables={tables}
              onUpdateQty={handleUpdateQty}
              onUpdateNotes={handleUpdateNotes}
              onRemoveItem={handleRemoveItem}
              appliedVoucher={appliedVoucher}
              onApplyVoucherCode={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
              voucherInput={voucherInput}
              onVoucherInputChange={setVoucherInput}
              isVoucherLoading={validateVoucherMutation.isPending}
              onOpenPaymentModal={() => {
                setShowMobileCart(false);
                setShowPaymentModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <PosPaymentModal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentModalOverride(null);
        }}
        totalAmount={paymentModalOverride?.totalAmount ?? currentFinalTotal}
        orderFor={paymentModalOverride?.orderFor ?? customerName}
        orderType={paymentModalOverride?.orderType ?? orderType}
        tableName={paymentModalOverride?.tableName ?? selectedTableName}
        onConfirmPayment={handleConfirmPayment}
        isLoading={checkoutMutation.isPending}
        onManualSyncQris={handleManualSyncQris}
        isSyncingQris={syncQrisMutation.isPending}
        initialMethod={paymentModalOverride?.initialMethod}
        initialQrisData={paymentModalOverride?.initialQrisData}
      />

      {/* Dedicated QRIS QR Code Modal */}
      <PosQrisModal
        show={showQrisModal}
        onClose={() => {
          setShowQrisModal(false);
          setActiveQrisOrderId(null);
          setQrisModalData(null);
        }}
        data={qrisModalData}
        onManualSyncQris={handleManualSyncQris}
        isSyncingQris={syncQrisMutation.isPending}
        onChangePaymentMethod={() => {
          if (qrisModalData) {
            setChangePaymentData({
              orderId: qrisModalData.orderId,
              orderFor: qrisModalData.orderFor,
              orderType: qrisModalData.orderType,
              tableName: qrisModalData.tableName,
              totalPrice: qrisModalData.totalPrice,
            });
            setShowQrisModal(false);
            setShowChangePaymentModal(true);
            setActiveQrisOrderId(null);
            setQrisModalData(null);
          }
        }}
      />

      {/* Change Payment Method Modal */}
      <PosChangePaymentModal
        show={showChangePaymentModal}
        onClose={() => {
          setShowChangePaymentModal(false);
          setChangePaymentData(null);
        }}
        data={changePaymentData}
        onConfirmChangePayment={handleConfirmChangePayment}
        isLoading={changePaymentMutation.isPending}
      />

      {/* Printable Thermal Receipt Modal */}
      <PosReceiptModal
        show={showReceiptModal}
        receiptData={receiptData}
        onClose={() => {
          setShowReceiptModal(false);
          handleNewOrder();
        }}
        onNewOrder={handleNewOrder}
      />

      {/* POS History & QRIS Sync Modal */}
      <PosHistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        orders={posOrdersHistory}
        pagination={posHistoryPagination}
        page={historyPage}
        onPageChange={setHistoryPage}
        filterTab={historyTab}
        onFilterTabChange={(tab) => {
          setHistoryTab(tab);
          setHistoryPage(1);
        }}
        searchQuery={historySearch}
        onSearchChange={(q) => {
          setHistorySearch(q);
          setHistoryPage(1);
        }}
        isLoading={isLoadingHistory}
        onRefresh={refetchHistory}
        onShowQris={(order) => {
          setActiveQrisOrderId(order.id);
          setQrisModalData({
            orderId: order.id,
            orderFor: order.orderBy || order.orderFor || "Walk-in Guest",
            orderType: order.orderType || "DINE_IN",
            tableName: order.tableId ? `${order.tableId}` : undefined,
            totalPrice: order.totalPrice,
            qrString: order.qrString,
            qrUrl: order.qrUrl,
          });
          setShowHistoryModal(false);
          setShowQrisModal(true);
        }}
        onChangePaymentMethod={(order) => {
          setChangePaymentData({
            orderId: order.id,
            orderFor: order.orderBy || order.orderFor || "Walk-in Guest",
            orderType: order.orderType || "DINE_IN",
            tableName: order.tableId ? `${order.tableId}` : undefined,
            totalPrice: order.totalPrice,
          });
          setShowHistoryModal(false);
          setShowChangePaymentModal(true);
        }}
        onSyncQris={async (orderId) => {
          setSyncingHistoryId(orderId);
          try {
            await syncQrisMutation.mutateAsync(orderId);
          } finally {
            setSyncingHistoryId(null);
          }
        }}
        isSyncingId={syncingHistoryId}
        onViewReceipt={(receipt) => {
          setReceiptData(receipt);
          setShowHistoryModal(false);
          setShowReceiptModal(true);
        }}
      />
    </div>
  );
};

export default PosTerminalPage;
