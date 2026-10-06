---
path: "/components/checkbox"
title: "Checkbox"
group: "Data Entry"
groupOrder: 5
order: 11
icon: "checkbox-24"
---

# Checkbox

Collect the user's choices.

```live-react
import { Checkbox } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox color="success" defaultChecked>Success</Checkbox>
    </>
  );
}
```
