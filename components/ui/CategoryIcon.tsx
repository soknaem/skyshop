import { BatteryCharging, Camera, Cpu, Gamepad2, Headphones, House, Keyboard, Laptop, Monitor, Mouse, Package, Plug, Smartphone, Speaker, Tablet, Tv, Watch, Wifi, type LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone, laptop: Laptop, headphones: Headphones, watch: Watch, gamepad: Gamepad2, tv: Tv,
  camera: Camera, plug: Plug, package: Package, home: House, speaker: Speaker, tablet: Tablet, keyboard: Keyboard,
  mouse: Mouse, battery: BatteryCharging, wifi: Wifi, monitor: Monitor, cpu: Cpu,
};

export default function CategoryIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} />;
}
