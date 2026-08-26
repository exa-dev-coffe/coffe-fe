import React from "react";
import {Routes, Route, Navigate} from "react-router";
import ClientLayout from "@/app/layouts/ClientLayout/ClientLayout.tsx";
import DashboardLayout from "@/app/layouts/DashboardLayout/DashboardLayout.tsx";
import {ProtectedRoute, GuestOnlyRoute} from "@/app/router/ProtectedRoute.tsx";

// Client Pages
import HomePage from "@/features/home/pages/HomePage.tsx";
import ClientMenuPage from "@/features/menu/pages/ClientMenuPage.tsx";
import ClientDetailMenuPage from "@/features/menu/pages/ClientDetailMenuPage.tsx";
import LocationPage from "@/features/location/pages/LocationPage.tsx";
import CartPage from "@/features/cart/pages/CartPage.tsx";
import WalletPage from "@/features/wallet/pages/WalletPage.tsx";
import ActivateWalletPage from "@/features/wallet/pages/ActivateWalletPage.tsx";
import TopUpWalletPage from "@/features/wallet/pages/TopUpWalletPage.tsx";
import TransactionsPage from "@/features/orders/pages/TransactionsPage.tsx";
import DetailTransactionPage from "@/features/orders/pages/DetailTransactionPage.tsx";


// Auth Pages
import LoginPage from "@/features/auth/pages/LoginPage.tsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.tsx";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage.tsx";

// Dashboard Pages
import DashboardMenuPage from "@/features/dashboard/pages/DashboardMenuPage.tsx";
import ManageCatalogPage from "@/features/menu/pages/ManageCatalogPage.tsx";
import AddCatalogPage from "@/features/menu/pages/AddCatalogPage.tsx";
import EditCatalogPage from "@/features/menu/pages/EditCatalogPage.tsx";
import ManageCategoryLayout from "@/features/categories/pages/ManageCategoryLayout.tsx";
import ListCategoryPage from "@/features/categories/pages/ListCategoryPage.tsx";
import ListUncategorizedPage from "@/features/categories/pages/ListUncategorizedPage.tsx";
import ListProductByCategoryPage from "@/features/categories/pages/ListProductByCategoryPage.tsx";
import ManageBaristaPage from "@/features/barista/pages/ManageBaristaPage.tsx";
import ManageTablePage from "@/features/tables/pages/ManageTablePage.tsx";
import ManageOrderPage from "@/features/orders/pages/ManageOrderPage.tsx";
import DetailOrderPage from "@/features/orders/pages/DetailOrderPage.tsx";
import ManageInventoryPage from "@/features/inventory/pages/ManageInventoryPage.tsx";
import MyProfilePage from "@/features/profile/pages/MyProfilePage.tsx";
import ListVoucherPage from "@/features/vouchers/pages/ListVoucherPage.tsx";
import ListPromotionPage from "@/features/promotions/pages/ListPromotionPage.tsx";
import RoleManagementPage from "@/features/roles/pages/RoleManagementPage.tsx";
import ManageUsersPage from "@/features/users/pages/ManageUsersPage.tsx";
import ManageWalletsPage from "@/features/wallet/pages/ManageWalletsPage.tsx";
import PosTerminalPage from "@/features/pos/pages/PosTerminalPage.tsx";

// Error Pages
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import ForbiddenPage from "@/pages/ForbiddenPage.tsx";

export const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Public & Client Storefront Routes */}
            <Route element={<ClientLayout />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<ClientMenuPage />} />
                <Route path="menu/:id" element={<ClientDetailMenuPage />} />
                <Route path="location" element={<LocationPage />} />

                {/* Member Protected Client Routes */}
                <Route
                    path="my-cart"
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-wallet"
                    element={
                        <ProtectedRoute>
                            <WalletPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-wallet/activate"
                    element={
                        <ProtectedRoute>
                            <ActivateWalletPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-wallet/top-up"
                    element={
                        <ProtectedRoute>
                            <TopUpWalletPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="my-transaction"
                    element={
                        <ProtectedRoute>
                            <TransactionsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-transaction/:id"
                    element={
                        <ProtectedRoute>
                            <DetailTransactionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-profile"
                    element={
                        <ProtectedRoute>
                            <MyProfilePage />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Auth Routes (Guest Only) */}
            <Route
                path="login"
                element={
                    <GuestOnlyRoute>
                        <LoginPage />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="register"
                element={
                    <GuestOnlyRoute>
                        <RegisterPage />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="forget-password"
                element={
                    <GuestOnlyRoute>
                        <ForgotPasswordPage />
                    </GuestOnlyRoute>
                }
            />
            <Route
                path="reset-password"
                element={
                    <GuestOnlyRoute>
                        <ResetPasswordPage />
                    </GuestOnlyRoute>
                }
            />

            {/* Dashboard Routes (PBAC Protected, Staff/Admin Only) */}
            <Route
                path="dashboard"
                element={
                    <ProtectedRoute allowCustomer={false}>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard/menu" replace />} />
                <Route
                    path="pos"
                    element={
                        <ProtectedRoute feature="pos" allowCustomer={false}>
                            <PosTerminalPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="menu"
                    element={
                        <ProtectedRoute feature="report" allowCustomer={false}>
                            <DashboardMenuPage />
                        </ProtectedRoute>
                    }
                />

                {/* PBAC Management Routes */}
                <Route
                    path="manage-catalog"
                    element={
                        <ProtectedRoute feature="catalog">
                            <ManageCatalogPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-catalog/add-catalog"
                    element={
                        <ProtectedRoute feature="catalog" action="create">
                            <AddCatalogPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-catalog/:id"
                    element={
                        <ProtectedRoute feature="catalog" action="edit">
                            <EditCatalogPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-voucher"
                    element={
                        <ProtectedRoute feature="voucher">
                            <ListVoucherPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-promotion"
                    element={
                        <ProtectedRoute feature="promotion">
                            <ListPromotionPage />
                        </ProtectedRoute>
                    }
                />

                {/* Categories Suite */}
                <Route
                    path="manage-category"
                    element={
                        <ProtectedRoute feature="category">
                            <ManageCategoryLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="list-category" replace />} />
                    <Route path="list-category" element={<ListCategoryPage />} />
                    <Route path="list-uncategorized" element={<ListUncategorizedPage />} />
                    <Route path="list-category/:id" element={<ListProductByCategoryPage />} />
                </Route>

                <Route
                    path="manage-users"
                    element={
                        <ProtectedRoute feature="user_management">
                            <ManageUsersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-barista"
                    element={
                        <ProtectedRoute feature="barista">
                            <ManageBaristaPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-table"
                    element={
                        <ProtectedRoute feature="table">
                            <ManageTablePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-roles"
                    element={
                        <ProtectedRoute feature="role_management">
                            <RoleManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-wallets"
                    element={
                        <ProtectedRoute feature="wallet_management">
                            <ManageWalletsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Orders & Inventory */}
                <Route
                    path="manage-order"
                    element={
                        <ProtectedRoute feature="order">
                            <ManageOrderPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-order/:id"
                    element={
                        <ProtectedRoute feature="order">
                            <DetailOrderPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manage-inventory"
                    element={
                        <ProtectedRoute feature="inventory">
                            <ManageInventoryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Shared Profile */}
                <Route path="my-profile" element={<MyProfilePage />} />
            </Route>

            {/* Error Pages */}
            <Route path="403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;
