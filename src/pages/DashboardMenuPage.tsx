import useAuthContext from "../hook/useAuthContext.ts";
import {Navigate} from "react-router";
import HeaderDashboard from "../component/ui/HeaderDashboard.tsx";
import useDashboard from "../hook/useDashboard.tsx";
import CardDasboardMenu from "../component/ui/card/CardDasboardMenu.tsx";
import {useEffect} from "react";

const DashboardMenuPage = () => {
    const auth = useAuthContext()
    const {getDataDashboard, menuDashboard} = useDashboard()

    useEffect(() => {
        getDataDashboard()
    }, [])

    if (auth.auth.loading) {
        return null
    }

    if (!auth.auth.isAuth) {
        return <Navigate to="/login" replace={true}/>
    }
    return (
        <div className={'container mx-auto '}>
            <HeaderDashboard title={'Diskusi Coffe'} description={`Welcome ${auth.auth.name}!`}/>
            <div className={'grid mt-10 grid-cols-5 gap-16'}>
                {
                    menuDashboard.map((menu, index) => (
                        <CardDasboardMenu {...menu} key={index}/>
                    ))
                }
            </div>
        </div>
    );
}

export default DashboardMenuPage;