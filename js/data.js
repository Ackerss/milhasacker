/* ============================================
   MILHAS ACKER — Dados de Referência VALIDADOS
   Fontes: Melhores Destinos, Melhores Cartões,
   Pontos Pra Voar, Mobills, Farejador de Milhas
   Última atualização: 08/06/2026
   ============================================ */

const PROGRAMS = [
  {
    id: 'latam',
    name: 'Latam Pass',
    icon: '✈️',
    color: '#ED1C24',
    type: 'aerea',
    bestPrice: 20.00,
    goodPrice: 25.00,
    regularPrice: 70.00,
    anniversary: 'Setembro/Outubro',
    source: 'Via Livelo com bônus transferência 25-40%. Milha mais valorizada para internacionais.'
  },
  {
    id: 'smiles',
    name: 'Smiles',
    icon: '😊',
    color: '#FF6600',
    type: 'aerea',
    bestPrice: 14.00,
    goodPrice: 16.00,
    regularPrice: 80.00,
    anniversary: 'Outubro (dia 18)',
    source: 'Via Livelo + bônus 100% = ~R$14-15. Compra direta c/ bônus 365% = ~R$17-19.'
  },
  {
    id: 'azul',
    name: 'Azul Fidelidade',
    icon: '💎',
    color: '#2D58A7',
    type: 'aerea',
    bestPrice: 9.00,
    goodPrice: 13.00,
    regularPrice: 70.00,
    anniversary: 'Agosto/Setembro',
    source: 'Melhor custo-benefício. Via Clube Azul + bônus transferência 100% = ~R$9-11. (Ex-TudoAzul, renomeado abr/2024).'
  },
  {
    id: 'livelo',
    name: 'Livelo',
    icon: '💜',
    color: '#6B2D8B',
    type: 'pontos',
    bestPrice: 25.00,
    goodPrice: 30.00,
    regularPrice: 70.00,
    anniversary: 'Junho (dia 3)',
    source: 'Intermediário. Ponto puro R$25-30 c/ desconto. Valor real depende do bônus de transferência para aérea.'
  },
  {
    id: 'esfera',
    name: 'Esfera',
    icon: '🟡',
    color: '#C4A000',
    type: 'pontos',
    bestPrice: 31.00,
    goodPrice: 35.00,
    regularPrice: 70.00,
    anniversary: 'Setembro (Clube: Abril)',
    source: 'Santander. Similar à Livelo. Desconto 50-55% p/ assinantes Clube Esfera. Forte em Iberia Plus.'
  },
  {
    id: 'aadvantage',
    name: 'AAdvantage',
    icon: '🦅',
    color: '#0078D2',
    type: 'aerea',
    bestPrice: 120.00,
    goodPrice: 140.00,
    regularPrice: 200.00,
    anniversary: 'Abril (dia 15)',
    source: 'Programa internacional em USD. US$22,50/milheiro c/ 40% desconto. Custo elevado no Brasil. Valorizado p/ emissões Oneworld.'
  },
  {
    id: 'tap',
    name: 'TAP Miles&Go',
    icon: '🌍',
    color: '#00694D',
    type: 'aerea',
    bestPrice: 40.00,
    goodPrice: 44.00,
    regularPrice: 60.00,
    anniversary: 'Março (dia 14)',
    source: 'Desvalorizado em 2026 (reajuste de tabela mai/2026). Perdeu parceria Livelo. Acúmulo restrito: Itaú, C6, BRB, Esfera, BTG.'
  }
];

