/* ═══════════════════════════════════════════
   Leaderboard View — Rankings by category
   ═══════════════════════════════════════════ */

const LeaderboardView = (() => {
  let activeCategory = 'global';

  const CATEGORIES = [
    { key: 'global', label: 'Global' },
    { key: 'total_characters', label: 'Characters' },
    { key: 'uppercase', label: 'Uppercase' },
    { key: 'emojis', label: 'Emojis' },
    { key: 'special_characters', label: 'Special' },
  ];

  function render() {
    return `
      <div class="view-enter">
        <div class="page-header">
          <h1 class="page-title"><span class="brand-text">Leaderboard</span></h1>
          <p class="page-subtitle">Real-time Global Network Rankings</p>
        </div>

        <div class="category-tabs" id="leaderboard-tabs">
          ${CATEGORIES.map(cat => `
            <button class="category-tab ${cat.key === activeCategory ? 'active' : ''}"
                    data-category="${cat.key}"
                    onclick="LeaderboardView.switchCategory('${cat.key}')">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-body" id="leaderboard-content">
            ${renderSkeletons()}
          </div>
        </div>
      </div>
    `;
  }

  function renderSkeletons() {
    return Array.from({ length: 5 }, () =>
      `<div class="leaderboard-row" style="opacity: 0.5; animation: none;">
         <div class="rank-badge">-</div>
         <div class="player-avatar skeleton"></div>
         <div class="player-name" style="color:var(--text-muted)">Loading data...</div>
         <div class="player-score">...</div>
       </div>`
    ).join('');
  }

  async function loadData(category) {
    const content = document.getElementById('leaderboard-content');
    if (!content) return;

    content.innerHTML = renderSkeletons();

    try {
      const result = await API.getLeaderboard(category);
      const data = result.data;

      if (!data || data.length === 0) {
        content.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <div class="empty-state-text">No scores yet</div>
            <div class="empty-state-sub">Be the first to submit text and claim the top spot!</div>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="leaderboard-list">
          ${data.map((entry, i) => `
            <div class="leaderboard-row" style="animation: listPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms forwards; opacity: 0;">
              <div class="rank-badge ${i < 3 ? 'rank-' + (i + 1) : ''}">
                ${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + entry.rank}
              </div>
              <div class="player-avatar">${entry.username.charAt(0).toUpperCase()}</div>
              <div class="player-name">${escapeHtml(entry.username)}</div>
              <div class="player-score">${entry.score.toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Failed to load</div>
          <div class="empty-state-sub">${escapeHtml(err.message)}</div>
        </div>
      `;
    }
  }

  function switchCategory(category) {
    activeCategory = category;

    // Update tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    loadData(category);
  }

  function onMount() {
    loadData(activeCategory);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, switchCategory, onMount };
})();
