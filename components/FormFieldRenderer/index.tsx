"use client";
import React, { ChangeEvent } from "react";
import Checkbox from "@/components/FormInput/CheckBox";
import FormInput from "@/components/FormInput";
import CustomSelect from "@/components/FormInput/Select";
import CustomRadio from "@/components/FormInput/RadioButton";
import TextAreaField from "@/components/FormInput/Textarea";
import { FormField } from "@/types/global";
import { getFieldError } from "@/utils/utility";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";

interface Props {
  fieldList: FormField[];
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  onInputChange: (id: string, value: unknown, error?: string | null) => void;
  recaptchaRef?: React.RefObject<ReCAPTCHA | null>;
}

const FIELD_MAP: Record<string, string> = {
  text: "text",
  email: "email",
  date: "date",
  phone: "tel",
  number: "number",
  fileupload: "file",
};

export default function FieldRenderer({
  fieldList,
  formData,
  errors,
  onInputChange,
  recaptchaRef,
}: Props) {
  const handleChange = (field: FormField, value: unknown) => {
    const error = getFieldError(field, value);
    onInputChange(String(field.field_id), value, error);
  };
  return (
    <>
      {fieldList.map((field) => {
        const id = String(field.field_id);
        const label = `${field.field_label}${field.is_required ? "*" : ""}`;
        const type = field.field_type.toLowerCase();

        const descriptionElement = field.field_description ? (
          <p className="text-xs text-[#646464] font-normal mt-1 leading-relaxed">
            {field.field_description}
          </p>
        ) : null;

        if (type === "fileupload") {
          const hasFile = formData[id];
          const fileName: string =
            hasFile instanceof File
              ? hasFile.name
              : typeof hasFile === "string"
                ? hasFile
                : "";

          return (
            <div key={id} className="relative w-full h-full">
              <div className="group relative border border-(--border-gray-light) p-4 flex flex-col items-center justify-center hover:bg-gray-100 transition-all cursor-pointer overflow-hidden min-h-[140px] bg-white">
                <input
                  type="file"
                  id={id}
                  name={`input_${id}`}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      onInputChange(id, file, null);
                    }
                  }}
                  onClick={(e) => {
                    (e.currentTarget as HTMLInputElement).value = "";
                  }}
                />

                {hasFile ? (
                  <div className="flex flex-col items-center animate-fadeIn">
                    <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-full mb-3">
                      <svg
                        xmlns="http://www.w3.org"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 text-center px-4 truncate max-w-full">
                      {fileName}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold hover:underline">
                      Click to replace file
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 pointer-events-none">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded shadow-md">
                      <Image
                        src="/images/upload-icon.svg"
                        width={64}
                        height={64}
                        alt="upload"
                      />
                    </div>
                    <p className="text-lg text-[#141414] mb-0">
                      Drag & Drop or{" "}
                      <span className="font-medium text-[#141414] block">
                        Upload File
                      </span>
                    </p>
                  </div>
                )}
              </div>
              {descriptionElement}
            </div>
          );
        }

        if (type === "checkbox") {
          return (
            <div key={id} id={id} className={` ${field.item_class}`}>
              <div className="[&_label]:bg-transparent!">
                {field.field_label &&
                  field.item_class?.split(" ").includes("display-label") && (
                    <span className="mb-2 block">{field.field_label}</span>
                  )}
                {field.choices?.map((choice) => {
                  const choiceId = String(choice.field_id);

                  const htmlLabel = (
                    <span
                      dangerouslySetInnerHTML={{ __html: choice.field_label }}
                      suppressHydrationWarning={true}
                    />
                  );

                  return (
                    <Checkbox
                      key={choiceId}
                      label={htmlLabel}
                      checked={formData[choiceId] === choice.field_label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const isChecked = e.target.checked;
                        const valueToSend = isChecked ? choice.field_label : "";
                        onInputChange(choiceId, valueToSend, null);
                        const error = getFieldError(field, isChecked);
                        onInputChange(id, isChecked, error);
                      }}
                    />
                  );
                })}
                {descriptionElement}
              </div>
              {errors[id] && (
                <p className="text-(--solid-error)! error-message mt-1 text-xs!">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }

        if (type === "radio") {
          const radioChoices = field.choices?.length
            ? field.choices
            : [
                {
                  field_id: `${id}_yes`,
                  field_label: "Yes",
                  field_value: "Yes",
                },
                { field_id: `${id}_no`, field_label: "No", field_value: "No" },
              ];

          return (
            <div
              key={id}
              id={id}
              className={` ${field.item_class ? field.item_class : "md:col-span-2"}`}
            >
              <label className="block mb-4 text-[#141414] font-normal">
                {label}
              </label>
              <div className="flex flex-wrap gap-6">
                {radioChoices.map((choice, index) => {
                  const choiceLabel = choice.field_label || "";
                  const choiceValue =
                    (("field_value" in choice
                      ? (choice as { field_value: string }).field_value
                      : (choice as { field_label: string })
                          .field_label) as string) || "";

                  return (
                    <CustomRadio
                      key={`${id}_choice_${choice.field_id || index}`}
                      name={id}
                      label={choiceLabel}
                      checked={formData[id] === choiceValue}
                      onChange={() => handleChange(field, choiceValue)}
                      value={String(choiceValue)}
                    />
                  );
                })}
                {descriptionElement}
              </div>
              {errors[id] && (
                <p className="text-(--solid-error)! error-message text-sm mt-1">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }

        if (type === "time") {
          return (
            <div key={id} id={id} className="flex flex-col gap-2">
              <label className="font-normal text-[#141414]">{label}</label>
              <div className="flex gap-2">
                {field.choices?.map((choice) => {
                  const choiceId = String(choice.field_id);
                  return (
                    <div key={choiceId} className="flex-1">
                      <FormInput
                        name={choiceId}
                        placeholder={choice.field_label}
                        value={(formData[choiceId] as string) || ""}
                        maxLength={choice.field_label === "AM/PM" ? 2 : 2}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          let val = e.target.value;
                          if (choice.field_label === "AM/PM") {
                            if (val !== "" && !/^[apmAPM]+$/.test(val)) return;
                            val = val.toUpperCase();
                          }
                          onInputChange(choiceId, val, null);
                          const currentTimeData = {
                            ...field.choices?.reduce(
                              (acc, c) => ({
                                ...acc,
                                [String(c.field_id)]:
                                  String(c.field_id) === choiceId
                                    ? val
                                    : formData[String(c.field_id)],
                              }),
                              {},
                            ),
                          };
                          const error = getFieldError(field, currentTimeData);
                          onInputChange(id, currentTimeData, error);
                        }}
                      />
                    </div>
                  );
                })}
                {descriptionElement}
              </div>
              {errors[id] && (
                <p className="text-(--solid-error)! error-message text-sm mt-1">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }

        if (type === "html") {
          return (
            <div
              key={id}
              className={`flex flex-col gap-2 md:gap-2 my-4 ${field.item_class}`}
            >
              <label>
                <strong>{field.field_label}</strong>
              </label>
              <div
                className="[&_p]:last:mb-0 [&_p]:text-base! leading-6! [&_ul]:mb-4 mt-4"
                dangerouslySetInnerHTML={{
                  __html: field.field_description ?? "",
                }}
                suppressHydrationWarning={true}
              />
            </div>
          );
        }

        if (type === "select") {
          return (
            <div key={id} id={id} className={`${field.item_class}`}>
              <CustomSelect
                label={label}
                value={(formData[id] as string) || ""}
                options={
                  field.choices?.map((c) => {
                    const optionLabel = c.field_label || "";

                    const optionValue =
                      ("field_value" in c
                        ? (c as { field_value: string }).field_value
                        : (c as { field_label: string }).field_label) || "";

                    return {
                      label: optionLabel,
                      value: String(optionValue),
                    };
                  }) || []
                }
                onChange={(val) => handleChange(field, val)}
                errorMessage={errors[id]}
              />
              {descriptionElement}
            </div>
          );
        }

        if (type === "textarea") {
          return (
            <div key={id} id={id} className="md:col-span-2">
              <TextAreaField
                placeholder={label}
                value={(formData[id] as string) || ""}
                onChange={(val) => handleChange(field, val)}
                errorMessage={errors[id]}
                name={id}
              />
              {descriptionElement}
            </div>
          );
        }

        //start

        if (type === "consent") {
          const consentValues = (formData[id] as Record<string, unknown>) ?? {};
          const choice = field.choices?.[0]; // consent usually single choice
          const checkboxId = String(choice?.field_id);

          return (
            <div key={id} id={id} className={field.item_class}>
              <div className="[&_label]:bg-transparent!">
                <Checkbox
                  label={
                    <span
                      dangerouslySetInnerHTML={{
                        __html: choice?.field_label || "",
                      }}
                      suppressHydrationWarning={true}
                    />
                  }
                  checked={!!consentValues[checkboxId]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const isChecked = e.target.checked;
                    // Update formData similar to checkbox logic
                    const updated = {
                      [checkboxId]: isChecked,
                    };
                    onInputChange(id, updated, null);
                  }}
                />

                {descriptionElement}
              </div>

              {errors[id] && (
                <p className="text-(--solid-error)! error-message mt-1 text-xs!">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }

        if (type === "multi_choice" || type === "multiselect") {
          return (
            <div key={id} id={id} className={` ${field.item_class}`}>
              <div className="[&_label]:bg-transparent!">
                {field.field_label && (
                  <span className="mb-2 block">{field.field_label}</span>
                )}

                {(field.choices ?? []).map((choice, index) => {
                  // const optionValue =
                  //   ("field_value" in choice
                  //     ? choice.field_value
                  //     : choice.field_label) || "";
                  // safe local type fix (prevents "never" error)
                  const c = choice as {
                    field_id: string | number;
                    field_label: string;
                    field_value?: string;
                  };

                  const optionValue = c.field_value ?? c.field_label ?? "";

                  const htmlLabel = (
                    <span
                      dangerouslySetInnerHTML={{ __html: choice.field_label }}
                      suppressHydrationWarning={true}
                    />
                  );

                  return (
                    <Checkbox
                      //key={choice.field_id}
                      key={`${c.field_id}-${index}`}
                      label={htmlLabel}
                      checked={
                        Array.isArray(formData[id]) &&
                        (formData[id] as string[]).includes(optionValue)
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const isChecked = e.target.checked;

                        const currentValues = (formData[id] as string[]) || [];

                        const updatedValues = isChecked
                          ? [...currentValues, optionValue]
                          : currentValues.filter((v) => v !== optionValue);

                        const error = getFieldError(field, updatedValues);

                        onInputChange(id, updatedValues, error);
                      }}
                    />
                  );
                })}

                {descriptionElement}
              </div>

              {errors[id] && (
                <p className="text-(--solid-error)! error-message mt-1 text-xs!">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }

        if (type === "name") {
          const nameValues = (formData[id] as Record<string, string>) ?? {};
          return (
            <div
              key={id}
              id={id}
              className={`grid grid-cols-2 gap-4 ${field.item_class}`}
            >
              {field.choices?.map((choice) => {
                const choiceId = String(choice.field_id);

                return (
                  <div key={choiceId} className="flex flex-col gap-1">
                    <FormInput
                      name={choiceId}
                      label={choice.field_label}
                      placeholder={choice.field_label}
                      value={nameValues?.[choiceId] ?? ""}
                      errorMessage={errors[choiceId]}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                          "Enter",
                        ];

                        // NAME VALIDATION
                        if (field.field_type === "name") {
                          if (allowedKeys.includes(e.key)) return;

                          if (!/^[A-Za-z\s]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }
                      }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;

                        const updated = {
                          ...nameValues,
                          [choiceId]: val,
                        };

                        onInputChange(id, updated, null);
                      }}
                    />
                  </div>
                );
              })}

              {descriptionElement}

              {errors[id] && (
                <p className="col-span-2 text-(--solid-error)! error-message mt-1 text-xs!">
                  {errors[id]}
                </p>
              )}
            </div>
          );
        }
        if (type === "email" && (field.choices?.length ?? 0) > 1) {
          const emailValues = (formData[id] as Record<string, string>) ?? {};

          return (
            <div
              key={id}
              id={id}
              className={`grid grid-cols-2 gap-4 ${field.item_class}`}
            >
              {field.choices?.map((choice) => {
                const choiceId = String(choice.field_id);

                return (
                  <div key={choiceId} className="flex flex-col gap-1">
                    <FormInput
                      name={choiceId}
                      label={choice.field_label}
                      placeholder={choice.field_label}
                      value={emailValues?.[choiceId] ?? ""}
                      errorMessage={errors[choiceId]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;

                        const updated = {
                          ...emailValues,
                          [choiceId]: val,
                        };

                        // send composite object
                        onInputChange(id, updated, null);
                      }}
                    />
                  </div>
                );
              })}

              {descriptionElement}

              {/* {errors[id] && (
                <p className="col-span-2 text-(--solid-error)! error-message mt-1 text-xs!">
                  {errors[id]}
                </p>
              )} */}
            </div>
          );
        }

        return (
          <div
            key={id}
            className={`${field.item_class} type === "name" ? "col-span-full" : "" `}
          >
            <FormInput
              name={id}
              placeholder={label}
              label={label}
              type={FIELD_MAP[type] || "text"}
              value={(formData[id] as string) || ""}
              errorMessage={errors[id]}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Enter",
                ];

                // NAME VALIDATION
                if (field.cssClass?.includes("name-validation")) {
                  if (allowedKeys.includes(e.key)) return;

                  if (!/^[A-Za-z\s]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }

                // PHONE / TEL VALIDATION
                if (
                  field.field_type === "phone" ||
                  field.field_type === "tel" ||
                  FIELD_MAP[type] === "tel" ||
                  FIELD_MAP[type] === "phone"
                ) {
                  if (allowedKeys.includes(e.key)) return;

                  // block non-numeric keys
                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    return;
                  }

                  const value = (e.target as HTMLInputElement).value;

                  if (value.length >= 10) {
                    e.preventDefault();
                  }
                }
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                if (type === "number" && val.includes("-")) return;
                handleChange(field, val);
              }}
            />
          </div>
        );
      })}
    </>
  );
}
