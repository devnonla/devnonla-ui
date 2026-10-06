---
path: "/components/react-code-sandbox"
title: "ReactCodeSandbox"
group: "Data Display"
groupOrder: 6
order: 11
icon: "play-circle-24"
---

# ReactCodeSandbox

Chạy một component React viết dạng chuỗi trong iframe sandbox. Không đọc được cookie, storage hay DOM của trang chứa nó. Dùng cho code do user hoặc agent viết.

```tsx
import { ReactCodeSandbox } from "devnonla-ui";

<ReactCodeSandbox src="/sandbox.html" code={source} />
```

```live-react
import { useState } from "react";
import { Button } from "devnonla-ui";

export default function Demo() {
  const [count, setCount] = useState(0);
  return (
    <Button type="primary" onClick={() => setCount((value) => value + 1)}>
      Đã bấm {count}
    </Button>
  );
}
```
