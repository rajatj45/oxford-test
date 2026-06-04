import React from "react";

interface CustomRadioProps {
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const CustomRadio: React.FC<CustomRadioProps> = ({
  name,
  value,
  label,
  checked = false,
  onChange,
  disabled = false,
  error = false,
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="hidden"
      />

      <span
        className={`w-4 h-4 mr-2 flex items-center justify-center border-2 rounded-full
          ${
            error
              ? "border-red-500"
              : checked
                ? "border-(--secondary) bg-(--secondary)"
                : "border-(--secondary)"
          }
        `}
      >
        {checked && (
          <span className="w-[7px] h-[7px] bg-white rounded-full"></span>
        )}
      </span>

      <span className={error ? "!text-(--solid-error)" : ""}>{label}</span>
    </label>
  );
};

export default CustomRadio;
