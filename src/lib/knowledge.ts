// Canonical knowledge graph for Company Decoder.
// Every concept the user can "learn" lives here with its category, related
// concepts and a sample question that triggers it in the chat.

export type CategoryId =
  | "contabilidade"
  | "credito"
  | "valuation"
  | "ma"
  | "eletrico"
  | "oilgas"
  | "operacional";

export type Concept = {
  id: string;
  label: string;
  category: CategoryId;
  /** one-line definition shown in the sidebar tooltip and learned tab */
  short: string;
  /** ids of related concepts the user may want to explore next */
  related: string[];
  /** id of the strongest "next concept" recommendation */
  next?: string;
  /** prerequisite concept ids that should be learned first */
  requires?: string[];
  /** example user question that triggers this concept in the chat */
  sample: string;
  /** company slug that is the canonical case study for this concept */
  bestCase?: string;
};

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
  order: number;
};

export const CATEGORIES: Category[] = [
  { id: "contabilidade", label: "Contabilidade", blurb: "Como ler as demonstrações.", order: 1 },
  { id: "credito", label: "Crédito", blurb: "Estrutura de capital e dívida.", order: 2 },
  { id: "valuation", label: "Valuation", blurb: "Quanto vale a empresa.", order: 3 },
  { id: "ma", label: "M&A e Estrutura", blurb: "Aquisições e governança.", order: 4 },
  { id: "eletrico", label: "Setor Elétrico", blurb: "Geração e transmissão.", order: 5 },
  { id: "oilgas", label: "Óleo & Gás", blurb: "E&P, commodities, hedge.", order: 6 },
  { id: "operacional", label: "Operacional", blurb: "KPIs de execução.", order: 7 },
];

