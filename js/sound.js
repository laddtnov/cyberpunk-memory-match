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
