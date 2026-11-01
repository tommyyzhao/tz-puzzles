const NS = 'http://www.w3.org/2000/svg';
function shape(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}
function drawing(width, height, label, className = '') {
  const svg = shape('svg', { viewBox: `0 0 ${width} ${height}`, class: `drawing ${className}`, role: 'img', 'aria-label': label });
  svg.append(shape('title', {}, label));
  return svg;
}
function path(d, attrs = {}) { return shape('path', { d, fill: 'none', ...attrs }); }
function line(x1, y1, x2, y2, attrs = {}) { return shape('line', { x1, y1, x2, y2, ...attrs }); }
function text(x, y, label, attrs = {}) { return shape('text', { x, y, ...attrs }, label); }
function box(x, y, width, height, attrs = {}) { return shape('rect', { x, y, width, height, rx: 4, class: 'paper', ...attrs }); }
function group(x, y, scale = 1) { return shape('g', { transform: `translate(${x} ${y}) scale(${scale})` }); }

export function icon(kind) {
  const svg = drawing(48, 48, kind, 'icon');
  const paths = {
    up: 'M24 38V10L13 21M24 10L35 21',
    down: 'M24 10V38L13 27M24 38L35 27',
    left: 'M37 24H10L21 13M10 24L21 35',
    right: 'M11 24H38L27 13M38 24L27 35',
    wait: 'M17 12V36M31 12V36',
    take: 'M12 8V22L19 28M36 8V22L29 28M24 38V20M19 25L24 20L29 25',
    drop: 'M12 8V19L6 25M36 8V19L42 25M24 20V38M19 33L24 38L29 33',
    run: 'M16 10L36 24L16 38Z',
    rewind: 'M12 17A17 17 0 1 1 10 30M12 7V18H23',
    check: 'M9 24L19 34L39 13',
    cross: 'M13 13L35 35M35 13L13 35',
    controller: 'M10 16H38V37H10ZM17 25H20M28 25H31M17 31H31M24 7V16',
    help: 'M19 17C19 9 33 9 33 18C33 24 24 23 24 30M24 37V38',
    undo: 'M17 13L7 23L17 33M8 23H29C44 23 44 40 30 40',
    redo: 'M31 13L41 23L31 33M40 23H19C4 23 4 40 18 40',
    restart: 'M12 17A17 17 0 1 1 10 30M12 7V18H23',
    step: 'M12 10L30 24L12 38ZM36 10V38',
    enter: 'M26 8H39V40H26M7 24H31M23 16L31 24L23 32',
    records: 'M13 8H35V40H13ZM19 17H29M19 24H29M19 31H26',
  };
  svg.append(path(paths[kind] ?? paths.controller, { 'stroke-width': 3 }));
  return svg;
}

export function token(symbol) {
  const svg = drawing(60, 60, symbol === 'A' ? 'Circle' : symbol === 'B' ? 'Diamond' : 'Empty', 'token');
  if (symbol === 'A') {
    svg.append(shape('circle', { cx: 30, cy: 30, r: 19, class: 'type-a' }), shape('circle', { cx: 30, cy: 30, r: 7, class: 'paper' }));
  } else if (symbol === 'B') svg.append(path('M30 6L54 30L30 54L6 30Z', { class: 'type-b' }), path('M22 23L38 37M22 37L38 23', { class: 'cutout' }));
  return svg;
}

