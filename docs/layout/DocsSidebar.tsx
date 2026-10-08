import { Sidebar, SolarIcon, solarIconName } from "@nonla-agents/ui";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DOCS_NAV } from "../nav";

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = useMemo(
    () =>
      DOCS_NAV.flatMap((section) => [
        {
          type: "group" as const,
          key: section.id,
          label: section.title,
        },
        ...section.items.map((item) => ({
          key: item.path,
          label: item.label,
          icon: item.icon ? <SolarIcon name={solarIconName(item.icon, "outline")} size={16} /> : undefined,
          href: item.path,
        })),
      ]),
    [],
  );

  return (
    <Sidebar
      items={items}
      selectedKey={pathname}
      searchable
      searchPlaceholder="Search docs"
      onSelect={({ item }) => {
        if (item.href) navigate(item.href);
        onNavigate?.();
      }}
    />
  );
}
