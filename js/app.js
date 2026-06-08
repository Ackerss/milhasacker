/* ============================================
   MILHAS ACKER — App Core
   Navegação, estado global, localStorage
   ============================================ */

// ============= Estado Global =============
const AppState = {
  activeView: 'dashboard',
  activeUser: 'consolidado',
  
  // localStorage keys
  KEYS: {
    BALANCES: 'milhas_balances',
    HISTORY: 'milhas_history',
    PLANS: 'milhas_plans',
    ALERTS: 'milhas_alerts',
    CURRENT_PRICES: 'milhas_current_prices',
    ACTIVE_USER: 'milhas_active_user'
  },

  // Getters com localStorage
  getBalances() {
    return JSON.parse(localStorage.getItem(this.KEYS.BALANCES) || '[]');
  },
  setBalances(data) {
    localStorage.setItem(this.KEYS.BALANCES, JSON.stringify(data));
  },

  getHistory() {
    return JSON.parse(localStorage.getItem(this.KEYS.HISTORY) || '[]');
  },
  addHistory(entry) {
    const history = this.getHistory();
    entry.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    entry.createdAt = new Date().toISOString();
    history.unshift(entry);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    return entry;
  },
  removeHistory(id) {
    const history = this.getHistory().filter(h => h.id !== id);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
  },
  updateHistory(id, updatedFields) {
    const history = this.getHistory();
    const index = history.findIndex(h => h.id === id);
    if (index !== -1) {
      history[index] = { ...history[index], ...updatedFields, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
      return history[index];
    }
    return null;
  },

  getPlans() {
    return JSON.parse(localStorage.getItem(this.KEYS.PLANS) || '[]');
  },
  savePlans(data) {
    localStorage.setItem(this.KEYS.PLANS, JSON.stringify(data));
  },
  addPlan(plan) {
    const plans = this.getPlans();
    plan.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    plans.push(plan);
    this.savePlans(plans);
    return plan;
  },
  removePlan(id) {
    const plans = this.getPlans().filter(p => p.id !== id);
    this.savePlans(plans);
  },
  updatePlan(id, updatedFields) {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updatedFields };
      this.savePlans(plans);
      return plans[index];
    }
    return null;
  },

  getAlerts() {
    return JSON.parse(localStorage.getItem(this.KEYS.ALERTS) || '[]');
  },
  saveAlerts(data) {
    localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(data));
  },
  addAlert(alert) {
    const alerts = this.getAlerts();
    alert.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    alerts.push(alert);
    this.saveAlerts(alerts);
    return alert;
  },
  removeAlert(id) {
    const alerts = this.getAlerts().filter(a => a.id !== id);
    this.saveAlerts(alerts);
  },

  getCurrentPrices() {
    return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_PRICES) || '{}');
  },
  setCurrentPrice(programId, price) {
    const prices = this.getCurrentPrices();
    prices[programId] = { price: parseFloat(price), date: new Date().toISOString().split('T')[0] };
    localStorage.setItem(this.KEYS.CURRENT_PRICES, JSON.stringify(prices));
  },

  // Calcular saldo de uma pessoa em um programa
  getBalance(userId, programId) {
    if (userId === 'consolidado') {
      return this.getBalance('jacson', programId) + this.getBalance('ana', programId);
    }
    const history = this.getHistory();
    let balance = 0;
    history.forEach(entry => {
      if (entry.userId !== userId || entry.programId !== programId) return;
      switch (entry.type) {
        case 'compra':
        case 'transferencia_entrada':
        case 'bonus':
        case 'clube':
        case 'cartao':
          balance += entry.quantity;
          break;
        case 'uso':
        case 'expiracao':
        case 'transferencia_saida':
          balance -= entry.quantity;
          break;
      }
    });
    return Math.max(0, balance);
  },

  // Calcular saldo total de uma pessoa
  getTotalBalance(userId) {
    let total = 0;
    PROGRAMS.forEach(p => {
      total += this.getBalance(userId, p.id);
    });
    return total;
  },

  // Seed dados de exemplo se primeira vez (agora inicia limpo por padrão)
  seedIfEmpty() {
    if (localStorage.getItem('milhas_seeded')) return;
    // Por padrão de fábrica, inicia limpo
    localStorage.setItem('milhas_seeded', 'true');
  },

  // Carregar dados fictícios para fins de demonstração
  loadDemoData() {
    // Limpar dados existentes primeiro
    localStorage.removeItem(this.KEYS.HISTORY);
    localStorage.removeItem(this.KEYS.PLANS);
    localStorage.removeItem(this.KEYS.ALERTS);
    localStorage.removeItem(this.KEYS.CURRENT_PRICES);
    
    // Adicionar alguns saldos exemplo
    const sampleHistory = [
      { userId: 'jacson', programId: 'latam', type: 'cartao', quantity: 8500, cpm: 0, note: 'Acúmulo cartão de crédito', date: '2026-01-15' },
      { userId: 'jacson', programId: 'smiles', type: 'compra', quantity: 10000, cpm: 16.50, note: 'Compra promoção Smiles', date: '2026-02-20' },
      { userId: 'jacson', programId: 'livelo', type: 'clube', quantity: 5000, cpm: 35.00, note: 'Crédito mensal Clube Livelo', date: '2026-05-01' },
      { userId: 'jacson', programId: 'azul', type: 'transferencia_entrada', quantity: 15000, cpm: 12.00, note: 'Transferência Livelo→Azul com 100% bônus', date: '2026-03-10' },
      { userId: 'ana', programId: 'smiles', type: 'cartao', quantity: 6000, cpm: 0, note: 'Acúmulo cartão de crédito', date: '2026-01-20' },
      { userId: 'ana', programId: 'latam', type: 'compra', quantity: 5000, cpm: 25.00, note: 'Compra pontos LATAM', date: '2026-04-15' },
      { userId: 'ana', programId: 'livelo', type: 'clube', quantity: 3000, cpm: 35.00, note: 'Crédito mensal Clube Livelo', date: '2026-05-01' },
    ];

    sampleHistory.forEach(entry => this.addHistory(entry));

    // Planos exemplo
    const samplePlans = [
      { userId: 'jacson', name: 'Clube Livelo', programId: 'livelo', monthlyValue: 79.90, monthlyPoints: 5000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'ativo' },
      { userId: 'ana', name: 'Clube Livelo', programId: 'livelo', monthlyValue: 49.90, monthlyPoints: 3000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'ativo' },
    ];

    samplePlans.forEach(plan => this.addPlan(plan));

    // Alertas exemplo
    const sampleAlerts = [
      { title: 'Aniversário Livelo', description: 'Compra de pontos com até 57% OFF. Aproveite para estocar pontos!', programId: 'livelo', startDate: '2026-06-01', endDate: '2026-06-15', active: true },
    ];

    sampleAlerts.forEach(alert => this.addAlert(alert));

    localStorage.setItem('milhas_seeded', 'demo');
  },

  // Limpar todos os dados do sistema
  clearAllData() {
    localStorage.removeItem(this.KEYS.HISTORY);
    localStorage.removeItem(this.KEYS.PLANS);
    localStorage.removeItem(this.KEYS.ALERTS);
    localStorage.removeItem(this.KEYS.CURRENT_PRICES);
    localStorage.setItem('milhas_seeded', 'true');
  }
};

