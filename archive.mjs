const scenarios = [
  { powerOn: false, springInstalled: false, leverBefore: false },
  { powerOn: true, springInstalled: true, leverBefore: true },
];
const causes = ['power', 'manual'];
export const gateOpens = scene => scene.powerOn ? scene.leverBefore : !scene.springInstalled;
export const causeOf = scene => scene.powerOn ? 'manual' : 'power';
export const causeLabels = { power: 'Power failed while the return spring was missing.', manual: 'The powered lever was pulled before the fall.' };

export const cases = [
  {
    name: '1', people: ['Ari', 'Bo', 'Cy'], places: ['Office', 'Dock', 'Hall'], times: ['09', '10', '11'],
    appointment: 'Ari checked in at Office at 09. Cy wore badge 3 throughout the shift.',
    scene: 'At 10, cargo fell at Dock. Immediately afterward, badge 2 stood beside the lever. No one changed badges during the shift.',
    receipt: { person: 'Ari', place: 'Office', time: '09' },
    worker: { person: 'Bo', place: 'Dock', time: '10' },
    controller: { person: 'Controller', place: 'Hall', time: '11' },
    badge3: 'Cy', observation: scenarios[0], cause: 'power',
    record: 'Controller report: power failed just before the cargo fell; the return spring was missing. The lever was first pulled after the fall.',
  },
  {
    name: '2', people: ['Dee', 'Eli', 'Fox'], places: ['Desk', 'Lift', 'Bay'], times: ['13', '14', '15'],
    appointment: 'Fox checked in at Desk at 15. Eli wore badge 3 throughout the shift.',
    scene: 'At 14, cargo fell at Lift. Immediately afterward, badge 2 stood beside the lever. No one changed badges during the shift.',
    receipt: { person: 'Fox', place: 'Desk', time: '15' },
    worker: { person: 'Dee', place: 'Lift', time: '14' },
    controller: { person: 'Controller', place: 'Bay', time: '13' },
    badge3: 'Eli', observation: scenarios[1], cause: 'manual',
    record: 'Controller report: power remained on throughout the fall; the return spring was intact. The lever was pulled just before the fall.',
  },
];

export const address = q => `${q.person} / ${q.place} / ${q.time}`;

export function worlds(c) {
  return c.people.flatMap(a => c.people.filter(b => b !== a).flatMap(b =>
    c.people.filter(d => d !== a && d !== b).flatMap(d => scenarios.map(scene => ({ badges: [a, b, d], ...scene, cause: causeOf(scene) })))));
}

export function records(c) {
  return [
    { id: 'receipt', ...c.receipt, text: `Check-in receipt: ${c.receipt.person} wore badge 1. Three people worked today; each wore a different badge from 1 to 3.` },
    { id: 'worker', ...c.worker, text: `Inspection note: the sealed controller report is filed under ${address(c.controller)}. It records power, spring and lever timing for the incident.` },
    { id: 'controller', ...c.controller, text: c.record },
  ];
}

export function candidates(c, seen, condition = 'full') {
  return worlds(c).filter(w => gateOpens(w) && w.badges[2] === c.badge3)
    .filter(w => !seen.includes('receipt') || w.badges[0] === c.receipt.person)
    .filter(w => !seen.includes('controller') || Object.entries(c.observation).every(([key, value]) => w[key] === value))
    .filter(w => condition !== 'finding' || w.cause === c.cause);
}

// Only public or retrieved facts enter the scene; the worker stays anonymous.
export function visualEvidence(c, seen = []) {
  const evidence = {
    people: c.people.map(name => ({ name, badge: name === c.badge3 ? 3 : null })),
    appointment: { ...c.receipt },
    scene: { place: c.worker.place, time: c.worker.time, badge: 2 },
    records: [],
  };
  if (seen.includes('receipt')) evidence.records.push({ id: 'receipt', person: c.receipt.person, badge: 1 });
  if (seen.includes('worker')) evidence.records.push({ id: 'worker', address: { ...c.controller } });
  if (seen.includes('controller')) {
    const { powerOn, springInstalled, leverBefore } = c.observation;
    evidence.records.push({ id: 'controller', frames: [
      { moment: 'Before', powerOn, springInstalled, leverPulled: leverBefore, fallen: false },
      { moment: 'Fall', powerOn, springInstalled, leverPulled: leverBefore, fallen: true },
      { moment: 'After', powerOn, springInstalled, leverPulled: true, fallen: true },
    ] });
  }
  return evidence;
}

export function archiveInitial() {
  return { seen: [], identity: '', cause: '', feedback: '', queries: [] };
}

export function archiveStep(c, condition, state, action) {
  if (!action || typeof action !== 'object') return state;
  if (action.type === 'query') {
    const q = action.query;
    if (!q || ![...c.people, 'Controller'].includes(q.person) || !c.places.includes(q.place) || !c.times.includes(q.time)) return state;
    const record = records(c).find(r => address(r) === address(q));
    return { ...state,
      seen: record && !state.seen.includes(record.id) ? [...state.seen, record.id] : state.seen,
      queries: [...state.queries, { ...q, found: Boolean(record) }],
      feedback: record ? 'Record retrieved.' : 'No record at that address.' };
  }
  if (action.type === 'draft') {
    if (!['', ...c.people].includes(action.identity) || !['', ...causes].includes(action.cause)) return state;
    return { ...state, identity: action.identity, cause: action.cause, feedback: '' };
  }
  if (action.type === 'report') {
    if (!c.people.includes(action.identity) || !causes.includes(action.cause)) return state;
    const remaining = candidates(c, state.seen, condition);
    const supported = remaining.length > 0 && remaining.every(w => w.badges[1] === action.identity && w.cause === action.cause);
    return { ...state, identity: action.identity, cause: action.cause,
      feedback: supported ? 'Report supported by the available evidence.' : 'Available evidence does not establish this report.' };
  }
  return state;
}
