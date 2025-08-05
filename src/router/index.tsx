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

const router = createBrowserRouter([
    {
        path: "/",
        element: <ClientLayout/>,
        children: [
            {
                path: '',
                element: <div className={'h-[2000px]'}>Test Layout</div>
            },
            {
                path: '/menu',
                element: <ProtectedRouteIsAuth page={<div className={'h-[2000px]'}>Menu Page</div>}/>
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
                    }
                ]
            },
            {
                path: "manage-category/list-category/:id",
                element: <ProtectedRouteByRole page={<ListProductByCategory/>} role="admin"/>
            }
        ]
    }
])


export default router;