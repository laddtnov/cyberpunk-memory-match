// ── Rank Up Overlay ──
function showRankUp(rankName, callback) {
  const overlay = document.getElementById('rankup-overlay');
  const nameEl = document.getElementById('rankup-name');
  nameEl.textContent = rankName;
  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
    if (callback) callback();
  }, 2200);
}

// ── Update Rank HUD ──
function updateRankHUD() {
  const rank = getRankForXP(playerStats.xp);
  const next = getNextRank(rank.name);

  if (rankDisplay) rankDisplay.textContent = rank.name;

  if (rankProgress && rankXP) {
    if (next) {
      const progress = ((playerStats.xp - rank.xp) / (next.xp - rank.xp)) * 100;
      rankProgress.style.width = Math.min(progress, 100) + '%';
      rankXP.textContent = playerStats.xp + '/' + next.xp + ' XP';
    } else {
      rankProgress.style.width = '100%';
      rankXP.textContent = playerStats.xp + ' XP (MAX)';
    }
  }
}

// ── Start with Difficulty (from modal) ──
function startWithDifficulty(diff) {
  gameState.difficulty = diff;
  rulesModal.classList.add('hidden');
  document.getElementById('back-to-game-btn').classList.add('hidden');
  initGame();
}

// ── Init / Restart ──
function initGame() {
  const config = difficulties[gameState.difficulty];

  gameState.flippedCards = [];
  gameState.matchedPairs = 0;
  gameState.totalPairs = config.pairs;
  gameState.maxMoves = config.maxMoves;
  gameState.moves = 0;
  gameState.seconds = 0;
  gameState.countdown = config.countdown || 0;
  gameState.timerStarted = false;
  gameState.isLocked = false;
  clearInterval(gameState.timerInterval);
  document.body.classList.remove('countdown-critical');

  movesDisplay.childNodes[0].textContent = '0';
  movesLimit.textContent = '/' + config.maxMoves;
  timerDisplay.textContent = config.countdown ? formatTime(config.countdown) : '00:00';
  winOverlay.classList.add('hidden');
  loseOverlay.classList.add('hidden');
  difficultyDisplay.textContent = config.label;
  particles.innerHTML = '';

  const hudItem = movesDisplay.closest('.hud-item');
  hudItem.classList.remove('moves-warning');

  board.className = '';
  board.classList.add(config.gridClass);

  // Apply active skin
  applySkin(playerStats.activeSkin);

  // Merge unlocked reward characters into the pool
  const rewardChars = getUnlockedRewardCharacters();
  const allCharacters = [...characters, ...rewardChars];
  const selected = shuffle(allCharacters).slice(0, config.pairs);
  const deck = shuffle([...selected, ...selected]);

  board.innerHTML = '';
  deck.forEach(char => board.appendChild(createCardElement(char)));

  updateRankHUD();
}

function restartGame() {
  initGame();
}

function showDifficultySelect() {
  clearInterval(gameState.timerInterval);
  document.body.classList.remove('countdown-critical');
  document.getElementById('back-to-game-btn').classList.remove('hidden');
  rulesModal.classList.remove('hidden');
}

function closeDifficultySelect() {
  rulesModal.classList.add('hidden');
  document.getElementById('back-to-game-btn').classList.add('hidden');
  // Resume timer if game was in progress
  if (gameState.timerStarted && gameState.matchedPairs < gameState.totalPairs) {
    startTimer();
  }
}

// ── Card Skins ──
function applySkin(skinName) {
  board.classList.remove('skin-default', 'skin-hologram', 'skin-corrupted', 'skin-gold', 'skin-elite');
  board.classList.add('skin-' + skinName);
}

function selectSkin(skinName) {
  if (!playerStats.unlockedSkins.includes(skinName)) return;
  playerStats.activeSkin = skinName;
  saveStats(playerStats);
  applySkin(skinName);
  renderSkinModal();
}

function toggleSkinModal() {
  if (!skinModal) return;
  skinModal.classList.toggle('hidden');
  if (!skinModal.classList.contains('hidden')) renderSkinModal();
}

function renderSkinModal() {
  const grid = document.getElementById('skin-grid');
  if (!grid) return;

  const skins = [
    { id: 'default',   name: 'DEFAULT',      rank: 'ROOKIE',          desc: 'Standard cyan scanlines' },
    { id: 'hologram',  name: 'HOLOGRAM',      rank: 'AGENT',           desc: 'Rainbow shimmer effect' },
    { id: 'corrupted', name: 'CORRUPTED',     rank: 'SPECIALIST',      desc: 'Red glitch pattern' },
    { id: 'gold',      name: 'GOLD CIRCUIT',  rank: 'GHOST',           desc: 'Gold circuit-board lines' },
    { id: 'elite',     name: 'ELITE NEON',    rank: 'NETRUNNER_ELITE', desc: 'Ultimate neon glow' },
  ];

  grid.innerHTML = skins.map(skin => {
    const unlocked = playerStats.unlockedSkins.includes(skin.id);
    const active = playerStats.activeSkin === skin.id;
    const isDisabled = !unlocked;
    return `
      <button class="skin-item ${unlocked ? 'unlocked' : 'locked'} ${active ? 'active' : ''}"
              onclick="${unlocked ? `selectSkin('${skin.id}')` : ''}"
              ${isDisabled ? 'disabled' : ''}>
        <div class="skin-preview skin-preview-${skin.id}"></div>
        <span class="skin-name">${skin.name}</span>
        <span class="skin-desc">${unlocked ? skin.desc : 'Unlock at ' + skin.rank}</span>
      </button>
    `;
  }).join('');
}

// ── Existing Features ──
function toggleEffects() {
  const body = document.body;
  const statusText = document.getElementById('status-text');
  body.classList.toggle('safe-mode');
  statusText.innerText = body.classList.contains('safe-mode') ? 'SAFE MODE' : 'CYBER MODE';
}

window.onblur = () => document.title = "SYSTEM ERROR...";
window.onfocus = () => document.title = "Cyberpunk Memory Match";

// ── Init rank HUD on load ──
updateRankHUD();
