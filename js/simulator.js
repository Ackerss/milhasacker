/* ============================================
   MILHAS ACKER — Módulo: Simulador de Compra
   Calcular custo de X milhas em cada programa
   ============================================ */

function renderSimulator() {
  const container = document.getElementById('simulator-content');
  if (!container) return;

  container.innerHTML = `
    <div class="simulator-container">
      <div class="simulator-input-card">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">🔢 Simulador de Compra</div>
              <div class="card-subtitle">Quanto custa comprar X milhas?</div>
            </div>
          </div>
          <div class="form-group">
            <label>Quantidade de milhas desejada</label>
            <input type="number" id="sim-quantity" placeholder="Ex: 50000" min="1000" step="1000" value="50000" oninput="runSimulation()">
          </div>
          <div class="form-group">
            <label>Modo de comparação</label>
            <select id="sim-mode" onchange="runSimulation()">
              <option value="best">Melhor preço histórico</option>
              <option value="good">Preço bom (referência)</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="runSimulation()" style="width:100%; margin-top:var(--space-sm);">
            🔄 Simular
          </button>

          <div class="sim-tip mt-md" style="font-size:0.8125rem; color:var(--text-muted); padding:var(--space-md); background:var(--primary-bg); border-radius:var(--radius-sm);">
            💡 <strong>Dica:</strong> Insira os preços atuais na aba "Tabela de Preços" para comparar com o custo real de hoje.
          </div>
        </div>
      </div>

      <div class="simulator-results" id="sim-results">
        <!-- Rendered by runSimulation() -->
      </div>
    </div>
  `;

  runSimulation();
}

function runSimulation() {
  const quantity = parseInt(document.getElementById('sim-quantity')?.value) || 50000;
  const mode = document.getElementById('sim-mode')?.value || 'best';
  const container = document.getElementById('sim-results');
  if (!container) return;

  const currentPrices = AppState.getCurrentPrices();
  const thousands = quantity / 1000;

  // Calculate for each program
  const results = PROGRAMS.map(p => {
    const refPrice = mode === 'best' ? p.bestPrice : p.goodPrice;
    const costAtRef = thousands * refPrice;
    const cp = currentPrices[p.id];
    const currentPrice = cp ? cp.price : null;
    const costAtCurrent = currentPrice ? thousands * currentPrice : null;
    const savings = costAtCurrent ? costAtCurrent - costAtRef : null;
    const savingsPercent = costAtCurrent ? ((savings / costAtCurrent) * 100) : null;

    let recommendation;
    if (!currentPrice) {
      recommendation = { text: 'Inserir preço', class: 'badge-info' };
    } else if (currentPrice <= refPrice * 1.05) {
      recommendation = { text: '✅ Comprar agora!', class: 'badge-success' };
    } else if (currentPrice <= refPrice * 1.3) {
      recommendation = { text: '👍 Razoável', class: 'badge-warning' };
    } else {
      recommendation = { text: '⏳ Esperar', class: 'badge-danger' };
    }

    return {
      program: p,
      refPrice,
      costAtRef,
      currentPrice,
      costAtCurrent,
      savings,
      savingsPercent,
      recommendation
    };
  });

  // Sort by cost at reference (cheapest first)
  results.sort((a, b) => a.costAtRef - b.costAtRef);

  container.innerHTML = `
    <div class="card mb-lg">
      <div class="card-header">
        <div>
          <div class="card-title">Resultado: ${formatNumber(quantity)} milhas</div>
          <div class="card-subtitle">Comparando com ${mode === 'best' ? 'melhor preço histórico' : 'preço bom de referência'}</div>
        </div>
      </div>
    </div>

    ${results.map((r, index) => `
      <div class="sim-result-card ${index === 0 ? 'recommended' : ''}">
        <div style="text-align:center; min-width:40px;">
          <span style="font-size:1.5rem;">${r.program.icon}</span>
          <div style="font-size:0.6875rem; color:var(--text-muted); margin-top:2px;">#${index + 1}</div>
        </div>

        <div class="sim-program-info">
          <div class="sim-program-name">
            <span class="program-dot" style="background:${r.program.color}; width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px;"></span>
            ${r.program.name}
            ${index === 0 ? '<span class="badge badge-success" style="margin-left:8px; font-size:0.6875rem;">Mais barato</span>' : ''}
          </div>
          <div style="font-size:0.8125rem; color:var(--text-muted); margin-top:4px;">
            CPM ref.: ${formatCurrency(r.refPrice)}
            ${r.currentPrice ? ` | CPM atual: ${formatCurrency(r.currentPrice)}` : ''}
          </div>
          ${r.savings !== null && r.savings > 0 ? `
            <div class="sim-savings" style="margin-top:4px;">
              💰 Economia potencial: ${formatCurrency(r.savings)} (${r.savingsPercent.toFixed(0)}% se esperar)
            </div>
          ` : ''}
          ${r.savings !== null && r.savings <= 0 ? `
            <div style="font-size:0.8125rem; color:var(--success); font-weight:600; margin-top:4px;">
              🎯 Preço atual está ABAIXO da referência!
            </div>
          ` : ''}
        </div>

        <div class="sim-costs">
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Custo ${mode === 'best' ? 'mínimo' : 'bom'}</div>
          <div class="sim-cost-current text-success">${formatCurrency(r.costAtRef)}</div>
          ${r.costAtCurrent ? `
            <div class="sim-cost-best" style="margin-top:4px;">Custo atual: ${formatCurrency(r.costAtCurrent)}</div>
          ` : ''}
          <div style="margin-top:8px;">
            <span class="sim-recommendation badge ${r.recommendation.class}">${r.recommendation.text}</span>
          </div>
        </div>
      </div>
    `).join('')}

    <div class="card mt-md" style="margin-top:var(--space-lg);">
      <div style="padding:var(--space-md); font-size:0.8125rem; color:var(--text-muted);">
        <strong>⚠️ Nota:</strong> Os valores de "melhor preço" consideram estratégias combinadas 
        (ex: compra Livelo com desconto + transferência bonificada). O custo final pode variar 
        conforme a promoção disponível no momento. Nunca compre milhas pelo preço cheio.
      </div>
    </div>
  `;
}
