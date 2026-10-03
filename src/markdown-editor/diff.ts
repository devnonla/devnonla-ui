export type DiffSpan = { text: string; changed: boolean };

export type DiffLineKind = "equal" | "insert" | "delete" | "empty";

export type DiffLine = {
  kind: DiffLineKind;
  text: string;
  oldNo?: number;
  newNo?: number;
  spans: DiffSpan[];
};

/** One aligned row. Side-by-side shows both cells; inline flattens a change hunk. */
export type DiffRow = {
  left: DiffLine;
  right: DiffLine;
};

export type MarkdownDiffModel = {
  rows: DiffRow[];
  inline: DiffLine[];
  added: number;
  removed: number;
};

type Op<T> = { type: "equal" | "insert" | "delete"; value: T };

const CELL_LIMIT = 1_000_000;
const TOKEN_LIMIT = 500;

function equalOp<T>(value: T): Op<T> {
  return { type: "equal", value };
}

/** Longest-common-subsequence diff. Prefers a deletion when both edits keep the same LCS. */
function lcsDiff<T>(a: T[], b: T[]): Op<T>[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) return b.map((value) => ({ type: "insert", value }));
  if (m === 0) return a.map((value) => ({ type: "delete", value }));

  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    const row = dp[i]!;
    const below = dp[i + 1]!;
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) row[j] = below[j + 1]! + 1;
      else row[j] = Math.max(below[j]!, row[j + 1]!);
    }
  }

  const ops: Op<T>[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", value: a[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: "delete", value: a[i]! });
      i++;
    } else {
      ops.push({ type: "insert", value: b[j]! });
      j++;
    }
  }
  while (i < n) ops.push({ type: "delete", value: a[i++]! });
  while (j < m) ops.push({ type: "insert", value: b[j++]! });
  return ops;
}

/** Linear fallback when the changed region is too large for the LCS table. */
function greedyDiff(a: string[], b: string[]): Op<string>[] {
  const positions = new Map<string, number[]>();
  for (let i = 0; i < b.length; i++) {
    const list = positions.get(b[i]!) ?? [];
    list.push(i);
    positions.set(b[i]!, list);
  }

  const ops: Op<string>[] = [];
  let j = 0;
  for (const line of a) {
    const list = positions.get(line);
    if (list) {
      while (list.length > 0 && list[0]! < j) list.shift();
    }
    const match = list && list.length > 0 ? list.shift()! : -1;
    if (match < 0) {
      ops.push({ type: "delete", value: line });
      continue;
    }
    while (j < match) ops.push({ type: "insert", value: b[j++]! });
    ops.push({ type: "equal", value: line });
    j = match + 1;
  }
  while (j < b.length) ops.push({ type: "insert", value: b[j++]! });
  return ops;
}

function diffLines(a: string[], b: string[]): Op<string>[] {
  let start = 0;
  const maxStart = Math.min(a.length, b.length);
  while (start < maxStart && a[start] === b[start]) start++;

  let aEnd = a.length;
  let bEnd = b.length;
  while (aEnd > start && bEnd > start && a[aEnd - 1] === b[bEnd - 1]) {
    aEnd--;
    bEnd--;
  }

  const midA = a.slice(start, aEnd);
  const midB = b.slice(start, bEnd);
  const mid = midA.length * midB.length > CELL_LIMIT ? greedyDiff(midA, midB) : lcsDiff(midA, midB);
  return [...a.slice(0, start).map(equalOp), ...mid, ...a.slice(aEnd).map(equalOp)];
}

function splitDiffLines(text: string): string[] {
  if (text.length === 0) return [];
  const parts = text.split("\n");
  if (text.endsWith("\n")) parts.pop();
  return parts;
}

function plain(text: string): DiffSpan[] {
  return [{ text, changed: false }];
}

function tokenize(line: string): string[] {
  return line.match(/[A-Za-z0-9_]+|\s+|[^\sA-Za-z0-9_]+/g) ?? (line ? [line] : []);
}

function spansFrom(ops: Op<string>[], side: "delete" | "insert"): DiffSpan[] {
  const spans: DiffSpan[] = [];
  const push = (text: string, changed: boolean) => {
    const last = spans[spans.length - 1];
    if (last && last.changed === changed) last.text += text;
    else spans.push({ text, changed });
  };
  for (const op of ops) {
    if (op.type === "equal") push(op.value, false);
    else if ((side === "delete" && op.type === "delete") || (side === "insert" && op.type === "insert")) push(op.value, true);
  }
  return spans;
}

function intraLine(before: string, after: string): { before: DiffSpan[]; after: DiffSpan[] } | null {
  const left = tokenize(before);
  const right = tokenize(after);
  if (left.length === 0 || right.length === 0 || left.length > TOKEN_LIMIT || right.length > TOKEN_LIMIT) return null;
  const ops = lcsDiff(left, right);
  if (!ops.some((op) => op.type === "equal")) return null;
  return { before: spansFrom(ops, "delete"), after: spansFrom(ops, "insert") };
}

