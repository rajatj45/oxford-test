"use client";
import {
  createContext,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useEffect,
} from "react";

interface PopupContextType {
  isPopupOpen: boolean;
  setIsPopupOpen: Dispatch<SetStateAction<boolean>>;
  isLoaderActive: boolean;
  setIsLoaderActive: Dispatch<SetStateAction<boolean>>;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType>({
  isPopupOpen: false,
  setIsPopupOpen: () => {},
  isLoaderActive: false,
  setIsLoaderActive: () => {},
  closePopup: () => {},
});

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  
  const [isPopupOpen, setIsPopupOpen] = useState(() => {
    if (typeof document !== "undefined") {
      return !document.cookie.includes("hideNewsletter=true");
    }
    return false;
  });

  const [isLoaderActive, setIsLoaderActive] = useState(true);

  
  useEffect(() => {
    if (isPopupOpen) {
      document.documentElement.classList.add("[&_body]:overflow-hidden!");
    } else {
      document.documentElement.classList.remove("[&_body]:overflow-hidden!");
    }
  }, [isPopupOpen]);

  
  const closePopup = () => {
    document.cookie = `hideNewsletter=true; path=/; SameSite=Lax`;
    setIsPopupOpen(false);
  };

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen,
        setIsPopupOpen,
        isLoaderActive,
        setIsLoaderActive,
        closePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);