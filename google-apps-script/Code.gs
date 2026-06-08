/* ============================================
   MILHAS ACKER — Google Apps Script
   API REST para Google Sheets
   
   COMO USAR:
   1. Crie uma planilha Google com as abas:
      - Saldos, Planos, Histórico, Alertas, PreçosAtuais, Configurações
   2. Abra: Extensões → Apps Script
   3. Cole este código no editor
   4. Deploy → Nova implantação → Webapp
   5. Acesso: "Qualquer pessoa"
   6. Copie a URL e cole no sistema (aba Configurações)
   ============================================ */

// ID da planilha (substitua pelo seu)
const SPREADSHEET_ID = '1MOQe9pk1RH46rDdzoQcetyY5F8VwPcHjW-IqWBtU7cM';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ============= API: GET =============
function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheet = e.parameter.sheet;

    if (action === 'read' && sheet) {
      const data = readSheet(sheet);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'readAll') {
      const result = {};
      ['Saldos', 'Planos', 'Histórico', 'Alertas', 'PreçosAtuais'].forEach(name => {
        result[name] = readSheet(name);
      });
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Ação inválida' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============= API: POST =============
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, sheet: sheetName, data } = body;

    if (action === 'append' && sheetName && data) {
      appendRow(sheetName, data);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'replace' && sheetName && data) {
      replaceSheet(sheetName, data);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete' && sheetName && body.rowIndex) {
      deleteRow(sheetName, body.rowIndex);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Ação inválida' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============= Helpers =============

function readSheet(name) {
  const sheet = getSheet(name);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    rows.push(row);
  }
  return rows;
}

function appendRow(name, rowData) {
  const sheet = getSheet(name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
    // Create headers from data keys
    const keys = Object.keys(rowData);
    sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    const values = keys.map(k => rowData[k] || '');
    sheet.appendRow(values);
  } else {
    const values = headers.map(h => rowData[h] || '');
    sheet.appendRow(values);
  }
}

function replaceSheet(name, dataArray) {
  const sheet = getSheet(name);
  sheet.clearContents();

  if (dataArray.length === 0) return;

  const headers = Object.keys(dataArray[0]);
  const values = [headers];
  dataArray.forEach(row => {
    values.push(headers.map(h => row[h] || ''));
  });

  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
}

function deleteRow(name, rowIndex) {
  const sheet = getSheet(name);
  // rowIndex is 1-based, add 1 for header
  sheet.deleteRow(rowIndex + 1);
}

// ============= Setup =============
// Execute esta função uma vez para criar as abas
function setupSheets() {
  const sheets = {
    'Saldos': ['Pessoa', 'Programa', 'Saldo', 'Última Atualização'],
    'Planos': ['ID', 'Pessoa', 'Nome', 'Programa', 'Valor Mensal', 'Pontos/Mês', 'Data Início', 'Data Fim', 'Status'],
    'Histórico': ['ID', 'Data', 'Pessoa', 'Programa', 'Tipo', 'Quantidade', 'CPM', 'Observação', 'Criado Em'],
    'Alertas': ['ID', 'Título', 'Descrição', 'Programa', 'Data Início', 'Data Fim', 'Ativo'],
    'PreçosAtuais': ['Programa', 'Preço Atual', 'Data Atualização'],
    'Configurações': ['Chave', 'Valor']
  };

  const ss = getSpreadsheet();
  
  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    // Set headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });

  Logger.log('Planilha configurada com sucesso!');
}
