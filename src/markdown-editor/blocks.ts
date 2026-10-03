export type MarkdownBlockKind = "text" | "code" | "mermaid";

export type MarkdownBlock = {
  kind: MarkdownBlockKind;
  /** Block source without the newline gap after it. */
  body: string;
  /** Exact characters between this block and the next, usually newlines. */
  trailing: string;
};

export type MarkdownDoc = {
  /** Newlines before the first block. */
  leading: string;
  blocks: MarkdownBlock[];
};

type Line = { text: string; nl: boolean };
type Group = { kind: MarkdownBlockKind; lineStart: number; lineEnd: number };

const FENCE = /^( {0,3})(`{3,}|~{3,})(.*)$/;

function linesOf(markdown: string): Line[] {
  if (markdown.length === 0) return [];
  const parts = markdown.split("\n");
  const lines: Line[] = [];
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    if (isLast && parts[i] === "") continue;
    lines.push({ text: parts[i] ?? "", nl: !isLast });
  }
  return lines;
}

function lineSource(line: Line): string {
  return line.text + (line.nl ? "\n" : "");
}

function fenceMark(text: string): { marker: string; lang: string } | null {
  const match = FENCE.exec(text);
  if (!match) return null;
  const info = match[3] ?? "";
  const lang = info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return { marker: match[2] ?? "", lang };
}

function isHeading(text: string): boolean {
  return /^#{1,6}(?:\s|$)/.test(text);
}

function isHr(text: string): boolean {
  return /^ {0,3}(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(text);
}

const LIST_LINE = /^(\s*)([-+*]|\d{1,9}[.)])([ \t]+)(.*)$/;

function isListItemLine(text: string): boolean {
  return !isHr(text) && LIST_LINE.test(text);
}

function closesFence(open: { marker: string; lang: string }, text: string): boolean {
  const close = fenceMark(text);
  if (!close || !open.marker) return false;
  return close.marker[0] === open.marker[0] && close.marker.length >= open.marker.length && close.lang === "";
}

/** Split markdown into blocks. `joinMarkdownDoc(parseMarkdownDoc(text))` round-trips. */
export function parseMarkdownDoc(markdown: string): MarkdownDoc {
  const lines = linesOf(markdown);
  let i = 0;
  let leading = "";
  while (i < lines.length && lines[i]?.text === "") {
    leading += lineSource(lines[i]!);
    i++;
  }

  const groups: Group[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (!line || line.text === "") {
      i++;
      continue;
    }

    const fence = fenceMark(line.text);
    if (fence) {
      const start = i;
      i++;
      while (i < lines.length) {
        const closed = closesFence(fence, lines[i]?.text ?? "");
        i++;
        if (closed) break;
      }
      groups.push({ kind: fence.lang === "mermaid" ? "mermaid" : "code", lineStart: start, lineEnd: i });
      continue;
    }

    if (isHeading(line.text) || isHr(line.text)) {
      groups.push({ kind: "text", lineStart: i, lineEnd: i + 1 });
      i++;
      continue;
    }

    if (isListItemLine(line.text)) {
      const start = i;
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (!next || next.text === "") break;
        if (isListItemLine(next.text) || isHeading(next.text) || isHr(next.text) || fenceMark(next.text)) break;
        if (!/^\s/.test(next.text)) break;
        i++;
      }
      groups.push({ kind: "text", lineStart: start, lineEnd: i });
      continue;
    }

    const start = i;
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (!next || next.text === "" || isHeading(next.text) || isHr(next.text) || fenceMark(next.text) || isListItemLine(next.text)) break;
      i++;
    }
    groups.push({ kind: "text", lineStart: start, lineEnd: i });
  }

  const blocks: MarkdownBlock[] = groups.map((group, index) => {
    const bodyLines = lines.slice(group.lineStart, group.lineEnd);
    const body = bodyLines.map((entry) => entry.text).join("\n");
    const nextStart = groups[index + 1]?.lineStart ?? lines.length;
    const last = bodyLines[bodyLines.length - 1];
    let trailing = last?.nl ? "\n" : "";
    for (let cursor = group.lineEnd; cursor < nextStart; cursor++) {
      const gap = lines[cursor];
      if (gap) trailing += lineSource(gap);
    }
    return { kind: group.kind, body, trailing };
  });

  return { leading, blocks };
}

export function joinMarkdownDoc(doc: MarkdownDoc): string {
  return doc.leading + doc.blocks.map((block) => block.body + block.trailing).join("");
}

/** Drop cleared paragraphs, headings, and list items. Code and mermaid fences stay. */
export function cleanupDoc(doc: MarkdownDoc): MarkdownDoc {
  const blocks = doc.blocks.filter((block) => !(block.kind === "text" && textBlockIsEmpty(block.body)));
  if (blocks.length === 0) return { leading: "", blocks: [] };
  return { leading: doc.leading, blocks };
}

/** Add an empty paragraph after the current document. */
export function appendTextBlock(doc: MarkdownDoc): MarkdownDoc {
  if (doc.blocks.length === 0) {
    return { leading: doc.leading, blocks: [{ kind: "text", body: "", trailing: "" }] };
  }
  const blocks = doc.blocks.slice();
  const last = blocks[blocks.length - 1]!;
  let trailing = last.trailing;
  if (!trailing.endsWith("\n")) trailing += "\n";
  if (!trailing.endsWith("\n\n")) trailing += "\n";
  blocks[blocks.length - 1] = { ...last, trailing };
  blocks.push({ kind: "text", body: "", trailing: "" });
  return { leading: doc.leading, blocks };
}

/** Inner code of a fence, without the opening and closing lines. */
export function readFence(body: string): { lang: string; code: string } | null {
  const lines = body.split("\n");
  const open = fenceMark(lines[0] ?? "");
  if (!open) return null;
  let end = lines.length;
  if (lines.length > 1 && closesFence(open, lines[lines.length - 1] ?? "")) end = lines.length - 1;
  return { lang: open.lang, code: lines.slice(1, end).join("\n") };
}

export type InlineEdit =
  | { kind: "plain"; text: string }
  | { kind: "heading"; level: number; gap: string; text: string }
  | { kind: "list"; indent: string; marker: string; ordered: boolean; task: boolean; checked: boolean; text: string };

const HEADING_LINE = /^(#{1,6})([ \t]*)(.*)$/;
const TASK_PREFIX = /^\[([ xX])\]([ \t]*)(.*)$/;

/** Text the preview editor shows. Headings omit `#`, list items omit the marker. */
export function readInlineEdit(body: string): InlineEdit {
  const nl = body.indexOf("\n");
  const first = nl === -1 ? body : body.slice(0, nl);
  const rest = nl === -1 ? "" : body.slice(nl + 1);
  const withRest = (content: string) => (rest ? `${content}\n${rest}` : content);

  const item = !isHr(first) ? LIST_LINE.exec(first) : null;
  if (item) {
    const indent = item[1] ?? "";
    const bullet = item[2] ?? "-";
    const space = item[3] ?? " ";
    const after = item[4] ?? "";
    const task = TASK_PREFIX.exec(after);
    const ordered = /^\d/.test(bullet);
    if (task) {
      const content = task[3] ?? "";
      const marker = `${bullet}${space}[${task[1]}]${task[2] ?? ""}`;
      return {
        kind: "list",
        indent,
        marker,
        ordered,
        task: true,
        checked: (task[1] ?? "").toLowerCase() === "x",
        text: listText(content, rest, nl !== -1, indent.length + marker.length),
      };
    }
    const marker = `${bullet}${space}`;
    return { kind: "list", indent, marker, ordered, task: false, checked: false, text: listText(after, rest, nl !== -1, indent.length + marker.length) };
  }

  const heading = isHeading(first) ? HEADING_LINE.exec(first) : null;
  if (heading) {
    const hashes = heading[1] ?? "#";
    return { kind: "heading", level: hashes.length, gap: heading[2] ?? "", text: withRest(heading[3] ?? "") };
  }

  return { kind: "plain", text: body };
}

function listText(content: string, rest: string, hadBreak: boolean, pad: number): string {
  if (!hadBreak) return content;
  const lines = rest.split("\n").map((line) => {
    let i = 0;
    while (i < pad && (line[i] === " " || line[i] === "\t")) i += 1;
    return line.slice(i);
  });
  return `${content}\n${lines.join("\n")}`;
}

function listSource(indent: string, marker: string, text: string): string {
  const pad = `${indent}${" ".repeat(marker.length)}`;
  const lines = text.split("\n");
  return lines.map((line, index) => (index === 0 ? `${indent}${marker}${line}` : `${pad}${line}`)).join("\n");
}

function markerNumber(marker: string): number {
  return Number(/^(\d+)/.exec(marker)?.[1] ?? "1");
}

function withMarkerNumber(marker: string, n: number): string {
  return marker.replace(/^\d+/, String(n));
}

function markerDelim(marker: string): string {
  return /^\d+\)/.test(marker) ? ")" : ".";
}

