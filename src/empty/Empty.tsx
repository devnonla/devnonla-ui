import type { ReactNode } from "react";
import { Card } from "../card/Card";
import { Icon, isIconName } from "../icon/Icon";
import { cn } from "../lib/cn";

const LOGO_CONE = "M768 68 C752 68 640 145 439 300 C338 377 250 449 194 500 C172 519 150 540 134 560 C122 576 109 591 103 600 C99 613 100 628 101 640 A666 108 0 0 1 1433 640 C1434 628 1435 613 1431 600 C1425 591 1412 576 1400 560 C1384 540 1362 519 1340 500 C1284 449 1196 377 1095 300 C894 145 782 68 768 68Z";

function LogoMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="100 40 1336 960" width={48} height={35} fill="none" aria-hidden className="text-muted-foreground opacity-40">
      <ellipse fill="color-mix(in srgb, currentColor 48%, black)" cx="767" cy="640" rx="666" ry="190" />
      <circle fill="currentColor" cx="768" cy="602" r="371.6" />
      <path fill="none" stroke="color-mix(in srgb, currentColor 78%, black)" strokeWidth="6" d="M112 640 A655 108 0 0 1 1422 640" />
      <path fill="none" stroke="color-mix(in srgb, currentColor 48%, black)" strokeWidth="20" d="M112 640 A655 106 0 0 1 1422 640" />
      <path fill="color-mix(in srgb, currentColor 78%, black)" d={LOGO_CONE} />
      <g fill="none" stroke="color-mix(in srgb, currentColor 48%, black)" strokeWidth="6" strokeLinecap="round" opacity="0.55">
        <path d="M750 96 C625 260 455 421 282 563" />
        <path d="M758 96 C700 241 644 377 588 507" />
        <path d="M778 96 C836 241 892 377 948 507" />
        <path d="M786 96 C911 260 1081 421 1254 563" />
      </g>
      <g fill="var(--nonla-bg)">
        <ellipse cx="607.5" cy="705" rx="44.5" ry="68" />
        <ellipse cx="921.5" cy="705" rx="44.5" ry="68" />
      </g>
      <g fill="var(--nonla-text-on-solid)">
        <ellipse cx="618" cy="678" rx="13" ry="19" />
        <ellipse cx="932" cy="678" rx="13" ry="19" />
      </g>
      <path fill="none" stroke="var(--nonla-bg)" strokeWidth="24" strokeLinecap="round" d="M696 802 C733 846 801 846 837 802" />
    </svg>
  );
}

export type EmptyProps = {
  /** Glyph above the title: an `Icon` name or any node. Defaults to the Nonla mark. `null` hides it. */
  icon?: ReactNode;
  /** Bold line, e.g. "No projects yet". */
  title?: ReactNode;
  /** Muted line under the title. */
  description?: ReactNode | null;
  /** Call to action under the text, usually a primary `Button`. */
  action?: ReactNode;
  /** Extra content under the action. */
  children?: ReactNode;
  /** Wrap in a `Card`. Turn off inside tables, panels, or cards. Default `true`. */
  bordered?: boolean;
  className?: string;
};

/** Empty state (measured on Cloudflare): 36px ink icon, 20px title, muted line, then the action. */
export function Empty({ icon, title, description = title == null ? "No data" : undefined, action, children, bordered = true, className }: EmptyProps) {
  const glyph = icon === undefined ? <LogoMark /> : icon === null ? null : isIconName(icon) ? <Icon name={icon} size={36} className="text-foreground" /> : icon;
  const body = (
    <div role="status" className={cn("flex min-w-0 flex-col items-center justify-center px-6 py-10 text-center", className)}>
      {glyph ? <div className="mb-4 flex items-center justify-center">{glyph}</div> : null}
      {title != null && title !== "" ? <p className="m-0 text-xl leading-7 font-semibold text-foreground">{title}</p> : null}
      {description != null && description !== "" ? <p className={cn("m-0 max-w-sm text-sm text-muted-foreground", title != null && "mt-1")}>{description}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      {children ? <div className="mt-3 flex flex-col items-center gap-2">{children}</div> : null}
    </div>
  );
  return bordered ? <Card className="w-full">{body}</Card> : body;
}
