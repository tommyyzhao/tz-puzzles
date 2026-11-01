import test from 'node:test';
import assert from 'node:assert/strict';
import { journey, prototypes } from './garden-world.mjs';
import { gardenInitial, gardenStep, gardenCheckpoint, gardenSave, water, complete, validGardenState, destination, entry, cellKey } from './garden-model.mjs';
import { history } from './history.mjs';

const decode = text => text.split(/\s+/).filter(Boolean).map(a => ({ U:'up',R:'right',D:'down',L:'left',EU:'enter-up',ER:'enter-right',ED:'enter-down',EL:'enter-left' })[a]);
export const campaignTrace = [
  ['source','U R R D R U U L L L L U'],
  ['travel-vessel','R R R D R R D D R R R R'],
  ['vessel','R R R R R D R U L U L U R D ER R'],
  ['travel-banks','D D L U R L U U R R D D L D R R R R R'],
  ['banks','R R D R R U U L U R R L D D D L U'],
  ['travel-crossing','U U U U U U U U'],
  ['crossing','U U R U D L L U U R L D D R R U R U D R R U U U L L L D R D D D L L U'],
  ['travel-hollow','L U U R D U R R D D L L L L L L L L'],
  ['hollow','L U L D L L L U U R D L D ER R R R D D R U U'],
  ['travel-heart','R U L L L L L U L D R D L L L L L'],
  ['heart','L D L L L L U R D R U U L U R D D D R R U L D L U'],
];
const replay=(w,s,trace)=>decode(trace).reduce((state,a)=>gardenStep(w,state,a),s);

test('complete authored journey: continuous state, valid every move, six restorations, real ending',()=>{
  let s=gardenInitial(journey),count=0;
  assert.equal(validGardenState(journey,s),true);
  for(const [name,text] of campaignTrace){
    for(const a of decode(text)){
      const before=structuredClone(s),next=gardenStep(journey,s,a);
      assert.deepEqual(s,before);assert.notEqual(next,s,`${name}: blocked ${a}`);
      assert.equal(validGardenState(journey,next),true,`${name}: invalid ${a}`);
      s=next;count++;
    }
    if(!name.startsWith('travel-'))assert.ok(s.grown.includes(name),name);
  }
  assert.equal(count,201);assert.equal(complete(journey,s),true);assert.equal(s.grown.length,6);
  for(const b of journey.beds)assert.ok(water(journey,s).has(cellKey(b)),`restored ${b.id} retains water`);
  assert.equal(gardenStep(journey,s,'up'),s);
});

test('prototype solutions use the same public transition functions',()=>{
  for(const [id,text] of [['portable','U U R U R L D R ER R'],['connections','R R U R U'],['terrain','U U D R R D R U']]){
    const w=prototypes[id],s=replay(w,gardenInitial(w),text);
    assert.equal(complete(w,s),true,id);assert.equal(validGardenState(w,s),true,id);
  }
});

test('terrain: premature water roots a seed off its cradle; undo recovers all consequences',()=>{
  const w=prototypes.terrain,h=history(gardenInitial(w));
  // Open the sluice, then push the seed into the flowing channel at the wrong position.
  for(const a of decode('U U D R D R U L D L U'))h.apply(gardenStep(w,h.state,a));
  // Explicit local counterexample, independent of one particular walking route.
  const before={...gardenInitial(w),player:{room:'outside',x:3,y:4}};
  before.objects[0].y=1;
  h.apply(before);h.apply(gardenStep(w,h.state,'up'));
  assert.equal(h.state.objects.find(o=>o.kind==='seed').rooted,true);
  assert.equal(complete(w,h.state),false);
  const rooted=h.state.objects.find(o=>o.kind==='seed');
  assert.equal(gardenStep(w,{...h.state,player:{room:'outside',x:rooted.x,y:rooted.y+1}},'up').objects.find(o=>o.kind==='seed').y,rooted.y);
  h.undo();assert.equal(h.state.objects.find(o=>o.kind==='seed').rooted,false);h.redo();assert.equal(h.state.objects.find(o=>o.kind==='seed').rooted,true);
});

