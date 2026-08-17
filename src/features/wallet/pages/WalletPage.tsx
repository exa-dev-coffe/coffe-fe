import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWalletBalanceQuery,
  useWalletHistoryQuery,
  useTopUpWalletMutation,
} from "@/features/wallet/hooks/useWallet.ts";
import useSSE from "@/core/hooks/useSSE.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import WalletCard from "@/features/wallet/components/WalletCard.tsx";
import TopUpModal from "@/features/wallet/components/TopUpModal.tsx";
import WalletHistoryItem from "@/features/wallet/components/WalletHistoryItem.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import ENDPOINTS from "@/core/api/endpoints.ts";
import env from "@/core/config/env.ts";
import type { PaginationData } from "@/core/api/client.ts";
import type {
  WalletStatus,
  WalletHistoryItem as WalletHistoryItemType,
} from "@/features/wallet/types/wallet.types.ts";
import { HiOutlineCreditCard, HiOutlineReceiptTax } from "react-icons/hi";

export const WalletPage: React.FC = () => {
  const { auth } = useAuthContext();
  const [page, setPage] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const { data: balanceData } = useWalletBalanceQuery();
  const { data: historyData, isLoading: historyLoading } =
    useWalletHistoryQuery(page, 10);
  const { mutateAsync: topUpBalance, isPending: topUpLoading } =
    useTopUpWalletMutation();

  const history = historyData?.data || [];
  const totalData = historyData?.totalData || 0;
  const currentBalance = balanceData || { isActive: false, balance: 0 };

  const queryClient = useQueryClient();
  const processedIds = useRef(new Set<string>());
  const [isPaying, setIsPaying] = useState(false);

  // Setup live SSE stream for real-time balance updates
  useSSE<{ balanceHistoryId: string; status: string; amount?: number }>({
    baseUrl: `${env.API_URL}${ENDPOINTS.EVENTS}?type=update_history_balance`,
    onMessage: (dataSSE) => {
      const historyCache = queryClient.getQueryData<
        PaginationData<WalletHistoryItemType[]>
      >(["walletHistory", page, 10]);
      let dataExist: WalletHistoryItemType | undefined = undefined;

      if (historyCache && historyCache.data) {
        dataExist = historyCache.data.find(
          (item) => item.id === dataSSE.balanceHistoryId,
        );
      }

      if (dataExist) {
        // Update the status of the item in the history cache
        queryClient.setQueryData<PaginationData<WalletHistoryItemType[]>>(
          ["walletHistory", page, 10],
          (oldData?: PaginationData<WalletHistoryItemType[]>) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((item: WalletHistoryItemType) =>
                item.id === dataSSE.balanceHistoryId
                  ? { ...item, status: dataSSE.status.toLowerCase() }
                  : item,
              ),
            };
          },
        );

        if (
          dataSSE.status?.toUpperCase() === "COMPLETED" &&
          !processedIds.current.has(dataSSE.balanceHistoryId)
        ) {
          processedIds.current.add(dataSSE.balanceHistoryId);

          queryClient.setQueryData<WalletStatus>(
            ["walletBalance"],
            (oldBalance: WalletStatus | undefined) => {
              if (!oldBalance)
                return { isActive: true, balance: dataExist?.amount || 0 };
              return {
                ...oldBalance,
                balance: oldBalance.balance + (dataExist?.amount || 0),
                isActive: true,
              };
            },
          );
        }
      }
    },
    autoConnect: true,
  });

  const handleTopUpSubmit = async (amount: number): Promise<boolean> => {
    try {
      await topUpBalance({
        amount,
        onCompleted: () => setShowTopUpModal(false),
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 sm:px-6 space-y-10 max-w-5xl">
        <PageHeader
          title="Digital Member Wallet"
          subtitle="Manage your prepaid balance, top up via Midtrans Snap, and track transaction history."
          breadcrumb={[{ label: "Home", to: "/" }, { label: "My Wallet" }]}
        />

        {/* Member Card */}
        <div className="max-w-xl mx-auto">
          <WalletCard
            isActive={currentBalance.isActive}
            balance={currentBalance.balance}
            userName={auth.name}
            onTopUpClick={() => setShowTopUpModal(true)}
          />
        </div>

        {/* Balance History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HiOutlineReceiptTax className="text-amber-500 text-xl" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Balance History
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {totalData} total records
            </span>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={<HiOutlineCreditCard />}
              title="No Wallet Transactions Yet"
              description="Top up your balance or complete a checkout order to see records here."
              actionLabel={
                currentBalance.isActive ? "Top Up Now" : "Activate Wallet"
              }
              onAction={() => setShowTopUpModal(true)}
            />
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {history.map((item: WalletHistoryItemType) => (
                  <WalletHistoryItem
                    key={item.id}
                    id={item.id}
                    amount={item.amount}
                    type={item.type}
                    description={item.description}
                    orderId={item.orderId}
                    createdAt={item.createdAt}
                    status={item.status}
                    token={item.token}
                    isAnyPaying={isPaying}
                    onPayStart={() => setIsPaying(true)}
                    onPayEnd={() => setIsPaying(false)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalData={totalData}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>

        {/* Top Up Modal */}
        <TopUpModal
          show={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onTopUp={handleTopUpSubmit}
          loading={topUpLoading}
        />
      </div>
    </div>
  );
};

export default WalletPage;
