import localFont from "next/font/local";

export const primary = localFont({

  src: [
    {
      path: "../public/fonts/headlines/Larken-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
    variable: "--font-larken",
    display: "swap",
});



export const secondaryFont = localFont({

  src: [
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-15UltTh.otf",
    weight: "100",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-16UltThIt.otf",
    weight: "100",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-36XLtIt.otf",
    weight: "200",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-35XLt.otf",
    weight: "200",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-46LtIt.otf",
    weight: "300",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-45Lt.otf",
    weight: "300",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-55Rg.otf",
    weight: "400",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-56It.otf",
    weight: "400",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-65Md.otf",
    weight: "500",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-66MdIt.otf",
    weight: "500",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-75Bd.otf",
    weight: "700",
    style: "normal",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-76BdIt.otf",
    weight: "700",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-96BlkIt.otf",
    weight: "900",
    style: "italic",
  },
  {
    path: "../public/fonts/body/NHaasGroteskDSStd-96BlkIt.otf",
    weight: "900",
    style: "italic",
  },
],

  variable: "--font-secondary",
  display: "swap",

});

