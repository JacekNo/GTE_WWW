import {viewport,navigate,revealAll,screenshot,section,evaluate,close} from './cdp.mjs';
for(const [width,height] of [[1440,900],[1280,800],[768,1024],[390,844]]) {
 await viewport(width,height,width===390);await navigate();await revealAll();
 await screenshot(`desktop-${width}`,true);await screenshot(`hero-${width}`);
 console.log(width,await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,fonts:[...document.fonts].map(f=>({weight:f.weight,status:f.status})),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`));
 if(width===1440||width===390){for(const [selector,name] of [['#liczby','numbers'],['#struktura','structure'],['#zasieg','map'],['#partnerzy','partners'],['#kontakt','contact']])await section(selector,`${name}-${width}`);}
}
close();
