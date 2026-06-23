import type { Company } from "./companies";

export type Answer = {
  concept: string;
  explanation: string;
  application: string;
  financialImpact: { receita?: string; ebitda?: string; caixa?: string; divida?: string };
  shareholders: string;
  creditors: string;
  nextConcept: string;
};

type Topic = {
  match: RegExp;
  build: (company: Company) => Answer;
};

const TOPICS: Topic[] = [
  {
    match: /impairment/i,
    build: (c) => ({
      concept: "Impairment",
      explanation:
        "Impairment é a redução contábil (não-caixa) do valor de um ativo quando seu valor recuperável fica abaixo do valor registrado no balanço. Atinge tipicamente goodwill de aquisições, ativos fixos e participações.",
      application: `Em ${c.name}, impairments tendem a aparecer quando aquisições passadas (ciclo de M&A) não entregam o retorno previsto, exigindo revisão do valor contábil do goodwill.`,
      financialImpact: {
        receita: "Sem efeito direto.",
        ebitda: "Não afeta EBITDA (é despesa abaixo da linha operacional ajustada).",
        caixa: "Sem impacto de caixa — é evento contábil.",
        divida: "Pode pressionar covenants medidos por lucro líquido ou patrimônio.",
      },
      shareholders:
        "Reduz lucro contábil e patrimônio líquido, mas sinaliza limpeza de balanço — pode ser positivo quando antecede ciclo de execução.",
      creditors:
        "Atenção a covenants de patrimônio mínimo e ao histórico de qualidade das aquisições, que pode justificar prêmio de risco.",
      nextConcept: "EBITDA",
    }),
  },
  {
    match: /covenant/i,
    build: (c) => ({
      concept: "Covenant",
      explanation:
        "Cláusula contratual em instrumentos de dívida que obriga o emissor a manter certos indicadores financeiros (ex.: Dívida Líquida/EBITDA, ICSD) ou comportamentos (não vender ativos, limitar dividendos).",
      application: `No caso de ${c.name}, covenants de alavancagem (Dívida Líquida/EBITDA) e cobertura de juros são tipicamente os mais relevantes nos contratos de dívida.`,
      financialImpact: {
        ebitda: "EBITDA é numerador/denominador dos principais covenants.",
        caixa: "Quebra de covenant pode forçar amortização antecipada e drenar caixa.",
        divida: "Em caso de breach: vencimento antecipado, cross default, custo maior.",
      },
      shareholders:
        "Risco de diluição se a empresa precisar fazer aumento de capital para curar quebra de covenant.",
      creditors:
        "É a principal proteção do credor — define gatilhos de renegociação antes de uma situação irreversível.",
      nextConcept: "Cross Default",
    }),
  },
  {
    match: /waiver/i,
    build: (c) => ({
      concept: "Waiver",
      explanation:
        "Perdão temporário concedido pelos credores quando um covenant é descumprido. Costuma vir com fee, ajuste de spread e contrapartidas operacionais.",
      application: `Em ${c.name}, um waiver dá fôlego para executar o plano de desalavancagem sem disparar cross default.`,
      financialImpact: {
        caixa: "Pode exigir fee de waiver (saída pontual de caixa).",
        divida: "Evita aceleração; pode aumentar custo médio da dívida.",
      },
      shareholders: "Reduz risco de evento de crédito no curto prazo, mas sinaliza fragilidade — geralmente pressiona ação no anúncio.",
      creditors: "Mantém o crédito vivo, mas com mais proteções (garantias adicionais, covenants mais apertados).",
      nextConcept: "Standstill",
    }),
  },
  {
    match: /brent|petr[óo]leo|[óo]leo/i,
    build: (c) => ({
      concept: "Sensibilidade ao Brent",
      explanation:
        "Brent é a referência global de preço do petróleo. A receita de uma E&P independente é praticamente linear ao Brent, descontados royalties, participações governamentais e diferencial de qualidade do óleo.",
      application: `Em ${c.name}, cada US$ 1/bbl de variação no Brent impacta diretamente receita e EBITDA, dado que custos operacionais (lifting cost) são relativamente fixos no curto prazo.`,
      financialImpact: {
        receita: "Variação aproximadamente linear ao Brent.",
        ebitda: "Alavancagem operacional alta — variação do Brent vai quase toda para EBITDA.",
        caixa: "Impacto direto na geração de caixa e velocidade de desalavancagem.",
        divida: "Brent baixo por período longo pressiona covenants.",
      },
      shareholders: "Ações de E&P têm beta alto ao Brent — investidor precisa ter visão da commodity.",
      creditors: "Tipicamente exigem hedge mínimo da produção e covenants atrelados a Brent de referência.",
      nextConcept: "Hedge",
    }),
  },
  {
    match: /rap|transmiss[ãa]o/i,
    build: (c) => ({
      concept: "RAP — Receita Anual Permitida",
      explanation:
        "RAP é a receita anual que uma transmissora de energia recebe pela disponibilização da infraestrutura, independentemente do volume de energia que passa pela linha. É reajustada por inflação e revisada periodicamente.",
      application: `Em ${c.name}, a RAP confere previsibilidade quase 'bond-like' à receita de transmissão, permitindo financiamento via debêntures incentivadas de longo prazo.`,
      financialImpact: {
        receita: "Previsível, indexada à inflação.",
        ebitda: "Margens estruturalmente altas (>80% no segmento de transmissão).",
        caixa: "Geração de caixa estável, viabiliza payout elevado.",
        divida: "Permite alavancagem maior com baixo risco percebido.",
      },
      shareholders: "Tese defensiva, com dividendos consistentes.",
      creditors: "Setor mais bem avaliado em rating, com spreads comprimidos.",
      nextConcept: "Revisão Tarifária",
    }),
  },
  {
    match: /ebitda/i,
    build: (c) => ({
      concept: "EBITDA",
      explanation:
        "Lucro antes de juros, impostos, depreciação e amortização. É a métrica mais usada para comparar geração de caixa operacional entre empresas com estruturas de capital diferentes.",
      application: `Para ${c.name}, EBITDA é o numerador/denominador dos principais covenants de dívida e da maioria dos múltiplos de valuation usados pelo mercado.`,
      financialImpact: {
        receita: "EBITDA = Receita − Custos e despesas operacionais (ex-D&A).",
        ebitda: "É o próprio indicador.",
        caixa: "Proxy de caixa, mas ignora capital de giro, capex e impostos.",
        divida: "Base para cálculo de Dívida Líquida/EBITDA.",
      },
      shareholders: "Permite comparar empresas; EV/EBITDA é múltiplo central de valuation.",
      creditors: "Métrica central de capacidade de pagamento da dívida.",
      nextConcept: "Free Cash Flow",
    }),
  },
];

const fallback = (c: Company, question: string): Answer => ({
  concept: "Conceito identificado",
  explanation:
    "Esta é uma resposta demonstrativa do MVP. Em produção, este chat usaria um modelo de linguagem conectado às demonstrações financeiras, releases e fatos relevantes da empresa selecionada.",
  application: `Aplicando ao caso de ${c.name} (${c.ticker}, ${c.sector}): a pergunta "${question}" seria respondida com base nos últimos resultados divulgados, no plano de negócios e na estrutura de capital da companhia.`,
  financialImpact: {
    receita: "A discutir com base no caso específico.",
    ebitda: "A discutir com base no caso específico.",
    caixa: "A discutir com base no caso específico.",
    divida: "A discutir com base no caso específico.",
  },
  shareholders: "Impacto depende da magnitude do evento e da reação do mercado.",
  creditors: "Impacto depende do efeito sobre alavancagem, liquidez e covenants.",
  nextConcept: "EBITDA",
});

export function buildAnswer(company: Company, question: string): Answer {
  const topic = TOPICS.find((t) => t.match.test(question));
  return topic ? topic.build(company) : fallback(company, question);
}
