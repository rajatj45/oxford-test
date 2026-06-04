"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

interface CustomSelectProps {
  label?: string;
  required?: boolean;
  options: Option[];
  name?: string;
  value?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;

}

export default function CustomSelect({
  label,
  options,
  name,
  value,
  errorMessage,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="w-full relative ">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between py-2 px-3 cursor-pointer text-left border-b
          ${errorMessage ? "border-(--primary-text)" : "border-(--primary-text)"}
          focus:outline-none`}
      >
        <span
          className={
            selectedOption ? "text-(--primary-text) " : "text-(--primary-text)"
          }
        >
          {selectedOption ? selectedOption.label : label}
        </span>

        <svg
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <ul className="mt-2 ml-0 border border-gray-200 bg-white shadow-lg max-h-100 overflow-y-scroll  overflow-hidden z-10 absolute w-full">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.label.replace('&amp;', "&")}
            </li>
          ))}
        </ul>
      )}

      {errorMessage && (
        <p className="mt-2 text-[14px]! text-red-600">{errorMessage}</p>
      )}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
    </div>
  );
}
