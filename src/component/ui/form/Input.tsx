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
    disabled: false;
    required: boolean;
    onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface DisableInputProps {
    disabled: true;
    required?: boolean;
    onChange?: never;
}

type IInputProps = CummonInputProps & (EnableInputProps | DisableInputProps);


const Input: React.FC<IInputProps> = ({
                                          label,
                                          value,
                                          error,
                                          onChange,
                                          disabled,
                                          required,
                                          type,
                                          name,
                                          placeholder
                                      }) => {
    return (
        <div>
            <label htmlFor={name} className={'font-bold text-xl'}>
                {label} {
                required && <span className={'text-red-500'}>*</span>
            }
            </label>
            <div
                className={'text-2xl flex items-center  border border-gray-300 rounded-2xl mt-2'}>
                <input name={name} className={'w-full focus:outline-none px-4 py-2'} id={name}
                       type={type}
                       value={value}
                       onChange={onChange}
                       disabled={disabled} required={required}
                       placeholder={placeholder}/>
            </div>
            {error && <p className={'text-red-500 text-sm mt-1'}>{error}</p>}
        </div>
    )
};

export default Input;