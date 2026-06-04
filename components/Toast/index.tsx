"use client";

import { JSX } from "react";
import type { Toast } from "./toastContext";
import Image from "next/image";

const icons: Record<Toast["type"], JSX.Element> = {
  success: (
    <Image
      src="/images/icons/success-icon.svg"
      alt="success-icon"
      width={24}
      height={24}
    />
  ),
  error: <i className="icon-close text-(--solid-error) text-sms"></i>,
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-yellow-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01M4.93 19h14.14c1.05 0 1.57-1.2.96-2.05L13.96 4.05c-.6-.85-1.87-.85-2.47 0L3.97 16.95c-.6.85-.09 2.05.96 2.05z"
      />
    </svg>
  ),
};

export default function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="fixed top-5 left-0 right-0 z-99999 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex justify-between items-start gap-3 max-w-[calc(100%-48px)] relative  md:max-w-[639px] mx-auto rounded-lg bg-white px-4 py-3 shadow-3xl  animate-slide-in`}
        >
          <div className="flex items-center gap-2.5">
            <span className="mt-0.5  text-lg">{icons[toast.type]}</span>

            <p className="flex-1 text-sm text-(--dark-heading) mb-0!">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => onClose(toast.id)}
            className="text-(--dark-heading) cursor-pointer"
            aria-label="Close notification"
          >
            <i className="icon-close top-1/2 -translate-1/2 absolute right-2"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
