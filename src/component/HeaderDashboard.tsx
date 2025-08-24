import {formatDateTimeShort} from "../utils";
import React from "react";

interface HeaderDashboardProps {
    title: string;
    description?: string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({title, description}) => {
    return (
        <header className={'flex items-center gap-5 justify-between'}>
            <div>
                <h1 className={'sm:text-3xl text-xl mb-3 font-bold'}>{title}</h1>
                <h4>{description}</h4>
            </div>
            <div className={'text-end w-64'}>
                <h4>
                    {
                        formatDateTimeShort()
                    }
                </h4>
            </div>

        </header>
    );
}

export default HeaderDashboard;