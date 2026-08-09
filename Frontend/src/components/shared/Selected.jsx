import { useEffect, useRef, useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

export default function Selected({
  value,
  options = [],
  onChange,
  emptyOption = true,
  emptyLabel = "All",
  placeholder = "Select",
  className = "",
  dropdownClassName = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel =
    value === ""
      ? emptyLabel
      : options.find((item) =>
          typeof item === "object"
            ? item.value === value
            : item === value
        );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue) => {
    onChange?.(newValue);
    setOpen(false);
  };

  const normalizeOption = (item) => {
    if (typeof item === "object") {
      return {
        label: item.label,
        value: item.value,
      };
    }
    return {
      label: item,
      value: item,
    };
  };

  const getCurrentLabel = () => {
    if (value === "" && emptyOption) {
      return emptyLabel;
    }

    if (typeof selectedLabel === "object") {
      return selectedLabel?.label;
    }

    return selectedLabel || placeholder;
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
    >
      {/* Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center justify-between gap-3 rounded-xl border px-3 text-sm transition-all duration-200
          ${ disabled ? "cursor-not-allowed bg-gray-100 text-gray-400 opacity-60" : "cursor-pointer bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-white"}
          ${ open ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-gray-200"}
        `}
      >
        <span className="truncate">
          {getCurrentLabel()}
        </span>

        <MdOutlineKeyboardArrowDown
          size={16}
          className={`
            shrink-0 transition-all duration-300
            ${
              open
                ? "rotate-180 text-blue-500"
                : "text-gray-400"
            }
          `}
        />
      </button>

      {/* Dropdown */}
      <div
        className={` absolute left-0 top-full z-50 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-200/60 origin-top transition-all duration-200 ease-out
          ${ open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0"} ${dropdownClassName}
        `}
      >
        <div className="max-h-80 overflow-y-auto">
          {emptyOption && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer
                ${value === "" ? "bg-blue-50 font-medium text-blue-600" : "text-gray-600 hover:bg-blue-200/40 hover:text-gray-900"}
              `}
            >
              <span>{emptyLabel}</span>
            </button>
          )}

          {/* Options */}
          {options.map((item) => {
            const option = normalizeOption(item);
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer
                  ${ active ? "bg-blue-50 font-medium text-blue-600" : "text-gray-600 hover:bg-blue-200/40 hover:text-gray-900"}
                `}
              >
                <span className="truncate">
                  {option.label}
                </span>
              </button>
            );
          })}

          {/* ไม่มีข้อมูล */}
          {options.length === 0 && !emptyOption && (
            <div className="px-3 py-5 text-center text-sm text-gray-400">
              No Data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}