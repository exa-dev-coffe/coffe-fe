import React, {useRef, useState} from "react";
import {HiCloudUpload, HiTrash, HiPhotograph} from "react-icons/hi";

export interface ImageUploadProps {
    label?: string;
    name?: string;
    value?: File | string | null;
    onChange?: (file: File | null) => void;
    setValue?: (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label = "Upload Image",
    value,
    onChange,
    setValue,
    error,
    helperText = "PNG, JPG, or WEBP up to 5MB",
    disabled = false,
    required = false,
    className = "",
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const previewUrl = typeof value === "string"
        ? value
        : value instanceof File
        ? URL.createObjectURL(value)
        : null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setValue) {
            setValue(e);
        } else if (onChange) {
            const file = e.target.files?.[0] || null;
            onChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        if (setValue) {
            setValue(e);
        } else if (onChange) {
            const file = e.dataTransfer.files?.[0] || null;
            onChange(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onChange) onChange(null);
    };

    return (
        <div className={`w-full space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}

            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging
                        ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
                        : error
                        ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-amber-500/70 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-500/5"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={disabled}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {previewUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden group/preview">
                        <img
                            src={previewUrl}
                            alt="Upload preview"
                            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover/preview:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                <HiPhotograph /> Change
                            </span>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="text-white text-xs font-medium bg-rose-600/90 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <HiTrash /> Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center py-4 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                            <HiCloudUpload />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Click or drag image here
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {helperText}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        </div>
    );
};

export default ImageUpload;