export const CONCEPTS: Concept[] = [
  // ---------------- Contabilidade ----------------
  {
    id: "ebitda",
    label: "EBITDA",
    category: "contabilidade",
    short: "Lucro antes de juros, impostos, depreciação e amortização — proxy de caixa operacional.",
    related: ["margem-ebitda", "fcf", "divida-liq-ebitda"],
    next: "fcf",
    sample: "O que é EBITDA e por que ele é tão usado?",
    bestCase: "oncoclinicas",
  },
  {
    id: "margem-ebitda",
    label: "Margem EBITDA",
    category: "contabilidade",
    short: "EBITDA dividido por receita líquida — mede eficiência operacional.",
    related: ["ebitda", "fcf"],
    requires: ["ebitda"],
    sample: "Como interpretar a margem EBITDA de uma empresa?",
    bestCase: "engie",
  },
  {
    id: "impairment",
    label: "Impairment",
    category: "contabilidade",
    short: "Baixa contábil não-caixa de um ativo cujo valor recuperável caiu.",
    related: ["goodwill", "ebitda", "ma"],
    next: "goodwill",
    sample: "O que é impairment e por que aparece nos resultados?",
    bestCase: "oncoclinicas",
  },
  {
    id: "goodwill",
    label: "Goodwill",
    category: "contabilidade",
    short: "Ágio pago acima do valor justo dos ativos em uma aquisição.",
    related: ["impairment", "ma"],
    requires: ["impairment"],
    sample: "O que é goodwill em uma aquisição?",
    bestCase: "oncoclinicas",
  },
  {
    id: "depreciacao",
    label: "Depreciação",
    category: "contabilidade",
    short: "Alocação do custo de um ativo fixo ao longo da sua vida útil.",
    related: ["ebitda", "capex"],
    sample: "Qual a diferença entre depreciação e capex?",
    bestCase: "simpar",
  },
  {
    id: "capital-de-giro",
    label: "Capital de Giro",
    category: "contabilidade",
    short: "Recursos para sustentar o ciclo operacional (contas a receber, estoque, fornecedores).",
    related: ["fcf", "glosas"],
    sample: "Por que capital de giro é crítico em empresas de saúde?",
    bestCase: "oncoclinicas",
  },
  {
    id: "fcf",
    label: "Free Cash Flow",
    category: "contabilidade",
    short: "Caixa que sobra após capex de manutenção — o que de fato pode ser distribuído.",
    related: ["ebitda", "capex", "wacc"],
    next: "wacc",
    sample: "Como calcular o free cash flow?",
    bestCase: "engie",
  },

  // ---------------- Crédito ----------------
  {
    id: "covenant",
    label: "Covenant",
    category: "credito",
    short: "Cláusula em contratos de dívida que obriga manter indicadores ou comportamentos.",
    related: ["waiver", "cross-default", "divida-liq-ebitda"],
    next: "cross-default",
    sample: "O que é um covenant e como funciona?",
    bestCase: "oncoclinicas",
  },
  {
    id: "waiver",
    label: "Waiver",
    category: "credito",
    short: "Perdão temporário concedido por credores quando o emissor quebra um covenant.",
    related: ["covenant", "standstill"],
    requires: ["covenant"],
    next: "standstill",
    sample: "O que é um waiver e quando ele é usado?",
    bestCase: "oncoclinicas",
  },
  {
    id: "standstill",
    label: "Standstill",
    category: "credito",
    short: "Acordo que congela ações de execução enquanto credores e empresa negociam.",
    related: ["waiver", "covenant"],
    requires: ["waiver"],
    sample: "O que significa um standstill com credores?",
    bestCase: "oncoclinicas",
  },
  {
    id: "cross-default",
    label: "Cross Default",
    category: "credito",
    short: "Quebra de um contrato dispara vencimento antecipado dos demais.",
    related: ["covenant", "waiver"],
    requires: ["covenant"],
    sample: "Como funciona uma cláusula de cross default?",
    bestCase: "oncoclinicas",
  },
  {
    id: "divida-liq-ebitda",
    label: "Dívida Líq./EBITDA",
    category: "credito",
    short: "Alavancagem — quantos anos de EBITDA seriam necessários para quitar a dívida.",
    related: ["covenant", "ebitda"],
    requires: ["ebitda"],
    sample: "O que é Dívida Líquida sobre EBITDA?",
    bestCase: "dasa",
  },
  {
    id: "recovery-value",
    label: "Recovery Value",
    category: "credito",
    short: "Valor que credores recuperariam em cenário de default.",
    related: ["covenant", "cross-default"],
    sample: "Como estimar o recovery value de um bond?",
    bestCase: "dasa",
  },

  // ---------------- Valuation ----------------
  {
    id: "wacc",
    label: "WACC",
    category: "valuation",
    short: "Custo médio ponderado de capital — taxa de desconto em DCF.",
    related: ["roic", "dcf", "fcf"],
    next: "roic",
    sample: "O que é WACC e como ele é calculado?",
    bestCase: "engie",
  },
  {
    id: "roic",
    label: "ROIC",
    category: "valuation",
    short: "Retorno sobre o capital investido — mede eficiência da alocação de capital.",
    related: ["wacc", "eva"],
    requires: ["wacc"],
    next: "eva",
    sample: "O que é ROIC e por que ele importa?",
    bestCase: "cosan",
  },
  {
    id: "eva",
    label: "EVA",
    category: "valuation",
    short: "Economic Value Added — (ROIC − WACC) × Capital Investido.",
    related: ["roic", "wacc"],
    requires: ["roic"],
    sample: "Como interpretar o EVA de uma companhia?",
    bestCase: "cosan",
  },
  {
    id: "dcf",
    label: "DCF",
    category: "valuation",
    short: "Fluxo de caixa descontado — método clássico de valuation intrínseco.",
    related: ["wacc", "fcf"],
    requires: ["wacc", "fcf"],
    sample: "Como funciona um valuation por DCF?",
    bestCase: "engie",
  },
  {
    id: "nav",
    label: "NAV / SoTP",
    category: "valuation",
    short: "Soma das partes — valor da holding como agregação das subsidiárias.",
    related: ["holding-discount"],
    sample: "O que é NAV em uma holding como Cosan?",
    bestCase: "cosan",
  },

  // ---------------- M&A / Estrutura ----------------
  {
    id: "ma",
    label: "M&A",
    category: "ma",
    short: "Aquisições e fusões — usadas para escala, sinergias ou diversificação.",
    related: ["sinergias", "goodwill", "impairment"],
    sample: "Como avaliar se uma aquisição cria valor?",
    bestCase: "minerva",
  },
  {
    id: "sinergias",
    label: "Sinergias",
    category: "ma",
    short: "Ganhos de receita ou custo capturáveis após combinar duas empresas.",
    related: ["ma", "ebitda"],
    requires: ["ma"],
    sample: "O que são sinergias em uma fusão?",
    bestCase: "brava-energia",
  },
  {
    id: "aumento-capital",
    label: "Aumento de Capital",
    category: "ma",
    short: "Emissão de novas ações para reforçar o caixa ou desalavancar.",
    related: ["divida-liq-ebitda", "diluicao"],
    next: "diluicao",
    sample: "O que é um aumento de capital?",
    bestCase: "dasa",
  },
  {
    id: "diluicao",
    label: "Diluição",
    category: "ma",
    short: "Redução da participação de acionistas existentes após emissão.",
    related: ["aumento-capital"],
    requires: ["aumento-capital"],
    sample: "O que significa diluição para o acionista?",
    bestCase: "dasa",
  },
  {
    id: "holding-discount",
    label: "Desconto de Holding",
    category: "ma",
    short: "Diferença entre o valor de mercado da holding e a soma das partes.",
    related: ["nav"],
    sample: "Por que holdings negociam com desconto?",
    bestCase: "cosan",
  },
  {
    id: "turnaround",
    label: "Turnaround",
    category: "ma",
    short: "Plano de reestruturação operacional para recuperar margem e caixa.",
    related: ["ebitda", "capital-de-giro"],
    sample: "O que é um turnaround operacional?",
    bestCase: "oncoclinicas",
  },

  // ---------------- Setor Elétrico ----------------
  {
    id: "rap",
    label: "RAP",
    category: "eletrico",
    short: "Receita Anual Permitida — receita regulada de transmissoras.",
    related: ["ppa", "gsf"],
    next: "ppa",
    sample: "Como funciona uma RAP no setor elétrico?",
    bestCase: "engie",
  },
  {
    id: "ppa",
    label: "PPA",
    category: "eletrico",
    short: "Power Purchase Agreement — contrato de venda de energia de longo prazo.",
    related: ["rap", "gsf"],
    sample: "O que é um PPA?",
    bestCase: "engie",
  },
  {
    id: "gsf",
    label: "GSF",
    category: "eletrico",
    short: "Generation Scaling Factor — risco hidrológico no MRE.",
    related: ["rap", "ppa"],
    sample: "O que é GSF e por que afeta geradoras?",
    bestCase: "engie",
  },

  // ---------------- Óleo & Gás ----------------
  {
    id: "brent",
    label: "Brent",
    category: "oilgas",
    short: "Referência global de preço do petróleo — define receita de E&P independentes.",
    related: ["lifting-cost", "hedge"],
    next: "lifting-cost",
    sample: "Por que uma queda do Brent afeta uma E&P?",
    bestCase: "brava-energia",
  },
  {
    id: "lifting-cost",
    label: "Lifting Cost",
    category: "oilgas",
    short: "Custo operacional para extrair um barril (US$/boe).",
    related: ["brent", "fpso"],
    requires: ["brent"],
    sample: "O que é lifting cost?",
    bestCase: "brava-energia",
  },
  {
    id: "fpso",
    label: "FPSO",
    category: "oilgas",
    short: "Plataforma flutuante de produção, armazenamento e transferência.",
    related: ["lifting-cost", "reservas-2p"],
    sample: "O que é um FPSO?",
    bestCase: "brava-energia",
  },
  {
    id: "reservas-2p",
    label: "Reservas 2P",
    category: "oilgas",
    short: "Reservas provadas + prováveis — base do NAV de uma petroleira.",
    related: ["nav", "brent"],
    sample: "O que são reservas 2P?",
    bestCase: "brava-energia",
  },
  {
    id: "hedge",
    label: "Hedge",
    category: "oilgas",
    short: "Proteção contra variação de commodity ou câmbio via derivativos.",
    related: ["brent"],
    sample: "Como funciona o hedge em uma petroleira?",
    bestCase: "brava-energia",
  },

  // ---------------- Operacional ----------------
  {
    id: "glosas",
    label: "Glosas",
    category: "operacional",
    short: "Recusas de pagamento por operadoras de saúde — corroem receita e caixa.",
    related: ["capital-de-giro", "ebitda"],
    sample: "O que são glosas em hospitais e clínicas?",
    bestCase: "dasa",
  },
  {
    id: "same-store-sales",
    label: "Same-Store Sales",
    category: "operacional",
    short: "Crescimento de unidades já existentes — isola o efeito orgânico do M&A.",
    related: ["ebitda"],
    sample: "O que é same-store sales?",
    bestCase: "oncoclinicas",
  },
  {
    id: "ciclo-do-gado",
    label: "Ciclo do Gado",
    category: "operacional",
    short: "Ciclo de oferta de boi gordo — determina o spread de abate.",
    related: ["spread-abate"],
    next: "spread-abate",
    sample: "Como o ciclo do gado afeta frigoríficos?",
    bestCase: "minerva",
  },
  {
    id: "spread-abate",
    label: "Spread de Abate",
    category: "operacional",
    short: "Margem entre preço da carne exportada e custo do boi vivo.",
    related: ["ciclo-do-gado"],
    requires: ["ciclo-do-gado"],
    sample: "O que é spread de abate?",
    bestCase: "minerva",
  },
  {
    id: "capex",
    label: "Capex",
    category: "operacional",
    short: "Investimento em ativos fixos — divide-se em manutenção e expansão.",
    related: ["fcf", "depreciacao"],
    sample: "Qual a diferença entre capex de manutenção e expansão?",
    bestCase: "simpar",
  },
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

export const CONCEPTS_BY_CATEGORY: Record<CategoryId, Concept[]> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = CONCEPTS.filter((c) => c.category === cat.id);
    return acc;
  },
  {} as Record<CategoryId, Concept[]>,
);

