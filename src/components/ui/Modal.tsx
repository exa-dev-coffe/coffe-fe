import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

export interface ModalProps {
  show: boolean;
  handleClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  persist?: boolean;
  noHeader?: boolean;
  type?: "blur" | "dark";
}

export const Modal: React.FC<ModalProps> = ({
  show,
  handleClose,
  title,
  children,
  size = "md",
  persist = false,
  noHeader = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const handleCloseRef = useRef(handleClose);

  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persist && show) {
        handleCloseRef.current();
      }
    };
    if (show) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, persist]);

  if (!show) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  const modalContent = (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => !persist && handleClose()}
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <div
          ref={modalRef}
          className={`relative w-full ${sizeClass} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/20 overflow-hidden transform transition-all duration-200 scale-100 z-10`}
          role="dialog"
          aria-modal="true"
        >
          {!noHeader && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              {title && (
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );

  // Render modal at the end of document.body to avoid parent layout interference
  return createPortal(modalContent, document.body);
};

export default Modal;
