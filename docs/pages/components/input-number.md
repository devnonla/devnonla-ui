---
path: "/components/input-number"
title: "InputNumber"
group: "Data Entry"
groupOrder: 5
order: 5
icon: "number-symbol-square-24"
---

# InputNumber

Enter a number within a range with the mouse or keyboard.

```live-react
import { InputNumber } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <InputNumber min={0} max={100} step={5} defaultValue={25} />
      <InputNumber min={0} max={10} step={0.1} precision={1} defaultValue={1.5} />
      <InputNumber controls={false} defaultValue={42} />
      <InputNumber disabled defaultValue={7} />
    </>
  );
}
```
