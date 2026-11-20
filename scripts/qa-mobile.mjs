import { chromium } from 'playwright';

const target=process.env.CAZAMI_QA_URL||'http://127.0.0.1:4321/';
const cases=[
  {width:320,height:700,columns:1},
  {width:375,height:812,columns:1},
  {width:390,height:844,columns:1},
  {width:430,height:932,columns:1},
  {width:600,height:900,columns:2},
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
} finally{await browser.close();}
if(errors){console.error('QA móvil detectó '+errors+' vistas con problemas.');process.exit(1);}
console.log('QA móvil aprobada en '+cases.length+' tamaños de pantalla.');
