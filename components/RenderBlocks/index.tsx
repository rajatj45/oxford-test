import { BlockData } from "@/types/global";
import { COMPONENT_MAP, fetchOptionsData } from "@/utils/utility";

type ComponentKey = keyof typeof COMPONENT_MAP;

export default async function RenderBlocks({
  content,
}: {
  content: BlockData[];
}) {
  const { mallHours, holidayHours, holidays } = await fetchOptionsData();

  return (
    <>
      {content.map((block, index) => {
        const hideBlock = Array.isArray(block.hide_block) && block.hide_block[0] === "yes";
        const componentKey = block.tag as ComponentKey;
        const Component = COMPONENT_MAP[componentKey];

        if (!Component || hideBlock) {
          return null;
        }
        const blockWithHrsData =
          componentKey === "mall_holliday_hours_block"
            ? { ...block, mallHours, holidayHours, holidays }
            : block;

        return <Component key={index || `${block.tag}-${index}`} data={blockWithHrsData} />;
      })}
    </>
  );
}
