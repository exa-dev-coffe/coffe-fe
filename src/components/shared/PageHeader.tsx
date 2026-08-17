import React from "react";
import {Link} from "react-router";
import {HiChevronRight} from "react-icons/hi";

export interface BreadcrumbItem {
    label: string;
    to?: string;
}

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumb?: BreadcrumbItem[];
    action?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    breadcrumb,
    action,
    className = "",
}) => {
    return (
        <div className={`space-y-3 mb-6 ${className}`}>
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {breadcrumb.map((item, idx) => {
                        const isLast = idx === breadcrumb.length - 1;
                        return (
                            <React.Fragment key={idx}>
                                {item.to && !isLast ? (
                                    <Link
                                        to={item.to}
                                        className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? "text-slate-900 dark:text-slate-100 font-semibold" : ""}>
                                        {item.label}
                                    </span>
                                )}
                                {!isLast && <HiChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            </React.Fragment>
                        );
                    })}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
