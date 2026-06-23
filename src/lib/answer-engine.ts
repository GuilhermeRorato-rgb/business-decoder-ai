import type { Company } from "./companies";
import { CONCEPT_BY_ID, matchConcept, type Concept } from "./knowledge";

export type Answer = {
  concept: Concept;
  explanation: string;
  application: string;
  financialImpact: { receita?: string; ebitda?: string; caixa?: string; divida?: string };
  shareholders: string;
  creditors: string;
  related: Concept[];
  next?: Concept;
};

type Template = {
  application: (c: Company) => string;
  impact: Answer["financialImpact"];
  shareholders: string;
  creditors: string;
};

const TEMPLATES: Partial<Record<string, Template>> = {
  ebitda: {
    application: (c) =>
      `Em ${c.name}, EBITDA é o indicador-chave de geração operacional. Mesa-redonda do mercado usa Dívida Líquida/EBITDA para julgar a alavancagem e EV/EBITDA para comparar com pares do setor "${c.sector}".`,
    impact: {
      receita: "EBITDA = Receita − Custos e despesas operacionais (ex-D&A).",
      ebitda: "É o próprio indicador.",
      caixa: "Proxy de caixa, mas ignora capital de giro, capex e impostos.",
      divida: "Denominador dos principais covenants de dívida.",
    },
    shareholders: "Base para EV/EBITDA — múltiplo central usado em valuation relativo.",
    creditors: "Métrica central de capacidade de pagamento da dívida.",
  },
  "margem-ebitda": {
    application: (c) =>
      `A margem EBITDA de ${c.name} reflete o quanto cada R$ 1 de receita vira caixa operacional, antes de capex e juros. Comparar com pares do setor mostra eficiência relativa.`,
    impact: {
      receita: "Receita é o denominador.",
      ebitda: "EBITDA é o numerador.",
      caixa: "Margem mais alta → mais caixa por real vendido.",
    },
    shareholders: "Expansão de margem é um dos principais drivers de re-rating.",
    creditors: "Margens estáveis dão previsibilidade ao serviço da dívida.",
  },
  fcf: {
    application: (c) =>
      `Em ${c.name}, FCF é o que sobra para pagar dívida, dividendos e recompras após capex de manutenção. É a métrica que importa para o credor de longo prazo.`,
    impact: {
      ebitda: "FCF = EBITDA − impostos − Δ capital de giro − capex.",
      caixa: "Mede caixa de fato, não lucro contábil.",
      divida: "FCF positivo é o que permite desalavancar.",
    },
    shareholders: "Base do DCF e do dividend yield sustentável.",
    creditors: "Crédito olha FCF/Serviço da dívida como gatilho de risco.",
  },
  "divida-liq-ebitda": {
    application: (c) =>
      `Em ${c.name}, este múltiplo está nos covenants das principais dívidas. Subir acima do limite contratado pode disparar negociação com credores.`,
    impact: {
      ebitda: "Denominador — qualquer pressão de margem piora o indicador.",
      divida: "Numerador — captações novas ou dólar forte podem inflar.",
      caixa: "Geração de caixa é o que reduz numerador ao longo do tempo.",
    },
    shareholders: "Empresas mais alavancadas têm beta maior e mais sensibilidade a juros.",
    creditors: "É o principal covenant financeiro acompanhado.",
  },
  impairment: {
    application: (c) =>
      `Em ${c.name}, impairments aparecem tipicamente quando aquisições passadas (ciclo de M&A) não entregam retorno previsto, forçando revisão do goodwill no balanço.`,
    impact: {
      receita: "Sem efeito direto.",
      ebitda: "Não afeta EBITDA (despesa abaixo da linha operacional ajustada).",
      caixa: "Sem impacto de caixa — é evento contábil.",
      divida: "Pode pressionar covenants de patrimônio mínimo.",
    },
    shareholders: "Reduz lucro contábil e PL, mas sinaliza limpeza de balanço.",
    creditors: "Atenção ao histórico das aquisições — pode justificar prêmio de risco.",
  },
  goodwill: {
    application: (c) =>
      `O goodwill de ${c.name} reflete prêmios pagos em aquisições anteriores. Quanto maior, mais relevante a tese de geração de sinergias para justificá-lo.`,
    impact: { ebitda: "Sem efeito direto.", caixa: "Sem efeito de caixa." },
    shareholders: "Goodwill alto exige execução de sinergias para criar valor.",
    creditors: "Goodwill não tem valor de recuperação em default.",
  },
  covenant: {
    application: (c) =>
      `Nos contratos de dívida de ${c.name}, covenants de alavancagem (Dívida Líq./EBITDA) e cobertura de juros são tipicamente os mais relevantes.`,
    impact: {
      ebitda: "Numerador/denominador dos principais covenants.",
      caixa: "Quebra pode forçar amortização antecipada e drenar caixa.",
      divida: "Em breach: vencimento antecipado e cross default.",
    },
    shareholders: "Risco de diluição se for preciso aumento de capital para curar breach.",
    creditors: "É a principal proteção do credor antes de uma situação irreversível.",
  },
  waiver: {
    application: (c) =>
      `Em ${c.name}, um waiver dá fôlego para executar o plano operacional sem disparar cross default — geralmente vem com fee e ajuste de spread.`,
    impact: {
      caixa: "Pode exigir fee de waiver (saída pontual de caixa).",
      divida: "Evita aceleração; tipicamente eleva custo médio da dívida.",
    },
    shareholders: "Reduz risco de evento de crédito, mas sinaliza fragilidade.",
    creditors: "Mantém o crédito vivo com proteções adicionais (garantias, covenants mais apertados).",
  },
  standstill: {
    application: (c) =>
      `Em uma renegociação envolvendo ${c.name}, um standstill congela execuções enquanto credores e empresa desenham a solução de longo prazo.`,
    impact: { divida: "Suspende temporariamente gatilhos de aceleração." },
    shareholders: "Evita o pior cenário (recuperação judicial) e preserva valor de equity.",
    creditors: "Compra tempo para estruturar reperfilamento com garantias melhores.",
  },
  "cross-default": {
    application: (c) =>
      `Em ${c.name}, com várias linhas de dívida, uma quebra isolada pode cascatear via cross default e vencer antecipadamente todo o stack.`,
    impact: {
      divida: "Risco de aceleração de TODA a dívida elegível.",
      caixa: "Pode exigir caixa imediato para cobrir aceleração.",
    },
    shareholders: "Cenário extremo — geralmente colapsa o equity.",
    creditors: "Credor sênior usa para forçar mesa de negociação cedo.",
  },
  wacc: {
    application: (c) =>
      `O WACC de ${c.name} reflete o risco do setor "${c.sector}" e a estrutura de capital atual. É a taxa que desconta o FCF futuro no DCF.`,
    impact: {
      ebitda: "Não afeta diretamente, mas múltiplo implícito muda.",
      divida: "Mix maior de dívida barata reduz WACC (até certo ponto).",
    },
    shareholders: "Equity risk premium e beta são os principais inputs do Ke.",
    creditors: "Custo de dívida observado é input direto do Kd.",
  },
  roic: {
    application: (c) =>
      `Para ${c.name}, comparar ROIC vs WACC mostra se o negócio cria ou destrói valor. ROIC > WACC = criação de valor.`,
    impact: { ebitda: "Numerador (NOPAT) deriva de EBIT × (1 − T)." },
    shareholders: "ROIC > WACC é condição para re-rating de longo prazo.",
    creditors: "Empresas com ROIC alto têm folga maior para servir dívida.",
  },
  eva: {
    application: (c) =>
      `EVA de ${c.name} = (ROIC − WACC) × Capital Investido — mede valor econômico criado em R$, não em %.`,
    impact: {},
    shareholders: "EVA crescente é forte preditor de retorno de longo prazo.",
    creditors: "Indicador secundário; pouco usado em covenants.",
  },
  dcf: {
    application: (c) =>
      `Um DCF de ${c.name} projeta o FCF nos próximos 5–10 anos, calcula perpetuidade, desconta tudo pelo WACC e chega no equity value via Enterprise Value − Dívida Líquida.`,
    impact: {},
    shareholders: "Modelo intrínseco — base do preço-alvo do analista.",
    creditors: "Sensibilidade do enterprise value a Brent/RAP/spread é stress test clássico.",
  },
  nav: {
    application: (c) =>
      `Em uma holding como ${c.name}, NAV = soma do valor das participações. O mercado normalmente aplica desconto sobre o NAV.`,
    impact: {},
    shareholders: "Catalisador clássico é monetização de ativos com fechamento do desconto.",
    creditors: "Cobertura de dívida da holding depende dos dividendos recebidos.",
  },
  ma: {
    application: (c) =>
      `Em ${c.name}, decisões de M&A são avaliadas por: criação de sinergias > prêmio pago, accretive/dilutive em EPS e impacto na alavancagem.`,
    impact: {
      ebitda: "Soma do EBITDA + sinergias capturáveis.",
      caixa: "Pode consumir caixa relevante na transação.",
      divida: "Geralmente eleva temporariamente a alavancagem.",
    },
    shareholders: "Reação no IPCA da operação é função do prêmio e da clareza das sinergias.",
    creditors: "Atenção a covenants após o fechamento — frequentemente exigem waiver prévio.",
  },
  sinergias: {
    application: (c) =>
      `Em ${c.name}, sinergias podem vir de custos (back-office, compras) ou receita (cross-sell, plataformas combinadas).`,
    impact: {
      ebitda: "Sinergias capturadas vão direto para EBITDA.",
      caixa: "Custos de captura (one-off) pesam no curto prazo.",
    },
    shareholders: "Captura efetiva vs prometida é o termômetro da execução.",
    creditors: "Sinergias reduzem alavancagem proforma.",
  },
  "aumento-capital": {
    application: (c) =>
      `Um aumento de capital em ${c.name} levanta novos recursos para desalavancar ou financiar plano — vem normalmente com diluição.`,
    impact: {
      caixa: "Entrada de caixa relevante.",
      divida: "Reduz alavancagem rapidamente.",
    },
    shareholders: "Diluição depende de quem subscreveu — minoritário precisa avaliar TAG along.",
    creditors: "Positivo: fortalece estrutura de capital antes de breach.",
  },
  diluicao: {
    application: (c) =>
      `Em ${c.name}, diluição mede quanto cada acionista existente fica menor após nova emissão. Se o novo capital cria valor acima do custo, o efeito líquido pode ser positivo.`,
    impact: {},
    shareholders: "Diluição é "ok" se o uso do dinheiro tiver TIR > custo de equity.",
    creditors: "Indiferente diretamente — beneficiado pela menor alavancagem.",
  },
  "holding-discount": {
    application: (c) =>
      `${c.name} normalmente negocia abaixo do NAV pela complexidade de governança, dívida na holding e iliquidez relativa.`,
    impact: {},
    shareholders: "Fechamento de desconto é trigger de valuation.",
    creditors: "Foco no cash cover dos dividendos vs serviço de dívida da holding.",
  },
  turnaround: {
    application: (c) =>
      `O turnaround de ${c.name} foca em cortar SG&A, melhorar capital de giro e desinvestir ativos não-core para destravar caixa.`,
    impact: {
      ebitda: "Margens melhoram conforme cortes se materializam.",
      caixa: "Liberação de capital de giro acelera desalavancagem.",
      divida: "Indicadores de crédito tendem a melhorar após 4–6 trimestres.",
    },
    shareholders: "Re-rating significativo se execução for crível.",
    creditors: "Acompanham marcos operacionais como gatilho de waiver/refi.",
  },
  rap: {
    application: (c) =>
      `Em ${c.name}, a RAP confere previsibilidade quase 'bond-like' à receita de transmissão, permitindo financiamento via debêntures incentivadas de longo prazo.`,
    impact: {
      receita: "Previsível, indexada à inflação.",
      ebitda: "Margens estruturalmente altas (>80% em transmissão).",
      caixa: "Geração de caixa estável viabiliza payout elevado.",
      divida: "Permite alavancagem maior com baixo risco percebido.",
    },
    shareholders: "Tese defensiva, com dividendos consistentes.",
    creditors: "Setor com rating alto e spreads comprimidos.",
  },
  ppa: {
    application: (c) =>
      `Em ${c.name}, PPAs de longo prazo dão visibilidade de receita por 10–20 anos, com preço normalmente indexado à inflação.`,
    impact: { receita: "Volume e preço contratados de antemão." },
    shareholders: "Reduz volatilidade dos resultados.",
    creditors: "PPAs robustos são base de project finance.",
  },
  gsf: {
    application: (c) =>
      `Para ${c.name}, GSF abaixo de 1 significa que geradoras hidráulicas entregam menos energia do que sua garantia física e precisam comprar a diferença no spot.`,
    impact: { ebitda: "GSF baixo pressiona resultados de hidrelétricas." },
    shareholders: "Risco hidrológico já foi parcialmente repactuado pela ANEEL.",
    creditors: "Avaliado em estresse de fluxo de caixa.",
  },
  brent: {
    application: (c) =>
      `Em ${c.name}, cada US$ 1/bbl de variação no Brent impacta receita e EBITDA quase linearmente, dado que lifting cost é relativamente fixo no curto prazo.`,
    impact: {
      receita: "Variação aproximadamente linear ao Brent.",
      ebitda: "Alavancagem operacional alta.",
      caixa: "Impacto direto na velocidade de desalavancagem.",
      divida: "Brent baixo prolongado pressiona covenants.",
    },
    shareholders: "Beta alto ao Brent — investidor precisa ter visão da commodity.",
    creditors: "Tipicamente exigem hedge mínimo da produção.",
  },
  "lifting-cost": {
    application: (c) =>
      `Em ${c.name}, lifting cost é o custo direto de extrair cada barril e define o break-even operacional.`,
    impact: { ebitda: "Quanto menor, mais resiliente o EBITDA a quedas do Brent." },
    shareholders: "Empresas de baixo lifting cost defendem dividendos em ciclos ruins.",
    creditors: "Métrica central na análise de risco de E&P.",
  },
  fpso: {
    application: (c) =>
      `Em ${c.name}, FPSOs habilitam produção offshore sem oleoduto fixo — capacidade de processamento é o gargalo.`,
    impact: { ebitda: "Ramp-up do FPSO acelera receita." },
    shareholders: "Marcos operacionais (1º óleo, plateau) são catalisadores.",
    creditors: "Riscos de execução e descomissionamento são acompanhados.",
  },
  "reservas-2p": {
    application: (c) =>
      `As reservas 2P de ${c.name} (provadas + prováveis) são base do NAV — quanto petróleo a empresa "tem" para produzir.`,
    impact: {},
    shareholders: "NAV/ação compara com cotação de mercado.",
    creditors: "Reserve-Based Lending limita dívida em função das reservas certificadas.",
  },
  hedge: {
    application: (c) =>
      `Em ${c.name}, hedge protege parte da produção contra quedas do Brent, garantindo preço mínimo durante janelas de capex pesado.`,
    impact: { receita: "Limita upside, protege downside.", caixa: "Garante caixa mínimo para servir dívida." },
    shareholders: "Hedge demais reduz alavancagem ao Brent quando preço sobe.",
    creditors: "Frequentemente exigido por covenant em reserve-based lending.",
  },
  glosas: {
    application: (c) =>
      `Em ${c.name}, glosas das operadoras de saúde reduzem receita reconhecida e alongam capital de giro.`,
    impact: {
      receita: "Recusa de pagamento reduz receita líquida.",
      caixa: "Alonga prazo médio de recebimento.",
    },
    shareholders: "Tendência de glosas é proxy de qualidade da gestão de contas.",
    creditors: "Atenção a Days Sales Outstanding (DSO).",
  },
  "same-store-sales": {
    application: (c) =>
      `Em ${c.name}, same-store sales separa crescimento orgânico do que veio de aquisições, mostrando a saúde real da base instalada.`,
    impact: { ebitda: "SSS positivo dá alavancagem operacional sobre custos fixos." },
    shareholders: "Métrica mais limpa de crescimento qualitativo.",
    creditors: "SSS resiliente reduz risco de execução em ciclos fracos.",
  },
  "ciclo-do-gado": {
    application: (c) =>
      `Para ${c.name}, ciclo de oferta de boi na América do Sul define o custo do principal insumo — fase de oferta alta = spread maior.`,
    impact: { ebitda: "Cicíclico — pode dobrar entre fases boas e ruins do ciclo." },
    shareholders: "Tese de frigorífico é altamente cíclica.",
    creditors: "Covenants em frigoríficos consideram normalização do ciclo.",
  },
  "spread-abate": {
    application: (c) =>
      `Em ${c.name}, spread de abate = preço do produto exportado − custo do boi gordo + outros custos. É o termômetro de margem do trimestre.`,
    impact: { ebitda: "Spread é o driver direto da margem EBITDA por planta." },
    shareholders: "Spread é divulgado mensalmente — guia para revisões de estimativas.",
    creditors: "Sensibilidade do EBITDA ao spread vira stress test.",
  },
  capex: {
    application: (c) =>
      `Em ${c.name}, separar capex de manutenção (para manter a operação) de capex de expansão (para crescer) é essencial para entender FCF.`,
    impact: { caixa: "Capex consome caixa antes do FCF.", ebitda: "Capex vira depreciação ao longo do tempo." },
    shareholders: "Capex de expansão acelera crescimento — desde que ROIC > WACC.",
    creditors: "Capex elevado em janela de alavancagem alta é red flag.",
  },
  depreciacao: {
    application: (c) =>
      `Em ${c.name}, a depreciação reflete o consumo do parque de ativos — é não-caixa, mas afeta lucro líquido e impostos.`,
    impact: { ebitda: "Excluída do EBITDA por definição." },
    shareholders: "Depreciação alta esconde lucro contábil sem afetar caixa.",
    creditors: "Indiferente diretamente ao crédito.",
  },
  "capital-de-giro": {
    application: (c) =>
      `Em ${c.name}, capital de giro é função de contas a receber − fornecedores − estoque. Em saúde, recebíveis longos das operadoras pesam.`,
    impact: { caixa: "Variação de WK afeta diretamente o FCF do trimestre." },
    shareholders: "Liberação de WK destrava caixa sem depender de margem.",
    creditors: "Acompanham linhas de risco sacado e antecipação de recebíveis.",
  },
  "recovery-value": {
    application: (c) =>
      `Em ${c.name}, recovery value estima quanto credores recuperariam se a empresa entrasse em default — função de garantias e qualidade dos ativos.`,
    impact: { divida: "Define preço de bonds estressados no mercado secundário." },
    shareholders: "Recovery baixo = equity provavelmente vale zero em default.",
    creditors: "Define precificação do prêmio de risco e atratividade do bond.",
  },
};