export function portrait(name, index = 0, badge = null) {
  const svg = drawing(96, 100, `${name}${badge ? `, badge ${badge}` : ''}`, 'portrait');
  svg.append(box(4, 3, 88, 93, { rx: 13, class: 'wash' }));
  if (name === 'Controller') {
    const robot = icon('controller'); robot.setAttribute('x', 18); robot.setAttribute('y', 18); robot.setAttribute('width', 60); robot.setAttribute('height', 60); svg.append(robot);
    return svg;
  }
  svg.append(path('M17 87V73Q19 59 48 59Q77 59 79 73V87Z', { class: 'paper' }), shape('circle', { cx: 48, cy: 36, r: 20, class: 'paper' }));
  if (name === 'Unknown') svg.append(text(48, 44, '?', { 'text-anchor': 'middle', 'font-size': 26 }));
  else {
    const hair = ['M27 31L31 13L65 13L69 31Z', 'M28 31Q28 4 48 10Q70 6 68 31L60 24L49 29L36 23Z', 'M24 26H72M31 25V10H64V25'];
    svg.append(path(hair[index % 3], { class: 'ink-fill' }), line(40, 36, 42, 36, { 'stroke-width': 4 }), line(54, 36, 56, 36, { 'stroke-width': 4 }), path('M42 47Q48 51 55 46'));
    if (index % 3 === 1) svg.append(box(33, 30, 13, 12), box(50, 30, 13, 12), line(46, 35, 50, 35));
  }
  if (badge) svg.append(box(51, 65, 22, 25), text(62, 84, String(badge), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold' }));
  return svg;
}

export function placePicture(name, index) {
  const svg = drawing(96, 80, name, 'place-picture');
  svg.append(path('M9 70V25L48 7L87 25V70Z', { class: 'wash' }));
  if (index === 0) svg.append(box(22, 34, 52, 8), line(27, 42, 27, 67), line(68, 42, 68, 67), box(41, 20, 22, 14));
  else if (index === 1) svg.append(box(23, 30, 28, 30), path('M23 30L51 60M51 30L23 60M12 65H85M63 65V32L75 22'));
  else svg.append(box(23, 23, 50, 45), path('M31 34H41M53 34H64M31 45H64M31 57H64'));
  return svg;
}

export function clock(time) {
  const svg = drawing(72, 72, `Time ${time}`, 'clock');
  const angle = Number(time) % 12 * Math.PI / 6;
  svg.append(shape('circle', { cx: 36, cy: 36, r: 30, class: 'paper' }), line(36, 36, 36, 13), line(36, 36, 36 + Math.sin(angle) * 16, 36 - Math.cos(angle) * 16, { 'stroke-width': 4 }));
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    svg.append(line(36 + Math.sin(a) * 25, 36 - Math.cos(a) * 25, 36 + Math.sin(a) * 28, 36 - Math.cos(a) * 28));
  }
  return svg;
}

function crate(x, y, size = 32) {
  const g = group(x, y);
  g.append(box(0, 0, size, size, { class: 'crate' }), path(`M3 3L${size - 3} ${size - 3}M${size - 3} 3L3 ${size - 3}`));
  return g;
}

export function gateScene({ powerOn = null, springInstalled = null, leverPulled = null, fallen = true, worker = false, open = true, title = 'Cargo gate' } = {}) {
  const facts = `${title}. ${fallen ? 'Cargo below the gate' : 'Cargo on the platform'}. ${powerOn === null ? 'Power history concealed' : `Power ${powerOn ? 'on' : 'off'}`}. ${springInstalled === null ? 'Spring concealed' : `Spring ${springInstalled ? 'installed' : 'missing'}`}. ${leverPulled === null ? 'Lever timing unknown' : `Lever ${leverPulled ? 'pulled' : 'at rest'}`}.${worker ? ' Unidentified worker with badge 2 beside the lever.' : ''}`;
  const svg = drawing(360, 230, facts, 'gate-scene');
  svg.append(box(1, 1, 358, 228, { rx: 12, class: 'wash' }), path('M15 185H345M15 143H111M211 143H345', { 'stroke-width': 5 }), box(105, 40, 12, 108), box(210, 40, 12, 108));
  svg.append(path(open ? 'M116 143L142 94' : 'M116 143H210', { 'stroke-width': 7 }));
  svg.append(crate(fallen ? 151 : 148, fallen ? 151 : 106));
  svg.append(box(28, 30, 53, 38), text(54, 21, 'POWER', { 'text-anchor': 'middle', 'font-size': 14 }));
  if (powerOn === null) svg.append(text(54, 57, '?', { 'text-anchor': 'middle', 'font-size': 25 }));
  else {
    svg.append(path('M55 34L44 51H54L50 64L66 45H55Z', { class: powerOn ? 'type-a' : 'paper' }));
    if (!powerOn) svg.append(path('M33 63L76 35', { 'stroke-width': 3 }));
  }
  svg.append(line(166, 42, 166, 65), line(166, 99, 166, 122));
  if (springInstalled === true) svg.append(path('M166 65L155 70L177 77L155 84L177 91L166 99', { 'stroke-width': 3 }));
  else if (springInstalled === false) svg.append(box(153, 65, 26, 34, { 'stroke-dasharray': '4 4' }), path('M157 71L175 93M175 71L157 93'));
  else svg.append(box(150, 62, 32, 42), text(166, 90, '?', { 'text-anchor': 'middle', 'font-size': 23 }));
  svg.append(text(166, 33, 'SPRING', { 'text-anchor': 'middle', 'font-size': 14 }));
  const leverX = leverPulled === true ? 277 : 244;
  svg.append(path(`M260 143V123L${leverX} 98`, { 'stroke-width': 5 }), shape('circle', { cx: leverX, cy: 98, r: 7, class: 'paper' }));
  if (leverPulled === null) svg.append(text(275, 83, '?', { 'font-size': 21 }));
  svg.append(text(259, 161, 'LEVER', { 'text-anchor': 'middle', 'font-size': 14 }));
  if (worker) {
    const person = portrait('Unknown', 0, 2); person.setAttribute('x', 283); person.setAttribute('y', 56); person.setAttribute('width', 69); person.setAttribute('height', 89); svg.append(person);
  }
  svg.append(text(180, 211, title, { 'text-anchor': 'middle', 'font-size': 15 }));
  return svg;
}

export function machine(b, state, returning = false) {
  const width = 640, source = 110 + b.source * (420 / (b.length - 1)), output = 110 + b.output * (420 / (b.length - 1));
  const x = 110 + state.position * (420 / (b.length - 1));
  const svg = drawing(width, 300, `Arm at place ${state.position + 1}, ${state.holding ? 'holding an item' : 'empty'}. Source at ${b.source + 1}, output at ${b.output + 1}. ${state.produced} of ${b.quota} delivered.`, 'machine');
  svg.append(box(1, 1, 638, 298, { rx: 16, class: 'wash' }), line(65, 67, 575, 67, { 'stroke-width': 9 }), line(65, 78, 575, 78, { 'stroke-width': 3 }));
  for (let i = 0; i < b.length; i++) {
    const px = 110 + i * (420 / (b.length - 1));
    svg.append(line(px, 60, px, 88, { 'stroke-width': 3 }), text(px, 45, String(i + 1), { 'text-anchor': 'middle', 'font-size': 25 }));
  }
  svg.append(box(source - 47, 226, 94, 13), text(source, 275, 'SOURCE', { 'text-anchor': 'middle', 'font-size': 26 }));
  for (let i = 0; i < 3; i++) svg.append(crate(source - 35 + i * 24, 197, 23));
  svg.append(text(source + 52, 220, '∞', { 'font-size': 23 }));
  svg.append(path(`M${output - 49} 221V239H${output + 49}V221`, { 'stroke-width': 4 }), text(output, 275, 'OUTPUT', { 'text-anchor': 'middle', 'font-size': 26 }));
  for (let i = 0; i < state.produced; i++) svg.append(crate(output - 35 + i * 24, 197, 23));
  const arm = group(x, 0); arm.setAttribute('data-arm-position', state.position);
  arm.append(box(-22, 53, 44, 40, { class: 'arm-head' }), line(0, 94, 0, 140, { 'stroke-width': 8 }));
  arm.append(path(state.holding ? 'M-23 138V166L-12 175M23 138V166L12 175' : 'M-20 138V158L-33 169M20 138V158L33 169', { 'stroke-width': 5 }));
  if (state.holding) arm.append(crate(-13, 157, 26));
  svg.append(arm);
  if (returning) svg.append(path(`M${output} 24Q320 -12 ${source} 24`, { 'stroke-dasharray': '6 5' }));
  return svg;
}

export function puzzleMark(kind) {
  const svg = drawing(60, 60, kind, 'puzzle-mark');
  if (kind === 'player') svg.append(shape('circle', { cx: 30, cy: 30, r: 20, class: 'type-a' }), shape('circle', { cx: 24, cy: 26, r: 2, class: 'ink-fill' }), shape('circle', { cx: 36, cy: 26, r: 2, class: 'ink-fill' }), path('M23 36Q30 42 38 35'));
  else if (kind === 'crystal') svg.append(path('M30 7L47 22L39 49H21L13 22Z', { class: 'type-b' }), path('M13 22H47M30 7L23 22L30 49L37 22Z'));
  else if (kind === 'star') svg.append(path('M30 6L36 22L54 22L40 33L45 51L30 40L15 51L20 33L6 22L24 22Z', { class: 'type-b' }));
  else if (kind === 'is') svg.append(path('M14 23H46M14 37H46', { 'stroke-width': 5 }));
  else if (kind === 'solid') svg.append(box(11, 11, 38, 38, { class: 'wash' }), path('M11 24H49M11 36H49M24 11V24M37 24V36M24 36V49'));
  else if (kind === 'goal') svg.append(shape('circle', { cx: 30, cy: 30, r: 21 }), shape('circle', { cx: 30, cy: 30, r: 13 }), shape('circle', { cx: 30, cy: 30, r: 4, class: 'ink-fill' }));
  else if (kind === 'cargo') svg.append(crate(13, 13, 34));
  else if (kind === 'snow') svg.append(path('M30 10V50M12 20L48 40M12 40L48 20M25 15L30 20L35 15M25 45L30 40L35 45'));
  return svg;
}

function squareBoard(width, height, floor, label) {
  const svg = drawing(width * 60, height * 60, label, 'spatial-board');
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const open = floor.some(([fx, fy]) => fx === x && fy === y);
    svg.append(box(x * 60 + 1, y * 60 + 1, 58, 58, { class: open ? 'board-floor' : 'board-wall', rx: 7, 'stroke-width': .7 }));
  }
  return svg;
}
function stamp(svg, mark, x, y, inset = 7) {
  mark.setAttribute('x', x * 60 + inset); mark.setAttribute('y', y * 60 + inset);
  mark.setAttribute('width', 60 - inset * 2); mark.setAttribute('height', 60 - inset * 2);
  svg.append(mark);
}
export function tilesBoard(level, state, rules) {
  const floor = Array.from({ length: level.width * level.height }, (_, i) => [i % level.width, Math.floor(i / level.width)]).filter(([x, y]) => !level.walls.some(w => w.x === x && w.y === y));
  const svg = squareBoard(level.width, level.height, floor, `Player row ${state.player.y + 1}, column ${state.player.x + 1}. Rule tiles and objects.`);
  for (const o of level.objects) {
    stamp(svg, puzzleMark(o.kind), o.x, o.y);
    if (rules.some(([kind, property]) => kind === o.kind && property === 'goal')) svg.append(shape('circle', { cx: o.x * 60 + 30, cy: o.y * 60 + 30, r: 26, 'stroke-dasharray': '4 3' }));
    if (rules.some(([kind, property]) => kind === o.kind && property === 'solid')) svg.append(box(o.x * 60 + 4, o.y * 60 + 4, 52, 52, { fill: 'none', class: '', 'stroke-width': 3 }));
  }
  for (const t of state.tiles) {
    if (!t.fixed) svg.append(box(t.x * 60 + 5, t.y * 60 + 8, 50, 49, { class: 'tile-shadow', rx: 8 }));
    svg.append(box(t.x * 60 + 5, t.y * 60 + 4, 50, 49, { class: `rule-tile${t.fixed ? ' fixed-tile' : ''}`, rx: 8, 'stroke-width': 1.5 }));
    stamp(svg, puzzleMark(t.word), t.x, t.y, 12);
    if (t.fixed) svg.append(shape('circle', { cx: t.x * 60 + 10, cy: t.y * 60 + 10, r: 2, class: 'ink-fill' }), shape('circle', { cx: t.x * 60 + 50, cy: t.y * 60 + 50, r: 2, class: 'ink-fill' }));
  }
  stamp(svg, puzzleMark('player'), state.player.x, state.player.y, 12);
  return svg;
}
export function pocketBoard(level, state, id, forecasts = []) {
  const space = level.rooms[id];
  const svg = squareBoard(space.width, space.height, space.floor, `${id === 'yard' ? 'Yard' : `Room ${id}`}${state.player.room === id ? ', player here' : ''}`);
  const goal = level.goal;
  if (goal.room === id) stamp(svg, puzzleMark('goal'), goal.x, goal.y, 3);
  for (const b of state.boxes.filter(b => b.room === id)) {
    const inner = pocketBoard(level, state, b.id);
    svg.append(box(b.x * 60 + 3, b.y * 60 + 3, 54, 54, { class: 'room-shell', 'stroke-width': 3 }));
    stamp(svg, inner, b.x, b.y, 10);
    svg.append(text(b.x * 60 + 9, b.y * 60 + 15, b.id, { 'font-size': 12, 'font-weight': 'bold' }));
  }
  if (state.cargo.room === id) stamp(svg, puzzleMark('cargo'), state.cargo.x, state.cargo.y);
  if (state.player.room === id) stamp(svg, puzzleMark('player'), state.player.x, state.player.y, 12);
  for (const f of forecasts.filter(f => f.to?.room === id)) {
    svg.append(box(f.to.x * 60 + 3, f.to.y * 60 + 3, 54, 54, { class: '', fill: 'none', 'stroke-dasharray': '3 3' }));
    svg.append(text(f.to.x * 60 + 30, f.to.y * 60 + 53, `${f.room} ${f.arrow}`, { 'text-anchor': 'middle', 'font-size': 12 }));
  }
  return svg;
}
export function driftBoard(level, state) {
  const svg = squareBoard(level.width, level.height, level.floor, `Garden. Player row ${state.player.y + 1}, column ${state.player.x + 1}. Snowballs and size-marked destinations.`);
  state.snow.forEach(([x, y]) => { svg.append(box(x * 60 + 2, y * 60 + 2, 56, 56, { class: 'snow-patch' })); stamp(svg, puzzleMark('snow'), x, y, 13); });
  level.goals.forEach(g => {
    svg.append(shape('circle', { cx: g.x * 60 + 30, cy: g.y * 60 + 30, r: 13 + g.size * 4, 'stroke-dasharray': '4 3', 'stroke-width': 2 }));
    svg.append(text(g.x * 60 + 30, g.y * 60 + 35, String(g.size), { 'text-anchor': 'middle', 'font-size': 16 }));
  });
  state.balls.forEach(b => {
    const r = 8 + b.size * 5;
    svg.append(shape('circle', { cx: b.x * 60 + 30, cy: b.y * 60 + 30, r, class: 'snowball', 'stroke-width': 3 }));
    svg.append(text(b.x * 60 + 30, b.y * 60 + 35, String(b.size), { 'text-anchor': 'middle', 'font-size': 16 }));
  });
  stamp(svg, puzzleMark('player'), state.player.x, state.player.y, 12);
  level.goals.forEach(g => {
    svg.append(box(g.x * 60 + 42, g.y * 60 + 2, 16, 17, { class: 'goal-label', rx: 4, 'stroke-width': 1 }));
    svg.append(text(g.x * 60 + 50, g.y * 60 + 15, String(g.size), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 650 }));
  });
  return svg;
}

