import { floorAt, water, cellKey, regionOf, complete } from './garden-model.mjs';
const noise = (x,y,n=0) => { const v=Math.sin(x*127.1+y*311.7+n*74.7)*43758.5453;return v-Math.floor(v); };
const mix = (a,b,t) => a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const rgb = c => `rgb(${c.join(',')})`;
const tint = (c,n) => rgb(c.map(v=>Math.max(0,Math.min(255,v+n))));
export function gardenView(canvas, world) {
  const ctx=canvas.getContext('2d',{alpha:false});
  let current, previous, wet=new Map(), changed=0, frame=0, last=0, alive=true, overview=false, active=true, width=1,height=1,dpr=1;
  let reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, camera=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const preference=()=>{reduce=media.matches; draw(performance.now());schedule();};media.addEventListener('change',preference);
  const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw(performance.now());});resize.observe(canvas);
  function draw(now) {
    if(!current||!width||!height)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const region=regionOf(world,current), room=overview?'outside':current.player.room, inside=room!=='outside';
    const bounds=inside?{x:-.7,y:-.7,width:world.rooms[room].width+1.4,height:world.rooms[room].height+1.4}:overview?{x:0,y:0,width:world.rooms.outside.width,height:world.rooms.outside.height}:region;
    const scale=Math.min(width/(bounds.width+bounds.height)*(overview?1.02:1.4),height/(bounds.width+bounds.height)*1.65,inside?105:72);
    const target={x:bounds.x+bounds.width/2-.5,y:bounds.y+bounds.height/2-.5,scale};
    if(!camera||inside!==camera.inside||reduce||overview!==camera.overview)camera={...target,inside,overview};
    const smooth=Math.min(1,(now-last||33)/130);
    camera.x+=(target.x-camera.x)*smooth;camera.y+=(target.y-camera.y)*smooth;camera.scale+=(target.scale-camera.scale)*smooth;
    last=now;
    const S=camera.scale;
    const P=(x,y,z=0)=>({x:width/2+(x-y-camera.x+camera.y)*S*.86,y:height*.47+(x+y-camera.x-camera.y)*S*.48-z*S*.92});
    const progress=current.grown.length/world.beds.length, finished=complete(world,current), t=reduce?0:now/1000;
    const bg=ctx.createLinearGradient(0,0,0,height);bg.addColorStop(0,finished?'#d6e4d4':inside?'#dfe6df':'#e6e7de');bg.addColorStop(1,finished?'#afc5b8':'#c4d0c6');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    // Faint atmosphere, with deterministic decorative motes rather than gameplay randomness.
    if(!reduce)for(let i=0;i<16;i++){const x=(noise(i,2)*width+Math.sin(t*.13+i)*14+width)%width,y=(noise(i,5)*height-t*(2+i%3)+height*100)%height;ctx.fillStyle=`rgba(255,255,232,${.12+progress*.15})`;ctx.beginPath();ctx.arc(x,y,1+i%2,0,7);ctx.fill();}
    function poly(points,fill,stroke=null){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.7;ctx.stroke();}}
    function cube(x,y,z,w,d,h,color){const a=P(x-w/2,y-d/2,z),b=P(x+w/2,y-d/2,z),c=P(x+w/2,y+d/2,z),e=P(x-w/2,y+d/2,z),A=P(x-w/2,y-d/2,z+h),B=P(x+w/2,y-d/2,z+h),C=P(x+w/2,y+d/2,z+h),E=P(x-w/2,y+d/2,z+h);poly([b,c,C,B],tint(color,-22));poly([c,e,E,C],tint(color,-42));poly([A,B,C,E],rgb(color));}
    function line(a,b,color,w=1){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke();}
    function ellipse(p,rx,ry,color){ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,7);ctx.fillStyle=color;ctx.fill();}
    function ring(x,y,z,r,color,lw=2){const pts=Array.from({length:33},(_,i)=>P(x+Math.cos(i*Math.PI/16)*r,y+Math.sin(i*Math.PI/16)*r,z));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();}
    function grass(x,y,z,growing,n=0){const p=P(x,y,z),h=S*(.13+noise(x,y,n)*.13),wind=reduce?0:Math.sin(t*1.2+x*3+y)*S*.018;line(p,{x:p.x-h*.35+wind,y:p.y-h*.8},growing?'#54856b':'#a8a58b',Math.max(1,S*.027));line(p,{x:p.x+wind,y:p.y-h},growing?'#6d9977':'#bab59b',Math.max(1,S*.025));line(p,{x:p.x+h*.35+wind,y:p.y-h*.65},growing?'#759a74':'#9d9c83',Math.max(1,S*.025));}
    function flower(x,y,z,n){const p=P(x,y,z),q=P(x,y,z+.22+noise(x,y,n)*.13);line(p,q,'#517b61',Math.max(1,S*.025));const petal= n%3===0?'#f4ce94':n%3===1?'#e8b9b6':'#f6f0d8';for(let a=0;a<5;a++){const ang=a*1.256;ellipse({x:q.x+Math.cos(ang)*S*.035,y:q.y+Math.sin(ang)*S*.035},S*.045,S*.035,petal);}ellipse(q,S*.025,S*.025,'#b88954');}
    if(room==='outside')for(const root of world.roots??[]){
      const a=world.beds.find(b=>b.id===root.from),b=world.beds.find(b=>b.id===root.to),A=P(a.x,a.y,-.55),B=P(b.x,b.y,-.55),C={x:(A.x+B.x)/2,y:(A.y+B.y)/2+S*2};
      const living=current.grown.includes(root.from)&&current.grown.includes(root.to);
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(C.x,C.y,B.x,B.y);ctx.strokeStyle=living?'#779d77':'#9aab9280';ctx.lineWidth=Math.max(1,S*.06);ctx.stroke();
      if(living){for(let j=0;j<3;j++){const f=reduce?(j+1)/4:(t*.09+j/3)%1,ix=(1-f)**2*A.x+2*(1-f)*f*C.x+f*f*B.x,iy=(1-f)**2*A.y+2*(1-f)*f*C.y+f*f*B.y;ellipse({x:ix,y:iy},Math.max(1.5,S*.04),Math.max(1.5,S*.04),'#deebbb');}}
    }
    const space=world.rooms[room];
    const cells=[...space.floor];
    if(room==='outside')for(const b of world.beds)if(current.grown.includes(b.id))cells.push(...b.bridge??[]);
    const unique=[...new Map(cells.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]+a[1]-b[0]-b[1]);
    // Floating terraces have actual height/side faces and a common orthographic camera.
    for(const [x,y] of unique){const p=P(x,y);if(p.x < -S*2||p.x>width+S*2||p.y< -S*3||p.y>height+S*3)continue;
      const r=room==='outside'?world.regions.find(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height):region;
      const green=finished||current.grown.includes(r?.bed),variation=noise(x,y)*10;
      const base=mix([193,187,153],[151,179,133],green?.8:.08).map(v=>v+variation);
      const bridge=room==='outside'&&!space.floor.some(([a,b])=>x===a&&y===b);
      cube(x,y,-.68,1,1,.68,bridge?[143,163,127]:base);
      const isChannel=(space.channels??[]).some(([a,b])=>a===x&&b===y)||(space.sources??[]).some(([a,b])=>a===x&&b===y)||world.beds.some(b=>b.room===room&&b.x===x&&b.y===y);
      if(isChannel){cube(x,y,.012,.72,.72,.025,[136,147,126]);if(wet.has(cellKey({room,x,y}))){cube(x,y,.045,.65,.65,.025,[95,173,174]);const f=(t*.45+noise(x,y))%1;ring(x,y,.075,.1+f*.19,`rgba(230,255,241,${reduce?.5:(1-f)*.7})`,Math.max(.6,S*.025));}else{line(P(x-.17,y-.13,.047),P(x+.1,y+.18,.047),'#a9aa8c',1);}}
      else if(!world.objects.some(o=>o.room===room&&o.x===x&&o.y===y))for(let k=0;k<(green?4:2);k++){const gx=x+(noise(x,y,k)-.5)*.77,gy=y+(noise(y,x,k+9)-.5)*.77;if(green&&noise(x,y,k+40)>.72)flower(gx,gy,.04,k);else grass(gx,gy,.035,green,k);}
      if(bridge){for(const a of [-.26,.26])line(P(x+a,y-.48,.035),P(x+a,y+.48,.035),'#7b926b',Math.max(1,S*.03));}
    }
    // Join adjacent wet cells so water reads as one flow, not separate blue tiles.
    for(const p of wet.values())if(p.room===room){for(const [dx,dy] of [[1,0],[0,1]]){const q={room,x:p.x+dx,y:p.y+dy};if(wet.has(cellKey(q)))line(P(p.x,p.y,.085),P(q.x,q.y,.085),'#73b9b5',Math.max(1.2,S*.18));}}
    for(const box of current.objects.filter(o=>o.kind==='garden'&&o.room===room)){
      const r=world.rooms[box.interior];for(const d of r.waterExits??[]){if(d!=='up')continue;const origin={room:box.interior,x:Math.floor(r.width/2),y:0};if(wet.has(cellKey(origin))){const a=P(box.x,box.y-.34,.35),b=P(box.x,box.y-.58,.07);line(a,b,'#80c3bd',Math.max(2,S*.09));}}
    }
    // Stone borders and seeded vegetation occupy only the non-walkable rim.
    const borders=new Map();
    for(const [x,y] of unique)for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
      const bx=x+dx,by=y+dy;if(!floorAt(world,current,{room,x:bx,y:by}))borders.set(`${bx},${by}`,[bx,by,dx,dy]);
    }
    for(const [x,y,dx,dy] of borders.values()){
      const p=P(x,y);if(p.x< -S||p.x>width+S||p.y< -S||p.y>height+S)continue;
      const n=noise(x,y,4),green=finished||current.grown.includes(region.bed);
      if(n>.38){cube(x-dx*.36,y-dy*.36,-.12,.32+n*.2,.3,.2+n*.24,green?[124,151,113]:[160,164,132]);}
      if(n>.7){const bx=x-dx*.3,by=y-dy*.3;grass(bx,by,.13,green,7);grass(bx+.12,by-.1,.12,green,11);if(green)flower(bx,by,.22,Math.floor(n*20));}
    }
    // Edges get a handful of hanging roots; decorative detail never occupies a legal tile.
    for(const [x,y] of unique){if(floorAt(world,current,{room,x,y:y+1})||noise(x,y)<.45)continue;line(P(x-.2,y+.48,-.2),P(x-.25,y+.5,-.9-noise(x,y)*.3),'#8a9781',Math.max(1,S*.025));}
    const objects=current.objects.filter(o=>o.room===room).map(o=>({...o,sort:o.x+o.y+.1}));
    if(current.player.room===room)objects.push({...current.player,kind:'player',sort:current.player.x+current.player.y+.2});
    objects.sort((a,b)=>a.sort-b.sort);
    for(const o of objects){let x=o.x,y=o.y;
      const old=o.kind==='player'?previous?.player:previous?.objects.find(a=>a.id===o.id);
      if(!reduce&&old?.room===o.room&&now-changed<115&&Math.abs(old.x-x)+Math.abs(old.y-y)<=1){const f=1-(1-(now-changed)/115)**3;x=old.x+(x-old.x)*f;y=old.y+(y-old.y)*f;}
      const p=P(x,y,.04);ellipse({x:p.x,y:p.y+S*.08},S*.31,S*.13,'#223e3528');
      if(o.kind==='stone'){cube(x,y,.05,.62,.62,.52,[150,158,147]);cube(x-.03,y-.03,.57,.48,.48,.04,[173,181,161]);line(P(x-.21,y-.1,.62),P(x+.2,y+.1,.62),'#8b9687',Math.max(1,S*.035));}
      else if(o.kind==='seed'){
        if(o.rooted){cube(x,y,.04,.55,.55,.18,[131,157,108]);const top=P(x,y,.78);line(P(x,y,.12),top,'#5c8053',S*.075);ellipse(P(x-.14,y,.56),S*.2,S*.09,'#6b9c65');ellipse(P(x+.14,y,.65),S*.21,S*.1,'#90b57a');for(let k=0;k<5;k++)flower(x+(noise(x,y,k)-.5)*.65,y+(noise(y,x,k)-.5)*.65,.15,k);}
        else{cube(x,y,.06,.43,.43,.3,[184,131,83]);const q=P(x,y,.5);line(P(x,y,.33),q,'#607a52',S*.045);ellipse({x:q.x-S*.07,y:q.y+S*.01},S*.12,S*.055,'#93a573');ellipse({x:q.x+S*.07,y:q.y-S*.04},S*.11,S*.055,'#c2c08c');ring(x,y,.39,.15,'#e7c89d',Math.max(1,S*.025));}
      }else if(o.kind==='garden'){
        cube(x,y,.05,.86,.86,.23,[192,195,167]);cube(x,y,.28,.68,.68,.035,[103,154,132]);
        if(world.rooms[o.interior].waterExits?.includes('up')){cube(x,y-.43,.18,.2,.24,.08,[126,167,155]);line(P(x-.08,y-.5,.27),P(x+.08,y-.5,.27),'#517e76',Math.max(1,S*.025));}
        const inner=world.rooms[o.interior], iw=inner.width;
        for(const [ix,iy] of inner.floor){const sx=x+(ix-(iw-1)/2)*.19,sy=y+(iy-(inner.height-1)/2)*.19;cube(sx,sy,.32,.17,.17,.025,[181,198,154]);if(wet.has(cellKey({room:o.interior,x:ix,y:iy})))cube(sx,sy,.35,.13,.13,.01,[91,183,182]);}
        // Clearly open center edges, attached corner posts, and a living miniature interior.
        for(const [dx,dy] of [[-.34,-.34],[.34,-.34],[-.34,.34],[.34,.34]])cube(x+dx,y+dy,.28,.13,.13,.2,[217,218,190]);
        const badge=P(x,y,.72);ellipse(badge,S*.14,S*.11,'#f3edd8');ctx.fillStyle='#42695f';ctx.font=`600 ${Math.max(9,S*.19)}px system-ui`;ctx.textAlign='center';ctx.fillText(o.interior==='hollow'?'Ⅱ':'Ⅰ',badge.x,badge.y+S*.065);
        for(const innerObj of current.objects.filter(a=>a.room===o.interior)){const sx=x+(innerObj.x-1)*.19,sy=y+(innerObj.y-1)*.19;cube(sx,sy,.37,.12,.12,.08,innerObj.kind==='seed'?[206,143,81]:[127,141,123]);}
      }else if(o.kind==='portal'){
        cube(x,y,.04,.78,.5,.16,[190,197,174]);for(const dx of [-.27,.27])cube(x+dx,y,.16,.16,.24,.63,[217,223,195]);cube(x,y,.79,.7,.26,.14,[224,226,200]);poly([P(x-.18,y,.21),P(x+.18,y,.21),P(x+.18,y,.76),P(x-.18,y,.76)],'#78acaa');ring(x,y,.18,.28,'#a2dfcf',2);
      }else if(o.kind==='player'){
        const bob=reduce?0:Math.sin(t*2)*.012;cube(x,y,.04,.24,.24,.31,[53,91,90]);
        const head=P(x,y,.59+bob);ellipse(head,S*.17,S*.19,'#f4dec0');const hat=P(x,y,.75+bob);ellipse(hat,S*.28,S*.105,'#d27851');ellipse({x:hat.x,y:hat.y-S*.09},S*.17,S*.105,'#e29663');const pack=P(x-.12,y+.1,.35);ellipse(pack,S*.12,S*.14,'#b6ba87');
      }
    }
    for(const b of world.beds.filter(b=>b.room===room&&!current.grown.includes(b.id))){ring(b.x,b.y,.09,.38,'#6d7d59',Math.max(1.3,S*.045));for(let k=0;k<4;k++){const a=k*Math.PI/2;cube(b.x+Math.cos(a)*.34,b.y+Math.sin(a)*.34,.04,.13,.13,.13,[226,213,163]);}}
    // The finale connects each restored reach visually; it is absent from initial play.
    if(finished&&room==='outside'){for(const r of world.regions){const b=world.beds.find(b=>b.id===r.bed);for(let k=0;k<22;k++){const x=r.x+1+noise(k,r.x)*6,y=r.y+1+noise(k,r.y+2)*6;flower(x,y,.1,k);}
      const p=P(b.x,b.y,1.5);const glow=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,S*1.8);glow.addColorStop(0,'#fff0ac35');glow.addColorStop(1,'#fff0ac00');ctx.fillStyle=glow;ctx.fillRect(p.x-S*2,p.y-S*2,S*4,S*4);}}
    if(finished&&room==='outside'){
      const heart=world.beds.at(-1),hx=heart.x,hy=heart.y;
      cube(hx,hy,.1,.38,.38,1.5,[124,113,76]);
      const crown=P(hx,hy,2.05),r=S*.95;
      for(let k=0;k<9;k++){const a=k*2.399,rad=r*(.15+noise(k,4)*.65),p={x:crown.x+Math.cos(a)*rad,y:crown.y+Math.sin(a)*rad*.55};ellipse(p,r*.43,r*.3,k%2?'#89b581':'#a9cc91');}
      for(let k=0;k<12;k++){const a=k*.8,p={x:crown.x+Math.cos(a)*r*.7,y:crown.y+Math.sin(a)*r*.42};ellipse(p,Math.max(1.4,S*.06),Math.max(1.2,S*.045),k%2?'#f4d9ac':'#f1ebc9');}
    }
    if(!overview){const compass=P(bounds.x+bounds.width-1,bounds.y,0);ctx.fillStyle='#46665c';ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.fillText('N',Math.min(width-20,Math.max(20,compass.x)),Math.max(24,compass.y-18));}
    if(inside){ctx.fillStyle='#43685a';ctx.font='500 12px system-ui';ctx.textAlign='center';ctx.fillText('A whole place, held inside.',width/2,height-66);}
  }
  function loop(now){frame=0;if(!alive||!active||document.hidden)return;if((!reduce||now-changed<180)&&(now-last>=30||now-changed<150))draw(now);if(!reduce||now-changed<180)frame=requestAnimationFrame(loop);}
  function schedule(){if(alive&&active&&!document.hidden&&!frame)frame=requestAnimationFrame(loop);}
  schedule();
  return {
    update(state){previous=current;current=state;wet=water(world,state);changed=performance.now();draw(changed);schedule();},
    overview(value){if(overview===value)return;overview=value;camera=null;draw(performance.now());},
    active(value){active=value;if(value){draw(performance.now());schedule();}else{cancelAnimationFrame(frame);frame=0;}},
    destroy(){alive=false;cancelAnimationFrame(frame);resize.disconnect();media.removeEventListener('change',preference);},
  };
}
