import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Input from "@/components/ui/Input.tsx";
import Dropdown from "@/components/ui/Dropdown.tsx";
import {
  formatCurrency,
  formatDateTimeWIB,
  toDateTimeLocalString,
} from "@/core/utils/formatters.ts";
import {
  HiOutlineBadgeCheck,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineShoppingBag,
  HiOutlineFolder,
  HiOutlineGlobeAlt,
  HiOutlineClock,
} from "react-icons/hi";
import type { PromotionFormData, TargetType, DiscountType } from "../types/promotion.types.ts";

interface MenuItemOption {
  id: number;
  name: string;
  price: number;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface PromotionFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  loading?: boolean;
  errors?: Record<string, string>;
  menuOptions?: MenuItemOption[];
  categoryOptions?: CategoryOption[];
}

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  loading = false,
  errors = {},
  menuOptions = [],
  categoryOptions = [],
}) => {
  const [name, setName] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("PRODUCT");
  const [targetId, setTargetId] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");

  // Input states for formatted strings
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

  useEffect(() => {
    if (show) {
      setName("");
      setTargetType("PRODUCT");
      setTargetId(null);
      setDiscountType("PERCENTAGE");
      setDiscountValue(0);
      setMaxDiscount(0);
      setMinPurchase(0);
      setLocalError(null);

      const now = new Date();
      setStartAt(toDateTimeLocalString(now));

      const defaultEnd = new Date();
      defaultEnd.setDate(defaultEnd.getDate() + 7);
      setEndAt(toDateTimeLocalString(defaultEnd));

      setDiscountValueInput("");
      setMaxDiscountInput("");
      setMinPurchaseInput("");
    }
  }, [show]);

  const applyDurationPreset = (days: number) => {
    const startDate = startAt ? new Date(startAt) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    setEndAt(toDateTimeLocalString(endDate));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === "PRODUCT" && (!targetId || targetId <= 0)) {
      setLocalError("Silakan pilih menu spesifik untuk promo produk");
      return;
    }
    if (targetType === "CATEGORY" && (!targetId || targetId <= 0)) {
      setLocalError("Silakan pilih kategori target untuk promo kategori");
      return;
    }
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      setLocalError("Persentase diskon tidak boleh lebih dari 100%");
      return;
    }
    if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setLocalError("Tanggal & jam berakhir harus setelah tanggal mulai");
      return;
    }
    setLocalError(null);

    const isoStartAt = startAt ? new Date(startAt).toISOString() : "";
    const isoEndAt = endAt ? new Date(endAt).toISOString() : "";

    await onSubmit({
      name,
      targetType,
      targetId: targetType === "ALL" ? null : targetId,
      discountType,
      discountValue,
      maxDiscount: discountType === "PERCENTAGE" ? maxDiscount : 0,
      minPurchase,
      startAt: isoStartAt,
      endAt: isoEndAt,
    });
  };

  // Find selected product or category name for preview
  const selectedProduct = menuOptions.find((m) => m.id === targetId);
  const selectedCategory = categoryOptions.find((c) => c.id === targetId);

  // Preview Price Calculation
  const samplePrice = selectedProduct?.price || 30000;
  let calculatedDiscount = 0;
  if (discountType === "PERCENTAGE") {
    calculatedDiscount = (samplePrice * discountValue) / 100;
    if (maxDiscount > 0 && calculatedDiscount > maxDiscount) {
      calculatedDiscount = maxDiscount;
    }
  } else {
    calculatedDiscount = discountValue;
  }
  const finalPrice = Math.max(0, samplePrice - calculatedDiscount);

  return (
    <Modal show={show} handleClose={onClose} size="xl" title="Buat Kampanye Promosi Produk Baru">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Form Inputs (7 cols) */}
        <form onSubmit={handleSubmitForm} className="lg:col-span-7 space-y-5">
          {/* Section 1: Informasi Kampanye & Target */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Identitas Kampanye & Target Skop
            </label>

            <Input
              label="Nama Kampanye Promosi"
              placeholder="misal: Happy Hour 20% OFF, Flash Sale Espresso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            {/* Target Scope Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Skop Target Promosi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("PRODUCT");
                    setTargetId(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    targetType === "PRODUCT"
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <HiOutlineShoppingBag className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-xs">Produk Specific</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType("CATEGORY");
                    setTargetId(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    targetType === "CATEGORY"
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <HiOutlineFolder className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-xs">Kategori Menu</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetType("ALL");
                    setTargetId(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    targetType === "ALL"
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <HiOutlineGlobeAlt className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-xs">Semua Menu</div>
                </button>
              </div>
            </div>

            {/* Dynamic Target Selection */}
            {targetType === "PRODUCT" && (
              <div>
                <Dropdown
                  label="Pilih Menu Spesifik"
                  placeholder="-- Cari & Pilih Produk Target --"
                  options={menuOptions.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${formatCurrency(m.price)})`,
                  }))}
                  value={
                    selectedProduct
                      ? {
                          value: selectedProduct.id,
                          label: `${selectedProduct.name} (${formatCurrency(selectedProduct.price)})`,
                        }
                      : null
                  }
                  setValue={(opt) => setTargetId(opt ? opt.value : null)}
                  required
                />
              </div>
            )}

            {targetType === "CATEGORY" && (
              <div>
                <Dropdown
                  label="Pilih Kategori Target"
                  placeholder="-- Cari & Pilih Kategori Target --"
                  options={categoryOptions.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  value={
                    selectedCategory
                      ? {
                          value: selectedCategory.id,
                          label: selectedCategory.name,
                        }
                      : null
                  }
                  setValue={(opt) => setTargetId(opt ? opt.value : null)}
                  required
                />
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2: Skema Diskon & Batasan */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Skema & Besaran Diskon
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
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Potongan persen dari harga</div>
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
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Potongan nominal langsung</div>
              </button>
            </div>

            {/* Discount Value Input & Presets */}
            <div>
              <Input
                label={discountType === "PERCENTAGE" ? "Nilai Diskon (%)" : "Nilai Diskon (Rp)"}
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

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
                {discountType === "PERCENTAGE"
                  ? [10, 15, 20, 25, 50].map((val) => (
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
                  : [5000, 10000, 20000, 50000].map((val) => (
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
                    ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {discountType === "PERCENTAGE" && (
                <Input
                  label="Maks. Diskon (Rp) - 0 = Tanpa Limit"
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
                label="Min. Belanja (Rp) - 0 = Tanpa Min."
                type="text"
                placeholder="misal: 25.000"
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

          {/* Section 3: Jadwal Kampanye */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Jadwal Masa Aktif Kampanye
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tanggal & Jam Mulai (WIB)"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                error={errors.startAt}
                required
              />

              <div>
                <Input
                  label="Tanggal & Jam Berakhir (WIB)"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  error={errors.endAt}
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Durasi:</span>
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => applyDurationPreset(days)}
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
              Simpan Kampanye
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Promo Visual Banner Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineBadgeCheck className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Campaign Banner Preview
              </span>
            </div>

            {/* Campaign Card Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl text-white">
              {/* Top Tag Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {targetType === "PRODUCT"
                    ? "PROMO PRODUK"
                    : targetType === "CATEGORY"
                    ? "PROMO KATEGORI"
                    : "STOREWIDE PROMO"}
                </span>

                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>

              {/* Campaign Title & Target */}
              <div className="py-4 space-y-2">
                <h4 className="text-lg font-black text-white leading-tight">
                  {name || "NAMA KAMPANYE PROMO"}
                </h4>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <HiOutlineTag className="w-4 h-4 text-amber-400" />
                  <span>
                    Target:{" "}
                    <strong className="text-slate-200">
                      {targetType === "PRODUCT"
                        ? selectedProduct?.name || "Produk Target"
                        : targetType === "CATEGORY"
                        ? selectedCategory?.name || "Kategori Target"
                        : "Semua Menu Storewide"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Interactive Calculation Demo */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Simulasi Potongan Harga
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-400">
                    {formatCurrency(finalPrice)}
                  </span>
                  {samplePrice > finalPrice && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {formatCurrency(samplePrice)}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Hemat {formatCurrency(calculatedDiscount)}
                  </span>
                </div>
              </div>

              {/* Timeframe Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <HiOutlineClock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Mulai: {formatDateTimeWIB(startAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-300">
                  <HiOutlineClock className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    Berakhir: {formatDateTimeWIB(endAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Human Summary Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold mb-1 flex items-center gap-1">
              <HiOutlineSparkles className="w-4 h-4 text-amber-500" />
              Ringkasan Promo:
            </div>
            <p className="leading-relaxed opacity-90">
              Diskon{" "}
              <strong>
                {discountType === "PERCENTAGE" ? `${discountValue}%` : formatCurrency(discountValue)}
              </strong>{" "}
              berlaku untuk{" "}
              <strong>
                {targetType === "PRODUCT"
                  ? selectedProduct?.name || "produk pilihan"
                  : targetType === "CATEGORY"
                  ? `kategori ${selectedCategory?.name || ""}`
                  : "seluruh menu"}
              </strong>
              {minPurchase > 0 && ` (Min. transaksi ${formatCurrency(minPurchase)})`}.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromotionFormModal;
