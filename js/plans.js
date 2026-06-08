/* ============================================
   MILHAS ACKER — Módulo: Planos Ativos
   Controle de assinaturas/clubes de milhas
   ============================================ */

let editingPlanId = null;

function renderPlans() {
  const container = document.getElementById('plans-content');
  if (!container) return;

  const userId = AppState.activeUser;
  const user = USERS_LIST.find(u => u.id === userId);
  const plans = AppState.getPlans().filter(p => userId === 'consolidado' ? true : p.userId === userId);
  const activePlans = plans.filter(p => p.status === 'ativo');
  const inactivePlans = plans.filter(p => p.status !== 'ativo');

  const totalMonthly = activePlans.reduce((sum, p) => sum + (parseFloat(p.monthlyValue) || 0), 0);
  const totalPoints = activePlans.reduce((sum, p) => sum + (parseInt(p.monthlyPoints) || 0), 0);
  const avgCpm = totalPoints > 0 ? (totalMonthly / totalPoints * 1000) : 0;

  container.innerHTML = `
    <div class="stats-row mb-xl">
      <div class="stat-card">
        <div class="stat-card-icon blue">📋</div>
        <div class="stat-card-value">${activePlans.length}</div>
        <div class="stat-card-label">Planos Ativos — ${user?.name || 'Geral'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">💳</div>
        <div class="stat-card-value">${formatCurrency(totalMonthly)}</div>
        <div class="stat-card-label">Gasto Mensal Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">✈️</div>
        <div class="stat-card-value">${formatNumber(totalPoints)}</div>
        <div class="stat-card-label">Pontos/Mês Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon pink">📊</div>
        <div class="stat-card-value">${formatCurrency(avgCpm)}</div>
        <div class="stat-card-label">CPM Médio dos Planos</div>
      </div>
    </div>

    <div class="flex justify-between items-center mb-lg">
      <h3 style="font-size:1rem; font-weight:600;">${userId === 'consolidado' ? 'Planos Consolidados' : `Planos de ${user?.name}`}</h3>
      <button class="btn btn-primary btn-sm" onclick="openPlanModal()">
        ➕ Novo Plano
      </button>
    </div>

    ${activePlans.length > 0 ? `
      <div class="plans-list mb-xl">
        ${activePlans.map(plan => renderPlanItem(plan)).join('')}
      </div>
    ` : `
      <div class="card mb-xl">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">Nenhum plano ativo para ${user?.name || 'Geral'}</div>
          <button class="btn btn-primary" onclick="openPlanModal()">➕ Adicionar Plano</button>
        </div>
      </div>
    `}

    ${inactivePlans.length > 0 ? `
      <h3 style="font-size:0.9rem; font-weight:600; color:var(--text-muted); margin-bottom:var(--space-md);">Planos Inativos/Encerrados</h3>
      <div class="plans-list" style="opacity:0.6">
        ${inactivePlans.map(plan => renderPlanItem(plan)).join('')}
      </div>
    ` : ''}

    <!-- Modal Novo Plano -->
    <div class="modal-overlay" id="modal-plan">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">📋 Novo Plano/Assinatura</div>
          <button class="modal-close" onclick="closeModal('modal-plan')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group" id="plan-user-group">
            <label>Usuário</label>
            <select id="plan-user">
              <option value="jacson">👤 Jacson</option>
              <option value="ana">👩 Ana</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nome do Plano</label>
            <input type="text" id="plan-name" placeholder="Ex: Clube Livelo Essencial">
          </div>
          <div class="form-group">
            <label>Programa</label>
            <select id="plan-program">
              ${PROGRAMS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Valor Mensal (R$)</label>
            <input type="number" id="plan-value" placeholder="Ex: 79.90" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label>Pontos por Mês</label>
            <input type="number" id="plan-points" placeholder="Ex: 5000" min="0">
          </div>
          <div class="form-group">
            <label>Data de Início</label>
            <input type="date" id="plan-start" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label>Data de Fim (opcional)</label>
            <input type="date" id="plan-end">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="plan-status">
              <option value="ativo">✅ Ativo</option>
              <option value="pausado">⏸️ Pausado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-plan')">Cancelar</button>
          <button class="btn btn-primary" onclick="savePlan()">💾 Salvar</button>
        </div>
      </div>
    </div>
  `;
}

