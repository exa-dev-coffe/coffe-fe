export interface AdminWalletItem {
  id: number;
  userId: number;
  walletNumber?: string;
  balance: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminWalletSummary {
  totalActiveWallets: number;
  totalInactiveWallets: number;
  totalOutstandingBalance: number;
}

export interface AdminSendResetPinCodePayload {
  userId?: number;
  email: string;
}

export interface AdminResetPinPayload {
  userId?: number;
  email: string;
  code: string;
  newPin: string;
}
