    "use client";

import { ToastProvider } from "@/components/Toast/toastContext";
import SearchProvider from "./context/SearchProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SearchProvider>
        {children}
      </SearchProvider>
    </ToastProvider>
  );
}
