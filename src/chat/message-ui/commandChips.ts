export type ComposerCaret = { index: number; offset: number };

export type ComposerPart =
  | { type: "text"; id: string; value: string }
  | { type: "command"; id: string; label: string; value: string; title?: string; color?: string };

export function emptyComposer(value = ""): { parts: ComposerPart[]; caret: ComposerCaret } {
  return { parts: [{ type: "text", id: "t-0", value }], caret: { index: 0, offset: value.length } };
}

export function isComposerEmpty(parts: readonly ComposerPart[]): boolean {
  return parts.every((part) => part.type === "text" && part.value.length === 0);
}

export function serializeComposer(parts: readonly ComposerPart[]): string {
  return parts.map((part) => part.value).join("");
}

/** Keep a text run on both sides of every chip so the caret can sit inline. */
export function normalizeParts(parts: readonly ComposerPart[], caret: ComposerCaret | null): { parts: ComposerPart[]; caret: ComposerCaret | null } {
  const acc: ComposerPart[] = [];
  const caretOut: { current: ComposerCaret | null } = { current: null };

  const pushText = (value: string, fromIndex: number, localCaret: number | null) => {
    const prev = acc[acc.length - 1];
    if (prev?.type === "text") {
      const base = prev.value.length;
      prev.value += value;
      if (localCaret !== null && caret?.index === fromIndex) caretOut.current = { index: acc.length - 1, offset: base + localCaret };
      return;
    }
    acc.push({ type: "text", id: `t-${acc.length}`, value });
    if (localCaret !== null && caret?.index === fromIndex) caretOut.current = { index: acc.length - 1, offset: localCaret };
  };

  parts.forEach((part, index) => {
    if (part.type === "text") {
      pushText(part.value, index, caret?.index === index ? caret.offset : null);
      return;
    }
    if (acc.length === 0 || acc[acc.length - 1]?.type !== "text") pushText("", -1, null);
    acc.push({ ...part });
  });

  if (acc.length === 0 || acc[0]?.type !== "text") acc.unshift({ type: "text", id: "t-0", value: "" });
  if (acc[acc.length - 1]?.type !== "text") acc.push({ type: "text", id: "t-end", value: "" });

  const next = acc.map((part, index) => (part.type === "text" ? { ...part, id: `t-${index}` } : part));
  const placed = caretOut.current;
  if (!placed) return { parts: next, caret: null };
  const at = next[placed.index];
  if (!at || at.type !== "text") return { parts: next, caret: null };
  return { parts: next, caret: { index: placed.index, offset: Math.min(Math.max(placed.offset, 0), at.value.length) } };
}

export function insertTextAt(parts: readonly ComposerPart[], caret: ComposerCaret, text: string): { parts: ComposerPart[]; caret: ComposerCaret } {
  const part = parts[caret.index];
  if (!part || part.type !== "text") return { parts: [...parts], caret };
  const value = part.value.slice(0, caret.offset) + text + part.value.slice(caret.offset);
  const next = parts.map((item, index) => (index === caret.index && item.type === "text" ? { ...item, value } : item));
  const normalized = normalizeParts(next, { index: caret.index, offset: caret.offset + text.length });
  return { parts: normalized.parts, caret: normalized.caret ?? caret };
}

export function insertCommandAt(
  parts: readonly ComposerPart[],
  caret: ComposerCaret,
  tokenStart: number,
  tokenEnd: number,
  chip: { id: string; label: string; value: string; color?: string },
): { parts: ComposerPart[]; caret: ComposerCaret } {
  const next: ComposerPart[] = [];
  let caretIndex = caret.index;
  let caretOffset = caret.offset;
  parts.forEach((part, index) => {
    if (part.type !== "text" || index !== caret.index) {
      next.push(part);
      return;
    }
    const before = part.value.slice(0, tokenStart);
    let after = part.value.slice(tokenEnd);
    if (after === "" || !/^\s/.test(after)) after = ` ${after}`;
    next.push({ type: "text", id: part.id, value: before });
    next.push({ type: "command", ...chip });
    caretIndex = next.length;
    caretOffset = 1;
    next.push({ type: "text", id: `${chip.id}-after`, value: after });
  });
  const normalized = normalizeParts(next, { index: caretIndex, offset: caretOffset });
  return { parts: normalized.parts, caret: normalized.caret ?? { index: 0, offset: 0 } };
}

/** Insert a chip at the caret. Adds one space on each side when the text needs it. */
export function insertChipAt(parts: readonly ComposerPart[], caret: ComposerCaret, chip: { id: string; label: string; value: string; title?: string; color?: string }): { parts: ComposerPart[]; caret: ComposerCaret } {
  const part = parts[caret.index];
  if (!part || part.type !== "text") return { parts: [...parts], caret };
  const head = part.value.slice(0, caret.offset);
  const tail = part.value.slice(caret.offset);
  const before = head.length > 0 && !/\s$/.test(head) ? `${head} ` : head;
  const after = /^\s/.test(tail) ? tail : ` ${tail}`;
  const next: ComposerPart[] = [
    ...parts.slice(0, caret.index),
    { ...part, value: before },
    { type: "command", ...chip },
    { type: "text", id: `${chip.id}-after`, value: after },
    ...parts.slice(caret.index + 1),
  ];
  const normalized = normalizeParts(next, { index: caret.index + 2, offset: 1 });
  return { parts: normalized.parts, caret: normalized.caret ?? caret };
}

export function removeCommandPart(parts: readonly ComposerPart[], id: string): { parts: ComposerPart[]; caret: ComposerCaret } {
  const index = parts.findIndex((part) => part.type === "command" && part.id === id);
  if (index < 0) return { parts: [...parts], caret: { index: 0, offset: 0 } };
  const left = parts[index - 1];
  const next = parts.flatMap((part, partIndex) => {
    if (partIndex === index) return [];
    if (partIndex === index + 1 && part.type === "text" && left?.type === "text" && left.value.endsWith(" ") && part.value.startsWith(" ")) {
      return [{ ...part, value: part.value.slice(1) }];
    }
    return [part];
  });
  const leftIndex = Math.max(0, index - 1);
  const offset = left?.type === "text" ? left.value.length : 0;
  const normalized = normalizeParts(next, { index: leftIndex, offset });
  return { parts: normalized.parts, caret: normalized.caret ?? { index: 0, offset: 0 } };
}
