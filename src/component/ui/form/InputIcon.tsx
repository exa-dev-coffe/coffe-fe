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
    disabled?: false;
    required: boolean;
    onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

interface DisableInputIconProps {
    disabled?: true;
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
                                                  disabled = false,
                                                  required,
                                                  type,
                                                  name,
                                                  placeholder
                                              }) => {
    return (
        <div>
            <label htmlFor={name} className={'font-bold text-sm sm:text-xl'}>
                {label}
                &nbsp;
                {

                    required && <span className={'text-red-500'}>*</span>
                }
            </label>
            <div
                className={'sm:text-2xl text-base flex items-center  border border-gray-300 rounded-2xl mt-3'}>
                <label htmlFor={name} className={'text-3xl h-full rounded-2xl rounded-r-none bg-[#F2F2F2] px-3 py-3'}>
                    {icon}
                </label>
                <input name={name} className={'w-full focus:outline-none px-4 py-2.5 rounded-r-2xl'} id={name}
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