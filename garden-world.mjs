const rect = (x, y, w, h) => Array.from({ length: w * h }, (_, i) => [x + i % w, y + Math.floor(i / w)]);
const seed = (id, x, y, room = 'outside') => ({ id, kind: 'seed', room, x, y, rooted: false });
const garden = (id, x, y, interior, room = 'outside') => ({ id, kind: 'garden', room, x, y, interior });
const stone = (id, x, y, room = 'outside') => ({ id, kind: 'stone', room, x, y });
const inside = () => ({ width: 3, height: 3, floor: [[1,0],[0,1],[1,1],[2,1],[1,2]], channels: [[0,1],[1,1],[1,0]], sources: [[0,1]], waterExits: ['up'], name: 'Inside the spring' });
export const prototypes = {
  portable: {
    id: 'portable', title: 'A place in your hands', subtitle: 'The portable garden',
    rooms: { outside: { width: 7, height: 7, floor: rect(1,1,5,5), channels: [[5,2]], sources: [] }, spring: inside() },
    player: { room: 'outside', x: 2, y: 5 }, objects: [garden('spring',3,3,'spring'), stone('plug',1,1,'spring'), seed('seed',4,2)],
    beds: [{ id: 'bed', room: 'outside', x: 5, y: 2 }], regions: [{ id: 'one', name: 'The little spring', x:0,y:0,width:7,height:7, bed:'bed', description:'A dry cradle waits beside a quiet spring.' }],
  },
  connections: {
    id: 'connections', title: 'Far becomes near', subtitle: 'The connected springs',
    rooms: { outside: { width: 8, height: 7, floor: rect(1,1,6,5), channels: [[1,2],[2,2],[5,2],[6,2]], sources: [[1,2]] } },
    player: { room: 'outside', x: 3, y: 5 }, objects: [{ id:'a',kind:'portal',pair:'pair',room:'outside',x:3,y:2 },{ id:'b',kind:'portal',pair:'pair',room:'outside',x:5,y:4 },seed('seed',6,3)],
    beds: [{id:'bed',room:'outside',x:6,y:2}], regions:[{id:'one',name:'Across the gap',x:0,y:0,width:8,height:7,bed:'bed',description:'Two arches share a distant horizon.'}],
  },
  terrain: {
    id:'terrain', title:'What the water remembers',subtitle:'The changing ground',
    rooms:{outside:{width:7,height:7,floor:rect(1,1,5,5),channels:[[1,2],[2,2],[3,2],[4,2],[5,2]],sources:[[1,2]]}},
    player:{room:'outside',x:2,y:4},objects:[stone('plug',2,2),seed('seed',3,3)],
    beds:[{id:'bed',room:'outside',x:5,y:2}],regions:[{id:'one',name:'The sleeping channel',x:0,y:0,width:7,height:7,bed:'bed',description:'A seed remembers the first water it touches.'}],
  },
};

export function makeWorld() {
  const world = { id:'stillwater',title:'Stillwater',subtitle:'A small world, waiting to wake.',rooms:{outside:{width:31,height:23,floor:[],channels:[],sources:[]}},objects:[],beds:[],regions:[],player:{room:'outside',x:3,y:17} };
  const out = world.rooms.outside;
  const add = (id,name,ox,oy,description) => {
    out.floor.push(...rect(ox+1,oy+1,7,7));
    const r={id,name,x:ox,y:oy,width:9,height:9,bed:id,description};world.regions.push(r);return r;
  };
  // One continuous terrace. Living bridges open the next reach, never load a new board.
  add('source','The first trickle',0,12,'Bring the seed to the stone cradle. Let the garden respond.');
  add('vessel','The wandering spring',11,12,'A little place with more room inside.');
  add('banks','Between the banks',22,12,'Water changes what can still be moved.');
  add('crossing','The far bank',22,1,'The same spring, a different shore.');
  add('hollow','A garden within',11,1,'Some places carry more than water.');
  add('heart','The heartwood',0,1,'The old roots meet beneath the ground.');
  const bed = (id,x,y,bridge) => world.beds.push({id,room:'outside',x,y,bridge});
  out.channels.push(...[[1,14],[2,14],[3,14],[4,14],[5,14],[6,14]]);out.sources.push([1,14]);
  world.objects.push(stone('sluice',2,14),seed('source-seed',4,16));
  bed('source',6,14,rect(8,17,5,1));
  // A source carried within an acyclic, enterable garden. The plug must leave its interior.
  world.rooms.spring=inside();
  world.objects.push(garden('spring',15,17,'spring'),stone('inner-plug',1,1,'spring'),seed('vessel-seed',16,15));
  out.channels.push([17,15]);bed('vessel',17,15,rect(19,17,5,1));
  // Carry the same spring onwards. A long channel can root a seed too early.
  out.channels.push(...[[23,15],[24,15],[25,15],[26,15],[27,15],[28,15]]);
  world.objects.push(seed('banks-seed',25,17),stone('banks-stone',26,16));
  // A bank with one approach prevents simply watering the cradle from below.
  out.floor = out.floor.filter(([x,y]) => !(y===16 && x>=27));
  bed('banks',28,15,rect(25,9,1,5));
  out.channels.push(...[[24,4],[25,4],[26,4],[27,4],[28,4]]);
  world.objects.push(seed('crossing-seed',26,6),stone('crossing-stone',25,5));
  out.floor = out.floor.filter(([x,y]) => !(x===28 && y===5));
  bed('crossing',28,4,rect(19,6,5,1));
  // A dry nested chamber transports its seed. The outer spring remains the same object.
  world.rooms.hollow={width:3,height:3,floor:[[0,1],[1,1],[2,1]],channels:[],sources:[],name:'Inside the hollow'};
  world.objects.push(garden('hollow',15,5,'hollow'),seed('hollow-seed',1,1,'hollow'));
  out.floor = out.floor.filter(([x,y]) => !(x===16 && y>=3 && y<=4));
  out.channels.push(...[[13,4],[14,4],[15,4],[16,4],[17,4]]);
  bed('hollow',17,4,rect(8,6,5,1));
  out.channels.push(...[[2,4],[3,4],[4,4],[5,4],[6,4]]);
  world.objects.push(seed('heart-seed',4,6),stone('heart-stone',5,5));
  out.floor = out.floor.filter(([x,y]) => !(x===6 && y===5));
  bed('heart',6,4,[]);
  out.floor = [...new Map(out.floor.map(p=>[p.join(','),p])).values()];
  world.roots = world.beds.slice(0,-1).map((b,i)=>({from:b.id,to:world.beds[i+1].id}));
  return world;
}
export const journey = makeWorld();
