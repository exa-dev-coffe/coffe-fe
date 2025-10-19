import {useCookies} from "react-cookie";
import {jwtDecode} from "jwt-decode";
import type {PayloadJWT} from "../model/auth.ts";
import {Navigate} from "react-router";
import ForbiddenPage from "../pages/ForbiddenPage.tsx";

const ProtectedRouteByRole: React.FC<
    {
        page: React.JSX.Element;
        role: string[];
    }
> = ({page, role}) => {
    const [cookie] = useCookies();
    const token = cookie.token;

    if (token) {
        const roleInJWT = jwtDecode<PayloadJWT>(token).role;
        if (!roleInJWT) <Navigate to={"/login"} replace={true}/>;
        if (roleInJWT && role.includes(roleInJWT)) {
            return page;
        } else {
            return <ForbiddenPage/>;
        }
    } else {
        return <Navigate to="/login" replace={true}/>;
    }
}

export default ProtectedRouteByRole;