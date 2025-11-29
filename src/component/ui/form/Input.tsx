import React, {type ChangeEvent} from 'react';

interface CummonInputProps {
    name: string;
    placeholder: string;
    type: string;
    label: string;
    error?: string;
    value?: string | number;
}

interface EnableInputProps {
    disabled?: false;
    required: boolean;
    onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface DisableInputProps {
    disabled?: true;
    required?: boolean;
    onChange?: never;
}

type IInputProps = CummonInputProps & (EnableInputProps | DisableInputProps);

const Input: React.FC<IInputProps> = ({
                                          label,
                                          value,
                                          error,
                                          onChange,
                                          disabled = false,
                                          required,
                                          type,
                                          name,
                                          placeholder
                                      }) => {
    return (
        <div>
            <label htmlFor={name} className={'font-bold text-sm sm:text-xl text-slate-800 dark:text-slate-100'}>
                {label} {
                required && <span className={'text-red-500 dark:text-red-400'}>*</span>
            }
            </label>
            <div
                className={'sm:text-2xl text-base flex items-center border border-gray-300 dark:border-slate-700 rounded-2xl mt-2 bg-white dark:bg-gray-700'}>
                <input
                    name={name}
                    className={'w-full bg-transparent disabled:bg-gray-200 dark:disabled:bg-slate-600 focus:outline-none rounded-2xl px-4 py-2 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-400'}
                    id={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                />
            </div>
            {error && <p className={'text-red-500 dark:text-red-400 text-sm mt-1'}>{error}</p>}
        </div>
    )
};

export default Input;