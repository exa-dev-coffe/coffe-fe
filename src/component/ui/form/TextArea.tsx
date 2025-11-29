// src/component/ui/form/TextArea.tsx
import React, {type ChangeEvent} from 'react';

interface CummonTextAreaProps {
    name: string;
    placeholder: string;
    label: string;
    error?: string;
    col?: number;
    row?: number;
    value?: string | number;
}

interface EnableTextAreaProps {
    disabled?: false;
    required?: boolean;
    onChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

interface DisableTextAreaProps {
    disabled?: true;
    required?: boolean;
    onChange?: never;
}

type ITextAreaProps = CummonTextAreaProps & (EnableTextAreaProps | DisableTextAreaProps);

const TextArea: React.FC<ITextAreaProps> = ({
                                                label,
                                                value,
                                                error,
                                                onChange,
                                                disabled = false,
                                                required,
                                                name,
                                                placeholder,
                                                row,
                                                col
                                            }) => {
    return (
        <div>
            <label htmlFor={name} className={'font-bold text-sm sm:text-xl text-slate-800 dark:text-slate-100'}>
                {label} {required && <span className={'text-red-500 dark:text-red-400'}>*</span>}
            </label>
            <div
                className={'sm:text-2xl text-base flex items-center border border-gray-300 dark:border-slate-700 rounded-2xl mt-2 bg-white dark:bg-gray-700'}>
                <textarea
                    name={name}
                    id={name}
                    className={'w-full bg-transparent focus:outline-none px-4 py-2 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-400 disabled:bg-gray-200 dark:disabled:bg-slate-600 rounded-2xl'}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    rows={row}
                    cols={col}
                />
            </div>
            {error && <p className={'text-red-500 dark:text-red-400 text-sm mt-1'}>{error}</p>}
        </div>
    )
};

export default TextArea;