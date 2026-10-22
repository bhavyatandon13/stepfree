// Display settings (text size, high contrast) and the cookie/storage choice.
// Kept in a tiny store so React components can read it with useSyncExternalStore.
export type Consent = "unset" | "agree" | "disagree";
export type Prefs = { loaded: boolean; size: number; contrast: boolean; consent: Consent };

export const SIZES = [100, 115, 130, 150];
const KEY = "stepfree-prefs";
const SERVER: Prefs = { loaded: false, size: 100, contrast: false, consent: "unset" };

let state: Prefs = SERVER;
const subs = new Set<() => void>();

function apply() {
  document.documentElement.style.fontSize = `${state.size}%`;
  if (state.contrast) document.documentElement.setAttribute("data-contrast", "high");
  else document.documentElement.removeAttribute("data-contrast");
}

function save() {
  // Without the visitor's OK we remember only their choice, never their display settings.
  const data = state.consent === "agree" ? { consent: state.consent, size: state.size, contrast: state.contrast } : { consent: state.consent };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage can be blocked; the page still works */
  }
}

export function initPrefs() {
  if (state.loaded) return;
  let saved: Partial<Prefs> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    /* ignore */
  }
  const size = SIZES.includes(saved.size as number) ? (saved.size as number) : 100;
  state = { loaded: true, size, contrast: !!saved.contrast, consent: saved.consent === "agree" || saved.consent === "disagree" ? saved.consent : "unset" };
  apply();
  subs.forEach((f) => f());
}

export function setPrefs(p: Partial<Prefs>) {
  state = { ...state, ...p };
  apply();
  save();
  subs.forEach((f) => f());
}

export const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};
export const getSnapshot = () => state;
export const getServerSnapshot = () => SERVER;
