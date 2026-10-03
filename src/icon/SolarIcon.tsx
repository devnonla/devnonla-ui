import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { ensureSolarIcons, getSolarSvg } from "./solar";

export function SolarIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const [svg, setSvg] = useState<string | null>(() => getSolarSvg(name));

  useEffect(() => {
    const cached = getSolarSvg(name);
    if (cached) {
      setSvg(cached);
      return;
    }
    let cancelled = false;
    void ensureSolarIcons().then(() => {
      if (!cancelled) setSvg(getSolarSvg(name));
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (!svg) {
    return <span aria-hidden className={cn("inline-block shrink-0", className)} style={{ width: size, height: size }} />;
  }

  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 select-none text-current pointer-events-none [&_svg]:size-full", className)}
      style={{ width: size, height: size }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Solar SVG comes from the vendored icon pack, keyed by name
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** @deprecated Use SolarIcon. Same component — Solar icons, not Fluent Color. */
export const FluentIcon = SolarIcon;
