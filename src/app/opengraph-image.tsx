import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OgCard, ogSize } from "@/lib/ogTemplate";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";
export const alt = `${brand.name} — ${brand.slogan}`;
export const size = ogSize;
export const contentType = "image/png";

export default async function OgImage() {
  const interBold = await readFile(
    join(process.cwd(), "src/assets/fonts/Inter-Bold.ttf")
  );
  const interRegular = await readFile(
    join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf")
  );
  return new ImageResponse(
    (
      <OgCard
        title={brand.headline}
        subtitle="Know where to stream it — across your country's services."
      />
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "Inter", data: interRegular, weight: 400, style: "normal" }
      ]
    }
  );
}
