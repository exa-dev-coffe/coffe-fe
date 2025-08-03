interface CummonCheckBoxProps {
    label?: string;
    name: string;
    value: boolean;
}

interface EnableCheckBoxProps {
    disabled: false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required: boolean;
}

interface DisableCheckBoxProps {
    disabled: true;
    onChange?: never;
    required?: boolean;
}

type ICheckBoxProps = CummonCheckBoxProps & (EnableCheckBoxProps | DisableCheckBoxProps);

const CheckBox: React.FC<ICheckBoxProps> = ({label, required, disabled, name, value, onChange}) => {
    return (
        <div className='flex items-center space-x-2'>
            <input type='checkbox' id={name} name={name} checked={value} onChange={onChange}
                   disabled={disabled}
                   className='w-5 h-5 hover:cursor-pointer'/>
            {
                label &&
                <label htmlFor={name} className='text-lg font-medium'>{label}&nbsp;{
                    required && <span className='text-red-500'>*</span>
                }
                </label>
            }
        </div>
    );
}

export default CheckBox;