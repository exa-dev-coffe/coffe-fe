import {Navigate} from "react-router";
import Cookie from "../utils/cookie.ts";

const ProtectedRouteIsAuth: React.FC<{
    page: React.JSX.Element;
}> = ({page}) => {
    const token = Cookie.get("token");
    if (token) {
        return page;
    } else {
        return <Navigate to={"/login"} replace/>;
    }
}

export default ProtectedRouteIsAuth;