'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ButtonData {
    title?: string;
    beforeIcon?: string;
    afterIcon?: string;
    ariaLabel?: string;
    target?: string;
    url?: string;
    disabled?: boolean;
}

interface ButtonComponentProps {
    item: ButtonData;
    button_style?: "outline" | "solid" | "text" | "double-icon";
    wrapperClass?: string;
    mainClass?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    buttonType?: "submit" | "reset" | "button" | undefined;
    sectionTitle?: string;
}

const Button = ({
    item,
    button_style = "text",
    wrapperClass = "",
    mainClass = "",
    onClick,
    sectionTitle,
    buttonType = "button",
}: ButtonComponentProps) => {
    const { title, beforeIcon, afterIcon, ariaLabel, target, url, disabled } = item;

    const commonClasses = `text-lg leading-6 font-regular flex flex-row items-center justify-center gap-3 ${mainClass}`;
const isImagePath = typeof beforeIcon === 'string' && /^(?:\/|https?:\/\/|\.|data:image).*/.test(beforeIcon);
    const renderLink = () => (
        <Link
            href={url || ""}
            role="button"
            className={`${commonClasses} ${!url ? 'cursor-default' : 'cursor-pointer'} ${getButtonStyleClasses()} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            target={target || '_self'}
            aria-label={ariaLabel || title || ''}
            aria-disabled={disabled || undefined}
            onClick={disabled ? (e) => e.preventDefault() : onClick}
            data-clickeventname="cta_click"
            data-title={title}
            data-eventcategory={
                Array.isArray(sectionTitle) ? sectionTitle[0] : sectionTitle
            }
            data-tag={
                Array.isArray(sectionTitle) ? sectionTitle[0] : sectionTitle
            }
        >
            {beforeIcon && (
                <Image
                    src={beforeIcon}
                    alt={title || ''}
                    fill
                    className="object-contain w-[30px]! h-[30px]! relative!"
                />

            )}
            <span className="flex items-center gap-2">
                {title || ""}
                {/* {target === "_blank" && <i className="icon-arrow-up-right"></i>} */}
            </span>
            {afterIcon && (
                <Image
                    src={afterIcon}
                    alt={title || ''}
                    fill
                    className="object-contain w-[30px]! h-[30px]! relative!"
                />
            )}
        </Link>
    );

    const renderButton = () => (
        <button
            type={buttonType}
            className={`${commonClasses} ${getButtonStyleClasses()} cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-label={ariaLabel || title || ''}
            aria-disabled={disabled || undefined}
            onClick={disabled ? (e) => e.preventDefault() : onClick}
            disabled={disabled}
            data-clickeventname="button_click"
            data-title={title}
            data-eventcategory={
                Array.isArray(sectionTitle) ? sectionTitle[0] : sectionTitle
            }
            data-tag={
                Array.isArray(sectionTitle) ? sectionTitle[0] : sectionTitle
            }
        >
           {beforeIcon && (
    isImagePath ? (
        <div className="relative w-[30px] h-[30px]">
            <Image
                src={beforeIcon}
                alt={title || ''}
                fill
                className="object-contain"
            />
        </div>
    ) : (
        <i className={beforeIcon} aria-hidden="true"></i>
    )
)}
            <span className="flex items-center gap-2">
                {title || ""}
            </span>
             {afterIcon && (
    isImagePath ? (
        <div className="relative w-[30px] h-[30px]">
            <Image
                src={afterIcon}
                alt={title || ''}
                fill
                className="object-contain"
            />
        </div>
    ) : (
        <i className={afterIcon} aria-hidden="true"></i>
    )
)}
            {/* {afterIcon && (
                <Image
                    src={afterIcon}
                    alt={title || ''}
                    fill
                    className="object-contain w-[30px]! h-[30px]! relative!"
                />
            )} */}
        </button>
    );

    const getButtonStyleClasses = () => {
        switch (button_style) {
            case "outline":
                return "bg-white border border-(--border-light) rounded-none px-8 py-3";
            case "solid":
                return "bg-(--primary) text-white! px-8 py-3 border border-(--border-light) rounded-none";
            case "text":
                return "text-(--dark-heading) underline p-0";
            case "double-icon":
                return "flex gap-[14px] px-8 py-3 border border-(--border-light) rounded-none";
            default:
                return "";
        }
    };

    return (
        <div className={wrapperClass}>
            {url ? renderLink() : renderButton()}
        </div>
    );
};

export default Button;
