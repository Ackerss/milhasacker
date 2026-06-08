# 📖 AGENTS.md — Guia Completo para IAs Futuras

> **Este documento contém TUDO que qualquer IA precisa saber para trabalhar neste projeto.**
> Leia este arquivo INTEIRO antes de fazer qualquer alteração.

---

## 🎯 Visão Geral do Projeto

**Milhas Acker** é um sistema web de controle pessoal de milhas aéreas para **Jacson** e **Ana** (casal).

### O que o sistema faz:
1. **Calendário de Promoções** — mostra os melhores meses para comprar/transferir milhas de cada programa
2. **Tabela de Preços** — referência de melhor preço histórico por milheiro de cada programa
3. **Controle de Saldo** — saldo de milhas de Jacson e Ana em cada programa
4. **Planos Ativos** — assinaturas de clubes de milhas (Clube Livelo, Clube Smiles, etc.)
5. **Simulador de Compra** — calcula custo de X milhas em cada programa
6. **Dashboard** — gráficos de distribuição e evolução
7. **Alertas** — promoções ativas com countdown

### Usuários do sistema:
- **Jacson** (CPF dele) — usuário principal
- **Ana** (esposa) — segunda conta

---

## 🏗️ Arquitetura

### Stack
- **HTML5 + CSS3 + JavaScript ES6+** — SPA puro, sem framework
- **Chart.js 4.x** — gráficos (CDN)
- **Google Fonts (Inter)** — tipografia
- **localStorage** — armazenamento principal (funciona offline)
- **Google Sheets + Apps Script** — backup/sync opcional

### Hosting
- **GitHub Pages** — https://ackerss.github.io/milhasacker/
- **Repositório:** https://github.com/Ackerss/milhasacker

### Google Sheets
- **Planilha:** https://docs.google.com/spreadsheets/d/1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM/
- **ID da planilha:** `1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM`
- **Abas:** Saldos, Planos, Histórico, Alertas, PreçosAtuais, Calendário, Configurações

---

## 📁 Estrutura de Arquivos

```
MILHAS ACKER/
├── index.html                    # Página principal (SPA)
├── css/
│   └── styles.css                # Design system completo (light mode premium)
├── js/
│   ├── data.js                   # ⭐ DADOS DE REFERÊNCIA — preços, calendário, programas
│   ├── app.js                    # Core: estado global (AppState), navegação, localStorage, modais
│   ├── dashboard.js              # Módulo: Dashboard com Chart.js
│   ├── calendar.js               # Módulo: Calendário de promoções
│   ├── prices.js                 # Módulo: Tabela comparativa de preços
│   ├── balance.js                # Módulo: Controle de saldo + CRUD movimentações
│   ├── plans.js                  # Módulo: Planos/assinaturas ativos
│   ├── simulator.js              # Módulo: Simulador de compra
│   ├── alerts.js                 # Módulo: Alertas de promoções
│   └── sheets.js                 # Integração Google Sheets (sync bidirecional)
├── google-apps-script/
│   └── Code.gs                   # API REST Google Apps Script (copiar para a planilha)
├── docs/
│   ├── ARCHITECTURE.md           # Detalhes de arquitetura
│   ├── DATA_SOURCES.md           # Fontes de dados e como atualizar
│   └── GOOGLE_SHEETS_SETUP.md    # Setup completo do Google Sheets
├── AGENTS.md                     # 👈 ESTE ARQUIVO — guia para IAs
├── README.md                     # Documentação do usuário
└── .gitignore
```

---

## 🔑 Conceitos Chave

### Programas de Milhas Suportados
| ID | Nome | Tipo | Cor |
|----|------|------|-----|
| `latam` | Latam Pass | Aérea | #ED1C24 |
| `smiles` | Smiles (GOL) | Aérea | #FF6600 |
| `azul` | Azul Fidelidade | Aérea | #2D58A7 |
| `livelo` | Livelo | Pontos (intermediário) | #6B2D8B |
| `esfera` | Esfera (Santander) | Pontos (intermediário) | #C4A000 |
| `aadvantage` | AAdvantage (AA) | Aérea | #0078D2 |
| `tap` | TAP Miles&Go | Aérea | #00694D |

> ⚠️ **TudoAzul foi renomeado para Azul Fidelidade em abril/2024.** São o mesmo programa.

### CPM (Custo por Milheiro)
É a métrica principal. Fórmula: `(valor_pago / quantidade_milhas) × 1000`
- **Menor CPM = melhor negócio**
- Exemplo: Pagar R$160 por 10.000 milhas = CPM R$16,00

### Tipos de Movimentação
| ID | Label | Efeito no saldo |
|----|-------|----------------|
| `compra` | Compra | ➕ Soma |
| `transferencia_entrada` | Transferência (Entrada) | ➕ Soma |
| `transferencia_saida` | Transferência (Saída) | ➖ Subtrai |
| `bonus` | Bônus | ➕ Soma |
| `uso` | Uso (Emissão) | ➖ Subtrai |
| `expiracao` | Expiração | ➖ Subtrai |
| `clube` | Crédito Clube | ➕ Soma |
| `cartao` | Crédito Cartão | ➕ Soma |

---

