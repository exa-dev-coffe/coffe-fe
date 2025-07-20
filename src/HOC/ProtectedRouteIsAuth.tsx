import {useCookies} from "react-cookie";
import {Navigate} from "react-router";

const ProtectedRouteIsAuth: React.FC<{
    page: React.JSX.Element;
}> = ({page}) => {
    const [cookies] = useCookies()

    if (cookies.token) {
        return page;
    } else {
        return <Navigate to={"/login"} replace/>;
    }
}

export default ProtectedRouteIsAuth;