// Calendário de promoções — padrões históricos 2022-2026
// Fontes: Melhores Destinos, Melhores Cartões, Pontos Pra Voar, Mobills
const PROMO_CALENDAR = [
  {
    month: 0,
    name: 'Janeiro',
    rating: 'medio',
    ratingLabel: '⭐ Bom',
    heat: 2,
    highlights: [
      { program: 'smiles', text: 'Aniversário GOL (15/jan) — promoções de milhas Smiles' },
      { program: 'azul', text: 'Aniversário Clube Azul (16/jan) — bônus para membros' },
      { program: 'livelo', text: 'Promoções de início de ano, compra com desconto' }
    ],
    tip: 'Aniversário GOL impulsiona Smiles. Clube Azul também celebra. Bom para quem é membro dos clubes.'
  },
  {
    month: 1,
    name: 'Fevereiro',
    rating: 'fraco',
    ratingLabel: '😐 Fraco',
    heat: 1,
    highlights: [
      { program: 'smiles', text: 'Promoções de Carnaval — emissões com desconto' },
      { program: 'livelo', text: 'Eventuais promos pontuais' }
    ],
    tip: 'Carnaval domina o mês. Poucas promoções relevantes de compra/transferência. Aguarde meses melhores.'
  },
  {
    month: 2,
    name: 'Março',
    rating: 'bom',
    ratingLabel: '⭐ Bom',
    heat: 3,
    highlights: [
      { program: 'tap', text: '🎂 Aniversário TAP (14/mar) — promos de milhas TAP' },
      { program: 'livelo', text: 'Semana do Consumidor — descontos em compra de pontos' },
      { program: 'smiles', text: 'Semana do Consumidor — promos de emissão' }
    ],
    tip: 'Semana do Consumidor (15/mar) costuma ter boas promoções em vários programas. Aniversário TAP para quem usa Miles&Go.'
  },
  {
    month: 3,
    name: 'Abril',
    rating: 'medio',
    ratingLabel: '⭐ Bom',
    heat: 3,
    highlights: [
      { program: 'aadvantage', text: '🎂 Aniversário American Airlines (15/abr)' },
      { program: 'esfera', text: '🎂 Aniversário Clube Esfera (2026: 13-19/abr) — compra com desconto' },
      { program: 'azul', text: 'Aniversário Azul Viagens (20/abr)' }
    ],
    tip: 'Aniversário Clube Esfera é oportunidade para clientes Santander. AAdvantage faz promos em milhas bonificadas.'
  },
  {
    month: 4,
    name: 'Maio',
    rating: 'fraco',
    ratingLabel: '😐 Fraco',
    heat: 1,
    highlights: [
      { program: 'livelo', text: 'Dia das Mães — promoções bancárias pontuais' },
      { program: 'esfera', text: 'Campanhas Santander Dia das Mães' }
    ],
    tip: 'Mês calmo para milhas. Foque em acumular pontos via gastos no cartão. Não compre pelo preço regular.'
  },
  {
    month: 5,
    name: 'Junho',
    rating: 'quente',
    ratingLabel: '🔥 Imperdível',
    heat: 5,
    highlights: [
      { program: 'livelo', text: '🎂 ANIVERSÁRIO LIVELO (03/jun) — Compra com até 57% OFF, melhores descontos do semestre' },
      { program: 'latam', text: 'Aniversário LATAM Airlines (22/jun) — promos de emissão' },
      { program: 'smiles', text: 'Promos de datas duplas (06/06)' }
    ],
    tip: '🏆 ANIVERSÁRIO LIVELO! Melhor época para comprar pontos Livelo. Se houver transferência bonificada simultânea para Azul/Smiles, é combo imbatível.'
  },
  {
    month: 6,
    name: 'Julho',
    rating: 'fraco',
    ratingLabel: '😐 Fraco',
    heat: 1,
    highlights: [
      { program: 'livelo', text: 'Datas duplas (07/07) — promos pontuais' },
      { program: 'latam', text: 'Alta temporada — preços de emissão elevados' }
    ],
    tip: 'Férias de julho = alta temporada. Preços de emissão altos. Evite comprar milhas neste mês, a não ser em promoção excepcional.'
  },
  {
    month: 7,
    name: 'Agosto',
    rating: 'bom',
    ratingLabel: '⭐ Bom',
    heat: 3,
    highlights: [
      { program: 'azul', text: '🎂 ANIVERSÁRIO AZUL FIDELIDADE (30/ago) — Bônus agressivos de transferência' },
      { program: 'livelo', text: 'Dia dos Pais — promos bancárias' },
      { program: 'esfera', text: 'Promos de meio de segundo semestre' }
    ],
    tip: 'Aniversário Azul Fidelidade! Transferências bonificadas históricas de 80-100%. Combine com pontos Livelo.'
  },
  {
    month: 8,
    name: 'Setembro',
    rating: 'quente',
    ratingLabel: '🔥 Imperdível',
    heat: 5,
    highlights: [
      { program: 'azul', text: 'Aniversário Azul Fidelidade (15/set) — bônus em transferência' },
      { program: 'latam', text: '🎂 Aniversário LATAM Pass (30/set) — promos exclusivas' },
      { program: 'esfera', text: '🎂 Aniversário Esfera — promos Santander' },
      { program: 'livelo', text: 'Aniversário Clube Livelo — bônus extras' },
      { program: 'smiles', text: 'Smiles Day / Clube Smiles — bônus membros' }
    ],
    tip: '🏆 MÊS MAIS ESTRATÉGICO! Concentração de aniversários: Azul, LATAM Pass, Esfera, Itaú (27/set), Clube Livelo. Múltiplas oportunidades simultâneas.'
  },
  {
    month: 9,
    name: 'Outubro',
    rating: 'quente',
    ratingLabel: '🔥 Imperdível',
    heat: 4,
    highlights: [
      { program: 'smiles', text: '🎂 ANIVERSÁRIO SMILES (18/out) — Promoções agressivas, milhas com até 70% bônus' },
      { program: 'livelo', text: 'Transferências bonificadas para Smiles' },
      { program: 'latam', text: 'Continuação promos aniversário LATAM Pass' }
    ],
    tip: 'ANIVERSÁRIO SMILES! Historicamente um dos melhores meses. Cadastre-se nas promoções ANTES de transferir.'
  },
  {
    month: 10,
    name: 'Novembro',
    rating: 'imperdivel',
    ratingLabel: '🔥🔥 MELHOR MÊS',
    heat: 5,
    highlights: [
      { program: 'smiles', text: '🟠 ORANGE FRIDAY — Maiores bônus do ano (até 100%+ para Diamante)' },
      { program: 'livelo', text: 'BLACK FRIDAY — Compra com maiores descontos (até 60% OFF)' },
      { program: 'latam', text: 'Black Friday — bônus transferência + emissões baratas' },
      { program: 'azul', text: 'Black Friday — promoções agressivas de transferência' },
      { program: 'esfera', text: 'Black Friday — Clube Esfera promos' }
    ],
    tip: '🏆 O MELHOR MÊS DO ANO! Orange Friday Smiles (até 100% bônus membros, ~50% base) + Black Friday em todos. Regra: cadastre CPF antes, confira limites por CPF, milhas bônus valem 12 meses.'
  },
  {
    month: 11,
    name: 'Dezembro',
    rating: 'medio',
    ratingLabel: '⭐ Bom',
    heat: 2,
    highlights: [
      { program: 'latam', text: 'Aniversário Clube LATAM Pass (05/dez)' },
      { program: 'azul', text: 'Aniversário Azul Linhas Aéreas (15/dez)' },
      { program: 'livelo', text: 'Cyber Monday / Promos de Natal' },
      { program: 'smiles', text: 'Últimas oportunidades pós-Black Friday' }
    ],
    tip: 'Cyber Monday no início do mês. Promos de Black Friday podem se estender. Bom para quem perdeu novembro.'
  }
];

