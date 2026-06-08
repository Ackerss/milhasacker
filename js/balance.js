/* ============================================
   MILHAS ACKER — Módulo: Controle de Saldo
   Cards de saldo + CRUD movimentações
   ============================================ */

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
    const lastMove = AppState.getHistory().find(h => h.userId === userId && h.programId === p.id);
    
    return { program: p, balance, lastMove };
  });

  container.innerHTML = `
    <div class="stats-row mb-xl">
      <div class="stat-card">
        <div class="stat-card-icon blue">✈️</div>
        <div class="stat-card-value">${formatNumber(totalMiles)}</div>
        <div class="stat-card-label">Total de Milhas/Pontos — ${user.name}</div>
      </div>
    </div>

    <div class="flex justify-between items-center mb-lg">
      <h3 style="font-size:1rem; font-weight:600;">Saldo por Programa</h3>
      <button class="btn btn-primary btn-sm" onclick="openMovementModal()">
        ➕ Nova Movimentação
      </button>
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
  `;
}

function openMovementModal(programId) {
  openModal('modal-movement');
  if (programId) {
    document.getElementById('mov-program').value = programId;
  }
}

function saveMovement() {
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

  AppState.addHistory({
    userId: AppState.activeUser,
    programId,
    type,
    quantity,
    cpm,
    date,
    note
  });

  closeModal('modal-movement');
  showToast('Movimentação registrada com sucesso!');
  renderBalance();

  // Clear form
  document.getElementById('mov-quantity').value = '';
  document.getElementById('mov-cpm').value = '';
  document.getElementById('mov-note').value = '';
}

function showProgramHistory(programId) {
  const userId = AppState.activeUser;
  const prog = getProgramById(programId);
  const history = AppState.getHistory().filter(h => h.userId === userId && h.programId === programId);

  const content = document.getElementById('program-history-content');
  if (!content) return;

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
              return `<tr>
                <td data-label="Data">${formatDate(h.date)}</td>
                <td data-label="Tipo"><span style="color:${moveType?.color || '#999'}">${moveType?.icon || ''} ${moveType?.label || h.type}</span></td>
                <td data-label="Quantidade" class="${isPositive ? 'text-success' : 'text-danger'} fw-600">${isPositive ? '+' : '-'}${formatNumber(h.quantity)}</td>
                <td data-label="CPM">${h.cpm > 0 ? formatCurrency(h.cpm) : '—'}</td>
                <td data-label="Obs.">${h.note || '—'}</td>
                <td data-label="Ações">
                  <button class="btn btn-danger btn-sm" onclick="deleteMovement('${h.id}', '${programId}')" title="Excluir">🗑️</button>
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

function deleteMovement(id, programId) {
  if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
    AppState.removeHistory(id);
    showToast('Movimentação excluída');
    showProgramHistory(programId);
    renderBalance();
  }
}
