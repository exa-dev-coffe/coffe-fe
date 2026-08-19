import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWalletBalanceQuery,
  useTopUpWalletMutation,
  useWalletHistoryDetailQuery,
  useSyncTopUpMutation,
} from "@/features/wallet/hooks/useWallet.ts";
import useSSE from "@/core/hooks/useSSE.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import env from "@/core/config/env.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type { TopUpResponse } from "@/features/wallet/types/wallet.types.ts";
import {
  HiOutlineCreditCard,
  HiOutlineQrcode,
  HiOutlineDuplicate,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineExternalLink,
  HiOutlineInformationCircle,
  HiOutlineDownload,
} from "react-icons/hi";
import { SiShopee } from "react-icons/si";

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000, 1000000];

interface BankOption {
  id: string;
  name: string;
  code: string;
  description: string;
}

const VA_BANKS: BankOption[] = [
  {
    id: "bca",
    name: "BCA Virtual Account",
    code: "BCA",
    description: "BCA Mobile, myBCA, KlikBCA, ATM BCA",
  },
  {
    id: "mandiri",
    name: "Mandiri Bill Payment",
    code: "MANDIRI",
    description: "Livin by Mandiri, ATM Mandiri",
  },
  {
    id: "bni",
    name: "BNI Virtual Account",
    code: "BNI",
    description: "BNI Mobile Banking, ATM BNI",
  },
  {
    id: "bri",
    name: "BRI Virtual Account (BRIVA)",
    code: "BRI",
    description: "BRImo, ATM BRI, Agen BRILink",
  },
  {
    id: "permata",
    name: "Permata Virtual Account",
    code: "PERMATA",
    description: "PermataMobile X, ATM Permata",
  },
  {
    id: "cimb",
    name: "CIMB Niaga VA",
    code: "CIMB",
    description: "OCTO Mobile, OCTO Clicks, ATM CIMB",
  },
];

