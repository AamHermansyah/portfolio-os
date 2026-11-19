import { PIXEL_MAPS, PIXEL_PALETTES, type PixelIconName } from "@/lib/simple/pixel-art";

/**
 * One of the desktop's own pixel icons, drawn as crisp rectangles. Rows are merged
 * into runs, so a 16x16 icon is a few dozen <rect>s rather than 256.
 */
export function PixelIcon({ name, size = 32 }: { name: PixelIconName; size?: number }) {
  const rows = PIXEL_MAPS[name];
  const palette = PIXEL_PALETTES[name];
  const rects: React.ReactNode[] = [];

  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const key = row[x];
      const fill = key === "." ? undefined : palette[key];
      if (!fill) {
        x += 1;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === key) run += 1;
      rects.push(<rect fill={fill} height={1} key={`${y}-${x}`} width={run} x={x} y={y} />);
      x += run;
    }
  });

  return (
    <svg
      aria-hidden="true"
      className="sv-pixel"
      height={size}
      shapeRendering="crispEdges"
      viewBox="0 0 16 16"
      width={size}
    >
      {rects}
    </svg>
  );
}
