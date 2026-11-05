/**
 * Captura pantallas REALES de las URLs públicas del portafolio.
 * No requiere proyectos ZIP. Ejecución opcional: npm run capturar:vistas
 * Usa Chrome local si está instalado, o Playwright Chromium si se instaló.
 */
import { chromium } from 'playwright';
import { readFile, mkdir, access } from 'node:fs/promises';
import {resolve} from 'node:path';

const projectRoot=process.cwd();
const source=await readFile(resolve(projectRoot,'src/data/catalog.ts'),'utf8');
const regex=/"slug":\s*"([^"]+)"[^\n]*?"externalDemo":\s*"(https:\/\/[^\"]+)"/g;
const demos=Array.from(source.matchAll(regex),m=>({slug:m[1],url:m[2]}));
if(demos.length<1){console.error('No se encontraron las invitaciones en src/data/catalog.ts');process.exit(1);}
const out=resolve(projectRoot,'public/previews-real');
await mkdir(out,{recursive:true});
let browser;
try{browser=await chromium.launch({channel:'chrome',headless:true});}
catch{try{browser=await chromium.launch({headless:true});}
catch(error){console.error('No se encontró Chrome o Chromium. Ejecuta: npx playwright install chromium');console.error(error.message);process.exit(1);}}
const context=await browser.newContext({viewport:{width:451,height:780},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'es-MX', reducedMotion:'reduce'});
let passed=0, failed=0;
for(const {slug,url} of demos){
  const filename=resolve(out,`${slug}.webp`);
  if(!process.argv.includes('--force')){
    try{await access(filename);console.log(`Conservando captura existente: ${slug} (utiliza --force para reemplazarla)`);continue;}catch{}
  }
  const page=await context.newPage();
  console.log(`Capturando: ${slug} — ${url}`);
  try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
    await page.waitForTimeout(2800);
    await page.screenshot({path:filename,type:'webp',quality:86,animations:'disabled',timeout:15000});
    passed++;
  }catch(error){failed++;console.warn(`No fue posible capturar ${slug}: ${error.message}`);}
  finally{await page.close();}
}
await browser.close();
console.log(`Listo: ${passed} capturas reales, ${failed} fallos. Vuelve a publicar en Vercel si agregaste nuevas imágenes.`);
if(!passed)process.exitCode=1;
