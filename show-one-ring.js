/* The One Ring: the PUDE logo goes Lord of the Rings (pattern 58, a scene of Hand and Cube: home:'hand' puts its chip in the Scenes there
   and this panel under them, not in Sets). A 27-second story, prompt 2 in PIXELGRID MIRROR.MD:
   1 the ring turns in the dark while its inscription heats up (Bag End), 2 the camera pulls back, the cube sticks out its index finger and
   the ring falls onto it in slow motion (Prancing Pony), 3 the cube vanishes in one frame, 4 the wraith world: bleached, smeared, white
   winds round a ghost of the cube, the tower and the Eye far away, the Eye finds it, 5 the rush across the land into the Eye and the fire.
   Drawn on the CPU with canvas 2D at 4x the LED resolution (360 x 360 design units), shrunk to one texel per LED and shown as the show
   texture (branch 36, unit 7). The page loads this file with <script src>; code() runs inside the page's scope. Edit this file, not the page. */
(window.INF_SHOWS=window.INF_SHOWS||{})['one-ring']={pat:58,tab:'ring',name:'The One Ring',home:'hand',
note:"The PUDE logo goes Lord of the Rings, after the films: the ring turns in the dark while its inscription glows like hot metal, the cube sticks out its index finger and the ring falls onto it in slow motion, the cube vanishes, the wraith world with white winds round its ghost and the Eye on the tower far away, the Eye finds it, and the cube is pulled across the land into the fire. 27 seconds on a loop, on its own clock (it does not listen to the music).",
defaults:{orLoop:1,orSpeed:1},
panel:String.raw`
    <div data-tab="ring" style="display:flex;flex-direction:column;gap:12px">
      <div class="glabel">The One Ring</div>
      <div class="chips"><button type="button" id="orGo" aria-pressed="false">▶ Play The One Ring on the mirror</button><button type="button" id="orRe">From the start</button><button type="button" id="orPause" aria-pressed="false">Pause</button><button type="button" id="orLoopB" aria-pressed="true">Loop</button></div>
      <div class="row"><label for="orTime">Time</label><output id="orNow"></output><input type="range" id="orTime" min="0" max="27" step="0.05" value="0"></div>
      <canvas id="orPrev" width="360" height="360" style="display:block;width:100%;max-width:360px;aspect-ratio:1;margin:8px 0;border-radius:6px;background:#000"></canvas>
      <p class="note">Above: the full-resolution picture before it is shrunk to the LEDs.</p>
      <div id="orCtl"></div>
    </div>`,
code:function(){
const OR={T:0,pause:false,active:false,N:0,R:0,k:1,amps:0};
const OR_END=27,OR_SHOTS=[[0,'The ring'],[6,'The finger'],[12,'Gone'],[13,'The unseen world'],[19,'Pulled in'],[25,'Black']];
const orC=(v,a,b)=>v<a?a:v>b?b:v,orL=(a,b,t)=>a+(b-a)*t;
const orS=(a,b,x)=>{const t=orC((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const orH=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const orN=x=>{const i=Math.floor(x),f=x-i;return orL(orH(i),orH(i+1),f*f*(3-2*f));};
const orMx=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c];};
const orMz=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1];};
const orMy=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c];};
const orMM=(A,B)=>{const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r.push(A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j]);return r;};
function orCv(w,h,rd){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d',rd?{willReadFrequently:true}:undefined)];}
function orSprite(stops){const[c,x]=orCv(128,128),g=x.createRadialGradient(64,64,0,64,64,64);for(const s of stops)g.addColorStop(s[0],s[1]);x.fillStyle=g;x.fillRect(0,0,128,128);return c;}

/* ---------- set-up: canvases, the logo's paths, the inscription, light sprites ---------- */
function orInit(N){OR.N=N;OR.R=N>180?Math.min(512,N*2):360;OR.k=OR.R/360;const R=OR.R;
  [OR.SC,OR.sx]=orCv(R,R);[OR.M,OR.mx]=orCv(R,R);[OR.TM,OR.tx]=orCv(R,R);[OR.FB,OR.fx]=orCv(R,R);[OR.G,OR.gx]=orCv(R,R);[OR.SM,OR.smx]=orCv(N,N,true);
  OR.U=new Float32Array(N*N*4);OR.lut=new Float32Array(256);for(let i=0;i<256;i++)OR.lut[i]=Math.pow(i/255,2.2);
  if(OR.tex)gl.deleteTexture(OR.tex);OR.tex=tex(7,gl.NEAREST,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,N,N,0,gl.RGBA,gl.FLOAT,null);gl.activeTexture(gl.TEXTURE0);
  if(OR.lp)return;
  OR.lp=window.INF_RING_LOGO.map(g=>new Path2D(g[4]));
  OR.warm=orSprite([[0,'rgba(255,220,150,1)'],[.25,'rgba(255,130,30,.55)'],[.6,'rgba(200,50,5,.15)'],[1,'rgba(0,0,0,0)']]);
  OR.white=orSprite([[0,'rgba(255,255,255,1)'],[.3,'rgba(220,235,255,.35)'],[1,'rgba(0,0,0,0)']]);
  OR.eyeGlow=orSprite([[0,'rgba(255,170,60,1)'],[.3,'rgba(255,90,15,.45)'],[.65,'rgba(160,25,0,.12)'],[1,'rgba(0,0,0,0)']]);
  orInscription();
  [OR.FC,OR.fcx]=orCv(72,72);OR.fimg=OR.fcx.createImageData(72,72);}

/* the inscription: a flowing elvish-looking script (stems, bows, marks above), white; two tinted copies: a blurred red-orange glow and a hot core */
function orInscription(){const W=1024,H=64,[c,x]=orCv(W,H);x.strokeStyle='#fff';x.fillStyle='#fff';x.lineCap='round';x.lineJoin='round';x.lineWidth=3.2;
  let px=10,i=0;
  while(px<W-24){const r=orH(i*3.1+.7),r2=orH(i*5.3+1.1),r3=orH(i*7.7+2.3),bows=r<.45?1:r<.8?2:0;
    x.beginPath();x.moveTo(px,r2<.25?13:24);x.lineTo(px,r2>.8?55:42);
    for(let b=0;b<bows;b++){x.moveTo(px+b*8,26);x.arc(px+b*8,33,7,-Math.PI/2,Math.PI/2);}
    if(!bows){x.moveTo(px,30);x.quadraticCurveTo(px+9,22,px+12,34);x.quadraticCurveTo(px+13,44,px+5,42);}
    x.stroke();x.beginPath();
    if(r3<.3){x.arc(px+7,12,2.4,0,6.283);x.fill();}
    else if(r3<.55){x.moveTo(px+1,14);x.quadraticCurveTo(px+8,5,px+14,13);x.stroke();}
    else if(r3<.7){x.moveTo(px+3,15);x.lineTo(px+10,7);x.stroke();}
    px+=16+bows*8+(orH(i+9.9)<.14?13:0);i++;}
  const tint=(blur,col)=>{const[d,y]=orCv(W,H);if(blur){y.filter='blur('+blur+'px)';y.drawImage(c,0,0);y.drawImage(c,0,0);y.filter='none';}else y.drawImage(c,0,0);
    y.globalCompositeOperation='source-in';y.fillStyle=col;y.fillRect(0,0,W,H);return d;};
  OR.inscG=tint(5,'#ff3c00');OR.inscC=tint(0,'#ffdc8c');}

/* ---------- the ring: a gold band in 3D, faces sorted back to front; o = {x,y (device px), sc (px per ring radius), M (3x3), w (half
   height), th (thickness), insc 0..1, fire 0..1 (light from below), part 'all' | 'back' | 'front' (behind or in front of a finger)} ---------- */
function orRing(x,o,T){const n=o.n||64,M=o.M,w=o.w,ri=1-o.th,F=[];
  const P=(r,v,ph)=>{const a=r*Math.cos(ph),b=r*Math.sin(ph);return[M[0]*a+M[1]*v+M[2]*b,M[3]*a+M[4]*v+M[5]*b,M[6]*a+M[7]*v+M[8]*b];};
  const Nv=(a,b,c)=>[M[0]*a+M[1]*b+M[2]*c,M[3]*a+M[4]*b+M[5]*c,M[6]*a+M[7]*b+M[8]*c];
  for(let i=0;i<n;i++){const p0=i/n*6.2832,p1=(i+1)/n*6.2832,pm=(p0+p1)/2,c=Math.cos(pm),s=Math.sin(pm);
    F.push({q:[P(1,w,p0),P(1,w,p1),P(1,-w,p1),P(1,-w,p0)],nr:Nv(c,0,s),out:1,i});
    F.push({q:[P(ri,w,p0),P(ri,w,p1),P(ri,-w,p1),P(ri,-w,p0)],nr:Nv(-c,0,-s)});
    F.push({q:[P(ri,w,p0),P(1,w,p0),P(1,w,p1),P(ri,w,p1)],nr:Nv(0,1,0)});
    F.push({q:[P(ri,-w,p0),P(1,-w,p0),P(1,-w,p1),P(ri,-w,p1)],nr:Nv(0,-1,0)});}
  const L=[-.42,.72,.55],part=o.part||'all',sh=[];
  for(const f of F){if(f.nr[2]<=0)continue;const z=(f.q[0][2]+f.q[2][2])/2;if(part==='back'&&z>=0||part==='front'&&z<0)continue;f.z=z;sh.push(f);}
  sh.sort((a,b)=>a.z-b.z);x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.lineJoin='round';
  const sx=v=>o.x+v[0]*o.sc,sy=v=>o.y-v[1]*o.sc;let glint=0;
  for(const f of sh){const[nx,ny,nz]=f.nr,rx=2*nz*nx,ry=2*nz*ny,rz=2*nz*nz-1;
    const dif=Math.max(0,nx*L[0]+ny*L[1]+nz*L[2]),spec=Math.pow(Math.max(0,rx*L[0]+ry*L[1]+rz*L[2]),38);
    /* polished gold is mostly reflection: a dark room with a top light, a sharp softbox stripe on the left, a rim light right, fire below */
    const e1=1.5*Math.exp(-Math.pow((ry-.55)/.2,2))+1.15*Math.exp(-Math.pow((rx+.45)/.13,2))+.6*Math.exp(-Math.pow((rx-.62)/.1,2)),
          e3=(o.fire||0)*(.75+.5*orN(T*3+(f.i||0)*.3))*.95*Math.exp(-Math.pow((ry+.5)/.3,2));
    const r=255*(.05+.15*dif+e1+e3+1.3*spec),g=255*(.036+.107*dif+.71*e1+.4*e3+1.2*spec),b=255*(.015+.044*dif+.29*e1+.07*e3+1.0*spec);
    const col='rgb('+Math.min(255,r|0)+','+Math.min(255,g|0)+','+Math.min(255,b|0)+')';glint=Math.max(glint,spec*nz);
    x.beginPath();x.moveTo(sx(f.q[0]),sy(f.q[0]));for(let k=1;k<4;k++)x.lineTo(sx(f.q[k]),sy(f.q[k]));x.closePath();x.fillStyle=col;x.fill();x.strokeStyle=col;x.lineWidth=.8;x.stroke();
    if(f.out&&o.insc>.01){const q=f.q,sw=1024/n,X0=sx(q[0]),Y0=sy(q[0]),a=(sx(q[1])-X0)/sw,b2=(sy(q[1])-Y0)/sw,c=(sx(q[3])-X0)/64,d=(sy(q[3])-Y0)/64,s0=f.i*sw;
      x.setTransform(a,b2,c,d,X0-a*s0,Y0-b2*s0);x.globalCompositeOperation='lighter';
      x.globalAlpha=Math.min(1,o.insc*1.1);x.drawImage(OR.inscG,s0,0,sw+1,64,s0,0,sw+1,64);x.globalAlpha=o.insc*Math.min(1,.4+nz);x.drawImage(OR.inscC,s0,0,sw+1,64,s0,0,sw+1,64);
      x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;}}
  return glint;}
function orGlint(x,px,py,s,a){if(a<.02)return;x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='lighter';x.globalAlpha=a;x.drawImage(OR.white,px-s,py-s,s*2,s*2);
  x.strokeStyle='rgba(255,240,200,.9)';x.lineWidth=Math.max(1,s*.06);x.beginPath();x.moveTo(px-s*1.6,py);x.lineTo(px+s*1.6,py);x.moveTo(px,py-s*1.6);x.lineTo(px,py+s*1.6);x.stroke();
  x.globalAlpha=1;x.globalCompositeOperation='source-over';}

/* ---------- the PUDE cube (paths 0-8 of PUDE_logo.svg; 9-14 are its waving hand, replaced by the pointing hand below), in logo space
   (the logo's 600 x 600 picture). ghost: drawn as a pale see-through spirit with glowing white edges ---------- */
const OR_GHOST=[.13,.07,.32,.05,.26,1,0,.04,.45];
function orLogo(x,ghost){const L=window.INF_RING_LOGO,s=600/4725;
  for(let i=0;i<=8;i++){const g=L[i];x.save();x.transform(s,0,0,s,0,0);x.transform(...g[0]);
    if(ghost){if(i===6){x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.85)';}else{x.fillStyle='rgba(225,236,255,'+OR_GHOST[i]+')';}}
    else{x.globalAlpha=g[2];x.fillStyle=g[1];}
    x.fill(OR.lp[i],g[3]?'evenodd':'nonzero');x.restore();}}
/* the pointing hand in the logo's style (hot pink, thick black outline) coming out of the hole: rise 0..1, fing 0..1 = index finger out */
const OR_FX=272,OR_KN=80,OR_FL=92;
function orHand(x,rise,fing,ghost){if(rise<=0)return;const dy=(1-rise)*185,ol=ghost?'rgba(235,244,255,.95)':'#000',fl=ghost?'rgba(220,232,255,.28)':'#ed0152',hi=ghost?'rgba(255,255,255,.25)':'#ff5c95';
  x.save();x.beginPath();x.moveTo(-2000,-2000);x.lineTo(2600,-2000);x.lineTo(2600,160);x.lineTo(449,160);x.lineTo(297,209);x.lineTo(138,160);x.lineTo(-2000,160);x.closePath();x.clip();
  x.translate(0,dy);x.lineCap='round';x.lineJoin='round';
  const tip=OR_KN-OR_FL*fing;
  const arm=()=>{x.beginPath();x.moveTo(300,260);x.lineTo(296,120);},fing1=()=>{x.beginPath();x.moveTo(OR_FX,OR_KN+10);x.lineTo(OR_FX,tip);},
        fist=()=>{x.beginPath();x.roundRect(254,62,86,66,22);},thumb=()=>{x.beginPath();x.moveTo(258,110);x.lineTo(306,101);};
  x.strokeStyle=ol;x.fillStyle=ol;x.lineWidth=46+15;arm();x.stroke();x.lineWidth=28+15;fing1();x.stroke();fist();x.lineWidth=15;x.stroke();x.fill();
  x.strokeStyle=fl;x.fillStyle=fl;if(ghost){x.globalCompositeOperation='destination-out';x.strokeStyle=x.fillStyle='rgba(0,0,0,.7)';}
  x.lineWidth=46;arm();x.stroke();x.lineWidth=28;fing1();x.stroke();fist();x.fill();
  if(ghost){x.globalCompositeOperation='source-over';x.strokeStyle=x.fillStyle=fl;x.lineWidth=46;arm();x.stroke();x.lineWidth=28;fing1();x.stroke();fist();x.fill();}
  x.strokeStyle=hi;x.lineWidth=6;x.beginPath();x.moveTo(OR_FX-6,OR_KN-12);x.lineTo(OR_FX-6,tip+4);x.stroke();
  x.strokeStyle=ol;x.lineWidth=24+14;thumb();x.stroke();x.strokeStyle=fl;x.lineWidth=24;thumb();x.stroke();
  x.strokeStyle=ol;x.lineWidth=6;x.beginPath();x.moveTo(300,64);x.lineTo(300,84);x.moveTo(318,64);x.lineTo(318,84);x.moveTo(OR_FX+16,72);x.quadraticCurveTo(OR_FX+20,80,OR_FX+15,88);x.stroke();
  x.restore();
  x.strokeStyle=ol;x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(138,160);x.lineTo(297,209);x.lineTo(449,160);x.stroke();}

/* ---------- shot 1 and 2's light: embers rising, fire below ---------- */
function orEmbers(x,T,n,x0,w,y1,h,a,seed){x.setTransform(OR.k,0,0,OR.k,0,0);x.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const j=i+seed,per=3+orH(j)*4,u=((T+orH(j+.5)*per)%per)/per,px=x0+orH(j+1.3)*w+Math.sin(T*1.3+j)*10*u,py=y1-u*h,
      s=(1.5+orH(j+2)*2.5)*(1-u*.5),al=a*Math.sin(Math.PI*u)*(.6+.4*orN(T*8+j));if(al<.02)continue;
    x.globalAlpha=Math.min(1,al);x.drawImage(OR.warm,px-s*2,py-s*2,s*4,s*4);}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';}

function orShot1(x,T){const k=OR.k;x.setTransform(k,0,0,k,0,0);
  const fire=.35+.65*orS(.5,4,T),fl=.85+.15*orN(T*5),gr=x.createRadialGradient(180,430,10,180,430,300);
  gr.addColorStop(0,'rgba(255,110,20,'+(.32*fire*fl)+')');gr.addColorStop(.5,'rgba(150,30,5,'+(.12*fire)+')');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,360,360);
  orEmbers(x,T,34,40,280,380,330,.9*fire,0);
  const fall=orS(0,1.8,T),e=1-Math.pow(1-fall,3),y=orL(-130,176,e)+Math.sin(T*1.1)*3*fall,tumble=(1-e)*2.6;
  const M=orMM(orMx(.38+.05*Math.sin(T*.7)+tumble),orMy(.5*T+1.2)),ins=orS(1.4,4.3,T)*(.84+.16*orN(T*6)),wob=1+.004*Math.sin(T*23)*ins;
  const gl=orRing(x,{x:180*k,y:y*k,sc:95*k*wob,M,w:.26,th:.14,insc:ins,fire:fire*fl},T);
  orGlint(x,(180-40)*k,(y-50)*k,14*k,Math.max(0,gl-.6)*1.5);}

/* ---------- shots 2 and 3: the tavern, in logo space; c = camera {x,y,z}; gone = the cube has vanished (T past 12) ---------- */
const OR_CANDLES=[[40,330,1],[548,300,.8],[610,420,1.2],[-60,430,1.4],[470,250,.6]];
function orCam(x,c){const k=OR.k;x.setTransform(k*c.z,0,0,k*c.z,k*(180-c.x*c.z),k*(180-c.y*c.z));}
function orTavern(x,T,c,gone){orCam(x,c);
  const gw=x.createLinearGradient(0,-400,0,470);gw.addColorStop(0,'#070403');gw.addColorStop(1,'#1d1008');x.fillStyle=gw;x.fillRect(-3000,-3000,6600,3470);
  x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=5;x.beginPath();for(let i=-30;i<=30;i++){x.moveTo(i*58+20,-3000);x.lineTo(i*58+20,470);}x.stroke();
  const gf=x.createLinearGradient(0,470,0,900);gf.addColorStop(0,'#24130a');gf.addColorStop(1,'#3a210f');x.fillStyle=gf;x.fillRect(-3000,470,6600,3000);
  x.strokeStyle='rgba(10,5,2,.6)';x.lineWidth=3;x.beginPath();for(let i=-14;i<=14;i++){x.moveTo(300+i*42,470);x.lineTo(300+i*110,1000);}
  for(const yy of[520,600,710,860]){x.moveTo(-3000,yy);x.lineTo(3600,yy);}x.stroke();
  x.fillStyle='rgba(0,0,0,.55)';x.beginPath();x.ellipse(300,560,250,46,0,0,6.283);x.fill();
  const dip=gone?1-.6*Math.exp(-Math.pow((T-12.25)/.25,2)):1;
  for(let i=0;i<OR_CANDLES.length;i++){const[cx,cy,s]=OR_CANDLES[i],f=(.8+.2*orN(T*7+i*3))*dip,lean=gone?6*Math.exp(-Math.pow((T-12.2)/.3,2)):0;
    x.fillStyle='#d8c39a';x.fillRect(cx-6*s,cy,12*s,48*s);
    x.globalCompositeOperation='lighter';x.globalAlpha=.55*f;x.drawImage(OR.warm,cx-150*s,cy-150*s,300*s,300*s);x.globalAlpha=1;
    x.fillStyle='rgba(255,236,170,'+(.95*f)+')';x.beginPath();x.moveTo(cx-5*s,cy-6*s);x.quadraticCurveTo(cx+lean*s,cy-34*s*f,cx+5*s,cy-6*s);x.quadraticCurveTo(cx,cy+3*s,cx-5*s,cy-6*s);x.fill();
    x.globalCompositeOperation='source-over';}
  for(let i=0;i<6;i++){const hx=orL(-200,800,orH(i+40))+Math.sin(T*.15+i)*60,hy=orL(-100,500,orH(i+41)),hr=180+120*orH(i+42),g=x.createRadialGradient(hx,hy,0,hx,hy,hr);
    g.addColorStop(0,'rgba(110,80,60,.07)');g.addColorStop(1,'rgba(110,80,60,0)');x.fillStyle=g;x.fillRect(hx-hr,hy-hr,hr*2,hr*2);}}

/* shot 2: the ring's fall onto the finger; shot 3: gone */
function orRingPath(T){const p=orC((T-6)/4.9,0,1),pp=p*(.65+.35*p);
  if(T<10.9)return{x:OR_FX-46*(1-p)*Math.cos(p*3.2),y:orL(-150,-22,pp),th:7*Math.PI*(1-p)*(1-p),roll:.35*(1-p)*Math.sin(T*1.7)};
  const q=orC((T-10.9)/.8,0,1);return{x:OR_FX,y:orL(-22,52,1-Math.pow(1-q,3)),th:0,roll:0};}
function orCam2(T){const r=orRingPath(Math.max(6,T)),pull=orS(6,7.3,T),push=orS(8.6,11.8,T),back=orS(12.15,13,T);
  const zP=Math.exp(orL(Math.log(4),Math.log(.55),pull)),zF=orL(.55,1.85,push*push*(3-2*push)),beat=orHeart(T);
  /* the pull-back: the ring slides on screen linearly from the centre to where the wide shot has it, while the zoom drops exponentially */
  let c={x:r.x-pull*(r.x-300)*.55/zP,y:r.y-pull*(r.y-215)*.55/zP,z:T<8.6?zP:zF};
  if(T>=8.6){c.x=orL(300,OR_FX+6,push);c.y=orL(215,28,push);}
  if(T>=12.15){c.x=orL(c.x,300,back);c.y=orL(c.y,300,back);c.z=orL(c.z,.6,back);}
  c.z*=1+.03*beat;return c;}
function orHeart(T){let b=0;for(const t0 of[10.35,11.15,11.95])b+=Math.exp(-Math.pow((T-t0)/.07,2))+.6*Math.exp(-Math.pow((T-t0-.22)/.06,2));return b;}
function orShot2(x,T){const c=orCam2(T),gone=T>=12,k=OR.k;orTavern(x,T,c,gone);
  const fade=orS(6,6.9,T);if(fade<1){x.setTransform(1,0,0,1,0,0);x.fillStyle='rgba(0,0,0,'+(1-fade)+')';x.fillRect(0,0,OR.R,OR.R);}
  const rp=orRingPath(T),M=orMM(orMx(.35),orMM(orMz(rp.roll),orMx(rp.th))),onF=rp.y>-30,sc=24*c.z*k;
  const ro={x:k*(180+(rp.x-c.x)*c.z),y:k*(180+(rp.y-c.y)*c.z),sc,M,w:.27,th:.15,insc:1-orS(6,7.2,T),fire:.55*(1-orS(6,7.5,T))+.25,n:48};
  if(!gone){orCam(x,c);orLogo(x,false);const rise=orS(7.4,8.2,T),fing=orS(7.95,8.6,T);
    if(onF){x.save();x.setTransform(1,0,0,1,0,0);orRing(x,Object.assign({},ro,{part:'back'}),T);x.restore();}
    orCam(x,c);orHand(x,rise,fing,false);
    const g=orRing(x,Object.assign({},ro,{part:onF?'front':'all'}),T);orGlint(x,ro.x-sc*.5,ro.y-sc*.4,sc*.7,Math.max(0,g-.55)*1.6);
    const seat=Math.exp(-Math.pow((T-11.7)/.12,2));if(seat>.02)orGlint(x,ro.x+sc*.6,ro.y,sc*1.2,seat);}
  else{const u=T-12;orCam(x,c);
    x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,230,190,'+(.35*Math.max(0,1-u*1.4))+')';x.lineWidth=10;x.beginPath();x.ellipse(300,330,40+u*700,20+u*330,0,0,6.283);x.stroke();
    for(let i=0;i<26;i++){const a=i/26*6.283+orH(i)*.2,r=1+u*(1.2+orH(i+3)*.8),px=300+Math.cos(a)*240*r,py=560+Math.sin(a)*44*r-u*60*orH(i+5),s=26+u*60;
      x.globalAlpha=.18*Math.max(0,1-u);x.drawImage(OR.white,px-s,py-s,s*2,s*2);}
    x.globalAlpha=1;x.globalCompositeOperation='source-over';
    orGlint(x,ro.x+sc*.6,ro.y,sc*1.3*(1+u),Math.max(0,1-u*2.2));}
  orEmbers(x,T,10,0,360,380,300,.35,50);}

