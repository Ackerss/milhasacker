/* ============================================
   MILHAS ACKER — Módulo: Compre e Pontue
   Cálculo de acúmulo de compras e ofertas
   ============================================ */

const SHOPPING_PARTNERS = [
  {
    name: 'Mercado Livre',
    logo: '🤝',
    regularPoints: '1x por R$',
    bestPoints: '10x por R$',
    bestPointsProgram: 'Livelo / Esfera',
    notes: 'Campanhas de 5x a 7x são muito comuns na Livelo. Excelente para acumular pontos de alto valor.'
  },
  {
    name: 'Amazon Brasil',
    logo: '📦',
    regularPoints: '1x por R$',
    bestPoints: '5x por R$',
    bestPointsProgram: 'Livelo / Smiles',
    notes: 'Parceria frequente Livelo. Excelente para eletrônicos e livros.'
  },
  {
    name: 'Casas Bahia',
    logo: '🏠',
    regularPoints: '1x por R$',
    bestPoints: '10x a 12x por R$',
    bestPointsProgram: 'Azul / Smiles / Livelo',
    notes: 'Campanhas de 8x a 10x ocorrem quase todo mês, especialmente na Smiles e Azul.'
  },
  {
    name: 'Magalu (Magazine Luiza)',
    logo: '💙',
    regularPoints: '1x por R$',
    bestPoints: '10x por R$',
    bestPointsProgram: 'Azul / Smiles',
    notes: 'Excelentes acúmulos diretos em programas de aéreas parceiras.'
  },
  {
    name: 'Netshoes',
    logo: '👟',
    regularPoints: '2x por R$',
    bestPoints: '15x por R$',
    bestPointsProgram: 'Esfera / Livelo / Smiles',
    notes: 'Campanhas de 10x a 12x são muito recorrentes. Ótimo para vestuário esportivo.'
  },
  {
    name: 'Ponto (ex-Ponto Frio)',
    logo: '🔴',
    regularPoints: '1x por R$',
    bestPoints: '10x por R$',
    bestPointsProgram: 'Livelo / Smiles',
    notes: 'Frequentemente iguala as promoções das Casas Bahia (mesmo grupo).'
  }
];

