'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getBaseUrl, pushCardsToDataLayer } from '@/utils/utility';

interface LinkTriggerProps {
  excludeClasses?: string[];
  excludeTags?: (keyof HTMLElementTagNameMap)[];
  dataAttributes?: Record<string, string>;
}

interface ExtendedAnchorElement extends HTMLAnchorElement {
  _globalClickHandler?: (e: MouseEvent) => void;
}

export default function LinkTrigger({
  excludeClasses = [],
  excludeTags = [],
  dataAttributes = {}
}: LinkTriggerProps) {
  const pathname = usePathname();
  const router = useRouter();

  const DEFAULT_ATTRIBUTES: Record<string, string> = {
    "data-clickeventname": 'cta_click',
  };

  useEffect(() => {
    const classSelector = excludeClasses
      .map(cls => `:not(.${cls.replace(/^\./, '')})`)
      .join('');

    const selector = `a${classSelector}`;
    const allLinks = document.querySelectorAll<ExtendedAnchorElement>(selector);

    const filteredLinks = Array.from(allLinks).filter((link) => {
      return !excludeTags.some(tag => link.closest(tag));
    });

    filteredLinks.forEach((link) => {

      Object.entries(DEFAULT_ATTRIBUTES).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });

      const handleClick = (e: MouseEvent): void => {
        const clickText = link.textContent?.trim() || link.getAttribute("aria-label") || "";
        const clickUrl = link.getAttribute('href') || "#";


        let finalPath = "";
        try {

          if (clickUrl.startsWith('mailto:') || clickUrl.startsWith('tel:')) {
            finalPath = clickUrl;
          } else {
            const base = getBaseUrl() || window.location.origin;
            const urlObj = new URL(clickUrl, base);
            finalPath = urlObj.href;
          }
        } catch (err) {
          finalPath = clickUrl;
        }

        link.setAttribute("data-title", clickText);
        link.setAttribute("data-index", finalPath);

        const parentBlock = link.closest('.tru-block');
        const tileParent = link.closest('.tru-tile');
        
        if(tileParent){
            const tileHeading = tileParent.querySelector('.tru-tile-heading');
            if (tileHeading) {
            const titleText = tileHeading.textContent?.trim();
            link.setAttribute("data-tag", titleText);
          }
        }
      
        if (parentBlock) {
          const sectionTitleEl = parentBlock.querySelector('.tru-section-title');

          if (sectionTitleEl) {
            const titleText = sectionTitleEl.textContent?.trim();
            link.setAttribute("data-eventcategory", titleText);
          }
        }

        if (e.defaultPrevented) return;

        const href = link.getAttribute('href') || "";
        const isEmail = href.includes('@') || href.startsWith('mailto:');
        const isTel = href.startsWith('tel:');
        const isSpecial = isEmail || isTel || href.startsWith('javascript:');

        pushCardsToDataLayer(link as HTMLElement, e.type);

        if (isSpecial) return;

        try {
          const url = new URL(link.href, window.location.origin);
          const isExternal = link.target === "_blank" || url.origin !== window.location.origin;
          const isDownload = link.hasAttribute('download') || /\.(zip|pdf|docx|png|jpg|mp4)$/i.test(url.pathname);

          if (!isExternal && !isDownload) {
            e.preventDefault();
            const targetPath = url.pathname + url.search + url.hash;
            router.push(targetPath);
          }

        } catch (err) {
          console.warn("Invalid URL skipped:", href);
        }
      };

      if (link._globalClickHandler) {
        link.removeEventListener('click', link._globalClickHandler);
      }

      link._globalClickHandler = handleClick;
      link.addEventListener('click', handleClick);
    });

    return () => {
      filteredLinks.forEach(link => {
        if (link._globalClickHandler) {
          link.removeEventListener('click', link._globalClickHandler);
          delete link._globalClickHandler;
        }
      });
    };
  }, [pathname, excludeClasses, excludeTags, dataAttributes, router]);

  return null;
}