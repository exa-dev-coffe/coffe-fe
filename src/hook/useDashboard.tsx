const useDashboard = () => {
    const menuDashboard = [
        {
            title: "Menu",
            to: "/dashboard/manage-catalog",
            count: 10
        },
        {
            title: "Table",
            to: "/dashboard/manage-table",
            count: 10
        },
        {
            title: "Category",
            to: "/dashboard/manage-category",
            count: 10
        },
        {
            title: "Barista",
            to: "/dashboard/manage-barista",
            count: 10
        }
    ]

    return {
        menuDashboard
    };
}

export default useDashboard;