test('portable space: fixed interior, relocated exit, blocked outlet and recovery',()=>{
  const w=prototypes.portable,s=gardenInitial(w);
  assert.equal(water(w,s).has('outside:3,2'),false);
  const open=structuredClone(s);open.objects.find(o=>o.id==='plug').x=2;
  const source=water(w,open);assert.ok(source.has('spring:1,0'));
  assert.deepEqual(destination(w,s,{room:'spring',x:1,y:0},'up'),{room:'outside',x:3,y:2});
  open.objects.find(o=>o.id==='spring').x=5;
  assert.deepEqual(destination(w,open,{room:'spring',x:1,y:0},'up'),{room:'outside',x:5,y:2});
  assert.ok(water(w,open).has('outside:5,2'));
  assert.deepEqual(open.objects.find(o=>o.id==='seed'),s.objects.find(o=>o.id==='seed'));
  const landing=structuredClone(s);Object.assign(landing.objects.find(o=>o.id==='seed'),{room:'spring',x:1,y:2});
  assert.equal(entry(w,landing,{room:'outside',x:3,y:4},'up'),null);
  assert.deepEqual(entry(w,landing,{room:'outside',x:3,y:4},'up',true),{room:'spring',x:1,y:2});
  const h=history(open);h.apply(gardenInitial(w));h.undo();assert.deepEqual(h.state,open);
});

test('invalid actions and malformed snapshots fail closed; containment cannot cycle',()=>{
  for(const w of [journey,...Object.values(prototypes)]){
    const s=gardenInitial(w);for(const a of [null,{},'fly','__proto__','constructor','enter-constructor'])assert.equal(gardenStep(w,s,a),s);
    for(const bad of [null,{},[],{...s,player:null},{...s,objects:[null]},{...s,grown:['invented']}])assert.equal(validGardenState(w,bad),false);
    assert.equal(validGardenState(w,s),true);
  }
  const s=gardenInitial(journey);s.objects.find(o=>o.id==='spring').room='spring';assert.equal(validGardenState(journey,s),false);
  assert.equal(entry(prototypes.portable,gardenInitial(prototypes.portable),{room:'outside',x:1,y:1},'constructor'),null);
});

test('checkpoints and saves preserve recovery; corrupt or unavailable storage is safe',()=>{
  const state=gardenInitial(journey),data={state,checkpoint:structuredClone(state),started:true};
  let raw=null;const storage={getItem:()=>raw,setItem:(k,v)=>{raw=v;}};
  const saved=gardenSave(storage,'test',journey);
  assert.equal(saved.save(data),true);assert.deepEqual(saved.load(),data);
  for(const value of ['{','null',' '.repeat(120001),JSON.stringify({...data,state:{}})]){raw=value;assert.equal(saved.load(),null);}
  assert.equal(gardenSave(null,'test',journey).load(),null);assert.equal(gardenSave(null,'test',journey).save(data),false);
  const early=structuredClone(state);early.player={room:'outside',x:23,y:17};
  assert.equal(gardenCheckpoint(journey,early),false);
  let s=state;for(const [name,text] of campaignTrace.slice(0,4))s=replay(journey,s,text);
  assert.equal(gardenCheckpoint(journey,s),true);
  const leftBehind=structuredClone(s);leftBehind.objects.find(o=>o.id==='spring').x=18;
  assert.equal(gardenCheckpoint(journey,leftBehind),false);
});

test('bounded prototype state exploration: every discovered state respects invariants',()=>{
  const actions=['up','right','down','left','enter-up','enter-right','enter-down','enter-left'];
  for(const [id,w] of Object.entries(prototypes)){
    const initial=gardenInitial(w),queue=[initial],seen=new Set([JSON.stringify(initial)]);let wins=0,i=0;
    const bound=12000;
    for(;i<queue.length&&queue.length<bound;i++){
      const s=queue[i];assert.equal(validGardenState(w,s),true,`${id} ${i}`);
      if(complete(w,s)){wins++;continue;}
      for(const a of actions){const n=gardenStep(w,s,a),k=JSON.stringify(n);if(!seen.has(k)&&queue.length<bound){assert.equal(validGardenState(w,n),true,`${id} discovered`);seen.add(k);queue.push(n);}}
    }
    assert.ok(wins>0,id);
    console.log(JSON.stringify({model:`garden-${id}`,bound,discovered:queue.length,explored:i,completed:i===queue.length,winningStates:wins}));
  }
});
