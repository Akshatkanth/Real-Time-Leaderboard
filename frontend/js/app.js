/* ═══════════════════════════════════════════
   App — Router, Navigation, Initialization
   ═══════════════════════════════════════════ */

const App = (() => {
  let currentRoute = 'leaderboard';

  // Routes config — public vs authenticated
  const routes = {
    auth:        { view: AuthView,        auth: false, navLabel: null },
    dashboard:   { view: DashboardView,   auth: true,  navLabel: 'Submit',     icon: 'send' },
    leaderboard: { view: LeaderboardView, auth: false, navLabel: 'Leaderboard', icon: 'trophy' },
    rank:        { view: RankView,        auth: true,  navLabel: 'My Rank',    icon: 'user' },
    report:      { view: ReportView,      auth: true,  navLabel: 'Reports',    icon: 'chart' },
  };

  const icons = {
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  };

  function init() {
    renderNav();
    // Start on leaderboard (public)
    navigate(API.isLoggedIn() ? 'dashboard' : 'leaderboard');
  }

  function navigate(route) {
    // Guard auth-required routes
    if (routes[route]?.auth && !API.isLoggedIn()) {
      route = 'auth';
    }

    currentRoute = route;
    const appEl = document.getElementById('app');
    const view = routes[route]?.view;

    if (view) {
      appEl.innerHTML = view.render();
      if (view.onMount) view.onMount();
    }

    renderNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderNav() {
    const navLinks = document.getElementById('nav-links');
    const navUser = document.getElementById('nav-user');
    const loggedIn = API.isLoggedIn();
    const user = API.getUser();

    // Build nav links
    const visibleRoutes = Object.entries(routes).filter(([key, cfg]) => {
      if (!cfg.navLabel) return false;
      if (cfg.auth && !loggedIn) return false;
      return true;
    });

    navLinks.innerHTML = visibleRoutes.map(([key, cfg]) => `
      <button class="nav-link ${currentRoute === key ? 'active' : ''}" onclick="App.navigate('${key}')">
        ${icons[cfg.icon] || ''}
        <span>${cfg.navLabel}</span>
      </button>
    `).join('');

    // User area
    if (loggedIn && user) {
      navUser.innerHTML = `
        <div class="user-badge">
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <span>${user.username}</span>
        </div>
        <button class="btn-logout" onclick="App.handleLogout()">Logout</button>
      `;
    } else {
      navUser.innerHTML = `
        <button class="btn" onclick="App.navigate('auth')">Sign In</button>
      `;
    }

    // Brand click -> leaderboard
    document.getElementById('nav-brand').onclick = () => navigate('leaderboard');
  }

  function handleLogout() {
    API.logout();
    showToast('Logged out', 'info');
    navigate('leaderboard');
  }

  // ── Toast System ──
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  return { init, navigate, handleLogout, showToast };
})();

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', App.init);
