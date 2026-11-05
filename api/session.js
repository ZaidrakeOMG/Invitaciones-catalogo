import {send,authorized,configError} from '../server/admin-shared.js';
export default function handler(req,res){
  if(req.method!=='GET')return send(res,405,{error:'Método no permitido.'});
  const error=configError();
  return send(res,200,{authenticated:!error&&authorized(req),configurationRequired:Boolean(error)});
}