/* ---------- shots 4 and 5: Mordor. World units = 360 design units at zoom 1; the Eye sits at EW and is drawn at Fs on screen ---------- */
const OR_EW=[228,131],OR_TW=[[-.30,0],[-.30,-.05],[-.37,-.07],[-.26,-.10],[-.25,-.22],[-.32,-.24],[-.21,-.27],[-.19,-.40],[-.25,-.42],[-.16,-.45],[-.15,-.58],[-.2,-.6],[-.12,-.63],
  [-.11,-.74],[-.16,-.76],[-.105,-.79],[-.12,-.86],[-.15,-.93],[-.14,-1.0],[-.07,-1.09],[-.09,-1.0],[-.085,-.93],[-.06,-.885],[0,-.87]];
const OR_RIV=[[[40,370],[62,322],[52,292],[80,266],[96,246]],[[270,370],[232,322],[190,302],[150,272],[112,250]],[[340,350],[302,302],[292,272],[246,250]]];
function orZ(T){const z4=1+.22*orS(13.6,19.5,T);if(T<19.5)return z4;const p=orC((T-19.5)/3.1,0,1);return T<22.6?1.22*Math.exp(Math.log(30/1.22)*Math.pow(p,2.4)):30*(1+.15*(T-22.6));}
function orFs(T){const m=orS(19.5,21,T);return[orL(OR_EW[0],180,m),orL(OR_EW[1],180,m)];}
function orMordor(x,T,Z,Fs){const k=OR.k;x.setTransform(k*Z,0,0,k*Z,k*(Fs[0]-OR_EW[0]*Z),k*(Fs[1]-OR_EW[1]*Z));
  const X0=OR_EW[0]-Fs[0]/Z,X1=OR_EW[0]+(360-Fs[0])/Z,Y0=OR_EW[1]-Fs[1]/Z,Y1=OR_EW[1]+(360-Fs[1])/Z;
  const gs=x.createLinearGradient(0,-60,0,238);gs.addColorStop(0,'#120304');gs.addColorStop(.45,'#3e0b06');gs.addColorStop(.85,'#a12a0b');gs.addColorStop(1,'#ff7a1f');x.fillStyle=gs;x.fillRect(X0-1,Y0-1,X1-X0+2,240-Y0);
  for(let i=0;i<8;i++){const cx=orL(-100,460,orH(i+20))+T*(3+4*orH(i+21)),cy=orL(30,175,orH(i+22)),rx=110+90*orH(i+23),ry=10+14*orH(i+24);
    x.fillStyle='rgba(18,5,5,.8)';x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,6.283);x.fill();
    x.fillStyle='rgba(255,80,20,.13)';x.beginPath();x.ellipse(cx+10,cy+ry*.55,rx*.8,ry*.45,0,0,6.283);x.fill();}
  x.fillStyle='#140707';x.beginPath();x.moveTo(-80,240);x.lineTo(56,150);x.lineTo(88,150);x.lineTo(220,240);x.fill();
  x.globalCompositeOperation='lighter';x.drawImage(OR.warm,72-45,148-45,90,90);
  x.strokeStyle='rgba(255,110,20,.85)';x.lineWidth=1.4;x.beginPath();x.moveTo(62,152);x.quadraticCurveTo(50,190,30,236);x.moveTo(80,152);x.quadraticCurveTo(92,186,84,236);x.moveTo(72,152);x.quadraticCurveTo(66,200,58,238);x.stroke();
  x.globalCompositeOperation='source-over';
  for(let i=0;i<16;i++){const u=(T*.07+orH(i+60))%1,px=72+u*95*(.5+orH(i+61)),py=140-u*125,r=3+u*34;
    x.fillStyle='rgba(24,9,9,'+(.6*Math.min(1,u*5)*(1-u))+')';x.beginPath();x.arc(px,py,r,0,6.283);x.fill();
    x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,90,20,'+(.16*(1-u)*(1-u))+')';x.beginPath();x.arc(px,py+r*.4,r*.6,0,6.283);x.fill();x.globalCompositeOperation='source-over';}
  const gp=x.createLinearGradient(0,238,0,370);gp.addColorStop(0,'#1a0806');gp.addColorStop(1,'#050202');x.fillStyle=gp;x.fillRect(X0-1,238,X1-X0+2,Math.max(10,Y1-236));
  x.lineCap='round';x.lineJoin='round';
  for(const rv of OR_RIV){x.beginPath();x.moveTo(rv[0][0],rv[0][1]);for(let i=1;i<rv.length;i++)x.lineTo(rv[i][0],rv[i][1]);
    x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,70,10,.25)';x.lineWidth=6;x.stroke();x.strokeStyle='rgba(255,150,40,.9)';x.lineWidth=1.3;x.stroke();x.globalCompositeOperation='source-over';}
  const H=118,bx=OR_EW[0],by=242;x.fillStyle='#070304';x.beginPath();
  for(const p of OR_TW)x.lineTo(bx+p[0]*H,by+p[1]*H);for(let i=OR_TW.length-1;i>=0;i--)x.lineTo(bx-OR_TW[i][0]*H,by+OR_TW[i][1]*H);x.closePath();x.fill();
  x.strokeStyle='rgba(255,70,25,.35)';x.lineWidth=.8;x.stroke();
  x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const wy=by-H*(.1+.62*orH(i+80)),ww=(.25-.2*(by-wy)/H/.8)*H,wx=bx+(orH(i+81)-.5)*ww;
    x.fillStyle='rgba(255,130,40,'+(.5+.5*orN(T*2+i))+')';x.fillRect(wx-.4,wy-.6,.8,1.2);}x.globalCompositeOperation='source-over';
  x.fillStyle='#030101';for(const s of[-1,1]){x.beginPath();x.moveTo(180+s*240,400);x.lineTo(180+s*240,286);x.lineTo(180+s*205,296);x.lineTo(180+s*190,282);x.lineTo(180+s*160,312);x.lineTo(180+s*130,330);x.lineTo(180+s*100,400);x.fill();}}

