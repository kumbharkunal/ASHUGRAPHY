import { useSyncExternalStore } from "react";

/** Discrete UI state shared across client islands. Continuous values never live here. */
export interface UIState {
  menuOpen: boolean;
  viewerOpen: boolean;
  preloaderDone: boolean;
  navTone: "light" | "dark";
  activeSection: string | null;
  heroPassed: boolean;
  bookingInView: boolean;
  footerInView: boolean;
}

const initialState: UIState = {
  menuOpen: false,
  viewerOpen: false,
  preloaderDone: false,
  navTone: "dark",
  activeSection: null,
  heroPassed: false,
  bookingInView: false,
  footerInView: false,
};

let state: UIState = initialState;
const listeners = new Set<() => void>();

export const uiStore = {
  get: (): UIState => state,
  set(partial: Partial<UIState>) {
    let changed = false;
    for (const key of Object.keys(partial) as (keyof UIState)[]) {
      if (state[key] !== partial[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...partial };
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Subscribe to one primitive slice of UI state. Selectors must return primitives. */
export function useUI<T extends string | number | boolean | null>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    uiStore.subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}
