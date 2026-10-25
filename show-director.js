/* The director: a show for Infinity Mirror Pixel Grid.html (pattern 55, its own tab). The page loads this file with <script src>,
   adds its tab and panel, and runs code() inside its own scope, so everything the page has (gl, S, the audio, TEMPO) can be used here.
   Edit this file, not the page. */
(window.INF_SHOWS=window.INF_SHOWS||{})["director"]={pat:55,tab:"dir",name:"Epic",
note:"The director from the Advanced visuals tab: eighteen scenes for the mirror chained by a director that listens (builds, drops, breakdowns, loops), with a feedback tunnel under them. It ignores Audio gain, Follow the melody, Speed and the palette.",
defaults:{engScene:0,engBpm:120,engFb:1,engHw:0,engIp:'4.3.2.1',engWire:0,engOrigin:0,engDelay:50,engMix:[],engSet:[],engMark:{}},
panel:String.raw`
    <section aria-labelledby="h-dir" data-tab="dir">
      <h2 id="h-dir">Epic</h2>
      <p class="note">A show that is never a playlist. Eighteen scenes in the mirror's own language (thin lines and single sparks on black, outlines that rhyme with the reflections, motion along the edges) and a director that listens, chooses, repeats itself on purpose when the music repeats, and keeps surprising. Every scene starts and ends in a state (dark, a dot, an outline, the frame, light, inverted, chaos); the next one has to start where the last one ended, or a bridge carries it over: an iris that shrinks everything into one LED, a dissolve, or a blackout on the bar.</p>
      <div class="chips"><button type="button" id="engGo" aria-pressed="false">Play Epic on the mirror</button><button type="button" id="engSkip">Next scene (N)</button><button type="button" id="engCyc">Full cycle (C)</button><button type="button" id="engFrz" aria-pressed="false">Freeze (space)</button><button type="button" id="engBlack">Hold for black (B)</button><button type="button" id="engFav">♥ Favourite (H)</button><button type="button" id="engNew">New seed</button></div>
      <select id="engFavs" aria-label="Replay a favourite" style="font:inherit;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:inherit"></select>
      <div class="glabel">Scenes for this set: click the ones you like (it plays at once), click again to take it out; the director only chooses among yours. Auto = all of them</div>
      <div class="chips" aria-label="Epic scenes" id="engScn"></div>
      <div id="engSetList" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="glabel">Layers (keys 1-9, the last three by click): click one and it comes underneath with a slider, click again to take it away. None picked = the director's own choice</div>
      <div class="chips" id="engMods"></div>
      <div id="engMixList" style="display:flex;flex-direction:column;gap:8px"></div>
      <div class="chips"><button type="button" id="engMixClear">Clear the layers (back to auto)</button></div>
      <div id="engCtl" style="display:flex;flex-direction:column;gap:12px"></div>
      <p class="note" id="engLive" style="font-family:var(--mono)"></p>
      <p class="note" id="engLog" style="font-family:var(--mono);white-space:pre-line"></p>
      <div class="glabel">Real LEDs (WLED over DDP)</div>
      <div class="chips"><button type="button" id="engHw" aria-pressed="false">▶ Send to the LEDs (O)</button></div>
      <div class="row"><label for="engIp">WLED address</label><input type="text" id="engIp" maxlength="40" spellcheck="false" style="grid-column:1/-1;font:inherit;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:transparent;color:inherit"></div>
      <div class="seg" role="radiogroup" aria-label="Wiring" id="engWireSeg"></div>
      <div class="seg" role="radiogroup" aria-label="First LED" id="engOriginSeg"></div>
      <div id="engHwCtl" style="display:flex;flex-direction:column;gap:12px"></div>
      <p class="note">A browser cannot talk to WLED directly, so first start the small bridge next to this file, the small helper that sends frames to the LEDs: <code>node lt-ddp-bridge.js</code>. Then press Send. The LEDs get exactly what the simulator shows, at its LED count: gamma 2.4, white at most 40 % and warm, the current limit for your power supply, and dithered so the slowest fades at the dark end do not step.</p>
      <p class="note"><b>How it listens.</b> Its own ears on the raw sound (before Audio gain): five bands (sub, low, mid, presence, high), each against its own recent peak so any volume works; kicks, snares and hats from sudden rises in their bands; how fast each kind of hit fades, measured from the song; how noisy or pure the sound is; how bright; where it sits in stereo and how wide; how much reverb tail there is. The tempo and the bar come from the page's tempo tracker when it is sure, otherwise it keeps its own clock. Per bar it follows the song: getting louder (a build), the beat gone (a breakdown), the sub slamming back (a drop), and how much this bar repeats the last ones.</p>
      <p class="note"><b>How the sound moves the light.</b> The sub only moves the whole picture: blackouts, white frames, inversions, the tunnel pulses. The mids bend the geometry: how big the squares are, how hard the edges pull, how fast holes and rings grow. The highs make the small things: sparks, crackles, snow. A hit lands on the very frame it is heard and then fades as fast as the sound does. Distorted, noisy sound unlocks glitches (torn rows, split colours, dropped lines, sliding blocks), harder the noisier it gets; pure tones take every glitch away at once. A long reverb tail makes the tunnel deeper and the ghosts longer; dry sound sits on the surface, sharp. Stereo pulls the tunnel's centre to one side and a wide sound turns it slowly.</p>
      <p class="note"><b>How it chooses.</b> Scenes are weighted by how well their energy fits the music, how rare they are and how recently they played; their settings and layers are rolled again every time, and the same combination never comes back within the last ten. In a build the entropy rises: more sparks, faster crackles, more glitch, shorter scenes, more layers. Right at a drop the whole panel goes full white or full black for a quarter beat (feedback ghosts and all), unless the silence before the drop already made it black, then a loud scene. A breakdown takes 90 % of the motion away and goes back to near black with one thing left (a dot, the frame, a comet). When the music loops, the director loops a phrase two to four times, each time a little changed, and breaks out the moment the music changes. On Auto it picks by role (below); the whole canonical cycle (void, portal, inversion, accumulation, puncture, perimeter, tracer) only plays when you press C; now and then it calls back an earlier moment, and after a long loud stretch it rests, whatever the music does. Without sound for 5 seconds it carries on by itself on its own clock, mostly sparse. Every decision is in the log, and ♥ keeps the seed so a show can be replayed.</p>
      <p class="note"><b>New sections.</b> Its ears also watch the shape of the whole spectrum (16 bands) and the harmony (12 notes): the last second against the last few, every band measured against how much it usually moves. When an instrument comes in or drops out, or the melody turns, and it holds for 0.4 s, that is a new section (at most one per 10 s), and on the next bar line something serious changes: a scene with a shape keeps its look and changes shape, the others cut to a new scene (louder when something came in, different when something left), one geometry layer flips, the frame flashes white, inverts or goes black, and a square shockwave runs out to the frame or in to the centre. In Rone's Origami it hears 1:00, 1:25 and 2:06 among others. It also works with one scene chosen by hand: then that scene changes shape.</p>
      <p class="note"><b>Drops.</b> A drop watch runs on every frame, on the sub's own signal (a 120 Hz low-pass with its own fast meter). While the beat runs it learns how loud the kicks are. When the bass sinks 8 dB under the groove for 2 s, that is a breakdown, and it waits. Rising brightness, busier hats and snares or a build arm it. The drop is the first bass hit that lands back within 5 dB of the old kicks and is louder than anything the breakdown had; after an intro without bass, the first hit far above everything so far. Armed, a sudden silence (the gap before the drop) goes black at once, and the light comes back if the drop does not; otherwise the drop itself starts with a quarter beat of full white or full black. (A live listener cannot know a drop earlier than its first bass hit unless the music goes silent before it.) Built after the drop detectors in FastLED, echoes_in_light-VJ and felixmeyer6/drop-detector. In Rone's Origami: 0:30.8, 1:25.8 and 2:06.7, no false ones.</p>
      <p class="note"><b>Spastic square.</b> When the picture is nearly black (the void, a lone dot, the frame) or nearly white (the light, the inversion), a square jumps size in quick electric twitches on the hits and on its own: white lines on black, black cuts in white. Layer 9 turns it off.</p>
      <p class="note"><b>Your layers.</b> Click a layer and it comes underneath with one slider: how often it is on. At 100 % it is always on; lower, it is rolled again on the musical moments (a new scene, a drop, a tonal change), on as often as the slider says, so it changes with the music instead of at random. It comes on the moment you click it. Only your layers come then; with none picked the director rolls its own. The log says every change (“layers, on the drop: + mirror”). What you pick always shows, in every scene and at any moment: also a mirror on a scene that never takes one by itself, the inverted picture outside a build, glitches on clean sound, and the bass, mid and high voices on scenes that already show that part.</p>
      <p class="note"><b>Your scenes.</b> Click the scenes you like for this set: the one you click plays at once, and from then on the director only chooses among your scenes (by the music, as always; drops get a drop scene from yours if you have one). Click one again to take it out; Auto takes them all back. Each of your scenes gets a row with two optional marks: <i>Intro</i> plays when a song starts (instead of Arrivals), <i>Drop</i> plays on the drops (instead of the director's own drop scene). A marked scene waits for its moment; the unmarked ones fill the rest. The full cycle (C) and a story's hand-over (Merger → Black hole) still play as asked.</p>
      <p class="note"><b>Intensity.</b> One number from 0 to 1 sets how much happens: mostly the loudness (measured like broadcast meters, EBU R128, against the song's own loud level over the last minutes, so a soft passage stays soft instead of being turned up), then how many hits a second, how many bands play and how bright it is. Soft music: slower motion, fewer sparks, smaller hits, a dimmer picture and calmer scenes. Louder, busier, fuller: all of it more. It rises within half a second and settles over a few seconds, as listeners do.</p>
      <p class="note"><b>When it switches.</b> On a drop at once; on a new section (the spectrum's shape or the harmony on the circle of fifths and thirds changes), on the sound falling away (8 LU under the loudest of the last 4 s) and on instruments coming in (three more bands playing within 2 s) at the next bar line. Two of these in one bar make it a big switch; after a switch it waits at least 4 bars.</p>
      <p class="note"><b>Roles.</b> Every scene has a role, shown on its button: <i>drop</i> for the moment a drop hits (inversion, puncture, tunnel rings, core, dynamo, merger, comic merger, supernova), <i>build</i> for loading towards a drop (accumulation, portal, scanner, rain, static, heartbeat, dynamo, tracer, merger, comic merger, supernova, sun dive, celdeling), <i>flow</i> for the music running (rings, ripple, rain, corridor, scanner, portal, puncture, core, tracer, sun dive, celdeling) and <i>calm</i> for breakdowns and soft parts (void, perimeter, heartbeat). On Auto the director reads the phase (an armed drop watch or a build = build; a breakdown, a rest or low intensity = calm; else flow) and picks a scene of that role; a drop always gets a drop scene.</p>
      <p class="note"><b>Alive.</b> Hits move things on springs, so a beat swells, overshoots once and settles instead of switching on and off (the animators' follow-through; General > Motion has the spring speed and damping). On every kick the tunnel's ghosts duck and come back, like sidechain pumping in a mix (General > Motion: Echo duck), and the whole picture punches in and flashes on the kick (General > Feel). In the last beat before a change the director already knows about (a waiting switch, a scene ending on that bar), the picture pulls in and dims (General > Motion: Pull-in and Dim before a change), and the change lands on the bar line (anticipation). It remembers every new section and drop with its harmony: when a passage comes back, so does its scene, a little changed. And while it plays, the sound from the player or a video waits 50 ms (the slider), so the light lands on the beat instead of after it; captured computer sound cannot wait.</p>
      <p class="note"><b>Never still.</b> Every half second it counts how many lit LEDs actually changed. A picture that hardly moves for 2.5 s is shaken on the next bar line (the same scene with other settings and a layer flipped); still too still after that, the next scene comes, again on a bar line. Everything the director changes on its own lands on a bar line; only drops (and your N key) cut at once. Black on purpose (held, before or at a drop) does not count.</p>
      <p class="note"><b>Flicker fades.</b> Besides hard cuts and LED-by-LED fades, a scene can flicker in: for one bar whole frames alternate between the old scene and the new one, the new one rare at first and then ever more often, so they never mix. Two scenes far apart in brightness would strobe that way, so they fade LED by LED instead.</p>
      <p class="note"><b>What you hear is what you see.</b> When the music is sparse (a song's intro, a breakdown, a soft passage) Arrivals takes over and the parts that play make the picture, one solid shape more for every part that comes in, no lines: the melody is a shape in the middle that jumps on every note (a square on its home note, a diamond on the others), a voice that stands out a big pyramid while it sings, the highs small squares lighting in the corners in turn, the lows a heavy disc that swells towards the drop. A new section is shown there, not cut away. Calm ↔ Busy (General › Timing, the Pad) sets how bright, how full and how complex everything gets; in the middle it is as the music says. On a drop: BAM, a white square flies out and fills the panel, then (the first drop of a song, half the others) thick squares shoot out on every bass hit.</p>
      <p class="note"><b>Space (after Jon Hopkins).</b> Black is the main element: outside a climax (a build, the first 4 bars after a drop) at least 65 % of the panel stays dark, the dimmest light is gated away first and the brightest, the one hero, stays. Echoes fade to black within a beat. Before a drop the bar before the breakdown's 8-bar phrase ends goes black, so the drop comes out of the dark. One idea at a time: no layers on top by default (a part of the music that plays picks a scene that shows it), mirror and kaleidoscope are rare, and scenes change through black or a white flash on the bar line, or strip down to a dot or to black first; flicker fades only towards a drop. Everyday lines are thin; thick and full is for the big moments.</p>
      <p class="note"><b>White is scarce.</b> A white screen (at least 92 % of the LEDs bright; never a picture with forms in it) only comes while the music builds towards a drop and in the 8 bars after one (the inverted layer is only rolled then, and the white scenes have those roles). Then it strobes to a part of the music: in a build on the snare (or the hats), after a drop on the kick, on the beat when that part is silent; a short white flash with black between, never more than 3 flashes a second. Anywhere else a white picture is dimmed at once and leaves on the next bar line.</p>
      <p class="note">Flash safety: white flashes share the other shows' limit, at most 3 in any second. White is a dramatic moment here, not a state.</p>
    </section>
`,
code:function(){
/* the director's buttons (pattern 55); only DOM and S here, the chips are built with the scenes further down */
function syncEng(){try{engAudioDelay();}catch(e){}   /* the sound goes back to direct when the director stops */
  const g=document.getElementById('engGo');if(!g)return;let E=null;try{E=ENG;}catch(e){}   /* ENG is made below */
  g.setAttribute('aria-pressed',String(S.pat===55));g.textContent=S.pat===55?'■ Stop Epic':'▶ Play Epic on the mirror';
  const set=S.engSet||[];document.querySelectorAll('#engScn button').forEach(b=>{const id=b.dataset.id,on=id?set.includes(id):!set.length;b.setAttribute('aria-pressed',String(on));b.textContent=(id&&on?'✓ ':'')+b.dataset.n;});
  const mix=S.engMix||[];
  document.querySelectorAll('#engMods button').forEach((b,i)=>{const x=mix.find(q=>q.m===b.dataset.m);b.setAttribute('aria-pressed',String(!!x));
    b.textContent=(x?'✓ ':'')+(i+1)+' '+b.dataset.n+(x?' · '+Math.round(x.p*100)+' %':'');});
  const fr=document.getElementById('engFrz');if(fr&&E){fr.setAttribute('aria-pressed',String(E.frozen));fr.textContent=E.frozen?'Unfreeze (space)':'Freeze (space)';}
  const hw=document.getElementById('engHw');if(hw){hw.setAttribute('aria-pressed',String(!!S.engHw));hw.textContent=S.engHw?'■ Stop sending (O)':'▶ Send to the LEDs (O)';}
  document.querySelectorAll('#engWireSeg button').forEach(b=>b.setAttribute('aria-checked',String(+b.dataset.i===S.engWire)));
  document.querySelectorAll('#engOriginSeg button').forEach(b=>b.setAttribute('aria-checked',String(+b.dataset.i===S.engOrigin)));}
/* ---------- The director (pattern 55) ----------
   A generative, audio-reactive show for the infinity mirror: scenes that a director chains by the state each one starts and ends in
   (dark, dot, outline, frame, light, inverted, chaos), drawn per LED on the CPU in float, with a feedback tunnel under them.
   Shown through the Buddhabrot's texture (unit 7, drawn as uPat 36 with the plain palette), so the big shader is not touched.
   Parts, in order: config · ears · drawing helpers · scenes · modifiers · director · post chain and LED output · controls.
   A new scene is one engScene() call (states in and out, parameter ranges, bars, energy, init / say / draw); nothing else changes. */
const ENG_CFG={
  barsPerPhrase:16,
  /* AUTO: the level decides (the level itself, the choice, the phrases and the planned changes are conductor.js: CONDUCTOR.cfg / General > Timing).
     lvIx = how much the level adds to the Calm-Busy paths (light, motion, dark, echoes); lvCold = under it the probability params 'cold' are on;
     lvDens = the dice's share in a density parameter's value */
  lvIx:.6,lvCold:.4,lvDens:.3,
  /* ears, the song, new sections, loudness, intensity, springs and the drop watch: all in music.js (MUSIC.cfg, handed through below).
     The parts the director keeps: */
  dropRise:10,dropBelow:6,dropLowDb:6,dropSub:.7,dropGapBars:8,
  secBig:1.8,secMorph:.65,secAfterDrop:2,
  iMot:[.2,.8],iBright:[.45,.55],
  /* alive: (the kick's whole-picture punch is Feel's zoom now; the ghost ducking and the anticipation pull-in / dim are house-style.js: duckTo, duckS, anticipation, antDim)
     a returning passage (its harmony correlating at least memMin with an earlier moment, sampled memBars after it began) brings that moment's scene back, a little changed */
  memMin:.85,memN:24,memBars:2,
  /* on the drop the whole panel is white or black for dwScreenBeats, then the scene */
  dwScreenBeats:.25,
  /* the spastic square: on the dark scenes (picture level under spDarkMax) and the light ones (over spLightMin), or any picture under spLow /
     over spHigh; the level is the mean against `light`; random jumps per s = a + b × mids/highs */
  /* the monotony watch: LEDs over monoLit are lit, a change over monoD a frame counts; activity = changes per lit LED per frame */
  monoLit:.05,monoD:.06,monoFloor:.02,monoR:.035,monoS:5,
  spDark:['void'],spLight:['accumulation'],spDarkMax:.06,spLightMin:.3,spLow:.005,spHigh:.62,spRate:[1,4],
  /* the voices: bass = thick waves from the centre on solid bass hits (sub band over bassMin; bassLw LEDs thick by bass × intensity, out to the
     frame in bassDur s), not on scenes with their own bass gesture (bassOwn: those make theirs thick); mids = a medium figure (golden spiral, flower of life,
     Metatron's cube, eye of providence, Mandelbrot, spirograph...) drawn more and in more detail as the mids play, turning with the melody */
  void:{dropBars:4},whiteLed:.45,whiteDrop:8,whiteOn:.09,whiteOff:.06,whiteDim:.3,   /* how dark (void) and how white (whiteFrac, whiteDuty) are house-style.js */
  bassMin:.7,bassLw:[3,6],voiceRoom:.2,bassDur:.4,bassOwn:['rings','corridor','heartbeat','core','ripple','shatter'],midMin:.15,
  /* what you hear is what you see (Arrivals): when the music is sparse the parts that play make the whole picture. The melody's notes (mid
     onsets, spectral flux arFlux dB over its 0.5 s mean) land as dots on a wheel that turns once a bar, so a repeating pattern stands still;
     a voice that stands out (the mids arDb over their 8 s mean) draws a figure; the highs / lows rising arRise dB over their quietest of the
     last arMinS s add ticks racing round the edge / a heavy core. It holds while the song is sparse (intro, breakdown, calm, build), at most arMax bars */
  arRise:[4,4.5],arTau:1.6,arMax:96,arSparse:.45,
  /* the drop: BAM, a white square flies out of the middle and fills the panel in bamFly s, then fades over bamBeats; a heavy drop then
     shoots a thick square out on every bass hit (Tunnel rings, outward) */
  bamFly:.16,bamBeats:1,
  /* look */
  light:.7,   /* white and cold (the two tints) are LOOK.white() / LOOK.cold() through house-style.js: see the getters below */
  sparkTau:.2,edgeMin:.6,nestRatio:.58,nestAmp:.55,ghostGap:4,ghostBusy:.7,maxHoles:70,maxRings:14,
  /* director */
  histN:10,canonP:0,bridgeW:.35,loopP:.4,loopMax:[2,4],callbackP:.04,restBars:48,restLen:8,novelN:6,novelMin:3,
  modP:{mirror:[.03,.05],kaleido:[.01,.04],rot:[.12,.05],invert:[.015,.03],glitch:[.02,.15],nofb:[.1,-.05],cold:[.22,0],palette:[.025,.02]},  /* chance = a + b × entropy */
  mixHold:8,   /* your mix: a layer that comes on a drop or a tonal change stays this many bars (unless its next moment rolls it again) */
  canon:[['void',{dot:true,off:false}],['portal',{frame:false}],['inversion'],['accumulation'],['puncture'],['perimeter'],['tracer',{dark:false}]],
  morphP:.5,morphOk:['portal','rings','ripple','heartbeat','corridor','core','dynamo','figures','perimeter','tracer','void'],
  /* the transitions' lengths, flicker rule and easing are LOOK.tr (look.js, numbers in house-style.js); what a bridge ends in stays here */
  trTo:{iris:'dot',dissolve:'dark',blackout:'dark'},
  /* output (the finishing chain is look.js) */
  glitchFlat:3,pureFlat:.12,hwPort:8790,drift:.012
};
/* the Director's white and the two cold tints come from house-style.js (White warmth, Cold tint); the desk's accent colours replace the tints while it is on (null = back to the house ones) */
let ENG_COLD_OVER=null;
Object.defineProperty(ENG_CFG,'white',{get:()=>LOOK.white(),enumerable:true,configurable:true});
Object.defineProperty(ENG_CFG,'cold',{get:()=>ENG_COLD_OVER||LOOK.cold(),set:v=>{ENG_COLD_OVER=v||null;},enumerable:true,configurable:true});
window.ENG_CFG=ENG_CFG;
for(const k in MUSIC.cfg)if(!Object.prototype.hasOwnProperty.call(ENG_CFG,k))Object.defineProperty(ENG_CFG,k,{get:()=>MUSIC.cfg[k],set:v=>{MUSIC.cfg[k]=v;},enumerable:true,configurable:true});   /* the ear's settings live in MUSIC.cfg; ENG_CFG hands them through */   /* the page's per-visual sliders (Visuals › Director) write the values the person has set into this table */
const ENG_MODS=[['mirror','Mirror'],['kaleido','Kaleidoscope'],['rot','Turned 90°'],['invert','Inverted'],['glitch','Glitch'],['nofb','No feedback'],['cold','Cold tint'],['palette','Full colour'],['spasm','Spastic square'],['bass','Bass waves'],['mids','Mid figures'],['highs','High sparks']];   /* never rolled: on unless forced off */
const ENG_SCENE={};
const ENG_GLYPHS=['golden','pentagram','flower','metatron','yantra','eye','mandelbrot','spiro','rose','knot','squares','lissajous'],ENG_UPRIGHT=['eye','yantra'];   /* the mid voice's figures (drawn by engGlyph) */
function engScene(id,def){ENG_SCENE[id]=Object.assign({id,w:1,energy:.5,key:[]},def);}
const ENG={N:0,tex:null,seed:0,R:Math.random,t:0,t0:0,b0:0,sc:null,tr:null,ev:null,n:0,log:[],hist:[],sparks:[],dot:null,box:null,
  frozen:false,skip:false,black:false,canonReq:false,canon:-1,loop:null,rest:0,hiBars:0,novel:false,ent:0,restr:0,mot:1,dropKick:0,force:{},prevExit:'dark',phr0:0,planSong:null,planNext:null,planB:0,planKey:null,anchor:null,opening:null,outroOn:false,fadeQ:1,
  lay:null,lay2:null,out:null,fb:null,tmp:null,W:null,up:null,duty:null,err:null,ph:null,hz:null,rank:null,edge:null,ne:0,fbStep:-1,amps:0,lim:1,
  hw:{ws:null,ok:false,err:'',retry:0,sent:0}};
/* the clock is MUSIC's: beats counted since MUSIC started (one count for every visual), the tempo, whether the tempo tracker is sure, the generative mode's slow arc */
Object.defineProperties(ENG,{beat:{get:()=>MUSIC.beat,enumerable:true},bpm:{get:()=>MUSIC.bpm,enumerable:true},locked:{get:()=>MUSIC.locked,enumerable:true},arc:{get:()=>MUSIC.arc,enumerable:true}});
/* seeded random numbers (mulberry32): a seed and the decision log replay a show exactly */
const engRng=CONDUCTOR.rng;   /* the one generator is conductor.js's */
/* roll parameters: [min,max] a number, {int:[a,b]}, {pick:[...]} (repeat an entry to weight it), {p:x} yes with chance x */
const ENG_DENS=['n','heads','train','arcs','lamps','spray','burst','parts','crackle','speed','size','holeMax','jets','spk'];   /* AUTO: the params that mean how many / how big / how fast (not angles, tilt, shape, colour): low music rolls low, loud music high */
function engRoll(spec,R,lv){const o={};for(const k in spec){const v=spec[k],d=lv!=null&&ENG_DENS.includes(k)&&(Array.isArray(v)||v.int),u=R(),t=d?engClamp(lv+(u-.5)*ENG_CFG.lvDens):u;   /* AUTO: density: v = a + (b-a) × clamp(level + a small dice share) */
  o[k]=Array.isArray(v)?v[0]+(v[1]-v[0])*t:v.pick?v.pick[Math.floor(u*v.pick.length)]:v.int?v.int[0]+Math.min(v.int[1]-v.int[0],Math.floor(t*(v.int[1]-v.int[0]+1))):u<v.p;}return o;}
const engClamp=v=>v<0?0:v>1?1:v,engEaseOut=LOOK.ease.out;   /* the one easing set is look.js */
/* Calm <-> Busy (General > Timing, the Pad), as -0.4..+0.4 round its middle (0 exactly at .5): light, how full the panel may get, motion, how busy and complex */
const engIx=()=>CONDUCTOR.ix();
const engIxL=()=>engIx()+(ENG.lvl==null?0:ENG_CFG.lvIx*(ENG.lvl-.5));   /* AUTO: Calm-Busy plus the song's level (±.3): light, motion, darkness, echoes follow the music */
function engSeed(seed){const E=ENG,C=ENG_CFG;E.seed=seed;E.R=engRng(seed);E.b0=Math.floor(MUSIC.beat/ENG_CFG.beatsPerBar)*ENG_CFG.beatsPerBar;E.n=0;E.sc=null;E.tr=null;E.ev=null;E.dot=null;E.box=null;E.loop=null;E.canon=-1;
  E.sparks.length=0;E.log.length=0;E.hist.length=0;E.rest=0;E.hiBars=0;E.t0=E.t;E.shock=null;E.secReq=null;E.spz=null;E.mem=[];E.memP=[];E.phr0=E.b0;E.planNext=null;E.planKey=null;if(!E.N)return;
  const R=engRng(seed^0x5bd1e995),n=E.N*E.N;
  for(let i=0;i<n;i++){E.ph[i]=R()*2*Math.PI;E.hz[i]=2*Math.PI*(HOUSE.fixed.breathHz[0]+(HOUSE.fixed.breathHz[1]-HOUSE.fixed.breathHz[0])*R());E.rank[i]=R();}
  E.out.fill(0);engLog('new show, seed '+seed);}
function engInit(N){const E=ENG,n=N*N;E.N=N;
  for(const k of['lay','lay2','out','fb','tmp','W','duty','err'])E[k]=new Float32Array(n*3);
  E.up=new Float32Array(n*4);E.ph=new Float32Array(n);E.hz=new Float32Array(n);E.rank=new Float32Array(n);E.edge=new Int32Array(4*n);
  if(E.tex)gl.deleteTexture(E.tex);E.tex=tex(7,gl.NEAREST,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,N,N,0,gl.RGBA,gl.FLOAT,null);gl.activeTexture(gl.TEXTURE0);
  engSeed(E.seed||(Date.now()%1e6));}
function engLog(msg){const E=ENG,s=Math.max(0,E.t-E.t0);
  E.log.push(Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+' bar '+(1+Math.floor((E.beat-E.b0)/ENG_CFG.beatsPerBar))+' · '+msg);if(E.log.length>200)E.log.shift();}

/* ----- ears and clock: music.js (MUSIC) is the ONE listener for every visual and the director reads it. EAR is MUSIC's ear object (band, env, spr, on, onT,
   rel, pe, build, brk, drop, dw ...); its settings are MUSIC.cfg, which ENG_CFG hands through, so sliders written to ENG_CFG still reach them. The clock
   is MUSIC's too: ENG.beat / bpm / locked / arc read it. What stays here is what only the director does with the sound. ----- */
const EAR=MUSIC.ear,engCorr=MUSIC.corr;
MUSIC.logFn=m=>{if(S.pat===55)engLog(m);};   /* the ear's own remarks go into the director's log while it plays */
MUSIC.on('song',()=>{ENG.arrive=true;ENG.drops=0;});   /* a new song starts a new history */
MUSIC.on('breakdown',e=>{if(e.kind==='beat'&&ENG.canon>=0){ENG.canon=-1;if(S.pat===55)engLog('restraint comes first: the cycle stops');}});
/* generative mode: soft made-up hits on the clock, so the scenes still breathe without music */
function engSynth(E,tick,half){const A=EAR,R=E.R,a=E.arc,bib=Math.floor(E.beat)%ENG_CFG.beatsPerBar;
  if(tick&&R()<.35+.5*a){A.on[0]=true;A.env[0]=A.env[1]=Math.max(A.env[0],.45+.5*a);}
  if(tick&&bib%2===1&&R()<.5*a){A.on[1]=true;A.env[2]=Math.max(A.env[2],.4+.4*a);}
  if(half&&R()<.25+.4*a){A.on[2]=true;A.env[4]=Math.max(A.env[4],.3+.5*a);}}
MUSIC.synth=(tick,half)=>{if(S.pat===55&&!ENG.frozen)engSynth(ENG,tick,half);};   /* MUSIC calls it between the clock and the bar counters while there is no sound */

/* ----- drawing helpers: scenes draw into ENG.lay (float RGB, row 0 at the top); the brighter value wins ----- */
function engPut(i,v,c){const L=ENG.lay,j=i*3;let q=v*c[0];if(q>L[j])L[j]=q;q=v*c[1];if(q>L[j+1])L[j+1]=q;q=v*c[2];if(q>L[j+2])L[j+2]=q;}
function engPutXY(x,y,v,c){const N=ENG.N;x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N)engPut(y*N+x,v,c);}
function engFill(x0,y0,x1,y1,v,c){const N=ENG.N;for(let y=Math.max(0,y0);y<=Math.min(N-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(N-1,x1);x++)engPut(y*N+x,v,c);}
/* an outline round (ox,oy), lw LEDs thick, anti-aliased by distance; shape 0 square, 1 diamond, 2 circle, 3 cross (a = arm half width).
   LEDs lit above edgeMin go into ENG.edge, for crackles */
function engOutline(ox,oy,r,lw,shape,amp,c,a){const E=ENG,N=E.N,ext=r+lw+1,hw=(lw-1)/2;a=Math.max(.5,a||0);
  const x0=Math.max(0,Math.floor(ox-ext)),x1=Math.min(N-1,Math.ceil(ox+ext)),y0=Math.max(0,Math.floor(oy-ext)),y1=Math.min(N-1,Math.ceil(oy+ext));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=Math.abs(x-ox),dy=Math.abs(y-oy);
    const d=shape===0?Math.max(dx,dy)-r:shape===1?dx+dy-r:shape===2?Math.hypot(dx,dy)-r:Math.min(Math.max(dx-r,dy-a),Math.max(dx-a,dy-r));
    const v=1-Math.max(0,Math.abs(d)-hw);if(v<=0)continue;
    const i=y*N+x;engPut(i,v*amp,c);if(v>=ENG_CFG.edgeMin&&E.ne<E.edge.length)E.edge[E.ne++]=i;}}
/* the outer ring, walked clockwise from the top-left corner: k in 0 .. 4(N-1) */
function engPerim(k,N){const s=N-1;let x,y;k=((k%(4*s))+4*s)%(4*s);if(k<s){x=k;y=0;}else if(k<2*s){x=s;y=k-s;}else if(k<3*s){x=3*s-k;y=s;}else{x=0;y=4*s-k;}return y*N+x;}
/* a point u (0 .. 8r) on a square ring of half size r round (c,c) */
function engRingPt(c,r,u){const s=2*r;u=((u%(4*s))+4*s)%(4*s);let x,y;if(u<s){x=c-r+u;y=c-r;}else if(u<2*s){x=c+r;y=c-r+u-s;}else if(u<3*s){x=c+r-(u-2*s);y=c+r;}else{x=c-r;y=c+r-(u-3*s);}return[x,y];}
/* sparks: full for `hold` frames, then fading with tau seconds */
function engSpark(i,c,hold,tau,v){ENG.sparks.push({i,c,h:hold,v:v||1,tau});}
function engSparks(dts){const L=ENG.sparks;for(let k=L.length-1;k>=0;k--){const s=L[k];if(s.h>0)s.h--;else s.v*=Math.exp(-dts/s.tau);
  if(s.v<.01){L[k]=L[L.length-1];L.pop();continue;}engPut(s.i,s.v,s.c);}}
/* crackles on the outlines drawn this frame: n random edge LEDs flash, some jump one LED in or out as if the edge is under tension */
function engCrackle(R,n,jump,ox,oy,c){const E=ENG,N=E.N;
  for(let k=0;k<n&&E.ne;k++){let i=E.edge[Math.floor(R()*E.ne)];
    if(R()<jump){const x=i%N,y=(i-x)/N,dx=x-ox,dy=y-oy,s=R()<.5?1:-1,hor=Math.abs(dx)>=Math.abs(dy);
      const nx=x+(hor?Math.sign(dx)*s:0),ny=y+(hor?0:Math.sign(dy)*s);if(nx>=0&&ny>=0&&nx<N&&ny<N)i=ny*N+nx;}
    engSpark(i,c,1+(R()<.5?1:0),ENG_CFG.sparkTau);}}
/* an arc of lightning: a random walk of len LEDs from (x,y) towards (tx,ty), gone within a few frames */
function engArc(R,x,y,tx,ty,len,c){for(let k=0;k<len;k++){const N=ENG.N;if(x<0||y<0||x>=N||y>=N)break;engSpark(y*N+x,c,1+(R()<.4?1:0),.05);
  const dx=Math.sign(tx-x),dy=Math.sign(ty-y);if(R()<.55){if(Math.abs(tx-x)>=Math.abs(ty-y))x+=dx;else y+=dy;}else if(R()<.5)x+=R()<.5?1:-1;else y+=R()<.5?1:-1;}}
const engSnap=(v,c)=>{const f=c-Math.floor(c);return Math.round(v-f)+f;};   /* a radius whose edges land on whole LEDs round centre c */

/* ----- the scenes ----- */
engScene('void',{name:'Void',entry:['dark'],exit:['dot','dark'],bars:[4,8,8],energy:.03,key:['dot','off'],
  params:{spark:[.1,.4],hatP:[.1,.3],dot:{p:.75},off:{p:.25},tint:{int:[0,1]},fz:[.8,.92],fp:[.3,.55],fs:{pick:[.5,1]}},
  init(sc,E){const N=E.N,R=sc.R,h=Math.round((N-1)/2);sc.exit=sc.p.dot?'dot':'dark';delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;   /* a white half stays a clean half */
    sc.dx=sc.p.off?Math.round(N*(.2+.6*R())):h;sc.dy=sc.p.off?Math.round(N*(.2+.6*R())):h;},
  say:sc=>(sc.p.dot?'ends on a dot'+(sc.p.off?' off-centre':''):'ends dark')+', in an intro now and then a white half on a hit',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,t=E.t,bar=C.beatsPerBar*60/E.bpm;
    if(R()<sc.p.spark*dts*E.mot||(A.on[2]&&R()<sc.p.hatP*E.mot))engSpark(Math.floor(R()*N*N),C.cold[sc.p.tint],1,C.sparkTau*(1+R()));   /* rare, isolated */
    /* in a song's intro (before its first drop), now and then on a hit, a swift flash (60-140 ms): one half of the panel white, in turn
       left, right, top, bottom; sometimes a white half shooting up from the bottom out through the top, rarely the whole panel. At most one a bar, only
       through the flash gate (never more than 3 flashes a second, none with white flashes off) */
    const intro=!A.gen&&(A.dw.st==='intro'||!E.drops),hit=A.on[0]||A.on[1]||A.pe.on&&A.pe.str>.4;
    if(intro&&!sc.hf&&b>C.beatsPerBar&&b<sc.b1-sc.b0-C.beatsPerBar&&hit&&t-(E.vfT||-99)>bar&&R()<.45&&engFlash(t,1)){const r=R(),k=r<.1?'full':r<.28?'rise':['left','right','top','bottom'][E.vhi=E.vhi==null?0:(E.vhi+1)%4];   /* the turn goes on across scenes */
      sc.hf={k,t0:t,dur:k==='rise'?.14:k==='full'?.06:.08};E.vfT=t;   /* milliseconds: swift flashes */engLog('void: a white '+(k==='full'?'panel':k==='rise'?'half rising up':k+' half'));}
    if(sc.hf){const f=sc.hf,a=(t-f.t0)/f.dur;if(a>=1)sc.hf=null;else{const m=N>>1;let x0=0,x1=N-1,y0=0,y1=N-1,v=Math.pow(1-a,1.5);E.vflash=true;
      if(f.k==='left')x1=m-1;else if(f.k==='right')x0=m;else if(f.k==='top')y1=m-1;else if(f.k==='bottom')y0=m;
      else if(f.k==='rise'){y0=Math.round(N-a*(N+m));y1=y0+m-1;v=.9;}   /* a half-high block sweeping up and out */
      engFill(x0,y0,x1,y1,v,C.white);}}
    if(sc.p.dot){const q=(b-(sc.b1-sc.b0-C.beatsPerBar))/C.beatsPerBar;   /* the last bar: one LED comes up, slow at first */
      if(q>0){engPut(sc.dy*N+sc.dx,Math.min(1,q*q),C.white);E.dot=[sc.dx,sc.dy];}}}});
engScene('portal',{name:'Portal',entry:['dot'],exit:['outline','frame'],bars:[8,8,16],energy:.3,key:['shape','nest','frame'],
  params:{shape:{pick:[0,0,0,1,2,3]},nest:{pick:[1,1,1,2,3]},grow:{pick:[1,2,2,4]},lw:{pick:[1,1,1,2]},crackle:[4,24],burst:{int:[2,7]},
    jump:[.1,.35],tension:[0,1.5],frame:{p:.5},size:[.22,.42],arm:[.25,.4],tint:{int:[0,1]},fz:[.72,.9],fp:[.35,.7],fs:{pick:[.25,.5,.5,1]}},
  init(sc,E){const N=E.N,h=(N-1)/2,p=sc.p;if(p.shape)p.frame=false;   /* only a square can become the frame */
    sc.exit=p.frame?'frame':'outline';sc.sx=Math.round(sc.ox);sc.sy=Math.round(sc.oy);sc.tx=p.frame?h:sc.sx;sc.ty=p.frame?h:sc.sy;
    sc.r=p.frame?h:Math.max(3,Math.min(Math.round(N*p.size),sc.sx,sc.sy,N-1-sc.sx,N-1-sc.sy));   /* off-centre outlines still fit */
    sc.fz=Math.min(sc.fz,1-ENG_CFG.ghostGap/sc.r);if(p.nest>1||p.lw>1)sc.fp*=ENG_CFG.ghostBusy;},
  say:sc=>['square','diamond','circle','cross'][sc.p.shape]+(sc.p.nest>1?' ×'+sc.p.nest:'')+(sc.p.lw>1?' thick':'')+', grows in '+sc.p.grow+(sc.p.grow>1?' bars':' bar')+
    ', ends as '+(sc.p.frame?'the frame':'an outline'),
  draw(sc,E,dts,b,tick){const C=ENG_CFG,A=EAR,p=sc.p,e=engEaseOut(b/(p.grow*C.beatsPerBar));
    const ox=sc.sx+(sc.tx-sc.sx)*e,oy=sc.sy+(sc.ty-sc.sy)*e;sc.ox=ox;sc.oy=oy;   /* the feedback falls towards the growing centre */
    const ten=e>=1&&!p.frame?Math.round(Math.max(0,A.spr[2])*p.tension*E.mot):0;   /* the mids pull the edge out: outline tension, in whole LEDs */
    for(let k=0;k<p.nest;k++){const rk=engSnap(sc.r*Math.pow(C.nestRatio,k),sc.tx)+(k?0:ten);
      engOutline(ox,oy,rk*e,p.lw,p.shape,Math.pow(C.nestAmp,k),C.white,engSnap(rk*p.arm,sc.tx)*e);}
    E.box={ox:sc.tx,oy:sc.ty,r:sc.r*e,shape:p.shape};if(sc.r*e<2)return;
    const c=C.cold[p.tint];engCrackle(sc.R,Math.floor(p.crackle*dts*(.4+1.6*A.env[4])*(.5+E.ent)*E.mot+sc.R()),p.jump,ox,oy,c);
    if(A.on[1]||(A.gen&&tick&&sc.R()<.4))engCrackle(sc.R,Math.round(p.burst*E.mot),p.jump,ox,oy,c);}});
engScene('inversion',{name:'Inversion',entry:['outline'],exit:['inverted'],bars:[4,8],energy:.6,w:.9,key:['len'],
  params:{arcs:[1,4],len:{int:[3,8]},tint:{int:[0,1]},fz:[.88,.95],fp:[.03,.12],fs:{pick:[.5,1]}},
  init(sc,E){const N=E.N,ob=E.box,b=ob&&ob.r>=3&&ob.r<=N*.35?ob:{ox:(N-1)/2,oy:(N-1)/2,r:N*(.18+.14*sc.R())};sc.bx=Math.round(b.ox);sc.by=Math.round(b.oy);   /* its own size unless the last box was a reasonable one */
    sc.br=Math.max(3,Math.min(Math.round(b.r),sc.bx-1,sc.by-1,N-2-sc.bx,N-2-sc.by));sc.f=sc.tag.startsWith('loop')?2:0;   /* a loop does not flash white again */E.box={ox:sc.bx,oy:sc.by,r:sc.br,shape:0};},
  say:sc=>'black square of '+(2*sc.br+1)+' LEDs in white',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,f=sc.f++;
    if(f===0){if(engFlash(E.t,1))engFill(0,0,N-1,N-1,1,C.white);return;}   /* one frame white, one frame black, then land */
    if(f===1)return;
    const lv=C.light*(.92+.08*A.env[0]);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(Math.max(Math.abs(x-sc.bx),Math.abs(y-sc.by))>sc.br)engPut(y*N+x,lv,C.white);
    const n=(A.on[1]?1:0)+(A.on[2]&&R()<.5?1:0)+(R()<sc.p.arcs*dts*(.3+E.ent)?1:0);   /* lightning from the white into the black, on mids and highs */
    for(let k=0;k<n*E.mot;k++){const s=Math.floor(R()*8*sc.br),[x,y]=engRingPt(sc.bx,sc.br,s);
      engArc(R,Math.round(x),Math.round(y),sc.bx,sc.by,sc.p.len,C.cold[sc.p.tint]);}}});
engScene('accumulation',{name:'Accumulation',entry:['inverted','dark'],exit:['light'],bars:[8,8,16],energy:.45,w:.9,key:['curve'],
  params:{over:[.3,.8],settle:[.08,.3],curve:[1.6,2.8],high:[.3,1],fz:[.88,.95],fp:[.05,.2],fs:{pick:[.5,1]}},
  init(sc,E){const N=E.N,b=sc.from==='inverted'&&E.box;sc.box=b?{x:b.ox,y:b.oy,r:b.r}:null;sc.fill=0;sc.birth=new Float32Array(N*N).fill(-1);
    sc.rank=new Float32Array(N*N);for(let i=0;i<N*N;i++)sc.rank[i]=sc.R();},
  say:sc=>sc.box?'snow inside the black square':'snow on black, a starfield',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,len=sc.b1-sc.b0,prog=engClamp(b/len),t=E.t,B=sc.box;
    const ph=(E.beat/C.beatsPerBar%C.barsPerPhrase)/C.barsPerPhrase;   /* the phrase pushes too: denser towards its end */
    sc.fill=Math.min(1,Math.max(sc.fill,Math.pow(prog,sc.p.curve))+dts*sc.p.high*A.env[4]*.02*(1+ph)*E.mot);if(b>len-1)sc.fill=1;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;
      if(B&&Math.max(Math.abs(x-B.x),Math.abs(y-B.y))>B.r){engPut(i,C.light,C.white);continue;}
      if(sc.rank[i]<sc.fill){if(sc.birth[i]<0)sc.birth[i]=t;engPut(i,Math.min(1,C.light*(1+sc.p.over*Math.exp(-(t-sc.birth[i])/sc.p.settle))),C.white);}}}});   /* fresh flakes arrive overbright and settle */
engScene('puncture',{name:'Puncture',entry:['light'],exit:['frame'],bars:[8,8,16],energy:.75,w:.9,key:['nest'],
  params:{grow:[6,14],start:{int:[2,4]},max:[4,11],hold:[.15,.4],kickN:{int:[1,2]},snareN:{int:[1,1]},rate:[.15,.5],cool:[.15,.5],nest:{p:.4},
    fz:[.88,.95],fp:[.03,.12],fs:{pick:[.5,1]}},
  init(sc,E){const N=E.N,R=sc.R;sc.holes=[];sc.ins=new Uint8Array(N*N);sc.near=new Uint8Array(N*N);sc.rim=new Float32Array(N*N);
    for(let k=0;k<sc.p.start;k++)sc.holes.push(engHole(sc,E,E.t+R()*30/E.bpm));},   /* a lot at once: punched in within half a beat */
  say:sc=>'a few holes, and every kick and snare punches new ones open at once, as big as the hit is hard, then they heal'+(sc.p.nest?', tiny squares at the bottom':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,t=E.t,p=sc.p,len=sc.b1-sc.b0,prog=engClamp(b/len),c=(N-1)/2,IN=sc.ins,NE=sc.near,RM=sc.rim,M=window.MUSIC,K=M.kick,Sn=M.snare;
    /* the hit's own frame: holes open INSTANTLY at the size the hit is worth (strength 0-1), no growing phase; the biggest one first */
    const room=()=>sc.holes.length<C.maxHoles&&prog<.92;
    if(K.on)for(let i=0;i<p.kickN&&room();i++)sc.holes.push(engHole(sc,E,t,(1.1+1.3*K.str)*(i?.5:1)));
    if(Sn.on)for(let i=0;i<p.snareN&&room();i++)sc.holes.push(engHole(sc,E,t,(.8+.9*Sn.str)*(i?.5:.75)));
    if(R()<p.rate*dts*(.5+1.5*prog)*(.4+.6*A.I)&&room())sc.holes.push(engHole(sc,E,t));   /* a rare idle one: few holes exist between the hits */
    sc.holes=sc.holes.filter(h=>{if(t<h.t0)return true;const g=h.g*(1+A.env[2])*Math.max(.3,E.mot)*dts;
      if(h.st===0){h.r+=g;if(h.r>=h.mx){h.r=h.mx;h.st=1;h.th=t;}}else if(h.st===1){if(t-h.th>h.hold)h.st=2;}else{h.r-=g*(1+h.r/6);if(h.r<=0)return false;}   /* grow (idle holes), hold, heal: the bigger, the faster */
      return true;});
    IN.fill(0);NE.fill(0);RM.fill(0);
    for(const h of sc.holes){if(t<h.t0)continue;const e=h.r+1.5,x0=Math.max(1,Math.floor(h.x-e)),x1=Math.min(N-2,Math.ceil(h.x+e)),y0=Math.max(1,Math.floor(h.y-e)),y1=Math.min(N-2,Math.ceil(h.y+e)),fr=Math.exp(-(t-h.t0)/p.cool);
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*N+x,d=Math.hypot(x-h.x,y-h.y)-h.r;if(d<0)IN[i]=1;else if(d<1.5){if(NE[i]<255)NE[i]++;if(d<1)RM[i]=Math.max(RM[i],(1-d)*fr);}}}
    const er=prog>.8?(prog-.8)/.2*(c+1):-1;   /* at the end the rest drains from the centre until only the frame is left */
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;if(x===0||y===0||x===N-1||y===N-1){engPut(i,1,C.white);continue;}
      if(er>0&&Math.max(Math.abs(x-c),Math.abs(y-c))<er)continue;
      if(IN[i]||(NE[i]>1&&R()<.5))continue;   /* between two holes the white filaments flicker */
      engPut(i,C.light+(1-C.light)*RM[i],C.white);}
    for(const h of sc.holes)if(h.nest&&h.r>6)engOutline(Math.round(h.x),Math.round(h.y),1,1,0,.16,C.white,0);}});
/* one hole for Puncture: in the emptiest white of six tries, how fast it grows, how big it gets, how long it holds before it heals */
function engHole(sc,E,t0,hit){const R=sc.R,N=E.N,p=sc.p;let bx=0,by=0,bd=-1e9;
  for(let k=0;k<6;k++){const x=2+R()*(N-5),y=2+R()*(N-5);let d=Math.min(x,y,N-1-x,N-1-y)*.5;   /* the emptiest of six spots */
    for(const h of sc.holes)d=Math.min(d,Math.hypot(x-h.x,y-h.y)-Math.max(h.r,h.mx*.5));if(d>bd){bd=d;bx=x;by=y;}}
  const mx=Math.min(N*.22,p.max*(.6+.8*R())*(hit||1));
  if(hit)return{x:bx,y:by,r:mx,t0,st:1,th:t0,g:p.grow,mx,hold:p.hold*(.5+R())*(.7+.6*hit),nest:p.nest&&R()<.5};   /* a hit: already full size, holds, then heals */
  return{x:bx,y:by,r:0,t0,st:0,g:p.grow*(.6+.8*R()),mx,hold:p.hold*(.5+R()),nest:p.nest&&R()<.5};}
engScene('perimeter',{name:'Perimeter',entry:['frame'],exit:['frame'],bars:[4,8,8,16],energy:.08,key:['crack'],
  params:{crack:{p:.5},rate:[1,6],breathe:[.04,.12],tint:{int:[0,1]},fz:[.8,.9],fp:[.25,.5],fs:{pick:[1,2]}},
  say:sc=>'the outer ring alone'+(sc.p.crack?', crackling':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,h=(N-1)/2;
    E.ne=0;engOutline(h,h,h,1,0,Math.min(1,1-sc.p.breathe*(.5+.5*Math.sin(b*Math.PI/4))+.05*A.spr[0]),C.white,0);
    if(sc.p.crack)engCrackle(sc.R,Math.floor(sc.p.rate*dts*(.3+2*A.env[4])*E.mot+sc.R()),.15,h,h,C.cold[sc.p.tint]);}});
engScene('tracer',{name:'Tracer',entry:['frame'],exit:['dot','dark'],bars:[4,8,8,16],energy:.55,key:['n','lap'],
  params:{n:{int:[2,4]},lap:{pick:[.5,1,1,2]},tail:[.08,.18],flipP:[.25,.5],dark:{p:.3},fz:[.8,.9],fp:[.4,.65],fs:{pick:[.25,.5]}},
  init(sc,E){const N=E.N;sc.P=4*(N-1);sc.head=sc.R()*sc.P;sc.dir=sc.R()<.5?1:-1;sc.bar=Math.floor(E.beat/ENG_CFG.beatsPerBar);sc.exit=sc.p.dark?'dark':'dot';},
  say:sc=>sc.p.n+' tracers shooting round the edge, a lap every '+sc.p.lap+(sc.p.lap>1?' beats':' beat')+', all turning round now and then on the bar',
  /* 2-4 comets round the whole edge, all one way, fast; on a bar line now and then they all turn round. Only the edge is drawn: the strong
     feedback fills the middle with their echoes (and keeps what was there) */
  draw(sc,E,dts,b,tick,db){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,P=sc.P,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),bar=Math.floor(E.beat/C.beatsPerBar);
    if(bar!==sc.bar){sc.bar=bar;if(b>.5&&b<end&&R()<p.flipP)sc.dir=-sc.dir;}   /* all of them turn round, on the bar */
    const v=P/p.lap*(.7+.5*A.I)*(1+.5*Math.max(0,A.spr[0]))*(1-q);sc.head+=sc.dir*v*db;
    const tl=Math.max(2,p.tail*P*(1-.7*q));
    for(let k=0;k<p.n;k++){const hk=sc.head+k*P/p.n,fade=q>.5&&(k>0||sc.exit==='dark')?Math.max(0,2-2*q)*2-1:1;if(fade<=0)continue;
      for(let j=0;j<=tl;j++){const w=j<2?1:Math.pow(1-j/(tl+1),1.5);engPut(engPerim(Math.floor(hk-sc.dir*j),N),w*Math.min(1,fade),C.white);}}
    if(sc.exit==='dot'&&q>.5){const i=engPerim(Math.floor(sc.head),N);E.dot=[i%N,Math.floor(i/N)];}}});
engScene('rings',{name:'Tunnel rings',entry:['dark','frame','outline'],exit:['frame','outline'],bars:[4,8,8,16],energy:.8,key:['dir','shape'],
  params:{dir:{pick:[-1,-1,1]},speed:[.3,.9],shape:{pick:[0,0,0,1]},fade:[1,2.5],every:{pick:[1,2]},frame:{p:.6},fz:[.88,.95],fp:[.08,.25],fs:{pick:[.25,.5]}},
  init(sc){sc.rings=[];sc.exit=sc.p.frame?'frame':'outline';},
  say:sc=>sc.p.heavy?'thick squares shooting out on every bass hit':(sc.p.dir<0?'streaming in':'streaming out')+(sc.p.shape?', diamonds':'')+', a ring per kick',
  draw(sc,E,dts,b,tick){const C=ENG_CFG,A=EAR,N=E.N,h=(N-1)/2,p=sc.p,end=sc.b1-sc.b0-C.beatsPerBar,hv=!!p.heavy,bass=A.on[0]||hv&&A.pe.lon&&A.band[0]>.5;
    const spawn=b<end&&(bass||(tick&&(A.gen||E.t-A.onT[0]>2)&&Math.floor(E.beat)%p.every===0));
    if(spawn&&sc.rings.length<C.maxRings)sc.rings.push({s:p.dir<0?1:.04,lw:bass?engBassLw(hv?1.6:.6):1});   /* a bass ring is a thick one */
    const sp=hv?3.2/(1.5*60/E.bpm)*(.8+.4*E.mot):p.speed*(.4+1.6*A.env[2])*(.6+.8*E.ent)*E.mot;   /* heavy: out to the frame in a beat and a half */
    sc.rings=sc.rings.filter(o=>{o.s*=Math.exp(p.dir*sp*dts);return o.s>.03&&o.s<=1.001;});
    E.ne=0;for(const o of sc.rings)engOutline(h,h,engSnap(o.s*h,h),o.lw,p.shape,hv?.45+.55*Math.sqrt(o.s):Math.pow(o.s,p.fade),C.white,0);
    const q=engClamp((b-end)/C.beatsPerBar),rr=sc.exit==='frame'?h:engSnap(h*.45,h);if(q>0)engOutline(h,h,rr,1,0,q,C.white,0);
    E.box={ox:h,oy:h,r:rr,shape:0};}});
engScene('ripple',{name:'Ripple',entry:['dark','dot'],exit:['dark'],bars:[4,8,8],energy:.55,w:.9,key:['shape','train'],
  params:{shape:{pick:[2,2,0,1]},speed:[12,30],train:{int:[1,3]},decay:[1,3],fz:[.85,.95],fp:[.15,.35],fs:{pick:[.25,.5]}},
  init(sc,E){sc.rip=[];if(sc.from==='dot'&&E.dot)sc.rip.push({x:E.dot[0],y:E.dot[1],t0:E.t});},
  say:sc=>['square','diamond','circle'][sc.p.shape]+' ripples'+(sc.p.train>1?' in trains of '+sc.p.train:'')+' on the sub',
  draw(sc,E,dts,b,tick){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,t=E.t,p=sc.p,end=sc.b1-sc.b0-C.beatsPerBar;
    if(b<end&&((A.on[0]&&A.band[0]>.4)||(A.gen&&tick&&R()<.5))){const x=Math.round(N*(.15+.7*R())),y=Math.round(N*(.15+.7*R())),gap=60/E.bpm/4;
      const lw=A.on[0]?engBassLw(.7):1;for(let k=0;k<p.train&&sc.rip.length<C.maxRings;k++)sc.rip.push({x,y,t0:t+k*gap,lw:k?Math.max(1,lw-1):lw});}
    const tau=Math.max(.25,Math.min(2,A.rel[0]*p.decay*3));   /* the rings fade as fast as the bass does */
    sc.rip=sc.rip.filter(r=>{const age=t-r.t0;if(age<0)return true;const v=Math.exp(-age/tau),rad=age*p.speed*(.6+.8*A.env[2]);
      if(v<.03||rad>N*1.5)return false;engOutline(r.x,r.y,rad,r.lw||1,p.shape,v,C.white,0);return true;});}});
engScene('rain',{name:'Rain',entry:['dark'],exit:['dark'],bars:[4,8,8],energy:.5,w:.9,key:['dir','cold'],
  params:{base:[2,8],high:[10,40],speed:[18,50],tail:{int:[3,10]},dir:{pick:[1,1,-1]},cold:{p:.4},fz:[.9,.97],fp:[.05,.2],fs:{pick:[.5,1]}},
  init(sc){sc.drops=[];},say:sc=>(sc.p.dir>0?'falling':'rising')+', '+sc.p.tail+' LED tails',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,end=sc.b1-sc.b0-C.beatsPerBar,c=p.cold?C.cold[0]:C.white;
    let n=b<end?Math.floor((p.base+p.high*A.env[4]*(1+E.ent))*E.mot*dts+R())+(A.on[2]?1+Math.floor(R()*2):0):0;
    for(;n>0;n--)sc.drops.push({x:Math.floor(R()*N),y:p.dir>0?-1:N,v:p.speed*(.7+.6*R())});
    sc.drops=sc.drops.filter(d=>{d.y+=p.dir*d.v*dts;if(p.dir>0?d.y-p.tail>N:d.y+p.tail<-1)return false;
      for(let j=0;j<=p.tail;j++)engPutXY(d.x,d.y-p.dir*j,Math.pow(1-j/(p.tail+1),1.5),c);return true;});}});
/* Scanner, a radar: a heavy bar sweeps left to right (a sweep per half bar, bar or two, starting on the bar line) with a fading trail; as it
   passes it lights the outlines of hidden shapes, which glow on faintly and fade like a radar screen's afterglow. The shapes drift, one is
   replaced every sweep and sometimes on a kick; a kick makes the beam wider and brighter */
engScene('scanner',{name:'Scanner',entry:['dark','frame'],exit:['dark','frame'],bars:[4,8,8],energy:.5,w:.8,key:['per','n'],
  params:{per:{pick:[2,4,4,8]},w:{int:[3,6]},trail:{int:[6,14]},n:{int:[3,7]},tau:[.4,1],faint:[.3,.5],frame:{p:.4},fz:[.9,.97],fp:[.05,.15],fs:{pick:[.5,1]}},
  init(sc,E){const N=E.N;sc.pb=new Float32Array(N*N);sc.tg=[];for(let k=0;k<sc.p.n;k++)sc.tg.push(engBlip(sc,E));sc.px=-1;sc.exit=sc.p.frame?'frame':'dark';},
  say:sc=>'a radar sweep every '+sc.p.per+' beats, '+sc.p.n+' faint shapes in its wake',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,PB=sc.pb,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),bx=(E.beat%p.per)/p.per*N;
    if(sc.px<0)sc.px=bx;
    const wrap=bx<sc.px-N/2;   /* a new sweep: the shapes drift, one is replaced */
    if(wrap){for(const t of sc.tg){t.x+=t.vx;t.y+=t.vy;}sc.tg[Math.floor(R()*sc.tg.length)]=engBlip(sc,E);}
    if(A.on[0]&&R()<.25)sc.tg[Math.floor(R()*sc.tg.length)]=engBlip(sc,E);
    const cols=[],a=Math.floor(sc.px),z=Math.floor(bx);if(wrap){for(let x=a+1;x<N;x++)cols.push(x);for(let x=0;x<=z;x++)cols.push(x);}else for(let x=a+1;x<=z;x++)cols.push(x);
    const clut=.012*(.3+A.env[4])*(.5+.5*A.I);
    for(const x of cols){if(x<0||x>=N)continue;
      for(const t of sc.tg){if(Math.abs(x-t.x)>t.r+1)continue;for(let y=Math.max(0,Math.floor(t.y-t.r-1));y<=Math.min(N-1,Math.ceil(t.y+t.r+1));y++){
        if(engForm(t.k,x-t.x,y-t.y,t.r)>0&&engForm(t.k,x-t.x,y-t.y,t.r-1.3)<=0){const i=y*N+x;PB[i]=Math.max(PB[i],1);}}}   /* the beam lights the outline */
      for(let y=0;y<N;y++)if(R()<clut){const i=y*N+x;PB[i]=Math.max(PB[i],.5);}}   /* radar clutter with the highs */
    sc.px=bx;
    const dk=Math.exp(-dts/(p.tau*p.per*60/E.bpm)),fv=p.faint*(.6+.4*A.I)*(1-q);
    for(let i=0;i<N*N;i++){PB[i]*=dk;if(PB[i]>.01)engPut(i,PB[i]*fv,C.cold[0]);}
    const w=Math.round(p.w+2*Math.max(0,A.spr[0])),bb=(A.on[0]?1:.85+.15*A.env[0])*(1-q),X=Math.floor(bx);   /* the heavy beam and its trail */
    for(let j=-1;j<w+p.trail;j++){const x=X-j;if(x<0||x>=N)continue;const v=j<0?.3:j<w?1:.6*Math.pow(1-(j-w)/p.trail,2);engFill(x,0,x,N-1,v*bb,C.white);}
    if(sc.exit==='frame'&&q>0)engOutline((N-1)/2,(N-1)/2,(N-1)/2,1,0,q,C.white,0);}});
/* a hidden shape for the radar: where, how big, which form, how it drifts per sweep */
function engBlip(sc,E){const R=sc.R,N=E.N;return{x:6+R()*(N-12),y:6+R()*(N-12),r:3+R()*N*.12,k:Math.floor(R()*5),vx:(R()-.5)*4,vy:(R()-.5)*4};}engScene('shatter',{name:'Shatter',entry:['frame','outline','light','inverted','chaos'],exit:['dark'],bars:[2,4],energy:.85,w:.8,untilDone:true,key:['blk'],
  params:{blk:{int:[2,6]},speed:[6,22],fade:[.6,2],fz:[.9,.97],fp:[.15,.35],fs:{pick:[.25,.5]}},
  init(sc,E){const N=E.N,O=E.out,B=sc.p.blk,c=(N-1)/2,R=sc.R;sc.fr=[];sc.t0=E.t;
    for(let by=0;by<N;by+=B)for(let bx=0;bx<N;bx+=B){const px=[];
      for(let y=by;y<Math.min(N,by+B);y++)for(let x=bx;x<Math.min(N,bx+B);x++){const j=(y*N+x)*3,v=Math.max(O[j],O[j+1],O[j+2]);if(v>.15)px.push(x-bx,y-by,v);}
      if(!px.length)continue;const cx=bx+B/2-c,cy=by+B/2-c,d=Math.hypot(cx,cy)||1,s=sc.p.speed*(.5+R())*(1+EAR.env[0]);
      sc.fr.push({x:bx,y:by,vx:cx/d*s+(R()-.5)*4,vy:cy/d*s+(R()-.5)*4,px});}if(!sc.fr.length)sc.done=true;},
  say:sc=>'the picture breaks into '+sc.fr.length+' pieces'+(sc.fr.length?'':', nothing to break: over at once'),
  draw(sc,E,dts){const C=ENG_CFG,A=EAR,f=Math.exp(-(E.t-sc.t0)/(sc.p.fade*(.5+A.rel[0]*2.5)));
    for(const r of sc.fr){if(A.on[0]){r.vx*=1.2;r.vy*=1.2;}r.x+=r.vx*dts;r.y+=r.vy*dts;
      for(let k=0;k<r.px.length;k+=3)engPutXY(r.x+r.px[k],r.y+r.px[k+1],r.px[k+2]*f,C.white);}
    if(f<.02)sc.done=true;}});
engScene('heartbeat',{name:'Heartbeat',entry:['dark','dot'],exit:['dot','dark'],bars:[4,8,8],energy:.08,key:['shape','echo'],
  params:{shape:{pick:[0,0,1,2,4]},base:[1,3],k:[6,24],lw:{int:[2,3]},echo:{p:.7},dark:{p:.3},fz:[.8,.9],fp:[.3,.55],fs:{pick:[.5,1]}},
  init(sc,E){const h=Math.round((E.N-1)/2);sc.x=sc.from==='dot'&&E.dot?E.dot[0]:h;sc.y=sc.from==='dot'&&E.dot?E.dot[1]:h;sc.exit=sc.p.dark?'dark':'dot';sc.echoes=[];},
  say:sc=>'thick '+['square','diamond','circle','','block'][sc.p.shape]+' on the sub and the mids'+(sc.p.echo?', an echo on every kick':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar);
    const kp=window.MUSIC.kick.pulse,e=Math.min(1.6,Math.max(0,Math.max(kp,window.FEEL?FEEL.spring:0)))*(1-q);   /* the kick's own hit-latched pulse (not the sustained sub level, not scaled by the quiet-scene intensity), then Feel's spring follow-through: swells on the hit, overshoots, settles */
    const s=Math.max(0,Math.round(p.base+p.k*e)),v=Math.max(sc.exit==='dot'?q:0,.45+.55*Math.min(1,e)),k=p.shape===4?0:p.shape;
    if(p.shape===4)engFill(sc.x-s,sc.y-s,sc.x+s,sc.y+s,v*.85,C.white);else engOutline(sc.x,sc.y,s,p.lw,k,v,C.white,0);
    if(p.echo&&A.on[0]&&q<1&&sc.echoes.length<6)sc.echoes.push({t0:E.t,s0:s,lw:Math.max(p.lw,engBassLw())});   /* an echo of the shape runs outward on every kick */
    sc.echoes=sc.echoes.filter(o=>{const a=(E.t-o.t0)/.6;if(a>=1)return false;engOutline(sc.x,sc.y,o.s0+a*N*.35,o.lw,k,.5*Math.pow(1-a,1.5)*(1-q),C.white,0);return true;});
    if(sc.exit==='dot')E.dot=[sc.x,sc.y];}});/* is (dx,dy) inside a form of size r: 0 square, 1 diamond, 2 circle, 3 cross, 4 ring; 5 a face: 1 inside, -1 on the eyes and the mouth */
function engForm(k,dx,dy,r){const ax=Math.abs(dx),ay=Math.abs(dy);
  if(k===0)return Math.max(ax,ay)<=r?1:0;if(k===1)return ax+ay<=r?1:0;if(k===2)return Math.hypot(dx,dy)<=r?1:0;
  if(k===3){const a=r*.35;return Math.min(Math.max(ax-r,ay-a),Math.max(ax-a,ay-r))<=0?1:0;}if(k===4)return Math.abs(Math.hypot(dx,dy)-r*.8)<=r*.22?1:0;
  if((dx/(r*.8))**2+(dy/r)**2>1)return 0;
  if(Math.hypot(ax-r*.33,dy+r*.25)<=r*.14)return-1;const m=Math.hypot(dx,dy+r*.05);return dy>r*.2&&m>=r*.42&&m<=r*.56?-1:1;}
engScene('static',{name:'Static',entry:['dark','frame','light','chaos'],exit:['chaos','dark'],bars:[2,4,4],energy:.95,w:.6,key:['tear','dark','forms','holes'],
  params:{base:[.005,.03],high:[.05,.25],tear:{p:.6},bright:[.4,1],dark:{p:.35},forms:{p:.8},holes:{p:.75},face:{p:.4},holeP:[.4,.9],holeMax:[5,14],
    fz:[.9,.97],fp:[.05,.2],fs:{pick:[.25,.5]}},
  init(sc){sc.exit=sc.p.dark?'dark':'chaos';sc.tears=[];sc.form=null;sc.holes=[];},
  say:sc=>'dithered snow'+(sc.p.forms?', shapes surfacing'+(sc.p.face?' (a face now and then)':''):'')+(sc.p.holes?', black holes on the kicks':'')+(sc.p.tear?', tears':''),
  draw(sc,E,dts,b,tick){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,h=(N-1)/2,end=sc.b1-sc.b0-C.beatsPerBar,fade=sc.exit==='dark'?1-engClamp((b-end)/C.beatsPerBar):1;
    /* a form surfaces out of the snow (denser inside, thinner outside) and sinks back over one or two beats */
    if(p.forms&&!sc.form&&((tick&&Math.floor(E.beat)%C.beatsPerBar===0&&R()<.7)||(A.on[1]&&R()<.3)))
      sc.form={k:p.face&&R()<.18?5:Math.floor(R()*5),x:h+(R()-.5)*N*.3,y:h+(R()-.5)*N*.3,r:N*(.22+.22*R())*(1.25),t0:E.t,dur:60/E.bpm*(1+R())};
    let fa=0;const F=sc.form;if(F){const q=(E.t-F.t0)/F.dur;if(q>=1)sc.form=null;else fa=(q<.15?q/.15:1-(q-.15)/.85)*(F.k===5?.8:1);}   /* the face stays a little subtler */
    const d=(p.base+p.high*A.env[4]*(.5+E.ent)+.08*A.env[0])*E.mot*fade;   /* the kicks push snow too */
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let dd=d;
      if(fa>0){const f=engForm(F.k,x-F.x,y-F.y,F.r);dd=f>0?d*(1+2.5*fa):f<0?d*(1-fa):d*(1-.75*fa);}
      if(R()<dd)engPut(y*N+x,p.bright*(.3+.7*R()),R()<.3?C.cold[0]:C.white);}
    if(p.holes&&A.on[0]&&R()<p.holeP&&sc.holes.length<6)sc.holes.push({x:N*(.15+.7*R()),y:N*(.15+.7*R()),r:p.holeMax*(.6+.8*R()),t0:E.t,life:.35+.6*R()});
    if(p.tear&&(A.on[1]||R()<.5*dts))sc.tears.push({y:Math.floor(R()*N),f:2+Math.floor(R()*2)});
    sc.tears=sc.tears.filter(s=>{engFill(0,s.y,N-1,s.y,.5*fade,C.white);return --s.f>0;});},
  /* black holes, cut after the feedback so the tunnel carries them: they open and close again, with a bright rim */
  post(sc,E){const N=E.N,O=E.out,c=ENG_CFG.white;sc.holes=sc.holes.filter(H=>{const q=(E.t-H.t0)/H.life;if(q>=1)return false;const r=H.r*Math.sin(Math.PI*q),e=r+1.5;
    for(let y=Math.max(0,Math.floor(H.y-e));y<=Math.min(N-1,Math.ceil(H.y+e));y++)for(let x=Math.max(0,Math.floor(H.x-e));x<=Math.min(N-1,Math.ceil(H.x+e));x++){
      const dd=Math.hypot(x-H.x,y-H.y),j=(y*N+x)*3;if(dd<r)O[j]=O[j+1]=O[j+2]=0;else if(dd<e){const v=.9*(1-q);for(let k=0;k<3;k++)O[j+k]=Math.max(O[j+k],v*c[k]);}}
    return true;});}});
/* Corridor: a ride through a metro tube. Round (or square) tunnel rings rush at you out of the dark; every few bars the tube bends left,
   right, up or down into a corner (eased in on a spring, a little overshoot) and the far end swings away while you lean into it. A row of
   lamps along the ceiling streaks past overhead, two rails run underneath. A kick surges the speed and flashes the near rings (thick with
   the bass), a snare flares the lamps, the hats strike sparks off the rails */
engScene('corridor',{name:'Corridor',entry:['frame','dark'],exit:['frame'],bars:[4,8,8],energy:.6,w:.9,key:['shape','spd','turn'],
  params:{shape:{pick:[2,2,0]},spd:{pick:[1,2,2]},lamps:{int:[1,2]},bend:[.5,1],turn:{pick:[1,2,2,4]},rails:{p:.7},wall:[.15,.3],fz:[.88,.95],fp:[.1,.3],fs:{pick:[.25,.5]}},
  init(sc){Object.assign(sc,{s:0,bx:0,by:0,vx:0,vy:0,tx:0,ty:0,boost:0,flash:0,flare:0,bar:-1});},
  say:sc=>'a ride through a '+(sc.p.shape===2?'round':'square')+' metro tube, '+sc.p.spd+' ring'+(sc.p.spd>1?'s':'')+' a beat, a corner every '+(sc.p.turn>1?sc.p.turn+' bars':'bar')+', lamps shooting past overhead',
  draw(sc,E,dts,b,tick,db){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,h=(N-1)/2,p=sc.p,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),k1=1-q;
    const D=1.2,zN=.55,zF=16,f=1.05*h,BX=.042,BY=.02,hd=Math.min(dts,.033),bar=Math.floor(b/C.beatsPerBar);   /* depth in tube radii; a ring at depth 1 fills the panel */
    if(bar!==sc.bar){sc.bar=bar;if(bar>0&&bar%p.turn===0){const s=R()<.25?0:(R()<.5?-1:1)*(.5+.5*R());sc.tx=s*p.bend*BX;sc.ty=R()<.5?0:(R()-.5)*2*p.bend*BY;}}   /* corners start on bar lines */
    const w=2*Math.PI*.6;sc.vx+=(w*w*(sc.tx-sc.bx)-2*.8*w*sc.vx)*hd;sc.bx+=sc.vx*hd;sc.vy+=(w*w*(sc.ty-sc.by)-2*.8*w*sc.vy)*hd;sc.by+=sc.vy*hd;
    if(A.on[0]){sc.boost=Math.max(sc.boost,.3+.7*A.I);sc.flash=1;}if(A.on[1])sc.flare=1;
    sc.boost*=Math.exp(-dts/.35);sc.flash*=Math.exp(-dts/.12);sc.flare*=Math.exp(-dts/.18);
    const v1=Math.max(.2,E.mot)*(1+sc.boost);sc.s+=db*p.spd*D*v1;   /* locked to the beat, a surge on every kick */
    /* the tube's middle at depth z bends away as bx·z², so on the panel it shifts with z: the near rings hardly move, the far end swings */
    const bank=-.35*sc.bx/BX,cx=z=>h+f*sc.bx*z,cy=z=>h+f*sc.by*z,fog=z=>Math.pow(engClamp(1-(z-zN)/(zF-zN)),1.4);
    const at=(z,a,m)=>{let c=Math.cos(a),s=Math.sin(a);if(p.shape===0){const k=1/Math.max(Math.abs(c),Math.abs(s));c*=k;s*=k;}const r=f/z*m;return[cx(z)+r*c,cy(z)+r*s];};   /* a point on the wall at angle a */
    const off=((sc.s%D)+D)%D;
    for(let z=D-off;z<zF;z+=D){if(z<zN)continue;const r=f/z;if(r<1)break;   /* the tube's rings, rushing at you */
      engOutline(cx(z),cy(z),r,sc.flash>.4&&z<4?engBassLw():1,p.shape,Math.min(1,(p.wall*(.5+.5*A.I)+.6*sc.flash)*fog(z))*k1,C.white,0);}
    const L=D/p.lamps,lo=((sc.s+L/2)%L+L)%L,sl=.08+.12*v1*p.spd,la=-Math.PI/2+bank;   /* the ceiling lamps: streaks as long as you are fast, off the top edge as they pass */
    for(let z=L-lo;z<zF;z+=L){if(z<zN*.7)continue;const fo=fog(z),[x0,y0]=at(z,la,.88),[x1,y1]=at(z*(1+sl),la,.88);
      engLine(x0,y0,x1,y1,Math.min(1,(.35+.65*fo)*(.6+.4*A.I)+.5*sc.flare*fo)*k1,C.white);}
    if(p.rails)for(const sd of[-1,1]){const a=Math.PI/2+bank+sd*.42;for(let z=zN;z<zF*.8;z*=1.02){const[x,y]=at(z,a,.95);engPutXY(x,y,.3*fog(z)*k1,C.cold[0]);}}   /* the rails, curving into the corner */
    if(A.on[2]&&q<1)for(let n=0;n<3;n++){const[x,y]=at(.9+1.5*R(),Math.PI/2+bank+(R()<.5?-1:1)*.42,.95),xx=Math.round(x),yy=Math.round(y)-Math.floor(R()*2);   /* sparks off the wheels on the hats */
      if(xx>=0&&yy>=0&&xx<N&&yy<N)engSpark(yy*N+xx,R()<.5?C.white:C.cold[0],1,.1);}
    if(q>0)engOutline(h,h,h,1,0,q,C.white,0);}});/* Figures: one figure (golden spiral, flower of life, Metatron's cube, eye of providence, Mandelbrot, spirograph, rose...) is the whole
   picture: big, drawn further and in more detail the more the mids and vocals play, a pen tracing round it, turning with the melody */
engScene('figures',{name:'Figures',entry:['dark','dot'],exit:['dark'],bars:[4,8,8,16],energy:.35,key:['fig'],
  params:{fig:{pick:ENG_GLYPHS},size:[.3,.38],fz:[.86,.93],fp:[.15,.35],fs:{pick:[.25,.5]}},
  say:sc=>'the figure '+sc.p.fig+', drawn by the mids and the voice',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),grow=engEaseOut(Math.min(1,b/2));
    const raw=Math.max(.45,engClamp(A.env[2]*1.2)*(1-.5*A.flat)*(.4+.6*A.I));sc.m=(sc.m||.45)+(raw-(sc.m||.45))*(1-Math.exp(-dts/(raw>(sc.m||0)?.4:.9)));
    if(E.gSc!==sc.n){E.gSc=sc.n;E.gp=0;}engFigure(sc.p.fig,sc.m,dts,sc.p.size*grow*(1-q),.1*grow*(1-q),(.45+.5*sc.m)*(1-q));}});/* Dynamo: a thick circle, square or triangle that stands still while current shoots round its line far faster than the panel can show:
   a dim cold outline with 2-4 bright heads and tails racing round it (now and then a head jumps ahead, like a wheel in a strobe), turning
   back on the snare, the line crackling with the highs, throwing lightning off its edge; a kick lights the whole outline and makes it thicker;
   a glow round it bounces on a spring with the kick and the mids, and sparks fly off the heads on the snare, the hats and the highs */
engScene('dynamo',{name:'Dynamo',entry:['dark','outline','frame'],exit:['outline','dark'],bars:[2,4,4,8],energy:.85,w:.8,key:['shape','heads'],
  params:{shape:{pick:[0,0,3,4]},size:[.28,.42],lw:{int:[1,3]},heads:{int:[2,4]},tail:[.12,.3],spin:[6,18],rot:[1,4],arcs:[3,10],dark:{p:.4},glow:[.6,1],spray:{int:[6,14]},
    fz:[.86,.93],fp:[.08,.2],fs:{pick:[.25,.5]}},
  init(sc){sc.ph=Array.from({length:sc.p.heads},()=>sc.R());sc.th=sc.p.shape===4?Math.PI/4:0;sc.rd=1;sc.gx=0;sc.gv=0;sc.parts=[];sc.exit=sc.p.dark?'dark':'outline';},
  say:sc=>'a still '+['circle','','','triangle','square'][sc.p.shape]+', '+sc.p.heads+' heads of current at ~'+Math.round(sc.p.spin)+' rounds a second, a bouncing glow and flying sparks',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,h=(N-1)/2,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),grow=engEaseOut(Math.min(1,b*2));
    const sp=p.spin*(.4+.9*A.I)*(.6+.4*E.mot)*(1+A.env[4]),kick=A.on[0];
    if(A.on[1])sc.rd=-sc.rd;   /* the shape never turns: only the current on it does, and the snare sends it back the other way */
    for(let i=0;i<sc.ph.length;i++)sc.ph[i]=((sc.ph[i]+sc.rd*sp*dts+(R()<.3?R()*.5:0))%1+1)%1;   /* the strobe jumps make it look too fast to follow */
    const Rr=Math.max(1,N*p.size*grow*(1-q)*(1+.08*Math.max(0,A.spr[0]))),lw=p.lw+(kick?1:0),n=p.shape===3?3:4;
    const pt=u=>{if(p.shape===0){const a=2*Math.PI*u+sc.th;return[h+Rr*Math.cos(a),h+Rr*Math.sin(a),Math.cos(a),Math.sin(a)];}
      const f=u*n,k=Math.floor(f),fr=f-k,a0=sc.th+2*Math.PI*k/n-Math.PI/2,a1=a0+2*Math.PI/n,am=a0+Math.PI/n;
      return[h+Rr*(Math.cos(a0)*(1-fr)+Math.cos(a1)*fr),h+Rr*(Math.sin(a0)*(1-fr)+Math.sin(a1)*fr),Math.cos(am),Math.sin(am)];};
    const P=p.shape===0?2*Math.PI*Rr:n*2*Rr*Math.sin(Math.PI/n),S=Math.ceil(P*2);
    for(let s=0;s<S;s++){const u=s/S,[x,y,nx,ny]=pt(u);let v=.28*(1-.6*A.env[4]*R()),hot=false;   /* the dim line crackles with the highs */
      for(const ph of sc.ph){const d=(((ph-u)*sc.rd)%1+1)%1;if(d<p.tail){const w=Math.pow(1-d/p.tail,1.5);if(w>v){v=w;hot=true;}}}   /* the tail trails the head */
      if(kick){v=1;hot=true;}
      for(let o=-(lw-1)/2;o<=(lw-1)/2+1e-6;o+=.5)engPutXY(x+nx*o,y+ny*o,v*(1-q),hot?C.white:C.cold[0]);
      if(hot&&!kick&&v>.5&&R()<.35){const o=((lw-1)/2+1)*(R()<.5?-1:1);engPutXY(x+nx*o,y+ny*o,v*.6*(1-q),C.cold[0]);}}   /* the current flicks off the band, the line itself stays */
    /* the glow: a soft halo either side of the band on its own spring (kick and mids), so it swells, overshoots and settles */
    const gw=2*Math.PI*3,hd=Math.min(dts,.033);sc.gv+=(gw*gw*(.7*A.env[0]+.5*A.env[2]-sc.gx)-2*.35*gw*sc.gv)*hd;sc.gx+=sc.gv*hd;
    const gx=Math.max(0,sc.gx),gr=(2+6*gx)*grow*(1-q),gb=p.glow*.3*(.35+.65*Math.min(1.3,gx))*(1-q);
    if(gr>.5&&gb>.01)for(let s=0;s<S;s+=2){const[x,y,nx,ny]=pt(s/S);for(let o=.5;o<=gr;o+=.5){const v=gb*Math.pow(1-o/gr,2),e=(lw-1)/2+o;
      engPutXY(x+nx*e,y+ny*e,v,C.cold[1]);engPutXY(x-nx*e,y-ny*e,v*.7,C.cold[1]);}}
    /* sparks flung off the heads, along the spin and outward: a spray on the snare, a few on the hats, a trickle with the highs */
    let ns=(A.on[1]?p.spray:0)+(A.on[2]?2:0)+(R()<A.env[4]*20*dts*A.I?1:0);
    for(;ns>0&&sc.parts.length<220;ns--){const u=sc.ph[Math.floor(R()*sc.ph.length)],[x,y,nx,ny]=pt(u),[x2,y2]=pt((u+.002)%1),[x1,y1]=pt((u+.998)%1);
      const tl=Math.hypot(x2-x1,y2-y1)||1,tx=(x2-x1)/tl*sc.rd,ty=(y2-y1)/tl*sc.rd,s=(25+35*R())*(.6+.6*A.I),o=.3+.7*R();
      sc.parts.push({x,y,vx:(tx*(1-o*.5)+nx*o)*s,vy:(ty*(1-o*.5)+ny*o)*s,t0:E.t,life:.3+.3*R(),c:R()<.5?C.white:C.cold[0]});}
    sc.parts=sc.parts.filter(P=>{const a=(E.t-P.t0)/P.life;if(a>=1)return false;const dr=Math.exp(-dts*2.5);P.vx*=dr;P.vy*=dr;P.x+=P.vx*dts;P.y+=P.vy*dts;
      engPutXY(P.x,P.y,1-a,P.c);engPutXY(P.x-P.vx*hd*.7,P.y-P.vy*hd*.7,.5*(1-a),P.c);return true;});
    let na=(A.on[2]?1:0)+(A.on[1]?2:0)+(R()<p.arcs*dts*(.3+A.I)?1:0);
    for(;na>0;na--){const[x,y,nx,ny]=pt(R());engArc(R,Math.round(x),Math.round(y),Math.round(x+nx*20),Math.round(y+ny*20),3+Math.floor(R()*6),C.cold[R()<.5?0:1]);}
    E.box={ox:h,oy:h,r:Rr,shape:0};}});
/* Core: a white circle or square in the middle bounces on a spring to the kick and the mids; on every bar line black particles burst out of
   the middle (black through the white, faint white streaks outside it), the core puffs up and flicks through a few shapes, lands on a new one
   and bounces on in it; again every bar */
engScene('core',{name:'Core',entry:['dark','dot'],exit:['dot','dark'],bars:[4,8,8,16],energy:.6,key:['shape','parts'],
  params:{shape:{pick:[0,2]},size:[.16,.26],bounce:[.8,1.6],open:[.45,.8],parts:{int:[50,110]},speed:[30,60],morphs:{int:[2,4]},dot:{p:.5},fz:[.88,.94],fp:[.03,.1],fs:{pick:[.25,.5]}},
  init(sc,E){sc.k=sc.p.shape;sc.x=0;sc.v=0;sc.parts=[];sc.bar=Math.floor(E.beat/ENG_CFG.beatsPerBar);sc.burst=-9;sc.seq=null;sc.exit=sc.p.dot?'dot':'dark';},
  say:sc=>['square','diamond','circle'][sc.p.shape]+' core swaying big on the beat, opening up in the middle when it swings wide, a black burst and a new shape every bar',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,R=sc.R,p=sc.p,h=(N-1)/2,L=E.lay,t=E.t,end=sc.b1-sc.b0-C.beatsPerBar,bar=Math.floor(E.beat/C.beatsPerBar);
    if(bar!==sc.bar){sc.bar=bar;if(b>.5&&b<end){   /* the bar line: the black burst */
      const n=Math.round(p.parts*(.5+.5*A.I));for(let k=0;k<n;k++){const a=R()*2*Math.PI,s=p.speed*(.5+R())*(.6+.4*E.mot);
        sc.parts.push({x:h,y:h,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t0:t,life:.4+.5*R()});}
      const seq=[];let k=sc.k;for(let i=0;i<p.morphs;i++){let q;do q=Math.floor(R()*5);while(q===k);seq.push(q);k=q;}
      if(k!==0&&k!==2&&R()<.7)seq.push(sc.k===0?2:0);   /* it mostly lands on a circle or a square */
      sc.seq={t0:t,list:seq,dur:.06};sc.burst=t;sc.v+=6;}}
    if(sc.seq){const i=Math.floor((t-sc.seq.t0)/sc.seq.dur);if(i>=sc.seq.list.length){sc.k=sc.seq.list[sc.seq.list.length-1];sc.seq=null;}else sc.k=sc.seq.list[i];}
    const w=2*Math.PI*4,hd=Math.min(dts,.033),tg=p.bounce*(A.env[0]+.5*A.env[2])*E.mot*(.4+.6*A.I);   /* its own spring: bouncier than the global one, big sways */
    sc.v+=(w*w*(tg-sc.x)-2*.3*w*sc.v)*hd;sc.x+=sc.v*hd;
    const q=engClamp((b-end)/C.beatsPerBar),grow=engEaseOut(Math.min(1,b)),r=Math.min(N*(engClimax()?.75:.42),Math.max(.5,N*p.size*(.6+.4*A.I)*(1+sc.x+.6*Math.exp(-(t-sc.burst)/.15))*grow*(1-q)));
    const op=engClamp((sc.x-p.open)/.6),ri=op>0?r*(.15+.6*op):0;   /* swung wide: the middle opens up, black against the white */
    const lo=Math.max(0,Math.floor(h-r*1.3)),hi=Math.min(N-1,Math.ceil(h+r*1.3));
    for(let y=lo;y<=hi;y++)for(let x=lo;x<=hi;x++){const dx=x-h,dy=y-h;if(engForm(sc.k,dx,dy,r)<=0)continue;
      if(ri>0&&engForm(sc.k,dx,dy,ri)>0)continue;const rim=engForm(sc.k,dx,dy,r-1.2)<=0||(ri>0&&engForm(sc.k,dx,dy,ri+1.2)>0);engPut(y*N+x,rim?1:.8,C.white);}
    sc.parts=sc.parts.filter(P=>{const age=(t-P.t0)/P.life;if(age>=1)return false;P.x+=P.vx*dts;P.y+=P.vy*dts;
      for(let j=0;j<2;j++){const xx=Math.round(P.x-P.vx*hd*j*.8),yy=Math.round(P.y-P.vy*hd*j*.8);if(xx<0||yy<0||xx>=N||yy>=N)continue;const i=(yy*N+xx)*3;
        if(L[i]>.3)L[i]=L[i+1]=L[i+2]=0;else engPut(i/3,.25*(1-age),C.white);}   /* black through the white, a faint streak outside */
      return P.x>-2&&P.y>-2&&P.x<N+1&&P.y<N+1;});
    if(sc.exit==='dot'&&q>0)E.dot=[Math.round(h),Math.round(h)];}});
/* Arrivals: what you hear is what you see. Little at first, the parts that play make the picture, one solid shape more for every part
   that comes in, no lines. It listens for a bar, then thinks (engThink: what the music is like picks the shape), flicks through a few
   shapes and lands; it thinks again for every new part and every new section. The melody: a solid shape in the middle that jumps on every
   note (bigger on the notes away from home), black where it lies on the shapes behind; a voice that stands out: a big solid shape of its
   own (thought when it comes in) while it sings; the highs: small squares turning on the hats' rhythm; the lows: a heavy disc */
engScene('arrivals',{name:'Arrivals',entry:['dark','dot'],exit:['dark'],bars:[16,16,32],energy:.15,key:['turn'],noLoop:true,lit:.45,
  params:{turn:{pick:[1,-1]},fz:[.9,.95],fp:[.04,.12],fs:{pick:[.25,.5]}},
  init(sc){sc.got={};sc.mp=0;sc.mk=null;sc.vk=6;sc.mlast=-9;sc.mfar=0;sc.vm=0;sc.core=0;sc.coreV=0;sc.flick=null;},
  say:()=>'what plays makes the picture, in solid shapes it thinks up: the melody in the middle, a big shape for a voice, turning squares for the hats, a disc for the lows',
  hold(sc,E){return E.beat-sc.b0<ENG_CFG.arMax*ENG_CFG.beatsPerBar&&(engSparse()||engPhase()==='build');},
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,Q=A.pe,N=E.N,h=(N-1)/2,t=E.t,bar=C.beatsPerBar*60/E.bpm,L=E.lay;
    if(!Q||!Q.n)return;
    const IN={0:(dx,dy,r)=>Math.max(Math.abs(dx),Math.abs(dy))<=r,1:(dx,dy,r)=>Math.abs(dx)+Math.abs(dy)<=r,2:(dx,dy,r)=>Math.hypot(dx,dy)<=r,
      3:(dx,dy,r)=>engForm(3,dx,dy,r)>0,6:(dx,dy,r)=>dy<=.75*r&&dy>=-r&&Math.abs(dx)<=.95*r*(dy+r)/(1.75*r)};
    const think=why=>{const th=engThink(sc.got.voice?[sc.vk]:null);if(th.k===(sc.flick?sc.flick.to:sc.mk))return;   /* it thinks; the same answer: nothing to show */
      const seq=[];for(let i=0;i<3;i++){let q;do q=[0,1,2,3,6][Math.floor(sc.R()*5)];while(q===th.k||q===seq[i-1]);seq.push(q);}seq.push(th.k);
      sc.flick={t0:t,seq,to:th.k};engLog('arrivals thinks'+(why?' ('+why+')':'')+': '+th.why);};
    const got=k=>{if(sc.got[k])return;sc.got[k]=t;if(k==='voice'){const th=engThink(sc.mk!=null?[sc.mk]:null);sc.vk=th.k;}
      if(b>1)engLog('arrivals: '+{voice:'a voice stands out → its own '+ENG_SHAPES[sc.vk]+' (thinks: '+engThink(sc.mk!=null?[sc.mk]:null).why+')',highs:'the highs come up → squares turning on the hats',lows:'the lows swell → a disc in the middle'}[k]);
      if(k!=='voice'&&sc.mk!=null)think('a new part');};
    if(sc.mk==null&&!sc.flick&&b>=C.beatsPerBar)think('it has listened a bar');   /* the first shape: after listening */
    if(sc.rethink){sc.rethink=false;if(sc.mk!=null)think('a new section');}
    if(sc.flick){const i=Math.floor((t-sc.flick.t0)/.08);if(i>=sc.flick.seq.length){sc.mk=sc.flick.to;sc.flick=null;}}   /* a quick flick through shapes, then it lands */
    const mkNow=sc.flick?sc.flick.seq[Math.floor((t-sc.flick.t0)/.08)]:sc.mk;
    const solid=(r,v,inside,cut)=>{const R=Math.ceil(r)+1;for(let y=Math.max(0,Math.floor(h-R));y<=Math.min(N-1,Math.ceil(h+R));y++)for(let x=Math.max(0,Math.floor(h-R));x<=Math.min(N-1,Math.ceil(h+R));x++){
      if(!inside(x-h,y-h,r))continue;const i=y*N+x,j=3*i;if(cut&&L[j]>.25){L[j]=L[j+1]=L[j+2]=0;}else engPut(i,v,C.white);}};   /* cut: black where it lies on a lit shape */
    /* the voice: its own big shape behind everything, as big and bright as the voice is */
    if(Q.vOn)got('voice');const vt=Q.vOn?engClamp(.5+Q.voice/10):0;sc.vm+=(vt-sc.vm)*(1-Math.exp(-dts/(vt>sc.vm?.12:.7)));
    if(sc.vm>.03){const r=N*(.28+.17*sc.vm)*(1+.08*(Q.on?1:0))*(sc.vk===6?1:.85);solid(r,.25+.4*sc.vm,IN[sc.vk]);}
    /* the lows: a heavy disc */
    if(Q.rise[1]>=C.arRise[1])got('lows');
    if(Q.on){sc.mp=1;sc.mlast=t;sc.mfar=((Q.pc-Q.ton)%12+12)%12?1:0;}sc.mp*=Math.exp(-dts/.12);
    const mR=mkNow==null?1+2*sc.mp:N*(.055+.045*sc.mp*(1+.6*sc.mfar))*(mkNow===1||mkNow===6?1.3:mkNow===3?1.4:1);   /* the melody's size, drawn last; a small dot while it listens */
    if(sc.got.lows){sc.core+=(engClamp((Q.rise[1]-2)/8)-sc.core)*(1-Math.exp(-dts/.3));if(Q.lon)sc.coreV=1;sc.coreV*=Math.exp(-dts/.15);
      solid(Math.max(N*(.1+.18*sc.core),mR*1.5+5)*(1+.3*sc.coreV),.55+.4*sc.coreV,(dx,dy,r)=>Math.hypot(dx,dy)<=r);}   /* always well round the melody: a solid disc, never a thin ring */
    /* the highs: four small solid squares that turn round the middle on the hats' rhythm: a quarter turn on every hit, half a turn when
       the hats run fast, and the turn reverses when their rhythm changes (a bar much busier or emptier than the one before) or on an accent */
    if(Q.rise[0]>=C.arRise[0])got('highs');
    if(sc.got.highs){const bt=Math.floor(E.beat/C.beatsPerBar);if(sc.hb!==bt){if(sc.hb!=null){const a=sc.hn,o=sc.hn0;if(o>=2&&(a>o*1.5||a<o*.6)){sc.p.turn*=-1;sc.hrev='rhythm';}}sc.hn0=sc.hn;sc.hn=0;sc.hb=bt;}
      if(Q.aon){sc.hn=(sc.hn||0)+1;if(Q.astr>.85&&t-(sc.hacc||-9)>bar){sc.hacc=t;sc.p.turn*=-1;}const fast=Q.arate*60/E.bpm>=3;sc.ht=(sc.ht||0)+sc.p.turn*(fast?.5:.25);sc.hv=1;}   /* hits per beat */
      sc.ha=(sc.ha||0)+((sc.ht||0)-(sc.ha||0))*(1-Math.exp(-dts/.04));sc.hv=(sc.hv||0)*Math.exp(-dts/(.5*bar));   /* a snappy jump to the new place */
      const rr=N*.4,s=Math.max(2,Math.round(N*.035)),v=.35+.55*sc.hv;
      for(let k=0;k<4;k++){const a=(sc.ha+k/4)*2*Math.PI+Math.PI/4,cx=Math.round(h+rr*Math.cos(a)),cy=Math.round(h+rr*Math.sin(a));
        for(let y=cy-s;y<=cy+s;y++)for(let x=cx-s;x<=cx+s;x++)engPutXY(x,y,v,C.white);}}
    /* the melody: the shape it thought of, jumping on every note; it fades when the notes stop */
    const mv=engClamp(1.5-(t-sc.mlast)/bar);if(mv>0)solid(mR,mv,IN[mkNow==null?0:mkNow],true);}});
/* helpers for the two black hole scenes: a dark core with a glowing ring round it. (cx,cy) middle, r core radius, gl glow 0..1, ph = the side
   that turns towards us (Doppler: brighter there), ec = how far the halo reaches in cores. Light first, the black core is cut after (engHoleCut) */
function engHoleGlow(cx,cy,r,gl,ph,ec,c){const N=ENG.N,ext=r*ec+1,x0=Math.max(0,Math.floor(cx-ext)),x1=Math.min(N-1,Math.ceil(cx+ext)),y0=Math.max(0,Math.floor(cy-ext)),y1=Math.min(N-1,Math.ceil(cy+ext)),cp=Math.cos(ph),sp=Math.sin(ph);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);if(d>=ext||d<r*.6)continue;const u=(d-r)/r,dop=.7+.3*(dx*cp+dy*sp)/(d+.01);
    const v=gl*dop*(.95*Math.exp(-Math.pow((u-.2)/.3,2))+.5*Math.exp(-Math.max(0,u)*1.5));if(v>.02)engPut(y*N+x,Math.min(1,v),c);}}
/* a black hole as in Interstellar (Gargantua), round (cx,cy) with shadow radius rs: a thin disc almost edge-on (o.tk thick, out to o.reach
   shadows, turned o.rot), its far side lensed into a halo round the shadow (broad over the top, thin underneath), a photon ring hugging the
   shadow, streaks turning with o.sp. Draws what lies behind the shadow; the near half of the disc goes into o.near ([i,v,...]) to draw after
   the shadow is cut, in front of it. o.dop (optional) = relativistic beaming: the side turning towards us (right) that much brighter, the other dimmer */
function engGarg(cx,cy,rs,o){const N=ENG.N,ri=rs*1.22,ro=rs*o.reach,ca=Math.cos(o.rot),sa=Math.sin(o.rot),g=o.gl,ext=Math.ceil(ro+2),yx=Math.ceil(rs*2.7+2+ro*o.tk);
  const x0=Math.max(0,Math.floor(cx-ext)),x1=Math.min(N-1,Math.ceil(cx+ext)),y0=Math.max(0,Math.floor(cy-yx)),y1=Math.min(N-1,Math.ceil(cy+yx));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=x-cx,dy=y-cy,xr=dx*ca+dy*sa,yr=-dx*sa+dy*ca,d=Math.hypot(dx,dy);let v=0;
    const vy=yr/o.tk,rr=Math.hypot(xr,vy);if(rr>=ri&&rr<=ro){const a=Math.atan2(vy,xr),k=(rr-ri)/(ro-ri);
      const dv=1.9*Math.pow(1-k,1.15)*(.84+.16*Math.sin(rr*.9+1.6*Math.sin(a*2-o.sp*6.28)+o.sp*3))*(.9+.1*Math.cos(a))*(1+(o.dop||0)*Math.cos(a));   /* soft rings of gas, wound by the spin */
      if(yr>=0)o.near.push(y*N+x,dv*g);else if(d>rs*1.02)v=dv;}   /* the near half in front of the shadow, the far half behind it */
    if(d>rs){const up=-yr/d,u1=(d-rs*1.3)/(rs*(.24+.32*Math.max(0,up)));
      if(up>-.3&&u1*u1<9)v=Math.max(v,1.4*Math.exp(-u1*u1)*(.6+.4*Math.max(0,up))*(.9+.1*Math.sin(Math.atan2(yr,xr)*3+o.sp*6.28))*(1+.7*(o.dop||0)*xr/d));   /* the lensed halo */
      const u2=(d-rs*1.13)/(rs*.1);if(up<.3&&u2*u2<9)v=Math.max(v,1.1*Math.exp(-u2*u2));
      const u3=(d-rs*1.05)/Math.max(.55,rs*.07);if(u3*u3<9)v=Math.max(v,(1.1+.3*o.kick)*Math.exp(-u3*u3));}   /* the photon ring, brighter on the kick */
    if(v>.02)engPut(y*N+x,Math.min(1,v*g),o.col);}}
function engGargNear(o){for(let k=0;k<o.near.length;k+=2)engPut(o.near[k],Math.min(1,o.near[k+1]),o.col);o.near.length=0;}
function engHoleCut(cx,cy,r){const N=ENG.N,L=ENG.lay,x0=Math.max(0,Math.floor(cx-r-1)),x1=Math.min(N-1,Math.ceil(cx+r+1)),y0=Math.max(0,Math.floor(cy-r-1)),y1=Math.min(N-1,Math.ceil(cy+r+1));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const d=Math.hypot(x-cx,y-cy);if(d>r+.5)continue;const k=Math.min(1,Math.max(0,d-r+.5)),j=3*(y*N+x);L[j]*=k;L[j+1]*=k;L[j+2]*=k;}}
/* helpers for the merger (engMg…). Its physics is in units of rs, the Schwarzschild radius of the pair's whole mass, its clock in seconds.
   engMgBB: the colour of glowing gas at a temperature, a blackbody (Tanner Helland's fit to Planck's curve in sRGB, brightest channel 1), as a
   table over log T from 1000 to 40000 K: 1500 K deep orange-red, 3000 K orange, 4500 K pale yellow, 6500 K white, 10000 K and up pale blue;
   a third more saturated than the eye sees it, as the LEDs and their diffuser wash colours out */
const engMgBB=(()=>{const o=new Float32Array(768),c=v=>Math.max(0,Math.min(255,v));for(let k=0;k<256;k++){const T=10*Math.pow(40,k/255);   /* in hundreds of K */
  const r=c(T<=66?255:329.698727446*Math.pow(T-60,-.1332047592)),g=c(T<=66?99.4708025861*Math.log(T)-161.1195681661:288.1221695283*Math.pow(T-60,-.0755148492)),bl=c(T>=66?255:T<=19?0:138.5177312231*Math.log(T-10)-305.0447927307),l=.3*r+.59*g+.11*bl,s=[r,g,bl].map(v=>Math.max(0,l+(v-l)*1.35)),m=Math.max(...s);
  o[3*k]=s[0]/m;o[3*k+1]=s[1]/m;o[3*k+2]=s[2]/m;}return o;})(),engMgLT=255/Math.log(40),engMgHot=[.86,.92,1];
/* where the pair is at beat b (in the orbit's plane, centre of mass at 0). w = what is left of the inspiral, 1 → 0: their distance is
   a0·w^1/4 and they turn at K·w^-3/8 a beat, the real gravitational-wave chirp, so Kepler's third law holds all the way with one fixed GM.
   w runs at rate cy.rho (1 = the nominal ib bars) and the music sets that rate (engMgPace): they drift, close in, hover close together at
   the Kepler speed of that distance while they wait, or plunge. cy.bS, wS, phS = the state at the last frame. Without cy.K (Comic merger)
   the fixed clock: the inspiral from c0 over ib bars, merging at its end, circling at the first distance before. Into o: x1,y1,x2,y2, w,
   distance a, phase ph */
function engMgOrbit(cy,b,o){let w,ph;
  if(cy.K==null){const u=(b-cy.c0)/(cy.ib*4);w=u<0?1:Math.max(0,1-u);ph=cy.ph0+6.2832*cy.turns*(u<0?.625*u:1-Math.pow(w,.625));}
  else{const db=b-cy.bS;w=Math.max(0,cy.wS-cy.rho*db/(cy.ib*4));ph=cy.phS+cy.K*Math.pow(Math.max(w,.002),-.375)*db;}
  const a=cy.a0*Math.pow(w,.25),c=Math.cos(ph),s=Math.sin(ph);o.w=w;o.a=a;o.ph=ph;o.x1=c*a*cy.m2;o.y1=s*a*cy.m2;o.x2=-c*a*cy.m1;o.y2=-s*a*cy.m1;return o;}
/* the holes at beat b into H, per hole [x,y,vx,vy,mass]; from the merger on one, the remnant, at rest in the middle with 95 % of the mass
   (5 % left as gravitational waves). Returns how many */
function engMgHoles(cy,b,bpm,H){if(b>=cy.m){H[0]=H[1]=H[2]=H[3]=0;H[4]=.95;return 1;}
  const o=engMgOrbit(cy,b,cy.o1),q=engMgOrbit(cy,b-.004,cy.o2),k=bpm/.24,vm=.6*cy.c;   /* speeds from 4 thousandths of a beat back, never over 0.6 c */
  for(let j=0;j<2;j++){const x=j?o.x2:o.x1,y=j?o.y2:o.y1,vx=(x-(j?q.x2:q.x1))*k,vy=(y-(j?q.y2:q.y1))*k,f=Math.min(1,vm/(Math.hypot(vx,vy)+1e-9)),i=5*j;
    H[i]=x;H[i+1]=y;H[i+2]=vx*f;H[i+3]=vy*f;H[i+4]=j?cy.m2:cy.m1;}return 2;}
/* gas fed in at the outer edge of the circumbinary disc (r0..r1 times the pair's first distance), on a circular orbit, fading in */
function engMgSpawn(G,i,R,a0,GM,t,r0,r1){const r=a0*(r0+(r1-r0)*Math.pow(R(),1.6)),a=R()*6.2832,v=Math.sqrt(GM/r),c=Math.cos(a),s=Math.sin(a);
  G.x[i]=r*c;G.y[i]=r*s;G.vx[i]=-v*s;G.vy[i]=v*c;G.ht[i]=0;G.em[i]=1;G.t0[i]=t;G.bb[i]=.6+.4*R();G.c[3*i]=G.c[3*i+1]=G.c[3*i+2]=0;}
/* the gas for a new pair: 36 % in a small disc round each hole (from just outside its innermost stable orbit, 3 rs, out to where the other
   one's pull tears it off), 6 % loose in the hollow, the rest in the circumbinary disc round both (from 1.75 times their distance out,
   densest at its inner edge) */
function engMgSeed(sc,G,cy,b,bpm,t){const R=sc.R,H=G.H;engMgHoles(cy,b,bpm,H);
  for(let i=0;i<G.n;i++){const u=R();
    if(u<.36){const j=u<.36*cy.m1?0:5,m=H[j+4],r0=3.2*m,r=r0+(.3*cy.a0*Math.cbrt(2*m)-r0)*R(),a=R()*6.2832,v=Math.sqrt(cy.GM*m*r)/(r-m),c=Math.cos(a),s=Math.sin(a);
      G.x[i]=H[j]+r*c;G.y[i]=H[j+1]+r*s;G.vx[i]=H[j+2]-v*s;G.vy[i]=H[j+3]+v*c;G.ht[i]=0;G.em[i]=1;G.t0[i]=t-1;G.bb[i]=.6+.4*R();G.c[3*i]=G.c[3*i+1]=G.c[3*i+2]=0;}
    else engMgSpawn(G,i,R,cy.a0,cy.GM,t-1,u<.39?.9:1.75,u<.39?1.6:2.8);}}
/* one particle's light into grid B, shared over the 4 LEDs round (x,y) */
function engMgSplat(B,N,x,y,r,g,b){const x0=Math.floor(x),y0=Math.floor(y);if(x0<-1||y0<-1||x0>=N||y0>=N)return;const fx=x-x0,fy=y-y0;
  for(let k=0;k<4;k++){const xx=x0+(k&1),yy=y0+(k>>1);if(xx<0||yy<0||xx>=N||yy>=N)continue;const w=(k&1?fx:1-fx)*(k>>1?fy:1-fy),j=3*(yy*N+xx);B[j]+=r*w;B[j+1]+=g*w;B[j+2]+=b*w;}}
/* the same through the camera: (X,Y) in the projected plane (rs, centre of mass at 0) onto the panel, rolled and panned to (cx,cy) */
function engMgPut(B,N,cam,X,Y,r,g,b){engMgSplat(B,N,cam.cx+(X*cam.rc-Y*cam.rn)*cam.s,cam.cy+(X*cam.rn+Y*cam.rc)*cam.s,r,g,b);}
/* the gas: a few thousand test particles under the pull of both holes (Paczyński-Wiita, the pseudo-Newtonian pull whose innermost stable
   orbit is at 3 rs, inside it the gas plunges), with a gentle drag towards the local circular orbit (a real disc's viscosity) plus a slow
   inward drift (accretion), in each hole's own disc and in the circumbinary disc; in the hollow between there is no drag, the gas falls
   freely and the pair's pull throws it into streams. The work the drag does heats the gas, so a stream lights up where it hits a disc.
   Swallowed (inside 2 rs) or flung far out, a particle comes back at the outer edge. A few times a frame each one is splatted, with last
   frame's colour, into G.B, or into G.F when it passes in front of a shadow; if it lies behind a hole its light is bent (a point lens with
   the Einstein radius for its depth): the main image pushed outwards, so a disc's far side rises over the shadow, and a faint second image
   on the shadow's other edge */
function engMgGas(sc,G,cy,b0,b1,bpm,dts,cam,t){const n=G.n,X=G.x,Y=G.y,VX=G.vx,VY=G.vy,HT=G.ht,EM=G.em,Cc=G.c,H=G.H,N=G.N,R=sc.R,GM=cy.GM,a0=cy.a0,ci=cam.ci,si=cam.si,sh=G.sh,rt=G.rt,
    ns=Math.max(2,Math.min(12,Math.ceil(dts*240))),st=dts/ns,sk=Math.max(1,Math.round(ns/3)),w=cam.w/Math.floor(ns/sk),esc=36*a0*a0;
  for(let k=0;k<ns;k++){const bb=b0+(b1-b0)*(k+1)/ns,nh=engMgHoles(cy,bb,bpm,H),post=nh===1,a=post?0:cy.o1.a,rc2=2.89*a*a,spl=(k+1)%sk===0,   /* the hollow: 1.7 times their distance */
      ti=1/15+(post||!cy.rho?0:Math.min(1,.08*cy.rho/(Math.max(.01,cy.o1.w)*cy.ib*4*60/bpm)));   /* the big disc drifts in, and follows the pair in as it shrinks, lagging further behind (0.3 |da/dt|/a) */
    for(let j=0;j<nh;j++){const m=H[5*j+4];rt[j]=post?1e9:Math.max(.3*a*Math.cbrt(2*m),4.5*m);sh[j]=2.6*m*cam.pump;}   /* a hole's own disc reaches 0.3 of their distance (tidal truncation), never under 4.5 rs; its shadow 2.6 rs */
    const tm=post?2.5:Math.max(.25,a*a/(a0*a0));   /* its inflow time (1 s), shorter as the pair tears it */
    for(let i=0;i<n;i++){let x=X[i],y=Y[i],vx=VX[i],vy=VY[i],ax=0,ay=0,zb=1e9,jb=0,gone=false;
      for(let j=0;j<nh;j++){const o=5*j,m=H[o+4],dx=H[o]-x,dy=H[o+1]-y,r=Math.sqrt(dx*dx+dy*dy)+1e-6;if(r<2*m){gone=true;break;}
        const rr=Math.max(r-m,.6*m),f=GM*m/(rr*rr*r),z=r<3*m?2:r/rt[j];ax+=dx*f;ay+=dy*f;if(z<zb){zb=z;jb=j;}}   /* inside 3 rs: no drag, it plunges */
      if(!gone){vx+=ax*st;vy+=ay*st;let tx=0,ty=0,fr=0,v2=1;
        /* the drag pulls towards a circular orbit a little slower than Kepler's (by ep): that takes angular momentum away, so the gas drifts
           in at r/tau, with tau = 1/(2 kappa Omega ep) */
        if(zb<1){const o=5*jb,m=H[o+4],ex=x-H[o],ey=y-H[o+1],r=Math.sqrt(ex*ex+ey*ey),vc=Math.sqrt(GM*m*r)/(r-m),kp=post?.3:.35,ep=Math.min(.4,r/(2*kp*vc*tm*(post?Math.pow(Math.max(1,r/5),1.5):1))),vt=vc*(1-ep),dr=vc*ep;   /* in a hole's own disc (after the merger: everywhere) */
          tx=H[o+2]+(-ey*vt-ex*dr)/r;ty=H[o+3]+(ex*vt-ey*dr)/r;fr=kp*vc/r*st;v2=vc*vc;}
        else{const r2=x*x+y*y;if(r2>rc2){const r=Math.sqrt(r2),vc=Math.sqrt(GM/r),ep=Math.min(.4,r*ti/(.6*vc)),vt=vc*(1-ep),dr=vc*ep;tx=(-y*vt-x*dr)/r;ty=(x*vt-y*dr)/r;fr=.3*vc/r*st;v2=vc*vc;}}   /* in the circumbinary disc */
        if(fr>0){const dx=tx-vx,dy=ty-vy,d2=(dx*dx+dy*dy)/v2;fr=Math.min(.5,fr*(1+4*d2));HT[i]+=3*fr*d2;vx+=dx*fr;vy+=dy*fr;}   /* the drag (much stronger on gas crashing in fast: a shock), and the heat it makes */
        EM[i]+=((fr>0?1:.06)-EM[i])*Math.min(1,st/.15);   /* a disc glows (its viscosity heats it), a free-falling stream only faintly */
        x+=vx*st;y+=vy*st;gone=x*x+y*y>esc;}
      if(gone){engMgSpawn(G,i,R,a0,GM*(post?.95:1),t,2.1,2.8);continue;}
      X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;if(!spl)continue;
      const cr=Cc[3*i]*w,cg=Cc[3*i+1]*w,cb=Cc[3*i+2]*w;if(cr+cg+cb<1e-7)continue;const sy=y*ci;let lj=-1,lk=.05,fp=false;
      for(let j=0;j<nh;j++){const o=5*j,bx=x-H[o],by=sy-H[o+1]*ci,b2=bx*bx+by*by,dz=y-H[o+1];   /* dz > 0: nearer to us than the hole */
        if(dz>0){if(b2<sh[j]*sh[j])fp=true;}else{const q=-2*H[o+4]*dz*si/(b2+1e-6);if(q>lk){lk=q;lj=j;}}}
      if(fp)engMgPut(G.F,N,cam,x,sy,cr,cg,cb);else if(lj<0)engMgPut(G.B,N,cam,x,sy,cr,cg,cb);
      else{const o=5*lj,hx=H[o],hy=H[o+1]*ci,bx=x-hx,by=sy-hy,b2=bx*bx+by*by,bl=Math.sqrt(b2)+1e-6,e2=-2*H[o+4]*(y-H[o+1])*si,sq=Math.sqrt(b2+4*e2),u2=b2/e2,
          mu=(u2+2)/(2*Math.sqrt(u2*(u2+4))+1e-6),tp=.5*(bl+sq),tm=Math.max(.5*(sq-bl),sh[lj]*1.06),ux=bx/bl,uy=by/bl;
        if(tp>sh[lj]){const m=Math.min(3,mu+.5);engMgPut(G.B,N,cam,hx+ux*tp,hy+uy*tp,cr*m,cg*m,cb*m);}   /* the main image */
        const m=Math.min(1.5,mu-.5);if(m>.02)engMgPut(G.B,N,cam,hx-ux*tm,hy-uy*tm,cr*m,cg*m,cb*m);}}}}   /* the second image */
/* every particle's light, as we see it: its temperature from how deep it sits in the holes' pull (a thin disc: T ∝ r^-3/4, Tpk at the
   innermost stable orbit) and the heat the drag and the flares gave it; then the Doppler shift (gas coming towards us bluer and, as g^3.5,
   much brighter, gas going away redder and dimmer) and the gravitational redshift near a hole; gas inside 3 rs plunges and is no longer
   heated, it goes dark. Also sums the light within 5 rs of each hole (G.rg) for its photon ring */
function engMgShade(G,cy,nh,t,dts,si,Tpk){const n=G.n,X=G.x,Y=G.y,VX=G.vx,VY=G.vy,HT=G.ht,Cc=G.c,H=G.H,T0=G.t0,BB=engMgBB,rg=G.rg,ic=1/Math.sqrt(2*cy.GM),hd=Math.exp(-dts/.35);rg.fill(0);   /* c^2 = 2GM/rs */
  for(let i=0;i<n;i++){const x=X[i],y=Y[i];let ps=0,wi=1,r0=99,r1=99;HT[i]*=hd;
    for(let j=0;j<nh;j++){const o=5*j,q=Math.hypot(x-H[o],y-H[o+1])/H[o+4]+1e-6;ps+=1/q;if(j)r1=q;else r0=q;if(q<3.2)wi=Math.min(wi,engClamp((q-2)/1.2));}   /* q: distance in the hole's own rs */
    const ht=HT[i],tn=Math.min(1.6,Math.pow(3*ps,.75)),vx=VX[i],vy=VY[i],b2=Math.min(.8,(vx*vx+vy*vy)*ic*ic),bz=Math.max(-.9,Math.min(.9,vy*si*ic)),
      g=Math.sqrt(Math.max(.05,1-ps))*Math.sqrt(1-b2)/(1-bz),k=3*Math.max(0,Math.min(255,Math.round(engMgLT*Math.log(Tpk*tn*Math.pow(1+ht,.25)*g*.001)))),
      v=G.bb[i]*G.em[i]*tn*tn*Math.sqrt(tn)*(1+ht)*Math.min(4,Math.pow(g,3.5))*wi*engClamp((t-T0[i])/.4),cr=BB[k]*v,cg=BB[k+1]*v,cb=BB[k+2]*v;
    Cc[3*i]=cr;Cc[3*i+1]=cg;Cc[3*i+2]=cb;if(r0<5){rg[0]+=cr;rg[1]+=cg;rg[2]+=cb;rg[3]+=v;}if(r1<5){rg[4]+=cr;rg[5]+=cg;rg[6]+=cb;rg[7]+=v;}}}
/* a flare on the snare: a hot spot in one hole's inner disc (as the magnetic flares of real discs); the disc's shear winds it into an arc */
function engMgFlare(G,nh,R){const H=G.H,j=nh>1&&R()<.5?1:0,m=H[5*j+4],a=R()*6.2832,r=m*(3.3+1.7*R()),cx=H[5*j]+r*Math.cos(a),cy=H[5*j+1]+r*Math.sin(a),w2=Math.pow(.9*m,2);
  for(let i=0;i<G.n;i++){const dx=G.x[i]-cx,dy=G.y[i]-cy,d2=dx*dx+dy*dy;if(d2<w2)G.ht[i]+=2.5*(1-d2/w2);}}
/* the shadows into G.M (1 = black), anti-aliased, P = [x,y,radius] per hole on the panel: two discs that, coming close, flow into one
   peanut (a smooth union); or the remnant's, its edge wobbling as a turning oval (ep, turned by al) while it rings down */
function engMgShadow(G,N,nh,P,ep,al){const M=G.M;M.fill(0);let x0=N,x1=0,y0=N,y1=0;
  for(let j=0;j<nh;j++){const e=P[3*j+2]*(1+ep)+2;x0=Math.min(x0,P[3*j]-e);x1=Math.max(x1,P[3*j]+e);y0=Math.min(y0,P[3*j+1]-e);y1=Math.max(y1,P[3*j+1]+e);}
  const k=nh>1?1.2*Math.min(P[2],P[5])*engClamp(1.6-Math.hypot(P[0]-P[3],P[1]-P[4])/(P[2]+P[5]+1e-6)):0,ca=Math.cos(al),sa=Math.sin(al);
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(N-1,Math.ceil(y1));y++)for(let x=Math.max(0,Math.floor(x0));x<=Math.min(N-1,Math.ceil(x1));x++){
    let dx=x-P[0],dy=y-P[1],r=Math.hypot(dx,dy),d=r-P[2]*(1+(r>1e-3?ep*((dx*dx-dy*dy)*ca+2*dx*dy*sa)/(r*r):0));
    if(nh>1){dx=x-P[3];dy=y-P[4];const d2=Math.hypot(dx,dy)-P[5];if(k>.01){const hh=Math.max(k-Math.abs(d-d2),0)/k;d=Math.min(d,d2)-hh*hh*k*.25;}else d=Math.min(d,d2);}
    M[y*N+x]=engClamp(.5-d);}}
/* a photon ring into grid B: light that circled the hole on the edge of its shadow, the colour of the gas round it, brighter on the side
   coming towards us */
function engMgRing(B,N,cx,cy,R,v,c0,c1,c2){const w=Math.max(.45,.07*R),e=R+3*w+1;
  for(let y=Math.max(0,Math.floor(cy-e));y<=Math.min(N-1,Math.ceil(cy+e));y++)for(let x=Math.max(0,Math.floor(cx-e));x<=Math.min(N-1,Math.ceil(cx+e));x++){
    const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),u=(d-R)/w;if(u*u>9)continue;const q=v*Math.exp(-u*u)*(1+.4*dx/(d+.01)),j=3*(y*N+x);B[j]+=q*c0;B[j+1]+=q*c1;B[j+2]+=q*c2;}}
/* a gravitational wave: a ring round (cx,cy) with the two arms of a binary's waves (brighter along the pair's axis at phase ph) */
function engMgWave(N,cx,cy,rr,lw,v,ph,c){const hw=(lw-1)/2,ca=Math.cos(2*ph),sa=Math.sin(2*ph),e=rr+hw+1;
  for(let y=Math.max(0,Math.floor(cy-e));y<=Math.min(N-1,Math.ceil(cy+e));y++){const dy=y-cy;for(let x=Math.max(0,Math.floor(cx-e));x<=Math.min(N-1,Math.ceil(cx+e));x++){
    const dx=x-cx,d=Math.hypot(dx,dy),f=1-Math.max(0,Math.abs(d-rr)-hw);if(f<=0)continue;engPut(y*N+x,f*v*(.6+.4*(d>.5?((dx*dx-dy*dy)*ca+2*dx*dy*sa)/(d*d):0)),c);}}}
/* Merger: two black holes feeding from one disc of gas, really simulated. Round the pair a circumbinary disc with a hollow in the middle (the
   pair's pull clears it); streams of gas fall from its inner edge onto the holes; each hole has a small disc of its own, hottest close in.
   A few thousand gas particles flow under the pull of both holes (pseudo-Newtonian, with the innermost stable orbit at 3 rs), with a gentle
   drag towards a circular orbit as in a real disc, so the gas shears into discs and streams, and they are drawn as glowing gas through a
   density grid, with streaks of their motion. Real colours: every bit of gas glows as a blackbody at its temperature (the small discs round
   the holes blue-white, the big disc yellow, orange and red outwards), gas coming towards us is bluer and much brighter (Doppler beaming),
   gas going away redder and dimmer, and close to a hole the light is reddened by gravity. Each hole is a black shadow of 2.6 rs with a
   thin photon ring, and the gas behind it is lensed: its disc's far side rises over the shadow. It is a story in three acts.
   The anticipation: they circle closer and faster (the real gravitational-wave chirp) over 6-10 bars, at the pace the music sets (see
   engMgPace): drifting in a calm passage, closing in on a build, aiming to be close together on the drop the director expects, and near
   the end hovering, almost touching, circling fast, waiting. The merge comes with the energy of the song: always on the drop itself when one
   is near (the pace aims them at it; nothing else merges them then), else on the next bar line when a new section comes in or the beat comes back, or on a 4-bar
   line when they have waited long enough. The camera starts wide on the whole big disc, off-centre, rolled and seen from above; it glides to
   the middle, rolls level and moves in and down as they close in, sways slowly while they wait, pushes in with the build and punches in on
   the two shadows flowing into one. The merge: a flash, the shocked gas lights up, heavy gravitational waves run out, the camera shakes and
   pulls back while the gas settles into one disc round the remnant, whose shadow wobbles and rings down. Then it pulls further back, tilts
   down to nearly edge-on and rolls to Black hole's angle, and two bars after the merge crossfades into Black hole with the same tilt, roll,
   spin and colour: the story goes on with the one hole, its disc and its jets pulsing on the kick (a drop in those bars cuts there at once).
   The kick pumps the shadows and the light, sends a faint wave out (stronger the closer they are) and re-shakes the remnant; the snare
   lights a flare in a disc that the shear winds into an arc; the hats light knots in the streams; the mids brighten the glow */
/* the drop the music is heading for, as a beat, or null when none is near (no breakdown): the end of the breakdown's phrase (8 bars; the
   first one only with a strong build, else 16, as the drop watch's phrase black has it); once that black runs it knows the beat exactly,
   and in the silence before a drop the drop is now */
function engMgDropAt(E){const W=EAR.dw,C=ENG_CFG,P=C.dwPhrase*C.beatsPerBar;if(W.st!=='breakdown')return null;
  if(W.pre)return W.pre.phrase?W.pre.until-.5:E.beat;
  let bd=W.brkBeat+Math.ceil((E.beat+1-W.brkBeat)/P)*P;if(bd-W.brkBeat<2*P&&EAR.build<C.dwPhBuild)bd=W.brkBeat+2*P;return bd;}
/* the pace of the inspiral, set by the music every frame: cy.rho (how fast w runs, 1 = the nominal ib bars) and the moment of the merge.
   The drop ALWAYS merges them, on the drop itself, however far apart they still are (a white quarter beat hides the last of the plunge).
   While a drop is near (engMgDropAt) nothing else may merge them: they aim to be close together (w .05) a bar before the beat the drop is
   expected, almost touching (w .02) on it, and hover there, circling fast, till it comes; armed (a build) they catch up hard, unarmed
   gently. Without a drop near a trigger plans the merge (cy.mb): a new section coming in or the beat coming back (the next bar line), or
   4 bars of hovering (the next 4-bar line); a drop coming near cancels that plan. Otherwise in a build they close in a little faster, in a
   calm passage they drift, and they come no closer than wh (hovering) */
function engMgPace(sc,cy,E,b){const A=EAR,W=A.dw,C=ENG_CFG,bpb=C.beatsPerBar,L=cy.ib*4,w=cy.wS;if(sc.merged||cy.m<1e8)return;
  const dAt=engMgDropAt(E),armed=dAt!=null&&W.armed;
  let why=sc.trig;sc.trig=null;if(!why&&cy.brk&&!A.brk&&w<.5)why='the beat is back';cy.brk=A.brk;
  if(!why&&cy.hold0!=null&&b-cy.hold0>=4*bpb&&dAt==null)why='the wait';
  if(why==='the drop'){sc.why=why;sc.snap=E.t;cy.c0=Math.min(cy.c0,b);cy.m=b;if(w>.09)engLog('Merger: the drop came early → they merge on it at once');return;}
  if(why&&dAt!=null){engLog('Merger: '+why+', but a drop is near → they wait for it');why=null;}
  if(cy.mb&&dAt!=null){cy.mb=0;engLog('Merger: a drop is coming → the merge waits for it');}
  if(why&&!cy.mb){sc.why=why;cy.c0=Math.min(cy.c0,b);
    let nb=Math.ceil((E.beat+2)/bpb)*bpb;if(why==='the wait')while(Math.round(nb/bpb)%4)nb+=bpb;cy.mb=nb-sc.b0;
    engLog('Merger: '+why+' → they merge in '+(cy.mb-b).toFixed(1)+' beats');}
  if(cy.mb){cy.rho=w*L/Math.max(.02,cy.mb-cy.bS);return;}   /* w reaches 0 on cy.mb */
  if(b<cy.c0&&dAt==null){cy.rho=0;return;}
  const ph=engPhase();let wh=.12,rn=ph==='calm'?.4:ph==='build'?1.3:1;
  if(dAt!=null){const lb=dAt-E.beat,last=lb<=bpb;wh=last?.02:.05;   /* lb: beats to the drop */
    const rt=(w-wh)*L/Math.max(.5,last?lb:lb-bpb);rn=Math.max(armed?.15:.1,Math.min(armed?4:1.3,rt));}
  cy.rho=rn*engClamp((w-wh)/.05);   /* slowing into the hover */
  if(w<wh+.015){if(cy.hold0==null){cy.hold0=b;engLog('Merger: close together, circling, waiting for the music');}}else cy.hold0=null;}
engScene('merger',{name:'Merger',entry:['dark','dot'],exit:['dark'],bars:[16,16,24],energy:.3,lit:.6,key:['cold','tilt'],noLoop:true,keepFall:true,
  params:{rs:[.085,.1],tilt:[.35,.55],insp:{int:[6,10]},ratio:[.6,.85],cold:{p:.3},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;   /* one pair, never copies of it, never on its side */sc.cy=null;sc.waves=[];sc.flash=sc.snap=-9;sc.shake=0;sc.c0=(4-(E.beat%4))%4;sc.g=null;
    const R=sc.R;sc.trig=sc.then=null;sc.roll0=(R()<.5?-1:1)*(.2+.25*R());sc.pan=R()*6.2832;sc.hand={tilt:.1+.1*R(),rot:(R()-.5)*.24,rO:22+10*R()};},   /* the opening roll and pan; the view Black hole takes over with */
  hold(sc,E,s){if(s&&!sc.merged&&s.kind==='in')sc.trig='a new section';return!!s||!sc.then;},   /* the story holds through new sections (one coming in merges them) and breakdowns, till the hand-over */
  ownDrop(sc,E){if(!sc.merged){sc.trig='the drop';return true;}if(sc.then){sc.then.style='cut';sc.b1=E.beat;return true;}return false;},   /* the drop merges them; after the merge it goes to Black hole at once */
  say:sc=>'two black holes feeding from one disc of gas: streams falling from the big orange disc onto a small blue-white disc round each hole, Doppler-bright on the side coming towards us, the light bent round the shadows; a slow anticipation, the camera wide and moving in, rolling and tilting as they spiral closer and faster, hovering close together till the energy comes; they merge on the drop (or a new section) in a flash, the gas settles into one disc round the ringing remnant, waves running out, and the camera tilts down into Black hole; the kick pumps them'+(sc.p.cold?', hotter bluer gas':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,h=(N-1)/2,t=E.t,R=sc.R,bt=60/E.bpm,bpb=C.beatsPerBar,col=p.cold?C.cold[0]:C.white;
    let G=sc.g;if(!G||G.N!==N){const n=Math.round(N*N*.75),f=()=>new Float32Array(n);   /* 3072 particles at 64x64 */
      G=sc.g={N,n,x:f(),y:f(),vx:f(),vy:f(),ht:f(),bb:f(),em:f(),t0:new Float64Array(n),c:new Float32Array(3*n),B:new Float32Array(3*N*N),F:new Float32Array(3*N*N),M:new Float32Array(N*N),H:new Float64Array(10),P:new Float32Array(6),rg:new Float32Array(8),sh:new Float32Array(2),rt:new Float32Array(2),cam:{}};sc.cy=null;}
    if(!sc.cy){const c0=sc.c0,ib=p.insp,turns=6+ib,a0=8,K=6.2832*turns*.625/(ib*4),w=K/bt,m1=1/(1+p.ratio);
      const cy=sc.cy={c0,ib,m:1e9,mb:0,K,bS:b,wS:1,phS:R()*6.28,rho:0,hold0:null,brk:A.brk,a0,m1,m2:1-m1,GM:w*w*a0*a0*a0,s0:b,o1:{},o2:{}};cy.c=Math.sqrt(2*cy.GM);   /* they start 8 rs apart; GM from Kepler's third law, c from rs = 2GM/c^2 */
      sc.merged=false;sc.W=0;sc.ci=sc.roll=sc.pn=null;sc.jolt=0;sc.bp=b;engMgSeed(sc,G,cy,b,E.bpm,t);G.B.fill(0);G.F.fill(0);}
    const cy=sc.cy,H=G.H,cam=G.cam,kick=Math.exp(-(t-A.onT[0])/.25),fd=engClamp((b-cy.s0)/2);   /* in from the dark */
    engMgPace(sc,cy,E,b);if(!sc.merged&&cy.m>1e8&&cy.rho>0){const mb=cy.bS+cy.wS*cy.ib*4/cy.rho;if(mb<=b)cy.m=Math.max(cy.bS,mb);}   /* w reaches 0 in this frame: the merge */
    const tb=b-cy.m;
    if(!sc.merged&&b>=cy.m){sc.merged=true;sc.flash=t;sc.shake=1;sc.jolt=1;sc.rollM=sc.roll||0;for(let k=0;k<3;k++)sc.waves.push({t0:t+k*.3*bt,r0:3,a:.9-.2*k,lw:Math.max(3,engBassLw(1.5))-k,sp:N*.45,ph:cy.o1.ph,hv:true});   /* the merge: three heavy waves */
      for(let i=0;i<G.n;i++){const r=Math.hypot(G.x[i],G.y[i]);if(r<10)G.ht[i]+=3*(1-r/10);}   /* and a shock that lights the gas close in */
      const hb=Math.ceil((sc.b0+cy.m+2*bpb-.01)/bpb)*bpb,hd=sc.hand;sc.b1=hb;sc.T=hb-sc.b0-cy.m;   /* two bars of the remnant ringing down, then on a bar line the story goes on: Black hole, seen as the camera ends here */
      sc.then={id:'blackhole',force:{kind:'hole',tilt:hd.tilt,rot:hd.rot,rO:hd.rO,cold:!!p.cold,cw:true,zin:true},mods:{},bars:16,from:'dark',tag:'after the merger'};
      engLog('Merger: they merge ('+(sc.why||'the inspiral ran out')+'); Black hole takes over on the bar line in '+sc.T.toFixed(1)+' beats');}
    /* the camera (W = half the view's width in rs, ci = how flat we see the orbit's plane, roll, pan off the middle): before the merge it
       follows their distance, wide on the whole big disc at first, moving in and down, rolling level and gliding to the middle as they close
       in, swaying slowly while they wait, pushing in with the build, a punch-in on the last beat; after it a jolt and a pull back, then
       further back, down to nearly edge-on and rolled as Black hole will start */
    const sep=cy.o1.a||cy.a0,pr=engClamp((cy.a0-sep)/(cy.a0*.55)),z=pr*pr*(3-2*pr),bld=engClamp(1.5*A.build+(A.dw.st==='breakdown'&&A.dw.armed?.3:0)),hd=sc.hand;let Wt,ciT,rlT,pnT;
    if(!sc.merged){Wt=cy.mb&&b>cy.mb-1?8:(6+1.9*sep)*(1-.12*bld)*.0925/p.rs;ciT=Math.min(.85,p.tilt+.3)*(1-z)+p.tilt*.65*z-.08*bld;
      rlT=sc.roll0*(1-z)+.07*Math.sin(t*.13)*(.4+.6*z);pnT=.22*(1-z)*(1-z);}
    else{const g=engEaseOut(engClamp((tb-1.5)/Math.max(1,sc.T-1.5))),Wb=Math.min(4+N*.23,hd.rO*.9);   /* Wb: Black hole's first view (zooming in) */
      Wt=tb<1.5?8+5*engEaseOut(tb/1.5):13+(Wb-13)*g;ciT=p.tilt*.65+(hd.tilt-p.tilt*.65)*g;rlT=sc.rollM+(hd.rot-sc.rollM)*g;pnT=0;}
    const kc=1-Math.exp(-dts/.3);sc.W=sc.W?sc.W+(Wt-sc.W)*(1-Math.exp(-dts/.18)):Wt;
    sc.ci=sc.ci==null?ciT:sc.ci+(ciT-sc.ci)*kc;sc.roll=sc.roll==null?rlT:sc.roll+(rlT-sc.roll)*kc;sc.pn=sc.pn==null?pnT:sc.pn+(pnT-sc.pn)*kc;
    sc.jolt*=Math.exp(-dts/(.6*bt));const jg=2*sc.jolt;   /* the merge shakes the camera */
    const s=h/sc.W,ci=Math.max(.08,Math.min(.95,sc.ci)),dec=Math.exp(-dts/.045);   /* s: LEDs per rs */
    cam.s=s;cam.ci=ci;cam.si=Math.sqrt(1-ci*ci);cam.h=h;cam.rc=Math.cos(sc.roll);cam.rn=Math.sin(sc.roll);
    cam.cx=h+sc.pn*h*Math.cos(sc.pan)+jg*(R()-.5);cam.cy=h+.6*sc.pn*h*Math.sin(sc.pan)+jg*(R()-.5);
    cam.pump=1+.08*Math.max(0,A.spr[0]);cam.w=(1-dec)*3*s*s*1000/G.n;   /* the same surface brightness at any zoom; streaks last ~45 ms */
    /* the music */
    if(A.on[0]&&sc.waves.length<5&&b>1)sc.waves.push({t0:t,r0:2,a:(.07+.23*z)*(sc.merged?.6:1),lw:engBassLw(),sp:N*.5,ph:cy.o1.ph||0});   /* a faint wave on every kick, stronger the closer they are */
    if(sc.merged){if(A.on[0])sc.shake=Math.min(1.2,sc.shake+.3*(.5+A.I));sc.shake*=Math.exp(-dts/(1.1*bt));}   /* the kick re-shakes the remnant */
    if(A.on[1])engMgFlare(G,sc.merged?1:2,R);
    if(A.on[2]){const ar=sc.merged?36:4*cy.o1.a*cy.o1.a;for(let k=0;k<6;k++){const i=Math.floor(R()*G.n);if(G.x[i]*G.x[i]+G.y[i]*G.y[i]<ar)G.ht[i]+=.8;}}   /* knots in the streams */
    /* the gas: move it, then colour it for the next frame */
    const B=G.B,F=G.F,M=G.M;for(let j=0;j<B.length;j++){B[j]*=dec;F[j]*=dec;}
    engMgGas(sc,G,cy,Math.min(sc.bp,b),b,E.bpm,Math.min(dts,.05),cam,t);sc.bp=b;
    const nh=engMgHoles(cy,b,E.bpm,H);engMgShade(G,cy,nh,t,dts,cam.si,p.cold?16000:10000);if(nh>1){cy.bS=b;cy.wS=cy.o1.w;cy.phS=cy.o1.ph;}   /* the orbit's state, for the next frame */
    const P=G.P;for(let j=0;j<nh;j++){const o=5*j,m=H[o+4],Rp=2.6*m*cam.pump*s,L=G.rg[4*j+3],X=H[o],Y=H[o+1]*ci;P[3*j]=cam.cx+(X*cam.rc-Y*cam.rn)*s;P[3*j+1]=cam.cy+(X*cam.rn+Y*cam.rc)*s;P[3*j+2]=Rp;
      const vl=Math.min(2.5,.06*Math.sqrt(L*3000/G.n)*s)/(L+1e-6),k=(1-dec)*(1+.6*kick),rg=G.rg,o4=4*j;   /* the photon rings: the light of the gas close round, plus the lensed glow of the big disc */
      engMgRing(B,N,P[3*j],P[3*j+1],Rp*1.04,k,vl*rg[o4]+.3,vl*rg[o4+1]+.2,vl*rg[o4+2]+.12);}
    engMgShadow(G,N,nh,P,sc.merged?.16*sc.shake:0,sc.merged?(t-sc.flash)*18.85:0);   /* the remnant rings down: its shadow a turning, fading oval */
    /* gravitational waves (they shove the gas outwards as they pass, the merge's by up to a quarter of its orbital speed) and the flash */
    sc.waves=sc.waves.filter(o=>{const age=t-o.t0;if(age<0)return true;const rr=o.r0+age*o.sp*.7;if(rr>N*.75)return false;engMgWave(N,cam.cx,cam.cy,rr,o.lw,o.a*Math.pow(1-rr/(N*.75),1.3)*fd,o.ph+sc.roll,col);
      const rp=rr/s,bw=(o.lw+1)/s,kk=o.a*.25*.7*o.sp/(2*(o.lw+1))*dts;
      if(o.hv)for(let i=0;i<G.n;i++){const x=G.x[i],y=G.y[i];if(Math.abs(Math.hypot(x,y*ci)-rp)<bw){const r=Math.hypot(x,y)+1e-6,k=kk*Math.sqrt(cy.GM/r)/r;G.vx[i]+=x*k;G.vy[i]+=y*k;}}return true;});
    const fl=sc.merged?Math.min(1,1.5*Math.exp(-(t-sc.flash)/.13))*fd:0,rf=P[2],fr=rf*(.3+1.4*engEaseOut((t-sc.flash)/.25)),fk=1/(fr*fr),hot=engMgHot;   /* the flash: blue-white light from the shadow's edge out, swelling and going out */
    /* all together: the gas behind (exposed like a photo: its brightness compressed, at most 0.82, the colour kept), the shadows black, the
       gas in front of them over it */
    const L=E.lay,ex=.75+.3*Math.min(1,A.env[2]*1.6)+.25*kick+.15*A.I,cap=.82*fd,l0=Math.log(1+.4*ex),li=1/(Math.log(1+900*ex)-l0),   /* a log stretch with a black point, as for photos of the sky */
      tm=y=>y>.0134?cap*Math.min(1,(Math.log(1+30*ex*y)-l0)*li)/y:0,tf=y=>y>1e-5?cap*(1-Math.exp(-.2*ex*y))/y:0;   /* in front of a shadow only dense gas shows */
    for(let i=0;i<N*N;i++){const m=1-M[i],j=3*i,kb=tm(Math.max(B[j],B[j+1],B[j+2]))*m,kf=tf(Math.max(F[j],F[j+1],F[j+2]));let f=0;
      if(fl>.02){const dx=i%N-P[0],dy=(i-i%N)/N-P[1],d=Math.max(0,Math.sqrt(dx*dx+dy*dy)-rf);f=fl*Math.exp(-d*d*fk)*m;}
      for(let c=0;c<3;c++)L[j+c]=Math.min(1,Math.max(L[j+c]*m,B[j+c]*kb,f*hot[c],F[j+c]*kf));}
    if(t-sc.snap<.25*bt)L.fill(1,0,3*N*N);   /* merged on the drop: a quarter beat of full white first, as every drop has */
    }});
/* the black hole's physics, for the 'blackhole' scene. Units: the Schwarzschild radius rs = 1, c = 1, GM = 1/2.
   Light: engBHLens integrates once, for impact parameters b = 0..16 rs, the exact path of light past a Schwarzschild hole (Binet's
   equation u'' = 1.5u² − u, u = rs/r) and keeps u at every angle ψ the light has turned round the hole on its way to us (0..2π); further
   out the weak-field solution u = sinψ/b + (1−cosψ)²/2b². A ray from an LED meets the disc's plane at ψ1 (the direct image) and at ψ1+π
   (the image bent round the back of the hole); u there says at what radius. Light with b under 3√3/2 rs falls in: the shadow */
let engBHT=null,engBHC=null;
function engBHLens(){if(engBHT)return engBHT;const nb=321,np=257,B=16,ns=8,hh=2*Math.PI/(np-1)/ns,U=new Float32Array(nb*np),f=u=>1.5*u*u-u;
  for(let k=0;k<nb;k++){const o=k*np;let u=0,w=1/Math.max(.02,k*B/(nb-1)),st=0;   /* st: 0 on its way, 1 fell in, 2 escaped */
    for(let j=1;j<np;j++){for(let s=0;s<ns&&!st;s++){const a1=w,b1=f(u),a2=w+.5*hh*b1,b2=f(u+.5*hh*a1),a3=w+.5*hh*b2,b3=f(u+.5*hh*a2),a4=w+hh*b3,b4=f(u+hh*a3);   /* RK4 */
        u+=hh/6*(a1+2*a2+2*a3+a4);w+=hh/6*(b1+2*b2+2*b3+b4);if(u>=1)st=1;else if(u<0)st=2;}
      U[o+j]=st===1?2:st===2?-1:u;}}
  return engBHT={U,nb,np,B};}
function engBHu(T,b,ps){if(b>=T.B){const c=1-Math.cos(ps);return Math.sin(ps)/b+c*c/(2*b*b);}
  const fb=b/T.B*(T.nb-1),fp=ps/(2*Math.PI)*(T.np-1),i=Math.min(T.nb-2,fb|0),j=Math.min(T.np-2,fp|0),a=fb-i,c=fp-j,U=T.U,o=i*T.np+j;
  return(U[o]*(1-c)+U[o+1]*c)*(1-a)+(U[o+T.np]*(1-c)+U[o+T.np+1]*c)*a;}
/* the colour of a black body at T (1000..60000 K, log steps): Planck's law through the CIE 1931 eye (Wyman, Sloan & Shirley's fit) into
   linear sRGB, its brightest channel 1, encoded for the panel's gamma 2.4; Yg = its visible brightness, squeezed (^0.6) for LEDs */
function engBHBB(){if(engBHC)return engBHC;const n=256,C=new Float32Array(n*3),Yg=new Float32Array(n),g=(l,m,s1,s2)=>{const t=(l-m)/(l<m?s1:s2);return Math.exp(-.5*t*t);};
  for(let k=0;k<n;k++){const T=1000*Math.pow(60,k/(n-1));let X=0,Y=0,Z=0;
    for(let l=380;l<=780;l+=5){const p=Math.pow(l*1e-3,-5)/(Math.exp(1.4388e7/(l*T))-1);
      X+=p*(1.056*g(l,599.8,37.9,31)+.362*g(l,442,16,26.7)-.065*g(l,501.1,20.4,26.2));Y+=p*(.821*g(l,568.8,46.9,40.5)+.286*g(l,530.9,16.3,31.1));Z+=p*(1.217*g(l,437,11.8,36)+.681*g(l,459,26,13.8));}
    const sR=3.2406*X-1.5372*Y-.4986*Z,sG=-.9689*X+1.8758*Y+.0415*Z,sB=.0557*X-.204*Y+1.057*Z,sat=x=>Math.max(0,Y+1.8*(x-Y));   /* more saturated: pale on LEDs otherwise */
    const r=sat(sR),gg=sat(sG),b=sat(sB),m=Math.max(r,gg,b)||1;
    C[3*k]=Math.pow(r/m,1/2.4);C[3*k+1]=Math.pow(gg/m,1/2.4);C[3*k+2]=Math.pow(b/m,1/2.4);Yg[k]=Math.pow(Y,.6);}
  return engBHC={C,Yg,n,lo:Math.log(1000),k:(n-1)/Math.log(60)};}
/* the gas: o.nP test particles in the disc's plane, in the Paczyński–Wiita potential Φ = −GM/(r−rs) (Newton, but with the last stable
   orbit at 3 rs, as round a real black hole), each on a circular orbit when it is fed in (v = √(GMr)/(r−rs)) */
function engBHInit(sc,N){const p=sc.p,nP=Math.round(500+N*N*.3),o={nP,nr:48,nf:128,P:new Float32Array(nP*6),rO:p.rO,rG:p.rO*1.12,m:null,W:0,Wm:0,N:0,warm:true,cl:null,dz:0,eps:1e-9,jh:0,knots:[]};
  o.D=new Float32Array(o.nr*o.nf);o.Dm=new Float32Array(o.nr);
  for(let i=0;i<nP;i++){if(!o.cl||o.cl.n<=0)o.cl={r:3.4*Math.pow(p.rO/3.4,Math.pow(sc.R(),.8)),f:sc.R()*6.2832,n:Math.floor(sc.R()*20)};const c=o.cl;c.n--;
    engBHSpawn(o,sc,i,c.r*(1+.06*(sc.R()-.5)),c.f+(sc.R()-.5)*.5,1);}   /* in clumps: the shear pulls them into arcs */
  for(let s=0;s<p.spots;s++){const r=3.6+sc.R()*5,f=sc.R()*6.2832;for(let j=0;j<10;j++)engBHSpawn(o,sc,Math.floor(sc.R()*nP),r*(1+.04*(sc.R()-.5)),f+(sc.R()-.5)*.25,2.2);}   /* hot spots: clumps that stay hot */
  return o;}
function engBHSpawn(o,sc,i,r,f,w){const P=o.P,k=i*6,sg=sc.p.cw?1:-1,v=Math.sqrt(.5*r)/(r-1)*(.98+.04*sc.R()),c=Math.cos(f),s=Math.sin(f);
  P[k]=r*c;P[k+1]=r*s;P[k+2]=-sg*v*s;P[k+3]=sg*v*c;P[k+4]=w;P[k+5]=w;}
function engBHFeed(o,sc,i){const R=sc.R,rO=o.rO,c=o.cl;let r,f;   /* fed in again, mostly at the outer edge, in clumps the shear pulls into arcs */
  if(c&&c.n>0){c.n--;r=c.r*(1+.05*(R()-.5));f=c.f+(R()-.5)*.3;}else{r=R()<.6?rO*(.75+.25*R()):3.5*Math.pow(rO/3.5,R());f=R()*6.2832;o.cl={r,f,n:Math.floor(R()*20)};}
  engBHSpawn(o,sc,i,r,f,1);}
/* one step of the gas (dtS in units of rs/c): gravity, a viscous torque that takes an orbit's angular momentum away in kv turns (so the gas
   spirals in) and damping of radial motion outside the last stable orbit (the disc's orbits stay round); inside it nothing holds the gas
   and it plunges into the hole. Swallowed (or flung out) it is fed in again. Every substep lands in the density grid (log radius × angle),
   which fades in .08 s: the streaks. A hot particle (w > its w0) cools back in 1.2 s */
function engBHStep(o,sc,dtS,dts,kv){const P=o.P,D=o.D,nr=o.nr,nf=o.nf,lg=(nr-1)/Math.log(o.rG),af=nf/(2*Math.PI),dec=Math.exp(-dts/.08),wd=Math.exp(-dts/1.2);
  for(let j=0;j<D.length;j++)D[j]*=dec;
  for(let i=0;i<o.nP;i++){const k=i*6;let x=P[k],y=P[k+1],vx=P[k+2],vy=P[k+3],r=Math.hypot(x,y),gone=false;P[k+4]=P[k+5]+(P[k+4]-P[k+5])*wd;
    const om=Math.sqrt(.5/r)/Math.max(.1,r-1),n=Math.min(32,1+Math.floor(om*dtS*af/1.5)),h=dtS/n,ws=P[k+4]/n;   /* substeps: at most 1.5 grid cells of angle each */
    for(let s=0;s<n;s++){r=Math.hypot(x,y);if(r<1.15||r>o.rG){gone=true;break;}
      const q=r-1,ag=-.5/(q*q*r),To=6.2832*q*Math.sqrt(2*r),vr=(x*vx+y*vy)/r,vt=(x*vy-y*vx)/r,ar=r>3.3?-(vr+2*r/(kv*To))/(1.5*To):0,at=-vt/(kv*To),ux=x/r,uy=y/r;
      vx+=(ag*x+ar*ux-at*uy)*h;vy+=(ag*y+ar*uy+at*ux)*h;x+=vx*h;y+=vy*h;   /* semi-implicit Euler: orbits keep their energy */
      const rr=Math.hypot(x,y);if(rr<1.15)continue;const fr=Math.log(rr)*lg;if(fr>=nr-1)continue;let fa=Math.atan2(y,x)*af;if(fa<0)fa+=nf;
      const i0=fr|0,j0=(fa|0)%nf,a=fr-i0,b=fa-Math.floor(fa),j1=j0+1===nf?0:j0+1,o0=i0*nf+j0,o1=i0*nf+j1;
      D[o0]+=ws*(1-a)*(1-b);D[o1]+=ws*(1-a)*b;D[o0+nf]+=ws*a*(1-b);D[o1+nf]+=ws*a*b;}
    if(gone)engBHFeed(o,sc,i);else{P[k]=x;P[k+1]=y;P[k+2]=vx;P[k+3]=vy;}}
  const Dm=o.Dm,km=o.warm?1:1-Math.exp(-dts/.6);let tot=0;   /* every ring's mean: the streaks are read against it */
  for(let i=0;i<nr;i++){let s=0;for(let j=i*nf;j<(i+1)*nf;j++)s+=D[j];Dm[i]+=(s/nf-Dm[i])*km;tot+=Dm[i];}o.eps=tot/nr*.05+1e-9;}
/* the lens map for one camera (W = rs across half the panel, the disc's axis tilted ci = cos i towards us, turned rot): per LED, for its
   direct image and the image bent round the back, where it lands in the grid, ln(g·T/Tin) and how opaque the gas is there; then how far
   the LED is from the photon ring. Temperature (Novikov–Thorne): T ∝ r^-3/4 (1−√(3rs/r))^1/4, hottest at 4.1 rs, the plunging gas inside
   cooler and fainter. Redshift g = √(1−1.5rs/r) / (1 − Ω·λ), exact for gas on circular orbits: λ = the light's angular momentum = x·sin i,
   so the side coming at us is blueshifted and the gas near the horizon goes red */
function engBHMap(o,N,W,ci,rot,sg){const T=engBHLens(),n=N*N,h=(N-1)/2,ppr=N/2/W,si=Math.sqrt(1-ci*ci),ca=Math.cos(rot),sa=Math.sin(rot),rO=o.rO,lg=(o.nr-1)/Math.log(o.rG),af=o.nf/(2*Math.PI),fmx=.0020985;
  if(!o.m||o.m.length!==n*10)o.m=new Float32Array(n*10);const M=o.m;M.fill(0);o.N=N;o.ppr=ppr;
  const tp=r=>r>=3.6?Math.pow(Math.pow(r,-3)*(1-Math.sqrt(3/r))/fmx,.25):.971*(.35+.65*(r-1)/2.6);
  const gr=(r,X)=>{const q=Math.max(r,3),g=Math.sqrt(1-1.5/q)/(1-sg*Math.sqrt(.5/(q*q*q))*X*si);return r<3?g*Math.pow((r-1)/2,.6):g;};
  const put=(q,r,f,X)=>{let fa=(f*af)%o.nf;if(fa<0)fa+=o.nf;M[q]=Math.min(o.nr-1.001,Math.log(r)*lg);M[q+1]=Math.min(o.nf-.001,fa);M[q+2]=Math.log(Math.max(1e-3,gr(r,X)*tp(r)));M[q+3]=r<3?.55:Math.min(1,(rO-r)/(rO*.3));};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=x-h,dy=y-h,X=(dx*ca+dy*sa)/ppr,Yu=(dx*sa-dy*ca)/ppr,b=Math.hypot(X,Yu)+1e-6,ex=X/b,ey=Yu/b,k=(y*N+x)*10;
    const p1=Math.atan2(ci,-si*ey),s1=Math.sin(p1),f1=Math.atan2(si*Math.cos(p1)-ci*s1*ey,s1*ex),u1=engBHu(T,b,p1);   /* where the ray crosses the disc's plane */
    if(u1>0&&u1<1){if(1/u1<rO&&1/u1>1.05)put(k,1/u1,f1,X);const u2=engBHu(T,b,p1+Math.PI);if(u2>0&&u2<1&&1/u2<rO&&1/u2>1.05)put(k+4,1/u2,f1+Math.PI,X);}
    const d=(b-2.598)*ppr;M[k+8]=d*d<9?Math.exp(-d*d/.45)*(d<0?.5:1):0;M[k+9]=Math.log(gr(4,X)*.98);}}   /* the photon ring: light that circled the hole */
/* the picture: each LED reads the gas at its images (the density against its ring's mean: the streaks; a dense clump is hotter too) and
   turns the gas's T × g into colour and brightness with Planck's law: what we see of a black body at T moving with redshift g is a black
   body at g·T. So the side coming at us is bluer and far brighter, the side going away redder and dimmer. The direct image hides what is
   behind it (the plunging gas only half); the photon ring on top. lnT = ln of the inner disc's temperature now, expo the exposure */
function engBHShade(o,E,lnT,expo,ring,hot){const N=E.N,L=E.lay,M=o.m,S=o.D,Dm=o.Dm,nf=o.nf,nr=o.nr,BB=engBHBB(),C=BB.C,Y=BB.Yg,kk=BB.k,b0=(lnT-BB.lo)*kk,eps=o.eps,yr=1/o.yRef;
  const D=o.Db||(o.Db=new Float32Array(S.length)),T=o.Dt||(o.Dt=new Float32Array(S.length));   /* the grid softened [1 2 1] round and out, so a far camera does not sparkle */
  for(let i=0;i<nr;i++){const r=i*nf;for(let j=0;j<nf;j++)T[r+j]=.5*S[r+j]+.25*(S[r+(j?j-1:nf-1)]+S[r+(j+1<nf?j+1:0)]);}
  for(let i=0;i<nr;i++){const r=i*nf,a=i?r-nf:r,c=i<nr-1?r+nf:r;for(let j=0;j<nf;j++)D[r+j]=.5*T[r+j]+.25*(T[a+j]+T[c+j]);}
  for(let i=0;i<N*N;i++){const k=i*10;let R=0,G=0,B=0,a=0;
    for(let m=0;m<8;m+=4){const q=k+m,op=M[q+3];if(op<=0||a>=1)continue;
      const fr=M[q],fa=M[q+1],i0=fr|0,j0=fa|0,u=fr-i0,v=fa-j0,j1=j0+1===nf?0:j0+1,o0=i0*nf;
      const d=(D[o0+j0]*(1-v)+D[o0+j1]*v)*(1-u)+(D[o0+nf+j0]*(1-v)+D[o0+nf+j1]*v)*u,tx=Math.min(3.5,d/(Dm[i0]*(1-u)+Dm[i0+1]*u+eps));
      let ix=Math.round(M[q+2]*kk+b0+hot*(tx-1));ix=ix<0?0:ix>255?255:ix;
      const vv=(1-a)*op*(1-Math.exp(-expo*Y[ix]*yr*(.2+.8*tx*tx)));R+=vv*C[3*ix];G+=vv*C[3*ix+1];B+=vv*C[3*ix+2];a+=(1-a)*op;}
    if(M[k+8]>0){let ix=Math.round(M[k+9]*kk+b0);ix=ix<0?0:ix>255?255:ix;const vv=M[k+8]*ring*Math.min(1,expo*Y[ix]*yr*1.2);R=Math.max(R,vv*C[3*ix]);G=Math.max(G,vv*C[3*ix+1]);B=Math.max(B,vv*C[3*ix+2]);}
    const j=i*3;if(R>L[j])L[j]=R;if(G>L[j+1])L[j+1]=G;if(B>L[j+2])L[j+2]=B;}}
/* Black hole: one black hole, seen almost edge-on, as a physics simulation. Its accretion disc is a couple of thousand particles of gas
   really orbiting it (a pseudo-Newtonian gravity with the last stable orbit at 3 Schwarzschild radii): the inner orbits go round many times
   faster than the outer ones (several turns a second at the inner edge), a viscous drag makes the gas spiral slowly inward, and past the
   last stable orbit it plunges into the hole in a spiral; new gas is fed in at the edge, in clumps that the shear pulls into long arcs.
   The gas is smeared into streaks and drawn through a real lens: every LED follows its ray of light past the hole (the exact Schwarzschild
   light path), so the far side of the disc is bent up over the shadow and a thin image of it runs under the bottom, round a black shadow
   2.6 times the hole's radius with a thin photon ring. Colours are real: the gas glows as a black body (blue-white inside, yellow, orange,
   deep red outside), Doppler shifted: the side coming at us bluer and far brighter, the side going away redder and dimmer, and red near
   the horizon (gravity). The camera drifts slowly in towards the inner disc over the scene (or out), closer while the music builds and a
   lunge on a drop. The kick fires a flare near the inner edge that whips round and shears into an arc, the snare a smaller one further out,
   the hats make glints; the bass feeds it (hotter, brighter), the mids open the exposure, the intensity sets how fast it all turns. Out of
   the poles the relativistic jets in synchrotron blue: a thin beam with a helix racing outward, knots shot up them on the kick, the jet
   tilted at us brighter than the counter-jet. Or (kind sun) a bright solid sun with a turbulent corona: the kick shoots a thick
   flare from the rim, a snare a small quick one; the disc breathes on the sub */
engScene('blackhole',{name:'Black hole',entry:['dark','dot'],exit:['dark'],bars:[8,8,16],energy:.3,lit:.6,key:['tilt','rot'],   /* a shake turns it, never swaps a hole for a sun */
  params:{kind:{pick:['hole','hole','sun']},tilt:[.08,.22],rot:[-.12,.12],cold:{p:.25},tk:[6000,8500],rO:[22,32],fast:[3,5],spots:{int:[3,6]},cw:{p:.5},zin:{p:.7},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;sc.sp=0;sc.fl=[];sc.ang=0;sc.bh=null;},   /* never on its side or copied */
  say:sc=>sc.p.kind==='sun'?'a bright sun with a turbulent corona, flares on the kick and the snare':'a black hole as a physics simulation: gas orbiting and spiralling in, ~'+Math.round(sc.p.fast)+' turns a second at the inner edge, bent over and under the shadow by the lens, black-body colours (blue-white inside, red outside) Doppler shifted, the camera drifting '+(sc.p.zin?'in':'out')+'; flares on the kick and snare, jets with knots on the kick'+(sc.p.cold?', a hotter, bluer disc':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,h=(N-1)/2,t=E.t,end=sc.b1-sc.b0-C.beatsPerBar,q=engClamp((b-end)/C.beatsPerBar),fade=engEaseOut(Math.min(1,b/2))*(1-q),col=p.cold?C.cold[0]:C.white,L=E.lay;
    if(p.kind==='sun'){const r=N*.2*(1+.07*A.spr[0]+.03*A.env[0]),R=r*1.9,x0=Math.max(0,Math.floor(h-R)),x1=Math.min(N-1,Math.ceil(h+R));
      const tt=t*(.6+.6*A.env[2]),loud=.7+.6*A.env[1]+.4*A.env[2]+.3*A.I;
      /* real star colours, a yellow star (or, cold, a hot blue one): a white-hot middle darkening to orange at the limb, granulation (bright cells,
         dark lanes), a thin pink-red chromosphere as a crisp outline, then flame tongues with sharp edges, yellow-orange at the root to deep red at
         the tips, black between them */
      const S=p.cold?{c0:[.85,.93,1],c1:[.4,.58,1],lane:[.25,.35,.9],ch:[.75,.45,1],f0:[.55,.88,1],f1:[.3,.45,1],f2:[.45,.12,.8]}
        :{c0:[1,.96,.78],c1:[1,.55,.1],lane:[.95,.32,.05],ch:[1,.22,.3],f0:[1,.75,.18],f1:[1,.38,.05],f2:[.75,.07,.02]};
      const mix=(a,c,u)=>[a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u,a[2]+(c[2]-a[2])*u];
      for(let y=x0;y<=x1;y++)for(let x=x0;x<=x1;x++){const dx=x-h,dy=y-h,d=Math.hypot(dx,dy);if(d>R)continue;
        if(d<=r+.5){const z=Math.sqrt(Math.max(0,1-d*d/(r*r))),g=Math.sin(x*1.1+Math.sin(y*.7+tt))*Math.sin(y*1.05+Math.sin(x*.6-tt*.8));   /* the disc: limb darkening + granulation */
          let c=mix(S.c1,S.c0,Math.pow(z,.6));if(g<-.25)c=mix(c,S.lane,.55);
          engPut(y*N+x,Math.min(.9,(.55+.3*z+(g>.35?.12:0))*(.85+.3*A.env[2])*engClamp(r-d+.5)*fade),c);}
        if(d>r-.5){const a=Math.atan2(dy,dx),e=d-r,n=.5+.5*Math.sin(a*5+tt+Math.sin(a*3-tt*.8)*1.4),sp=.5+.5*Math.sin(a*17-tt*2.1+Math.sin(a*7+tt)*2);   /* the corona as tongues: */
          const Lt=r*(.12+.38*n*loud+.18*sp*n),f=Math.max(0,e)/Math.max(.5,Lt),edge=engClamp((Lt-e)*1.3);   /* a crisp edge where each tongue ends */
          if(edge>0&&e>1.1)engPut(y*N+x,Math.min(.8,(.65-.4*Math.min(1,f))*edge*fade),f<.5?mix(S.f0,S.f1,f*2):mix(S.f1,S.f2,Math.min(1,(f-.5)*2)));   /* tongues start outside the rim */
          const cr=1-Math.abs(e-.4)/.8;if(cr>0)engPut(y*N+x,.95*cr*fade,S.ch);}}   /* the chromosphere: a thin pink-red rim, never swamped */
      const mk=(k,w,len,v,life)=>{if(sc.fl.length<7)sc.fl.push({a:sc.R()*6.28,t0:t,w,len,v,life,k});};
      if(A.on[0]&&b>.5)mk(0,4.5+2.5*A.I,r*(.55+.6*A.band[0]*A.I),.95,1.1*60/E.bpm);   /* kick: a thick flare */
      if(A.on[1]&&b>.5)mk(1,2.6,r*.5,.8,.5*60/E.bpm);                                /* snare: a small quick one */
      sc.fl=sc.fl.filter(o=>{const a=(t-o.t0)/o.life;if(a>=1)return false;const ln=o.len*engEaseOut(Math.min(1,a*3)),f=o.v*(1-a)*fade,ca=Math.cos(o.a),sa=Math.sin(o.a);
        for(let s=r*.9;s<=r+ln;s+=.7){const k=(s-r)/Math.max(1,ln),w=o.w*(1-.75*Math.max(0,k)),px=h+ca*s,py=h+sa*s;
          for(let j=-Math.ceil(w);j<=Math.ceil(w);j++){const dd=1-Math.max(0,Math.abs(j)-w*.5)/ (w*.6+.5),aj=Math.abs(j)/Math.max(1,w);   /* white-hot core, orange body, red edges and tip */
            if(dd>0)engPutXY(px-sa*j,py+ca*j,f*dd*(1-.3*k),aj<.3&&k<.6?(o.k?C.white:S.f0):aj<.7&&k<.8?S.f1:S.f2);}}
        return true;});
      return;}
    /* the hole (in units of rs, see engBH* above): the camera, the music into the gas, the gas, the lens, then the jets */
    const o=sc.bh||(sc.bh=engBHInit(sc,N)),BB=engBHBB(),kick=Math.exp(-(t-A.onT[0])/.25),mus=(.7+.6*A.I+.5*A.env[1])*E.mot;
    if(A.drop)o.dz=1;o.dz*=Math.exp(-dts/1.5);   /* a drop: the camera lunges in and drifts back */
    const Wn=8+(64-N)*.03,Wf=Math.min(4+N*.23,p.rO*.9),W0=p.zin?Wf:Wn*1.7,W1=p.zin?Wn:Wf,u=engClamp(b/Math.max(1,sc.b1-sc.b0)),Wt=W0*Math.pow(W1/W0,u*u*(3-2*u))*(1-.3*A.build)*(1-.35*o.dz);
    o.W=o.W?o.W+(Wt-o.W)*(1-Math.exp(-dts/.4)):Wt;   /* W = rs across half the panel: the slow zoom over the scene, closer while it builds */
    const cam=p.tilt+'|'+p.rot+'|'+p.cw;if(!o.m||o.N!==N||o.cam!==cam||Math.abs(o.W/o.Wm-1)>.003){engBHMap(o,N,o.W,p.tilt,p.rot,p.cw?1:-1);o.Wm=o.W;o.cam=cam;}   /* a new lens map only when the camera moved */
    const Tk=p.tk*(p.cold?1.6:1),ac=.85+.35*A.env[0]+.25*Math.max(0,A.spr[0]);   /* the bass feeds it: more gas falling in, hotter (T ∝ rate^1/4) and brighter */
    if(!o.yRef)o.yRef=BB.Yg[Math.round((Math.log(Tk)-BB.lo)*BB.k)];
    const flare=(n,r0,r1,w)=>{const R=sc.R,r=r0+(r1-r0)*R(),f=R()*6.2832;for(let j=0;j<n;j++){const i=Math.floor(R()*o.nP);engBHSpawn(o,sc,i,r*(1+.05*(R()-.5)),f+(R()-.5)*.35,w);o.P[i*6+5]=1;}};
    if(A.on[0]&&b>.5)flare(10+Math.round(10*A.I),3.3,6,3+2.5*A.I);   /* the kick: a flare near the inner edge (as seen at Sgr A*), whipped round and sheared into an arc */
    if(A.on[1]&&b>.5)flare(6,4.5,10,2.5);   /* the snare: a smaller one further out */
    if(A.on[2])for(let j=0;j<3;j++){const k=Math.floor(sc.R()*o.nP)*6;if(Math.hypot(o.P[k],o.P[k+1])<12)o.P[k+4]=Math.max(o.P[k+4],3);}   /* the hats: glints */
    if(o.warm){for(let j=0;j<30;j++)engBHStep(o,sc,.05*30.78*p.fast*.8,.05,7);o.warm=false;}   /* a disc that has been turning a while */
    engBHStep(o,sc,Math.min(dts,.05)*30.78*p.fast*mus,dts,7);   /* one turn at the last stable orbit takes 30.78 rs/c: `fast` turns a second there */
    engBHShade(o,E,Math.log(Tk*Math.pow(ac,.25)),(.55+.3*Math.min(1,A.env[2]*1.5)+.2*A.I)*ac*fade,(.6+.5*kick)*fade,10);
    /* the jets along the spin axis (slowly precessing): up = tilted at us, Doppler boosted; down = the dimmer counter-jet. Synchrotron: blue-violet */
    const pw=p.rot+.05*Math.sin(t*.4),jx=Math.sin(pw),jy=-Math.cos(pw),Lj=N*.75,jc=[.55,.55,1],jw=[.78,.84,1],bj=(.25+.3*A.env[0]+.25*A.I+.2*A.env[4])*fade,s0=2.7*o.ppr;
    o.jh+=dts*p.fast*mus*6.2832;   /* the helix turns with the hole, so it runs outward */
    if(A.on[0]&&b>.5&&o.knots.length<10)for(const sd of[1,-1])o.knots.push({t0:t,v:.7+.3*A.I,sd});
    for(const sd of[1,-1]){const g=sd>0?1:.4,dx=jx*sd,dy=jy*sd;
      for(let s=s0;s<Lj;s+=.5){const k=s/Lj,wd=.4+s*.05,f=bj*g*Math.pow(1-k,.8),x=h+dx*s,y=h+dy*s;
        engPutXY(x,y,Math.min(1,f*1.1),jw);   /* the beam */
        for(const m of[0,Math.PI]){const ph=s*.55-o.jh+m,of=wd*Math.sin(ph);engPutXY(x-jy*of,y+jx*of,f*(.55+.45*Math.cos(ph))*.75,jc);}}}   /* two strands of the helix */
    o.knots=o.knots.filter(K=>{const s=s0+(t-K.t0)*N*1.6;if(s>Lj)return false;const g=K.sd>0?1:.4,dx=jx*K.sd,dy=jy*K.sd,x=h+dx*s,y=h+dy*s,f=K.v*g*(1-s/Lj)*fade;
      for(let j=0;j<5;j++)engPutXY(x-dx*j*.8,y-dy*j*.8,f*(1-j/5),jw);engPutXY(x-jy,y+jx,f*.5,jc);engPutXY(x+jy,y-jx,f*.5,jc);return true;});}});   /* knots shot up the jets on the kick */
/* Supernova: the whole life of a star in one scene. First a bright sun with a turbulent corona that breathes on the sub, flares shot from its rim on
   the kick (thick) and the snare (small). Then the collapse: over the last two bars the star swells into a reddish giant and its corona turns
   unstable and flickery; in the final beat it implodes to a tiny point and the panel goes nearly black. Then the explosion, exactly on a bar line
   (or the moment a real drop hits, if that comes first): a white flash fills the panel, a thick shock shell runs out, hundreds of ejecta fly
   outward with streaks (clumpy, uneven, a few fast jets) and heavy rings run out on the bass. What is left is an expanding, fading, filamentary
   nebula (cold and warm) round a tiny bright pulsar: two thin beams sweeping round fast, a blink on every kick. It stays as the remnant */
engScene('supernova',{name:'Supernova',entry:['dark','dot'],exit:['dark'],bars:[8,8,16],energy:.6,lit:.6,key:['life','cold'],
  params:{life:{int:[4,7]},size:[.17,.21],jets:{int:[4,6]},cold:{p:.3},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;const bp=ENG_CFG.beatsPerBar;   /* never on its side or copied */
    sc.fl=[];sc.ex=null;sc.blown=false;sc.parts=[];sc.waves=[];sc.tx=0;sc.pa=0;sc.c0=(bp-(E.beat%bp))%bp;sc.sd=[sc.R()*6.28,sc.R()*6.28,sc.R()*6.28];},
  say:sc=>'a sun that swells red, implodes and goes supernova on the bar line (or the drop): white flash, shock shell, streaking ejecta, heavy rings on the bass, then a fading nebula round a pulsar blinking on the kick'+(sc.p.cold?', cold glow':''),
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,h=(N-1)/2,t=E.t,bpb=C.beatsPerBar,end=sc.b1-sc.b0-bpb,q=engClamp((b-end)/bpb),fade=engEaseOut(Math.min(1,b/2))*(1-q),R=()=>sc.R();
    const warm=[1,.84,.6],red=[1,.34,.18],mix=(a,c,u)=>a.map((x,i)=>x+(c[i]-x)*u),cold=p.cold?C.cold[0]:C.white,sd=sc.sd;
    if(sc.ex==null)sc.ex=sc.c0+bpb*Math.max(1,Math.min(p.life,Math.floor((end-3*bpb-sc.c0)/bpb)));   /* the bar line, 3+ bars of aftermath left */
    if(!sc.blown&&A.drop&&b>1)sc.ex=b;   /* a real drop: explode right now */
    if(!sc.blown&&b>=sc.ex){sc.blown=true;sc.tx=t;const n=Math.min(600,Math.round(N*N*.12)+120);   /* the explosion: ejecta, uneven and clumpy, plus a few jets */
      for(let k=0;k<n;k++){const a=R()*6.28,lump=1+.45*Math.sin(a*3+sd[0])+.3*Math.sin(a*7+sd[1]),s=N*(.05+.35*Math.pow(R(),2))*lump,c=R()<.45?C.white:R()<.5?C.cold[R()<.5?0:1]:warm;
        sc.parts.push({a,s,tc:1.6,st:1+s/N*4*R(),g:.5+.5*R(),c});}
      for(let j=0;j<p.jets;j++){const a=sd[2]+j*6.28/p.jets+(R()-.5)*.2;for(let k=0;k<10;k++)sc.parts.push({a:a+(R()-.5)*.05,s:N*(.7+.5*R())*(1-k*.03),tc:2.2,st:4+R()*4,g:.8+.2*R(),c:k<4?C.white:C.cold[0]});}   /* faster jets with long streaks */
      for(let k=0;k<3;k++)sc.waves.push({t0:t+k*.3*60/E.bpm,r0:4,a:.9-.2*k,lw:Math.max(3,engBassLw(1.5))-k,sp:N*.45});}   /* heavy rings, as at a merger */
    if(!sc.blown){const u=engClamp((b-(sc.ex-2*bpb))/(2*bpb-1)),imp=engClamp(b-(sc.ex-1)),flick=u*u,cs=mix(warm,red,u*.9),dc=mix(C.white,red,u*.85);   /* u: the swell over 2 bars, imp: the implosion in the last beat */
      const r=Math.max(0,N*p.size*(1+.07*A.spr[0]+.03*A.env[0])*(1+.7*u+(R()-.5)*.1*flick)*Math.pow(1-imp,2.5)),bt=fade*(1-.8*imp),Rc=r*1.9,x0=Math.max(0,Math.floor(h-Rc)),x1=Math.min(N-1,Math.ceil(h+Rc)),tt=t*.7;
      if(r>=.6)for(let y=x0;y<=x1;y++)for(let x=x0;x<=x1;x++){const dx=x-h,dy=y-h,d=Math.hypot(dx,dy);if(d>Rc)continue;
        if(d<=r){const z=Math.sqrt(1-d*d/(r*r)),gr=.95+.05*Math.sin(x*.35+tt*1.2)*Math.sin(y*.3-tt);engPut(y*N+x,Math.min(1,(.7+.3*z)*gr*(.85+.3*A.env[2])*bt),dc);}
        else{const a=Math.atan2(dy,dx),n0=.5+.5*Math.sin(a*5+tt+Math.sin(a*3-tt*.8)*1.4),n=n0*(1-flick)+flick*R(),uu=(d-r)/r,v=Math.exp(-uu*3.2)*(.25+.55*n)*(.7+.6*A.env[1]+.4*A.env[2])*bt;if(v>.03)engPut(y*N+x,Math.min(.8,v),cs);}}   /* corona: steady at first, then random per LED */
      engPutXY(h,h,Math.min(1,fade*(.25+.75*(1-imp))),dc);   /* the collapsed point stays */
      const mk=(k,w,len,v,life)=>{if(sc.fl.length<7)sc.fl.push({a:R()*6.28,t0:t,w,len,v,life,k});};
      if(imp<.01&&r>1){if(A.on[0]&&b>.5)mk(0,4.5+2.5*A.I,r*(.55+.6*A.band[0]*A.I),.95,1.1*60/E.bpm);   /* kick: a thick flare */
        if(A.on[1]&&b>.5)mk(1,2.6,r*.5,.8,.5*60/E.bpm);}   /* snare: a small quick one */
      sc.fl=sc.fl.filter(o=>{const a=(t-o.t0)/o.life;if(a>=1)return false;const ln=o.len*engEaseOut(Math.min(1,a*3)),f=o.v*(1-a)*bt,ca=Math.cos(o.a),sa=Math.sin(o.a);
        for(let s=r*.9;s<=r+ln;s+=.7){const k=(s-r)/Math.max(1,ln),w=o.w*(1-.75*Math.max(0,k)),px=h+ca*s,py=h+sa*s;
          for(let j=-Math.ceil(w);j<=Math.ceil(w);j++){const dd=1-Math.max(0,Math.abs(j)-w*.5)/(w*.6+.5);if(dd>0)engPutXY(px-sa*j,py+ca*j,f*dd*(1-.3*k),o.k?C.white:cs);}}
        return true;});
      return;}
    const tau=t-sc.tx,kick=Math.exp(-(t-A.onT[0])/.14);   /* the aftermath */
    sc.waves=sc.waves.filter(o=>{const a=(t-o.t0)*o.sp/N;if(a<0)return true;const rr=o.r0+a*N*.7;if(rr>N*.75)return false;engOutline(h,h,rr,o.lw,2,o.a*Math.pow(1-rr/(N*.75),1.3)*fade,cold,0);return true;});
    if(A.on[0]&&tau>1.2&&sc.waves.length<4)sc.waves.push({t0:t,r0:3,a:.2+.2*A.I,lw:engBassLw(),sp:N*.4});   /* a faint ring per kick */
    if(tau<1.8){const k=tau/1.8,sr=N*.85*engEaseOut(k);engOutline(h,h,sr,Math.max(1,Math.round(6*(1-k))),2,.9*(1-k)*fade,C.white,0);engOutline(h,h,sr*.8,2,2,.6*(1-k)*fade,C.cold[0],0);}   /* the shock shell */
    sc.parts=sc.parts.filter(o=>{const r=o.s*o.tc*(1-Math.exp(-tau/o.tc));if(r>N*.85)return false;const ca=Math.cos(o.a),sa=Math.sin(o.a),n=Math.ceil(o.st*Math.exp(-tau/2)+1),v=(.3+.7*Math.exp(-tau/3))*o.g*fade;
      for(let j=0;j<n;j++)engPutXY(h+ca*(r-j),h+sa*(r-j),v*(1-j/n),j===0&&tau<.6?C.white:o.c);return true;});   /* ejecta with streaks */
    const f=Math.min(1,1.4*Math.exp(-tau/.35));if(f>.03)engOutline(h,h,0,2*N*(.1+.8*engEaseOut(Math.min(1,tau/.25)))+1,2,f*fade,C.white,0);   /* the flash: a white disc that fills the panel and goes out */
    if(tau>.8){const ra=engClamp(tau-.8),Rr=N*(.12+.3*engEaseOut(Math.min(1,tau/8))),fv=fade*ra*(.15+.5*Math.exp(-tau/10));   /* the remnant: a filamentary shell, uneven */
      for(let a=0;a<6.283;a+=1/Math.max(2,Rr)){const n=Math.sin(a*5+sd[0]+tau*.1)*Math.sin(a*8+sd[1])+.5*Math.sin(a*13+sd[2]),v=fv*Math.max(0,n);if(v>.04)engPutXY(h+Rr*Math.cos(a),h+Rr*Math.sin(a),Math.min(.7,v),Math.sin(a*3+sd[2])>0?C.cold[0]:warm);}}
    const pr=engClamp((tau-.7)),L=N*.42,pf=fade*pr;sc.pa+=dts*6.2832*(2.5+1.5*A.I)*E.mot;   /* the pulsar: two thin beams sweeping round, a blink per kick */
    for(let m=0;m<2;m++){const a=sc.pa+m*Math.PI;engLine(h,h,h+Math.cos(a)*L,h+Math.sin(a)*L,.55*pf*(.6+.4*kick),C.cold[0]);}
    engPutXY(h,h,Math.min(1,(.55+.45*kick)*pf),C.white);if(kick>.1)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])engPutXY(h+dx,h+dy,.5*kick*pf,C.white);}});
/* how far into the song we are, 0..1 (and E.songDur, its length in seconds): the player's own clock for a song file or a video; live sound
   has no end, so then 4 minutes from the director's start */
function engSongP(){const E=ENG;try{const el=typeof audioSrc!=='undefined'&&audioSrc==='video'&&typeof vid!=='undefined'?vid:typeof playerEl!=='undefined'&&(typeof audioSrc==='undefined'||audioSrc==='file')?playerEl:null;
  if(el&&isFinite(el.duration)&&el.duration>0){E.songDur=el.duration;return engClamp(el.currentTime/el.duration);}}catch(e){}E.songDur=240;return engClamp((E.t-E.t0)/240);}
/* Sun dive: starts as a small distant yellow dot and zooms in, timed by the SONG (not the scene): whenever the scene comes back it shows
   where the song is. The song holds one dive per ~2 minutes (at least 2): each zooms in (slow at first and again at the end), then holds on the
   boiling surface for a while; then one patch near the middle is taken as the new sun: slowly centred while the other patches fade away, it
   rounds into a small sun with its own flames and the dive starts anew from there. The last dive stays on the surface to the end. The edge of the sun is
   always a waveform (a short history of the bass, mids and highs, smoothed and mirrored round the circle) with spiky flames outside it that grow on loud moments. Closer in,
   the disc fills with boiling cells (yellow bubbles, orange rims, dark red seams), and in the end the surface fills the whole panel. Everything bounces on the music:
   bass = the whole surface swells slowly, kick = a pulse runs out through the cells, snare = a plasma loop arches off the edge (or bursts on the surface when the edge
   is off-screen), mids = how fast and bright the cells boil, highs = white sparkles on the seams */
engScene('sundive',{name:'Sun dive',entry:['dark','dot'],exit:['dark'],bars:[16,32,32],energy:.5,lit:.6,key:['cells','spk'],
  params:{cells:[.085,.12],spk:{int:[6,10]},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;   /* never on its side or copied */
    sc.hs=new Array(32).fill(0);sc.lw=new Float32Array(32);sc.ha=0;sc.tm=0;sc.fr=0;sc.lp=[];sc.sd=[sc.R()*6.28,sc.R()*6.28];},
  say:sc=>'a small distant yellow dot that slowly zooms into a sun over the song: the edge is always an audio waveform with spiky flames, then boiling cells (bass swells the surface, kick pulses through it, snare throws plasma loops, mids boil it, highs sparkle on the seams) until the surface fills the panel; after a while one patch becomes the next sun and the dive starts anew',
  draw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,h=(N-1)/2,t=E.t,bpb=C.beatsPerBar,end=sc.b1-sc.b0-bpb,q=engClamp((b-end)/bpb),fade=engEaseOut(Math.min(1,b/2))*(1-q),R=()=>sc.R(),M=32,PI=Math.PI;
    const P=engSongP(),nc=Math.max(2,Math.round((E.songDur||240)/120)),cp=Math.min(nc-1e-4,P*nc),ci=Math.floor(cp),u=cp-ci,last=ci===nc-1;   /* which dive, and how far into it */
    const zE=last?.8:.72,x0=engClamp(u/zE),pe=x0*x0*(3-2*x0),rb=last?0:engClamp((u-.88)/.12),kick=Math.exp(-(t-A.onT[0])/.14),sw=1+.025*A.env[0]+.03*kick;   /* zoom, hold on the surface, then (rb) the rebirth */
    const cell=N*p.cells,rE=N*3.4,DE=Math.pow(2,Math.floor(Math.log2(rE/cell))),rP=.45*rE/DE,r0=ci?rP:.8,r=r0*Math.pow(rE/r0,pe)*sw;   /* zoom: eased exponential, dot (or a reborn patch, rP) to filled panel */
    const s0=engClamp((pe-.8)/.2),s2=s0*s0*(3-2*s0);let cx=h,cy=h+Math.max(0,r-N*.45)*(1-s2);   /* the sun settles from the top edge to the middle as the edge leaves the panel */
    sc.ha+=dts*26;while(sc.ha>=1){sc.ha-=1;const m=engClamp(.5*A.env[0]+.4*A.env[2]+.3*A.env[4]+.25*A.env[1]);sc.hs.pop();sc.hs.unshift((R()<.5?-1:1)*(.25+1.1*m)*(.6+.8*R()));}   /* waveform history: a signed sample per tick */
    for(let k=0;k<M;k++){const a0=sc.hs[Math.max(0,k-1)],a1=sc.hs[Math.min(M-1,k+1)],v=k/(M-1)*4,i=Math.min(3,Math.floor(v)),f=v-i,bv=A.env[i]*(1-f)+A.env[i+1]*f;
      sc.lw[k]+=(Math.max(-1,Math.min(1,(a0+2*sc.hs[k]+a1)/4+.5*(bv-.25)))-sc.lw[k])*.4;}   /* smoothed, with the bands laid along the angle */
    sc.tm+=dts*(.7+2.2*(A.env[2]+.5*A.env[3]))*E.mot;sc.fr++;
    const hsh=(a,c)=>{let n=Math.imul(a,374761393)+Math.imul(c,668265263)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;},CW=[0,0,0,0,0],   /* cheap hashed 3x3 cellular noise: seam gap, nearest distance, cell id, cell x, cell y */
      cw=(X,Y,T)=>{const ix=Math.floor(X),iy=Math.floor(Y);let f1=9,f2=9,id=0,ni=0,nj=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const n=hsh(ix+i,iy+j),qx=ix+i+.5+.4*Math.sin(T+n*6.283),qy=iy+j+.5+.4*Math.cos(T*.9+n*17.3),dd=Math.hypot(X-qx,Y-qy);if(dd<f1){f2=f1;f1=dd;id=n;ni=ix+i;nj=iy+j;}else if(dd<f2)f2=dd;}CW[0]=f2-f1;CW[1]=f1;CW[2]=id;CW[3]=ni;CW[4]=nj;};
    let ko=1,mx=0;   /* ko: how much of the other patches is left, mx: how far the chosen patch has turned into the new sun */
    if(rb>0){if(!sc.pk||sc.pk.ci!==ci){cw((h+(R()-.5)*N*.3-cx)/r*DE,(h+(R()-.5)*N*.3-cy)/r*DE,sc.tm);sc.pk={ci,ix:CW[3],iy:CW[4]};}   /* the rebirth: a patch near the middle */
      const n=hsh(sc.pk.ix,sc.pk.iy),qx=sc.pk.ix+.5+.4*Math.sin(sc.tm+n*6.283),qy=sc.pk.iy+.5+.4*Math.cos(sc.tm*.9+n*17.3),e=engClamp(rb/.6),es=e*e*(3-2*e);
      cx+=(h-(cx+qx/DE*r))*es;cy+=(h-(cy+qy/DE*r))*es;ko=1-engEaseOut(engClamp(rb/.5));mx=engClamp((rb-.55)/.45);mx=mx*mx*(3-2*mx);}   /* slowly centred, the others fade, then it rounds into the new sun */
    if(rb===0&&A.on[1]&&b>.5&&sc.lp.length<6&&r>N*.05){let ok=false;for(let k=0;k<8&&!ok;k++){const a=R()*6.28,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;if(px>1&&px<N-2&&py>1&&py<N-2){sc.lp.push({k:0,a,t0:t,life:1.1*60/E.bpm});ok=true;}}
      if(!ok&&r>N*.9)sc.lp.push({k:1,x:2+R()*(N-4),y:2+R()*(N-4),a:R()*6.28,t0:t,life:.8*60/E.bpm});}   /* snare: a loop off the edge, or a burst when the edge is gone */
    const mid=A.env[2],hi=A.env[4],loud=engClamp(.25+.6*A.I+.3*A.env[0]),tm=sc.tm,
      hc=()=>{const se=engClamp(CW[0]/.2),bump=engClamp(1-CW[1]/.55);return .18+.5*se+.25*bump*se+.3*(CW[2]-.5)+.12*Math.sin(tm*2.3+CW[2]*6.283)*(.4+mid);},   /* bubbly cells: bright middle, dark red seam */
      rf=(t-A.onT[0])*N*1.1,kd=Math.exp(-(t-A.onT[0])/.35)*(.4+.6*A.I),swell=.12*A.env[0],hp=.006+.04*hi+(A.on[2]?.04:0),
      red=[.95,.1,.03],org=[1,.48,.07],yel=[1,.86,.2],col=[0,0,0],sd=sc.sd,lw=sc.lw;
    /* one sun of radius r round (cx,cy), al its share; sel = the rebirth: only the chosen patch stays whole, the rest at ko */
    const sun=(r,cx,cy,al,sel)=>{const lD=Math.log2(Math.max(1,r/cell)),o=Math.floor(lD),fo=lD-o,D1=Math.pow(2,o),det=engClamp((r-N*.07)/(N*.2)),Rm=r*1.6+3;   /* two cell sizes cross-fade, so the cells keep their size on screen as it zooms */
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);if(d>Rm)continue;
        const a=Math.atan2(dy,dx),u=Math.abs(a)/PI*(M-1),k0=Math.floor(u),k1=Math.min(M-1,k0+1),w=lw[k0]+(lw[k1]-lw[k0])*(u-k0),rl=r*(1+(.04+.07*A.I)*w)+.4*w,ins=engClamp(rl-d+.5);   /* the limb radius at this angle, mirrored */
        if(ins>0){const z=Math.sqrt(Math.max(.04,1-d*d/(rl*rl))),sx=dx/r,sy=dy/r;let hv=.92,k=1;
          if(det>0){cw(sx*D1,sy*D1,tm);const h1=hc();cw(sx*D1*2,sy*D1*2,tm*1.15+3);const h2=hc();hv=.92+(h1+(h2-h1)*fo-.92)*det;   /* surface cells */
            const g=Math.hypot(x-h,y-h)-rf;hv+=.3*kd*Math.exp(-g*g/(N*N*.02))*det;   /* the kick pulse running out through the cells */
            if(CW[0]<.25&&hsh((x*73+y*151)|0,sc.fr)<hp*det)hv=1.4;}   /* highs: white sparkles on the seams */
          if(sel){cw(sx*DE,sy*DE,tm);if(CW[3]===sc.pk.ix&&CW[4]===sc.pk.iy)hv=hc()+.15*kd;else k=ko;}   /* the chosen patch, clean and whole */
          hv+=swell-(1-z)*.3*det;hv=Math.max(0,hv);
          if(hv<.5){const u2=hv*2;col[0]=red[0]+(org[0]-red[0])*u2;col[1]=red[1]+(org[1]-red[1])*u2;col[2]=red[2]+(org[2]-red[2])*u2;}
          else{const u2=Math.min(1,(hv-.5)*2),wh=engClamp((hv-.95)/.4);for(let c=0;c<3;c++)col[c]=(org[c]+(yel[c]-org[c])*u2)*(1-wh)+wh;}
          const v=Math.min(.82,(.4+.5*Math.min(1,hv))*(.65+.35*z))*ins*fade*al*k;if(v>.004)engPut(y*N+x,v,col);}
        else{const sp=Math.sin(a*p.spk+sd[0]+tm*.35)*Math.sin(a*p.spk*.6+sd[1]-tm*.3),Ls=r*(.05+.3*loud*Math.pow(Math.abs(sp),1.4))+.5,uu=(d-rl)/Ls;   /* spiky corona, longer on loud moments */
          if(uu<1){const v=Math.pow(1-uu,1.7)*(.55+.3*hi+.2*mid);col[0]=1;col[1]=.48-.3*uu;col[2]=.07-.04*uu;engPut(y*N+x,Math.min(.8,v)*fade*al*(sel?ko:1),col);}}}};
    if(mx<1)sun(r,cx,cy,1-mx,rb>0);if(mx>0)sun(rP*sw,h,h,mx,false);   /* the surface (or the patch); the new sun crossfading in on top of it */
    sc.lp=sc.lp.filter(o=>{const age=t-o.t0;if(age>=o.life)return false;const g=engEaseOut(Math.min(1,age/.3)),fd=1-age/o.life;let ax,ay,nx,ny,sp,hg;
      if(o.k===0){ax=cx+Math.cos(o.a)*r;ay=cy+Math.sin(o.a)*r;nx=Math.cos(o.a);ny=Math.sin(o.a);sp=Math.min(N*.2,N*.05+r*.06);hg=Math.min(N*.32,1.5+r*.18)*g*(.7+.5*A.I);}   /* a prominence: an arch standing on the limb */
      else{ax=o.x;ay=o.y;nx=Math.cos(o.a);ny=Math.sin(o.a);sp=N*.1;hg=N*.14*g;}   /* or a burst on the surface */
      const tx=-ny,ty=nx;for(let pass=0;pass<2;pass++){const sp2=sp+(pass?0:1),h2=hg+(pass?0:1),cc=pass?(age<.2?C.white:org):red;let lx=0,ly=0;
        for(let k=0;k<=14;k++){const th=k/14*PI,px=ax+tx*sp2*Math.cos(th)+nx*h2*Math.sin(th),py=ay+ty*sp2*Math.cos(th)+ny*h2*Math.sin(th);if(k)engLine(lx,ly,px,py,.85*fd*fade,cc);lx=px;ly=py;}}
      return true;});}});
/* Celdeling: a story in three acts (2026-10-23, on Merger's recipe: real maths, the music sets the clock, the climax is the drop, a hand-off).
   Act 1, one cell (calm): an animal cell dividing (mitosis), the real sequence in fluorescence-microscope colours (DNA blue, each
   chromosome painted its own hue, microtubules green, kinetochores pink, the actomyosin ring red, the membrane warm gold, on black).
   Interphase (a round cell, a big nucleus with loose chromatin and a nucleolus, one centrosome with its microtubule network, which
   duplicates), prophase (the chromatin condenses into X-shaped chromosomes, the two centrosomes walk round the nucleus to the poles and
   their asters grow), prometaphase (the nuclear envelope breaks into fragments, kinetochore fibres search, capture and drag the
   chromosomes to the middle), metaphase (lined up on the plate, tugged both ways). There the cell waits, as a real one does at its
   spindle checkpoint, till the music moves: the next 4-bar line when it is calm, the next bar line in a flow or a build, or when a new
   section comes in or the beat comes back. Anaphase starts on that bar line (APC/C destroys cyclin B, a Ca2+ wave runs out, the sister
   chromatids are pulled apart centromere first), telophase + cytokinesis (new envelopes, the red contractile ring pinches the waist),
   abscission two bars later (one in a build) with a flash at the midbody. The camera pulls back instead of diving in: the two daughters
   stay, inside the zona pellucida (the embryo's shell).
   Act 2, the embryo (the build): cleavage, every cell dividing at once in a wave across the embryo (2, 4, 8, 16, 32), each division at
   right angles to the last, abscissions on bar lines. The music sets the round: 4 bars when calm, 2 in a flow, in a build each round
   half the last (down to 1 bar: exponential growth you can hear); armed for a drop, the rounds left are fitted so the last one lands a
   bar before the drop the director expects. The cells push each other into a tight ball (soft discs inside the zona) and a full ball, a
   morula (Latin for mulberry), compacts and waits, trembling, for the drop (or a new section, the beat coming back, 8 bars of waiting).
   Act 3, the bloom (the drop): the zona cracks open (hatching) and the cells fly out into Vogel's sunflower: cell i at angle i x 137.508
   degrees (the golden angle) and radius c sqrt(its age), so new cells born in the middle push the older ones outwards and the spirals
   of 8, 13, 21 and 34 (Fibonacci numbers) appear by themselves; the colours mark one family of spirals. Eight bars on, on a bar line,
   Morphology takes over, starting with a neuron.
   The maths: each cell's membrane is a Cassini oval |x-f1|.|x-f2| = b^2 whose foci move apart: round, a peanut, a lemniscate at the pinch
   (b = a), then two drops that relax into round daughters (the field blends from the parent's lemniscate into each daughter's circle).
   The embryo is the smooth union of all those fields (the lowest value wins), with a wall where the two lowest are equal. In the close-up
   the field's level sets fill the cytoplasm as soft equal-potential bands drifting inward (streaming). Microtubules show dynamic
   instability (grow with a bright GTP cap, catastrophe, shrink, rescue, stall at the cortex). Cyclin B rises through each cycle (the
   cytoplasm warms to magenta as CDK1 switches on) and crashes at anaphase. Vesicles jitter in Brownian motion.
   Music, the Colour fields recipe through MUSIC and FEEL (on the hit's own frame, as hard as the hit, a dim base that pops, Feel's spring
   after it): kick = the cells swell and bounce like jelly, the membranes light up, fresh tubulin runs out along the asters; in the bloom
   each kick gives birth to 3-12 new cells (more on a harder hit) and between the kicks it hardly grows. Snare = a burst of microtubule
   catastrophes and a tug on the chromosomes; in the embryo a springy jolt through the cells; in the bloom a ring running out. Hats =
   vesicles and cells sparkle. Melody = the chromosomes and nuclei glow; in the bloom a melody note (at most every 2 bars) turns the
   colours to the next family of spirals, and every other spiral glows with the melody. Bass = the membrane wobbles a little. A drop =
   the bloom, at once (in act 1 the one cell blooms); another drop in the bloom's first 4 bars is a second burst, a later one cuts to
   Morphology at once */
function engCellVes(R){const r=.5+.43*Math.sqrt(R()),a=R()*6.283;return{s:r*Math.cos(a),w:r*Math.sin(a),sp:0,v:R()};}
function engCellCh(sc){const R=sc.R,n=sc.p.nch,pal=[[.3,.5,1],[.3,.85,1],[.62,.42,1],[.9,.38,1],[.35,.68,1],[.55,.62,1],[.95,.45,.8]];sc.ch=[];
  for(let i=0;i<n;i++){const r=.27*Math.sqrt(R()),a=R()*6.283;sc.ch.push({hs:r*Math.cos(a),hw:r*Math.sin(a),phi:R()*6.283,len:.1+.05*R(),ph:R()*6.283,col:sc.p.paint?pal[(sc.po+i*3)%7]:[.32,.55,1]});}
  sc.ch.sort((x,y)=>x.hw-y.hw).forEach((c,i)=>c.wi=(i-(n-1)/2)/((n-1)/2)*.46);}   /* plate slots in the order they lie, so no paths cross */
const ENG_CD={GA:Math.PI*(3-Math.sqrt(5)),FIB:[8,13,21,34],FIBm:[5,8,13,21],rd:.75,Z:1.8,NB:400,
  PAL:[[.28,.48,1],[.3,.85,1],[.25,1,.45],[1,.62,.22],[.95,.45,.8],[.62,.42,1]]};   /* the golden angle, the spiral families, a daughter's radius, the zona's, the most cells in the bloom, its colours */
const engCdSm=x=>{x=engClamp(x);return x*x*(3-2*x);};
/* the bar line at or after the scene's beat x (with k: every k bars) */
const engCdBar=(sc,x,k)=>{const q=ENG_CFG.beatsPerBar*(k||1);return Math.ceil((sc.b0+x-1e-6)/q)*q-sc.b0;};
/* a thick soft stroke into buffer B (in LEDs, intensity i0 → i1); from a point to itself, a dot */
function engCdSeg(B,N,x0,y0,x1,y1,rad,i0,i1,c){const e=rad+2,dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1e-6,G=(rad+1.2)*(rad+1.2);
  const X0=Math.max(0,Math.floor(Math.min(x0,x1)-e)),X1=Math.min(N-1,Math.ceil(Math.max(x0,x1)+e)),Y0=Math.max(0,Math.floor(Math.min(y0,y1)-e)),Y1=Math.min(N-1,Math.ceil(Math.max(y0,y1)+e));
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const u=engClamp(((x-x0)*dx+(y-y0)*dy)/l2),ex=x0+dx*u-x,ey=y0+dy*u-y,d2=ex*ex+ey*ey,k=engClamp(rad-Math.sqrt(d2)+.5)+.3*Math.exp(-d2/G);
    if(k>.01){const v=k*(i0+(i1-i0)*u),j=(y*N+x)*3;B[j]+=v*c[0];B[j+1]+=v*c[1];B[j+2]+=v*c[2];}}}
const engCdDot=(B,N,x,y,rad,v,c)=>engCdSeg(B,N,x,y,x,y,rad,v,v,c);
/* the colour of spiral u (0..1 round its family), cycling through the fluorescence colours */
function engCdPal(u,o){const P=ENG_CD.PAL,n=P.length,x=(u%1+1)%1*n,i=Math.floor(x),f=x-i,a=P[i%n],b=P[(i+1)%n];for(let k=0;k<3;k++)o[k]=a[k]+(b[k]-a[k])*f;return o;}
/* a cell of the embryo: centre x,y and radius r in units of the first cell's radius (the screen's axes), ax the axis of its next
   division, par the parent's lemniscate it rounds up from (rel 0 → 1), lag its delay in a cleavage's wave, dx,dy the way the snare jolts it */
function engCdNew(R,x,y,r,ax,par){return{x,y,r,ax,par,rel:par?0:1,v:R(),lag:0,u:0,a:0,bb:1,dx:1,dy:0,sis:null};}
/* a division: two daughters in the lemniscate's lobes, each to divide at right angles to this one */
function engCdSplit(sc,c,out){const R=sc.R,ca=Math.cos(c.ax),sa=Math.sin(c.ax),r=c.r*ENG_CD.rd,par={x:c.x,y:c.y,r:c.r,ax:c.ax},
    d1=engCdNew(R,c.x+ca*.9*c.r,c.y+sa*.9*c.r,r,c.ax+Math.PI/2+(R()-.5)*.35,par),d2=engCdNew(R,c.x-ca*.9*c.r,c.y-sa*.9*c.r,r,c.ax+Math.PI/2+(R()-.5)*.35,par);
  d1.sis=d2;d2.sis=d1;out.push(d1,d2);sc.em.mid.push(c.x,c.y);}
/* the embryo begins: the two daughters of act 1 in the close-up's frame (its axis, its scale), or, on an early drop, the one cell */
function engCdStart(sc,E,one){const ax=sc.ax,c=Math.cos(ax),s=Math.sin(ax),R=sc.R,P=engClamp(sc.P/8)*8,L=[];
  sc.em={cells:L,ru:0,rEnd:null,rL:4,pL:4,hold0:null,blAt:null,why:null,pxe:E.N*.35*(P<7?1-.15*engCdSm((P-5)/2):.85),abT:-99,mid:[],spk:[]};
  if(one){L.push(engCdNew(R,0,0,1,ax,null));return;}
  const par={x:0,y:0,r:1,ax};for(const g of[1,-1]){const d=engCdNew(R,g*.9*c,g*.9*s,ENG_CD.rd,ax+Math.PI/2+(R()-.5)*.3,par);d.rel=.3;L.push(d);}
  L[0].sis=L[1];L[1].sis=L[0];engLog('Celdeling: two cells, the camera pulls back: the embryo');}
/* a cleavage round in bars: 4 when calm, 2 in a flow, in a build half the last (down to 1); armed for a drop, the rounds left are fitted
   so the last one lands a bar before the drop the director expects */
function engCdRound(sc,E,ph,armed){const em=sc.em,bpb=ENG_CFG.beatsPerBar;
  const bd=armed?engMgDropAt(E):null;   /* the beat the drop is expected on (Merger aims at the same one) */
  if(bd!=null&&isFinite(bd)){const left=Math.max(1,Math.ceil(Math.log2(sc.p.cap/em.cells.length)));return Math.max(1,Math.min(4,Math.floor(((bd-E.beat)/bpb-1)/left)));}
  return ph==='calm'?4:ph==='build'?Math.max(1,em.pL/2):2;}
function engCdDivide(sc,E){const em=sc.em,out=[];em.mid.length=0;for(const c of em.cells)engCdSplit(sc,c,out);em.cells=out;em.ru=0;em.pL=em.rL;em.rEnd=null;em.abT=E.t;}
/* act 3 begins: the embryo hatches and blooms; Morphology (a neuron first) takes over 8 bars on, on a bar line */
function engCdBloom0(sc,E,b,why){const em=sc.em,D=ENG_CD,N=E.N,h=(N-1)/2,R=sc.R,bpb=ENG_CFG.beatsPerBar,out=[];
  for(const c of em.cells)if(c.u>.72)engCdSplit(sc,c,out);else out.push(c);em.cells=out;   /* a division under way finishes at once */
  const n0=Math.min(out.length,D.NB),th0=R()*6.2832,ang=a=>(a%6.2832+6.2832)%6.2832,
    cs=out.slice(0,n0).map(c=>({x:h+c.x*em.pxe,y:h+c.y*em.pxe,r:c.r*em.pxe,a:ang(Math.atan2(c.y,c.x))})).sort((p,q)=>p.a-q.a),
    sl=cs.map((_,i)=>({i,a:ang(i*D.GA+th0)})).sort((p,q)=>p.a-q.a);   /* each cell flies to the slot at its own angle, so no paths cross */
  const bl=sc.bl={t0:E.t,b0:b,n0,n:n0,nT:n0+10,fi:0,fp:0,fT:E.t-9,th0,burst:E.t,za:R()*6.2832,Zp:D.Z*em.pxe,ix:new Float32Array(n0),iy:new Float32Array(n0),ir:new Float32Array(n0),
    born:new Float64Array(D.NB),sp:new Float32Array(D.NB),waves:[]};
  sl.forEach((s,j)=>{bl.ix[s.i]=cs[j].x;bl.iy[s.i]=cs[j].y;bl.ir[s.i]=cs[j].r;});bl.born.fill(E.t-9,0,n0);
  sc.act='bloom';sc.b1=sc.b0+engCdBar(sc,b+8*bpb);ENG.mpPos=ENG_MP.length-1;   /* Morphology starts on its first form, the neuron */
  sc.then={id:'morphology',mods:{},bars:24,from:'dark',tag:'after the bloom'};
  engLog('Celdeling: '+why+' → '+n0+(n0>1?' cells hatch':' cell')+' and bloom (Vogel: 137.5°, r ∝ √age); Morphology takes over in '+((sc.b1-sc.b0-b)/bpb).toFixed(1)+' bars');}
/* the story's clock, every frame before the drawing: the music sets the pace (see the header) */
function engCdPace(sc,E,b,db,dts){const C=ENG_CFG,A=EAR,W=A.dw,M=MUSIC,bpb=C.beatsPerBar,ph=engPhase(),armed=W.st==='breakdown'&&W.armed,t=E.t;
  let why=sc.trig;sc.trig=null;if(!why&&sc.brk&&!A.brk)why='the beat is back';sc.brk=A.brk;
  const drop=sc.dropT;sc.dropT=false;
  /* the snare's jolt: one spring (3.5 Hz, damping .4), each cell a new way on each hit */
  if(M.snare.on&&b>.5){sc.sv+=6*(.4+.6*M.snare.str);if(sc.em)for(const c of sc.em.cells){const a=sc.R()*6.2832;c.dx=Math.cos(a);c.dy=Math.sin(a);}}
  {const w=22,z=.4,d=Math.min(dts,.05)/4;for(let k=0;k<4;k++){sc.sv+=(-w*w*sc.ss-2*z*w*sc.sv)*d;sc.ss+=sc.sv*d;}}
  if(sc.act==='one'){
    if(drop){if(!sc.em)engCdStart(sc,E,true);sc.act='emb';engCdBloom0(sc,E,b,'the drop');return;}   /* the drop is the bloom, at once */
    if(sc.P<4.98){const pace=ph==='calm'?.6:ph==='build'||armed?1.5:1;sc.P=Math.min(4.98,sc.P+db*pace/bpb);   /* a phase a bar, slower when calm, faster in a build */
      if(sc.P>=4.98)engLog('Celdeling: metaphase, the chromosomes on the plate: the checkpoint waits for the music');}
    else if(sc.P<5){const nb=why||armed||ph!=='calm'?engCdBar(sc,b):engCdBar(sc,b,4);   /* the spindle checkpoint */
      if(sc.rb==null||nb<sc.rb){sc.rb=nb;engLog('Celdeling: '+(why||ph)+' → anaphase in '+(nb-b).toFixed(1)+' beats');}
      if(b>=sc.rb){sc.P=5;sc.caT=t;sc.rP=2/((ph==='build'||armed?1:2)*bpb);}}
    else{const P0=sc.P;sc.P+=db*(sc.P<7?sc.rP:1/bpb);if(P0<7&&sc.P>=7)sc.abT=t;}   /* anaphase to abscission in 2 bars (1 in a build), then they round up */
    if(sc.P>=7.35&&!sc.em)engCdStart(sc,E,false);
    if(sc.P>=7.9)sc.act='emb';
    return;}
  const em=sc.em;if(sc.act!=='emb')return;
  if(drop){engCdBloom0(sc,E,b,'the drop');return;}
  const n=em.cells.length;
  if(n<sc.p.cap){const L=engCdRound(sc,E,ph,armed);
    if(em.rEnd==null){em.rL=L;em.rEnd=engCdBar(sc,b+(L-.5)*bpb);em.ru=0;   /* the nearest bar line L bars on (a slow frame may start it a little late) */const wa=sc.R()*6.2832,wc=Math.cos(wa),ws=Math.sin(wa);
      for(const c of em.cells)c.lag=.05*(1+Math.max(-1,Math.min(1,(c.x*wc+c.y*ws)/1.6)));   /* the division runs across the embryo as a wave */
      engLog('Celdeling: '+n+' → '+2*n+' cells, on the bar line in '+((em.rEnd-b)/bpb).toFixed(1)+' bars ('+(armed?'fitted to the drop':ph)+')');}
    else{const e2=engCdBar(sc,b+((1-em.ru)*L-.5)*bpb);if(e2<em.rEnd-.01)em.rEnd=e2;   /* a build shortens the round, never the other way */
      if(why){em.rEnd=Math.min(em.rEnd,engCdBar(sc,b+1));engLog('Celdeling: '+why+' → they divide on the next bar line');}}
    const rem=em.rEnd-(b-db);em.ru=Math.min(1,em.ru+(1-em.ru)*Math.min(1,db/Math.max(1e-3,rem)));   /* the round's clock reaches 1 on its bar line */
    if(b>=em.rEnd-1e-6)engCdDivide(sc,E);}
  else{if(em.hold0==null){em.hold0=b;engLog('Celdeling: '+n+' cells, a morula: it waits for the drop');}
    if(why&&em.blAt==null){em.blAt=engCdBar(sc,b+.01);em.why=why;}
    if(em.blAt==null&&!armed&&b-em.hold0>=8*bpb){em.blAt=engCdBar(sc,b,4);em.why='the wait';}}
  if(em.blAt==null&&b>=64*bpb){em.blAt=engCdBar(sc,b,4);em.why='the story ran long';}
  if(em.blAt!=null&&b>=em.blAt)engCdBloom0(sc,E,b,em.why);}
/* act 1: the close-up of the first division, drawn at fade (it crossfades into the embryo); its clock is engCdPace */
function engCdOne(sc,E,dts,b,fade){const C=ENG_CFG,A=EAR,M=MUSIC,N=E.N,h=(N-1)/2,t=E.t,bpb=C.beatsPerBar,R=sc.R,cl=engClamp,sm=engCdSm,PI=Math.PI;
    const P=cl(sc.P/8)*8,cD=.9,rd=.75,kick=M.kick.pulse,fsp=window.FEEL?FEEL.spring:kick,mel=window.FEEL?FEEL.mel:M.mel.pulse,mtd=Math.min(dts,.05);   /* the kick's hit-latched pulse (as hard as the hit), Feel's spring, the melody */
    /* the membrane: a Cassini oval (foci ±a, product b²), then relaxing (rl) into two round daughters of radius rd at ±cD */
    let a=0,bb=1,rl=0;
    if(P>7){const e=P-7;a=1+.05*sm(e*2);bb=1-.03*engEaseOut(Math.min(1,e*5));rl=sm((e-.05)/.8);}
    else if(P>6){const e=sm(P-6);a=.62+.38*e;bb=1.04-.04*e;}   /* the furrow: a lemniscate (b = a) exactly on the bar line */
    else if(P>5){const e=sm(P-5);a=.62*e;bb=1+.04*e;}   /* anaphase B: the cell stretches */
    const zm=P<7?1-.15*sm((P-5)/2):.85,cs=0,pxu=N*.35*zm,ax=sc.ax,ca=Math.cos(ax),sa=Math.sin(ax);   /* the camera: back a little as it stretches; with the two daughters the embryo takes over */
    const sw=.16*kick+.07*fsp,wb=.01+.02*A.env[0],w0=sc.sw[0],w1=sc.sw[1];
    const phi=(s,w)=>{const d1=Math.hypot(s-a,w),d2=Math.hypot(s+a,w);let f=Math.sqrt(d1*d2)/bb;
      if(rl>0){const fd=Math.min(Math.hypot(s-cD,w),Math.hypot(s+cD,w))/rd;f+=(fd-f)*rl;}
      const an=Math.atan2(w,s-rl*(s<0?-cD:cD))+ax;return f/(1+sw+wb*(Math.sin(3*an+t*1.3+w0)+.6*Math.sin(5*an-t*.9+w1)));};   /* the kick swells it (Feel's spring after it), the bass wobbles it a little */
    const NN=N*N;if(!sc.buf||sc.buf.length!==NN*3){sc.buf=new Float32Array(NN*3);sc.F=new Float32Array(NN);sc.S=new Float32Array(NN);sc.W=new Float32Array(NN);}
    const B=sc.buf,F=sc.F,SS=sc.S,WW=sc.W;B.fill(0);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const X=(x-h)/pxu,Y=(y-h)/pxu,s=X*ca+Y*sa+cs,w=-X*sa+Y*ca,i=y*N+x;SS[i]=s;WW[i]=w;F[i]=phi(s,w);}
    /* the chemistry: cyclin B builds up, CDK1 switches on (a steep switch), APC/C destroys it at anaphase */
    const cyc=P<5?.08+.92*Math.pow(P/5,1.6):P<7?.05+.95*Math.exp(-(P-5)*6):.05+.03*sm(P-7),cdk=1/(1+Math.exp(-(cyc-.55)*12));
    const nu=[];if(P<3.7)nu.push({s:0,w:0,r:.42,fr:1.3*sm((P-3)/.6),cd:1-sm((P-2)/.8),no:1-sm((P-1.9)/.5)});   /* the nucleus; its envelope breaks up in prometaphase */
    if(P>6.2){const e=sm((P-6.2)/1.8),r=.17+(.42*rd-.17)*e,c=.78+.12*e;for(const g of[1,-1])nu.push({s:g*c,w:0,r,fr:1.3*(1-sm((P-6.25)/.7)),cd:sm((P-6.7)/.8),no:sm((P-7.2)/.6)});}   /* two new ones */
    sc.dr+=mtd*(.12+.7*A.env[2])*E.mot;
    const mw=1.1+.8*A.env[0]+1.2*kick,act=sm((P-5.5)/.7)*(1-sm((P-7)/.12)),abF=Math.exp(-(t-sc.abT)/.35),caU=(t-sc.caT)/(bpb*60/E.bpm),
      mb=.42+.58*kick+.8*abF,ck=.7+.6*kick,gold=[1,.62,.22],red=[1,.2,.06],cyt=[.2,.1,.5],mag=[.75,.12,.6],caC=[.5,1,.85],lam=[.5,.78,1],dna=[.28,.48,1],nuc=[.7,.9,1],mc=[0,0,0],bc=[0,0,0];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,f=F[i],g=Math.max(1e-4,.5*Math.hypot(F[x<N-1?i+1:i]-F[x>0?i-1:i],F[y<N-1?i+N:i]-F[y>0?i-N:i])),dm=(f-1)/g;
      if(dm>14)continue;const s=SS[i],w=WW[i],j=i*3;let r=0,gr=0,bl=0;const ad=(v,c)=>{r+=v*c[0];gr+=v*c[1];bl+=v*c[2];};
      const ae=act*Math.exp(-s*s/.03),mx=Math.min(1,ae*1.5);for(let k=0;k<3;k++)mc[k]=gold[k]+(red[k]-gold[k])*mx;   /* the cortex turns red at the furrow */
      ad((cl((mw-Math.abs(dm))/1.1+.5)*.62*(1+.6*ae)+(dm>0?.3*Math.exp(-dm/1.8):.28*Math.exp(dm/2.4)))*mb,mc);   /* the membrane: a thick soft line, a halo out, a glow in */
      if(f<1){const z=Math.sqrt(Math.max(0,1-f*f));ad((.16+.1*z)*ck,cyt);ad(cdk*(.1+.12*z)*ck,mag);   /* cytoplasm, warming with CDK1; dim, lit up by the kick */
        if(f<.985){const lp=-Math.log(Math.max(f,1e-3)),u=lp*5-sc.dr,fr=u-Math.floor(u),sp=f/(5*g),rg=cl(1.05-Math.min(fr,1-fr)*sp)*cl((sp-1.8)/1.6)*cl((.985-f)/.08);   /* bands of equal potential, faded where they crowd */
          if(rg>0){const k=Math.floor(u)*.13+t*.015;bc[0]=.5+.4*Math.cos(6.283*k);bc[1]=.35+.3*Math.cos(6.283*(k+.33));bc[2]=.8+.2*Math.cos(6.283*(k+.67));ad(rg*(.16+.14*A.env[2]),bc);}}
        if(caU>=0&&caU<1){const dc=(f-caU*1.15)/.1;ad(.55*(1-caU)*Math.exp(-dc*dc),caC);}}   /* the Ca2+ wave */
      for(const n of nu){const ds=s-n.s,dw=w-n.w,rho=Math.hypot(ds,dw);if(rho>n.r+.12)continue;const dn=(rho-n.r)*pxu;
        if(n.fr<1.3){const th=Math.atan2(dw,ds)+ax,m=.5+.3*Math.sin(th*7+w0)+.2*Math.sin(th*11-w1);ad(cl(1.6-Math.abs(dn))*.55*cl((m+.3-n.fr)*4),lam);}   /* the envelope, in fragments while it breaks or forms */
        if(rho<n.r){const X=(ds*ca-dw*sa)/n.r*3.2,Y=(ds*sa+dw*ca)/n.r*3.2,ch=.5+.5*Math.sin(X*2.1+Math.sin(Y*1.7+t*.25)*1.6)*Math.sin(Y*2.3-Math.sin(X*1.9-t*.2)*1.4);
          ad((.18+.5*ch)*n.cd*cl(-dn/1.5),dna);if(n.no>0){const ox=X-.45,oy=Y+.35;ad(.55*n.no*Math.exp(-(ox*ox+oy*oy)*1.6),nuc);}}}   /* loose chromatin and the nucleolus */
      B[j]=r;B[j+1]=gr;B[j+2]=bl;}
    /* everything else is drawn as thick soft strokes in cell units (s along the spindle axis, w across) */
    const tx=(s,w)=>h+((s-cs)*ca-w*sa)*pxu,ty=(s,w)=>h+((s-cs)*sa+w*ca)*pxu;
    const seg=(s0,v0_,s1,v1_,rad,i0,i1,c)=>{const x0=tx(s0,v0_),y0=ty(s0,v0_),x1=tx(s1,v1_),y1=ty(s1,v1_),e=rad+2,dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1e-6,G=(rad+1.2)*(rad+1.2);
      const X0=Math.max(0,Math.floor(Math.min(x0,x1)-e)),X1=Math.min(N-1,Math.ceil(Math.max(x0,x1)+e)),Y0=Math.max(0,Math.floor(Math.min(y0,y1)-e)),Y1=Math.min(N-1,Math.ceil(Math.max(y0,y1)+e));
      for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const u=cl(((x-x0)*dx+(y-y0)*dy)/l2),ex=x0+dx*u-x,ey=y0+dy*u-y,d2=ex*ex+ey*ey,k=cl(rad-Math.sqrt(d2)+.5)+.3*Math.exp(-d2/G);
        if(k>.01){const v=k*(i0+(i1-i0)*u),jj=(y*N+x)*3;B[jj]+=v*c[0];B[jj+1]+=v*c[1];B[jj+2]+=v*c[2];}}};
    const dot=(s,w,rad,v,c)=>seg(s,w,s,w,rad,v,v,c),mtC=[.25,1,.4];
    /* the centrosomes: one, duplicated in interphase, then walking round the nucleus to the poles; anaphase B pushes them apart */
    const dvc=sm((P-.8)/.6),poles=[0,1].map(k=>{if(P<3.2){const a0=sc.ca0+(k?.15*dvc:0);let d=(k?PI:0)-a0;d-=6.283*Math.round(d/6.283);const e=sm((P-2)/1.2),an=a0+d*e,r0=.5+.12*e;return[r0*Math.cos(an),r0*Math.sin(an)];}
      const ps=P<5?.62:P<6.2?.62+.38*sm((P-5)/1.2):1+.275*sm((P-6.2)/1.8);return[(k?-1:1)*ps,0];});
    /* astral microtubules, dynamic instability: grow, catastrophe, shrink, rescue, stall at the cortex */
    const aI=(P<6.5?.38+.4*sm((P-1.5)/1.5):.78-.4*sm(P-6.5))*(.8+.4*A.I),vg=(.35+.45*A.I)*E.mot,kd=(t-A.onT[0])*1.6,kf=Math.exp(-(t-A.onT[0])/.6)*(.4+.6*M.kick.str);
    if(M.snare.on&&b>.5){const st=M.snare.str;for(const m of sc.mt)if(m.g&&R()<.2+.5*st){m.g=0;m.fl=1;}sc.tv+=.5+1.4*st;}   /* snare: a burst of catastrophes, and a tug on the chromosomes, as hard as the hit */
    for(const m of sc.mt){const pl=poles[m.k],dx=Math.cos(m.ang),dy=Math.sin(m.ang);m.fl=Math.max(0,m.fl-mtd*4);
      if(m.g){m.L+=mtd*vg*(.7+.6*m.v);if(R()<mtd*.25)m.g=0;}else{m.L-=mtd*1.4;if(m.L<.04){m.L=.04;m.g=1;}else if(R()<mtd*.7)m.g=1;}
      for(let l=.04;l<m.L;l+=1/pxu){const xi=Math.round(tx(pl[0]+dx*l,pl[1]+dy*l)),yi=Math.round(ty(pl[0]+dx*l,pl[1]+dy*l));
        if(xi<0||yi<0||xi>=N||yi>=N||F[yi*N+xi]>.95){m.L=l;if(m.g&&R()<mtd*2)m.g=0;break;}}
      const v=aI*(.45+.25*m.v),ex=pl[0]+dx*m.L,ey=pl[1]+dy*m.L;seg(pl[0]+dx*.04,pl[1]+dy*.04,ex,ey,.55,v*.9,v*.6,mtC);
      if(m.g)dot(ex,ey,.7,v*.8,[.7,1,.6]);else if(m.fl>0)dot(ex,ey,.8,m.fl*(R()<.5?1:.3),[1,1,1]);   /* the GTP cap; a catastrophe flickers */
      if(kd<m.L)dot(pl[0]+dx*kd,pl[1]+dy*kd,.9,.7*kf*aI,[.8,1,.75]);}   /* kick: fresh tubulin runs out along the aster */
    const spv=sm((P-3.2)/.5)*(1-sm((P-6.9)/.4)),spr=.3*(1-.85*sm(P-6));   /* the spindle's overlapping interpolar fibres */
    if(spv>0)for(let k=0;k<2;k++){const pl=poles[k],g=k?-1:1;for(let j=0;j<7;j++)seg(pl[0],pl[1],-g*.12,(j-3)/3*spr,.5,.5*spv,.35*spv,mtC);}
    /* the chromosomes: condense, congress to the plate, tug, split centromere first with the arms trailing, loosen again */
    sc.tv+=(-sc.tug*30-sc.tv*4)*mtd;sc.tug+=sc.tv*mtd;
    const cc=sm((P-2)/.8)*(1-sm((P-6.6)/.8)),e5=sm((P-5)/1.15),e6=sm((P-6.2)/1.8),kfv=sm((P-3.05)/.3)*(1-sm((P-6.1)/.4)),bt=.38-1.5*Math.pow(e5,.7);
    if(cc>0||kfv>0)sc.ch.forEach((c,i)=>{const e3=sm((P-3.05-.06*i)/.85),jit=.2*e3*(1-e3),osc=P>3.5&&P<5.2?.025*Math.sin(t*1.7+c.ph)+.15*sc.tug*Math.sin(c.ph*3):0,
        ms=c.hs*(1-e3)+jit*Math.sin(t*3.1+c.ph)+osc,mw2=c.hw*(1-e3)+c.wi*e3+jit*Math.cos(t*2.3+c.ph),ph=(c.phi+t*.08)*(1-e3),cf=Math.cos(ph),sf=Math.sin(ph),cap=sm((P-3.05-.08*i)/.4);
      for(const g of[1,-1]){const ox=g*.022,cx=ms+ox*cf+g*(.78*e5+.12*e6),cw=mw2*(1-.5*e5)*(1-.4*e6)+ox*sf;
        if(kfv*cap>0){const pl=poles[g>0?0:1];seg(pl[0],pl[1],pl[0]+(cx-pl[0])*cap,pl[1]+(cw-pl[1])*cap,.6,.55*kfv,.7*kfv,mtC);}   /* the kinetochore fibre */
        if(cc>0){for(const k of[1,-1]){const ux=g*Math.sin(bt),uy=k*Math.cos(bt);seg(cx,cw,cx+(ux*cf-uy*sf)*c.len,cw+(ux*sf+uy*cf)*c.len,.045*pxu,.75*cc*(1+.6*mel),.6*cc*(1+.6*mel),c.col);}
          dot(cx,cw,.7,.45*cc*kfv,[1,.35,.75]);}}});   /* the kinetochore */
    const nw=Math.sqrt(Math.max(0,bb*bb-a*a));   /* the contractile ring: seen a little tilted, the front half brighter */
    if(act>0&&nw>.01){let ls=0,lw=nw;for(let k=1;k<=24;k++){const th=k/24*6.283,s2=.16*nw*Math.sin(th),w2=nw*Math.cos(th),v=.5*act*(.6+.4*Math.sin(th))*(1+.6*kick);seg(ls,lw,s2,w2,1.2,v,v,red);ls=s2;lw=w2;}}
    const mbv=sm((P-6.5)/.4)*(1-sm((P-7.3)/.5));if(mbv>0)seg(-.05,0,.05,0,1.1,.6*mbv,.6*mbv,[.6,1,.6]);   /* the midbody */
    if(abF>.02)dot(0,0,1+6*abF,1.4*abF,[1,.95,.9]);   /* abscission */
    for(let k=0;k<2;k++)dot(poles[k][0],poles[k][1],1.3+.7*kick,(k?dvc:1)*(.75+.5*kick)*.9,[1,.92,.55]);
    /* vesicles: Brownian jitter, carried round by the streaming, kept inside; the hats make them sparkle */
    const fl=(.05+.25*A.env[2])*E.mot,bro=.09*Math.sqrt(mtd);if(M.hat.on)for(let j=0,n=2+Math.round(6*M.hat.str);j<n;j++)sc.ves[R()*sc.ves.length|0].sp=1;
    for(const v of sc.ves){v.sp*=Math.exp(-mtd/.15);const c0=rl>.3?(v.s<0?-cD:cD):P>5?Math.sign(v.s)*Math.min(a,.6):0;
      v.s+=(R()-.5)*2*bro-v.w*fl*mtd;v.w+=(R()-.5)*2*bro+(v.s-c0)*fl*mtd;if(phi(v.s,v.w)>.92){v.s+=(c0-v.s)*.1;v.w*=.9;}
      dot(v.s,v.w,.6,(.2+.8*v.sp)*(.5+.5*v.v)*(.6+.6*A.env[4]),[1,.85,.55]);}
    const o=[0,0,0];   /* out: soft-clipped */
    if(fade>0)for(let i=0;i<NN;i++){const k=fade,j=i*3;
      o[0]=Math.min(.92,1-Math.exp(-1.2*B[j]));o[1]=Math.min(.92,1-Math.exp(-1.2*B[j+1]));o[2]=Math.min(.92,1-Math.exp(-1.2*B[j+2]));if(o[0]+o[1]+o[2]>.005)engPut(i,k,o);}}
/* act 2: the embryo. Every frame the cells round up, push each other into a ball inside the zona and jolt on the snare; then the smooth
   union of their Cassini fields is drawn (membranes, a wall where two fields meet, cytoplasm, nuclei, spindles, the furrow), at k */
function engCdEmb(sc,E,dts,b,k){const D=ENG_CD,M=MUSIC,em=sc.em,L=em.cells,n=L.length,N=E.N,h=(N-1)/2,t=E.t,cl=engClamp,sm=engCdSm,bpb=ENG_CFG.beatsPerBar,bar=bpb*60/E.bpm,
    kick=M.kick.pulse,spr=window.FEEL?FEEL.spring:kick,mel=window.FEEL?FEEL.mel:M.mel.pulse,dt=Math.min(dts,.05),live=sc.act==='emb';
  if(live)em.pxe+=(N*.235-em.pxe)*(1-Math.exp(-dt/1.2));   /* the camera pulls back onto the whole zona */
  const pxe=em.pxe,comp=em.hold0==null?0:sm((b-em.hold0)/(2*bpb)),grow=1+.1*comp,sw=.2*kick+.08*spr,J=.5*sc.ss;   /* a morula compacts: the cells press flat */
  for(const c of L){c.u=em.hold0!=null||!live?0:cl((em.ru-c.lag)/(1-c.lag));const u=c.u;c.a=0;c.bb=1;
    if(u>.86){const e=sm((u-.86)/.14);c.a=.62+.38*e;c.bb=1.04-.04*e;}else if(u>.72){const e=sm((u-.72)/.14);c.a=.62*e;c.bb=1+.04*e;}   /* the close-up's schedule: stretch, then the furrow to a lemniscate */
    if(c.rel<1)c.rel=Math.min(1,c.rel+dt/(.6*bar));}
  /* the packing: soft discs (a dividing cell longer along its axis), a gentle pull to the middle, the zona round them all */
  {const kk=Math.min(1,dt*8),pull=live?Math.min(.5,dt*1.2):0;for(const c of L){c.x*=1-pull;c.y*=1-pull;}
    for(let it=0;it<3;it++)for(let i=0;i<n;i++){const A=L[i],xa=Math.cos(A.ax),ya=Math.sin(A.ax);for(let j=i+1;j<n;j++){const Bc=L[j];let dx=Bc.x-A.x,dy=Bc.y-A.y;const d=Math.sqrt(dx*dx+dy*dy)||1e-4;dx/=d;dy/=d;
      const m=(A.r*(1+.45*A.a*Math.abs(dx*xa+dy*ya))+Bc.r*(1+.45*Bc.a*Math.abs(dx*Math.cos(Bc.ax)+dy*Math.sin(Bc.ax))))*.94*grow-d;
      if(m>0){const s=m*.5*kk;A.x-=dx*s;A.y-=dy*s;Bc.x+=dx*s;Bc.y+=dy*s;}}}
    for(const c of L){const d=Math.sqrt(c.x*c.x+c.y*c.y),m=d+c.r*grow-D.Z;if(m>0&&d>1e-4){c.x-=c.x/d*m;c.y-=c.y/d*m;}}}
  /* each cell's field this frame: the kick swells it (Feel's spring after it), the snare's spring jolts it */
  const G=L.map(c=>{const R0=c.r*(1+sw)*grow,o={c,R:R0,x:c.x+c.dx*J*c.r,y:c.y+c.dy*J*c.r,ca:Math.cos(c.ax),sa:Math.sin(c.ax),bd:R0*(c.rel<1?3.4:2.1)+.3,rk:sm(c.rel),p:c.par};
    if(c.rel<1){o.pR=c.par.r*(1+sw)*grow;o.pca=Math.cos(c.par.ax);o.psa=Math.sin(c.par.ax);}return o;});
  const F=sc.eF,F2=sc.eF2,I=sc.eI,I2=sc.eJ,B=sc.eb;B.fill(0);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const X=(x-h)/pxe,Y=(y-h)/pxe;let f1=99,f2=99,i1=-1,i2=-1;
    for(let j=0;j<n;j++){const o=G[j],c=o.c,dx=X-o.x,dy=Y-o.y;let f;
      if(dx>o.bd||dx<-o.bd||dy>o.bd||dy<-o.bd)f=Math.sqrt(dx*dx+dy*dy)/o.R;   /* far off: its distance is enough, and keeps the field smooth */
      else{const s=dx*o.ca+dy*o.sa,w=-dx*o.sa+dy*o.ca,w2=w*w,aR=c.a*o.R;f=c.a>0?Math.sqrt(Math.sqrt(((s-aR)*(s-aR)+w2)*((s+aR)*(s+aR)+w2)))/(c.bb*o.R):Math.sqrt(s*s+w2)/o.R;   /* the Cassini oval: sqrt(|x-f1|.|x-f2|)/b */
        if(c.rel<1){const qx=X-o.p.x,qy=Y-o.p.y,ps=qx*o.pca+qy*o.psa,pw=-qx*o.psa+qy*o.pca,p2=pw*pw,fp=Math.sqrt(Math.sqrt(((ps-o.pR)*(ps-o.pR)+p2)*((ps+o.pR)*(ps+o.pR)+p2)))/o.pR;f=fp+(f-fp)*o.rk;}}   /* rounding up from the parent's lemniscate */
      if(f<f1){f2=f1;i2=i1;f1=f;i1=j;}else if(f<f2){f2=f;i2=j;}}
    const i=y*N+x;F[i]=f1;F2[i]=f2;I[i]=i1;I2[i]=i2;}
  const gold=[1,.62,.22],cyt=[.2,.1,.5],mag=[.75,.12,.6],abF=Math.exp(-(t-em.abT)/.35),mb=(.5+.5*kick)*(1+.4*comp*Math.max(0,spr))+.5*abF,ck=.8+.6*kick,mw=1+1.1*kick;   /* dim between the hits, lit by the kick */
  for(const c of L){const u=c.u,cyc=u<.72?.08+.92*Math.pow(u/.72,1.6):.05+.95*Math.exp(-(u-.72)*40);c.cdk=1/(1+Math.exp(-(cyc-.55)*12));}   /* cyclin B builds up, CDK1 switches on, APC/C destroys it at anaphase */
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,f=F[i],gx=F[x<N-1?i+1:i]-F[x>0?i-1:i],gy=F[y<N-1?i+N:i]-F[y>0?i-N:i],g=Math.max(1e-4,.5*Math.sqrt(gx*gx+gy*gy)),dm=(f-1)/g;if(dm>14)continue;
    let gm=(cl((mw-Math.abs(dm))/1.1+.5)*.62+(dm>0?.28*Math.exp(-dm/1.6):.2*Math.exp(dm/2.2)))*mb,cy=0,cm=0;   /* the membranes: a thick soft line, a halo out, a glow in */
    if(f<1){const z=Math.sqrt(1-f*f),c=L[I[i]];cy=(.12+.08*z)*ck;cm=c.cdk*(.08+.1*z)*ck;   /* cytoplasm, a dome; it warms to magenta as CDK1 switches on */
      if(I2[i]>=0&&F2[i]<1.3){const c2=L[I2[i]],ws=c2===c.sis?Math.min(c.rel,c2.rel):1,wv=cl(1.1-(F2[i]-f)/(2.2*g))*sm(ws);if(wv>0)gm+=.6*wv*mb;}}   /* a wall where two cells meet (between sisters it closes as they round up) */
    const j=i*3;B[j]=gm*gold[0]+cy*cyt[0]+cm*mag[0];B[j+1]=gm*gold[1]+cy*cyt[1]+cm*mag[1];B[j+2]=gm*gold[2]+cy*cyt[2]+cm*mag[2];}
  const dna=[.28+.3*mel,.48,1],nucC=[.7,.9,1],mtC=[.25,1,.4],red=[1,.2,.06],pole=[1,.92,.55];
  for(const o of G){const c=o.c,u=c.u,px=h+o.x*pxe,py=h+o.y*pxe,Rp=o.R*pxe,ca=o.ca,sa=o.sa,nv=(.5+.5*mel)*(1+.3*kick);   /* the melody lights the DNA */
    if(u<.6){const e=sm((u-.45)/.15),rr=Rp*(.4-.12*e)*(.55+.45*o.rk);engCdDot(B,N,px,py,rr,(.32+.25*e)*nv,dna);if(e<.5&&rr>1.5)engCdDot(B,N,px+rr*.35,py-rr*.3,rr*.3,.35*(1-2*e),nucC);}   /* the nucleus (and its nucleolus), condensing */
    else if(u<.86){const e=sm((u-.72)/.14),ln=Rp*(u<.72?.28:.22),off=Rp*.6*e;for(const g of u<.72?[0]:[1,-1]){const qx=px+ca*off*g,qy=py+sa*off*g;engCdSeg(B,N,qx-sa*ln,qy+ca*ln,qx+sa*ln,qy-ca*ln,.6,.7*nv,.7*nv,dna);}}   /* the plate, then the two sets pulled apart */
    else{const e=sm((u-.86)/.14),off=Rp*(.6+.15*e);for(const g of[1,-1])engCdDot(B,N,px+ca*off*g,py+sa*off*g,Rp*.2*(1+e),.55*nv,dna);}   /* two new nuclei */
    if(u>.55&&u<.95){const e=sm((u-.55)/.2)*(1-sm((u-.88)/.07)),pl=Rp*(.55+.35*sm((u-.72)/.2));engCdSeg(B,N,px-ca*pl,py-sa*pl,px+ca*pl,py+sa*pl,.45,.35*e,.35*e,mtC);
      for(const g of[1,-1])engCdDot(B,N,px+ca*pl*g,py+sa*pl*g,.7+.5*kick,.6*e*(.75+.5*kick),pole);}   /* the spindle and its poles */
    if(u>.8){const nw=Math.sqrt(Math.max(0,c.bb*c.bb-c.a*c.a))*Rp,v=.6*sm((u-.8)/.06)*(1+.6*kick);for(const g of[1,-1])engCdDot(B,N,px-sa*nw*g,py+ca*nw*g,.9,v,red);}}   /* the contractile ring, pinching the waist */
  if(M.hat.on&&live)for(let j=0,m=1+Math.round(4*M.hat.str);j<m;j++){const o=G[Math.floor(sc.R()*n)],a=sc.R()*6.2832,rr=Math.sqrt(sc.R())*.7*o.R;em.spk.push({x:o.x+Math.cos(a)*rr,y:o.y+Math.sin(a)*rr,t0:t});}   /* hats: sparkles in the cells */
  em.spk=em.spk.filter(s=>t-s.t0<.4);for(const s of em.spk)engCdDot(B,N,h+s.x*pxe,h+s.y*pxe,.5,1.1*Math.exp(-(t-s.t0)/.07),[1,.85,.55]);
  if(abF>.02)for(let q=0;q<em.mid.length;q+=2)engCdDot(B,N,h+em.mid[q]*pxe,h+em.mid[q+1]*pxe,.8+2*abF,1.2*abF,[1,.95,.9]);   /* abscission: a flash at each midbody */
  {const Zp=D.Z*pxe,v=(.14+.18*kick)*(live?1:sm((sc.P-7.35)/.5));for(let q=0,m=Math.ceil(Zp*6.3);q<m;q++){const a=q/m*6.2832;engCdDot(B,N,h+Math.cos(a)*Zp,h+Math.sin(a)*Zp,.45,v,[.5,.72,.85]);}}   /* the zona pellucida */
  const o=[0,0,0];if(k>0)for(let i=0;i<N*N;i++){const j=i*3;o[0]=Math.min(.92,1-Math.exp(-1.2*B[j]));o[1]=Math.min(.92,1-Math.exp(-1.2*B[j+1]));o[2]=Math.min(.92,1-Math.exp(-1.2*B[j+2]));if(o[0]+o[1]+o[2]>.005)engPut(i,k,o);}}
/* act 3: the bloom. Vogel's model: cell i at angle i x the golden angle, radius cb sqrt(n - i); n grows on the kicks */
function engCdBloom(sc,E,dts,b,k){const D=ENG_CD,M=MUSIC,bl=sc.bl,N=E.N,h=(N-1)/2,t=E.t,sm=engCdSm,R=sc.R,B=sc.eb,bar=ENG_CFG.beatsPerBar*60/E.bpm,
    kick=M.kick.pulse,spr=window.FEEL?FEEL.spring:kick,mel=window.FEEL?FEEL.mel:M.mel.pulse;
  if(M.kick.on&&t-bl.t0>.05)bl.nT=Math.min(D.NB,bl.nT+3+9*M.kick.str);   /* the kick: new cells in the middle, more on a harder hit */
  bl.n+=(bl.nT-bl.n)*(1-Math.exp(-dts/.07));const nn=Math.min(D.NB,Math.ceil(bl.n));
  if(M.snare.on)bl.waves.push({t0:t,s:.4+.6*M.snare.str});bl.waves=bl.waves.filter(w=>t-w.t0<.7);   /* the snare: a ring running out */
  for(let i=0;i<nn;i++)bl.sp[i]*=Math.exp(-dts/.06);if(M.hat.on)for(let j=0,m=2+Math.round(5*M.hat.str);j<m;j++)bl.sp[Math.floor(R()*nn)]=1;   /* hats: a twinkle */
  if(M.mel.on&&M.mel.str>.35&&t-bl.fT>2*bar){bl.fp=bl.fi;bl.fi=(bl.fi+1)%D.FIB.length;bl.fT=t;}   /* a melody note: the next family of spirals */
  /* the spiral a cell sits on in a family of F: i mod F; side by side those differ by the Fibonacci number before F (Fm), and as Fm x Fm = ±1
     mod F (Cassini's identity), (i mod F) x Fm mod F counts the spirals in the order they lie; the colours run round them q times (about
     one colour a spiral, a whole number of rounds so it closes) */
  const wf=sm((t-bl.fT)/.3),F0=D.FIB[bl.fp],F1=D.FIB[bl.fi],m0=D.FIBm[bl.fp],m1=D.FIBm[bl.fi],q0=Math.max(1,Math.round(F0/7)),q1=Math.max(1,Math.round(F1/7)),cb=N*.03*(1+.1*spr+.05*kick),rho=N*.017,fo=sm((t-bl.t0)/(.6*bar)),base=.45+.55*kick,c=[0,0,0],c0=[0,0,0];   /* Feel's spring breathes the whole flower */
  B.fill(0);
  for(let i=0;i<nn;i++){if(!bl.born[i])bl.born[i]=t;const kk=Math.max(0,bl.n-i),r0=cb*Math.sqrt(kk),th=i*D.GA+bl.th0;
    let x=h+Math.cos(th)*r0,y=h+Math.sin(th)*r0,rad=rho*Math.min(1,.4+.3*kk);
    if(i<bl.n0){x=bl.ix[i]+(x-bl.ix[i])*fo;y=bl.iy[i]+(y-bl.iy[i])*fo;rad=bl.ir[i]+(rad-bl.ir[i])*fo;}   /* the embryo's cells fly out to their places */
    const rr=Math.sqrt((x-h)*(x-h)+(y-h)*(y-h));if(rr-rad>N*.72)continue;
    let wv=0;for(const w of bl.waves){const d=rr-(t-w.t0)*N*1.1;wv+=w.s*Math.exp(-d*d/3)*(1-(t-w.t0)/.7);}
    const s1=i%F1*m1%F1;engCdPal(s1*q1/F1,c);if(wf<1){engCdPal(i%F0*m0%F0*q0/F0,c0);for(let q=0;q<3;q++)c[q]=c0[q]+(c[q]-c0[q])*wf;}   /* the colour marks the spiral it sits on */
    const hot=Math.exp(-(t-bl.born[i])/.25),arm=s1%2?0:1,wh=Math.min(1,.85*hot+.5*(bl.sp[i]+wv));for(let q=0;q<3;q++)c[q]+=(1-c[q])*wh;   /* newborn white-hot */
    engCdDot(B,N,x,y,rad*(1+.3*wv),base*(.75+.5*mel*arm)+.9*wv+bl.sp[i]+.6*hot,c);}
  const za=t-bl.t0;if(za<.9)for(let j=0;j<7;j++){const a0=bl.za+j*.8976+za*.5*(j%2?1:-1),Rz=bl.Zp+za*N*(.45+.12*(j%3)),m=Math.ceil(Rz*.69),v=.55*Math.exp(-za/.4);
    for(let q=0;q<=m;q++){const a=a0+q/m*.69;engCdDot(B,N,h+Math.cos(a)*Rz,h+Math.sin(a)*Rz,.45,v,[.55,.78,.9]);}}   /* hatching: the zona cracks into arcs that fly off */
  const ba=t-bl.burst;if(ba<.45)engCdDot(B,N,h,h,N*.04+ba*N*.5,1.1*Math.exp(-ba/.12),[1,1,1]);   /* the burst */
  const o=[0,0,0];if(k>0)for(let i=0;i<N*N;i++){const j=i*3;o[0]=Math.min(.92,1-Math.exp(-1.2*B[j]));o[1]=Math.min(.92,1-Math.exp(-1.2*B[j+1]));o[2]=Math.min(.92,1-Math.exp(-1.2*B[j+2]));if(o[0]+o[1]+o[2]>.005)engPut(i,k,o);}}
engScene('celdeling',{name:'Celdeling',entry:['dark','dot'],exit:['dark'],bars:[16,16,32],energy:.35,lit:.6,key:['nch','paint','cap'],noLoop:true,keepFall:true,
  params:{nch:{int:[5,7]},paint:{p:.75},cap:{pick:[16,32,32]},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;const R=sc.R;   /* never on its side or copied */
    sc.act='one';sc.P=0;sc.rP=0;sc.rb=null;sc.em=null;sc.bl=null;sc.trig=sc.then=null;sc.dropT=false;sc.brk=EAR.brk;sc.ss=0;sc.sv=0;
    sc.ax=R()*6.283;sc.ca0=R()*6.283;sc.tug=0;sc.tv=0;sc.caT=-99;sc.abT=-99;sc.dr=0;sc.sw=[R()*6.28,R()*6.28];sc.po=R()*7|0;sc.buf=null;
    engCellCh(sc);sc.mt=[];for(let j=0;j<40;j++)sc.mt.push({k:j&1,ang:R()*6.283,L:.1+.4*R(),g:R()<.7?1:0,fl:0,v:R()});
    sc.ves=[];for(let j=0;j<36;j++)sc.ves.push(engCellVes(R));},
  hold(sc,E,s){if(s&&!sc.bl&&s.kind==='in')sc.trig='a new section';return!!s||!sc.then;},   /* the story holds through new sections (one coming in moves it on) and breakdowns, till the hand-over */
  ownDrop(sc,E){if(!sc.bl){sc.dropT=true;return true;}   /* the drop is the bloom */
    if(E.beat-sc.b0-sc.bl.b0<4*ENG_CFG.beatsPerBar){sc.bl.nT=Math.min(ENG_CD.NB,sc.bl.nT+40);sc.bl.burst=E.t;return true;}   /* another drop soon after: a second burst */
    if(sc.then){sc.then.style='cut';sc.b1=E.beat;return true;}return false;},   /* later: Morphology at once */
  say:sc=>'one cell dividing in fluorescence colours, waiting at its checkpoint for the music, then the embryo: 2, 4, 8 … '+sc.p.cap+' cells (Cassini ovals), faster on a build, a morula waiting for the drop; on the drop it hatches and blooms into Vogel\'s sunflower of cells (golden angle) that grows on the kicks, then Morphology; kick = swell + light, snare = catastrophes / a jolt / a ring, hats = sparkles, melody = DNA glow and the spirals'+(sc.p.paint?', painted chromosomes':''),
  draw(sc,E,dts,b,tick,db){const bpb=ENG_CFG.beatsPerBar,N=E.N,NN=N*N,fade=engEaseOut(Math.min(1,b/2))*(sc.noHold&&!sc.then?1-engClamp((b-(sc.b1-sc.b0-bpb))/bpb):1);   /* in from the dark; out only when it is ended early */
    engCdPace(sc,E,b,db||0,dts);
    if(!sc.eb||sc.eb.length!==NN*3){sc.eb=new Float32Array(NN*3);sc.eF=new Float32Array(NN);sc.eF2=new Float32Array(NN);sc.eI=new Int16Array(NN);sc.eJ=new Int16Array(NN);}
    const x=sc.act==='one'?(sc.em?engCdSm((sc.P-7.35)/.5):0):1;   /* the close-up crossfades into the embryo as the daughters round up */
    if(sc.act==='one')engCdOne(sc,E,dts,b,fade*(1-x));
    if(sc.bl)engCdBloom(sc,E,dts,b,fade);else if(sc.em)engCdEmb(sc,E,dts,b,fade*x);}});
/* ---------- Comic merger (engTm…), after Wilco's 4×4 storyboard (2026-10-22) ----------
   The merger once more, told as a comic: flat bold colours, thick tapered brush strokes, hard edges, a black ground, a small palette
   (orange/yellow/white heat, teal/blue/purple field lines, magenta/cyan waves). Only the painting is new; the motion borrows the real
   physics without touching it: engMgOrbit (the chirp: distance ∝ (time left)^1/4, phase ∝ 1−(time left)^5/8, Kepler), the
   pseudo-Newtonian orbital speed of the gas (v = √(GMmr)/(r−m), last stable orbit 3 rs), black shadows of 2.6 rs flowing into one
   peanut (engMgShadow), the gravitational waves (twice the orbital phase at the retarded time, then a ring-down) and, for the last
   hole, the exact Schwarzschild light paths (engBHLens/engBHu). Every LED gets one flat colour, never a gradient */
const ENG_TM={wht:[1,1,.86],yel:[1,.84,.1],org:[1,.42,.02],red:[.88,.1,.02],teal:[0,.78,.7],blu:[.1,.3,1],pur:[.55,.18,1],mag:[1,.08,.72],cya:[0,.88,1],navy:[.06,.16,.6],sky:[.4,.7,1],nb:128};
/* the gas's angular speed at r (in the hole's own rs; Paczyński–Wiita: Ω = √(GMr)/((r−rs)·r)), held at the last stable orbit inside it */
const engTmOm=r=>{r=Math.max(r,3);return Math.sqrt(r)/((r-1)*r);};
const engTmBin=(dx,dy)=>{let a=Math.atan2(dy,dx);if(a<0)a+=6.2832;return Math.min(ENG_TM.nb-1,(a/6.2832*ENG_TM.nb)|0);};
/* brush lanes: rings of the disc for 4 owners (0, 1 = round each hole, 2 = round both, 3 = round the remnant), each lane with its own
   orbital phase, a flare level and 3 tapered strokes (start angle, length, width); the outer lanes, the flame tips, get shorter strokes */
function engTmLanes(R,nL){const n=4*nL,o={nL,ph:new Float64Array(n),fl:new Float32Array(n),sa:new Float32Array(3*n),sl:new Float32Array(3*n),sw:new Float32Array(3*n)};
  for(let k=0;k<n;k++){const out=k%nL>=Math.ceil(nL/2);o.ph[k]=R()*6.2832;
    for(let i=0;i<3;i++){const j=3*k+i;o.sa[j]=i*2.0944+(R()-.5)*1.2;o.sl[j]=out?.7+1.1*R():1.5+1.7*R();o.sw[j]=.78+.22*R();}}
  return o;}
/* on a stroke of lane k? d = distance from the lane's middle (in lanes), th = the angle; returns how far along (0 head .. 1 tail) or −1.
   Thick just behind the head, thinning to a point at the tail; the head leads the orbit */
function engTmStroke(T,k,d,th,wk){const ph=T.ph[k];for(let i=0;i<3;i++){const j=3*k+i,len=T.sl[j];let s=ph+T.sa[j]-th;s-=6.2832*Math.floor(s/6.2832);if(s>=len)continue;
    const u=s/len,w=.5*T.sw[j]*wk*(u<.1?Math.sqrt(u/.1):1)*Math.pow(1-u,.8);if(d<w)return u;}return -1;}
/* a comic starburst as a radius profile over the angle (nb bins): n spikes of random length (0.35..1) and width round the circle */
function engTmStar(R,n,hw,jit){const nb=ENG_TM.nb,p=new Float32Array(nb),a0=R()*6.2832;
  for(let i=0;i<n;i++){const a=(a0+(i+(R()-.5)*jit)*6.2832/n)/6.2832*nb,L=.35+.65*R(),w=Math.max(1,hw*(.6+.8*R())*nb/6.2832);
    for(let k=Math.floor(a-w);k<=Math.ceil(a+w);k++){const v=L*(1-Math.abs(k-a)/w);if(v>0){const q=((k%nb)+nb)%nb;if(v>p[q])p[q]=v;}}}
  return p;}
/* Comic merger: the storyboard's 16 panels over the scene's bars. 1–6 (the inspiral, 3–5 bars on the chirp): two black cores in swirls
   of thick orange and yellow brush-stroke flames, each lane of strokes orbiting at its own pseudo-Newtonian speed (inner fast, outer
   slow), thin teal/blue/purple field lines (the pair's equipotentials) bending round them; as they close in the flames (equal-pull
   contours of both holes) stretch into a figure-8 and fuse into one peanut, the outer lanes now orbiting both. 7 (first half of the
   last beat): a yellow-white spark burst from the middle; 8: a dark blue swirling shock with white light spikes, the shadows flowing
   into one. On the bar line (or the drop): 9 a white, yellow and red starburst round the new core, 10 a neon explosion (red and
   magenta spikes, a cyan ring, magenta arcs), 11 the gas a purple and magenta swirl, 12 the gravitational waves as cyan/blue/magenta
   rings: the real wave train (tighter towards the merger, then the remnant's ring-down) running out. 13–14 the gas heats lane by lane
   into one orange-yellow flame disc round the bigger hole, tilting; 15 calm blue ripples on every kick (the remnant shaken, ringing
   down); 16 the disc near edge-on, its far side bent over and under the shadow by the real lens, the side coming at us a shade hotter.
   The kick pumps the cores and speeds the swirl, the snare flares a lane of strokes white */
function engTmDraw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,p=sc.p,h=(N-1)/2,t=E.t,R=sc.R,P=ENG_TM,L=E.lay,bpb=C.beatsPerBar,end=sc.b1-sc.b0-bpb,
    q=engClamp((b-end)/bpb),fade=engEaseOut(Math.min(1,b/2))*(1-q),kick=Math.exp(-(t-A.onT[0])/.2),spr=Math.max(0,A.spr[0]||0),bt=60/E.bpm,
    v0=fade*(.86+.14*Math.min(1,A.env[2]*1.6)),put=(i,c,v)=>{const j=3*i;L[j]=c[0]*v;L[j+1]=c[1]*v;L[j+2]=c[2]*v;};
  if(!sc.tmc){const c0=sc.c0,ib=Math.max(2,Math.min(p.insp,Math.floor((end-c0-12)/bpb))),m1=1/(1+p.ratio);   /* the plan: the inspiral ends on a bar line, 3+ bars after it; long scenes circle first */
    const cs=c0+bpb*Math.max(0,Math.floor((end-c0-ib*bpb-32)/bpb));sc.tmc={c0:cs,ib,m:cs+ib*bpb,ph0:R()*6.2832,turns:4+ib,a0:14,m1,m2:1-m1,merged:false,o1:{},o2:{},sh:0,wq:20};}
  const cy=sc.tmc;let T=sc.tm;
  if(!T||T.N!==N){const nL=N>=80?6:N>=56?5:4;T=sc.tm={N,nL,ln:engTmLanes(R,nL),G:{M:new Float32Array(N*N)},Pp:new Float32Array(6),o:{},W:0,rip:[],gw:new Float32Array(4*N),
    s7y:engTmStar(R,14,.16,.6),s7w:engTmStar(R,10,.14,.6),s8:engTmStar(R,7,.05,.8),s9w:engTmStar(R,16,.14,.5),s9y:engTmStar(R,20,.12,.5),s9r:engTmStar(R,24,.1,.5),s10r:engTmStar(R,26,.1,.5),s10m:engTmStar(R,30,.045,.7)};}
  const ln=T.ln,nL=T.nL,nb=P.nb,ks=p.spin*10.88*(.7+.6*A.I)*(E.mot||1)*(1+.5*spr),wk=1+.25*spr,ldec=Math.exp(-dts/.35);   /* ks: p.spin turns a second at a small hole's last stable orbit */
  for(let k=0;k<ln.fl.length;k++)ln.fl[k]*=ldec;
  if(!cy.merged&&A.drop&&b>cy.c0+1&&b<cy.m)cy.m=b;   /* a real drop: they merge now */
  if(!cy.merged&&b>=cy.m){cy.merged=true;const md=cy.m-.12,o=engMgOrbit(cy,md,cy.o1),o2=engMgOrbit(cy,md-.02,cy.o2),vpx=h/2.2;   /* the merge: the wave train's last numbers */
    cy.md=md;cy.ad=o.a;cy.pd=2*o.ph;cy.wq=Math.max(2,Math.min(6.2832*vpx/3.2,1.3*2*(o.ph-o2.ph)/.02));cy.tq=2*6.2832/cy.wq;cy.sh=1;T.W=Math.max(T.W,9);}   /* the camera jumps back a little: the new core no bigger than the burst */
  if(!cy.merged){const o=engMgOrbit(cy,b,cy.o1),a=Math.max(o.a,1e-3),m1=cy.m1,m2=cy.m2,mm=Math.max(m1,m2),Wt=mm*(a+8.35)*1.08;   /* the camera keeps both discs in view, moving in as they close */
    T.W=T.W?T.W+(Wt-T.W)*(1-Math.exp(-dts/.2)):Wt;const s=h/T.W,pump=1+.06*spr,M=T.G.M,Pp=T.Pp;
    Pp[0]=h+o.x1*s;Pp[1]=h+o.y1*s;Pp[2]=2.6*m1*s*pump;Pp[3]=h+o.x2*s;Pp[4]=h+o.y2*s;Pp[5]=2.6*m2*s*pump;engMgShadow(T.G,N,2,Pp,0,0);   /* shadows of 2.6 rs, flowing into one peanut */
    const LW=5.6/nL,r0=2.75,rF=r0+LW*Math.ceil(nL/2),rT=r0+LW*nL,rs=a/Math.SQRT2,e=b-(cy.m-1),pal=e>=.5?1:0,e2=engClamp((e-.5)*2);   /* rs: the saddle's level (the figure-8) */
    for(let l=0;l<nL;l++){const rl=r0+LW*(l+.5);ln.ph[l]+=ks*engTmOm(rl)/m1*dts;ln.ph[nL+l]+=ks*engTmOm(rl)/m2*dts;ln.ph[2*nL+l]+=ks*engTmOm(rl*Math.hypot(m1,m2))*dts;}   /* every lane at its own orbital speed */
    if(A.on[1]&&b>.5)ln.fl[Math.floor(R()*(rs<rT?3:2))*nL+Math.floor(R()*nL)]=1;   /* snare: a lane flares */
    /* field lines: equipotentials of the pair (GM = 1) as an equivalent radius 1/Σ(m/r), evenly spaced from the flame tips to the panel's edge */
    const qA=1/(1/rT+m2/(a+rT*m1)),dQ=Math.max(.5,(1.45*T.W-qA)/6.5),nLv=6,lcol=[P.teal,P.blu,P.pur],vL=fade*(pal?.55+.3*e2:.38+.25*kick),tw=pal?2.5*e2:0;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;if(M[i]>.5)continue;   /* the cores stay black */
      const dx=x-h,dy=y-h;let wx=dx/s,wy=dy/s;
      if(e>=0){const d=Math.hypot(dx,dy),k=engTmBin(dx,dy);
        if(!pal){const g=engEaseOut(e*2.2);if(d<1+.5*h*g*T.s7w[k]){put(i,P.wht,v0);continue;}if(d<1.5+.85*h*g*T.s7y[k]){put(i,P.yel,v0);continue;}}   /* 7: the spark burst, sticking out past the flames */
        else if(d>Pp[2]&&d<Pp[2]+.85*h*e2*T.s8[(k+Math.floor(e2*6))%nb]){put(i,P.wht,v0);continue;}}   /* 8: light spikes */
      const r1=Math.hypot(wx-o.x1,wy-o.y1)+1e-6,r2=Math.hypot(wx-o.x2,wy-o.y2)+1e-6,q1=r1/m1,q2=r2/m2,rho=1/Math.sqrt(1/(q1*q1)+1/(q2*q2));   /* the gas's level: both holes' pull, each in its own rs */
      if(rho<rT){const ow=rho<rs?(q1<q2?0:1):2,th=ow===2?Math.atan2(wy,wx):ow?Math.atan2(wy-o.y2,wx-o.x2):Math.atan2(wy-o.y1,wx-o.x1),lf=(rho-r0)/LW,l=Math.floor(lf);let c=null;
        if(l>=0){const k=ow*nL+l,fl=ln.fl[k],u=engTmStroke(ln,k,Math.abs(lf-l-.5),th,wk*(1+.3*fl));
          if(u>=0)c=fl>.3||rho<4.2?P.wht:pal?(rho<rF?P.sky:u>.55?P.navy:P.blu):(rho<rF?P.yel:u>.55?P.red:P.org);}
        if(!c&&rho<3.2)c=pal?P.sky:P.yel;else if(!c&&!pal&&rho<rF)c=P.org;
        if(c)put(i,c,v0);continue;}   /* between the flame tips stays dark */
      if(tw>0){const an=tw*Math.exp(-Math.hypot(wx,wy)/(3*a+1)),ca=Math.cos(an),sa=Math.sin(an),xx=wx*ca-wy*sa;wy=wx*sa+wy*ca;wx=xx;}   /* 8: the field swirls */
      const ex1=wx-o.x1,ey1=wy-o.y1,ex2=wx-o.x2,ey2=wy-o.y2,d1=Math.hypot(ex1,ey1)+1e-6,d2=Math.hypot(ex2,ey2)+1e-6,ps=m1/d1+m2/d2,
        k1=m1/(d1*d1*d1),k2=m2/(d2*d2*d2),gq=Math.hypot(k1*ex1+k2*ex2,k1*ey1+k2*ey2)/(ps*ps),Q=1/ps,kn=Math.max(1,Math.min(nLv,Math.round((Q-qA)/dQ))),
        dd=Math.abs(Q-qA-kn*dQ)*s/(gq+1e-9);
      if(dd<.55)put(i,lcol[kn%3],vL);}
    return;}
  /* after the merger: one hole of 95 % of the mass; its own rs is 0.95 */
  const tb=b-cy.m,Af=Math.max(12,end-cy.m),Wt=12.35;T.W=T.W?T.W+(Wt-T.W)*(1-Math.exp(-dts/.3)):Wt;
  const s=h/T.W,ppr=s*.95,pump=1+.06*spr,LW=6.6/nL,r0=2.9,rF=r0+LW*Math.ceil(nL/2),rT=r0+LW*nL,vpx=h/2.2;   /* ppr: LEDs per rs of the remnant; vpx: how fast the waves run (LEDs a beat) */
  for(let l=0;l<nL;l++)ln.ph[3*nL+l]+=ks*engTmOm(r0+LW*(l+.5))/.95*dts;
  if(A.on[1]&&tb>1)ln.fl[3*nL+Math.floor(R()*nL)]=1;
  if(A.on[0]){cy.sh=Math.min(1.2,cy.sh+.25*(.5+A.I));if(tb>2&&T.rip.length<4)T.rip.push(t);}   /* the kick shakes the remnant: a blue ripple */
  cy.sh*=Math.exp(-dts/(1.2*bt));
  const ep=.14*cy.sh,al=tb*cy.wq*.5,ez=(u,a0,a1)=>{const x=engClamp((u-a0)/(a1-a0));return x*x*(3-2*x);};
  const ci=tb<.25*Af?1:tb<.5*Af?1-.5*ez(tb,.25*Af,.5*Af):.5-(.5-p.edge)*ez(tb,.5*Af,.8*Af),si=Math.sqrt(Math.max(0,1-ci*ci)),rot=p.lean*ez(tb,.25*Af,.6*Af),ca=Math.cos(rot),sa=Math.sin(rot);   /* face-on, tilting, then near edge-on */
  /* the wave train by distance (half LEDs): a crest seen at R left the pair R/vpx beats ago; h ∝ 1/a while they spiral in, then the ring-down */
  const gw=T.gw,nR=gw.length>>1,gwOn=tb<8;
  if(gwOn)for(let k=0;k<nR;k++){const br=b-k*.5/vpx;let ph=0,am=0;
    if(br>=cy.m-4){if(br<cy.md){const o=engMgOrbit(cy,br,T.o);ph=2*o.ph;am=Math.max(.3,Math.min(1,cy.ad/Math.max(o.a,1e-3)));}else{const x=br-cy.md;ph=cy.pd+cy.wq*x;am=Math.exp(-x/cy.tq);}}
    gw[2*k]=ph;gw[2*k+1]=am;}
  T.rip=T.rip.filter(t0=>(t-t0)/bt*vpx*.8<N*.8);
  const lam=Math.max(3,6.2832*vpx*.8/cy.wq),rc=2.6*ppr*pump,LT=engBHLens(),wcol=[P.cya,P.blu,P.mag],rcol=[P.sky,P.blu,P.navy],
    g9=engEaseOut(tb/.2),g10=engEaseOut((tb-.6)/.5),o10=engClamp((2-tb)/.4),Rc=(.3+.06*tb)*h*g10,lit=tb>=.9,th0=.2*Af;
  /* the remnant's disc at radius r (own rs), azimuth f: a lane's stroke or its fill, purple swirl until the lane heats up; Doppler from the
     gas's orbit (g = 1/(1 − Ω·λ), λ = X·sin i) shifts it a shade hotter coming at us, cooler going away */
  const disc=(r,f,X)=>{if(r<2.2||r>=rT)return null;if(r<r0)return tb>th0?P.yel:P.mag;   /* the plunging rim */
    const lf=(r-r0)/LW,l=Math.floor(lf),k=3*nL+l,hot=tb>th0+.6*l,fl=ln.fl[k],u=engTmStroke(ln,k,Math.abs(lf-l-.5),f,wk*(1+.3*fl)),g=1/(1-Math.sqrt(.5/(r*r*r))*X*si);
    let z=(r<4.3?0:r<rF?1:2)+(g>1.12?-1:g<.88?1:0);z=z<0?0:z>2?2:z;
    if(u>=0)return fl>.3?P.wht:hot?(z===0?P.wht:z===1?P.yel:u>.55?P.red:P.org):(z===0?P.mag:z===1?P.pur:P.blu);
    return hot&&r<rF?(z===0?P.yel:P.org):null;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,dx=x-h,dy=y-h,d=Math.hypot(dx,dy),k=engTmBin(dx,dy),wob=pump*(1+ep*Math.cos(2*(k/nb*6.2832-al)));
    if(tb<2&&d<rc*wob/pump)continue;   /* the new black core, ringing down */
    if(tb<.75){if(d<rc+(.1*h+.25*h*T.s9w[k])*g9){put(i,P.wht,v0);continue;}if(d<rc+(.18*h+.4*h*T.s9y[k])*g9){put(i,P.yel,v0);continue;}if(d<rc+(.24*h+.55*h*T.s9r[k])*g9){put(i,P.red,v0);continue;}}   /* 9: the starburst */
    else if(tb<2){if(Math.abs(d-Rc)<1.3*o10+.2){put(i,P.cya,v0);continue;}if(d<rc+.32*h*g10*o10*T.s10r[k]){put(i,P.red,v0);continue;}
      if(d>.3*h*g10&&d<.3*h*g10+.45*h*g10*o10*T.s10m[k]){put(i,P.mag,v0);continue;}if(o10>.5&&Math.abs(d-.9*h)<1&&Math.sin(5*k/nb*6.2832+t)>.3){put(i,P.mag,v0*.8);continue;}}   /* 10: the neon explosion */
    if(lit){const X=(dx*ca+dy*sa)/ppr,Yu=(dx*sa-dy*ca)/ppr,bb=Math.hypot(X,Yu)+1e-6,ex=X/bb,ey=Yu/bb,p1=Math.atan2(ci,-si*ey),s1=Math.sin(p1),   /* the ray's path past the hole (as engBHMap) */
        f1=Math.atan2(si*Math.cos(p1)-ci*s1*ey,s1*ex),u1=engBHu(LT,bb,p1),sh=2.598*wob;let c=null;
      if(u1>0&&u1<1)c=disc(1/u1,f1,X);   /* the direct image, in front */
      if(!c&&bb>=sh){const u2=engBHu(LT,bb,p1+Math.PI);if(u2>0&&u2<1)c=disc(1/u2,f1+Math.PI,X);   /* the image bent round the back */
        if(!c&&(bb-sh)*ppr<1.1)c=tb>th0?(X*si>.5?P.wht:P.yel):P.mag;}   /* the photon ring */
      if(c){put(i,c,v0);continue;}if(bb<sh)continue;}   /* the shadow */
    if(gwOn){const kk=Math.min(nR-1,Math.round(d*2)),am=gw[2*kk+1];if(am>.05){const ph=gw[2*kk];if(Math.cos(ph)>1-1.1*am){put(i,wcol[((Math.floor(ph/6.2832)%3)+3)%3],fade*.9);continue;}}}   /* 12: the gravitational waves */
    for(const t0 of T.rip){const rf=(t-t0)/bt*vpx*.8;let hit=-1;for(let j=0;j<3;j++)if(Math.abs(d-(rf-j*lam))<.55){hit=j;break;}
      if(hit>=0){put(i,rcol[hit],fade*.6*(1-hit*.25)*Math.max(0,1-rf/(N*.8)));break;}}}}   /* 15: blue ripples */
engScene('toonmerger',{name:'Comic merger',entry:['dark','dot'],exit:['dark'],bars:[8,16,16],energy:.55,lit:.6,key:['spin','lean'],
  params:{insp:{int:[3,5]},ratio:[.7,1],spin:[.6,1],edge:[.22,.32],lean:[-.35,.35],fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;sc.tm=null;sc.tmc=null;const bp=ENG_CFG.beatsPerBar;sc.c0=(bp-(E.beat%bp))%bp;},   /* one pair, never copied or on its side */
  say:sc=>'a black-hole merger as a comic (after a 4×4 storyboard): two black cores in swirls of thick orange and yellow brush-stroke flames, every lane at its own orbital speed, thin teal, blue and purple field lines bending round them; they spiral in on the real chirp, the flames stretch into a figure-8 and fuse into a peanut, a spark burst, a dark blue shock, they merge on the bar line in a white, yellow and red starburst, a neon ring explosion, a purple swirl and cyan/blue/magenta wave rings, then one bigger hole whose flame disc tilts towards edge-on, bent over the shadow by the lens; blue ripples on the kick, flares on the snare',
  draw(sc,E,dts,b){engTmDraw(sc,E,dts,b);}});
/* ---------- Morphology (engMp…), after Wilco's 18-structure sheet (Documents\Infinity\Morphology, 2026-10-22) ----------
   Branching structures that look alike turn into each other in one endless loop: neuron, tree, leaf veins, river, lightning, circuit
   board, cables, cube, tesseract, snowflake, coral, lungs, retina, mycelium, slime mould, metro map, cosmic web, neural tissue, neuron.
   The morph is the point. Every structure is made of the same parts: strokes (polylines of engMpM points, a width at each end, a body
   and a core colour, a level 0 = trunk .. 3 = finest twig, the path distance from the root at both ends, a parent stroke and where on
   it the stroke starts), dots (cell bodies, pads, stations, polyps, galaxies; a tip dot rides on its stroke) and at most one filled
   outline (the leaf). A morph pairs the two hierarchies: the roots in the order of their angle round the middle, then each pair's
   children in the order of their direction, spread evenly, so when the counts differ strokes SPLIT or MERGE instead of vanishing; only
   a stroke whose partner has no children at all retracts (twigs first) or grows out (trunks first). Each child is drawn from the point
   of its parent where it starts, so the structure stays one connected body all through the morph, and the camera dives in and comes
   back out (deep on the zoom steps: tree → leaf, cube → tesseract, cosmic web → tissue, tissue → one neuron). Music: kick = a pulse
   running from the root out to the tips (nerve signal, sap, current; lightning flashes), snare = sparks on the tips, hats = twinkles,
   bass = trunks thicken, melody = the branches pointing at the note's angle light up, mids = sway; a new section = the next structure
   at once; a drop = a fast morph to the cube or the lightning with a white strike. The loop position is kept between visits (ENG.mpPos) */
const engMpM=10;
const engMpLite=(c,a)=>[c[0]+(1-c[0])*a,c[1]+(1-c[1])*a,c[2]+(1-c[2])*a],engMpMix=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const ENG_MP_C={teal:[.2,.88,.6],blue:[.2,.5,1],leaf:[.62,.95,.3],cyan:[.12,.72,1],gold:[1,.78,.25],pink:[.98,.45,.58],cream:[.95,.9,.74],
  multi:[[1,.35,.3],[1,.6,.2],[1,.85,.3],[.35,.88,.4],[.3,.6,1],[.3,.88,.85],[.75,.4,1]]};
/* a builder: add() resamples any polyline to engMpM points at equal steps; par/f = the parent stroke and the fraction of it where this one starts */
function engMpB(R){const B={R,S:[],D:[],F:null,
  add(pts,w0,w1,c,k,lv,d0,v,par,f){const n=pts.length,cum=[0];for(let i=1;i<n;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1],(pts[i][2]||0)-(pts[i-1][2]||0)));
    const L=cum[n-1]||1e-6,P=new Float32Array(engMpM*3);let j=0;
    for(let m=0;m<engMpM;m++){const s=L*m/(engMpM-1);while(j<n-2&&cum[j+1]<s)j++;const u=Math.min(1,Math.max(0,(s-cum[j])/((cum[j+1]-cum[j])||1e-6))),a=pts[j],b=pts[j+1];
      P[3*m]=a[0]+(b[0]-a[0])*u;P[3*m+1]=a[1]+(b[1]-a[1])*u;P[3*m+2]=(a[2]||0)+((b[2]||0)-(a[2]||0))*u;}
    const s={P,w0,w1,c,k:k||engMpLite(c,.55),lv:Math.min(3,lv|0),d0:d0||0,d1:(d0||0)+L,v:v==null?1:v,par:par||null,f:f||0,kids:[]};if(par)par.kids.push(s);B.S.push(s);return s;},
  dot(x,y,z,r,c,k,lv,d,ring,par,f){const o={x,y,z:z||0,r,c,k:k||engMpLite(c,.6),lv:Math.min(3,lv|0),d:d==null?Math.hypot(x,y):d,ring:!!ring,par:par||null,f:f==null?1:f};B.D.push(o);return o;}};return B;}
/* hang a stroke (or dot) on the nearest point of another */
function engMpLink(s,par){const P=par.P,x=s.P?s.P[0]:s.x,y=s.P?s.P[1]:s.y;let bm=0,bd=1e9;for(let m=0;m<engMpM;m++){const d=Math.hypot(P[3*m]-x,P[3*m+1]-y);if(d<bd){bd=d;bm=m;}}
  s.par=par;s.f=bm/(engMpM-1);if(s.P)par.kids.push(s);return s;}
/* a branching stroke from (x,y,z) at angle a (0 = right, -π/2 = up), length len, width w, level lv; o: bend / wig / jag (how it wanders),
   kids(lv,R) / at / spread / fork / decay / wd / taper (how it splits), max (deepest level), clip [cx,cy,r], col(lv,x,y,R) → [body, core], tip */
function engMpGrow(B,x,y,z,a,len,w,lv,o,d0,par,pf){const R=B.R,n=8,st=len/(n-1),pts=[[x,y,z]],hd=[a];let an=a,px=x,py=y,pz=z;const bd=(o.bend||0)*(R()<.5?-1:1);
  for(let i=1;i<n;i++){an+=bd+(R()-.5)*(o.wig||0);const aj=o.jag?an+(R()-.5)*o.jag:an;px+=Math.cos(aj)*st;py+=Math.sin(aj)*st;pz+=(R()-.5)*(o.zs||0)*st;pts.push([px,py,pz]);hd.push(an);}
  if(o.clip)for(const p of pts){const r=Math.hypot(p[0]-o.clip[0],p[1]-o.clip[1]);if(r>o.clip[2]){p[0]=o.clip[0]+(p[0]-o.clip[0])*o.clip[2]/r;p[1]=o.clip[1]+(p[1]-o.clip[1])*o.clip[2]/r;}}
  const cl=o.col(lv,px,py,R),s=B.add(pts,w,w*(o.taper||.7),cl[0],cl[1],lv,d0,o.v,par,pf);
  if(lv>=o.max){if(o.tip){const nd=B.D.length;o.tip(B,pts[n-1][0],pts[n-1][1],pz,lv,d0+len);for(let k=nd;k<B.D.length;k++){B.D[k].par=s;B.D[k].f=1;}}return s;}
  const k=o.kids(lv,R);
  for(let j=0;j<k;j++){const f=o.fork?1:o.at+(1-o.at)*(k===1?1:(j+.5+.4*(R()-.5))/k),i=Math.round(f*(n-1)),side=o.fork?(k===1?0:j/(k-1)*2-1):(j%2?1:-1)*(R()<.15?-1:1);
    engMpGrow(B,pts[i][0],pts[i][1],pts[i][2],hd[i]+side*o.spread*(.7+.5*R()),len*o.decay*(.75+.5*R()),w*o.wd,lv+1,o,d0+len*i/(n-1),s,i/(n-1));}
  return s;}
const engMpPoly=(pts)=>pts.map(p=>[p[0],p[1],p[2]||0]);
/* the 18, in loop order. build(R) → the parts; spin [yaw rad/s, tilt] turns it in 3D, twist turns it flat, sway = how much it moves with
   the mids, frame(G,t) moves points itself (tesseract), zin = how deep the camera dives when morphing INTO it, focus = where it dives
   when morphing OUT of this one, kick 'flash' = lightning */
const ENG_MP=[
 {name:'neuron',sway:1,zin:1.8,build(R){const B=engMpB(R),C=ENG_MP_C,col=lv=>[engMpMix(C.teal,[.35,1,.8],lv/3),null];
   B.dot(0,-.05,0,4.6,C.teal,[.25,.55,1],0,0);
   const o={max:2,kids:()=>2,spread:.55,decay:.62,wd:.62,taper:.7,wig:.3,bend:.04,at:.45,col};
   for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.55+(R()-.5)*.2;engMpGrow(B,Math.cos(a)*.08,-.05+Math.sin(a)*.08,0,a,.36+.08*R(),2.6,0,o,0);}
   engMpGrow(B,0,.04,0,Math.PI/2,.62,2,0,{max:1,kids:()=>3,fork:true,spread:.75,decay:.5,wd:.6,taper:.8,wig:.15,col,tip:(B,x,y,z,lv,d)=>B.dot(x,y,z,1.6,C.teal,null,3,d)},0);
   return B;}},
 {name:'tree',sway:1.2,focus:[0,-.45],build(R){const B=engMpB(R),col=(lv,x,y)=>{const c=engMpMix([.32,.88,.4],[.18,.55,.95],engClamp((y+.25)/1));return[c,engMpLite(c,.5)];};
   const tr=B.add([[0,.32,0],[0,-.1,0]],4.4,3.4,[.22,.68,.66],null,0,0);
   const o={max:3,kids:lv=>lv<2?3:2,spread:.65,decay:.68,wd:.6,taper:.75,wig:.25,bend:.05,at:.4,col,tip:(B,x,y,z,lv,d)=>{if(R()<.6)B.dot(x,y,z,.9,[.55,1,.4],null,3,d);}};
   for(let i=0;i<4;i++)engMpGrow(B,0,-.1,0,-Math.PI/2+(i-1.5)*.6+(R()-.5)*.15,.36+.06*R(),3,1,o,.42,tr,1);
   const o2={max:2,kids:()=>2,spread:.6,decay:.6,wd:.55,taper:.6,wig:.35,bend:.08,at:.35,col};
   for(let i=0;i<4;i++)engMpGrow(B,0,.32,0,Math.PI/2+(i-1.5)*.55,.3+.05*R(),2.6,1,o2,0,tr,0);
   return B;}},
 {name:'leaf veins',sway:.8,zin:1.6,build(R){const B=engMpB(R),C=ENG_MP_C,hw=s=>.5*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,s))),.9)*(1-.25*s),ys=s=>.45-1.2*s,F=[],L=[],Rt=[];
   for(let i=0;i<=16;i++){const s=i/16;Rt.push([hw(s),ys(s),0]);L.push([-hw(s),ys(s),0]);}
   for(let i=0;i<16;i++)F.push([Rt[i][0],Rt[i][1]]);for(let i=16;i>0;i--)F.push([L[i][0],L[i][1]]);B.F={P:F,c:[.1,.42,.15],a:.7};
   const mid=B.add([[0,.8,0],[0,.45,0],[0,-.74,0]],2.6,1.1,C.leaf,null,0,0);
   engMpLink(B.add(Rt,1.3,1.1,[.45,.85,.28],null,1,.35),mid);engMpLink(B.add(L,1.3,1.1,[.45,.85,.28],null,1,.35),mid);
   for(let i=0;i<7;i++){const s=.1+i*.115,y0=ys(s),te=s+.13;for(const g of[1,-1]){const x1=g*hw(te)*.93,y1=ys(te),mx=x1*.5,my=(y0+y1)/2+.03;
     const v=engMpLink(B.add([[0,y0,0],[mx,my,0],[x1,y1,0]],1.5,.9,[.55,.92,.3],null,1,.8-y0),mid);
     engMpLink(B.add([[mx,my,0],[mx+g*.12,my+.06,0],[mx+g*hw(s)*.75-mx*.3,my+.1,0]],.8,.6,[.5,.85,.3],null,2,.8-y0+.2),v);}}
   return B;}},
 {name:'river',sway:.6,build(R){const B=engMpB(R),C=ENG_MP_C,ph=R()*6.28,pts=[];for(let m=0;m<=12;m++){const u=m/12;pts.push([.14*Math.sin(u*7+ph)*(1-.4*u),.96-1.8*u,0]);}
   const main=B.add(pts,3.4,2.4,C.cyan,[.7,.95,1],0,0);
   const o={max:3,kids:()=>2,at:.2,spread:.7,decay:.55,wd:.6,taper:.75,wig:.45,bend:.04,col:lv=>[engMpMix([.25,.68,.85],[.2,.55,.7],lv/3),[.5,.9,1]]};
   for(let j=0;j<6;j++){const f=.15+j*.13,m=Math.round(f*(engMpM-1)),g=j%2?1:-1,x=main.P[3*m],y=main.P[3*m+1];engMpGrow(B,x,y,0,-Math.PI/2+g*(.8+.2*R()),.42+.12*R(),2.2,1,o,1.8*f,main,m/(engMpM-1));}
   return B;}},
 {name:'lightning',kick:'flash',build(R){const B=engMpB(R);
   engMpGrow(B,0,-1,0,Math.PI/2,1.95,2.6,0,{max:3,kids:lv=>lv===0?4:2,at:.15,spread:.6,decay:.5,wd:.55,taper:.6,jag:1.2,wig:.15,col:()=>[[.4,.55,1],[.92,.96,1]]},0);return B;}},
 {name:'circuit board',build(R){const B=engMpB(R),C=ENG_MP_C,M=C.multi,pad=(s,d)=>{const P=s.P,m=3*(engMpM-1);B.dot(P[m],P[m+1],0,1.3,C.gold,[1,.95,.7],2,d,false,s,1);};
   const spine=B.add(engMpPoly([[0,-.95],[0,-.45],[.12,-.33],[.12,.3],[0,.42],[0,.95]]),2.2,2.2,M[4],null,0,0);
   const ch=[[-.42,-.25,.17],[.45,.28,.15]],E=[];
   for(const[cx,cy,s]of ch){const q=[[cx-s,cy-s],[cx+s,cy-s],[cx+s,cy+s],[cx-s,cy+s]];for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4];E.push(B.add(engMpPoly([a,b]),1.7,1.7,[.72,.78,.85],[1,1,1],1,Math.hypot(cx,cy)));}}
   const lim=v=>Math.max(-.94,Math.min(.94,v));
   for(let i=0;i<22;i++){const ci=i%2,[cx,cy,s]=ch[ci],sd=Math.floor(R()*4),dx=[0,1,0,-1][sd],dy=[-1,0,1,0][sd],o=(R()*1.6-.8)*s,p0=[cx+dx*s+(dy?o:0),cy+dy*s+(dx?o:0)],
       l1=.05+.15*R(),p1=[p0[0]+dx*l1,p0[1]+dy*l1],g=R()<.5?1:-1,ddx=(dx-g*dy)*.7071,ddy=(dy+g*dx)*.7071,l2=.05+.15*R(),p2=[lim(p1[0]+ddx*l2),lim(p1[1]+ddy*l2)],l3=.15+.4*R(),p3=[lim(p2[0]+dx*l3),lim(p2[1]+dy*l3)];
     const d=Math.hypot(cx,cy)+.2,tr=engMpLink(B.add(engMpPoly([p0,p1,p2,p3]),1.3,1.3,M[i%6],null,i<8?1:2,d),E[ci*4+sd]);pad(tr,d+l1+l2+l3);}
   for(let i=0;i<8;i++){const y=-.8+i*.23,x0=y>-.39&&y<.36?.12:0,g=i%2?1:-1,x1=x0+g*(.15+.1*R()),x2=lim(x1+g*(.3+.4*R()));
     pad(engMpLink(B.add(engMpPoly([[x0,y],[x1,y],[x1+g*.08,y+.08],[x2,y+.08]]),1.6,1.6,M[(i+2)%6],null,1,Math.abs(y)),spine),Math.abs(y)+.6);}
   return B;}},
 {name:'cables',sway:.5,build(R){const B=engMpB(R),C=ENG_MP_C,M=C.multi,n=12,perm=[...Array(n).keys()].sort(()=>R()-.5);
   for(let i=0;i<n;i++){const xs=-.85+1.7*(i+.5)/n,xe=-.85+1.7*(perm[i]+.5)/n,ph=R()*6.28,pts=[];
     for(let m=0;m<=10;m++){const u=m/10,e=u*u*(3-2*u),sq=.3+.7*Math.pow(Math.abs(2*u-1),1.5);pts.push([(xs+(xe-xs)*e)*sq+.05*Math.sin(u*7+ph),.98-1.96*u,.15*Math.sin(u*3+ph)]);}
     const s=B.add(pts,i<8?2.4:1.5,i<8?2.4:1.5,M[i%7],null,i<6?0:1,0);
     if(i<5){const P=s.P,m=6+Math.floor(R()*3),x=P[3*m],y=P[3*m+1],g=x<0?-1:1,ex=Math.max(-.92,Math.min(.92,x+g*(.3+.25*R()))),ey=y+(R()-.5)*.3;
       const br=B.add([[x,y,0],[x+g*.12,y-.05,0],[ex,ey,0]],1.4,1.4,M[i%7],null,2,.5,1,s,m/(engMpM-1));B.dot(ex,ey,0,1.7,[.85,.85,.9],[1,1,1],2,.8,false,br,1);}}
   return B;}},
 {name:'cube',spin:[.35,.45],build(R){const B=engMpB(R),V=[];for(let i=0;i<8;i++)V.push([i&1?.52:-.52,i&2?.52:-.52,i&4?.52:-.52]);
   for(let i=0;i<8;i++)for(let b=0;b<3;b++){const j=i^(1<<b);if(j<i)continue;const c=engMpMix([.85,.95,.4],[.3,.5,1],engClamp((V[i][1]+V[j][1])/2/1.04+.5));
     B.add([V[i],V[j]],2.4,2.4,c,null,0,(V[i][0]+V[i][1]+V[i][2]+1.56)*.5);}
   for(const v of V)B.dot(v[0],v[1],v[2],1.8,[.9,.95,1],[1,1,1],0,(v[0]+v[1]+v[2]+1.56)*.5);return B;}},
 {name:'tesseract',spin:[.2,.4],zin:1.3,build(R){const B=engMpB(R),V=[],E=[];for(let i=0;i<16;i++)V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);
   for(let i=0;i<16;i++)for(let b=0;b<4;b++){const j=i^(1<<b);if(j>i)E.push([i,j,b]);}
   for(const[i,j,b]of E){const c=b===3?[.35,.9,1]:V[i][3]>0?[.35,.55,1]:[.85,.3,1];B.add([[0,0,0],[0,0,0]],b===3?1.4:2.1,b===3?1.4:2.1,c,null,b===3||V[i][3]<0?1:0,.4*(V[i][3]+1));}
   for(let i=0;i<16;i++)B.dot(0,0,0,1.3,[.8,.85,1],null,1,0);B.V4=V;B.E=E;return B;},
  frame(G,t){const a=t*.45,b=t*.23,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
   const Q=G.V4.map(v=>{let x=v[0],y=v[1],z=v[2],w=v[3];const x2=x*ca-w*sa;w=x*sa+w*ca;x=x2;const y2=y*cb-w*sb;w=y*sb+w*cb;y=y2;const k=1.25/(3-w);return[x*k,y*k,z*k];});
   G.E.forEach(([i,j],k)=>{const P=G.S[k].P,p=Q[i],q=Q[j];for(let m=0;m<engMpM;m++){const u=m/(engMpM-1);P[3*m]=p[0]+(q[0]-p[0])*u;P[3*m+1]=p[1]+(q[1]-p[1])*u;P[3*m+2]=p[2]+(q[2]-p[2])*u;}});
   Q.forEach((p,k)=>{const d=G.D[k];d.x=p[0];d.y=p[1];d.z=p[2];});}},
 {name:'snowflake',twist:.12,build(R){const B=engMpB(R),c=[.72,.9,1],k=[1,1,1],L=[.3+.06*R(),.24+.05*R(),.15+.04*R()];
   B.dot(0,0,0,3,c,k,0,0);
   for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,ca=Math.cos(a),sa=Math.sin(a),arm=B.add([[0,0,0],[ca*.86,sa*.86,0]],2.4,1.5,c,k,0,0);B.dot(ca*.88,sa*.88,0,1.2,c,k,1,.88,false,arm,1);
     [.3,.5,.7].forEach((f,j)=>{for(const g of[1,-1]){const b=a+g*Math.PI/3,x=ca*.86*f,y=sa*.86*f,ex=x+Math.cos(b)*L[j],ey=y+Math.sin(b)*L[j],sb=engMpLink(B.add([[x,y,0],[ex,ey,0]],1.5,1,c,k,1,.86*f),arm);
       if(j===0){const mx=(x+ex)/2,my=(y+ey)/2;engMpLink(B.add([[mx,my,0],[mx+Math.cos(a)*.09,my+Math.sin(a)*.09,0]],.9,.7,c,k,2,.86*f+L[j]/2),sb);}}});}
   return B;}},
 {name:'coral',sway:1.1,build(R){const B=engMpB(R);
   const o={max:3,kids:()=>2,at:.45,spread:.5,decay:.7,wd:.72,taper:.85,wig:.4,bend:.06,col:(lv,x,y,R)=>[engMpMix([1,.5,.42],[.95,.42,.62],R()),[1,.82,.62]],
     tip:(B,x,y,z,lv,d)=>B.dot(x,y,z,1.3,[1,.85,.3],[1,1,.7],3,d)};
   for(let i=0;i<3;i++)engMpGrow(B,(i-1)*.08,.82,0,-Math.PI/2+(i-1)*.5,.5+.08*R(),4,0,o,0);
   B.S.forEach((s,k)=>{if(k%3===1)B.dot(s.P[12],s.P[13],0,.75,[1,.85,.35],null,3,(s.d0+s.d1)/2,false,s,4/(engMpM-1));});return B;}},
 {name:'lungs',sway:.7,build(R){const B=engMpB(R),c=ENG_MP_C.pink,k=[1,.78,.82];
   const tr=B.add([[0,-.92,0],[0,-.3,0]],3.6,3.2,[1,.55,.6],k,0,0);
   const o={max:3,kids:()=>2,fork:true,spread:.42,decay:.74,wd:.7,taper:.8,wig:.2,bend:.03,col:()=>[c,k],tip:(B,x,y,z,lv,d)=>B.dot(x,y,z,1.2,[1,.62,.72],null,3,d)};
   for(const g of[1,-1])engMpGrow(B,0,-.3,0,Math.PI/2-g*.55,.45,2.8,1,o,.62,tr,1);return B;}},
 {name:'retina',sway:.5,build(R){const B=engMpB(R),cx=.22,cy=.02;
   for(let i=0;i<6;i++){const pts=[];for(let m=0;m<=6;m++){const a=(i+m/6)*Math.PI/3;pts.push([.88*Math.cos(a),.88*Math.sin(a),0]);}B.add(pts,1.3,1.3,[.7,.17,.08],null,1,.9);}
   B.dot(cx,cy,0,4.8,[1,.62,.3],[1,.9,.6],0,0);
   const o={max:3,kids:()=>2,at:.35,spread:.55,decay:.62,wd:.6,taper:.7,wig:.35,bend:.12,clip:[0,0,.84],col:lv=>[[1,.32+.06*lv,.12],[1,.66,.36]]};
   for(let i=0;i<6;i++){const a=Math.PI+(i-2.5)*.75;engMpGrow(B,cx+Math.cos(a)*.08,cy+Math.sin(a)*.08,0,a,.6,2.4,0,o,0);}return B;}},
 {name:'mycelium',sway:1,build(R){const B=engMpB(R),C=ENG_MP_C;B.dot(0,0,0,2.6,C.cream,[1,1,.9],0,0);
   const o={max:3,kids:()=>2,at:.3,spread:.6,decay:.62,wd:.7,taper:.8,wig:.5,bend:.04,v:.75,col:()=>[C.cream,[1,1,.95]]};
   for(let i=0;i<8;i++){const a=i*Math.PI/4+(R()-.5)*.3;engMpGrow(B,0,0,0,a,.48,1.5,0,o,0);}
   const T=B.S.filter(s=>s.lv===3);
   for(let k=0;k<20;k++){const sa=T[Math.floor(R()*T.length)],a=[sa.P[27],sa.P[28]];let bj=null,bd=.32;for(const sb of T){const b=[sb.P[27],sb.P[28]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>.04&&d<bd){bd=d;bj=b;}}
     if(bj)B.add([[a[0],a[1],0],[(a[0]+bj[0])/2+(R()-.5)*.08,(a[1]+bj[1])/2+(R()-.5)*.08,0],[bj[0],bj[1],0]],.8,.8,C.cream,null,3,sa.d1,.6,sa,1);}
   return B;}},
 {name:'slime mould',sway:.9,build(R){const B=engMpB(R),body=[1,.62,.06],core=[1,.92,.45],P=[[0,0]];
   for(let i=0;i<8;i++){const a=i/8*6.283+(R()-.5)*.5,r=.5+.33*R();P.push([r*Math.cos(a),r*Math.sin(a)]);}
   const inT=[0],D=[0],into=[],tube=(i,j,w,lv)=>{const a=P[i],b=P[j],o=(R()-.5)*.18,mx=(a[0]+b[0])/2-(b[1]-a[1])*o,my=(a[1]+b[1])/2+(b[0]-a[0])*o;
     return B.add([[a[0],a[1],0],[mx,my,0],[b[0],b[1],0]],w,w*.85,body,core,lv,D[i]||Math.hypot(a[0],a[1]),1,into[i]||null,1);};
   const used=new Set();
   while(inT.length<P.length){let bi=-1,bj=-1,bd=9;for(const i of inT)for(let j=0;j<P.length;j++){if(inT.includes(j))continue;const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1]);if(d<bd){bd=d;bi=i;bj=j;}}
     D[bj]=D[bi]+bd;into[bj]=tube(bi,bj,bi===0?3.6:2.8,bi===0?0:1);used.add(bi+','+bj);used.add(bj+','+bi);inT.push(bj);}
   for(let k=0;k<3;k++){const i=1+Math.floor(R()*8),j=1+(i+Math.floor(R()*2))%8;if(i!==j&&!used.has(i+','+j)){used.add(i+','+j);used.add(j+','+i);tube(i,j,1.8,2);}}
   for(let i=0;i<P.length;i++)B.dot(P[i][0],P[i][1],0,i?3.2:3.8,[1,.8,.15],[1,.96,.6],i?1:0,D[i],false,into[i]||null,1);
   const o={max:3,kids:()=>2,fork:true,spread:.5,decay:.6,wd:.6,taper:.7,wig:.3,col:()=>[body,core]};
   for(let i=1;i<P.length;i+=2){const a=Math.atan2(P[i][1],P[i][0]);engMpGrow(B,P[i][0],P[i][1],0,a,.12,1.8,2,o,D[i],into[i],1);}
   return B;}},
 {name:'metro map',build(R){const B=engMpB(R),M=ENG_MP_C.multi,lim=v=>Math.max(-.92,Math.min(.92,v));
   const oct=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],m=Math.min(Math.abs(dx),Math.abs(dy));const c=[a[0]+Math.sign(dx)*m,a[1]+Math.sign(dy)*m];return[[a[0],a[1],0],[c[0],c[1],0],[b[0],b[1],0]];};
   B.dot(0,0,0,2.6,[1,1,1],null,0,0,true);
   for(let l=0;l<5;l++){const th=l*Math.PI/5+(R()-.5)*.3,c=Math.cos(th),s=Math.sin(th),W=[[lim(-.92*c),lim(-.92*s)],[lim(-.45*c+(R()-.5)*.25),lim(-.45*s+(R()-.5)*.25)],[(R()-.5)*.12,(R()-.5)*.12],[lim(.45*c+(R()-.5)*.25),lim(.45*s+(R()-.5)*.25)],[lim(.92*c),lim(.92*s)]];
     const s1=B.add(oct(W[1],W[2]),2.2,2.2,M[l],null,0,.45),s0=B.add(oct(W[1],W[0]),2.2,2.2,M[l],null,1,.45,1,s1,0),   /* the line grows out of the middle both ways */
       s2=B.add(oct(W[2],W[3]),2.2,2.2,M[l],null,0,.1,1,s1,1),s3=B.add(oct(W[3],W[4]),2.2,2.2,M[l],null,1,.5,1,s2,1),sg=[s0,s1,s2,s3];
     B.dot(W[0][0],W[0][1],0,1.7,[1,1,1],null,2,.9,true,sg[0],1);B.dot(W[1][0],W[1][1],0,1.7,[1,1,1],null,1,.45,true,sg[1],0);
     B.dot(W[3][0],W[3][1],0,1.7,[1,1,1],null,1,.45,true,sg[3],0);B.dot(W[4][0],W[4][1],0,1.7,[1,1,1],null,2,.9,true,sg[3],1);}
   return B;}},
 {name:'cosmic web',spin:[.1,.3],sway:.4,zin:.9,focus:[0,0],build(R){const B=engMpB(R),P=[[0,0,0]];
   for(let i=0;i<22;i++){let x,y,z;do{x=R()*2-1;y=R()*2-1;z=R()*2-1;}while(x*x+y*y+z*z>1);P.push([x*.9,y*.9,z*.9]);}
   const seen=new Set();P.forEach((a,i)=>{const nb=P.map((b,j)=>[Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),j]).filter(q=>q[1]!==i).sort((p,q)=>p[0]-q[0]).slice(0,i?3:5);
     for(const[d,j]of nb){const key=Math.min(i,j)+','+Math.max(i,j);if(seen.has(key))continue;seen.add(key);const b=P[j],o=(R()-.5)*.2;
       B.add([a,[(a[0]+b[0])/2+o,(a[1]+b[1])/2-o,(a[2]+b[2])/2],b],i?1.5:2.2,1.2,seen.size%2?[.3,.85,.9]:[.65,.3,.95],null,i?(seen.size%3?1:2):0,Math.hypot(a[0],a[1],a[2]));}});
   P.forEach((p,i)=>B.dot(p[0],p[1],p[2],i?1.2+1.4*R():2.8,[.75,.6,1],[1,1,1],i?1:0));
   for(let i=0;i<26;i++)B.dot(R()*1.8-.9,R()*1.8-.9,R()*1.6-.8,.55,[.55,.55,.7],null,3);return B;}},
 {name:'neural tissue',sway:.9,zin:.9,focus:[0,0],build(R){const B=engMpB(R),C=ENG_MP_C;
   const nrn=(cx,cy,r,len,max,d,c)=>{B.dot(cx,cy,0,r,c,[.25,.55,1],d?1:0,d);const o={max,kids:()=>2,spread:.55,decay:.62,wd:.62,taper:.7,wig:.3,bend:.04,at:.45,col:lv=>[engMpMix(c,[.2,.5,1],lv/3),null]};
     for(let i=0;i<5;i++){const a=i/5*6.283+R()*.5;engMpGrow(B,cx+Math.cos(a)*.05,cy+Math.sin(a)*.05,0,a,len,d?1.6:2.2,d?1:0,o,d);}};
   nrn(0,0,3.6,.3,2,0,C.teal);
   for(let i=0;i<5;i++){const a=i/5*6.283-Math.PI/2+.3,x=.62*Math.cos(a),y=.62*Math.sin(a);nrn(x,y,2.4,.24,2,.62,[.2,.75,.62]);}
   return B;}}];
function engMpMake(i,R){const def=ENG_MP[i],G=def.build(engRng(R()*4294967296>>>0));G.i=i;G.def=def;G.ph=R()*6.283;if(def.frame)def.frame(G,0);
  G.S.forEach((s,k)=>{s.ix=k;const P=s.P,e=3*(engMpM-1);s.an=Math.atan2(P[15],-P[16]);s.da=Math.atan2(P[e]-P[0],-(P[e+1]-P[1]));});G.D.forEach((d,k)=>{d.ix=k;d.an=Math.atan2(d.x,-d.y);});return G;}
/* pair two ordered lists, spread evenly; every element gets a partner (strokes split or merge), null only when one list is empty */
function engMpPP(X,Y){const n=Math.max(X.length,Y.length),o=[];if(!X.length)return Y.map(y=>[null,y]);if(!Y.length)return X.map(x=>[x,null]);
  for(let i=0;i<n;i++)o.push([X[Math.floor(i*X.length/n)],Y[Math.floor(i*Y.length/n)]]);return o;}
/* the morph's draw list, parents before children: roots by angle round the middle, children by their direction */
function engMpItems(GA,GB){const L=[],byD=(p,q)=>p.da-q.da,ua=new Set(),ub=new Set(),rec=(a,b,par,d)=>{const it={a,b,par,d,D:new Float32Array(engMpM*3)};L.push(it);
    const ka=a&&!ua.has(a)?a.kids.slice().sort(byD):[],kb=b&&!ub.has(b)?b.kids.slice().sort(byD):[];if(a)ua.add(a);if(b)ub.add(b);   /* a split or merged stroke brings its children along once */
    for(const[x,y]of engMpPP(ka,kb))rec(x,y,it,d+1);};
  const ra=GA.S.filter(s=>!s.par).sort((p,q)=>p.an-q.an),rb=GB.S.filter(s=>!s.par).sort((p,q)=>p.an-q.an);for(const[x,y]of engMpPP(ra,rb))rec(x,y,null,0);
  const da=[],db=[];for(let lv=0;lv<4;lv++){const x=GA.D.filter(d=>d.lv===lv).sort((p,q)=>p.an-q.an),y=GB.D.filter(d=>d.lv===lv).sort((p,q)=>p.an-q.an);for(const q of engMpPP(x,y))da.push(q);}
  const rA=new Map(),rB=new Map();for(const it of L){if(it.a&&!rA.has(it.a))rA.set(it.a,it);if(it.b&&!rB.has(it.b))rB.set(it.b,it);}
  return{L,dots:da,rA,rB};}
/* screen positions this frame (units: x right, y down, ±1 = the panel's edge less the margin): sway (a smooth field, so joints stay
   joined), twist, 3D turn, perspective */
function engMpView(G,t,sw){const def=G.def;if(def.frame)def.frame(G,t);
  const sp=def.spin,tw=def.twist?t*def.twist+G.ph:0,sa=(def.sway||0)*sw;let cy=1,sy=0,cp=1,spp=0;if(sp){const y=t*sp[0]+G.ph;cy=Math.cos(y);sy=Math.sin(y);cp=Math.cos(sp[1]);spp=Math.sin(sp[1]);}
  const ct=Math.cos(tw),st=Math.sin(tw);
  const pr=(x,y,z,out,o)=>{if(sa){const q=sa*(.25+Math.hypot(x,y));const x0=x;x+=q*Math.sin(t*1.1+y*3.1);y+=q*.6*Math.sin(t*.9+x0*2.7);}
    if(tw){const x2=x*ct-y*st;y=x*st+y*ct;x=x2;}
    if(sp){const x2=x*cy+z*sy,z2=-x*sy+z*cy;x=x2;z=z2;const y2=y*cp-z*spp;z=y*spp+z*cp;y=y2;}
    const s=3/(3+z);out[o]=x*s;out[o+1]=y*s;out[o+2]=z;};
  if(!G.V){G.V=G.S.map(()=>new Float32Array(engMpM*3));G.VD=new Float32Array(G.D.length*3);if(G.F)G.VF=new Float32Array(G.F.P.length*3);}
  G.S.forEach((s,k)=>{const V=G.V[k],P=s.P;for(let m=0;m<engMpM;m++)pr(P[3*m],P[3*m+1],P[3*m+2],V,3*m);});
  G.D.forEach((d,k)=>pr(d.x,d.y,d.z,G.VD,3*k));if(G.F)G.F.P.forEach((p,k)=>pr(p[0],p[1],0,G.VF,3*k));}
/* a point at fraction f of a drawn polyline */
function engMpAt(D,f,o){const x=engClamp(f)*(engMpM-1),i=Math.min(engMpM-2,Math.floor(x)),u=x-i;for(let q=0;q<3;q++)o[q]=D[3*i+q]+(D[3*i+3+q]-D[3*i+q])*u;return o;}
/* raster, into the scene's own buffer, the brighter value wins (no beads where segments meet): a capsule with a soft glow and a light core */
function engMpSeg(B,N,x0,y0,x1,y1,r0,r1,v0,v1,c,k){const e=Math.max(r0,r1)+2.5,dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1e-6;
  const X0=Math.max(0,Math.floor(Math.min(x0,x1)-e)),X1=Math.min(N-1,Math.ceil(Math.max(x0,x1)+e)),Y0=Math.max(0,Math.floor(Math.min(y0,y1)-e)),Y1=Math.min(N-1,Math.ceil(Math.max(y0,y1)+e));
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const u=engClamp(((x-x0)*dx+(y-y0)*dy)/l2),ex=x0+dx*u-x,ey=y0+dy*u-y,d2=ex*ex+ey*ey,d=Math.sqrt(d2),r=r0+(r1-r0)*u,v=v0+(v1-v0)*u,
      rr=Math.max(.5,r),a=(engClamp(rr-d+.5)*Math.min(1,r/.5)+.22*Math.exp(-d2/((rr+1.2)*(rr+1.2))))*v,kc=rr>.9?engClamp(rr*.42-d+.5)*.85*v:0;
    if(a<.01&&kc<=0)continue;const j=(y*N+x)*3;
    for(let q=0;q<3;q++){const o=Math.max(a*c[q],kc*k[q]);if(o>B[j+q])B[j+q]=o;}}}
function engMpDisc(B,N,x,y,r,v,c,k,ring){const e=r+3,X0=Math.max(0,Math.floor(x-e)),X1=Math.min(N-1,Math.ceil(x+e)),Y0=Math.max(0,Math.floor(y-e)),Y1=Math.min(N-1,Math.ceil(y+e));
  for(let py=Y0;py<=Y1;py++)for(let px=X0;px<=X1;px++){const d2=(px-x)*(px-x)+(py-y)*(py-y),d=Math.sqrt(d2);let a,kc;
    if(ring){a=engClamp(1.2-Math.abs(d-r*.75))*v;kc=0;}else{a=(engClamp(r-d+.5)+.25*Math.exp(-d2/((r+1.5)*(r+1.5))))*v;kc=engClamp(r*.45-d+.5)*v;}
    if(a<.01&&kc<=0)continue;const j=(py*N+px)*3;for(let q=0;q<3;q++){const o=Math.max(a*c[q],kc*k[q]);if(o>B[j+q])B[j+q]=o;}}}
function engMpFill(B,N,xs,ys,c,a){let x0=N,x1=0,y0=N,y1=0;const n=xs.length;for(let i=0;i<n;i++){x0=Math.min(x0,xs[i]);x1=Math.max(x1,xs[i]);y0=Math.min(y0,ys[i]);y1=Math.max(y1,ys[i]);}
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(N-1,Math.ceil(y1));y++)for(let x=Math.max(0,Math.floor(x0));x<=Math.min(N-1,Math.ceil(x1));x++){let ins=false;
    for(let i=0,j=n-1;i<n;j=i++)if((ys[i]>y)!==(ys[j]>y)&&x<(xs[j]-xs[i])*(y-ys[i])/(ys[j]-ys[i])+xs[i])ins=!ins;
    if(ins){const jj=(y*N+x)*3;for(let q=0;q<3;q++){const o=a*c[q];if(o>B[jj+q])B[jj+q]=o;}}}}
/* start a morph from what is shown now to structure `to` over `bars` (from nothing: it grows out, trunks first) */
function engMpStart(sc,E,to,bars){const M=sc.mp,bp=ENG_CFG.beatsPerBar;M.B=engMpMake(to,sc.R);M.to=to;M.m0=E.beat;M.m1=E.beat+Math.max(.25,bars)*bp;
  M.it=engMpItems(M.A,M.B);M.Z=M.A.S.length?ENG_MP[to].zin||.3:0;M.f=(M.A.S.length&&M.A.def.focus)||[0,0];}
function engMpDraw(sc,E,dts,b){const C=ENG_CFG,A=EAR,N=E.N,h=(N-1)/2,t=E.t,bpb=C.beatsPerBar,cl=engClamp,sm=x=>{x=cl(x);return x*x*(3-2*x);},M=sc.mp,R=sc.R,n18=ENG_MP.length;
  const end=sc.b1-sc.b0-bpb,fade=engEaseOut(Math.min(1,b/2))*(1-cl((b-end)/bpb)),bar=Math.floor(E.beat/bpb),barTick=bar!==M.bar;M.bar=bar;
  /* the clock of the loop: hold a structure for its bars, then morph on a bar line; a section or a drop asks for one at once */
  if(M.req){const q=M.req;M.req=null;engMpStart(sc,E,q.to,q.bars);if(q.strike)M.strike=t;}
  else if(!M.B&&barTick&&bar-M.arr>=M.hold){const mb=A.I>.7?Math.max(2,sc.p.mb-1):sc.p.mb;engMpStart(sc,E,((M.ret!=null?M.ret:M.pos)+1)%n18,mb);}
  let p=0;if(M.B){p=cl((E.beat-M.m0)/(M.m1-M.m0));if(p>=1){M.A=M.B;M.B=null;M.pos=M.to;if(M.ret!=null&&!M.drop)M.ret=null;M.drop=false;ENG.mpPos=M.ret!=null?M.ret:M.to;M.arr=bar;M.hold=Math.max(2,Math.round(sc.p.hold*(1.3-.6*A.I)));engLog('Morphology: '+ENG_MP[M.pos].name);p=0;}}
  const sw=.022*(.35+A.env[2])*E.mot;engMpView(M.A,t,sw);if(M.B)engMpView(M.B,t,sw);
  /* the camera: dives in towards the old one's focus and comes back out centred on the new one */
  const zb=M.B?M.Z*Math.pow(Math.sin(Math.PI*p),1.3):0,zm=1+zb,fx=M.B?M.f[0]*(1-sm(p)):0,fy=M.B?M.f[1]*(1-sm(p)):0,S=h*.92;
  const PX=x=>h+(fx+(x-fx)*zm)*S,PY=y=>h+(fy+(y-fy)*zm)*S;
  /* the music */
  const kb=(t-A.onT[0])*E.bpm/60,ks=(.45+.55*A.I)*cl(1-kb/1.6),D=kb*1.7,mel=cl(A.env[2]*1.2)*.35,wm=1+.55*A.env[0]*A.I+.4*Math.max(0,A.spr[0]),
    stk=Math.exp(-(t-M.strike)/(.6*60/E.bpm)),lvl=(.72+.28*A.I+.2*engIx())*(1+.6*stk);
  let ma=0;if(A.cF&&mel>.01){let pc=0;for(let c=1;c<12;c++)if(A.cF[c]>A.cF[pc])pc=c;ma=pc/12*6.283;}
  const fls=!M.B&&M.A.def.kick==='flash'?.45+.8*Math.exp(-(t-A.onT[0])/.15)+(R()<.08?.25:0):1;
  if(!sc.buf||sc.buf.length!==N*N*3)sc.buf=new Float32Array(N*N*3);const B=sc.buf;B.fill(0);const tips=[];
  const bright=(x,y,d,z,v)=>{const pu=ks*Math.exp(-Math.pow((d-D)/.12,2));let m=0;if(mel>.01){const dd=Math.cos(Math.atan2(x,-y)-ma);m=dd>0?mel*Math.pow(dd,6):0;}
    return[(v*(1-.22*z)*fls+m)*lvl,cl(pu+stk)];};
  /* fill (the leaf) */
  const fill=(G,a)=>{if(!G.F||a<=.01)return;const n=G.F.P.length,xs=new Float32Array(n),ys=new Float32Array(n);for(let i=0;i<n;i++){xs[i]=PX(G.VF[3*i]);ys[i]=PY(G.VF[3*i+1]);}engMpFill(B,N,xs,ys,G.F.c,G.F.a*a*lvl);};
  if(!M.B)fill(M.A,1);else{fill(M.A,1-sm(p/.5));fill(M.B,sm((p-.5)/.5));}
  /* a stroke, drawn up to fraction F of its length */
  const stroke=(V,w0,w1,c,k,v,d0,d1,F,lv)=>{if(F<=.001)return;const ns=engMpM-1,fs=F*ns,wl=lv<=1?wm:1;
    for(let i=0;i<Math.ceil(fs);i++){const u1=Math.min(1,fs-i),x0=V[3*i],y0=V[3*i+1],x1=x0+(V[3*i+3]-x0)*u1,y1=y0+(V[3*i+4]-y0)*u1,z=V[3*i+2],ua=i/ns,ub=(i+u1)/ns,um=(ua+ub)/2;
      const[bv,pw]=bright((x0+x1)/2,(y0+y1)/2,d0+(d1-d0)*um,z,v),cc=pw>0?engMpMix(c,k,pw):c;
      engMpSeg(B,N,PX(x0),PY(y0),PX(x1),PY(y1),(w0+(w1-w0)*ua)*wl/2,(w0+(w1-w0)*ub)*wl/2,bv+pw*.8,bv+pw*.8,cc,k);}
    if(F>.98&&lv>=1)tips.push(PX(V[3*ns]),PY(V[3*ns+1]),k);};
  const disc=(x,y,z,r,c,k,d,ring)=>{if(r<.2)return;const[bv,pw]=bright(x,y,d,z,1);engMpDisc(B,N,PX(x),PY(y),r*(1+.25*pw)*Math.sqrt(zm),bv+pw*.6,pw>0?engMpMix(c,k,pw):c,k,ring);};
  const pt=[0,0,0],pa=[0,0,0],pb=[0,0,0];
  if(!M.B){M.A.S.forEach((s,i)=>stroke(M.A.V[i],s.w0,s.w1,s.c,s.k,s.v,s.d0,s.d1,1,s.lv));M.A.D.forEach((o,i)=>disc(M.A.VD[3*i],M.A.VD[3*i+1],M.A.VD[3*i+2],o.r,o.c,o.k,o.d,o.ring));}
  else{const I=M.it;
    /* strokes: paired ones slide (trunks first), each starting on its parent's drawn point; unpaired ones retract (twigs first) or grow out (trunks first) */
    for(const it of I.L){const a=it.a,bb=it.b,dd=Math.min(it.d,4),Va=a?M.A.V[a.ix]:null,Vb=bb?M.B.V[bb.ix]:null,Dr=it.D;let u,F=1;
      if(a&&bb)u=sm((p-.06*dd)/.76);else if(a){u=0;F=1-sm((p-.25+.06*dd)/.35);}else{u=1;F=sm((p-.35-.08*dd)/.3);}
      if(it.par)engMpAt(it.par.D,a&&bb?a.f+(bb.f-a.f)*u:a?a.f:bb.f,pt);
      else for(let q=0;q<3;q++)pt[q]=a&&bb?Va[q]+(Vb[q]-Va[q])*u:(a?Va:Vb)[q];
      for(let m=0;m<engMpM;m++)for(let q=0;q<3;q++){const j=3*m+q,oa=Va?Va[j]-Va[q]:0,ob=Vb?Vb[j]-Vb[q]:0;Dr[j]=pt[q]+(a&&bb?oa+(ob-oa)*u:a?oa:ob);}
      const s=a&&bb?null:a||bb;
      if(s)stroke(Dr,s.w0,s.w1,s.c,s.k,s.v,s.d0,s.d1,F,s.lv);
      else stroke(Dr,a.w0+(bb.w0-a.w0)*u,a.w1+(bb.w1-a.w1)*u,engMpMix(a.c,bb.c,u),engMpMix(a.k,bb.k,u),a.v+(bb.v-a.v)*u,a.d0+(bb.d0-a.d0)*u,a.d1+(bb.d1-a.d1)*u,1,bb.lv);}
    /* dots: a tip dot rides on its stroke as drawn */
    const where=(G,o,rep,out)=>{const it=o.par&&rep.get(o.par);if(it)return engMpAt(it.D,o.f,out);out[0]=G.VD[3*o.ix];out[1]=G.VD[3*o.ix+1];out[2]=G.VD[3*o.ix+2];return out;};
    for(const[a,bb]of I.dots){if(a&&bb){const u=sm((p-.06*bb.lv)/.76);where(M.A,a,I.rA,pa);where(M.B,bb,I.rB,pb);
        disc(pa[0]+(pb[0]-pa[0])*u,pa[1]+(pb[1]-pa[1])*u,pa[2]+(pb[2]-pa[2])*u,a.r+(bb.r-a.r)*u,engMpMix(a.c,bb.c,u),engMpMix(a.k,bb.k,u),a.d+(bb.d-a.d)*u,u<.5?a.ring:bb.ring);}
      else if(a){where(M.A,a,I.rA,pa);disc(pa[0],pa[1],pa[2],a.r*(1-sm(p/.5)),a.c,a.k,a.d,a.ring);}else{where(M.B,bb,I.rB,pb);disc(pb[0],pb[1],pb[2],bb.r*sm((p-.5)/.5),bb.c,bb.k,bb.d,bb.ring);}}}
  /* snare: sparks on the tips; hats: a twinkle */
  const spark=(n,v,tau)=>{for(let j=0;j<n&&tips.length;j++){const q=3*Math.floor(R()*tips.length/3),x=Math.round(tips[q]),y=Math.round(tips[q+1]);if(x>=0&&y>=0&&x<N&&y<N)engSpark(y*N+x,tips[q+2],1,tau,v*fade);}};
  if(A.on[1]&&b>.5)spark(4+Math.round(4*A.I),1,.14);if(A.on[2]&&b>.5)spark(2,.6,.07);
  const o=[0,0,0];for(let i=0;i<N*N;i++){const j=i*3;if(B[j]+B[j+1]+B[j+2]<.004)continue;o[0]=Math.min(.95,B[j]);o[1]=Math.min(.95,B[j+1]);o[2]=Math.min(.95,B[j+2]);engPut(i,fade,o);}}
engScene('morphology',{name:'Morphology',entry:['dark','dot'],exit:['dark'],bars:[24,32,48],energy:.5,lit:.6,key:['mb'],keepFall:true,noLoop:true,
  params:{hold:[3,6],mb:{pick:[2,3,3,4]},fz:[.8,.9],fp:[0,.03],fs:{pick:[.25,.5]}},
  init(sc,E){delete sc.mods.mirror;delete sc.mods.kaleido;delete sc.mods.rot;const bp=ENG_CFG.beatsPerBar,bar=Math.floor(E.beat/bp),pos=ENG.mpPos==null?0:(ENG.mpPos+1)%ENG_MP.length;   /* never copied or on its side */
    sc.mp={pos,A:{S:[],D:[],F:null,def:{},V:[],VD:new Float32Array(0)},B:null,bar,arr:bar,hold:Math.max(2,Math.round(sc.p.hold)),req:null,strike:-99};
    engMpStart(sc,E,pos,2);},   /* it grows out of nothing, trunks first, as the one after the last it showed */
  say:sc=>'branching structures morphing into each other in one loop (neuron, tree, leaf, river, lightning, circuit board, cables, cube, tesseract, snowflake, coral, lungs, retina, mycelium, slime mould, metro map, cosmic web, neural tissue), now growing the '+ENG_MP[sc.mp?sc.mp.pos:0].name+', '+sc.p.mb+'-bar morphs that dive in and out; kick = a pulse from the root to the tips, snare = sparks, bass = thick trunks, melody lights its branches, a section = the next one, a drop = cube or lightning',
  hold(sc,E,s){const M=sc.mp;if(!s||!M)return false;if(!M.B&&!M.req)M.req={to:((M.ret!=null?M.ret:M.pos)+1)%ENG_MP.length,bars:2};return true;},   /* a new section: the next structure, no cut */
  ownDrop(sc,E){const M=sc.mp;if(!M)return false;if(M.B){if((E.beat-M.m0)/(M.m1-M.m0)>.5){M.A=M.B;M.pos=ENG.mpPos=M.to;}M.B=null;}
    const to=M.pos===7?4:M.pos===4?7:(sc.R()<.6?7:4);if(M.ret==null)M.ret=M.pos;M.drop=true;M.req={to,bars:.5,strike:true};return true;},   /* the drop: a fast morph to the cube or the lightning, with a white strike */
  draw(sc,E,dts,b){engMpDraw(sc,E,dts,b);}});
const ENG_ORDER=Object.keys(ENG_SCENE);
/* the roles: on Auto the director picks by them. drop = the moment a drop hits, flow = the music running, build = loading towards a drop,
   calm = breakdowns and soft passages. A scene can have more than one */
const ENG_ROLE={void:['calm'],portal:['build','flow'],inversion:['drop'],accumulation:['build'],puncture:['drop','build'],perimeter:['calm'],
  tracer:['flow','build'],rings:['flow','drop'],ripple:['flow'],rain:['flow','build'],scanner:['build','flow'],shatter:['flow','build'],heartbeat:['calm','build'],
  static:['build'],corridor:['flow'],core:['flow','drop'],dynamo:['build','drop'],figures:['calm','flow'],arrivals:['calm','build'],merger:['calm','build'],toonmerger:['build','drop'],blackhole:['calm','flow'],supernova:['build','drop'],sundive:['build','flow'],celdeling:['calm','build'],morphology:['calm','flow']};
for(const id of ENG_ORDER)ENG_SCENE[id].role=ENG_ROLE[id]||['flow'];
/* which parts of the music each scene shows; a part that plays but is not shown gets its voice on top (bass waves, a mid figure, high sparks) */
const ENG_COVER={void:['highs'],portal:['mids','highs'],inversion:['highs'],accumulation:['highs'],puncture:['bass','mids'],perimeter:['highs'],tracer:['bass'],
  rings:['bass','mids'],ripple:['bass','mids'],rain:['highs'],scanner:['bass','highs'],shatter:['bass'],heartbeat:['bass','mids'],static:['highs','bass'],
  corridor:['bass','highs'],core:['bass','mids'],dynamo:['bass','mids','highs'],figures:['mids'],arrivals:['bass','mids','highs'],merger:['bass','mids'],toonmerger:['bass','mids'],blackhole:['bass','mids'],supernova:['bass','mids','highs'],sundive:['bass','mids','highs'],celdeling:['bass','mids','highs'],morphology:['bass','mids','highs']};
for(const id of ENG_ORDER)ENG_SCENE[id].cover=ENG_COVER[id]||[];
/* where the music is: build (the drop watch armed, or a build), calm (a breakdown, a rest, or soft), else flow; a drop is its own moment */
const engPhase=()=>CONDUCTOR.phase(EAR,ENG.arc,ENG.rest);   /* the words for where the music is are the conductor's */

/* sparse music: the intro before the beat, a breakdown, a calm passage, or soft */
const engSparse=()=>CONDUCTOR.sparse(EAR,engPhase(),ENG_CFG.arSparse);
/* the director thinks about the shape: what the music is like now picks it. Circle = soft, tonal, flowing; square = steady, on the beat;
   diamond = syncopated, between the beats; triangle = bright and tense, building; cross = noisy and busy. Returns the shapes best first
   (codes as in engForm, 6 = triangle) and why; `not` leaves shapes out (another part has them) */
const ENG_SHAPES={0:'square',1:'diamond',2:'circle',3:'cross',6:'triangle'};
function engThink(not){const A=EAR,Q=A.pe||{},c=engClamp,fl=Q.fl==null?A.flat:Q.fl,ce=Q.ce==null?A.cent:Q.ce,rate=Q.rate||0,off=Q.off||0,St=Q.st||{};
  const rel=(n,x)=>{const s=St[n];return s?c(.5+(x-s.m)/(3*Math.sqrt(Math.max(s.v,1e-6))+1e-3)):.5;},mix=(ab,r)=>.5*ab+.5*r;   /* half how it is, half how it stands out against the song so far */
  const f={tonal:mix(1-c((fl-.03)/.15),1-rel('fl',fl)),slow:mix(1-c((rate-2)/5),1-rel('rate',rate)),soft:mix(1-A.I,1-rel('I',A.I)),beat:mix(c(A.kdens),rel('kd',A.kdens)),
    on:mix(c((.46-off)/.12),1-rel('off',off)),off:mix(c((off-.45)/.12),rel('off',off)),notes:mix(c((rate-3)/5),rel('rate',rate)),   /* notes land between the eighths ~.4 of the time anyway */
    bright:mix(c((ce-.35)/.2),rel('ce',ce)),tense:mix(c(A.build*2.5),rel('build',A.build)),noisy:mix(c((fl-.12)/.12),rel('fl',fl)),busy:mix(c((A.dens-2.5)/2),rel('dens',A.dens))};
  const S={2:[['tonal',.4],['slow',.35],['soft',.25]],0:[['on',.35],['beat',.45],['tonal',.2]],1:[['off',.7],['notes',.3]],6:[['bright',.45],['tense',.4],['notes',.15]],3:[['noisy',.55],['busy',.45]]};
  const o=[];for(const k in S){if(not&&not.includes(+k))continue;let s=0;const cs=S[k].map(([n,w])=>{const v=f[n]*w;s+=v;return[n,v];}).sort((a,b)=>b[1]-a[1]);o.push({k:+k,s,cs});}
  o.sort((a,b)=>b.s-a.s);const w=o[0],say={tonal:'tonal',slow:'flowing',soft:'soft',beat:'a steady kick',on:'on the beat',off:'syncopated',notes:'busy notes',bright:'bright',tense:'building',noisy:'noisy',busy:'busy'};
  return{list:o.map(x=>x.k),k:w.k,why:'the music is '+(w.cs.slice(0,2).filter(x=>x[1]>.05).map(x=>say[x[0]]).join(' and ')||'quiet')+' → '+ENG_SHAPES[w.k]};}
/* ----- modifiers: the director layers them per scene, the keys 1-9 force them on or off ----- */
function engModOn(m){const E=ENG,f=E.force[m];if(f!==undefined)return f;
  if(engMixOn())return !!(E.mixOn&&E.mixOn[m])&&!!engMixOf(m);   /* your layers: exactly what you picked, in every scene and at any moment */
  return ENG_ON.includes(m)||!!(E.sc&&E.sc.mods[m]);}
const engPickedOn=m=>engMixOn()&&ENG.force[m]===undefined&&engModOn(m);   /* a layer you picked is on now: the voices then also play where the scene shows that part itself */
function engRotN(){const E=ENG;return (engMixOn()&&E.mixOn&&E.mixOn.rot?E.mixOn.rot.v:E.sc&&E.sc.mods.rot)||1;}
/* your layers (S.engMix): the only ones coming by themselves, each as often as its slider says (p). On every musical moment (a new scene,
   a drop, a tonal change: the harmony moves on the tonnetz) each is rolled again: on with chance p, else off; at 100 % it simply stays on */
const engMixOn=()=>!!(S.engMix&&S.engMix.length),engMixOf=m=>(S.engMix||[]).find(x=>x.m===m);
function engMixSet(x,on){const O=ENG.mixOn||(ENG.mixOn={});if(on)O[x.m]=O[x.m]||{v:x.m==='rot'?1+Math.floor(ENG.R()*3):1,until:Infinity};else delete O[x.m];}
function engMixTick(kind){const E=ENG,L=S.engMix||[],O=E.mixOn||(E.mixOn={}),say=[];if(!L.length||kind==='bar')return;
  const nm=m=>ENG_MODS.find(q=>q[0]===m)[1].toLowerCase();
  for(const x of L){const was=!!O[x.m],on=x.p>=1||E.R()<x.p;engMixSet(x,on);   /* a re-roll that stays on keeps its turn */
    if(on!==was)say.push((on?'+ ':'− ')+nm(x.m));}
  if(say.length)engLog('layers, '+{drop:'on the drop',tone:'on the tonal change',scene:'with the new scene'}[kind]+': '+say.join(', '));}
const ENG_ON=['spasm'];   /* one hero at a time: the voices only when you turn them on; a part of the music that plays picks a scene that shows it instead */
/* a square of half size r round (x,y): lit on black (mode 1) or cut out of white (mode -1); fill cuts the whole inside */
function engSq(x,y,r,lw,v,mode,fill){const E=ENG,N=E.N,L=E.lay,c=ENG_CFG.white;
  const at=(xx,yy)=>{if(xx<0||yy<0||xx>=N||yy>=N)return;const i=yy*N+xx;if(mode>0)engPut(i,v,c);else{const j=i*3,k=1-v;L[j]*=k;L[j+1]*=k;L[j+2]*=k;}};
  if(fill){for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++)at(xx,yy);return;}
  for(let t=0;t<lw;t++){const q=r-t;if(q<0)break;if(q===0){at(x,y);break;}for(let k=-q;k<q;k++){at(x+k,y-q);at(x+q,y+k);at(x-k,y+q);at(x-q,y-k);}}}
/* the spastic square: when the picture is (nearly) black or (nearly) white it would sit still, so a square jumps size in quick electric
   steps, on the hits and on its own: half the time anywhere from one LED to the frame, half a twitch of a few LEDs, now and then a stutter
   of three in a row or a step off-centre. A thin white outline on black, a black cut (sometimes the whole inside) on white */
function engSpasm(dts){const E=ENG,A=EAR,C=ENG_CFG,N=E.N,L=E.lay,R=E.R,h=(N-1)/2,sc=E.sc;if(!engModOn('spasm'))return;
  if(E.mlOn){if(E.spz)E.spz.sq.length=0;return;}   /* a mid figure is drawn: the square stays away */
  let s=0;for(let j=0;j<L.length;j++)s+=L[j];const lv=s/L.length/C.light,id=sc?sc.def.id:'';E.lv=lv;
  const mode=id==='arrivals'||sc&&sc.p.heavy?0:lv<C.spLow||C.spDark.includes(id)&&lv<C.spDarkMax?1:lv>C.spHigh||C.spLight.includes(id)&&lv>C.spLightMin?-1:0;
  const Z=E.spz||(E.spz={amt:0,mode:1,r:Math.round(h/2),sq:[]});if(mode)Z.mode=mode;
  Z.amt+=((mode?1:0)-Z.amt)*(1-Math.exp(-dts/.25));if(Z.amt<.02){Z.sq.length=0;return;}
  let n=(A.on[0]&&R()<.5?1:0)+(A.on[1]&&R()<.5?1:0)+(A.on[2]&&R()<.25?1:0)+(R()<(C.spRate[0]+C.spRate[1]*Math.max(A.env[2],A.env[4]))*dts*(.6+.4*E.mot)?1:0);
  const box=sc&&sc.def.id==='inversion'&&E.box,dot=sc&&(sc.def.id==='void'||sc.def.id==='heartbeat')&&E.dot,H=Math.floor(h);
  const cx=Math.round(box?box.ox:dot?dot[0]:h),cy=Math.round(box?box.oy:dot?dot[1]:h);
  for(;n>0;n--){Z.r=R()<.5?1+Math.floor(R()*H):Math.max(1,Math.min(H,Z.r+(R()<.5?-1:1)*(1+Math.floor(R()*3))));
    const st=R()<.25?3:1,off=()=>R()<.2?(R()<.5?-1:1):0;
    for(let k=0;k<st;k++)Z.sq.push({x:cx+off(),y:cy+off(),r:Math.max(1,Z.r+k*(R()<.5?-1:2)),d:k,f:1+Math.floor(R()*3),lw:R()<.15?2:1,v:.55+.45*R(),fill:Z.mode<0&&R()<.12});}
  if(Z.sq.length>40)Z.sq.splice(0,Z.sq.length-40);
  Z.sq=Z.sq.filter(q=>{if(q.d>0){q.d--;return true;}engSq(q.x,q.y,q.r,q.lw,q.v*Z.amt,Z.mode,q.fill);return --q.f>0;});}
/* a climax: a build towards a drop, the first bars after a drop, a drop's own screen, or the cycle; only then may the panel fill up */
function engClimax(){const E=ENG,A=EAR,C=ENG_CFG;return engPhase()==='build'||E.beat-A.lastDrop<C.void.dropBars*C.beatsPerBar||!!(E.ev&&E.ev.type==='screen')||E.canon>=0;}
/* which parts of the music play now: bass (kicks or a strong sub), mids (tonal and present), highs (busy hats) */
const engParts=()=>CONDUCTOR.parts(EAR);
/* negative space (Jon Hopkins): black is the main element. Outside a climax at least House › Darkness of the LEDs stay dark (LOOK.darkness does it: the dimmest light is gated
   away until that holds, softly and smoothed over time; the brightest, the hero, stays). The Director only says how dark (the desk's darkness wins while it is on) and when the gate waits */
function engVoidTarget(){const E=ENG,V=E.dkVoid||{};return engClamp((engClimax()?(V.climax!=null?V.climax:HOUSE.val.darknessClimax):(V.black!=null?V.black:HOUSE.val.darkness))-.5*engIxL());}   /* Calm-Busy moves how much must stay dark */
const engVoidSkip=()=>!!(ENG.bam||ENG.vflash);   /* BAM and Void's white halves fill on purpose *//* white is scarce: a (nearly) white picture only while the music builds towards a drop, in the bars after a drop, or in the cycle (C) */
function engWhiteOk(){const E=ENG,A=EAR,C=ENG_CFG;return engPhase()==='build'||E.beat-A.lastDrop<C.whiteDrop*C.beatsPerBar||E.canon>=0||!!(E.sc&&E.sc.tag==='drop');}
/* on the picture that goes out: is it all white or nearly (at least whiteFrac of the LEDs over whiteLed)? Allowed: it strobes on the beat (a short white flash, black between, never more than
   3 flashes a second, through the shared flash gate; with white flashes off it is only dimmed). Not allowed: dimmed at once, and on the
   next bar line the inverted layer goes or a light scene ends */
function engWhite(W,t){const E=ENG,C=ENG_CFG,N=E.N,bpb=C.beatsPerBar;let s=0,br=0;const th=C.whiteLed*C.light;
  for(let j=0;j<W.length;j+=3){s+=W[j]+W[j+1]+W[j+2];if(Math.min(W[j],W[j+1],W[j+2])>th)br++;}E.lvOut=s/W.length/C.light;   /* only (nearly) all LEDs bright counts: never a picture with forms in it */
  if(br/(N*N)<HOUSE.val.whiteFrac||E.black||E.bam||E.ev&&(E.ev.type==='screen'||E.ev.type==='strobe')){E.wMode='';E.wBad=0;return;}
  const dim=k=>{for(let j=0;j<W.length;j++)W[j]*=k;};
  if(!engWhiteOk()){E.wBad=(E.wBad||0)+1;if(E.wBad<18){E.wMode='';return;}   /* a single white frame (a flash) is not a white screen: 0.3 s first */
    E.wMode='dimmed';dim(C.whiteDim);const sc=E.sc;
    if(sc&&E.wLeft!==sc.n){E.wLeft=sc.n;if(sc.mods.invert)delete sc.mods.invert;
      if(C.spLight.includes(sc.def.id)&&!sc.def.untilDone)sc.b1=Math.min(sc.b1,(Math.floor(E.beat/bpb)+1)*bpb);
      engLog('a white screen outside a build or drop: dimmed, gone on the bar');}return;}
  if(FEEL.get('flash')<.01){E.wMode='dimmed';dim(C.whiteDim);return;}
  /* it strobes to a part of the music: in a build the snare (else the hats), after a drop the kick; that part silent for 2 beats: the beat */
  const A=EAR,part=engPhase()==='build'?(t-A.onT[1]<2?1:2):0,beat=60/E.bpm;let hit=A.on[part],name=['kick','snare','hats'][part];
  if(t-A.onT[part]>2*beat){const d=E.bpm<=90?.5:E.bpm<=180?1:2,slot=Math.floor(E.beat/d);hit=slot!==E.wSlot;E.wSlot=slot;name='beat';}
  if(hit&&t-(E.wT||-9)>=1/HOUSE.val.flashMax&&engFlash(t,1))E.wT=t;   /* spaced evenly by House's flashes-per-second (General > Light), on top of the shared gate */
  E.wMode='strobe on the '+name;if(t-(E.wT||-9)>Math.min(C.whiteOn,beat*HOUSE.val.whiteDuty))dim(C.whiteOff);}/* how thick a bass gesture is: by the sub band and the intensity (s scales it for scenes that draw many of them) */
function engBassLw(s){const C=ENG_CFG,A=EAR;return Math.max(1,Math.round((1+(C.bassLw[1]-1)*Math.pow(engClamp(A.band[0]*A.I*1.2),2))*(s||1)));}   /* thin on an everyday kick, thick only when it is heavy and loud */
function engLine(x0,y0,x1,y1,v,c){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*1.5)+1;for(let k=0;k<=n;k++){const u=k/n;engPutXY(x0+(x1-x0)*u,y0+(y1-y0)*u,v,c);}}
/* the bass voice: a thick wave from the centre to the frame on every solid bass hit (black on the light scenes); calm parts only on the heaviest */
function engBass(){const E=ENG,A=EAR,C=ENG_CFG,sc=E.sc,N=E.N,h=(N-1)/2;if(!sc||!engModOn('bass')){E.bw=[];return;}
  const pk=engPickedOn('bass'),Q=E.bw||(E.bw=[]),own=!pk&&sc.def.cover.includes('bass'),light=C.spLight.includes(sc.def.id)||sc.def.id==='static';
  if(A.on[0]&&!own&&!A.gen&&A.band[0]>C.bassMin&&Q.length<2&&(pk||E.lvScene<C.voiceRoom)&&E.t-(E.bwT||-9)>.9*60/E.bpm&&(engPhase()!=='calm'||A.band[0]>.85&&E.R()<.3))
    (E.bwT=E.t,Q.push({t0:E.t,lw:engBassLw(),k:E.box&&E.box.shape>=0&&E.box.shape<=2?E.box.shape:0,dur:C.bassDur*(1.2-.4*A.I),light}));
  E.bw=Q.filter(w=>{const a=(E.t-w.t0)/w.dur;if(a>=1)return false;const r=engSnap(h*engEaseOut(a)*1.05,h),v=.9*(1-a*a);if(r<1)return true;
    if(w.light)engSq(Math.round(h),Math.round(h),Math.round(r),w.lw,v,-1);else engOutline(h,h,r,w.lw,w.k,v,C.white,0);return true;});}
/* figures for the mid voice, as polylines in -1..1 at three levels of detail: golden spirals, a golden pentagram, the flower of life,
   Metatron's cube, interlocking triangles, the eye of providence on a pyramid, the Mandelbrot set's outline, a spirograph, a rose curve,
   a torus knot, whirling squares, a Lissajous figure */
const engGlyphCache={};
function engGlyph(name,d){const key=name+d;if(engGlyphCache[key])return engGlyphCache[key];const TAU=2*Math.PI,PHI=(1+Math.sqrt(5))/2,L=[];
  const curve=(f,a,b,n)=>{const o=[];for(let k=0;k<=n;k++){const[x,y]=f(a+(b-a)*k/n);o.push(x,y);}L.push(o);};
  const circ=(cx,cy,r,n=40)=>curve(t=>[cx+r*Math.cos(t),cy+r*Math.sin(t)],0,TAU,n);
  const poly=(pts,closed)=>{const o=[];for(const p of pts)o.push(p[0],p[1]);if(closed)o.push(pts[0][0],pts[0][1]);L.push(o);};
  const ngon=(n,r,rot)=>Array.from({length:n},(_,k)=>[r*Math.cos(rot+k*TAU/n),r*Math.sin(rot+k*TAU/n)]);
  if(name==='golden'){const arms=[2,3,4][d];for(let a=0;a<arms;a++)curve(th=>{const r=Math.pow(PHI,-th/(Math.PI/2));return[r*Math.cos(th+a*TAU/arms),r*Math.sin(th+a*TAU/arms)];},0,5*Math.PI,160);
    if(d>1)circ(0,0,1,48);}
  else if(name==='pentagram'){let r=1;for(let l=0;l<=d;l++){const P=ngon(5,r,-Math.PI/2);poly(P,true);poly([P[0],P[2],P[4],P[1],P[3]],true);r/=PHI*PHI;}if(d>0)circ(0,0,1,48);}   /* each level nests by the golden ratio */
  else if(name==='flower'){const a=d?.25:.33,pts=[[0,0]];for(let k=0;k<6;k++)pts.push([a*Math.cos(k*TAU/6),a*Math.sin(k*TAU/6)]);
    if(d)for(let k=0;k<6;k++){pts.push([2*a*Math.cos(k*TAU/6),2*a*Math.sin(k*TAU/6)]);pts.push([Math.sqrt(3)*a*Math.cos(k*TAU/6+TAU/12),Math.sqrt(3)*a*Math.sin(k*TAU/6+TAU/12)]);}
    for(const[x,y]of pts)circ(x,y,a,32);circ(0,0,d?3*a:2*a,48);}   /* the seed, then the flower of life */
  else if(name==='metatron'){const a=.24,P=[[0,0]];for(let k=0;k<6;k++){const t=k*TAU/6-Math.PI/2;P.push([2*a*Math.cos(t),2*a*Math.sin(t)]);}for(let k=0;k<6;k++){const t=k*TAU/6-Math.PI/2;P.push([4*a*Math.cos(t),4*a*Math.sin(t)]);}
    if(d===0){poly(P.slice(7),true);poly([P[7],P[9],P[11]],true);poly([P[8],P[10],P[12]],true);}else for(let i=0;i<13;i++)for(let j=i+1;j<13;j++)poly([P[i],P[j]],false);
    if(d>1)for(const[x,y]of P)circ(x,y,a,20);}
  else if(name==='yantra'){const up=[[.95,-.05],[.6,.15],[.35,.32]],dn=[[.95,.05],[.7,-.12],[.45,-.28],[.22,-.4]];
    for(const[s,o]of up.slice(0,2+d))poly([[0,o-s],[s*.87,o+s*.5],[-s*.87,o+s*.5]],true);for(const[s,o]of dn.slice(0,2+d))poly([[0,o+s],[s*.87,o-s*.5],[-s*.87,o-s*.5]],true);circ(0,0,1,48);}
  else if(name==='eye'){const T=[[0,-.95],[.95,.75],[-.95,.75]];poly(T,true);   /* the pyramid with the eye of providence in its top */
    curve(t=>[.32*Math.cos(t),-.32+.14*Math.sin(t)*(Math.cos(t)>0?1:1)],0,Math.PI,24);curve(t=>[.32*Math.cos(t),-.32-.14*Math.sin(t)],0,Math.PI,24);circ(0,-.32,.09,20);
    if(d>0)for(let k=0;k<12;k++){const t=-Math.PI/2+(k-5.5)*.22;poly([[.5*Math.cos(t),-.32+.5*Math.sin(t)],[.8*Math.cos(t),-.32+.8*Math.sin(t)]],false);}
    if(d>1)for(let y=0;y<=.7;y+=.175){const w=(y+.95)/1.7*.95;poly([[-w,y],[w,y]],false);}}
  else if(name==='mandelbrot'){const s=1/1.25,c=-.75;curve(t=>{const x=Math.cos(t)/2-Math.cos(2*t)/4,y=Math.sin(t)/2-Math.sin(2*t)/4;return[(x-c)*s,y*s];},0,TAU,120);   /* the main cardioid */
    circ((-1-c)*s,0,.25*s,40);for(let q=3;q<=3+2*d;q++)for(const p of[1,q-1]){if(q%p===0&&p!==1)continue;const t=TAU*p/q,bx=Math.cos(t)/2-Math.cos(2*t)/4,by=Math.sin(t)/2-Math.sin(2*t)/4,r=Math.sin(Math.PI*p/q)/(q*q),nx=bx+(Math.cos(t)*.5-Math.cos(2*t)*.5)*0+0;
      const gx=-Math.sin(t)/2+Math.sin(2*t)/2,gy=Math.cos(t)/2-Math.cos(2*t)/2,gl=Math.hypot(gx,gy)||1;circ((bx+gy/gl*r-c)*s,(by-gx/gl*r)*s,r*s,24);}}   /* the bulbs, on the cardioid's outside */
  else if(name==='spiro'){const[R,r,dd]=[[5,3,5],[7,4,6],[11,7,9]][d];curve(t=>{const x=(R-r)*Math.cos(t)+dd*Math.cos((R-r)/r*t),y=(R-r)*Math.sin(t)-dd*Math.sin((R-r)/r*t);return[x/(R-r+dd),y/(R-r+dd)];},0,TAU*r,240+120*d);}
  else if(name==='rose'){const[n,m]=[[5,2],[7,3],[9,4]][d],k=n/m;curve(t=>{const r=Math.cos(k*t);return[r*Math.cos(t),r*Math.sin(t)];},0,TAU*m,240+80*d);}
  else if(name==='knot'){const[p,q]=[[2,3],[3,5],[2,7]][d];curve(t=>{const r=(Math.cos(q*t)+2)/3;return[r*Math.cos(p*t),r*Math.sin(p*t)];},0,TAU,300);}
  else if(name==='squares'){let P=ngon(4,1,Math.PI/4);const n=10+6*d,f=.12;for(let k=0;k<n;k++){poly(P,true);P=P.map((v,i)=>{const w=P[(i+1)%4];return[v[0]+(w[0]-v[0])*f,v[1]+(w[1]-v[1])*f];});}}   /* the pursuit whirl */
  else if(name==='lissajous'){const[a,b]=[[3,2],[5,4],[7,6]][d];curve(t=>[Math.sin(a*t+Math.PI/4),Math.sin(b*t)],0,TAU,300);}
  let tot=0;for(const o of L)for(let k=2;k<o.length;k+=2)tot+=Math.hypot(o[k]-o[k-2],o[k+1]-o[k-1]);return engGlyphCache[key]={L,tot};}
/* the high voice: when the scene shows no highs, a few small sparks on the hats (none on the light scenes) */
function engHighs(){const E=ENG,A=EAR,C=ENG_CFG,sc=E.sc,N=E.N,R=E.R;if(!sc||!engModOn('highs')||A.gen||!engPickedOn('highs')&&(sc.def.cover.includes('highs')||C.spLight.includes(sc.def.id)))return;
  if(A.on[2]&&A.band[4]>.35){const n=1+Math.floor(R()*2*A.I);for(let k=0;k<n;k++)engSpark(Math.floor(R()*N*N),C.cold[R()<.5?0:1],1,.12,.5+.4*A.I);}}
/* the mid voice (vocals, leads): one figure per scene, medium sized; the more the mids play the more of it is drawn and the more detail it
   has, a pen traces round it, it turns with the melody (the eye and the yantra stay upright and only sway). Not on the light scenes */
function engMids(dts){const E=ENG,A=EAR,C=ENG_CFG,sc=E.sc,N=E.N,h=(N-1)/2;E.mlOn=false;if(!sc||!engModOn('mids')||!A.cF||A.gen)return;
  const pk=engPickedOn('mids');if(!pk&&(C.spLight.includes(sc.def.id)||sc.def.id==='static'||sc.def.cover.includes('mids'))){E.mAmt=0;return;}   /* the scene already shows the mids (unless you picked the figures) */
  const raw0=engClamp(A.env[2]*1.2)*(1-.6*A.flat)*(.3+.7*A.I),raw=pk?Math.max(raw0,C.midMin+.15):raw0*(E.lvScene<C.voiceRoom?1:0);   /* only in a sparse scene; picked: always a figure, bigger as the mids play */
  E.mAmt=(E.mAmt||0)+(raw-(E.mAmt||0))*(1-Math.exp(-dts/(raw>(E.mAmt||0)?.4:.9)));const m=E.mAmt;if(m<C.midMin)return;E.mlOn=true;   /* fades in and out, no popping */
  if(E.gSc!==sc.n){E.gSc=sc.n;E.gk=ENG_GLYPHS[Math.floor(E.R()*ENG_GLYPHS.length)];E.gp=0;}   /* a figure per scene */
  engFigure(E.gk,m,dts,.2,.16,(.35+.45*m)*engClamp((m-C.midMin)/.15));}
/* draw a figure: size base + grow × m of the panel, brightness v; it turns with the melody and a pen traces round it */
function engFigure(gk,m,dts,base,grow,v0){const E=ENG,A=EAR,N=E.N,h=(N-1)/2,C=ENG_CFG;
  let pc=0;if(A.cF)for(let c=1;c<12;c++)if(A.cF[c]>A.cF[pc])pc=c;const tg=pc/12*2*Math.PI;E.ma=E.ma||0;
  let d=tg-E.ma;d-=2*Math.PI*Math.round(d/(2*Math.PI));E.ma+=d*(1-Math.exp(-dts/.25))+dts*(.3+1.5*Math.max(0,A.spr[2]));   /* follows the melody, drifts with the mids */
  const dm=m+.6*engIx(),g=engGlyph(gk,dm>.7?2:dm>.4?1:0),   /* Calm-Busy sets the detail too */up=ENG_UPRIGHT.includes(gk),a=up?.25*Math.sin(E.ma):E.ma,ca=Math.cos(a),sa=Math.sin(a);
  const S=Math.min(N*.47,N*(base+grow*m)*(1+.1*Math.max(0,A.spr[2]))),v=v0*(engPhase()==='calm'?.7:1);
  E.gp=((E.gp||0)+dts*(.12+.6*Math.max(0,A.spr[2])))%1;const win=(.35+.65*m)*g.tot,off=E.gp*g.tot;   /* the pen: how much is drawn, where it is */
  let pos=0;for(const o of g.L)for(let k=2;k<o.length;k+=2){const x0=o[k-2],y0=o[k-1],x1=o[k],y1=o[k+1],sl=Math.hypot(x1-x0,y1-y0),w=((pos-off)%g.tot+g.tot)%g.tot;pos+=sl;
    if(win<g.tot&&w>win)continue;const b=win<g.tot?.35+.65*(w/win):1;
    engLine(h+S*(x0*ca-y0*sa),h+S*(x0*sa+y0*ca),h+S*(x1*ca-y1*sa),h+S*(x1*sa+y1*ca),v*b,C.cold[1]);}}/* anticipation: 0..1 over the last beat before a bar line that brings a change the director already knows about (a waiting switch, the
   monotony watch, a scene ending there) */
function engAntQ(){const E=ENG,C=ENG_CFG,bpb=C.beatsPerBar,sc=E.sc;if(E.tr||!sc||E.frozen)return 0;
  const next=(Math.floor(E.beat/bpb)+1)*bpb,left=next-E.beat;if(left>1)return 0;
  const known=!!E.secReq||E.mono&&E.mono.due!=null||(sc.def.untilDone?sc.done:sc.b1<=next+1e-6);return known?(1-left)*(1-left):0;}
/* The picture that goes out is finished by LOOK.post (look.js): breathing, the beat before a change pulls it in and dims it, FEEL (feel.js: kick zoom, kick flash, hit contrast,
   glitch, lull dim; FEEL.cpuDone so the page's shader does not do it twice), then the hooks below, the darkness floor, brightness, gamma, white cap and the power limit. */
/* the sound waits S.engDelay ms while the director plays, so the light (a frame, then the LEDs) lands on the beat instead of after it
   (sound late by 45 ms already shows, light late is worse: ITU-R BT.1359). Only the player and video can wait; captured sound cannot */
function engAudioDelay(){if(typeof actx==='undefined'||!actx)return;const E=ENG,D=E.dl||(E.dl={node:null,ms:-1,on:new Set()});
  const want=S.pat===55&&S.engDelay>0,nodes=[typeof mediaNode!=='undefined'?mediaNode:null,typeof vidNode!=='undefined'?vidNode:null].filter(Boolean);
  if(!D.node){try{D.node=actx.createDelay(1);D.node.connect(actx.destination);}catch(e){return;}}
  if(D.ms!==S.engDelay){D.ms=S.engDelay;D.node.delayTime.setTargetAtTime(S.engDelay/1000,actx.currentTime,.05);}
  for(const n of nodes){const on=D.on.has(n);
    if(want&&!on){try{n.disconnect(actx.destination);n.connect(D.node);D.on.add(n);}catch(e){}}
    else if(!want&&on){try{n.disconnect(D.node);n.connect(actx.destination);D.on.delete(n);}catch(e){}}}}
/* visual memory: every new section and drop is remembered with its harmony; when a later one sounds like it (correlation of the 12 notes),
   that scene comes back with the same seed, a little changed: the same riff gets the same gesture */
function engRemember(sc,kind,sig){const E=ENG,C=ENG_CFG,m={kind,id:sc.def.id,p0:sc.p0,seed:sc.seed,mods:sc.mods,n:sc.n,sig:sig?Float32Array.from(sig):null};
  E.mem.push(m);if(E.mem.length>C.memN)E.mem.shift();if(!sig)E.memP.push({m,beat:E.beat+C.memBars*C.beatsPerBar});}
function engRecall(kind,sig){const E=ENG,C=ENG_CFG,pool=engPool();if(!sig||!E.mem||pool.length<2)return null;const ph=engPhase();let best=null,bc=C.memMin;
  for(const m of E.mem){if(m.kind!==kind||!m.sig||!pool.includes(m.id)||E.sc&&m.id===E.sc.def.id)continue;
    if(kind==='section'&&!ENG_SCENE[m.id].role.includes(ph))continue;
    if(!engWhiteOk()&&(['inversion','accumulation','puncture'].includes(m.id)||m.mods&&m.mods.invert))continue;   /* no white scene back outside a build or a drop */const r=engCorr(sig,m.sig);if(r>bc){bc=r;best=m;}}
  if(best)best.r=bc;return best;}
/* the section's shockwave: squares from the centre out to the frame (something came in) or from the frame into the centre (something left) */
function engShock(){const E=ENG,C=ENG_CFG,s=E.shock;if(!s)return;const q=(E.t-s.t0)/s.dur,h=(E.N-1)/2;if(q>=1+.2*(s.n-1)){E.shock=null;return;}
  for(let k=0;k<s.n;k++){const qq=q-k*.2;if(qq<0||qq>1)continue;const e=engEaseOut(qq);engOutline(h,h,engSnap(s.dir>0?h*e:h*(1-e),h),2,0,1-.6*qq,C.white,0);}}
/* geometry, before the feedback (so the ghosts follow): mirror, kaleidoscope, quarter turns */
function engGeo(){const E=ENG,N=E.N,L=E.lay,T=E.tmp,k=engModOn('kaleido'),m=engModOn('mirror'),rot=engModOn('rot')?engRotN():0;
  if(!k&&!m&&!rot)return;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let sx=x,sy=y;for(let q=0;q<rot;q++){const t=sx;sx=sy;sy=N-1-t;}
    const j=(y*N+x)*3,a=(sy*N+sx)*3;let r=L[a],g=L[a+1],b=L[a+2];
    const add=(xx,yy)=>{const c=(yy*N+xx)*3;if(L[c]>r)r=L[c];if(L[c+1]>g)g=L[c+1];if(L[c+2]>b)b=L[c+2];};
    if(m||k)add(N-1-sx,sy);if(k){add(sx,N-1-sy);add(N-1-sx,N-1-sy);}T[j]=r;T[j+1]=g;T[j+2]=b;}
  L.set(T);}
/* on the picture that goes out (not into the feedback): glitch, inversion, cold tint, full colour, global events */
function engOutMods(W){const E=ENG,C=ENG_CFG,A=EAR,N=E.N,R=E.R,f=E.force.glitch!==undefined?E.force.glitch:engMixOn()&&engModOn('glitch')?true:undefined;   /* a glitch you picked tears even pure sound */
  const pure=A.flat<C.pureFlat&&A.dens<.5;   /* harmonic purity takes every glitch away at once */
  let g=f===false||((pure||E.sc&&E.sc.def.id==='arrivals')&&f!==true)?0:   /* Arrivals is solid shapes only: no tears */engClamp((A.gen?0:Math.max(0,A.flat-C.pureFlat)*C.glitchFlat)*(.5+E.ent)+(engModOn('glitch')?.45:0));
  E.gl=g;
  if(g>.02){const T=E.tmp;T.set(W);
    for(let y=0;y<N;y++)if(R()<g*.15){const s=(R()<.5?-1:1)*(1+Math.floor(R()*4*g));for(let x=0;x<N;x++){const sx=Math.max(0,Math.min(N-1,x-s)),j=(y*N+x)*3,a=(y*N+sx)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}
    for(let x=0;x<N;x++)if(R()<g*.06){const s=R()<.5?-1:1;for(let y=0;y<N;y++){const sy=Math.max(0,Math.min(N-1,y-s)),j=(y*N+x)*3,a=(sy*N+x)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}
    if(g>.3&&R()<g){T.set(W);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3;W[j]=x>0?T[j-3]:0;W[j+2]=x<N-1?T[j+5]:0;}}   /* 1 LED colour split */
    for(let y=0;y<N;y++)if(R()<g*.04)W.fill(0,y*N*3,(y+1)*N*3);   /* scanline dropouts */
    if(R()<g*.3){const w=6+Math.floor(R()*14),h=3+Math.floor(R()*8),x0=Math.floor(R()*(N-w)),y0=Math.floor(R()*(N-h)),dx=(R()<.5?-1:1)*(2+Math.floor(R()*6));T.set(W);
      for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const sx=Math.max(0,Math.min(N-1,x+dx)),j=(y*N+x)*3,a=(y*N+sx)*3;W[j]=T[a];W[j+1]=T[a+1];W[j+2]=T[a+2];}}}   /* block tear */
  const ev=E.ev;let inv=engModOn('invert');
  if(ev){if(ev.type==='strobe'){if(ev.f===0)W.fill(Math.max(.4,FEEL.get('flash')));else if(ev.f===1)W.fill(0);if(++ev.f>1)E.ev=null;}
    else if(ev.type==='invert'){inv=!inv;if(E.beat>=ev.b1)E.ev=null;}
    else if(ev.type==='screen'){W.fill(ev.v);if(E.beat>=ev.b1)E.ev=null;}}   /* the drop: the whole panel white or black, then the scene */
  if(inv)for(let j=0;j<W.length;j+=3){W[j]=C.light*C.white[0]-W[j];W[j+1]=C.light*C.white[1]-W[j+1];W[j+2]=C.light*C.white[2]-W[j+2];}
  if(engModOn('cold')){const c=C.cold[0];for(let j=0;j<W.length;j+=3){const v=Math.max(W[j],W[j+1],W[j+2]);W[j]=v*c[0];W[j+1]=v*c[1];W[j+2]=v*c[2];}}
  if(engModOn('palette')&&typeof PAL!=='undefined'){const st=PAL[(E.sc&&E.sc.pal)||0].c,n=st.length,h=(N-1)/2;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3,v=Math.max(W[j],W[j+1],W[j+2]);if(v<.003)continue;
      const u=((Math.max(Math.abs(x-h),Math.abs(y-h))/N*1.6+E.t*.04)%1)*n,i0=Math.floor(u)%n,i1=(i0+1)%n,fr=u-Math.floor(u);
      for(let c=0;c<3;c++)W[j+c]=v*(st[i0][c]*(1-fr)+st[i1][c]*fr);}}
  if(E.black||A.dw.pre)W.fill(0);}

/* ----- the director -----
   Every decision is logged with time and bar. The next scene must start in the state the last one ended in, or a bridge carries it over
   (iris into a dot, dissolve or blackout into the dark). Weights: how well the scene's energy fits the music (or the generative arc),
   how rare it is, how recently it played; the same fingerprint (scene, key parameters, layers) never comes back within the last 10.
   It loops when the music loops, breaks when it breaks, now and then calls an earlier moment back, plays the canonical cycle intact
   now and then, builds entropy in builds, cuts hard on drops, holds back in breakdowns, and forces a rest after a long loud stretch. */
/* show API (page: From the sets / Stories / Sets): lock = play only this scene or story and loop it, pool = the director may only choose from these */
const ENG_QUIET=['void','perimeter','heartbeat','arrivals','figures'];   /* DESK hook: the genuinely quiet scenes, what Calm may pick (Black hole's bright sun with flares and the stories are not) */
const ENG_STORIES=['merger','blackhole','supernova','sundive','celdeling','toonmerger','morphology','arrivals'];
let ENG_LOCK=null,ENG_POOL=null;
const engSet=()=>(S.engSet||[]).filter(id=>ENG_SCENE[id]);   /* your scenes for this set, picked in the Director tab */
const engMarked=k=>engSet().filter(id=>((S.engMark||{})[id]||{})[k]);   /* the ones you marked as intro (the song starts) or drop */
const engPool=()=>{if(ENG_LOCK)return [ENG_LOCK];if(ENG_POOL)return ENG_POOL;const f=ENG_ORDER[S.engScene-1];if(f)return [f];const s=engSet(),mk=S.engMark||{},free=s.filter(id=>!(mk[id]&&(mk[id].intro||mk[id].drop)));
  return free.length?free:s.length?s:engDeskPool(ENG_ORDER);};   /* a marked scene waits for its moment, unless nothing else is left */   /* S.engScene: one scene steered from outside (the VJ Lab); DESK hook: your scenes always play, even ones the desk (or its style) switches off: the click is the clearest wish */   /* DESK hook: scenes the desk never wants (weight 0) stay out of every choice */
for(const id of ENG_QUIET)if(ENG_SCENE[id])ENG_SCENE[id].quiet=true;   /* the conductor's 'soft' fallback */
/* what the conductor needs to know about the music and this show this frame (Calm-Busy picks busier or quieter scenes) */
const engIn=()=>{const A=EAR,E=ENG;return{gen:A.gen,arc:E.arc,I:A.I,energy:A.energy,build:A.build,drop:A.drop,dropReq:E.dropReq,brk:A.brk,rest:E.rest,plan:!!E.planRef};};
const engTarget=()=>CONDUCTOR.target(engIn());
const engVp=(k,d)=>{try{const v=window.vpGet&&window.vpGet(55,k);return typeof v==='number'&&isFinite(v)?v:d;}catch(e){return d;}};   /* live slider value (Director = pattern 55) */
function engBarsScale(b){const f=engVp('bars',8)/8;if(f===1)return b;const g=b%4===0?4:b%2===0?2:1;return Math.max(g,Math.round(b*f/g)*g);}   /* 'Scene length' slider: whole bars on the original 4/2/1 granularity */
function engBars(def){const E=ENG,R=E.R,w=def.bars.map(v=>v<=2?.3+E.ent:v<=4?.3+E.ent:v<=8?.6:.5*(1-E.ent)+(E.rest>0||EAR.brk?.5:0));
  let s=0;w.forEach(x=>s+=x);let r=R()*s;for(let i=0;i<w.length;i++){r-=w[i];if(r<=0)return engBarsScale(engDeskPace(def.bars[i],def.id));}return engBarsScale(engDeskPace(def.bars[0],def.id));}   /* DESK hook: the style's pace scales a scene's bars */
function engRollMods(){const E=ENG,C=ENG_CFG,R=E.R,m={};if(engMixOn())return m;   /* your mix decides the layers, not the dice */
  if(E.lvl!=null)return engLevelMods(m);   /* AUTO: the level decides the layers and the colour */
  if(E.restr>.5||E.rest>0){if(R()<C.modP.cold[0])m.cold=1;return m;}
  for(const[k]of ENG_MODS){if(!C.modP[k]||k==='invert'&&!engWhiteOk())continue;   /* a white picture only in a build or after a drop */const[a,b]=C.modP[k];if(R()<Math.max(0,Math.min(1,(a+b*E.ent)*(E.novel?1.6:1)*engVp('layerFreq',1))))m[k]=k==='rot'?1+Math.floor(R()*3):1;}
  if(m.kaleido)delete m.mirror;return m;}
/* AUTO: layers and colour by the level, not by dice. Soft (< lvLow, or a rest): the cold tint, no other layer. Middle: the style's colours (its accents through the
   cold tint, else the full-colour palette), at most one extra layer from level .45 up. Full (> lvHigh, a build, a drop): white dominant, no tint / palette, two extra
   layers, three from .85 up. The extras are ranked by their modP chance (× layer-freq slider, × novelty); the dice only jitter the ranking ±10 %, so near-ties break.
   Inverted only where a white picture is allowed; kaleidoscope is the lowest base and so comes last. The voices (bass, mids, highs, spasm) are not touched here */
function engLevelMods(m){const E=ENG,C=ENG_CFG,L=CONDUCTOR.look(E.lvl,E.restr>.5||E.rest>0),layers=[];   /* the decision (soft / middle / full, how many layers, which colour) is the conductor's */
  if(L.layers)for(const k of['mirror','kaleido','rot','invert','glitch','nofb']){if(k==='invert'&&!engWhiteOk())continue;const[a,b]=C.modP[k];layers.push({k,base:(a+b*E.ent)*(E.novel?1.6:1)*engVp('layerFreq',1)});}
  CONDUCTOR.levelMods(m,{lv:E.lvl,restrained:E.restr>.5||E.rest>0,coldOver:!!ENG_COLD_OVER,layers,rng:E.R,value:(k,R)=>k==='rot'?1+Math.floor(R()*3):1});
  if(m.kaleido)delete m.mirror;return m;}
/* AUTO: the palette index by level (calm colours first, hot ones last); the dice only move it a place */
const ENG_PALORD=[2,4,6,1,5,3,0];   /* Ocean, Aurora, Green, Sunset, Candy, Ember, Rainbow */
function engPalIx(){const E=ENG,n=typeof PAL!=='undefined'?PAL.length:0;return CONDUCTOR.palIx(n,ENG_PALORD,E.lvl,E.R);}
function engFp(def,p,mods){return def.id+'|'+def.key.map(k=>{const s=def.params[k],v=p[k];return Array.isArray(s)?(v<(s[0]+s[1])/2?'lo':'hi'):String(v);}).join(',')+'|'+Object.keys(mods).sort().join('+');}
function engMake(id,o={}){const E=ENG,def=ENG_SCENE[id],h=(E.N-1)/2,recent=E.hist.slice(-ENG_CFG.histN).map(x=>x.fp);
  const sp=def.params&&def.params.shape,th=sp&&sp.pick&&!o.p&&!EAR.gen&&!(o.force&&'shape'in o.force)?engThink():null,tk=th?th.list.find(k=>sp.pick.includes(k)):null;   /* the shape is thought, not rolled */
  let p,mods,fp;for(let k=0;k<12;k++){p=o.p?Object.assign({},o.p):engRoll(def.params,E.R,E.lvl);if(tk!=null)p.shape=tk;
    if(!o.p&&E.lvl!=null&&def.params.cold&&def.params.cold.p!=null)p.cold=E.lvl<ENG_CFG.lvCold;   /* AUTO: a cold scene when it is soft, by the level */
    if(o.force)Object.assign(p,o.force);mods=o.mods||engRollMods();
    fp=engFp(def,p,mods);if(!recent.includes(fp)||o.p)break;}
  for(let k=0;k<8&&recent.includes(fp)&&!(E.lvl!=null&&E.lvl<CONDUCTOR.cfg.lvLow);k++){const m=E.lvl!=null?['mirror','rot','glitch','nofb'][Math.floor(E.R()*4)]:ENG_MODS[Math.floor(E.R()*7)][0];mods=Object.assign({},mods);if(mods[m])delete mods[m];else mods[m]=m==='rot'?1+Math.floor(E.R()*3):1;fp=engFp(def,p,mods);}   /* still a repeat (loops and callbacks too): flip a layer */
  const seed=o.seed??(E.R()*4294967296>>>0);
  return{def,p,p0:Object.assign({},p),seed,R:engRng(seed),bars:o.bars||engBars(def),mods,fp,from:o.from||'dark',ox:h,oy:h,exit:def.exit[0],
    pal:engPalIx(),tag:o.tag||'',think:o.think||(tk!=null?th.why+(tk!==th.k?' (here a '+ENG_SHAPES[tk]+')':''):'')};}
function engBegin(sc){const E=ENG,C=ENG_CFG,def=sc.def;sc.n=++E.n;sc.b0=E.beat;sc.b1=(Math.round(E.beat/C.beatsPerBar)+sc.bars)*C.beatsPerBar;engEndSnap(sc);engPlanNote(sc);   /* AUTO: the end lands on a phrase boundary */
  if(sc.from==='dot'&&E.dot){sc.ox=E.dot[0];sc.oy=E.dot[1];}
  sc.fz=sc.p.fz;sc.fp=sc.p.fp;sc.fs=sc.p.fs;
  const real=sc.mods;sc.mods=Object.assign({},real,{mirror:1,kaleido:1,rot:1});if(def.init)def.init(sc,E);   /* the geometry layers the scene refuses (its init strips them): your mix respects that too */
  sc.ban=['mirror','kaleido','rot'].filter(k=>!sc.mods[k]);sc.mods=real;for(const k of sc.ban)delete real[k];E.sc=sc;E.prevExit=sc.from;engMixTick('scene');
  E.hist.push({id:def.id,p:sc.p0,seed:sc.seed,mods:sc.mods,fp:sc.fp,n:sc.n,bars:sc.bars,energy:def.energy});if(E.hist.length>400)E.hist.shift();
  const ml=Object.keys(sc.mods).map(k=>ENG_MODS.find(m=>m[0]===k)[1]);
  engLog((sc.tag?sc.tag+': ':'')+def.name+' #'+sc.n+', '+def.say(sc)+', '+sc.bars+(sc.bars>1?' bars':' bar')+(ml.length?' · '+ml.join(', '):'')+(sc.think?' · thinks: '+sc.think:'')+(E.lvl!=null?' · level '+E.lvl.toFixed(2):''));   /* AUTO */
  /* DESK hook: why each scene came (the last 200), the log line of the decision before it when it is the same moment */
  {const W=E.why||(E.why=[]),L=E.log,n=L.length,pre=s=>String(s).replace(/^\S+ bar \d+ · /,''),a=L[n-1]||'',b=L[n-2]||'';W.push({t:E.t,scene:def.id,why:pre(a)+(b&&b.split(' · ')[0]===a.split(' · ')[0]?' ← '+pre(b):'')});if(W.length>200)W.shift();}
  /* novelty budget: if the last few were predictable, rare scenes and layers get a boost */
  const last=E.hist.slice(-C.novelN),dist=new Set(last.map(x=>x.id)).size,nv=last.length>=C.novelN&&dist<=C.novelMin;
  if(nv!==E.novel){E.novel=nv;if(nv)engLog('predictable lately: rare scenes and layers get a boost');}}
/* weighted choice among the scenes that can follow state st (directly, or over a bridge) */
function engChoose(st,filter){const E=ENG,A=EAR,ph=engPhase();   /* the choice itself is CONDUCTOR.choose; here only what the scenes are and how a bridge is made */
  const pool=engPool().map(id=>{const d=ENG_SCENE[id],c=window.INF_SCENES&&INF_SCENES.local(55,id),b=c?INF_SCENES.cand(c,{local:true}):{key:id,energy:d.energy,role:d.role,w:d.w,cover:d.cover};   /* the candidate is the scene's card (scenes.js) */
    return Object.assign(b,{wx:engDeskW(id),sparse:id==='arrivals'?[6,.15]:null,def:d});});   /* DESK hook: favour ×2.5, ♥ ×2 */
  const o=CONDUCTOR.choose(pool,{target:engWant(),recent:E.hist.slice(-3).map(h=>h.id),phase:ph,parts:engParts(),sparse:engSparse(),novel:E.novel,rng:E.R,filter:filter&&(c=>filter(c.def)),
    bridge:(c,R)=>{const def=c.def;if(def.entry.includes(st))return;let via;if(def.entry.includes('dot'))via='iris';else if(def.entry.includes('dark'))via=R()<.6?'dissolve':'blackout';else return null;return{via,mul:ENG_CFG.bridgeW};}});
  return o&&{id:o.key,w:o.w,via:o.via};}/* how to cut between two scenes that fit: hard on kicks and drops, softer when it is calm */
function engStyle(next){const A=EAR,E=ENG;   /* clean thresholds: never two scenes mixed (CONDUCTOR.style: hard on kicks and drops, softer when it is calm) */
  return CONDUCTOR.style({phase:engPhase(),e:A.gen?E.arc:A.energy,rng:E.R,morph:!!(E.forceMorph&&next&&E.sc&&engMorphable(E.sc.def.id,next.def.id))});}   /* two line shapes: one flows into the other */function engNext(why){const E=ENG,C=ENG_CFG,A=EAR,st=E.sc?E.sc.exit:'dark';
  const th=E.sc&&E.sc.then;if(th&&E.calmBars){E.sc.then=null;engLog('desk: Calm, the story hand-over to '+ENG_SCENE[th.id].name+' is dropped');}   /* DESK hook: a Calm is never overridden by a hand-off */
  else if(th&&engDeskOff(th.id)&&!ENG_LOCK){E.sc.then=null;engLog('desk: '+ENG_SCENE[th.id].name+' is switched off, the story stops here');}   /* DESK hook: a switched-off scene does not come in through a hand-off either */
  else if(th){E.sc.then=null;E.loop=null;E.canon=-1;engLog('the story goes on: '+E.sc.def.name+' → '+ENG_SCENE[th.id].name);engGo(engMake(th.id,th),th.style||'xfade');return;}   /* a scene with a story hands over to its next part (Merger → Black hole) */
  if(E.loop&&!engPool().includes(E.loop.id)){E.loop=null;engLog('desk: the looped scene is switched off, the loop stops');}   /* DESK hook */
  if(E.loop){const L=E.loop;if(L.rep<L.max){L.rep++;const m=engMutate(L);L.p=m.p;L.mods=m.mods;   /* loop when the music loops: the same phrase again, changed a little more each time */
      const sc=engMake(L.id,{p:m.p,seed:L.seed,mods:m.mods,bars:L.bars,from:L.from,tag:'loop '+L.rep+'/'+L.max+' ('+m.what+')'});L.mods=sc.mods;engGo(sc,'cut');return;}
    E.loop=null;engLog('loop played out');}
  if(E.canon<0&&(E.canonReq||st==='dark'&&engPool().length>1&&!engSet().length&&E.R()<C.canonP)){   /* one cycle decision each time it is dark */E.canon=0;E.canonReq=false;engLog('the full cycle, intact this time');}
  if(E.canon>=0){if(E.canon<C.canon.length){const[id,force]=C.canon[E.canon++],def=ENG_SCENE[id];
      const sc=engMake(id,{force,from:def.entry.includes(st)?st:def.entry[0],tag:'cycle '+E.canon+'/'+C.canon.length});
      if(def.entry.includes(st))engGo(sc,E.canon===1?'cut':'xfade');else engBridge(def.entry.includes('dot')?'iris':'dissolve',sc);return;}
    E.canon=-1;}
  {const pn=engPlanTake();if(pn&&engPlanGo(pn,st))return;}   /* AUTO: the change the song map planned (swell / soft / anchor / outro / vary), else the normal choice */
  if(!E.calmBars&&E.hist.length>C.histN+2&&E.R()<C.callbackP){   /* a callback: an earlier moment of this show, changed a little */
    const ph=engPhase(),old=E.hist.slice(0,-C.histN).filter(h=>ENG_SCENE[h.id].entry.includes(st)&&engPool().includes(h.id)&&(engPool().length===1||ENG_SCENE[h.id].role.includes(ph)));
    if(old.length){const h=old[Math.floor(E.R()*old.length)],m=engMutate(h);engGo(engMake(h.id,{p:m.p,seed:h.seed,mods:m.mods,from:st,tag:'callback to #'+h.n}),engStyle());return;}}
  const rest=E.rest>0,mf=E.forceMorph?def=>C.morphOk.includes(def.id):null,calmF=E.calmBars?def=>ENG_QUIET.includes(def.id):rest||A.brk?def=>def.energy<=.3:null;
  const o=engChoose(st,def=>(!mf||mf(def))&&(!calmF||calmF(def)))||(mf&&engChoose(st,mf))||engChoose(st);if(o&&E.forceMorph&&o.via&&engMorphable(E.sc?E.sc.def.id:'',o.id))o.via=null;   /* a morph needs no bridge */if(!o){engGo(engMake(engPool()[0],{from:st}),'cut');return;}
  const def=ENG_SCENE[o.id],sc=engMake(o.id,{from:o.via?C.trTo[o.via]:def.entry.includes(st)?st:def.entry[0],tag:rest?'rest':A.brk?'restraint':''});if(rest)E.rest=0;if(E.calmBars){sc.bars=E.calmBars;E.calmBars=0;sc.noSnap=true;}   /* DESK hook: Calm lasts as many bars as asked */
  if(o.via){engBridge(o.via,sc);return;}const sty=engStyle(sc);   /* calm: strip down to a dot or to black first, then the new scene */
  if(sty==='strip'){if(def.entry.includes('dot')){engBridge('iris',sc);return;}if(def.entry.includes('dark')){engBridge('dissolve',sc);return;}}
  engGo(sc,sty==='strip'?'black':sty);}
function engMutate(L){const def=ENG_SCENE[L.id],p=Object.assign({},L.p),mods=Object.assign({},L.mods),R=ENG.R,ks=Object.keys(def.params).filter(k=>!['fz','fp','fs'].includes(k));
  const k=ks[Math.floor(R()*ks.length)],sp=def.params[k],one=engRoll({[k]:sp},R)[k];p[k]=Array.isArray(sp)?p[k]+(one-p[k])*.35:one;
  const m=ENG_MODS[Math.floor(R()*6)][0];if(mods[m])delete mods[m];else mods[m]=m==='rot'?1+Math.floor(R()*3):1;
  return{p,mods,what:k+' changed, '+(mods[m]?'+ ':'− ')+ENG_MODS.find(x=>x[0]===m)[1].toLowerCase()};}
/* shape morphs (the point-cloud method of three.js / TouchDesigner transitions; flubber's equal-count + aligned-start idea): the lit LEDs
   of the old picture and of the new one, sorted by their angle round the centre and taken at equal steps, pair up by rank; each old point
   flies to its partner, eased in and out, the points leaving one after another round the circle; the last quarter the real new scene comes in */
function engMorphable(a,b){const L=ENG_CFG.morphOk;return L.includes(a)&&L.includes(b);}   /* the morph itself is LOOK.tr.morph */
/* start a scene: a hard cut, a cut with one white frame, a cut with half a beat inverted, or a dithered crossfade over a bar
   (the outgoing scene keeps drawing while the new one takes over LED by LED) */
function engGo(sc,style){const E=ENG,C=ENG_CFG,old=E.sc;
  if((style==='xfade'||style==='flicker'||style==='morph')&&old&&!E.tr){const mA=style==='morph'?LOOK.tr.morphPts(E.lay,E.N,HOUSE.fixed.morphK):null;if(mA)engLog('morph: '+old.def.name+' flows into '+sc.def.name);   /* morph: the old shape's points, taken now */
    engBegin(sc);E.tr={type:'xfade',mode:style,b0:E.beat,b1:E.beat+LOOK.tr.pickBars(style,E.R)*C.beatsPerBar,out:old,mA};return;}
  if(style==='strobe'&&engFlash(E.t,.8))E.ev={type:'strobe',f:0};else if(style==='flip')E.ev={type:'invert',b1:LOOK.tr.enter('flip',E.beat).until};
  else if(style==='black'){E.ev={type:'screen',v:0,b1:LOOK.tr.enter('black',E.beat).until};E.out.fill(0);}   /* a hard cut through half a beat of black */
  engBegin(sc);}
function engBridge(type,next){const E=ENG,C=ENG_CFG,bars=LOOK.tr.pickBars(type,E.R),sc=E.sc;
  E.tr={type,b0:E.beat,b1:E.beat+bars*C.beatsPerBar,ox:Math.round(sc?sc.ox:(E.N-1)/2),oy:Math.round(sc?sc.oy:(E.N-1)/2),next};
  engLog((sc?sc.exit:'dark')+' → '+type+(bars?' over '+bars+(bars>1?' bars':' bar'):', a cut on the bar')+' → '+C.trTo[type]);if(!bars)engTrEnd();}
function engTrEnd(){const E=ENG,tr=E.tr;E.tr=null;if(tr.type==='xfade')return;const st=ENG_CFG.trTo[tr.type];if(st==='dot')E.dot=[tr.ox,tr.oy];if(tr.type==='blackout')LOOK.tr.blackout(E.out);
  if(tr.next){tr.next.from=st;engBegin(tr.next);}else engNext('bridge');}
/* a bridge works on whatever the outgoing scene still draws: the iris shrinks it into one LED, the dissolve takes LEDs away in random order */
function engTr(tr){const E=ENG,N=E.N,L=E.lay,p=Math.min(1,(E.beat-tr.b0)/Math.max(1e-6,tr.b1-tr.b0));
  if(tr.type==='dissolve')LOOK.tr.dissolve(L,N*N,p,E.rank);else if(tr.type==='iris')LOOK.tr.iris(L,N,p,tr.ox,tr.oy,E.tmp);}
/* white flashes share the other shows' gate: at most 3 a second (photosensitive-epilepsy limit) */
/* BAM on the drop: a white square flies out of the middle and fills the panel in bamFly s, then the white fades over bamBeats while
   the drop scene comes through */
function engBam(){const E=ENG,C=ENG_CFG,B=E.bam;if(!B)return;const N=E.N,c=Math.round((N-1)/2),age=E.t-B.t0,a=age/C.bamFly,f=(age-C.bamFly)/(C.bamBeats*60/E.bpm);
  if(age<0)return;   /* DESK hook: BAM after a black frame */
  if(B.flash){if(age>=.14){E.bam=null;return;}engFill(0,0,N-1,N-1,1-age/.14*.5,C.white);return;}   /* DESK hook: "white flash" = one short full-panel white frame, no flying square */
  if(f>=1){E.bam=null;return;}
  if(a<1)engSq(c,c,Math.round(c*1.05*engEaseOut(a)),1,1,1,true);else engFill(0,0,N-1,N-1,Math.pow(1-f,2),C.white);}
function engFlash(t,s,drop){if(FEEL.get('flash')<.01||window.DESK&&!engDeskFlash(drop))return false;   /* DESK hook: the flashes master */return typeof tsGate==='function'?tsGate(t):true;}
/* a drop: a global event on the downbeat, then a hard cut to a high-energy scene */
function engDrop(){const E=ENG,C=ENG_CFG,A=EAR,R=E.R;
  MUSIC.snapDownbeat();   /* the drop is the new downbeat (the ear already did it for its own drops) */
  const dr=window.DESK?engDeskRule():null,   /* DESK hook: the hit (white / black / black then white / none), must-change and scene for this drop */
    bam=!(dr&&(dr.hit==='black'||dr.hit==='none'))&&engFlash(E.t,1,!!dr),type=(A.dropPre?'out of the black, ':'')+(bam?(dr&&(dr.hit==='flash'||dr.hit==='bw')?'a white flash':'BAM, a white square flies out and fills the panel'):dr&&dr.hit==='none'?'no hit (the desk)':'full black');E.out.fill(0);   /* BAM (a full white screen), or black when flashes are off */
  E.ev=bam||A.dropPre?null:{type:'screen',v:0,b1:E.beat+C.dwScreenBeats};E.bam=bam?{t0:E.t,flash:!!(dr&&dr.hit==='flash')}:null;
  if(dr&&dr.hit==='none'){E.ev=null;E.bam=null;}else if(dr&&dr.hit==='bw'){E.ev={type:'screen',v:0,b1:E.beat+C.dwScreenBeats};E.bam=bam?{t0:E.t+C.dwScreenBeats*60/E.bpm,flash:true}:null;}   /* DESK hook */
  E.loop=null;E.canon=-1;E.tr=null;E.dropKick=1;E.rest=0;E.calmBars=0;E.lastSw=E.beat;E.phr0=E.beat;   /* AUTO: a drop starts a new phrase count */
  if(dr&&dr.keep&&!dr.scene&&E.sc){engLog('DROP → '+type+', the desk keeps the picture ('+E.sc.def.id+')');return;}   /* DESK hook: "keep the picture" chosen for this drop */
  const pool=engPool(),mk=ENG_LOCK?[]:engMarked('drop'),hot=mk.length?mk:pool.filter(id=>ENG_SCENE[id].role.includes('drop')),cur=E.sc?E.sc.def.id:null,dsc=dr&&!mk.length?engDeskDropScene(dr,pool):null,   /* your drop scenes win; DESK hook: the desk's own scene, and "must change" */
    list=engDeskNot(hot.length?hot:pool,dr,cur),mem0=dsc||mk.length?null:engRecall('drop',A.cM),mem=dr&&dr.mustChange&&mem0&&mem0.id===cur?null:mem0;   /* a drop like an earlier one: the same scene */
  const sq=!dsc&&!mem&&!mk.length&&pool.includes('rings')&&!(dr&&dr.mustChange&&cur==='rings')&&(!E.drops||R()<.5);E.drops=(E.drops||0)+1;   /* the first drop of a song, and half the others: squares shoot out on the bass */
  const id=dsc||(mem?mem.id:sq?'rings':list[Math.floor(R()*list.length)]),m=mem&&engMutate({id,p:mem.p0,mods:mem.mods});
  const nb=['inversion','accumulation','puncture'].includes(id)?C.whiteDrop:R()<.5?8:16,nsc=engMake(id,mem?{p:m.p,seed:mem.seed,mods:m.mods,from:ENG_SCENE[id].entry[0],bars:nb,tag:'drop'}:{from:ENG_SCENE[id].entry[0],bars:nb,tag:'drop',force:sq?{dir:1,shape:0,heavy:1,frame:0}:null});   /* a white drop scene lasts only as long as white may */
  engLog('DROP → '+type+(mem?', like the drop of #'+mem.n+' (harmony '+mem.r.toFixed(2)+')':''));engGo(nsc,'cut');if(!mem&&A.cM)engRemember(nsc,'drop',A.cM);
  if(!E.anchor&&E.sc&&E.sc.def.id===id&&engPlan())E.anchor={id,p:E.sc.p0,seed:E.sc.seed,mods:E.sc.mods};}   /* AUTO: this song's first drop scene, the anchor that comes back after a breakdown */
/* a new section (an instrument in or out, a new melody), on the next bar line: something serious changes. A scene with a shape keeps its
   look and changes shape (and its other key settings); the others cut to a new scene, a louder one when something came in, a different
   one when something left or the melody turned. Every time one geometry layer flips, the frame flashes or inverts and a square shockwave
   runs through the panel. With one scene chosen by hand it always changes shape. */
function engOther(s,v,R){if(s.pick||s.int){const o=s.pick?[...new Set(s.pick)]:Array.from({length:s.int[1]-s.int[0]+1},(_,i)=>s.int[0]+i),q=o.filter(x=>x!==v);return q.length?q[Math.floor(R()*q.length)]:v;}
  if(Array.isArray(s)){const m=(s[0]+s[1])/2;return v<m?m+(s[1]-m)*R():s[0]+(m-s[0])*R();}   /* a number: the other half of its range */
  return typeof v==='boolean'?!v:v;}
function engFlipGeo(mods,R){const g=['mirror','kaleido','rot'][Math.floor(R()*3)];
  if(mods[g])delete mods[g];else{mods[g]=g==='rot'?1+Math.floor(R()*3):1;delete mods[g==='kaleido'?'mirror':g==='mirror'?'kaleido':'']; }return g;}
/* a switch candidate (a new section, the sound falling away, instruments coming in) waits for the next bar line; a second detector in
   that bar makes it big; after any switch (or drop) the director rests swCool bars */
function engCand(cd){const E=ENG,q=E.secReq;if(E.planRef)return;   /* AUTO: with a plan the song map knows the sections, live candidates switch nothing */if(CONDUCTOR.cooling(E.beat,E.lastSw))return;
  if(q){if(!q.srcs.includes(cd.src)){q.srcs.push(cd.src);q.big=true;q.score+=cd.score;if(cd.kind==='fall'){q.kind='fall';q.what=cd.what;}}return;}
  E.secReq=Object.assign({},cd,{srcs:[cd.src]});}
function engSection(s){const E=ENG,C=ENG_CFG,A=EAR,R=E.R,sc=E.sc;if(!sc||E.beat-A.lastDrop<C.secAfterDrop*C.beatsPerBar)return;   /* a drop just said it */
  E.loop=null;E.canon=-1;E.tr=null;E.rest=0;E.hiBars=0;E.phr0=Math.round(E.beat/C.beatsPerBar)*C.beatsPerBar;   /* AUTO: a new section starts a new phrase count */
  const def=sc.def,pool=engPool(),big=s.big||s.score>=C.secBig,what=s.what||{in:'something comes in',out:'something drops out',melody:'the melody turns'}[s.kind];E.lastSw=E.beat;
  const mem=engRecall('section',A.cF),morph=!mem&&pool.includes(def.id)&&(pool.length===1||(!!def.params.shape&&R()<C.secMorph));   /* DESK hook: a switched-off scene is not kept */let nsc;
  if(mem){const m=engMutate({id:mem.id,p:mem.p0,mods:mem.mods});nsc=engMake(mem.id,{p:m.p,seed:mem.seed,mods:m.mods,from:ENG_SCENE[mem.id].entry[0],bars:R()<.5?8:16,tag:'section'});}   /* a passage that came before: its scene again */
  else if(morph){const p=Object.assign({},sc.p0);for(const k of def.key)p[k]=engOther(def.params[k],p[k],R);let think='';
    const sp=def.params.shape;if(sp&&sp.pick){const th=engThink([sc.p.shape]),k=th.list.find(q=>sp.pick.includes(q));if(k!=null){p.shape=k;think=th.why+(k!==th.k?' (here a '+ENG_SHAPES[k]+')':'');}}   /* the new part: thought again */
    const mods=Object.assign({},sc.mods);engFlipGeo(mods,R);nsc=engMake(def.id,{p,mods,from:sc.from,bars:R()<.5?8:16,tag:'section',think});}
  else{const e=def.energy,ok=id=>id!==def.id&&(A.brk?ENG_SCENE[id].energy<=.3:s.kind==='fall'?ENG_SCENE[id].energy<e-.1:s.kind==='in'?ENG_SCENE[id].energy>e+.1:Math.abs(ENG_SCENE[id].energy-e)>.15);
    let list=pool.filter(ok);if(!list.length)list=pool.filter(id=>id!==def.id);if(!list.length)list=pool;
    const ph=engPhase(),fit=list.filter(id=>ENG_SCENE[id].role.includes(ph));if(fit.length)list=fit;   /* the role that fits the phase */
    const id=s.kind!=='in'&&engSparse()&&list.includes('arrivals')?'arrivals':list[Math.floor(R()*list.length)],mods=engRollMods();engFlipGeo(mods,R);nsc=engMake(id,   /* it went sparse: what still plays makes the picture */{mods,from:ENG_SCENE[id].entry[0],bars:R()<.5?8:16,tag:'section'});}
  const r=R(),st=morph&&engMorphable(def.id,def.id)?'morph':big&&A.I>.6&&r<.4&&engFlash(E.t,1)?'strobe':'black';   /* a new shape of the same scene morphs; else a clean threshold: through black, a white flash only when big and loud */
  if(st==='strobe')E.ev={type:'strobe',f:0};else if(st==='black'){E.ev={type:'screen',v:0,b1:LOOK.tr.enter('black',E.beat).until};E.out.fill(0);}
  if(st!=='morph')E.shock={t0:E.t,dir:s.kind==='out'||s.kind==='fall'?-1:1,dur:60/E.bpm*(big?2:1.2),n:big?3:1};E.dropKick=Math.max(E.dropKick,s.kind==='out'?.3:.6);
  engLog('NEW SECTION: '+what+(s.srcs&&s.srcs.length>1?' ['+s.srcs.join(' + ')+']':'')+' ('+s.score.toFixed(2)+') → '+(mem?'the scene of #'+mem.n+' again (harmony '+mem.r.toFixed(2)+')':morph?'same scene, new shape':'a new scene')+', '+(st==='morph'?'morphing':st==='black'?'blackout':st==='flip'?'inverted':'white frame')+(big?', big':''));
  engGo(nsc,st==='morph'?'morph':'cut');if(!mem)engRemember(nsc,'section');}
/* once per bar: the song's features, loops, rests, restraint */
function engBar(E){const A=EAR,C=ENG_CFG;const bar=Math.floor(E.beat/C.beatsPerBar);
  if(E.memP&&A.cM)E.memP=E.memP.filter(q=>{if(E.beat<q.beat)return true;q.m.sig=Float32Array.from(A.cM);return false;});   /* the passage's harmony, two bars in */
  E.dropKick*=.6;
  const sc=E.sc;if(!sc)return;
  if(!E.tr&&!E.frozen&&sc.tag!=='locked'&&sc.tag!=='drop'&&!/^after the /.test(sc.tag)&&!engPool().includes(sc.def.id)&&sc.b1-E.beat>C.beatsPerBar){sc.then=null;sc.noHold=true;sc.b1=Math.ceil(E.beat/C.beatsPerBar)*C.beatsPerBar;engLog('desk: '+sc.def.name+' is switched off, it ends at the bar line');}   /* DESK hook: switching the playing scene off ends it, a story's hold too (Merger holds till they merge); a story's next part (tag 'after the …': Black hole, Morphology) is not in your pick but stays */
  E.hiBars=A.energy>.6&&sc.def.energy>.55?E.hiBars+1:Math.max(0,E.hiBars-1);
  if(E.hiBars>=C.restBars&&!E.rest){E.rest=C.restLen;E.hiBars=0;engLog('long loud stretch: a rest, whatever the music does');sc.b1=Math.min(sc.b1,E.beat+C.beatsPerBar);}
  if(E.loop&&!A.gen&&(A.rep<C.repOff||A.brk!==E.loop.brk)){E.loop=null;engLog('the music changed: the loop breaks');if(!E.tr)sc.b1=E.beat;}
  else if(!E.loop&&!E.tr&&!A.gen&&E.canon<0&&A.repRun>=2&&!sc.def.untilDone&&!sc.def.noLoop&&!sc.tag.startsWith('loop')&&sc.tag!=='drop'&&sc.tag!=='section'&&E.R()<C.loopP){   /* drops and new sections are one-off moments, never looped */const bars=E.R()<.5?4:8;
    if(bar-Math.floor(sc.b0/C.beatsPerBar)>=bars&&sc.b1-E.beat>C.beatsPerBar){E.loop={id:sc.def.id,p:sc.p0,seed:sc.seed,mods:sc.mods,bars,from:sc.from,rep:0,brk:A.brk,
        max:C.loopMax[0]+Math.floor(E.R()*(C.loopMax[1]-C.loopMax[0]+1))};
      engLog('the music repeats ('+A.rep.toFixed(2)+'): loop its first '+bars+' bars ×'+E.loop.max);sc.b1=Math.ceil(E.beat/C.beatsPerBar)*C.beatsPerBar;}}
  if(A.brk&&!E.planRef&&sc.def.energy>.3&&!E.tr&&sc.tag!=='drop'&&sc.tag!=='section'&&sc.b1-E.beat>C.beatsPerBar){sc.b1=Math.ceil(E.beat/C.beatsPerBar)*C.beatsPerBar;}   /* breakdown: restraint, at the next bar */
  if(E.rest>0&&sc.tag==='rest')E.rest--;}


/* ----- output -----
   feedback (engFeedback, the Director's own tunnel under the scenes) → LOOK.post (look.js, the ONE finishing chain: breathing → the beat before a change pulls in and dims →
   Feel → the hooks below (this show's glitch / inversion / tint, its white-screen rule) → darkness floor → brightness → gamma → white cap → power limit) → the sim texture and,
   if on, LOOK.hwSend (temporal dithering to 8 bits, out to WLED). Every number is House (house-style.js). */
function engFeedback(dts){const E=ENG,N=E.N,sc=E.sc,C=ENG_CFG,A=EAR,O=E.out,F=E.fb,L=E.lay,st=Math.floor(E.beat/sc.fs);  let keep=engModOn('nofb')?0:sc.fp*S.engFb*(A.gen?1:.4+1.2*A.rev)*(1+engIxL());if(!engClimax())keep=Math.min(keep,Math.pow(HOUSE.val.echoFade,sc.fs)*(1+engIxL()));   /* the intensity slider: more or fewer echoes */   /* echoes fade to black within a beat, except at a climax */   /* dry sound sits on the surface, a long tail goes deep */
  if(st!==E.fbStep){E.fbStep=st;F.fill(0);
    if(keep>0){const z=Math.min(.97,sc.fz-.06*A.rev),cx=sc.ox+(A.gen?0:A.bal*N*.15),cy=sc.oy;   /* reverb pulls deeper, the stereo balance moves the centre */
      E.spin=(E.spin||0)*.9+(A.gen?0:(1-A.corr)*C.drift);const ca=Math.cos(E.spin),sa=Math.sin(E.spin);   /* phase activity: a slow turn */
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=(y*N+x)*3;if(O[j]+O[j+1]+O[j+2]<HOUSE.fixed.fbFloor)continue;const dx=x-cx,dy=y-cy;
        const xx=Math.round(cx+(dx*ca-dy*sa)*z),yy=Math.round(cy+(dx*sa+dy*ca)*z);if(xx<0||yy<0||xx>=N||yy>=N)continue;const k=(yy*N+xx)*3;
        for(let ch=0;ch<3;ch++){const v=O[j+ch]*Math.min(.92,keep);if(v>F[k+ch])F[k+ch]=v;}}}}
  else{const fl=HOUSE.fixed.fbFloor*dts*HOUSE.fixed.fbRef;for(let j=0;j<F.length;j++)F[j]=Math.max(0,F[j]-fl);}
  const du=1-(1-HOUSE.val.duckTo)*(.4+.6*A.I)*Math.exp(-Math.max(0,E.t-(E.duckT||-9))/HOUSE.val.duckS);   /* the ghosts duck on the kick */
  for(let j=0;j<O.length;j++)O[j]=L[j]+F[j]*du*(1-L[j]);}
/* what LOOK.post needs from the Director, once per frame. The hooks are its own: glitch / inversion / cold tint (engOutMods) and the white-screen rule (engWhite) */
function engLookCtx(t){const E=ENG,C=ENG_CFG,A=EAR,c=E.look||(E.look={scene:W=>engOutMods(W),rules:W=>engWhite(W,E.look.t),voidTarget:engVoidTarget,voidSkip:engVoidSkip,feel:true,levels:[0,0,0],st:{}});
  const q=engAntQ();E.antQ=q;c.t=t;c.hz=E.hz;c.ph=E.ph;c.ant=q;c.duty=E.duty;c.up=E.up;c.cgam=S.cgam;c.st=c.st||{};
  c.level=c.levels;c.levels[0]=1+.9*engIxL();c.levels[1]=C.iBright[0]+C.iBright[1]*Math.max(E.lvl==null?EAR.I:.5*EAR.I+.5*E.lvl,E.sc&&E.sc.def.lit||0);c.levels[2]=E.fadeQ;   /* soft music is dimmer too, but a scene with a floor (Arrivals, the black holes) stays clearly visible */
  return c;}
function engPost(t){const E=ENG,N=E.N,W=E.W;
  if(E.rawOut)return;   /* a VJ clip drives the Director and finishes the picture itself (vj-runtime.js, LOOK.post with this show's engLookCtx) */
  W.set(E.out);const R=LOOK.post(W,N,N,engLookCtx(t));E.lim=R.lim;E.amps=R.amps;E.lit=R.lit;
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,E.tex);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,N,N,gl.RGBA,gl.FLOAT,E.up);gl.activeTexture(gl.TEXTURE0);
  if(S.engHw)LOOK.hwSend(E.hw,E.duty,E.err,N,{ip:S.engIp,port:ENG_CFG.hwPort,wire:S.engWire,origin:S.engOrigin});}
/* ----- DESK hooks: helpers for window.DESK (desk-core.js), the desk that steers the director. Nothing here runs without it ----- */
const engSongT=()=>CONDUCTOR.songT();   /* seconds into the song file, or null (live sound, paused) */
function engDeskCfg(){const D=window.DESK,E=ENG;if(!D||!D.directorConfig)return null;if(!E.dkOn){E.dkOn=true;if(D.on)D.on('change',()=>{E.dkCfg=null;});}
  if(!E.dkCfg){try{E.dkCfg=D.directorConfig();}catch(e){E.dkCfg=null;if(!E.dkErr){E.dkErr=1;console.warn('desk: directorConfig failed',e);}}}return E.dkCfg;}   /* read again only when the desk says it changed */
function engDeskApply(cfg){const C=ENG_CFG,E=ENG,d=cfg.darkness||{},p=cfg.palette||{};E.dkApplied=cfg;E.dkEo=((cfg.energy==null?50:cfg.energy)-50)/200;
  E.dkVoid={black:d.normal!=null?d.normal/100:null,climax:d.climax!=null?d.climax/100:null};   /* how much of the panel stays dark (the desk wins over House while it is on) */
  /* the palette: with accent colours, the two cold tints become the first two accents; monochrome gives the house tints back */
  const rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return null;const n=parseInt(m[1],16),c=[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255],mx=Math.max(...c),mn=Math.min(...c);return mx>.4&&(mx-mn)/mx>.3?c.map(v=>v/mx):null;};
  const acc=(p.colours||[]).map(rgb).filter(Boolean);C.cold=!/^mono/i.test(p.rule||'')&&acc.length?[acc[0],acc[1]||acc[0]]:null;}
function engDeskPool(l){const D=window.DESK;if(!D||!D.sceneWeight)return l;const o=l.filter(id=>D.sceneWeight(id)>0);return o.length?o:l;}
function engDeskW(id){const D=window.DESK;if(!D||!D.sceneWeight)return 1;const w=D.sceneWeight(id);return w>0||ENG_ORDER.some(x=>D.sceneWeight(x)>0)?w:1;}   /* every scene off: the pool falls back to all of them, so they all weigh 1 again */
function engDeskOff(id){return !!(window.DESK&&DESK.sceneWeight&&engDeskW(id)===0);}   /* a scene switched off on the desk (or avoided by the style) */
function engDeskPace(b,id){const c=engDeskCfg();if(!c||!c.paceBars||ENG_STORIES.includes(id))return b;   /* a story keeps its own (already long) length */return Math.max(1,Math.round(b*Math.max(.5,Math.min(4,c.paceBars/8))));}
function engDeskFlash(drop){const c=engDeskCfg();if(!c||c.flashes==null||c.flashes>=70)return true;if(c.flashes<=0)return false;if(drop)return true;const E=ENG;E.dkFq=(E.dkFq==null?1:E.dkFq)+c.flashes/70;if(E.dkFq>=1){E.dkFq-=1;return true;}return false;}   /* 70 is the default master: every flash; less = a share of them, 0 = none */
function engDeskRule(){const D=window.DESK;if(!D||!D.dropRule)return null;let r;try{const t=engSongT();r=D.dropRule(t==null?-1e9:t);}catch(e){return null;}
  const h=String(r.hit||'').toLowerCase();let k=/none/.test(h)?'none':/black/.test(h)?(/white|flash/.test(h)?'bw':'black'):/square|fl(y|ies)|bam/.test(h)?'white':/flash/.test(h)?'flash':'white';   /* white = the BAM (a white square flies out), flash = one short white frame, bw = black frame then white flash */
  if(k==='flash'){try{if(D.preset&&(D.preset()||{}).id==='director')k='white';}catch(e){}}   /* the "Director default" style is what the Director does by itself: its BAM */
  return Object.assign({},r,{hit:k});}
function engDeskNot(l,dr,cur){if(!dr||!dr.mustChange||l.length<2)return l;const o=l.filter(x=>x!==cur);return o.length?o:l;}
function engDeskDropScene(dr,pool){if(dr.scene&&ENG_SCENE[dr.scene])return dr.scene;const c=engDeskCfg(),cur=ENG.sc?ENG.sc.def.id:null;
  let l=((c&&c.drop&&c.drop.scenes)||[]).filter(x=>ENG_SCENE[x]&&pool.includes(x));if(dr.mustChange&&l.some(x=>x!==cur))l=l.filter(x=>x!==cur);return l.length?l[Math.floor(ENG.R()*l.length)]:null;}
/* every frame, once the bar is handled: the live phase (as a section kind), the config when it changed, then the strip gains on the ears */
function engDeskTap(t){const D=window.DESK,E=ENG,A=EAR,C=ENG_CFG;try{const c=engDeskCfg();if(c&&E.dkApplied!==c)engDeskApply(c);const st=engSongT(),ph=engPhase();
  if(D.setPhase)D.setPhase(ph==='build'?'build':ph==='calm'?'breakdown':E.beat-A.lastDrop<C.whiteDrop*C.beatsPerBar?'drop':'groove');
  if(typeof D.dropDue==='function'){const pt=E.dkPrevT;E.dkPrevT=st;   /* a drop of the song map crossed since the last frame (not after a seek): the Director drops, with the desk's rule */
    if(st!=null&&pt!=null&&st>pt&&st-pt<1&&D.dropDue(pt,st)&&E.beat-A.lastDrop>8&&!E.frozen&&!ENG_LOCK){E.dropReq=true;E.dkSong=true;}}
  if(D.tapEars)D.tapEars(A,A,st,t);if(st!=null&&E.sc&&D.record)D.record(st,E.sc.def.id);}catch(e){if(!E.dkErr){E.dkErr=1;console.warn('desk: tap failed',e);}}}
function engDeskOverlay(t,id){const E=ENG,N=E.N;try{let a=E.dkApi;if(!a)a=E.dkApi={put:(x,y,v)=>engPutXY(x,y,v,ENG_CFG.white),flash:t=>engFlash(t,1),
    get:(x,y)=>{const n=ENG.N;x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=n||y>=n)return 0;const j=(y*n+x)*3,L=ENG.lay;return Math.max(L[j],L[j+1],L[j+2]);}};
  a.N=N;DESK.overlay(a,t,id);}catch(e){if(!E.dkErr){E.dkErr=1;console.warn('desk: overlay failed',e);}}}

/* ----- AUTO (AUTO PLAN.md): the phrase clock and the changes the song map plans. With a song file and DESK.plan() every scene end lands on a
   phrase boundary of the map and each planned change gets its own transition; without them (live sound, no Desk) the phrase clock counts
   phraseBars bars from E.phr0 (the last section / drop / start). Everything is guarded: no Desk, no plan = the Director as before ----- */
const engPlan=()=>CONDUCTOR.plan();   /* the plan while a song file plays, else null */
function engPlanSync(dts){const E=ENG,P=engPlan();E.planRef=P;
  if(P&&P!==E.planSong){E.planSong=P;E.planNext=null;E.planKey=null;E.anchor=null;E.opening=null;E.outroOn=false;engLog('plan: the song map steers ('+P.entries.length+' planned changes)');}   /* a new song: anchor and opening forgotten */
  const st=P&&engSongT();E.fadeQ=P&&E.outroOn&&st!=null&&st>P.dur-P.bar?Math.max(0,(P.dur-st)/P.bar):1;   /* the outro fades to black in the song's last bar (engPost) */
  if(P&&(P!==E.rsPlan||(CONDUCTOR.take|0)!==E.rsTake)){E.rsPlan=P;E.rsTake=CONDUCTOR.take|0;E.R=engRng(CONDUCTOR.songSeed((window.DESK.map||{}).id,P.dur));engLog('seed: this song, take '+E.rsTake);}   /* AUTO: a new song (or New seed): the dice start from the song's own seed, so the same song gives the same show */
  engLvl(dts);}
/* AUTO: the level, the energy a scene should have, the phrase lines and the planned changes are CONDUCTOR's (conductor.js). Here: what to hand it, and what to do with the answer.
   E.lvl = CONDUCTOR.lvl every frame: with a plan the song map's level, live the loudness / density plus a share of the build; E.tgtS = the older target energy, smoothed */
function engLvl(dts){const E=ENG,P=E.planRef;CONDUCTOR.frame(dts,Object.assign(engIn(),{planLevel:P?CONDUCTOR.planLevel(engSongT()):null}));E.lvl=CONDUCTOR.lvl;E.tgtS=CONDUCTOR.tgtS;}
const engWant=()=>CONDUCTOR.want(engIn());
/* engBegin: the scene's end snaps to a phrase (>= the shortest hold); a section of the plan inside or just behind its span ends it; not Calm, loops, locked, drops, rests, stories */
function engEndSnap(sc){const E=ENG,bpb=ENG_CFG.beatsPerBar;
  if(sc.endB==null&&(sc.noSnap||ENG_LOCK||sc.def.untilDone||/^(locked|drop|rest|restraint|loop)/.test(sc.tag||'')))return;
  const P=E.planRef,r=CONDUCTOR.endSnap({b0:sc.b0,b1:sc.b1,beat:E.beat,bpm:E.bpm,bpb,phr0:E.phr0,plan:P,st:P&&engSongT(),endB:sc.endB});sc.b1=r.b1;sc.bars=r.bars;}
function engPlanNote(sc){const E=ENG,P=E.planRef,st=P&&engSongT();E.planNext=null;   /* a scene began: the planned change is used up; the opening scene of the song is remembered for the outro */
  if(P&&st!=null&&!E.opening&&sc.tag!=='outro'&&st<=P.t0+4*P.bar)E.opening={id:sc.def.id,p:sc.p0,seed:sc.seed,mods:sc.mods};}
/* once per bar: the next planned change about planAhead bars ahead -> the scene ends on its bar line, engNext handles its transition */
function engPlanTick(){const E=ENG,P=E.planRef,sc=E.sc;
  if(!P||!sc||E.tr||E.frozen||E.hold||ENG_LOCK||sc.tag==='locked'||sc.def.untilDone||sc.then||!DESK.nextChange)return;   /* a story with its own end (Merger...) is not cut */
  try{const st=engSongT(),r=CONDUCTOR.planTick({e:DESK.nextChange(st,CONDUCTOR.cfg.planAhead*P.bar),planKey:E.planKey,beat:E.beat,bpm:E.bpm,bpb:ENG_CFG.beatsPerBar,st,
      scene:{loop:E.loop,hold:sc.def.hold,story:ENG_STORIES.includes(sc.def.id),b1:sc.b1}});   /* vary only where the scene runs on through the phrase; a story keeps its hold */
    if(!r)return;E.planKey=r.key;engLog(r.log);if(!r.change)return;   /* the drop path does the drop; a build phrase changes nothing (the level carries it) */
    E.planNext=r.e;E.planB=r.eb;sc.b1=r.eb;sc.noHold=true;if(!r.keepLoop){E.loop=null;E.canon=-1;}}
  catch(x){if(!E.dkErr){E.dkErr=1;console.warn('desk: plan failed',x);}}}
function engPlanTake(){const E=ENG,e=E.planNext;E.planNext=null;return e&&!E.calmBars&&E.planRef&&Math.abs(E.beat-E.planB)<=ENG_CFG.beatsPerBar*1.01?e:null;}   /* only when the scene really ends at the planned bar */
/* the transition of a planned change (which scene fits, how it ends: CONDUCTOR.planKind / planEnd); false = nothing special, the normal choice follows */
function engPlanGo(e,st){const E=ENG,C=ENG_CFG,bpb=C.beatsPerBar,P=E.planRef,stT=engSongT(),tr=e.trans,pool=engPool(),cur=E.sc,K=CONDUCTOR.planKind(tr);if(!P||stT==null)return false;
  const endOf=()=>CONDUCTOR.planEnd(tr,{plan:P,st:stT,beat:E.beat,bpm:E.bpm,bpb,nextDropT:DESK.nextDropT?DESK.nextDropT(stT):null});
  try{const fr=def=>def.entry.includes(st)?st:def.entry[0],go=(sc,via,sty)=>{if(via)engBridge(via,sc);else engGo(sc,sty);return true;},
      mk=(f,tag)=>{const o=engChoose(st,f);if(!o)return null;const def=ENG_SCENE[o.id];return{o,sc:engMake(o.id,{from:o.via?C.trTo[o.via]:fr(def),tag})};};
    if(tr==='swell'){const r=mk(K.filter,K.tag);if(!r)return false;   /* a build scene, in softly, until the drop (+ 1 bar in case it does not come) */
      const eb=endOf();if(eb!=null)r.sc.endB=eb;return go(r.sc,r.o.via,'xfade');}
    if(tr==='soft'){const r=mk(K.filter,K.tag)||mk(K.fallback,K.tag);return r?go(r.sc,r.o.via,'xfade'):false;}   /* a quiet scene, crossfaded */
    if(tr==='anchor'){const a=E.anchor;if(!a||!pool.includes(a.id))return false;   /* the scene of this song's first drop, a little changed, with a short shock wave */
      const m=engMutate({id:a.id,p:a.p,mods:a.mods}),sc=engMake(a.id,{p:m.p,seed:a.seed,mods:m.mods,from:fr(ENG_SCENE[a.id]),tag:K.tag});
      engGo(sc,'cut');E.shock={t0:E.t,dir:1,dur:60/E.bpm*1.2,n:1};E.dropKick=Math.max(E.dropKick,.6);return true;}
    if(tr==='outro'){E.outroOn=true;const o=E.opening&&pool.includes(E.opening.id)?E.opening:null;let sc,via=null;   /* back to the opening scene, then black in the last bar */
      if(o)sc=engMake(o.id,{p:o.p,seed:o.seed,mods:Object.assign({},o.mods),from:fr(ENG_SCENE[o.id]),tag:K.tag});
      else{const r=mk(K.filter,K.tag);if(!r)return false;sc=r.sc;via=r.o.via;}
      sc.noHold=true;sc.endB=endOf();return go(sc,via,'xfade');}
    if(tr==='vary'){if(!cur||!pool.includes(cur.def.id)||cur.def.hold||ENG_STORIES.includes(cur.def.id)||!cur.def.key.length)return false;   /* the same scene, its key settings changed, no geometry flip */
      const def=cur.def,p=Object.assign({},cur.p0);for(const k of def.key)p[k]=engOther(def.params[k],p[k],E.R);
      const sc=engMake(def.id,{p,mods:Object.assign({},cur.mods),from:cur.from,tag:K.tag});return go(sc,null,engMorphable(def.id,def.id)?'morph':'xfade');}
  }catch(x){if(!E.dkErr){E.dkErr=1;console.warn('desk: plan go failed',x);}}
  return false;}   /* 'cut' (and anything else): the normal choice with engStyle */
/* ----- one frame ----- */
function engStep(N,t,dts){const E=ENG,A=EAR,C=ENG_CFG;if(E.N!==N)engInit(N);E.t=t;if(!E.t0)E.t0=t;
  /* the ears and the clock ran already this frame (MUSIC.frame, from the page); here only what the director does with them */
  if(E.frozen){gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,E.tex);gl.activeTexture(gl.TEXTURE0);engHud(t);return;}
  const db=MUSIC.dbeat,tick=MUSIC.tick,half=MUSIC.half,barTick=MUSIC.barTick;
  engPlanSync(dts);   /* AUTO: is a song map plan playing */
  if(barTick){engBar(E);engPlanTick();engMonoAct();}   /* changes the director makes on its own land on the bar line */
  if(window.DESK)engDeskTap(t);   /* DESK hook: live phase, config, strip gains on the ears, song-map signals (undone in the next engEars) */
  const kr=1-Math.exp(-dts/.5);E.restr+=((A.brk?1:0)-E.restr)*kr;E.mot=(1-.9*E.restr)*(C.iMot[0]+C.iMot[1]*(E.lvl==null?A.I:.5*A.I+.5*E.lvl))*(1+.8*engIxL());   /* soft music: less motion, fewer sparks, always */
  const tgt=A.gen?.6*E.arc:engClamp(A.build*.8+Math.min(1,A.dens/3)*.25+E.dropKick*.5);
  E.ent+=(engClamp(tgt*(.4+.6*A.I)+(S.vjEnt||0)+.5*engIxL()+(E.dkEo||0))*(1-.8*E.restr)-E.ent)*(1-Math.exp(-dts/2));   /* DESK hook: the energy master offsets the entropy; S.vjEnt = a VJ clip's own chaos (no slider) */
  if(!E.sc){engNext('start');if(!E.sc&&E.tr)engTrEnd();}   /* a bridge from nothing: the first scene starts at once */
  if(E.arrive&&E.sc){E.arrive=false;const mi=ENG_LOCK?[]:engMarked('intro');
    if(!E.frozen&&mi.length){const id=mi[Math.floor(E.R()*mi.length)];E.tr=null;E.loop=null;E.canon=-1;engGo(engMake(id,{from:ENG_SCENE[id].entry[0],tag:'intro'}),'cut');engLog('the song starts: your intro, '+ENG_SCENE[id].name);}   /* your intro scene */
    else if(!E.frozen&&engPool().includes('arrivals')&&E.sc.def.id!=='arrivals'){E.tr=null;E.loop=null;E.canon=-1;engGo(engMake('arrivals',{from:'dark',tag:'the song starts'}),'cut');}}   /* a song starts: what plays makes the picture */
  for(const cd of A.cands)if(!A.gen){engCand(cd);if(cd.src==='harmony')E.mixTone=true;}A.cands.length=0;A.sec=null;   /* switch candidates wait for the next bar line (and so does your mix's tonal change) */
  if(ENG_LOCK){E.secReq=null;E.arrive=false;}   /* locked: drops and new sections never switch the scene away */
  let dsk=false;   /* DESK hook: this drop was asked for (Drop! or a drop of the song map): a scene with a drop of its own does not take it */
  if(window.DESK){   /* DESK hook: Hold pins the scene (no end, no new section, no monotony shake); Drop! forces a drop; a drop marked "not a drop" is ignored */
    if(E.hold&&E.sc&&!E.skip){E.secReq=null;E.arrive=false;if(E.mono)E.mono.due=null;if(!E.tr)E.sc.b1=Math.max(E.sc.b1,E.beat+C.beatsPerBar);}
    if(E.dropReq){E.dropReq=false;if(!E.frozen&&!ENG_LOCK){A.drop=true;A.lastDrop=E.beat;dsk=true;if(E.dkSong){E.dkSongB=E.beat;}}E.dkSong=false;}
    else if(A.drop&&E.dkSongB!=null&&E.beat-E.dkSongB<8&&E.beat>=E.dkSongB){A.drop=false;}   /* the Director's own detector, a moment after the song map's drop: one drop only */
    else if(A.drop&&(engDeskRule()||{}).notDrop){A.drop=false;engLog('desk: marked as not a drop, ignored');}}
  if(A.drop&&!E.frozen&&(!ENG_LOCK||E.sc&&E.sc.def.id===ENG_LOCK&&E.sc.def.ownDrop)){const sc=E.sc,bpb=C.beatsPerBar;   /* a scene with a story of its own (Merger, Celdeling) can take the drop itself, locked too (the Stories list): that switches nothing */
    if(sc&&sc.def.ownDrop&&!dsk&&!E.tr&&!engDeskOff(sc.def.id)&&sc.def.ownDrop(sc,E)){   /* DESK hook: a switched-off story does not take the drop */MUSIC.snapDownbeat();E.loop=null;E.canon=-1;E.dropKick=1;E.rest=0;E.lastSw=E.beat;E.phr0=E.beat;engLog('DROP → '+sc.def.name+' takes it');}
    else if(!ENG_LOCK)engDrop();E.secReq=null;}
  if(A.drop&&!E.frozen){E.mixTone=false;engMixTick('drop');}   /* your mix: its drop layers (a drop is more than a tonal change) */
  if(E.secReq&&barTick&&!(A.dw.st==='breakdown'&&A.dw.armed&&E.secReq.kind!=='out'&&t-E.secReq.at<1)){const s=E.secReq;E.secReq=null;
    if(E.sc.def.hold&&(s.kind!=='fall'||E.sc.def.keepFall)&&E.sc.def.hold(E.sc,E,s)){E.sc.rethink=true;engLog('new section ('+(s.what||s.kind)+'): '+(E.sc.def.keepFall?E.sc.def.name+' keeps its story':'Arrivals shows it')+', no cut');}else engSection(s);}   /* a part coming in is what Arrivals draws */   /* armed, a change may be the drop itself: it waits a second */
  if(barTick){if(E.mixTone){E.mixTone=false;engMixTick('tone');}engMixTick('bar');}   /* your mix changes on the bar line too */
  if(E.skip){E.skip=false;if(E.tr&&E.tr.type!=='xfade')engTrEnd();else{E.tr=null;E.sc.b1=E.beat;E.sc.done=E.sc.now=E.sc.noHold=true;}}   /* N: at once (noHold: a story's hold() must not push the end away again) */
  const sc0=E.sc,d0=sc0.def;
  if(barTick&&!E.tr&&!E.loop&&E.canon<0&&!d0.untilDone&&!E.calmBars&&!(ENG_LOCK&&ENG_STORIES.includes(ENG_LOCK))&&C.morphOk.includes(d0.id)&&Math.abs(sc0.b1-C.beatsPerBar-E.beat)<.5&&engPhase()!=='build'&&!E.planNext&&E.R()<C.morphP){   /* a bar early, while the shape is whole: morph into the next */
    E.forceMorph=true;engNext('morph');E.forceMorph=false;}
  if(!E.tr&&d0.hold&&!sc0.noHold&&E.beat>=sc0.b1&&d0.hold(sc0,E))sc0.b1+=4*C.beatsPerBar;   /* Arrivals stays while the music is sparse */
  if(!E.tr&&E.beat>=sc0.b1&&(!d0.untilDone||sc0.done&&(barTick||sc0.now)||E.beat>=sc0.b1+sc0.bars*C.beatsPerBar))engNext('end');   /* a scene that finished early waits for the bar line */
  if(E.tr&&E.beat>=E.tr.b1)engTrEnd();
  E.lay.fill(0);E.ne=0;E.vflash=false;const sc=E.sc;
  if(E.tr&&E.tr.type==='xfade'&&E.tr.mode==='morph'){const L1=E.lay;E.lay=E.lay2;E.lay.fill(0);sc.def.draw(sc,E,dts,E.beat-sc.b0,tick,db);E.lay=L1;   /* the new scene draws unseen */
    LOOK.tr.morph(L1,E.lay2,(E.beat-E.tr.b0)/Math.max(1e-6,E.tr.b1-E.tr.b0),E.tr.mA||[],N,C.white);}
  else if(E.tr&&E.tr.type==='xfade'&&E.tr.out){const o=E.tr.out,L1=E.lay;o.def.draw(o,E,dts,E.beat-o.b0,tick,db);E.lay=E.lay2;E.lay.fill(0);
    sc.def.draw(sc,E,dts,E.beat-sc.b0,tick,db);E.lay=L1;const p=(E.beat-E.tr.b0)/(E.tr.b1-E.tr.b0),L2=E.lay2;
    if(E.tr.mode==='flicker')LOOK.tr.flicker(L1,L2,N*N,p,E.R,E.rank,C.light);   /* the whole frame is the old scene or the new one (an unsafe pair blends LED by LED) */
    else LOOK.tr.xfade(L1,L2,N*N,p,E.rank);}
  else sc.def.draw(sc,E,dts,E.beat-sc.b0,tick,db);
  engBam();if(A.on[0])E.duckT=t;engAudioDelay();
  {let s=0;const L=E.lay;for(let j=0;j<L.length;j++)s+=L[j];E.lvScene=s/L.length/C.light;}   /* how full the scene is: the voices only fill empty space */
  engBass();engMids(dts);engHighs();engSpasm(dts);engShock();engSparks(dts);engGeo();if(window.DESK&&DESK.overlay)engDeskOverlay(t,sc.def.id);/* DESK hook: the "how" layer */if(E.tr&&E.tr.type!=='xfade')engTr(E.tr);
  engFeedback(dts);if(sc.def.post)sc.def.post(sc,E);engMono(dts);engPost(t);engHud(t);}   /* post: a scene's own cut after the feedback */
/* the monotony watch: a picture that hardly changes may not stay longer than a couple of seconds. Every frame it counts the LEDs that
   moved (more than monoD since the frame before) against the LEDs that are lit (at least monoFloor of the panel); per half second that is
   the activity. Under monoR for monoS s in a row: first the scene is shaken (the same scene with other key settings and a geometry layer
   flipped); still too still after that, the next scene comes. Black on purpose (held, before a drop, a drop's blackout, bridges) is excused */
function engMono(dts){const E=ENG,C=ENG_CFG,A=EAR,O=E.out,N=E.N;
  const M=E.mono&&E.mono.prev.length===O.length?E.mono:(E.mono={prev:new Float32Array(O.length),t:0,c:0,l:0,f:0,act:1,still:0,shook:-1});
  const P=M.prev;let c=0,l=0;
  for(let j=0;j<O.length;j+=3){if(Math.max(O[j],O[j+1],O[j+2])>C.monoLit)l++;
    if(Math.max(Math.abs(O[j]-P[j]),Math.abs(O[j+1]-P[j+1]),Math.abs(O[j+2]-P[j+2]))>C.monoD)c++;}
  P.set(O);M.c+=c;M.l+=l;M.f++;M.t+=dts;if(M.t<.5)return;
  M.act=M.c/Math.max(M.l,C.monoFloor*N*N*M.f);M.t=M.c=M.l=M.f=0;
  if(E.black||A.dw.pre||E.ev&&E.ev.type==='screen'||E.tr||M.act>=C.monoR||E.sc&&E.sc.def.hold&&E.sc.def.hold(E.sc,E)){M.still=0;return;}   /* Arrivals is as still as the music */
  M.still+=.5;if(M.still<C.monoS||!E.sc)return;M.still=0;if(M.due!==E.sc.n){M.due=E.sc.n;M.dueAct=M.act;}}
/* the monotony watch acts on the next bar line, never in the middle of a bar */
function engMonoAct(){const E=ENG,C=ENG_CFG,A=EAR,M=E.mono,sc=E.sc;if(!M||M.due==null||!sc)return;const due=M.due;M.due=null;
  if(due!==sc.n||E.black||A.dw.pre||E.tr||E.secReq)return;   /* the scene changed meanwhile, black on purpose, or a new section is about to change it */
  if(M.shook!==sc.n&&engPool().length&&sc.def.key.length){const R=E.R,def=sc.def,p=Object.assign({},sc.p0);   /* first: shake it */
    for(const k of def.key)p[k]=engOther(def.params[k],p[k],R);const mods=Object.assign({},sc.mods);engFlipGeo(mods,R);
    const n=engMake(def.id,{p,mods,from:def.entry.includes(sc.from)?sc.from:def.entry[0],bars:Math.max(2,Math.round((sc.b1-E.beat)/C.beatsPerBar)),tag:'restless'});
    engLog('too still for '+C.monoS+' s ('+M.dueAct.toFixed(2)+'): shaken on the bar');engGo(n,'cut');M.shook=n.n;return;}
  engLog('still too still: the next scene, on the bar');E.loop=null;E.canon=-1;sc.b1=E.beat;sc.done=true;M.shook=-1;}
/* the debug panel */
function engHud(t){if(frameN%6!==0||S.tab!=='dir')return;const E=ENG,A=EAR,C=ENG_CFG,sc=E.sc;if(!sc)return;
  const bl=v=>'▁▂▃▄▅▆▇█'[Math.min(7,Math.max(0,Math.floor(v*8)))],ms=v=>Math.round(v*1000),on=(g,n)=>(t-A.onT[g]<.12?'<b>●</b>':'○')+n;
  const bar=Math.floor(E.beat/C.beatsPerBar),mods=ENG_MODS.filter(([m])=>engModOn(m)&&(m!=='spasm'||E.spz&&E.spz.amt>.02)&&(m!=='bass'||E.bw&&E.bw.length)&&(m!=='mids'||E.mlOn)&&(m!=='highs'||!!(E.sc&&!E.sc.def.cover.includes('highs')))).map(m=>m[1].toLowerCase());
  document.getElementById('engLive').innerHTML=
    (A.gen?'<b>generative</b> (no sound), ':'')+C.bandNames.map((n,i)=>n+' '+bl(A.env[i])).join(' ')+' · '+on(0,'kick ')+on(1,'snare ')+on(2,'hat')+'<br>'+
    Math.round(E.bpm)+' BPM '+(E.locked?'locked to the song ('+TEMPO.lock.toFixed(2)+')':'own clock')+' · bar '+(bar%C.barsPerPhrase+1)+'/'+C.barsPerPhrase+' beat '+(1+Math.floor(E.beat)%C.beatsPerBar)+'<br>'+
    'flatness '+A.flat.toFixed(2)+' · centroid '+A.cent.toFixed(2)+' · stereo '+(A.bal<0?'L':'R')+Math.abs(A.bal).toFixed(2)+' width '+(1-A.corr).toFixed(2)+' · reverb '+A.rev.toFixed(2)+
    ' · release kick '+ms(A.rel[0])+' snare '+ms(A.rel[1])+' hat '+ms(A.rel[2])+' ms, tail '+ms(A.tail)+' ms<br>'+
    'energy '+A.energy.toFixed(2)+' · entropy <b>'+E.ent.toFixed(2)+'</b> · build '+A.build.toFixed(2)+' · '+(A.brk?'<b>breakdown</b> · ':'')+'repeats '+A.rep.toFixed(2)+' · '+A.dens.toFixed(1)+' hits/beat · glitch '+(E.gl||0).toFixed(2)+
    ' · new section '+(A.secS>C.secThr?'<b>'+A.secS.toFixed(2)+'</b>':A.secS.toFixed(2))+' of '+C.secThr+'<br>'+
    'intensity <b>'+A.I.toFixed(2)+'</b> '+bl(A.I)+' (loud '+A.iParts[0].toFixed(2)+', hits '+A.iParts[1].toFixed(2)+', bands '+A.lay.N+'/'+C.secBands+', bright '+A.iParts[3].toFixed(2)+') · loudness '+A.ld.M.toFixed(1)+' / '+A.ld.S.toFixed(1)+' LUFS, loud level '+A.ld.ref.toFixed(1)+' · phase <b>'+engPhase()+'</b>'+((E.antQ||0)>.01?' · <b>pulling in</b> for the change':'')+(E.wMode?' · white: <b>'+E.wMode+'</b>':'')+(E.dl&&E.dl.on.size?' · sound waits '+S.engDelay+' ms':'')+(E.secReq?' · switch waits for the bar: '+E.secReq.srcs.join(' + '):'')+'<br>'+
    'drop watch: '+({intro:'intro, no bass yet',groove:'groove',breakdown:'<b>breakdown</b>'}[A.dw.st]||A.dw.st)+(A.dw.armed?', <b>armed</b>':'')+(A.dw.pre?', <b>BLACK before the drop</b>':'')+
    (A.dw.st==='breakdown'?', sub '+(A.dw.F-A.dw.groove).toFixed(0)+' dB under the groove; a drop needs a hit within '+C.dwHitDb+' dB of its kicks':'')+'<br>'+
    '<b>'+sc.def.name+' #'+sc.n+'</b> '+(sc.tag?'('+sc.tag+') ':'')+(E.tr?'→ '+(E.tr.mode||E.tr.type)+' ':'')+(E.mono&&E.mono.still?'(too still '+E.mono.still.toFixed(1)+' s) ':'')+'· ends '+(E.tr?'':'in '+Math.max(0,Math.ceil((sc.b1-E.beat)/C.beatsPerBar))+' bars ')+'as '+(E.tr&&C.trTo[E.tr.type]||sc.exit)+
    ' · layers: '+(mods.join(', ')||'none')+(E.loop?' · loop '+E.loop.rep+'/'+E.loop.max:'')+(E.canon>=0?' · full cycle':'')+(E.rest?' · rest':'')+'<br>'+
    '≈ '+E.amps.toFixed(1)+' A of '+(HOUSE.val.supplyA*HOUSE.val.powerLimit).toFixed(0)+' A'+(E.lim<1?' (<b>limited to '+Math.round(E.lim*100)+' %</b>)':'')+' · seed '+E.seed+(S.engHw?' · LEDs: '+(E.hw.ok?E.hw.sent+' frames sent':E.hw.err||'connecting…'):'');
  document.getElementById('engLog').textContent=E.log.slice(-8).join('\n');engMixLive();}

/* ----- controls: built here, after the scenes are registered ----- */
const ENG_FAVS='infinity-director-favs-v1';
function engFavs(){try{return JSON.parse(localStorage.getItem(ENG_FAVS)||'[]');}catch(e){return[];}}
function engFavList(){const el=document.getElementById('engFavs');const f=engFavs();el.innerHTML='<option value="">Replay a favourite…</option>'+f.map((x,i)=>'<option value="'+i+'">♥ '+x.when+' · seed '+x.seed+'</option>').join('');}
function engFav(){const E=ENG,f=engFavs();f.unshift({seed:E.seed,when:new Date().toLocaleString(),log:E.log.slice()});try{localStorage.setItem(ENG_FAVS,JSON.stringify(f.slice(0,20)));}catch(e){}engFavList();engLog('♥ saved as a favourite (seed '+E.seed+')');}
/* your scenes: in or out of the set; one you add plays at once. A click here also ends a lock from the page's sets and stories */
function engSetToggle(id){const E=ENG,L=engSet(),i=L.indexOf(id);ENG_LOCK=null;ENG_POOL=null;S.engScene=0;
  if(i>=0){L.splice(i,1);S.engSet=L;if(S.engMark)delete S.engMark[id];if(E.sc&&E.sc.def.id===id)E.skip=true;}
  else{L.push(id);S.engSet=L;if(S.pat!==55){S.pat=55;syncPat();}E.tr=null;E.loop=null;E.canon=-1;E.secReq=null;
    if(E.N&&E.sc){engLog('you picked '+ENG_SCENE[id].name);engGo(engMake(id,{from:ENG_SCENE[id].entry[0],tag:'picked'}),'cut');}else E.skip=true;}
  save();engSetRows();syncEng();}
function engSetAuto(){S.engSet=[];S.engMark={};engSetRows();S.engScene=0;ENG_LOCK=null;ENG_POOL=null;ENG.skip=true;ENG.canon=-1;ENG.loop=null;save();syncEng();}
/* your layers: in or out (a new one is on at once, always), and their rows: one slider, how often */
function engMixToggle(m){const L=(S.engMix||[]).slice(),i=L.findIndex(x=>x.m===m);delete ENG.force[m];
  if(i>=0){L.splice(i,1);if(ENG.mixOn)delete ENG.mixOn[m];}else{const x={m,p:1};L.push(x);engMixSet(x,true);}
  S.engMix=L;save();engMixRows();syncEng();}
function engMixRows(){const box=document.getElementById('engMixList');if(!box)return;const L=S.engMix||[];box.innerHTML='';
  for(const x of L){const i=ENG_MODS.findIndex(q=>q[0]===x.m),id='mx-'+x.m,row=document.createElement('div');if(i<0)continue;
    row.style.cssText='border:1px solid var(--line);border-radius:8px;padding:8px 10px;display:flex;gap:8px;align-items:center';
    row.innerHTML='<div class="row" style="flex:1"><label for="'+id+'">'+(i+1)+' '+ENG_MODS[i][1]+' <span data-mxs="'+x.m+'" style="font:11px var(--mono);color:var(--mute)"></span></label><output></output><input type="range" id="'+id+'" min="0" max="100" step="5"></div>'+
      '<button type="button" title="take it away">✕</button>';
    const inp=row.querySelector('input'),out=row.querySelector('output'),say=()=>{out.textContent=x.p>=1?'always':Math.round(x.p*100)+' % of the time';};
    inp.value=Math.round(x.p*100);say();inp.addEventListener('input',()=>{x.p=+inp.value/100;if(x.p>=1)engMixSet(x,true);else if(x.p<=0)engMixSet(x,false);say();save();syncEng();});   /* the ends act at once, the rest on the next musical moment */
    row.querySelector('button').addEventListener('click',()=>engMixToggle(x.m));box.appendChild(row);}
  engMixLive();}
function engMixLive(){const E=ENG;document.querySelectorAll('#engMixList [data-mxs]').forEach(s=>{const m=s.dataset.mxs;
  s.textContent=E.force[m]===false?'· ○ off (the VJ Lab holds it)':engModOn(m)?'· ● on':'· ○ off until the next musical moment';});}
/* your scenes as rows: mark one as the intro (it plays when a song starts) or a drop scene (it plays on the drops); a marked one waits for that moment */
function engSetRows(){const box=document.getElementById('engSetList');if(!box)return;const L=engSet(),M=S.engMark||(S.engMark={});box.innerHTML='';
  for(const id of L){const row=document.createElement('div'),mk=M[id]||{};row.style.cssText='border:1px solid var(--line);border-radius:8px;padding:6px 10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    row.innerHTML='<span style="flex:1;min-width:120px">'+ENG_SCENE[id].name+'</span><button type="button" data-k="intro">Intro</button><button type="button" data-k="drop">Drop</button><button type="button" data-k="out" title="out of the set">✕</button>';
    row.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;if(k!=='out')b.setAttribute('aria-pressed',String(!!mk[k]));
      b.addEventListener('click',()=>{if(k==='out'){engSetToggle(id);return;}const m=M[id]||(M[id]={});m[k]=m[k]?0:1;if(!m.intro&&!m.drop)delete M[id];save();engSetRows();});});
    box.appendChild(row);}}
{if(S.engScene>0&&!engSet().length){const f=ENG_ORDER[S.engScene-1];S.engSet=f?[f]:[];S.engScene=0;}   /* the old one-scene pick becomes a set of one */
 if(Array.isArray(S.engMix))S.engMix=S.engMix.filter(x=>x&&ENG_MODS.some(q=>q[0]===x.m)).map(x=>({m:x.m,p:Math.max(0,Math.min(1,+x.p||0))}));
 const box=document.getElementById('engScn');[null].concat(ENG_ORDER).forEach(id=>{const b=document.createElement('button');b.type='button';b.dataset.n=id?ENG_SCENE[id].name+' · '+ENG_SCENE[id].role.join('/'):'Auto';if(id)b.dataset.id=id;b.textContent=b.dataset.n;
   b.addEventListener('click',()=>{if(id)engSetToggle(id);else engSetAuto();});box.appendChild(b);});engSetRows();
 const mb=document.getElementById('engMods');ENG_MODS.forEach(([m,n],i)=>{const b=document.createElement('button');b.type='button';b.dataset.m=m;b.dataset.n=n;b.title=(i<9?'key '+(i+1)+': ':'')+'click to add it with a slider, again to take it away';
   b.addEventListener('click',()=>engMixToggle(m));mb.appendChild(b);});
 document.getElementById('engMixClear').addEventListener('click',()=>{S.engMix=[];ENG.mixOn={};save();engMixRows();syncEng();});engMixRows();
 const go=document.getElementById('engGo');let before=DEF.pat;go.addEventListener('click',()=>{if(S.pat===55)S.pat=before;else{before=S.pat;S.pat=55;}save();syncPat();});
 const on55=()=>{if(S.pat!==55){S.pat=55;syncPat();}};
 document.getElementById('engSkip').addEventListener('click',()=>{on55();ENG.skip=true;});
 document.getElementById('engCyc').addEventListener('click',()=>{on55();ENG.canonReq=true;ENG.loop=null;ENG.skip=true;});
 const fr=document.getElementById('engFrz');fr.addEventListener('click',()=>{ENG.frozen=!ENG.frozen;syncEng();});
 const bk=document.getElementById('engBlack');bk.addEventListener('pointerdown',()=>{ENG.black=true;});['pointerup','pointerleave'].forEach(e=>bk.addEventListener(e,()=>{ENG.black=false;}));
 document.getElementById('engFav').addEventListener('click',engFav);
 CONDUCTOR.listen('seed',()=>engSeed(Date.now()%1e6));document.getElementById('engNew').addEventListener('click',()=>CONDUCTOR.newSeed());   /* AUTO: another take of the same song */
 const fs=document.getElementById('engFavs');fs.addEventListener('change',()=>{const f=engFavs()[+fs.value];if(f){on55();engSeed(f.seed);engLog('replaying the favourite from '+f.when);}fs.value='';});engFavList();
 const hw=document.getElementById('engHw');hw.addEventListener('click',()=>{S.engHw=S.engHw?0:1;save();syncEng();});
 const ip=document.getElementById('engIp');ip.value=S.engIp;ip.addEventListener('change',()=>{S.engIp=ip.value.trim();save();if(ENG.hw.ws)try{ENG.hw.ws.close();}catch(e){}});
 const seg=(id,k,names)=>{const el=document.getElementById(id);names.forEach((n,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.textContent=n;b.dataset.i=i;
   b.addEventListener('click',()=>{S[k]=i;save();syncEng();});el.appendChild(b);});};
 seg('engWireSeg','engWire',['Serpentine','Progressive']);seg('engOriginSeg','engOrigin',['Starts top left','Top right','Bottom left','Bottom right']);
 const KEYS={n:()=>{ENG.skip=true;},c:()=>document.getElementById('engCyc').click(),' ':()=>fr.click(),h:engFav,o:()=>hw.click(),
   };
 ENG_MODS.forEach(([m],i)=>KEYS[String(i+1)]=()=>engMixToggle(m));
 document.addEventListener('keydown',e=>{if(S.pat!==55||e.ctrlKey||e.metaKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'))return;
   const k=e.key.toLowerCase();if(k==='b'){ENG.black=true;e.preventDefault();return;}const fn=KEYS[k];if(!fn)return;e.preventDefault();fn();save();syncEng();});
 document.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='b')ENG.black=false;});}
buildCtl('engCtl',[{k:'engFb',l:'Feedback tunnel',min:0,max:1,step:.05,f:v=>v<.01?'off, no ghosts':Math.round(v*100)+' % of the rolled trail'},
  {k:'engDelay',l:'Sound waits for the light',min:0,max:150,step:5,f:v=>v<1?'off, the sound plays at once':v+' ms, so the light lands on the beat (player and video only)'}]);
syncEng();
const engList=()=>({scenes:ENG_ORDER.filter(id=>!ENG_STORIES.includes(id)).map(id=>({id,name:ENG_SCENE[id].name})),stories:ENG_STORIES.filter(id=>ENG_SCENE[id]).map(id=>({id,name:ENG_SCENE[id].name+(id==='merger'?' (then Black hole)':id==='celdeling'?' (then Morphology)':'')}))});
const engLock=id=>{if(id==null||!ENG_SCENE[id]){ENG_LOCK=null;return null;}ENG_LOCK=id;const E=ENG;
  if(E.N&&E.sc&&E.sc.def.id!==id){E.tr=null;E.loop=null;E.canon=-1;E.secReq=null;engGo(engMake(id,{from:ENG_SCENE[id].entry[0],tag:'locked'}),'cut');}
  return id;};
const engSetPool=ids=>{const v=Array.isArray(ids)?ids.filter(id=>ENG_SCENE[id]):[];ENG_POOL=v.length?v:null;return ENG_POOL;};
const engNow=()=>{const E=ENG,sc=E.sc;if(!sc)return null;const bpb=ENG_CFG.beatsPerBar,id=sc.def.id;
  return {id,name:sc.def.name,kind:ENG_STORIES.includes(id)?'story':'scene',bar:Math.max(1,Math.floor((E.beat-sc.b0)/bpb)+1),bars:Math.max(1,Math.round((sc.b1-sc.b0)/bpb))};};
/* DESK hook: what the desk's buttons call (Next = ENG.skip, Black = ENG.black are there already) */
ENG.hold=false;   /* Hold: pin the scene */
ENG.forceDrop=()=>{ENG.dropReq=true;};   /* Drop!: a drop on the next frame (ignored while frozen or locked) */
ENG.forceCalm=bars=>{const E=ENG,bp=ENG_CFG.beatsPerBar;if(!E.sc)return;E.rest=Math.max(1,E.rest||0);E.hiBars=0;E.calmBars=Math.max(1,Math.round(bars||8));E.loop=null;E.canon=-1;
  E.sc.noHold=true;E.sc.then=null;if(E.sc.def.untilDone)E.sc.done=true;   /* a story's hold() must not keep it, and no hand-over follows */
  if(!E.tr)E.sc.b1=Math.min(E.sc.b1,Math.ceil(E.beat/bp)*bp);};   /* Calm: the scene ends on the bar line, the next one is a quiet one that lasts `bars` bars */
/* window.INF_DIR: the same hooks for tests and the console (tests/celdeling-story.js) */
return window.INF_DIR={step:engStep,sync:syncEng,lookCtx:engLookCtx,ENG,EAR,ENG_ORDER,ENG_SCENE,ENG_CFG,ENG_ROLE,ENG_COVER,ENG_ON,ENG_MODS,list:engList,lock:engLock,pool:engSetPool,now:engNow,
  pinned:()=>{const f=ENG_ORDER[S.engScene-1];return f||(engSet().length===1?engSet()[0]:null);},picked:()=>{const f=ENG_ORDER[S.engScene-1];return f?[f]:engSet();},unpin:engSetAuto,
  modOn:engModOn,seed:engSeed};}};   /* DESK hook: the scenes picked in the Director tab (they beat the desk's scene choices), and back to Auto */   /* DESK hook: ENG_CFG, ENG_ROLE, ENG_COVER, ENG_ON, ENG_MODS exposed */
