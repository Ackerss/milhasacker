/* ============================================
   MILHAS ACKER — Módulo: Calendário de Promoções
   Grid visual com detalhes por mês
   ============================================ */

function renderCalendar() {
  const container = document.getElementById('calendar-content');
  if (!container) return;

  const currentMonth = new Date().getMonth();

  container.innerHTML = `
    <div class="card mb-xl">
      <div class="card-header">
        <div>
          <div class="card-title">📅 Calendário de Promoções ${new Date().getFullYear()}</div>
          <div class="card-subtitle">Clique em um mês para ver detalhes. Dados baseados em padrões históricos 2022-2026.</div>
        </div>
        <div class="calendar-legend">
          <span class="badge badge-danger">🔥 Imperdível</span>
          <span class="badge badge-warning">⭐ Bom</span>
          <span class="badge badge-info">😐 Fraco</span>
        </div>
      </div>

      <div class="calendar-grid">
        ${PROMO_CALENDAR.map(month => {
          const isCurrent = month.month === currentMonth;
          const heatClass = month.heat >= 4 ? 'hot' : '';
          const currentClass = isCurrent ? 'current' : '';
          
          return `
            <div class="calendar-month ${heatClass} ${currentClass}" onclick="toggleMonth(this)" data-month="${month.month}">
              <div class="month-name">
                ${isCurrent ? '📍 ' : ''}${month.name}
              </div>
              <div class="month-rating">
                <span class="badge ${getRatingBadge(month.rating)}">${month.ratingLabel}</span>
              </div>
              <div class="month-programs">
                ${month.highlights.slice(0, 3).map(h => {
                  const prog = getProgramById(h.program);
                  return `<span class="month-program-tag" style="border-left: 3px solid ${prog?.color || '#999'}; padding-left: 6px;">${prog?.name || h.program}</span>`;
                }).join('')}
                ${month.highlights.length > 3 ? `<span class="month-program-tag">+${month.highlights.length - 3}</span>` : ''}
              </div>
              <div class="month-details">
                <div class="month-highlights-list">
                  ${month.highlights.map(h => {
                    const prog = getProgramById(h.program);
                    return `<div class="month-highlight-item">
                      <span class="program-dot" style="background:${prog?.color || '#999'}; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px;"></span>
                      ${h.text}
                    </div>`;
                  }).join('')}
                </div>
                <div class="month-tip">
                  <strong>💡 Dica:</strong> ${month.tip}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">🎂 Aniversários dos Programas</div>
          <div class="card-subtitle">Meses com promoções especiais de cada programa</div>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Programa</th>
              <th>Aniversário</th>
              <th>O que esperar</th>
            </tr>
          </thead>
          <tbody>
            ${PROGRAMS.map(p => `
              <tr>
                <td data-label="Programa">
                  <span class="program-badge">
                    <span class="program-dot" style="background:${p.color}"></span>
                    ${p.icon} ${p.name}
                  </span>
                </td>
                <td data-label="Aniversário" class="fw-600">${p.anniversary || '—'}</td>
                <td data-label="O que esperar" class="text-muted" style="max-width:300px">${p.source}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card mt-md" style="margin-top:var(--space-lg)">
      <div class="card-header">
        <div>
          <div class="card-title">🧠 Estratégias de Compra Combinada</div>
          <div class="card-subtitle">Combos mais eficientes para reduzir o CPM (Custo por Milheiro)</div>
        </div>
      </div>
      <div class="strategies-grid">
        ${Object.values(STRATEGIES).map(s => `
          <div class="strategy-card">
            <h3 class="strategy-name">${s.name}</h3>
            <div class="strategy-cpm">
              <span class="badge badge-success">CPM Final: ${formatCurrency(s.cpmFinal)}</span>
            </div>
            <p class="strategy-desc">${s.description}</p>
            <p class="strategy-diff"><em>⚡ ${s.difficulty}</em></p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card mt-md" style="margin-top:var(--space-lg)">
      <div class="card-header">
        <div>
          <div class="card-title">📚 Fontes dos Dados</div>
          <div class="card-subtitle">Última atualização: ${formatDate(DATA_SOURCES.lastUpdated)}</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
        <div>
          <h4 style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Preços</h4>
          <ul style="list-style:none; font-size:0.8125rem; color:var(--text-muted);">
            ${DATA_SOURCES.prices.map(s => `<li style="margin-bottom:4px;">• ${s}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:var(--space-sm);">Calendário</h4>
          <ul style="list-style:none; font-size:0.8125rem; color:var(--text-muted);">
            ${DATA_SOURCES.calendar.map(s => `<li style="margin-bottom:4px;">• ${s}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function toggleMonth(el) {
  // Toggle expanded
  const wasExpanded = el.classList.contains('expanded');
  // Close all
  document.querySelectorAll('.calendar-month.expanded').forEach(m => m.classList.remove('expanded'));
  // Open if was closed
  if (!wasExpanded) {
    el.classList.add('expanded');
  }
}

function getRatingBadge(rating) {
  switch(rating) {
    case 'imperdivel': return 'badge-danger';
    case 'quente': return 'badge-danger';
    case 'bom': return 'badge-warning';
    case 'medio': return 'badge-info';
    case 'fraco': return 'badge-info';
    default: return 'badge-info';
  }
}
