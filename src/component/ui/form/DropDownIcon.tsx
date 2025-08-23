import React, {useEffect, useRef, useState} from "react";
import {MdKeyboardArrowDown} from "react-icons/md";
import {IoCloseSharp} from "react-icons/io5";

interface DropDownIconProps {
    label?: string;
    icon: React.ReactNode;
    name: string;
    placeholder: string;
    setOptions: (value: {
        value: number;
        label: string;
    }[]) => void;
    options: {
        value: number;
        label: string;
    }[];
    value: {
        value: number;
        label: string;
    } | null;
    setValue: (value: {
        value: number;
        label: string;
    } | null) => void;
}

const DropDownIcon: React.FC<DropDownIconProps> = ({
                                                       label,
                                                       options,
                                                       name,
                                                       icon,
                                                       value,
                                                       placeholder,
                                                       setValue,
                                                       setOptions
                                                   }) => {
    const [valueFilter, setValueFilter] = useState<{ value: number, label: string }[]>(options);
    const [isOpen, setIsOpen] = useState(false);
    const refDropdown = useRef<HTMLDivElement>(null);
    const listDropDown = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valueForm = e.target.value
        setValueFilter(options.filter((option: {
            label: string
        }) => option.label.toLowerCase().includes(valueForm.toLowerCase())));
    };

    const handleClick = (selected: {
        value: number;
        label: string;
    }) => {
        setIsOpen(false);
        if (value?.value == null) {
            const data = options.filter((option: { value: number, label: string }) => option.value !== selected.value);
            setOptions(data);
            setValueFilter(data);
        } else {
            const dataTemp = options.filter((option: {
                value: number,
                label: string
            }) => option.value !== selected.value);
            dataTemp.push(value);
            dataTemp.sort((a, b) => Number(a.value) - Number(b.value));
            setOptions(dataTemp);
            setValueFilter(dataTemp);
        }
        setValue(selected)
    }

    const handleClear = (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation();
        if (value?.value === 0) {
            setIsOpen(false);
            return;
        }
        const data = [
            ...options,
            {value: value?.value || 0, label: value?.label || ""}
        ]
            .sort((a, b) => Number(a.value) - Number(b.value));
        setOptions(data)
        setValueFilter(data);
        setValue(null);
        setIsOpen(false);
    }

    useEffect(() => {
        setValueFilter(options)
    }, [options])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (refDropdown.current && !refDropdown.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])

    useEffect(() => {
        let fadeTimeount: number;
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (listDropDown.current) {
                listDropDown.current.style.display = "none";
                return;
            }
        }
        if (isOpen && listDropDown.current) {
            listDropDown.current.style.display = "block";
        } else if (!isOpen && listDropDown.current) {
            listDropDown.current.classList.add("animate-fade-out");
            fadeTimeount = setTimeout(() => {
                if (!listDropDown.current) return;
                listDropDown.current.classList.remove("animate-fade-out");
                listDropDown.current.style.display = "none";
            }, 300);
        } else {
            if (!listDropDown.current) return;
            listDropDown.current.style.display = "none";
        }

        return () => {
            clearTimeout(fadeTimeount);
        }
    }, [isOpen])

    return (
        <div ref={refDropdown} className='relative w-full overflow-visible '>
            {
                label &&
                <div className={'pb-3'}>
                    <label htmlFor={name} className='text-lg font-bold'>{label}</label>
                </div>
            }
            <div onClick={() => setIsOpen(!isOpen)}
                 className={'w-full duration-300 transition-all bg-white border border-gray-300 rounded-2xl focus:outline-0 ' + (isOpen && "outline-primary")}>
                <span className="flex items-center pe-2.5 justify-between font-bold">
                    <div className={'flex sm:text-xl text-sm items-center gap-3'}>
                      <label htmlFor={name}
                             className={'text-3xl h-full rounded-2xl rounded-r-none bg-[#F2F2F2] px-3 py-3'}>
                            {icon}
                        </label>
                        {value?.label || placeholder}
                    </div>
                    <div className={'flex items-center justify-center gap-3'}>
                        {
                            value?.value ?
                                <IoCloseSharp onClick={handleClear} className={'sm:text-xl text-sm'}/>
                                : null
                        }
                        <MdKeyboardArrowDown
                            className={"sm:text-xl text-sm text-white bg-black rounded-full duration-200 transition-all " + (isOpen ? "-rotate-180" : "rotate-0")}/>
                    </div>
                </span>
            </div>
            <div ref={listDropDown}
                 style={{
                     display: "none",
                 }}
                 className={"absolute sm:text-xl text-sm left-0 z-50 w-full overflow-auto bg-white border border-t-0 border-gray-300  rounded-2xl top-full transition-all duration-300 max-h-64 " + (isOpen && " border-b animate-fade-in")}>
                <div className="sticky top-0 p-4 bg-white">
                    <input type="text" onChange={handleFilter}
                           className='z-10 w-full p-3 border border-gray-300 rounded-2xl focus:outline-0'
                           placeholder="Filter options..."/>
                </div>
                <div className="mt-2">
                    {
                        valueFilter.length === 0 ?
                            <p className="px-3 pb-5 sm:text-xl text-sm text-center font-semibold ">No options
                                available</p> :
                            valueFilter.map((option: { value: number, label: string }, index: number) => (
                                <p key={index} onClick={() => handleClick(option)}
                                   className="z-50 px-3 py-2 sm:text-xl text-sm transition-all duration-200 rounded-2xl hover:bg-gray-200 ">{option.label}</p>
                            ))
                    }
                </div>
            </div>

        </div>
    );
};

export default DropDownIcon;