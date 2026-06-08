/* ============================================
   MILHAS ACKER — Módulo: Alertas
   Promoções ativas com countdown, classificação de atratividade e estimativa de CPM
   ============================================ */

// Função auxiliar para obter o preço atual de um programa (usando manual ou auto)
function getProgramCurrentPrice(programId) {
  const currentPrices = AppState.getCurrentPrices();
  const cp = currentPrices[programId];
  const manualPrice = cp ? cp.price : null;
  const autoPrices = (typeof LIVE_OFFERS_METADATA !== 'undefined' && LIVE_OFFERS_METADATA.currentMarketPrices) || {};
  const autoPrice = autoPrices[programId] || getProgramById(programId)?.goodPrice || 35.00;
  return manualPrice !== null ? manualPrice : autoPrice;
}

// Extrai custo do milheiro do texto usando regexes
function extractCPMFromText(text) {
  if (!text) return null;
  // Limpa entidades HTML comuns que podem quebrar a regex
  const cleanText = text.replace(/&#8211;/g, '-').replace(/&ndash;/g, '-');
  
  const regexes = [
    /milheiro\s+(?:a\s+partir\s+de|por|a)?\s*r\$\s*(\d+[,.]\d{2})/i,
    /cpm\s*(?:de)?\s*r\$\s*(\d+[,.]\d{2})/i,
    /custo\s+de\s*r\$\s*(\d+[,.]\d{2})\s+por\s+mil/i,
    /r\$\s*(\d+[,.]\d{2})\s+(?:o|por)\s+milheiro/i
  ];
  
  for (let reg of regexes) {
    const match = cleanText.match(reg);
    if (match) {
      return match[1].replace(',', '.');
    }
  }
  return null;
}

// Calcula ou extrai o CPM estimado da oferta
function calculateAlertCPM(alert) {
  // 1. CPM informado manualmente
  if (alert.cpm) {
    return {
      value: parseFloat(alert.cpm),
      type: 'manual',
      explanation: 'Preço informado manualmente'
    };
  }

  // 2. Extração via texto do título ou descrição
  const text = ((alert.title || "") + " " + (alert.description || "")).toLowerCase();
  const extracted = extractCPMFromText(text);
  if (extracted) {
    return {
      value: parseFloat(extracted),
      type: 'extracted',
      explanation: 'Custo por milheiro extraído do texto da oferta'
    };
  }

  // 3. Estimativa de transferências bonificadas Livelo / Esfera
  const hasLivelo = text.includes("livelo");
  const hasEsfera = text.includes("esfera");
  if (hasLivelo || hasEsfera) {
    const originProgram = hasLivelo ? 'livelo' : 'esfera';
    const bonusMatch = text.match(/(\d+)\s*%/); // Captura o primeiro bônus em % encontrado
    if (bonusMatch) {
      const bonusPercent = parseFloat(bonusMatch[1]);
      if (bonusPercent > 0 && bonusPercent <= 400) {
        const originPrice = getProgramCurrentPrice(originProgram);
        const finalCPM = originPrice / (1 + (bonusPercent / 100));
        return {
          value: parseFloat(finalCPM.toFixed(2)),
          type: 'calculated',
          explanation: `Estimativa via transferência bonificada. Custo de origem (${hasLivelo ? 'Livelo' : 'Esfera'}): R$ ${originPrice.toFixed(2)} / Fator bônus: ${1 + (bonusPercent / 100)} (+${bonusPercent}% bônus)`
        };
      }
    }
  }

  return null;
}

// Função heurística para determinar a atratividade/rating de um alerta
function getAlertRating(alert) {
  // Se o alerta tiver rating explícito (cadastrado pelo usuário), retorna ele
  if (alert.rating) return alert.rating;
  
  // Caso contrário (alertas automáticos), estimar a partir do texto
  const text = ((alert.title || "") + " " + (alert.description || "")).toLowerCase();
  
  // Regras para "Excelente / Imperdível 🔥" (hot)
  if (
    text.includes("120%") || 
    text.includes("130%") || 
    text.includes("340%") || 
    text.includes("imperdível") || 
    text.includes("r$ 11,31") || 
    text.includes("melhor preço") ||
    text.includes("compre e pontue: até 15 pontos") ||
    text.includes("até 15 pontos por real")
  ) {
    return "hot";
  }
  
  // Regras para "Vale a pena 👍" (good)
  if (
    text.includes("bônus") || 
    text.includes("desconto") || 
    text.includes("cashback") || 
    text.includes("cupom") || 
    text.includes("promoção") || 
    text.includes("70%") ||
    text.includes("80%") ||
    text.includes("100%") ||
    text.includes("compra bonificada") ||
    text.includes("compre e pontue")
  ) {
    return "good";
  }
  
  // Regras para "Pouco atrativo 👎" (bad)
  if (
    text.includes("pouco atrativo") ||
    text.includes("não vale a pena") ||
    text.includes("cuidado")
  ) {
    return "bad";
  }
  
  // Padrão: Neutro ⚖️
  return "neutral";
}

function renderAlertRatingLabel(rating) {
  switch (rating) {
    case 'hot': return '<span class="rating-badge hot">🔥 Excelente</span>';
    case 'good': return '<span class="rating-badge good">👍 Vale a Pena</span>';
    case 'bad': return '<span class="rating-badge bad">👎 Pouco Atrativo</span>';
    default: return '<span class="rating-badge neutral">⚖️ Neutro</span>';
  }
}

function renderAlerts() {
  const container = document.getElementById('alerts-content');
  if (!container) return;

  // Combinar alertas locais do localStorage com alertas automáticos em tempo real
  const localAlerts = AppState.getAlerts();
  const alerts = [...(typeof LIVE_OFFERS !== 'undefined' ? LIVE_OFFERS : []), ...localAlerts];
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

  // Sort active by rating (highest first) and then by urgency (least days left first)
  active.sort((a, b) => {
    const ratingA = getAlertRating(a);
    const ratingB = getAlertRating(b);
    
    const weightMap = { 'hot': 4, 'good': 3, 'neutral': 2, 'bad': 1 };
    const weightA = weightMap[ratingA] || 2;
    const weightB = weightMap[ratingB] || 2;
    
    if (weightA !== weightB) {
      return weightB - weightA; // Maior atratividade primeiro
    }
    
    // Secondary sort: urgency (least days left first)
    if (a._daysLeft === null && b._daysLeft !== null) return 1;
    if (a._daysLeft !== null && b._daysLeft === null) return -1;
    if (a._daysLeft !== null && b._daysLeft !== null) {
      return a._daysLeft - b._daysLeft;
    }
    return 0;
  });

  container.innerHTML = `
    ${renderScrapStatusHeader()}

    <div class="flex justify-between items-center mb-lg">
      <div>
        <h3 style="font-size:1rem; font-weight:600;">🔔 Alertas e Promoções</h3>
        <p class="text-muted" style="font-size:0.8125rem;">${active.length} alerta(s) ativo(s) ordenados por prioridade</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAlertModal()">
        ➕ Novo Alerta
      </button>
    </div>

    ${active.length > 0 ? `
      <div class="alert-list mb-xl">
        ${active.map(a => renderAlertListItem(a)).join('')}
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
      <div class="alert-list" style="opacity:0.65;">
        ${expired.map(a => renderAlertListItem(a, true)).join('')}
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
            <label>Atratividade / Recomendação</label>
            <select id="alert-rating">
              <option value="neutral">⚖️ Neutro / Avaliar</option>
              <option value="hot">🔥 Excelente / Vale muito a pena</option>
              <option value="good">👍 Vale a pena</option>
              <option value="bad">👎 Pouco atrativo</option>
            </select>
          </div>
          <div class="form-group">
            <label>Custo por Milheiro (CPM) Estimado (R$ - opcional)</label>
            <input type="number" id="alert-cpm" placeholder="Ex: 17.50" step="0.10" min="0">
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

function renderAlertListItem(alert, isExpired = false) {
  const rating = getAlertRating(alert);
  const prog = alert.programId ? getProgramById(alert.programId) : null;
  const isAuto = !!alert.isAuto;
  
  const daysLeftText = !isExpired && alert._daysLeft !== null ? (
    alert._daysLeft === 0 ? '<span class="alert-countdown-value text-danger fw-600" style="background:#FEF2F2; padding:2px 8px; border-radius:12px;">🔥 Último dia!</span>' : 
    alert._daysLeft === 1 ? '<span class="alert-countdown-value text-warning fw-600" style="background:#FFFBEB; padding:2px 8px; border-radius:12px;">⚡ 1 dia restante</span>' : 
    `<span class="alert-countdown-value text-primary" style="background:var(--primary-bg); padding:2px 8px; border-radius:12px;">⏰ ${alert._daysLeft} dias restantes</span>`
  ) : '';

  // Processamento e visualização de CPM
  const cpmInfo = calculateAlertCPM(alert);
  let cpmDisplay = '';
  if (cpmInfo) {
    let cpmClass = 'cpm-style-neutral';
    
    // Comparar o CPM da promoção com os preços do programa associado para avaliar se é bom
    const compProg = prog || (alert.title.toLowerCase().includes("smiles") ? getProgramById("smiles") :
                             alert.title.toLowerCase().includes("latam") ? getProgramById("latam") :
                             alert.title.toLowerCase().includes("azul") ? getProgramById("azul") : null);
    
    if (compProg) {
      if (cpmInfo.value <= compProg.bestPrice) {
        cpmClass = 'cpm-style-excellent';
      } else if (cpmInfo.value <= compProg.goodPrice) {
        cpmClass = 'cpm-style-good';
      } else if (cpmInfo.value >= compProg.regularPrice) {
        cpmClass = 'cpm-style-bad';
      }
    } else {
      // Regras heurísticas gerais de mercado
      if (cpmInfo.value <= 14.0) {
        cpmClass = 'cpm-style-excellent';
      } else if (cpmInfo.value <= 17.5) {
        cpmClass = 'cpm-style-good';
      } else if (cpmInfo.value >= 30.0) {
        cpmClass = 'cpm-style-bad';
      }
    }

    cpmDisplay = `
      <div class="alert-cpm-badge ${cpmClass}" title="${cpmInfo.explanation}">
        <span class="cpm-label">CPM Final</span>
        <span class="cpm-value">R$ ${cpmInfo.value.toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  }

  return `
    <div class="alert-list-item rating-${rating} ${isExpired ? 'expired' : ''}">
      <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start; min-width: 130px; flex-shrink: 0;">
        ${renderAlertRatingLabel(rating)}
        ${prog ? `
          <span class="program-badge" style="margin-top: 2px;">
            <span class="program-dot" style="background:${prog.color}"></span>
            ${prog.icon} ${prog.name}
          </span>
        ` : ''}
      </div>

      <div class="alert-list-content">
        <div class="alert-list-title-row">
          ${isAuto ? '<span class="badge badge-info" style="font-size: 0.65rem; padding: 2px 6px; margin-right: 4px;">Auto</span>' : ''}
          <span class="alert-list-title">${alert.title}</span>
        </div>
        <div class="alert-list-description">${alert.description || ''}</div>
        <div class="alert-list-meta-row">
          <div class="alert-list-meta-item">
            📅 ${alert.startDate ? formatDate(alert.startDate) : ''} ${alert.endDate ? `→ ${formatDate(alert.endDate)}` : ''}
          </div>
          ${daysLeftText ? `<div class="alert-list-meta-item">${daysLeftText}</div>` : ''}
          ${isExpired ? '<span class="badge badge-danger">Expirado</span>' : ''}
        </div>
      </div>

      ${cpmDisplay}

      <div class="alert-list-actions">
        ${!isAuto ? `
          <button class="btn btn-danger btn-icon" onclick="deleteAlert('${alert.id}')" title="Remover" style="width:28px; height:28px; font-size:0.875rem;">✕</button>
        ` : `
          <span style="font-size: 1.1rem; filter: grayscale(0.5); cursor: help;" title="Alerta automático atualizado via portal Melhores Cartões/Melhores Destinos">🤖</span>
        `}
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
  const rating = document.getElementById('alert-rating').value;
  const cpmValue = document.getElementById('alert-cpm').value;
  const cpm = cpmValue ? parseFloat(cpmValue) : null;
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
    rating,
    cpm,
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
  document.getElementById('alert-rating').value = 'neutral';
  document.getElementById('alert-cpm').value = '';
  document.getElementById('alert-program').value = '';
  document.getElementById('alert-end').value = '';
}

function deleteAlert(id) {
  if (typeof LIVE_OFFERS !== 'undefined' && LIVE_OFFERS.some(a => a.id === id)) {
    showToast('Este alerta é automático e não pode ser removido localmente', 'error');
    return;
  }
  if (confirm('Remover este alerta?')) {
    AppState.removeAlert(id);
    showToast('Alerta removido');
    renderAlerts();
  }
}
