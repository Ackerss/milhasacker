/* ============================================
   MILHAS ACKER — Módulo: Configurações & Sincronização
   Interface visual para o controle do Google Sheets
   ============================================ */

function renderSettings() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const apiUrl = SheetsSync.apiUrl || '';
  const isConfigured = SheetsSync.isConfigured();

  container.innerHTML = `
    <div class="card" style="margin-bottom: var(--space-xl);">
      <div class="card-header">
        <div>
          <h2 class="card-title">Configuração do Google Sheets</h2>
          <p class="card-subtitle">Sincronize seus dados com uma planilha do Google Drive</p>
        </div>
      </div>
      
      <div class="settings-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
        <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
          <label for="sheets-api-url" style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary);">URL do Apps Script (Web App):</label>
          <input type="url" id="sheets-api-url" class="price-input" placeholder="https://script.google.com/macros/s/.../exec" value="${apiUrl}" style="width: 100%;">
          <p class="text-muted" style="font-size: 0.75rem;">Cole a URL gerada após implantar o Apps Script como "Aplicativo da Web".</p>
        </div>

        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
          <button id="btn-save-settings" class="btn btn-primary btn-sm">Salvar URL</button>
          <button id="btn-test-connection" class="btn btn-secondary btn-sm" ${!apiUrl ? 'disabled' : ''}>Testar Conexão ⚡</button>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Ações de Sincronização</h3>
            <p class="card-subtitle">Envie ou receba dados da planilha</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div style="background: var(--bg); padding: var(--space-md); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-sm);">
            <div style="font-weight: 600; font-size: 0.875rem;">⬆️ Enviar dados para o Sheets</div>
            <p class="text-muted" style="font-size: 0.75rem; line-height: 1.4;">Isso enviará todo o histórico local, planos e alertas salvos neste navegador para a sua planilha do Google Sheets, substituindo os dados existentes lá.</p>
            <button id="btn-sync-to-sheets" class="btn btn-success btn-sm" ${!isConfigured ? 'disabled' : ''} style="align-self: flex-start;">Sincronizar agora (Exportar)</button>
          </div>

          <div style="background: var(--bg); padding: var(--space-md); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-sm);">
            <div style="font-weight: 600; font-size: 0.875rem;">⬇️ Restaurar dados do Sheets</div>
            <p class="text-muted" style="font-size: 0.75rem; line-height: 1.4;"><strong>Aviso importante:</strong> Isso apagará o histórico e os planos salvos localmente neste navegador e os substituirá pelos dados que estão na sua planilha do Google.</p>
            <button id="btn-import-from-sheets" class="btn btn-danger btn-sm" ${!isConfigured ? 'disabled' : ''} style="align-self: flex-start; border: 1px solid var(--danger);">Restaurar dados (Importar)</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">📖 Como configurar a Planilha</h3>
            <p class="card-subtitle">Passo a passo rápido</p>
          </div>
        </div>
        
        <div style="font-size: 0.8125rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
          <p>1. Crie uma planilha Google vazia no seu Drive.</p>
          <p>2. Clique em <strong>Extensões</strong> no menu e selecione <strong>Apps Script</strong>.</p>
          <p>3. Deleter o código padrão e cole o conteúdo do arquivo <code>google-apps-script/Code.gs</code> do projeto.</p>
          <p>4. Execute a função <code>setupSheets</code> uma vez no editor do script para criar as abas automaticamente.</p>
          <p>5. Clique no botão <strong>Implantar</strong> (canto superior direito) -> <strong>Nova implantação</strong>:</p>
          <ul style="margin-left: var(--space-md); list-style-type: disc;">
            <li>Tipo: <em>Aplicativo da Web</em></li>
            <li>Executar como: <em>Eu (seu e-mail)</em></li>
            <li>Quem tem acesso: <em>Qualquer pessoa</em></li>
          </ul>
          <p>6. Copie a URL gerada e cole no campo acima!</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--space-xl); border-color: var(--danger-bg);">
      <div class="card-header">
        <div>
          <h3 class="card-title" style="color: var(--danger);">Gerenciamento de Dados</h3>
          <p class="card-subtitle">Limpar o sistema para uso real ou carregar demonstração</p>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border);">
          <div style="flex: 1; min-width: 280px;">
            <strong style="font-size: 0.875rem; color: var(--text-primary);">🗑️ Zerar Todos os Dados (Uso Real)</strong>
            <p class="text-muted" style="font-size: 0.8125rem; line-height: 1.4; margin-top: 4px;">Apaga todas as movimentações, planos e alertas cadastrados neste navegador para que você possa iniciar a inserção dos seus dados reais do zero.</p>
          </div>
          <button id="btn-clear-all" class="btn btn-secondary btn-sm" style="color: var(--danger); border-color: var(--danger);">Zerar Todos os Dados</button>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
          <div style="flex: 1; min-width: 280px;">
            <strong style="font-size: 0.875rem; color: var(--text-primary);">📊 Carregar Dados de Demonstração</strong>
            <p class="text-muted" style="font-size: 0.8125rem; line-height: 1.4; margin-top: 4px;">Apaga os dados atuais e carrega movimentações, planos e alertas fictícios para demonstrar o visual do dashboard e gráficos.</p>
          </div>
          <button id="btn-load-demo" class="btn btn-secondary btn-sm">Carregar Demonstração</button>
        </div>
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    const url = document.getElementById('sheets-api-url').value.trim();
    if (!url) {
      showToast('Por favor, insira uma URL válida', 'error');
      return;
    }
    
    // Validar se é uma URL válida
    try {
      new URL(url);
    } catch (_) {
      showToast('Formato de URL inválido', 'error');
      return;
    }

    SheetsSync.setApiUrl(url);
    showToast('Configuração salva com sucesso! ✅');
    renderSettings(); // Redesenhar para atualizar status dos botões
  });

  document.getElementById('btn-test-connection').addEventListener('click', async () => {
    const btn = document.getElementById('btn-test-connection');
    btn.disabled = true;
    btn.textContent = 'Testando... ⏳';

    try {
      const url = SheetsSync.apiUrl;
      // Tenta ler uma das abas principais para testar a comunicação
      const response = await fetch(`${url}?action=read&sheet=Configurações`);
      const result = await response.json();
      
      if (result && result.success) {
        showToast('Conexão estabelecida com sucesso! Planilha ativa. 🚀');
      } else {
        showToast('Erro ao ler a planilha. Verifique se o Apps Script foi implantado corretamente.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Falha na conexão. Verifique a URL ou permissões do Web App.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Testar Conexão ⚡';
    }
  });

  document.getElementById('btn-sync-to-sheets').addEventListener('click', async () => {
    const btn = document.getElementById('btn-sync-to-sheets');
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sincronizando... ⏳';

    try {
      await SheetsSync.syncToSheets();
    } catch (error) {
      console.error(error);
      showToast('Erro ao sincronizar. Verifique o console.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });

  document.getElementById('btn-import-from-sheets').addEventListener('click', () => {
    if (confirm('Atenção: Isso substituirá TODAS as suas movimentações locais pelos dados da planilha do Google. Deseja prosseguir?')) {
      const btn = document.getElementById('btn-import-from-sheets');
      btn.disabled = true;
      btn.textContent = 'Restaurando... ⏳';

      SheetsSync.importFromSheets().finally(() => {
        btn.disabled = false;
        btn.textContent = 'Restaurar dados (Importar)';
      });
    }
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja APAGAR TODOS os seus saldos, planos e históricos locais para começar do zero com dados reais? Esta ação é irreversível.')) {
      AppState.clearAllData();
      showToast('Sistema redefinido com sucesso! Comece seus lançamentos reais.', 'success');
      setTimeout(() => {
        location.reload();
      }, 1200);
    }
  });

  document.getElementById('btn-load-demo').addEventListener('click', () => {
    if (confirm('Isso apagará todos os dados locais atuais e carregará os dados fictícios de demonstração. Deseja continuar?')) {
      AppState.loadDemoData();
      showToast('Dados de demonstração carregados com sucesso!', 'info');
      setTimeout(() => {
        location.reload();
      }, 1200);
    }
  });
}
