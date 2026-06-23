import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMPANIES, getCompany, type Company } from "@/lib/companies";
import { buildAnswer, type Answer } from "@/lib/answer-engine";
import { CATEGORIES, CONCEPT_BY_ID, LEARNING_PATH, type Concept } from "@/lib/knowledge";
import { useLearning } from "@/hooks/use-learning";
import { learningStore } from "@/lib/learning-store";

type Tab = "overview" | "chat" | "map" | "events" | "trail";

const TAB_VALUES: Tab[] = ["overview", "chat", "map", "events", "trail"];

type ChatMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; answer: Answer };

export const Route = createFileRoute("/company/$slug")({
  head: ({ params }) => {
    const c = getCompany(params.slug);
    const title = c ? `${c.name} (${c.ticker}) · Company Decoder` : "Company Decoder";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: c
            ? `Estude ${c.name} — ${c.sector}. ${c.description}`
            : "Empresa não encontrada.",
        },
      ],
    };
  },
  validateSearch: (search: Record<string, unknown>) => {
    const tab = typeof search.tab === "string" && TAB_VALUES.includes(search.tab as Tab)
      ? (search.tab as Tab)
      : undefined;
    const ask = typeof search.ask === "string" ? search.ask : undefined;
    return { tab, ask } as { tab?: Tab; ask?: string };
  },
  loader: ({ params }) => {
    const company = getCompany(params.slug);
    if (!company) throw notFound();
    return { company };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <div className="font-mono text-xs text-amber">404</div>
        <h1 className="mt-2 font-display text-2xl">Empresa não encontrada</h1>
        <Link to="/" className="mt-4 inline-block font-mono text-xs text-muted-foreground hover:text-amber">
          ← voltar
        </Link>
      </div>
    </div>
  ),
  component: CompanyPage,
});

