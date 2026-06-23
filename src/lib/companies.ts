export type Concept = {
  id: string;
  name: string;
  category: string;
  short: string;
  next?: string;
};

export type NewsEvent = {
  date: string;
  title: string;
  summary: string;
  impact: string;
  concepts: string[];
};

export type Company = {
  slug: string;
  name: string;
  ticker: string;
  sector: string;
  description: string;
  businessModel: string;
  risks: string[];
  catalysts: string[];
  metrics: { label: string; value: string; delta?: string; positive?: boolean }[];
  knowledgeMap: { group: string; items: string[] }[];
  events: NewsEvent[];
  sampleQuestions: string[];
};

export const CONCEPTS: Record<string, Concept> = {
  ebitda: {
    id: "ebitda",
    name: "EBITDA",
    category: "Demonstrações Financeiras",
    short: "Lucro antes de juros, impostos, depreciação e amortização. Proxy de geração de caixa operacional.",
    next: "Margem EBITDA",
  },
  impairment: {
    id: "impairment",
    name: "Impairment",
    category: "Contabilidade",
    short: "Redução contábil do valor de um ativo quando seu valor recuperável é inferior ao valor contábil.",
    next: "EBITDA",
  },
  covenant: {
    id: "covenant",
    name: "Covenant",
    category: "Crédito",
    short: "Cláusula contratual em dívidas que obriga o emissor a manter certos indicadores (ex.: Dívida Líquida/EBITDA).",
    next: "Cross Default",
  },
  waiver: {
    id: "waiver",
    name: "Waiver",
    category: "Crédito",
    short: "Perdão temporário concedido pelos credores quando o emissor descumpre um covenant.",
    next: "Standstill",
  },
  rap: {
    id: "rap",
    name: "RAP",
    category: "Setor Elétrico",
    short: "Receita Anual Permitida — receita regulada que transmissoras recebem independentemente do volume transportado.",
    next: "Revisão Tarifária",
  },
  wacc: {
    id: "wacc",
    name: "WACC",
    category: "Valuation",
    short: "Custo médio ponderado de capital. Taxa de desconto usada em DCF.",
    next: "ROIC",
  },
  roic: {
    id: "roic",
    name: "ROIC",
    category: "Valuation",
    short: "Retorno sobre o capital investido. Mede eficiência na alocação de capital.",
    next: "EVA",
  },
};

const ONCO_QUESTIONS = [
  "O que é impairment e por que aparece nos resultados da Oncoclínicas?",
  "Como funciona a desalavancagem da companhia?",
  "O que é turnaround operacional?",
  "Por que a estrutura de capital é o principal risco da tese?",
];

