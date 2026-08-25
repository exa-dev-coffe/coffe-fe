import {
    HiOutlineChartSquareBar,
    HiOutlineCollection,
    HiOutlineTag,
    HiOutlineUserGroup,
    HiOutlineViewBoards,
    HiOutlineClipboardList,
    HiOutlineCube,
    HiOutlineUser,
    HiOutlineTicket,
    HiOutlineBadgeCheck,
    HiOutlineShieldCheck,
    HiOutlineUsers,
    HiOutlineCash,
} from "react-icons/hi";
import type {IconType} from "react-icons";

export interface NavItemConfig {
    label: string;
    to: string;
    icon: IconType;
    roles: ("admin" | "barista")[];
    featureKey?: string;
    matchExact?: boolean;
}

export const DASHBOARD_NAV_ITEMS: NavItemConfig[] = [
    {
        label: "Analytics Overview",
        to: "/dashboard/menu",
        icon: HiOutlineChartSquareBar,
        roles: ["admin", "barista"],
        featureKey: "report",
    },
    {
        label: "Point of Sale (POS)",
        to: "/dashboard/pos",
        icon: HiOutlineCash,
        roles: ["admin", "barista"],
        featureKey: "pos",
    },
    {
        label: "Manage Catalog",
        to: "/dashboard/manage-catalog",
        icon: HiOutlineCollection,
        roles: ["admin"],
        featureKey: "catalog",
    },
    {
        label: "Manage Categories",
        to: "/dashboard/manage-category/list-category",
        icon: HiOutlineTag,
        roles: ["admin"],
        featureKey: "category",
    },
    {
        label: "Manage Users",
        to: "/dashboard/manage-users",
        icon: HiOutlineUsers,
        roles: ["admin"],
        featureKey: "user_management",
    },
    {
        label: "Manage Baristas",
        to: "/dashboard/manage-barista",
        icon: HiOutlineUserGroup,
        roles: ["admin"],
        featureKey: "barista",
    },
    {
        label: "Manage Tables",
        to: "/dashboard/manage-table",
        icon: HiOutlineViewBoards,
        roles: ["admin"],
        featureKey: "table",
    },
    {
        label: "Manage Vouchers",
        to: "/dashboard/manage-voucher",
        icon: HiOutlineTicket,
        roles: ["admin"],
        featureKey: "voucher",
    },
    {
        label: "Manage Promotions",
        to: "/dashboard/manage-promotion",
        icon: HiOutlineBadgeCheck,
        roles: ["admin"],
        featureKey: "promotion",
    },
    {
        label: "Incoming Orders",
        to: "/dashboard/manage-order",
        icon: HiOutlineClipboardList,
        roles: ["barista"],
        featureKey: "order",
    },
    {
        label: "Inventory Status",
        to: "/dashboard/manage-inventory",
        icon: HiOutlineCube,
        roles: ["barista"],
        featureKey: "inventory",
    },
    {
        label: "Manage Roles",
        to: "/dashboard/manage-roles",
        icon: HiOutlineShieldCheck,
        roles: ["admin"],
        featureKey: "role_management",
    },
    {
        label: "Account Profile",
        to: "/dashboard/my-profile",
        icon: HiOutlineUser,
        roles: ["admin", "barista"],
    },
];
