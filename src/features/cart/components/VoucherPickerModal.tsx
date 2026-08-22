import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import { useVoucherQuery } from "@/features/vouchers/hooks/useVoucher.ts";
import type { VoucherItem } from "@/features/vouchers/types/voucher.types.ts";
import {
  HiOutlineTicket,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineRefresh,
} from "react-icons/hi";

export interface VoucherPickerModalProps {
  show: boolean;
  onClose: () => void;
  orderTotal: number;
  appliedVoucherCode?: string;
  onSelectVoucher: (voucherCode: string) => void;
  onRemoveVoucher: () => void;
}

export const VoucherPickerModal: React.FC<VoucherPickerModalProps> = ({
  show,
  onClose,
  orderTotal,
  appliedVoucherCode,
  onSelectVoucher,
  onRemoveVoucher,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [search, setSearch] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [accumulatedVouchers, setAccumulatedVouchers] = useState<VoucherItem[]>(
    [],
  );

  const {
    data: voucherResponse,
    isLoading,
    isFetching,
  } = useVoucherQuery(page, pageSize, search);

  const rawData = voucherResponse?.data || [];
  const totalPages = voucherResponse?.totalPages || 1;
  const totalData = voucherResponse?.totalData || 0;

  useEffect(() => {
    if (page === 1) {
      setAccumulatedVouchers(rawData);
    } else if (rawData.length > 0) {
      setAccumulatedVouchers((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        const newItems = rawData.filter(
          (v: VoucherItem) => !existingIds.has(v.id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [rawData, page]);

  useEffect(() => {
    if (show) {
      setPage(1);
    }
  }, [show, search]);

  const displayVouchers = page === 1 ? rawData : accumulatedVouchers;

  const handleApplyManual = () => {
    if (!manualCode.trim()) return;
    onSelectVoucher(manualCode.trim().toUpperCase());
    setManualCode("");
    onClose();
  };

  const handleSelect = (code: string) => {
    onSelectVoucher(code);
    onClose();
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      size="lg"
      title="Pilih Voucher Promo"
    >
      <div className="space-y-5 py-2">
        {/* Special Secret Voucher Input Bar */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-2">
          <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <HiOutlineTicket className="text-amber-500 text-base" />
            Punya Kode Voucher Khusus / Rahasia?
          </label>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Voucher khusus yang tidak tampil publik dapat digunakan dengan
            memasukkan kodenya di bawah ini.
          </p>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Ketik kode voucher khusus (misal: VIPCOFFEE)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring font-black tracking-wider uppercase"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={!manualCode.trim()}
              onClick={handleApplyManual}
            >
              Gunakan
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Cari voucher publik..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring font-medium"
          />
        </div>

        {/* Voucher Cards Grid */}
        <div className="space-y-3 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
          {isLoading && page === 1 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-24 rounded-2xl w-full" />
              ))}
            </div>
          ) : displayVouchers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <HiOutlineTicket className="text-4xl mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">
                {search
                  ? `Voucher '${search}' tidak ditemukan`
                  : "Tidak ada voucher publik aktif saat ini"}
              </p>
            </div>
          ) : (
            <>
              {displayVouchers.map((v: VoucherItem) => {
                const isApplied = appliedVoucherCode === v.code;
                const isMinMet = orderTotal >= v.minPurchase;
                const shortage = v.minPurchase - orderTotal;

                return (
                  <div
                    key={v.id}
                    className={`relative overflow-hidden p-4 rounded-2xl border transition-all ${
                      isApplied
                        ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                        : !v.isActive
                          ? "opacity-50 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                          : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40"
                    }`}
                  >
                    {/* Decorative Ticket Stub Cutouts */}
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800" />
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2 pr-2">
                      {/* Left Voucher Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider">
                            {v.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                              v.discountType === "PERCENTAGE"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {v.discountType === "PERCENTAGE"
                              ? `Diskon ${v.discountValue}%`
                              : `Potongan ${formatCurrency(v.discountValue)}`}
                          </span>
                          {isApplied && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg">
                              <HiOutlineCheck /> Terpasang
                            </span>
                          )}
                        </div>

                        {/* Terms & Conditions Details */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>
                              {v.minPurchase > 0
                                ? `• Min. Belanja: ${formatCurrency(v.minPurchase)}`
                                : "• Tanpa Minimal Belanja"}
                            </span>
                            {v.discountType === "PERCENTAGE" &&
                              v.maxDiscount > 0 && (
                                <span>
                                  • Maks: {formatCurrency(v.maxDiscount)}
                                </span>
                              )}
                          </div>
                          {v.expiredAt && (
                            <div className="text-[10px] text-slate-400">
                              Berlaku s/d: {formatDateTime(v.expiredAt)}
                            </div>
                          )}
                        </div>

                        {/* Minimum Purchase Shortage Warning */}
                        {!isMinMet && v.minPurchase > 0 && (
                          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                            <HiOutlineSparkles className="text-amber-500" />
                            Tambah belanja {formatCurrency(shortage)} lagi untuk
                            pakai voucher ini
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="w-full sm:w-auto flex justify-end shrink-0">
                        {isApplied ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              onRemoveVoucher();
                              onClose();
                            }}
                          >
                            Hapus
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!isMinMet || !v.isActive}
                            onClick={() => handleSelect(v.code)}
                          >
                            {isMinMet ? "Pakai" : "Belum Cukup"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {page < totalPages && (
                <div className="pt-2 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    leftIcon={<HiOutlineRefresh />}
                    className="w-full font-bold"
                  >
                    Muat Lebih Banyak Voucher ({displayVouchers.length} dari{" "}
                    {totalData})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VoucherPickerModal;
