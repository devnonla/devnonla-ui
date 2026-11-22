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

## Pill

`variant="pill"` puts page tabs on a soft track with the active one raised, like a header switcher between sibling pages.

```live-react
import { Tabs } from "devnonla-ui";

export default function Demo() {
  return (
    <Tabs
      variant="pill"
      items={[
        { key: "members", label: "All members" },
        { key: "groups", label: "Groups" },
        { key: "settings", label: "Settings" },
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

## API

### Tabs

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Tabs, in order | `TabItem[]` | — |
| `variant` | `line` underlines the active tab; `pill` raises it on a soft track | `"line"` \| `"pill"` | `"line"` |
| `activeKey` | Active tab key, controlled | `string` | — |
| `defaultActiveKey` | Initial tab when uncontrolled | `string` | first enabled tab |
| `onChange` | Fires with the key of the clicked tab | `(key: string) => void` | — |
| `aria-label` | Accessible name of the tab list | `string` | `"Tabs"` |
| `className` | Extra class on the root | `string` | — |
| `style` | Inline style on the root | `CSSProperties` | — |

### Tab item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique tab key | `string` | — |
| `label` | Tab text | `ReactNode` | — |
| `children` | Panel content shown while the tab is active | `ReactNode` | — |
| `icon` | An `Icon` name, or a node | `ReactNode` | — |
| `disabled` | Tab cannot be selected | `boolean` | `false` |
