/* VJ runtime: everything a VJ clip needs, shared by the VJ Lab (VJ Lab/index.html) and the simulator's "VJ clips" tab (show-vj.js),
   so a clip plays the same in both.
   - VJ.analyse(audioBuffer): the song measured once, frame by frame (2048-point FFT, hop 512): 64 bands, the five bands, hits (kick,
     snare, hat) by peak picking with the Director's tuned rules, the release and tail of every hit, noisiness, brightness, stereo,
     chroma, melody, chords and key; then the tempo and the bar grid, per bar loudness, hits and repetition, the sections (intro,
     groove, breakdown, build, drop, outro) and the drop moments.
   - VJ.SOURCES (what in the music), VJ.TARGETS (what in the picture), styles (genres) and song clips that connect them in a patch matrix.
   - VJ.Player: per frame, at the song's time: sources → matrix → targets → the show (the Director) → the picture chain. */
(function(){'use strict';
const VJ={version:1,HOP:512,FFT:2048};
const vjVp=(k,d)=>{try{const v=typeof window!=='undefined'&&window.vpGet&&window.vpGet(57,k);return typeof v==='number'&&isFinite(v)?v:d;}catch(e){return d;}};   /* slider of pattern 57 (the sim), else the default (VJ Lab) */
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,dB=x=>4.342944819*Math.log(x+1e-14);
VJ.rng=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
VJ.hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function makeFFT(n){const lv=Math.log2(n),rev=new Uint32Array(n),co=new Float64Array(n/2),si=new Float64Array(n/2);
  for(let i=0;i<n;i++){let r=0;for(let b=0;b<lv;b++)r|=((i>>b)&1)<<(lv-1-b);rev[i]=r;}
  for(let i=0;i<n/2;i++){co[i]=Math.cos(2*Math.PI*i/n);si[i]=-Math.sin(2*Math.PI*i/n);}
  return(re,im)=>{for(let i=0;i<n;i++){const j=rev[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
    for(let size=2;size<=n;size<<=1){const h=size>>1,st=n/size;for(let i=0;i<n;i+=size)for(let j=0,k=0;j<h;j++,k+=st){
      const a=i+j,b=a+h,tr=re[b]*co[k]-im[b]*si[k],ti=re[b]*si[k]+im[b]*co[k];re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}};}
const pct=(arr,q,stride=1,off=0)=>{const v=[];for(let i=off;i<arr.length;i+=stride)v.push(arr[i]);v.sort((a,b)=>a-b);return v.length?v[Math.min(v.length-1,Math.floor(q*v.length))]:0;};
const BANDS=[[20,90],[90,200],[200,2500],[2500,5000],[5000,20000]],GRP=[0,0,1,1,2];
const ON={min:[6,5,5],gap:[.15,.08,.05],K:2.5,kickBelow:18,snareFlat:.25};   /* the Director's tuned onset rules (in dB) */
const KRUM=[[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17]];

/* ---------- analysis ---------- */
VJ.analyse=async function(buf,prog=()=>{}){
  const sr=buf.sampleRate,L=buf.getChannelData(0),R=buf.numberOfChannels>1?buf.getChannelData(1):L,len=L.length,n=VJ.FFT,hop=VJ.HOP;
  const F=Math.max(8,Math.floor((len-n)/hop)+1),fps=sr/hop,fft=makeFFT(n),win=new Float64Array(n),hz=sr/n,nrm=4/n;
  for(let i=0;i<n;i++)win[i]=.5-.5*Math.cos(2*Math.PI*i/(n-1));
  const rb=[];for(let i=0;i<64;i++){const f0=40*Math.pow(400,i/64),f1=40*Math.pow(400,(i+1)/64);let a=f0/hz,b=f1/hz;if(b-a<1){const m=(a+b)/2;a=m-.5;b=m+.5;}rb.push([Math.max(1,Math.floor(a)),Math.min(n/2-1,Math.ceil(b))]);}
  const bb=BANDS.map(([a,b])=>[Math.max(1,Math.round(a/hz)),Math.min(n/2-1,Math.max(1,Math.round(b/hz)))]);
  const fb=[Math.round(200/hz),Math.round(8000/hz)],mb=[Math.round(200/hz),Math.round(2000/hz)],cb=[Math.round(110/hz),Math.round(4000/hz)];
  const pcOf=new Int8Array(n/2).fill(-1);for(let k=cb[0];k<=cb[1];k++)pcOf[k]=((Math.round(12*Math.log2(k*hz/440))+69)%12+12)%12;
  const A={sr,hop,n,fps,F,dur:len/sr,raw:new Uint8Array(F*64),lev:new Float32Array(F*5),tot:new Float32Array(F),nz:new Float32Array(F),flat:new Float32Array(F),
    cent:new Float32Array(F),bal:new Float32Array(F),corr:new Float32Array(F),chroma:new Uint8Array(F*12),mel:new Float32Array(F),melC:new Float32Array(F)};
  const re=new Float64Array(n),im=new Float64Array(n),P=new Float64Array(n/2),ch=new Float64Array(12);
  for(let i=0;i<F;i++){const off=i*hop;
    for(let k=0;k<n;k++){re[k]=(L[off+k]+R[off+k])*.5*win[k];im[k]=0;}fft(re,im);
    for(let k=0;k<n/2;k++)P[k]=(re[k]*re[k]+im[k]*im[k])*nrm*nrm;
    for(let b=0;b<64;b++){const[a,c]=rb[b];let s=0;for(let k=a;k<=c;k++)s+=P[k];A.raw[i*64+b]=Math.round(255*clamp((dB(s/(c-a+1))+88)/66));}
    let tot=0;for(let b=0;b<5;b++){const[a,c]=bb[b];let s=0,lg=0;for(let k=a;k<=c;k++){s+=P[k];lg+=Math.log(P[k]+1e-14);}tot+=s;A.lev[i*5+b]=dB(s);
      if(b===3)A.nz[i]=Math.exp(lg/(c-a+1))/(s/(c-a+1)+1e-14);}
    A.tot[i]=dB(tot);
    {let lg=0,ar=0,cs=0,cw=0;for(let k=fb[0];k<=fb[1];k++){lg+=Math.log(P[k]+1e-14);ar+=P[k];}for(let k=1;k<n/2;k++){cs+=P[k]*k;cw+=P[k];}
      const m=fb[1]-fb[0]+1;A.flat[i]=clamp(Math.exp(lg/m)/(ar/m+1e-14));A.cent[i]=clamp(Math.log2(Math.max(40,cs/(cw+1e-14)*hz)/40)/Math.log2(500));}
    {let el=0,er=0,lr=0;const s0=off+n/2-hop/2;for(let k=s0;k<s0+hop;k++){el+=L[k]*L[k];er+=R[k]*R[k];lr+=L[k]*R[k];}
      A.bal[i]=el+er>1e-9?(er-el)/(er+el):0;A.corr[i]=el>1e-9&&er>1e-9?clamp(lr/Math.sqrt(el*er),-1,1):1;}
    ch.fill(0);let cm=0;for(let k=cb[0];k<=cb[1];k++)ch[pcOf[k]]+=Math.sqrt(P[k]);for(let c=0;c<12;c++)if(ch[c]>cm)cm=ch[c];for(let c=0;c<12;c++)A.chroma[i*12+c]=cm>0?Math.round(255*ch[c]/cm):0;
    {let bk=mb[0],bp=0,sum=0;for(let k=mb[0];k<=mb[1];k++){sum+=P[k];if(P[k]>bp){bp=P[k];bk=k;}}
      const a=P[bk-1]||0,c=P[bk+1]||0,d=a-2*bp+c,sh=d!==0?.5*(a-c)/d:0,f=(bk+sh)*hz;A.mel[i]=69+12*Math.log2(Math.max(20,f)/440);A.melC[i]=sum>0?bp/sum:0;}
    if(i%400===0){prog(.75*i/F);await new Promise(r=>setTimeout(r,0));}}
  prog(.78);
  /* hits: the rise of each band over the last 3 frames, gated like the Director's ears, then peak-picked with an adaptive threshold */
  const p98=[0,1,2,3,4].map(b=>pct(A.lev,.98,5,b)),songPk=pct(A.tot,.95),bandN=(i,b)=>clamp((A.lev[i*5+b]-(p98[b]-24))/24);A.p98=p98;A.songPk=songPk;
  const X=[new Float32Array(F),new Float32Array(F),new Float32Array(F)],env=new Float32Array(F);
  for(let i=3;i<F;i++){const r=[0,0,0,0,0];for(let b=0;b<5;b++){const l=A.lev[i*5+b];r[b]=Math.max(0,l-Math.min(A.lev[(i-1)*5+b],A.lev[(i-2)*5+b],A.lev[(i-3)*5+b]));}
    const sn=Math.min(r[2],r[3]);
    X[0][i]=bandN(i,0)>.3&&A.lev[i*5]>songPk-ON.kickBelow?r[0]:0;X[1][i]=bandN(i,3)>.3&&A.nz[i]>ON.snareFlat&&sn>r[0]?sn:0;X[2][i]=bandN(i,4)>.25?r[4]:0;
    env[i]=1.5*r[0]+sn+.6*r[4];}
  A.on=new Float32Array(F*3);const W=Math.round(.75*fps);
  for(let g=0;g<3;g++){const x=X[g],cs=new Float64Array(F+1),cd=new Float64Array(F+1);for(let i=0;i<F;i++)cs[i+1]=cs[i]+x[i];
    for(let i=0;i<F;i++){const a=Math.max(0,i-W),b=Math.min(F,i+W+1),m=(cs[b]-cs[a])/(b-a);cd[i+1]=cd[i]+Math.abs(x[i]-m);}
    let last=-1e9;for(let i=3;i<F-3;i++){const v=x[i];if(v<ON.min[g])continue;let mx=true;for(let k=-3;k<=3;k++)if(x[i+k]>v){mx=false;break;}if(!mx)continue;
      const a=Math.max(0,i-W),b=Math.min(F,i+W+1),m=(cs[b]-cs[a])/(b-a),dv=(cd[b]-cd[a])/(b-a);if(v<m+ON.K*dv)continue;
      if((i-last)/fps<ON.gap[g])continue;A.on[i*3+g]=Math.min(1,v/20);last=i;}}
  A.melOn=new Uint8Array(F);{let held=-99,cnt=0;for(let i=0;i<F;i++){const m=Math.round(A.mel[i]);if(A.melC[i]>.2&&m===held)cnt++;else if(A.melC[i]>.2){held=m;cnt=0;}else{held=-99;cnt=0;}if(cnt===2)A.melOn[i-2]=1;}}
  /* release (fall by 6 dB) and tail (12 dB) after every hit, as running values, and the reverb estimate */
  A.rel=new Float32Array(F*3);A.tail=new Float32Array(F);A.rev=new Float32Array(F);
  {const rel=[.2,.2,.12],rt=[null,null,null];let tail=.3,lo=0,hi=0,rev=0;const dt=1/fps;
    for(let i=0;i<F;i++){const gl=[Math.max(A.lev[i*5],A.lev[i*5+1]),Math.max(A.lev[i*5+2],A.lev[i*5+3]),A.lev[i*5+4]],t=i*dt;
      for(let g=0;g<3;g++){if(A.on[i*3+g])rt[g]={t0:t,pk:gl[g],r6:false};const r=rt[g];if(r){if(gl[g]>r.pk){r.pk=gl[g];r.t0=t;}const el=t-r.t0;
          if(!r.r6&&gl[g]<r.pk-6){r.r6=true;rel[g]+=(clamp(el,.08,.6)-rel[g])*.3;}
          if(gl[g]<r.pk-12||el>1.5){tail+=(Math.min(el,1.5)-tail)*.15;if(!r.r6)rel[g]+=(.6-rel[g])*.3;rt[g]=null;}}
        A.rel[i*3+g]=rel[g];}
      A.tail[i]=tail;const rms=clamp((A.tot[i]-(songPk-24))/24);lo=rms<lo?rms:lo+(rms-lo)*(1-Math.exp(-dt/1));hi=rms>hi?rms:hi*Math.exp(-dt/.6);
      rev+=(clamp(.5*lo/Math.max(.05,hi)+.5*(tail-.15)/.9)-rev)*(1-Math.exp(-dt/1));A.rev[i]=rev;}}
  prog(.85);await new Promise(r=>setTimeout(r,0));
  /* tempo: autocorrelation of the onset envelope (60-200 BPM, preferring ~125), then a comb over the whole song for the exact tempo and phase */
  {const e=new Float32Array(F),cs=new Float64Array(F+1);for(let i=0;i<F;i++)cs[i+1]=cs[i]+env[i];
    for(let i=0;i<F;i++){const a=Math.max(0,i-Math.round(fps/4)),b=Math.min(F,i+Math.round(fps/4)+1);e[i]=Math.max(0,env[i]-(cs[b]-cs[a])/(b-a));}
    const acf=lag=>{const l0=Math.floor(lag),f=lag-l0;let s=0;for(let i=0;i+l0+1<F;i++)s+=e[i]*(e[i+l0]*(1-f)+e[i+l0+1]*f);return s;};
    let best=120,bs=-1;for(let bpm=60;bpm<=200;bpm+=.25){const lag=fps*60/bpm,w=Math.exp(-.5*Math.pow(Math.log2(bpm/125)/.7,2)),s=(acf(lag)+.5*acf(2*lag))*w;if(s>bs){bs=s;best=bpm;}}
    const comb=(bpm,E)=>{const p=fps*60/bpm;let bp=0,bv=-1;for(let ph=0;ph<p;ph+=.5){let s=0;for(let x=ph;x<F-1;x+=p){const i=Math.floor(x),f=x-i;s+=E[i]*(1-f)+E[i+1]*f;}if(s>bv){bv=s;bp=ph;}}return[bv,bp];};
    let cb2=comb(best,e),bpm=best;for(let b=best-.6;b<=best+.6;b+=.05){const c=comb(b,e);if(c[0]>cb2[0]){cb2=c;bpm=b;}}
    /* the phase from the kicks, weighted by how loud they are (an off-beat bass note is a sub hit too, but quieter), the onsets only breaking ties */
    const ek=new Float32Array(F),w6=Math.round(.06*fps);   /* a kick's sweep starts above the sub, so take its loudest low end in the 60 ms after the hit */
    for(let i=0;i<F;i++){let k=0;if(A.on[i*3])for(let j=i;j<Math.min(F,i+w6+1);j++)k=Math.max(k,Math.pow(10,(A.lev[j*5]-p98[0])/20)+Math.pow(10,(A.lev[j*5+1]-p98[1])/20));ek[i]=2*k*k+.05*e[i];}
    const p=fps*60/bpm,ph=comb(bpm,ek)[1];
    /* bar 1: where the kick comes back after a gap (a drop lands on it), the snare backbeat on 2 and 4, and a little the kick itself */
    const nb=Math.floor((F-1-ph)/p)+1,kA=new Float32Array(nb),sA=new Float32Array(nb),kH=new Uint8Array(nb);
    for(let k=0;k<nb;k++){const i=Math.round(ph+k*p);for(let d=-2;d<=2;d++)if(i+d>=0&&i+d<F){kA[k]=Math.max(kA[k],ek[i+d]);sA[k]=Math.max(sA[k],A.on[(i+d)*3+1]);if(A.on[(i+d)*3])kH[k]=1;}}
    {let mx=1e-9;for(let k=0;k<nb;k++)mx=Math.max(mx,kA[k]);for(let k=0;k<nb;k++)kA[k]=kA[k]/mx*.5;}   /* loudness only nudges: the cues below decide */
    let dm=0,dv=-1e9;for(let m=0;m<4;m++){let s=0;for(let k=0;k<nb;k++){const r=((k-m)%4+4)%4;let gap=!!kH[k];for(let j=Math.max(0,k-8);j<k&&gap;j++)if(kH[j])gap=false;
        if(r===0)s+=kA[k]+(gap&&k>=8?6:0)-2*sA[k];else if(r===1||r===3)s+=2*sA[k];}if(s>dv){dv=s;dm=m;}}
    let t0=((ph+dm*p)*hop+n/2)/sr;const bar=4*60/bpm;while(t0-bar>=0)t0-=bar;A.grid={bpm:Math.round(bpm*100)/100,t0:Math.round(t0*1000)/1000};}
  prog(.9);await new Promise(r=>setTimeout(r,0));
  VJ.structure(A);prog(1);return A;};
/* bars, repetition, sections and moments for a grid (rerun after the tempo or the downbeat has been corrected) */
VJ.structure=function(A){const{bpm,t0}=A.grid,barS=4*60/bpm,fps=A.fps,first=-Math.ceil(t0/barS-1e-6),last=Math.ceil((A.dur-t0)/barS)-1;
  const fr=t=>Math.max(0,Math.min(A.F-1,Math.round((t*A.sr-A.n/2)/A.hop)));
  const p98=A.p98,bandN=(i,b)=>clamp((A.lev[i*5+b]-(p98[b]-24))/24),rmsN=i=>clamp((A.tot[i]-(A.songPk-24))/24);
  const bars=[];for(let b=first;b<=last;b++){const ta=t0+b*barS,i0=fr(ta),i1=Math.max(i0+1,fr(ta+barS));const v=new Float32Array(96),o=[0,0,0];let rms=0,sub=0,cent=0,flat=0,high=0;
    for(let i=i0;i<i1;i++){const s=Math.min(15,Math.floor(((i*A.hop+A.n/2)/A.sr-ta)/barS*16))*6;if(s<0)continue;
      for(let g=0;g<3;g++){const h=A.on[i*3+g];if(h){o[g]++;v[s+g]=Math.max(v[s+g],1);}}
      v[s+3]=Math.max(v[s+3],bandN(i,0));v[s+4]=Math.max(v[s+4],bandN(i,2));v[s+5]=Math.max(v[s+5],bandN(i,4));rms+=rmsN(i);sub+=bandN(i,0);cent+=A.cent[i];flat+=A.flat[i];high+=bandN(i,4);}
    const m=i1-i0;bars.push({b,v,kicks:o[0],snares:o[1],hats:o[2],rms:rms/m,sub:sub/m,cent:cent/m,flat:flat/m,high:high/m,rep:0});}
  const corr=(a,b)=>{let ma=0,mb=0;for(let i=0;i<a.length;i++){ma+=a[i];mb+=b[i];}ma/=a.length;mb/=b.length;let x=0,y=0,z=0;for(let i=0;i<a.length;i++){const p=a[i]-ma,q=b[i]-mb;x+=p*q;y+=p*p;z+=q*q;}return y*z>1e-9?x/Math.sqrt(y*z):0;};
  for(let k=2;k<bars.length;k++)bars[k].rep=Math.max(corr(bars[k].v,bars[k-1].v),corr(bars[k].v,bars[k-2].v));
  A.firstBar=first;A.lastBar=last;A.bars=bars;
  /* sections: where the bar features change most (novelty over 4-bar windows) and where the kick comes or goes, on 4-bar lines */
  const feat=k=>{const B=bars[k];return[B.rms,Math.min(1,B.kicks/4)*2,Math.min(1,B.snares/4),Math.min(1,B.hats/8),B.sub,B.cent,B.flat,B.high];};
  const Fs=bars.map((_,k)=>feat(k)),D=Fs[0].length,mu=new Array(D).fill(0),sd=new Array(D).fill(0);
  Fs.forEach(f=>f.forEach((v,d)=>mu[d]+=v/Fs.length));Fs.forEach(f=>f.forEach((v,d)=>sd[d]+=(v-mu[d])**2/Fs.length));sd.forEach((v,d)=>sd[d]=Math.max(.08,Math.sqrt(v)));   /* a steady song must not turn noise into sections */
  const meanF=(a,b)=>{const m=new Array(D).fill(0);let c=0;for(let k=Math.max(0,a);k<Math.min(bars.length,b);k++){Fs[k].forEach((v,d)=>m[d]+=(v-mu[d])/sd[d]);c++;}return c?m.map(v=>v/c):m;};
  const kpb=(a,b)=>{let s=0,c=0;for(let k=Math.max(0,a);k<Math.min(bars.length,b);k++){s+=bars[k].kicks;c++;}return c?s/c:0;};
  const nov=[];for(let k=4;k<=bars.length-4;k++){if((bars[k].b%4+4)%4)continue;const a=meanF(k-4,k),c=meanF(k,k+4);let d=0;for(let i=0;i<D;i++)d+=(a[i]-c[i])**2;
    const snr=(a,b)=>{let s=0,c=0;for(let q=Math.max(0,a);q<Math.min(bars.length,b);q++){s+=bars[q].snares;c++;}return c?s/c:0;};
    const sa=snr(k-4,k),sb=snr(k,k+4),flip=(kpb(k-4,k)<1.5)!==(kpb(k,k+4)<1.5),roll=Math.min(sa,sb)<.5&&Math.max(sa,sb)>=2;   /* the kick comes or goes, a snare roll starts or stops */
    nov.push({k,d:Math.sqrt(d)+(flip?3:0)+(roll?2:0),force:flip||roll});}
  const nm=nov.reduce((s,x)=>s+x.d,0)/Math.max(1,nov.length),ns=Math.sqrt(nov.reduce((s,x)=>s+(x.d-nm)**2,0)/Math.max(1,nov.length));
  let cut=nov.filter((x,i)=>x.force||x.d>Math.max(1.6,nm+.5*ns)&&nov.every(y=>Math.abs(y.k-x.k)>4||y.d<=x.d)).map(x=>x.k).sort((a,b)=>a-b);
  const bounds=[0];for(const k of cut)if(k-bounds[bounds.length-1]>=4&&bars.length-k>=4)bounds.push(k);bounds.push(bars.length);
  const secs=[];for(let s=0;s<bounds.length-1;s++){const a=bounds[s],b=bounds[s+1];let rms=0,sn=0,sn0=0,sn1=0;for(let k=a;k<b;k++){rms+=bars[k].rms;sn+=bars[k].snares;}const h=Math.floor((a+b)/2);
    for(let k=a;k<h;k++)sn0+=bars[k].snares+bars[k].hats*.3;for(let k=h;k<b;k++)sn1+=bars[k].snares+bars[k].hats*.3;
    secs.push({start:bars[a].b,end:bars[b-1].b+1,rms:rms/(b-a),kpb:kpb(a,b),rise:(sn1/Math.max(1,b-h))-(sn0/Math.max(1,h-a))});}
  const songBars=bars.length,beatless=kpb(0,songBars)<.5,late=s=>s.start-bars[0].b>=.75*songBars,avg=secs.reduce((a,x)=>a+x.rms,0)/secs.length;
  secs.forEach((s,i)=>{const nx=secs[i+1],pv=secs[i-1];
    if(beatless)s.label=i===0&&secs.length>1?'intro':late(s)&&s.rms<avg&&secs.length>1?'outro':'groove';   /* no beat anywhere (ambient): no breakdowns or drops to find */
    else if(s.kpb<1)s.label=i===0?'intro':i===secs.length-1&&late(s)?'outro':nx&&nx.kpb>=1.5&&s.rise>.5?'build':'breakdown';
    else if(nx&&nx.rms>s.rms+.08&&(s.rise>.3||nx.kpb>s.kpb+.5)&&s.end-s.start<=16)s.label='build';
    else if(pv&&(pv.label==='breakdown'||pv.label==='build'||pv.label==='intro'))s.label='drop';
    else s.label=i===secs.length-1&&late(s)&&s.rms<avg?'outro':'groove';});
  A.sections=secs.map(s=>({start:s.start,end:s.end,label:s.label}));
  /* a long stretch without kick before the kick comes back: if its last bars rise (a riser, a roll, getting brighter), they are the build */
  const bi=b=>b-first,lv=(a,b)=>{let s=0,c=0;for(let q=bi(a);q<bi(b);q++){s+=bars[q].rms+bars[q].high;c++;}return c?s/c:0;};
  for(let i=0;i<A.sections.length-1;i++){const s=A.sections[i],nx=A.sections[i+1],len=s.end-s.start;
    if(!(s.label==='breakdown'||s.label==='build')||len<12||kpb(bi(nx.start),bi(nx.end))<1.5)continue;
    const tail=Math.max(4,Math.min(8,Math.floor(len/8)*4)),cut=s.end-tail;
    if(lv(cut,s.end)>lv(s.start,cut)+.04){A.sections.splice(i,1,{start:s.start,end:cut,label:'breakdown'},{start:cut,end:s.end,label:'build'});i++;}}
  A.moments=A.sections.filter(s=>s.label==='drop').map(s=>({bar:s.start,beat:0,type:'drop',len:1}));
  /* key (Krumhansl profiles on the whole song) and a chord per beat (major and minor triads) */
  const tot=new Float64Array(12);for(let i=0;i<A.F;i++)for(let c=0;c<12;c++)tot[c]+=A.chroma[i*12+c];
  let kb=-1e9,key={root:0,minor:0};for(let m=0;m<2;m++)for(let r=0;r<12;r++){const pr=KRUM[m];let s=0;const mx=tot.reduce((a,b)=>a+b,0)/12,mp=pr.reduce((a,b)=>a+b,0)/12;let x=0,y=0;
    for(let c=0;c<12;c++){const p=tot[c]-mx,q=pr[(c-r+12)%12]-mp;s+=p*q;x+=p*p;y+=q*q;}s/=Math.sqrt(x*y)||1;if(s>kb){kb=s;key={root:r,minor:m};}}
  A.key=key;const per=60/bpm,k0=Math.ceil(-t0/per),nb=Math.floor((A.dur-t0)/per)-k0+1;A.chords={k0,root:new Int8Array(Math.max(0,nb)).fill(-1),minor:new Uint8Array(Math.max(0,nb))};
  for(let j=0;j<nb;j++){const ta=t0+(k0+j)*per,i0=fr(ta),i1=Math.max(i0+1,fr(ta+per)),c=new Float64Array(12);let e=0;for(let i=i0;i<i1;i++){for(let q=0;q<12;q++)c[q]+=A.chroma[i*12+q];e+=rmsN(i);}
    if(e/(i1-i0)<.15)continue;let bs=-1e9;for(let r=0;r<12;r++)for(let m=0;m<2;m++){const s=c[r]+c[(r+(m?3:4))%12]+c[(r+7)%12]-.5*(c[(r+(m?4:3))%12]);if(s>bs){bs=s;A.chords.root[j]=r;A.chords.minor[j]=m;}}}
  {const v=[];for(let i=0;i<A.F;i++)if(A.melC[i]>.2)v.push(A.mel[i]);v.sort((a,b)=>a-b);A.melLo=v.length?v[Math.floor(v.length*.05)]:48;A.melHi=v.length?v[Math.floor(v.length*.95)]:84;if(A.melHi-A.melLo<12)A.melHi=A.melLo+12;}
  return A;};

/* ---------- what in the music (sources) and what in the picture (targets) ---------- */
VJ.SOURCES=[
  ['kick','Kick','Rhythm','a kick drum hit, fading as fast as the kicks fade in this song'],['snare','Snare / clap','Rhythm','a snare or clap hit, with its own fade'],
  ['hat','Hi-hat','Rhythm','a hat hit, short'],['hit','Any hit','Rhythm','kick, snare or hat, whichever is strongest'],
  ['beat','Beat','Rhythm','a pulse on every beat of the grid'],['off','Off-beat','Rhythm','a pulse halfway between the beats'],['bar','Bar','Rhythm','a pulse on the first beat of every bar'],
  ['phrase','Phrase','Rhythm','a pulse every 16 bars'],['beatPh','Beat phase','Rhythm','0 → 1 through each beat (a saw)'],['barPh','Bar phase','Rhythm','0 → 1 through each bar'],
  ['phrasePh','Phrase phase','Rhythm','0 → 1 through 16 bars'],['dens','Hit density','Rhythm','how busy the drums are'],
  ['sub','Sub bass','Bands','20-90 Hz'],['low','Bass','Bands','90-200 Hz'],['mid','Mids','Bands','200 Hz - 2.5 kHz: synths, vocals'],['pres','Presence','Bands','2.5-5 kHz: attack, bite'],
  ['high','Highs','Bands','5-20 kHz: hats, air'],['loud','Loudness','Bands','the whole mix against the song\'s loud parts'],['rise','Getting louder','Bands','loudness climbing over the last bars'],
  ['note','Melody note','Harmony','a pulse on every new melody note'],['height','Melody height','Harmony','how high the melody is within the song\'s range'],['noteHue','Note colour','Harmony','the melody note round the circle of fifths, 0 → 1'],
  ['chord','Chord change','Harmony','a pulse when the chord changes'],['chordHue','Chord colour','Harmony','the chord round the circle of fifths, measured from the key'],
  ['minor','Minor chord','Harmony','1 on minor chords, 0 on major'],['tension','Harmonic tension','Harmony','how far the chord is from the key'],['keyHue','Key colour','Harmony','the song\'s key round the circle of fifths'],
  ['noise','Noisiness','Timbre','noise and distortion against pure tones'],['dist','Distortion','Timbre','only the clearly overdriven part'],['bright','Brightness','Timbre','the spectral centroid: dark → bright sound'],
  ['reverb','Reverb','Space','how long the sound rings after the hits'],['pan','Stereo position','Space','left 0 … right 1'],['width','Stereo width','Space','mono 0 … wide 1'],
  ['section','New section','Structure','a pulse when a section starts'],['secPos','Section position','Structure','0 → 1 through the section'],['build','Build','Structure','0 → 1 through a build'],
  ['brk','Breakdown','Structure','1 inside a breakdown'],['drop','Drop','Structure','a big pulse on a drop moment, fading over two bars'],['dropZone','In the drop','Structure','1 inside a drop section'],
  ['energy','Section energy','Structure','how loud this section is against the song\'s other sections'],['rep','Repetition','Structure','how much this bar repeats the last ones'],['song','Song position','Structure','0 → 1 through the whole song'],
  ['one','Always 1','Utility','a constant: use it to move a target from its base'],['lfo1','Slow wave (1 bar)','Utility','a sine over one bar'],['lfo4','Slow wave (4 bars)','Utility','a sine over four bars'],
  ['lfo16','Slow wave (16 bars)','Utility','a sine over sixteen bars'],['rnd','Random per beat','Utility','a new random value on every beat'],['drift','Drift','Utility','a slow random wander']
].map(([id,name,group,desc])=>({id,name,group,desc}));
VJ.TARGETS=[
  ['entropy','Entropy','Show',-1,1,0,'the show\'s own chaos: more sparks, faster, more layers'],['ghosts','Show ghosts','Show',0,1.5,1,'the show\'s own feedback trail'],
  ['next','Next scene','Show',0,1,0,'crossing the middle starts the next scene (at most once a beat)'],
  ['zoom','Zoom','Picture',.5,2,1,'scale the whole picture'],['rotate','Rotate','Picture',-180,180,0,'turn the picture (degrees)'],['spin','Spin','Picture',-90,90,0,'keep turning, degrees per beat'],
  ['shiftX','Shift sideways','Picture',-.5,.5,0,'move left or right'],['shiftY','Shift up/down','Picture',-.5,.5,0,'move up or down'],
  ['mirror','Mirror','Picture',0,1,0,'over the middle: left and right mirrored'],['kaleido','Kaleidoscope','Picture',0,1,0,'over the middle: four-way mirror'],['pixel','Big pixels','Picture',1,6,1,'blocks of LEDs'],
  ['echo','Echo tunnel','Tunnel',0,.95,0,'copies falling inwards on the beat grid'],['echoZoom','Echo depth','Tunnel',.6,.98,.85,'how much smaller each copy is'],['echoSpin','Echo twist','Tunnel',-30,30,0,'each copy turned (degrees)'],
  ['echoStep','Echo step','Tunnel',0,3,2,'how often a copy is made: a sixteenth, an eighth, a beat, two beats'],['echoPan','Echo follows stereo','Tunnel',0,1,0,'the tunnel\'s centre leans to where the sound is'],
  ['echoDuck','Kick ducks the echo','Tunnel',0,1,0,'every kick dims the copies for a moment, like a sidechain'],['breath','Breathing','Picture',0,.15,.03,'every lit LED breathes slowly at its own pace'],
  ['glitch','Glitch','Glitch',0,1,0,'torn rows, dropped lines, sliding blocks'],['split','Colour split','Glitch',0,1,0,'red and blue shifted apart'],
  ['tint','Colour','Colour',0,1,0,'mix the picture towards the style\'s palette'],['hue','Palette position','Colour',0,1,0,'where in the palette'],['sat','Saturation','Colour',0,1,1,'0 = all white'],
  ['invert','Invert','Light',0,1,0,'over the middle: negative'],['flash','Flash','Light',0,1,0,'white over everything (at most 3 flashes a second)'],['black','Blackout','Light',0,1,0,'darken everything'],
  ['bright','Brightness','Light',0,1.5,1,'the master'],['trails','Trails','Light',0,.97,0,'light lingers on'],['strobe','Strobe','Light',0,1,0,'over the middle: white flashes at 3 a second']
].map(([id,name,group,min,max,def,desc])=>({id,name,group,min,max,def,desc}));
VJ.SRC_IX={};VJ.SOURCES.forEach((s,i)=>VJ.SRC_IX[s.id]=i);VJ.TGT_IX={};VJ.TARGETS.forEach((t,i)=>VJ.TGT_IX[t.id]=i);
VJ.CURVES=[['lin','straight'],['in','soft start (squared)'],['out','quick start (root)'],['gate','gate: on above the threshold'],['inv','upside down'],['spring','spring: overshoots and wobbles back']];
VJ.MOMENTS=[['drop','Drop: a full white or black screen for ¼ beat, then the hit and a drop scene'],['white','Full white screen (¼ beat)'],['blackhit','Full black screen (¼ beat)'],['flash','One white frame'],
  ['black','Blackout'],['invert','Inverted'],['strobe','Strobe (3 a second)'],['shake','Shake'],['cut','Next scene now']];
VJ.LABELS=['intro','groove','breakdown','build','drop','outro'];
VJ.ENTERS=[['cut','Cut'],['flash','White frame'],['black','Black frame'],['flip','Inverted half beat'],['xfade','Dithered crossfade'],['flicker','Flicker fade'],['iris','Iris into a dot (before)'],['dissolve','Dissolve to black (before)']];
VJ.DIR_LAYERS=[['mirror','Mirror'],['kaleido','Kaleidoscope'],['rot','Turned 90°'],['invert','Inverted'],['glitch','Glitch'],['nofb','No feedback'],['cold','Cold tint'],['palette','Full colour'],['spasm','Spastic square']];
VJ.CANON=['void','portal','inversion','accumulation','puncture','perimeter','tracer'];
VJ.ROLE_FALLBACK={calm:['void','perimeter','tracer','heartbeat'],drop:['inversion','puncture','shatter','static','rings'],build:['portal','accumulation','rain','scanner','heartbeat','static'],flow:['portal','puncture','rings','ripple','rain','scanner','corridor']};

/* ---------- styles (genres) ---------- */
const P=(src,tgt,amt,o={})=>Object.assign({src,tgt,amt,curve:'lin',th:.5,att:0,rel:0},o);
VJ.PRESETS=[
  {name:'Minimal techno',engine:'director',freedom:.4,palette:['#ffffff','#9fe8ff','#6a7dff','#ffffff','#c9f4ff'],
    pool:{director:['void','portal','perimeter','tracer','rings','corridor','scanner','heartbeat'],lt:[]},base:{echo:.35,echoZoom:.86,tint:.25},
    patches:[P('kick','zoom',.06),P('kick','bright',.15),P('hat','glitch',.12,{curve:'gate',th:.6}),P('bar','echoSpin',.08),P('build','entropy',.8),P('brk','black',.25),P('drop','flash',.6),P('dist','glitch',.4)]},
  {name:'Melodic house',engine:'director',freedom:.6,palette:['#ff5a8a','#ffb23d','#ffe7a3','#7a5cff','#3dd6ff'],
    pool:{director:[],lt:[]},base:{tint:.5,sat:.9,echo:.2},
    patches:[P('noteHue','hue',.8),P('chordHue','hue',.2),P('kick','zoom',.04),P('note','bright',.12),P('reverb','echo',.5),P('build','entropy',.6),P('drop','flash',.5),P('lfo16','spin',.06)]},
  {name:'Ambient drift',engine:'director',freedom:.7,palette:['#bfe9ff','#7fa8ff','#ffffff','#a68bff','#d9f7ff'],
    pool:{director:['void','perimeter','tracer','heartbeat','portal','ripple'],lt:[]},base:{echo:.55,echoZoom:.9,trails:.6,tint:.3,bright:.85},
    patches:[P('reverb','echo',.4),P('sub','bright',.2),P('height','echoSpin',.2),P('lfo16','rotate',.1),P('note','next',0),P('loud','bright',.15)]},
  {name:'Hard rave',engine:'director',freedom:.3,palette:['#ffffff','#ff2a2a','#ffffff','#2a7dff','#ffffff'],
    pool:{director:['rings','static','shatter','puncture','ripple','rain','corridor','inversion'],lt:[]},base:{echo:.2},
    patches:[P('kick','flash',.25),P('kick','zoom',.12),P('snare','invert',1,{curve:'gate',th:.7}),P('build','glitch',.7),P('build','entropy',1),P('drop','strobe',1,{curve:'gate',th:.4}),P('dist','split',.6),P('bar','next',1,{curve:'gate',th:.5})]}];
VJ.newStyle=(from)=>{const p=from||VJ.PRESETS[0];return JSON.parse(JSON.stringify(Object.assign({id:'s'+Date.now().toString(36)+Math.floor(Math.random()*1e4),name:p.name,engine:'director',freedom:.4,
  palette:['#ffffff','#9fe8ff','#6a7dff','#ffffff','#c9f4ff'],pool:{director:[],lt:[]},base:{},patches:[],restBars:0,monotony:false,quantize:'bar'},p)));};
VJ.newClip=(A,style,songName)=>({version:1,name:(songName||'song').replace(/\.[^.]+$/,''),song:{name:songName||'',dur:A?A.dur:0},styleId:style?style.id:null,style:null,
  grid:A?Object.assign({},A.grid):{bpm:120,t0:0},sections:A?A.sections.map(s=>Object.assign({engine:'',scenes:[],freedom:null,base:{},patches:[],enter:'cut',enterBars:1,anticipate:null,loop:0,loopMax:3,callback:null,restraint:s.label==='breakdown',layers:{},seed:null},s)):[],moments:A?A.moments.map(m=>Object.assign({},m)):[]});
/* the patches a section really uses: the style's, with the section's overrides (same source and target) replacing or removing them */
VJ.patchesFor=(style,sec)=>{const m=new Map();for(const p of style.patches||[])m.set(p.src+'>'+p.tgt,p);if(sec)for(const p of sec.patches||[]){const k=p.src+'>'+p.tgt;if(p.off)m.delete(k);else m.set(k,p);}return[...m.values()];};
VJ.baseFor=(style,sec)=>{const b={};for(const t of VJ.TARGETS)b[t.id]=t.def;Object.assign(b,style.base||{});if(sec)Object.assign(b,sec.base||{});return b;};
/* a style's palette: its own hex list (a custom palette) or a house palette by index / name; the colours as 0..1 RGB */
const stylePal=p=>{if(Array.isArray(p))return LOOK.customPalette(p).c;if(typeof p==='string'&&!/^#/.test(p)){const i=LOOK.palettes.findIndex(q=>q.n.toLowerCase()===p.toLowerCase());return LOOK.palette(i<0?0:i).c;}if(typeof p==='number')return LOOK.palette(p).c;return LOOK.customPalette(['#ffffff']).c;};

/* ---------- the player ----------
   env: {shows:{director} (its hooks), S (settings), flash(t) (the flash gate), amps()}. The Director is steered only through its own switches: the scene picker (S.engScene), skip, the random generator, the Director's layer switches (ENG.force, like its keys 1-9), and the S knobs. The Director
   listens with its own ears to the playing song, as everywhere. */
VJ.Player=function(env){const PL={clip:null,style:null,A:null,N:0,sec:-1,lastT:-1,t:0,beat:0,bpm:120,src:new Float32Array(VJ.SOURCES.length),tv:{},pst:new Map(),
  env,eng:'director',pin:null,pinK:-1,spin:0,ev:{flash:0,blackTo:-1,invTo:-1,strobeTo:-1,shakeTo:-1,screen:null,screenTo:-1},rnd:0,drift:.5,driftV:0,R:VJ.rng(1),fbStep:-1,
  xf:null,loopK:-1,restUntil:-1e9,loudBars:0,lastBarSeen:null,mono:{t:0,low:0,prev:null},nextReq:false,hueMut:0,savedForce:null,
  st:{kick:0,snare:0,hat:0,note:0,chord:0,section:0,drop:0,beat:0,off:0,bar:0,phrase:0,brk:0,env5:new Float32Array(5),dens:0,rise:0,lastChord:-2,lastBeat:-1e9,rates:[0,0,0]}};
  const D=()=>env.shows.director;
  PL.load=(clip,style,A)=>{PL.clip=clip;PL.style=style;PL.A=A;PL.sec=-1;PL.lastT=-1;PL.pst.clear();
    if(A&&clip&&clip.grid&&(clip.grid.bpm!==A.grid.bpm||clip.grid.t0!==A.grid.t0)){A.grid=Object.assign({},clip.grid);VJ.structure(A);}};
  PL.barAt=t=>{const g=PL.clip.grid;return Math.floor((t-g.t0)*g.bpm/240);};
  PL.timeOfBar=b=>{const g=PL.clip.grid;return g.t0+b*240/g.bpm;};
  PL.secAt=t=>{const c=PL.clip;if(!c||!c.sections.length)return-1;const b=PL.barAt(t);for(let i=c.sections.length-1;i>=0;i--)if(b>=c.sections[i].start)return i;return 0;};
  /* the section as it plays: a callback borrows an earlier section's look (scenes, seed, base, matrix, layers) */
  function effSec(k){const s=PL.clip.sections[k];if(s.callback==null||s.callback<0||s.callback>=k)return s;const o=PL.clip.sections[s.callback];
    return Object.assign({},s,{engine:o.engine,scenes:o.scenes,seed:o.seed??((VJ.hash(PL.clip.name)+s.callback*7919)>>>0),base:Object.assign({},o.base,s.base),patches:(o.patches||[]).concat(s.patches||[]),layers:Object.assign({},o.layers,s.layers),freedom:o.freedom,callbackOf:s.callback});}
  const roleList=(eng,role)=>{const d=D(),o=d.ENG_ORDER.filter(id=>{const r=d.ENG_SCENE[id].role;return r&&r.includes(role);});
    return o.length?o:VJ.ROLE_FALLBACK[role].filter(id=>d.ENG_SCENE[id]);};
  const valid=(eng,id)=>!!(D()&&D().ENG_SCENE[id]);
  function pinScene(id){const S=env.S;PL.pinned=id;
    {const d=D();S.engScene=id?d.ENG_ORDER.indexOf(id)+1:0;d.ENG.skip=true;}}
  function setLayers(layers,restraint){if(PL.eng!=='director'||!D())return;const E=D().ENG;if(!PL.savedForce)PL.savedForce=Object.assign({},E.force);E.force={};
    for(const[m]of VJ.DIR_LAYERS){const v=(layers||{})[m];if(v==='on')E.force[m]=true;else if(v==='off')E.force[m]=false;}
    if(restraint)for(const m of['mirror','kaleido','rot','invert','glitch','palette','spasm'])E.force[m]=false;}
  function enterSection(k,seek){const c=PL.clip,s=effSec(k),st=PL.style,S=env.S,prev=PL.sec;PL.sec=k;PL.secRaw=c.sections[k];
    PL.eng='director';   /* clips and styles that name the deleted Love & Theft engine ('lt') play on the Director */
    const restNow=PL.restUntil>PL.barAt(PL.t);PL.restraint=!!s.restraint||restNow;
    const fr=s.freedom==null?(st.freedom??.4):s.freedom,seed=(s.seed??((VJ.hash(c.name)+k*7919)>>>0))>>>0;PL.freedom=fr;PL.seed=seed;
    let list=(s.scenes&&s.scenes.length?s.scenes:PL.restraint?roleList(PL.eng,'calm'):(st.pool&&st.pool[PL.eng])||[]).filter(id=>valid(PL.eng,id));
    PL.list=list;PL.pin=list.length&&(fr<vjVp('freedomLow',.34)||PL.restraint)?list.slice():null;PL.pinK=-1;PL.hueMut=s.callbackOf!=null?vjVp('hueCallback',.08):0;
    const R=(window.CONDUCTOR?CONDUCTOR.rng:VJ.rng)(fr<vjVp('freedomMid',.5)?seed:(Date.now()>>>0));D().ENG.R=R;
    setLayers(s.layers,PL.restraint);
    if(!PL.pin)pinScene(list.length&&fr<vjVp('freedomMid',.5)?pickScene(list,R,null):null);   /* living: the show's own director (within the list when there is one, see pickNext) */
    PL.base=VJ.baseFor(st,s);PL.patches=VJ.patchesFor(st,s);PL.st.section=1;PL.secStart=PL.timeOfBar(c.sections[k].start);PL.secEnd=PL.timeOfBar(c.sections[k].end);
    PL.pal=stylePal(st.palette);PL.loopK=-1;
    /* how the section starts (the iris and the dissolve already ran at the end of the one before) */
    if(!seek&&prev>=0){const en=s.enter||'cut',b=PL.beat,bars=s.enterBars||1;
      const e=LOOK.tr.enter(en,b,{bars});   /* one description of how a section starts, shared with the Director */
      if(e.flash){if(env.flash(PL.t))PL.ev.flash=1;}else if(e.screen){PL.ev.screen=e.screen;PL.ev.screenTo=b+.25;}else if(e.invert)PL.ev.invTo=e.until;
      else if(e.xfade&&PL.O)PL.xf={type:e.xfade,b0:b,b1:b+e.bars*4,snap:Float32Array.from(PL.O)};}}
  /* living sections with a scene list: the next scene comes from the list, picked just before the show's own scene ends */
  /* the choice is the conductor's (conductor.js): the section's scene list is the pool, the music's level decides which fits; the clip stays an input */
  function pickScene(list,R,cur){const d=D(),CD=window.CONDUCTOR;
    const rnd=()=>list[Math.floor(R()*list.length)];if(!CD||!d.ENG_SCENE)return rnd();
    const A=(window.MUSIC&&MUSIC.ear)||{},E=d.ENG||{},arc=E.arc!=null?E.arc:.5;
    const pool=list.map(id=>{const e=d.ENG_SCENE[id]||{};return{key:id,energy:e.energy,role:e.role,w:e.w,cover:e.cover};});
    const tgt=CD.want({plan:false,rest:0,brk:false,ix:0,I:A.I!=null?A.I:.5,energy:A.energy!=null?A.energy:.5,build:A.build||0,gen:!!A.gen,arc});
    const o=CD.choose(pool,{target:tgt,recent:cur?[cur]:[],phase:CD.phase(A,arc,0),parts:[],sparse:false,rng:R,filter:c=>list.length<2||c.key!==cur});
    return o?o.key:rnd();}
  function pickNext(){if(PL.pin||!PL.list.length||PL.freedom<.34)return;if(PL.eng==='director'){const E=D().ENG,sc=E.sc;if(!sc||E.tr)return;
      if(E.beat>=sc.b1-.3&&!PL.picked){PL.picked=true;const id=pickScene(PL.list,D().ENG.R,sc.def.id);env.S.engScene=D().ENG_ORDER.indexOf(id)+1;}
      if(E.beat<sc.b1-.3)PL.picked=false;}}
  /* sources at song time t (hits between the last frame and this one all count) */
  function sources(t,dts){const A=PL.A,c=PL.clip,v=PL.src,st=PL.st,X=Math.exp,I=VJ.SRC_IX,i=PL.i,g=c.grid,per=60/g.bpm;
    const i0=PL.lastI<0||PL.lastI>=i||i-PL.lastI>8?i:PL.lastI+1;PL.hits=[0,0,0];let melOn=0;
    for(let j=i0;j<=i;j++){for(let q=0;q<3;q++)PL.hits[q]=Math.max(PL.hits[q],A.on[j*3+q]);if(A.melOn[j])melOn=1;}
    const pulse=(k,hit,rel)=>{st[k]=hit?Math.max(1,st[k]):st[k]*X(-dts/Math.max(.02,rel));return st[k];};
    v[I.kick]=pulse('kick',PL.hits[0],A.rel[i*3]*1.5);v[I.snare]=pulse('snare',PL.hits[1],A.rel[i*3+1]*1.5);v[I.hat]=pulse('hat',PL.hits[2],A.rel[i*3+2]*1.2);
    v[I.hit]=Math.max(v[I.kick],v[I.snare],v[I.hat]);
    const bt=PL.beat,bi=Math.floor(bt);v[I.beat]=pulse('beat',bi!==Math.floor(st.lastBeat),per*.4);v[I.off]=pulse('off',Math.floor(bt-.5)!==Math.floor(st.lastBeat-.5),per*.3);
    v[I.bar]=pulse('bar',Math.floor(bt/4)!==Math.floor(st.lastBeat/4),per);v[I.phrase]=pulse('phrase',Math.floor(bt/64)!==Math.floor(st.lastBeat/64),per*4);
    st.lastBeat=bt;v[I.beatPh]=bt-bi;v[I.barPh]=(bt/4)-Math.floor(bt/4);v[I.phrasePh]=(bt/64)-Math.floor(bt/64);
    st.dens+=((PL.hits[0]+PL.hits[1]+PL.hits[2]>0?1/dts:0)*per/6-st.dens)*(1-X(-dts/(per*4)));v[I.dens]=clamp(st.dens);
    const relB=[A.rel[i*3],A.rel[i*3],A.rel[i*3+1],A.rel[i*3+1],A.rel[i*3+2]],bn=['sub','low','mid','pres','high'];
    for(let b=0;b<5;b++){const x=clamp((A.lev[i*5+b]-(A.p98[b]-24))/24);st.env5[b]=x>st.env5[b]?x:st.env5[b]*X(-dts/relB[b]);v[I[bn[b]]]=st.env5[b];}
    const loud=clamp((A.tot[i]-(A.songPk-24))/24);v[I.loud]=loud;const ib=Math.max(0,i-Math.round(A.fps*per*8));st.rise+=(clamp((loud-clamp((A.tot[ib]-(A.songPk-24))/24))*3)-st.rise)*(1-X(-dts/.5));v[I.rise]=st.rise;
    v[I.note]=pulse('note',melOn,.3);v[I.height]=A.melC[i]>.15?clamp((A.mel[i]-A.melLo)/(A.melHi-A.melLo)):v[I.height];
    {const pc=((Math.round(A.mel[i])%12)+12)%12;if(A.melC[i]>.15)v[I.noteHue]=((pc*7)%12)/12;}
    const ch=A.chords,kb=Math.floor((t-g.t0)/per)-ch.k0,root=kb>=0&&kb<ch.root.length?ch.root[kb]:-1,mn=kb>=0&&kb<ch.minor.length?ch.minor[kb]:0,kr=A.key.root;
    const cid=root<0?-1:root*2+mn;v[I.chord]=pulse('chord',cid>=0&&cid!==st.lastChord&&st.lastChord!==-2,per);if(cid>=0)st.lastChord=cid;else if(st.lastChord===-2)st.lastChord=-1;
    if(root>=0){const f=(((root-kr)*7)%12+12)%12;v[I.chordHue]=f/12;v[I.minor]+=(mn-v[I.minor])*(1-X(-dts/.2));v[I.tension]=Math.min(f,12-f)/6;}
    v[I.keyHue]=((kr*7)%12)/12;
    v[I.noise]=clamp((A.flat[i]-.02)/.25);v[I.dist]=clamp((A.flat[i]-.12)*3);v[I.bright]=A.cent[i];v[I.reverb]=A.rev[i];v[I.pan]=(A.bal[i]+1)/2;v[I.width]=clamp(1-A.corr[i]);
    const s=c.sections[PL.sec],secLen=Math.max(1e-3,PL.secEnd-PL.secStart),sp=clamp((t-PL.secStart)/secLen);
    v[I.section]=pulse('section',st.section,per*vjVp('secFade',4));st.section=0;v[I.secPos]=sp;v[I.build]=s&&s.label==='build'?sp:0;
    st.brk+=((s&&s.label==='breakdown'?1:0)-st.brk)*(1-X(-dts/.5));v[I.brk]=st.brk;v[I.dropZone]=s&&s.label==='drop'?1:0;
    v[I.drop]=pulse('drop',PL.dropHit,per*vjVp('dropFade',8));PL.dropHit=0;
    if(!PL.secE||PL.secE.k!==PL.sec){let mx=1e-3,mn2=1;const e=c.sections.map(x=>{const a=Math.max(0,x.start-A.firstBar),b=Math.min(A.bars.length,x.end-A.firstBar);let r=0;for(let q=a;q<b;q++)r+=A.bars[q].rms;return b>a?r/(b-a):0;});
      e.forEach(x=>{mx=Math.max(mx,x);mn2=Math.min(mn2,x);});PL.secE={k:PL.sec,v:clamp((e[PL.sec]-mn2)/Math.max(1e-3,mx-mn2))};}
    v[I.energy]=PL.secE.v;const bk=Math.floor((t-g.t0)/(4*per))-A.firstBar;v[I.rep]=bk>=0&&bk<A.bars.length?clamp(A.bars[bk].rep):0;v[I.song]=clamp(t/A.dur);
    v[I.one]=1;v[I.lfo1]=.5-.5*Math.cos(2*Math.PI*bt/4);v[I.lfo4]=.5-.5*Math.cos(2*Math.PI*bt/16);v[I.lfo16]=.5-.5*Math.cos(2*Math.PI*bt/64);
    if(bi!==PL.rndB){PL.rndB=bi;PL.rnd=PL.R();}v[I.rnd]=PL.rnd;PL.driftV+=(PL.R()-.5)*dts*.6-PL.driftV*dts*.5;PL.drift=clamp(PL.drift+PL.driftV*dts);v[I.drift]=PL.drift;}
  /* the matrix: base + Σ amount × curve(source); each patch smoothed with its own attack and release, or sprung (3.5 Hz, ζ .4, like the Director's springs) */
  function targets(dts){const v=PL.src,out=Object.assign({},PL.base),X=Math.exp,w=2*Math.PI*3.5;
    for(const p of PL.patches){const si=VJ.SRC_IX[p.src],T=VJ.TARGETS[VJ.TGT_IX[p.tgt]];if(si==null||!T)continue;let s=v[si];const k=p.src+'>'+p.tgt;
      s=p.curve==='in'?s*s:p.curve==='out'?Math.sqrt(s):p.curve==='gate'?(s>(p.th??.5)?1:0):p.curve==='inv'?1-s:s;let y;
      if(p.curve==='spring'){const q=PL.pst.get(k)||{y:s,v:0};const n=Math.max(1,Math.ceil(dts/.004)),h=dts/n;for(let j=0;j<n;j++){q.v+=(w*w*(s-q.y)-2*.4*w*q.v)*h;q.y+=q.v*h;}PL.pst.set(k,q);y=q.y;}
      else{y=PL.pst.get(k)??s;if(typeof y!=='number')y=s;const tau=s>y?(p.att||0):(p.rel||0);y=tau>0?y+(s-y)*(1-X(-dts/tau)):s;PL.pst.set(k,y);}
      out[p.tgt]+=p.amt*y*(T.max-T.min);}
    if(PL.restraint){const m=Math.max(0,vjVp('calm',.9)/.9),m1=Math.min(m,1);   /* m=1 at calm .9 (exact old numbers); lower = the breakdown keeps more of its motion, higher = even stiller */
      out.entropy+=(Math.min(out.entropy,-.8)-out.entropy)*m1;out.echo*=Math.pow(.3,m);out.glitch*=1-m1;out.split*=1-m1;out.bright*=Math.pow(.75,m);out.strobe*=1-m1;out.flash+=(Math.min(out.flash,.2)-out.flash)*m1;}   /* restraint: 90 % of the motion goes */
    out.hue=(out.hue+PL.hueMut)%1;
    for(const T of VJ.TARGETS)out[T.id]=Math.max(T.min,Math.min(T.max,out[T.id]));PL.tv=out;return out;}
  /* moments on the beat grid */
  function moments(t0,t1){const c=PL.clip,g=c.grid;if(t1<t0||t1-t0>.5)return;
    for(const m of c.moments){const tm=g.t0+(m.bar*4+(m.beat||0))*60/g.bpm;if(tm<=t0||tm>t1)continue;const b1=PL.beat+(m.len||1)*4;
      if(m.type==='drop')drop(m);else if(m.type==='white'||m.type==='blackhit'){PL.ev.screen=m.type==='white'&&env.flash(t1)?'white':'black';PL.ev.screenTo=PL.beat+.25;}
      else if(m.type==='flash'){if(env.flash(t1))PL.ev.flash=1;}else if(m.type==='black')PL.ev.blackTo=b1;else if(m.type==='invert')PL.ev.invTo=b1;
      else if(m.type==='strobe')PL.ev.strobeTo=b1;else if(m.type==='shake')PL.ev.shakeTo=PL.beat+Math.min(4,(m.len||1)*4);else if(m.type==='cut')skip();}}
  /* a drop, as the Director does it: a full white or black screen for a quarter beat, then the hit, then a drop scene */
  function drop(m){const prev=PL.clip.sections[PL.sec-1],white=m.screen?m.screen==='white':!(prev&&prev.label==='breakdown');
    PL.ev.screen=white&&env.flash(PL.t)?'white':'black';PL.ev.screenTo=PL.beat+.25;PL.dropHit=1;PL.ev.after='flash';
    const s=PL.clip.sections[PL.sec],own=s&&s.scenes&&s.scenes.length?s.scenes:null,l=(own||roleList(PL.eng,'drop')).filter(id=>valid(PL.eng,id));
    if(l.length&&!PL.pin)pinScene(l[Math.floor(PL.R()*l.length)]);else skip();}
  function skip(){D().ENG.skip=true;}
  /* one frame: songT is the song's time (audio.currentTime); returns the picture (row 0 at the top, code values 0..1) */
  PL.frame=(N,t,dts,songT)=>{const c=PL.clip,A=PL.A,S=env.S;if(!c||!A)return null;
    if(PL.N!==N){PL.N=N;for(const k of['W','O','F','T','prev','D'])PL[k]=new Float32Array(N*N*3);PL.U=new Float32Array(N*N*4);PL.rank=new Float32Array(N*N);{const rr=VJ.rng(11);for(let i=0;i<N*N;i++)PL.rank[i]=rr();}PL.ph=new Float32Array(N*N);PL.hz=new Float32Array(N*N);
      const r=VJ.rng(7);for(let i=0;i<N*N;i++){PL.ph[i]=r()*6.283;PL.hz[i]=6.283*(.06+.16*r());}}
    PL.t=songT;PL.i=Math.max(0,Math.min(A.F-1,Math.round((songT*A.sr-A.n/2)/A.hop)));PL.bpm=c.grid.bpm;const pb=PL.beat;PL.beat=(songT-c.grid.t0)*c.grid.bpm/60;
    const seek=PL.lastT<0||songT<PL.lastT-.05||songT-PL.lastT>.6;if(seek){PL.lastI=-1;PL.xf=null;}
    const bar=Math.floor(PL.beat/4),barTick=Math.floor(pb/4)!==bar;
    if(barTick&&!seek){const s=c.sections[PL.sec];PL.loudBars=s&&(s.label==='drop'||s.label==='groove')?PL.loudBars+1:0;   /* a rest after a long loud stretch */
      const rb=PL.style.restBars||0;if(rb&&PL.loudBars>=rb){PL.loudBars=0;PL.restUntil=bar+vjVp('restLen',8);PL.sec=-1;}}
    const k=PL.secAt(songT);if(k!==PL.sec||seek){if(k>=0)enterSection(k,seek);}
    const sec=c.sections[PL.sec];
    if(PL.pin){const share=Math.max(1,Math.floor((sec.end-sec.start)/PL.pin.length)),q=Math.min(PL.pin.length-1,Math.floor((bar-sec.start)/share));if(q!==PL.pinK){PL.pinK=q;pinScene(PL.pin[q]);}}
    /* a loop: every N bars the section's look starts again from the same seed, each time with one layer flipped */
    if(sec&&sec.loop>0){const lk=Math.floor((bar-sec.start)/sec.loop);if(lk!==PL.loopK){const first=PL.loopK<0;PL.loopK=lk;
      if(!first&&lk<=(sec.loopMax||3)){const R=VJ.rng(PL.seed);if(PL.eng==='director'){D().ENG.R=R;const E=D().ENG,m=VJ.DIR_LAYERS[lk%4][0];E.force[m]=!E.force[m];}PL.hueMut=(PL.hueMut+vjVp('hueRepeat',.06))%1;skip();}}}
    pickNext();sources(songT,dts);if(!seek)moments(PL.lastT,songT);
    const tv=targets(dts);PL.lastT=songT;PL.lastI=PL.i;
    /* scene changes asked by the matrix land on the next bar line (beat, if the style says so), like the Director's own */
    if(tv.next>.5&&!PL.nextOn)PL.nextReq=true;PL.nextOn=tv.next>.5;
    if(PL.nextReq&&(PL.style.quantize==='beat'?Math.floor(pb)!==Math.floor(PL.beat):barTick)){PL.nextReq=false;skip();}
    S.engEnt=Math.max(-.5,Math.min(.5,tv.entropy/2));S.engFb=Math.min(1,tv.ghosts);S.engHw=0;
    D().ENG.rawOut=true;D().step(N,t,dts);   /* the Director draws and echoes; the one finishing chain (LOOK.post) is run below, with the clip's looks in front of it */
    const W=PL.W;W.set(D().ENG.out);
    post(W,N,dts,tv,t,songT);return W;};
  /* the picture chain, on code values: geometry, echo tunnel, glitch, colour, fades, light, breathing, trails, then white cap and the power limit */
  function post(W,N,dts,tv,t,songT){const T=PL.T,O=PL.O,F=PL.F,c=(N-1)/2,R=PL.R,c0=PL.clip,secs=c0.sections;T.set(W);
    /* anticipation: the last beat before the next section pulls in 8 % and dims (the Director's trick) */
    const nx=secs[PL.sec+1],tNext=nx?PL.timeOfBar(nx.start):1e9,bLeft=(tNext-songT)*PL.bpm/60,ant=nx&&(nx.anticipate||(nx.anticipate==null&&nx.label==='drop'))&&bLeft<1&&bLeft>0;
    const shake=PL.beat<PL.ev.shakeTo||PL.mono.shake>songT?2:0;
    PL.spin=(PL.spin+tv.spin*PL.bpm/60*dts)%360;const ang=(tv.rotate+PL.spin)*Math.PI/180,ca=Math.cos(ang),sa=Math.sin(ang),z=tv.zoom,px=Math.round(tv.pixel),mir=tv.mirror>.5,kal=tv.kaleido>.5;
    const sx0=tv.shiftX*N+(shake?(R()-.5)*2*shake:0),sy0=tv.shiftY*N+(shake?(R()-.5)*2*shake:0),ident=Math.abs(z-1)<1e-3&&Math.abs(ang)<1e-4&&!sx0&&!sy0&&px<=1&&!mir&&!kal;
    if(!ident)for(let y=0;y<N;y++)for(let x=0;x<N;x++){let X=x,Y=y;if(kal){X=Math.min(X,N-1-X);Y=Math.min(Y,N-1-Y);}else if(mir)X=Math.min(X,N-1-X);
      if(px>1){X=Math.floor(X/px)*px+(px>>1);Y=Math.floor(Y/px)*px+(px>>1);}
      const dx=(X-c-sx0)/z,dy=(Y-c-sy0)/z,u=Math.round(c+dx*ca+dy*sa),v=Math.round(c-dx*sa+dy*ca),j=(y*N+x)*3;
      if(u<0||v<0||u>=N||v>=N){W[j]=W[j+1]=W[j+2]=0;}else{const q=(v*N+u)*3;W[j]=T[q];W[j+1]=T[q+1];W[j+2]=T[q+2];}}
    /* the echo tunnel: stepped on the beat grid, nearest LED (lines stay one LED thin), centre leaning to the stereo side, ducked by kicks */
    if(tv.echo>.01){const step=[.25,.5,1,2][Math.round(tv.echoStep)],st=Math.floor(PL.beat/step);
      if(st!==PL.fbStep){PL.fbStep=st;F.fill(0);const ez=tv.echoZoom,ea=tv.echoSpin*Math.PI/180,ec=Math.cos(ea),es=Math.sin(ea),cx=c+tv.echoPan*PL.A.bal[PL.i]*N*.3;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3;if(O[j]+O[j+1]+O[j+2]<.004)continue;const dx=x-cx,dy=y-c,u=Math.round(cx+(dx*ec-dy*es)*ez),v=Math.round(c+(dx*es+dy*ec)*ez);
          if(u<0||v<0||u>=N||v>=N)continue;const q=(v*N+u)*3;for(let h=0;h<3;h++){const a=O[j+h]*tv.echo;if(a>F[q+h])F[q+h]=a;}}}
      const duck=1-tv.echoDuck*PL.src[VJ.SRC_IX.kick];for(let j=0;j<W.length;j++)W[j]=W[j]+F[j]*duck*(1-W[j]);}
    if(tv.glitch>.02){const g=tv.glitch;T.set(W);for(let y=0;y<N;y++)if(R()<g*vjVp('glitch',.15)){const s=(R()<.5?-1:1)*(1+Math.floor(R()*4*g));for(let x=0;x<N;x++){const sx=Math.max(0,Math.min(N-1,x-s)),j=(y*N+x)*3,a=(y*N+sx)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}
      T.set(W);for(let x=0;x<N;x++)if(R()<g*.06){const s=R()<.5?-1:1;for(let y=0;y<N;y++){const sy=Math.max(0,Math.min(N-1,y-s)),j=(y*N+x)*3,a=(sy*N+x)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}
      for(let y=0;y<N;y++)if(R()<g*.04)W.fill(0,y*N*3,(y+1)*N*3);
      if(R()<g*.3){const w=6+Math.floor(R()*14),h=3+Math.floor(R()*8),x0=Math.floor(R()*(N-w)),y0=Math.floor(R()*(N-h)),d=(R()<.5?-1:1)*(2+Math.floor(R()*6));T.set(W);
        for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const sx=Math.max(0,Math.min(N-1,x+d)),j=(y*N+x)*3,a=(y*N+sx)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}}
    if(tv.split>.02){const s=Math.max(1,Math.round(tv.split*3));T.set(W);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3;W[j]=x>=s?T[j-3*s]:0;W[j+2]=x<N-s?T[j+2+3*s]:0;}}
    if(tv.tint>.01||tv.sat<.99){const pal=PL.pal,tc=[0,0,0];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3,l=Math.max(W[j],W[j+1],W[j+2]);if(l<.002)continue;
        LOOK.palSample(pal,tv.hue+Math.max(Math.abs(x-c),Math.abs(y-c))/N*.6,tc);
        for(let h=0;h<3;h++){let v=W[j+h]+(l*tc[h]-W[j+h])*tv.tint;v=l+(v-l)*tv.sat;W[j+h]=v;}}}
    /* fades: the old picture held and handed over LED by LED (xfade) or whole frames at a time (flicker; blends when the two differ too much): LOOK.tr */
    if(PL.xf){const x=PL.xf,p=(PL.beat-x.b0)/(x.b1-x.b0);if(p>=1)PL.xf=null;else{if(x.type==='flicker')LOOK.tr.flicker(W,x.snap,N*N,p,PL.R,PL.rank);else LOOK.tr.xfade(W,x.snap,N*N,p,PL.rank);}}
    /* the iris and the dissolve run on the last bars before a section that asks for them */
    if(nx&&(nx.enter==='iris'||nx.enter==='dissolve')){const bars=nx.enterBars||1,p=1-bLeft/(bars*4);if(p>0&&p<1){
      if(nx.enter==='dissolve')LOOK.tr.dissolve(W,N*N,p,PL.rank);else LOOK.tr.iris(W,N,p,c,c,T);}}    const inv=tv.invert>.5||PL.beat<PL.ev.invTo,strobe=(tv.strobe>.5||PL.beat<PL.ev.strobeTo)&&Math.floor(t*6)%2===0&&Math.floor(t*6)!==PL.lastStrobe&&env.flash(t);
    if(strobe)PL.lastStrobe=Math.floor(t*6);
    let fl=Math.max(tv.flash,PL.ev.flash,strobe?1:0);PL.ev.flash*=Math.exp(-dts/.05);if(fl>.5&&!PL.flOn&&PL.ev.flash<.5&&!strobe&&!env.flash(t))fl=.3;PL.flOn=fl>.5;   /* the flash gate */
    if(PL.ev.screen&&PL.beat>=PL.ev.screenTo){PL.ev.screen=null;if(PL.ev.after==='flash'&&env.flash(t))PL.ev.flash=1;PL.ev.after=null;}
    const scr=PL.ev.screen,blk=Math.max(tv.black,PL.beat<PL.ev.blackTo?1:0);
    for(let j=0;j<W.length;j++){let v=W[j];if(inv)v=.7-v;v=v+fl*(1-v);v*=(1-blk);if(scr)v=scr==='white'?1:0;W[j]=v;}
    O.set(W);
    /* monotony watch (the Director's): if hardly any LED changes for 2.5 s, shake, then the next scene on the bar */
    if(PL.style.monotony){const M=PL.mono;if(songT-M.t>=.5){if(M.prev){let ch=0,lit=0;for(let i=0;i<N*N;i++){const a=O[3*i]>.08,b=M.prev[i];if(a||b){lit++;if(a!==b)ch++;}}
        M.low=lit&&ch/lit<.05?M.low+(songT-M.t):0;if(M.low>=2.5){M.low=0;M.shake=songT+.5;PL.nextReq=true;}}else M.prev=new Uint8Array(N*N);
      for(let i=0;i<N*N;i++)M.prev[i]=O[3*i]>.08?1:0;M.t=songT;}}
    /* the ONE finishing chain (look.js): the Director's own hooks and levels (its glitch / tint, white-screen rule, darkness floor, intensity), then the clip's brightness, breathing and trails,
       the beat before the next section pulls in and dims (House: anticipation / dim), then brightness, gamma, white cap and the power limit from House */
    const cx=D().lookCtx(t);cx.duty=PL.D;cx.up=PL.U;cx.ant=ant?1:0;cx.breath=tv.breath;cx.trails=tv.trails>.01?Math.pow(tv.trails,dts*60):0;cx.st=PL.lst||(PL.lst={});
    cx.level=cx.levels.concat([tv.bright]);if(env.amps)cx.ampLimit=env.amps()*HOUSE.val.powerLimit;
    const R2=LOOK.post(W,N,N,cx);PL.amps=R2.amps;}
  /* after an edit: the section's base, patches and palette again, without restarting its scene (scene, show or freedom edits: PL.sec=-1) */
  PL.reapply=()=>{if(PL.sec<0||!PL.clip||!PL.clip.sections[PL.sec])return;const s=effSec(PL.sec),st=PL.style;PL.base=VJ.baseFor(st,s);PL.patches=VJ.patchesFor(st,s);PL.pal=stylePal(st.palette);};
  /* hand the shows back: their own scene choice, layer switches and settings */
  PL.release=()=>{const d=D();if(d)d.ENG.rawOut=false;if(d&&PL.savedForce){d.ENG.force=PL.savedForce;PL.savedForce=null;}env.S.engScene=0;PL.sec=-1;PL.lastT=-1;};
  PL.scene=()=>{const sc=D().ENG.sc;return sc?sc.def.name:'';};
  return PL;};
/* a clip ready to travel: the style is copied in, so the simulator does not need the lab's style list */
VJ.packClip=(clip,style)=>Object.assign(JSON.parse(JSON.stringify(clip)),{style:JSON.parse(JSON.stringify(style))});
VJ.CLIPS_KEY='infinity-vj-clips-v1';VJ.STYLES_KEY='infinity-vj-styles-v1';
window.VJ=VJ;})();
