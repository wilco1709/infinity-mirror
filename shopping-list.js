/* Shopping list for the infinity mirror: every part to build the mirror the Stage drawer shows, from a saved build
   (Stage > Shopping list > Save). The sim hands over a snapshot: its LEDS / FILMS / GAPS rows (datasheet values), the
   power settings, the full-white draw its light meter computed and the woofer LED settings.
   build(snapshot) -> list, page(list) -> a stand-alone HTML page, text(list) / csv(list) for copying.
   Sizing rules that are rules of thumb, not a datasheet, are marked est and shown as estimates on the list.
   Node: require('./shopping-list.js') for the tests. */
(function(root){
'use strict';
const RHO_CU=0.0172;   /* copper, ohm mm2 per m at 20 C */
/* flexible copper wire: mm2 -> amps for short runs inside a ventilated box (estimate between IEC 60364 and chassis wiring tables) */
const WIRES=[[0.25,3],[0.5,6],[0.75,8],[1,10],[1.5,15],[2.5,20],[4,30],[6,40],[10,60],[16,80],[25,105]];
const BARS=[[10,2],[15,2],[20,2],[20,3],[25,3],[30,4],[40,4]];     /* copper flat bar, width x thickness in mm, loaded at 2 A/mm2 (est) */
const FUSES=[3,5,7.5,10,15,20,25,30];                             /* blade (ATO) fuses */
const ACFUSES=[1,1.6,2,2.5,3.15,4,5,6.3,8,10];                    /* 5 x 20 mm slow-blow */
const PSUS=[{n:'Mean Well LRS-200-5',A:40,W:200,eff:.86},{n:'Mean Well LRS-350-5',A:60,W:300,eff:.87}];
const TERM_MM2=4;      /* biggest wire one supply output screw takes (est); thicker runs are split over several screws */
/* what you buy for each LED option of the sim (keys = LEDS ids). strip: cut reels into rows; mat: flexible matrices;
   mod: HUB75 modules; cab: a ready cabinet with its own supplies and receiving card. */
const BOM={
 ws2812b:{type:'strip',chip:'WS2812B-2020',perM:160,reelM:5,mine:1},
 hd107s:{type:'strip',chip:'HD107S-2020',perM:160,reelM:5,check:'Check that the shop sells this chip as 160 LEDs/m (6.25 mm) strip; if not, the 6.25 mm grid needs a custom PCB.'},
 ws2816b:{type:'strip',chip:'WS2816B-2020',perM:160,reelM:5,check:'Check that the shop sells this chip as 160 LEDs/m (6.25 mm) strip; if not, the 6.25 mm grid needs a custom PCB.'},
 ws60_70:{type:'strip',chip:'WS2812B-5050',perM:60,reelM:5},
 ws60_90:{type:'strip',chip:'WS2812B-5050',perM:60,reelM:5},
 ws2812b5050:{type:'mat',mats:[[36,256,'WS2812B 16 × 16 flexible matrix, 160 × 160 mm, 10 mm pitch','6 × 6']]},
 ws16_80:{type:'mat',mats:[[25,256,'WS2812B 16 × 16 flexible matrix, 160 × 160 mm, 10 mm pitch','5 × 5']]},
 ws16_90:{type:'mat',mats:[[25,256,'WS2812B 16 × 16 flexible matrix, 160 × 160 mm, 10 mm pitch','5 × 5 in the middle'],[21,64,'WS2812B 8 × 8 flexible matrix, 80 × 80 mm, 10 mm pitch (DFRobot)','along two edges']]},
 p6in:{type:'mod',count:9,n:'P6 indoor HUB75 module, 192 × 192 mm, 32 × 32 px (SMD3528, 1/16 scan)',grid:'3 × 3'},
 p6out:{type:'mod',count:9,n:'P6 outdoor HUB75 module, 192 × 192 mm, 32 × 32 px (SMD3535, 1/8 scan, IP65)',grid:'3 × 3'},
 p6in80:{type:'mod',count:16,n:'P6 indoor HUB75 module, 192 × 192 mm, 32 × 32 px (SMD3528, 1/16 scan)',grid:'4 × 4'},
 p6out80:{type:'mod',count:16,n:'P6 outdoor HUB75 module, 192 × 192 mm, 32 × 32 px (SMD3535, 1/8 scan, IP65)',grid:'4 × 4'},
 p5in70:{type:'mod',count:8,n:'P5 indoor HUB75 module, 320 × 160 mm, 64 × 32 px (1/16 scan)',grid:'2 across × 4 high'},
 p5out70:{type:'mod',count:8,n:'P5 outdoor HUB75 module, 320 × 160 mm, 64 × 32 px (1/8 scan, IP65)',grid:'2 across × 4 high'},
 p4in80:{type:'mod',count:18,n:'P4 indoor HUB75 module, 256 × 128 mm, 64 × 32 px (1/16 scan)',grid:'3 across × 6 high'},
 p10mod:{type:'mod',count:18,n:'P10 outdoor HUB75 module, 320 × 160 mm, 32 × 16 px (SMD3535, 1/4 scan)',grid:'3 across × 6 high',frame:'Module cabinet or frame for 18 P10 modules, 960 × 960 mm'},
 p10cab:{type:'cab',n:'Dahua PHGOA10-FC P10 outdoor cabinet, 1000 × 1000 × 98 mm, 96 × 96 px'}};

const fmt=(v,d=0)=>(+v).toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d});
const up=(v,st)=>Math.ceil(v/st-1e-9)*st;                 /* round up to a step */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const thick=(f,g)=>f.glass?+((f.full.match(/([\d.]+) mm/)||[0,g])[1]):g;
/* smallest wire (split over n parallel wires per pole if needed) that carries I amps over len metres one way with at most drop volts */
function wireFor(I,len,drop,maxMm2){
  for(let n=1;n<=8;n++){const w=WIRES.find(([s,a])=>a>=I/n&&2*len*RHO_CU*I/n/s<=drop&&s<=(maxMm2||99));
    if(w)return{s:w[0],n,V:2*len*RHO_CU*I/n/w[0]};}
  return{s:WIRES[WIRES.length-1][0],n:8,V:0};
}
const fuseFor=I=>FUSES.find(f=>f>=I*1.25)||FUSES[FUSES.length-1];
function psuFor(A){if(A<=PSUS[0].A)return{p:PSUS[0],k:1};return{p:PSUS[1],k:Math.ceil(A/PSUS[1].A-1e-9)};}
const barFor=I=>BARS.find(([w,t])=>w*t*2>=I)||BARS[BARS.length-1];

