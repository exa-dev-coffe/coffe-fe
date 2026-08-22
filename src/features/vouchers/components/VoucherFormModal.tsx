import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Input from "@/components/ui/Input.tsx";
import {
  formatCurrency,
  formatDateTimeWIB,
  toDateTimeLocalString,
} from "@/core/utils/formatters.ts";
import {
  HiOutlineTicket,
  HiOutlineSparkles,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineUserGroup,
} from "react-icons/hi";
import type { VoucherFormData } from "../types/voucher.types.ts";

interface VoucherFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherFormData) => Promise<void>;
  loading?: boolean;
  errors?: Record<string, string>;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  loading = false,
  errors = {},
}) => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [quota, setQuota] = useState<number>(-1);
  const [isUnlimitedQuota, setIsUnlimitedQuota] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [expiredAt, setExpiredAt] = useState<string>("");

  // Input state strings for formatted values
  const [discountValueInput, setDiscountValueInput] = useState("");
  const [maxDiscountInput, setMaxDiscountInput] = useState("");
  const [minPurchaseInput, setMinPurchaseInput] = useState("");

  const formatInputNumber = (val: string) => {
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
  };

  const getRawNumber = (val: string) => {
    return Number(val.replace(/\D/g, "")) || 0;
  };

  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue(0);
      setMaxDiscount(0);
      setMinPurchase(0);
      setQuota(-1);
      setIsUnlimitedQuota(true);
      setIsPublic(true);
      setLocalError(null);
      
      // Default expiry date: +7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setExpiredAt(toDateTimeLocalString(defaultDate));

      setDiscountValueInput("");
      setMaxDiscountInput("");
      setMinPurchaseInput("");
    }
  }, [show]);

  // Handle preset duration addition (+X days)
  const applyDatePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiredAt(toDateTimeLocalString(d));
  };

  // Random voucher code generator
  const generateRandomCode = () => {
    const prefixes = ["COFFEE", "HEMAT", "PROMO", "CHILL", "BOOST", "WARUNG"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      setLocalError("Persentase diskon tidak boleh lebih dari 100%");
      return;
    }
    setLocalError(null);

    const isoExpiredAt = expiredAt ? new Date(expiredAt).toISOString() : "";
    await onSubmit({
      code,
      discountType,
      discountValue,
      maxDiscount: discountType === "PERCENTAGE" ? maxDiscount : 0,
      minPurchase,
      quota: isUnlimitedQuota ? -1 : quota,
      isPublic,
      expiredAt: isoExpiredAt,
    });
  };

  return (
    <Modal show={show} handleClose={onClose} size="xl" title="Buat Kode Voucher Baru">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Form Inputs (7 cols) */}
        <form onSubmit={handleSubmitForm} className="lg:col-span-7 space-y-5">
          {/* Section 1: Kode & Tipe Voucher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Informasi Kode Voucher
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline cursor-pointer"
              >
                <HiOutlineRefresh className="w-3.5 h-3.5" />
                Acak Kode
              </button>
            </div>

            <div>
              <Input
                label="Kode Voucher (Kapital)"
                placeholder="misal: KOPIHEMAT, CHILL20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                error={errors.code}
                required
              />
            </div>

            {/* Selection Card: Public vs Secret */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Visibilitas Kupon
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isPublic
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <HiOutlineEye className={`w-5 h-5 mt-0.5 ${isPublic ? "text-amber-500" : "text-slate-400"}`} />
                  <div>
                    <div className="text-xs font-bold">Publik (Katalog)</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Muncul di daftar promo pelanggan
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    !isPublic
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <HiOutlineEyeOff className={`w-5 h-5 mt-0.5 ${!isPublic ? "text-amber-500" : "text-slate-400"}`} />
                  <div>
                    <div className="text-xs font-bold">Khusus Input Kode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Sembunyi, butuh ketik kode manual
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2: Skema Diskon & Syarat */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Skema & Syarat Potongan
            </label>

            {/* Radio Card Selector: Percentage vs Fixed */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDiscountType("PERCENTAGE");
                  setDiscountValue(0);
                  setDiscountValueInput("");
                  setLocalError(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-black">% Persentase</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Potongan berdasarkan %</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountType("FIXED");
                  setDiscountValue(0);
                  setDiscountValueInput("");
                  setLocalError(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  discountType === "FIXED"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-black">Rp Nominal Flat</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Potongan angka pasti</div>
              </button>
            </div>

            {/* Value Input + Quick Presets */}
            <div>
              <Input
                label={discountType === "PERCENTAGE" ? "Nilai Diskon (%)" : "Nilai Potongan (Rp)"}
                type={discountType === "PERCENTAGE" ? "number" : "text"}
                placeholder={discountType === "PERCENTAGE" ? "misal: 20 (maks. 100)" : "misal: 10.000"}
                value={discountType === "PERCENTAGE" ? discountValue || "" : discountValueInput}
                min={discountType === "PERCENTAGE" ? 1 : undefined}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                onChange={(e) => {
                  if (discountType === "PERCENTAGE") {
                    const val = Number(e.target.value);
                    setDiscountValue(val);
                    if (val > 100) {
                      setLocalError("Persentase diskon tidak boleh lebih dari 100%");
                    } else {
                      setLocalError(null);
                    }
                  } else {
                    setLocalError(null);
                    const formatted = formatInputNumber(e.target.value);
                    setDiscountValueInput(formatted);
                    setDiscountValue(getRawNumber(formatted));
                  }
                }}
                error={localError || errors.discountValue}
                required
              />

              {/* Presets chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                {discountType === "PERCENTAGE" ? (
                  [10, 15, 20, 25, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setDiscountValue(val);
                        setLocalError(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {val}%
                    </button>
                  ))
                ) : (
                  [5000, 10000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const formatted = new Intl.NumberFormat("id-ID").format(val);
                        setDiscountValueInput(formatted);
                        setDiscountValue(val);
                        setLocalError(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Rp {val / 1000}k
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {discountType === "PERCENTAGE" && (
                <Input
                  label="Batas Maks. Diskon (Rp) - 0 = Tanpa Batas"
                  type="text"
                  placeholder="misal: 15.000"
                  value={maxDiscountInput}
                  onChange={(e) => {
                    const formatted = formatInputNumber(e.target.value);
                    setMaxDiscountInput(formatted);
                    setMaxDiscount(getRawNumber(formatted));
                  }}
                  error={errors.maxDiscount}
                />
              )}

              <Input
                label="Min. Pembelian (Rp) - 0 = Tanpa Min."
                type="text"
                placeholder="misal: 30.000"
                value={minPurchaseInput}
                onChange={(e) => {
                  const formatted = formatInputNumber(e.target.value);
                  setMinPurchaseInput(formatted);
                  setMinPurchase(getRawNumber(formatted));
                }}
                error={errors.minPurchase}
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3: Kuota & Tanggal Kedaluwarsa */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Batasan Kuota & Durasi
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quota */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Batas Penggunaan Kuota
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="unlimitedQuota"
                    checked={isUnlimitedQuota}
                    onChange={(e) => {
                      setIsUnlimitedQuota(e.target.checked);
                      if (e.target.checked) setQuota(-1);
                      else setQuota(100);
                    }}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="unlimitedQuota" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Tanpa Batas (Unlimited)
                  </label>
                </div>
                {!isUnlimitedQuota && (
                  <Input
                    type="number"
                    placeholder="misal: 100"
                    value={quota === -1 ? "" : quota}
                    onChange={(e) => setQuota(Number(e.target.value))}
                    error={errors.quota}
                  />
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <Input
                  label="Tanggal & Jam Kedaluwarsa (WIB)"
                  type="datetime-local"
                  value={expiredAt}
                  onChange={(e) => setExpiredAt(e.target.value)}
                  error={errors.expiredAt}
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Durasi:</span>
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => applyDatePreset(days)}
                      className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold transition-colors cursor-pointer"
                    >
                      +{days} Hari
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={loading} leftIcon={<HiOutlineSparkles />}>
              Simpan Voucher
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Ticket Visual Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineTicket className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Ticket Preview
              </span>
            </div>

            {/* Ticket Card Container */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-xl shadow-amber-500/10 text-white">
              <div className="bg-slate-900 rounded-[22px] p-5 relative overflow-hidden">
                {/* Background decorative shine */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Voucher Header */}
                <div className="flex items-center justify-between gap-2 border-b border-dashed border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                      ☕
                    </span>
                    <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                      COFFE VOUCHER
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isPublic
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {isPublic ? "Publik" : "Kode Rahasia"}
                  </span>
                </div>

                {/* Voucher Main Content */}
                <div className="py-4 space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">KODE KUPON</div>
                  <div className="text-xl font-black tracking-widest text-amber-400 font-mono bg-amber-500/10 px-3 py-1.5 rounded-xl inline-block border border-amber-500/20">
                    {code || "KODE_VOUCHER"}
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-black text-white">
                      {discountType === "PERCENTAGE" ? (
                        <span>
                          {discountValue || 0}% <span className="text-sm font-medium text-amber-400">OFF</span>
                        </span>
                      ) : (
                        <span>
                          {discountValue ? formatCurrency(discountValue) : "Rp 0"}{" "}
                          <span className="text-sm font-medium text-emerald-400">OFF</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ticket Stub Notch Divider */}
                <div className="relative py-2">
                  <div className="border-t border-dashed border-slate-700 w-full" />
                  <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-slate-950 rounded-full" />
                  <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-slate-950 rounded-full" />
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <HiOutlineShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {minPurchase > 0 ? `Min. belanja ${formatCurrency(minPurchase)}` : "Tanpa minimal pembelian"}
                    </span>
                  </div>

                  {discountType === "PERCENTAGE" && (
                    <div className="flex items-center gap-1.5">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {maxDiscount > 0 ? `Maks. potongan ${formatCurrency(maxDiscount)}` : "Maksimal potongan tidak terbatas"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <HiOutlineUserGroup className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {isUnlimitedQuota ? "Kuota penggunaan tidak terbatas" : `Kuota terbatas: ${quota} transaksi`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 font-medium pt-1">
                    <HiOutlineClock className="w-3.5 h-3.5 text-rose-400" />
                    <span>
                      Berlaku s/d: {formatDateTimeWIB(expiredAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Human Summary Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold mb-1 flex items-center gap-1">
              <HiOutlineSparkles className="w-4 h-4 text-amber-500" />
              Ringkasan Aturan:
            </div>
            <p className="leading-relaxed opacity-90">
              Pelanggan mendapatkan potongan{" "}
              <strong>
                {discountType === "PERCENTAGE" ? `${discountValue}%` : formatCurrency(discountValue)}
              </strong>{" "}
              {minPurchase > 0 && `dengan belanja minimal ${formatCurrency(minPurchase)}`}.{" "}
              {discountType === "PERCENTAGE" && maxDiscount > 0 && `Maksimal diskon sebesar ${formatCurrency(maxDiscount)}.`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VoucherFormModal;
