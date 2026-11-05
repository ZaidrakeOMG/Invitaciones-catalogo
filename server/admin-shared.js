/** Solo código de servidor. Nunca importar en src/pages o componentes Astro. */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE='cazami_admin';
const SESSION_SECONDS=8*60*60;
const failures=new Map();
const LIMIT=6;
const WINDOW_MS=15*60*1000;

export function send(res,status,payload){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(status).json(payload);
}
export function originAllowed(req){
  const origin=req.headers.origin;
  if(!origin)return false;
  try {return new URL(origin).host===req.headers.host;}catch{return false;}
}
export function configError(){
  if(!process.env.ADMIN_PASSWORD_SCRYPT||!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)return 'Configura ADMIN_PASSWORD_SCRYPT y ADMIN_SESSION_SECRET en Vercel.';
  if(!process.env.GITHUB_TOKEN||!process.env.GITHUB_REPO)return 'Configura GITHUB_TOKEN y GITHUB_REPO en Vercel.';
  return null;
}
export function verifyPassword(pin){
  const config=process.env.ADMIN_PASSWORD_SCRYPT||'';
  const [kind,ns,rs,ps,saltHex,hashHex]=config.split('$');
  if(kind!=='scrypt'||ns!=='16384'||rs!=='8'||ps!=='1'||!saltHex||!hashHex)return false;
  try{
    const expected=Buffer.from(hashHex,'hex');
    if(expected.length!==64)return false;
    const computed=scryptSync(pin,Buffer.from(saltHex,'hex'),64,{N:16384,r:8,p:1});
    return timingSafeEqual(expected,computed);
  }catch{return false;}
}
function signature(value){return createHmac('sha256',process.env.ADMIN_SESSION_SECRET||'').update(value).digest('base64url');}
export function issueSession(req,res){
  const payload=`v1.${Math.floor(Date.now()/1000)+SESSION_SECONDS}.${randomBytes(12).toString('base64url')}`;
  const token=`${payload}.${signature(payload)}`;
  const secure=!/^localhost(?::\d+)?$|^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host||'');
  res.setHeader('Set-Cookie',`${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure?'; Secure':''}`);
}
export function clearSession(req,res){
  const secure=!/^localhost(?::\d+)?$|^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host||'');
  res.setHeader('Set-Cookie',`${COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure?'; Secure':''}`);
}
export function authorized(req){
  if(!process.env.ADMIN_SESSION_SECRET)return false;
  const cookies=(req.headers.cookie||'').split(';').map(c=>c.trim());
  const token=cookies.find(c=>c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1);
  if(!token)return false;
  const parts=token.split('.');if(parts.length!==4||parts[0]!=='v1')return false;
  const payload=parts.slice(0,3).join('.');
  const expected=signature(payload);const received=parts[3];
  if(received.length!==expected.length)return false;
  if(!timingSafeEqual(Buffer.from(received),Buffer.from(expected)))return false;
  const expires=Number(parts[1]);return Number.isSafeInteger(expires)&&expires>Math.floor(Date.now()/1000);
}
function ip(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,80);}
export function isLimited(req){
  const key=ip(req),now=Date.now(),prev=failures.get(key);
  if(!prev||now-prev.start>WINDOW_MS){failures.delete(key);return false;}
  return prev.count>=LIMIT;
}
export function recordFailure(req){const key=ip(req),now=Date.now(),prev=failures.get(key);if(!prev||now-prev.start>WINDOW_MS){failures.set(key,{start:now,count:1});}else prev.count++;if(failures.size>1000){for(const [key,v] of failures){if(now-v.start>WINDOW_MS)failures.delete(key);}}}
export function clearFailures(req){failures.delete(ip(req));}
export async function readJson(req,max=4096){
  const length=Number(req.headers['content-length']||0);
  if(length>max)throw new Error('Archivo o solicitud demasiado grande.');
  if(req.body && typeof req.body==='object')return req.body;
  if(typeof req.body==='string')return JSON.parse(req.body);
  let data='';for await(const chunk of req){data+=chunk.toString();if(data.length>max)throw new Error('Solicitud demasiado grande.');}
  return JSON.parse(data);
}

const empty=()=>({invitaciones:[],pases:[]});
function repoParts(){
  const repo=process.env.GITHUB_REPO||'';if(!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new Error('GITHUB_REPO debe tener el formato usuario/repositorio.');
  return repo;
}
const base=()=>`https://api.github.com/repos/${repoParts()}/contents/`;
const branch=()=>process.env.GITHUB_BRANCH||'main';
async function github(path,options={}){
  const response=await fetch(base()+path+(options.method?'':`?ref=${encodeURIComponent(branch())}`),{
    ...options,
    headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${process.env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})},
    signal:AbortSignal.timeout(12000)
  });
  if(response.status===404&&!options.method)return null;
  const result=await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(`GitHub: ${result.message||response.status}`);error.status=response.status;throw error;}
  return result;
}
export async function getCatalog(){
  const file=await github('public/data/catalogo-adicional.json');
  if(!file)return {data:empty(),sha:undefined};
  if(typeof file.content!=='string')throw new Error('El archivo de catálogo en GitHub no tiene el formato esperado.');
  const data=JSON.parse(Buffer.from(file.content.replace(/\s/g,''),'base64').toString('utf8'));
  if(!Array.isArray(data.invitaciones)||!Array.isArray(data.pases))throw new Error('El catálogo de GitHub tiene datos inválidos.');
  return {data,sha:file.sha};
}
async function put(path,content,message,sha){
  return github(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,content:Buffer.from(content).toString('base64'),branch:branch(),...(sha?{sha}:{})})});
}
export async function updateCatalog(fn){
  for(let attempt=0;attempt<3;attempt++){
    const {data,sha}=await getCatalog();
    const result=fn(data);
    if(result===false)return {updated:false,data};
    try{await put('public/data/catalogo-adicional.json',JSON.stringify(data,null,2)+'\n','CAZAMI: actualizar catálogo desde administración',sha);return {updated:true,data};}
    catch(e){if(e.status!==409||attempt===2)throw e;}
  }
}
export async function uploadPass(id,buffer,ext){
  if(buffer.length>2_500_000)throw new Error('La imagen supera 2.5 MB. Comprímela e intenta de nuevo.');
  const path=`public/passes/nuevos/${id}.${ext}`;
  await put(path,buffer,'CAZAMI: subir imagen de pase');
  return `/passes/nuevos/${id}.${ext}`;
}
export function validImage(buffer){
  if(buffer.length<16||buffer.length>2_500_000)return null;
  if(buffer[0]===0xFF&&buffer[1]===0xD8&&buffer[2]===0xFF)return 'jpg';
  if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
  if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return 'webp';
  return null;
}
