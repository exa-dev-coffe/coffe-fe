import React, { useRef, useState } from "react";
import {
  HiCloudUpload,
  HiTrash,
  HiPhotograph,
  HiScissors,
  HiCheckCircle,
} from "react-icons/hi";
import ImageCropperModal from "./ImageCropperModal.tsx";
import type { CropResult } from "@/core/utils/cropImage.ts";

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
  aspectRatio?: number; // default 4/3 for catalog
  enableCrop?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Upload Image",
  value,
  onChange,
  setValue,
  error,
  helperText = "PNG, JPG, or WEBP up to 5MB (Auto WebP & Compressed)",
  disabled = false,
  required = false,
  className = "",
  aspectRatio = 4 / 3,
  enableCrop = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Cropper modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState("image.webp");
  const [cropperFileSize, setCropperFileSize] = useState(0);

  // Compression metrics
  const [compressionMetrics, setCompressionMetrics] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const previewUrl =
    typeof value === "string"
      ? value
      : value instanceof File
      ? URL.createObjectURL(value)
      : null;

  const openCropperWithFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCropperRawSrc(objectUrl);
    setCropperFileName(file.name);
    setCropperFileSize(file.size);
    setIsCropModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (enableCrop) {
      openCropperWithFile(file);
    } else if (setValue) {
      setValue(e);
    } else if (onChange) {
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

    const file = e.dataTransfer.files?.[0] || null;
    if (!file) return;

    if (enableCrop) {
      openCropperWithFile(file);
    } else if (setValue) {
      setValue(e);
    } else if (onChange) {
      onChange(file);
    }
  };

  const handleCropComplete = (result: CropResult) => {
    setCompressionMetrics({
      originalSize: result.originalSizeBytes,
      compressedSize: result.compressedSizeBytes,
    });
    if (onChange) {
      onChange(result.file);
    }
  };

  const handleReCrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cropperRawSrc) {
      setIsCropModalOpen(true);
    } else if (previewUrl) {
      setCropperRawSrc(previewUrl);
      setCropperFileName("image.webp");
      setCropperFileSize(value instanceof File ? value.size : 0);
      setIsCropModalOpen(true);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCompressionMetrics(null);
    setCropperRawSrc(null);
    if (onChange) onChange(null);
  };

  const formatSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(0)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Rasio seragam: {aspectRatio === 4 / 3 ? "4:3 (Menu)" : aspectRatio === 1 ? "1:1" : `${aspectRatio.toFixed(2)}`}
          </span>
        </div>
      )}

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[180px] ${
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
          <div className="relative w-full aspect-[4/3] max-h-56 rounded-xl overflow-hidden group/preview shadow-sm">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover/preview:scale-105"
            />

            {/* Compression info badge */}
            {compressionMetrics && (
              <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md">
                <HiCheckCircle className="text-emerald-400 text-sm" />
                <span>WebP: {formatSize(compressionMetrics.compressedSize)}</span>
                {compressionMetrics.originalSize > compressionMetrics.compressedSize && (
                  <span className="text-emerald-400 font-bold">
                    (-
                    {Math.round(
                      (1 -
                        compressionMetrics.compressedSize /
                          compressionMetrics.originalSize) *
                        100
                    )}
                    %)
                  </span>
                )}
              </div>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              {enableCrop && (
                <button
                  type="button"
                  onClick={handleReCrop}
                  className="text-white text-xs font-semibold bg-amber-600/90 hover:bg-amber-600 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <HiScissors className="text-sm" /> Crop
                </button>
              )}
              <span className="text-white text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                <HiPhotograph className="text-sm" /> Ganti
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-white text-xs font-semibold bg-rose-600/90 hover:bg-rose-600 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <HiTrash className="text-sm" /> Hapus
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
                Klik atau drag foto produk ke sini
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {helperText}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
              <HiScissors className="text-amber-500" />
              Otomatis crop seragam & kompres WebP
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={cropperRawSrc}
        fileName={cropperFileName}
        fileSizeBytes={cropperFileSize}
        initialAspectRatio={aspectRatio}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default ImageUpload;
