/**
 * Captura real de portadas de sitios de invitaciones.
 * No mezcla pases. Las capturas SOLO se guardan en public/invitation-previews/.
 * Ejecutar npm run capturar:vistas (o con --force para actualizar todas).
 */
import { chromium } from 'playwright';
import { readFile, mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const cwd=process.cwd();
const catalog=await readFile(resolve(cwd,'src/data/catalog.ts'),'utf8');
const pattern=/"slug":\s*"([^"]+)"[^\n]*?"externalDemo":\s*"(https:\/\/[^"]+)"/g;
const demos=[...catalog.matchAll(pattern)].map(m=>({slug:m[1],url:m[2]}));
try{
 const extras=JSON.parse(await readFile(resolve(cwd,'public/data/catalogo-adicional.json'),'utf8'));
 for(const invite of extras.invitaciones||[]){
   if(/^[0-9a-f-]{36}$/i.test(invite.id)&&/^https:\/\//.test(invite.url))
     demos.push({slug:`nuevo-${invite.id}`,url:invite.url});
 }
}catch{}
if(!demos.length)throw Error('No se encontraron demos de invitaciones');
const out=resolve(cwd,'public/invitation-previews');
await mkdir(out,{recursive:true});
let browser;
try{browser=await chromium.launch({headless:true});}
catch{browser=await chromium.launch({channel:'chrome',headless:true});}
const context=await browser.newContext({viewport:{width:430,height:760},deviceScaleFactor:1.3,isMobile:true,hasTouch:true,locale:'es-MX',reducedMotion:'reduce'});
let passed=0, failed=0, skipped=0;
for(const {slug,url} of demos){
 const filename=resolve(out,`${slug}.webp`);
 if(!process.argv.includes('--force')){
  try{await access(filename);skipped++;continue;}catch{}
 }
 const page=await context.newPage();
 try{
  console.log('Capturando invitación',slug,url);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
  await page.waitForTimeout(2600);
  await page.screenshot({path:filename,type:'webp',quality:79,animations:'disabled',timeout:20000});
  passed++;
 }catch(e){failed++;console.warn('Captura no disponible:',slug,e.message);}
 finally{await page.close();}
}
await browser.close();
console.log(`Capturas nuevas: ${passed}; existentes: ${skipped}; fallidas: ${failed}`);
if(failed===demos.length)process.exitCode=1;