// Estratégias de compra combinada (Fontes: Melhores Destinos, Farejador de Milhas)
const STRATEGIES = {
  'livelo_azul_100': {
    name: 'Livelo → Azul com 100% bônus',
    cpmFinal: 11,
    description: 'Compre Livelo a R$25/milheiro + transfira com 100% bônus para Azul = ~R$11-13/milheiro final',
    difficulty: 'Requer paciência (esperar bônus 100%)'
  },
  'livelo_smiles_100': {
    name: 'Livelo → Smiles com 100% bônus',
    cpmFinal: 14,
    description: 'Compre Livelo a R$28/milheiro + transfira com 100% bônus para Smiles = ~R$14-15/milheiro final',
    difficulty: 'Orange Friday é a melhor época'
  },
  'livelo_latam_30': {
    name: 'Livelo → LATAM com 30% bônus',
    cpmFinal: 20,
    description: 'Compre Livelo a R$26/milheiro + transfira com 30% bônus para LATAM = ~R$20-22/milheiro final',
    difficulty: 'Bônus LATAM raramente passa de 40%'
  }
};

// Dados de referência confiáveis — fontes consultadas
const DATA_SOURCES = {
  prices: [
    'Melhores Destinos (melhoresdestinos.com.br)',
    'Melhores Cartões (melhorescartoes.com.br)',
    'Pontos Pra Voar (pontospravoar.com)',
    'Farejador de Milhas (farejadordemilhas.com.br)',
    'Mobills (mobills.com.br)',
    'Passageiro de Primeira (passageirodeprimeira.com)',
    'Alta Renda Blog',
    'Cartões de Crédito.me'
  ],
  calendar: [
    'Mobills — Calendário de Aniversários de Milhas 2026',
    'Melhores Cartões — Calendário de Promoções',
    'Pontos Pra Voar — Análise de Promoções',
    'Viajante Experiente — Estratégias de Milhas',
    'Regulamentos oficiais dos programas (Smiles, LATAM, Azul, Livelo, Esfera)'
  ],
  notes: [
    '⚠️ TudoAzul foi renomeado para Azul Fidelidade em abril/2024 (mesmo programa)',
    '⚠️ TAP Miles&Go perdeu atratividade em mai/2026 — reajuste de tabela fixa',
    '⚠️ Azul em recuperação judicial — acompanhar impacto no programa',
    '⚠️ Nunca transfira pontos sem promoção de bônus (regra de ouro)',
    '⚠️ Nunca compre milhas pelo preço cheio (~R$70-80/milheiro)'
  ],
  lastUpdated: '2026-06-08'
};

