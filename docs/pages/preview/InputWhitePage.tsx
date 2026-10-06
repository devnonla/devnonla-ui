import { FluentIcon, Input, ensureFluentIcons } from "@nonla-agents/ui";
import { useEffect } from "react";

/** Standalone preview — Input only, solid white. Not part of the docs shell. */
export function InputWhitePage() {
  useEffect(() => {
    document.title = "Input · white";
    void ensureFluentIcons();
  }, []);

  return (
    <div className="min-h-dvh bg-white px-10 py-12 text-foreground">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input size="small" placeholder="Small" />
          <Input placeholder="Default" />
          <Input size="large" placeholder="Large" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input status="error" placeholder="Error" defaultValue="Invalid" />
          <Input status="warning" placeholder="Warning" defaultValue="Check this" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input prefix={<FluentIcon name="search-sparkle-24" size={14} />} placeholder="With prefix" />
          <Input suffix={<FluentIcon name="add-circle-24" size={14} />} placeholder="With suffix" allowClear defaultValue="Clearable" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input.Password placeholder="Password" />
          <Input variant="filled" placeholder="Filled" />
          <Input variant="borderless" placeholder="Borderless" />
          <Input disabled placeholder="Disabled" defaultValue="Can't edit" />
        </div>
        <Input.TextArea placeholder="Multi-line notes…" rows={3} />
      </div>
    </div>
  );
}
