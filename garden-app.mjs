import { journey, prototypes } from './garden-world.mjs';
import { gardenInitial, gardenStep, gardenCheckpoint, gardenSave, water, entries, regionOf, complete } from './garden-model.mjs';
import { gardenView } from './garden-view.mjs';
import { history } from './history.mjs';

const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
const prototype=params.get('prototype'), world=Object.hasOwn(prototypes,prototype)?prototypes[prototype]:journey;
const ephemeral=params.get('study')==='1', saveKey=`stillwater:v1:${world.id}`;
let storage, initial=gardenInitial(world), checkpoint=structuredClone(initial), started=false, overview=false, endShown=false, lastOpener;
try {storage=sessionStorage;}catch{storage=null;}
const saved=gardenSave(storage,saveKey,world),loaded=ephemeral?null:saved.load();
if(loaded){initial=loaded.state;checkpoint=loaded.checkpoint;started=loaded.started;}
const game=history(initial), view=gardenView($('world'),world), dialog=$('dialog');
let endingTimer=null;
const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
function save(){if(ephemeral){$('save-status').textContent='Study mode · nothing saved';return;}$('save-status').textContent=saved.save({state:game.state,checkpoint,started})?'Saved in this tab · nothing sent':'In-memory play · saving unavailable';}
function refresh(message=''){
  const s=game.state,r=regionOf(world,s),inside=s.player.room!=='outside';
  if(!complete(world,s))$('ending').hidden=true;
  $('place').textContent=inside?world.rooms[s.player.room].name:r.name;
  $('chapter').textContent=world===journey?'STILLWATER':`${world.subtitle} · prototype`;
  $('location').textContent=inside?`Inside ${s.player.room==='spring'?'the spring':'the hollow'} · ${r.name}`:'Out in the garden';
  $('objective').textContent=complete(world,s)?'The garden is awake.':s.grown.includes(r.bed)?'The roots have opened a way onward.':r.description;
  $('status').textContent=message;
  $('undo').disabled=!game.canUndo;$('redo').disabled=!game.canRedo;
  const focused=document.activeElement?.id;
  $('enter-actions').replaceChildren(...(complete(world,s)?[]:entries(world,s)).map(e=>{const b=node('button',`Enter ${e.room==='spring'?'spring':e.room==='hollow'?'hollow':'garden'}`);b.id=`enter-${e.direction}`;b.addEventListener('click',()=>act(`enter-${e.direction}`));return b;}));
  if(focused?.startsWith('enter-'))($(focused)??$('up')).focus({preventScroll:true});
  document.body.dataset.started=String(started);$('welcome').hidden=started;
  $('overview').disabled=false;$('overview').setAttribute('aria-pressed',String(overview));$('overview').textContent=overview?'Return to garden':'Overview';
  for(const d of ['up','right','down','left'])$(d).disabled=complete(world,s);
  $('world').setAttribute('aria-label',`${$('place').textContent}. ${$('objective').textContent} ${s.objects.filter(o=>o.room===s.player.room).map(o=>`${o.rooted?'Rooted ':''}${o.kind} at row ${o.y+1}, column ${o.x+1}`).join('. ')}. Player row ${s.player.y+1}, column ${s.player.x+1}. Board details available in How to play.`);
  view.update(s);view.overview(overview);
  if(complete(world,s)&&!endShown&&started){endShown=true;overview=true;view.overview(true);$('overview').textContent='Return to garden';$('overview').setAttribute('aria-pressed','true');endingTimer=setTimeout(()=>{if(complete(world,game.state)&&endShown){$('ending').hidden=false;$('linger').focus();}},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100);}
  if(!complete(world,s)){clearTimeout(endingTimer);endingTimer=null;$('ending').hidden=true;endShown=false;}
  save();
}
function act(action){
  if(!started||dialog.open||!$('ending').hidden)return;
  if(overview){overview=false;view.overview(false);$('overview').setAttribute('aria-pressed','false');$('overview').textContent='Overview';}
  const before=game.state,next=gardenStep(world,before,action);
  if(next===before){$('status').textContent=complete(world,before)?'Take a moment. The garden is yours.':'That way is blocked. Every move can be undone.';return;}
  game.apply(next);
  const region=regionOf(world,next),checkpointRegion=regionOf(world,checkpoint);
  if(world.regions.indexOf(region)>world.regions.indexOf(checkpointRegion)&&gardenCheckpoint(world,next))checkpoint=structuredClone(next);
  const changed=next.grown.length>before.grown.length;
  const rooted=next.objects.some((o,i)=>o.rooted&&!before.objects[i].rooted);
  refresh(changed?'Something stirs. A way opens.':rooted?'The seed has taken root.':before.player.room!==next.player.room?next.player.room==='outside'?'Back outside.':`Inside ${next.player.room==='spring'?'the spring':'the hollow'}.`:'');
}
for(const d of ['up','right','down','left'])$(d).addEventListener('click',()=>act(d));
function undo(){game.undo();overview=false;if(checkpoint.grown.some(id=>!game.state.grown.includes(id)))checkpoint=structuredClone(game.state);refresh('Move undone.');}
function redo(){game.redo();refresh('Move restored.');}
$('undo').addEventListener('click',undo);$('redo').addEventListener('click',redo);
$('recover').addEventListener('click',()=>{game.apply(structuredClone(checkpoint));refresh('Clearing restored. Undo brings your previous position back.');});
$('begin').addEventListener('click',()=>{started=true;refresh('Move with arrows, WASD, or the direction pad. Walk into objects to push.');$('up').focus({preventScroll:true});});
$('overview').addEventListener('click',()=>{overview=!overview;view.overview(overview);$('overview').setAttribute('aria-pressed',String(overview));$('overview').textContent=overview?'Return to garden':'Overview';});
$('linger').addEventListener('click',()=>{$('ending').hidden=true;$('overview').focus();});
function show(title,children){if(!dialog.open)lastOpener=document.activeElement;$('dialog-title').textContent=title;$('dialog-content').replaceChildren(...children);if(!dialog.open)dialog.showModal();$('close-dialog').focus();view.active(false);}
function description(){
  const s=game.state,wet=water(world,s),pos=p=>`${p.room}, row ${p.y+1}, column ${p.x+1}`;
  const list=node('ul','');
  const facts=[`You: ${pos(s.player)}.`, ...world.beds.filter(b=>s.grown.includes(b.id)&&b.bridge?.length).map(b=>`Living bridge opened by ${b.id}: ${b.bridge.map(([x,y])=>`${x+1},${y+1}`).join('; ')}.`),...s.objects.map(o=>`${o.kind==='garden'?`Portable ${o.interior}`:o.kind}${o.rooted?' (rooted; cannot move)':''}: ${pos(o)}.`),...world.beds.map(b=>`Planting cradle: ${pos(b)}; ${s.grown.includes(b.id)?'restored':'dormant'}.`),...Object.entries(world.rooms).map(([id,r])=>`${id} walkable cells: ${r.floor.map(([x,y])=>`${x+1},${y+1}`).join('; ')}. Channels: ${(r.channels??[]).map(([x,y])=>`${x+1},${y+1}`).join('; ')}. Springs: ${(r.sources??[]).map(([x,y])=>`${x+1},${y+1}`).join('; ')}. Visible water outlets: ${(r.waterExits??[]).join(', ')||'none'}.`),`Currently wet cells: ${[...wet.values()].map(pos).join('; ')}.`];
  for(const f of facts)list.append(node('li',f));show('The garden, described',[node('p','Coordinates are column and row, counted from 1. All other cells are impassable. This describes visible state, not a solution.'),list]);
}
$('describe').addEventListener('click',description);
$('help').addEventListener('click',()=>{
  const details=node('button','Board details');details.addEventListener('click',description);
  show('A little room to experiment',[node('p','Move one step with arrow keys, WASD or the direction pad. The arrows on the buttons follow the view: north is upper-right; east is lower-right.'),node('p','Walk into an object to push it. You cannot pull. Beside an open garden, use its Enter button or E. Walking through an open interior edge takes you back outside.'),node('p','Seeds, springs and planting cradles respond to the world around them. Look at what changes when you try something.'),node('h3','Nothing needs to be rushed'),node('p','Undo and Redo are free. Z undoes; Shift Z redoes. Restore clearing returns to your arrival in the current area and can itself be undone. No timers, no move limits.'),node('p','Overview shows the landscape. Your current position is saved in this browser tab; nothing is sent. Escape closes this panel.'),details]);
});
$('close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{view.active(true);if(dialog.open)return;if(lastOpener?.isConnected&&lastOpener.checkVisibility())lastOpener.focus({preventScroll:true});else $('help').focus();});
$('again').addEventListener('click',()=>{
  const restart=node('button','Start a new journey');restart.className='primary';restart.addEventListener('click',()=>{game.apply(gardenInitial(world));checkpoint=structuredClone(game.state);endShown=false;overview=false;dialog.close();refresh('A new beginning. Undo can restore the previous garden.');});
  show('Begin again?',[node('p','The garden returns to its sleeping state. Your previous state remains available with Undo during this session.'),restart]);
});
document.addEventListener('keydown',e=>{
  if(dialog.open||!started||!$('ending').hidden||e.altKey||e.target.closest('input,select,textarea,[contenteditable="true"]'))return;
  const k=e.key.toLowerCase();
  if(k==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
  if(e.ctrlKey||e.metaKey)return;
  if(k==='e'){const choices=entries(world,game.state);if(choices.length===1){e.preventDefault();act(`enter-${choices[0].direction}`);}return;}
  const d={arrowup:'up',arrowright:'right',arrowdown:'down',arrowleft:'left',w:'up',d:'right',s:'down',a:'left'}[k];
  if(d){e.preventDefault();if(!e.repeat)act(d);}
});
window.addEventListener('pagehide',()=>{save();clearTimeout(endingTimer);view.active(false);});
window.addEventListener('pageshow',()=>view.active(!document.hidden&&!dialog.open));
document.addEventListener('visibilitychange',()=>view.active(!document.hidden&&!dialog.open));
if(world!==journey){$('welcome').querySelector('h2').textContent=world.title;$('welcome').querySelector('.eyebrow').textContent='A SMALL PLAYABLE EXPERIMENT';document.title=`${world.title} · Stillwater`;}
refresh();
