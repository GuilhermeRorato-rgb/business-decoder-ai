import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COMPANIES } from "@/lib/companies";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Company Decoder — Entenda qualquer empresa como um analista" },
      {
        name: "description",
        content:
          "Plataforma educacional para estudantes, investidores e profissionais iniciantes do mercado financeiro.",
      },
    ],
  }),
  component: Home,
});

const SUGGESTED = ["Oncoclínicas", "Brava Energia", "DASA", "Minerva", "Cosan", "Simpar", "Engie"];

function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return COMPANIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const go = (slug: string) => navigate({ to: "/company/$slug", params: { slug } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches[0]) go(matches[0].slug);
  };

  const pickSuggestion = (name: string) => {
    const c = COMPANIES.find((x) => x.name.toLowerCase().includes(name.toLowerCase()));
    if (c) go(c.slug);
    else setQuery(name);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber text-primary-foreground font-display text-sm font-bold">
              CD
            </div>
            <div>
              <div className="font-display text-sm tracking-wide">
                COMPANY<span className="text-amber">·</span>DECODER
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Equity Research Terminal · MVP
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="text-foreground">Home</span>
            <span>Companies</span>
            <span>Knowledge Map</span>
            <span>Learn</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live · Markets Open
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight md:text-6xl">
            Company <span className="text-amber">Decoder</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Entenda qualquer empresa como um analista profissional.
          </p>

          <form onSubmit={handleSubmit} className="relative mx-auto mt-10 max-w-2xl">
            <div className="group relative flex items-center rounded-md border border-border bg-surface px-4 py-3 transition focus-within:border-amber focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--amber)_20%,transparent)]">
              <span className="font-mono text-xs text-amber">{">"}</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome de uma empresa..."
                className="ml-3 w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                autoFocus
              />
              <kbd className="ml-3 hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
                ↵
              </kbd>
            </div>

            {matches.length > 0 && (
              <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-md border border-border bg-surface text-left shadow-2xl">
                {matches.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => go(m.slug)}
                    className="flex w-full items-center justify-between gap-4 border-b border-border/60 px-4 py-3 transition last:border-0 hover:bg-surface-2"
                  >
                    <div>
                      <div className="font-display text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.sector}</div>
                    </div>
                    <div className="font-mono text-xs text-amber">{m.ticker}</div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="mt-10">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sugestões
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => pickSuggestion(s)}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-amber hover:text-amber"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {[
            {
              tag: "01",
              title: "Aprenda com casos reais",
              copy: "Conceitos financeiros, contábeis e de crédito explicados em cima de empresas reais — não em teoria abstrata.",
            },
            {
              tag: "02",
              title: "Pense como analista",
              copy: "Toda resposta vem com impacto em Receita, EBITDA, Caixa e Dívida — e o que muda para acionistas e credores.",
            },
            {
              tag: "03",
              title: "Mapa de conhecimento",
              copy: "Cada conceito aprendido conecta-se ao próximo. Você constrói uma base sólida, não dicionário de termos.",
            },
          ].map((b) => (
            <div key={b.tag} className="bg-surface p-8">
              <div className="font-mono text-xs text-amber">{b.tag}</div>
              <h3 className="mt-3 font-display text-lg">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Companies grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Coverage Universe
            </div>
            <h2 className="mt-1 font-display text-2xl">Empresas em cobertura</h2>
          </div>
          <div className="font-mono text-xs text-muted-foreground">{COMPANIES.length} listadas</div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {COMPANIES.map((c) => (
            <Link
              key={c.slug}
              to="/company/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col gap-3 bg-surface p-6 transition hover:bg-surface-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber">{c.ticker}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.sector.split("—")[0].trim()}
                </span>
              </div>
              <div className="font-display text-lg group-hover:text-amber">{c.name}</div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>© 2026 Company Decoder · Educational MVP</span>
          <span>Dados ilustrativos — não constitui recomendação de investimento</span>
        </div>
      </footer>
    </div>
  );
}
