import {writeFile} from 'node:fs/promises';
import {cdp,viewport,navigate,revealAll,screenshot,evaluate,pause,close,browserErrors} from './cdp.mjs';
const checks=[];
function check(name,value,detail=null){checks.push({name,pass:!!value,detail});console.log(value?'PASS':'FAIL',name,detail??'');}
async function key(key,code=key,windowsVirtualKeyCode){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode});await pause(50);}
async function pointer(selector,type='mouseMoved'){
 const p=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 if(type==='tap'){await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else if(type==='click'){await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
 else await cdp('Input.dispatchMouseEvent',{type,...p});
 await pause(220);
}
await viewport(1440,900);await navigate();await revealAll();
check('46 map cities',await evaluate("document.querySelectorAll('.map-city').length===46"));
check('Fonts 400/600/700 loaded',await evaluate("[...document.fonts].every(f=>f.status==='loaded')"));
await key('Tab','Tab',9);
check('Keyboard skip link + visible outline',await evaluate("document.activeElement.matches('.skip-link:focus-visible') && getComputedStyle(document.activeElement).outlineStyle==='solid'"));
// Capture after pointer tests: Chromium full-page captures temporarily hide the
// scrollbar, which changes SVG hit coordinates until the next input repaint.
await evaluate("document.querySelector('[data-map]').scrollIntoView({block:'center',behavior:'instant'})");await pause(300);
await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:10,y:100});
await pointer('[data-city="Warszawa"] ');
check('Map hover label',await evaluate("document.querySelector('[data-map-tooltip-label]').textContent==='Warszawa' && document.querySelector('[data-map-tooltip]').getAttribute('aria-hidden')==='false'"));
await pointer('[data-city="Warszawa"] ','click');
await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:10,y:100});await pause(100);
check('Selection persists after pointer leaves',await evaluate("document.querySelector('[data-city=Warszawa]').getAttribute('aria-pressed')==='true' && document.querySelector('[data-map-tooltip-label]').textContent==='Warszawa'"));
await pointer('[data-city="Poznań"] ');
check('Hover another city preserves selection',await evaluate("document.querySelector('[data-city=Warszawa]').getAttribute('aria-pressed')==='true' && document.querySelector('[data-map-tooltip-label]').textContent==='Poznań'"));
await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:10,y:100});await pause(100);
check('Tooltip restores selected city',await evaluate("document.querySelector('[data-map-tooltip-label]').textContent==='Warszawa'"));
await key('Escape','Escape',27);
check('Escape clears selection and tooltip',await evaluate("!document.querySelector('.map-city.is-selected') && document.querySelector('[data-map-tooltip]').getAttribute('aria-hidden')==='true'"));
await evaluate("document.querySelector('[data-city=Katowice]').focus()");await key('Enter','Enter',13);
check('Keyboard Enter selects Katowice',await evaluate("document.querySelector('[data-city=Katowice]').getAttribute('aria-pressed')==='true'"));
await screenshot('map-silesia-focus');
await key('Tab','Tab',9);
check('Tab moves to the next map pin',await evaluate("document.activeElement.matches('.map-city') && document.activeElement.dataset.city!=='Katowice'"));
await key(' ','Space',32);
check('Space selects focused city',await evaluate("document.activeElement.getAttribute('aria-pressed')==='true'"));
await key('Escape','Escape',27);
check('Escape from focused pin clears',await evaluate("!document.querySelector('.map-city.is-selected,.map-city.is-highlighted')"));
for(const [width,height] of [[1440,900],[1280,800],[768,1024],[390,844]]){
 await viewport(width,height,width===390);await navigate();await revealAll();
 const geometry=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,crop:[...document.querySelectorAll('h1,h2,h3,p,dt,dd,address,a')].filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).display!=='inline').map(e=>e.textContent.trim().slice(0,50))})`);
 check(`${width}: no overflow / cropped copy / broken assets`,!geometry.overflow&&!geometry.broken&&!geometry.crop.length,geometry);
 await evaluate("document.querySelector('[data-map]').scrollIntoView({block:'center',behavior:'instant'})");await pause(200);
 const hitFailures=await evaluate(`(()=>[...document.querySelectorAll('.map-city')].flatMap(city=>{const r=city.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.map-city');return hit===city?[]:[{city:city.dataset.city,hit:hit?.dataset.city}]}))()`);
 check(`${width}: all map pin hit targets including Silesia`,hitFailures.length===0,hitFailures);
 const edges=await evaluate(`(async()=>{const bad=[];const map=document.querySelector('[data-map]');for(const city of map.querySelectorAll('.map-city')){city.focus({preventScroll:true});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const r=map.getBoundingClientRect(),t=map.querySelector('[data-map-tooltip]').getBoundingClientRect();if(t.left<r.left-1||t.right>r.right+1||t.top<r.top-1)bad.push(city.dataset.city);}document.activeElement.blur();return bad;})()`);
 check(`${width}: all 46 tooltip edge positions`,edges.length===0,edges);
 if(width===390){
  await pointer('[data-city="Warszawa"] ','tap');
  check('Mobile tap selects',await evaluate("document.querySelector('[data-city=Warszawa]').getAttribute('aria-pressed')==='true'"));
  await evaluate("document.querySelector('.map-picker select').focus();document.querySelector('.map-picker select').value='Katowice';document.querySelector('.map-picker select').dispatchEvent(new Event('change',{bubbles:true}))");
  check('Mobile list selects Silesia city',await evaluate("document.querySelector('[data-city=Katowice]').getAttribute('aria-pressed')==='true' && document.querySelectorAll('.is-selected').length===1"));
  await screenshot('map-mobile-selected');
  await evaluate("scrollTo({top:0,behavior:'instant'})");await pause(250);
  await pointer('.menu-toggle','tap');
  check('Mobile menu opens',await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true' && document.body.classList.contains('menu-open')"));
  await screenshot('menu-mobile');
  await key('Escape','Escape',27);
  check('Mobile Escape returns focus',await evaluate("document.activeElement.matches('.menu-toggle') && !document.body.classList.contains('menu-open')"));
  await pointer('.menu-toggle','tap');
  await evaluate("document.querySelector('.primary-nav a:last-child').focus()");await key('Tab','Tab',9);
  check('Menu Tab stays inside navigation',await evaluate("document.activeElement.matches('.menu-toggle')"));
  await pointer('.primary-nav a[href="#struktura"]','tap');await pause(800);
  check('Mobile menu link closes + focuses section',await evaluate("!document.body.classList.contains('menu-open') && document.activeElement.id==='struktura'"));
 }
 // Short and long copy perturbations are confined to this browser session.
 const textStress=await evaluate(`(()=>{document.querySelector('#about-title').textContent='Edukacja';document.querySelector('.entity__description').textContent='Strategia oraz kompleksowe wsparcie organizacyjne i dydaktyczne szkół, nauczycieli i uczestników programów edukacyjnych w całej Polsce.';document.querySelector('#partners-title').textContent='Współpraca z partnerami wspierającymi rozwój kompetencji na różnych etapach edukacji';return document.documentElement.scrollWidth<=innerWidth})()`);
 check(`${width}: short and long copy reflows`,textStress);
}
await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate();
const reduced=await evaluate("({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,hidden:[...document.querySelectorAll('[data-reveal],.map-city')].filter(e=>getComputedStyle(e).opacity!=='1').length,smooth:getComputedStyle(document.documentElement).scrollBehavior})");
check('Reduced motion reveals all content immediately',reduced.matches&&!reduced.hidden&&reduced.smooth==='auto',reduced);
await screenshot('reduced-motion-mobile',true);
await cdp('Emulation.setEmulatedMedia',{features:[]});
for(const [width,height] of [[1440,900],[390,844]]){
 await viewport(width,height,width===390);await navigate();await pause(200);
 check(`${width}: photo hero loads and stays within viewport`,await evaluate("document.querySelector('.hero__photo').naturalWidth>0 && document.documentElement.scrollWidth<=innerWidth && getComputedStyle(document.querySelector('.hero'),'::before').backgroundImage!=='none'"));
 await screenshot(`hero-photo-${width}`);
}
await viewport(1440,900);await navigate();
await evaluate("document.querySelector('#kontakt').scrollIntoView({behavior:'instant'})");await pause(800);
check('Quick scroll reveals destination',await evaluate("[...document.querySelectorAll('#kontakt [data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')"));
await cdp('Page.reload');await pause(1500);
check('Mid-page reload reveals visible content',await evaluate("[...document.querySelectorAll('[data-reveal]')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>100}).every(e=>getComputedStyle(e).opacity==='1')"));
await viewport(390,844,true);
await cdp('Emulation.setScriptExecutionDisabled',{value:true});
await cdp('Page.navigate',{url:'http://127.0.0.1:4173/'});await pause(800);
await screenshot('no-js-mobile');
await cdp('Emulation.setScriptExecutionDisabled',{value:false});
check('No JS: content and mobile navigation remain accessible',await evaluate("!document.documentElement.classList.contains('has-motion') && getComputedStyle(document.querySelector('.primary-nav')).display==='flex' && document.documentElement.scrollWidth<=innerWidth"));
await viewport(1440,900);await navigate();await key('Tab','Tab',9);await screenshot('keyboard-focus');
check('No JS exceptions or failed HTTP assets',browserErrors.length===0,browserErrors);
await writeFile('qa/results.json',JSON.stringify({browser:'Chrome 154',date:new Date().toISOString().slice(0,10),checks},null,2));
close();
if(checks.some(c=>!c.pass))process.exitCode=1;
