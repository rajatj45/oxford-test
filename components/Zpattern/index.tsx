"use client"

import Image from 'next/image'
import { BlockData, CardsProps } from '@/types/global'
import ImageSlider from '../ImageSlider'
import Link from 'next/link';
import { clickPushToDataLayer } from '@/utils/utility';
import HeadingWithDescription from '../HeadingWithDescriptionBlock';

interface ZpatternProps {
  cards: CardsProps[];
  mainSectionClass?: string;
  rowClass?: string;
  titleClass?: string;
  colClass?: string
  sectionTitle?: string;
  sectionContent?: string
}

const Zpattern = ({ cards, mainSectionClass, titleClass, rowClass, colClass, sectionTitle, sectionContent }: ZpatternProps) => {
  return (
    <>
    <div className={`tru-block zpattern container mx-auto px-4. ${mainSectionClass} `}>
      <HeadingWithDescription
        sectionProps={{
          className: '[&_p]:text-lg [&_p]:max-w-full pt-0! [&_h2]:mb-10 [&_h2]:text-center! [&_p]:text-center [&_p]:md:max-w-[1093px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:mx-auto '
        }}
        data={{
          section_title: sectionTitle,
          content: sectionContent,
          section_alignment: "center",
          alignment: "center",
        } as BlockData}
      />

      {cards.map((item, index) => (
        <div
          key={index}
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center tru-tile mb-20 ${rowClass}`}>
          <div className={`${index % 2 !== 0 ? 'md:order-2' : ''}`}>
            {item.gallery && item.gallery.length > 1 ? (
              <ImageSlider items={item.gallery} />
            ) : (
              item.image?.url && (
                <div className="relative pt-[62.50%]">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || 'Card image'}
                    fill
                    className="object-cover"
                  />
                </div>
              )
            )}
          </div>
          <div className={`${index % 2 !== 0 ? 'md:order-1' : ''} ${colClass}`}>
            <h2 className={`${titleClass} tru-tile-heading`}>{item.title}</h2>
            {item.content && (
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}

            <div className={`flex items-center gap-4  mt-6 `}>
              {item?.links && item.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.url || '#'}
                  target={link.target}
                  onClick={clickPushToDataLayer}
                  rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="font-medium text-[18px] layout-cta underline text-(--dark-heading)! flex items-baseline cursor-pointer gap-2"
                  data-title={link.title || link.cta_label}
                  data-tag={item.title}
                  data-eventcategory={sectionTitle}
                  data-clickeventname="cta_click"
                >
                  {link.title || link.cta_label}
                  {/* {link.target === "_blank" && (
                    <i className="icon-arrow-up-right text-[14px]"></i>
                  )} */}
                </Link>
              ))}

              {item.facebook && (
                <div className="border flex flex-col justify-center items-center border-(--border-light) text-(--dark-heading) w-12 h-12 p-3"><Link aria-label="Facebook" href={item.facebook}><i className="icon-facebook text-2xl"></i></Link></div>)}
              {item.instragam && (
                <div className='border flex flex-col justify-center items-center border-(--border-light) text-(--dark-heading) w-12 h-12 p-3'> <Link aria-label="Instagram" href={item.instragam}><i className="icon-instagram text-2xl"></i></Link></div>)}

            </div>

          </div>
        </div>
      ))}
    </div>
    </>
  )
}

export default Zpattern
