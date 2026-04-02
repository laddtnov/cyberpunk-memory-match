// ── Sound Engine (Web Audio API) ──
const SoundEngine = {
  ctx: null,
  enabled: true,

  init() {
    if (this.ctx) return;
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;

    if (AudioCtx) {
      this.ctx = new AudioCtx();
    } else {
      console.warn('[Netrunner.AUDIO] AudioContext not supported');
      this.ctx = null;
    }
  },

  _shouldPlay() {
    return this.enabled && this.ctx && !document.body.classList.contains('safe-mode');
  },

  flip() {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Non-cryptographic randomness is intentional here (audio noise generation)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // NOSONAR
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.05);
  },

  match() {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    [400, 600].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + i * 0.05);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.3);
    });
  },

  error() {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.detune.setValueAtTime(15, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  },

  win() {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      // Simple delay for reverb feel
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.15;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.3;

      osc.connect(gain).connect(ctx.destination);
      gain.connect(delay).connect(delayGain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  },

  lose() {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Non-cryptographic randomness is intentional here (audio noise generation)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // NOSONAR
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Waveshaper for bitcrusher effect
    const waveshaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.3);
    }
    waveshaper.curve = curve;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(waveshaper).connect(filter).connect(gain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.6);
  },

  tick(warning = false) {
    if (!this._shouldPlay()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const freq = warning ? 1500 : 1000;
    const dur = warning ? 0.02 : 0.03;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  },

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.textContent = this.enabled ? 'SOUND: ON' : 'SOUND: OFF';
  }
};

// ── Character Data ──
const characters = [
  { id: 'netrunner', symbol: '>_',  name: 'NETRUNNER',  color: 'cyan' },
  { id: 'android',   symbol: '[AI]', name: 'ANDROID',   color: 'pink' },
  { id: 'mech',      symbol: '\u2699',   name: 'MECH PILOT', color: 'cyan' },
  { id: 'ghost',     symbol: '\u25CA',   name: 'GHOST',      color: 'pink' },
  { id: 'samurai',   symbol: '\u5200',   name: 'SAMURAI',   color: 'cyan' },
  { id: 'medic',     symbol: '+',   name: 'MEDIC',      color: 'pink' },
  { id: 'sniper',    symbol: '\u25CE',   name: 'SNIPER',    color: 'cyan' },
  { id: 'virus',     symbol: '\u2318',   name: 'VIRUS',     color: 'pink' },
  { id: 'phantom',   symbol: '\u25B3',   name: 'PHANTOM',   color: 'cyan' },
  { id: 'cipher',    symbol: '{}',  name: 'CIPHER',    color: 'pink' },
  { id: 'drone',     symbol: '\u2295',   name: 'DRONE',     color: 'cyan' },
  { id: 'rogue',     symbol: '\u2726',   name: 'ROGUE',     color: 'pink' },
  { id: 'hacker',    symbol: '\u2325',   name: 'HACKER',    color: 'cyan' },
  { id: 'synth',     symbol: '\u266A',   name: 'SYNTH',     color: 'pink' },
  { id: 'blade',     symbol: '\u2694',   name: 'BLADE',     color: 'cyan' },
  { id: 'oracle',    symbol: '\u25C9',   name: 'ORACLE',    color: 'pink' },
  { id: 'wraith',    symbol: '\u2620',   name: 'WRAITH',    color: 'cyan' },
  { id: 'glitch',    symbol: '\u2588',   name: 'GLITCH',    color: 'pink' },
];

// ── Rank System ──
const RANKS = [
  { name: 'ROOKIE',          xp: 0,    skin: 'default' },
  { name: 'AGENT',           xp: 100,  skin: 'hologram' },
  { name: 'SPECIALIST',      xp: 300,  skin: 'corrupted' },
  { name: 'GHOST',           xp: 600,  skin: 'gold' },
  { name: 'NETRUNNER_ELITE', xp: 1000, skin: 'elite' },
];

const DEFAULT_STATS = {
  xp: 0,
  rank: 'ROOKIE',
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimes: { easy: null, medium: null, hard: null, extreme: null },
  activeSkin: 'default',
  unlockedSkins: ['default'],
};

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

