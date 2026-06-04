"use client"
import React from 'react';
import Image from 'next/image';
import { BlockData } from '@/types/global';
import SectionIntroBlock from '../SectionIntroBlock';
import Link  from 'next/link';
import { clickPushToDataLayer } from '@/utils/utility';

const PLACEHOLDER = '/images/img-placeholder.jpg';

const ImageCollage = ({ data }: { data: BlockData }) => {
    const images = data.cards || [];
    const imageCount = images.length;


    const gridConfig: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-4',
    };


    const isSpecialLayout = imageCount === 5;
    const gridClass = gridConfig[imageCount] || 'grid-cols-1 md:grid-cols-3';
  const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;

    return (
        <section className="
        md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)"
      style={spacingStyles}>
            <div>
                 {(data.section_title || data.section_subTitle || data.cta) && (
                            <SectionIntroBlock data={data} 
                            layoutClass={`${data.section_alignment === "center" ? "[&_.heading-block-title]:text-center [&_.heading-block-title_h2]:text-center": " "}  
                            ${data.section_alignment === "left" ? "[&_.intro-block>div]:flex-wrap [&_.intro-block>div]:gap-0" : ""}
                            `}
                            ctaWrapperClass={`mt-2! `}
                            headingId={data.block_id}
                            subTittleClass={'[&_p]:text-base! [&_p]:leading-6!'}
                            />
                           
            )}
            </div>
              <div className={`${data.section_layout} ${data.additional_classes}`}>
                {isSpecialLayout ? (
                    /* Layout for exactly 5 Images */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="grid grid-cols-2 gap-6 md:gap-10">
                            {images.slice(1, 5).map((item, index) => (
                                <div key={index} className="relative overflow-hidden shadow-lg ">
                                    <Image
                                        src={item.image?.url || PLACEHOLDER}
                                        alt={item.image?.alt || 'collage image'}
                                        loading="lazy" 
                                        fill
                                        className="object-cover relative!"
                                    />
                                    {item.links?.length ? item.links.map((link, linkIndex) => (
                                         link.cta?.url ? (

                                        <Link
                                            key={linkIndex}
                                            onClick={(e) => clickPushToDataLayer(e)}
                                            href={link.cta?.url || '#'}
                                            target={link.cta?.target || '_self'}
                                            className=" layout-cta"
                                            data-clickeventname="cta_click"
                                            data-title={item.title}
                                            data-eventcategory={data?.section_title}
                                        >

                                            <span className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image) underline font-bold text-white text-lg">
                                                {item.title || ''}
                                            </span>
                                        </Link>
                                         ): (
                                            item.title &&
                                            <span  key={linkIndex} className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image)  font-bold text-white text-lg">
                                            {item.title || ''}
                                        </span>
                                         )
                                    )) : (
                                       null
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="relative overflow-hidden shadow-lg ">
                            <Image
                                src={images[0].image?.url || PLACEHOLDER}
                                alt={images[0].image?.alt || 'main image'}
                                loading="lazy" 
                                fill
                                className="object-cover relative!"
                            />
                          {images[0].links?.[0]?.cta?.url ? (
                            <Link 
                                data-clickeventname="cta_click"
                                data-title={images[0].title}
                                data-eventcategory={data?.section_title} 
                                className='layout-cta' 
                                onClick={(e) => clickPushToDataLayer(e)}  
                                target={images[0].links?.[0]?.cta?.target || '_self'} 
                                href={images[0].links[0].cta.url || "#"}>
                                <span className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image) underline font-bold text-white text-lg">
                                    {images[0].title || '' }
                                </span>
                            </Link>
                        ) : (

                           images[0].title &&
                            <span className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image)  font-bold text-white text-lg">
                                {images[0].title || ''}
                            </span>
                        )}

                        </div>
                    </div>
                ) : (
                    /* Default Layout (1-4 or 6+ images) */
                    <div className={`grid ${gridClass} gap-10`}>
                        {images.map((item, index) => (
                            <div key={index} className={`relative overflow-hidden  shadow-lg `}>
                                <Image
                                    src={item.image?.url || PLACEHOLDER}
                                    alt={item.image?.alt || 'image'}
                                    loading="lazy" 
                                    fill
                                    className={`object-cover relative! ${imageCount === 1 ? "md:aspect-1680/750 aspect-430/500"  :""} ${imageCount === 2 ? "md:aspect-600/650 aspect-430/450 object-top"  :""}`}
                                />
                                  {item.links?.length ? item.links.map((link, lIdx) => (
                                   link.cta?.url ? (
                                    <Link
                                        data-clickeventname="cta_click"
                                        data-title={images[0].title}
                                        data-eventcategory={data?.section_title} 
                                        className='layout-cta' 
                                        onClick={(e) => clickPushToDataLayer(e)} 
                                        key={lIdx} href={link.cta?.url || '#'}
                                        target={link.cta?.target || '_self'}>

                                        <span className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image) underline font-bold text-white text-lg">
                                            {item.title || ''}
                                        </span>
                                    </Link>
                                   ) : (
                                    item.title &&
                                     <span key={lIdx} className="absolute block bottom-0 w-full left-0 p-4 bg-linear-(--overlay-image)  font-bold text-white text-lg">
                                        {item.title || ''}
                                    </span>
                                   )
                                )) : (
                                   null
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ImageCollage;
