"use client";

import { useEffect, useState } from "react";

export default function Preloader({ isLoading }: { isLoading?: boolean }) {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center opacity-75  bg-(--overlay-popup) transition-opacity duration-500">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-[#35A131]" />
    </div>
  );
}