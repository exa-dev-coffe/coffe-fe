import {createBrowserRouter, Navigate} from "react-router";
import ClientLayout from "../layouts/ClientLayout.tsx";
import RegisterPage from "../pages/auth/RegisterPage.tsx";
import LoginPage from "../pages/auth/LoginPage.tsx";
import ProtectedRouteIsAuth from "../HOC/ProtectedRouteIsAuth.tsx";
import ProtectedRouteByRole from "../HOC/ProtectedRouteByRole.tsx";
import DashboardLayout from "../layouts/DashboardLayout.tsx";
import DashboardMenuPage from "../pages/DashboardMenuPage.tsx";
import ManageCatalogPage from "../pages/admin/catalog/ManageCatalog.tsx";
import AddCatalogPage from "../pages/admin/catalog/AddCatalog.tsx";
import EditCatalogPage from "../pages/admin/catalog/EditCatalog.tsx";
import ManageCategory from "../pages/admin/category/ManageCategory.tsx";
import ListCategoryPage from "../pages/admin/category/ListCategory.tsx";
import ListProductByCategory from "../pages/admin/category/ListProductByCategory.tsx";
import ListUncategorizedPage from "../pages/admin/category/ListUncategorized.tsx";
import ManageBaristaPage from "../pages/admin/barista/ManageBarista.tsx";
import ManageTablesPage from "../pages/admin/table/ManageTable.tsx";
import MyProfilePage from "../pages/MyProfile.tsx";
import ManageOrderPage from "../pages/barista/order/ManageOrder.tsx";
import DetailrderPage from "../pages/barista/order/DetailOrder.tsx";
import ManageInventoryPage from "../pages/barista/inventory/ManageInventory.tsx";
import HomePage from "../pages/client/Home.tsx";
import MenuPage from "../pages/client/Menu.tsx";
import DetailMenu from "../pages/client/DetailMenu.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <ClientLayout/>,
        children: [
            {
                path: '',
                element: <ProtectedRouteIsAuth page={<HomePage/>}/>
            },
            {
                path: '/menu',
                element: <MenuPage/>
            },
            {
                path: '/menu/:id',
                element: <DetailMenu/>
            },
            {
                path: '/register',
                element: <RegisterPage/>
            },
            {
                path: '/login',
                element: <LoginPage/>
            }
        ]
    },
    {
        path: "/dashboard",
        element: <ProtectedRouteByRole page={<DashboardLayout/>} role="admin"/>,
        children: [
            {
                index: true,
                element: <Navigate to={'/dashboard/menu'} replace={true}/>
            },
            {
                path: "menu",
                element: <ProtectedRouteByRole page={<DashboardMenuPage/>} role="admin"/>
            },
            {
                path: "manage-catalog",
                element: <ProtectedRouteByRole page={<ManageCatalogPage/>} role="admin"/>
            },
            {
                path: "manage-catalog/add-catalog",
                element: <ProtectedRouteByRole page={<AddCatalogPage/>} role="admin"/>
            },
            {
                path: "manage-catalog/:id",
                element: <ProtectedRouteByRole page={<EditCatalogPage/>} role="admin"/>
            },
            {
                path: "manage-category",
                element: <ProtectedRouteByRole page={<ManageCategory/>} role="admin"/>,
                children: [
                    {
                        index: true,
                        element: <Navigate to={'/dashboard/manage-category/list-category'} replace={true}/>
                    },
                    {
                        path: "list-category",
                        element: <ProtectedRouteByRole page={<ListCategoryPage/>} role="admin"/>
                    },
                    {
                        path: "list-uncategorized",
                        element: <ProtectedRouteByRole page={<ListUncategorizedPage/>} role="admin"/>

                    }
                ]
            },
            {
                path: "manage-category/list-category/:id",
                element: <ProtectedRouteByRole page={<ListProductByCategory/>} role="admin"/>
            },
            {
                path: "manage-barista",
                element: <ProtectedRouteByRole page={<ManageBaristaPage/>} role="admin"/>
            },
            {
                path: "manage-table",
                element: <ProtectedRouteByRole page={<ManageTablesPage/>} role="admin"/>
            },
            {
                path: "my-profile",
                element: <ProtectedRouteByRole page={<MyProfilePage/>} role={'admin'}/>
            }
        ]
    },
    {
        path: "/dashboard-barista",
        element: <ProtectedRouteByRole page={<DashboardLayout/>} role="barista"/>,
        children: [
            {
                index: true,
                element: <Navigate to={'/dashboard-barista/manage-order'} replace={true}/>
            },
            {
                path: "manage-order",
                element: <ProtectedRouteByRole page={<ManageOrderPage/>} role="barista"/>
            },
            {
                path: "manage-order/:id",
                element: <ProtectedRouteByRole page={<DetailrderPage/>} role={'barista'}/>
            },
            {
                path: "manage-inventory",
                element: <ProtectedRouteByRole page={<ManageInventoryPage/>} role="barista"/>
            },
            {
                path: "my-profile",
                element: <ProtectedRouteByRole page={<MyProfilePage/>} role={'barista'}/>
            }
        ]
    }
])


export default router;