## 💾 Estado e Dados

### localStorage Keys
| Key | Conteúdo | Tipo |
|-----|----------|------|
| `milhas_history` | Array de movimentações | JSON |
| `milhas_plans` | Array de planos/assinaturas | JSON |
| `milhas_alerts` | Array de alertas | JSON |
| `milhas_current_prices` | Preços atuais por programa | JSON |
| `milhas_active_user` | ID do usuário ativo | String |
| `milhas_seeded` | Flag de seed inicial | String |
| `milhas_sheets_url` | URL do Apps Script (sync) | String |

### AppState (js/app.js)
O `AppState` é o gerenciador central. Todos os módulos usam ele para ler/escrever dados:
- `AppState.getBalance(userId, programId)` — calcula saldo a partir do histórico
- `AppState.addHistory(entry)` — adiciona movimentação
- `AppState.getPlans()` / `AppState.addPlan()` — CRUD planos
- `AppState.getAlerts()` / `AppState.addAlert()` — CRUD alertas
- `AppState.getCurrentPrices()` / `AppState.setCurrentPrice()` — preços atuais

### O saldo NÃO é armazenado diretamente
O saldo é **calculado** a partir do histórico de movimentações. Isso garante consistência.

---

## 🎨 Design

### Regras visuais
- **SEMPRE light mode** — o usuário NÃO quer dark mode
- Paleta: azul vibrante (#4361EE) + cores semânticas (verde=bom, amarelo=atenção, vermelho=ruim)
- Font: Inter (Google Fonts)
- Cards com `border-radius: 16px` e `box-shadow` suaves
- Micro-animações em hover (translateY, shadow)
- Sidebar fixa à esquerda com navegação
- Responsivo (mobile: sidebar colapsável)

### CSS Custom Properties
Todas definidas em `:root` no `styles.css`. SEMPRE use variáveis, nunca cores hardcoded.

---

## 📊 Dados de Referência

### Fontes Confiáveis
- **Melhores Destinos** (melhoresdestinos.com.br) — referência #1 do mercado
- **Melhores Cartões** (melhorescartoes.com.br) — especializado em pontos/cartões
- **Pontos Pra Voar** (pontospravoar.com) — análises detalhadas
- **Mobills** (mobills.com.br) — calendário de aniversários
- **Farejador de Milhas** (farejadordemilhas.com.br) — comparador

### Como Atualizar Preços
1. Edite `js/data.js` → array `PROGRAMS` → campos `bestPrice`, `goodPrice`, `regularPrice`
2. OU o usuário edita pelo sistema na aba "Tabela de Preços" (preço atual)

### Como Atualizar Calendário
1. Edite `js/data.js` → array `PROMO_CALENDAR`
2. Cada mês tem `highlights` (array de promoções) e `tip` (dica textual)

---

## 🔄 Google Sheets Integration

### Como funciona
1. `google-apps-script/Code.gs` é copiado para o Apps Script da planilha
2. Deploy como Web App → gera URL
3. `js/sheets.js` usa essa URL para GET/POST dados
4. Sync é **manual** (não automático) — via console ou botão futuro

### Spreadsheet ID
```
1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM
```

### Apps Script API
- `GET ?action=readAll` — lê todas as abas
- `GET ?action=read&sheet=NomeDaAba` — lê uma aba específica
- `POST { action: 'append', sheet: '...', data: {...} }` — adiciona linha
- `POST { action: 'replace', sheet: '...', data: [...] }` — substitui aba inteira

---

## 🚀 Deploy

### GitHub Pages
O site roda em GitHub Pages a partir da branch `main`:
- URL: `https://ackerss.github.io/milhasacker/`
- Sem build necessário (HTML/CSS/JS puro)

### Para fazer deploy:
```bash
git add .
git commit -m "descrição"
git push origin main
```
GitHub Pages atualiza automaticamente.

---

## 📋 Implementação Futura Planejada

### Busca Automática de Preços
- **Objetivo:** Atualizar preços atuais automaticamente (diário/semanal)
- **Opções discutidas:**
  1. GitHub Actions com scraping
  2. Google Apps Script com timer (trigger)
  3. API de comunidades de milhas
- **Status:** Não implementado — pendente decisão do usuário

### Outras ideias (backlog):
- Notificações push de promoções
- Comparador passagem milhas vs dinheiro
- Gráfico temporal de preços históricos
- Export PDF de relatórios
- PWA (Progressive Web App) para instalar no celular

---

## ⚠️ Regras Importantes para IAs

1. **NUNCA** mude para dark mode — o usuário explicitamente não quer
2. **NUNCA** mude de HTML/CSS/JS puro para framework — decisão de design consciente
3. **SEMPRE** valide preços de milhas com fontes confiáveis antes de atualizar
4. **SEMPRE** mantenha o cálculo de saldo baseado no histórico (não armazenar saldo direto)
5. **SEMPRE** use variáveis CSS, nunca cores hardcoded
6. O sistema deve funcionar **100% offline** (localStorage) — Google Sheets é OPCIONAL
7. Respostas para o usuário devem ser em **português do Brasil**
8. Os dois usuários são **Jacson** (id: `jacson`) e **Ana** (id: `ana`)