// ============= Navegação =============
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (!view) return;
      navigateTo(view);
    });
  });

  // User toggle
  const userBtns = document.querySelectorAll('.user-toggle-btn');
  userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.user;
      setActiveUser(userId);
    });
  });

  // Mobile menu
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Restore active user
  const savedUser = localStorage.getItem(AppState.KEYS.ACTIVE_USER);
  if (savedUser) {
    AppState.activeUser = savedUser;
  }
  updateUserToggle();
}

function navigateTo(viewId) {
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  // Update view sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.toggle('active', section.id === `view-${viewId}`);
  });

  // Update header title
  const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (activeNav) {
    const icon = activeNav.querySelector('.nav-item-icon').textContent;
    const label = activeNav.querySelector('.nav-item-label')?.textContent || activeNav.textContent.trim();
    document.querySelector('.header-title-icon').textContent = icon;
    document.querySelector('.header-title-text').textContent = label;
  }

  AppState.activeView = viewId;

  // Close mobile sidebar
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('active');

  // Refresh view content
  refreshView(viewId);
}

function setActiveUser(userId) {
  AppState.activeUser = userId;
  localStorage.setItem(AppState.KEYS.ACTIVE_USER, userId);
  updateUserToggle();
  refreshView(AppState.activeView);
}

function updateUserToggle() {
  document.querySelectorAll('.user-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.user === AppState.activeUser);
  });
  
  // Update header user display
  const userDisplay = document.getElementById('header-user-name');
  if (userDisplay) {
    const user = USERS_LIST.find(u => u.id === AppState.activeUser);
    userDisplay.textContent = user ? `${user.icon} ${user.name}` : '';
  }
}