// ── Difficulty Config ──
const difficulties = {
  easy:    { pairs: 3,  gridClass: 'grid-easy',    label: 'EASY',    maxMoves: 10 },
  medium:  { pairs: 8,  gridClass: 'grid-medium',  label: 'MEDIUM',  maxMoves: 30 },
  hard:    { pairs: 12, gridClass: 'grid-hard',    label: 'HARD',    maxMoves: 40 },
  extreme: { pairs: 18, gridClass: 'grid-extreme', label: 'EXTREME', maxMoves: 60, countdown: 60 },
};

// ── Game State ──
const gameState = {
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 8,
  moves: 0,
  maxMoves: 30,
  seconds: 0,
  countdown: 0,
  timerInterval: null,
  timerStarted: false,
  isLocked: false,
  difficulty: 'medium',
};

// ── Player Stats (loaded from localStorage) ──
let playerStats = loadStats();

// ── DOM References ──
const board = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves-counter');
const movesLimit = document.getElementById('moves-limit');
const timerDisplay = document.getElementById('timer');
const winOverlay = document.getElementById('win-overlay');
const winMoves = document.getElementById('win-moves');
const winTime = document.getElementById('win-time');
const loseOverlay = document.getElementById('lose-overlay');
const losePairs = document.getElementById('lose-pairs');
const loseTotal = document.getElementById('lose-total');
const loseMovesStat = document.getElementById('lose-moves');
const loseSubtitle = document.querySelector('.lose-subtitle');
const rulesModal = document.getElementById('rules-modal');
const difficultyDisplay = document.getElementById('difficulty-display');
const particles = document.getElementById('particles');
const rankDisplay = document.getElementById('rank-display');
const rankProgress = document.getElementById('rank-progress');
const rankXP = document.getElementById('rank-xp');
const skinModal = document.getElementById('skin-modal');

// ── Shuffle (Fisher-Yates) ──
function secureRandomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ── Create Card Element ──
function createCardElement(character) {
  const card = document.createElement('div');
  card.classList.add('card', character.color);
  card.dataset.character = character.id;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-back"></div>
      <div class="card-front">
        <span class="card-symbol">${character.symbol}</span>
        <span class="card-name">${character.name}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => handleCardClick(card));
  return card;
}

// ── Handle Card Click ──
function handleCardClick(card) {
  if (
    gameState.isLocked ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) return;

  // Init audio on first interaction
  SoundEngine.init();

  if (!gameState.timerStarted) {
    startTimer();
    gameState.timerStarted = true;
  }

  SoundEngine.flip();
  card.classList.add('flipped');
  gameState.flippedCards.push(card);

  if (gameState.flippedCards.length === 2) {
    gameState.moves++;
    movesDisplay.childNodes[0].textContent = gameState.moves;
    updateMovesWarning();
    checkMatch();
  }
}

// ── Moves Warning ──
function updateMovesWarning() {
  const remaining = gameState.maxMoves - gameState.moves;
  const hudItem = movesDisplay.closest('.hud-item');
  if (remaining <= Math.ceil(gameState.maxMoves * 0.2)) {
    hudItem.classList.add('moves-warning');
  } else {
    hudItem.classList.remove('moves-warning');
  }
}

// ── Check Match ──
function checkMatch() {
  gameState.isLocked = true;
  const [card1, card2] = gameState.flippedCards;

  if (card1.dataset.character === card2.dataset.character) {
    SoundEngine.match();
    card1.classList.add('matched');
    card2.classList.add('matched');
    gameState.matchedPairs++;
    gameState.flippedCards = [];
    gameState.isLocked = false;

    if (gameState.matchedPairs === gameState.totalPairs) {
      winGame();
      return;
    }
  } else {
    SoundEngine.error();
    card1.classList.add('error');
    card2.classList.add('error');

    setTimeout(() => {
      card1.classList.remove('flipped', 'error');
      card2.classList.remove('flipped', 'error');
      gameState.flippedCards = [];
      gameState.isLocked = false;

      if (gameState.moves >= gameState.maxMoves) {
        loseGame();
      }
    }, 1000);
    return;
  }

  if (gameState.moves >= gameState.maxMoves) {
    loseGame();
  }
}

