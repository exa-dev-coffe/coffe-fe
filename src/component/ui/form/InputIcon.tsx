import React from 'react';

interface IInputIconProps {
    name: string;
    placeholder: string;
    type: string;
    label: string;
    icon: React.ReactNode;
}

const InputIcon: React.FC<IInputIconProps> = ({icon, label, type, name, placeholder}) => {
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
                       placeholder={placeholder}/>
            </div>
        </div>
    )
};

export default InputIcon;