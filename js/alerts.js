/* ============================================
   MILHAS ACKER — Módulo: Alertas
   Promoções ativas com countdown
   ============================================ */

function renderAlerts() {
  const container = document.getElementById('alerts-content');
  if (!container) return;

  const alerts = AppState.getAlerts();
  const now = new Date();

  // Classify alerts
  const active = [];
  const expired = [];

  alerts.forEach(a => {
    const endDate = a.endDate ? new Date(a.endDate + 'T23:59:59') : null;
    if (!a.active || (endDate && endDate < now)) {
      expired.push({ ...a, _expired: true });
    } else {
      const daysLeft = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;
      active.push({ ...a, _daysLeft: daysLeft });
    }
  });

  // Sort active by urgency (least days left first)
  active.sort((a, b) => {
    if (a._daysLeft === null) return 1;
    if (b._daysLeft === null) return -1;
    return a._daysLeft - b._daysLeft;
  });

  container.innerHTML = `
    <div class="flex justify-between items-center mb-lg">
      <div>
        <h3 style="font-size:1rem; font-weight:600;">🔔 Alertas e Promoções</h3>
        <p class="text-muted" style="font-size:0.8125rem;">${active.length} alerta(s) ativo(s)</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAlertModal()">
        ➕ Novo Alerta
      </button>
    </div>

    ${active.length > 0 ? `
      <div class="alerts-grid mb-xl">
        ${active.map(a => renderAlertCard(a)).join('')}
      </div>
    ` : `
      <div class="card mb-xl">
        <div class="empty-state">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-text">Nenhuma promoção ativa no momento</div>
          <p class="text-muted" style="font-size:0.875rem; margin-bottom:var(--space-md);">Adicione alertas quando souber de promoções!</p>
          <button class="btn btn-primary" onclick="openAlertModal()">➕ Adicionar Alerta</button>
        </div>
      </div>
    `}

    ${expired.length > 0 ? `
      <h3 style="font-size:0.9rem; font-weight:600; color:var(--text-muted); margin-bottom:var(--space-md);">Alertas Expirados</h3>
      <div class="alerts-grid" style="opacity:0.5;">
        ${expired.map(a => renderAlertCard(a, true)).join('')}
      </div>
    ` : ''}

    <!-- Modal Novo Alerta -->
    <div class="modal-overlay" id="modal-alert">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">🔔 Novo Alerta / Promoção</div>
          <button class="modal-close" onclick="closeModal('modal-alert')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input type="text" id="alert-title" placeholder="Ex: Orange Friday Smiles 2026">
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea id="alert-desc" placeholder="Ex: Bônus de até 100% na transferência Livelo→Smiles" rows="3" style="width:100%; resize:vertical;"></textarea>
          </div>
          <div class="form-group">
            <label>Programa (opcional)</label>
            <select id="alert-program">
              <option value="">Todos / Geral</option>
              ${PROGRAMS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Data de Início</label>
            <input type="date" id="alert-start" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label>Data de Fim</label>
            <input type="date" id="alert-end">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-alert')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveAlert()">💾 Salvar</button>
        </div>
      </div>
    </div>
  `;
}

function renderAlertCard(alert, isExpired = false) {
  const prog = alert.programId ? getProgramById(alert.programId) : null;
  const urgencyClass = alert._daysLeft !== null && alert._daysLeft <= 3 ? 'urgent' : 
                       alert._daysLeft !== null && alert._daysLeft <= 7 ? 'ending-soon' : '';

  return `
    <div class="alert-card ${urgencyClass}">
      <div class="alert-card-header">
        <div class="alert-card-title">${alert.title}</div>
        <button class="btn btn-danger btn-icon" onclick="deleteAlert('${alert.id}')" title="Remover" style="width:28px; height:28px; font-size:0.875rem;">✕</button>
      </div>
      <div class="alert-card-body">${alert.description || ''}</div>
      ${prog ? `
        <div style="margin-bottom:var(--space-sm);">
          <span class="program-badge">
            <span class="program-dot" style="background:${prog.color}"></span>
            ${prog.icon} ${prog.name}
          </span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:0.75rem; color:var(--text-muted);">
          ${alert.startDate ? formatDate(alert.startDate) : ''} ${alert.endDate ? `→ ${formatDate(alert.endDate)}` : ''}
        </div>
        ${!isExpired && alert._daysLeft !== null ? `
          <div class="alert-countdown">
            <span class="alert-countdown-value ${alert._daysLeft <= 3 ? 'text-danger' : alert._daysLeft <= 7 ? 'text-warning' : ''}">
              ${alert._daysLeft === 0 ? '🔥 Último dia!' : 
                alert._daysLeft === 1 ? '⚡ 1 dia restante' : 
                `⏰ ${alert._daysLeft} dias restantes`}
            </span>
          </div>
        ` : ''}
        ${isExpired ? '<span class="badge badge-danger">Expirado</span>' : ''}
      </div>
    </div>
  `;
}

function openAlertModal() {
  openModal('modal-alert');
}

function saveAlert() {
  const title = document.getElementById('alert-title').value.trim();
  const description = document.getElementById('alert-desc').value.trim();
  const programId = document.getElementById('alert-program').value;
  const startDate = document.getElementById('alert-start').value;
  const endDate = document.getElementById('alert-end').value;

  if (!title) {
    showToast('Informe o título do alerta', 'error');
    return;
  }

  AppState.addAlert({
    title,
    description,
    programId,
    startDate,
    endDate,
    active: true
  });

  closeModal('modal-alert');
  showToast('Alerta adicionado com sucesso!');
  renderAlerts();

  // Clear form
  document.getElementById('alert-title').value = '';
  document.getElementById('alert-desc').value = '';
  document.getElementById('alert-program').value = '';
  document.getElementById('alert-end').value = '';
}

function deleteAlert(id) {
  if (confirm('Remover este alerta?')) {
    AppState.removeAlert(id);
    showToast('Alerta removido');
    renderAlerts();
  }
}
