import React from 'react';
import {Link} from "react-router";
import {BiSolidRightArrow} from "react-icons/bi";

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumb?: BreadcrumbItem[];
    action?: React.ReactNode;
    variant?: 'client' | 'dashboard';
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    breadcrumb,
    action,
    variant = 'client',
}) => {
    if (variant === 'dashboard') {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        );
    }

    return (
        <div className="mb-8">
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2" aria-label="Breadcrumb">
                    {breadcrumb.map((item, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <BiSolidRightArrow className="text-xs text-gray-400 dark:text-gray-500"/>
                            )}
                            {item.to ? (
                                <Link to={item.to} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
};

export default PageHeader;