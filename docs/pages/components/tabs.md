---
path: "/components/tabs"
title: "Tabs"
group: "Navigation"
groupOrder: 8
order: 3
icon: "layers-24"
---

# Tabs

Switch between views. The bar stays on one line and scrolls when the labels do not fit.

```live-react
import { useState } from "react";
import { Icon, Tabs } from "devnonla-ui";

export default function Demo() {
  const [key, setKey] = useState("account");
  return (
    <Tabs
      activeKey={key}
      onChange={setKey}
      items={[
        { key: "account", label: "Account", icon: <Icon name="document" size={16} />, children: "Profile, email, and password." },
        { key: "team", label: "Team", children: "People who can access this workspace." },
        { key: "billing", label: "Billing", disabled: true, children: "Plan and invoices." },
      ]}
    />
  );
}
```

## Scroll

A long row scrolls inside its container. Arrow buttons, the trackpad, and the mouse wheel move it. The active tab moves into view.

```live-react
import { useState } from "react";
import { Tabs } from "devnonla-ui";

const labels = ["Overview", "Activity", "Members", "Billing", "Integrations", "Notifications", "Security", "API keys", "Audit log", "Advanced"];

export default function Demo() {
  const [key, setKey] = useState("overview");
  return (
    <div style={{ maxWidth: 420 }}>
      <Tabs
        activeKey={key}
        onChange={setKey}
        items={labels.map((label) => ({
          key: label.toLowerCase().replace(/\s+/g, "-"),
          label,
          children: label,
        }))}
      />
    </div>
  );
}
```