export const TopUpWalletPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { successNotificationClient, errorNotificationClient } =
    useNotificationContext();

  const historyIdParam = searchParams.get("id");

  // Balance query
  const { data: balanceData } = useWalletBalanceQuery();
  const currentBalance = balanceData?.balance || 0;

  // History detail query if id is in query params
  const { data: historyDetail } = useWalletHistoryDetailQuery(
    historyIdParam || undefined,
  );

  const { mutateAsync: topUpMutation, isPending: isSubmitting } =
    useTopUpWalletMutation();

  const { mutate: syncTopUp, isPending: isSyncing } = useSyncTopUpMutation();

  // Selection form state
  const [amount, setAmount] = useState<number>(50000);
  const [customInput, setCustomInput] = useState<string>("50.000");
  const [paymentType, setPaymentType] = useState<
    "qris" | "bank_transfer" | "gopay" | "shopeepay"
  >("qris");
  const [selectedBank, setSelectedBank] = useState<string>("bca");

  // Active Payment Details state (State 2)
  const [activePayment, setActivePayment] = useState<TopUpResponse | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTabGuide, setActiveTabGuide] = useState<
    "mbanking" | "atm" | "ibanking"
  >("mbanking");
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<string>("");

  // If search param id is loaded and has details, set active payment
  useEffect(() => {
    if (historyDetail && historyIdParam) {
      setActivePayment({
        balanceHistoryId: historyDetail.id,
        amount: historyDetail.amount,
        paymentType: historyDetail.paymentType || "qris",
        transactionStatus: historyDetail.status || "PENDING",
        bank: historyDetail.bank,
        vaNumber: historyDetail.vaNumber,
        billKey: historyDetail.billKey,
        billerCode: historyDetail.billerCode,
        qrUrl: historyDetail.qrUrl,
        qrString: historyDetail.qrString,
        deeplinkUrl: historyDetail.deeplinkUrl,
        expiryTime: historyDetail.expiryTime,
      });
    }
  }, [historyDetail, historyIdParam]);

  // Setup real-time SSE listener for balance updates
  useSSE<{ balanceHistoryId: string; status: string; amount?: number }>({
    baseUrl: `${env.API_URL}${ENDPOINTS.EVENTS}?type=update_history_balance`,
    onMessage: (dataSSE) => {
      const activeId = activePayment?.balanceHistoryId || historyIdParam;
      if (activeId && dataSSE.balanceHistoryId === activeId) {
        if (dataSSE.status?.toUpperCase() === "COMPLETED") {
          setActivePayment((prev) =>
            prev ? { ...prev, transactionStatus: "COMPLETED" } : null,
          );
          queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
          queryClient.invalidateQueries({ queryKey: ["walletHistory"] });
          successNotificationClient(
            "Payment successful! Your balance has been updated.",
          );
        } else if (
          dataSSE.status?.toUpperCase() === "FAILED" ||
          dataSSE.status?.toUpperCase() === "EXPIRE"
        ) {
          setActivePayment((prev) =>
            prev ? { ...prev, transactionStatus: "FAILED" } : null,
          );
          errorNotificationClient("Payment expired or failed.");
        }
      }
    },
    autoConnect: true,
  });

  // Calculate remaining time
  useEffect(() => {
    if (
      !activePayment?.expiryTime ||
      activePayment.transactionStatus?.toUpperCase() === "COMPLETED"
    ) {
      return;
    }

    const interval = setInterval(() => {
      const expiry = new Date(activePayment.expiryTime!).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00 (Expired)");
        clearInterval(interval);
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activePayment?.expiryTime, activePayment?.transactionStatus]);

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput(new Intl.NumberFormat("id-ID").format(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setCustomInput("");
      setAmount(0);
      return;
    }
    setCustomInput(new Intl.NumberFormat("id-ID").format(Number(val)));
    setAmount(Number(val));
  };

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      errorNotificationClient("Minimum top up amount is Rp 10.000");
      return;
    }

    try {
      const response = await topUpMutation({
        amount,
        paymentType,
        bank: paymentType === "bank_transfer" ? selectedBank : undefined,
      });

      setActivePayment(response);
      setSearchParams({ id: response.balanceHistoryId });
      successNotificationClient(
        "Payment charge created! Please complete payment.",
      );
    } catch {
      // Error handled by mutation
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    successNotificationClient(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadReceipt = (payment: TopUpResponse) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedAmount = formatCurrency(payment.amount);
    const formattedDate = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const htmlContent = `
      <html>
        <head>
          <title>Receipt-${payment.balanceHistoryId || "topup"}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 320px;
              margin: 30px auto;
              color: #000;
              padding: 15px;
              border: 1px dashed #ccc;
            }
            .text-center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .title {
              font-size: 18px;
              margin: 12px 0 4px 0;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 11px;
              margin-bottom: 15px;
              color: #444;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 12px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 6px;
            }
            .total-row {
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
              font-size: 11px;
              text-align: center;
              line-height: 1.4;
            }
            @media print {
              body {
                margin: 0 auto;
                border: none;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size: 26px; letter-spacing: 2px; color: #d97706;">COFFE</div>
            <div class="title">TOP-UP RECEIPT</div>
            <div class="subtitle">Digital Member Wallet</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Date:</span>
            <span>${formattedDate}</span>
          </div>
          <div class="row">
            <span>Ref ID:</span>
            <span style="font-size: 10px; font-family: monospace;">${payment.balanceHistoryId || "-"}</span>
          </div>
          <div class="row">
            <span>Customer:</span>
            <span>${payment.userName || "Member"}</span>
          </div>
          <div class="row">
            <span>Email:</span>
            <span style="font-size: 10px; font-family: monospace;">${payment.userEmail || "-"}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Top-Up Amount</span>
            <span>${formattedAmount}</span>
          </div>
          <div class="row">
            <span>Admin Fee</span>
            <span>Rp 0</span>
          </div>
          <div class="row">
            <span>Payment Method</span>
            <span>${(payment.paymentType || "Core API").toUpperCase()} ${(payment.bank || "").toUpperCase()}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row total-row">
            <span>TOTAL CREDITED</span>
            <span>${formattedAmount}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <div class="bold" style="color: #10b981; font-size: 13px; margin-bottom: 8px;">STATUS: SUCCESSFUL</div>
            <p style="margin: 0;">Thank you for your top up!</p>
            <p style="margin: 3px 0 0 0;">Enjoy your freshly brewed coffee at Coffe Shop.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isCompleted =
    activePayment?.transactionStatus?.toUpperCase() === "COMPLETED";
  const isFailed =
    activePayment?.transactionStatus?.toUpperCase() === "FAILED" ||
    activePayment?.transactionStatus?.toUpperCase() === "EXPIRE";

  return (
    <div className="py-10 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        <PageHeader
          title={
            activePayment ? "Payment Instructions" : "Top Up Digital Wallet"
          }
          subtitle={
            activePayment
              ? "Follow the instructions below to complete your top-up payment."
              : "Select your desired amount and preferred payment method to top up seamlessly."
          }
          breadcrumb={[
            { label: "Home", to: "/" },
            { label: "My Wallet", to: "/my-wallet" },
            { label: activePayment ? "Payment" : "Top Up" },
          ]}
        />

        {/* ======================= STATE 1: SELECTION VIEW ======================= */}
        {!activePayment && (
          <form
            onSubmit={handleProceedPayment}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            {/* Left 2 Cols: Form Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Choose Amount */}
              <Card variant="dashboard" className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Choose Top-Up Amount
                    </h3>
                    <p className="text-xs text-slate-400">
                      Select a fast preset or enter your custom amount (Min. Rp
                      10.000)
                    </p>
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((val) => {
                    const isSelected = amount === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectPreset(val)}
                        className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer border ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/25 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-500/50"
                        }`}
                      >
                        {formatCurrency(val)}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Or Enter Custom Amount (IDR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customInput}
                      onChange={handleCustomChange}
                      placeholder="50.000"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-white font-black text-lg"
                      required
                    />
                  </div>
                  {amount < 10000 && (
                    <p className="text-xs text-rose-500 font-medium">
                      Minimum top up amount is Rp 10.000
                    </p>
                  )}
                </div>
              </Card>

              {/* Step 2: Payment Method */}
              <Card variant="dashboard" className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Select Payment Method (Core API)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Direct in-app checkout without popup redirects
                    </p>
                  </div>
                </div>

                {/* Payment Categories */}
                <div className="space-y-3">
                  {/* Category 1: QRIS */}
                  <div
                    onClick={() => setPaymentType("qris")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      paymentType === "qris"
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-amber-500/20">
                        <HiOutlineQrcode />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            QRIS (All E-Wallets & Mobile Banking)
                          </h4>
                          <Badge variant="success" size="sm">
                            Instant
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          GoPay, BCA Mobile, OVO, DANA, ShopeePay, Livin', and
                          all QRIS apps.
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === "qris"}
                      onChange={() => setPaymentType("qris")}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Category 2: Bank Transfer (Virtual Account) */}
                  <div
                    className={`p-4 rounded-2xl border transition-all space-y-4 ${
                      paymentType === "bank_transfer"
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500/30"
                    }`}
                  >
                    <div
                      onClick={() => setPaymentType("bank_transfer")}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-indigo-600/20">
                          <HiOutlineCreditCard />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              Virtual Account (Bank Transfer)
                            </h4>
                            <Badge variant="neutral" size="sm">
                              Automatic
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            BCA, Mandiri Bill, BNI, BRI, Permata, CIMB Niaga
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentType === "bank_transfer"}
                        onChange={() => setPaymentType("bank_transfer")}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Sub-options for VA */}
                    {paymentType === "bank_transfer" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        {VA_BANKS.map((bank) => (
                          <div
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              selectedBank === bank.id
                                ? "bg-white dark:bg-slate-800 border-amber-500 shadow-sm"
                                : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 border">
                                {bank.code.substring(0, 3)}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                                  {bank.name}
                                </span>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="bank"
                              checked={selectedBank === bank.id}
                              onChange={() => setSelectedBank(bank.id)}
                              className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category 3: GoPay Direct */}
                  <div
                    onClick={() => setPaymentType("gopay")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      paymentType === "gopay"
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md shadow-emerald-600/20">
                        G
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            GoPay (Direct App / QR)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pay directly with GoPay app deeplink or scan QR.
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === "gopay"}
                      onChange={() => setPaymentType("gopay")}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Category 4: ShopeePay Direct */}
                  <div
                    onClick={() => setPaymentType("shopeepay")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      paymentType === "shopeepay"
                        ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-orange-500/20">
                        <SiShopee />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            ShopeePay (Direct App / QR)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pay with Shopee app deeplink or QR code.
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === "shopeepay"}
                      onChange={() => setPaymentType("shopeepay")}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right 1 Col: Summary Card */}
            <div className="space-y-6">
              <Card variant="dashboard" className="p-6 space-y-6 sticky top-24">
                <h3 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
                  Top-Up Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Current Wallet Balance</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(currentBalance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Top-Up Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Payment Method</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">
                      {paymentType === "bank_transfer"
                        ? `${selectedBank} VA`
                        : paymentType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Admin / Service Fee</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      FREE (Rp 0)
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Total Payment
                    </span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    New balance after top-up:{" "}
                    <strong className="font-black">
                      {formatCurrency(currentBalance + amount)}
                    </strong>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  disabled={amount < 10000 || isSubmitting}
                >
                  Proceed to Payment
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                  <HiOutlineInformationCircle />
                  <span>Powered by Midtrans Core API Direct Gateway</span>
                </div>
              </Card>
            </div>
          </form>
        )}

        {/* ======================= STATE 2: PAYMENT INSTRUCTION VIEW ======================= */}
        {activePayment && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* SUCCESS COMPLETED STATE */}
            {isCompleted ? (
              <Card
                variant="dashboard"
                className="p-8 sm:p-10 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20 animate-bounce">
                  <HiOutlineCheckCircle />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Payment Successful!
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Your balance of{" "}
                    <strong className="text-emerald-600 font-bold">
                      {formatCurrency(activePayment.amount)}
                    </strong>{" "}
                    has been credited to your Digital Wallet.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {activePayment.balanceHistoryId?.substring(0, 13)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <Badge variant="success" size="sm">
                      COMPLETED
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<HiOutlineDownload />}
                    onClick={() => handleDownloadReceipt(activePayment!)}
                  >
                    Download Receipt
                  </Button>
                  <Link to="/my-wallet">
                    <Button variant="secondary" size="lg">
                      View My Wallet
                    </Button>
                  </Link>
                  <Link to="/menu">
                    <Button variant="secondary" size="lg">
                      Order Coffee
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : isFailed ? (
              /* FAILED / EXPIRED STATE */
              <Card
                variant="dashboard"
                className="p-8 sm:p-10 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-4xl">
                  <HiOutlineClock />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Payment Expired or Cancelled
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    This payment request has expired. Please initiate a new
                    top-up.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setActivePayment(null);
                    setSearchParams({});
                  }}
                >
                  Create New Top-Up
                </Button>
              </Card>
            ) : (
              /* PENDING PAYMENT INSTRUCTIONS */
              <div className="space-y-6">
                {/* Header Timer Bar */}
                <Card
                  variant="glass"
                  className="p-5 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/10 border-amber-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 animate-pulse">
                      <HiOutlineClock />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                        Waiting For Payment
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Please complete payment before timeout
                      </p>
                    </div>
                  </div>

                  {timeLeft && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Time Remaining
                      </span>
                      <span className="text-sm sm:text-base font-black font-mono text-amber-600 dark:text-amber-400">
                        {timeLeft}
                      </span>
                    </div>
                  )}
                </Card>

                {/* Main Instruction Card */}
                <Card variant="dashboard" className="p-6 sm:p-8 space-y-6">
                  {/* Amount to pay */}
                  <div className="text-center space-y-1 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Total Amount to Pay
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                        {formatCurrency(activePayment.amount)}
                      </h2>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            String(activePayment.amount),
                            "Amount",
                          )
                        }
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Copy Amount"
                      >
                        <HiOutlineDuplicate className="text-lg" />
                      </button>
                    </div>
                    {copiedField === "Amount" && (
                      <span className="text-xs text-emerald-500 font-bold block animate-fade-in">
                        Amount Copied!
                      </span>
                    )}
                  </div>

                  {/* PAYMENT TYPE VIEW: QRIS */}
                  {activePayment.paymentType?.toLowerCase() === "qris" && (
                    <div className="text-center space-y-5">
                      <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-[280px] mx-auto">
                        {activePayment.qrUrl ? (
                          <img
                            src={activePayment.qrUrl}
                            alt="QRIS Code"
                            className="w-56 h-56 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <HiOutlineQrcode className="text-4xl" />
                            <span className="text-xs">QR Code generated</span>
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase block">
                            QRIS STANDAR PEMBAYARAN NASIONAL
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto text-xs text-amber-900 dark:text-amber-300">
                        Scan this QR with{" "}
                        <strong>
                          BCA Mobile, Livin by Mandiri, GoPay, OVO, DANA,
                          ShopeePay
                        </strong>
                        , or any banking app.
                      </div>
                    </div>
                  )}

                  {/* PAYMENT TYPE VIEW: VIRTUAL ACCOUNT */}
                  {(activePayment.paymentType?.toLowerCase() ===
                    "bank_transfer" ||
                    activePayment.paymentType?.toLowerCase() === "echannel" ||
                    activePayment.vaNumber ||
                    activePayment.billKey) && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {activePayment.bank
                              ? `${activePayment.bank.toUpperCase()} Virtual Account`
                              : "Virtual Account"}
                          </span>
                          <Badge variant="neutral" size="sm">
                            {activePayment.bank?.toUpperCase() || "VA"}
                          </Badge>
                        </div>

                        {/* Mandiri Bill Payment Details */}
                        {activePayment.billKey && activePayment.billerCode ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                  Company / Biller Code
                                </span>
                                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                                  {activePayment.billerCode}
                                </span>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    activePayment.billerCode!,
                                    "Biller Code",
                                  )
                                }
                              >
                                {copiedField === "Biller Code"
                                  ? "Copied!"
                                  : "Copy"}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                  Bill Key / Payment Code
                                </span>
                                <span className="text-base sm:text-lg font-mono font-black text-amber-600 dark:text-amber-400">
                                  {activePayment.billKey}
                                </span>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    activePayment.billKey!,
                                    "Bill Key",
                                  )
                                }
                              >
                                {copiedField === "Bill Key"
                                  ? "Copied!"
                                  : "Copy"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Bank VA Number */
                          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Virtual Account Number
                              </span>
                              <span className="text-lg sm:text-xl font-mono font-black tracking-wider text-slate-900 dark:text-white">
                                {activePayment.vaNumber || "Generating..."}
                              </span>
                            </div>
                            {activePayment.vaNumber && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    activePayment.vaNumber!,
                                    "VA Number",
                                  )
                                }
                                leftIcon={<HiOutlineDuplicate />}
                              >
                                {copiedField === "VA Number"
                                  ? "Copied!"
                                  : "Copy"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PAYMENT TYPE VIEW: GOPAY / SHOPEEPAY */}
                  {(activePayment.paymentType?.toLowerCase() === "gopay" ||
                    activePayment.paymentType?.toLowerCase() ===
                      "shopeepay") && (
                    <div className="text-center space-y-5">
                      {activePayment.qrUrl && (
                        <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-[280px] mx-auto">
                          <img
                            src={activePayment.qrUrl}
                            alt="Payment QR"
                            className="w-56 h-56 object-contain mx-auto"
                          />
                        </div>
                      )}

                      {activePayment.deeplinkUrl && (
                        <div>
                          <a
                            href={activePayment.deeplinkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <Button
                              variant="primary"
                              size="lg"
                              rightIcon={<HiOutlineExternalLink />}
                              className="font-bold shadow-lg"
                            >
                              Open in {activePayment.paymentType?.toUpperCase()}{" "}
                              App
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible Payment Guide */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <span>How to Pay</span>
                      {showInstructions ? (
                        <HiOutlineChevronUp />
                      ) : (
                        <HiOutlineChevronDown />
                      )}
                    </button>

                    {showInstructions && (
                      <div className="space-y-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
                        {activePayment.paymentType?.toLowerCase() === "qris" ? (
                          <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                            <li>
                              Open your banking app or e-wallet (GoPay, BCA
                              Mobile, Livin, Dana, OVO, etc.).
                            </li>
                            <li>
                              Tap the <strong>Scan QR / QRIS</strong> menu
                              button.
                            </li>
                            <li>
                              Point your camera at the QR code shown above.
                            </li>
                            <li>
                              Verify that the merchant name is{" "}
                              <strong>Coffe / Midtrans</strong> and the amount
                              matches.
                            </li>
                            <li>Enter your PIN to confirm the payment.</li>
                            <li>
                              Your balance will automatically update within
                              seconds!
                            </li>
                          </ol>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                              <button
                                type="button"
                                onClick={() => setActiveTabGuide("mbanking")}
                                className={`pb-1 px-2 font-bold text-xs border-b-2 transition-colors ${
                                  activeTabGuide === "mbanking"
                                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                    : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Mobile Banking
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTabGuide("atm")}
                                className={`pb-1 px-2 font-bold text-xs border-b-2 transition-colors ${
                                  activeTabGuide === "atm"
                                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                    : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                ATM
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTabGuide("ibanking")}
                                className={`pb-1 px-2 font-bold text-xs border-b-2 transition-colors ${
                                  activeTabGuide === "ibanking"
                                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                    : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Internet Banking
                              </button>
                            </div>

                            {activeTabGuide === "mbanking" && (
                              <ol className="list-decimal list-inside space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                                <li>
                                  Log in to your Mobile Banking application.
                                </li>
                                <li>
                                  Select{" "}
                                  <strong>Transfer &gt; Virtual Account</strong>{" "}
                                  (or <strong>Bayar &gt; Multipayment</strong>{" "}
                                  for Mandiri).
                                </li>
                                <li>
                                  Paste or input the Virtual Account number
                                  copied above.
                                </li>
                                <li>Verify the transfer details and amount.</li>
                                <li>
                                  Enter your transaction PIN to authorize
                                  payment.
                                </li>
                              </ol>
                            )}

                            {activeTabGuide === "atm" && (
                              <ol className="list-decimal list-inside space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                                <li>
                                  Insert your ATM Card and enter your PIN.
                                </li>
                                <li>
                                  Select{" "}
                                  <strong>
                                    Transaksi Lainnya &gt; Transfer &gt; Ke Rek
                                    Virtual Account
                                  </strong>
                                  .
                                </li>
                                <li>Enter the Virtual Account number.</li>
                                <li>
                                  Confirm the payment amount and finish
                                  transaction.
                                </li>
                              </ol>
                            )}

                            {activeTabGuide === "ibanking" && (
                              <ol className="list-decimal list-inside space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                                <li>Log in to your Internet Banking portal.</li>
                                <li>
                                  Select{" "}
                                  <strong>
                                    Transfer / Pembayaran &gt; Virtual Account
                                  </strong>
                                  .
                                </li>
                                <li>Enter the VA number and submit.</li>
                                <li>Authorize using your Token / Key.</li>
                              </ol>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        activePayment.balanceHistoryId &&
                        syncTopUp(activePayment.balanceHistoryId)
                      }
                      loading={isSyncing}
                    >
                      Check Status
                    </Button>
                    <Link to="/my-wallet" className="w-full sm:w-auto ml-auto">
                      <Button variant="primary" size="md" className="w-full">
                        Back to My Wallet
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUpWalletPage;
