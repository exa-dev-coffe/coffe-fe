import React, { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiX, HiSearch } from "react-icons/hi";

export interface DropdownOption {
  value: number;
  label: string;
}

export interface DropdownProps {
  label?: string;
  name?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: DropdownOption | null;
  setValue: (val: DropdownOption | null) => void;
  setOptions?: (opts: DropdownOption[]) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  footerAction?: { label: React.ReactNode; onClick: () => void };
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  name,
  placeholder = "Select an option...",
  options = [],
  value,
  setValue,
  setOptions,
  error,
  disabled = false,
  required = false,
  className = "",
  footerAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const displayedOptions = filteredOptions.slice(0, 100);

  const handleSelect = (option: DropdownOption) => {
    setValue(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(null);
    if (setOptions && value) {
      const exists = options.some((o) => o.value === value.value);
      if (!exists) {
        setOptions([...options, value].sort((a, b) => a.value - b.value));
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full space-y-1.5 ${className}`}
    >
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div
        id={name}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/80 border rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer select-none focus-ring ${
          isOpen
            ? "border-amber-500 ring-2 ring-amber-500/20"
            : error
              ? "border-rose-400 dark:border-rose-500/70"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""}`}
      >
        <span
          className={`truncate ${value ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-500"}`}
        >
          {value?.label || placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 text-slate-400 dark:text-slate-500">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear selection"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
          <HiChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden animate-fade-in max-h-64 flex flex-col">
          {options.length > 3 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-700/60 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div className="relative flex items-center">
                <HiSearch className="absolute left-3 text-slate-400 text-sm pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-52">
            {filteredOptions.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching options
              </p>
            ) : (
              <>
                {displayedOptions.map((opt) => {
                  const isSelected = value?.value === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
                      className={`px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                  );
                })}
                {filteredOptions.length > 100 && (
                  <p className="p-2 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700/50">
                    Menampilkan 100 dari {filteredOptions.length} hasil. Ketik untuk menyaring.
                  </p>
                )}
              </>
            )}
          </div>
          {footerAction && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  footerAction.onClick();
                }}
                className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                {footerAction.label}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default Dropdown;
