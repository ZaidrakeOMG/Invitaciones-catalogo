/**
 * Genera las portadas del INICIO de las invitaciones del catálogo CAZAMI.
 * Cada archivo es una captura real de la primera pantalla del sitio original,
 * no una fotografía del pase digital.
 *
 * npm run capturar:vistas -- --force
 */
import {chromium} from 'playwright';
import {readFile, mkdir, access} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=process.cwd();
const source=await readFile(resolve(root,'src/data/catalog.ts'),'utf8');
const regex=/"slug":\s*"([^"]+)"[^\n]*?"externalDemo":\s*"(https:\/\/[^"]+)"/g;
const demos=Array.from(source.matchAll(regex),m=>({slug:m[1],url:m[2]}));
if(demos.length!==14){
  console.error(`Se esperaban 14 demos, encontradas ${demos.length}; no se sobrescribirán las portadas.`);
  process.exit(1);
}

const out=resolve(root,'public/intro-previews');
await mkdir(out,{recursive:true});
let browser;
try{browser=await chromium.launch({channel:'chrome',headless:true});}
catch{try{browser=await chromium.launch({headless:true});}
catch(error){
  console.error('Instala Chrome o ejecuta: npx playwright install chromium');
  console.error(error.message);
  process.exit(1);
}}

const context=await browser.newContext({
  viewport:{width:430,height:820},
  deviceScaleFactor:1,
  isMobile:true,
  hasTouch:true,
  locale:'es-MX',
  reducedMotion:'reduce',
  colorScheme:'light',
});
let passed=0,failed=0,skipped=0;

for(const {slug,url} of demos){
  // Zaid y Camila ya tiene su propia portada verificada y configurada.
  if(slug==='zyc-invitacion'){console.log('Conservando portada de referencia: Zaid y Camila');skipped++;continue;}
  const filename=resolve(out,`${slug}.webp`);
  if(!process.argv.includes('--force')){
    try{await access(filename);console.log(`Conservando portada existente: ${slug}`);skipped++;continue;}
    catch{}
  }

  const page=await context.newPage();
  console.log(`Capturando inicio de la carta: ${slug} — ${url}`);
  try{
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    if(!response || response.status()>=400){
      throw new Error(`HTTP ${response?.status()??'sin respuesta'}`);
    }

    await page.waitForTimeout(3000);
    await page.evaluate(async()=>{
      await document.fonts.ready.catch(()=>{});
      window.scrollTo(0,0);
    });

    // Algunas invitaciones abren con un sobre/carta. Abrir la carta para
    // capturar su primera pantalla, sin pulsar opciones de pases o boletos.
    const openLabels=[
      /abrir (mi |la |nuestra )?(invitaci[oó]n|carta|sobre)/i,
      /ver (mi |la |nuestra )?invitaci[oó]n/i,
      /entrar a (mi |la |nuestra )?invitaci[oó]n/i,
    ];
    for(const label of openLabels){
      const button=page.getByRole('button',{name:label}).first();
      if(await button.isVisible().catch(()=>false)){
        await button.click({timeout:2500}).catch(()=>{});
        await page.waitForTimeout(1500);
        break;
      }
    }

    // Abrir sobre o pantalla de bienvenida antes de fotografiar la carta.
    // Coordenadas probadas sobre el viewport móvil 430 x 820.
    const revealPoints={
      'bernardo-xv':[215,400],
      'boda-f-y-a':[215,400],
      'dylan-bautizo-invitacion':[215,412],
      'gael-confirmacion':[215,423],
      'saida-invitacion-xv-year':[215,412],
      'liamsantiagocumple':[215,490],
      'invitacion-romina-xv':[215,595],
    };
    if(revealPoints[slug]){
      const [x,y]=revealPoints[slug];
      await page.mouse.click(x,y,{delay:95});
      await page.waitForTimeout(2800);
    }

    // Nunca mostrar pop-ups de pase o QR como portada.
    await page.addStyleTag({content:`
      .pase-overlay,.pase-modal,.pass-modal,.qr-modal,
      [data-pass-modal],[data-pase-modal],
      [class*="modal-pase"],[id*="modal-pase"],
      [class*="pass-overlay"],[id*="pass-overlay"] { display:none!important; }
    `}).catch(()=>{});

    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({
      path:filename,
      type:'webp',
      quality:84,
      animations:'disabled',
      timeout:20000,
    });
    passed++;
  }catch(error){
    failed++;
    console.warn(`No se pudo capturar ${slug}: ${error.message}`);
  }finally{
    await page.close();
  }
}
await browser.close();
console.log(`Portadas del inicio: ${passed} nuevas, ${skipped} conservadas, ${failed} errores.`);
if(failed)process.exitCode=1;
