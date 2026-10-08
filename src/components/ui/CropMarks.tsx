import type { CSSProperties } from "react";
import { cx } from "@/lib/utils";

interface CropMarksProps {
  className?: string;
  /** Distance from the frame edge; negative sits outside the frame (print), positive inside (viewfinder). */
  offset?: string;
  color?: string;
}

/** Four thin L-shaped marks at the corners of a frame, like a photographer's crop marks. */
export function CropMarks({ className, offset = "-0.75rem", color }: CropMarksProps) {
  const style = { "--crop-offset": offset, ...(color ? { "--crop-color": color } : {}) } as CSSProperties;
  return (
    <span aria-hidden="true" className={cx("crop-marks", className)} style={style}>
      <span data-crop className="crop-mark crop-mark--tl" />
      <span data-crop className="crop-mark crop-mark--tr" />
      <span data-crop className="crop-mark crop-mark--bl" />
      <span data-crop className="crop-mark crop-mark--br" />
    </span>
  );
}
