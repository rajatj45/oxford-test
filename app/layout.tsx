import type { Metadata } from "next";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { primary, secondaryFont } from "@/app/fonts";
import Providers from "./providers";
import { fetchOptionsData } from "@/utils/utility";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import Footer from "@/components/Footer";
import Link from "next/link";
import Script from "next/script";
import Modal from "@/components/Modal";
import FormBlock from "@/components/FormBlock";
import { BlockData } from "@/types/global";
import LinkTrigger from "@/components/LinkTrigger";
import { PopupProvider } from "@/context/PopupContext";
import Siteloader from "@/components/Siteloader";
import ConsentBanner from "@/components/ConsentBanner";
import { Suspense } from "react";
import AccessibilityScript from "@/components/AccessibilityScript";
import ScrollToTop from "@/components/ScrollToTop";
import { cookies } from "next/headers";


export async function generateMetadata(): Promise<Metadata> {
  const { otherOptions, status } = await fetchOptionsData();
  if (status === "error") {
    return {
      title: "Unauthorized Access",
      description: "You are not authorized",
    };
  }

  const faviconUrl = otherOptions?.site_favicon?.url || "";

  return {
    title: {
      default: otherOptions?.meta_title || "",
      template: "%s ",
    },
    description: otherOptions?.meta_description || "",
    icons: {
      icon: faviconUrl,
    },
  };
}

const isIOSOnServer = /iPad|iPhone|iPod/;

const initialViewportContent = isIOSOnServer
  ? "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0"
  : "width=device-width, initial-scale=1, maximum-scale=2.0";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    status,
    alterBarData,
    headerData,
    footerData,
    mallHours,
    otherOptions,
    holidayHours,
    holidays,
  } = await fetchOptionsData();
  const partnerId = process.env.NEXT_PUBLIC_SIMON_PARTNER_ID || "";

  if (status === "error") {
    return (
      <html lang="en">
        <head>
          <meta name="viewport" content={initialViewportContent} />
        </head>
        <body className="flex min-h-screen items-center justify-center text-center">
          <div className="py-20 text-center">
            <h2 className="text-3xl font-bold">Unauthorized access!</h2>
          </div>
        </body>
      </html>
    );
  }

  const newsletterData = {
    form_fields: footerData ? footerData.form_fields : "",
    selected_from_id: footerData ? footerData.form_data : "",
    enable_captcha: footerData ? footerData.form_captcha : "",
  } as unknown as BlockData;

  const stagingGTM : { [key: string]: string } = {
    'squareone': 'NRDMMN8T',
    'stc' : 'TFKX8FZ3',
    'yorkdale': 'MTQRLBFK'
  }

  const key = process.env.NEXT_PUBLIC_OPTIONS_KEY || '';
  const envstring = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';
  const gtm = envstring === 'prod' ? headerData.gtm : stagingGTM[key]

  const cookieStore = await cookies();
  const hideNewsletter = cookieStore.get('hideNewsletter')?.value === 'true';
  const shouldShowPopup = !hideNewsletter;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content={initialViewportContent} />

        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push();}
            window.gtag = gtag;

            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-${gtm}');
          `}
        </Script>
      </head>

      <body
        className={`${primary.variable} ${secondaryFont.variable} overflow-hidden!`}
      >
        <ScrollToTop />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=GTM-${headerData.gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <AccessibilityScript />

        <PopupProvider>
          <Siteloader />
          <div
            className="fixed left-0 top-0 z-9999 skipToContent"
            role="complementary"
          >
            <Link
              href="#start-of-content"
              tabIndex={0}
              aria-label="Skip to main content"
            >
              Skip to content
            </Link>
          </div>
          <Providers>
            <Notification
              icon="icon-alert"
              className="flex items-center"
              notificationData={alterBarData}
            />
            <Header
              data={headerData}
              holidaysHoursData={holidays}
              openingHours={mallHours}
              holidayHours={holidayHours}
              siteTitle={otherOptions ? otherOptions.siteTitle : ""}
            />
            <main id="start-of-content" className="main-content">
              {children}
            </main>
            <Footer
              data={footerData}
              siteTitle={otherOptions ? otherOptions.siteTitle : ""}
            />
            {shouldShowPopup && (
              <Modal
                title={footerData.modal_heading}
                modalCustomClass="max-w-[828px] h-[530px] md:h-auto overflow-hidden "
              >
                <FormBlock
                  formSectionTitle={footerData.modal_heading}
                  isPopupForm={true}
                  data={newsletterData}
                  containerClass=""
                />
              </Modal>
            )}
            <Suspense fallback={null}>
              <ConsentBanner
                siteTitle={otherOptions ? otherOptions.siteTitle : ""}
              />
            </Suspense>
          </Providers>
          <LinkTrigger
            excludeClasses={["layout-cta"]}
            excludeTags={["header", "footer"]}
          />
        </PopupProvider>
      </body>
    </html>
  );
}
