/**
 * Paint `light` or `dark` on the Nonla host (`.nonla-ui`). Dark is the default.
 * The stored choice may be `system`, which follows the OS and still paints one of those two.
 *
 * `App` binds the host via `bindColorModeTarget`. Callers can still pass an explicit
 * `target` to `setColorMode` / `initColorMode`. Without a bound host, the fallback is
 * `<html>` for sandboxes that mount their own root.
 */

export type NonlaColorMode = "light" | "dark";

/** Stored choice. `system` follows the OS and still applies `light` or `dark` on the host. */
export type NonlaColorPreference = NonlaColorMode | "system";

/** `localStorage` key written by `setColorMode` / `setColorPreference`. */
export const NONLA_COLOR_MODE_KEY = "nonla-color-mode";

const listeners = new Set<() => void>();
let mode: NonlaColorMode = "dark";
let preference: NonlaColorPreference = "dark";
let ready = false;
let schemeQuery: MediaQueryList | null = null;
let boundTarget: HTMLElement | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const subscribeColorMode = subscribe;
export const subscribeColorPreference = subscribe;

export function getColorMode(): NonlaColorMode {
  return mode;
}

export function getColorPreference(): NonlaColorPreference {
  return preference;
}

/** Host `App` paints mode on. Cleared on unmount. */
export function bindColorModeTarget(target: HTMLElement | null) {
  boundTarget = target;
}

function colorTarget(explicit?: HTMLElement): HTMLElement {
  return explicit ?? boundTarget ?? document.documentElement;
}

function readStored(): NonlaColorPreference | null {
  try {
    // Sandboxed iframes throw on the property access itself, before getItem.
    const value = localStorage.getItem(NONLA_COLOR_MODE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : null;
  } catch {
    return null;
  }
}

function writeStored(next: NonlaColorPreference) {
  try {
    localStorage.setItem(NONLA_COLOR_MODE_KEY, next);
  } catch {
    /* private mode or sandboxed iframe */
  }
}

function systemMode(): NonlaColorMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolved(next: NonlaColorPreference): NonlaColorMode {
  return next === "system" ? systemMode() : next;
}

function watchSystem() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function" || schemeQuery) return;
  schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  schemeQuery.addEventListener("change", () => {
    if (preference === "system") applyColorMode(systemMode());
  });
}

function modeFromClass(el: HTMLElement): NonlaColorMode | null {
  if (el.classList.contains("light")) return "light";
  if (el.classList.contains("dark")) return "dark";
  return null;
}

/** Set `light` or `dark` on `target` (bound host, or `<html>` fallback) so portals inherit the palette. */
export function applyColorMode(next: NonlaColorMode, target?: HTMLElement) {
  mode = next;
  const el = colorTarget(target);
  el.classList.toggle("light", next === "light");
  el.classList.toggle("dark", next === "dark");
  el.style.colorScheme = next;
  notify();
}

/** Switch the stored choice. `system` follows the OS and still paints `light` or `dark`. */
export function setColorPreference(next: NonlaColorPreference, target?: HTMLElement) {
  preference = next;
  if (next === "system") watchSystem();
  if (typeof document === "undefined") {
    mode = resolved(next);
    notify();
    return;
  }
  ready = true;
  writeStored(next);
  applyColorMode(resolved(next), target);
}

/** Switch mode and remember it. */
export function setColorMode(next: NonlaColorMode, target?: HTMLElement) {
  setColorPreference(next, target);
}

/** Apply the saved mode once. Falls back to dark. A stored `system` choice follows the OS. */
export function initColorMode(target?: HTMLElement): NonlaColorMode {
  if (typeof document === "undefined") return mode;
  const el = colorTarget(target);
  if (ready) {
    applyColorMode(mode, el);
    return mode;
  }
  ready = true;
  const fromClass = modeFromClass(el) ?? modeFromClass(document.documentElement);
  const next = readStored() ?? fromClass ?? "dark";
  preference = next;
  if (next === "system") watchSystem();
  applyColorMode(resolved(next), el);
  return mode;
}
