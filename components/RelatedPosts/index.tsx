import { BlockData, CardsProps, CardStyles } from '@/types/global'

import Card from "@/components/Card"
import SectionIntroBlock from '../SectionIntroBlock';


export default function RelatedPost({ data }: { data: BlockData }) {

  const slidesCount = 4;
  const imageDesktopClasses = {
    1: "md:aspect-[1680/500]",
    2: "md:aspect-[820/500]",
    3: "md:aspect-[544/320]",
    4: "md:aspect-[402/240]",
  };

  const overlayCardClasses = {
    1: "md:aspect-[1680/500]",
    2: "md:aspect-[820/500]",
    3: "md:aspect-[544/500]",
    4: "md:aspect-[402/500]",
  };

  const cardStyle = 'info-card';

  const desktopImgClass = cardStyle == "info-card" ? imageDesktopClasses[slidesCount] || imageDesktopClasses[1] : overlayCardClasses[slidesCount] || overlayCardClasses[1];

  const blogRelatedPost = data.related_posts;
  const relatedpostData = JSON.parse(blogRelatedPost);

  const sectionTitle = data.section_title != ''?data.section_title:'You may also like';

  const cta_url = data.cta?.url!=null ? data.cta?.url : '/blog';
  const cta_text = data.cta?.title!=null ? data.cta?.title : 'See More';
  const cta_target = data.cta?.target!=null ? data.cta?.target : '_self';

  const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;
  return (
    <>
      <div className={`py-10 ${data.additional_classes} related-posts md:pt-(--spaceTop) md:pb-(--spaceBottom) pb-(--spaceBottomMobile) pt-(--spaceTopMobile)`} style={spacingStyles}>
        <div className="container">
         <SectionIntroBlock
            data={{
              section_title: sectionTitle,
              cta: [
                {
                  url: cta_url,
                  title: cta_text,
                  target: cta_target,
                },
              ],
            }}
          />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

            {relatedpostData?.map((item:CardsProps, index:number) => (
                <Card
                    key={index}
                    item={
                        {
                            title: item.title,
                            imageSrc: item.thumbnail?.url || "/images/img-placeholder.jpg",
                            content: item.content,
                            cardLink: item.slug
                        }
                    }
                    card_style={cardStyle}
                    imgWrapperClass={`${desktopImgClass} aspect-[402/240]` }
                    titleClass=" font-(family-name:--font-larken)!      "
                />
            ))}
          </div>
      </div>
    </div>
    </>
  )
}