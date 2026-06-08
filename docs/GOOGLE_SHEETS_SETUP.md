# 🔗 Setup do Google Sheets — Milhas Acker

## Informações da Planilha

- **URL:** https://docs.google.com/spreadsheets/d/1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM/
- **ID:** `1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM`

## Abas Necessárias

A planilha precisa ter estas abas com estes headers:

### 1. Saldos
| Pessoa | Programa | Saldo | Última Atualização |
|--------|----------|-------|--------------------|

### 2. Planos
| ID | Pessoa | Nome | Programa | Valor Mensal | Pontos/Mês | Data Início | Data Fim | Status |
|----|--------|------|----------|--------------|------------|-------------|----------|--------|

### 3. Histórico
| ID | Data | Pessoa | Programa | Tipo | Quantidade | CPM | Observação | Criado Em |
|----|------|--------|----------|------|------------|-----|------------|-----------|

### 4. Alertas
| ID | Título | Descrição | Programa | Data Início | Data Fim | Ativo |
|----|--------|-----------|----------|-------------|----------|-------|

### 5. PreçosAtuais
| Programa | Preço Atual | Data Atualização |
|----------|-------------|------------------|

### 6. Calendário
| Mês | Rating | Destaque1 | Destaque2 | Destaque3 | Dica |
|-----|--------|-----------|-----------|-----------|------|

### 7. Configurações
| Chave | Valor |
|-------|-------|

## Como Configurar o Apps Script

1. Abra a planilha no Google Sheets
2. Menu → **Extensões** → **Apps Script**
3. Delete o conteúdo padrão
4. Cole o conteúdo do arquivo `google-apps-script/Code.gs`
5. No script, o `SPREADSHEET_ID` já está configurado: `1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM`
6. Execute a função **`setupSheets()`** uma vez (cria as abas e headers)
7. Menu → **Implantar** → **Nova implantação**
   - Tipo: **Aplicativo da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
8. Clique **Implantar** e copie a URL

## Conectar ao Sistema Web

No console do navegador (F12), execute:
```javascript
SheetsSync.setApiUrl('COLE_A_URL_DO_APPS_SCRIPT_AQUI');
```

## Sincronizar Dados

### Exportar (localStorage → Sheets)
```javascript
SheetsSync.syncToSheets();
```

### Importar (Sheets → localStorage)
```javascript
SheetsSync.importFromSheets();
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Acesso negado" | Verifique se o Web App está com acesso "Qualquer pessoa" |
| Dados não aparecem | Execute `setupSheets()` novamente no Apps Script |
| CORS error | O Apps Script já lida com CORS automaticamente via doGet/doPost |
| Dados duplicados | Use `replaceSheet` ao invés de `appendRow` para sync completo |
