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

Truyền `code` là chạy. Import được `react`, `devnonla-ui`, `devnonla-ui/markdown`, `devnonla-ui/chat`, và `react-hook-form`.

Mặc định không khung, kết quả nằm trong bài. `showHeader` thêm icon, nhãn Sandbox, Preview và Code trên cùng một thanh.

```tsx
import { ReactCodeSandbox } from "devnonla-ui/markdown";

<ReactCodeSandbox code={source} />
<ReactCodeSandbox code={source} showHeader />
```

## Hai kiểu

```live-react
import { ReactCodeSandbox } from "devnonla-ui/markdown";

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
        <ReactCodeSandbox code={source} showHeader />
      </div>
      <div className="min-w-0">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">không khung</div>
        <p className="mb-2 text-sm text-foreground">Đoạn trước kết quả.</p>
        <ReactCodeSandbox code={source} />
        <p className="text-sm text-foreground">Đoạn sau kết quả.</p>
      </div>
    </div>
  );
}
```
