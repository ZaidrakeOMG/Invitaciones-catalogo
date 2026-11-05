import {send,originAllowed,configError,readJson,verifyPassword,issueSession,isLimited,recordFailure,clearFailures} from '../server/admin-shared.js';
export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Método no permitido.'});
  if(!originAllowed(req))return send(res,403,{error:'Origen no permitido.'});
  const error=configError();if(error)return send(res,503,{error});
  if(isLimited(req))return send(res,429,{error:'Demasiados intentos. Intenta más tarde.'});
  try{
    const {password}=await readJson(req,200);
    if(typeof password!=='string'||password.length>100||!verifyPassword(password)){recordFailure(req);return send(res,401,{error:'Código incorrecto.'});}
    clearFailures(req);issueSession(req,res);return send(res,200,{ok:true});
  }catch{return send(res,400,{error:'Solicitud inválida.'});}
}
