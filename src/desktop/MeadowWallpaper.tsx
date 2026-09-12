import meadowWallpaper from "./assets/desktop-meadow.jpg";

export function MeadowWallpaper({ src = meadowWallpaper }: { src?: string }) {
  return <img src={src} alt="" draggable={false} className="absolute inset-0 size-full object-cover object-center pointer-events-none select-none" />;
}
