import { writeFile } from 'node:fs/promises';
const targets = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT || 9223}/json`)).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open',r,{once:true}));
let id = 0;
const pending = new Map();
export const browserErrors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') browserErrors.push(m.params.exceptionDetails);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) browserErrors.push({url:m.params.response.url,status:m.params.response.status});
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
});
export const cdp = (method,params={}) => new Promise((resolve,reject) => {pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
export const pause = ms => new Promise(r => setTimeout(r,ms));
export const evaluate = async expression => {
 const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
 return r.result.value;
};
export async function viewport(width,height,mobile=false) {
 await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:mobile});
}
export async function navigate() {
 await cdp('Page.navigate',{url:'http://127.0.0.1:4173/'});
 await pause(350);
 await evaluate('document.fonts.ready');
 await pause(1000);
}
export async function revealAll() {
 const height=await evaluate('document.documentElement.scrollHeight');
 for(let y=0;y<height;y+=600) {await evaluate(`scrollTo({top:${y},behavior:'instant'})`);await pause(65);}
 await pause(1800);
 await evaluate("scrollTo({top:0,behavior:'instant'})");await pause(250);
}
export async function screenshot(name,full=false) {
 let params={format:'png',captureBeyondViewport:true};
 const m=await cdp('Page.getLayoutMetrics');
 const captureWidth=Math.round(await evaluate('innerWidth')*(m.visualViewport.zoom || 1));
 // Screenshot clips use device-independent pixels, including browser page zoom.
 if(full){params.clip={x:0,y:0,width:Math.max(captureWidth,m.contentSize.width),height:m.contentSize.height,scale:1};}
 else {params.clip={x:m.layoutViewport.pageX,y:m.layoutViewport.pageY,width:captureWidth,height:m.layoutViewport.clientHeight,scale:1};}
 const {data}=await cdp('Page.captureScreenshot',params);await writeFile(`qa/${name}.png`,Buffer.from(data,'base64'));
}
export async function section(selector,name) {
 await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);await pause(300);
 await screenshot(name);
}
export const close=()=>ws.close();
await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Network.enable');
