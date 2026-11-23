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
// Android real: comprobar que el navegador adapta el lienzo de PC al ancho físico.
const android=await browser.newContext({
 viewport:{width:390,height:844},deviceScaleFactor:2.75,
 isMobile:true,hasTouch:true,
 userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
 locale:'es-MX'
});
const androidPage=await android.newPage();
try{
 const browserIssues=[];
 androidPage.on('pageerror',error=>browserIssues.push(error.message));
 await androidPage.goto(target,{waitUntil:'domcontentloaded',timeout:30000});
 await androidPage.waitForFunction(()=>document.querySelectorAll('#works-grid [data-work-card]').length>=26,null,{timeout:20000});
 const read=()=>androidPage.evaluate(()=>{
  const grid=document.querySelector('#works-grid');
  const dock=document.querySelector('.mobile-dock');
  const featured=document.querySelector('#featured-edition-grid');
  const toggle=document.getElementById('catalog-view-toggle');
  return {
    physicalWidth:screen.width,
    layoutWidth:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    viewportMeta:document.querySelector('meta[name="viewport"]')?.content,
    desktopClass:document.documentElement.classList.contains('cazami-desktop-fit'),
    columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    featuredColumns:getComputedStyle(featured).gridTemplateColumns.split(' ').length,
    dockVisible:getComputedStyle(dock).display!=='none',
    toggleVisible:toggle&&!toggle.hidden,
    toggleText:toggle?.textContent?.trim(),
    firstCard:grid.querySelector('[data-work-card] h3')?.textContent,
  };
 });
 const pc=await read();
 const issues=[];
 if(!pc.desktopClass||!pc.viewportMeta.includes('width=1080'))issues.push('Android no activó el lienzo de PC');
 if(pc.layoutWidth<1000||pc.layoutWidth>1150)issues.push('Ancho virtual incorrecto '+pc.layoutWidth);
 if(pc.documentWidth>pc.layoutWidth+2)issues.push('Desborde horizontal '+pc.documentWidth);
 if(pc.columns!==3)issues.push('No hay tres tarjetas por fila en modo PC: '+pc.columns);
 if(pc.featuredColumns!==2)issues.push('Falta mosaico editorial de PC');
 if(pc.dockVisible)issues.push('Dock móvil aparece en vista PC');
 if(!pc.toggleVisible||pc.toggleText!=='Vista móvil')issues.push('Selector para regresar a móvil no visible');
 if(!/Amor Eterno/i.test(pc.firstCard||''))issues.push('Se alteró el orden de invitaciones');
 console.log('Android / PC escalada',JSON.stringify({ ...pc,issues }));
 if(issues.length)errors++;
 // Volver a una sola columna sin perder el contenido ni el administrador.
 await androidPage.locator('#catalog-view-toggle').click();
 await androidPage.waitForFunction(()=>window.innerWidth<500&&!document.documentElement.classList.contains('cazami-desktop-fit'),null,{timeout:15000});
 const mobile=await read();
 const mobileIssues=[];
 if(mobile.columns!==1)mobileIssues.push('No vuelve a una columna en vista móvil');
 if(!mobile.dockVisible)mobileIssues.push('No recuperó el menú táctil');
 if(!mobile.toggleVisible||mobile.toggleText!=='Vista PC')mobileIssues.push('No permite regresar a PC');
 if(browserIssues.length)mobileIssues.push('Errores del navegador: '+browserIssues.join('; ').slice(0,300));
 console.log('Android / vista móvil',JSON.stringify({...mobile,issues:mobileIssues}));
 if(mobileIssues.length)errors++;
 await androidPage.locator('#catalog-view-toggle').click();
 await androidPage.waitForFunction(()=>window.innerWidth>=1000&&document.documentElement.classList.contains('cazami-desktop-fit'),null,{timeout:15000});
 await androidPage.goto(new URL('admin/',target).href,{waitUntil:'domcontentloaded'});
 const adminWidth=await androidPage.evaluate(()=>window.innerWidth);
 if(adminWidth>=600){errors++;console.error('El administrador se escaló accidentalmente a '+adminWidth);}
 else console.log('Android / administrador conserva vista móvil:',adminWidth);
}catch(error){errors++;console.error('QA Android fallida: '+error.message);}
finally{await android.close();}
// Verificar también iPhone y el enlace directo ?vista=pc,
// incluida la preferencia antigua que anteriormente bloqueaba el escalado.
const iphone=await browser.newContext({
 viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
 locale:'es-MX'
});
const iphonePage=await iphone.newPage();
try{
 await iphonePage.goto(target,{waitUntil:'domcontentloaded'});
 await iphonePage.evaluate(()=>localStorage.setItem('cazami-catalogo-vista','movil'));
 await iphonePage.reload({waitUntil:'domcontentloaded'});
 const pc=await iphonePage.evaluate(()=>({
   width:window.innerWidth,
   mode:document.documentElement.dataset.cazamiMode,
   version:document.documentElement.dataset.cazamiVersion,
   cols:getComputedStyle(document.querySelector('#works-grid')).gridTemplateColumns.split(' ').length,
   toggle:document.getElementById('catalog-view-toggle')?.textContent?.trim()
 }));
 const issues=[];
 if(pc.width!==1080||pc.cols!==3||pc.mode!=='pc'||pc.toggle!=='Vista móvil'||pc.version!=='pc2-20261123')
   issues.push('iPhone no recibió vista PC predeterminada con preferencia antigua');
 await iphonePage.goto(new URL('?vista=movil',target).href,{waitUntil:'domcontentloaded'});
 const mobile=await iphonePage.evaluate(()=>({
   width:window.innerWidth,
   mode:document.documentElement.dataset.cazamiMode,
   cols:getComputedStyle(document.querySelector('#works-grid')).gridTemplateColumns.split(' ').length
 }));
 if(mobile.width!==390||mobile.cols!==1||mobile.mode!=='movil')
   issues.push('El parámetro ?vista=movil no cambia de vista');
 await iphonePage.goto(new URL('?vista=pc',target).href,{waitUntil:'domcontentloaded'});
 const forced=await iphonePage.evaluate(()=>({
   width:window.innerWidth,
   mode:document.documentElement.dataset.cazamiMode,
   cols:getComputedStyle(document.querySelector('#works-grid')).gridTemplateColumns.split(' ').length
 }));
 if(forced.width!==1080||forced.cols!==3||forced.mode!=='pc')
   issues.push('El parámetro ?vista=pc no fuerza el escalado');
 console.log('iPhone / PC predeterminada, ajustes y enlaces',JSON.stringify({pc,mobile,forced,issues}));
 if(issues.length)errors++;
}catch(error){errors++;console.error('QA iPhone fallida:',error.message);}
finally{await iphone.close();}
} finally{await browser.close();}
if(errors){console.error('QA móvil detectó '+errors+' vistas con problemas.');process.exit(1);}
console.log('QA móvil aprobada en '+cases.length+' tamaños de pantalla.');