/* the Eye: a lidless almond of fire with a black slit; look = where the pupil looks (-1..1), slit = pupil width (0.1 narrow .. 2.4 an open door) */
function orEye(x,ex,ey,s,look,slit,T,I){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='lighter';
  x.globalAlpha=Math.min(1,.6*I);x.drawImage(OR.eyeGlow,ex-s*3.4,ey-s*3.4,s*6.8,s*6.8);x.globalAlpha=1;
  for(let i=0;i<34;i++){const a=i/34*6.2832+(orN(i*3+T*.7)-.5)*.5,bxp=ex+Math.cos(a)*s*1.0,byp=ey+Math.sin(a)*s*.55;
    let dx=Math.cos(a),dy=Math.sin(a)*1.3-.55;const dl=Math.hypot(dx,dy);dx/=dl;dy/=dl;const len=s*(.45+.95*orN(i*7.3+T*2.4))*I,wd=s*.2;
    const g=x.createLinearGradient(bxp,byp,bxp+dx*len,byp+dy*len);g.addColorStop(0,'rgba(255,150,40,.8)');g.addColorStop(1,'rgba(200,30,0,0)');x.fillStyle=g;
    x.beginPath();x.moveTo(bxp-dy*wd,byp+dx*wd);x.quadraticCurveTo(bxp+dx*len*.55-dy*wd*.6,byp+dy*len*.55+dx*wd*.6,bxp+dx*len,byp+dy*len);
    x.quadraticCurveTo(bxp+dx*len*.55+dy*wd*.6,byp+dy*len*.55-dx*wd*.6,bxp+dy*wd,byp-dx*wd);x.fill();}
  x.globalCompositeOperation='source-over';x.save();x.beginPath();x.moveTo(ex-s,ey);x.quadraticCurveTo(ex,ey-s*1.22,ex+s,ey);x.quadraticCurveTo(ex,ey+s*1.22,ex-s,ey);x.clip();
  const px=ex+look*s*.32,gr=x.createRadialGradient(px,ey,0,ex,ey,s*1.05);
  gr.addColorStop(0,'#fff6d2');gr.addColorStop(.18,'#ffd65c');gr.addColorStop(.45,'#ff8c1c');gr.addColorStop(.75,'#e2420a');gr.addColorStop(1,'#5a0800');x.fillStyle=gr;x.fillRect(ex-s,ey-s,s*2,s*2);
  x.lineCap='round';
  for(let i=0;i<28;i++){const a=i/28*6.2832+T*.22+(orN(i+T*.9)-.5)*.6,r0=s*.16,r1=s*(.66+.36*orN(i*5.1+T*1.7)),tw=.32+.2*orN(i*2.3+T);
    x.beginPath();x.moveTo(px+Math.cos(a)*r0,ey+Math.sin(a)*r0*.62);x.quadraticCurveTo(px+Math.cos(a+tw*.5)*r1*.6,ey+Math.sin(a+tw*.5)*r1*.4,px+Math.cos(a+tw)*r1,ey+Math.sin(a+tw)*r1*.62);
    if(i%2){x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,225,120,.35)';}else{x.globalCompositeOperation='source-over';x.strokeStyle='rgba(110,12,0,.32)';}
    x.lineWidth=s*.07;x.stroke();}
  x.globalCompositeOperation='source-over';const w=slit*s*.5,h=s*.98;
  x.beginPath();x.moveTo(px,ey-h);x.quadraticCurveTo(px+w*2,ey,px,ey+h);x.quadraticCurveTo(px-w*2,ey,px,ey-h);x.fillStyle='#000';x.fill();
  x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,190,70,.75)';x.lineWidth=Math.max(.6,s*.045);x.stroke();x.restore();
  x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,170,60,.6)';x.lineWidth=Math.max(.6,s*.05);
  x.beginPath();x.moveTo(ex-s,ey);x.quadraticCurveTo(ex,ey-s*1.22,ex+s,ey);x.quadraticCurveTo(ex,ey+s*1.22,ex-s,ey);x.stroke();x.globalCompositeOperation='source-over';}

