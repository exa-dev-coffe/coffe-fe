import {NavLink} from "react-router";
import React from "react";

interface ButtonSidebarProps {
    to?: string;
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;

}

const ButtonSidebar: React.FC<ButtonSidebarProps> = ({to, icon, onClick, title}) => {
    if (to) {
        return (
            <div className={'mt-4'}>


                <NavLink to={to}
                         className={({isActive}) => {
                             return `${isActive ? 'sidebar-link-active' : 'sidebar-link'} `
                         }}>
                    {
                        icon
                    }
                    {
                        title
                    }
                </NavLink>
            </div>
        );
    } else {
        return (
            <div className={'mt-4'}>
                <button
                    onClick={onClick}
                    className={'sidebar-link'}>
                    {icon}
                    {title}
                </button>
            </div>
        );
    }

}

export default ButtonSidebar;