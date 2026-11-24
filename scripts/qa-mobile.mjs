import { chromium } from 'playwright';

const target=process.env.CAZAMI_QA_URL||'http://127.0.0.1:4321/';
const cases=[
  {width:320,height:700,columns:3},
  {width:375,height:812,columns:3},
  {width:390,height:844,columns:3},
  {width:430,height:932,columns:3},
  {width:600,height:900,columns:3},
  {width:768,height:1024,columns:2},
  {width:1024,height:768,columns:3},
  {width:1440,height:900,columns:3},
];
const browser=await chromium.launch({headless:true});
let errors=0;
try{
for(const viewport of cases){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 try{
  await page.goto(target,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#works-grid [data-work-card]').length>=26,{timeout:20000});
  await page.evaluate(()=>document.fonts.ready);
  const measures=await page.evaluate(()=>{
   const rect=selector=>{const node=document.querySelector(selector);if(!node)return null;const box=node.getBoundingClientRect();return {x:Math.round(box.left),right:Math.round(box.right),width:Math.round(box.width),height:Math.round(box.height)}};
   const grid=document.querySelector('#works-grid');
   const title=document.querySelector('.catalog-hero h1');
   const dock=document.querySelector('.mobile-dock');
   const featured=document.querySelector('.featured-edition__grid');
   return {
    documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth,
    viewportWidth:window.innerWidth,
    cardCount:grid?.querySelectorAll('[data-work-card]').length||0,
    firstCard:grid?.querySelector('[data-work-card] h3')?.textContent,
    columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    h1:rect('.catalog-hero h1'),
    controls:rect('.portfolio-controls'),
    card:rect('#works-grid .work-card'),
    dockVisible:!!dock&&getComputedStyle(dock).display!=='none',
    dock:rect('.mobile-dock'),
    featuredOverflow:!!featured&&featured.scrollWidth>featured.clientWidth+10,
    featured:rect('.featured-edition__grid'),
    nav:rect('.header__inner'),
   };
  });
  const issues=[];
  if(measures.cardCount<26)issues.push('No cargó el catálogo adicional');
  if(!/Amor Eterno/i.test(measures.firstCard||''))issues.push('Últimas invitaciones no aparecen primero');
  if(measures.columns!==viewport.columns)issues.push('Cuadrícula '+measures.columns+' en vez de '+viewport.columns);
  if(measures.documentWidth>viewport.width+2)issues.push('Desbordamiento horizontal del documento: '+measures.documentWidth);
  for(const selector of ['controls','card','nav','h1']){
   const rect=measures[selector];
   if(rect&&(rect.x< -3||rect.right>viewport.width+3))issues.push(selector+' se sale de la pantalla: '+JSON.stringify(rect));
  }
  if(viewport.width<=700&&!measures.dockVisible)issues.push('Falta navegación inferior móvil');
  if(viewport.width>700&&measures.dockVisible)issues.push('Dock móvil visible en escritorio');
  if(viewport.width<=700&&!measures.featuredOverflow)issues.push('La sección de nuevos no permite deslizar');
  if(pageErrors.length)issues.push('Errores JavaScript: '+pageErrors.join('; ').slice(0,500));
  console.log(JSON.stringify({width:viewport.width,height:viewport.height,columns:measures.columns,cards:measures.cardCount,documentWidth:measures.documentWidth,dock:measures.dockVisible,featuredSwipe:measures.featuredOverflow,issues}));
  if(issues.length)errors++;
  if(process.env.CAZAMI_SCREENSHOTS==='1')await page.screenshot({path:'qa-cazami-'+viewport.width+'.png',fullPage:true});
 }catch(error){console.error('QA fallida en '+viewport.width+': '+error.message);errors++;}
 finally{await page.close();}
}
// Todas las pantallas pequeñas: Android, iPhone y navegadores sin UA Android, 3 x 3.
for(const device of [
 {name:'Android 320',width:320,height:700,dpr:2.5,ua:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'},
 {name:'Android Chrome',width:390,height:844,dpr:2.75,ua:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'},
 {name:'Android 430',width:430,height:932,dpr:2.5,ua:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'},
 {name:'iPhone Safari',width:390,height:844,dpr:3,ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1'},
 {name:'Chrome sin UA móvil',width:390,height:844,dpr:2.5,ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'}
]){
 const mobile=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.dpr,isMobile:true,hasTouch:true,userAgent:device.ua,locale:'es-MX'});
 const page=await mobile.newPage();
 try{
  await page.goto(target,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#works-grid [data-work-card]').length>=26,null,{timeout:20000});
  // Preferencias guardadas de la vista PC anterior no deben afectar el nuevo diseño.
  await page.evaluate(()=>{
   localStorage.setItem('cazami-catalogo-vista','pc');
   localStorage.setItem('cazami-catalogo-vista-v2','pc');
  });
  await page.goto(new URL('?vista=pc',target).href,{waitUntil:'domcontentloaded'});
  const x=await page.evaluate(()=>{
   const card=document.querySelector('#works-grid .work-card');
   const title=card?.querySelector('h3');
   const link=card?.querySelector('.work-card__links a');
   return {
    width:window.innerWidth,
    scrollWidth:document.documentElement.scrollWidth,
    viewport:document.querySelector('meta[name="viewport"]')?.content,
    cols:getComputedStyle(document.querySelector('#works-grid')).gridTemplateColumns.split(' ').length,
    cardWidth:Math.round(card?.getBoundingClientRect().width||0),
    titleFont:parseFloat(getComputedStyle(title).fontSize),
    arrowPseudo:getComputedStyle(link,'::after').content,
    svgPresent:!!link?.querySelector('svg'),
    noViewToggle:!document.querySelector('#catalog-view-toggle'),
    noDesktopClass:!document.documentElement.classList.contains('cazami-desktop-fit'),
    androidClass:document.documentElement.classList.contains('cazami-android'),
    visibleCards:[...document.querySelectorAll('#works-grid [data-work-card]')].filter(node=>!node.hidden).length,
    previewLink:!!card?.querySelector('.work-card__cover[href^="https://"]'),
    compactCard:Math.round(card?.getBoundingClientRect().height||0)
   };
  });
  const issues=[];
  if(x.width!==device.width||x.scrollWidth>device.width+2||!x.viewport?.includes('width=device-width'))issues.push('Viewport natural roto');
  if(x.androidClass)issues.push('No debe existir dependencia del agente Android');
  if(x.cols!==3)issues.push('El teléfono no muestra tres columnas');
  if(x.cardWidth<70||x.cardWidth>165)issues.push('Tarjeta fuera de escala para 3 columnas');
  if(x.titleFont<10.5)issues.push('Nombre demasiado pequeño');
  if(x.visibleCards!==9)issues.push('No aparecen tres filas de tres invitaciones');
  if(!x.previewLink)issues.push('La portada no abre la invitación');
  if(!x.noViewToggle||!x.noDesktopClass)issues.push('Selector o vista antigua permanece');
  if(!x.svgPresent||!['none','normal'].includes(x.arrowPseudo))issues.push('Las flechas no son iconos SVG');
  console.log(device.name+' / escala real',JSON.stringify({...x,issues}));
  if(issues.length)errors++;
  await page.goto(new URL('admin/',target).href,{waitUntil:'domcontentloaded'});
  const adminWidth=await page.evaluate(()=>window.innerWidth);
  if(adminWidth!==device.width){errors++;console.error(device.name+' / administrador con viewport incorrecto: '+adminWidth);}
 }catch(e){errors++;console.error(device.name+' / error:',e.message);}
 finally{await mobile.close();}
}
} finally{await browser.close();}
if(errors){console.error('QA móvil detectó '+errors+' vistas con problemas.');process.exit(1);}
console.log('QA móvil aprobada en '+cases.length+' tamaños de pantalla.');
