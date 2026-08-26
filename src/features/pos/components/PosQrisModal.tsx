import React from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineQrcode,
  HiOutlineRefresh,
  HiOutlineSwitchHorizontal,
} from "react-icons/hi";

export interface PosQrisModalData {
  orderId: number;
  orderFor: string;
  orderType: string;
  tableName?: string;
  totalPrice: number;
  qrString?: string;
  qrUrl?: string;
}

interface PosQrisModalProps {
  show: boolean;
  onClose: () => void;
  data: PosQrisModalData | null;
  onManualSyncQris?: () => void;
  isSyncingQris?: boolean;
  onChangePaymentMethod?: () => void;
}

export const PosQrisModal: React.FC<PosQrisModalProps> = ({
  show,
  onClose,
  data,
  onManualSyncQris,
  isSyncingQris = false,
  onChangePaymentMethod,
}) => {
  if (!data) return null;

  return (
    <Modal
      show={show}
      handleClose={onClose}
      size="md"
      title={`Midtrans QRIS Payment — Order #POS-${data.orderId}`}
    >
      <div className="space-y-5 py-2">
        {/* Order Brief Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-100 dark:to-slate-800/80 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              {data.orderType === "TAKEAWAY"
                ? "Takeaway Order"
                : `Dine-in (${data.tableName ? `Table #${data.tableName}` : "No Table"})`}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {data.orderFor || "Walk-in Guest"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Amount
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(data.totalPrice)}
            </span>
          </div>
        </div>

        {/* QR Display Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-inner">
          <div className="w-60 h-60 mx-auto bg-white p-3.5 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center relative group">
            {data.qrUrl ? (
              <img
                src={data.qrUrl}
                alt="Midtrans QRIS Code"
                className="w-full h-full object-contain"
              />
            ) : data.qrString ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  data.qrString
                )}`}
                alt="Midtrans QRIS Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <HiOutlineQrcode className="text-8xl" />
                <span className="text-xs font-bold">QR String Not Available</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                Waiting for customer payment...
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Scan with GoPay, BCA, Mandiri, ShopeePay, OVO, Dana, or any QRIS compatible app. System updates automatically upon payment.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            {onChangePaymentMethod && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<HiOutlineSwitchHorizontal className="text-amber-500 text-lg" />}
                onClick={onChangePaymentMethod}
                className="font-bold text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              >
                Change Payment Method
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {onManualSyncQris && (
                <Button
                  variant="primary"
                  size="md"
                  loading={isSyncingQris}
                  leftIcon={<HiOutlineRefresh className={isSyncingQris ? "animate-spin" : ""} />}
                  onClick={onManualSyncQris}
                  className="font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  {isSyncingQris ? "Checking..." : "Check Status"}
                </Button>
              )}
              <Button variant="secondary" size="md" onClick={onClose} className="font-bold text-xs">
                Close
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 italic">
            Note: Closing this modal will keep the order in <strong>POS History</strong> under <em>Pending QRIS</em>.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PosQrisModal;