// ── Timer ──
function startTimer() {
  const config = difficulties[gameState.difficulty];
  const isCountdown = !!config.countdown;

  if (isCountdown) {
    gameState.countdown = config.countdown;
    timerDisplay.textContent = formatTime(gameState.countdown);
  }

  gameState.timerInterval = setInterval(() => {
    if (isCountdown) {
      gameState.countdown--;
      gameState.seconds++;
      timerDisplay.textContent = formatTime(gameState.countdown);

      // Countdown tick sounds
      if (gameState.countdown <= 10 && gameState.countdown > 0) {
        SoundEngine.tick(true);
        document.body.classList.add('countdown-critical');
      } else if (gameState.countdown > 10) {
        SoundEngine.tick(false);
      }

      if (gameState.countdown <= 0) {
        loseGame(true); // time expired
        return;
      }
    } else {
      gameState.seconds++;
      timerDisplay.textContent = formatTime(gameState.seconds);
    }
  }, 1000);
}

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

// ── Win ──
function winGame() {
  clearInterval(gameState.timerInterval);
  document.body.classList.remove('countdown-critical');

  const xpEarned = calculateXP(gameState.difficulty, gameState.moves, gameState.maxMoves, gameState.seconds, true);
  const oldRank = getRankForXP(playerStats.xp);
  playerStats.xp += xpEarned;
  playerStats.gamesPlayed++;
  playerStats.gamesWon++;
  playerStats.unlockedSkins = getUnlockedSkins(playerStats.xp);

  // Best time tracking
  const diff = gameState.difficulty;
  if (!playerStats.bestTimes[diff] || gameState.seconds < playerStats.bestTimes[diff]) {
    playerStats.bestTimes[diff] = gameState.seconds;
  }

  const newRank = getRankForXP(playerStats.xp);
  playerStats.rank = newRank.name;
  saveStats(playerStats);

  winMoves.textContent = gameState.moves;
  winTime.textContent = formatTime(gameState.seconds);
  document.getElementById('win-xp').textContent = '+' + xpEarned + ' XP';

  SoundEngine.win();

  // Check rank up
  if (newRank.name === oldRank.name) {
    setTimeout(() => {
      winOverlay.classList.remove('hidden');
      spawnParticles();
    }, 600);
    updateRankHUD();
    return;
  }

  showRankUp(newRank.name, () => {
    winOverlay.classList.remove('hidden');
    spawnParticles();
  });

  updateRankHUD();
}

// ── Win Particles ──
function spawnParticles() {
  particles.innerHTML = '';
  const colors = ['#00f3ff', '#ff0055', '#9d00ff', '#00ff88', '#ffff00'];

  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    // Non-cryptographic randomness for UI color selection
    const color = colors[Math.floor(Math.random() * colors.length)]; // NOSONAR
    // Non-cryptographic randomness for UI positioning
    const left = Math.random() * 100; // NOSONAR
    // Non-cryptographic randomness for UI sizing
    const height = 8 + Math.random() * 20; // NOSONAR
    // Non-cryptographic randomness for UI timing
    const delay = Math.random() * 2; // NOSONAR
    // Non-cryptographic randomness for animation duration
    const duration = 1.5 + Math.random() * 2; // NOSONAR

    p.style.cssText = `
      left: ${left}%;
      top: -20px;
      height: ${height}px;
      background: ${color};
      box-shadow: 0 0 6px ${color};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;
    particles.appendChild(p);
  }
}

// ── Lose ──
function loseGame(timeExpired = false) {
  clearInterval(gameState.timerInterval);
  gameState.isLocked = true;
  document.body.classList.remove('countdown-critical');

  const xpEarned = calculateXP(gameState.difficulty, gameState.moves, gameState.maxMoves, gameState.seconds, false);
  playerStats.xp += xpEarned;
  playerStats.gamesPlayed++;
  playerStats.unlockedSkins = getUnlockedSkins(playerStats.xp);
  playerStats.rank = getRankForXP(playerStats.xp).name;
  saveStats(playerStats);

  losePairs.textContent = gameState.matchedPairs;
  loseTotal.textContent = gameState.totalPairs;
  loseMovesStat.textContent = gameState.moves;
  document.getElementById('lose-xp').textContent = '+' + xpEarned + ' XP';

  if (timeExpired) {
    loseSubtitle.textContent = 'SYSTEM BREACH \u2014 TIME EXPIRED';
  } else {
    loseSubtitle.textContent = 'SYSTEM COMPROMISED';
  }

  SoundEngine.lose();

  setTimeout(() => {
    loseOverlay.classList.remove('hidden');
  }, 400);

  updateRankHUD();
}

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

  const selected = shuffle([...characters]).slice(0, config.pairs);
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
