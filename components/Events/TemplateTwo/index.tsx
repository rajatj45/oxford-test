import React from 'react';
import InnerBanner from '../../InnerBanner';

import GallerySlider from '../../GallerySlider';
import Card from '../../Card';
import Image from 'next/image';
import { BlockData, CardsProps } from '@/types/global';
import HeadingWithDescription from '../../HeadingWithDescriptionBlock';
import Zpattern from '../../Zpattern';
import { title } from 'process';

// Define the shape of an individual image object

interface eventSchedule {
  schedule_date: string,
  schedule_timing: string,
}


interface PageProps {
  pageTitle?: string;
  pageBanner?: string;
  sectionHeading?: string;
  sectionContent?: string;
  contentImage?: string,
  eventScheduleData?: eventSchedule[];
  vendporSectionHeading?: string;
  vendorsSectionDescription?: string
  zPatternCards?: CardsProps[];
}


export const EventTemplateTwo = ({ pageTitle, pageBanner, sectionHeading, sectionContent, eventScheduleData, vendporSectionHeading,
  vendorsSectionDescription, zPatternCards = []
}: PageProps) => {



  return (
    <>

      <InnerBanner
        data={{
          section_title: pageTitle,
          main_image: pageBanner,
        } as BlockData}
      />
      <div className="md:py-20 py-16">
        <HeadingWithDescription
          sectionProps={{
            className: '[&_p]:text-lg [&_p]:max-w-full pt-0! [&_p]:md:max-w-[1093px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:mx-auto '
          }}
          data={{
            section_title: sectionHeading,
            content: sectionContent,
            section_alignment: "center",
          } as BlockData}
        />
        {eventScheduleData && (
          <section>
            <div className="container">
              <div className="px-6 py-2 mt-8 mb-14 md:mt-10 md:mb-16 rounded-lg border-(--border-gray-light) border max-w-full md:max-w-[1093px] mx-auto">
                {eventScheduleData?.map((item, index) => (
                  <div key={index} className="schedule-item py-6 flex justify-between border-b border-(--border-gray-light) last:border-b-0 ">
                    <div className="text-base font-medium text-(--dark-heading)"><span className="min-w-[200px]">{item.schedule_date}</span></div>
                    <div className="text-base font-light text-(--dark-heading) flex gap-2"><i className="icon-clock"></i><span>{item.schedule_timing}</span></div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        <Zpattern
          cards={zPatternCards}
          sectionTitle={vendporSectionHeading}
          sectionContent={vendorsSectionDescription}
          titleClass="text-[32px] leading-[48px] md:text-[40px] md:leading-[56px] mb-2"
          rowClass="mb-[56px] md:mb-10 md:gap-[80px]! gap-6! "
        />
      </div>
    </>
  );
};

export default EventTemplateTwo;
