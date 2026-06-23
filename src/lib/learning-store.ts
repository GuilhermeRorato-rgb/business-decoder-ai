// Tiny external store for tracking learned concepts. Backed by localStorage
// and exposed via useSyncExternalStore so the Knowledge Sidebar updates
// instantly the moment a concept is marked as learned in the chat.

const KEY = "company-decoder.learning.v1";

type LearningState = {
  learned: Record<string, number>; // conceptId -> timestamp learned
};

const empty: LearningState = { learned: {} };

let state: LearningState = empty;
const listeners = new Set<() => void>();

function read(): LearningState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { learned: {} };
    const parsed = JSON.parse(raw) as LearningState;
    return { learned: parsed.learned ?? {} };
  } catch {
    return { learned: {} };
  }
}

function persist(next: LearningState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const l of listeners) l();
}

function hydrateIfNeeded() {
  if (state === empty && typeof window !== "undefined") {
    state = read();
  }
}

export const learningStore = {
  subscribe(listener: () => void) {
    hydrateIfNeeded();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): LearningState {
    hydrateIfNeeded();
    return state;
  },
  getServerSnapshot(): LearningState {
    return empty;
  },
  markLearned(conceptId: string) {
    hydrateIfNeeded();
    if (state.learned[conceptId]) return;
    state = { learned: { ...state.learned, [conceptId]: Date.now() } };
    persist(state);
    emit();
  },
  reset() {
    state = { learned: {} };
    persist(state);
    emit();
  },
};

if (typeof window !== "undefined") {
  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  });
}
