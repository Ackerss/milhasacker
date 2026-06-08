/* ============================================
   MILHAS ACKER — Módulo: Dashboard
   Gráficos e visão geral
   ============================================ */

function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const userId = AppState.activeUser;
  const user = USERS_LIST.find(u => u.id === userId);

  // Calcular stats
  let totalMiles = 0;
  const balanceByProgram = [];
  PROGRAMS.forEach(p => {
    const bal = AppState.getBalance(userId, p.id);
    totalMiles += bal;
    if (bal > 0) {
      balanceByProgram.push({ program: p, balance: bal });
    }
  });

  const plans = AppState.getPlans().filter(p => userId === 'consolidado' ? p.status === 'ativo' : (p.userId === userId && p.status === 'ativo'));
  const monthlySpend = plans.reduce((sum, p) => sum + (parseFloat(p.monthlyValue) || 0), 0);
  const monthlyPoints = plans.reduce((sum, p) => sum + (parseInt(p.monthlyPoints) || 0), 0);
  
  const activeAlerts = AppState.getAlerts().filter(a => {
    if (!a.active) return false;
    if (a.endDate && new Date(a.endDate) < new Date()) return false;
    return true;
  });

  // Render stats
  container.innerHTML = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-icon blue">✈️</div>
        <div class="stat-card-value">${formatNumber(totalMiles)}</div>
        <div class="stat-card-label">Total de Milhas/Pontos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">📊</div>
        <div class="stat-card-value">${balanceByProgram.length}</div>
        <div class="stat-card-label">Programas com Saldo</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">💳</div>
        <div class="stat-card-value">${formatCurrency(monthlySpend)}</div>
        <div class="stat-card-label">Gasto Mensal c/ Planos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon pink">🔔</div>
        <div class="stat-card-value">${activeAlerts.length}</div>
        <div class="stat-card-label">Alertas Ativos</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribuição por Programas</div>
            <div class="card-subtitle">${user.icon} ${user.name}</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-distribution"></canvas>
        </div>
        ${balanceByProgram.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Nenhum saldo registrado ainda</div></div>' : ''}
      </div>

      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Saldo por Programa</div>
            <div class="card-subtitle">Comparativo</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-bars"></canvas>
        </div>
        ${balanceByProgram.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Adicione milhas em "Controle de Saldo"</div></div>' : ''}
      </div>

      <div class="chart-card full-width">
        <div class="card-header">
          <div>
            <div class="card-title">Movimentações Recentes</div>
            <div class="card-subtitle">Últimas 10 movimentações</div>
          </div>
        </div>
        ${renderRecentHistory(userId)}
      </div>

      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Resumo de Planos Ativos</div>
            <div class="card-subtitle">${plans.length} plano(s) ativo(s)</div>
          </div>
        </div>
        ${plans.length === 0 
          ? '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Nenhum plano ativo</div></div>'
          : `<div class="plans-summary">
              ${plans.map(p => {
                const prog = getProgramById(p.programId);
                const cpm = p.monthlyPoints > 0 ? (p.monthlyValue / p.monthlyPoints * 1000) : 0;
                const userIcon = p.userId === 'jacson' ? '👤' : '👩';
                return `<div class="plan-summary-item">
                  <span class="program-dot" style="background:${prog?.color || '#999'}"></span>
                  <span class="fw-600">${p.name} <small class="text-muted" style="font-size:0.7rem; font-weight:normal; margin-left:4px;">(${userIcon})</small></span>
                  <span class="text-muted" style="margin-left:auto">${formatCurrency(p.monthlyValue)}/mês</span>
                  <span class="badge badge-success">CPM ${formatCurrency(cpm)}</span>
                </div>`;
              }).join('')}
              <div class="plan-summary-total mt-md">
                <strong>Total mensal:</strong> ${formatCurrency(monthlySpend)} → ${formatNumber(monthlyPoints)} pts/mês
              </div>
            </div>`
        }
      </div>

      <div class="chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">⚠️ Alertas & Dicas</div>
            <div class="card-subtitle">Informações importantes</div>
          </div>
        </div>
        <div class="dashboard-tips">
          ${DATA_SOURCES.notes.map(note => `<div class="tip-item">${note}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Render charts
  if (balanceByProgram.length > 0) {
    renderDistributionChart(balanceByProgram);
    renderBarsChart(balanceByProgram);
  }
}

function renderRecentHistory(userId) {
  const history = AppState.getHistory()
    .filter(h => userId === 'consolidado' ? true : h.userId === userId)
    .slice(0, 10);

  if (history.length === 0) {
    return '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">Nenhuma movimentação registrada</div></div>';
  }

  const isConsolidated = userId === 'consolidado';

  return `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            ${isConsolidated ? '<th style="width: 60px;">Quem</th>' : ''}
            <th>Data</th>
            <th>Programa</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>CPM</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(h => {
            const prog = getProgramById(h.programId);
            const moveType = MOVEMENT_TYPES.find(m => m.id === h.type);
            const isPositive = ['compra', 'transferencia_entrada', 'bonus', 'clube', 'cartao'].includes(h.type);
            const userIcon = h.userId === 'jacson' ? '👤' : '👩';
            return `<tr>
              ${isConsolidated ? `<td data-label="Quem" style="font-size: 1.1rem; text-align: center;" title="${h.userId === 'jacson' ? 'Jacson' : 'Ana'}">${userIcon}</td>` : ''}
              <td data-label="Data">${formatDate(h.date)}</td>
              <td data-label="Programa"><span class="program-badge"><span class="program-dot" style="background:${prog?.color || '#999'}"></span>${prog?.name || h.programId}</span></td>
              <td data-label="Tipo"><span style="color:${moveType?.color || '#999'}">${moveType?.icon || ''} ${moveType?.label || h.type}</span></td>
              <td data-label="Quantidade" class="${isPositive ? 'text-success' : 'text-danger'} fw-600">${isPositive ? '+' : '-'}${formatNumber(h.quantity)}</td>
              <td data-label="CPM">${h.cpm > 0 ? formatCurrency(h.cpm) : '—'}</td>
              <td data-label="Observação" class="text-muted">${h.note || '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDistributionChart(data) {
  const ctx = document.getElementById('chart-distribution');
  if (!ctx) return;

  if (window._chartDist) window._chartDist.destroy();

  window._chartDist = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.program.name),
      datasets: [{
        data: data.map(d => d.balance),
        backgroundColor: data.map(d => d.program.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        datalabels: { display: false },
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#1A1A2E',
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: 600 },
          bodyFont: { family: 'Inter' },
          callbacks: {
            label: function(context) {
              return ` ${formatNumber(context.raw)} milhas`;
            }
          }
        }
      }
    }
  });
}

function renderBarsChart(data) {
  const ctx = document.getElementById('chart-bars');
  if (!ctx) return;

  if (window._chartBars) window._chartBars.destroy();

  window._chartBars = new Chart(ctx, {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: data.map(d => d.program.name),
      datasets: [{
        data: data.map(d => d.balance),
        backgroundColor: data.map(d => d.program.color + '33'),
        borderColor: data.map(d => d.program.color),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'center',
          align: 'center',
          formatter: (value) => formatNumber(value),
          font: {
            family: 'Inter',
            weight: 'bold',
            size: 11
          },
          color: (context) => {
            return data[context.dataIndex]?.program.color || '#1A1A2E';
          }
        },
        tooltip: {
          backgroundColor: '#1A1A2E',
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: 600 },
          bodyFont: { family: 'Inter' },
          callbacks: {
            label: function(context) {
              return ` ${formatNumber(context.raw)} milhas`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f0f1f5' },
          ticks: {
            font: { family: 'Inter', size: 11 },
            callback: (v) => formatNumber(v)
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}
