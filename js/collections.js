// ── Card Collections & Rewards ──

const REWARD_CARDS = [
  {
    id: 'sentinel',
    name: 'SENTINEL',
    symbol: '\u2666',
    color: 'cyan',
    rank: 'ROOKIE',
    desc: 'Standard-issue cyber operative. Every netrunner starts here.',
    rarity: 'COMMON',
  },
  {
    id: 'specter',
    name: 'SPECTER',
    symbol: '\u2623',
    color: 'pink',
    rank: 'AGENT',
    desc: 'Phantom infiltrator. Moves through firewalls unseen.',
    rarity: 'RARE',
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    symbol: '\u2622',
    color: 'pink',
    rank: 'SPECIALIST',
    desc: 'Digital destroyer. Burns through ICE like plasma.',
    rarity: 'EPIC',
  },
  {
    id: 'zero',
    name: 'ZERO',
    symbol: '\u2605',
    color: 'cyan',
    rank: 'GHOST',
    desc: 'The legend no trace can follow. Zero footprint, zero mercy.',
    rarity: 'LEGENDARY',
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    symbol: '\u2756',
    color: 'cyan',
    rank: 'NETRUNNER_ELITE',
    desc: 'The convergence of all paths. Master of the Net.',
    rarity: 'MYTHIC',
  },
];

function isRewardUnlocked(rewardRank) {
  const rankOrder = RANKS.map(r => r.name);
  const playerRankIdx = rankOrder.indexOf(playerStats.rank);
  const rewardRankIdx = rankOrder.indexOf(rewardRank);
  return playerRankIdx >= rewardRankIdx;
}

function getUnlockedRewardCharacters() {
  return REWARD_CARDS
    .filter(card => isRewardUnlocked(card.rank))
    .map(card => ({ id: card.id, symbol: card.symbol, name: card.name, color: card.color }));
}

function getUnlockedRewardCount() {
  return REWARD_CARDS.filter(card => isRewardUnlocked(card.rank)).length;
}

function toggleCollectionModal() {
  const modal = document.getElementById('collection-modal');
  if (!modal) return;
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) renderCollectionModal();
}

function renderCollectionModal() {
  const grid = document.getElementById('collection-grid');
  const countEl = document.getElementById('collection-count');
  if (!grid) return;

  const unlocked = getUnlockedRewardCount();
  const total = REWARD_CARDS.length;

  if (countEl) {
    countEl.innerHTML = `COLLECTED: <span>${unlocked}</span> / ${total}`;
  }

  grid.innerHTML = REWARD_CARDS.map(card => {
    const cardUnlocked = isRewardUnlocked(card.rank);
    return `
      <div class="reward-card reward-card-${card.id} ${cardUnlocked ? 'unlocked' : 'locked'}"
           ${cardUnlocked ? `title="${card.desc}"` : `title="Unlock at rank: ${card.rank}"`}>
        <span class="reward-symbol">${card.symbol}</span>
        <span class="reward-name">${card.name}</span>
        <span class="reward-rank">${cardUnlocked ? card.rarity : card.rank}</span>
      </div>
    `;
  }).join('');
}
