import {createBrowserRouter} from "react-router";

const router = createBrowserRouter([
    {
        path: "/",
        element: <div>Home Page</div>
    },
    {
        path: "/about",
        element: <div className={"text-red-600 text-4xl"}>About Page</div>
    }
])

export default router;