// Tipos de movimentação
const MOVEMENT_TYPES = [
  { id: 'compra', label: 'Compra', icon: '🛒', color: '#4361EE' },
  { id: 'transferencia_entrada', label: 'Transferência (Entrada)', icon: '📥', color: '#06D6A0' },
  { id: 'transferencia_saida', label: 'Transferência (Saída)', icon: '📤', color: '#F72585' },
  { id: 'bonus', label: 'Bônus', icon: '🎁', color: '#06D6A0' },
  { id: 'uso', label: 'Uso (Emissão)', icon: '✈️', color: '#EF476F' },
  { id: 'expiracao', label: 'Expiração', icon: '⏰', color: '#DC2626' },
  { id: 'clube', label: 'Crédito Clube', icon: '🏅', color: '#F72585' },
  { id: 'cartao', label: 'Crédito Cartão', icon: '💳', color: '#FFD166' }
];

// Pessoas
const USERS_LIST = [
  { id: 'jacson', name: 'Jacson', icon: '👨' },
  { id: 'ana', name: 'Ana', icon: '👩' },
  { id: 'consolidado', name: 'Família', icon: '👪' }
];

// ============= Helpers =============

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatNumber(num) {
  return new Intl.NumberFormat('pt-BR').format(num);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function getProgramById(id) {
  return PROGRAMS.find(p => p.id === id);
}

function getPriceStatus(currentPrice, program) {
  if (!currentPrice || currentPrice <= 0) return { label: 'Sem dados', class: 'badge-info', gauge: 0, gaugeClass: 'good' };
  if (currentPrice <= program.bestPrice * 1.1) return { label: 'Excelente!', class: 'badge-success', gauge: 95, gaugeClass: 'good' };
  if (currentPrice <= program.goodPrice) return { label: 'Bom preço', class: 'badge-success', gauge: 75, gaugeClass: 'good' };
  if (currentPrice <= program.regularPrice * 0.7) return { label: 'Regular', class: 'badge-warning', gauge: 50, gaugeClass: 'medium' };
  return { label: 'Caro', class: 'badge-danger', gauge: 20, gaugeClass: 'bad' };
}

function getMonthName(index) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[index];
}
