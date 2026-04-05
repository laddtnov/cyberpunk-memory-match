// ── Share Card ──

function generateShareCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createRadialGradient(300, 200, 0, 300, 200, 400);
  bgGrad.addColorStop(0, '#10101a');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 600, 400);

  // Grid overlay
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 600; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 0; y < 400; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  // Border
  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(0, 243, 255, 0.6)';
  ctx.shadowBlur = 20;
  roundRect(ctx, 10, 10, 580, 380, 12);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner border glow line
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, 16, 16, 568, 368, 10);
  ctx.stroke();

  // Title
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#00f3ff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 243, 255, 0.8)';
  ctx.shadowBlur = 15;
  ctx.fillText('MISSION COMPLETE', 300, 60);
  ctx.shadowBlur = 0;

  // Divider
  const divGrad = ctx.createLinearGradient(60, 0, 540, 0);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, '#00f3ff');
  divGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 78);
  ctx.lineTo(540, 78);
  ctx.stroke();

  // Difficulty badge
  const diff = gameState.difficulty.toUpperCase();
  const diffColors = {
    EASY: '#00f3ff',
    MEDIUM: '#ff0055',
    HARD: '#ff0055',
    EXTREME: '#ff0000',
  };
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillStyle = diffColors[diff] || '#00f3ff';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fillText('[ ' + diff + ' ]', 300, 110);
  ctx.shadowBlur = 0;

  // Stats
  const stats = [
    { label: 'MOVES', value: gameState.moves + '/' + gameState.maxMoves },
    { label: 'TIME', value: formatTime(gameState.seconds) },
    { label: 'BEST COMBO', value: gameState.maxCombo + 'x' },
  ];

  const startY = 150;
  stats.forEach((stat, i) => {
    const y = startY + i * 55;

    // Label
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0, 243, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText(stat.label, 300, y);

    // Value
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = 'rgba(255, 0, 85, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(stat.value, 300, y + 28);
    ctx.shadowBlur = 0;
  });

  // Rank
  const rank = playerStats.rank || 'ROOKIE';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText('RANK: ' + rank, 300, 335);
  ctx.shadowBlur = 0;

  // Footer
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('netrunner.laddtnov.xyz', 300, 370);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shareResult() {
  const canvas = generateShareCard();

  // Try Web Share API first (mobile)
  if (navigator.share && navigator.canShare) {
    canvas.toBlob(blob => {
      const file = new File([blob], 'cybermatch-result.png', { type: 'image/png' });
      const shareData = {
        title: 'CyberMatch Result',
        text: 'I completed a ' + gameState.difficulty.toUpperCase() + ' mission in ' + formatTime(gameState.seconds) + '!',
        files: [file],
      };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData);
        return;
      }
      downloadShareCard(canvas);
    }, 'image/png');
    return;
  }

  downloadShareCard(canvas);
}

function downloadShareCard(canvas) {
  const link = document.createElement('a');
  link.download = 'cybermatch-result.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
