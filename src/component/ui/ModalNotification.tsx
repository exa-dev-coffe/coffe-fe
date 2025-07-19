import React, {useEffect, useRef} from 'react';
import {PiCheckCircleFill, PiWarningCircleFill, PiXCircleFill} from "react-icons/pi";
import useNotification from "../../hook/useNotification.ts";

const ModalNotification: React.FC = () => {
    const notification = useNotification();
    const refModal = useRef<HTMLDivElement>(null);

    const sizeClass = () => {
        if (!notification.notification.isShow) return 'w-full';
        switch (notification.notification.size) {
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

    const iconNotification = () => {
        if (!notification.notification.isShow) return null;
        switch (notification.notification.type) {
            case 'success':
                return <PiCheckCircleFill className='text-green-500'/>;
            case 'error':
                return <PiXCircleFill className='text-red-500'/>;
            case 'warning':
                return <PiWarningCircleFill className='text-yellow-500'/>;
            case 'info':
                return <PiWarningCircleFill className='text-blue-500'/>;
            default:
                return null;
        }
    };

    useEffect(() => {
        const modal = refModal.current;
        if (!modal) return;

        let hideTimeout: number;
        let fadeTimeout: number;

        if (notification.notification.isShow) {
            modal.classList.remove('hidden');
            modal.classList.add('animate-fade-in');

            hideTimeout = setTimeout(() => {
                modal.classList.remove('animate-fade-in');
                modal.classList.add('animate-fade-out');

                fadeTimeout = setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.classList.remove('animate-fade-out');
                    notification.setNotification({isShow: false});
                }, 300);
            }, notification.notification.duration ?? 3000);
        }

        return () => {
            clearTimeout(hideTimeout);
            clearTimeout(fadeTimeout);
        };
    }, [notification]);

    if (!notification.notification.isShow) return null;

    const baseClass = "modal hidden justify-center flex w-full p-3 sm:p-0 " +
        (notification.notification.mode === 'dashboard'
            ? "z-[100] items-center"
            : "z-[50]  items-start");

    return (
        <div ref={refModal} className={baseClass}>
            <div
                className={`bg-white ${notification.notification.mode !== 'dashboard' && 'mt-32 flex px-5 py-2'} 
                rounded-xl shadow-2xl ${sizeClass()}`}>
                <div
                    className={`flex items-center justify-center ${notification.notification.mode === 'dashboard' ? 'py-5 text-7xl' : 'text-4xl'}`}>
                    {iconNotification()}
                </div>
                <div
                    className={`flex items-center justify-center w-full ${notification.notification.mode === 'dashboard' ? 'p-10' : 'p-5'} `}>
                    <h1 className={notification.notification.mode === 'dashboard' ? "sm:text-3xl text-xl font-semibold text-center" : "sm:text-xl text-lg text-center"}>
                        {notification.notification.message}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default ModalNotification;
