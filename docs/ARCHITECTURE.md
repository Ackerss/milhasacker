# 🏗️ Arquitetura — Milhas Acker

## Visão Geral

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Browser    │────▶│   index.html     │────▶│   localStorage   │
│              │     │   (SPA)          │     │   (dados locais) │
└──────────────┘     └───────┬──────────┘     └──────────────────┘
                             │                         ▲
                             │ fetch (opcional)         │ sync
                             ▼                         │
                     ┌──────────────────┐     ┌──────────────────┐
                     │  Google Apps     │────▶│  Google Sheets    │
                     │  Script (API)   │     │  (backup/sync)   │
                     └──────────────────┘     └──────────────────┘
```

## Padrão SPA

O sistema é uma Single Page Application com navegação por abas:

1. `index.html` contém ALL sections (escondidas com `display:none`)
2. `app.js` gerencia qual section está visível (`active` class)
3. Cada módulo JS renderiza seu conteúdo via `innerHTML`
4. Não há roteamento por URL (hash ou pushState) — é toggle de classes

### Fluxo de Navegação
```
Clique nav-item → navigateTo(viewId) → 
  1. Atualiza classe active no nav
  2. Atualiza classe active na section
  3. Atualiza header title
  4. Chama refreshView(viewId)
  5. Módulo re-renderiza conteúdo
```

## Gerenciamento de Estado

### AppState (Singleton)
```javascript
AppState = {
  activeView: 'dashboard',    // view atual
  activeUser: 'jacson',       // usuário ativo (jacson | ana)
  
  // CRUD via localStorage
  getHistory() → array
  addHistory(entry) → entry com id
  getBalance(userId, programId) → number (calculado do histórico)
  getPlans() / addPlan() / removePlan()
  getAlerts() / addAlert() / removeAlert()
  getCurrentPrices() / setCurrentPrice()
}
```

### Fluxo de Dados
```
Ação do usuário
  → Salva em localStorage (via AppState)
  → Re-renderiza view atual (via refreshView)
  → UI atualiza
```

### Cálculo de Saldo
O saldo NÃO é stored — é CALCULADO:
```javascript
getBalance(userId, programId) {
  let balance = 0;
  history.forEach(entry => {
    if (entry matches user+program) {
      if (tipo positivo) balance += quantity;
      if (tipo negativo) balance -= quantity;
    }
  });
  return Math.max(0, balance);
}
```

## Módulos

Cada módulo é um arquivo JS independente com uma função `render*()`:

| Arquivo | Função principal | Dependências |
|---------|-----------------|--------------|
| dashboard.js | `renderDashboard()` | Chart.js, AppState |
| calendar.js | `renderCalendar()` | PROMO_CALENDAR (data.js) |
| prices.js | `renderPrices()` | PROGRAMS (data.js), AppState.getCurrentPrices() |
| balance.js | `renderBalance()` | AppState (CRUD history) |
| plans.js | `renderPlans()` | AppState (CRUD plans) |
| simulator.js | `renderSimulator()` | PROGRAMS, AppState.getCurrentPrices() |
| alerts.js | `renderAlerts()` | AppState (CRUD alerts) |

## Ordem de Carregamento dos Scripts

```html
<!-- ORDEM IMPORTA! -->
<script src="js/data.js"></script>      <!-- 1. Dados estáticos (PROGRAMS, etc) -->
<script src="js/app.js"></script>       <!-- 2. Core (AppState, navegação) -->
<script src="js/dashboard.js"></script> <!-- 3+ Módulos (qualquer ordem entre si) -->
<script src="js/calendar.js"></script>
<script src="js/prices.js"></script>
<script src="js/balance.js"></script>
<script src="js/plans.js"></script>
<script src="js/simulator.js"></script>
<script src="js/alerts.js"></script>
<script src="js/sheets.js"></script>    <!-- Último: depende de AppState -->
```

## Design System (CSS)

### Variáveis CSS Principais
- `--primary`: #4361EE (azul principal)
- `--success` / `--warning` / `--danger`: semânticas
- `--bg`: #F5F6FA (fundo)
- `--surface`: #FFFFFF (cards)
- `--color-{programa}`: cor de cada programa de milhas
- `--shadow-*`: sombras escaláveis
- `--radius-*`: border-radius padronizados
- `--space-*`: espaçamentos

### Layout
- Sidebar: 260px fixo à esquerda
- Content: flex-grow à direita
- Header: sticky top 64px
- Max-width content: 1400px
- Breakpoints: 1024px, 768px, 480px

## Google Sheets Integration

### Arquitetura
```
Frontend (sheets.js)
  └─ fetch() ──▶ Google Apps Script (Code.gs)
                    └─ SpreadsheetApp ──▶ Google Sheets
```

### Sync é MANUAL
- Não há sync automático
- Usuário chama `SheetsSync.syncToSheets()` ou `SheetsSync.importFromSheets()`
- Futuro: botão na UI ou auto-sync periódico