function build(s){
  const L=s.led,F=s.front,B=s.back,G=s.gap,set=s.settings||{},bom=BOM[L.id]||{type:L.kind==='panel'?'mod':'strip',chip:L.n,perM:Math.round(1000/L.pitch),reelM:5};
  const T=bom.type,O=L.outer,N=L.N,nLED=N*N,secs=[],warn=[];
  const sec=(title,note)=>{const x={title,note,items:[]};secs.push(x);return x.items;};
  const it=(q,u,n,d,w,o)=>Object.assign({q,u,n,d,w},o||{});
  const sumMA=L.mA?L.mA.reduce((a,b)=>a+b,0)+(L.idle||0):0;     /* one LED at full white, mA */
  const ppmSim=L.ppm||(L.mod?L.mod*L.mod:1);
  const dsW=T==='strip'||T==='mat'?nLED*sumMA*L.V/1000:L.Pmax*nLED/ppmSim;   /* full white by the datasheet */
  const nowW=s.fullW||dsW;                                                  /* full white at the sim's brightness and balance */
  const m=mm=>up(mm/1000,0.5);                                               /* metres to buy, in half metres */
  const g0=s.glassMm||4,air=!!G.air,tF=air?thick(F,g0):0,tB=air?thick(B,g0):0;
  const stackMm=air?tF+G.mm+tB:G.mm,perim=4*O;
  const kgGlass=air?(O/1000)**2*(tF+tB)/1000*2500:(O/1000)**2*G.mm/1000*1190;

  /* ---------- mirror ---------- */
  {const a=sec('Mirror: glass, film and acrylic','From the LEDs forwards: back mirror, the gap, front mirror. Every sheet '+O+' × '+O+' mm.');
   const plate=(f,where)=>f.glass?it(1,'pcs',f.full,O+' × '+O+' mm, toughened after coating, edges ground and polished.','Coated glass, no film needed. Pilkington mounts the coating facing the viewer.',{find:'Pilkington MirroView '+(f.T>.4?'50/50 ':'')+'glass'}):
     it(1,'pcs','Float glass '+g0+' mm, toughened (tempered / ESG)',O+' × '+O+' mm, edges ground and polished.',where+' film goes on the side facing the gap. Toughened, because it rides on a trailer.',{find:'toughened float glass '+g0+' mm cut to size'});
   if(air){a.push(Object.assign(plate(B,'The back ('+B.n+')'),{n:(B.glass?B.full:'Float glass '+g0+' mm, toughened (tempered / ESG)')+' · back mirror'}));
     a.push(Object.assign(plate(F,'The front ('+F.n+')'),{n:(F.glass?F.full:'Float glass '+g0+' mm, toughened (tempered / ESG)')+' · front mirror'}));}
   else{a.push(it(1,'pcs','Cast acrylic sheet (PMMA GS), clear, '+G.mm+' mm',O+' × '+O+' mm, protective foil on both faces.','Cast, not extruded: less inner stress, so the film does not lift or craze. Both films go on this one sheet.',{find:'cast acrylic sheet '+G.mm+' mm clear cut to size'}));
     if(F.glass||B.glass)warn.push('MirroView is coated glass: it cannot go on an acrylic sheet. Pick an air gap in Stage › Mirror, or a film.');
     else if(!F.plastic||!B.plastic)warn.push('These window films are made for glass. On acrylic, warmth from the LEDs can make the plastic outgas and lift the film in bubbles (3M warns about this). Use 3M Silver 15 Plastic on acrylic, or an air gap with the films on glass.');}
   const films={};for(const[f,side]of[[B,'back'],[F,'front']])if(!f.glass){(films[f.full]=films[f.full]||{f,sides:[]}).sides.push(side);}
   const piece=O+100;
   for(const k in films){const{f,sides}=films[k],len=(sides.length+1)*piece;
     a.push(it(up(len/1000,0.5),'m',f.full,'From a 1.52 m (60″) wide roll: '+sides.length+' piece'+(sides.length>1?'s':'')+' of '+piece+' × '+piece+' mm ('+sides.join(' and ')+' mirror) plus one spare piece to practise on.',
       'T '+Math.round(f.T*100)+' %, R '+Math.round(f.R*100)+' %. '+f.src+'.',{est:1,find:f.full+' window film'}));}
   if(Object.keys(films).length)a.push(it(1,'set','Window film fitting kit','Spray bottle for slip solution, hard and soft squeegee, snap-off knife with spare blades, glass scraper, lint-free cloths.','Apply the film wet; dust under the film shows in every copy of the tunnel.',{find:'window film installation tool kit'}));}

  /* ---------- frames and spacers ---------- */
  {const a=sec('Frames and spacers','The empty frames between the layers and the frame that holds the stack in the trailer slot.');
   const air2=s.ledAirMm||3.45;
   if(T==='strip'||T==='mat'){a.push(it(1,'pcs','Aluminium sheet 2 mm, LED back plate',O+' × '+O+' mm.','The strips or matrices are stuck on it and it spreads their heat. Paint the front matte black so the plate does not show between the LEDs.',{find:'aluminium sheet 2 mm cut to size'}));
     a.push(it(1,'can','Matte black spray paint, heat resistant','For the LED plate and the inside edges of the frames.','Anything light inside the box shows up in the mirror tunnel.',{find:'heat resistant matte black spray paint'}));}
   else if(T==='mod'){a.push(it(1,'pcs',bom.frame||'Galvanised steel sheet 1.5 mm, module back plate',bom.frame?'Holds the modules on their magnets.':O+' × '+O+' mm. The modules hold on with their magnets.','The modules go '+bom.grid+'; the back of each module needs air, keep the plate clear of the power supplies.',{find:bom.frame?'P10 module cabinet 960 x 960':'galvanised steel sheet 1.5 mm cut to size'}));}
   a.push(it(m(perim*1.1),'m','Spacer frame 1, LEDs to back mirror: black PVC strip '+fmt(Math.round(air2*2)/2,1)+' × 10 mm','Four sides of '+O+' mm round the edge, '+fmt(perim/1000,1)+' m plus 10 %.','Keeps the back mirror '+fmt(air2,2)+' mm in front of the LEDs, as the simulator draws it. Black, so it does not show in the tunnel.',{est:1,find:'black PVC strip 3 x 10 mm'}));
   if(air){const igu=G.mm<=24;
     a.push(it(m(perim*1.1),'m','Spacer frame 2, between the mirrors: '+(igu?'insulating-glass spacer bar, aluminium, '+G.mm+' mm, black':'aluminium rectangular tube '+G.mm+' × 10 mm, wall 1.5 mm, black anodised'),'Four sides of '+O+' mm, mitred or with corner keys.','Sets the '+G.mm+' mm air gap that makes the tunnel ('+(G.mm*2)+' mm between copies). Black so its edge disappears in the tunnel.',{est:!igu,find:igu?'insulating glass spacer bar '+G.mm+' mm black':'aluminium rectangular tube '+G.mm+' x 10 black'}));
     a.push(it(4,'pcs','Corner keys for the spacer frame',igu?'Matching the '+G.mm+' mm spacer bar.':'Or mitre the tube and glue the corners.','',{find:igu?'insulating glass spacer corner key '+G.mm+' mm':'aluminium tube corner connector'}));
     a.push(it(1,'bag','Desiccant, molecular sieve 3A, 250 g','Fill the hollow spacer before closing it.','Keeps the sealed gap dry so the inside never fogs: dust or damp inside the gap cannot be cleaned later.',{find:'molecular sieve 3A desiccant insulating glass'}));
     a.push(it(m(2*perim*1.1),'m','Butyl tape, primary seal, 3 mm','Two strips, one on each face of spacer frame 2.','Glues the spacer to both mirrors and keeps air and dust out.',{find:'butyl tape insulating glass'}));
     a.push(it(1,'cartridge','Neutral-cure silicone or polysulphide, secondary seal','Round the outside of spacer frame 2.','Makes the gap dust-tight and holds the pair together.',{find:'neutral cure silicone glazing'}));}
   const bez=Math.ceil(stackMm+air2+1);
   a.push(it(m(4*(O+30)*1.05),'m','Aluminium U-channel for the front frame, inner width '+bez+' mm or more','Four sides of '+(O+30)+' mm, mitred.','Holds the mirror stack ('+fmt(stackMm,1)+' mm of '+(air?'glass and gap':'acrylic')+' plus spacer frame 1) by its edge. Never clamp glass rigidly.',{est:1,find:'aluminium U channel '+bez+' mm'}));
   a.push(it(m(perim*1.1),'m','EPDM glazing gasket (U-profile) for '+fmt(stackMm,0)+' mm','Lines the U-channel all round.','Lets the glass move with heat and road shocks.',{est:1,find:'EPDM glazing gasket U profile'}));
   a.push(it(8,'pcs','Glazing setting blocks, hard plastic','Two per side, under the edge of the stack.','',{find:'glazing setting blocks'}));
   const slot=s.slotCm?s.slotCm*10:O+10;
   a.push(it(m(4*slot*1.05),'m','Aluminium angle 30 × 30 × 2 mm, to fix the frame in the trailer slot','Four sides of the '+(slot/10)+' cm slot.','',{est:1,find:'aluminium angle 30 x 30 x 2'}));
   a.push(it(1,'set','Stainless bolts, nuts and washers M4 and M5, assortment','Frame, back plate and angles.','',{find:'stainless steel M4 M5 bolt assortment'}));
   if(T!=='cab'&&dsW>200)a.push(it(2,'pcs','80 mm fan, 5 V (e.g. Noctua NF-A8 5V PWM) with grille and dust filter','Behind the LED plate, one blowing in and one out.','At full white the LEDs turn up to '+fmt(dsW)+' W into heat in the box. Draw air past the back of the LED plate, never through the mirror gap.',{est:1,find:'Noctua NF-A8 5V PWM'}));}

  /* ---------- LEDs ---------- */
  const ledSec=sec('LEDs',L.n+': '+N+' × '+N+' = '+fmt(nLED)+' LEDs, '+L.pitch+' mm apart. '+(L.src||''));
  let mats=0,feeders=0,feedA=0,modules=0;
  if(T==='strip'){const per=bom.perM*bom.reelM,rows=Math.floor(per/N),reels=Math.ceil(N/rows)+1,rowMm=Math.round(N/bom.perM*1000);
    ledSec.push(it(reels,'reels',bom.chip+' LED strip, '+bom.perM+' LEDs/m, 5 V, '+bom.reelM+' m reel','Cut into '+N+' rows of '+N+' LEDs ('+rowMm+' mm each), '+rows+' rows per reel; '+fmt(nLED/bom.perM,1)+' m in all, plus one spare reel for repairs.',
      (bom.mine?'The simulator calls this your current matrix: skip it if you have that. ':'')+(bom.check||''),{est:!!bom.check,find:bom.chip+' LED strip '+bom.perM+' LEDs/m 5V'}));
    ledSec.push(it(10,'m','Silicone wire 0.25 mm² (24 AWG), for the data links between rows','Rows are chained in a zigzag: data out of one row into the next.','',{find:'silicone wire 24 AWG'}));}
  else if(T==='mat'){for(const[c,n,name,where]of bom.mats){mats+=c;ledSec.push(it(c+1,'pcs',name,c+' ('+where+'), plus one spare.','Daisy-chained: data out of one matrix into the next.',{find:name.split(',')[0]}));}}
  else if(T==='mod'){modules=bom.count;ledSec.push(it(bom.count+1,'pcs',bom.n,bom.count+' modules, '+bom.grid+', plus one spare to swap a bad one.','A HUB75 ribbon and a power lead usually come with each module; check before ordering.',{find:bom.n.split(',')[0]}));
    ledSec.push(it(bom.count*4,'pcs','Module magnets (screw-in), if not included','Four per module.','',{find:'LED module magnet screw'}));}
  else ledSec.push(it(1,'pcs',bom.n,'Comes with its own power supplies, receiving card and frame.',L.src||'',{find:'Dahua PHGOA10-FC'}));

  /* ---------- power ---------- */
  const pw=sec('Power',T==='cab'?'The cabinet runs on 230 V: its 5 V supplies are inside.':'5 V supplies sized from Stage › Power, then the cables from supply to the LEDs, sized for current and voltage drop.');
  const facts={dsW,nowW};
  if(T==='cab'){const acA=L.Pmax/230;
    pw.push(it(1,'pcs','powerCON (blue) mains cable for the cabinet, 1.5 mm²','Often included; check.','The cabinet draws up to '+fmt(L.Pmax)+' W, '+fmt(acA,1)+' A at 230 V.',{find:'powerCON cable 1.5mm2'}));}
  else{
    const capA=set.supplyA||40,lim=set.pwrLimit||.85,nowA=nowW/5,needA=Math.min(capA,Math.max(5,nowA*1.15)),P=psuFor(needA),totA=P.k*P.p.A;
    Object.assign(facts,{capA,lim,nowA,needA,totA,psu:P});
    let w='Stage › Power is set to '+capA+' A, with the limit at '+Math.round(lim*100)+' %. Full white at the brightness you set draws '+fmt(nowA)+' A ('+fmt(nowW)+' W), by the datasheet up to '+fmt(dsW/5)+' A.';
    if(capA<nowA){w+=' So the Director dims full white to '+fmt(capA*lim)+' A, '+Math.round(capA*lim/nowA*100)+' % of what the LEDs could draw. To run it without dimming you would need '+psuFor(nowA*1.15).k+' × '+psuFor(nowA*1.15).p.n+'.';
      warn.push('The supply set in Stage › Power ('+capA+' A) is below what full white needs ('+fmt(nowA)+' A): the list follows your setting, so the picture is dimmed on bright frames. Raise Power supply in Stage › Power to buy for full brightness.');}
    else w+=' The list buys for full white at your brightness plus 15 %, which is less than the '+capA+' A you set.';
    pw.push(it(P.k,'pcs',P.p.n,'5 V, '+P.p.A+' A, '+P.p.W+' W each: '+totA+' A in all.',w+(P.k>1?' Never join the outputs of two supplies: each feeds its own group of '+(T==='strip'?'rows':T==='mat'?'matrices':'modules')+', all minus (V−) wires joined.':''),{find:P.p.n}));
    /* mains */
    const acW=P.k*P.p.W/P.p.eff,acA=acW/230,acf=ACFUSES.find(f=>f>=acA*2);   /* twice the running current: room for the supplies' inrush (est) */
    pw.push(it(1,'pcs','Neutrik powerCON TRUE1 TOP chassis inlet (NAC3MPX)','Mains into the mirror box.','The supplies take up to '+fmt(acW)+' W, '+fmt(acA,1)+' A from 230 V.',{find:'Neutrik NAC3MPX'}));
    pw.push(it(1,'pcs','powerCON TRUE1 TOP to Schuko cable, 3 × 1.5 mm², 3 m','To the trailer\'s power strip.','',{est:1,find:'powerCON TRUE1 schuko cable 3 m'}));
    pw.push(acf?it(1,'pcs','Panel fuse holder 5 × 20 mm with '+acf+' A slow-blow fuses (pack)','In the live wire after the inlet.','Protects the mains wiring in the box.',{find:'panel mount fuse holder 5x20'}):
      it(1,'pcs','Miniature circuit breaker C16, 1-pole + DIN rail and small enclosure','In the live wire after the inlet.','C-curve, because several switched-mode supplies start with a large inrush current.',{find:'MCB C16 1 pole'}));
    pw.push(it(Math.ceil(P.k*0.6+0.5),'m each','Mains wire H05V-K 1.5 mm², brown, blue and green/yellow','Inlet to the supplies, about 0.6 m per supply.','Earth every supply and the metal frame.',{est:1,find:'H05V-K 1.5 mm2'}));
    pw.push(it(Math.max(3,P.k+2),'pcs','Wago 221-415 lever connectors','Splits live, neutral and earth to the supplies.','',{find:'Wago 221-415'}));
    /* supply to the LEDs */
    const fd=wireFor(P.p.A,0.5,0.1,TERM_MM2);
    pw.push(it(Math.ceil(P.k*fd.n*0.6),'m each','Flexible wire '+fd.s+' mm², red and black','From each supply: '+fd.n+' wire'+(fd.n>1?'s':'')+' per pole over its output screws, about 0.5 m.',P.p.A+' A over 0.5 m loses '+fmt(fd.V,2)+' V of the 5 V.',{est:1,find:'flexible wire '+fd.s+' mm2 red black'}));
    if(T==='strip'){const side=totA/2,b=barFor(side);
      pw.push(it(4,'pcs','Copper flat bar '+b[0]+' × '+b[1]+' mm, '+O+' mm long','Bus bars along the left and right edge: 5 V and GND on each side.','Every row is fed at both ends. Up to '+fmt(side)+' A per side.'+(P.k>1?' With '+P.k+' supplies, cut the 5 V bars into '+P.k+' groups of rows (GND stays one piece).':''),{est:1,find:'copper flat bar '+b[0]+' x '+b[1]+' mm'}));
      pw.push(it(12,'pcs','Bus bar insulators / standoffs M5','Three per bar.','',{find:'busbar insulator M5'}));
      const rowA=N*sumMA/1000,rw=wireFor(rowA/2,0.08,0.05);
      feeders=2*N;feedA=rowA/2;
      pw.push(it(Math.ceil(2*N*0.08),'m each','Silicone wire '+rw.s+' mm², red and black, row feeds','Each of the '+N+' rows gets 5 V and GND at both ends (8 cm each).','A row draws up to '+fmt(rowA,2)+' A at full white; feeding both ends keeps the far LEDs from turning yellow.',{find:'silicone wire '+rw.s+' mm2'}));
      pw.push(it(4,'pcs','Capacitor 1000 µF 10 V, low ESR','Across 5 V and GND at each bus bar end.','Catches the switching spikes when the whole panel jumps from black to white.',{est:1,find:'1000uF 10V low ESR capacitor'}));}
    else{const loads=T==='mat'?bom.mats.reduce((a,[c,n])=>a.concat(Array(c).fill(n*sumMA/1000)),[]):Array(modules).fill(dsW/modules/5);
      const Imax=Math.max(...loads),fw=wireFor(Imax,0.5,0.1),boxes=Math.max(P.k,Math.ceil(loads.length/12));
      feeders=loads.length;feedA=Imax;
      pw.push(it(boxes,'pcs','Blade fuse box, 12-way, with negative bus (e.g. Blue Sea 5026)','One per supply'+(boxes>P.k?', more for the number of feeds':'')+'; each '+(T==='mat'?'matrix':'module')+' gets its own fused feed.','Up to 100 A per box.',{find:'Blue Sea 5026 fuse block negative bus'}));
      const f=fuseFor(Imax);
      pw.push(it(loads.length+5,'pcs','Blade fuse (ATO) '+f+' A','One per '+(T==='mat'?'matrix':'module')+' plus 5 spare.','A '+(T==='mat'?'matrix':'module')+' draws up to '+fmt(Imax,1)+' A.',{find:'ATO blade fuse '+f+'A'}));
      pw.push(it(Math.ceil(loads.length*0.5),'m each','Flexible wire '+fw.s+' mm², red and black, feeds','One pair per '+(T==='mat'?'matrix':'module')+', about 0.5 m from the fuse box.',fmt(Imax,1)+' A over 0.5 m loses '+fmt(fw.V,2)+' V.',{est:1,find:'flexible wire '+fw.s+' mm2 red black'}));
      if(T==='mat'){pw.push(it(mats,'pcs','Capacitor 1000 µF 10 V, low ESR','One at the power input of each matrix.','',{est:1,find:'1000uF 10V low ESR capacitor'}));
        warn.push('A flexible 16 × 16 matrix can draw about '+fmt(Imax,1)+' A at full white; most have power pads at both ends, so feed both (split the pair) to keep the colour even.');}}
    pw.push(it(1,'set','Crimp terminals assortment: ring M5, fork, ferrules','For bus bars, supply screws and fuse boxes.','',{find:'crimp terminal assortment ferrules ring'}));}

  /* ---------- data and control ---------- */
  const dc=sec('Control and data','The laptop runs the simulator; lt-ddp-bridge.js sends every frame as DDP over Ethernet to the LED controller.');
  let ctrls=1;
  if(T==='cab'){dc.push(it(1,'pcs','Sending box for the cabinet\'s receiving card','Novastar or Colorlight, matching the card in the cabinet: check with the seller.','A cabinet takes video, not DDP: the laptop sends the LED picture as a second screen over HDMI.',{est:1,find:'Novastar sending box HDMI'}));
    dc.push(it(1,'pcs','HDMI cable, 3 m','Laptop to sending box.','',{find:'HDMI cable 3 m'}));
    dc.push(it(1,'pcs','Cat6 patch cable, 3 m','Sending box to cabinet.','',{find:'Cat6 patch cable 3 m'}));}
  else if(L.data&&L.data.hub75){const px=nLED,chain=Math.ceil(modules/3);
    dc.push(it(1,'pcs','Raspberry Pi 4 Model B, 2 GB','Runs Falcon Player (FPP, free): receives DDP from the bridge and drives the panels.','',{find:'Raspberry Pi 4 Model B 2GB'}));
    dc.push(it(1,'pcs','HUB75 HAT with 3 outputs (e.g. Electrodragon RGB Matrix Panel Drive Board)','3 chains of '+chain+' modules.',px>16384?'With '+fmt(px)+' pixels the Pi\'s refresh gets low; check it, or use a Colorlight 5A-75E card driven by FPP instead.':'',{est:1,find:'Electrodragon RGB matrix panel drive board Raspberry Pi'}));
    dc.push(it(1,'pcs','microSD card 32 GB','For FPP.','',{find:'microSD 32GB'}));
    dc.push(it(1,'pcs','USB-C power supply for the Pi, 5 V 3 A','Or feed it from the 5 V bus.','',{find:'Raspberry Pi 4 power supply'}));}
  else if(L.data){const spi=!!L.data.spi;let lines;
    if(spi)lines=Math.max(1,Math.ceil((nLED+2)*L.data.bits/L.data.spi/(1/60)));
    else lines=Math.ceil(nLED*L.data.bits/L.data.hz/(1/60-L.data.reset));
    ctrls=Math.max(spi?1:Math.ceil(lines/8),Math.ceil(nLED/2048));
    const outs=Math.max(lines,ctrls),each=x=>{const lo=Math.floor(x/outs),hi=Math.ceil(x/outs);return lo===hi?String(hi):lo+' to '+hi;},per=T==='strip'?each(N)+' rows':each(mats)+' matrices';
    dc.push(it(ctrls,'pcs',spi?'ESP32 LED controller with Ethernet, runs WLED (e.g. QuinLED Dig-Octa: two outputs as clock + data)':'QuinLED Dig-Octa: ESP32 + Ethernet, 8 outputs, runs WLED',
      (spi?'Clocked data at '+L.data.spi/1e6+' MHz: ':'')+outs+' data output'+(outs>1?'s':'')+' for 60 fps, about '+per+' each.',
      'Estimate: WLED on one ESP32 stays smooth up to about 2,000 LEDs, so '+fmt(nLED)+' LEDs need '+ctrls+'. Check before buying.'+(spi?'':' Or one Falcon '+(lines<=16?'F16V5':'F48V5')+' pixel controller (also takes DDP) for all '+lines+' outputs.'),{est:1,find:'QuinLED Dig-Octa'}));
    dc.push(it(Math.max(3,Math.ceil(lines*0.6)),'m','Cat5e cable, cut up: one twisted pair per data output (data + GND)','Controller to the first LED of each output, under 1 m.','',{find:'Cat5e cable per metre'}));
    if(ctrls>1)warn.push('This build needs '+ctrls+' LED controllers. lt-ddp-bridge.js sends to one address today: it needs a small change to split each frame over the controllers.');}
  if(T!=='cab'){dc.push(it(1,'pcs','USB-C to Gigabit Ethernet adapter','For the laptop.','The MacBook Air has no Ethernet port, and Wi-Fi drops frames at this data rate.',{find:'USB-C gigabit ethernet adapter'}));
    dc.push(it(1,'pcs','Cat6 patch cable, 5 m','Laptop to the controller'+(ctrls>1?' switch':'')+'.','',{find:'Cat6 patch cable 5 m'}));}
  if(ctrls>1){dc.push(it(1,'pcs','Gigabit switch, 8 ports','One port per controller.','',{find:'gigabit switch 8 port'}));
    dc.push(it(ctrls,'pcs','Cat6 patch cable, 0.5 m','Switch to each controller.','',{find:'Cat6 patch cable 0.5 m'}));}

  /* ---------- woofer LEDs ---------- */
  const P=s.port;
  if(P&&P.on){const a=sec('Woofer LEDs','The rings in the sub ports ('+P.mode.toLowerCase()+'): '+P.slots+' slots of '+Math.round(P.w*100)+' × '+Math.round(P.h*100)+' cm, '+P.rows+' rows of '+P.perRow+' WS2812B-2020 round all four walls, '+P.depthCm+' cm inside, lining '+P.lining.toLowerCase()+'.');
    const n=P.slots*P.rows*P.perRow,mtr=n/160,reels=Math.ceil(mtr/5-1e-9),ps=(0.0366*n)*(P.bright||1),pp=psuFor(ps*1.15),slotA=ps/P.slots,fw=wireFor(slotA,1.5,0.2);
    a.push(it(reels,'reels','WS2812B-2020 LED strip, 160 LEDs/m, 5 V, 5 m reel',P.slots+' × '+P.rows+' rows of '+fmt(P.perRow/160,2)+' m = '+fmt(mtr,1)+' m, '+fmt(n)+' LEDs.','Stick on raw wood with primer or extra VHB tape: the strip\'s own tape lets go of bare birch.',{find:'WS2812B-2020 LED strip 160 LEDs/m'}));
    a.push(it(1,'pcs','3M VHB tape 12 mm, 10 m (or 3M primer 94)','For the strips on the slot walls.','',{find:'3M VHB tape 12 mm'}));
    a.push(it(pp.k,'pcs',pp.p.n,'Separate supply for the rings: '+fmt(ps)+' A at full white'+(P.bright<1?' at the brightness you set':'')+'.','Placed between the subs; it feeds both slots.',{find:pp.p.n}));
    a.push(it(Math.ceil(P.slots*fw.n*1.7),'m each','Flexible wire '+fw.s+' mm², red and black','To each sub, about 1.5 m'+(fw.n>1?', '+fw.n+' wires per pole':'')+'.',fmt(slotA,1)+' A per slot over 1.5 m loses '+fmt(fw.V,2)+' V.',{est:1,find:'flexible wire '+fw.s+' mm2 red black'}));
    const wled=T==='strip'||T==='mat';
    a.push(wled?it(P.slots,'outputs','Free data outputs on the mirror\'s LED controller','One output per slot: '+fmt(n/P.slots)+' LEDs, fine for 60 fps. No extra part if the controller has them free, else one QuinLED Dig-Uno.','Run the data with its own GND as a twisted pair (Cat5e) and keep it under 2 m.',{est:1,opt:1,find:'QuinLED Dig-Uno'}):
      it(1,'pcs','QuinLED Dig-Uno: ESP32, 2 outputs, runs WLED','One output per slot: '+fmt(n/P.slots)+' LEDs, fine for 60 fps. The '+(T==='cab'?'cabinet':'Pi')+' cannot drive LED strip, so the rings get their own controller (DDP over Wi-Fi or Ethernet).','Run the data with its own GND as a twisted pair (Cat5e) and keep it under 2 m.',{est:1,find:'QuinLED Dig-Uno'}));
    a.push(it(P.slots,'pcs','Inline blade fuse holder with a '+fuseFor(slotA)+' A fuse','In the 5 V wire to each sub.','',{find:'inline ATO fuse holder'}));}

  /* ---------- tools and small parts ---------- */
  {const a=sec('Tools and small parts','Skip what you already have.');
   if(T==='strip'||T==='mat'||(P&&P.on))a.push(it(1,'set','Temperature-controlled soldering iron, lead-free solder 0.7 mm, flux pen','Row feeds, data links, matrix pads.','',{find:'temperature controlled soldering station'}));
   a.push(it(1,'pcs','Crimping pliers for ferrules and insulated terminals','','',{find:'crimping pliers ferrules insulated terminals'}));
   a.push(it(1,'pcs','Automatic wire stripper','','',{find:'automatic wire stripper'}));
   a.push(it(1,'set','Heat-shrink tubing assortment','','',{find:'heat shrink tubing assortment'}));
   a.push(it(1,'pcs','Multimeter','Check that the far LEDs still get 4.7 V or more at full white.','',{find:'multimeter'}));
   a.push(it(1,'set','Cable ties and adhesive cable tie mounts','','',{find:'cable ties adhesive mounts'}));
   a.push(it(1,'set','Isopropyl alcohol 99 % and lint-free cloths','Clean glass and LEDs before closing the stack.','',{find:'isopropyl alcohol 99'}));
   a.push(it(2,'pcs','Suction lifters for glass','Glass of this size weighs '+fmt(kgGlass,1)+' kg in all.','',{find:'glass suction lifter'}));
   a.push(it(1,'pair','Cut-resistant gloves','','',{find:'cut resistant gloves level 5'}));}

  const name=s.name||(L.size>=1000?'1 m':L.size/10+' cm')+' · '+L.n+' · '+F.n+' / '+B.n+' · '+(air?G.mm+' mm air':G.mm+' mm acrylic');
  const sum=[['Mirror',O+' × '+O+' mm'+(s.slotCm?' in a '+s.slotCm+' cm slot':'')+(s.trailerCm?', trailer '+s.trailerCm+' cm long':'')],
    ['LEDs',L.n+', '+N+' × '+N+' = '+fmt(nLED)+', '+L.pitch+' mm'],['Front',F.full],['Back',B.full],
    ['Between',air?G.mm+' mm air, '+(F.glass&&B.glass?'coated glass':'films on '+g0+' mm glass'):G.mm+' mm cast acrylic, films laminated on it'],
    ['Stack','spacer '+fmt(s.ledAirMm||3.45,2)+' mm + '+fmt(stackMm,1)+' mm'+(s.depthMm?' · box depth about '+fmt(s.depthMm)+' mm':'')],
    [air?'Glass':'Acrylic',fmt(kgGlass,1)+' kg'],
    ['Full white',fmt(nowW)+' W at your brightness · '+fmt(dsW)+' W by the datasheet'+(T==='cab'?' (230 V)':' ('+fmt(dsW/5)+' A at 5 V)')]];
  if(facts.psu)sum.push(['Supplies',facts.psu.k+' × '+facts.psu.p.n+' = '+facts.totA+' A at 5 V']);
  if(P&&P.on)sum.push(['Woofer LEDs',P.slots+' × '+fmt(P.rows*P.perRow)+' LEDs, '+P.mode.toLowerCase()]);
  return{id:s.id||'',name,at:s.at||'',sum,warn,sections:secs,facts};
}