/** A reasonable "starting trail" — the order to learn concepts from zero. */
export const LEARNING_PATH: string[] = [
  "ebitda",
  "margem-ebitda",
  "fcf",
  "divida-liq-ebitda",
  "covenant",
  "waiver",
  "cross-default",
  "wacc",
  "roic",
  "dcf",
  "ma",
  "sinergias",
  "impairment",
  "goodwill",
  "rap",
  "brent",
  "lifting-cost",
];

/**
 * Best concept match for a free-form user question. Tries exact id, label
 * match, and sample-question keyword overlap.
 */
export function matchConcept(question: string): Concept | undefined {
  const q = question.toLowerCase();
  // direct keyword match against concept labels
  for (const c of CONCEPTS) {
    const label = c.label.toLowerCase();
    if (q.includes(label)) return c;
    if (q.includes(c.id.replace(/-/g, " "))) return c;
  }
  // soft keyword aliases
  const aliases: { keys: RegExp; id: string }[] = [
    { keys: /brent|petr[óo]leo|[óo]leo/i, id: "brent" },
    { keys: /transmiss[ãa]o|receita anual permitida/i, id: "rap" },
    { keys: /reestrutura|virada operacional/i, id: "turnaround" },
    { keys: /alavancagem/i, id: "divida-liq-ebitda" },
    { keys: /caixa livre|free cash/i, id: "fcf" },
    { keys: /aquisi[çc][ãa]o|fus[ãa]o/i, id: "ma" },
    { keys: /[áa]gio/i, id: "goodwill" },
    { keys: /distribui[çc][ãa]o de a[çc][õo]es|subscri[çc][ãa]o/i, id: "aumento-capital" },
  ];
  for (const a of aliases) {
    if (a.keys.test(question)) return CONCEPT_BY_ID[a.id];
  }
  return undefined;
}

/** Concepts the user can do "next" given what's already learned. */
export function recommendNext(learnedIds: Set<string>, limit = 3): Concept[] {
  // Path-first: walk the trail and surface unmastered nodes whose prereqs are met
  const out: Concept[] = [];
  for (const id of LEARNING_PATH) {
    if (learnedIds.has(id)) continue;
    const c = CONCEPT_BY_ID[id];
    if (!c) continue;
    const ok = (c.requires ?? []).every((r) => learnedIds.has(r));
    if (ok) out.push(c);
    if (out.length >= limit) return out;
  }
  // Backfill with related-of-learned
  if (out.length < limit) {
    for (const id of learnedIds) {
      const c = CONCEPT_BY_ID[id];
      if (!c) continue;
      for (const rid of c.related) {
        if (learnedIds.has(rid)) continue;
        const r = CONCEPT_BY_ID[rid];
        if (r && !out.find((x) => x.id === r.id)) out.push(r);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
