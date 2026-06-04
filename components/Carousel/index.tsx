"use client";
import { ReactNode, useRef, useEffect,forwardRef } from "react";
import Slider, { Settings } from "react-slick";

interface CarouselProps {
  children?: ReactNode;
  settings?: Settings;
  prevArrowClassName?: string;
  nextArrowClassName?: string;
  className?: string;
  dotClass?:  string;
}

const CustomPrevArrow = ({
  onClick,
  customClassName,
}: {
  onClick?: () => void;
  customClassName?: string;
}) => (
  <button
    onClick={onClick}
    aria-label="Previous Slide"
    className={`absolute left-3 top-[50%] transform -translate-y-1/2  cursor-pointer z-10 text-white p-2 w-12 h-12 transition bg-(--cta-color)  ${customClassName} `}
  >
    <i className="icon-long-arrow-left before:w-auto! before:my-0! " aria-hidden="true"></i>
  </button>
);

const CustomNextArrow = ({
  onClick,
  customClassName = "",
}: {
  onClick?: () => void;
  customClassName?: string;
}) => (
  <button
    onClick={onClick}
    aria-label="Next Slide"
    className={`absolute right-3 top-[50%] transform -translate-y-1/2 cursor-pointer z-10 text-white p-2 w-12 h-12 transition  bg-(--cta-color) ${customClassName} `}
  >
    <i className="block before:w-auto! before:my-0! rotate-180  icon-long-arrow-left" aria-hidden="true"></i>
  </button>
);

const Carousel = forwardRef<Slider, CarouselProps>(
  (
    {
      children,
      settings: customSettings,
      prevArrowClassName,
      nextArrowClassName,
      className,
      dotClass,
    },
    ref
  )  => {

    const sliderRef = useRef<Slider | null>(null);

    useEffect(() => {
    // wait for hydration + layout
    setTimeout(() => {
      sliderRef.current?.slickPlay();
      sliderRef.current?.slickGoTo(0, true);
    }, 100);
  }, []);

  const defaultSettings: Settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 100,
    slidesToShow: 1,
    slidesToScroll: 1,
    focusOnSelect: false,
    accessibility: true,
    pauseOnFocus: true,
    arrows: true,
    nextArrow: <CustomNextArrow customClassName={nextArrowClassName} />,
    prevArrow: <CustomPrevArrow customClassName={prevArrowClassName} />,
    dotsClass: `slick-dots ${dotClass}`
  };
  const settings = { ...defaultSettings, ...customSettings };
  const bottomSpace = settings?.dots?'mb-8':'';

  return (
    <Slider ref={ref} {...settings} className={`${className} ${bottomSpace} ${dotClass && ""}`}>
      {children}
    </Slider>
  );
});
Carousel.displayName = "Carousel";

export default Carousel;