/* the wraith world: bleached to blue-grey, smeared and rippling as if seen through rushing water (SC -> M) */
function orPost(T,b,rip){const R=OR.R,m=OR.mx,t=OR.tx;t.setTransform(1,0,0,1,0,0);t.globalCompositeOperation='source-over';t.globalAlpha=1;
  t.clearRect(0,0,R,R);if(b>.001){t.filter='grayscale('+b+') brightness('+(1+.55*b)+') contrast('+(1-.15*b)+')';}t.drawImage(OR.SC,0,0);t.filter='none';
  m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.globalAlpha=1;m.fillStyle='#000';m.fillRect(0,0,R,R);
  if(rip>.001){const n=60,h=R/n;for(let j=0;j<n;j++){const off=(Math.sin(j*.45+T*6.5)*4+(orN(j*.35+T*3)-.5)*9)*rip*OR.k;m.drawImage(OR.TM,0,j*h,R,h+1,off,j*h,R,h+1);}
    m.globalAlpha=.3*rip;m.drawImage(OR.TM,7*OR.k*rip,0);m.drawImage(OR.TM,-7*OR.k*rip,0);m.globalAlpha=1;}
  else m.drawImage(OR.TM,0,0);
  if(b>.001){m.globalCompositeOperation='multiply';m.fillStyle='rgba('+Math.round(255-120*b)+','+Math.round(255-85*b)+',255,1)';m.fillRect(0,0,R,R);
    m.globalCompositeOperation='screen';m.fillStyle='rgba(185,205,240,'+(.16*b)+')';m.fillRect(0,0,R,R);m.globalCompositeOperation='source-over';}}

/* the white winds round the ghost (front or back half), stretched towards the Eye in the rush */
function orWinds(x,cx,cy,sc,T,front,str,to){x.setTransform(OR.k,0,0,OR.k,0,0);x.globalCompositeOperation='lighter';x.lineCap='round';
  const W=T+.9*Math.max(0,T-17)+2.5*Math.max(0,T-19.2);
  for(let i=0;i<30;i++){const rx=(.55+.55*orH(i))*sc,ry=(.16+.22*orH(i+9))*sc,tl=(orH(i+3)-.5)*.7,om=1.6+2.2*orH(i+5),len=1+1.3*orH(i+7),head=orH(i+11)*6.283+om*W,
      ct=Math.cos(tl),st=Math.sin(tl),vy=Math.sin(T*.7+i)*sc*.12;let px0=null,py0=0;
    for(let j=0;j<=16;j++){const a=head-len*j/16,ex=Math.cos(a)*rx,ey=Math.sin(a)*ry;let px=cx+ex*ct-ey*st,py=cy+vy+ex*st+ey*ct;
      if(str>0){const f=str*j/16;px+=(to[0]-px)*f*.6;py+=(to[1]-py)*f*.6;}
      if(px0!==null&&(Math.sin(a)>0)===front){const al=(1-j/16)*.6;x.strokeStyle='rgba(228,238,255,'+al+')';x.lineWidth=(1-j/16)*2.6+.4;x.beginPath();x.moveTo(px0,py0);x.lineTo(px,py);x.stroke();}
      px0=px;py0=py;}}
  x.globalCompositeOperation='source-over';}
/* the ghost of the cube with the pointing hand and the ring, at screen (gx,gy) with scale gs (logo px to design units); torn in strips */
function orGhost(T,gx,gy,gs,tear,lit,ringOn){const g=OR.gx,R=OR.R,k=OR.k;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,R,R);
  g.setTransform(k*gs,0,0,k*gs,k*(gx-300*gs),k*(gy-300*gs));orLogo(g,true);orHand(g,1,1,true);
  if(lit>0){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,120,40,'+(.55*lit)+')';g.fillRect(0,0,R,R);g.globalCompositeOperation='source-over';}
  const m=OR.mx;m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='lighter';m.filter='blur('+Math.max(1,3*k*gs/.25)+'px)';m.globalAlpha=.45;m.drawImage(OR.G,0,0);m.filter='none';
  m.globalCompositeOperation='source-over';m.globalAlpha=.9;const n=30,h=R/n;
  for(let j=0;j<n;j++){const off=(orN(j*1.7+T*6)-.5)*7*k*tear;m.drawImage(OR.G,0,j*h,R,h+1,off,j*h,R,h+1);}
  m.globalAlpha=1;
  if(ringOn){const M=orMM(orMx(.35),orMy(T*.4)),sc=24*gs*k,rx=k*(gx+(OR_FX-300)*gs),ry=k*(gy+(52-300)*gs);
    m.save();orRing(m,{x:rx,y:ry,sc,M,w:.27,th:.15,insc:.25,fire:.4,n:32},T);m.restore();orGlint(m,rx-sc*.4,ry-sc*.3,sc*.9,.35+.25*Math.sin(T*3));}}

function orShot45(T,dts){const x=OR.sx,m=OR.mx,k=OR.k,Z=orZ(T),Fs=orFs(T);
  orMordor(x,T,Z,Fs);
  const lock=orS(16.4,17.05,T),hit=Math.exp(-Math.max(0,T-17.05)/.35)*(T>=17.05?1:0);
  const sweep=.85*Math.sin((T-13.6)*.9-.8),aim=Math.atan2(110-OR_EW[0],268-OR_EW[1]),beamA=orL(sweep,aim,lock),beamOn=orS(13.8,14.6,T)*(1-orS(19.4,20,T));
  if(beamOn>0){const ex=Fs[0],ey=Fs[1],L=520,hw=.075+.05*lock;x.setTransform(k,0,0,k,0,0);x.globalCompositeOperation='lighter';
    const g=x.createLinearGradient(ex,ey,ex+Math.sin(beamA)*L,ey+Math.cos(beamA)*L);g.addColorStop(0,'rgba(255,235,190,'+(.4*beamOn)+')');g.addColorStop(1,'rgba(255,200,140,0)');x.fillStyle=g;
    x.beginPath();x.moveTo(ex,ey);x.lineTo(ex+Math.sin(beamA-hw)*L,ey+Math.cos(beamA-hw)*L);x.lineTo(ex+Math.sin(beamA+hw)*L,ey+Math.cos(beamA+hw)*L);x.fill();x.globalCompositeOperation='source-over';}
  x.setTransform(k,0,0,k,0,0);x.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const u=(T*.12+orH(i+90))%1,px=(orH(i+91)*400-20+Math.sin(T+i)*10),py=u*380-10;
    x.fillStyle='rgba(150,140,140,'+(.35*Math.sin(Math.PI*u))+')';x.fillRect(px,py,1.2,1.2);}x.globalCompositeOperation='source-over';
  const b=.85*(1-orS(19.8,21.6,T)),rip=.65*(1-orS(19.8,21.4,T));orPost(T,b,rip);
  if(b>.05){m.setTransform(k*Z,0,0,k*Z,k*(Fs[0]-OR_EW[0]*Z),k*(Fs[1]-OR_EW[1]*Z));m.globalCompositeOperation='lighter';m.globalAlpha=.55*b;m.drawImage(OR.warm,72-40,148-40,80,80);m.globalAlpha=1;m.globalCompositeOperation='source-over';}
  const look=T<16.4?.7*Math.sin((T-13.6)*1.1):orL(-.35,0,orS(19.5,21.5,T)),slit=orL(orL(.34,.1,orS(17.05,17.4,T)),2.4,orS(22.55,23.1,T));
  const I=(.92+.12*orN(T*3))*(1+.6*hit)*(1+.25*lock);orEye(m,Fs[0]*k,Fs[1]*k,8.5*Z*k,look,slit,T,I);
  if(hit>.01){m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='lighter';m.fillStyle='rgba(255,120,40,'+(.45*hit)+')';m.fillRect(0,0,OR.R,OR.R);m.globalCompositeOperation='source-over';}
  /* the ghost: in the foreground; in shot 5 it is pulled into the Eye */
  const q=orC((T-19.35)/3.6,0,1),eq=q*q*(3-2*q),tug=Math.exp(-Math.pow((T-19.15)/.12,2));
  if(q<1){const gx=orL(110,Fs[0],eq)-8*tug,gy=orL(268,Fs[1],eq)+6*tug,gs=(.25*Math.pow(1-q,1.6)+.004)*(1+.06*tug),tear=1+2*lock+3*orS(19,20,T),str=orS(19.2,19.9,T),wsc=gs/.25*150;
    orWinds(m,gx,gy-20*gs/.25,wsc,T,false,str,Fs);orGhost(T,gx,gy,gs,tear,Math.max(lock*.6,orS(21,22.8,T)),true);orWinds(m,gx,gy-20*gs/.25,wsc,T,true,str,Fs);}
  /* the rush: speed lines, ash streaks, zoom trails */
  const rush=orS(19.5,20.2,T)*(1-orS(22.7,23.2,T));
  if(rush>0){m.setTransform(k,0,0,k,0,0);m.globalCompositeOperation='lighter';m.lineCap='round';
    for(let i=0;i<70;i++){const a=orH(i+120)*6.283,u=(T*(1.1+orH(i+121))+orH(i+122))%1,r=20+u*u*300,l=r*(.12+.25*rush);
      m.strokeStyle=i%3?'rgba(230,238,255,'+(.5*rush*u)+')':'rgba(255,150,70,'+(.5*rush*u)+')';m.lineWidth=.6+1.6*u;
      m.beginPath();m.moveTo(Fs[0]+Math.cos(a)*r,Fs[1]+Math.sin(a)*r);m.lineTo(Fs[0]+Math.cos(a)*(r+l),Fs[1]+Math.sin(a)*(r+l));m.stroke();}
    m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='screen';m.globalAlpha=.5*rush;const zz=1.08,cx=Fs[0]*k,cy=Fs[1]*k;
    m.drawImage(OR.FB,cx-cx*zz,cy-cy*zz,OR.R*zz,OR.R*zz);m.globalAlpha=1;m.globalCompositeOperation='source-over';}
  OR.fx.setTransform(1,0,0,1,0,0);OR.fx.clearRect(0,0,OR.R,OR.R);OR.fx.drawImage(OR.M,0,0);
  /* the fire */
  if(T>=23.1){const u=T-23.1,br=Math.max(0,1-u/.5);
    if(br>0){m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='lighter';const r=Math.max(1,u*1100*k),g=m.createRadialGradient(Fs[0]*k,Fs[1]*k,0,Fs[0]*k,Fs[1]*k,r);
      g.addColorStop(0,'rgba(255,200,110,'+(.8*br)+')');g.addColorStop(.35,'rgba(255,110,25,'+(.7*br)+')');g.addColorStop(.8,'rgba(200,40,5,'+(.55*br)+')');g.addColorStop(1,'rgba(120,10,0,0)');
      m.fillStyle=g;m.fillRect(0,0,OR.R,OR.R);m.globalCompositeOperation='source-over';}
    orFireDraw(m,T,Fs[0],Fs[1]);
    const dark=orS(24.3,25,T);if(dark>0){m.setTransform(1,0,0,1,0,0);m.fillStyle='rgba(0,0,0,'+dark+')';m.fillRect(0,0,OR.R,OR.R);}}}

