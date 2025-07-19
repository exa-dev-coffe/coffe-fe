import React, {type ChangeEvent} from 'react';

interface CummonInputProps {
    name: string;
    placeholder: string;
    type: string;
    label: string;
    icon: React.ReactNode;
    error?: string;
    value?: string | number;
}

interface EnableInputIconProps {
    disabled: false;
    required: boolean;
    onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface DisableInputIconProps {
    disabled: true;
    required?: boolean;
    onChange?: never;
}

type IInputIconProps = CummonInputProps & (EnableInputIconProps | DisableInputIconProps);


const InputIcon: React.FC<IInputIconProps> = ({
                                                  icon,
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
                {label}
            </label>
            <div
                className={'text-2xl flex items-center  border border-gray-300 rounded-2xl mt-2'}>
                <label htmlFor={name} className={'text-3xl h-full rounded-2xl rounded-r-none bg-[#F2F2F2] px-3 py-2'}>
                    {icon}
                </label>
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

export default InputIcon;