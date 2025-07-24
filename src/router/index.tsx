import {createBrowserRouter, Navigate} from "react-router";
import ClientLayout from "../layouts/ClientLayout.tsx";
import RegisterPage from "../pages/auth/RegisterPage.tsx";
import LoginPage from "../pages/auth/LoginPage.tsx";
import ProtectedRouteIsAuth from "../HOC/ProtectedRouteIsAuth.tsx";
import ProtectedRouteByRole from "../HOC/ProtectedRouteByRole.tsx";
import DashboardLayout from "../layouts/DashboardLayout.tsx";
import DashboardMenuPage from "../pages/DashboardMenuPage.tsx";

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
            }
        ]
    }
])


export default router;