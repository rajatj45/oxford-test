"use client";

import React, { FocusEventHandler, useState } from "react";

interface FormInputProps {
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  errorMessage?: string;
  validate?: (value: string) => string | null;
  maxLength?: number;
  showCounter?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  className?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = false,
  pattern,
  errorMessage = "",
  validate,
  maxLength,
  showCounter = false,
  onChange,
  onClick,
  className,
  onFocus,
  onBlur,
  onKeyDown,
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValidation = (val: string) => {
    if (required && !val.trim()) return "This field is required";

    if (typeof maxLength === "number" && val.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }

    if (pattern && !new RegExp(pattern).test(val)) return errorMessage;

    if (validate) return validate(val);

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(e);

    const err = handleValidation(newValue);
    setError(err);
  };

  return (
    <div className="flex flex-col gap-1 relative">
      {type !== "date" ? (
        <>
          <input
            id={name}
            name={name}
            type={type}
            value={currentValue}
            placeholder={placeholder}
            onChange={handleChange}
            onClick={onClick}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            maxLength={typeof maxLength === "number" ? maxLength : undefined}
            className={`
          peer block w-full pl-3 xm:pr-7 py-2 border-y border-t-transparent  border-x-transparent border-x border-(--primary-text)
           focus:border focus:border-(--secondary) focus:outline-none  pr-2 placeholder:text-[14px] xm:placeholder:text-[16px] xxxl:placeholder:text-[16px]
          ${error ? "border-red-500" : ""}
        ${
          label
            ? ""
            : "focus:border-b focus:border-transparent focus:border-b-(--secondary)"
        } ${className} `}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          {label && (
            <label
              htmlFor={name}
              className={`absolute left-3 top-2 text-(--primary-text) bg-(--surface-primary) px-1 transition-all pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-(--secondary) peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm
          `}
            >
              {label}
            </label>
          )}
        </>
      ) : (
        <>
          <div className="">
            <input
              id={name}
              name={name}
              type={type}
              value={currentValue}
              placeholder={placeholder}
              onChange={handleChange}
              onClick={(e) => {
                const el = e.currentTarget as HTMLInputElement;
                el.showPicker?.();
                onClick?.(e);
              }}
              onBlur={onBlur}
              onFocus={onFocus}
              maxLength={typeof maxLength === "number" ? maxLength : undefined}
              className={`
    peer block w-full px-3 py-2 border-y border-t-transparent border-x-transparent border-x border-(--primary-text)
    bg-transparent focus:border focus:border-b-(--secondary) focus:outline-none
    ${error ? "border-red-500" : ""}
    ${
      label
        ? ""
        : "focus:border-b focus:border-transparent focus:border-b-(--secondary)"
    } ${className}
  `}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            />

            {label && (
              <label
                htmlFor={name}
                className={`absolute
           left-3 top-2.5 w-[80%] text-(--primary-text) bg-(--surface-primary) px-1 transition-all pointer-events-none peer-placeholder-shown:top-2 peer-placeholder-shown:text-base  peer-focus:text-sm peer-focus:text-transparent
           peer-focus:opacity-0 ${currentValue.length !== 0 ? "opacity-0" : "opacity-100"}  `}
              >
                {label}
              </label>
            )}
          </div>
        </>
      )}
      {errorMessage && (
        <p className="text-(--solid-error)!  error-message text-xs! mt-1">
          {errorMessage}
        </p>
      )}

      {showCounter && typeof maxLength === "number" && (
        <div className="flex justify-end">
          <span className="text-(--primary-text)  text-[11px] mt-1">
            {currentValue.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
