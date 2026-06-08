# ✈️ Milhas Acker — Sistema de Controle de Milhas

Sistema web completo para controle e gestão de milhas aéreas, desenvolvido para Jacson e Ana.

## 🚀 Como Usar

### Opção 1: Abrir localmente
Basta abrir o arquivo `index.html` no navegador. O sistema funciona 100% offline com localStorage.

### Opção 2: GitHub Pages
1. Faça upload deste repositório no GitHub
2. Vá em Settings → Pages → Source: main → Save
3. Acesse em `https://seuusuario.github.io/milhas-acker/`

## 📦 Módulos

| Módulo | Descrição |
|--------|-----------|
| **📊 Dashboard** | Visão geral com gráficos, stats e movimentações recentes |
| **📅 Calendário** | Meses com melhores promoções de cada programa (padrões históricos) |
| **💰 Tabela de Preços** | Comparativo de CPM por programa com preço editável |
| **🔢 Simulador** | Calcula custo de X milhas em cada programa |
| **✈️ Controle de Saldo** | Saldo por programa (Jacson/Ana) com CRUD de movimentações |
| **📋 Planos Ativos** | Assinaturas e clubes com cálculo de CPM |
| **🔔 Alertas** | Promoções ativas com countdown |

## 🏗️ Tecnologias

- **Frontend:** HTML5, CSS3 (Custom Properties), JavaScript ES6+
- **Gráficos:** Chart.js 4.x (CDN)
- **Fonte:** Inter (Google Fonts)
- **Armazenamento:** localStorage (offline) + Google Sheets (opcional)

## 📊 Dados de Referência

Os preços de referência e calendário de promoções são baseados em:
- [Melhores Destinos](https://www.melhoresdestinos.com.br)
- [Melhores Cartões](https://www.melhorescartoes.com.br)
- [Pontos Pra Voar](https://www.pontospravoar.com)
- [Mobills](https://www.mobills.com.br)
- [Farejador de Milhas](https://www.farejadordemilhas.com.br)

**⚠️ Os valores são referências de mercado e flutuam conforme promoções. Sempre verifique os preços atuais antes de comprar.**

## 🔗 Integração com Google Sheets (Opcional)

### Passo a passo:
1. **Crie uma planilha** no Google Sheets
2. **Abra o Apps Script:** Menu → Extensões → Apps Script
3. **Cole o código** do arquivo `google-apps-script/Code.gs`
4. **Execute `setupSheets()`** para criar as abas
5. **Deploy:** Nova implantação → Web App → Acesso: Qualquer pessoa
6. **Copie a URL** do deploy
7. **No sistema:** Use `SheetsSync.setApiUrl('SUA_URL')` no console do navegador

### Sincronização:
- **Exportar para Sheets:** `SheetsSync.syncToSheets()` no console
- **Importar do Sheets:** `SheetsSync.importFromSheets()` no console

## 📁 Estrutura de Arquivos

```
MILHAS ACKER/
├── index.html              # Página principal (SPA)
├── css/
│   └── styles.css          # Design system
├── js/
│   ├── data.js             # Dados estáticos de referência
│   ├── app.js              # Core: navegação, estado, localStorage
│   ├── dashboard.js        # Módulo: Dashboard
│   ├── calendar.js         # Módulo: Calendário
│   ├── prices.js           # Módulo: Tabela de Preços
│   ├── balance.js          # Módulo: Controle de Saldo
│   ├── plans.js            # Módulo: Planos Ativos
│   ├── simulator.js        # Módulo: Simulador
│   ├── alerts.js           # Módulo: Alertas
│   └── sheets.js           # Integração Google Sheets
├── google-apps-script/
│   └── Code.gs             # Script para Google Sheets
└── README.md
```

## 🔄 Implementação Futura

- [ ] Busca automática de preços (scraping ou API)
- [ ] Notificações push de promoções
- [ ] Comparador de passagens (custo em milhas vs dinheiro)
- [ ] Histórico de preços com gráfico temporal
- [ ] Export PDF de relatórios

## 📝 Licença

Uso pessoal — Jacson & Ana Acker.
