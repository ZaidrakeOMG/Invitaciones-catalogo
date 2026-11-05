import {send,originAllowed,clearSession} from '../server/admin-shared.js';
export default function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Método no permitido.'});
  if(!originAllowed(req))return send(res,403,{error:'Origen no permitido.'});
  clearSession(req,res);return send(res,200,{ok:true});
}
