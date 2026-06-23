import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COMPANIES, getCompany, type Company } from "@/lib/companies";
import { buildAnswer, type Answer } from "@/lib/answer-engine";

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

type Tab = "overview" | "chat" | "map" | "events" | "learned";

type ChatMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; answer: Answer };

function CompanyPage() {
  const { company } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <CompanyHeader company={company} />
      <Tabs tab={tab} setTab={setTab} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && <Overview company={company} onAsk={() => setTab("chat")} />}
        {tab === "chat" && <ChatPanel company={company} />}
        {tab === "map" && <KnowledgeMap company={company} />}
        {tab === "events" && <Events company={company} />}
        {tab === "learned" && <Learned />}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="border-b border-border/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber text-primary-foreground font-display text-sm font-bold">
            CD
          </div>
          <div>
            <div className="font-display text-sm tracking-wide">
              COMPANY<span className="text-amber">·</span>DECODER
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Equity Research Terminal
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

        {/* metrics ticker */}
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
  { id: "chat", label: "Chat Analista" },
  { id: "map", label: "Knowledge Map" },
  { id: "events", label: "Eventos Recentes" },
  { id: "learned", label: "Conceitos Aprendidos" },
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

      <Card title="Principais Riscos" className="lg:col-span-1">
        <ul className="space-y-2 text-sm">
          {company.risks.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Principais Catalisadores" className="lg:col-span-1">
        <ul className="space-y-2 text-sm">
          {company.catalysts.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Próximo passo" className="lg:col-span-1">
        <p className="text-sm text-muted-foreground">
          Use o <span className="text-amber">Chat Analista</span> para fazer perguntas livres sobre{" "}
          {company.name} e receber respostas no formato profissional.
        </p>
        <button
          onClick={onAsk}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber bg-amber/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber transition hover:bg-amber/20"
        >
          Abrir chat →
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

/* ---------- Chat ---------- */

const LEARNED_KEY = "company-decoder-learned";

function ChatPanel({ company }: { company: Company }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const answer = buildAnswer(company, q);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", answer }]);
    setInput("");

    // persist learned concept
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      if (!arr.includes(answer.concept)) {
        arr.push(answer.concept);
        localStorage.setItem(LEARNED_KEY, JSON.stringify(arr));
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex min-h-[60vh] flex-col rounded-md border border-border bg-surface">
        <div className="border-b border-border px-5 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sessão de análise
          </div>
          <div className="mt-1 font-display text-sm">
            Conversando sobre <span className="text-amber">{company.name}</span>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Pronto para começar
              </div>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Faça uma pergunta livre. As respostas seguem estrutura de equity research:
                conceito, aplicação na empresa, impacto financeiro e visão por stakeholder.
              </p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-md bg-amber px-4 py-2 font-mono text-sm text-primary-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <AnswerBlock key={i} answer={m.answer} />
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

      <aside className="space-y-3">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sugestões de perguntas
          </div>
          <div className="mt-3 space-y-2">
            {company.sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-amber hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Nota MVP
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Respostas demonstrativas baseadas em dados fictícios. Em produção, conectaríamos LLM
            às demonstrações reais e fatos relevantes da CVM.
          </p>
        </div>
      </aside>
    </div>
  );
}

function AnswerBlock({ answer }: { answer: Answer }) {
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
          Análise
        </span>
        <span className="font-display text-base">{answer.concept}</span>
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

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Próximo conceito
        </span>
        <span className="rounded-sm border border-amber/40 bg-amber/10 px-2 py-0.5 font-mono text-xs text-amber">
          {answer.nextConcept}
        </span>
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

/* ---------- Knowledge Map ---------- */

function KnowledgeMap({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Conceitos organizados por área. Cada nó representa um tópico relevante para analisar{" "}
        <span className="text-foreground">{company.name}</span>.
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

/* ---------- Learned ---------- */

const ALL_TRACKED = [
  "EBITDA",
  "Impairment",
  "Covenant",
  "Waiver",
  "RAP — Receita Anual Permitida",
  "Sensibilidade ao Brent",
  "ROIC",
  "WACC",
];

function Learned() {
  const learned = useMemo<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const all = Array.from(new Set([...ALL_TRACKED, ...learned]));
  const pct = Math.round((learned.length / Math.max(all.length, 1)) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-md border border-border bg-surface p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Conceitos Aprendidos
        </div>
        <h2 className="mt-1 font-display text-2xl">Sua trilha de aprendizado</h2>

        <ul className="mt-6 divide-y divide-border">
          {all.map((c) => {
            const done = learned.includes(c);
            return (
              <li key={c} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-sm border ${
                      done ? "border-success bg-success/15 text-success" : "border-border text-muted-foreground"
                    } font-mono text-[11px]`}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "font-display text-sm" : "font-display text-sm text-muted-foreground"}>
                    {c}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {done ? "Aprendido" : "Pendente"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Progresso
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-amber">{pct}%</span>
            <span className="font-mono text-xs text-muted-foreground">
              {learned.length}/{all.length}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div className="h-full bg-amber transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Como aprender mais
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use o Chat Analista em qualquer empresa. Cada novo conceito explorado é marcado aqui
            automaticamente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANIES.slice(0, 4).map((c) => (
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
      </aside>
    </div>
  );
}
