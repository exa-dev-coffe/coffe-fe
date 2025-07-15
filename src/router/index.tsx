import {createBrowserRouter} from "react-router";
import ClientLayout from "../layouts/ClientLayout.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <ClientLayout/>,
        children: [
            {
                path: '',
                element: <div className={'h-[2000px]'}>Test Layout</div>
            }
        ]
    },
])

export default router;