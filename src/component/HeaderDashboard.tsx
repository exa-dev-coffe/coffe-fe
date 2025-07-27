import {formatDateTimeShort} from "../utils";
import React from "react";

interface HeaderDashboardProps {
    title: string;
    description?: string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({title, description}) => {
    return (
        <header className={'flex items-center justify-between'}>
            <div>
                <h1 className={'text-3xl mb-3 font-bold'}>{title}</h1>
                <h4>{description}</h4>
            </div>
            <div>
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