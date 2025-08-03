import React, {useEffect, useState} from "react";
import useNotificationContext from "../../../hook/useNotificationContext.ts";

type IInputFotoProps = {
    name: string;
    error?: string;
    value?: string | File;
    setValue: (value: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
}

const InputFoto: React.FC<IInputFotoProps> = ({name, setValue, value, error}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isHover, setIsHover] = useState(false);
    const notification = useNotificationContext()

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles[0]) {
            const file = droppedFiles[0];
            if (!file.type.startsWith('image/')) {
                return notification.setNotification({
                    size: 'sm',
                    message: 'File must be an image!',
                    type: 'error',
                    duration: 1000,
                    isShow: true,
                    mode: 'dashboard'
                })
            }
            if (file.size > 2000000) {
                return notification.setNotification({
                    size: 'sm',
                    message: 'File size must be less than 2MB!',
                    type: 'error',
                    duration: 1000,
                    isShow: true,
                    mode: 'dashboard'
                })
            }
            setValue(e);
            setFile(droppedFiles[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                return notification.setNotification({
                    size: 'sm',
                    message: 'File must be an image!',
                    type: 'error',
                    duration: 1000,
                    isShow: true,
                    mode: 'dashboard'
                })
            }
            if (file.size > 2000000) {
                return notification.setNotification({
                    size: 'sm',
                    message: 'File size must be less than 2MB!',
                    type: 'error',
                    duration: 1000,
                    isShow: true,
                    mode: 'dashboard'
                })
            }

            setFile(e.target.files[0]);
            setValue(e);
        }
    };

    useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);

            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }

        if (typeof value === 'string') {
            setPreview(value);
        }
    }, [value]);

    return (
        <div className='flex flex-col items-center space-y-1'>
            <input hidden type='file' id={name} name={name} onChange={handleFileChange}
                   accept="image/*"
                   className='w-full p-3 border border-gray-300 rounded-2xl focus:outline-0'/>
            <div
                className={"relative w-56 h-56 p-3 transition-all duration-300 flex items-center justify-center rounded-2xl border border-dashed " + (error ? "  border-red-500 " : "") + (file || preview ? " bg-none border-none " : " bg-gray-300 ")}
                style={{
                    cursor: "pointer",
                    backgroundImage: preview ? `url(${preview})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById(name)?.click()}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <div
                    className={"absolute rounded-2xl inset-0 transition-opacity duration-300 " + (isHover ? "bg-black opacity-50" : "opacity-0")}></div>
                {(!file && !preview) && (
                    <h5 className="relative text-center z-10">Drop Your Foto Or Click To Insert Your Foto</h5>
                )}
                {isHover && (file || preview) && (
                    <div>
                        <h5 className="relative btn-primary p-2.5 font-semibold rounded-2xl z-10 text-white">Change
                            Foto</h5>
                    </div>
                )}
            </div>
            {file && (
                <p className="text-center">{file.name}</p>
            )}
            {error &&
                <p className='text-red-500 ps-2'>{error}</p>
            }
        </div>
    );
}

export default InputFoto;