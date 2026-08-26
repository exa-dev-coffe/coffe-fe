import React, { useState } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Spinner from "@/components/ui/Spinner.tsx";
import { useAdminWalletHistoryQuery } from "@/features/wallet/hooks/useAdminWallet.ts";
import type { AdminWalletItem } from "@/features/wallet/types/adminWallet.types.ts";
import WalletHistoryItem from "@/features/wallet/components/WalletHistoryItem.tsx";
import { HiOutlineDocumentText } from "react-icons/hi";

interface AdminWalletHistoryModalProps {
  show: boolean;
  onClose: () => void;
  wallet: AdminWalletItem | null;
}

export const AdminWalletHistoryModal: React.FC<AdminWalletHistoryModalProps> = ({
  show,
  onClose,
  wallet,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data: historyData, isLoading } = useAdminWalletHistoryQuery(
    wallet?.userId,
    page,
    pageSize
  );

  const historyList = historyData?.data || [];
  const totalPages = historyData?.totalPages || 1;

  return (
    <Modal
      show={show}
      handleClose={onClose}
      title={`Wallet Transaction History (User ID: ${wallet?.userId || ""})`}
      size="lg"
    >
      <div className="space-y-4">
        {wallet && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Wallet Account No.
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {wallet.walletNumber ? wallet.walletNumber.replace(/(.{4})/g, '$1 ').trim() : `User #${wallet.userId}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Current Balance
              </p>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Rp {wallet.balance.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <Spinner />
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No wallet transactions found for this user.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {historyList.map((item) => (
              <WalletHistoryItem key={item.id} {...item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs py-1.5 px-3"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs py-1.5 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminWalletHistoryModal;
