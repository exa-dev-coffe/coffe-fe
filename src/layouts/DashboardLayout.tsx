import {Outlet} from "react-router";

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            <main>
                <Outlet/>
            </main>
            <footer className="dashboard-footer">
                <p>© 2023 Your Company</p>
            </footer>
        </div>
    );
}

export default DashboardLayout;