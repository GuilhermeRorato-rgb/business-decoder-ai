import { useMemo, useSyncExternalStore } from "react";
import { learningStore } from "@/lib/learning-store";
import {
  CONCEPTS,
  CONCEPT_BY_ID,
  LEARNING_PATH,
  recommendNext,
  type Concept,
} from "@/lib/knowledge";

export function useLearning() {
  const state = useSyncExternalStore(
    learningStore.subscribe,
    learningStore.getSnapshot,
    learningStore.getServerSnapshot,
  );

  const learnedIds = useMemo(() => new Set(Object.keys(state.learned)), [state]);

  const total = CONCEPTS.length;
  const learnedCount = learnedIds.size;
  const progress = total === 0 ? 0 : Math.round((learnedCount / total) * 100);

  const pathProgress = useMemo(() => {
    const done = LEARNING_PATH.filter((id) => learnedIds.has(id)).length;
    return {
      done,
      total: LEARNING_PATH.length,
      pct: Math.round((done / LEARNING_PATH.length) * 100),
    };
  }, [learnedIds]);

  const recommendations: Concept[] = useMemo(
    () => recommendNext(learnedIds, 3),
    [learnedIds],
  );

  const learnedConcepts: Concept[] = useMemo(
    () =>
      Object.entries(state.learned)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => CONCEPT_BY_ID[id])
        .filter(Boolean),
    [state],
  );

  return {
    learnedIds,
    learnedCount,
    learnedConcepts,
    total,
    progress,
    pathProgress,
    recommendations,
    markLearned: learningStore.markLearned,
    reset: learningStore.reset,
  };
}

export function isLearned(learnedIds: Set<string>, id: string) {
  return learnedIds.has(id);
}

export function isUnlocked(learnedIds: Set<string>, id: string) {
  const c = CONCEPT_BY_ID[id];
  if (!c) return false;
  return (c.requires ?? []).every((r) => learnedIds.has(r));
}
