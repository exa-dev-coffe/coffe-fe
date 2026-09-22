import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  HiX,
  HiOutlinePhotograph,
  HiOutlineUser,
  HiCheck,
  HiRefresh,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiSparkles,
  HiEye,
  HiViewGrid,
  HiShoppingBag,
  HiShieldCheck,
} from "react-icons/hi";
import { getCroppedImg, type CropResult } from "@/core/utils/cropImage.ts";

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  fileSizeBytes?: number;
  initialAspectRatio?: number; // e.g. 4/3 for catalog, 1/1 for profile
  cropShape?: "rect" | "round";
  mode?: "menu" | "profile";
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onCropComplete: (result: CropResult) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName = "image.webp",
  fileSizeBytes = 0,
  initialAspectRatio = 4 / 3,
  cropShape,
  mode,
  title,
  subtitle,
  onClose,
  onCropComplete,
}) => {
  const isProfile = mode === "profile" || cropShape === "round" || initialAspectRatio === 1;
  const effectiveCropShape = cropShape || (isProfile ? "round" : "rect");
  const effectiveAspect = isProfile ? 1 : initialAspectRatio;

  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number>(effectiveAspect);
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");
  const [originalAspect, setOriginalAspect] = useState<number>(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedAreaPercent, setCroppedAreaPercent] = useState<Area | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    if (mediaSize.width && mediaSize.height) {
      setOriginalAspect(mediaSize.width / mediaSize.height);
    }
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, pixelCrop: Area) => {
      setCroppedAreaPercent(croppedArea);
      setCroppedAreaPixels(pixelCrop);
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
      const targetMaxWidth = isProfile ? 512 : (aspectRatio >= 1 ? 800 : 600);
      const targetMaxHeight = Math.round(targetMaxWidth / (isProfile ? 1 : aspectRatio));

      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName,
        fileSizeBytes,
        targetMaxWidth,
        targetMaxHeight,
        0.85
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              {isProfile ? <HiOutlineUser /> : <HiOutlinePhotograph />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {title || (isProfile ? "Crop Profile Photo" : "Adjust & Crop Menu Photo")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle ||
                  (isProfile
                    ? "Drag, zoom, and position your photo to fit inside your circular profile avatar."
                    : "Center the subject to ensure your product photo looks great on all views.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Main Cropper Container */}
          <div className="relative w-full h-72 sm:h-84 bg-slate-950 select-none overflow-hidden flex items-center justify-center">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={isProfile ? 1 : aspectRatio}
              cropShape={effectiveCropShape}
              minZoom={0.5}
              maxZoom={3}
              objectFit={objectFit}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onMediaLoaded={onMediaLoaded}
              onCropComplete={onCropCompleteCallback}
              showGrid={!isProfile}
            />

            {/* Safe Area 1:1 Center Guide Overlay (Only for Menu mode) */}
            {!isProfile && showSafeZone && aspectRatio >= 1.2 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="relative h-[65%] aspect-square border-2 border-dashed border-amber-400/70 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] flex flex-col justify-between p-2">
                  <span className="self-center px-2 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-sm text-slate-950 text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-sm">
                    <HiShieldCheck className="text-xs" />
                    Safe Area (1:1 Cart)
                  </span>
                  <span className="self-center text-[9px] text-amber-200/90 bg-black/60 px-2 py-0.5 rounded-md font-medium text-center">
                    Keep product centered inside this square
                  </span>
                </div>
              </div>
            )}

            {/* Helper Tag */}
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium pointer-events-none">
              Drag & pinch / scroll to zoom
            </div>
          </div>

          {/* Cropper Controls & Options */}
          <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900">
            {/* Top Toolbar: Mode & Aspect Ratio (Only for Menu mode) */}
            {!isProfile && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Fit vs Cover */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Mode:
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setObjectFit("cover")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        objectFit === "cover"
                          ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Fill (Cover)
                    </button>
                    <button
                      type="button"
                      onClick={() => setObjectFit("contain")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        objectFit === "contain"
                          ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Fit (Contain)
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                    Ratio:
                  </span>
                  {[
                    { label: "4:3 (Catalog & POS)", val: 4 / 3 },
                    { label: "1:1 (Square)", val: 1 / 1 },
                    { label: "16:9 (Banner)", val: 16 / 9 },
                    {
                      label: `Original (${originalAspect.toFixed(1)})`,
                      val: originalAspect,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAspectRatio(opt.val)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        Math.abs(aspectRatio - opt.val) < 0.05
                          ? "bg-amber-500 text-white shadow-sm shadow-amber-500/25"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Zoom Slider and Rotate controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Zoom Out"
                >
                  <HiOutlineZoomOut />
                </button>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="Zoom level"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Zoom In"
                >
                  <HiOutlineZoomIn />
                </button>
                <span className="text-xs font-mono font-medium text-slate-500 w-10 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <HiRefresh className="text-sm" /> 90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Position"
                  className="px-2.5 py-1 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                {!isProfile && aspectRatio >= 1.2 && (
                  <button
                    type="button"
                    onClick={() => setShowSafeZone((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      showSafeZone
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    <HiShieldCheck className="text-sm" /> Safe Area
                  </button>
                )}
              </div>
            </div>

            {/* Live Multi-View Previews */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <HiEye className="text-amber-500 text-sm" />
                  <span>
                    {isProfile ? "Avatar Live Preview:" : "Live Placement Preview:"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLivePreview((prev) => !prev)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  {showLivePreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>

              {showLivePreview && croppedAreaPercent && (
                isProfile ? (
                  /* Profile Mode Circular Previews */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Preview 1: Main Profile Avatar (96px) */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <HiOutlineUser className="text-amber-500" /> Main Profile Avatar (96px)
                        </span>
                        <span className="text-emerald-500 font-semibold">1:1 Circle</span>
                      </div>
                      <div className="flex items-center justify-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-950 shrink-0 border-4 border-amber-500/20 shadow-md">
                          <img
                            src={imageSrc}
                            alt="Profile Avatar Preview"
                            style={{
                              position: "absolute",
                              width: `${10000 / croppedAreaPercent.width}%`,
                              height: `${10000 / croppedAreaPercent.height}%`,
                              left: `-${(croppedAreaPercent.x * 100) / croppedAreaPercent.width}%`,
                              top: `-${(croppedAreaPercent.y * 100) / croppedAreaPercent.height}%`,
                              transform: `rotate(${rotation}deg)`,
                              transformOrigin: "center center",
                              maxWidth: "none",
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                        Appearance on Account & Settings page
                      </p>
                    </div>

                    {/* Preview 2: Header / Navbar Avatar (40px) */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <HiOutlineUser className="text-amber-500" /> Header & Navbar (40px)
                        </span>
                        <span className="text-slate-400">Mini Avatar</span>
                      </div>
                      <div className="flex items-center justify-center py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-950 shrink-0 border-2 border-amber-500/30">
                            <img
                              src={imageSrc}
                              alt="Navbar Avatar Preview"
                              style={{
                                position: "absolute",
                                width: `${10000 / croppedAreaPercent.width}%`,
                                height: `${10000 / croppedAreaPercent.height}%`,
                                left: `-${(croppedAreaPercent.x * 100) / croppedAreaPercent.width}%`,
                                top: `-${(croppedAreaPercent.y * 100) / croppedAreaPercent.height}%`,
                                transform: `rotate(${rotation}deg)`,
                                transformOrigin: "center center",
                                maxWidth: "none",
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Your Name
                            </p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              Member
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                        Appearance on navigation topbar & comments
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Menu Mode Previews */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Preview 1: Catalog & POS Card (4:3) */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <HiViewGrid className="text-amber-500" /> Menu & POS Card (4:3)
                        </span>
                        <span className="text-emerald-500 font-semibold">Primary View</span>
                      </div>
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950">
                        <img
                          src={imageSrc}
                          alt="Catalog Preview"
                          style={{
                            position: "absolute",
                            width: `${10000 / croppedAreaPercent.width}%`,
                            height: `${10000 / croppedAreaPercent.height}%`,
                            left: `-${(croppedAreaPercent.x * 100) / croppedAreaPercent.width}%`,
                            top: `-${(croppedAreaPercent.y * 100) / croppedAreaPercent.height}%`,
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: "center center",
                            maxWidth: "none",
                          }}
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                          Available
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          Signature Latte
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          Rp 25.000
                        </span>
                      </div>
                    </div>

                    {/* Preview 2: Cart & Detail (1:1) */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <HiShoppingBag className="text-amber-500" /> Cart & Orders (1:1)
                        </span>
                        <span className="text-slate-400">Thumbnail</span>
                      </div>
                      <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={imageSrc}
                            alt="Cart Preview"
                            style={{
                              position: "absolute",
                              width: `${10000 / croppedAreaPercent.width}%`,
                              height: `${10000 / croppedAreaPercent.height}%`,
                              left: `-${(croppedAreaPercent.x * 100) / croppedAreaPercent.width}%`,
                              top: `-${(croppedAreaPercent.y * 100) / croppedAreaPercent.height}%`,
                              transform: `rotate(${rotation}deg)`,
                              transformOrigin: "center center",
                              maxWidth: "none",
                            }}
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            1x Signature Latte
                          </p>
                          <p className="text-[10px] text-slate-400">Regular, Normal Ice</p>
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            Rp 25.000
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                        ✓ Photo fits automatically across all cards without awkward cropping
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Info Banner */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <HiSparkles className="text-amber-500 text-base shrink-0" />
                <span>
                  Original size: <strong className="font-semibold">{formatFileSize(fileSizeBytes)}</strong>
                </span>
              </div>
              <span className="bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-lg text-[11px] self-start sm:self-auto">
                Auto-converted to WebP (-85% Size)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
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
                Processing WebP...
              </>
            ) : (
              <>
                <HiCheck className="text-base" /> Apply & Compress
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
