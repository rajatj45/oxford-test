"use client";
import { usePopup } from "@/context/PopupContext";
import { useEffect } from "react";

export default function Loader() {
  const {isLoaderActive,setIsLoaderActive} = usePopup();

  useEffect(() => {
    const handleLoad = () => {
      setIsLoaderActive(false);
      document.body.classList.remove("overflow-hidden!");
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      
    };
  }, [isLoaderActive,setIsLoaderActive]);

  if (!isLoaderActive) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-(--primary) rounded-full animate-spin"></div>
    </div>
  );
}