function fallbackTemplate(c: Company, concept: Concept): Template {
  return {
    application: `Aplicando em ${c.name} (${c.ticker}): ${concept.short}`,
    impact: {
      receita: "A discutir com base no caso específico.",
      ebitda: "A discutir com base no caso específico.",
      caixa: "A discutir com base no caso específico.",
      divida: "A discutir com base no caso específico.",
    },
    shareholders: "Impacto depende da magnitude do evento e da reação do mercado.",
    creditors: "Impacto depende do efeito sobre alavancagem, liquidez e covenants.",
  };
}

const GENERIC_CONCEPT: Concept = {
  id: "open-question",
  label: "Pergunta aberta",
  category: "operacional",
  short:
    "Pergunta livre sem conceito formal mapeado — protótipo demonstrativo. Em produção, um LLM responderia com base nas demonstrações e fatos relevantes da empresa.",
  related: ["ebitda", "covenant", "wacc"],
  sample: "",
};

export function buildAnswer(company: Company, question: string): Answer {
  const concept = matchConcept(question) ?? GENERIC_CONCEPT;
  const tpl = TEMPLATES[concept.id] ?? fallbackTemplate(company, concept);

  const related = concept.related
    .map((id) => CONCEPT_BY_ID[id])
    .filter((x): x is Concept => Boolean(x));

  const next = concept.next ? CONCEPT_BY_ID[concept.next] : related[0];

  return {
    concept,
    explanation: concept.short,
    application: tpl.application(company),
    financialImpact: tpl.impact,
    shareholders: tpl.shareholders,
    creditors: tpl.creditors,
    related,
    next,
  };
}
