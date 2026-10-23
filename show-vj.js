/* VJ clips: plays what the VJ Lab (VJ Lab/index.html) made, in sync with its song, on the mirror (pattern 57, its own tab).
   The page loads this file with <script src> after vj-runtime.js and the two shows; code() runs inside the page's scope.
   The clip steers the Director through its own switches (scene picker, skip, layer switches) while it listens with
   the page's real ears; vj-runtime.js adds the patch matrix, the sections, the moments and the picture chain. Edit this file, not the page. */
(window.INF_SHOWS=window.INF_SHOWS||{})['vj']={pat:57,tab:'vj',name:'VJ clips',
note:"A clip from the VJ Lab: its style and its attunement to one song, played in sync with that song. Load the same audio file here.",
defaults:{vjLast:''},
panel:String.raw`
    <section aria-labelledby="h-vj" data-tab="vj">
      <h2 id="h-vj">VJ clips</h2>
      <p class="note">Song-specific visuals made in the VJ Lab (the folder VJ Lab next to this page): a style, the song's sections, moments and patch matrix. Pick a clip, load its song, play.</p>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><select id="vjSel" aria-label="Clip" style="font:inherit;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:inherit;flex:1"></select>
        <label class="btn filebtn" for="vjFile"><input type="file" id="vjFile" accept=".json" hidden>Load clip file</label></div>
      <div class="chips"><label class="btn filebtn" for="vjSong"><input type="file" id="vjSong" accept="audio/*" hidden>Load the song</label><button type="button" id="vjGo" aria-pressed="false">Play the clip on the mirror</button><button type="button" id="vjOpen">Open the VJ Lab</button></div>
      <p class="note" id="vjLive" style="font-family:var(--mono)"></p>
      <p class="note">The clip plays wherever the song is: pause, scrub or restart the song and the visuals follow, section by section. The shows listen to the song with the page's own ears as always; the clip decides which scenes, layers and looks, and when.</p>
    </section>`,
code:function(){
const VJS={pl:null,clip:null,A:null,songName:'',tex:null,N:0,active:false,saved:null,msg:''};
const vjEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const vjKeys=['engScene','engEnt','engFb','engBright','engHw'];
function vjClips(){try{return JSON.parse(localStorage.getItem(VJ.CLIPS_KEY)||'[]');}catch(e){return[];}}
function vjList(){const sel=document.getElementById('vjSel'),L=vjClips();sel.innerHTML='<option value="">'+(L.length?'Pick a clip…':'No clips yet: send one from the VJ Lab')+'</option>'+
  L.map((c,i)=>'<option value="'+i+'">'+vjEsc(c.name)+' · '+vjEsc(c.style&&c.style.name||'')+'</option>').join('');
  const k=L.findIndex(c=>c.name===S.vjLast);if(k>=0){sel.value=String(k);if(!VJS.clip)vjUse(L[k]);}}
function vjUse(c){VJS.clip=c;S.vjLast=c.name;save();VJS.msg=VJS.A&&VJS.songName?'':'Now load its song'+(c.song&&c.song.name?': '+c.song.name:'')+'.';if(VJS.A)vjStart(false);}
async function vjSong(f){if(!ensureAudio())return;playBlob(f,f.name);VJS.songName=f.name;VJS.msg='Measuring the song…';
  try{const buf=await actx.decodeAudioData(await f.arrayBuffer());VJS.A=await VJ.analyse(buf,p=>{VJS.msg='Measuring the song… '+Math.round(p*100)+' %';});VJS.msg='';vjStart(true);}
  catch(e){VJS.msg='That file could not be read as audio.';}}
function vjStart(go){if(!VJS.clip||!VJS.A)return;const env={shows:{director:SHOW[55]},S,flash:t=>LOOK.flashGate(t),amps:()=>HOUSE.val.supplyA};
  VJS.pl=VJS.pl||VJ.Player(env);VJS.pl.load(VJS.clip,VJS.clip.style||VJ.newStyle(),VJS.A);if(go&&S.pat!==57){S.pat=57;save();syncPat();}}
/* while the clip plays it owns a few of the shows' settings; they come back when another visual is picked */
function vjActivate(){if(VJS.active)return;VJS.active=true;VJS.saved={};for(const k of vjKeys)VJS.saved[k]=S[k];}
function vjRelease(){if(!VJS.active)return;VJS.active=false;if(VJS.pl)VJS.pl.release();if(VJS.saved)for(const k of vjKeys)S[k]=VJS.saved[k];VJS.saved=null;}
function vjStep(N,t,dts){vjActivate();
  if(VJS.N!==N){VJS.N=N;if(VJS.tex)gl.deleteTexture(VJS.tex);VJS.tex=tex(7,gl.NEAREST,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,N,N,0,gl.RGBA,gl.FLOAT,null);gl.activeTexture(gl.TEXTURE0);}
  let U=null;if(VJS.pl&&VJS.A&&VJS.clip){VJS.pl.frame(N,t,dts,playerEl.currentTime);U=VJS.pl.U;}
  if(!U){U=VJS.blank&&VJS.blank.length===N*N*4?VJS.blank:(VJS.blank=new Float32Array(N*N*4));}
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,VJS.tex);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,N,N,gl.RGBA,gl.FLOAT,U);gl.activeTexture(gl.TEXTURE0);
  if(frameN%8===0&&S.tab==='vj'){const P=VJS.pl,c=VJS.clip,el=document.getElementById('vjLive');
    if(VJS.msg||!P||!VJS.A)el.textContent=VJS.msg||(!c?'Pick a clip first.':'Load its song.');
    else{const s=c.sections[P.sec],g=c.grid,bt=(playerEl.currentTime-g.t0)*g.bpm/60;
      el.innerHTML='<b>'+vjEsc(c.name)+'</b> · '+vjEsc((c.style&&c.style.name)||'')+' · bar '+(Math.floor(bt/4)+1)+' · '+(s?'<b>'+s.label+'</b>':'')+' · '+'Director'+' · '+vjEsc(P.scene())+
        (playerEl.paused?' · paused (play the song)':'')+' · ≈ '+(P.amps||0).toFixed(1)+' A';}}}
function vjSync(){const g=document.getElementById('vjGo');if(!g)return;g.setAttribute('aria-pressed',String(S.pat===57));g.textContent=S.pat===57?'■ Stop the clip':'▶ Play the clip on the mirror';
  if(S.pat!==57)vjRelease();}
{const sel=document.getElementById('vjSel');sel.addEventListener('focus',vjList);sel.addEventListener('change',()=>{const c=vjClips()[+sel.value];if(c)vjUse(c);});
 document.getElementById('vjFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{vjUse(JSON.parse(await f.text()));}catch(err){VJS.msg='Not a clip file.';}e.target.value='';});
 document.getElementById('vjSong').addEventListener('change',e=>{const f=e.target.files[0];if(f)vjSong(f);e.target.value='';});
 const go=document.getElementById('vjGo');let before=DEF.pat;go.addEventListener('click',()=>{if(S.pat===57)S.pat=before;else{before=S.pat;S.pat=57;if(playerEl.paused&&VJS.A)playerEl.play();}save();syncPat();});
 document.getElementById('vjOpen').addEventListener('click',()=>window.open('VJ Lab/index.html','_blank'));
 vjList();}
return {step:vjStep,sync:vjSync,hear:(t,dts,ons)=>{},VJS};}};
