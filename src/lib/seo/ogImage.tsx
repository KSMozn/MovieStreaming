import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OgCard, ogSize } from "@/lib/ogTemplate";

// One factory for every page-specific Open Graph image so all social cards
// share the same branded template (official mark, palette, Inter).
export async function ogImageResponse(
  title: string,
  subtitle?: string
): Promise<ImageResponse> {
  const [interBold, interRegular] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Inter-Bold.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf"))
  ]);
  return new ImageResponse(<OgCard title={title} subtitle={subtitle} />, {
    ...ogSize,
    fonts: [
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "Inter", data: interRegular, weight: 400, style: "normal" }
    ]
  });
}

export { ogSize };
