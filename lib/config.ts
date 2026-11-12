/** Server-side URL of the API gateway (used by Next.js server code). */
export const API_URL = process.env.API_URL ?? "http://localhost:8000";
/** Browser-side URL of the API gateway (images, uploads, WebSocket, live search). */
export const PUBLIC_API = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";
export const WS_URL = PUBLIC_API.replace(/^http/, "ws");
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME ?? "SkyShop";
