// ── Donations Modal ──

function toggleDonateModal() {
  const modal = document.getElementById('donate-modal');
  if (!modal) return;
  modal.classList.toggle('hidden');
}

function switchDonateTab(tab) {
  document.getElementById('donate-card-panel').classList.toggle('hidden', tab !== 'card');
  document.getElementById('donate-crypto-panel').classList.toggle('hidden', tab !== 'crypto');

  document.querySelectorAll('.donate-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function copyAddr(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const btn = el.nextElementSibling;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'COPIED!';
    btn.style.color = '#00ff88';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 1500);
  });
}
