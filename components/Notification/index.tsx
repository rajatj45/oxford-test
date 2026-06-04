"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

type NotificationData = {
  show?: boolean;
  title?: string;
  message?: string;
  cta?: {
    url: string;
    title: string;
    target: string;
  };
};

type NotificationProps = {
  notificationData: NotificationData | undefined;
  icon: string;
  className: string;
};

const Notification = ({
  notificationData,
  icon,
  className,
}: NotificationProps) => {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  const shouldShow = visible && notificationData?.show;

useEffect(() => {
  if (shouldShow) {
    document.body.classList.add('navbar-show');
  } else {
    document.body.classList.remove('navbar-show');
  }

  // Cleanup function to remove class when component unmounts
  return () => document.body.classList.remove('navbar-show');
}, [shouldShow]);

if (!shouldShow) return null;
  if (!visible || !notificationData?.show) return null;

  return (
    <>
      <div
        role="alert"
        className={`${className} lg:h-16 h-full bg-(--secondary) text-white transition-all duration-300 ease-in-out z-[9999] ${
          closing ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="container h-full">
          <div className="flex md:items-center py-4 justify-between flex-col items-start md:flex-row flex-wrap lg:flex-nowrap relative pr-8 md:pr-13 h-full">
            <div className="flex items-center gap-2">
              {icon && <i className={icon}></i>}
              <div
                onClick={() => setShowTooltip(!showTooltip)}
                className="line-clamp-1 max-[940px]:cursor-pointer [&_p]:text-white [&_p]:mb-0 pr-8 md:pr-0"
                dangerouslySetInnerHTML={{
                  __html: notificationData?.message ?? "",
                }}
              />
            </div>
            <div>
              {notificationData?.cta?.url && (
                <Link
                  className="text-sm leading-3.5 mt-4 md:mt-0 capitalize inline-block"
                  href={notificationData.cta.url}
                  target={notificationData.cta.target}
                >
                  {notificationData.cta.title || "sfdsf"}
                </Link>
              )}
               <div className="flex items-center">
                <button
                  onClick={handleClose}
                  className="text-white absolute top-1/2 -translate-1/2 -right-2.5 cursor-pointer p-1"
                >
                  <i className="icon-close"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute left-6.25 lg:hidden  w-[90%] max-w-md z-999999 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="absolute -top-1.5 left-1.25 w-3 h-3 bg-white z-0 rotate-45 "></div>
          <div className="bg-white text-black p-4 shadow-xl border border-gray-100">
            <div
              className="text-sm leading-normal text-gray-600 [&_p]:mb-0 [&_p]:text-sm" 
              dangerouslySetInnerHTML={{
                __html: notificationData?.message ?? "",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
