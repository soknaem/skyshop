import { desktopNotifyEnabled } from "./prefs";

/** Shows a system notification when the tab is in the background and the user opted in (Settings → Notifications). */
export function desktopNotify(title: string, body: string, url: string, tag?: string): boolean {
  if (typeof document === "undefined" || !document.hidden || !desktopNotifyEnabled()) return false;
  try {
    const n = new Notification(title, { body, tag, icon: "/products/placeholder.svg", badge: "/products/placeholder.svg" });
    n.onclick = () => {
      window.focus();
      if (url) window.location.assign(url);
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}
