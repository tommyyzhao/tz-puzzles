// The gardener: a small girl with a long brown braid, a red kerchief band, a white blouse under an embroidered red
// sarafan, a linen apron, felt boots, and a watering can. Procedural, built facing +z with her feet at y = 0.
// `update` animates walking, pushing, idling, celebrating, and a braid that swings on a damped spring.
import * as THREE from 'three';

function folkTexture(base, ink, accent, band) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 64);
  if (band) {                                   // embroidered hem: a light band with a zig-zag and dots
    g.fillStyle = accent; g.fillRect(0, 52, 128, 12);
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x <= 128; x += 8) g.lineTo(x, x % 16 ? 55 : 61);
    g.stroke();
    g.fillStyle = ink; for (let x = 4; x < 128; x += 16) g.fillRect(x, 47, 3, 3);
  } else {                                      // kerchief: small white flowers on red
    for (let i = 0; i < 26; i++) {
      const x = (i * 37) % 128, y = (i * 23) % 64;
      g.fillStyle = accent; for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.26) * 3, y + Math.sin(a * 1.26) * 3, 2, 0, 7); g.fill(); }
      g.fillStyle = ink; g.beginPath(); g.arc(x, y, 1.5, 0, 7); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}

export function createHero() {
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...extra });
  const M = {
    skin: std(0xf2cfb4), cheek: new THREE.MeshBasicMaterial({ color: 0xec9b9b, transparent: true, opacity: 0.7 }),
    hair: std(0x6b4024, { roughness: 0.65 }), blouse: std(0xf7f2e6), apron: std(0xece0c4, { side: THREE.DoubleSide }),
    dress: std(0xffffff, { map: folkTexture('#b5372f', '#7a1f1a', '#f3e2b5', true) }),
    scarf: std(0xffffff, { map: folkTexture('#c8402f', '#f2c14e', '#fff6e8', false) }),
    boot: std(0x6e5c4c, { roughness: 0.95 }), eye: new THREE.MeshBasicMaterial({ color: 0x2b211c }),
    can: std(0x4f8f86, { roughness: 0.45, metalness: 0.3 }), ribbon: std(0xd2463a),
  };
  const mesh = (g, m, x = 0, y = 0, z = 0, shadow = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; return o; };
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);

  // Legs: felt boots that swing from the hip.
  const legs = [-1, 1].map(s => {
    const hip = new THREE.Group(); hip.position.set(s * 0.06, 0.17, 0);
    hip.add(mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.15, 10), M.boot, 0, -0.095, 0.005));
    hip.add(mesh(new THREE.SphereGeometry(0.056, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1.3), M.boot, 0, -0.17, 0.02));
    body.add(hip);
    return hip;
  });
  // Sarafan: a flared lathe from hem to chest, with a linen apron over the front.
  const profile = [[0.205, 0.12], [0.2, 0.16], [0.17, 0.28], [0.135, 0.4], [0.115, 0.46], [0.0, 0.47]].map(([r, y]) => new THREE.Vector2(r, y));
  body.add(mesh(new THREE.LatheGeometry(profile, 22), M.dress));
  const apronProfile = [[0.212, 0.15], [0.178, 0.28], [0.142, 0.39]].map(([r, y]) => new THREE.Vector2(r, y));
  body.add(mesh(new THREE.LatheGeometry(apronProfile, 10, -0.62, 1.24), M.apron, 0, 0, 0, false));
  // Blouse: shoulders and sleeves; arms pivot at the shoulder.
  body.add(mesh(new THREE.SphereGeometry(0.115, 16, 10).scale(1.08, 0.7, 0.9), M.blouse, 0, 0.47, 0));
  const arms = [-1, 1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * 0.125, 0.48, 0);
    sh.add(mesh(new THREE.CapsuleGeometry(0.038, 0.11, 4, 8), M.blouse, 0, -0.08, 0));
    sh.add(mesh(new THREE.SphereGeometry(0.034, 10, 8), M.skin, 0, -0.17, 0));
    sh.rotation.z = s * 0.18;
    body.add(sh);
    return sh;
  });
  // Watering can in the right hand.
  const can = new THREE.Group(); can.position.set(0, -0.2, 0.02);
  can.add(mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.075, 12), M.can));
  const spout = mesh(new THREE.CylinderGeometry(0.008, 0.013, 0.09, 6), M.can, 0, 0.01, 0.06); spout.rotation.x = 1.0; can.add(spout);
  can.add(mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 12, Math.PI), M.can, 0, 0.04, 0));
  arms[1].add(can);
  // Head: face, cheeks, eyes; brown hair cap and fringe; a folk-print kerchief band tied at the nape.
  const head = new THREE.Group(); head.position.y = 0.655; body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.15, 22, 16), M.skin));
  head.add(mesh(new THREE.SphereGeometry(0.159, 22, 16).scale(1, 1.02, 1), M.hair, 0, 0.016, -0.03));
  head.add(mesh(new THREE.SphereGeometry(0.1, 14, 8, 0, Math.PI * 2, 0, 1.1).scale(1.25, 0.6, 0.7), M.hair, 0, 0.075, 0.075));
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.SphereGeometry(0.019, 8, 6), M.eye, s * 0.052, -0.005, 0.138, false));
    const ck = mesh(new THREE.CircleGeometry(0.024, 12), M.cheek, s * 0.085, -0.04, 0.124, false); ck.rotation.y = s * 0.55; head.add(ck);
    const lock = mesh(new THREE.CapsuleGeometry(0.03, 0.12, 4, 8), M.hair, s * 0.128, -0.07, -0.01); lock.rotation.z = s * 0.12; head.add(lock);
  }
  const band = mesh(new THREE.TorusGeometry(0.158, 0.026, 8, 30), M.scarf, 0, 0.05, -0.012); band.rotation.x = -1.05; head.add(band);
  for (const s of [-1, 1]) {
    const tail = mesh(new THREE.ConeGeometry(0.035, 0.1, 4).scale(1, 1, 0.35), M.scarf, s * 0.03, -0.065, -0.16); tail.rotation.set(0.35, 0, s * 0.45); head.add(tail);
  }
  // Long braid: a chain of segments hanging from the back of the head, ending in a red ribbon.
  const braid = [];
  let parent = new THREE.Group(); parent.position.set(0, 0.0, -0.135); head.add(parent);
  for (let i = 0; i < 7; i++) {
    const seg = new THREE.Group(); seg.position.y = i ? -0.058 : -0.02;
    const r = 0.042 - i * 0.003;
    seg.add(mesh(new THREE.SphereGeometry(r, 10, 8).scale(1, 1.25, 0.9), M.hair, i % 2 ? 0.006 : -0.006, -0.025, 0));
    parent.add(seg); braid.push(seg); parent = seg;
  }
  const bow = new THREE.Group(); bow.position.y = -0.06; parent.add(bow);
  for (const s of [-1, 1]) { const w = mesh(new THREE.ConeGeometry(0.026, 0.05, 4), M.ribbon, s * 0.022, 0, 0); w.rotation.z = s * Math.PI / 2; bow.add(w); }

  // ---- Animation ----
  const spring = { x: 0, z: 0, vx: 0, vz: 0 }, last = new THREE.Vector3(), vel = new THREE.Vector3(), inv = new THREE.Quaternion();
  let walkPhase = 0, celebrate = -1e9, hop = -1e9, lookAt = 0, lookT = 0;
  function update(now, dt, { moving = false, push = false, step = 0 } = {}) {
    // Velocity in her own frame drives the braid: it trails behind motion and swings back on a spring.
    root.updateMatrixWorld();
    const p = new THREE.Vector3().setFromMatrixPosition(root.matrixWorld);
    vel.subVectors(p, last).divideScalar(Math.max(dt, 1e-3)); last.copy(p);
    if (vel.lengthSq() > 400) vel.set(0, 0, 0);    // a teleport (room change), not motion
    vel.applyQuaternion(inv.copy(root.getWorldQuaternion(new THREE.Quaternion())).invert());
    const tx = THREE.MathUtils.clamp(vel.z * 0.09, -0.7, 0.7), tz = THREE.MathUtils.clamp(-vel.x * 0.09, -0.6, 0.6);
    spring.vx += ((tx - spring.x) * 90 - spring.vx * 9) * dt; spring.x += spring.vx * dt;
    spring.vz += ((tz - spring.z) * 90 - spring.vz * 9) * dt; spring.z += spring.vz * dt;
    const breeze = Math.sin(now / 900) * 0.03;
    braid.forEach((s, i) => { s.rotation.x = 0.08 + spring.x * (0.25 + i * 0.06); s.rotation.z = (spring.z + breeze) * (0.2 + i * 0.05); });

    if (moving) walkPhase += dt * (push ? 14 : 22);
    const swing = moving ? Math.sin(walkPhase) : 0;
    legs[0].rotation.x = swing * 0.5; legs[1].rotation.x = -swing * 0.5;
    const tc = (now - celebrate) / 1400, th = (now - hop) / 500;
    if (tc >= 0 && tc < 1) {                        // celebration: a spinning jump with both arms up
      const j = Math.sin(Math.min(1, tc * 1.6) * Math.PI);
      body.position.y = j * 0.28; body.rotation.y = tc < 0.62 ? (tc / 0.62) * Math.PI * 2 : 0;
      arms[0].rotation.set(0, 0, -2.6 * Math.min(1, tc * 4) * (1 - Math.max(0, tc - 0.8) * 5));
      arms[1].rotation.set(0, 0, 2.6 * Math.min(1, tc * 4) * (1 - Math.max(0, tc - 0.8) * 5));
      return;
    }
    body.rotation.y = 0;
    body.position.y = th >= 0 && th < 1 ? Math.sin(th * Math.PI) * 0.16 : 0;
    if (push) {                                     // both hands forward against the load
      arms[0].rotation.set(-1.35, 0, -0.1); arms[1].rotation.set(-1.35, 0, 0.1);
    } else {
      arms[0].rotation.set(swing * 0.6, 0, -0.18 - (th >= 0 && th < 1 ? Math.sin(th * Math.PI) * 1.2 : 0));
      arms[1].rotation.set(-swing * 0.6, 0, 0.18 + (th >= 0 && th < 1 ? Math.sin(th * Math.PI) * 1.2 : 0));
    }
    // Idle: now and then she glances around.
    if (!moving && now > lookT) { lookAt = (Math.random() - 0.5) * 1.1; lookT = now + 1800 + Math.random() * 2600; }
    if (moving) lookAt = 0;
    head.rotation.y += ((moving ? 0 : lookAt) - head.rotation.y) * Math.min(1, dt * 4);
    head.rotation.x = push ? 0.15 : Math.sin(now / 1300) * 0.03;
  }
  return {
    root, body, update,
    celebrate(now = performance.now()) { celebrate = now; },
    hop(now = performance.now()) { hop = now; },
    reset() { last.setFromMatrixPosition(root.matrixWorld); spring.vx = spring.vz = 0; },
  };
}
