/* music.js: ONE ear and ONE clock for every visual (STRUCTURE PLAN.md, step 1).
   The ear is the Director's (bands against their own peak, kick / snare / hat onsets from flux, release times measured from the song, loudness
   per EBU R128, section detector, drop watch), lifted out of show-director.js, plus what the Text show's ear had: hit strength 0-1, hit-latched
   pulses, lulls, sub short-vs-long. The clock is the page's tempo tracker (TEMPO) when it is sure, else a clock of its own that the kicks pull
   into phase. It runs every frame, whatever pattern is showing.

   Two layers:
   1. the pure core, MUSIC.step(F, t, dt): F is one frame of already measured sound (a dB spectrum and a few levels), nothing else is touched,
      so it runs in node with made-up spectra (tests/music.test.js);
   2. the browser binding, MUSIC.bind(host) + MUSIC.frame(t, dt): owns the ONE AnalyserNode tap on the page's audio graph (and its stereo,
      sub and K-weighted side taps), or builds a spectrum from the page's demo bands, and calls step() every frame.

   Reading it:  MUSIC.ear is the Director's old EAR object (same field names: band, env, spr, on, onT, rel, pe, cF, build, brk, drop, I ...).
   New:  MUSIC.kick / snare / hat / mel  {on, str 0-1, pulse, rate, t, n};  MUSIC.lull;  MUSIC.subS / subL;  MUSIC.eS / eL;  MUSIC.buildLive;
   MUSIC.brkT;  the clock: bpm, beat (continuous count), beatN, ph (0-1 in the beat), bib (beat in bar 0-3), bar, phrase0, tick / half / barTick;
   events: MUSIC.on('drop' | 'build' | 'breakdown' | 'section' | 'song', fn) and MUSIC.last[type] = {t, beat}.
   Tunables: MUSIC.cfg (onK x sens = how easily a hit counts, dropSens, ...). The Sound tab sliders write sens and dropSens. */
