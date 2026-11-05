import {randomUUID} from 'node:crypto';
import {send,originAllowed,configError,authorized,readJson,getCatalog,updateCatalog,uploadPass,validImage} from '../server/admin-shared.js';
const allowedCategories=new Set(['Bodas','XV años','Celebraciones','Sacramentos']);
const safeUrl=(value)=>{try{const url=new URL(value);if(url.protocol!=='https:'||!url.hostname.includes('.')||url.username||url.password||url.port)return null;return url.href;}catch{return null;}};
const defaultName=(url)=>{const host=new URL(url).hostname.replace(/^www\./,'').split('.')[0];return host.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).slice(0,90)||'Invitación';};
export default async function handler(req,res){
  if(!['GET','POST','DELETE'].includes(req.method))return send(res,405,{error:'Método no permitido.'});
  if(req.method!=='GET'&&!originAllowed(req))return send(res,403,{error:'Origen no permitido.'});
  const error=configError();if(error)return send(res,503,{error});
  if(!authorized(req))return send(res,401,{error:'Debes iniciar sesión.'});
  try{
    if(req.method==='GET'){const {data}=await getCatalog();return send(res,200,data);}
    if(req.method==='DELETE'){
      const {type,id}=await readJson(req,1000);
      if(!['invitaciones','pases'].includes(type)||typeof id!=='string'||!/^[0-9a-f-]{36}$/.test(id))return send(res,400,{error:'Datos incorrectos.'});
      const result=await updateCatalog(data=>{const old=data[type].length;data[type]=data[type].filter(item=>item.id!==id);return data[type].length!==old;});
      return send(res,result.updated?200:404,result.updated?{ok:true}:{error:'No se encontró el trabajo.'});
    }
    const body=await readJson(req,3_700_000);
    if(body.type==='invitacion'){
      const url=safeUrl(body.url),category=body.category;
      const name=(typeof body.name==='string'?body.name.trim():'')|| (url?defaultName(url):'');
      if(!url||!allowedCategories.has(category)||name.length>90)return send(res,400,{error:'Indica una URL HTTPS válida, nombre y categoría.'});
      const item={id:randomUUID(),name,category,url};
      await updateCatalog(data=>{if(data.invitaciones.length>=150)throw new Error('Límite de invitaciones alcanzado.');if(data.invitaciones.some(x=>x.url===url))throw new Error('Esa invitación ya existe.');data.invitaciones.push(item);});
      return send(res,201,{ok:true,item});
    }
    if(body.type==='pase'){
      if(typeof body.image!=='string'||!/^data:image\/(?:jpeg|png|webp);base64,/.test(body.image))return send(res,400,{error:'Sube una imagen JPG, PNG o WEBP.'});
      const base64=body.image.split(',')[1];
      if(base64.length>3_400_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))return send(res,413,{error:'La imagen es demasiado grande.'});
      const buffer=Buffer.from(base64,'base64'),ext=validImage(buffer);
      if(!ext)return send(res,400,{error:'La imagen no es válida o supera 2.5 MB.'});
      const id=randomUUID();const image=await uploadPass(id,buffer,ext);const item={id,image};
      await updateCatalog(data=>{if(data.pases.length>=150)throw new Error('Límite de pases alcanzado.');data.pases.push(item);});
      return send(res,201,{ok:true,item});
    }
    return send(res,400,{error:'Tipo de trabajo no válido.'});
  }catch(e){
    const message=e instanceof Error?e.message:'Error inesperado.';
    return send(res,e?.status===401?502: e?.status===403?502: e?.status===429?503:500,{error:message});
  }
}
