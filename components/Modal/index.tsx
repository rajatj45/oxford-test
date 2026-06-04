"use client";
import { usePopup } from "@/context/PopupContext";
import { pushCardsToDataLayer } from "@/utils/utility";


interface ModalProps {
  children: React.ReactNode;
  title?: string;
  modalCustomClass?: string;
}

export default function Modal({
  children,
  title,
  modalCustomClass,
}: ModalProps) {
 

  const { closePopup, isPopupOpen, isLoaderActive } = usePopup();

  const isVisible = isPopupOpen && !isLoaderActive;

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
  pushCardsToDataLayer(e.currentTarget as HTMLElement, e.type);
  closePopup(); 
};

  return (
    <div
      aria-hidden={!isVisible}
      className={`${
        isVisible ? "flex" : "hidden"
      } fixed inset-0 z-9999 items-center justify-center  bg-black/50 backdrop-blur-sm px-4`}
    >
      <div
        className={`bg-white w-full relative  ${modalCustomClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-b-[#A7A7A740] px-8 py-6 ">
          {title && (
            <h2 className="text-2xl md:text-[32px] font-normal w-full pr-10 leading-9">
              {title}
            </h2>
          )}
          <button
            onClick={(e) => handleClose(e)}
            data-clickeventname="popup-click"
            data-title="Cross"
            className="absolute right-6 top-6 cursor-pointer border border-[#A7A7A7] p-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <i className="icon-close text-md leading-6 text-black"></i>
          </button>
        </div>

        <div className="py-8 px-8 max-h-[60vh] overflow-y-auto mb-5 md:mb-0 h-[430px] md:h-auto">
          { children }
        </div>
      </div>
    </div>
  );
}
