import React, {useEffect, useRef} from 'react';
import {IoCloseSharp} from "react-icons/io5";

interface ModalProps {
    show: boolean;
    title: string;
    children: React.ReactNode;
    handleClose: () => void;
    persist?: boolean;
    type?: 'blur' | 'none';
    noHeader?: boolean;
    size: 'xs' | 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
                                         title,
                                         type = 'none',
                                         persist = false,
                                         noHeader = false,
                                         size,
                                         children,
                                         handleClose,
                                         show
                                     }) => {

    const refModal = useRef<HTMLDivElement>(null);

    const sizeClass = () => {
        switch (size) {
            case 'xs':
                return 'sm:w-1/2 md:w-1/3 lg:w-1/4 w-full';
            case 'sm':
                return 'sm:w-1/2 md:w-2/3 lg:w-1/3 w-full';
            case 'md':
                return 'sm:w-2/3 md:w-3/4 lg:w-1/2 w-full';
            case 'lg':
                return 'sm:w-3/4 md:w-4/5 lg:w-2/3 w-full';
            default:
                return 'w-full';
        }
    };

    useEffect(() => {
        const modal = refModal.current;
        if (!modal) return;

        let fadeTimeout: number;

        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('animate-fade-in');

        } else {
            modal.classList.remove('animate-fade-in');
            modal.classList.add('animate-fade-out');

            fadeTimeout = setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('animate-fade-out');
            }, 300);
        }

        return () => {
            clearTimeout(fadeTimeout);
        };
    }, [show]);

    return (
        <div ref={refModal}
             className={` left-0 top-0 hidden justify-center flex w-full p-3 sm:p-0  items-center ${type === 'blur' ? 'modal-blur z-40' : 'modal z-[100]'}`}>
            <div
                className={`bg-white 
                rounded-xl shadow-2xl ${sizeClass()}`}>
                {
                    noHeader ? null :
                        <header
                            className={`text-3xl border-b mx-6 font-semibold flex items-center justify-between py-4`}>
                            <h2>
                                {title}
                            </h2>
                            {
                                persist ? null :
                                    <button
                                        className={'text-gray-500 cursor-pointer hover:text-gray-700 transition-all duration-300'}
                                        onClick={handleClose}>
                                        <IoCloseSharp/>
                                    </button>
                            }
                        </header>
                }
                {
                    children
                }
            </div>
        </div>
    );
};

export default Modal;
