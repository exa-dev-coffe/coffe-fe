import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'dashboard' | 'compact' | 'auth';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}

const variantClasses: Record<string, string> = {
    default: 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm',
    dashboard: 'bg-white dark:bg-gray-800 p-8 rounded-lg border border-slate-100 dark:border-slate-700',
    compact: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700',
    auth: 'bg-white dark:bg-gray-800 px-5 sm:px-10 py-8 w-full rounded-4xl shadow-md dark:shadow-none',
};

const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding,
    className = '',
}) => {
    const base = variantClasses[variant] || variantClasses.default;
    const pad = padding ? paddingClasses[padding] : '';

    return (
        <div className={`${base} ${pad} ${className}`}>
            {children}
        </div>
    );
};

export default Card;