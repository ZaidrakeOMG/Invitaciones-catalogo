/**
 * Capturas de invitaciones DESPUÉS de abrir su sobre o pantalla de bienvenida.
 * Cada fotografía viene de su URL HTTPS, nunca de /passes/.
 * Node 22 + Playwright Chromium. Se ejecuta desde GitHub Actions.
 */
import { chromium } from 'playwright';
import { readFile, mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=process.cwd();
const code=await readFile(resolve(root,'src/data/catalog.ts'),'utf8');
const invitePattern=/"slug":\s*"([^"]+)"[^\n]*?"externalDemo":\s*"(https:\/\/[^"]+)"/g;
const invitations=[...code.matchAll(invitePattern)].map(([,slug,url])=>({slug,url}));
try {
  const additional=JSON.parse(await readFile(resolve(root,'public/data/catalogo-adicional.json'),'utf8'));
  for(const item of additional.invitaciones||[]){
    if(/^[\da-f-]{36}$/i.test(item.id)&&/^https:\/\//.test(item.url)){
      invitations.push({slug:'nuevo-'+item.id,url:item.url});
    }
  }
} catch(error) {
  if(error?.code!=='ENOENT')console.warn('No se pudo leer catálogo adicional:',error.message);
}
if(!invitations.length)throw Error('No se encontraron enlaces de invitaciones.');
const folder=resolve(root,'public/invitation-previews');
await mkdir(folder,{recursive:true});
const patterns=[
  /abrir\s+(?:el\s+)?sobre/i,
  /abrir\s+(?:la\s+)?(?:invitaci[oó]n|carta|tarjeta)/i,
  /abre\s+(?:el\s+)?sobre/i,
  /ver\s+(?:la\s+)?invitaci[oó]n/i,
  /open\s+(?:the\s+)?(?:invitation|envelope)/i,
  /toca\s+(?:para\s+)?abrir/i,
  /haz\s+clic\s+(?:para\s+)?abrir/i,
  /descubrir\s+(?:la\s+)?(?:invitaci[oó]n|sorpresa)/i,
  /^entrar$/i,
  /^continuar$/i,
  /^comenzar$/i,
  /^abrir$/i,
  /^open$/i,
];
const looksLikeOpen=text=>patterns.some(regex=>regex.test(text));
const selectors=[
  '[data-open-envelope]','[data-action="open"]','[data-open]',
  '#open-envelope','#openInvitation','#open-invitation',
  '.open-envelope','.open-invitation','.open-letter',
  '.envelope-wrapper','.envelope-container','.envelope',
  '.sobre-container','.sobre-wrapper','.sobre',
  '[id*="sobre"]','[id*="envelope"]',
  '[class*="sobre"]','[class*="envelope"]',
  'button','[role="button"]'
].join(',');
async function openInvitation(page){
  await page.waitForTimeout(2100);
  let clicked=0;
  for(let step=0;step<3;step++){
    const choices=await page.locator(selectors).evaluateAll(elements=>elements.map((el,index)=>{
      const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
      if(rect.width<24||rect.height<20||rect.top>innerHeight||rect.bottom<0||style.visibility==='hidden'||style.display==='none'||Number(style.opacity)<0.1)return null;
      const name=[el.textContent?.trim().slice(0,180),el.getAttribute('aria-label'),el.id,el.className?.toString()].filter(Boolean).join(' ');
      const box=rect.width*rect.height;
      // Prefer genuine open CTA, not links to WhatsApp, registries or RSVP.
      if(/whatsapp|ubicaci[oó]n|location|instagram|facebook|confirmar\s+asistencia|rsvp|google maps/i.test(name))return null;
      const button=el.matches('button,[role="button"]')?5:0;
      const textBonus=/abrir|abre|open|entrar|continuar|descubrir/i.test(name)?15:0;
      const envelopeBonus=/envelope|sobre|carta|letter/i.test(name)?9:0;
      const imageBonus=el.querySelector('svg,img')?1:0;
      if(!textBonus&&!envelopeBonus)return null;
      return {index,score:button+textBonus+envelopeBonus+imageBonus+(box<innerWidth*innerHeight*.65?1:0),name:name.slice(0,180)};
    }).filter(Boolean)));
    choices.sort((a,b)=>b.score-a.score);
    let didClick=false;
    for(const option of choices.slice(0,12)){
      const candidate=page.locator(selectors).nth(option.index);
      try {
        const label=option.name;
        if(!looksLikeOpen(label)&&!/envelope|sobre|carta|letter/i.test(label))continue;
        await candidate.click({timeout:1800,force:true});
        console.log('  Sobre/entrada abierto:',label.slice(0,100));
        clicked++;
        didClick=true;
        await page.waitForTimeout(2200);
        break;
      } catch {}
    }
    if(!didClick){
      // Portadas que abren tocando la propia ilustración o su texto.
      const text=page.getByText(/abrir (?:el sobre|invitaci[oó]n|la carta)|toca para abrir|abre (?:el )?sobre/i).first();
      try {
        if(await text.count()&&await text.isVisible()){
          await text.click({timeout:1200,force:true});
          clicked++;
          await page.waitForTimeout(2200);
          continue;
        }
      } catch {}
      break;
    }
  }
  return clicked;
}
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:430,height:780},
  deviceScaleFactor:1.5,
  isMobile:true,hasTouch:true,
  locale:'es-MX',
  reducedMotion:'reduce',
});
let created=0,failed=0,skipped=0;
for(const {slug,url} of invitations){
  const filename=resolve(folder,slug+'.webp');
  if(!process.argv.includes('--force')){
    try {await access(filename);skipped++;continue;}catch {}
  }
  const page=await context.newPage();
  try {
    console.log('Invitación:',slug,url);
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
    const opened=await openInvitation(page);
    console.log('  Interacciones de apertura:',opened);
    await page.waitForLoadState('networkidle',{timeout:6000}).catch(()=>{});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(1700);
    await page.screenshot({path:filename,type:'webp',quality:78,animations:'disabled',timeout:20000});
    created++;
    console.log('  Vista posterior al sobre guardada:',slug);
  } catch(error) {
    failed++;
    console.warn('  Error de captura:',slug,error.message);
  } finally {
    await page.close();
  }
}
await browser.close();
console.log('Invitaciones capturadas:',created,'existentes:',skipped,'fallidas:',failed);
if(!created&&!skipped)process.exitCode=1;