function renderShopping() {
  const container = document.getElementById('shopping-content');
  if (!container) return;

  // Filtrar ofertas ativas que são sobre compras / parceiros
  const shoppingKeywords = ['compre', 'pontue', 'acumule', 'por real', 'parceiro', 'cupom', 'desconto', 'cashback', 'mercado livre', 'amazon', 'casas bahia', 'magalu', 'netshoes'];
  const activeShoppingOffers = (typeof LIVE_OFFERS !== 'undefined' ? LIVE_OFFERS : []).filter(o => {
    const text = (o.title + ' ' + o.description).toLowerCase();
    return shoppingKeywords.some(kw => text.includes(kw));
  });

  container.innerHTML = `
    <!-- Top Row: Calculadora & Info -->
    <div class="dashboard-grid mb-xl">
      <!-- Calculadora Compre e Pontue -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">🛍️ Calculadora Compre e Pontue</h3>
            <p class="card-subtitle">Descubra o desconto real obtido através de milhas</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:var(--space-md);">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-md);">
            <div class="form-group">
              <label style="font-size:0.8125rem; font-weight:600; margin-bottom:4px; display:block;">Valor do Produto (R$)</label>
              <input type="number" id="calc-shop-val" class="price-input" value="1000" min="1" style="width:100%;">
            </div>
            <div class="form-group">
              <label style="font-size:0.8125rem; font-weight:600; margin-bottom:4px; display:block;">Pontos por Real Gasto</label>
              <input type="number" id="calc-shop-rate" class="price-input" value="5" min="1" style="width:100%;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-md);">
            <div class="form-group">
              <label style="font-size:0.8125rem; font-weight:600; margin-bottom:4px; display:block;">Programa Origem</label>
              <select id="calc-shop-origin" class="price-input" style="width:100%;">
                <option value="livelo">💜 Livelo</option>
                <option value="esfera">Esfera</option>
                <option value="smiles">😊 Smiles</option>
                <option value="azul">💎 Azul Fidelidade</option>
                <option value="latam">✈️ Latam Pass</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:0.8125rem; font-weight:600; margin-bottom:4px; display:block;">Programa Destino Aéreo</label>
              <select id="calc-shop-dest" class="price-input" style="width:100%;">
                <option value="smiles">😊 Smiles</option>
                <option value="azul" selected>💎 Azul Fidelidade</option>
                <option value="latam">✈️ Latam Pass</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label style="font-size:0.8125rem; font-weight:600; margin-bottom:4px; display:block;">Bônus Transferência Esperado (%)</label>
            <input type="number" id="calc-shop-bonus" class="price-input" value="100" min="0" style="width:100%;">
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Se acumular direto em Smiles/Azul/Latam, defina bônus como 0.</p>
          </div>

          <!-- Resultado do Cálculo -->
          <div style="background:var(--primary-bg); padding:var(--space-md); border-radius:var(--radius-md); margin-top:var(--space-sm); display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
              <span>Pontos Acumulados:</span>
              <strong id="res-shop-points">5.000 pts</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
              <span>Milhas após Transferência:</span>
              <strong id="res-shop-miles">10.000 milhas</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.875rem; border-bottom:1px dashed var(--primary-lighter); padding-bottom:8px;">
              <span>Valor Estimado de Volta:</span>
              <strong id="res-shop-value" class="text-success">R$ 130,00</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9375rem; font-weight:700; margin-top:4px;">
              <span>Desconto Real (Cashback):</span>
              <span id="res-shop-discount" class="text-success">13,00%</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9375rem; font-weight:700;">
              <span>Custo Efetivo:</span>
              <span id="res-shop-net">R$ 870,00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas Rápidos de Compras -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">🔥 Parcerias e Descontos Ativos</h3>
            <p class="card-subtitle">Promoções de compra bonificada detectadas em tempo real</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:var(--space-md); max-height:400px; overflow-y:auto; padding-right:4px;">
          ${activeShoppingOffers.length > 0 
            ? activeShoppingOffers.map(o => {
                const prog = o.programId ? getProgramById(o.programId) : null;
                return `
                  <div style="background:var(--bg); padding:12px; border-radius:var(--radius-md); border-left:4px solid ${prog ? prog.color : 'var(--primary)'}; display:flex; flex-direction:column; gap:6px;">
                    <div style="font-weight:600; font-size:0.875rem; display:flex; justify-content:space-between; align-items:flex-start;">
                      <span>${o.title}</span>
                      <span class="badge badge-info" style="font-size:0.65rem; padding:2px 6px;">Auto</span>
                    </div>
                    <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">${o.description}</p>
                    <div style="font-size:0.6875rem; color:var(--text-muted); text-align:right;">
                      Postado em: ${formatDate(o.startDate)}
                    </div>
                  </div>
                `;
              }).join('')
            : `
              <div class="empty-state">
                <div class="empty-state-icon">🛍️</div>
                <div class="empty-state-text">Nenhuma compra bonificada atípica detectada hoje.</div>
                <p style="font-size:0.75rem; color:var(--text-muted);">As parcerias mudam diariamente. Acompanhe os links oficiais.</p>
              </div>
            `
          }
        </div>
      </div>
    </div>

    <!-- Tabela de Referência de Parceiros -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">📊 Histórico de Parcerias e Fator de Acúmulo</h3>
          <p class="card-subtitle">Use como referência para saber se a promoção atual é realmente boa</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Parceiro</th>
              <th>Acúmulo Padrão</th>
              <th>Melhor Histórico</th>
              <th>Programa do Recorde</th>
              <th>Nota / Estratégia</th>
            </tr>
          </thead>
          <tbody>
            ${SHOPPING_PARTNERS.map(p => `
              <tr>
                <td style="font-weight:600;"><span style="font-size:1.25rem; margin-right:8px;">${p.logo}</span>${p.name}</td>
                <td class="text-muted">${p.regularPoints}</td>
                <td class="text-success fw-600">${p.bestPoints}</td>
                <td><span class="badge badge-primary">${p.bestPointsProgram}</span></td>
                <td class="text-muted" style="font-size:0.8125rem; max-width:300px; white-space:normal; line-height:1.4;">${p.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Registrar listeners para a calculadora
  document.getElementById('calc-shop-val').addEventListener('input', calculateShoppingCashback);
  document.getElementById('calc-shop-rate').addEventListener('input', calculateShoppingCashback);
  document.getElementById('calc-shop-origin').addEventListener('change', calculateShoppingCashback);
  document.getElementById('calc-shop-dest').addEventListener('change', calculateShoppingCashback);
  document.getElementById('calc-shop-bonus').addEventListener('input', calculateShoppingCashback);

  // Executar primeiro cálculo
  calculateShoppingCashback();
}

function calculateShoppingCashback() {
  const prodVal = parseFloat(document.getElementById('calc-shop-val').value) || 0;
  const rate = parseFloat(document.getElementById('calc-shop-rate').value) || 0;
  const origin = document.getElementById('calc-shop-origin').value;
  const dest = document.getElementById('calc-shop-dest').value;
  const bonus = parseFloat(document.getElementById('calc-shop-bonus').value) || 0;

  // 1. Pontos Acumulados
  const points = prodVal * rate;
  document.getElementById('res-shop-points').textContent = formatNumber(Math.round(points)) + ' pts';

  // 2. Milhas após Transferência
  let miles = points;
  if (['livelo', 'esfera'].includes(origin)) {
    miles = points * (1 + (bonus / 100));
  } else {
    // Se a origem já for Smiles/Azul/Latam, desconsidera o bônus de transferência pois já cai direto
    document.getElementById('calc-shop-bonus').value = 0;
    miles = points;
  }
  document.getElementById('res-shop-miles').textContent = formatNumber(Math.round(miles)) + ' milhas';

  // 3. Valor Estimado de Volta (com base nas milhas geradas)
  // Obter valor de cotação padrão/esperado por milheiro
  let cpmDestino = 16.00; // Padrão Smiles
  if (dest === 'azul') {
    cpmDestino = 13.00;
  } else if (dest === 'latam') {
    cpmDestino = 25.00;
  }

  // Tentar pegar do preço atual real configurado no localStorage
  const currentPrices = AppState.getCurrentPrices();
  if (currentPrices[dest] && currentPrices[dest].price > 0) {
    // Usamos o preço de venda das milhas. Na cotação de mercado, o milheiro custa ~R$14-25.
    cpmDestino = currentPrices[dest].price;
  } else {
    // Usar os dados estáticos se não houver cotação inserida pelo usuário
    const staticProg = getProgramById(dest);
    if (staticProg) {
      cpmDestino = staticProg.goodPrice;
    }
  }

  const estimatedValue = (miles / 1000) * cpmDestino;
  document.getElementById('res-shop-value').textContent = formatCurrency(estimatedValue);

  // 4. Desconto Real (Cashback %)
  const discountPercent = prodVal > 0 ? (estimatedValue / prodVal) * 100 : 0;
  document.getElementById('res-shop-discount').textContent = discountPercent.toFixed(2) + '%';

  // 5. Custo Efetivo
  const netCost = Math.max(0, prodVal - estimatedValue);
  document.getElementById('res-shop-net').textContent = formatCurrency(netCost);
}