function CompanyPage() {
  const { company } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab: Tab = search.tab ?? "overview";

  const setTab = (t: Tab) => {
    navigate({
      to: "/company/$slug",
      params: { slug: company.slug },
      search: { tab: t },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar companyName={company.name} ticker={company.ticker} />
      <CompanyHeader company={company} />
      <Tabs tab={tab} setTab={setTab} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && <Overview company={company} onAsk={() => setTab("chat")} />}
        {tab === "chat" && <ChatPanel company={company} prefill={search.ask} />}
        {tab === "map" && <CompanyMap company={company} />}
        {tab === "events" && <Events company={company} />}
        {tab === "trail" && <Trail company={company} />}
      </div>
    </div>
  );
}

function TopBar({ companyName, ticker }: { companyName: string; ticker: string }) {
  return (
    <header className="border-b border-border/70">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber text-primary-foreground font-display text-sm font-bold">
            CD
          </div>
          <div>
            <div className="font-display text-sm tracking-wide">
              COMPANY<span className="text-amber">·</span>DECODER
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {ticker} · {companyName}
            </div>
          </div>
        </Link>
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-amber"
        >
          ← Coverage
        </Link>
      </div>
    </header>
  );
}

function CompanyHeader({ company }: { company: Company }) {
  return (
    <section className="border-b border-border/70 ticker-tape">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
                {company.ticker}
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {company.sector}
              </span>
            </div>
            <h1 className="mt-2 font-display text-4xl tracking-tight">{company.name}</h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{company.description}</p>
          </div>
          <div className="hidden shrink-0 rounded-md border border-border bg-surface px-4 py-3 text-right md:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Em cobertura
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
          {company.metrics.map((m) => (
            <div key={m.label} className="bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-1 font-display text-xl">{m.value}</div>
              {m.delta && (
                <div
                  className={`mt-1 font-mono text-[11px] ${
                    m.positive ? "text-success" : "text-destructive"
                  }`}
                >
                  {m.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "chat", label: "Analista" },
  { id: "map", label: "Mapa da Empresa" },
  { id: "events", label: "Eventos Recentes" },
  { id: "trail", label: "Trilha de Aprendizado" },
];

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative whitespace-nowrap px-4 py-3 font-mono text-xs uppercase tracking-wider transition ${
                active ? "text-amber" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-amber" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Overview({ company, onAsk }: { company: Company; onAsk: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Setor" mono>
        {company.sector}
      </Card>
      <Card title="Ticker" mono>
        <span className="font-display text-2xl text-amber">{company.ticker}</span>
      </Card>
      <Card title="Modelo de Negócio">{company.businessModel}</Card>

      <Card title="Principais Riscos">
        <ul className="space-y-2 text-sm">
          {company.risks.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Principais Catalisadores">
        <ul className="space-y-2 text-sm">
          {company.catalysts.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Comece pelo Analista">
        <p className="text-sm text-muted-foreground">
          Cada pergunta abre um conceito, registra no seu Knowledge Graph e sugere o próximo
          tema da trilha.
        </p>
        <button
          onClick={onAsk}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber bg-amber/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber transition hover:bg-amber/20"
        >
          Abrir analista →
        </button>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
  mono = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={`rounded-md border border-border bg-surface p-5 ${className}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className={`mt-2 ${mono ? "font-mono text-sm" : "text-sm"} text-foreground`}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Chat / Analista ---------- */

function ChatPanel({ company, prefill }: { company: Company; prefill?: string }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState(prefill ?? "");
  const consumedPrefill = useRef<string | undefined>(undefined);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const answer = buildAnswer(company, q);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", answer }]);
    setInput("");
    learningStore.markLearned(answer.concept.id);
  };

  // Auto-send when arriving from sidebar with ?ask=...
  useEffect(() => {
    if (prefill && consumedPrefill.current !== prefill) {
      consumedPrefill.current = prefill;
      ask(prefill);
      // strip the search param so refresh doesn't re-fire
      navigate({
        to: "/company/$slug",
        params: { slug: company.slug },
        search: { tab: "chat" },
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex min-h-[60vh] flex-col rounded-md border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sessão de análise
            </div>
            <div className="mt-1 font-display text-sm">
              Estudando <span className="text-amber">{company.name}</span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Analista guiado · não é chat genérico
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {messages.length === 0 && (
            <EmptyChat company={company} onPick={ask} />
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-md bg-amber px-4 py-2 font-mono text-sm text-primary-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <AnswerBlock key={i} answer={m.answer} onAskFollowup={ask} />
            ),
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="border-t border-border p-3"
        >
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-amber">
            <span className="font-mono text-xs text-amber">{">"}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pergunte sobre ${company.name}...`}
              className="w-full bg-transparent font-mono text-sm placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-amber bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber transition hover:bg-amber/20"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>

      <ChatSidebar company={company} onAsk={ask} />
    </div>
  );
}

function EmptyChat({ company, onPick }: { company: Company; onPick: (q: string) => void }) {
  const { recommendations } = useLearning();
  return (
    <div className="py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Comece por um conceito
      </div>
      <h2 className="mt-1 font-display text-xl">
        Aprenda análise pelo caso da {company.name}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Cada pergunta abre um conceito, registra no seu Knowledge Graph e desbloqueia o próximo
        na trilha.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(recommendations.length > 0
          ? recommendations
          : company.sampleQuestions.slice(0, 3).map(
              (q): Concept => ({
                id: `q-${q}`,
                label: q,
                category: "operacional",
                short: "",
                related: [],
                sample: q,
              }),
            )
        )
          .slice(0, 4)
          .map((c) => (
            <button
              key={c.id}
              onClick={() => onPick(c.sample)}
              className="group rounded-md border border-border bg-background p-4 text-left transition hover:border-amber"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                Próximo recomendado
              </div>
              <div className="mt-2 font-display text-sm text-foreground group-hover:text-amber">
                {c.label}
              </div>
              {c.short && (
                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.short}</div>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}

function ChatSidebar({ company, onAsk }: { company: Company; onAsk: (q: string) => void }) {
  const { learnedCount, total, progress } = useLearning();
  return (
    <aside className="space-y-3">
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Progresso
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-3xl text-amber">{progress}%</span>
          <span className="font-mono text-xs text-muted-foreground">
            {learnedCount}/{total} conceitos
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
          <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Perguntas sugeridas
        </div>
        <div className="mt-3 space-y-2">
          {company.sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => onAsk(q)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-amber hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AnswerBlock({
  answer,
  onAskFollowup,
}: {
  answer: Answer;
  onAskFollowup: (q: string) => void;
}) {
  const rows: { label: string; value?: string }[] = [
    { label: "Receita", value: answer.financialImpact.receita },
    { label: "EBITDA", value: answer.financialImpact.ebitda },
    { label: "Caixa", value: answer.financialImpact.caixa },
    { label: "Dívida", value: answer.financialImpact.divida },
  ];

  return (
    <div className="rounded-md border border-border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-sm bg-amber/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber">
          Conceito aprendido
        </span>
        <span className="font-display text-base">{answer.concept.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          · {CATEGORIES.find((c) => c.id === answer.concept.category)?.label}
        </span>
      </div>

      <Section title="Conceito">{answer.explanation}</Section>
      <Section title="Aplicação na Empresa">{answer.application}</Section>

      <Section title="Impacto Financeiro">
        <div className="mt-2 grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {r.label}
              </div>
              <div className="mt-1 text-xs">{r.value ?? "—"}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Section title="Para Acionistas">{answer.shareholders}</Section>
        <Section title="Para Credores">{answer.creditors}</Section>
      </div>

      {/* Learning footer: learned + related + next */}
      <div className="mt-5 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ✓ Aprendido agora
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-success/40 bg-success/10 px-2 py-0.5 font-mono text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {answer.concept.label}
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Conceitos relacionados
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {answer.related.length === 0 && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
            {answer.related.map((r) => (
              <button
                key={r.id}
                onClick={() => onAskFollowup(r.sample)}
                className="rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-xs text-foreground transition hover:border-amber hover:text-amber"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Próximo recomendado
          </div>
          {answer.next ? (
            <button
              onClick={() => onAskFollowup(answer.next!.sample)}
              className="mt-2 inline-flex items-center gap-2 rounded-sm border border-amber/50 bg-amber/10 px-2 py-1 font-mono text-xs text-amber hover:bg-amber/20"
            >
              {answer.next.label} →
            </button>
          ) : (
            <span className="mt-2 inline-block text-xs text-muted-foreground">
              Continue explorando a trilha lateral.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

/* ---------- Mapa da Empresa ---------- */

function CompanyMap({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Conceitos organizados por área para analisar{" "}
        <span className="text-foreground">{company.name}</span>. Use o{" "}
        <span className="text-amber">Knowledge Graph</span> lateral para o mapa completo do seu
        aprendizado.
      </p>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {company.knowledgeMap.map((g) => (
          <div key={g.group} className="rounded-md border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber" />
              <div className="font-display text-base">{g.group}</div>
            </div>
            <ul className="space-y-1.5">
              {g.items.map((it, i) => (
                <li key={it} className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-muted-foreground">
                    {i === g.items.length - 1 ? "└──" : "├──"}
                  </span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Events ---------- */

function Events({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      {company.events.map((e) => (
        <article key={e.title} className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
              {e.date}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Fato Relevante
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg">{e.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{e.summary}</p>

          <div className="mt-4 rounded border border-border bg-background p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Impacto esperado
            </div>
            <div className="mt-1 text-sm">{e.impact}</div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Conceitos
            </span>
            {e.concepts.map((c) => (
              <span
                key={c}
                className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------- Trilha de Aprendizado ---------- */

function Trail({ company }: { company: Company }) {
  const { learnedIds, learnedConcepts, progress, pathProgress, recommendations, reset } =
    useLearning();
  const navigate = useNavigate();

  const trail = useMemo(
    () =>
      LEARNING_PATH.map((id, i) => ({
        idx: i + 1,
        concept: CONCEPT_BY_ID[id]!,
        learned: learnedIds.has(id),
      })),
    [learnedIds],
  );

  const ask = (c: Concept) => {
    const slug = c.bestCase ?? company.slug;
    navigate({
      to: "/company/$slug",
      params: { slug },
      search: { tab: "chat", ask: c.sample },
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Trilha base · Iniciante → Analista
              </div>
              <h2 className="mt-1 font-display text-2xl">Próximos passos</h2>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl text-amber">{pathProgress.pct}%</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {pathProgress.done}/{pathProgress.total} da trilha
              </div>
            </div>
          </div>

          <ol className="mt-6 relative border-l border-border">
            {trail.map(({ idx, concept, learned }) => (
              <li key={concept.id} className="ml-4 pb-4">
                <span
                  className={`absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full border ${
                    learned ? "border-success bg-success" : "border-border bg-background"
                  }`}
                />
                <button
                  onClick={() => ask(concept)}
                  className="group flex w-full items-center justify-between gap-4 rounded px-2 py-1 text-left hover:bg-background"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {String(idx).padStart(2, "0")}
                    </span>
                    <div>
                      <div
                        className={`font-display text-sm ${
                          learned ? "text-foreground" : "text-muted-foreground group-hover:text-amber"
                        }`}
                      >
                        {concept.label}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {CATEGORIES.find((c) => c.id === concept.category)?.label}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {learned ? "✓ aprendido" : "estudar →"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-md border border-border bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Conceitos aprendidos ({learnedConcepts.length})
          </div>
          {learnedConcepts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Faça sua primeira pergunta no Analista para começar.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {learnedConcepts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-2 rounded border border-border bg-background p-2"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                  <div className="min-w-0">
                    <div className="font-display text-xs">{c.label}</div>
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      {CATEGORIES.find((cat) => cat.id === c.category)?.label}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Progresso global
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-amber">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Recomendados agora
          </div>
          <div className="mt-3 space-y-2">
            {recommendations.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Você cobriu a trilha base. Continue explorando o Knowledge Graph.
              </p>
            )}
            {recommendations.map((c) => (
              <button
                key={c.id}
                onClick={() => ask(c)}
                className="group flex w-full items-center justify-between rounded border border-border bg-background px-2 py-2 text-left transition hover:border-amber"
              >
                <span className="font-display text-xs text-foreground group-hover:text-amber">
                  {c.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Companhias para estudar
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANIES.map((c) => (
              <Link
                key={c.slug}
                to="/company/$slug"
                params={{ slug: c.slug }}
                className="rounded border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground hover:border-amber hover:text-amber"
              >
                {c.ticker}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm("Apagar progresso de aprendizado?")) {
              reset();
            }
          }}
          className="w-full rounded border border-border bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-destructive hover:text-destructive"
        >
          Reiniciar progresso
        </button>
      </aside>
    </div>
  );
}
