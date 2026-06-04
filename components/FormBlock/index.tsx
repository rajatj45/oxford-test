"use client";
import React, { useEffect, useRef, useState } from "react";
import { ToastUse } from "@/components/Toast/toastContext";
import Button from "@/components/Button";
import { BlockData, FormField } from "@/types/global";
import SectionIntroBlock from "../SectionIntroBlock";
import FieldRenderer from "../FormFieldRenderer";
import { getFieldError, pushCardsToDataLayer } from "@/utils/utility";
import ReCAPTCHA from "react-google-recaptcha";
import { usePopup } from "@/context/PopupContext";
import Image from "next/image";

const isCompositeField = (type: string) => ["name"].includes(type);

const isMultiValueField = (type: string) =>
  ["multi_choice", "multiselect"].includes(type);

type FormValue =
  | string
  | string[]
  | Record<string, string>
  | boolean
  | number
  | undefined;
export default function FormBlock({
  data,
  isPopupForm,
  formSectionTitle,
}: {
  data?: BlockData;
  isPopupForm?: boolean;
  containerClass?: string;
  formSectionTitle?: string;
}) {
  const { addToast } = ToastUse();
  const [formData, setFormData] = useState<Record<string, FormValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isCaptcha = data?.enable_captcha?.includes("yes");
  const [hasErrorToast, setHasErrorToast] = useState(false);

  const { closePopup } = usePopup();

  useEffect(() => {
    if (formRef.current) {
      const submitButton = formRef.current.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;
      const buttonValueFromDom =
        submitButton?.innerText || submitButton?.textContent;

      formRef.current.setAttribute("data-index", buttonValueFromDom!);
    }
  }, []);

  const selectedData = (() => {
    const raw = data?.selected_from_id;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  })();

  const formTitle = selectedData?.form_title ?? "";
  const buttonText = selectedData?.form_cta || "Submit";

  const disableScrollForms = [
    "Popup Newsletter Form",
    "STC Popup Newsletter Form",
    "Yorkdale Popup Newsletter Form",
  ];

  const shouldDisableScroll = disableScrollForms.includes(formTitle);

  const fields: FormField[] = (() => {
    const raw = data?.form_fields;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  })();

  const fileUploadField = fields.find((f) => f.field_type === "fileupload");
  const maxFileSize = Number(fileUploadField?.fileSize);

  const groupedSections = fields.reduce(
    (
      acc: { title: string; fields: FormField[]; cssClass?: string }[],
      field,
    ) => {
      if (field.field_type === "section") {
        acc.push({
          title: field.field_label,
          cssClass: field.cssClass,
          fields: [],
        });
      } else {
        if (acc.length === 0) acc.push({ title: formTitle, fields: [] });
        acc[acc.length - 1].fields.push(field);
      }
      return acc;
    },
    [],
  );

  const handleInputChange = (
    id: string,
    value: unknown,
    error?: string | null,
  ) => {
    const field = fields.find((f) => String(f.field_id) === id);

    const computedError = field
      ? getFieldError(field, value, maxFileSize)
      : error;

    setFormData((prev) => {
      // const updated = {
      //   ...prev,
      //   [id]: value as FormValue,
      // };

      //start ------------------------------------------------
      const type = field?.field_type.toLowerCase() || "";

      const updated: Record<string, FormValue> = { ...prev };

      if (type === "consent") {
        updated[id] = value as FormValue;
      } else if (
        isCompositeField(type) &&
        typeof value === "object" &&
        value !== null
      ) {
        // ✅ store full object (name)
        updated[id] = value as FormValue;
      } else if (isMultiValueField(type)) {
        // ✅ store array directly
        updated[id] = value as FormValue;
      } else {
        // ✅ normal fields
        updated[id] = value as FormValue;
      }

      //end--------------------------------------

      const emailField = fields.find((f) =>
        f.item_class?.includes("email-value-field"),
      );

      const confirmField = fields.find((f) =>
        f.item_class?.includes("confirm-email-field"),
      );

      if (emailField && confirmField) {
        const emailId = String(emailField.field_id);
        const confirmId = String(confirmField.field_id);

        const emailValue = updated[emailId];
        const confirmValue = updated[confirmId];

        if (emailValue && confirmValue) {
          if (emailValue !== confirmValue) {
            setErrors((prevErr) => ({
              ...prevErr,
              [confirmId]: "Email does not match.",
            }));
          } else {
            setErrors((prevErr) => {
              const next = { ...prevErr };
              delete next[confirmId];
              return next;
            });
          }
        }
      }

      return updated;
    });

    setErrors((prev) => {
      const next = { ...prev };

      if (computedError) {
        next[id] = computedError;
      } else {
        delete next[id];
      }

      return next;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const fieldId = String(field.field_id);
      const value = formData[fieldId];
      const error = getFieldError(field, value);

      if (error) {
        newErrors[fieldId] = error;
      }
    });

    const emailField = fields.find((f) =>
      f.item_class?.includes("email-value-field"),
    );

    const confirmField = fields.find((f) =>
      f.item_class?.includes("confirm-email-field"),
    );

    if (emailField && confirmField) {
      const emailValue = formData[String(emailField.field_id)];
      const confirmValue = formData[String(confirmField.field_id)];

      if (emailValue !== confirmValue) {
        newErrors[String(confirmField.field_id)] = "Email does not match.";
      }
    }

    if (isCaptcha && !captchaToken) {
      newErrors["manual_captcha"] = "Please verify CAPTCHA.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (!hasErrorToast) {
        addToast("error", "Please fix errors before submitting.");
        setHasErrorToast(true);
        setTimeout(() => setHasErrorToast(false), 3000);
      }

      const firstErrorField = fields.find(
        (field) => newErrors[String(field.field_id)],
      );

      if (firstErrorField && !shouldDisableScroll) {
        const firstErrorId = String(firstErrorField.field_id);

        setTimeout(() => {
          const element = document.getElementById(firstErrorId);

          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            const focusable = element.tagName.match(/INPUT|TEXTAREA|SELECT/)
              ? element
              : element.querySelector("input, textarea, select");

            if (focusable instanceof HTMLElement) {
              focusable.focus({ preventScroll: true });
            }
          }
        }, 150);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const bodyFormData = new FormData();

      bodyFormData.append("form_id", String(selectedData?.form_id));

      fields.forEach((field) => {
        const id = String(field.field_id);
        const value = formData[id];

        if (field.field_type.toLowerCase() === "captcha") {
          return;
        }

        if (field.field_type.toLowerCase() === "time") {
          const id = String(field.field_id);
          const hh = formData[`${id}.1`];
          const mm = formData[`${id}.2`];
          const period = formData[`${id}.3`];

          if (hh && mm && period) {
            const combinedTime = `${hh}:${mm} ${period}`;
            bodyFormData.append(`input_${id}`, combinedTime);
          }

          return;
        }

        if (field.field_type.toLowerCase() === "checkbox" && field.choices) {
          field.choices.forEach((choice) => {
            const choiceId = String(choice.field_id);
            const choiceValue = formData[choiceId];

            if (choiceValue) {
              const key = `input_${choiceId.replace(".", "_")}`;
              bodyFormData.append(key, choice.field_value);
            }
          });
          return;
        }

        //added start -----------------------------------
        const type = field.field_type.toLowerCase();

        if (isMultiValueField(type)) {
          const selectedValues = formData[id] as string[] | undefined;

          if (!Array.isArray(selectedValues)) return;

          if (type === "multiselect") {
            bodyFormData.append(`input_${id}`, selectedValues.join(","));
            return;
          }

          //✅ MULTI_CHOICE / IMAGE_CHOICE → send each selected choice separately
          const choiceValues: string[] = [];

          field.choices?.forEach((choice) => {
            const choiceValue = choice.field_value;

            if (selectedValues.includes(choiceValue)) {
              bodyFormData.append(
                `input_${String(choice.field_id).replace(".", "_")}`,
                choiceValue,
              );

              choiceValues.push(choiceValue);
            }
          });

          if (choiceValues.length > 0) {
            bodyFormData.append(`input_${id}`, choiceValues.join(","));
          }
          return;
        }

        //consent
        if (type === "consent") {
          const obj = value as Record<string, unknown> | undefined;

          const choice = field.choices?.[0];
          const id = String(choice?.field_id);

          const isChecked =
            obj?.[id] === true || obj?.[id] === 1 || obj?.[id] === "1";

          if (isChecked) {
            bodyFormData.append(`input_${id}`, "1");
          }

          return;
        }

        if (field.field_type.toLowerCase() === "name") {
          const values = formData[id] as Record<string, string>;

          field.choices?.forEach((choice) => {
            const key = String(choice.field_id);
            const val = values?.[key];

            if (val) {
              bodyFormData.append(`input_${key}`, val);
            }
          });

          return;
        }

        if (
          field.field_type.toLowerCase() === "email" &&
          (field.choices?.length ?? 0) > 1
        ) {
          const values = formData[id] as Record<string, string> | undefined;

          field.choices?.forEach((choice) => {
            const key = String(choice.field_id);
            const val = values?.[key];

            if (val) {
              const inputKey = `input_${key.replace(".", "_")}`;
              bodyFormData.append(inputKey, val);
            }
          });

          return;
        }

        //end -------------------------------------------------------

        if (field.field_type === "fileupload" && value instanceof File) {
          bodyFormData.append(`input_${id}`, value);
        } else if (value !== undefined) {
          bodyFormData.append(`input_${id}`, String(value));
        }
      });
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "X-Captcha-Token": captchaToken!,
        },
        body: bodyFormData,
      });

      if (res.ok) {
        addToast("success", "Form submitted successfully!");

        closePopup(); //pop-up close

        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        setFormData({});
        setErrors({});
        pushCardsToDataLayer(formRef.current as HTMLElement);
      } else {
        addToast("error", "Submission failed. Please try again.");
      }
    } catch {
      addToast("error", "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting;
  const hasTitle = data?.section_title?.trim() !== "";
  const hasSubTitle = data?.section_subTitle?.trim() !== "";
  const hasCta = data?.cta?.url && data?.cta?.url.trim() !== "";

  const headingPlacement = data?.heading_placement == "top" ? "" : "xxxl:w-1/2";
  const containerPlacement =
    data?.heading_placement == "top" ? "" : "xxxl:w-10/12";

  const captchaRefs = {
    default: useRef(null),
    group: useRef(null),
    registration: useRef(null),
    subscription: useRef(null),
    giftcard: useRef(null),
    contest: useRef(null),
    leasing: useRef(null),
    footer: useRef(null),
  };

  const formContent = (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="[&_label]:bg-white"
      data-vieweventname="form_submit"
      data-title={formTitle}
      data-eventcategory={
        isPopupForm
          ? `${formSectionTitle ? formSectionTitle + " (popup)" : "(popup)"}`
          : data?.section_title?.replace(/<[^>]*>?/gm, "")
      }
    >
      {(formTitle === "Group Reservation Form" ||
        formTitle === "STC Group Reservation Form" ||
        formTitle === "Yorkdale Group Reservation Form") && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap xxxl:flex-nowrap gap-8 xxxl:gap-20"}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className={`w-full xxxl:w-10/12`}>
            {groupedSections.map((section, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-2xl border border-gray-200 mb-6 bg-white shadow-sm"
              >
                {data?.form_title && (
                  <h3 className="text-[40px] font-(family-name:--font-secondary) font-normal leading-10.5 mb-2">
                    {section.title}
                  </h3>
                )}

                <p className="text-[#646464] mb-6">
                  * indicates a mandatory fields
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldRenderer
                    fieldList={section.fields.filter(
                      (f) => f.field_type !== "captcha",
                    )}
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                    recaptchaRef={recaptchaRef}
                  />
                </div>
              </div>
            ))}

            {isCaptcha && (
              <div className="captcha-box mb-6">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                  onChange={(token: string | null) => {
                    setCaptchaToken(token);

                    if (token) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next["manual_captcha"];
                        return next;
                      });
                    }
                  }}
                />
                {errors["manual_captcha"] && (
                  <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                    {errors["manual_captcha"]}
                  </p>
                )}
              </div>
            )}

            <div
              className={
                isButtonDisabled ? "opacity-50 pointer-events-none" : ""
              }
            >
              <Button
                item={{
                  title: isSubmitting ? "Processing..." : buttonText,
                }}
                button_style="solid"
                buttonType="submit"
              />
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Registration Form" ||
        formTitle === "Feedback Form" ||
        formTitle === "Club Enrollment Form" ||
        formTitle === "Newsletter Form" ||
        formTitle === "STC Registration Form" ||
        formTitle === "STC Feedback Form" ||
        formTitle === "STC Club Enrollment Form" ||
        formTitle === "STC Newsletter Form" ||
        formTitle === "Yorkdale Registration Form" ||
        formTitle === "Yorkdale Newsletter Form" ||
        formTitle === "Yorkdale Feedback Form") && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap xxxl:flex-nowrap gap-4 xxxl:gap-20 "}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className={`w-full ${containerPlacement}`}>
            <div className="p-8 rounded-2xl border border-gray-200 mb-6 bg-white shadow-sm">
              {data?.form_title && (
                <>
                  <h3 className="text-[40px] font-normal font-(family-name:--font-secondary) leading-10.5">
                    {data?.form_title}
                  </h3>
                  <p className="text-[14px] text-[#646464] mb-0 font-normal mt-2 leading-5.25">
                    * indicates a mandatory fields
                  </p>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <FieldRenderer
                  fieldList={fields.filter(
                    (f) =>
                      f.field_type !== "section" && f.field_type !== "captcha",
                  )}
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                  recaptchaRef={recaptchaRef}
                />
              </div>
            </div>
            <div className="mt-8 md:mt-6">
              {isCaptcha && (
                <div className="captcha-box mb-8 md:mb-6">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                    }
                    onChange={(token: string | null) => {
                      setCaptchaToken(token);

                      if (token) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next["manual_captcha"];
                          return next;
                        });
                      }
                    }}
                  />
                  {errors["manual_captcha"] && (
                    <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                      {errors["manual_captcha"]}
                    </p>
                  )}
                </div>
              )}
              <div
                className={
                  isButtonDisabled ? "opacity-50 pointer-events-none" : ""
                }
              >
                <Button
                  item={{
                    title: isSubmitting ? "Processing..." : buttonText,
                  }}
                  button_style="solid"
                  buttonType="submit"
                />
              </div>

              {data?.content && data.content.trim() !== "" && (
                <div className="mt-6 [&_p]:text-base! [&_p]:leading-6!">
                  <div
                    dangerouslySetInnerHTML={{ __html: data.content }}
                    suppressHydrationWarning={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Subscription Form" ||
        formTitle === "STC Subscription Form" ||
        formTitle === "Yorkdale Subscription Form") && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap md:flex-nowrap gap-4 md:gap-20 [&_p]:mb-0! [&_p]:text-lg! [&_p]:font-normal!"}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement} `}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className={`w-full ${containerPlacement}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:pt-10">
              <FieldRenderer
                fieldList={fields.filter(
                  (f) =>
                    f.field_type !== "section" && f.field_type !== "captcha",
                )}
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                recaptchaRef={recaptchaRef}
              />
              <div className="mt-4 col-span-2">
                {isCaptcha && (
                  <div className="captcha-box mb-8 md:mb-6">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={
                        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                      }
                      onChange={(token: string | null) => {
                        setCaptchaToken(token);

                        if (token) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next["manual_captcha"];
                            return next;
                          });
                        }
                      }}
                    />
                    {errors["manual_captcha"] && (
                      <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                        {errors["manual_captcha"]}
                      </p>
                    )}
                  </div>
                )}
                <div
                  className={
                    isButtonDisabled ? "opacity-50 pointer-events-none" : ""
                  }
                >
                  <Button
                    item={{
                      title: isSubmitting ? "Processing..." : buttonText,
                    }}
                    button_style="solid"
                    buttonType="submit"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Gift Card Form" ||
        formTitle === "STC Gift Card Form" ||
        formTitle === "Yorkdale Gift Card Form") && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap md:flex-nowrap gap-8 md:gap-20 [&_p]:text-lg! [&_p]:font-normal!"}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className={`w-full ${containerPlacement}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:pt-10">
              <FieldRenderer
                fieldList={fields.filter(
                  (f) =>
                    f.field_type !== "section" && f.field_type !== "captcha",
                )}
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                recaptchaRef={recaptchaRef}
              />

              <div className="mt-4 col-span-1 md:col-span-2">
                {isCaptcha && (
                  <div className="captcha-box mb-8 md:mb-6">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={
                        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                      }
                      onChange={(token: string | null) => {
                        setCaptchaToken(token);

                        if (token) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next["manual_captcha"];
                            return next;
                          });
                        }
                      }}
                    />
                    {errors["manual_captcha"] && (
                      <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                        {errors["manual_captcha"]}
                      </p>
                    )}
                  </div>
                )}
                <div
                  className={
                    isButtonDisabled ? "opacity-50 pointer-events-none" : ""
                  }
                >
                  <Button
                    item={{
                      title: isSubmitting ? "Processing..." : buttonText,
                    }}
                    button_style="solid"
                    buttonType="submit"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Contest Form" || formTitle === "STC Contest Form") && (
        <div className="max-w-278 mx-auto">
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className="p-8 md:p-12 rounded-2xl border border-gray-200 bg-white shadow-sm mb-6">
            <p className="text-xs text-gray-400 mb-8">
              * indicates a mandatory fields
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {fields
                .filter(
                  (f) =>
                    f.field_type !== "section" &&
                    f.field_type !== "checkbox" &&
                    f.field_type !== "captcha",
                )
                .map((field, index) => (
                  <div key={field.field_id || index} className="col-span-1">
                    <FieldRenderer
                      fieldList={[field]}
                      formData={formData}
                      errors={errors}
                      onInputChange={handleInputChange}
                      recaptchaRef={recaptchaRef}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-6">
            {fields
              .filter((f) => f.field_type === "checkbox")
              .map((field, index) => (
                <div key={field.field_id || index} className="w-full">
                  <FieldRenderer
                    fieldList={[field]}
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                    recaptchaRef={recaptchaRef}
                  />
                </div>
              ))}

            {isCaptcha && (
              <div className="captcha-box mb-8 md:mb-6">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                  onChange={(token: string | null) => {
                    setCaptchaToken(token);

                    if (token) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next["manual_captcha"];
                        return next;
                      });
                    }
                  }}
                />
                {errors["manual_captcha"] && (
                  <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                    {errors["manual_captcha"]}
                  </p>
                )}
              </div>
            )}

            <div
              className={
                isButtonDisabled ? "opacity-50 pointer-events-none" : "w-fit"
              }
            >
              <Button
                item={{
                  title: isSubmitting ? "Processing..." : buttonText,
                }}
                button_style="solid"
                buttonType="submit"
              />
            </div>

            <div
              className={`${data?.additional_classes || ""} [&_a]:text-inherit! [&_a]:underline [&_strong]:font-medium`}
            >
              {data?.content && (
                <div
                  dangerouslySetInnerHTML={{ __html: data?.content || "" }}
                  suppressHydrationWarning={true}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Leasing Form" ||
        formTitle === "Specialty Leasing Form" ||
        formTitle === "Community Contact Form" ||
        formTitle === "STC Specialty Leasing Form" ||
        formTitle === "STC Leasing Form" ||
        formTitle === "STC Community Contact Form" ||
        formTitle === "Yorkdale Leasing Form" ||
        formTitle === "Yorkdale Specialty Leasing Form" ||
        formTitle === "Yorkdale Community Contact Form") && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap xxxl:flex-nowrap gap-8 xxxl:gap-20"}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}

          <div className="w-full xxxl:w-7/12">
            <div className="flex flex-col gap-6">
              {groupedSections.map((section, idx) => {
                const isBorderNone = section.cssClass?.includes("border-none");
                const hasHeader =
                  (idx === 0 && data?.form_title) || (idx > 0 && section.title);

                const containerClasses = isBorderNone
                  ? "w-full bg-transparent"
                  : "p-8 border border-[#A7A7A740] rounded-sm bg-white ";

                return (
                  <div key={idx} className={containerClasses}>
                    {hasHeader && (
                      <div className="mb-8">
                        <h2
                          className={
                            idx === 0
                              ? "text-[40px] leading-10.5 font-(family-name:--font-secondary) "
                              : "text-[32px]"
                          }
                        >
                          {idx === 0 ? data?.form_title : section.title}
                        </h2>
                        {idx === 0 && (
                          <p className="text-[14px] text-[#646464]">
                            * indicates a mandatory fields
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      {section.fields
                        .filter(
                          (f) => !["section", "captcha"].includes(f.field_type),
                        )
                        .map((field, index) => {
                          const label = field.field_label.toLowerCase();
                          const isFileUpload =
                            field.field_type === "fileupload";

                          const isFullWidth =
                            isBorderNone ||
                            isFileUpload ||
                            field.field_type === "select" ||
                            field.field_type === "textarea" ||
                            label.includes("organization");

                          if (isFileUpload) {
                            return (
                              <div
                                key={field.field_id || index}
                                className="col-span-1 md:col-span-2"
                              >
                                <div className="file-upload">
                                  <div className="flex justify-between xs:flex-col xm:flex-row xs:items-start xm:items-center  xs:gap-2 xm:gap-0 mb-2">
                                    <span className="text-base text-(--dark-heading)">
                                      {field.field_label}
                                    </span>
                                    <span className="text-xs text-(--primary-text)">
                                      {`Max. file size: ${maxFileSize} MB`}
                                    </span>
                                  </div>
                                  <FieldRenderer
                                    fieldList={[field]}
                                    formData={formData}
                                    errors={errors}
                                    onInputChange={handleInputChange}
                                    recaptchaRef={recaptchaRef}
                                  />
                                  {errors[field.field_id] && (
                                    <p className="text-(--solid-error)! error-message text-sm mt-1">
                                      {errors[field.field_id]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <React.Fragment key={field.field_id || index}>
                              {label.includes("from") && (
                                <div className="col-span-1 md:col-span-2">
                                  <div className="text-[18px] font-normal text-(--dark-heading) leading-6">
                                    Date of Interest
                                  </div>
                                </div>
                              )}
                              <div
                                className={`${isFullWidth ? "md:col-span-2" : "col-span-1"} flex flex-col min-h-12
                                ${field.field_type === "date" ? "2xl:w-[96%] relative col-span-2 2xl:col-span-1!" : ""}
                                ${
                                  field.field_type === "date" &&
                                  field.field_label === "From (DD-MM-YYYY)"
                                    ? "2xl:pr-6 after:2xl:absolute w-full before:w-full before:h-px before:bg-(--border-gray-light) before:2xl:bg-transparent before:absolute before:-bottom-1.25 after:mt-2 after:text-center  after:content-['Until'] after:2xl:-right-9.5 2xl:after:w-[9%] after:bg-white after:text-(--primary-text) after:w-12.5 after:z-10 after:relative after:top-3.75 after:mx-auto    after:xl:top-2.5"
                                    : ""
                                }
                                   ${
                                     field.field_type === "date" &&
                                     field.field_label === "To (DD-MM-YYYY)"
                                       ? "2xl:w-full 2xl:pl-6"
                                       : ""
                                   }`}
                              >
                                <FieldRenderer
                                  fieldList={[field]}
                                  formData={formData}
                                  errors={errors}
                                  onInputChange={handleInputChange}
                                  recaptchaRef={recaptchaRef}
                                />
                              </div>
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                );
              })}

              {isCaptcha && (
                <div className="captcha-box">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                    }
                    onChange={(token: string | null) => {
                      setCaptchaToken(token);
                      if (token) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next["manual_captcha"];
                          return next;
                        });
                      }
                    }}
                  />
                  {errors["manual_captcha"] && (
                    <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                      {errors["manual_captcha"]}
                    </p>
                  )}
                </div>
              )}

              <div
                className={
                  isButtonDisabled ? "opacity-50 pointer-events-none" : "w-fit"
                }
              >
                <Button
                  item={{ title: isSubmitting ? "Processing..." : buttonText }}
                  button_style="solid"
                  buttonType="submit"
                  mainClass="font-normal"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {(formTitle === "Popup Newsletter Form" ||
        formTitle === "STC Popup Newsletter Form" ||
        formTitle === "Yorkdale Popup Newsletter Form") && (
        <div
          className={`${
            data?.heading_placement == "top"
              ? "flex flex-col justify-center items-center"
              : "flex flex-wrap md:flex-nowrap gap-8 md:gap-20"
          }`}
        >
          {(hasTitle || hasSubTitle) &&
            ((data?.section_title != "" && data?.section_title != undefined) ||
              (data?.section_subTitle != "" &&
                data?.section_subTitle != undefined)) && (
              <div className={`w-full ${headingPlacement}`}>
                <SectionIntroBlock
                  data={data}
                  layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                  sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
                />
              </div>
            )}
          <div className="w-full [&_p]:mb-0! [&_p]:text-lg! [&_p]:font-normal!">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <FieldRenderer
                  fieldList={fields.filter(
                    (f) =>
                      f.field_type !== "section" && f.field_type !== "captcha",
                  )}
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                  recaptchaRef={recaptchaRef}
                />

                <div className="col-span-full">
                  {isCaptcha && (
                    <div className="captcha-box origin-top-left scale-80 sm:scale-100 mb-8 md:mb-6">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={
                          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                        }
                        onChange={(token: string | null) => {
                          setCaptchaToken(token);

                          if (token) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next["manual_captcha"];
                              return next;
                            });
                          }
                        }}
                      />
                      {errors["manual_captcha"] && (
                        <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                          {errors["manual_captcha"]}
                        </p>
                      )}
                    </div>
                  )}
                  <div
                    className={
                      isButtonDisabled ? "opacity-50 pointer-events-none" : ""
                    }
                  >
                    <Button
                      item={{
                        title: isSubmitting ? "Processing..." : buttonText,
                      }}
                      button_style="solid"
                      buttonType="submit"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {![
        "Contest Form",
        "Leasing Form",
        "Specialty Leasing Form",
        "Registration Form",
        "Group Reservation Form",
        "Feedback Form",
        "Gift Card Form",
        "Subscription Form",
        "Popup Newsletter Form",
        "Newsletter Form",
        "Club Enrollment Form",
        "Community Contact Form",
        "STC Subscription Form",
        "STC Specialty Leasing Form",
        "STC Leasing Form",
        "STC Registration Form",
        "STC Feedback Form",
        "STC Gift Card Form",
        "STC Contest Form",
        "STC Group Reservation Form",
        "STC Popup Newsletter Form",
        "STC Club Enrollment Form",
        "STC Newsletter Form",
        "STC Community Contact Form",
        "Yorkdale Subscription Form",
        "Yorkdale Popup Newsletter Form",
        "Yorkdale Registration Form",
        "Yorkdale Group Reservation Form",
        "Yorkdale Gift Card Form",
        "Yorkdale Newsletter Form",
        "Yorkdale Leasing Form",
        "Yorkdale Specialty Leasing Form",
        "Yorkdale Feedback Form",
        "Yorkdale Community Contact Form",
      ].includes(formTitle) && (
        <div
          className={`${data?.heading_placement == "top" ? "flex flex-col justify-center items-center" : "flex flex-wrap xxxl:flex-nowrap gap-8 xxxl:gap-20"}`}
        >
          {(hasTitle || hasSubTitle || hasCta) && (
            <div className={`w-full ${headingPlacement}`}>
              <SectionIntroBlock
                data={data}
                layoutClass="w-full! px-0!  [&_.heading-block]:px-0! [&_.heading-block]:w-full!"
                sectionClass={`${data?.section_alignment === "left" || data?.section_alignment === "right" ? "w-full! px-0!" : ""}`}
              />
            </div>
          )}
          <div className="w-full xxxl:w-10/12">
            <div className="p-8 rounded-2xl border border-gray-200 mb-6 shadow-sm">
              {data?.form_title && (
                <h3 className="text-xl font-bold mb-2">{data?.form_title}</h3>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldRenderer
                  fieldList={fields.filter(
                    (f) =>
                      f.field_type !== "section" && f.field_type !== "captcha",
                  )}
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                  recaptchaRef={recaptchaRef}
                />
              </div>
            </div>
            <div className="mt-6">
              {isCaptcha && (
                <div className="captcha-box mb-8 md:mb-6">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string
                    }
                    onChange={(token: string | null) => {
                      setCaptchaToken(token);

                      if (token) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next["manual_captcha"];
                          return next;
                        });
                      }
                    }}
                  />
                  {errors["manual_captcha"] && (
                    <p className="text-(--solid-error)! error-message mt-2 text-xs!">
                      {errors["manual_captcha"]}
                    </p>
                  )}
                </div>
              )}
              <div
                className={
                  isButtonDisabled ? "opacity-50 pointer-events-none" : ""
                }
              >
                <Button
                  item={{
                    title: isSubmitting ? "Processing..." : buttonText,
                  }}
                  button_style="solid"
                  buttonType="submit"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;
  return (
    <div
      className={`tru-block form-block
      md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)
      ${data?.additional_classes}
`}
      style={spacingStyles}
    >
      <div className="main-container">
        {data?.section_layout === "container" ||
        data?.section_layout === "boxed" ? (
          <div className={data.section_layout}>{formContent}</div>
        ) : (
          formContent
        )}
      </div>
    </div>
  );
}