function refreshView(viewId) {
  switch (viewId) {
    case 'dashboard': renderDashboard(); break;
    case 'calendar': renderCalendar(); break;
    case 'prices': renderPrices(); break;
    case 'balance': renderBalance(); break;
    case 'plans': renderPlans(); break;
    case 'simulator': renderSimulator(); break;
    case 'alerts': renderAlerts(); break;
    case 'settings': renderSettings(); break;
    case 'shopping': renderShopping(); break;
  }
}

// ============= Modals =============
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllModals();
});

// ============= Toast Notifications =============
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============= Status de Scraping de Ofertas =============
function renderScrapStatusHeader() {
  if (typeof LIVE_OFFERS_METADATA === 'undefined' || !LIVE_OFFERS_METADATA.lastUpdated) {
    return `<div style="padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-size: 0.8125rem; font-weight: 500; border-left: 4px solid var(--danger); background: var(--danger-bg); color: var(--danger);">
      ⚠️ <strong>Erro de Conexão:</strong> Não foi possível carregar as ofertas em tempo real. Verifique a sua conexão ou se o arquivo js/offers.js está presente.
    </div>`;
  }

  const lastUpdate = new Date(LIVE_OFFERS_METADATA.lastUpdated);
  const now = new Date();
  const diffHours = Math.abs(now - lastUpdate) / (1000 * 60 * 60);

  // Se a última atualização foi há mais de 24 horas, avisa que está desatualizado
  if (diffHours > 24) {
    return `<div style="padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-size: 0.8125rem; font-weight: 500; border-left: 4px solid var(--danger); background: var(--danger-bg); color: var(--danger); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span>⚠️ <strong>Atenção:</strong> O rastreador automático de ofertas está sem sincronizar há mais de 24 horas. As promoções abaixo podem estar desatualizadas. Última atualização: ${lastUpdate.toLocaleString('pt-BR')}.</span>
      <span class="badge badge-danger">Desatualizado</span>
    </div>`;
  }

  // Exibe status verde e sutil de "Atualizado"
  return `<div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-md); font-weight: 500;">
    <span style="display:inline-block; width:6px; height:6px; background:var(--success); border-radius:50%; box-shadow: 0 0 6px var(--success);"></span>
    Ofertas automáticas rastreadas em tempo real. Última verificação: ${lastUpdate.toLocaleString('pt-BR')} (Melhores Cartões)
  </div>`;
}

// ============= Init =============
document.addEventListener('DOMContentLoaded', () => {
  AppState.seedIfEmpty();
  initNavigation();
  navigateTo('dashboard');
});
