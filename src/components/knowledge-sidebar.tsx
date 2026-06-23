import { Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, CONCEPTS_BY_CATEGORY, type Concept } from "@/lib/knowledge";
import { useLearning, isUnlocked } from "@/hooks/use-learning";

export function KnowledgeSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { learnedIds, learnedCount, total, progress, recommendations, pathProgress } =
    useLearning();
  const router = useRouter();

  // Auto-expand the category that contains the first recommendation.
  const initialOpen = useMemo(() => {
    const set = new Set(CATEGORIES.map((c) => c.id));
    return Object.fromEntries(
      CATEGORIES.map((c) => [c.id, recommendations[0]?.category === c.id ? true : false]),
    ) as Record<string, boolean>;
    // we only want this computed once; recompute is fine but cheap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  const goAsk = (concept: Concept) => {
    const slug = concept.bestCase ?? "oncoclinicas";
    router.navigate({
      to: "/company/$slug",
      params: { slug },
      search: { ask: concept.sample, tab: "chat" } as never,
    });
  };

  if (collapsed) {
    return (
      <aside className="hidden w-14 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <button
          onClick={onToggle}
          aria-label="Expandir Knowledge Graph"
          className="flex h-14 items-center justify-center border-b border-border text-muted-foreground hover:text-amber"
        >
          <span className="font-mono text-xs">»</span>
        </button>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]">
            Knowledge
          </div>
          <div className="mt-2 font-display text-sm text-amber">{progress}%</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-surface md:flex">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
            Knowledge Graph
          </div>
          <div className="font-display text-sm">Sua trilha de aprendizado</div>
        </div>
        <button
          onClick={onToggle}
          aria-label="Recolher Knowledge Graph"
          className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-amber hover:text-amber"
        >
          «
        </button>
      </div>

      {/* Progress */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Progresso global
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {learnedCount}/{total}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-3xl text-amber">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
          <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Trilha base</span>
          <span>
            {pathProgress.done}/{pathProgress.total}
          </span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-background">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${pathProgress.pct}%` }}
          />
        </div>
      </div>

      {/* Recommended next */}
      <div className="border-b border-border px-4 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Próximos recomendados
        </div>
        {recommendations.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Você cobriu todos os conceitos. Parabéns 🎉
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {recommendations.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goAsk(c)}
                className="group flex w-full items-center gap-2 rounded border border-border bg-background px-2 py-1.5 text-left transition hover:border-amber"
              >
                <span className="font-mono text-[10px] text-amber">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xs text-foreground group-hover:text-amber">
                    {c.label}
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">
                    {CATEGORIES.find((cat) => cat.id === c.category)?.label}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">→</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {CATEGORIES.map((cat) => {
          const items = CONCEPTS_BY_CATEGORY[cat.id];
          const learnedInCat = items.filter((c) => learnedIds.has(c.id)).length;
          const isOpen = open[cat.id] ?? false;
          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => setOpen((o) => ({ ...o, [cat.id]: !isOpen }))}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:bg-background"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="font-display text-xs uppercase tracking-wider">
                    {cat.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {learnedInCat}/{items.length}
                </span>
              </button>
              {isOpen && (
                <ul className="ml-3 mt-0.5 border-l border-border pl-2">
                  {items.map((c, i) => {
                    const done = learnedIds.has(c.id);
                    const unlocked = isUnlocked(learnedIds, c.id);
                    const isLast = i === items.length - 1;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => goAsk(c)}
                          title={c.short}
                          className={`group flex w-full items-center gap-2 rounded px-2 py-1 text-left font-mono text-[11px] transition hover:bg-background ${
                            done ? "text-foreground" : unlocked ? "text-muted-foreground" : "text-muted-foreground/50"
                          }`}
                        >
                          <span className="text-muted-foreground">
                            {isLast ? "└─" : "├─"}
                          </span>
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              done
                                ? "bg-success"
                                : unlocked
                                  ? "bg-amber/60"
                                  : "bg-border"
                            }`}
                          />
                          <span className={`truncate ${done ? "" : "group-hover:text-amber"}`}>
                            {c.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-4 py-3">
        <Link
          to="/"
          className="block text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-amber"
        >
          ← Coverage Universe
        </Link>
      </div>
    </aside>
  );
}
