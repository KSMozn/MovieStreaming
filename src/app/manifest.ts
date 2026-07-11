import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.message,
    start_url: "/",
    display: "standalone",
    background_color: brand.colors.background,
    theme_color: brand.colors.primary,
    icons: [
      {
        src: "/brand/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/brand/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
