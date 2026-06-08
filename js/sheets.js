/* ============================================
   MILHAS ACKER — Módulo: Google Sheets Sync
   Integração opcional com Google Sheets
   ============================================ */

const SheetsSync = {
  // URL do Web App do Google Apps Script
  // Configurar em: Dashboard → ⚙️ Configurações
  apiUrl: localStorage.getItem('milhas_sheets_url') || '',

  isConfigured() {
    return !!this.apiUrl;
  },

  setApiUrl(url) {
    this.apiUrl = url;
    localStorage.setItem('milhas_sheets_url', url);
  },

  // ============= Leitura =============
  async readAll() {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.apiUrl}?action=readAll`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      console.error('Sheets API error:', result.error);
      return null;
    } catch (error) {
      console.error('Sheets fetch error:', error);
      return null;
    }
  },

  async readSheet(sheetName) {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.apiUrl}?action=read&sheet=${encodeURIComponent(sheetName)}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Sheets fetch error:', error);
      return null;
    }
  },

  // ============= Escrita =============
  async appendRow(sheetName, data) {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'append', sheet: sheetName, data })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Sheets write error:', error);
      return false;
    }
  },

  async replaceSheet(sheetName, dataArray) {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'replace', sheet: sheetName, data: dataArray })
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Sheets write error:', error);
      return false;
    }
  },

  // ============= Sync (localStorage → Sheets) =============
  async syncToSheets() {
    if (!this.isConfigured()) {
      showToast('Configure a URL do Google Sheets primeiro', 'error');
      return;
    }

    try {
      showToast('Sincronizando com Google Sheets...', 'info');

      // Sync history
      const history = AppState.getHistory().map(h => ({
        ID: h.id,
        Data: h.date,
        Pessoa: h.userId,
        Programa: h.programId,
        Tipo: h.type,
        Quantidade: h.quantity,
        CPM: h.cpm || 0,
        'Observação': h.note || '',
        'Criado Em': h.createdAt || ''
      }));
      await this.replaceSheet('Histórico', history);

      // Sync plans
      const plans = AppState.getPlans().map(p => ({
        ID: p.id,
        Pessoa: p.userId,
        Nome: p.name,
        Programa: p.programId,
        'Valor Mensal': p.monthlyValue,
        'Pontos/Mês': p.monthlyPoints,
        'Data Início': p.startDate,
        'Data Fim': p.endDate || '',
        Status: p.status
      }));
      await this.replaceSheet('Planos', plans);

      // Sync alerts
      const alerts = AppState.getAlerts().map(a => ({
        ID: a.id,
        'Título': a.title,
        'Descrição': a.description || '',
        Programa: a.programId || '',
        'Data Início': a.startDate || '',
        'Data Fim': a.endDate || '',
        Ativo: a.active ? 'Sim' : 'Não'
      }));
      await this.replaceSheet('Alertas', alerts);

      // Sync current prices
      const prices = AppState.getCurrentPrices();
      const priceRows = Object.entries(prices).map(([programId, data]) => ({
        Programa: programId,
        'Preço Atual': data.price,
        'Data Atualização': data.date
      }));
      await this.replaceSheet('PreçosAtuais', priceRows);

      showToast('Sincronização concluída com sucesso! ✅');
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Erro na sincronização. Verifique o console.', 'error');
    }
  },

  // ============= Import (Sheets → localStorage) =============
  async importFromSheets() {
    if (!this.isConfigured()) {
      showToast('Configure a URL do Google Sheets primeiro', 'error');
      return;
    }

    try {
      showToast('Importando dados do Google Sheets...', 'info');

      const allData = await this.readAll();
      if (!allData) {
        showToast('Erro ao ler dados do Sheets', 'error');
        return;
      }

      // Import history
      if (allData['Histórico'] && allData['Histórico'].length > 0) {
        const history = allData['Histórico'].map(row => ({
          id: row.ID || Date.now().toString(36),
          date: row.Data,
          userId: row.Pessoa,
          programId: row.Programa,
          type: row.Tipo,
          quantity: parseInt(row.Quantidade) || 0,
          cpm: parseFloat(row.CPM) || 0,
          note: row['Observação'] || '',
          createdAt: row['Criado Em'] || ''
        }));
        localStorage.setItem(AppState.KEYS.HISTORY, JSON.stringify(history));
      }

      // Import plans
      if (allData['Planos'] && allData['Planos'].length > 0) {
        const plans = allData['Planos'].map(row => ({
          id: row.ID || Date.now().toString(36),
          userId: row.Pessoa,
          name: row.Nome,
          programId: row.Programa,
          monthlyValue: parseFloat(row['Valor Mensal']) || 0,
          monthlyPoints: parseInt(row['Pontos/Mês']) || 0,
          startDate: row['Data Início'],
          endDate: row['Data Fim'],
          status: row.Status
        }));
        AppState.savePlans(plans);
      }

      // Import alerts
      if (allData['Alertas'] && allData['Alertas'].length > 0) {
        const alerts = allData['Alertas'].map(row => ({
          id: row.ID || Date.now().toString(36),
          title: row['Título'],
          description: row['Descrição'] || '',
          programId: row.Programa || '',
          startDate: row['Data Início'],
          endDate: row['Data Fim'],
          active: row.Ativo === 'Sim'
        }));
        AppState.saveAlerts(alerts);
      }

      showToast('Importação concluída! Recarregando...', 'success');
      setTimeout(() => location.reload(), 1500);
    } catch (error) {
      console.error('Import error:', error);
      showToast('Erro na importação. Verifique o console.', 'error');
    }
  }
};
