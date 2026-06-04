"use client";
import Script from 'next/script';
import { useEffect, useState } from 'react';

interface ConsentBannerProps {
  siteTitle?: string;
}

export default function ConsentBanner({ siteTitle }: ConsentBannerProps) {
  const [shouldLoadScript, setShouldLoadScript] = useState(false);

  useEffect(() => {
    const hasTrustArcChoice = () => {
      const cookies = document.cookie.split('; ');
      return cookies.some(row => 
        row.startsWith('notice_gdpr_prefs=') || 
        row.startsWith('notice_preferences=')
      );
    };

    if (!hasTrustArcChoice()) {
      // Defer the execution to the next event loop tick
      // This stops cascading renders and resolves the ESLint build error
      setTimeout(() => {
        setShouldLoadScript(true);
      }, 0);
    }

    const handleTrustArcSubmit = () => {
      setTimeout(() => setShouldLoadScript(false), 500);
    };

    window.addEventListener('trustarc_consent_submitted', handleTrustArcSubmit);
    return () => window.removeEventListener('trustarc_consent_submitted', handleTrustArcSubmit);
  }, []);

  return (
    <>

      <div id="consent_blackbar"></div>
      <style jsx global>{`

        #consent_blackbar .banner-header-trustarc {
            font-size: 0 !important;
        }

        #consent_blackbar .banner-header-trustarc::after {
            content: "Cookies on ${siteTitle || 'Site Title'}  ";
            font-size: 20px;
        }


        html:has(.truste_box_overlay),
        body:has(.truste_box_overlay) {
            overflow: hidden !important;
            height: 100% !important;
        }
      `}</style>


      {/* TrustArc Script */}
      {shouldLoadScript && (
        <Script
          src="https://consent.trustarc.com/notice?domain=omers-opgi-retail.com&c=teconsent&js=nj&noticeType=bb&pcookie&gtm=1&text=true"
          strategy="afterInteractive"
          crossOrigin="anonymous" defer
        />
      )}
    </>
  );
}