(function(root){
'use strict';
const clamp=v=>v<0?0:v>1?1:v;
/* the tonnetz (Harte, Sandler & Gasser 2006, as in librosa): pitch classes onto circles of fifths, minor thirds and major thirds */
const TONNETZ=(()=>{const s=[7/6,7/6,3/2,3/2,2/3,2/3],r=[1,1,1,1,.5,.5],o=new Float32Array(72);
  for(let k=0;k<6;k++)for(let c=0;c<12;c++)o[k*12+c]=r[k]*(k%2?Math.cos(Math.PI*s[k]*c):Math.sin(Math.PI*s[k]*c));return o;})();
const GRP=[0,0,1,1,2];   /* band -> onset group: kick, snare, hat */
const NAMES=['kick','snare','hat','mel'];

function defaultCfg(){return{
  beatsPerBar:4,phraseBars:8,
  /* ears: five bands, each read against its own recent peak: 0..1 over agcRange dB; the peak sinks agcFall dB/s, never agcBelow under the whole */
  fft:2048,bands:[[20,90],[90,200],[200,2500],[2500,5000],[5000,20000]],bandNames:['sub','low','mid','pres','high'],
  agcRange:24,agcFall:1.5,agcBelow:30,
  /* onsets (kick, snare, hat): a rise over its mean + onK x sens x its spread, at least onMin dB, onGap s apart. sens = Sound > Hit sensitivity / 2.2 */
  onK:2.5,sens:1,onMin:[6,5,5],onGap:[.15,.08,.05],onTau:1.5,kickBelow:18,snareFlat:.25,songFall:.25,
  relDb:6,tailDb:12,relMin:.08,relMax:.6,tailMax:1.5,
  flatHz:[200,8000],silentDb:-80,silentS:5,lockMin:.35,phaseTau:.5,
  /* hit strength = flux / its own peak of the last strTau s (floor: the group's onMin); pulses: hit-latched, per group tau (kick, snare, hat, mel) */
  strTau:4,pulseTau:[.16,.12,.06,.1],rateTau:3,
  /* lull (energy of the last .25 s against the last 8 s) and the sub, short against long */
  lullAt:.4,lullIn:.5,lullOut:.08,eFast:.25,eSlow:8,subFast:.35,subSlow:10,subSlowBrk:40,
  /* the clock when the tempo tracker is not sure: bpm = the Director's setting, or the tracker's if it has a weak idea (tempoMin); kicks pull the phase */
  bpm:120,tempoMin:.1,kickPull:.45,kickPullWin:.35,pullTau:.25,
  /* the song */
  repOn:.7,repOff:.45,brkKicks:1,hadKicks:10,buildSlope:.03,
  /* a new section: 16 bands and 12 pitch classes, the last ~0.7 s against the last ~6 s, each band against how much it usually moves (20 s) */
  secBands:16,secHz:[40,12000],secChroma:[180,3000],secFloor:50,secFast:.7,secSlow:6,secSig:20,secK:3,secZ:3,secCz:4,secThr:1.2,secHold:.4,secGap:10,secWarm:6,
  /* intensity 0..1 (loudness first, then hits, layers and brightness). Loudness per EBU R128 against the song's loud level */
  ldAnchor:-10,ldAnchorFall:.05,ldFall:.05,ldRange:12,ldCurve:1.5,ldHist:300,
  iW:{loud:.5,dens:.2,lay:.18,bright:.12},iAtk:.4,iRel:2.5,iEnv:[.3,.7],
  /* more switches: the sound falling away and instruments coming in */
  fallDb:10,fallHold:.3,fallRe:8,layDb:18,layHys:3,layDn:4,layRe:4,
  /* springs on the envelopes (one visible bounce) */
  sprHz:3.5,sprZeta:.4,
  /* the drop watch, frame by frame on the sub's own RMS. dropSens (Sound > Drop sensitivity, 0..1, .5 normal) tilts the two onset tests */
  dropSens:.5,
  dwLp:120,dwFft:1024,dwFall:12,dwFast:.3,dwSlow:5,dwBrkDb:8,dwBrkS:2,dwMinGroove:4,dwBackDb:4,dwBackS:4,dwMaxS:64,dwMinBrk:2,dwHitDb:5,dwPkWin:1,dwOver:3,dwPkK:.15,
  dwOnset:6,dwIntroS:6,dwIntroDb:15,dwShare:12,dwArmBuild:.4,dwArmCent:.06,dwArmRate:2,dwGapDb:12,dwPreMax:2.5,dwPhrase:8,dwPhBuild:.6,
  /* the sound the Arrivals scene and the Director's melody ear use */
  arDb:4.5,arFlux:1,arGap:.09,arMinS:30
};}

function create(){
const cfg=defaultCfg();
const M={cfg,version:1};
/* General > Listen: the ear's tunables that are worth a slider (Hit sensitivity and Drop sensitivity are the page's S.hitSens / S.dropSens: host.cfg writes them into cfg.sens / cfg.dropSens each frame).
   Each: id, label, tip, def, min, max, step, unit, get(), set(v). dump() = only what differs from the default, load(o) = put them back. */
{const arr=(k,i)=>({get:()=>cfg[k][i],set:v=>{cfg[k][i]=v;}}),one=k=>({get:()=>cfg[k],set:v=>{cfg[k]=v;}});
 const P=(id,label,tip,acc,min,max,step,unit)=>Object.assign({id,label,tip,def:acc.get(),min,max,step,unit:unit||''},acc);
 const PA=[
  P('pulseKick','Kick pulse length','How long the picture\'s kick pulse takes to die away after a kick (the "hit-latched" pulse every Feel effect and every visual reads). Short is tight, long is swampy.',arr('pulseTau',0),.05,.5,.01,'s'),
  P('pulseSnare','Snare pulse length','How long the snare pulse takes to die away.',arr('pulseTau',1),.03,.4,.01,'s'),
  P('pulseHat','Hat pulse length','How long the hat pulse takes to die away. Short keeps hats crisp.',arr('pulseTau',2),.02,.2,.01,'s'),
  P('pulseMel','Melody pulse length','How long the melody pulse takes to die away.',arr('pulseTau',3),.03,.4,.01,'s'),
  P('gapKick','Shortest gap between kicks','Two kicks are never counted closer together than this. Raise it if a roll of kicks looks like a mush.',arr('onGap',0),.05,.4,.01,'s'),
  P('gapSnare','Shortest gap between snares','Two snares are never counted closer together than this.',arr('onGap',1),.04,.3,.01,'s'),
  P('gapHat','Shortest gap between hats','Two hats are never counted closer together than this.',arr('onGap',2),.03,.2,.01,'s'),
  P('lullAt','Quiet passage below','The music counts as quiet (a lull) when its energy of the last moments falls under this share of its long-term level. Higher: more passages count as quiet.',one('lullAt'),.2,.7,.01),
  P('lullIn','Quiet: fade in over','How long it takes for a quiet passage to be noticed.',one('lullIn'),.1,2,.05,'s'),
  P('lullOut','Quiet: fade out over','How fast the quiet state ends when the music comes back. Short brings the light back at once.',one('lullOut'),.02,.5,.01,'s')];
 M.params=PA;M.paramById={};for(const p of PA)M.paramById[p.id]=p;
 M.setParam=(id,v)=>{const p=M.paramById[id];if(!p)return;v=+v;if(!isFinite(v))return;p.set(v<p.min?p.min:v>p.max?p.max:v);};
 M.resetParam=id=>{const p=M.paramById[id];if(p)p.set(p.def);};
 M.dumpParams=()=>{const o={};for(const p of PA)if(Math.abs(p.get()-p.def)>1e-9)o[p.id]=p.get();return o;};
 M.loadParams=o=>{if(!o||typeof o!=='object')return;for(const p of PA)if(p.id in o)M.setParam(p.id,o[p.id]);};}
const listeners={};
M.last={};          /* type -> {t, beat} of the latest event */
M.recent=[];        /* the last 32 events */
M.logs=[];          /* what the ear says about itself (the Director forwards it to its own log through M.logFn) */
M.logFn=null;
M.synth=null;       /* generative mode hook: (tick, half) -> the Director makes up soft hits when there is no sound */
M.arc=.2;           /* generative mode: a slow arc over 64 bars */

/* ---------- the ear's state (the Director's EAR object) ---------- */
const A=M.ear={an:null,st:null,P:null,lp:null,bins:null,hz:1,band:new Float32Array(5),lev:new Float32Array(5),bl:new Float32Array(5),pk:new Float32Array(5).fill(-60),env:new Float32Array(5),
  songPk:-60,subPk:-60,kRise:0,kdens:0,lv1:new Float32Array(5).fill(-140),lv2:new Float32Array(5).fill(-140),brkAgo:99,fx:[0,0,0],fm:[0,0,0],fd:[1,1,1],held:[false,false,false],on:[false,false,false],onT:[-9,-9,-9],cnt:[0,0,0],rel:[.2,.2,.12],rt:[null,null,null],tail:.3,
  flat:0,cent:0,bal:0,corr:1,rev:0,rms:0,tot:-99,totPk:-60,lo:0,hi:0,live:false,silent:99,gen:true,energy:.2,
  cur:null,bars:[],slope:0,dens:0,build:0,brk:false,drop:false,rep:0,repRun:0,lastDrop:-99,subLong:.5,kicks:0,
  cSig:.03,secOn:0,secAbove:0,secLast:-99,sec:null,secS:0,subDb:undefined,fullDb:-140,dropPre:false,
  dw:{st:'intro',snd:0,t0:0,low:0,back:0,orate:0,armed:false,pre:null,ref:-200,groove:-200,cent0:0},
  I:.3,onR:0,iParts:[0,0,0,0],cands:[],spr:new Float32Array(5),sprV:new Float32Array(5),ld:{q:[],sx:[],h:[],M:-120,S:-120,ref:-10,on:0,ht:0,fallT:0,fallAt:-99},lay:{on:new Uint8Array(16),N:0,nh:[],at:-99},pe:{}};

/* ---------- the hit groups: kick, snare, hat, melody ---------- */
const G=NAMES.map((name,i)=>({name,i,on:false,str:0,pulse:0,rate:0,t:-9,n:0,fpk:0,tau:cfg.pulseTau[i]}));
M.groups=G;M.kick=G[0];M.snare=G[1];M.hat=G[2];M.mel=G[3];
M.lull=0;M.subS=.3;M.subL=.3;M.eS=.3;M.eL=.3;M.buildLive=0;M.brkT=0;M.sweep=0;
let centP=0;

/* ---------- the clock ---------- */
M.bpm=cfg.bpm;M.locked=false;M.beat=0;M.beatN=0;M.ph=0;M.bib=0;M.bar=0;M.phrase0=0;M.tick=false;M.half=false;M.barTick=false;M.dbeat=0;M.t=0;M.dt=0;
M.dropShift=0;let pend=0;

function log(msg){M.logs.push(msg);if(M.logs.length>100)M.logs.shift();if(M.logFn)try{M.logFn(msg);}catch(e){}}
M.log=log;
M.on=(type,fn)=>{(listeners[type]||(listeners[type]=[])).push(fn);return()=>M.off(type,fn);};
M.off=(type,fn)=>{const l=listeners[type];if(!l)return;const i=l.indexOf(fn);if(i>=0)l.splice(i,1);};
function emit(type,data){const e=Object.assign({type,t:M.t,beat:M.beat},data||{});M.last[type]={t:e.t,beat:e.beat};M.recent.push(e);if(M.recent.length>32)M.recent.shift();
  const l=listeners[type];if(l)for(const fn of l.slice())try{fn(e);}catch(x){console.warn('music: listener failed',type,x);}}
M.emit=emit;
/* the drop is the new downbeat; the phrase count starts there */
M.snapDownbeat=function(){const b=cfg.beatsPerBar;if(M.beat%b>.5){const nb=Math.ceil(M.beat/b)*b;M.dropShift=nb-M.beat;M.beat=nb;}else M.dropShift=0;
  M.phrase0=Math.floor(M.beat/b)*b;M.beatN=Math.floor(M.beat);M.ph=M.beat-M.beatN;M.bib=M.beatN%b;};
/* a drop that somebody else knows about (the Drop! button, the song map): same bookkeeping as the ear's own */
M.forceDrop=function(why){A.drop=true;A.lastDrop=M.beat;M.snapDownbeat();M.buildLive=0;emit('drop',{why:why||'forced'});};

/* ---------- layout: which FFT bins belong to which band (rebuilt when the sample rate or FFT size changes) ---------- */
let lay={hz:0,n:0};
function layout(hz,n){const C=cfg;if(lay.hz===hz&&lay.n===n)return;lay={hz,n};A.hz=hz;
  A.lp=new Float32Array(n).fill(-140);
  A.bins=C.bands.map(([a,b])=>[Math.max(1,Math.round(a/hz)),Math.min(n-1,Math.max(1,Math.round(b/hz)))]);
  A.nb=A.bins.map(([a,b])=>b-a+1);
  const sh=C.secHz,eg=[];for(let k=0;k<=C.secBands;k++)eg.push(sh[0]*Math.pow(sh[1]/sh[0],k/C.secBands));   /* the section ears: log bands and pitch classes */
  A.sb=[];for(let k=0;k<C.secBands;k++){const i0=Math.max(1,Math.round(eg[k]/hz));A.sb.push([i0,Math.min(n-1,Math.max(i0,Math.round(eg[k+1]/hz)-1))]);}
  A.cb=[Math.round(C.secChroma[0]/hz),Math.min(n-1,Math.round(C.secChroma[1]/hz))];A.pc=new Int8Array(n);
  for(let i=A.cb[0];i<=A.cb[1];i++)A.pc[i]=((Math.round(12*Math.log2(i*hz/440))%12)+12)%12;
  for(const k of['sbuf','sF','sS','sSig','sz','zs'])A[k]=new Float32Array(C.secBands);A.sSig.fill(2);for(const k of['cbuf','cF','cS','cM'])A[k]=new Float32Array(12);
  A.pe={};}   /* the melody ear is rebuilt on the new layout */
M.layout=layout;

/* ---------- one frame ----------
   F = {live, P: dB spectrum (Float32Array), hz, n, sub: dB of the sub signal or undefined, full: dB of the whole sound (when there is no stereo),
        stereo: {el, er, lr} sums over one block, kms: K-weighted mean square of both channels, tempo: {lock, dpos, bib, pos, bpm}} */
M.step=function(F,t,dts){const C=cfg;F=F||{};M.t=t;M.dt=dts;
  if(root.DESK&&root.DESK.untapEars)root.DESK.untapEars(A);   /* DESK hook */
  A.drop=false;A.on[0]=A.on[1]=A.on[2]=false;A.cands.length=0;
  if(A.pe&&A.pe.pv){A.pe.on=A.pe.aon=A.pe.lon=false;}
  A.live=!!F.live&&!!F.P;
  let loud=false;
  if(A.live){layout(F.hz,F.n||F.P.length);const P=F.P;A.P=P;let mx=-200,ptot=0;
    const gl3=[-140,-140,-140],rise=[0,0,0,0,0];
    let nz=0;
    for(let b=0;b<5;b++){const[i0,i1]=A.bins[b];let s=0,lg=0;
      for(let i=i0;i<=i1;i++){const d=Math.max(P[i],-140);if(d>mx)mx=d;s+=Math.pow(10,d/10);lg+=d*.2302585;}
      if(b===3)nz=Math.exp(lg/(i1-i0+1))/(s/(i1-i0+1)+1e-20);   /* flatness of the presence band in this frame: noise (a snare) or tones */
      ptot+=s;const lv=10*Math.log10(s+1e-14);rise[b]=Math.max(0,lv-Math.min(A.lv1[b],A.lv2[b]));A.lv2[b]=A.lv1[b];A.lv1[b]=lv;   /* flux: how much the band rose over the last two frames, in dB */
      A.lev[b]=lv;A.bl[b]=clamp((lv-10*Math.log10(A.nb[b])+88)/66);   /* bl: the level per bin on the page's 66 dB scale (what the Text show used to read) */
      if(lv>gl3[GRP[b]])gl3[GRP[b]]=lv;}
    /* kick: the sub or low band jumps; snare: mid AND presence jump together (a noise burst, not a bass note); hat: the highs jump */
    const loK=A.lev[0]>A.songPk-C.kickBelow,sn=Math.min(rise[2],rise[3]);
    const fl=[loK&&A.band[0]>.3?rise[0]:0,A.band[3]>.3&&nz>C.snareFlat&&sn>rise[0]?sn:0,A.band[4]>.25?rise[4]:0];
    A.kRise=rise[0];
    let lg=0,ar=0,n=0,cs=0,cw=0;const f0=Math.round(C.flatHz[0]/A.hz),f1=Math.min(A.P.length-1,Math.round(C.flatHz[1]/A.hz));
    for(let i=1;i<A.P.length;i++){const d=Math.max(P[i],-140),p=Math.pow(10,d/10);A.lp[i]=d;cs+=p*i;cw+=p;if(i>=f0&&i<=f1){lg+=d*.2302585;ar+=p;n++;}}
    loud=mx>C.silentDb;const k3=1-Math.exp(-dts/.3);
    A.flat+=(clamp(Math.exp(lg/n)/(ar/n+1e-20))-A.flat)*k3;
    A.cent+=(clamp(Math.log2(Math.max(40,cs/(cw+1e-20)*A.hz)/40)/Math.log2(500))-A.cent)*k3;
    A.tot=10*Math.log10(ptot+1e-14);A.totPk=Math.max(A.tot,A.totPk-C.agcFall*dts);
    A.songPk=Math.max(A.tot,A.songPk-C.songFall*dts);A.subPk=Math.max(A.lev[0],A.subPk-C.songFall*dts);   /* slow peaks: the song's loud level and its loudest sub */A.rms=clamp((A.tot-A.totPk+C.agcRange)/C.agcRange);
    for(let b=0;b<5;b++){A.pk[b]=Math.max(A.lev[b],A.pk[b]-C.agcFall*dts,A.totPk-C.agcBelow);A.band[b]=clamp((A.lev[b]-A.pk[b]+C.agcRange)/C.agcRange);}
    const k=1-Math.exp(-dts/C.onTau),onK=C.onK*C.sens;
    for(let g=0;g<3;g++){const x=fl[g],thr=A.fm[g]+onK*A.fd[g];A.fx[g]=x;
      const q=G[g];q.fpk=Math.max(x,q.fpk*Math.exp(-dts/C.strTau),C.onMin[g]);
      if(loud&&x>thr&&x>C.onMin[g]&&t-A.onT[g]>C.onGap[g]&&!A.held[g]){A.on[g]=true;A.onT[g]=t;A.cnt[g]++;A.rt[g]={t0:t,pk:gl3[g],r6:false};if(A.cur)A.cur.on[g]++;
        q.str=Math.max(.05,Math.min(1,x/q.fpk));}
      A.held[g]=x>thr;A.fm[g]+=(x-A.fm[g])*k;A.fd[g]+=(Math.abs(x-A.fm[g])-A.fd[g])*k;
      const r=A.rt[g];if(r){if(gl3[g]>r.pk){r.pk=gl3[g];r.t0=t;}const el=t-r.t0;   /* release: time to fall 6 dB; tail: 12 dB */
        if(!r.r6&&gl3[g]<r.pk-C.relDb){r.r6=true;A.rel[g]+=(Math.max(C.relMin,Math.min(C.relMax,el))-A.rel[g])*.3;}
        if(gl3[g]<r.pk-C.tailDb||el>C.tailMax){A.tail+=(Math.min(el,C.tailMax)-A.tail)*.15;if(!r.r6)A.rel[g]+=(C.relMax-A.rel[g])*.3;A.rt[g]=null;}}}
    if(F.stereo){const{el,er,lr}=F.stereo,nn=F.stereo.n||1;A.fullDb=10*Math.log10((el+er)/(2*nn)+1e-14);
      if(el>1e-7&&er>1e-7){const k4=1-Math.exp(-dts/.4);A.bal+=((er-el)/(er+el)-A.bal)*k4;A.corr+=(Math.max(-1,Math.min(1,lr/Math.sqrt(el*er)))-A.corr)*k4;}}
    else if(F.full!=null)A.fullDb=F.full;
    /* reverb: the level between hits against the hits, and how long hits ring */
    A.lo=A.rms<A.lo?A.rms:A.lo+(A.rms-A.lo)*(1-Math.exp(-dts/1));A.hi=A.rms>A.hi?A.rms:A.hi*Math.exp(-dts/.6);
    A.rev+=(clamp(.5*A.lo/Math.max(.05,A.hi)+.5*(A.tail-.15)/.9)-A.rev)*(1-Math.exp(-dts/1));
    if(F.sub!==undefined)A.subDb=F.sub;
    secEars(loud);partEar(loud);
    if(F.kms!=null)loudness(t,dts,F.kms);
    else if(F.stereo||F.full!=null)loudness(t,dts,2*Math.pow(10,A.fullDb/10));}   /* no K-weighting: plain loudness */
  else{A.band.fill(0);A.bl.fill(0);A.rms=0;}
  const ig=C.iEnv[0]+C.iEnv[1]*A.I;   /* the auto-levelled bands shape the reaction, the intensity sets its size */
  for(let b=0;b<5;b++)A.env[b]=Math.max(A.band[b]*ig,A.env[b]*Math.exp(-dts/A.rel[GRP[b]]));
  /* springs on the envelopes: they overshoot once and settle (semi-implicit Euler, in steps of at most 1/60 s) */
  {const w=2*Math.PI*C.sprHz,n=Math.max(1,Math.ceil(dts*60)),h=Math.min(dts,.1)/n;
    for(let s=0;s<n;s++)for(let b=0;b<5;b++){A.sprV[b]+=(w*w*(A.env[b]-A.spr[b])-2*C.sprZeta*w*A.sprV[b])*h;A.spr[b]+=A.sprV[b]*h;}}
  A.silent=loud?0:A.silent+dts;const gen=!A.live||A.silent>C.silentS;
  if(gen!==A.gen){A.gen=gen;log(gen?'no sound for 5 s: generative mode on its own clock':'listening to the music');
    if(!gen){A.bars.length=0;A.cur=null;A.brk=false;A.brkAgo=99;A.pe={};emit('song');}}   /* a new song starts a new history */
  intensity(dts);A.energy+=((A.gen?M.arc:.15*A.rms+.5*Math.min(1,A.dens/2.5)+.35*Math.min(1,A.kdens))-A.energy)*(1-Math.exp(-dts/3));   /* energy is mostly how busy the hits are, not how loud */
  /* the clock */
  const pb=M.beat;clock(F.tempo,dts);
  M.tick=Math.floor(M.beat)!==Math.floor(pb);M.half=Math.floor(M.beat*2)!==Math.floor(pb*2);M.barTick=Math.floor(M.beat/C.beatsPerBar)!==Math.floor(pb/C.beatsPerBar);M.dbeat=M.beat-pb;
  if(A.gen&&M.synth)M.synth(M.tick,M.half);   /* generative mode: soft made-up hits on the clock */
  hits(dts);
  barFrame();dropWatch(t,dts);
  if(M.barTick){barEnd();M.arc=.12+.3*(.5-.5*Math.cos(2*Math.PI*Math.floor(M.beat/C.beatsPerBar)/64));}   /* generative mode: a slow arc over 64 bars */
  song(dts);
  M.beatN=Math.floor(M.beat);M.ph=M.beat-M.beatN;M.bib=M.beatN%C.beatsPerBar;M.bar=Math.floor(M.beat/C.beatsPerBar);
  M.sweep+=(Math.abs(A.cent-centP)/Math.max(dts,1e-3)-M.sweep)*(1-Math.exp(-dts/2));centP=A.cent;
  return M;};

/* ---------- hit groups: strength, hit-latched pulses, hits a second ---------- */
function hits(dts){const C=cfg,Q=A.pe;
  G[3].on=!!(Q&&Q.on);
  for(let g=0;g<4;g++){const q=G[g];
    if(g<3){q.on=A.on[g];if(q.on&&!(q.str>0))q.str=.5;}   /* a made-up hit (generative mode) has no measured strength */
    else if(q.on)q.str=Math.max(.05,Math.min(1,Q.ok.m.f2/Math.max(Q.fpk||0,1e-3)));   /* the melody: its flux at the peak against the peak of the last strTau s */
    q.pulse*=Math.exp(-dts/C.pulseTau[g]);   /* decay first, then latch: the hit shows in full on the very frame it is heard */
    if(q.on){q.pulse=Math.max(q.pulse,.4+.6*q.str);q.t=M.t;q.n++;}
    q.rate+=((q.on?1/Math.max(dts,1e-3):0)-q.rate)*(1-Math.exp(-dts/C.rateTau));
    if(!q.on)q.str=0;}}
/* ---------- the song: lull, sub short vs long, build, breakdown time ---------- */
function song(dts){const C=cfg,W=A.dw,k=x=>1-Math.exp(-dts/x);
  const sub=A.bl[0],e=(A.bl[0]+A.bl[1]+A.bl[2]+A.bl[4])/4;
  M.subS+=(sub-M.subS)*k(C.subFast);M.subL+=(sub-M.subL)*k(M.brkT>0?C.subSlowBrk:C.subSlow);
  M.eS+=(e-M.eS)*k(C.eFast);M.eL+=(e-M.eL)*k(C.eSlow);
  const lt=M.eS<C.lullAt*M.eL?1:0;M.lull+=(lt-M.lull)*k(lt?C.lullIn:C.lullOut);if(A.on[0])M.lull=0;
  M.brkT=!A.gen&&W.st==='breakdown'?M.t-W.t0+C.dwBrkS:0;
  const bt=M.brkT>1?Math.min(1,(M.brkT-1)/8)*(.4+.3*Math.min(1,G[2].rate/6)+.3*A.band[4]):W.armed&&W.st==='breakdown'?A.build:0;
  M.buildLive+=(bt-M.buildLive)*k(.5);}

/* ---------- the clock: the tempo tracker when it is sure, phase-locked so bars start on its downbeat; else its own clock ---------- */
function clock(T,dts){const C=cfg;let d;
  if(!A.gen&&T&&T.lock>=C.lockMin){d=T.dpos;const tg=T.bib+(T.pos-Math.floor(T.pos));let err=tg-(M.beat%C.beatsPerBar);err-=C.beatsPerBar*Math.round(err/C.beatsPerBar);
    d+=err*Math.min(1,dts/C.phaseTau);M.bpm=T.bpm;M.locked=true;pend=0;}
  else{M.locked=false;
    if(A.gen){M.bpm=C.bpm;d=dts*M.bpm/60;pend=0;}
    else{M.bpm=T&&T.lock>C.tempoMin?T.bpm:C.bpm;d=dts*M.bpm/60;
      if(A.on[0]){const e=Math.round(M.beat)-M.beat;if(Math.abs(e)<C.kickPullWin)pend+=e*C.kickPull;}   /* the kicks pull the free clock into phase */
      const s=pend*Math.min(1,dts/C.pullTau);pend-=s;d+=s;}}
  M.beat+=Math.max(0,d);}

/* ---------- loudness per EBU R128 on the K-weighted signal: momentary (0.4 s) and short-term (3 s), the song's loud level (95th percentile of the
   short-term, gated at -70 LUFS and 20 LU under the reference), and the sound falling away as a switch candidate ---------- */
function loudness(t,dts,ms){const C=cfg,L=A.ld,q=L.q,lu=x=>-.691+10*Math.log10(x+1e-12);q.push(t,ms);let i0=0;while(i0<q.length&&q[i0]<t-3)i0+=2;if(i0)q.splice(0,i0);
  let sM=0,nM=0,sS=0;for(let i=0;i<q.length;i+=2){sS+=q[i+1];if(q[i]>=t-.4){sM+=q[i+1];nM++;}}
  L.M=lu(sM/Math.max(1,nM));L.S=lu(sS/(q.length/2));L.on+=dts;
  if(t-L.ht>=.5){L.ht=t;if(L.S>-70&&L.S>L.ref-20){L.h.push(L.S);if(L.h.length>C.ldHist)L.h.shift();}
    let p=-200;if(L.h.length>=6){const s=L.h.slice().sort((a,b)=>a-b);p=s[Math.floor(.95*(s.length-1))];}
    L.ref=Math.max(p,C.ldAnchor-C.ldAnchorFall*L.on,L.ref-C.ldFall*.5);}   /* rises at once, falls slowly */
  const sx=L.sx;sx.push(t,L.S);i0=0;while(i0<sx.length&&sx[i0]<t-4)i0+=2;if(i0)sx.splice(0,i0);
  let mx=-200,s05=L.S;for(let i=0;i<sx.length;i+=2){if(sx[i+1]>mx)mx=sx[i+1];if(sx[i]<=t-.5)s05=sx[i+1];}
  L.fallT=L.M<=mx-C.fallDb&&L.S<s05&&L.M>-60&&mx>L.ref-6?L.fallT+dts:0;   /* only a fall from near the song's loud level */
  if(L.fallT>=C.fallHold&&t-L.fallAt>C.fallRe&&L.on>8){L.fallAt=t;
    A.cands.push({src:'falloff',kind:'fall',at:t,score:(mx-L.M)/C.fallDb,what:'the sound falls away ('+(L.M-mx).toFixed(0)+' LU)'});}}

/* ---------- intensity 0..1: loudness against the song's loud level first, then hits a second, bands playing, brightness; a soft song stays soft
   however busy it is. Rises in 0.4 s, sinks over 2.5 s (listeners follow in 1-3 s) ---------- */
function intensity(dts){const C=cfg,k=x=>1-Math.exp(-dts/x);
  if(A.gen||!A.ld.on){A.I+=(M.arc-A.I)*k(2);return;}
  A.onR+=(((A.on[0]?1:0)+(A.on[1]?1:0)+(A.on[2]?1:0))/dts-A.onR)*k(2);
  const L=A.ld,W=C.iW,loud=Math.pow(clamp((L.S-(L.ref-C.ldRange))/C.ldRange),C.ldCurve),dens=clamp(A.onR/8),lay=A.lay.N/C.secBands,
    bright=clamp((40*Math.pow(500,A.cent)-800)/3200),raw=(W.loud*loud+W.dens*dens+W.lay*lay+W.bright*bright)*(.4+.6*loud);
  A.iParts[0]=loud;A.iParts[1]=dens;A.iParts[2]=lay;A.iParts[3]=bright;
  A.I+=(raw-A.I)*k(raw>A.I?C.iAtk:C.iRel);}

/* ---------- a new section (an instrument in or out, a new melody): the spectrum's shape and the harmony of the last second against the last few,
   each band measured against how much it usually moves, so a bass line wandering is nothing and a new layer is a lot.
   A change that holds 0.4 s sets A.sec for one frame and the slow picture jumps to the new one, so it fires once ---------- */
function secEars(loud){const C=cfg,t=M.t,dts=M.dt,P=A.P,n=C.secBands,b=A.sbuf,ch=A.cbuf,F=A.sF,Sl=A.sS,Gs=A.sSig,CF=A.cF,CS=A.cS,z=A.sz,zs=A.zs;
  if(!loud){A.secOn=0;A.secS=0;A.secAbove=0;return;}
  let mx=-200;for(let k=0;k<n;k++){const[i0,i1]=A.sb[k];let s=0;for(let i=i0;i<=i1;i++)s+=Math.pow(10,Math.max(P[i],-140)/10);b[k]=10*Math.log10(s+1e-14);if(b[k]>mx)mx=b[k];}
  for(let k=0;k<n;k++)b[k]=Math.max(b[k],mx-C.secFloor);
  ch.fill(0);let cs=0;for(let i=A.cb[0];i<=A.cb[1];i++){const p=Math.pow(10,Math.max(P[i],-140)/10);ch[A.pc[i]]+=p;cs+=p;}
  if(A.secOn===0){F.set(b);Sl.set(b);CF.fill(1/12);CS.fill(1/12);}
  A.secOn+=dts;const warm=A.secOn<C.secWarm;
  const kf=1-Math.exp(-dts/C.secFast),ks=1-Math.exp(-dts/C.secSlow),kg=1-Math.exp(-dts/C.secSig);
  for(let k=0;k<n;k++){F[k]+=(b[k]-F[k])*kf;if(warm)Sl[k]=F[k];else Sl[k]+=(F[k]-Sl[k])*ks;const d=F[k]-Sl[k];
    Gs[k]=Math.max(.5,Gs[k]+(Math.min(Math.abs(d),3*Gs[k])-Gs[k])*kg);z[k]=d/Gs[k];}
  /* how many bands play: within layDb of the loudest, tilted +3 dB/octave so a pink spectrum is flat; layDn more within 2 s = instruments came in */
  const tl=3*Math.log2(C.secHz[1]/C.secHz[0])/n,LY=A.lay;let tm=-200;for(let k=0;k<n;k++)tm=Math.max(tm,F[k]+tl*k);
  let N=0;for(let k=0;k<n;k++){const v=F[k]+tl*k,on=LY.on[k]?v>tm-C.layDb-C.layHys:v>tm-C.layDb;LY.on[k]=on?1:0;N+=on?1:0;}LY.N=N;
  LY.nh.push(t,N);let j0=0;while(j0<LY.nh.length&&LY.nh[j0]<t-2)j0+=2;if(j0)LY.nh.splice(0,j0);let nMin=N;for(let i=1;i<LY.nh.length;i+=2)nMin=Math.min(nMin,LY.nh[i]);
  if(!warm&&N-nMin>=C.layDn&&t-LY.at>C.layRe){LY.at=t;A.cands.push({src:'layers',kind:'in',at:t,score:(N-nMin)/C.layDn,what:'instruments come in ('+nMin+' → '+N+' bands)'});}
  /* the harmony on the tonnetz (Harte et al. 2006): the distance between the last second's tonal centroid and the last few seconds' */
  const km=1-Math.exp(-dts/2);   /* cM: the harmony of the last 2 s, the director's memory of a passage */
  for(let c=0;c<12;c++){const v=ch[c]/(cs+1e-20);CF[c]+=(v-CF[c])*kf;if(warm)CS[c]=CF[c];else CS[c]+=(CF[c]-CS[c])*ks;A.cM[c]+=(v-A.cM[c])*km;}
  let cc=0;for(let r=0;r<6;r++){let d=0;for(let c=0;c<12;c++)d+=TONNETZ[r*12+c]*(CF[c]-CS[c]);cc+=d*d;}cc=Math.sqrt(cc);A.cSig=Math.max(.01,A.cSig+(Math.min(cc,3*A.cSig)-A.cSig)*kg);
  zs.set(z);zs.sort();let up=0,dn=0;for(let k=0;k<C.secK;k++){up+=Math.max(0,zs[n-1-k]);dn+=Math.max(0,-zs[k]);}up/=C.secK;dn/=C.secK;
  const spec=Math.max(up,dn)/C.secZ,harm=Math.max(0,cc/A.cSig-1)/C.secCz,score=spec+harm;A.secS=warm?0:score;
  A.secAbove=score>C.secThr&&!warm?A.secAbove+dts:0;
  if(A.secAbove>=C.secHold&&t-A.secLast>C.secGap){A.secLast=t;A.secAbove=0;Sl.set(F);CS.set(CF);
    const kind=harm>spec?'melody':up>=dn?'in':'out';
    A.cands.push({src:harm>spec?'harmony':'spectrum',at:t,score,up,dn,cc,kind});emit('section',{kind,score});}}

/* ---------- the parts that play now, for Arrivals: the melody's onsets in the mids (250 Hz-4 kHz) with the pitch class loudest then, a voice standing
   out (the mids over their 8 s mean), hits in the highs and lows, and the highs and lows against their quietest of the last arMinS s ---------- */
function partEar(loud){const C=cfg,t=M.t,dts=M.dt,P=A.P,Q=A.pe;
  if(!Q.pv){const bi=(a,b)=>[Math.max(1,Math.round(a/A.hz)),Math.min(P.length-1,Math.round(b/A.hz))];
    Object.assign(Q,{bm:bi(250,4000),ba:bi(4000,11000),bl:bi(90,250),pv:new Float32Array(P.length).fill(-140),hist:new Float32Array(12),n:0,ton:0,
      on:false,aon:false,lon:false,pc:0,str:0,ok:{m:{fm:0,f1:0,f2:0,t:-9},a:{fm:0,f1:0,f2:0,t:-9},l:{fm:0,f1:0,f2:0,t:-9}},
      mf:0,mL:0,voice:0,vOn:false,vT:-9,am:0,lm:0,ah:[],lh:[],hT:t,rise:[0,0],rate:0});}
  Q.on=Q.aon=Q.lon=false;if(!loud)return;const k=x=>1-Math.exp(-dts/x);
  const lvl=([i0,i1])=>{let s=0;for(let i=i0;i<=i1;i++)s+=Math.pow(10,Math.max(P[i],-140)/10);return 10*Math.log10(s+1e-14);};
  const flux=([i0,i1])=>{let f=0;for(let i=i0;i<=i1;i++)f+=Math.max(0,Math.max(P[i],-140)-Q.pv[i]);return f/(i1-i0+1);};
  const pick=(o,f)=>{const thr=o.fm+C.arFlux,hit=Q.n>2&&o.f1>thr&&o.f1>=o.f2&&o.f1>=f&&t-o.t>C.arGap;if(hit)o.t=t;const s=clamp((o.f1-thr)/3);o.f2=o.f1;o.f1=f;o.fm+=(f-o.fm)*k(.5);return hit?s+1e-3:0;};   /* a peak over the mean, a frame late */
  const sm=pick(Q.ok.m,flux(Q.bm)),sa=pick(Q.ok.a,flux(Q.ba)),sl=pick(Q.ok.l,flux(Q.bl));for(let i=0;i<P.length;i++)Q.pv[i]=Math.max(P[i],-140);
  /* the melody's hit strength for the pulses: its flux peak over the last strTau s */
  Q.fpk=Math.max(Q.ok.m.f2,(Q.fpk||0)*Math.exp(-dts/C.strTau),2);
  for(let c=0;c<12;c++)Q.hist[c]*=Math.exp(-dts/30);
  {const ph=M.beat%1,off=ph>.15&&ph<.35||ph>.65&&ph<.85;if(sm)Q.off=(Q.off||0)+((off?1:0)-(Q.off||0))*.08;   /* syncopation: the share of notes between the eighths */
    Q.fl=(Q.fl==null?A.flat:Q.fl)+(A.flat-(Q.fl==null?A.flat:Q.fl))*k(2);Q.ce=(Q.ce==null?A.cent:Q.ce)+(A.cent-(Q.ce==null?A.cent:Q.ce))*k(2);
    const X={fl:Q.fl,ce:Q.ce,off:Q.off||0,rate:Q.rate||0,kd:A.kdens,dens:A.dens,I:A.I,build:A.build},St=Q.st||(Q.st={}),a=k(45);   /* the song so far: each feature's mean and spread */
    for(const n in X){const s=St[n]||(St[n]={m:X[n],v:.01});s.m+=(X[n]-s.m)*a;s.v+=((X[n]-s.m)*(X[n]-s.m)-s.v)*a;}}
  if(sm){Q.on=true;Q.str=sm;let pc=0;for(let c=1;c<12;c++)if(A.cbuf[c]>A.cbuf[pc])pc=c;Q.pc=pc;Q.hist[pc]+=1;for(let c=0;c<12;c++)if(Q.hist[c]>Q.hist[Q.ton])Q.ton=c;}   /* the home note: the most played of the last half minute */
  Q.aon=!!sa;Q.astr=sa;Q.lon=!!sl;Q.rate+=((Q.on?1/dts:0)-Q.rate)*k(2);Q.arate=(Q.arate||0)+((sa?1/dts:0)-(Q.arate||0))*k(1);   /* hits a second: the melody's, the hats' */
  const lm=lvl(Q.bm),va=lvl(Q.ba),vl=lvl(Q.bl);if(!Q.n){Q.mf=Q.mL=lm;Q.am=va;Q.lm=vl;}
  Q.mf+=(lm-Q.mf)*k(.1);Q.mL+=(Q.mf-Q.mL)*k(8);Q.voice=Q.mf-Q.mL;if(Q.voice>=C.arDb){Q.vT=t;Q.vOn=true;}else Q.vOn=t-Q.vT<.4;
  Q.am+=(va-Q.am)*k(1.5);Q.lm+=(vl-Q.lm)*k(1.5);
  if(t-Q.hT>=.5){Q.hT=t;Q.ah.push(Q.am);Q.lh.push(Q.lm);if(Q.ah.length>C.arMinS*2){Q.ah.shift();Q.lh.shift();}}
  let a0=Q.am,l0=Q.lm;for(let i=0;i<Q.ah.length;i++){if(Q.ah[i]<a0)a0=Q.ah[i];if(Q.lh[i]<l0)l0=Q.lh[i];}Q.rise[0]=Q.am-a0;Q.rise[1]=Q.lm-l0;Q.n++;}

/* ---------- per frame, into the bar being played: 16 slots x kick, snare, hat, sub, mid, high, for the repetition score ---------- */
function barFrame(){if(!A.cur)A.cur={v:new Float32Array(96),on:[0,0,0],rms:0,sub:0,subDb:0,cent:0,n:0};const c=A.cur,s=Math.min(15,Math.floor((M.beat%4)*4))*6;
  c.v[s]=Math.max(c.v[s],A.on[0]?1:0);c.v[s+1]=Math.max(c.v[s+1],A.on[1]?1:0);c.v[s+2]=Math.max(c.v[s+2],A.on[2]?1:0);
  c.v[s+3]=Math.max(c.v[s+3],A.band[0]);c.v[s+4]=Math.max(c.v[s+4],A.band[2]);c.v[s+5]=Math.max(c.v[s+5],A.band[4]);c.rms+=A.rms;c.sub+=A.band[0];c.subDb+=A.lev[0];c.cent+=A.cent;c.n++;}
function corr(a,b){let ma=0,mb=0;for(let i=0;i<a.length;i++){ma+=a[i];mb+=b[i];}ma/=a.length;mb/=b.length;let x=0,y=0,z=0;
  for(let i=0;i<a.length;i++){const p=a[i]-ma,q=b[i]-mb;x+=p*q;y+=p*p;z+=q*q;}return y*z>1e-9?x/Math.sqrt(y*z):0;}
M.corr=corr;   /* correlation of two vectors (the director compares harmonies with it) */
/* per bar: loudness slope, onset density, repetition, build, breakdown */
function barEnd(){const C=cfg,c=A.cur;A.cur=null;if(!c||!c.n)return;
  const bar={v:c.v,on:c.on,rms:c.rms/c.n,sub:c.sub/c.n,subDb:c.subDb/c.n,cent:c.cent/c.n};A.bars.push(bar);if(A.bars.length>32)A.bars.shift();
  const B=A.bars,n=B.length,last=k=>B.slice(Math.max(0,n-k));
  {const L=last(8);let sx=0,sy=0,sxy=0,sxx=0;L.forEach((b,i)=>{sx+=i;sy+=b.rms;sxy+=i*b.rms;sxx+=i*i;});const m=L.length;A.slope=m>2?(m*sxy-sx*sy)/(m*sxx-sx*sx):0;}
  const ons=L=>L.reduce((s,b)=>s+b.on[0]+b.on[1]+b.on[2],0)/(L.length*C.beatsPerBar);
  A.dens=ons(last(4));A.kdens=last(4).reduce((s,b)=>s+b.on[0],0)/(Math.min(4,n)*C.beatsPerBar);
  if(A.gen){A.rep=A.build=0;A.repRun=0;A.brk=false;return;}   /* made-up hits are not a song */
  A.rep=n>2?Math.max(corr(B[n-1].v,B[n-2].v),corr(B[n-1].v,B[n-3].v)):0;A.repRun=A.rep>C.repOn?A.repRun+1:0;
  const kicks=k=>last(k).reduce((s,b)=>s+b.on[0],0);A.kicks=kicks(2);
  const had=n>8&&B.slice(Math.max(0,n-12),n-2).reduce((s,b)=>s+b.on[0],0)>=C.hadKicks;
  const brk=A.brk?A.kicks<4:had&&A.kicks<=C.brkKicks&&bar.rms>.15;
  if(brk!==A.brk){A.brk=brk;log(brk?'breakdown: the beat is gone':'the beat is back');emit(brk?'breakdown':'breakdownEnd',{kind:'beat',on:brk});}A.brkAgo=brk?0:A.brkAgo+1;
  A.subLong=last(16).reduce((s,b)=>s+b.subDb,0)/Math.min(16,n);
  if(n<8){A.build=0;return;}   /* a song needs a few bars before it can build */
  const prev=n>5?B.slice(n-6,n-3):null,now=last(3);
  const dd=prev?ons(now)-ons(prev):0,dc=prev?now.reduce((s,b)=>s+b.cent,0)/3-prev.reduce((s,b)=>s+b.cent,0)/3:0;
  A.build=clamp(.35*A.slope/C.buildSlope+.4*Math.max(0,dd)+2*Math.max(0,dc))*(A.slope>0?1:.5)*(A.dens>.5?1:.3);}   /* a build needs hits getting busier, not only a swell */

/* ---------- the drop watch, every frame: the state machine of echoes_in_light-VJ (groove -> breakdown -> armed -> drop), FastLED's bass-flux idea
   and felixmeyer6/drop-detector's "quiet before the rise". While the beat runs it learns the kick level of the sub; when the sub sinks well
   under it for 2 s that is a breakdown and the level is frozen. A drop is a sub onset that lands back at that level, or, after an intro
   without bass, far above anything so far. A build arms it, and armed, the silence before the drop goes black; if the drop does not come,
   the light is back as soon as the sound is (at most 2.5 s) ---------- */
function dropWatch(t,dts){const C=cfg,W=A.dw,bpb=C.beatsPerBar,k=x=>1-Math.exp(-dts/x),ds=C.dropSens-.5;A.dropPre=false;
  if(A.gen||A.subDb===undefined||A.silent>.5){if(W.snd){W.snd=0;W.st='intro';W.pre=null;}return;}
  const s=A.subDb,f=A.fullDb,go=st=>{if(st==='groove'&&W.st!=='breakdown'){W.S=W.F;W.P=W.env;}W.st=st;W.t0=t;W.low=W.back=0;};
  if(!W.snd){W.env=W.F=W.S=W.P=W.all=s;W.bm=-200;W.bt=t;W.fF=W.fS=f;W.h=[s,s,s];W.groove=W.ref=-200;W.armed=false;go('intro');}
  W.snd+=dts;W.env=Math.max(s,W.env-C.dwFall*dts);W.F+=(W.env-W.F)*k(C.dwFast);W.all+=(W.env-W.all)*k(C.dwSlow);
  W.fF+=(f-W.fF)*k(.05);W.fS+=(f-W.fS)*k(3);W.orate+=((A.on[1]||A.on[2]?1/dts:0)-W.orate)*k(1);
  const onset=s-Math.min(W.h[0],W.h[1],W.h[2])>=C.dwOnset*(1-.8*ds);W.h.shift();W.h.push(s);   /* Sound > Drop sensitivity */
  const age=t-W.t0;let drop=false;
  if(W.st==='groove'){if(W.F>W.S-C.dwBrkDb/2){W.S+=(W.env-W.S)*k(C.dwSlow);W.bm=Math.max(W.bm,s);if(t-W.bt>C.dwPkWin){W.P+=(W.bm-W.P)*C.dwPkK;W.bm=-200;W.bt=t;}}W.groove=W.S;   /* learn only while the beat runs */
    if(W.F<W.groove-C.dwBrkDb){W.low+=dts;if(W.low>=C.dwBrkS&&age>C.dwMinGroove){W.ref=W.P;W.bx=-200;W.brkBeat=M.beat-W.low*M.bpm/60;W.phBar=-1;W.phDone=false;go('breakdown');W.armed=false;W.cent0=A.cent;
      log('drop watch: the bass is gone ('+(W.F-W.groove).toFixed(0)+' dB), waiting for it to slam back');emit('breakdown',{kind:'sub',on:true});}}else W.low=0;}
  else if(W.st==='intro'){
    if(onset&&W.snd>C.dwIntroS&&s>W.all+C.dwIntroDb&&s>f-C.dwShare)drop=true;
    else if(W.snd>C.dwIntroS&&A.kdens>=.5){go('groove');log('drop watch: the song starts with a beat, learning its bass');}}
  else{if(!W.armed&&age>2&&(A.build>C.dwArmBuild||A.cent-W.cent0>C.dwArmCent||W.orate*60/M.bpm>=C.dwArmRate)){W.armed=true;log('drop watch: a build, armed');emit('build',{});}
    if(W.F>W.groove-C.dwBackDb){W.back+=dts;if(W.back>C.dwBackS){go('groove');log('drop watch: the bass came back slowly, no drop');emit('breakdownEnd',{kind:'sub',on:false});}}else W.back=0;
    if(age>C.dwMaxS){go('groove');log('drop watch: no drop for a minute, back to the groove');emit('breakdownEnd',{kind:'sub',on:false});}
    if(W.st==='breakdown'&&onset&&age>C.dwMinBrk&&s>W.ref-C.dwHitDb*(1+1.2*ds)&&s>W.bx+C.dwOver)drop=true;   /* and louder than anything the breakdown had */
    W.bx=Math.max(W.bx,s);}
  /* the blackout before the drop: the silence before it, or the last beat of the phrase */
  if(W.st==='breakdown'&&W.armed&&!W.pre&&!drop&&W.fF<W.fS-C.dwGapDb&&A.ld.S>A.ld.ref-12){   /* a sudden silence out of loud music, not an outro fading away */
   W.pre={t0:t,off:0};log('drop watch: the silence before the drop → black');}
  if(W.st==='breakdown'&&W.armed&&!W.pre&&!drop&&M.locked&&!W.phDone){const bb=(M.beat-W.brkBeat)/bpb,ph=bb%C.dwPhrase;   /* the bar before the phrase ends: room before the drop */
    const kk=Math.floor((bb+1)/C.dwPhrase);   /* at 16 bars always, at 8 (or 24, 32...) only with a strong build; once per breakdown */
    if(bb>=C.dwPhrase-1&&ph>=C.dwPhrase-1&&W.phBar!==Math.floor(bb)&&(kk===2||A.build>=C.dwPhBuild)){W.phBar=Math.floor(bb);W.phDone=true;W.pre={t0:t,off:0,phrase:true,until:M.beat+(C.dwPhrase-ph)*bpb+.5};log('drop watch: the bar before the phrase ends → black (build '+A.build.toFixed(2)+')');}}
  if(W.pre){const p=W.pre;p.off=W.fF>W.fS-C.dwGapDb+3?p.off+dts:0;
    if(drop){A.dropPre=true;W.pre=null;}
    else if(W.st!=='breakdown'||(p.phrase?M.beat>=p.until:p.off>.12)||t-p.t0>(p.phrase?3*C.dwPreMax:C.dwPreMax)){W.pre=null;log('drop watch: no drop yet, the light comes back');}}
  if(drop&&M.beat-A.lastDrop>=bpb){A.drop=true;A.lastDrop=M.beat;log('drop watch: the sub slams back ('+(W.st==='intro'?'after the intro':(s-W.ref).toFixed(0)+' dB against the groove\'s kicks')+')');go('groove');W.armed=false;
    M.snapDownbeat();M.buildLive=0;emit('drop',{why:'ear'});}}

/* =====================================================================================================================
   the browser binding: ONE tap on the page's audio graph, measured once per frame
   host = {ctx(), analyser(), live(), demo(), raw(), tempo()}   (functions, because the page's variables live in its own scope)
   ===================================================================================================================== */
let host=null,taps=null,tapCtx=null;
function kWeight(fs){const sh=(Gd,Q,fc)=>{const a=Math.pow(10,Gd/40),w=2*Math.PI*fc/fs,c=Math.cos(w),al=Math.sin(w)/(2*Q),sa=2*Math.sqrt(a)*al;
    return[[a*((a+1)+(a-1)*c+sa),-2*a*((a-1)+(a+1)*c),a*((a+1)+(a-1)*c-sa)],[(a+1)-(a-1)*c+sa,2*((a-1)-(a+1)*c),(a+1)-(a-1)*c-sa]];};
  const hp=(Q,fc)=>{const w=2*Math.PI*fc/fs,c=Math.cos(w),al=Math.sin(w)/(2*Q);return[[(1+c)/2,-(1+c),(1+c)/2],[1+al,-2*c,1-al]];};
  return[sh(4,1/Math.SQRT2,1500),hp(.5,38)];}   /* K-weighting (ITU BS.1770 / EBU R128, as in pyloudnorm): a +4 dB high shelf at 1.5 kHz and a 38 Hz high pass */
function makeTaps(ctx,analyser){const C=cfg,T={};
  T.an=ctx.createAnalyser();T.an.fftSize=C.fft;T.an.smoothingTimeConstant=0;analyser.connect(T.an);
  T.P=new Float32Array(T.an.frequencyBinCount);T.hz=ctx.sampleRate/C.fft;
  const sp=ctx.createChannelSplitter(2),L=ctx.createAnalyser(),R=ctx.createAnalyser();L.fftSize=R.fftSize=C.fft;analyser.connect(sp);sp.connect(L,0);sp.connect(R,1);
  T.L=L;T.R=R;T.l=new Float32Array(C.fft);T.r=new Float32Array(C.fft);
  const lpf=ctx.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=C.dwLp;lpf.Q.value=.707;analyser.connect(lpf);   /* the drop watch's own sub */
  T.sa=ctx.createAnalyser();T.sa.fftSize=C.dwFft;lpf.connect(T.sa);T.sab=new Float32Array(C.dwFft);
  try{const kw=kWeight(ctx.sampleRate),k1=ctx.createIIRFilter(kw[0][0],kw[0][1]),k2=ctx.createIIRFilter(kw[1][0],kw[1][1]),ksp=ctx.createChannelSplitter(2);   /* the loudness meter */
    analyser.connect(k1);k1.connect(k2);k2.connect(ksp);T.kL=ctx.createAnalyser();T.kR=ctx.createAnalyser();T.kL.fftSize=T.kR.fftSize=C.fft;
    ksp.connect(T.kL,0);ksp.connect(T.kR,1);T.kb=new Float32Array(C.fft);}catch(e){T.kL=null;console.warn('music: no loudness meter',e);}   /* the ears work without it */
  return T;}
M.bind=function(h){host=h;return M;};
M.taps=()=>taps;
const FV={live:false,P:null,hz:1,n:0,sub:undefined,full:null,stereo:null,kms:null,tempo:null};
const stereoBuf={el:0,er:0,lr:0,n:0};
let demoP=null,demoHz=0;
/* one frame of sound from the page: the real tap when something plays, else a spectrum built from the demo bands (raw, 0..1 on the analyser's 66 dB scale) */
function gather(){const h=host,ctx=h.ctx(),an=h.analyser();FV.tempo=h.tempo?h.tempo():null;FV.live=false;FV.sub=undefined;FV.full=null;FV.stereo=null;FV.kms=null;
  if(h.live()&&ctx&&an){
    if(!taps||tapCtx!==ctx){try{taps=makeTaps(ctx,an);tapCtx=ctx;}catch(e){taps=null;tapCtx=ctx;console.warn('music: ears failed',e);}}
    if(taps){const T=taps;T.an.getFloatFrequencyData(T.P);FV.live=true;FV.P=T.P;FV.hz=T.hz;FV.n=T.P.length;
      T.L.getFloatTimeDomainData(T.l);T.R.getFloatTimeDomainData(T.r);let el=0,er=0,lr=0;const l=T.l,r=T.r;
      for(let i=0;i<l.length;i++){el+=l[i]*l[i];er+=r[i]*r[i];lr+=l[i]*r[i];}stereoBuf.el=el;stereoBuf.er=er;stereoBuf.lr=lr;stereoBuf.n=l.length;FV.stereo=stereoBuf;
      T.sa.getFloatTimeDomainData(T.sab);let e=0;for(let i=0;i<T.sab.length;i++)e+=T.sab[i]*T.sab[i];FV.sub=10*Math.log10(e/T.sab.length+1e-14);
      if(T.kL){let e2=0;for(const a of[T.kL,T.kR]){a.getFloatTimeDomainData(T.kb);let s=0;for(let i=0;i<T.kb.length;i++)s+=T.kb[i]*T.kb[i];e2+=s/T.kb.length;}FV.kms=e2;}}}
  else if(h.demo&&h.demo()){   /* the demo beat has no sound to tap: its bands become a spectrum (raw*66-88 dB) */
    const raw=h.raw(),hz=ctx?ctx.sampleRate/cfg.fft:48000/cfg.fft,n=cfg.fft/2,NB=raw.length;
    if(!demoP||demoHz!==hz){demoP=new Float32Array(n);demoHz=hz;}
    const lo=Math.log(40),sp=Math.log(400);let ptot=0,psub=0;
    for(let i=1;i<n;i++){const x=NB*(Math.log(Math.max(1,i*hz))-lo)/sp-.5,i0=Math.max(0,Math.min(NB-1,Math.floor(x))),i1=Math.min(NB-1,i0+1),fr=Math.max(0,Math.min(1,x-i0)),
        v0=x<0?raw[0]:raw[i0]*(1-fr)+raw[i1]*fr,bed=x<8?.75:.6,v=bed+(1-bed)*v0;   /* a real mix is never silent between hits (a bass line, a room): the ear only counts a hit where the band already plays */
      demoP[i]=-88+66*v;const p=Math.pow(10,demoP[i]/10);ptot+=p;if(i*hz<cfg.dwLp)psub+=p;}
    demoP[0]=-140;FV.live=true;FV.P=demoP;FV.hz=hz;FV.n=n;FV.full=10*Math.log10(ptot+1e-14)+3;FV.sub=10*Math.log10(psub+1e-14)+3;}
  return FV;}
/* once per frame, from the page, after its own bands (raw) are filled */
M.frame=function(t,dts){if(!host){return M;}
  if(!(dts>0))dts=1/60;   /* the very first frame has no time behind it */
  if(host.cfg)host.cfg(cfg);   /* the Sound tab's sliders -> M.cfg */
  return M.step(gather(),t,dts);};

M.names=NAMES;
return M;}

const M=create();M.create=create;M.defaultCfg=defaultCfg;
if(typeof window!=='undefined')window.MUSIC=M;
if(typeof module!=='undefined'&&module.exports)module.exports=M;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this));
