"use client";
import { BlockData } from "@/types/global";
import { useState, useRef, useCallback, useEffect } from "react";
import SectionIntroBlock from "../SectionIntroBlock";
import Image from "next/image";
import { pushCardsToDataLayer } from "@/utils/utility";

const VideoBlock = ({ data }: { data?: BlockData }) => {
  const [showModal, setShowModal] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"play" | "pause" | "end" | "">(
    "",
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const openVideoModal = useCallback(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (showModal && videoRef.current) {
      videoRef.current
        .play()
        .catch((err) => console.log("Autoplay blocked", err));
    }
  }, [showModal]);

  useEffect(() => {
    if (videoStatus && videoRef.current) {
      pushCardsToDataLayer(videoRef.current as HTMLElement);
    }
  }, [videoStatus]);

  const closeVideoModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setVideoStatus("pause");

      videoRef.current.setAttribute("data-title", "cross");
      pushCardsToDataLayer(videoRef.current as HTMLElement);
    }

    setShowModal(false);
  }, []);

  const onVideoActionHandler = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const type = e.type;

    if (type === "play") {
      setVideoStatus("play");
    } else if (type === "pause") {
      if (!e.currentTarget.ended) {
        setVideoStatus("pause");
      }
    } else if (type === "ended") {
      setVideoStatus("end");
    }
  };

  const renderVideoContent = () => (
    <div className="md:aspect-1680/600 relative aspect-430/243 overflow-hidden group">
      {data?.main_image?.url && (
        <Image
          src={data.main_image.url}
          className="absolute inset-0 object-cover w-full h-full z-0"
          alt={data.main_image.alt || ""}
          fill
        />
      )}
      <button
        onClick={openVideoModal}
        className="absolute cursor-pointer z-10 text-white text-[33px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
      >
        <i className="icon-play"></i>
      </button>
    </div>
  );
  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;
  return (
    <div
      className={`video-block ${data?.additional_classes || ""}
       md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)`}
      style={spacingStyles}
    >
      <div className="main-container">
        {(data?.section_title || data?.section_subTitle || data?.cta) && (
          <SectionIntroBlock data={data} />
        )}

        <div
          className={`${data?.section_layout ? data?.section_layout : "container"}`}
        >
          {renderVideoContent()}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[25px]">
          <div className="absolute inset-0 bg-[#33333380]" />

          <div className="relative w-full max-w-4xl aspect-video shadow-2xl overflow-hidden bg-black ">
            <video
              ref={videoRef}
              src={data?.video}
              className="w-full h-full"
              controls
              playsInline
              data-vieweventname="video"
              data-title={videoStatus}
              data-index={data?.section_title}
              data-eventcategory={data?.section_title + " (popup)"}
              onPlay={onVideoActionHandler}
              onPause={onVideoActionHandler}
              onEnded={onVideoActionHandler}
            />

            <button
              onClick={closeVideoModal}
              className="absolute top-6 right-6 text-white w-6 md:w-10 md:h-10 h-6 flex justify-center items-center text-[10px] md:text-[16px] cursor-pointer font-bold border border-[#A7A7A7] rounded-full transition z-30"
              aria-label="Close"
            >
              <i className="icon-close"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBlock;
