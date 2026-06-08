# 📊 Fontes de Dados — Milhas Acker

## Preços por Milheiro

### Fontes Primárias (Confiáveis)

| Fonte | URL | O que tem |
|-------|-----|-----------|
| Melhores Destinos | melhoresdestinos.com.br | Referência #1 do mercado BR. Alertas de promoções, análises de preços, comparativos |
| Melhores Cartões | melhorescartoes.com.br | Especializado em cartões e pontos. Calendário de promoções, calculadoras |
| Pontos Pra Voar | pontospravoar.com | Análises detalhadas de promoções, regulamentos, estratégias |
| Mobills | mobills.com.br | Calendário de aniversários dos programas, guias de milhas |
| Farejador de Milhas | farejadordemilhas.com.br | Comparador de preços, alertas |

### Fontes Secundárias

| Fonte | URL | O que tem |
|-------|-----|-----------|
| Passageiro de Primeira | passageirodeprimeira.com | Blog premium, análises de classe executiva |
| Alta Renda Blog | altarendablog.com | Estratégias avançadas de acúmulo |
| Cartões de Crédito.me | cartoesdecredito.me | Comparador de cartões, guias |
| Tico Brasileiro | ticobrasileiro.com | Reviews e estratégias |

---

## Preços de Referência (Validados Jun/2026)

### Programas Aéreos

| Programa | Melhor CPM | CPM Bom | CPM Regular | Como conseguir o melhor preço |
|----------|-----------|---------|-------------|-------------------------------|
| **Azul Fidelidade** | R$ 9,00 | R$ 13,00 | R$ 70,00 | Clube Azul + bônus transferência Livelo 100% |
| **Smiles** | R$ 14,00 | R$ 16,00 | R$ 80,00 | Livelo + bônus Orange Friday 100% |
| **Latam Pass** | R$ 20,00 | R$ 25,00 | R$ 70,00 | Livelo + bônus 30-40% (raramente > 40%) |
| **TAP Miles&Go** | R$ 40,00 | R$ 44,00 | R$ 60,00 | Compra direta. ⚠️ Desvalorizado em 2026 |
| **AAdvantage** | R$ 120,00 | R$ 140,00 | R$ 200,00 | Compra no site AA em USD (~US$22,50 c/ desc) |

### Programas de Pontos (Intermediários)

| Programa | Melhor CPM | CPM Bom | CPM Regular | Como conseguir o melhor preço |
|----------|-----------|---------|-------------|-------------------------------|
| **Livelo** | R$ 25,00 | R$ 30,00 | R$ 70,00 | Compra c/ 50-57% desconto (Aniversário/Black Friday) |
| **Esfera** | R$ 31,00 | R$ 35,00 | R$ 70,00 | Clube Esfera + desconto 50-55% |

> **IMPORTANTE:** O valor real de Livelo/Esfera depende de PARA ONDE você transfere e com QUAL bônus.
> Ex: Livelo a R$25 + transferência com 100% bônus para Azul = CPM final ~R$12,50

---

## Calendário de Promoções

### Aniversários dos Programas (Meses confirmados)

| Programa | Mês | Fonte |
|----------|-----|-------|
| GOL/Smiles fundação | Janeiro (15) | Mobills |
| Clube Azul | Janeiro (16) | Pontos Pra Voar |
| TAP | Março (14) | Mobills |
| American Airlines | Abril (15) | Mobills |
| Clube Esfera | Abril (2026) / Setembro (tradicional) | Melhores Cartões |
| Livelo | Junho (3) | Livelo.com.br |
| LATAM Airlines | Junho (22) | Mobills |
| Azul Fidelidade | Agosto (30) / Setembro (15) | Melhores Destinos |
| Itaú | Setembro (27) | Mobills |
| LATAM Pass | Setembro (30) | Liberfly |
| Smiles (celebração) | Outubro (18) | Melhores Destinos |
| BB | Outubro (12) | Mobills |

### Meses-Chave

| Rating | Meses |
|--------|-------|
| 🔥🔥 MELHOR | **Novembro** (Black Friday + Orange Friday) |
| 🔥 Imperdível | **Junho** (Aniv. Livelo), **Setembro** (multi-aniversários), **Outubro** (Aniv. Smiles) |
| ⭐ Bom | Janeiro, Março, Abril, Agosto, Dezembro |
| 😐 Fraco | Fevereiro, Maio, Julho |

---

## Estratégias de Compra Combinada

### A "Regra de Ouro" (consenso do mercado):
> **NUNCA transfira pontos sem promoção de bônus**
> **NUNCA compre milhas pelo preço cheio (~R$70-80/milheiro)**

### Melhores Combos

| Estratégia | CPM Final | Passo a passo |
|-----------|-----------|---------------|
| Livelo → Azul c/ 100% bônus | ~R$ 11-13 | 1. Compre Livelo a ~R$25 (desconto) 2. Aguarde bônus 100% 3. Transfira |
| Livelo → Smiles c/ 100% bônus | ~R$ 14-15 | 1. Compre Livelo 2. Aguarde Orange Friday 3. Transfira |
| Livelo → LATAM c/ 30% bônus | ~R$ 20-22 | 1. Compre Livelo 2. Aguarde bônus 30% 3. Transfira |

---

## Como Atualizar os Dados

### Preços
1. Pesquise nos sites de referência acima
2. Edite `js/data.js` → constante `PROGRAMS`
3. Campos: `bestPrice`, `goodPrice`, `regularPrice`
4. Atualize `DATA_SOURCES.lastUpdated`

### Calendário
1. Edite `js/data.js` → constante `PROMO_CALENDAR`
2. Cada mês: `highlights` (array), `tip` (string), `rating`, `heat` (1-5)

### Preço Atual (pelo usuário)
- O usuário pode editar na aba "Tabela de Preços" do sistema
- Salva automaticamente em localStorage

---

## ⚠️ Notas Importantes (Jun/2026)

1. **TudoAzul = Azul Fidelidade** — renomeado em abril/2024, mesmo programa
2. **TAP Miles&Go desvalorizado** — reajuste de tabela fixa em maio/2026, perdeu parceria Livelo
3. **Azul em recuperação judicial** — acompanhar impacto no programa de fidelidade
4. **AAdvantage é em dólar** — custo varia com câmbio, geralmente não vale para BR
5. **Milhas bônus de promoção** costumam ter validade de 12 meses
6. **Cadastro prévio (opt-in)** é obrigatório na maioria das promoções de transferência bonificada
