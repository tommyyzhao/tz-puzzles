// Safii, a look-alike drawn in this scene (her real renderer owns its own camera and canvas). Design from the Safii
// project: a translucent lime-jelly gumdrop about 1.3× as wide as tall with a flared base, a green inner stem, a few air
// bubbles, two tall glossy black eyes set right of centre with an upper-left catchlight, and a yellow sunflower on her
// upper left. Built facing +z with her base at y = 0, about 0.62 tiles tall. Animation: squash-and-stretch hops.
import * as THREE from 'three';

function gumdrop() {
  // Lathe profile: flared base, wide belly, rounded dome. Then nudge the top slightly back for her lean.
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, y = t;
    const r = t < 0.12 ? 0.62 + 0.06 * Math.sin(t / 0.12 * Math.PI / 2) : 0.68 * Math.sqrt(Math.max(0, 1 - ((t - 0.12) / 0.88) ** 2.2));
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  pts.unshift(new THREE.Vector2(0.001, 0));
  const g = new THREE.LatheGeometry(pts, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - p.getY(i) ** 2 * 0.06);
  g.computeVertexNormals();
  return g;
}

export function createSafii() {
  const root = new THREE.Group(), body = new THREE.Group();
  body.scale.setScalar(1.45); root.add(body);       // about one tile tall: she's the star of the ending
  const jelly = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color().setRGB(0.57, 0.78, 0.045, THREE.LinearSRGBColorSpace), roughness: 0.15, metalness: 0,
    transmission: 0.18, thickness: 0.4, ior: 1.33, clearcoat: 1, clearcoatRoughness: 0.06, transparent: true, opacity: 0.94,
    emissive: new THREE.Color().setRGB(0.2, 0.32, 0.0, THREE.LinearSRGBColorSpace), sheen: 0.6, sheenColor: new THREE.Color(0xf4ffc8),
  });
  const shell = new THREE.Mesh(gumdrop(), jelly);
  shell.scale.set(0.5, 0.62, 0.46); shell.castShadow = true;
  body.add(shell);
  // Stick a feature onto the shell's front surface at (x, y): cast from outside, in toward the body's axis.
  // (From inside, the front-side material would cull the hit.)
  shell.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(), dir = new THREE.Vector3();
  const onSurface = (x, y, dz = 1, out = 0.004) => {
    dir.set(x * 1.4, 0, dz).normalize();
    ray.set(new THREE.Vector3(x, y, 0).addScaledVector(dir, 3), dir.clone().negate());
    const hit = ray.intersectObject(shell, false)[0];
    if (!hit) return { p: new THREE.Vector3(x, y, 0.2), n: new THREE.Vector3(0, 0, 1) };
    const n = hit.face.normal.clone().transformDirection(shell.matrixWorld);
    return { p: hit.point.addScaledVector(n, out), n };
  };
  const stick = (o, x, y, out) => { const { p, n } = onSurface(x, y, 1, out); o.position.copy(p); o.lookAt(p.clone().add(n)); };
  // Inner bits seen through the jelly: a curved stem and air bubbles.
  const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.13, 0.42, 0.04], [-0.12, 0.3, 0.08], [-0.07, 0.15, 0.1]].map(v => new THREE.Vector3(...v))), 12, 0.011, 5),
    new THREE.MeshStandardMaterial({ color: 0x4f8f22, roughness: 0.6 }));
  body.add(stem);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xf4ffd8, transparent: true, opacity: 0.6 });
  for (const [x, y, z, r] of [[0.08, 0.42, 0.14, 0.012], [-0.16, 0.22, 0.17, 0.009], [0.2, 0.18, 0.12, 0.01]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), bubbleMat); b.position.set(x, y, z); body.add(b);
  }
  // Eyes: tall glossy black ovals right of centre, each with a big upper-left catchlight and a small lower-right dot.
  const face = new THREE.Group(); body.add(face);
  const black = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.15, metalness: 0.1 }), shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = [0.07, 0.21].map(x => {
    const e = new THREE.Group(); stick(e, x, 0.34, 0.005);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), black); ball.scale.set(0.72, 1.3, 0.4);
    const hi = new THREE.Mesh(new THREE.CircleGeometry(0.017, 12), shine); hi.scale.y = 1.6; hi.position.set(-0.01, 0.026, 0.021);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.006, 8), shine); dot.position.set(0.014, -0.036, 0.02);
    e.add(ball, hi, dot); face.add(e);
    return e;
  });
  // A small mouth that opens when she says hi.
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.022, 16), new THREE.MeshBasicMaterial({ color: 0x3a1a12 }));
  stick(mouth, 0.14, 0.26, 0.006); mouth.scale.set(1, 0.001, 1); face.add(mouth);
  // Sunflower on her upper left: petals around a dark seed head.
  const flower = new THREE.Group(); stick(flower, -0.16, 0.48, 0.02); flower.rotateX(0.35); flower.scale.setScalar(1.35); body.add(flower);
  const petal = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 4).scale(1, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0xf2a91f, roughness: 0.6 }));
  for (let i = 0; i < 14; i++) {
    const p = petal.clone(), a = i / 14 * Math.PI * 2;
    p.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0); p.rotation.z = a - Math.PI / 2; flower.add(p);
  }
  const seeds = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 20).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3b2a14, roughness: 0.9 }));
  seeds.position.z = 0.008; flower.add(seeds);

  // ---- Animation: a script of hops, then a happy wiggle while she talks ----
  let path = null, t0 = 0, talking = 0, spoke = -1e9;
  const from = new THREE.Vector3(), to = new THREE.Vector3();
  function hop(points, now = performance.now()) { path = points.map(p => new THREE.Vector3(...p)); t0 = now; root.position.copy(path[0]); }
  const HOP = 0.42;
  function update(now) {
    const blink = (now % 3800) < 120 ? 0.1 : 1;
    eyes.forEach(e => (e.scale.y = blink));
    let squash = Math.sin(now / 420) * 0.03, lift = 0;
    if (path) {
      const t = (now - t0) / 1000 / HOP, i = Math.floor(t);
      if (i < path.length - 1) {
        const f = t - i;
        from.copy(path[i]); to.copy(path[i + 1]);
        root.position.lerpVectors(from, to, f);
        lift = Math.sin(f * Math.PI) * 0.35;
        squash = f < 0.15 ? -0.25 * (1 - f / 0.15) : f > 0.85 ? -0.22 * ((f - 0.85) / 0.15) : 0.12 * Math.sin(f * Math.PI);
        if (to.x !== from.x || to.z !== from.z) root.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);
      } else { root.position.copy(path.at(-1)); path = null; }
    } else root.rotation.y += (0 - root.rotation.y) * 0.12;      // settle facing the camera
    if (talking && now < talking) {
      const k = (talking - now) / 1800;
      mouth.scale.y = 0.5 + Math.abs(Math.sin(now / 90)) * 0.6;
      body.rotation.z = Math.sin(now / 130) * 0.08 * k;
    } else { mouth.scale.y = 0.001; body.rotation.z = 0; }
    body.position.y = lift;
    body.scale.set(1.45 * (1 - squash * 0.6), 1.45 * (1 + squash), 1.45 * (1 - squash * 0.6));
  }
  return {
    root, update, hop,
    face(angle) { root.rotation.y = angle; },
    say(now = performance.now()) { talking = now + 1800; spoke = now; },
    talking: () => performance.now() - spoke < 4200,
    busy: () => !!path,
  };
}
