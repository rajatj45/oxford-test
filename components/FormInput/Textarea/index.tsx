import React, { useState } from "react";

interface TextAreaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  disabled?: boolean;
  errorMessage?: string;
  validate?: (value: string) => string | null;
  className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  errorMessage,
  validate,
  className,
}) => {
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
  };

  const error = touched && validate ? validate(value) : errorMessage;

  return (
    <div className="flex flex-col w-full relative">
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        className={` peer block w-full px-3 py-2 border-y border-t-transparent border-x-transparent border-x border-b-(--primary-text)
          bg-transparent focus:border focus:border-black focus:rounded-0 placeholder:text-(--primary-text) focus-visible:outline-(--secondary) transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} ${className}`}
      />
      <label
        htmlFor={name}
        className="
          absolute left-3 top-2 text-(--primary-text) bg-(--surface-primary) px-1 transition-all
          pointer-events-none
          peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
          peer-focus:-top-3 peer-focus:text-sm peer-focus:text-(--secondary)
          peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-sm
        "
      >
        {label}
      </label>
      {error && (
        <span className="text-(--solid-error)! mt-1 text-sm">{error}</span>
      )}
    </div>
  );
};

export default TextAreaField;