/* what an item costs: shop-prices.js (INF_PRICES) holds one AliExpress listing per search term, priced for one purchase
   that covers `per` of the list's unit; local items carry why they are not bought there */
const prices=()=>root.INF_PRICES||null;
const eur=v=>'€'+(+v).toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
function priceOf(i,P){
  const e=P&&P.items&&P.items[i.find||i.n];if(!e)return null;
  if(e.shop!=='ali')return{local:1,why:e.why||''};
  const packs=Math.max(1,Math.ceil(i.q/(e.per||1)-1e-9)),ship=e.ship||0;
  return{packs,each:e.price,ship,total:packs*e.price+ship,url:e.url,title:e.title,buy:e.buy||''};
}
function totals(list,P){
  const t={ali:0,n:0,local:0,none:0,opt:0};
  for(const s of list.sections)for(const i of s.items){const p=priceOf(i,P);
    if(!p)t.none++;else if(p.local)t.local++;else if(i.opt)t.opt++;else{t.ali+=p.total;t.n++;}}
  return t;
}
function text(list){
  const P=prices(),out=[list.name,list.at?'Saved '+new Date(list.at).toLocaleString('en-GB'):'',''];
  for(const[k,v]of list.sum)out.push(k+': '+v);
  if(list.warn.length){out.push('');for(const w of list.warn)out.push('! '+w);}
  for(const s of list.sections){out.push('','== '+s.title+' ==');for(const i of s.items){const p=priceOf(i,P);
    out.push('[ ] '+i.q+' '+i.u+'  '+i.n+(i.d?'  ('+i.d+')':'')+(i.est?'  [estimate]':'')+
      (p?p.local?'  [buy locally]':'  '+p.packs+' × '+eur(p.each)+(p.ship?' + '+eur(p.ship)+' shipping':'')+' = '+eur(p.total)+(i.opt?' (only if needed)':'')+'  '+p.url:''));}}
  if(P){const t=totals(list,P);out.push('','AliExpress: '+eur(t.ali)+' for '+t.n+' items (prices of '+P.checked+'). '+t.local+' item'+(t.local!==1?'s':'')+' to buy locally, not priced.');}
  return out.join('\n');
}
function csv(list){
  const P=prices(),q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const rows=[['Section','Qty','Unit','Item','Details','Why','Estimate','Shop','Buy','Packs','Each EUR','Shipping EUR','Total EUR','Link']];
  for(const s of list.sections)for(const i of s.items){const p=priceOf(i,P),n2=v=>v==null?'':(+v).toFixed(2);
    rows.push([s.title,i.q,i.u,i.n,i.d,i.w,i.est?'yes':'',p?p.local?'local':'AliExpress':'',p&&!p.local?p.buy:'',p&&!p.local?p.packs:'',
      p&&!p.local?n2(p.each):'',p&&!p.local?n2(p.ship):'',p&&!p.local?n2(p.total):'',p&&!p.local?p.url:'https://www.google.com/search?q='+encodeURIComponent(i.find||i.n)]);}
  return rows.map(r=>r.map(q).join(',')).join('\r\n');
}
/* the list as its own page: tick off what you have, print it, copy it as text or save it as CSV */
function page(list){
  const find=t=>'https://www.google.com/search?q='+encodeURIComponent(t),P=prices();
  let n=0;
  const cell=(i,p)=>!p?'<span class="u">no price</span>':p.local?'<span class="loc" title="'+esc(p.why)+'">local</span>':
    '<a class="pr" href="'+esc(p.url)+'" target="_blank" rel="noopener" title="'+esc(p.title)+'">'+eur(p.total)+'</a>'+
    '<div class="pk">'+(p.packs>1?p.packs+' × '+eur(p.each):'')+(p.ship?(p.packs>1?' + ':'')+eur(p.ship)+' ship':'')+(i.opt?'<br>if needed':'')+'</div>';
  const secs=list.sections.map(s=>'<section><h2>'+esc(s.title)+'</h2>'+(s.note?'<p class="note">'+esc(s.note)+'</p>':'')+
    '<table><thead><tr><th class="ck"></th><th class="q">Qty</th><th>Item</th><th class="p">Price</th><th class="f"></th></tr></thead><tbody>'+
    s.items.map(i=>{const p=priceOf(i,P),cost=p&&!p.local&&!i.opt?p.total:0;
      return '<tr data-cost="'+cost.toFixed(2)+'"><td class="ck"><input type="checkbox" data-i="'+(n++)+'" aria-label="Have it: '+esc(i.n)+'"></td><td class="q">'+esc(i.q)+' <span class="u">'+esc(i.u)+'</span></td><td><div class="n">'+esc(i.n)+(i.est?' <span class="est" title="Rule of thumb, not a datasheet value">estimate</span>':'')+'</div>'+
      (i.d?'<div class="d">'+esc(i.d)+'</div>':'')+(i.w?'<div class="w">'+esc(i.w)+'</div>':'')+
      (p&&!p.local&&p.buy?'<div class="b">On AliExpress: '+esc(p.buy)+'</div>':'')+(p&&p.local&&p.why?'<div class="b">'+esc(p.why)+'</div>':'')+
      '</td><td class="p">'+cell(i,p)+'</td><td class="f"><a href="'+esc(find(i.find||i.n))+'" target="_blank" rel="noopener">find</a></td></tr>';}).join('')+
    '</tbody></table></section>').join('');
  const total=list.sections.reduce((a,s)=>a+s.items.length,0),tt=P?totals(list,P):null;
  const tbox=tt?'<div class="tot"><div><span class="big" id="left">'+eur(tt.ali)+'</span> still to buy on AliExpress</div><div class="u">'+eur(tt.ali)+' for all '+tt.n+' AliExpress items, shipping included where the listing charges it'+
    (tt.opt?' · '+tt.opt+' only-if-needed item'+(tt.opt>1?'s':'')+' left out':'')+' · '+tt.local+' item'+(tt.local!==1?'s':'')+' to buy locally, not priced'+(tt.none?' · '+tt.none+' without a price yet':'')+
    ' · prices checked '+esc(P.checked)+', shipped to '+esc(P.shipTo||'NL')+'</div></div>':'';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shopping list · '+esc(list.name)+'</title><style>'+
  ':root{--bg:#f6f6f3;--card:#fff;--ink:#1d1d1b;--mute:#6a6a64;--line:#e2e2dc;--acc:#2f6fdb;--warn:#a2470d;--wbg:#fbefe4;--est:#7a5b00;--ebg:#f6ecc8}'+
  '@media (prefers-color-scheme:dark){:root{--bg:#141413;--card:#1d1d1b;--ink:#ecebe6;--mute:#9b9a93;--line:#33332f;--acc:#7aa7f5;--warn:#f0a36b;--wbg:#3a2516;--est:#e6c763;--ebg:#3a3112}}'+
  '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:980px;margin:0 auto;padding:24px 16px 64px}'+
  'h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:0 0 4px}.sub{color:var(--mute);margin:0 0 16px}.bar{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}'+
  'button{font:inherit;padding:7px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}button:hover{border-color:var(--acc)}'+
  'dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:0;padding:14px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px}dt{color:var(--mute)}dd{margin:0}'+
  '.warn{background:var(--wbg);color:var(--warn);border-radius:10px;padding:10px 14px;margin:12px 0 0}section{margin:22px 0 0;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}'+
  '.note{color:var(--mute);margin:0 0 8px}table{width:100%;border-collapse:collapse}th{text-align:left;font-weight:600;color:var(--mute);font-size:12px;border-bottom:1px solid var(--line);padding:4px 6px}'+
  'td{vertical-align:top;border-bottom:1px solid var(--line);padding:8px 6px}tr:last-child td{border-bottom:0}.ck{width:28px}.q{width:96px;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600}.u{font-weight:400;color:var(--mute)}'+
  '.n{font-weight:600}.d{margin-top:2px}.w{color:var(--mute);margin-top:2px;font-size:13px}.f{width:44px;text-align:right}a{color:var(--acc)}.est{font-size:11px;font-weight:600;color:var(--est);background:var(--ebg);border-radius:6px;padding:1px 6px;margin-left:4px}'+
  'tr.have td{opacity:.45}.prog{color:var(--mute)}.p{width:92px;text-align:right;white-space:nowrap}.pr{font-weight:600;font-variant-numeric:tabular-nums}.pk{font-size:11px;color:var(--mute)}'+
  '.loc{font-size:11px;font-weight:600;color:var(--mute);border:1px solid var(--line);border-radius:6px;padding:1px 6px}.b{font-size:12px;color:var(--acc);margin-top:3px}'+
  '.tot{margin:12px 0 0;padding:12px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px}.big{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}'+
  '@media (max-width:600px){.q{width:70px}.f{width:36px}.p{width:74px}dl{grid-template-columns:1fr}dt{margin-top:6px}}'+
  '@media print{body{background:#fff;color:#000}.bar,.f,.ck{display:none}section,dl{border:0;padding:0}}</style></head><body><main>'+
  '<h1>Shopping list</h1><p class="sub">'+esc(list.name)+(list.at?' · saved '+esc(new Date(list.at).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})):'')+' · <span class="prog" id="prog"></span></p>'+
  '<div class="bar"><button type="button" id="bPrint">Print</button><button type="button" id="bCopy">Copy as text</button><button type="button" id="bCsv">Save as CSV</button><button type="button" id="bClear">Untick all</button></div>'+
  '<dl>'+list.sum.map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl>'+
  tbox+list.warn.map(w=>'<p class="warn">'+esc(w)+'</p>').join('')+secs+
  '<p class="note" style="margin-top:22px">Only the mirror and, when they are on, the woofer LEDs: not the trailer, the fog machine, the bulbs or the DJ gear. Items marked estimate are sized by a rule of thumb; the rest follows the data sheets the simulator uses. '+
  (P?'Prices are one AliExpress listing per item, checked '+esc(P.checked)+': they change daily, so open the link before ordering. Items marked local are bought in the Netherlands (glass, cut sheets, long profiles, aerosols, branded films); their find link is a plain web search.':'The find links are a plain web search.')+'</p>'+
  '</main><script>(function(){var K="infinity-mirror-have-'+esc(list.id)+'",T='+total+',have={};try{have=JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){}'+
  'var bx=[].slice.call(document.querySelectorAll("input[data-i]")),L=document.getElementById("left");function show(){var c=0,e=0;bx.forEach(function(b){var r=b.closest("tr");r.classList.toggle("have",b.checked);if(b.checked)c++;else e+=+r.dataset.cost||0});document.getElementById("prog").textContent=c+" of "+T+" ticked";'+
  'if(L)L.textContent="\\u20ac"+e.toLocaleString("nl-NL",{minimumFractionDigits:2,maximumFractionDigits:2})}'+
  'bx.forEach(function(b){b.checked=!!have[b.dataset.i];b.addEventListener("change",function(){have[b.dataset.i]=b.checked?1:0;try{localStorage.setItem(K,JSON.stringify(have))}catch(e){}show()})});show();'+
  'var TXT='+JSON.stringify(text(list)).replace(/</g,'\\u003c')+',CSV='+JSON.stringify(csv(list)).replace(/</g,'\\u003c')+';'+
  'document.getElementById("bPrint").onclick=function(){print()};'+
  'document.getElementById("bCopy").onclick=function(e){var t=e.target;(navigator.clipboard?navigator.clipboard.writeText(TXT):Promise.reject()).then(function(){t.textContent="Copied"},function(){t.textContent="Copy failed"});setTimeout(function(){t.textContent="Copy as text"},1500)};'+
  'document.getElementById("bCsv").onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\\ufeff"+CSV],{type:"text/csv"}));a.download="infinity mirror shopping list.csv";document.body.appendChild(a);a.click();a.remove()};'+
  'document.getElementById("bClear").onclick=function(){bx.forEach(function(b){b.checked=false});have={};try{localStorage.removeItem(K)}catch(e){}show()};})();</script></body></html>';
}
const API={build,page,text,csv,priceOf,totals,BOM,wireFor,psuFor};
root.INF_SHOP=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