function nextListMarker(view: Extract<InlineEdit, { kind: "list" }>): string {
  let marker = view.marker;
  if (view.ordered) marker = withMarkerNumber(marker, markerNumber(marker) + 1);
  if (view.task) marker = marker.replace(/\[[ xX]\]/, "[ ]");
  return marker;
}

/** Put the hidden marker back in front of the edited text. */
export function writeInlineEdit(body: string, text: string): string {
  const view = readInlineEdit(body);
  if (view.kind === "plain") return text;
  if (view.kind === "list") return listSource(view.indent, view.marker, text);
  const lines = text.split("\n");
  const first = lines[0] ?? "";
  const tail = lines.slice(1);
  const gap = view.gap.length > 0 ? view.gap : first.length > 0 ? " " : "";
  return [`${"#".repeat(view.level)}${gap}${first}`, ...tail].join("\n");
}

/** Enter in a list item: keep the text before the caret, open a sibling item for the rest. */
export function splitListItem(doc: MarkdownDoc, index: number, before: string, after: string): { doc: MarkdownDoc; index: number } | null {
  const block = doc.blocks[index];
  if (!block || block.kind !== "text") return null;
  const view = readInlineEdit(block.body);
  if (view.kind !== "list") return null;

  const blocks = doc.blocks.slice();
  const marker = nextListMarker(view);
  blocks[index] = { ...block, body: listSource(view.indent, view.marker, before) };
  const at = listItemEnd(blocks, index, view.indent);
  const previous = blocks[at - 1] ?? block;
  const carried = previous.trailing;
  blocks[at - 1] = { ...previous, trailing: "\n" };
  blocks.splice(at, 0, { kind: "text", body: listSource(view.indent, marker, after), trailing: carried });
  if (view.ordered) renumberOrdered(blocks, at, view.indent, markerDelim(view.marker));
  return { doc: { ...doc, blocks }, index: at };
}

