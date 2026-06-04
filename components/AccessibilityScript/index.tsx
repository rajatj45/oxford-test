"use client";

import Script from "next/script";

export default function AccessibilityScript() {
  return (
    <Script
      id="accessibe-script"
      src="https://acsbapp.com/apps/app/dist/js/app.js"
      strategy="afterInteractive"
      onLoad={() => {
        try {
          if (window.acsbJS?.init && !window.__acsb_initialized__) {
            window.acsbJS.init();
            window.__acsb_initialized__ = true;
          }
        } catch (error) {
          console.error("Accessibility script init failed:", error);
        }
      }}
    />
  );
}
