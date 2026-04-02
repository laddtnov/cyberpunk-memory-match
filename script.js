// ── Character Data ──
const characters = [
  { id: 'netrunner', symbol: '>_',  name: 'NETRUNNER',  color: 'cyan' },
  { id: 'android',   symbol: '[AI]', name: 'ANDROID',   color: 'pink' },
  { id: 'mech',      symbol: '⚙',   name: 'MECH PILOT', color: 'cyan' },
  { id: 'ghost',     symbol: '◊',   name: 'GHOST',      color: 'pink' },
  { id: 'samurai',   symbol: '刀',   name: 'SAMURAI',   color: 'cyan' },
  { id: 'medic',     symbol: '+',   name: 'MEDIC',      color: 'pink' },
  { id: 'sniper',    symbol: '◎',   name: 'SNIPER',    color: 'cyan' },
  { id: 'virus',     symbol: '⌘',   name: 'VIRUS',     color: 'pink' },
  { id: 'phantom',   symbol: '△',   name: 'PHANTOM',   color: 'cyan' },
  { id: 'cipher',    symbol: '{}',  name: 'CIPHER',    color: 'pink' },
  { id: 'drone',     symbol: '⊕',   name: 'DRONE',     color: 'cyan' },
  { id: 'rogue',     symbol: '✦',   name: 'ROGUE',     color: 'pink' },
];

// ── Difficulty Config ──
const difficulties = {
  easy:   { pairs: 3,  gridClass: 'grid-easy',   label: 'EASY',   maxMoves: 10 },
  medium: { pairs: 8,  gridClass: 'grid-medium', label: 'MEDIUM', maxMoves: 30 },
  hard:   { pairs: 12, gridClass: 'grid-hard',   label: 'HARD',   maxMoves: 40 },
};

// ── Game State ──
const gameState = {
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 8,
  moves: 0,
  maxMoves: 30,
  seconds: 0,
  timerInterval: null,
  timerStarted: false,
  isLocked: false,
  difficulty: 'medium',
};

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
const rulesModal = document.getElementById('rules-modal');
const difficultyDisplay = document.getElementById('difficulty-display');
const particles = document.getElementById('particles');

// ── Shuffle (Fisher-Yates) ──
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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

  if (!gameState.timerStarted) {
    startTimer();
    gameState.timerStarted = true;
  }

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
  gameState.timerInterval = setInterval(() => {
    gameState.seconds++;
    timerDisplay.textContent = formatTime(gameState.seconds);
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
  winMoves.textContent = gameState.moves;
  winTime.textContent = formatTime(gameState.seconds);

  setTimeout(() => {
    winOverlay.classList.remove('hidden');
    spawnParticles();
  }, 600);
}

// ── Win Particles ──
function spawnParticles() {
  particles.innerHTML = '';
  const colors = ['#00f3ff', '#ff0055', '#9d00ff', '#00ff88', '#ffff00'];

  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const height = 8 + Math.random() * 20;
    const delay = Math.random() * 2;
    const duration = 1.5 + Math.random() * 2;

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
function loseGame() {
  clearInterval(gameState.timerInterval);
  gameState.isLocked = true;

  losePairs.textContent = gameState.matchedPairs;
  loseTotal.textContent = gameState.totalPairs;
  loseMovesStat.textContent = gameState.moves;

  setTimeout(() => {
    loseOverlay.classList.remove('hidden');
  }, 400);
}

// ── Start with Difficulty (from modal) ──
function startWithDifficulty(diff) {
  gameState.difficulty = diff;
  rulesModal.classList.add('hidden');
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
  gameState.timerStarted = false;
  gameState.isLocked = false;
  clearInterval(gameState.timerInterval);

  movesDisplay.childNodes[0].textContent = '0';
  movesLimit.textContent = '/' + config.maxMoves;
  timerDisplay.textContent = '00:00';
  winOverlay.classList.add('hidden');
  loseOverlay.classList.add('hidden');
  difficultyDisplay.textContent = config.label;
  particles.innerHTML = '';

  const hudItem = movesDisplay.closest('.hud-item');
  hudItem.classList.remove('moves-warning');

  board.className = '';
  board.classList.add(config.gridClass);

  const selected = shuffle([...characters]).slice(0, config.pairs);
  const deck = shuffle([...selected, ...selected]);

  board.innerHTML = '';
  deck.forEach(char => board.appendChild(createCardElement(char)));
}

function restartGame() {
  initGame();
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
