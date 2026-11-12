import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SkyShop",
    short_name: "SkyShop",
    description: "Shop electronics, delivered by SkyShop.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#101b31",
    theme_color: "#101b31",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/skyshop-icon.png?v=1",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}