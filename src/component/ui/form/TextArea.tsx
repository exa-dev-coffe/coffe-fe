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
                                                placeholder
                                            }) => {
    return (
        <div>
            <label htmlFor={name} className={'font-bold  text-sm sm:text-xl'}>
                {label} {
                required && <span className={'text-red-500'}>*</span>
            }
            </label>
            <div
                className={'sm:text-2xl text-base flex items-center  border border-gray-300 rounded-2xl mt-2'}>
                <textarea name={name} className={'w-full focus:outline-none px-4 py-2'} id={name}
                          value={value}
                          onChange={onChange}
                          disabled={disabled} required={required}
                          placeholder={placeholder}/>
            </div>
            {error && <p className={'text-red-500 text-sm mt-1'}>{error}</p>}
        </div>
    )
};

export default TextArea;