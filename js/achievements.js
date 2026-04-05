// ── Achievement System ──

const ACHIEVEMENTS = [
  {
    id: 'zero_errors',
    name: 'ZERO ERRORS',
    symbol: '\u2714',
    desc: 'Win a game with no mismatches',
    check: (state, stats) => state.won && state.moves === state.matchedPairs,
  },
  {
    id: 'speedrunner',
    name: 'SPEEDRUNNER',
    symbol: '\u26A1',
    desc: 'Win a game in under 15 seconds',
    check: (state, stats) => state.won && state.seconds < 15,
  },
  {
    id: 'combo_master',
    name: 'COMBO MASTER',
    symbol: '\u2728',
    desc: 'Get a 5x combo in a single game',
    check: (state) => state.maxCombo >= 5,
  },
  {
    id: 'extreme_survivor',
    name: 'EXTREME SURVIVOR',
    symbol: '\u2622',
    desc: 'Win on EXTREME difficulty',
    check: (state) => state.won && state.difficulty === 'extreme',
  },
  {
    id: 'perfectionist',
    name: 'PERFECTIONIST',
    symbol: '\u2605',
    desc: 'Win on all 4 difficulties',
    check: (state, stats) => {
      const bt = stats.bestTimes || {};
      return bt.easy !== null && bt.medium !== null && bt.hard !== null && bt.extreme !== null;
    },
  },
  {
    id: 'grinder',
    name: 'GRINDER',
    symbol: '\u2699',
    desc: 'Play 50 games total',
    check: (state, stats) => stats.gamesPlayed >= 50,
  },
];

function loadAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem('cyberpunk_achievements'));
    if (saved) return saved;
  } catch (e) {
    console.warn('[Netrunner.ERROR]', { message: e?.message, stack: e?.stack });
  }
  return [];
}

function saveAchievements(unlocked) {
  localStorage.setItem('cyberpunk_achievements', JSON.stringify(unlocked));
}

let unlockedAchievements = loadAchievements();

function checkAchievements(gameResult) {
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlockedAchievements.includes(ach.id)) continue;
    if (ach.check(gameResult, playerStats)) {
      unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements(unlockedAchievements);
    showAchievementPopup(newlyUnlocked);
  }
}

function showAchievementPopup(achievements) {
  const popup = document.getElementById('achievement-popup');
  if (!popup) return;

  let idx = 0;
  function showNext() {
    if (idx >= achievements.length) {
      popup.classList.add('hidden');
      return;
    }
    const ach = achievements[idx];
    popup.querySelector('.achievement-symbol').textContent = ach.symbol;
    popup.querySelector('.achievement-name').textContent = ach.name;
    popup.querySelector('.achievement-desc').textContent = ach.desc;
    popup.classList.remove('hidden', 'achievement-slide');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        popup.classList.add('achievement-slide');
      });
    });
    idx++;
    setTimeout(showNext, 2500);
  }
  showNext();
}

function toggleAchievementModal() {
  const modal = document.getElementById('achievement-modal');
  if (!modal) return;
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) renderAchievementModal();
}

function renderAchievementModal() {
  const grid = document.getElementById('achievement-grid');
  const countEl = document.getElementById('achievement-count');
  if (!grid) return;

  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;

  if (countEl) {
    countEl.innerHTML = `UNLOCKED: <span>${unlocked}</span> / ${total}`;
  }

  grid.innerHTML = ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    return `
      <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
        <span class="achievement-item-symbol">${isUnlocked ? ach.symbol : '🔒'}</span>
        <div class="achievement-info">
          <span class="achievement-item-name">${ach.name}</span>
          <span class="achievement-item-desc">${ach.desc}</span>
        </div>
      </div>
    `;
  }).join('');
}
