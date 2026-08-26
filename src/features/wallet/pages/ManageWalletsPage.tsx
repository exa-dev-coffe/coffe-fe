import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Button from "@/components/ui/Button.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Spinner from "@/components/ui/Spinner.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {
  useAdminWalletsQuery,
  useAdminWalletSummaryQuery,
  useAdminToggleWalletStatusMutation,
} from "@/features/wallet/hooks/useAdminWallet.ts";
import type { AdminWalletItem } from "@/features/wallet/types/adminWallet.types.ts";
import AdminResetWalletPinModal from "@/features/wallet/components/AdminResetWalletPinModal.tsx";
import AdminWalletHistoryModal from "@/features/wallet/components/AdminWalletHistoryModal.tsx";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import {
  HiOutlineCreditCard,
  HiOutlineSearch,
  HiOutlineKey,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineBan,
} from "react-icons/hi";

export const ManageWalletsPage: React.FC = () => {
  const { canEdit } = usePermission();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const pageSize = 10;
  const { data: walletsData, isLoading } = useAdminWalletsQuery(
    page,
    pageSize,
    search,
  );
  const { data: summaryData } = useAdminWalletSummaryQuery();
  const { mutateAsync: toggleStatus, isPending: togglingStatus } =
    useAdminToggleWalletStatusMutation();

  const [selectedWalletForPin, setSelectedWalletForPin] =
    useState<AdminWalletItem | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const [selectedWalletForHistory, setSelectedWalletForHistory] =
    useState<AdminWalletItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [selectedWalletForToggle, setSelectedWalletForToggle] =
    useState<AdminWalletItem | null>(null);
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false);

  const walletList = walletsData?.data || [];
  const totalPages = walletsData?.totalPages || 1;
  const totalData = walletsData?.totalData || 0;
  const summary = summaryData || {
    totalActiveWallets: 0,
    totalInactiveWallets: 0,
    totalOutstandingBalance: 0,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleOpenResetPin = (wallet: AdminWalletItem) => {
    setSelectedWalletForPin(wallet);
    setShowPinModal(true);
  };

  const handleOpenHistory = (wallet: AdminWalletItem) => {
    setSelectedWalletForHistory(wallet);
    setShowHistoryModal(true);
  };

  const handleOpenToggleStatus = (wallet: AdminWalletItem) => {
    setSelectedWalletForToggle(wallet);
    setShowConfirmToggleModal(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedWalletForToggle) return;
    try {
      await toggleStatus(selectedWalletForToggle.userId);
      setShowConfirmToggleModal(false);
      setSelectedWalletForToggle(null);
    } catch {
      // Notification handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Wallet Management"
        subtitle="Monitor member wallet balances, inspect transaction histories, and safely reset PINs via Email verification."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Wallets" },
        ]}
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Active Wallets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Member Wallets
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {summary.totalActiveWallets.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        {/* Total Inactive Wallets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HiOutlineExclamationCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Unactivated / Suspended
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {summary.totalInactiveWallets.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        {/* Total Outstanding Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <HiOutlineCurrencyDollar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Outstanding Balance
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Rp {summary.totalOutstandingBalance.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 max-w-md w-full"
          >
            <div className="flex-1">
              <InputIcon
                type="text"
                icon={<HiOutlineSearch />}
                placeholder="Search by Wallet No. or User ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="shrink-0">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
                className="shrink-0"
              >
                Clear
              </Button>
            )}
          </form>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
            Total Records: {totalData}
          </p>
        </div>

        {/* Wallets Table */}
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : walletList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <HiOutlineCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No customer wallets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Wallet ID</th>
                  <th className="py-3 px-4">Wallet Account No.</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {walletList.map((wallet: AdminWalletItem) => {
                  const rawNum =
                    wallet.walletNumber ||
                    `8839${String(wallet.userId).padStart(8, "0")}`;
                  const formattedNum = rawNum.replace(/(.{4})/g, "$1 ").trim();
                  return (
                    <tr
                      key={wallet.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        #{wallet.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
                          <HiOutlineCreditCard className="w-4 h-4 text-primary" />
                          {formattedNum}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        User #{wallet.userId}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rp {wallet.balance.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={wallet.isActive ? "success" : "warning"}
                        >
                          {wallet.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Transaction History Button */}
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleOpenHistory(wallet)}
                            className="text-xs py-1.5 px-2.5 flex items-center gap-1"
                          >
                            <HiOutlineClock className="w-4 h-4 text-slate-500" />
                            Mutasi
                          </Button>

                          {/* Reset PIN via Email Button */}
                          {canEdit("wallet_management") && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleOpenResetPin(wallet)}
                              className="text-xs py-1.5 px-2.5 flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                            >
                              <HiOutlineKey className="w-4 h-4" />
                              Reset PIN
                            </Button>
                          )}

                          {/* Toggle Status Button */}
                          {canEdit("wallet_management") && (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={togglingStatus}
                              onClick={() => handleOpenToggleStatus(wallet)}
                              className={`text-xs py-1.5 px-2.5 flex items-center gap-1 ${
                                wallet.isActive
                                  ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              }`}
                            >
                              <HiOutlineBan className="w-4 h-4" />
                              {wallet.isActive ? "Suspend" : "Activate"}
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
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
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
      </div>

      {/* Modals */}
      {showPinModal && selectedWalletForPin && (
        <AdminResetWalletPinModal
          key={`reset-pin-${selectedWalletForPin.userId}`}
          show={showPinModal}
          onClose={() => {
            setShowPinModal(false);
            setSelectedWalletForPin(null);
          }}
          wallet={selectedWalletForPin}
        />
      )}

      {showHistoryModal && selectedWalletForHistory && (
        <AdminWalletHistoryModal
          key={`history-${selectedWalletForHistory.userId}`}
          show={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedWalletForHistory(null);
          }}
          wallet={selectedWalletForHistory}
        />
      )}

      {showConfirmToggleModal && selectedWalletForToggle && (
        <ConfirmModal
          show={showConfirmToggleModal}
          onClose={() => {
            setShowConfirmToggleModal(false);
            setSelectedWalletForToggle(null);
          }}
          onConfirm={handleConfirmToggleStatus}
          title={selectedWalletForToggle.isActive ? "Suspend Customer Wallet" : "Re-activate Customer Wallet"}
          description={
            selectedWalletForToggle.isActive
              ? `Are you sure you want to suspend wallet #${selectedWalletForToggle.id} (User #${selectedWalletForToggle.userId})? The customer will not be able to perform transactions until re-activated.`
              : `Are you sure you want to re-activate wallet #${selectedWalletForToggle.id} (User #${selectedWalletForToggle.userId})?`
          }
          confirmText={selectedWalletForToggle.isActive ? "Suspend Wallet" : "Activate Wallet"}
          cancelText="Cancel"
          variant={selectedWalletForToggle.isActive ? "danger" : "primary"}
          loading={togglingStatus}
        />
      )}
    </div>
  );
};

export default ManageWalletsPage;
