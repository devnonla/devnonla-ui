export type SplitterSize = number | string;

export function parseSplitterSize(value: SplitterSize | undefined, container: number): number | undefined {
  if (value == null || container < 0) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.endsWith("%")) {
    const n = Number.parseFloat(trimmed.slice(0, -1));
    return Number.isFinite(n) ? Math.max(0, (n / 100) * container) : undefined;
  }
  const n = Number.parseFloat(trimmed);
  return Number.isFinite(n) ? Math.max(0, n) : undefined;
}

export function distributeSizes(declared: Array<number | undefined>, container: number): number[] {
  const count = declared.length;
  if (count === 0) return [];
  if (container <= 0) return declared.map((size) => size ?? 0);

  let known = 0;
  let unknown = 0;
  for (const size of declared) {
    if (size == null) unknown += 1;
    else known += size;
  }
  const leftover = container - known;
  const fill = unknown > 0 ? Math.max(0, leftover) / unknown : 0;
  const sizes = declared.map((size) => size ?? fill);
  const sum = sizes.reduce<number>((total, size) => total + size, 0);
  if (sum <= 0) return sizes.map(() => container / count);
  if (Math.abs(sum - container) > 0.5) return sizes.map((size) => (size / sum) * container);
  return sizes;
}

export function scaleSizes(sizes: number[], container: number): number[] {
  const count = sizes.length;
  if (count === 0 || container <= 0) return sizes;
  const sum = sizes.reduce<number>((total, size) => total + size, 0);
  if (sum <= 0) return sizes.map(() => container / count);
  return sizes.map((size) => (size / sum) * container);
}

export function applyDrag(
  left: number,
  right: number,
  delta: number,
  leftMin: number,
  leftMax: number,
  rightMin: number,
  rightMax: number,
): [number, number] {
  const pair = left + right;
  let nextLeft = Math.min(leftMax, Math.max(leftMin, left + delta));
  let nextRight = pair - nextLeft;
  if (nextRight < rightMin) {
    nextRight = rightMin;
    nextLeft = pair - nextRight;
  }
  if (nextRight > rightMax) {
    nextRight = rightMax;
    nextLeft = pair - nextRight;
  }
  nextLeft = Math.min(leftMax, Math.max(leftMin, nextLeft));
  nextRight = pair - nextLeft;
  return [Math.max(0, nextLeft), Math.max(0, nextRight)];
}