function listItemEnd(blocks: MarkdownBlock[], index: number, indent: string): number {
  let end = index + 1;
  while (end < blocks.length) {
    const block = blocks[end];
    if (!block || block.kind !== "text") break;
    const item = readInlineEdit(block.body);
    if (item.kind !== "list" || item.indent.length <= indent.length) break;
    end += 1;
  }
  return end;
}

function renumberOrdered(blocks: MarkdownBlock[], from: number, indent: string, delim: string) {
  const first = blocks[from] ? readInlineEdit(blocks[from].body) : null;
  if (!first || first.kind !== "list" || !first.ordered) return;
  let n = markerNumber(first.marker);
  for (let i = from + 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block || block.kind !== "text") break;
    const item = readInlineEdit(block.body);
    if (item.kind !== "list") break;
    if (item.indent.length < indent.length) break;
    if (item.indent.length > indent.length) continue;
    if (!item.ordered || markerDelim(item.marker) !== delim) break;
    n += 1;
    const marker = withMarkerNumber(item.marker, n);
    if (marker === item.marker) continue;
    const prefix = item.indent + item.marker;
    if (!block.body.startsWith(prefix)) continue;
    blocks[i] = { ...block, body: item.indent + marker + block.body.slice(prefix.length) };
  }
}

export function textBlockIsEmpty(body: string): boolean {
  return readInlineEdit(body).text.trim() === "";
}
