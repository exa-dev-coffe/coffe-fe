export interface OrderDetailItem {
    id?: number;
    menuId?: number;
    menuName: string;
    photo: string;
    price: number;
    qty: number;
    notes?: string;
    rating?: number;
}

export interface OrderItem {
    id: number;
    tableId: number;
    tableName?: string;
    orderFor: string;
    totalPrice: number;
    orderStatus: number; // 0: Order Confirmed, 1: In Progress / Delivering, 2: Completed
    createdAt: string;
    updatedAt?: string;
    voucherId?: number;
    voucherCode?: string;
    discountAmount?: number;
    details?: OrderDetailItem[];
}

export interface OrderStatusBreakdown {
    status: number;
    count: number;
}

export interface PeakHourBreakdown {
    hour: number;
    count: number;
}

export interface TopMenu {
    menuId: number;
    totalQty: number;
}

export interface DailyOrderSummary {
    date: string;
    revenue: number;
    orders: number;
}

export interface OrderSummaryReport {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    dailyData: DailyOrderSummary[];
    statusBreakdown: OrderStatusBreakdown[];
    peakHours: PeakHourBreakdown[];
    topMenus: TopMenu[];
}

export interface RawOrderSummaryItem {
    total: number;
    totalOrder: number;
    createdAt: string;
}
