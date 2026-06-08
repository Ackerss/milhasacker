/* ============================================
   MILHAS ACKER — Módulo: Controle de Saldo
   Cards de saldo + CRUD movimentações
   ============================================ */

let editingMovementId = null;

function renderBalance() {
  const container = document.getElementById('balance-content');
  if (!container) return;

  const userId = AppState.activeUser;
  const user = USERS_LIST.find(u => u.id === userId);
  let totalMiles = 0;

  const programCards = PROGRAMS.map(p => {
    const balance = AppState.getBalance(userId, p.id);
    totalMiles += balance;
    
    // Get last movement date
    const lastMove = AppState.getHistory().find(h => (userId === 'consolidado' ? true : h.userId === userId) && h.programId === p.id);
    
    return { program: p, balance, lastMove };
  });

  container.innerHTML = `
    <div class="stats-row mb-xl">
      <div class="stat-card">
        <div class="stat-card-icon blue">✈️</div>
        <div class="stat-card-value">${formatNumber(totalMiles)}</div>
        <div class="stat-card-label">Total de Milhas/Pontos — ${user?.name || 'Geral'}</div>
      </div>
    </div>

    <div class="flex justify-between items-center mb-lg" style="gap: var(--space-xs); flex-wrap: wrap;">
      <h3 style="font-size:1rem; font-weight:600;">Saldo por Programa</h3>
      <div style="display: flex; gap: var(--space-xs);">
        <button class="btn btn-secondary btn-sm" onclick="openImportModal()">
          📥 Importar Extrato
        </button>
        <button class="btn btn-primary btn-sm" onclick="openMovementModal()">
          ➕ Nova Movimentação
        </button>
      </div>
    </div>

    <div class="balance-grid">
      ${programCards.map(({ program: p, balance, lastMove }) => `
        <div class="balance-card">
          <div class="balance-card-stripe" style="background:${p.color}"></div>
          <div class="balance-card-header">
            <div class="balance-program-name">
              <span class="program-dot" style="background:${p.color}; width:10px; height:10px; border-radius:50; display:inline-block;"></span>
              ${p.icon} ${p.name}
            </div>
            <span class="badge ${p.type === 'aerea' ? 'badge-primary' : 'badge-warning'}" style="font-size:0.6875rem;">${p.type === 'aerea' ? 'Aérea' : 'Pontos'}</span>
          </div>
          <div class="balance-amount">
            ${formatNumber(balance)} <span>milhas</span>
          </div>
          <div class="balance-updated">
            ${lastMove ? `Última mov.: ${formatDate(lastMove.date)}` : 'Sem movimentações'}
          </div>
          <div class="balance-actions">
            <button class="btn btn-secondary btn-sm" onclick="openMovementModal('${p.id}')">➕ Adicionar</button>
            <button class="btn btn-secondary btn-sm" onclick="showProgramHistory('${p.id}')">📋 Histórico</button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Modal Nova Movimentação -->
    <div class="modal-overlay" id="modal-movement">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">➕ Nova Movimentação</div>
          <button class="modal-close" onclick="closeModal('modal-movement')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group" id="mov-user-group">
            <label>Usuário</label>
            <select id="mov-user">
              <option value="jacson">👤 Jacson</option>
              <option value="ana">👩 Ana</option>
            </select>
          </div>
          <div class="form-group">
            <label>Programa</label>
            <select id="mov-program">
              ${PROGRAMS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de Movimentação</label>
            <select id="mov-type">
              ${MOVEMENT_TYPES.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Quantidade (milhas/pontos)</label>
            <input type="number" id="mov-quantity" placeholder="Ex: 10000" min="1">
          </div>
          <div class="form-group">
            <label>Custo por Milheiro (R$) — opcional</label>
            <input type="number" id="mov-cpm" placeholder="Ex: 16.50" step="0.50" min="0">
          </div>
          <div class="form-group">
            <label>Data</label>
            <input type="date" id="mov-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label>Observação</label>
            <input type="text" id="mov-note" placeholder="Ex: Compra promoção Black Friday">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-movement')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveMovement()">💾 Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal Histórico do Programa -->
    <div class="modal-overlay" id="modal-program-history">
      <div class="modal" style="max-width:700px;">
        <div class="modal-header">
          <div class="modal-title">📋 Histórico de Movimentações</div>
          <button class="modal-close" onclick="closeModal('modal-program-history')">✕</button>
        </div>
        <div class="modal-body" id="program-history-content">
        </div>
      </div>
    </div>

    <!-- Modal Importar Extrato -->
    <div class="modal-overlay" id="modal-import">
      <div class="modal" style="max-width:850px; width:95%;">
        <div class="modal-header">
          <div class="modal-title">📥 Importar Extrato Semi-Automático</div>
          <button class="modal-close" onclick="closeModal('modal-import')">✕</button>
        </div>
        
        <!-- PASSO 1: COLAR TEXTO -->
        <div id="import-step-1">
          <div class="modal-body">
            <p class="text-muted mb-md" style="font-size: 0.8125rem; line-height: 1.4;">
              Selecione o programa, o usuário e cole o extrato completo copiado direto do site original (selecione tudo com Ctrl+A no site e Ctrl+C, ou selecione a tabela do extrato e cole aqui).
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
              <div class="form-group" style="margin-bottom: 0;">
                <label>Usuário</label>
                <select id="import-user">
                  ${USERS_LIST.map(u => `<option value="${u.id}" ${u.id === userId ? 'selected' : ''}>${u.icon} ${u.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>Programa de Fidelidade</label>
                <select id="import-program">
                  ${PROGRAMS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="form-group" style="margin-top: var(--space-md);">
              <label>Conteúdo do Extrato Copiado</label>
              <textarea id="import-text" rows="10" placeholder="Cole o texto do extrato aqui (ex: datas, descrições e valores de pontos)..." style="width: 100%; font-family: monospace; font-size: 0.8125rem; padding: var(--space-sm); border: 1px solid var(--border); border-radius: var(--radius-sm); resize: vertical; background: var(--bg); color: var(--text-primary);"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal('modal-import')">Cancelar</button>
            <button class="btn btn-primary" onclick="analyzeStatement()">Analisar Extrato 🔍</button>
          </div>
        </div>

        <!-- PASSO 2: CONFIRMAR LANÇAMENTOS -->
        <div id="import-step-2" style="display: none;">
          <div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding-top: 0;">
            <p class="text-muted mb-md" style="font-size: 0.8125rem; line-height: 1.4; padding-top: var(--space-md);">
              Revisamos o extrato colado. Verifique os lançamentos identificados abaixo, edite os campos se necessário e marque apenas os que deseja salvar.
            </p>
            
            <div class="table-wrapper" style="margin-bottom: var(--space-md); overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                    <th style="padding: 8px; width: 40px; text-align: center;"><input type="checkbox" id="import-select-all" checked onchange="toggleSelectAllImports(this)"></th>
                    <th style="padding: 8px; width: 120px;">Data</th>
                    <th style="padding: 8px;">Descrição / Observação</th>
                    <th style="padding: 8px; width: 160px;">Tipo</th>
                    <th style="padding: 8px; width: 130px;">Quantidade</th>
                    <th style="padding: 8px; width: 100px;">CPM (R$)</th>
                  </tr>
                </thead>
                <tbody id="import-preview-rows">
                  <!-- Linhas injetadas via JS -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="goToImportStep(1)">⬅️ Voltar</button>
            <button class="btn btn-primary" onclick="saveImportedMovements()">💾 Salvar Lançamentos (<span id="import-checked-count">0</span>)</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openMovementModal(programId) {
  openModal('modal-movement');
  
  editingMovementId = null;
  const titleEl = document.querySelector('#modal-movement .modal-title');
  if (titleEl) titleEl.textContent = '➕ Nova Movimentação';
  
  const userGroup = document.getElementById('mov-user-group');
  if (userGroup) {
    if (AppState.activeUser === 'consolidado') {
      userGroup.style.display = 'block';
      document.getElementById('mov-user').value = 'jacson';
    } else {
      userGroup.style.display = 'none';
      document.getElementById('mov-user').value = AppState.activeUser;
    }
  }

  if (programId) {
    document.getElementById('mov-program').value = programId;
  }
}

function saveMovement() {
  const userIdInput = document.getElementById('mov-user')?.value || AppState.activeUser;
  const programId = document.getElementById('mov-program').value;
  const type = document.getElementById('mov-type').value;
  const quantity = parseInt(document.getElementById('mov-quantity').value);
  const cpm = parseFloat(document.getElementById('mov-cpm').value) || 0;
  const date = document.getElementById('mov-date').value;
  const note = document.getElementById('mov-note').value;

  if (!quantity || quantity <= 0) {
    showToast('Informe a quantidade de milhas', 'error');
    return;
  }

  if (!date) {
    showToast('Informe a data', 'error');
    return;
  }

  if (editingMovementId) {
    AppState.updateHistory(editingMovementId, {
      userId: userIdInput,
      programId,
      type,
      quantity,
      cpm,
      date,
      note
    });
    editingMovementId = null;
    showToast('Movimentação atualizada com sucesso!');
  } else {
    AppState.addHistory({
      userId: userIdInput,
      programId,
      type,
      quantity,
      cpm,
      date,
      note
    });
    showToast('Movimentação registrada com sucesso!');
  }

  closeModal('modal-movement');
  renderBalance();

  // Clear form
  document.getElementById('mov-quantity').value = '';
  document.getElementById('mov-cpm').value = '';
  document.getElementById('mov-note').value = '';
}

function showProgramHistory(programId) {
  const userId = AppState.activeUser;
  const prog = getProgramById(programId);
  const history = AppState.getHistory().filter(h => (userId === 'consolidado' ? true : h.userId === userId) && h.programId === programId);

  const content = document.getElementById('program-history-content');
  if (!content) return;

  const isConsolidated = userId === 'consolidado';

  if (history.length === 0) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Nenhuma movimentação para ${prog?.name}</div></div>`;
  } else {
    content.innerHTML = `
      <h3 style="margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
        <span class="program-dot" style="background:${prog?.color}; width:10px; height:10px; border-radius:50%; display:inline-block;"></span>
        ${prog?.icon} ${prog?.name}
      </h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              ${isConsolidated ? '<th style="width: 60px;">Quem</th>' : ''}
              <th>Data</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>CPM</th>
              <th>Obs.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => {
              const moveType = MOVEMENT_TYPES.find(m => m.id === h.type);
              const isPositive = ['compra', 'transferencia_entrada', 'bonus', 'clube', 'cartao'].includes(h.type);
              const userIcon = h.userId === 'jacson' ? '👤' : '👩';
              return `<tr>
                ${isConsolidated ? `<td data-label="Quem" style="font-size: 1.1rem; text-align: center;" title="${h.userId === 'jacson' ? 'Jacson' : 'Ana'}">${userIcon}</td>` : ''}
                <td data-label="Data">${formatDate(h.date)}</td>
                <td data-label="Tipo"><span style="color:${moveType?.color || '#999'}">${moveType?.icon || ''} ${moveType?.label || h.type}</span></td>
                <td data-label="Quantidade" class="${isPositive ? 'text-success' : 'text-danger'} fw-600">${isPositive ? '+' : '-'}${formatNumber(h.quantity)}</td>
                <td data-label="CPM">${h.cpm > 0 ? formatCurrency(h.cpm) : '—'}</td>
                <td data-label="Obs.">${h.note || '—'}</td>
                <td data-label="Ações" style="white-space: nowrap;">
                  <button class="btn btn-secondary btn-sm" onclick="editMovement('${h.id}', '${programId}')" title="Editar" style="padding: 4px 8px; margin-right: 4px;">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteMovement('${h.id}', '${programId}')" title="Excluir" style="padding: 4px 8px;">🗑️</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  openModal('modal-program-history');
}

function editMovement(id, programId) {
  closeModal('modal-program-history');
  const historyEntry = AppState.getHistory().find(h => h.id === id);
  if (!historyEntry) return;

  editingMovementId = id;

  openModal('modal-movement');

  const titleEl = document.querySelector('#modal-movement .modal-title');
  if (titleEl) titleEl.textContent = '📝 Editar Movimentação';

  const userGroup = document.getElementById('mov-user-group');
  if (userGroup) {
    userGroup.style.display = 'block';
    document.getElementById('mov-user').value = historyEntry.userId;
  }
  
  document.getElementById('mov-program').value = historyEntry.programId;
  document.getElementById('mov-type').value = historyEntry.type;
  document.getElementById('mov-quantity').value = Math.abs(historyEntry.quantity);
  document.getElementById('mov-cpm').value = historyEntry.cpm || '';
  document.getElementById('mov-date').value = historyEntry.date;
  document.getElementById('mov-note').value = historyEntry.note || '';
}

function deleteMovement(id, programId) {
  if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
    AppState.removeHistory(id);
    showToast('Movimentação excluída');
    showProgramHistory(programId);
    renderBalance();
  }
}

// ============= Funções de Importação de Extrato =============
let importedItemsTemp = [];

function openImportModal() {
  importedItemsTemp = [];
  document.getElementById('import-text').value = '';
  goToImportStep(1);
  openModal('modal-import');
}

function goToImportStep(step) {
  if (step === 1) {
    document.getElementById('import-step-1').style.display = 'block';
    document.getElementById('import-step-2').style.display = 'none';
  } else {
    document.getElementById('import-step-1').style.display = 'none';
    document.getElementById('import-step-2').style.display = 'block';
  }
}

function analyzeStatement() {
  const text = document.getElementById('import-text').value;
  const programId = document.getElementById('import-program').value;
  const userId = document.getElementById('import-user').value;
  
  if (!text.trim()) {
    showToast('Por favor, cole o conteúdo do extrato', 'error');
    return;
  }
  
  const parsed = parsePastedStatement(text, programId, userId);
  if (parsed.length === 0) {
    showToast('Nenhuma movimentação identificada. Verifique as datas e valores no extrato colado.', 'error');
    return;
  }
  
  importedItemsTemp = parsed;
  renderImportPreviewRows(parsed);
  goToImportStep(2);
  showToast(`${parsed.length} movimentações detectadas com sucesso! 🔍`, 'info');
}

function renderImportPreviewRows(items) {
  const tbody = document.getElementById('import-preview-rows');
  if (!tbody) return;
  
  tbody.innerHTML = items.map((item, index) => {
    const isPositive = item.quantity > 0;
    const absQty = Math.abs(item.quantity);
    
    return `
      <tr style="border-bottom: 1px solid var(--border);" class="import-row" data-index="${index}">
        <td style="padding: 8px; text-align: center; vertical-align: middle;">
          <input type="checkbox" class="import-row-check" checked onchange="updateImportCheckedCount()" style="width:16px; height:16px; cursor:pointer;">
        </td>
        <td style="padding: 8px; vertical-align: middle;">
          <input type="date" class="import-row-date" value="${item.date}" style="width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem;">
        </td>
        <td style="padding: 8px; vertical-align: middle;">
          <input type="text" class="import-row-desc" value="${item.description}" style="width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem;">
        </td>
        <td style="padding: 8px; vertical-align: middle;">
          <select class="import-row-type" style="width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem;">
            ${MOVEMENT_TYPES.map(t => `<option value="${t.id}" ${t.id === item.type ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
          </select>
        </td>
        <td style="padding: 8px; display: flex; align-items: center; gap: 4px; vertical-align: middle;">
          <select class="import-row-sign" style="padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: bold; width: 45px; color: ${isPositive ? 'var(--success)' : 'var(--danger)'};" onchange="this.style.color = this.value === '+' ? 'var(--success)' : 'var(--danger)'">
            <option value="+" ${isPositive ? 'selected' : ''}>+</option>
            <option value="-" ${!isPositive ? 'selected' : ''}>-</option>
          </select>
          <input type="number" class="import-row-qty" value="${absQty}" min="1" style="width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">
        </td>
        <td style="padding: 8px; vertical-align: middle;">
          <input type="number" class="import-row-cpm" value="" placeholder="0.00" step="0.50" min="0" style="width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem;">
        </td>
      </tr>
    `;
  }).join('');
  
  updateImportCheckedCount();
}

function toggleSelectAllImports(masterCheckbox) {
  const checks = document.querySelectorAll('.import-row-check');
  checks.forEach(c => c.checked = masterCheckbox.checked);
  updateImportCheckedCount();
}

function updateImportCheckedCount() {
  const checks = document.querySelectorAll('.import-row-check');
  let checkedCount = 0;
  checks.forEach(c => { if (c.checked) checkedCount++; });
  
  const label = document.getElementById('import-checked-count');
  if (label) label.textContent = checkedCount;
}

function saveImportedMovements() {
  const rows = document.querySelectorAll('.import-row');
  let count = 0;
  
  rows.forEach(row => {
    const checked = row.querySelector('.import-row-check').checked;
    if (!checked) return;
    
    const index = parseInt(row.dataset.index, 10);
    const item = importedItemsTemp[index];
    if (!item) return;
    
    const date = row.querySelector('.import-row-date').value;
    const description = row.querySelector('.import-row-desc').value;
    const type = row.querySelector('.import-row-type').value;
    const sign = row.querySelector('.import-row-sign').value === '+' ? 1 : -1;
    const qtyInput = parseInt(row.querySelector('.import-row-qty').value, 10) || 0;
    const cpm = parseFloat(row.querySelector('.import-row-cpm').value) || 0;
    
    if (qtyInput <= 0 || !date) return;
    
    AppState.addHistory({
      userId: item.userId,
      programId: item.programId,
      type: type,
      quantity: qtyInput * sign,
      cpm: cpm,
      date: date,
      note: description
    });
    
    count++;
  });
  
  if (count > 0) {
    closeModal('modal-import');
    showToast(`${count} movimentações importadas com sucesso! 🎉`);
    renderBalance();
  } else {
    showToast('Nenhuma transação válida selecionada para salvar', 'error');
  }
}

// ============= Motor de Parsing do Extrato =============

function parsePastedStatement(text, programId, userId) {
  const cleanText = text.replace(/\s*([/\-])\s*/g, '$1');
  const dateRegex = /\b\d{1,2}[/\-]\d{1,2}(?:[/\-]\d{2,4})?\b|\b\d{1,2}\s+(?:de\s+)?(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-zçáõéíóú]*\s*(?:de\s+)?(?:\d{2,4})?\b/gi;
  
  let matches = [];
  let match;
  while ((match = dateRegex.exec(cleanText)) !== null) {
    matches.push({
      str: match[0],
      index: match.index,
      length: match[0].length
    });
  }
  
  if (matches.length === 0) {
    return [];
  }
  
  const dateFirst = matches[0].index < 45;
  
  let blocks = [];
  if (dateFirst) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i].length;
      const end = (i + 1 < matches.length) ? matches[i + 1].index : cleanText.length;
      blocks.push({
        dateStr: matches[i].str,
        text: cleanText.slice(start, end)
      });
    }
  } else {
    for (let i = 0; i < matches.length; i++) {
      const start = (i === 0) ? 0 : matches[i - 1].index + matches[i - 1].length;
      const end = matches[i].index;
      blocks.push({
        dateStr: matches[i].str,
        text: cleanText.slice(start, end)
      });
    }
  }
  
  let results = [];
  const defaultYear = new Date().getFullYear();
  
  blocks.forEach(block => {
    let blockText = block.text.trim();
    if (!blockText) return;
    
    const parsedDate = parsePastedDate(block.dateStr, defaultYear);
    const { quantity, sign } = extractQuantityAndSign(blockText, parsedDate);
    if (quantity === 0) return;
    
    const description = extractDescription(blockText, quantity);
    const type = inferMovementType(description, sign);
    
    results.push({
      userId: userId,
      programId: programId,
      date: parsedDate,
      description: description,
      type: type,
      quantity: quantity * (sign < 0 ? -1 : 1),
      cpm: 0
    });
  });
  
  return results;
}

function parsePastedDate(dateStr, defaultYear = 2026) {
  const cleanStr = dateStr.toLowerCase().replace(/\s+/g, ' ').replace(/\s*([/\-])\s*/g, '$1').trim();
  
  let match = cleanStr.match(/^(\d{1,2})[/\-](\d{1,2})(?:[/\-](\d{2,4}))?$/);
  if (match) {
    let day = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let year = match[3] ? parseInt(match[3], 10) : defaultYear;
    if (year < 100) year += 2000;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  const monthsMap = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  
  match = cleanStr.match(/^(\d{1,2})\s*(?:de\s+)?([a-zçáõéíóú]+)(?:\s*(?:de\s+)?(\d{2,4}))?$/);
  if (match) {
    let day = parseInt(match[1], 10);
    let monthName = match[2];
    let year = match[3] ? parseInt(match[3], 10) : defaultYear;
    if (year < 100) year += 2000;
    
    let month = 1;
    for (const [key, val] of Object.entries(monthsMap)) {
      if (monthName.startsWith(key)) {
        month = val;
        break;
      }
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
}

function extractQuantityAndSign(blockText, parsedDate) {
  const numRegex = /([+\-]?)\s*(\d{1,3}(?:\.\d{3})*|\d+)/g;
  let matches = [];
  let m;
  
  while ((m = numRegex.exec(blockText)) !== null) {
    const fullMatch = m[0];
    const sign = m[1];
    const numStr = m[2].replace(/\./g, '');
    const val = parseInt(numStr, 10);
    
    const indexAfter = m.index + fullMatch.length;
    const charAfter = blockText.slice(indexAfter, indexAfter + 1);
    if (charAfter === '%') continue;
    
    const yearFromDate = parsedDate ? parseInt(parsedDate.split('-')[0]) : 2026;
    if (val === yearFromDate || val === yearFromDate - 1 || val === yearFromDate + 1) {
      continue;
    }
    
    const sliceAfter = blockText.slice(indexAfter, indexAfter + 20).toLowerCase();
    
    let priority = 0;
    if (sign === '+' || sign === '-') priority += 2;
    if (sliceAfter.includes('pts') || sliceAfter.includes('ponto') || sliceAfter.includes('milha') || sliceAfter.includes('acumulo') || sliceAfter.includes('acúmulo')) {
      priority += 3;
    }
    
    matches.push({
      val: sign === '-' ? -val : val,
      absVal: val,
      sign: sign || null,
      priority,
      index: m.index
    });
  }
  
  if (matches.length === 0) return { quantity: 0, sign: 1 };
  
  matches.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.absVal - a.absVal;
  });
  
  const bestMatch = matches[0];
  let finalSign = 1;
  
  if (bestMatch.sign === '-') {
    finalSign = -1;
  } else if (bestMatch.sign === '+') {
    finalSign = 1;
  } else {
    const lowerText = blockText.toLowerCase();
    const negativeKeywords = ['transferencia para', 'transferência para', 'uso', 'resgate', 'saida', 'saída', 'emissao', 'emissão', 'debitado', 'debito', 'débito', 'expira', 'expirado', 'enviado', 'transferido para'];
    const hasNegativeKeyword = negativeKeywords.some(keyword => lowerText.includes(keyword));
    if (hasNegativeKeyword) {
      finalSign = -1;
    }
  }
  
  return { quantity: bestMatch.absVal, sign: finalSign };
}

function extractDescription(blockText, quantityVal) {
  let cleaned = blockText.replace(/\s+/g, ' ').trim();
  const formattedVal = new Intl.NumberFormat('pt-BR').format(quantityVal);
  
  const regex1 = new RegExp(`[+\\-]\\s*${formattedVal.replace(/\./g, '\\.')}\\s*(?:pts|pontos|milhas|mi)?`, 'gi');
  const regex2 = new RegExp(`\\b${formattedVal.replace(/\./g, '\\.')}\\s*(?:pts|pontos|milhas|mi)?`, 'gi');
  const regex3 = new RegExp(`[+\\-]\\s*${quantityVal}\\s*(?:pts|pontos|milhas|mi)?`, 'gi');
  const regex4 = new RegExp(`\\b${quantityVal}\\s*(?:pts|pontos|milhas|mi)?`, 'gi');
  
  cleaned = cleaned.replace(regex1, '');
  cleaned = cleaned.replace(regex2, '');
  cleaned = cleaned.replace(regex3, '');
  cleaned = cleaned.replace(regex4, '');
  
  cleaned = cleaned.replace(/^[\s\-\+\,\:\;\|\\\/]+|[\s\-\+\,\:\;\|\\\/]+$/g, '').replace(/\s+/g, ' ').trim();
  
  if (cleaned.length > 80) {
    cleaned = cleaned.slice(0, 77) + '...';
  }
  
  if (cleaned.length === 0) {
    cleaned = 'Lançamento importado';
  } else {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

function inferMovementType(description, sign) {
  const desc = description.toLowerCase();
  
  if (desc.includes('clube') || desc.includes('mensalidade') || desc.includes('assinatura')) {
    return 'clube';
  }
  if (desc.includes('bonus') || desc.includes('bonificacao') || desc.includes('bônus') || desc.includes('bonificação')) {
    return 'bonus';
  }
  if (desc.includes('compra')) {
    return 'compra';
  }
  if (desc.includes('cartao') || desc.includes('cartão') || desc.includes('pontos de cart') || desc.includes('fidelidade cart')) {
    return 'cartao';
  }
  if (desc.includes('transferencia') || desc.includes('transferência') || desc.includes('transf')) {
    return sign < 0 ? 'transferencia_saida' : 'transferencia_entrada';
  }
  if (desc.includes('uso') || desc.includes('emissao') || desc.includes('emissão') || desc.includes('passagem') || desc.includes('resgate') || desc.includes('voo') || desc.includes('vôo')) {
    return 'uso';
  }
  if (desc.includes('expira') || desc.includes('expirado') || desc.includes('expiração') || desc.includes('expiracao')) {
    return 'expiracao';
  }
  
  return sign < 0 ? 'uso' : 'compra';
}
