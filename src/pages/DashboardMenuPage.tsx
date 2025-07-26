import useAuthContext from "../hook/useAuthContext.ts";
import {Navigate} from "react-router";
import HeaderDashboard from "../component/ui/HeaderDashboard.tsx";

const DashboardMenuPage = () => {
    const auth = useAuthContext()

    if (auth.auth.loading) {
        return null
    }

    if (!auth.auth.isAuth) {
        return <Navigate to="/login" replace={true}/>
    }
    return (
        <div className={'container mx-auto '}>
            <HeaderDashboard title={'Diskusi Coffe'} description={`Welcome ${auth.auth.name}!`}/>
            <div className={'grid grid-cols-3 gap-4'}>

            </div>
        </div>
    );
}

export default DashboardMenuPage;