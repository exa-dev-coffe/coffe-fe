import {formatDateTimeShort} from "../utils";
import React from "react";

interface HeaderDashboardProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({title, description, action}) => {
    return (
        <header className={'flex text-black dark:text-white items-center gap-5 justify-between'}>
            <div>
                <h1 className={'sm:text-3xl text-xl mb-3 font-bold'}>{title}</h1>
                <h4>{description}</h4>
            </div>
            <div className={'flex items-center gap-4'}>
                {action}
                <div className={'text-end w-64 hidden sm:block'}>
                    <h4>{formatDateTimeShort()}</h4>
                </div>
            </div>
        </header>
    );
}

export default HeaderDashboard;