export function spokesBoard(level, answer = '') {
  const positions = ['top', 'upper right', 'right', 'lower right', 'bottom', 'lower left', 'left', 'upper left'];
  const valueAt = i => level.values[i] ?? (answer || 'unknown');
  const arrows = level.direction ? ` Directed arrows: ${[0, 1, 2, 3].map(i => level.direction > 0 ? `${valueAt(i)} to ${valueAt(i + 4)}` : `${valueAt(i + 4)} to ${valueAt(i)}`).join('; ')}.` : '';
  const svg = drawing(400, 400, `Eight spokes. ${level.values.map((_, i) => `${positions[(i + level.rotation / 45) % 8]}: ${valueAt(i)}`).join('; ')}.${arrows}`, 'spokes-board');
  const points = level.values.map((_, i) => {
    const angle = (i * 45 + level.rotation - 90) * Math.PI / 180;
    return [200 + Math.cos(angle) * 158, 200 + Math.sin(angle) * 158];
  });
  for (let i = 0; i < 4; i++) {
    const [from, to] = level.direction < 0 ? [i + 4, i] : [i, i + 4];
    const [x, y] = points[from], [tx, ty] = points[to];
    const dx = (tx - x) / 316, dy = (ty - y) / 316;
    const endX = tx - dx * 35, endY = ty - dy * 35;
    svg.append(line(x + dx * 35, y + dy * 35, endX, endY, { class: 'spoke-line' }));
    if (level.direction) svg.append(path(`M${endX - dx * 11 - dy * 6} ${endY - dy * 11 + dx * 6}L${endX} ${endY}L${endX - dx * 11 + dy * 6} ${endY - dy * 11 - dx * 6}`, { class: 'spoke-arrow', 'stroke-width': 2.5 }));
  }
  level.values.forEach((value, i) => {
    const [x, y] = points[i];
    svg.append(shape('circle', { cx: x, cy: y, r: 28, class: value === null ? 'spoke-unknown' : 'spoke-node' }));
    svg.append(text(x, y + 9, String(value ?? (answer || '?')), { 'text-anchor': 'middle', class: 'spoke-value' }));
  });
  svg.append(shape('circle', { cx: 200, cy: 200, r: 5, class: 'ink-fill' }));
  return svg;
}
