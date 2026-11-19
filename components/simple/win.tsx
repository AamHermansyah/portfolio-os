import { PixelIcon } from "@/components/simple/pixel-icon";
import type { PixelIconName } from "@/lib/simple/pixel-art";

/**
 * A Windows 98 window: the one container the whole page is made of, so every block
 * reads as the same desktop the visitor can still open from the header.
 *
 * The title is a label, not a heading — the sections own the h2/h3 outline — and
 * the three buttons are decoration, hidden from assistive technology.
 */
export function Win({
  title,
  icon,
  children,
  className = "",
  bare = false,
}: {
  title: string;
  icon: PixelIconName;
  children: React.ReactNode;
  className?: string;
  /** No padding in the body: for a list or a picture that runs edge to edge. */
  bare?: boolean;
}) {
  return (
    <div className={`sv-win ${className}`.trim()}>
      <div className="sv-bar">
        <PixelIcon name={icon} size={16} />
        <span className="sv-bar-title">{title}</span>
        <span aria-hidden="true" className="sv-bar-ctl">
          <i>_</i>
          <i>□</i>
          <i>×</i>
        </span>
      </div>
      <div className={bare ? "sv-win-body sv-bare" : "sv-win-body"}>{children}</div>
    </div>
  );
}
