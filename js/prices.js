/* ============================================
   MILHAS ACKER — Módulo: Tabela de Preços
   Comparativo por milheiro com gauge visual
   ============================================ */

function renderPrices() {
  const container = document.getElementById('prices-content');
  if (!container) return;

  const currentPrices = AppState.getCurrentPrices();

  container.innerHTML = `
    <div class="card mb-xl">
      <div class="card-header">
        <div>
          <div class="card-title">💰 Tabela de Melhores Preços por Milheiro</div>
          <div class="card-subtitle">Referência de mercado 2024-2026. Edite o "Preço Atual" para comparar com o histórico.</div>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Programa</th>
              <th>Tipo</th>
              <th style="text-align:center">🏆 Melhor Preço</th>
              <th style="text-align:center">👍 Preço Bom</th>
              <th style="text-align:center">📌 Regular</th>
              <th style="text-align:center">💲 Preço Atual</th>
              <th style="text-align:center">Status</th>
              <th>Fonte/Estratégia</th>
            </tr>
          </thead>
          <tbody>
            ${PROGRAMS.map(p => {
              const cp = currentPrices[p.id];
              const currentPrice = cp ? cp.price : null;
              const status = currentPrice ? getPriceStatus(currentPrice, p) : { label: 'Inserir', class: 'badge-info', gauge: 0, gaugeClass: 'good' };

              return `
                <tr>
                  <td>
                    <span class="program-badge">
                      <span class="program-dot" style="background:${p.color}"></span>
                      ${p.icon} ${p.name}
                    </span>
                  </td>
                  <td><span class="badge ${p.type === 'aerea' ? 'badge-primary' : 'badge-warning'}">${p.type === 'aerea' ? '✈️ Aérea' : '🔄 Pontos'}</span></td>
                  <td style="text-align:center" class="text-success fw-700">${formatCurrency(p.bestPrice)}</td>
                  <td style="text-align:center" class="fw-600">${formatCurrency(p.goodPrice)}</td>
                  <td style="text-align:center" class="text-muted">${formatCurrency(p.regularPrice)}</td>
                  <td style="text-align:center">
                    <div class="price-input-wrapper">
                      <input type="number" 
                        class="price-input" 
                        id="price-${p.id}" 
                        placeholder="R$" 
                        value="${currentPrice || ''}" 
                        onchange="updateCurrentPrice('${p.id}', this.value)"
                        step="0.50"
                        min="0"
                        style="width:90px; text-align:center; padding:6px 8px; font-weight:600;">
                    </div>
                  </td>
                  <td style="text-align:center">
                    <div class="price-gauge">
                      <span class="badge ${status.class}">${status.label}</span>
                    </div>
                  </td>
                  <td class="text-muted" style="font-size:0.8rem; max-width:220px;">${p.source}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card mb-xl">
      <div class="card-header">
        <div>
          <div class="card-title">📊 Comparativo Visual de Preços</div>
          <div class="card-subtitle">Quanto menor, melhor para compra</div>
        </div>
      </div>
      <div class="chart-container" style="max-height:400px;">
        <canvas id="chart-prices"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">📖 Como Interpretar</div>
        </div>
      </div>
      <div class="price-guide">
        <div class="guide-item">
          <span class="badge badge-success">Excelente!</span>
          <span>Preço igual ou próximo ao melhor histórico. Compre imediatamente se tiver objetivo.</span>
        </div>
        <div class="guide-item">
          <span class="badge badge-success">Bom preço</span>
          <span>Preço dentro da faixa aceitável. Vale a pena se tiver viagem planejada.</span>
        </div>
        <div class="guide-item">
          <span class="badge badge-warning">Regular</span>
          <span>Preço acima do ideal. Espere promoção melhor se não tiver urgência.</span>
        </div>
        <div class="guide-item">
          <span class="badge badge-danger">Caro</span>
          <span>Preço cheio ou próximo. Não compre! Espere promoção.</span>
        </div>
      </div>
    </div>
  `;

  renderPricesChart();
}

function updateCurrentPrice(programId, value) {
  if (value && !isNaN(value) && parseFloat(value) > 0) {
    AppState.setCurrentPrice(programId, value);
    showToast(`Preço atualizado para ${getProgramById(programId)?.name}`);
  }
  // Re-render to update status badges
  renderPrices();
}

function renderPricesChart() {
  const ctx = document.getElementById('chart-prices');
  if (!ctx) return;

  if (window._chartPrices) window._chartPrices.destroy();

  const currentPrices = AppState.getCurrentPrices();

  window._chartPrices = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: PROGRAMS.map(p => p.name),
      datasets: [
        {
          label: 'Melhor Preço',
          data: PROGRAMS.map(p => p.bestPrice),
          backgroundColor: '#06D6A033',
          borderColor: '#06D6A0',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Preço Bom',
          data: PROGRAMS.map(p => p.goodPrice),
          backgroundColor: '#FFD16633',
          borderColor: '#FFD166',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Preço Atual',
          data: PROGRAMS.map(p => currentPrices[p.id]?.price || 0),
          backgroundColor: '#4361EE33',
          borderColor: '#4361EE',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
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
              return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
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
            callback: (v) => `R$ ${v}`
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10 } }
        }
      }
    }
  });
}
