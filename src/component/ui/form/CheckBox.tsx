// src/component/ui/form/CheckBox.tsx
import React from 'react';

interface CummonCheckBoxProps {
    label?: string;
    name: string;
    value: boolean;
}

interface EnableCheckBoxProps {
    disabled?: false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

interface DisableCheckBoxProps {
    disabled?: true;
    onChange?: never;
    required?: boolean;
}

type ICheckBoxProps = CummonCheckBoxProps & (EnableCheckBoxProps | DisableCheckBoxProps);

const CheckBox: React.FC<ICheckBoxProps> = ({label, required, disabled = false, name, value, onChange}) => {
    return (
        <div className='flex items-center space-x-2'>
            <input
                type='checkbox'
                id={name}
                name={name}
                checked={value}
                onChange={onChange}
                disabled={disabled}
                className='sm:w-5 w-4 sm:h-5 h-4 hover:cursor-pointer accent-primary dark:accent-primary focus:ring-2 focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-60'
            />
            {label && (
                <label htmlFor={name} className='sm:text-lg text-sm font-medium text-slate-800 dark:text-slate-100'>
                    {label}&nbsp;{required && <span className='text-red-500 dark:text-red-400'>*</span>}
                </label>
            )}
        </div>
    );
}

export default CheckBox;