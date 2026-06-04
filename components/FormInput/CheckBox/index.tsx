"use client";

import React, { ReactNode } from "react";

interface CheckboxProps {
  label?: ReactNode;
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
}) => {
  return (
    <label htmlFor={name} className="flex items-start gap-2 cursor-pointer select-none">
      <div className="mt-0.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
          id={name}
        />
        <span className="relative h-4 w-4 border-[1.5px] border-black flex items-center justify-center peer-checked:bg-[#222]">
          <i
            className={`icon-ok text-white text-[10px] absolute transition-opacity duration-200 ${
              checked ? "opacity-100" : "opacity-0"
            }`}
          ></i>
        </span>
      </div>
      <span className="text-gray-800 cursor-pointer leading-6">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
