// Simulator → real LEDs (used by the Director). The simulator page cannot send UDP, so it sends each LED frame over a WebSocket to this helper,
// which forwards it to WLED (or anything that speaks DDP) on UDP port 4048.
// Run:  node lt-ddp-bridge.js        (then press "Send to the LEDs" in the Director tab)
// The page first sends {"host":"4.3.2.1","port":4048} as text, then binary frames of N×N×3 bytes (RGB, already gamma-corrected,
// dithered and in wiring order). No packages needed: the WebSocket handshake and framing are done by hand (RFC 6455).
const http=require('http'),crypto=require('crypto'),dgram=require('dgram');
const PORT=+(process.env.LT_PORT||8790),udp=dgram.createSocket('udp4');
let target={host:'4.3.2.1',port:4048},seq=0,frames=0,last=Date.now();
// DDP: 10-byte header (version 1, push flag on the last packet, sequence 1-15, type RGB 8 bit, output 1, byte offset, length), max 1440 bytes of data
function sendDDP(buf){const MAX=1440;for(let off=0;off<buf.length;off+=MAX){const len=Math.min(MAX,buf.length-off),h=Buffer.alloc(10),last=off+len>=buf.length;
  h[0]=0x40|(last?0x01:0);h[1]=seq;h[2]=0x0B;h[3]=0x01;h.writeUInt32BE(off,4);h.writeUInt16BE(len,8);
  udp.send(Buffer.concat([h,buf.subarray(off,off+len)]),target.port,target.host);}seq=seq%15+1;}
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/plain'});r.end('DDP bridge: open the simulator and press Send to the LEDs\n');});
srv.on('upgrade',(req,sock)=>{const key=req.headers['sec-websocket-key'];if(!key){sock.destroy();return;}
  const acc=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
  console.log('page connected');let buf=Buffer.alloc(0),parts=[];
  sock.on('data',d=>{buf=Buffer.concat([buf,d]);
    for(;;){if(buf.length<2)return;const b0=buf[0],b1=buf[1],op=b0&15,fin=b0&128,masked=b1&128;let len=b1&127,o=2;
      if(len===126){if(buf.length<4)return;len=buf.readUInt16BE(2);o=4;}else if(len===127){if(buf.length<10)return;len=Number(buf.readBigUInt64BE(2));o=10;}
      const mo=o;if(masked)o+=4;if(buf.length<o+len)return;let p=buf.subarray(o,o+len);
      if(masked){const m=buf.subarray(mo,mo+4);p=Buffer.from(p);for(let i=0;i<p.length;i++)p[i]^=m[i&3];}
      buf=buf.subarray(o+len);
      if(op===8){sock.end();return;}if(op===9){sock.write(Buffer.from([0x8A,0]));continue;}
      parts.push(p);if(!fin)continue;const msg=Buffer.concat(parts);parts=[];
      if(op===1||(op===0&&msg[0]===123)){try{const c=JSON.parse(msg.toString());target={host:c.host||target.host,port:c.port||4048};console.log('sending to',target.host+':'+target.port);}catch(e){}}
      else{sendDDP(msg);frames++;const now=Date.now();if(now-last>5000){console.log(frames+' frames ('+Math.round(frames*1000/(now-last))+' fps) of '+msg.length+' bytes');frames=0;last=now;}}}});
  sock.on('close',()=>console.log('page disconnected'));sock.on('error',()=>{});});
srv.listen(PORT,'127.0.0.1',()=>console.log('DDP bridge on ws://127.0.0.1:'+PORT+', waiting for the simulator'));
