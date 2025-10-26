import {jwtDecode} from "jwt-decode";
import type {PayloadJWT} from "../model/auth.ts";
import {Navigate} from "react-router";
import ForbiddenPage from "../pages/ForbiddenPage.tsx";
import Cookie from "../utils/cookie.ts";

const ProtectedRouteByRole: React.FC<
    {
        page: React.JSX.Element;
        role: string[];
    }
> = ({page, role}) => {
    const token = Cookie.get('token');

    if (token) {
        const roleInJWT = jwtDecode<PayloadJWT>(token).role;
        if (!roleInJWT) <Navigate to={"/login"} replace={true}/>;
        if (roleInJWT && role.includes(roleInJWT)) {
            console.log("Access granted to role:", roleInJWT);
            return page;
        } else {
            console.log("Access granted to role:", role);
            return <ForbiddenPage/>;
        }
    } else {
        console.log("No token found, redirecting to login.");
        return <Navigate to="/login" replace={true}/>;
    }
}

export default ProtectedRouteByRole;