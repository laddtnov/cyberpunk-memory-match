// ── Rank & Stats Functions ──

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem('cyberpunk_match_stats'));
    if (saved) return { ...DEFAULT_STATS, ...saved };
  } catch (e) {
    console.warn('[Netrunner.ERROR]', {
      message: e?.message,
      stack: e?.stack
    });
  }
  return { ...DEFAULT_STATS };
}

function saveStats(stats) {
  localStorage.setItem('cyberpunk_match_stats', JSON.stringify(stats));
}

function getRankForXP(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.xp) rank = r;
  }
  return rank;
}

function getNextRank(currentRankName) {
  const idx = RANKS.findIndex(r => r.name === currentRankName);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

function calculateXP(difficulty, moves, maxMoves, seconds, won) {
  if (!won) return 5;
  const base = { easy: 20, medium: 50, hard: 100, extreme: 200 };
  const moveBonus = Math.max(0, Math.floor((maxMoves - moves) / maxMoves * 50));
  const timeBonus = Math.max(0, 50 - Math.floor(seconds / 10));
  return (base[difficulty] || 20) + moveBonus + timeBonus;
}

function getUnlockedSkins(xp) {
  const skins = ['default'];
  for (const r of RANKS) {
    if (xp >= r.xp && r.skin !== 'default' && !skins.includes(r.skin)) {
      skins.push(r.skin);
    }
  }
  return skins;
}
