/* ═══════════════════════════════════════════
   Dashboard View — Submit text & see scores
   ═══════════════════════════════════════════ */

const DashboardView = (() => {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
  const specialCharRegex = /[^a-zA-Z0-9\s\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

  function analyzeText(text) {
    return {
      total_characters: text.length,
      uppercase: (text.match(/[A-Z]/g) || []).length,
      emojis: (text.match(emojiRegex) || []).length,
      special_characters: (text.match(specialCharRegex) || []).length,
    };
  }

  function render() {
    const user = API.getUser();
    return `
      <div class="view-enter">
        <div class="page-header">
          <h1 class="page-title">Hey, <span class="brand-text">${user?.username || 'Player'}</span></h1>
          <p class="page-subtitle">Submit text to climb the leaderboard. Every character counts.</p>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Submit Text</h2>
            </div>
            <div class="card-body">
              <form id="submit-form" onsubmit="DashboardView.handleSubmit(event)">
                <div class="submit-section">
                  <textarea
                    class="form-input"
                    id="text-input"
                    placeholder="Type or paste your text here... Use UPPERCASE, emojis 🎉🔥, and special characters !@#$ to score in different categories."
                    required
                    oninput="DashboardView.updatePreview()"
                  ></textarea>
                  <span class="char-count" id="char-count">0 chars</span>
                </div>

                <div class="text-stats-bar" id="text-stats">
                  <span class="text-stat"><span class="text-stat-dot" style="background:var(--neon-cyan); color:var(--neon-cyan);"></span> Characters: <strong id="preview-chars">0</strong></span>
                  <span class="text-stat"><span class="text-stat-dot" style="background:var(--neon-purple); color:var(--neon-purple);"></span> Uppercase: <strong id="preview-upper">0</strong></span>
                  <span class="text-stat"><span class="text-stat-dot" style="background:var(--neon-orange); color:var(--neon-orange);"></span> Emojis: <strong id="preview-emoji">0</strong></span>
                  <span class="text-stat"><span class="text-stat-dot" style="background:var(--neon-pink); color:var(--neon-pink);"></span> Special: <strong id="preview-special">0</strong></span>
                </div>

                <button type="submit" class="btn btn-primary" id="submit-btn" style="margin-top:0.75rem;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div id="score-results" style="display:none;">
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Scores Earned</h2>
              </div>
              <div class="card-body">
                <div class="score-grid" id="score-grid"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updatePreview() {
    const text = document.getElementById('text-input').value;
    const stats = analyzeText(text);

    document.getElementById('char-count').textContent = `${text.length} chars`;
    document.getElementById('preview-chars').textContent = stats.total_characters;
    document.getElementById('preview-upper').textContent = stats.uppercase;
    document.getElementById('preview-emoji').textContent = stats.emojis;
    document.getElementById('preview-special').textContent = stats.special_characters;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const text = document.getElementById('text-input').value;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Analyzing...';

    try {
      const result = await API.submitText(text);
      const scores = result.data;

      const categories = [
        { key: 'total_characters', label: 'Characters', icon: '📝' },
        { key: 'uppercase', label: 'Uppercase', icon: '🔠' },
        { key: 'emojis', label: 'Emojis', icon: '😎' },
        { key: 'special_characters', label: 'Special Chars', icon: '✨' },
      ];

      const grid = document.getElementById('score-grid');
      grid.innerHTML = categories.map((cat, i) => `
        <div class="score-card cat-${cat.key}" style="animation: scorePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms forwards; opacity: 0;">
          <div class="score-value">${scores[cat.key]}</div>
          <div class="score-label">${cat.icon} ${cat.label}</div>
        </div>
      `).join('');

      document.getElementById('score-results').style.display = 'block';
      document.getElementById('text-input').value = '';
      updatePreview();

      App.showToast('Score submitted! Check the leaderboard 🚀', 'success');
    } catch (err) {
      App.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Submit
      `;
    }
  }

  return { render, updatePreview, handleSubmit };
})();