export const COMPANIES: Company[] = [
  {
    slug: "oncoclinicas",
    name: "Oncoclínicas",
    ticker: "ONCO3",
    sector: "Saúde — Oncologia",
    description:
      "Maior plataforma de tratamento oncológico da América Latina, com mais de 130 unidades e parcerias com hospitais de referência.",
    businessModel:
      "Operação verticalizada de clínicas de oncologia, com contratos de fee-for-service e value-based care junto a operadoras de saúde.",
    risks: [
      "Alavancagem elevada (Dívida Líquida/EBITDA pressionada)",
      "Dependência de poucas operadoras de saúde",
      "Glosas e ciclo de capital de giro longo",
    ],
    catalysts: [
      "Execução do turnaround anunciado pela nova VP",
      "Desalavancagem via venda de ativos não-core",
      "Sinergias com hospitais parceiros",
    ],
    metrics: [
      { label: "Receita 2024", value: "R$ 6,2bi", delta: "+18% YoY", positive: true },
      { label: "Margem EBITDA", value: "18,4%", delta: "-120 bps", positive: false },
      { label: "Dívida Líq./EBITDA", value: "3,8x", delta: "+0,4x", positive: false },
      { label: "Free Cash Flow", value: "R$ 210mi", delta: "Turnaround em curso", positive: true },
    ],
    knowledgeMap: [
      { group: "Crédito", items: ["Covenants", "Waiver", "Standstill", "Cross Default", "Recovery Value"] },
      { group: "Operacional", items: ["Turnaround", "Capital de Giro", "Glosas", "Same-store Sales"] },
      { group: "Contabilidade", items: ["Impairment", "EBITDA", "Goodwill", "Provisões"] },
    ],
    events: [
      {
        date: "12 nov 2025",
        title: "Oncoclínicas anuncia nova VP de turnaround",
        summary:
          "Companhia contrata executiva sênior com histórico em reestruturações operacionais para liderar agenda de eficiência.",
        impact: "Melhora potencial da execução operacional e redução de despesas SG&A nos próximos trimestres.",
        concepts: ["Turnaround", "Desalavancagem", "Governança"],
      },
      {
        date: "28 out 2025",
        title: "Resultados do 3T25 trazem impairment de R$ 480mi",
        summary:
          "Reconhecimento de impairment em unidades adquiridas no ciclo de M&A 2021-2022 reduz lucro líquido contábil.",
        impact: "Impacto não-caixa, mas sinaliza revisão das teses de retorno das aquisições passadas.",
        concepts: ["Impairment", "Goodwill", "EBITDA"],
      },
      {
        date: "15 out 2025",
        title: "Empresa obtém waiver de covenants com credores",
        summary:
          "Bancos concedem flexibilização do covenant de Dívida Líquida/EBITDA por dois trimestres.",
        impact: "Reduz risco de aceleração de dívidas no curto prazo; janela para destravar venda de ativos.",
        concepts: ["Covenant", "Waiver", "Cross Default"],
      },
    ],
    sampleQuestions: ONCO_QUESTIONS,
  },
  {
    slug: "brava-energia",
    name: "Brava Energia",
    ticker: "BRAV3",
    sector: "Óleo & Gás — Independente",
    description:
      "Resultado da fusão entre 3R Petroleum e Enauta. Operadora independente de campos onshore e offshore no Brasil.",
    businessModel:
      "Revitalização de campos maduros adquiridos da Petrobras + operação de Atlanta e Papa-Terra. Receita atrelada ao Brent.",
    risks: [
      "Volatilidade do preço do Brent",
      "Execução do ramp-up de Atlanta (FPSO Atlanta)",
      "Custos de descomissionamento futuros",
    ],
    catalysts: [
      "Plateau de produção em Atlanta (~50 kboe/d)",
      "Captura de sinergias da fusão",
      "Possível venda de ativos onshore",
    ],
    metrics: [
      { label: "Produção", value: "75 kboe/d", delta: "+22% QoQ", positive: true },
      { label: "Lifting Cost", value: "US$ 28/boe", delta: "-5%", positive: true },
      { label: "Dívida Líq./EBITDA", value: "2,1x", delta: "estável", positive: true },
      { label: "Brent ref.", value: "US$ 74", delta: "-8% YTD", positive: false },
    ],
    knowledgeMap: [
      { group: "Setor", items: ["Brent", "Lifting Cost", "Reservas 2P", "FPSO", "Decline Curve"] },
      { group: "Crédito", items: ["Covenants", "Hedge", "Reserve-Based Lending"] },
      { group: "Valuation", items: ["NAV", "DCF por Campo", "WACC", "Preço Long-Term"] },
    ],
    events: [
      {
        date: "05 nov 2025",
        title: "Atlanta atinge 4 poços produtores",
        summary: "Quarto poço entra em operação no FPSO Atlanta, aproximando produção do plateau previsto.",
        impact: "Aumenta geração de caixa e acelera desalavancagem prevista para 2026.",
        concepts: ["Ramp-up", "EBITDA", "Capex"],
      },
      {
        date: "20 out 2025",
        title: "Brent recua para US$ 72 após decisão da OPEP+",
        summary: "Aumento de cotas pressiona preços e impacta receita prevista das petroleiras independentes.",
        impact: "Receita e EBITDA esperados se reduzem ~6%; covenants permanecem confortáveis.",
        concepts: ["Brent", "Hedge", "Sensibilidade"],
      },
    ],
    sampleQuestions: [
      "Por que uma queda do Brent afeta a Brava?",
      "O que é lifting cost?",
      "Como funciona um FPSO?",
      "O que são reservas 2P?",
    ],
  },
  {
    slug: "engie",
    name: "Engie Brasil",
    ticker: "EGIE3",
    sector: "Energia — Geração e Transmissão",
    description:
      "Maior geradora privada de energia do Brasil, com forte presença em renováveis e linhas de transmissão.",
    businessModel:
      "Geração contratada de longo prazo (PPAs) + receita regulada de transmissão (RAP). Caixa altamente previsível.",
    risks: [
      "Hidrologia e GSF",
      "Revisões tarifárias da ANEEL",
      "Risco regulatório em renováveis",
    ],
    catalysts: [
      "Entrada de novos lotes de transmissão",
      "Repactuação do risco hidrológico",
      "Expansão eólica e solar contratada",
    ],
    metrics: [
      { label: "RAP Total", value: "R$ 4,8bi", delta: "+12% YoY", positive: true },
      { label: "Margem EBITDA", value: "62%", delta: "estável", positive: true },
      { label: "Dívida Líq./EBITDA", value: "2,7x", delta: "-0,2x", positive: true },
      { label: "Dividend Yield", value: "8,1%", delta: "premium do setor", positive: true },
    ],
    knowledgeMap: [
      { group: "Setor Elétrico", items: ["RAP", "PPA", "GSF", "Revisão Tarifária", "Leilão A-5"] },
      { group: "Crédito", items: ["Debêntures Incentivadas", "Project Finance", "Covenants"] },
      { group: "Valuation", items: ["DCF Regulado", "WACC", "TIR Real"] },
    ],
    events: [
      {
        date: "10 nov 2025",
        title: "Engie vence lote de transmissão no leilão da ANEEL",
        summary: "Companhia arremata lote com deságio competitivo, adicionando ~R$ 280mi de RAP futura.",
        impact: "Aumento de receita regulada previsível a partir de 2028.",
        concepts: ["RAP", "Leilão A-5", "TIR Real"],
      },
    ],
    sampleQuestions: [
      "Como funciona uma RAP na Engie?",
      "O que é GSF e por que afeta geradoras?",
      "Por que ações de transmissão são consideradas defensivas?",
    ],
  },
  {
    slug: "dasa",
    name: "DASA",
    ticker: "DASA3",
    sector: "Saúde — Diagnósticos e Hospitais",
    description: "Maior rede de medicina diagnóstica do Brasil, com hospitais e centros de oncologia.",
    businessModel: "Exames laboratoriais, imagem, hospitais e oncologia, com mix B2B (operadoras) e B2C.",
    risks: ["Alavancagem", "Pressão de margem em diagnósticos", "Glosas"],
    catalysts: ["Aumento de capital concluído", "Desinvestimento de ativos não-core"],
    metrics: [
      { label: "Receita", value: "R$ 13,5bi", delta: "+9% YoY", positive: true },
      { label: "Margem EBITDA", value: "13,2%", delta: "-80 bps", positive: false },
      { label: "Dívida Líq./EBITDA", value: "4,1x", delta: "alto", positive: false },
    ],
    knowledgeMap: [
      { group: "Crédito", items: ["Covenants", "Aumento de Capital", "Refinanciamento"] },
      { group: "Operacional", items: ["Ticket Médio", "Glosas", "Same-store"] },
    ],
    events: [
      {
        date: "01 nov 2025",
        title: "DASA conclui aumento de capital de R$ 1,5bi",
        summary: "Controlador aporta recursos para aliviar estrutura de capital e financiar plano de eficiência.",
        impact: "Redução da alavancagem em ~0,6x e fôlego para reestruturação operacional.",
        concepts: ["Aumento de Capital", "Desalavancagem", "Covenant"],
      },
    ],
    sampleQuestions: ["O que é aumento de capital?", "Como ele afeta acionistas minoritários?"],
  },
  {
    slug: "minerva",
    name: "Minerva Foods",
    ticker: "BEEF3",
    sector: "Alimentos — Proteína Bovina",
    description: "Maior exportadora de carne bovina da América do Sul, com plantas em 5 países.",
    businessModel: "Abate e exportação de carne in natura, com forte exposição a China, EUA e Oriente Médio.",
    risks: ["Ciclo do gado", "Câmbio", "Integração dos ativos comprados da Marfrig"],
    catalysts: ["Ciclo favorável do gado na América do Sul", "Sinergias da aquisição"],
    metrics: [
      { label: "Receita", value: "R$ 32bi", delta: "+25% YoY", positive: true },
      { label: "Margem EBITDA", value: "8,9%", delta: "+90 bps", positive: true },
      { label: "Dívida Líq./EBITDA", value: "3,4x", delta: "pós-M&A", positive: false },
    ],
    knowledgeMap: [
      { group: "Setor", items: ["Ciclo do Gado", "Spread de Abate", "Exportações"] },
      { group: "Crédito", items: ["Covenants", "Bonds Internacionais", "Hedge Cambial"] },
    ],
    events: [
      {
        date: "30 out 2025",
        title: "Minerva conclui aquisição de plantas da Marfrig",
        summary: "Conclusão da operação dobra capacidade de abate na América do Sul.",
        impact: "Aumento de escala, com pressão temporária na alavancagem.",
        concepts: ["M&A", "Sinergias", "Covenant"],
      },
    ],
    sampleQuestions: ["O que é spread de abate?", "Como o ciclo do gado afeta margens?"],
  },
  {
    slug: "cosan",
    name: "Cosan",
    ticker: "CSAN3",
    sector: "Conglomerado — Energia e Logística",
    description: "Holding com participações em Raízen, Rumo, Compass, Moove e Vale.",
    businessModel: "Holding de portfolio, com tese de criação de valor por alocação de capital.",
    risks: ["Alavancagem da holding", "Marcação a mercado das participações", "Posição em Vale"],
    catalysts: ["Eventual monetização de participações", "Reciclagem de portfolio"],
    metrics: [
      { label: "NAV", value: "R$ 65bi", delta: "desconto ~35%", positive: false },
      { label: "Dívida Líq. Holding", value: "R$ 22bi", delta: "elevada", positive: false },
      { label: "Dividendos recebidos", value: "R$ 2,1bi", delta: "estável", positive: true },
    ],
    knowledgeMap: [
      { group: "Holding", items: ["NAV", "Desconto de Holding", "Sum-of-the-Parts"] },
      { group: "Crédito", items: ["Dívida na Holding", "Cash Cover", "Rating"] },
    ],
    events: [
      {
        date: "22 out 2025",
        title: "Cosan reduz exposição em Vale",
        summary: "Companhia desmonta parte da posição via collar para reduzir alavancagem.",
        impact: "Alivia pressão de dívida na holding e reduz volatilidade do balanço.",
        concepts: ["Collar", "Desalavancagem", "NAV"],
      },
    ],
    sampleQuestions: ["O que é desconto de holding?", "Como funciona um collar?"],
  },
  {
    slug: "simpar",
    name: "Simpar",
    ticker: "SIMH3",
    sector: "Logística e Mobilidade",
    description: "Holding que controla JSL, Movida, Vamos, Automob, CS Brasil e BBC.",
    businessModel: "Conglomerado de mobilidade asset-heavy, fortemente alavancado em CDI.",
    risks: ["Sensibilidade a juros", "Renovação da frota", "Valor residual de veículos"],
    catalysts: ["Queda de juros", "Listagem/monetização de subsidiárias"],
    metrics: [
      { label: "Receita", value: "R$ 32bi", delta: "+19% YoY", positive: true },
      { label: "Dívida Líq./EBITDA", value: "3,6x", delta: "estável", positive: true },
      { label: "Custo da dívida", value: "CDI + 1,8%", delta: "alto", positive: false },
    ],
    knowledgeMap: [
      { group: "Setor", items: ["Valor Residual", "Yield de Frota", "Capex de Manutenção"] },
      { group: "Crédito", items: ["Duration", "Curva CDI", "Covenants"] },
    ],
    events: [
      {
        date: "18 out 2025",
        title: "Simpar emite debêntures de R$ 1bi com taxa mais baixa",
        summary: "Companhia aproveita janela para alongar dívida e reduzir spread de crédito.",
        impact: "Melhora perfil de amortização e reduz custo médio da dívida.",
        concepts: ["Debêntures", "Liability Management", "Duration"],
      },
    ],
    sampleQuestions: ["O que é liability management?", "Por que Simpar é sensível ao CDI?"],
  },
];

export const getCompany = (slug: string) => COMPANIES.find((c) => c.slug === slug);
