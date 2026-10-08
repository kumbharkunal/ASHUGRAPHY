import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette } from "@/lib/tokens";

const zodiakRegular = readFile(join(process.cwd(), "src/fonts/vendor/Zodiak-Regular.ttf"));

/**
 * The "A" monogram: ivory Zodiak on sindoor. `rounded` gives the browser-tab favicon its own
 * corners; touch and manifest icons are full-bleed squares (platforms apply their own mask), with
 * the letter inside the maskable safe zone.
 */
export async function monogram(dimension: number, { rounded }: { rounded: boolean }) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: palette.sindoor,
          borderRadius: rounded ? Math.round(dimension * 0.22) : 0,
          color: palette.ivory,
          fontFamily: "Zodiak",
          fontSize: Math.round(dimension * (rounded ? 0.78 : 0.56)),
          lineHeight: 1,
          paddingTop: Math.round(dimension * (rounded ? 0.06 : 0.03)),
        }}
      >
        A
      </div>
    ),
    {
      width: dimension,
      height: dimension,
      fonts: [{ name: "Zodiak", data: await zodiakRegular, weight: 400, style: "normal" }],
    },
  );
}
