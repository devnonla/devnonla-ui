import { SortableTree, type SortableTreeItem } from "@nonla-agents/ui";
import { useEffect, useState } from "react";

const seed: SortableTreeItem[] = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "color", label: "Color" },
      { id: "type", label: "Type" },
      { id: "space", label: "Spacing" },
    ],
  },
  {
    id: "build",
    label: "Build",
    children: [
      { id: "api", label: "API" },
      { id: "ui", label: "UI kit" },
    ],
  },
  {
    id: "ship",
    label: "Ship",
    children: [
      { id: "docs", label: "Docs" },
      { id: "release", label: "Release" },
    ],
  },
];

/** Standalone preview so drag can be checked outside the docs iframe. */
export function SortableTreePage() {
  const [items, setItems] = useState(seed);

  useEffect(() => {
    document.title = "SortableTree";
  }, []);

  return (
    <div className="min-h-dvh bg-background px-10 py-12 text-foreground">
      <div id="tree-scroll" className="w-80 overflow-auto rounded-lg border border-border bg-card p-1.5" style={{ maxHeight: 420 }}>
        <SortableTree items={items} onChange={(next) => setItems(next)} />
      </div>
    </div>
  );
}
