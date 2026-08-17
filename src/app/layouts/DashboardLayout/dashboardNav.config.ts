import {
    HiOutlineChartSquareBar,
    HiOutlineCollection,
    HiOutlineTag,
    HiOutlineUserGroup,
    HiOutlineViewBoards,
    HiOutlineClipboardList,
    HiOutlineCube,
    HiOutlineUser,
} from "react-icons/hi";
import type {IconType} from "react-icons";

export interface NavItemConfig {
    label: string;
    to: string;
    icon: IconType;
    roles: ("admin" | "barista")[];
    matchExact?: boolean;
}

export const DASHBOARD_NAV_ITEMS: NavItemConfig[] = [
    {
        label: "Analytics Overview",
        to: "/dashboard/menu",
        icon: HiOutlineChartSquareBar,
        roles: ["admin", "barista"],
    },
    {
        label: "Manage Catalog",
        to: "/dashboard/manage-catalog",
        icon: HiOutlineCollection,
        roles: ["admin"],
    },
    {
        label: "Manage Categories",
        to: "/dashboard/manage-category/list-category",
        icon: HiOutlineTag,
        roles: ["admin"],
    },
    {
        label: "Manage Baristas",
        to: "/dashboard/manage-barista",
        icon: HiOutlineUserGroup,
        roles: ["admin"],
    },
    {
        label: "Manage Tables",
        to: "/dashboard/manage-table",
        icon: HiOutlineViewBoards,
        roles: ["admin"],
    },
    {
        label: "Incoming Orders",
        to: "/dashboard/manage-order",
        icon: HiOutlineClipboardList,
        roles: ["barista"],
    },
    {
        label: "Inventory Status",
        to: "/dashboard/manage-inventory",
        icon: HiOutlineCube,
        roles: ["barista"],
    },
    {
        label: "Account Profile",
        to: "/dashboard/my-profile",
        icon: HiOutlineUser,
        roles: ["admin", "barista"],
    },
];