/* the fire wall: a flame field from layered value noise rising upwards (72 x 72, no state, so scrubbing and looping are exact).
   23.1 s a ring of fire races out of the pupil while the wall climbs from the floor to the top; 24.3 - 25 s it sinks back down and dies */
function orN2(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),h=(a,b)=>orH(a*57.31+b*131.97);
  return orL(orL(h(xi,yi),h(xi+1,yi),u),orL(h(xi,yi+1),h(xi+1,yi+1),u),v);}
function orFireDraw(m,T,cx,cy){const n=72,D=OR.fimg.data,H=T<24.3?orL(.15,1.02,orS(23.1,23.75,T)):1.02*(1-orS(24.3,25,T)),Rr=(T-23.1)*1.7,burst=1-orS(23.45,23.9,T);
  if(H<=.01&&burst<=0)return;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=i/(n-1),v=j/(n-1),w=u+(orN2(v*3+T*.8,T*.6)-.5)*.14;
    let f=(v+H-1)*1.25+(orN2(w*6,v*4+T*2.6)*.6+orN2(w*13,v*9+T*4.1)*.3+orN2(w*26,v*18+T*6.3)*.1-.5)*2.1;
    if(burst>0){const d=Math.hypot(u*360-cx,v*360-cy)/360;f=Math.max(f,(Math.exp(-Math.pow((d-Rr)/.06,2))*1.15+(d<Rr?.3:0)+(orN2(u*9,v*9+T*3)-.5)*.5)*burst);}
    f=orC(f,0,1);const k=(j*n+i)*4;let r,g,b;
    if(f<.35){const t=f/.35;r=50+170*t;g=3+20*t;b=0;}else if(f<.65){const t=(f-.35)/.3;r=220+35*t;g=23+97*t;b=0;}else{const t=(f-.65)/.35;r=255;g=120+85*t;b=40*t*t;}
    D[k]=r;D[k+1]=g;D[k+2]=b;D[k+3]=Math.min(255,f*3.4*255);}
  OR.fcx.putImageData(OR.fimg,0,0);const R=OR.R;m.setTransform(1,0,0,1,0,0);m.imageSmoothingEnabled=true;
  m.filter='blur('+(1.5*OR.k)+'px)';m.drawImage(OR.FC,-R*.02,-R*.02,R*1.04,R*1.04);
  m.filter='blur('+(7*OR.k)+'px)';m.globalCompositeOperation='lighter';m.globalAlpha=.22;m.drawImage(OR.FC,-R*.08,-R*.1,R*1.16,R*1.16);m.filter='none';m.globalAlpha=1;m.globalCompositeOperation='source-over';}
/* ---------- one frame ---------- */
function orRender(T,dts){const R=OR.R,x=OR.sx,m=OR.mx;
  for(const c of[x,m]){c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.filter='none';c.fillStyle='#000';c.fillRect(0,0,R,R);}
  if(T<6){orShot1(x,T);orPost(T,0,0);}
  else if(T<12.6){orShot2(x,T);orPost(T,0,0);}
  else if(T<13.6){const mix=orS(13,13.6,T),b=.85*orS(12.6,13.15,T),rip=.65*orS(12.7,13.2,T);
    if(mix<1)orShot2(x,T);if(mix>0){const[c2,x2]=[OR.FB,OR.fx];x2.setTransform(1,0,0,1,0,0);x2.globalAlpha=1;x2.globalCompositeOperation='source-over';x2.fillStyle='#000';x2.fillRect(0,0,R,R);
      orMordor(x2,T,orZ(T),orFs(T));x.setTransform(1,0,0,1,0,0);x.globalAlpha=mix;x.drawImage(c2,0,0);x.globalAlpha=1;}
    orPost(T,b,rip);
    if(mix>0){const k=OR.k;m.globalAlpha=mix;orEye(m,OR_EW[0]*k,OR_EW[1]*k,8.5*k,.7*Math.sin((T-13.6)*1.1),.34,T,.95*mix);m.globalAlpha=1;
      const wx=orS(13.1,13.6,T);orWinds(m,110,263,150,T,false,0,[0,0]);orGhost(T,110,268,.25,1+2*(1-wx),0,true);orWinds(m,110,263,150*wx,T,true,0,[0,0]);}}
  else if(T<25)orShot45(T,dts);
  else{const u=T-25,a=Math.sin(Math.PI*orC(u/1.6,0,1));m.setTransform(OR.k,0,0,OR.k,0,0);m.globalCompositeOperation='lighter';
    if(a>.01){m.globalAlpha=a;const y=285-u*90,s=4+2*orN(T*9);m.drawImage(OR.warm,180+Math.sin(u*2)*5-s*2,y-s*2,s*4,s*4);m.globalAlpha=1;}m.globalCompositeOperation='source-over';}
  /* cinematic vignette; the heartbeat pulses it */
  const v=.5+.35*orHeart(T),k=OR.k;m.setTransform(k,0,0,k,0,0);const g=m.createRadialGradient(180,180,120,180,180,265);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+Math.min(.95,v)+')');m.fillStyle=g;m.fillRect(0,0,360,360);}

/* M (R x R) -> N x N LEDs: duty from the picture's sRGB, brightness, the current limit (12 mA per channel), then the page's gamma */
function orOut(N){const s=OR.smx;s.imageSmoothingEnabled=true;s.imageSmoothingQuality='high';s.clearRect(0,0,N,N);s.drawImage(OR.M,0,0,N,N);
  const d=s.getImageData(0,0,N,N).data,U=OR.U,lut=OR.lut,br=.85;let sum=0;   /* br: the film's own tone (a look constant); the brightness the person sets is General > Light (the master) */
  for(let i=0;i<N*N*4;i+=4)sum+=(lut[d[i]]+lut[d[i+1]]+lut[d[i+2]])*br;
  const amps=sum*.012,lim=HOUSE.val.supplyA*HOUSE.val.powerLimit,f=amps>lim?lim/amps:1,gs=1/(S.cgam||2.2);OR.amps=amps*f;
  for(let y=0;y<N;y++){const r0=(N-1-y)*N;for(let x=0;x<N;x++){const i=(y*N+x)*4,u=(r0+x)*4;
    U[u]=Math.pow(lut[d[i]]*br*f,gs);U[u+1]=Math.pow(lut[d[i+1]]*br*f,gs);U[u+2]=Math.pow(lut[d[i+2]]*br*f,gs);U[u+3]=1;}}
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,OR.tex);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,N,N,gl.RGBA,gl.FLOAT,U);gl.activeTexture(gl.TEXTURE0);}

function orShotName(T){let n='';for(const s of OR_SHOTS)if(T>=s[0])n=s[1];return n;}
function orStep(N,t,dts){if(!OR.M||OR.N!==N)orInit(N);
  if(!OR.active){OR.active=true;OR.T=0;OR.pause=false;}
  if(!OR.pause){OR.T+=dts*(S.orSpeed||1);if(OR.T>=OR_END){if(S.orLoop){OR.T-=OR_END;}else{OR.T=OR_END-.001;OR.pause=true;orSync();}}}
  orRender(OR.T,dts);orOut(N);
  if(S.tab==='ring'){const p=document.getElementById('orPrev');if(p){const c=p.getContext('2d');c.drawImage(OR.M,0,0,p.width,p.height);}
    if(frameN%6===0){const T=OR.T,o=document.getElementById('orNow');if(o)o.textContent=T.toFixed(1)+' s · '+orShotName(T)+' · ≈ '+OR.amps.toFixed(1)+' A';
      const r=document.getElementById('orTime');if(r&&document.activeElement!==r)r.value=T.toFixed(2);}}}
function orSync(){const g=document.getElementById('orGo');if(!g)return;g.setAttribute('aria-pressed',String(S.pat===58));g.textContent=S.pat===58?'■ Stop The One Ring':'▶ Play The One Ring on the mirror';
  const p=document.getElementById('orPause');p.setAttribute('aria-pressed',String(OR.pause));p.textContent=OR.pause?'▶ Go on':'Pause';
  document.getElementById('orLoopB').setAttribute('aria-pressed',String(!!S.orLoop));if(S.pat!==58)OR.active=false;}
{let before=DEF.pat;
 document.getElementById('orGo').addEventListener('click',()=>{if(S.pat===58)S.pat=before;else{before=S.pat;S.pat=58;}save();syncPat();orSync();});
 document.getElementById('orRe').addEventListener('click',()=>{OR.T=0;OR.pause=false;if(S.pat!==58){before=S.pat;S.pat=58;save();syncPat();}else OR.active=true;orSync();});
 document.getElementById('orPause').addEventListener('click',()=>{OR.pause=!OR.pause;orSync();});
 document.getElementById('orLoopB').addEventListener('click',()=>{S.orLoop=S.orLoop?0:1;save();orSync();});
 document.getElementById('orTime').addEventListener('input',e=>{OR.T=+e.target.value;OR.pause=true;orSync();});
 buildCtl('orCtl',[{k:'orSpeed',l:'Speed',min:.5,max:1.5,step:.05,f:v=>Math.abs(v-1)<.01?'as filmed (27 s)':Math.round(v*100)+' % ('+(27/v).toFixed(0)+' s)',tip:'Slower stretches the slow motion; 100 % = 27 seconds.'}]);}
return {step:orStep,sync:orSync,OR};}};

