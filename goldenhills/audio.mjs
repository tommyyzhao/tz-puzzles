// Procedural sound. Nothing is downloaded; every voice is synthesized and stops itself.
// Music is ambient and adaptive: a soft drone while the valley is dry; each pool that wakes adds a layer
// (a low pad, a slow plucked ostinato, a high shimmer, a melody fragment), and the heart resolves the chord.
// Effects follow what happened: footsteps by surface, stone scrape, box thump, water splash, chimes.
import { water, cellAt } from './model.mjs';

// D major pentatonic over two octaves (Hz). Music sits in D so the finale can land on a bright D major chord.
const D = 146.83, SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24].map(s => D * 2 ** (s / 12));

export function createAudio(world) {
  let ctx = null, master = null, music = null, sfx = null, wet = null, bed = null, bedGain = null, on = true;
  const layers = [];       // per-awake-pool music layers: { gain, stop() }
  let pulseTimer = null;

  function reverb() {
    // Synthetic impulse: decaying stereo noise, ~2.6 s.
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6; }
    const cv = ctx.createConvolver(); cv.buffer = ir;
    return cv;
  }

  function start(state) {
    if (!on) return;
    if (!ctx) {
      const AC = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.connect(master);
      music = ctx.createGain(); music.gain.value = 0.9; music.connect(comp);
      sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(comp);
      wet = ctx.createGain(); wet.gain.value = 0.35; wet.connect(reverb()).connect(comp);
      music.connect(wet);
      // Water bed: filtered noise whose level follows how much of the valley is wet.
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), d = buf.getChannelData(0);
      let b = 0; for (let i = 0; i < d.length; i++) { b = b * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = b * 6 + (Math.random() * 2 - 1) * 0.15; }
      bed = ctx.createBufferSource(); bed.buffer = buf; bed.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.3;
      bedGain = ctx.createGain(); bedGain.gain.value = 0;
      bed.connect(lp).connect(bedGain).connect(sfx); bed.start();
      // The dry drone: an open fifth, very quiet, with a slow breathing filter.
      const drone = ctx.createGain(); drone.gain.value = 0; drone.connect(music);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; f.connect(drone);
      for (const hz of [D / 2, D * 0.75]) { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz; o.connect(f); o.start(); }
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 250; lfo.connect(lg).connect(f.frequency); lfo.start();
      drone.gain.setTargetAtTime(0.05, ctx.currentTime, 3);
      schedule();
    }
    ctx.resume?.();
    if (state) ambience(state);
  }

  // ---- Voices ----
  const voice = (freq, { type = 'sine', dur = 0.15, gain = 0.2, attack = 0.005, slide = 0, at = 0, dest = sfx, filter = 0 } = {}) => {
    if (!ctx || !on) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let out = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); out = f; }
    out.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
    o.onended = () => g.disconnect();
  };
  const noise = ({ dur = 0.1, gain = 0.1, type = 'bandpass', freq = 1200, q = 1, at = 0, sweep = 0, dest = sfx } = {}) => {
    if (!ctx || !on) return;
    const t = ctx.currentTime + at, n = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.01, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest); src.start(t);
    src.onended = () => g.disconnect();
  };
  // Plucked string (balalaika-ish): a short bright attack through a closing filter.
  const pluck = (freq, { at = 0, gain = 0.06, dest = music } = {}) => {
    if (!ctx) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = freq; o2.type = 'triangle'; o2.frequency.value = freq * 2.003;
    f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 8, t); f.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.5);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(f); o2.connect(f); f.connect(g).connect(dest); o.start(t); o2.start(t); o.stop(t + 1.5); o2.stop(t + 1.5);
    o.onended = () => g.disconnect();
  };
  const bell = (freq, { at = 0, gain = 0.07, dur = 2.4, dest = music } = {}) => {
    voice(freq, { at, gain, dur, attack: 0.002, dest });
    voice(freq * 2.76, { at, gain: gain * 0.3, dur: dur * 0.5, attack: 0.002, dest });
    voice(freq * 5.4, { at, gain: gain * 0.12, dur: dur * 0.25, attack: 0.002, dest });
  };

  // ---- Music: layers that join as pools wake ----
  function addLayer(i) {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(music);
    g.gain.setTargetAtTime(1, ctx.currentTime, 2.5);
    const stops = [];
    if (i === 0 || i === 3) {                     // pads: slow detuned sines on chord tones
      for (const [n, det] of [[i ? 4 : 0, -4], [i ? 7 : 2, 5]]) {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = SCALE[n] / 2; o.detune.value = det;
        og.gain.value = 0.035; o.connect(og).connect(g); o.start(); stops.push(o);
      }
    }
    layers.push({ g, i, stop() { g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); stops.forEach(o => o.stop(ctx.currentTime + 2)); } });
  }
  // A slow clock (one beat ≈ 0.75 s) plays whichever patterned layers are present.
  let beat = 0;
  function schedule() {
    clearInterval(pulseTimer);
    pulseTimer = setInterval(() => {
      if (!ctx || !on || ctx.state !== 'running') return;
      const n = layers.length, b = beat++;
      if (n >= 2 && b % 2 === 0) pluck(SCALE[[0, 3, 2, 4, 0, 3, 1, 4][(b / 2) % 8]], { gain: 0.045 });                 // ostinato
      if (n >= 3 && b % 8 === 5) bell(SCALE[[7, 8, 6, 9][(b >> 3) % 4]], { gain: 0.035 });                             // shimmer
      if (n >= 5 && b % 16 === 0) [5, 7, 8, 6].forEach((k, j) => pluck(SCALE[k], { at: j * 0.75, gain: 0.05 }));      // melody
      if (n >= 6 && b % 4 === 2) voice(SCALE[[2, 4][(b >> 2) % 2]] / 2, { type: 'triangle', gain: 0.03, dur: 1.6, attack: 0.3, dest: music });
    }, 750);
  }
  function ambience(state) {
    if (!ctx) return;
    const w = water(world, state).wet.size;
    bedGain.gain.setTargetAtTime(Math.min(0.09, w / 1100), ctx.currentTime, 0.8);
    const want = state.awake.length;
    while (layers.length < want) addLayer(layers.length);
    while (layers.length > want) layers.pop().stop();
  }

  // ---- Effects ----
  function footstep(state) {
    const p = state?.player, c = p && cellAt(world, state, p.room, p.x, p.y);
    const alive = state?.awake.length > 0;
    if (c === '=' || c === '+') { voice(180 + Math.random() * 40, { type: 'triangle', dur: 0.07, gain: 0.07, slide: 0.7 }); return; }   // planks
    if (p && p.room !== 'v') { voice(240 + Math.random() * 50, { type: 'triangle', dur: 0.05, gain: 0.05, slide: 0.8 }); return; }   // timber floor
    noise({ dur: 0.06, gain: alive ? 0.05 : 0.07, freq: alive ? 2400 : 900, q: alive ? 0.6 : 1.4, sweep: 0.6 });   // grass swish or dry crunch
  }
  function play(ev, state) {
    if (!ctx || !on) return;
    if (ev === 'blocked') { voice(110, { type: 'triangle', dur: 0.08, gain: 0.08, slide: 0.6 }); noise({ dur: 0.05, gain: 0.04, freq: 400 }); return; }
    if (ev === 'undo') { noise({ dur: 0.16, gain: 0.05, freq: 3000, sweep: 0.25, q: 2 }); return; }
    if (ev === 'finale') {
      // Resolution: a rolled D major chord over a low D, then a bell melody.
      voice(D / 2, { type: 'triangle', gain: 0.08, dur: 6, attack: 0.6, dest: music, filter: 600 });
      [0, 2, 3, 5, 7].forEach((k, i) => pluck(SCALE[k], { at: 0.25 + i * 0.16, gain: 0.07 }));
      [7, 8, 9, 10, 8].forEach((k, i) => bell(SCALE[k], { at: 1.6 + i * 0.5, gain: 0.05 }));
      return;
    }
    if (ev === 'safii-peek') { noise({ dur: 0.25, gain: 0.05, freq: 2600, sweep: 0.5, q: 0.8 }); voice(520, { type: 'sine', dur: 0.14, gain: 0.08, slide: 1.6, at: 0.3 }); [0.75, 1.0].forEach(at => voice(1400, { type: 'sine', dur: 0.04, gain: 0.04, at })); return; }
    if (ev === 'safii-hi') { [[620, 0], [880, 0.12], [1040, 0.22]].forEach(([f, at]) => voice(f, { type: 'triangle', dur: 0.16, gain: 0.08, slide: 1.25, at, attack: 0.01 })); return; }
    if (!Array.isArray(ev)) return;
    for (const e of ev) {
      if (e.type === 'walk') footstep(state);
      if (e.type === 'push') {
        footstep(state);
        const box = e.moved?.some(id => world.objects[id]?.interior);
        if (box) { voice(85, { type: 'sine', dur: 0.18, gain: 0.22, slide: 0.6 }); noise({ dur: 0.12, gain: 0.05, freq: 300 }); }
        else noise({ dur: 0.16, gain: 0.09, freq: 700, q: 3, sweep: 1.6 });    // stone scrape
      }
      if (e.type === 'enter') { noise({ dur: 0.4, gain: 0.05, freq: 600, sweep: 3, q: 0.8 }); voice(SCALE[2], { dur: 0.5, gain: 0.05, slide: 1.5, attack: 0.05 }); }
      if (e.type === 'exit') { noise({ dur: 0.4, gain: 0.05, freq: 1800, sweep: 0.33, q: 0.8 }); voice(SCALE[4], { dur: 0.5, gain: 0.05, slide: 0.66, attack: 0.05 }); }
      if (e.type === 'fill') { voice(60, { dur: 0.3, gain: 0.3, slide: 0.5 }); noise({ dur: 0.35, gain: 0.08, freq: 250 }); }
      if (e.type === 'awaken') {
        const n = Number(e.basin);
        noise({ dur: 0.6, gain: 0.08, freq: 1500, sweep: 0.4, q: 0.7 });       // splash
        [0, 2, 4].forEach((k, i) => bell(SCALE[(n + k) % SCALE.length] * 2, { at: 0.1 + i * 0.12, gain: 0.05, dest: sfx }));
      }
    }
    if (state) ambience(state);
  }

  function enabled(v) {
    on = v;
    if (master) master.gain.setTargetAtTime(v ? 0.55 : 0, ctx.currentTime, 0.05);
  }

  return { start, play, enabled };
}
