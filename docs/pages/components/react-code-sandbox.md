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

Mặc định có khung: icon, nhãn Sandbox, Preview và Code nằm trên cùng một thanh. `showHeader={false}` bỏ khung, kết quả nằm trong bài.

```tsx
import { ReactCodeSandbox } from "devnonla-ui";

<ReactCodeSandbox src="/sandbox.html" code={source} />
<ReactCodeSandbox src="/sandbox.html" code={source} showHeader={false} />
```

## Hai kiểu

```live-react
import { ReactCodeSandbox } from "devnonla-ui";

const source = `import { useState } from "react";
import { Button } from "devnonla-ui";

export default function Demo() {
  const [count, setCount] = useState(0);
  return (
    <Button type="primary" onClick={() => setCount((value) => value + 1)}>
      Đã bấm {count}
    </Button>
  );
}
`;

export default function Demo() {
  return (
    <div className="grid w-full items-start gap-8 text-left md:grid-cols-2">
      <div className="min-w-0">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">có khung</div>
        <ReactCodeSandbox src="/sandbox.html" code={source} />
      </div>
      <div className="min-w-0">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">không khung</div>
        <p className="mb-2 text-sm text-foreground">Đoạn trước kết quả.</p>
        <ReactCodeSandbox src="/sandbox.html" code={source} showHeader={false} />
        <p className="text-sm text-foreground">Đoạn sau kết quả.</p>
      </div>
    </div>
  );
}
```