/* PUDE_logo.svg (Documents) flattened: per path [matrix to SVG user space, fill, opacity, evenodd, d]. 0-8 the cube, 9-14 its waving hand. */
window.INF_RING_LOGO=[[[5.795029,0,0,5.795029,-9473.901777,-6025.677799],"rgb(158,208,241)",1,1,"M2358,1260L2044.013,1375L1727,1260L2041,1145L2358,1260Z"],[[5.795029,0,0,5.795029,-10057.751551,-12115.408919],"rgb(115,186,231)",1,1,"M2141.841,2856.362L1828.841,2741.362L1827.841,2308.362L2141.841,2424.362L2141.841,2856.362Z"],[[5.795029,0,0,5.795029,-10055.035073,-12115.408919],"white",0.5,1,"M2023.516,2606.926C2026.284,2608.527 2027.957,2609.261 2027.957,2609.261C2028.141,2609.343 2028.33,2609.416 2028.521,2609.48L2029.689,2609.871L2028.616,2743.001C2028.331,2745.755 2027.362,2760.456 2037.039,2775.276C2043.883,2785.76 2056.117,2796.504 2078.286,2802.587C2078.813,2802.732 2079.358,2802.807 2079.905,2802.81C2079.905,2802.81 2101.439,2802.686 2099.608,2782.564L2100.661,2634.984L2134.087,2647.257L2134.625,2750.196L2134.625,2847.912L2039.538,2815.745L2033.152,2813.398C2025.539,2809.329 1986.702,2785.679 1986.682,2726.595L1987.731,2594.467L2023.516,2606.926ZM1972.864,2425.505L1972.667,2450.049L1972.269,2460.995C1969.875,2507.115 1930.607,2500.479 1930.607,2500.479L1875.36,2483.854L1874.481,2533.213C1860.895,2528.056 1849.015,2523.746 1842.721,2521.486L1834.603,2518.099L1833.265,2372.317L1833.146,2320.844C1834.176,2321.194 1837.396,2322.291 1842.117,2323.929L1904.571,2347.001C1913.394,2350.547 1921.527,2354.017 1927.89,2357.091C1963.554,2374.317 1971.294,2408.279 1972.864,2425.505ZM1878.077,2443.127C1878.077,2443.127 1880.872,2444.649 1882.605,2445.409C1897.045,2451.747 1923.362,2457.878 1923.362,2457.878C1923.362,2457.878 1939.529,2460.683 1939.664,2436.058C1939.787,2413.684 1935.163,2402.578 1911.588,2396.574L1879.888,2387.223C1879.888,2387.223 1872.213,2384.118 1869.925,2390.08L1870.831,2432.941C1870.831,2432.941 1870.772,2439.677 1878.077,2443.127ZM2100.073,2419.225L2134.077,2431.787L2134.625,2535.313L2134.625,2631.755L2028.848,2595.546C2017.087,2588.441 1984.701,2564.01 1984.682,2510.402L1985.744,2378.238L2028.385,2392.902L2027.292,2526.802C2027.002,2529.571 2026.024,2544.283 2035.826,2559.112C2042.749,2569.584 2055.121,2580.322 2077.541,2586.399C2078.063,2586.54 2078.601,2586.613 2079.142,2586.616C2079.142,2586.616 2100.857,2586.446 2099.011,2566.368L2100.073,2419.225ZM1928.89,2569.468C1977.908,2594.139 1974.175,2651.756 1974.175,2651.756L1973.269,2677.742C1970.875,2725.802 1931.607,2718.886 1931.607,2718.886L1876.36,2701.562L1875.454,2754.572L1840.214,2742.51L1834.115,2740.27L1833.747,2580.965L1833.792,2531.572C1833.792,2531.572 1915.659,2562.808 1928.89,2569.468ZM1924.362,2674.494C1924.362,2674.494 1940.529,2677.417 1940.664,2651.756C1940.787,2628.441 1936.163,2616.868 1912.588,2610.612L1880.888,2600.867C1880.888,2600.867 1873.213,2597.631 1870.925,2603.845L1871.831,2648.508C1871.831,2648.508 1871.82,2657.326 1878.749,2658.919C1879.47,2658.44 1924.362,2674.494 1924.362,2674.494Z"],[[5.795029,0,0,5.795029,-9473.056751,-6028.530008],"rgb(54,103,135)",1,0,"M2358,1260L2041,1376L2041,1808L2360,1692L2358,1260"],[[5.795029,0,0,5.795029,-9473.192616,-6031.880224],"white",0.5,0,"M2046.229,1618.374L2046.229,1598.558L2157.386,1556.087L2193.896,1593.575L2193.337,1699.054L2143.312,1763.441L2047.141,1797.989L2046.229,1618.374ZM2078.523,1636.158L2078.523,1742.764C2078.523,1742.764 2076.266,1760.364 2103.831,1744.738L2135.214,1731.906C2135.214,1731.906 2153.338,1719.616 2161.534,1696.37L2160.522,1622.326C2160.522,1622.326 2154.393,1594.408 2119.016,1607.519L2086.622,1621.351C2086.622,1621.351 2079.254,1623.348 2078.523,1636.158ZM2193.886,1379.217L2193.826,1391.068L2192.935,1482.918L2142.659,1548.066L2047.134,1582.614L2046.229,1403.135L2046.229,1383.183L2128.486,1351.542L2157.015,1341.102L2193.886,1379.217ZM2078.306,1420.783L2078.306,1527.389C2078.306,1527.389 2076.064,1544.989 2103.444,1529.363L2134.615,1516.531C2134.615,1516.531 2152.617,1504.241 2160.758,1480.995L2159.753,1406.951C2159.753,1406.951 2153.665,1379.033 2118.526,1392.144L2086.35,1405.976C2086.35,1405.976 2079.032,1407.973 2078.306,1420.783ZM2239.276,1597.927C2243.27,1609.261 2254.641,1610.775 2254.641,1610.775L2351.883,1576.217L2351.957,1612.011L2262.08,1639.657C2235.723,1648.391 2240.031,1669.648 2240.031,1669.648C2244.74,1687.076 2257.897,1683.617 2257.897,1683.617L2352.003,1652.021L2352.003,1689.16L2333.733,1695.804L2205.617,1740.739L2206.656,1544.559C2207.767,1544.467 2208.873,1544.225 2209.945,1543.829L2340.784,1495.541L2350.957,1491.921L2350.957,1531.51C2350.957,1531.51 2284.642,1558.397 2261.034,1564.094C2237.427,1569.79 2238.031,1586.709 2238.031,1586.709C2237.706,1591.241 2238.234,1594.929 2239.276,1597.927ZM2239.135,1381.389C2242.99,1395.734 2254.641,1395.348 2254.641,1395.348L2351.183,1359.247L2351.293,1383L2350.957,1396.649L2262.08,1425.74C2235.723,1434.93 2240.031,1457.297 2240.031,1457.297C2244.74,1475.636 2257.897,1471.996 2257.897,1471.996L2351.552,1438.909L2351.733,1478.176L2336.525,1483.789L2205.626,1530.366L2206.326,1391.16L2206.44,1379.394C2206.444,1378.982 2206.428,1378.571 2206.391,1378.163L2206.662,1324.31L2350.771,1270.354L2350.957,1310.512L2350.957,1311.942C2350.957,1311.942 2284.642,1340.234 2261.034,1346.228C2237.427,1352.222 2238.031,1370.025 2238.031,1370.025C2237.72,1374.574 2238.3,1378.282 2239.135,1381.389Z"],[[5.795029,0,0,5.795029,-1230.172007,-9934.847972],"black",1,1,"M401.06,2298.212C401.06,2298.212 356.167,2282.159 355.447,2282.638C348.518,2281.045 348.529,2272.227 348.529,2272.227L347.623,2227.564C349.91,2221.35 357.586,2224.586 357.586,2224.586L389.285,2234.331C412.861,2240.587 417.485,2252.16 417.362,2275.475C417.227,2301.135 401.06,2298.212 401.06,2298.212ZM361.011,2271.197C362.009,2271.91 363.687,2273.022 365.502,2273.852C377.21,2279.206 397.198,2284.369 402.618,2285.723C402.799,2285.542 403.199,2285.1 403.475,2284.466C404.402,2282.333 404.841,2279.388 404.862,2275.409C404.915,2265.436 404.79,2258.231 400.218,2253.296C397.252,2250.094 392.622,2248.149 386.079,2246.412C385.923,2246.371 385.767,2246.326 385.613,2246.279L360.348,2238.512L361.011,2271.197ZM656.117,2310.239C656.848,2297.429 664.216,2295.432 664.216,2295.432L696.61,2281.6C731.987,2268.488 738.116,2296.406 738.116,2296.406L739.128,2370.451C730.932,2393.697 712.807,2405.986 712.807,2405.986L681.425,2418.819C653.86,2434.445 656.117,2416.844 656.117,2416.844L656.117,2310.239ZM668.617,2411.058C670.622,2410.275 676.202,2407.45 676.694,2407.249L706.668,2394.992C709.807,2392.573 720.63,2383.437 726.597,2368.284L725.639,2298.258C725.102,2296.824 723.659,2293.861 720.448,2292.083C716.392,2289.838 710.324,2289.893 701.227,2293.22L669.539,2306.751C669.312,2307.357 668.763,2308.963 668.618,2310.66L668.617,2310.666L668.617,2411.058ZM655.899,2094.864C656.626,2082.054 663.944,2080.057 663.944,2080.057L696.12,2066.225C731.259,2053.113 737.347,2081.031 737.347,2081.031L738.352,2155.076C730.211,2178.322 712.209,2190.611 712.209,2190.611L681.038,2203.444C653.658,2219.07 655.899,2201.469 655.899,2201.469L655.899,2094.864ZM668.399,2195.64C670.353,2194.866 672.64,2193.844 674.841,2192.587C675.305,2192.323 675.785,2192.088 676.279,2191.885L706.036,2179.634C709.162,2177.208 719.901,2168.07 725.822,2152.923L724.87,2082.866C724.34,2081.43 722.912,2078.467 719.726,2076.691C715.724,2074.46 709.739,2074.53 700.764,2077.835L669.318,2091.353C669.09,2091.967 668.544,2093.578 668.4,2095.282L668.399,2095.288L668.399,2195.64ZM297.463,1996.108L296.99,1944.558C296.981,1943.521 297.1,1942.501 297.337,1941.515L297.323,1935.369L297.323,1935.346C297.326,1933.291 298.336,1931.388 299.995,1930.23C300.436,1929.922 300.916,1929.672 301.424,1929.486L615.424,1814.486C616.805,1813.98 618.321,1813.977 619.705,1814.479L936.705,1929.479L936.736,1929.491C937.803,1929.884 938.698,1930.539 939.377,1931.356C940.068,1932.187 940.534,1933.187 940.726,1934.255C940.796,1934.645 940.829,1935.044 940.824,1935.447L940.855,1942.158C940.984,1942.88 942.823,2367.325 942.823,2367.325C942.835,2369.964 941.189,2372.326 938.709,2373.228C938.709,2373.228 934.533,2374.992 933.734,2375.272L915.532,2381.656L619.709,2489.228C619.367,2489.352 619.019,2489.445 618.667,2489.508C617.612,2489.697 616.495,2489.617 615.418,2489.221L512.076,2451.252L506.558,2449.385C506.365,2449.32 506.176,2449.245 505.99,2449.162C505.99,2449.162 505.556,2448.969 504.764,2448.565L312.732,2378.01L306.253,2375.793C305.531,2375.546 304.842,2375.237 304.192,2374.873L302.418,2374.221C299.963,2373.319 298.329,2370.984 298.323,2368.369L298.321,2367.537C297.981,2366.395 297.8,2365.191 297.801,2363.955L297.945,2204.693L297.463,1996.108ZM770.857,2177.034L740.989,2219.328C742.825,2219.949 770.584,2249.837 770.584,2249.837C770.584,2249.837 770.699,2208.517 770.711,2206.12L770.857,2177.034ZM405.588,2193.186C392.357,2186.527 310.49,2155.291 310.49,2155.291L310.445,2204.683L310.813,2363.988L316.912,2366.229L352.152,2378.291L353.058,2325.281L408.305,2342.605C408.305,2342.605 447.573,2349.521 449.967,2301.461L450.873,2275.475C450.873,2275.475 454.606,2217.858 405.588,2193.186ZM500.214,2230.645L464.429,2218.186L463.38,2350.314C463.4,2409.398 502.236,2433.048 509.85,2437.117L516.236,2439.463L611.323,2471.631L611.323,2373.915L610.785,2270.976L577.359,2258.702L576.306,2406.283C578.137,2426.404 556.603,2426.529 556.603,2426.529C556.056,2426.526 555.511,2426.451 554.983,2426.306C532.815,2420.223 520.581,2409.478 513.737,2398.995C504.06,2384.175 505.029,2369.474 505.314,2366.72L506.387,2233.589L505.219,2233.199C505.028,2233.135 504.839,2233.062 504.655,2232.98C504.655,2232.98 502.982,2232.246 500.214,2230.645ZM816.729,2055.47C815.894,2052.363 815.314,2048.655 815.625,2044.105C815.625,2044.105 815.021,2026.303 838.628,2020.309C862.236,2014.315 928.551,1986.023 928.551,1986.023L928.551,1984.593L928.365,1944.435L784.256,1998.391L783.985,2052.244C784.022,2052.652 784.038,2053.063 784.034,2053.475L783.92,2065.24L783.219,2204.447L914.118,2157.87L929.327,2152.257L929.145,2112.99L835.491,2146.077C835.491,2146.077 822.334,2149.717 817.625,2131.378C817.625,2131.378 813.317,2109.01 839.674,2099.82L928.551,2070.729L928.887,2057.08L928.777,2033.328L832.235,2069.429C832.235,2069.429 820.583,2069.815 816.729,2055.47ZM449.989,1996.107L439.616,1992.275C443.74,1997.163 447.124,2002.274 449.898,2007.405L449.989,1996.107ZM929.087,2100.341L929.01,2083.732L843.649,2111.673C829.691,2116.61 829.791,2127.251 829.885,2128.827C830.839,2132.075 832.341,2133.455 832.756,2133.786L925.433,2101.044C926.624,2100.623 927.855,2100.391 929.087,2100.341ZM930.074,2312.611L930.005,2298.73L843.471,2325.649C830.04,2330.161 829.815,2339.575 829.866,2341.055C830.055,2346.604 834.399,2345.137 834.821,2345.409L925.618,2314.252C927.072,2313.764 930.074,2312.611 930.074,2312.611ZM741.229,2431.738L772.085,2420.518C771.184,2418.759 770.7,2416.787 770.711,2414.754L770.823,2393.648L741.229,2431.738ZM733.381,2002.321L916.316,1935.38L617.583,1827.007L321.677,1935.38L323.264,1935.966C337.093,1940.776 363.159,1950.019 385.271,1958.873L570.575,2027.329C571.297,2027.328 572.023,2027.451 572.72,2027.704L618.572,2044.333L701.687,2013.919L729.745,2003.126C730.93,2002.67 732.155,2002.405 733.381,2002.321ZM449.562,2049.224C447.992,2031.998 440.252,1998.035 404.588,1980.809C398.225,1977.736 390.092,1974.266 381.268,1970.72L318.815,1947.648C314.094,1946.009 310.874,1944.913 309.844,1944.563L309.963,1996.036L311.301,2141.818L319.419,2145.205C325.713,2147.464 337.593,2151.775 351.179,2156.932L352.058,2107.573L407.305,2124.197C407.305,2124.197 446.573,2130.834 448.967,2084.714L449.365,2073.767L449.562,2049.224ZM564.304,2038.338L517.547,2021.065L516.487,2150.958C516.485,2151.229 516.465,2151.498 516.428,2151.766C516.428,2151.766 514.905,2163.765 522.952,2175.938C528.561,2184.424 538.735,2192.789 556.663,2197.819C558.653,2197.696 563.849,2196.822 563.241,2191.026C563.217,2190.794 563.205,2190.562 563.207,2190.329L564.304,2038.338ZM363.572,2383.373L475.855,2424.627C462.99,2409.07 450.88,2385.16 450.88,2350.269L450.881,2350.219L450.979,2337.798C448.056,2341.59 444.805,2344.557 441.5,2346.901C425.394,2358.326 406.137,2354.915 406.137,2354.915C405.605,2354.822 405.08,2354.694 404.565,2354.532L365.27,2342.211L364.65,2378.504C364.621,2380.206 364.246,2381.859 363.572,2383.373ZM771.74,2001.595L747.454,2010.482L771.57,2035.412L771.74,2001.595ZM576.771,2042.944L575.709,2190.086C577.555,2210.165 555.84,2210.335 555.84,2210.335C555.299,2210.332 554.761,2210.259 554.238,2210.117C531.818,2204.041 519.447,2193.303 512.524,2182.831C502.722,2168.002 503.7,2153.289 503.99,2150.521L505.083,2016.62L462.442,2001.957L461.38,2134.121C461.399,2187.728 493.785,2212.16 505.545,2219.265L611.323,2255.474L611.323,2159.032L610.775,2055.506L576.771,2042.944ZM518.854,2237.755L517.811,2367.151C517.809,2367.418 517.789,2367.685 517.753,2367.949C517.753,2367.949 516.243,2379.969 524.203,2392.161C529.733,2400.631 539.759,2408.983 557.42,2414.007C559.373,2413.871 564.434,2412.966 563.837,2407.212C563.814,2406.983 564.898,2253.14 564.898,2253.14L518.854,2237.755ZM451.889,2223.206L451.999,2209.367C452.015,2207.352 453.001,2205.468 454.648,2204.308C456.295,2203.147 458.4,2202.851 460.303,2203.514L474.035,2208.295C461.059,2192.732 448.88,2168.859 448.88,2134.076L448.881,2134.025L448.984,2121.114C446.272,2124.284 443.311,2126.821 440.302,2128.869C424.322,2139.747 405.222,2136.523 405.222,2136.523C404.709,2136.436 404.202,2136.317 403.703,2136.167L364.262,2124.299L363.65,2158.665C363.632,2159.657 363.497,2160.632 363.254,2161.571C380.743,2168.377 399.119,2175.936 411.208,2182.021C431.81,2192.39 444.314,2207.819 451.889,2223.206ZM771.48,2053.297L734.609,2015.183L706.079,2025.622L623.823,2057.264L623.823,2077.216L624.728,2256.695L720.253,2222.147L770.529,2156.999L771.42,2065.148L771.48,2053.297ZM623.823,2292.455L624.735,2472.07L720.906,2437.522L770.931,2373.134L771.49,2267.656L734.98,2230.168L623.823,2272.639L623.823,2292.455ZM841.704,2032.424C830.083,2035.375 827.679,2046.856 827.904,2049.315C828.532,2056.166 833.269,2054.766 833.962,2055.186L925.099,2021.358C926.275,2020.917 927.495,2020.663 928.718,2020.589L928.62,1999.56C912.715,2006.236 861.892,2027.298 841.704,2032.424ZM828.119,2260.427C826.882,2264.742 828.243,2267.472 829.287,2269.242C830.012,2270.469 831.998,2272.243 835.864,2270.722L925.291,2238.52L929.723,2236.801L929.634,2218.626C915.309,2224.353 862.284,2245.325 841.56,2250.326C830.209,2253.065 828.119,2260.427 828.119,2260.427ZM816.87,2272.008C815.828,2269.009 815.299,2265.322 815.625,2260.79C815.625,2260.79 815.021,2243.871 838.628,2238.174C862.236,2232.478 928.551,2205.591 928.551,2205.591L928.551,2166.002L918.378,2169.622L787.539,2217.91C786.467,2218.305 785.361,2218.547 784.249,2218.64L783.211,2414.82L911.327,2369.884L929.597,2363.241L929.597,2326.102L835.491,2357.698C835.491,2357.698 822.334,2361.157 817.625,2343.729C817.625,2343.729 813.317,2322.472 839.674,2313.738L929.551,2286.092L929.477,2250.298L832.235,2284.856C832.235,2284.856 820.864,2283.342 816.87,2272.008ZM354.775,2066.845C354.775,2066.845 356.595,2067.705 354.775,2066.845C347.469,2063.396 347.529,2056.66 347.529,2056.66L346.623,2013.799C348.91,2007.836 356.586,2010.942 356.586,2010.942L388.285,2020.293C411.861,2026.297 416.485,2037.403 416.362,2059.777C416.227,2084.401 400.06,2081.597 400.06,2081.597C400.06,2081.597 373.743,2075.466 359.303,2069.128C357.57,2068.367 354.775,2066.845 354.775,2066.845ZM360.002,2055.262C361.007,2055.936 362.605,2056.926 364.327,2057.682C376.151,2062.871 396.405,2067.874 401.634,2069.125C401.836,2068.981 402.288,2068.614 402.552,2068.029C403.439,2066.071 403.842,2063.362 403.862,2059.708C403.907,2051.532 403.7,2045.303 400.713,2040.682C398.017,2036.511 392.975,2034.386 385.201,2032.406C385.049,2032.368 384.899,2032.326 384.749,2032.282L359.358,2024.792L360.002,2055.262Z"],[[3.871867,0,0,3.871867,-5550.823291,-3596.204437],"black",1,0,"M2041,1376L2041,1145L1727,1260L2041,1376L1727,1260L2041,1376Z"],[[-3.455605,0,0,3.713066,9437.50455,-3396.037645],"rgb(51,76,137)",1,0,"M2050.808,1380.904L2050.808,1140.096L1727,1260L2041,1376L1727,1260L2050.808,1380.904Z"],[[3.801197,-0.117772,0.065374,2.109976,-9777.795757,-1652.156745],"rgb(210,238,140)",1,1,"M3159.907,1758.801L3052.572,1682.184L3073.708,1660.5L2998.639,1605.959L3091.43,1605.959L3082.569,1544.979L3137.826,1572.25L3166.5,1484L3195.174,1572.25L3250.431,1544.979L3241.57,1605.959L3334.361,1605.959L3259.292,1660.5L3283.714,1685.555L3159.907,1758.801ZM3111.25,1764.928L3111.648,1765.219L3111.271,1765.457L3111.25,1764.928Z"],[[5.795029,0,0,5.795029,-17342.585794,-6331.486596],"rgb(237,1,82)",1,1,"M3368.807,1275.486C3355.309,1264.579 3331.083,1241.366 3332.701,1209.371C3334.211,1179.516 3318.362,1155.431 3324.977,1134.798C3327.12,1128.116 3362.58,1118.127 3362.144,1159.159C3362.034,1169.511 3366.254,1199.292 3386.279,1196.969C3447.194,1189.902 3442.226,1162.183 3481.95,1140.568C3484.897,1138.964 3500.416,1119.064 3512.023,1132.089C3521.326,1142.527 3503.097,1156.754 3501.321,1158.14C3481.628,1173.51 3483.128,1174.971 3463.594,1190.867C3492.479,1175.315 3530.339,1145.731 3569.351,1151.533C3570.78,1151.746 3590.557,1163.227 3562.864,1170.416C3541.647,1175.924 3540.602,1175.113 3488.438,1211.809C3527.816,1202.716 3530.917,1197.389 3542.643,1195.081C3544.314,1194.753 3591.606,1174.417 3588.652,1211.499C3569.33,1214.855 3547.433,1220.413 3501.892,1242.411C3484.12,1250.995 3507.849,1246.326 3527.604,1248.45C3567.918,1252.785 3568.377,1265.833 3565.062,1272.678C3560.786,1281.511 3503.505,1268.141 3479.631,1273.423C3450.577,1279.852 3443.585,1297.648 3431.641,1304.857L3431.641,1371.402L3397.947,1383.636L3368.807,1373.122L3368.807,1275.486Z"],[[11.764343,0,0,11.764343,-31849.840495,-18151.651887],"rgb(237,1,82)",1,0,"M2903.12,1621.828C2906.405,1610.359 2909.758,1612.95 2917.285,1609.235"],[[11.764343,0,0,11.764343,-31849.840495,-18151.651887],"black",1,1,"M2905.586,1622.535C2905.196,1623.896 2903.775,1624.685 2902.413,1624.295C2901.052,1623.905 2900.263,1622.483 2900.653,1621.122C2902.255,1615.528 2904.014,1612.891 2905.997,1611.305C2907.375,1610.204 2908.903,1609.585 2910.729,1608.987C2912.251,1608.489 2914.025,1607.983 2916.15,1606.934C2917.419,1606.307 2918.959,1606.829 2919.586,1608.099C2920.213,1609.369 2919.691,1610.908 2918.421,1611.535C2916.029,1612.716 2914.039,1613.303 2912.325,1613.864C2911.132,1614.255 2910.101,1614.593 2909.201,1615.313C2907.768,1616.459 2906.744,1618.493 2905.586,1622.535Z"],[[9.977875,0,0,9.375418,-26625.248739,-14353.436828],"rgb(237,1,82)",1,0,"M2924.534,1589.925C2934.291,1599.757 2941.053,1588.832 2947.327,1601.112C2951.758,1609.784 2958.222,1610.641 2957.208,1610.452"],[[9.977875,0,0,9.375418,-26625.248739,-14353.436828],"black",1,1,"M2956.667,1613.619C2956.52,1613.591 2956.391,1613.555 2956.278,1613.516L2956.307,1613.525C2956.424,1613.564 2956.544,1613.595 2956.667,1613.619ZM2953.364,1604.279C2955.764,1606.669 2957.928,1607.321 2957.928,1607.321L2957.913,1607.356L2958.263,1607.501C2957.865,1607.601 2957.46,1607.702 2957.048,1607.803C2955.638,1608.149 2954.195,1607.385 2953.605,1605.979C2953.375,1605.43 2953.3,1604.843 2953.364,1604.279ZM2953.364,1604.279C2955.764,1606.669 2957.928,1607.321 2957.928,1607.321L2957.913,1607.356L2958.263,1607.501C2957.865,1607.601 2957.46,1607.702 2957.048,1607.803C2955.638,1608.149 2954.195,1607.385 2953.605,1605.979C2953.375,1605.43 2953.3,1604.843 2953.364,1604.279Z"],[[5.795029,0,0,5.795029,-14149.524815,-6354.666712],"black",1,1,"M2982.413,1283.896L3059.115,1311.987C3061.575,1312.888 3063.212,1315.228 3063.216,1317.847C3063.219,1320.467 3061.589,1322.811 3059.131,1323.719L2849.337,1401.223C2848.634,1401.482 2847.9,1401.61 2847.171,1401.61C2847.054,1401.61 2846.938,1401.607 2846.821,1401.6C2846.705,1401.607 2846.588,1401.61 2846.472,1401.61C2845.742,1401.61 2845.009,1401.482 2844.306,1401.223L2634.511,1323.719C2632.054,1322.811 2630.423,1320.467 2630.427,1317.847C2630.431,1315.228 2632.068,1312.888 2634.528,1311.987L2788.65,1255.541C2781.12,1243.834 2775.669,1229.536 2776.5,1213.108C2777.38,1195.686 2772.084,1180.3 2769.176,1166.432C2766.983,1155.974 2766.107,1146.286 2769.018,1137.208C2769.44,1135.891 2770.333,1134.433 2771.826,1133.086C2773.9,1131.215 2777.478,1129.324 2781.829,1128.291C2788.707,1126.657 2797.46,1127.129 2804.471,1132.306C2811.089,1137.193 2816.53,1146.467 2816.352,1163.214C2816.292,1168.818 2817.558,1180.751 2822.548,1188.933C2825.177,1193.244 2828.967,1196.458 2834.679,1195.795C2869.379,1191.769 2881.588,1180.743 2893.928,1168.087C2902.869,1158.917 2911.921,1149.033 2928.258,1140.103C2928.526,1139.857 2930.12,1138.395 2931.478,1137.137C2934.746,1134.112 2939.32,1130.271 2944.242,1128.188C2951.029,1125.317 2958.401,1125.318 2964.912,1132.624C2970.29,1138.659 2969.683,1145.545 2966.396,1151.794C2963.68,1156.957 2958.982,1161.567 2956.032,1164.161C2957.157,1163.596 2958.287,1163.041 2959.422,1162.496C2978.32,1153.428 2998.583,1147.327 3019.117,1150.382C3019.778,1150.48 3023.185,1151.81 3026.2,1154.389C3029.342,1157.078 3031.848,1160.961 3031.728,1164.884C3031.654,1167.331 3030.735,1169.957 3028.118,1172.47C3025.635,1174.854 3021.077,1177.406 3013.173,1179.457C2996.468,1183.794 2992.59,1184.204 2965.11,1202.913C2978.597,1198.478 2982.662,1195.591 2990.355,1194.028L2990.475,1193.986C2993.342,1192.964 3005.008,1188.526 3016.163,1188.058C3024.93,1187.689 3033.279,1189.865 3038.282,1196.335C3041.554,1200.566 3043.57,1206.797 3042.844,1215.912C3042.655,1218.282 3040.886,1220.224 3038.543,1220.63C3020.899,1223.695 3001.087,1228.661 2962.526,1246.65C2967.188,1246.644 2972.296,1246.749 2977.161,1247.272C2994.44,1249.13 3004.842,1252.646 3010.929,1256.469C3016.737,1260.116 3019.22,1264.266 3020.119,1268.039C3021.085,1272.096 3020.208,1275.937 3018.75,1278.948C3017.885,1280.735 3016.247,1282.353 3013.592,1283.399C3010.412,1284.652 3004.947,1285.139 2998.086,1284.942C2993.466,1284.81 2988.112,1284.398 2982.413,1283.896ZM2798.693,1251.863C2801.081,1255.346 2803.661,1258.551 2806.264,1261.466C2806.524,1261.757 2806.784,1262.045 2807.045,1262.331C2817.99,1274.334 2829.223,1281.497 2830.369,1282.81C2832.259,1284.975 2832.036,1288.268 2829.871,1290.159C2827.891,1291.887 2824.97,1291.849 2823.038,1290.175C2822.893,1301.424 2822.708,1310.49 2822.561,1318.282C2822.119,1341.814 2822.023,1353.735 2824.398,1379.081L2847.421,1387.388L2874.467,1377.568C2872.115,1358.178 2871.426,1330.885 2871.223,1318.561L2871.2,1317.109C2867.38,1317.331 2862.997,1316.8 2857.79,1315.218C2855.039,1314.382 2853.485,1311.471 2854.321,1308.72C2855.156,1305.97 2858.068,1304.415 2860.818,1305.251C2865.991,1306.823 2869.983,1307.11 2873.353,1306.314C2878.556,1305.084 2882.157,1301.417 2886.298,1297.233C2893.871,1289.582 2902.564,1280.102 2919.512,1274.52C2921.992,1273.703 2924.65,1272.97 2927.506,1272.338C2932.811,1271.164 2939.735,1270.879 2947.366,1271.06C2964.213,1271.46 2984.5,1274.132 2998.385,1274.53C3002.222,1274.64 3005.509,1274.576 3007.981,1274.157C3008.547,1274.061 3009.264,1273.843 3009.679,1273.708C3010.048,1272.748 3010.266,1271.63 3009.986,1270.452C3009.565,1268.688 3008.106,1266.996 3005.39,1265.29C3000.115,1261.978 2991.02,1259.239 2976.048,1257.629C2965.037,1256.445 2952.787,1257.391 2947.244,1256.944C2944.373,1256.712 2942.491,1255.865 2941.615,1255.162L2940.772,1254.339L2939.998,1253.145L2939.444,1251.116L2939.518,1249.627L2939.874,1248.416L2941.315,1246.259C2942.299,1245.24 2944.567,1243.682 2948.627,1241.721C2991.62,1220.953 3013.879,1214.649 3032.564,1211.126C3032.43,1207.455 3031.583,1204.7 3030.042,1202.707C3027.056,1198.846 3021.833,1198.245 3016.6,1198.465C3005.299,1198.94 2993.458,1204.032 2992.648,1204.192C2981.169,1206.451 2977.984,1211.627 2940.703,1220.396L2942.009,1220.904L2943.342,1222.226L2944.124,1223.948L2944.229,1225.915L2943.542,1227.872L2942.696,1228.942L2941.564,1229.776L2940.232,1230.281L2939.126,1230.412L2937.955,1230.293C2937.876,1230.276 2937.663,1230.23 2937.335,1230.141C2937.205,1230.1 2937.078,1230.055 2936.953,1230.005C2937.053,1230.047 2937.163,1230.088 2937.284,1230.127C2934.56,1229.378 2924.52,1225.829 2917.297,1212.546C2915.369,1208.999 2913.537,1206.943 2911.491,1205.882C2908.071,1204.107 2904.415,1204.812 2900.424,1204.686C2894.062,1204.486 2887.044,1203.314 2879.047,1195.742C2878.595,1195.315 2878.237,1194.825 2877.973,1194.299C2868.095,1199.703 2855.118,1203.91 2835.88,1206.142C2825.57,1207.339 2818.4,1202.138 2813.654,1194.356C2807.583,1184.4 2805.863,1169.922 2805.936,1163.103C2806.063,1151.123 2803.017,1144.182 2798.283,1140.686C2793.945,1137.482 2788.491,1137.415 2784.236,1138.425C2782.023,1138.951 2779.369,1140.526 2778.783,1140.885C2775.985,1150.213 2778.334,1160.296 2780.991,1171.416C2784.043,1184.191 2787.685,1198.171 2786.903,1213.634C2786.146,1228.604 2791.567,1241.469 2798.693,1251.863ZM2938.51,1281.423C2935.274,1281.598 2932.319,1281.942 2929.756,1282.509C2910.115,1286.854 2901.322,1296.862 2893.702,1304.561C2889.721,1308.582 2885.946,1312.016 2881.579,1314.277L2881.592,1315.372C2881.709,1325.039 2882.208,1353.391 2884.51,1373.922L3038.861,1317.882L2938.51,1281.423ZM2796.544,1266.162L2654.782,1317.882L2813.581,1375.178C2811.545,1351.848 2811.74,1339.827 2812.194,1315.785C2812.359,1307.032 2812.559,1296.685 2812.698,1283.62C2812.704,1283.104 2812.784,1282.607 2812.929,1282.138C2808.685,1278.655 2803.532,1274.045 2798.494,1268.404C2797.841,1267.673 2797.191,1266.926 2796.544,1266.162ZM2932.267,1215.183C2932.44,1213.758 2933.199,1212.423 2934.441,1211.549C2987.742,1174.053 2988.876,1175.003 3010.556,1169.375C3015.222,1168.163 3018.327,1166.903 3020.238,1165.507C3020.67,1165.191 3021.122,1164.682 3021.281,1164.497C3021.216,1164.369 3021.072,1164.096 3020.965,1163.939C3020.649,1163.479 3020.251,1163.057 3019.838,1162.671C3018.902,1161.796 3017.481,1160.922 3016.918,1160.589C2998.67,1158.076 2980.73,1163.825 2963.928,1171.888C2947.324,1179.856 2931.812,1190.125 2918.164,1197.751C2920.99,1199.663 2923.783,1202.669 2926.448,1207.57C2928.242,1210.869 2930.301,1213.344 2932.267,1215.183ZM2886.74,1188.669C2893.529,1194.795 2899.363,1194.273 2904.543,1194.316C2905.512,1194.324 2906.466,1194.349 2907.406,1194.408C2907.527,1193.05 2908.177,1191.747 2909.307,1190.827C2928.882,1174.898 2927.382,1173.437 2947.117,1158.035C2948.047,1157.309 2954.201,1152.602 2957.177,1146.945C2958.441,1144.543 2959.203,1141.874 2957.135,1139.554C2953.447,1135.415 2949.113,1137.01 2945.491,1139.264C2941.826,1141.546 2938.669,1144.677 2936.628,1146.587C2935.223,1147.901 2934.091,1148.788 2933.439,1149.143C2918.125,1157.476 2909.737,1166.794 2901.386,1175.359C2896.799,1180.064 2892.234,1184.579 2886.74,1188.669Z"]];