function renderPlanItem(plan) {
  const prog = getProgramById(plan.programId);
  const cpm = plan.monthlyPoints > 0 ? (plan.monthlyValue / plan.monthlyPoints * 1000) : 0;
  const isActive = plan.status === 'ativo';
  const userIcon = plan.userId === 'jacson' ? '👤' : '👩';
  const userName = plan.userId === 'jacson' ? 'Jacson' : 'Ana';

  return `
    <div class="plan-item">
      <div class="plan-info">
        <h3>
          <span class="program-dot" style="background:${prog?.color || '#999'}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px;"></span>
          ${plan.name}
          <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}" style="margin-left:8px; font-size:0.6875rem;">
            ${isActive ? '✅ Ativo' : plan.status === 'pausado' ? '⏸️ Pausado' : '❌ Cancelado'}
          </span>
        </h3>
        <div class="plan-meta">
          <span class="plan-meta-item">${userIcon} ${userName}</span>
          <span class="plan-meta-item">${prog?.icon} ${prog?.name}</span>
          <span class="plan-meta-item">📅 ${formatDate(plan.startDate)} ${plan.endDate ? `→ ${formatDate(plan.endDate)}` : '→ Indefinido'}</span>
          <span class="plan-meta-item">🎯 ${formatNumber(plan.monthlyPoints)} pts/mês</span>
        </div>
      </div>
      <div class="plan-cost">
        <div class="plan-cost-value">${formatCurrency(plan.monthlyValue)}</div>
        <div class="plan-cost-label">por mês</div>
        <div class="plan-cpm">CPM: ${formatCurrency(cpm)}</div>
        <div style="display: flex; gap: 6px; margin-top: 8px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="editPlan('${plan.id}')" style="padding: 4px 8px;" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deletePlan('${plan.id}')" style="padding: 4px 8px;" title="Excluir">🗑️</button>
        </div>
      </div>
    </div>
  `;
}

function openPlanModal() {
  openModal('modal-plan');
  
  editingPlanId = null;
  const titleEl = document.querySelector('#modal-plan .modal-title');
  if (titleEl) titleEl.textContent = '📋 Novo Plano/Assinatura';
  
  const userGroup = document.getElementById('plan-user-group');
  if (userGroup) {
    if (AppState.activeUser === 'consolidado') {
      userGroup.style.display = 'block';
      document.getElementById('plan-user').value = 'jacson';
    } else {
      userGroup.style.display = 'none';
      document.getElementById('plan-user').value = AppState.activeUser;
    }
  }
}

function savePlan() {
  const userIdInput = document.getElementById('plan-user')?.value || AppState.activeUser;
  const name = document.getElementById('plan-name').value.trim();
  const programId = document.getElementById('plan-program').value;
  const monthlyValue = parseFloat(document.getElementById('plan-value').value);
  const monthlyPoints = parseInt(document.getElementById('plan-points').value);
  const startDate = document.getElementById('plan-start').value;
  const endDate = document.getElementById('plan-end').value;
  const status = document.getElementById('plan-status').value;

  if (!name) {
    showToast('Informe o nome do plano', 'error');
    return;
  }
  if (isNaN(monthlyValue) || monthlyValue <= 0) {
    showToast('Informe o valor mensal', 'error');
    return;
  }

  if (editingPlanId) {
    AppState.updatePlan(editingPlanId, {
      userId: userIdInput,
      name,
      programId,
      monthlyValue,
      monthlyPoints: monthlyPoints || 0,
      startDate,
      endDate,
      status
    });
    editingPlanId = null;
    showToast('Plano atualizado com sucesso!');
  } else {
    AppState.addPlan({
      userId: userIdInput,
      name,
      programId,
      monthlyValue,
      monthlyPoints: monthlyPoints || 0,
      startDate,
      endDate,
      status
    });
    showToast('Plano adicionado com sucesso!');
  }

  closeModal('modal-plan');
  renderPlans();

  // Clear form
  document.getElementById('plan-name').value = '';
  document.getElementById('plan-value').value = '';
  document.getElementById('plan-points').value = '';
  document.getElementById('plan-end').value = '';
}

function editPlan(id) {
  const plan = AppState.getPlans().find(p => p.id === id);
  if (!plan) return;

  editingPlanId = id;

  openModal('modal-plan');

  const titleEl = document.querySelector('#modal-plan .modal-title');
  if (titleEl) titleEl.textContent = '📝 Editar Plano/Assinatura';

  const userGroup = document.getElementById('plan-user-group');
  if (userGroup) {
    userGroup.style.display = 'block';
    document.getElementById('plan-user').value = plan.userId;
  }

  document.getElementById('plan-name').value = plan.name;
  document.getElementById('plan-program').value = plan.programId;
  document.getElementById('plan-value').value = plan.monthlyValue;
  document.getElementById('plan-points').value = plan.monthlyPoints;
  document.getElementById('plan-start').value = plan.startDate;
  document.getElementById('plan-end').value = plan.endDate || '';
  document.getElementById('plan-status').value = plan.status;
}

function deletePlan(id) {
  if (confirm('Deseja remover este plano?')) {
    AppState.removePlan(id);
    showToast('Plano removido');
    renderPlans();
  }
}