function emptyLine(): DiffLine {
  return { kind: "empty", text: "", spans: [] };
}

function rowsToInline(rows: DiffRow[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i]!;
    if (row.left.kind === "equal") {
      lines.push({
        kind: "equal",
        text: row.left.text,
        oldNo: row.left.oldNo,
        newNo: row.right.newNo,
        spans: plain(row.left.text),
      });
      i++;
      continue;
    }
    const deleted: DiffLine[] = [];
    const inserted: DiffLine[] = [];
    while (i < rows.length && rows[i]!.left.kind !== "equal") {
      const current = rows[i]!;
      if (current.left.kind === "delete") deleted.push(current.left);
      if (current.right.kind === "insert") inserted.push(current.right);
      i++;
    }
    lines.push(...deleted, ...inserted);
  }
  return lines;
}

/** Line diff of two markdown versions, with word highlights inside changed lines. */
export function diffMarkdown(original: string, modified: string): MarkdownDiffModel {
  const ops = diffLines(splitDiffLines(original), splitDiffLines(modified));
  const rows: DiffRow[] = [];
  let oldNo = 1;
  let newNo = 1;
  let added = 0;
  let removed = 0;
  let i = 0;

  while (i < ops.length) {
    const op = ops[i]!;
    if (op.type === "equal") {
      const spans = plain(op.value);
      rows.push({
        left: { kind: "equal", text: op.value, oldNo, spans },
        right: { kind: "equal", text: op.value, newNo, spans },
      });
      oldNo++;
      newNo++;
      i++;
      continue;
    }

    const deleted: string[] = [];
    const inserted: string[] = [];
    while (i < ops.length && ops[i]!.type !== "equal") {
      const current = ops[i]!;
      if (current.type === "delete") deleted.push(current.value);
      else inserted.push(current.value);
      i++;
    }

    const count = Math.max(deleted.length, inserted.length);
    for (let k = 0; k < count; k++) {
      const leftText = deleted[k];
      const rightText = inserted[k];
      const intra = leftText !== undefined && rightText !== undefined ? intraLine(leftText, rightText) : null;
      const left: DiffLine =
        leftText !== undefined ? { kind: "delete", text: leftText, oldNo: oldNo++, spans: intra?.before ?? plain(leftText) } : emptyLine();
      const right: DiffLine =
        rightText !== undefined ? { kind: "insert", text: rightText, newNo: newNo++, spans: intra?.after ?? plain(rightText) } : emptyLine();
      if (leftText !== undefined) removed++;
      if (rightText !== undefined) added++;
      rows.push({ left, right });
    }
  }

  return { rows, inline: rowsToInline(rows), added, removed };
}

export type FoldItem<T> = { type: "item"; item: T } | { type: "fold"; id: number; count: number; items: T[] };

/** Collapse long unchanged runs, keeping a few lines of context around edits. */
export function foldContext<T>(items: T[], isEqual: (item: T) => boolean, context = 3): FoldItem<T>[] {
  const out: FoldItem<T>[] = [];
  let i = 0;
  let foldId = 0;

  const pushItems = (slice: T[]) => {
    for (const item of slice) out.push({ type: "item", item });
  };
  const pushFold = (hidden: T[]) => {
    if (hidden.length === 0) return;
    out.push({ type: "fold", id: foldId, count: hidden.length, items: hidden });
    foldId++;
  };

  while (i < items.length) {
    if (!isEqual(items[i]!)) {
      out.push({ type: "item", item: items[i]! });
      i++;
      continue;
    }
    let j = i;
    while (j < items.length && isEqual(items[j]!)) j++;
    const run = items.slice(i, j);
    const atStart = i === 0;
    const atEnd = j === items.length;

    if (atStart && atEnd) {
      if (run.length > context * 2 + 1) {
        pushItems(run.slice(0, context));
        pushFold(run.slice(context, run.length - context));
        pushItems(run.slice(run.length - context));
      } else pushItems(run);
    } else if (atStart) {
      const keepFrom = Math.max(0, run.length - context);
      pushFold(run.slice(0, keepFrom));
      pushItems(run.slice(keepFrom));
    } else if (atEnd) {
      const keep = Math.min(context, run.length);
      pushItems(run.slice(0, keep));
      pushFold(run.slice(keep));
    } else if (run.length > context * 2) {
      pushItems(run.slice(0, context));
      pushFold(run.slice(context, run.length - context));
      pushItems(run.slice(run.length - context));
    } else {
      pushItems(run);
    }
    i = j;
  }

  return out;
}
