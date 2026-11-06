import React from "react";
import Badge from "@/components/ui/Badge.tsx";

export interface OrderStatusBadgeProps {
    status: number;
    size?: "sm" | "md";
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({status, size = "md"}) => {
    switch (status) {
        case 0:
            return (
                <Badge variant="warning" size={size} dot>
                    Order Confirmed
                </Badge>
            );
        case 1:
            return (
                <Badge variant="primary" size={size} dot>
                    Brewing / Delivering
                </Badge>
            );
        case 2:
            return (
                <Badge variant="success" size={size} dot>
                    Completed
                </Badge>
            );
        case 3:
            return (
                <Badge variant="danger" size={size} dot>
                    Cancelled (Out of Stock / Refunded)
                </Badge>
            );
        default:
            return (
                <Badge variant="neutral" size={size}>
                    Pending
                </Badge>
            );
    }
};

export default OrderStatusBadge;
