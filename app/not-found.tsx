"use client";
import Button from "@/components/Button";
import Image from "next/image";
import { getBaseUrl, pushCardsToDataLayer } from "@/utils/utility";

export default function NotFound() {
  const handleButtonClick = (e?: React.MouseEvent<HTMLElement>) => {
    const target = e?.currentTarget;
    const href = target?.getAttribute("href") || "";

    if (!href || href.trim() === "" || href === "#") {
      const currentUrl =
        typeof window !== "undefined" ? window.location.href : "";
      target?.setAttribute("data-index", currentUrl);
    } else {
      target?.setAttribute(
        "data-index",
        `${getBaseUrl().replace(/\/$/, "")}/${href.replace(/^\//, "")}`,
      );
    }
    pushCardsToDataLayer(e?.currentTarget, e?.type || "click");
  };
  return (
    <section className="md:py-20 py-16">
      <div className="container">
        <div className="flex justify-center flex-col items-center md:py-20">
          <Image
            src="/images/404.svg"
            width={265}
            height={140}
            alt="404 imge"
            className="md:w-[265px] md:h-[140px] w-[226px] h-[120px]"
          />
          <div className="flex mt-14 md:mt-16 flex-col justify-center items-center ">
            <h1 className="mb-6 text-center text-34px] leading-9 md:text-[40px] md:leading-14 lg:text-[56px] lg:leading-[72px] no-underline">
              Oops... Page Not Found
            </h1>
            <p className="mb-8!">
              We&apos;re sorry, the page you requested could not be found.
            </p>
            <Button
              button_style="solid" 
              item={{
                title: "Go to Homepage",
                url: "/",
              }}
              mainClass="font-normal"
              sectionTitle="Oops... Page Not Found"
              onClick={(e) => handleButtonClick(e)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
