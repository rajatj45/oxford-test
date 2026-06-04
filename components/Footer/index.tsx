"use client";
import Image from "next/image";
import MenuList from "@/components/List";
import Link from "next/link";
import {
  clickPushToDataLayer,
  getBaseUrl,
  pushCardsToDataLayer,
} from "@/utils/utility";

interface MenuItem {
  title: string;
  url: string;
  target?: string;
}

interface FooterData {
  phone_number?: string;
  address?: string;
  copyright_text?: string;
  footer_logo?: { url: string; alt: string };
  oxford_logo?: { url: string; alt: string };
  oxford_site_url?: string;
  subscribe_form_title?: string;
  subscribe_form_description?: string;
  footerMenus: {
    footer_one: {
      title: string;
      menu: MenuItem[];
    };
    footer_two: {
      title: string;
      menu: MenuItem[];
    };
    footer_three: {
      title: string;
      menu: MenuItem[];
    };
    footer_four: {
      title: string;
      menu: MenuItem[];
    };
  };
}

interface FooterProps {
  data: FooterData;
  siteTitle?: string;
}

const Footer = ({ data, siteTitle }: FooterProps) => {
  if (!data) return null;

  const {
    phone_number = "",
    address = "",
    copyright_text = "",
    footer_logo,
    footerMenus,
    oxford_site_url,
    oxford_logo,
  } = data;

  const handlePhoneClick = (e: React.MouseEvent<HTMLElement>) => {
    pushCardsToDataLayer(e.currentTarget, e.type);
  };

  return (
    <footer
      className="border-t pt-10 border-(--border-gray-light)"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-4">
        <div className="flex justify-between gap-10 1xl:flex-row flex-col">
          <div className="w-full lg:w-[30%]  md:min-w-96.5">
            <div className="flex flex-col items-start md:flex-row gap-6 xl:gap-10">
              {footer_logo?.url ? (
                <div className="h-15 relative w-45 -top-1.75">
                  <Link
                    href="/"
                    onClick={(e) => clickPushToDataLayer(e)}
                    data-clickeventname="nav_footer"
                    data-title={siteTitle}
                  >
                    <Image
                      src={footer_logo.url}
                      alt={footer_logo.alt || "Footer logo"}
                      sizes="100vw"
                      fill
                      className="w-45 object-contain"
                    />
                  </Link>
                </div>
              ) : (
                <div className="h-15 relative w-45 -top-1.75">
                  <Link
                    href="/"
                    onClick={(e) => clickPushToDataLayer(e)}
                    data-clickeventname="nav_footer"
                    data-title={siteTitle}
                  >
                    <Image
                      src={"/images/Logo.svg"}
                      alt={"Footer logo"}
                      sizes="100vw"
                      fill
                      className="w-45 object-contain"
                    />
                  </Link>
                </div>
              )}
              <div className=" flex flex-col gap-2.5 [&_p]:text-sm! [&_p]:text-(--dark-heading)!">
                {phone_number && (
                  <p className="text-[14px]! mb-0 leading-5 text-[#141414]! py-2!">
                    Call Us:&nbsp;
                    <Link
                      onClick={(e) => handlePhoneClick(e)}
                      href={`tel:${phone_number.replace(/\s/g, "")}`}
                      className="focus:ring-2 focus:ring-primary no-underline hover:underline"
                      data-clickeventname="nav_footer"
                      data-title={phone_number}
                      data-index={`tel:${phone_number.replace(/\s/g, "")}`}
                    >
                      {phone_number}
                    </Link>
                  </p>
                )}
                {address && (
                  <p className="whitespace-pre-line mb-0 text-[14px]! leading-5 text-[#141414]! py-2">
                    {address}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[70%] flex md:flex-nowrap flex-wrap md:justify-end">
            <div className="flex flex-[100%_1_1] md:flex-[1_0_0] md:flex-nowrap gap-x-5 gap-y-10 flex-wrap items-start md:[&_.footer-section]:w-auto [&_.footer-section]:w-[47%] [&_.footer-section]:mb-0 md:justify-between max-w-210">
              {Object.values(footerMenus).map((footer, idx) =>
                footer.title && footer.menu ? (
                  <div key={idx} className="footer-section">
                    <div
                      id={`menu-${footer.title}-${idx}`}
                      className="text-sm text-black font-medium"
                    >
                      {footer.title.replace(/&amp;/g, "&")}
                    </div>
                    <MenuList
                      menuItems={footer.menu}
                      arialabelledBy={`${footer.title.replace(/&amp;/g, "&")}`}
                      menuClass="custom-menu [&_.active]:border-b-0 mt-2 mb-0 ml-0"
                      itemClass="focus:outline-none list-none text-sm leadig-[21px] focus:ring-2 focus:ring-primary last:mb-0"
                      menuLinkClass="text-black text-sm no-underline hover:underline"
                      location="footer"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex items-center  text-center my-10 md:flex-row flex-col-reverse md:flex-wrap flex-wrap border-t pt-10 border-(--border-gray-light) ${oxford_logo?.url ? "justify-between" : "justify-center"}`}
        >
          <p
            className={`text-[14px] leading-5.25 mb-0 text-[#141414] ${oxford_logo?.url ? "md:mt-0 mt-6" : ""}`}
          >
            {copyright_text &&
              `Copyright © ${new Date().getFullYear()} ${copyright_text}`}
          </p>
          {oxford_logo?.url && (
            <div className="h-8 relative w-45 ">
              <Link
                href={oxford_site_url ? oxford_site_url : ''}
                target="_blank"
                onClick={(e) => clickPushToDataLayer(e)}
                data-clickeventname="nav_footer"
                data-title={siteTitle}
              >
                <Image
                  src={oxford_logo.url}
                  alt={oxford_logo.alt || "Oxford Properties logo"}
                  sizes="100vw"
                  fill
                  className="w-45 object-contain"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;