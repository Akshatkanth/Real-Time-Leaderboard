/* ═══════════════════════════════════════════
   Report View — Top players by time period
   ═══════════════════════════════════════════ */

const ReportView = (() => {
  let activePeriod = '7d';

  const PERIODS = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '1y', label: 'Last Year' },
  ];

  const CATEGORY_LABELS = {
    total_characters: 'Total Characters',
    uppercase: 'Uppercase Letters',
    emojis: 'Emojis',
    special_characters: 'Special Characters',
  };

  function render() {
    return `
      <div class="view-enter">
        <div class="page-header">
          <h1 class="page-title"><span class="gradient">Reports</span></h1>
          <p class="page-subtitle">Top performers by time period — powered by PostgreSQL</p>
        </div>

        <div class="period-tabs" id="period-tabs">
          ${PERIODS.map(p => `
            <button class="period-tab ${p.key === activePeriod ? 'active' : ''}"
                    data-period="${p.key}"
                    onclick="ReportView.switchPeriod('${p.key}')">
              ${p.label}
            </button>
          `).join('')}
        </div>

        <div id="report-content">
          ${renderSkeletons()}
        </div>
      </div>
    `;
  }

  function renderSkeletons() {
    return Array.from({ length: 4 }, () => `
      <div class="report-section">
        <div class="skeleton" style="width:160px;height:20px;margin-bottom:12px;border-radius:6px;"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
      </div>
    `).join('');
  }

  async function loadData(period) {
    const content = document.getElementById('report-content');
    if (!content) return;

    content.innerHTML = renderSkeletons();

    try {
      const result = await API.getReport(period);
      const data = result.data;

      if (!data || data.length === 0) {
        content.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">No data for this period</div>
            <div class="empty-state-sub">Try a longer time range</div>
          </div>
        `;
        return;
      }

      content.innerHTML = data.map(section => `
        <div class="report-section">
          <div class="report-category-title">
            <span class="report-category-dot cat-${section.category}"></span>
            ${CATEGORY_LABELS[section.category] || section.category}
          </div>
          ${section.topPlayers.length === 0
            ? `<div class="empty-state" style="padding:1rem;"><div class="empty-state-sub">No scores in this period</div></div>`
            : `<div class="leaderboard-list">
                ${section.topPlayers.map((player, i) => `
                  <div class="leaderboard-row" style="animation-delay: ${i * 50}ms">
                    <div class="rank-badge ${i < 3 ? 'rank-' + (i + 1) : ''}">
                      ${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + player.rank}
                    </div>
                    <div class="player-name">${escapeHtml(player.username)}</div>
                    <div class="player-score">${player.score.toLocaleString()}</div>
                  </div>
                `).join('')}
              </div>`
          }
        </div>
      `).join('');
    } catch (err) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Failed to load report</div>
          <div class="empty-state-sub">${escapeHtml(err.message)}</div>
        </div>
      `;
    }
  }

  function switchPeriod(period) {
    activePeriod = period;

    document.querySelectorAll('.period-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.period === period);
    });

    loadData(period);
  }

  function onMount() {
    loadData(activePeriod);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, switchPeriod, onMount };
})();
