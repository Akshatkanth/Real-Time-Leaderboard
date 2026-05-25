/* ═══════════════════════════════════════════
   Rank View — Your rank across all categories
   ═══════════════════════════════════════════ */

const RankView = (() => {
  const CATEGORIES = [
    { key: 'global', label: 'Global', icon: '🌍' },
    { key: 'total_characters', label: 'Characters', icon: '📝' },
    { key: 'uppercase', label: 'Uppercase', icon: '🔠' },
    { key: 'emojis', label: 'Emojis', icon: '😎' },
    { key: 'special_characters', label: 'Special Chars', icon: '✨' },
  ];

  function render() {
    return `
      <div class="view-enter">
        <div class="page-header">
          <h1 class="page-title">My <span class="gradient">Rankings</span></h1>
          <p class="page-subtitle">See where you stand across every category</p>
        </div>
        <div class="rank-grid" id="rank-grid">
          ${CATEGORIES.map(() => `<div class="skeleton skeleton-card"></div>`).join('')}
        </div>
      </div>
    `;
  }

  async function onMount() {
    const grid = document.getElementById('rank-grid');
    if (!grid) return;

    const results = await Promise.allSettled(
      CATEGORIES.map(cat => API.getUserRank(cat.key))
    );

    grid.innerHTML = CATEGORIES.map((cat, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        const data = result.value.data;
        return `
          <div class="rank-card cat-${cat.key}" style="animation: scorePopIn var(--duration-slow) var(--ease-spring) ${i * 80}ms forwards; opacity: 0;">
            <div class="rank-position text-gradient">#${data.rank}</div>
            <div class="rank-position-label">Rank</div>
            <div class="rank-category-name">${cat.icon} ${cat.label}</div>
            <div class="rank-score-value">Score: ${data.score.toLocaleString()}</div>
          </div>
        `;
      } else {
        return `
          <div class="rank-card cat-${cat.key}" style="animation: scorePopIn var(--duration-slow) var(--ease-spring) ${i * 80}ms forwards; opacity: 0;">
            <div class="rank-position" style="color: var(--text-muted);">—</div>
            <div class="rank-position-label">No Rank</div>
            <div class="rank-category-name">${cat.icon} ${cat.label}</div>
            <div class="rank-score-value" style="color: var(--text-muted);">Submit text to get ranked</div>
          </div>
        `;
      }
    }).join('');
  }

  return { render, onMount };
})();
