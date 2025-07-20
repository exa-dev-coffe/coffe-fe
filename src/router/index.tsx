import {createBrowserRouter} from "react-router";
import ClientLayout from "../layouts/ClientLayout.tsx";
import RegisterPage from "../pages/auth/RegisterPage.tsx";
import LoginPage from "../pages/auth/LoginPage.tsx";
import ProtectedRouteIsAuth from "../HOC/ProtectedRouteIsAuth.tsx";

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
])

export default router;