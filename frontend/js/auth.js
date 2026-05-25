/* ═══════════════════════════════════════════
   Auth View — Login / Register
   ═══════════════════════════════════════════ */

const AuthView = (() => {
  let currentTab = 'login';

  function render() {
    return `
      <div class="auth-container view-enter">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h1 class="auth-title">Welcome</h1>
            <p class="auth-subtitle">Sign in to compete on the leaderboard</p>
          </div>
          <div class="auth-body">
            <div class="auth-tabs">
              <button class="auth-tab ${currentTab === 'login' ? 'active' : ''}" id="tab-login" onclick="AuthView.switchTab('login')">Sign In</button>
              <button class="auth-tab ${currentTab === 'register' ? 'active' : ''}" id="tab-register" onclick="AuthView.switchTab('register')">Sign Up</button>
            </div>
            <form id="auth-form" onsubmit="AuthView.handleSubmit(event)">
              ${currentTab === 'register' ? `
                <div class="form-group">
                  <label class="form-label" for="auth-username">Username</label>
                  <input class="form-input" id="auth-username" type="text" placeholder="Choose a username" required autocomplete="username" />
                </div>
              ` : ''}
              <div class="form-group">
                <label class="form-label" for="auth-email">Email</label>
                <input class="form-input" id="auth-email" type="email" placeholder="you@example.com" required autocomplete="email" />
              </div>
              <div class="form-group">
                <label class="form-label" for="auth-password">Password</label>
                <input class="form-input" id="auth-password" type="password" placeholder="••••••••" required autocomplete="${currentTab === 'register' ? 'new-password' : 'current-password'}" minlength="6" />
              </div>
              <div id="auth-error" class="error-text" style="display:none;"></div>
              <button type="submit" class="btn btn-primary mt-2" id="auth-submit-btn">
                ${currentTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  function switchTab(tab) {
    currentTab = tab;
    document.getElementById('app').innerHTML = render();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('auth-submit-btn');
    const errorEl = document.getElementById('auth-error');
    errorEl.style.display = 'none';

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
      if (currentTab === 'login') {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        await API.login(email, password);
        App.showToast('Welcome back!', 'success');
      } else {
        const username = document.getElementById('auth-username').value;
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        await API.register(username, email, password);
        // Auto-login after register
        await API.login(email, password);
        App.showToast('Account created! Welcome!', 'success');
      }
      App.navigate('dashboard');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = currentTab === 'login' ? 'Sign In' : 'Create Account';
    }
  }

  return { render, switchTab, handleSubmit };
})();
