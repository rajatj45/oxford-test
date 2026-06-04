import { BlockData } from "@/types/global";

export default function SpacerBlock({ data }: { data: BlockData }) {
  const isCompact = data?.compact_layout?.includes("yes");
  const vars = {
    "--mt": `${data?.top_spacing ?? 0}px`,
    "--mb": `${data?.bottom_spacing ?? 0}px`,
    "--h": isCompact && data?.border_width ? `${data.border_width}px` : "0px",
  } as React.CSSProperties;

  const containerClass = data?.section_layout === 'full_width' ? 'w-full' : data?.section_layout === 'boxed' ? 'boxed' : 'container';

  return (
    <>
      <div
        className={`spacer-block  ${containerClass} ${data?.additional_classes || ""}`}
      >
        <div
          style={vars}
          className={`
          block w-full overflow-hidden
          ${isCompact ? data?.bg_color : ""}
          mt-[var(--mt)]
          mb-[var(--mb)]
          h-[var(--h)]
        `}
        ></div>
      </div>
    </>
  );
}
