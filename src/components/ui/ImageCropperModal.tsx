import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  HiX,
  HiOutlinePhotograph,
  HiCheck,
  HiRefresh,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiSparkles,
} from "react-icons/hi";
import { getCroppedImg, type CropResult } from "@/core/utils/cropImage.ts";

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  fileSizeBytes?: number;
  initialAspectRatio?: number; // e.g. 4/3 for catalog, 1/1 for profile
  onClose: () => void;
  onCropComplete: (result: CropResult) => void;
}

const ASPECT_RATIO_OPTIONS = [
  { label: "4:3 (Katalog)", value: 4 / 3, desc: "Rekomendasi Menu & POS" },
  { label: "1:1 (Square)", value: 1 / 1, desc: "Avatar & Kotak" },
  { label: "16:9 (Banner)", value: 16 / 9, desc: "Banner Lebar" },
];

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName = "image.webp",
  fileSizeBytes = 0,
  initialAspectRatio = 4 / 3,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number>(initialAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(2)} MB`;
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const targetMaxWidth = aspectRatio >= 1 ? 800 : 600;
      const targetMaxHeight = Math.round(targetMaxWidth / aspectRatio);

      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName,
        fileSizeBytes,
        targetMaxWidth,
        targetMaxHeight,
        0.82
      );

      onCropComplete(result);
      onClose();
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <HiOutlinePhotograph />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Sesuaikan & Kompres Foto
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur ukuran agar seragam dan dikonversi otomatis ke WebP hemat bandwidth.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 select-none overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            showGrid={true}
          />
        </div>

        {/* Controls & Options */}
        <div className="p-5 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          {/* Aspect Ratio Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rasio Ukuran:
            </label>
            <div className="flex items-center gap-2">
              {ASPECT_RATIO_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAspectRatio(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    Math.abs(aspectRatio - opt.value) < 0.01
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom and Rotate controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-slate-400 text-base">
                <HiOutlineZoomOut />
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-slate-400 text-base">
                <HiOutlineZoomIn />
              </span>
              <span className="text-xs font-mono font-medium text-slate-500 w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <button
                type="button"
                onClick={handleRotate}
                title="Putar 90°"
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <HiRefresh className="text-sm" /> 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset Posisi"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <HiSparkles className="text-amber-500 text-base shrink-0" />
              <span>
                Ukuran asli: <strong className="font-semibold">{formatFileSize(fileSizeBytes)}</strong>
              </span>
            </div>
            <span className="bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-lg text-[11px]">
              Otomatis Convert ke WebP (-85% Size)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Memproses WebP...
              </>
            ) : (
              <>
                <HiCheck className="text-base" /> Terapkan & Kompres
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
