import {send,authorized,configError} from '../server/admin-shared.js';
export default function handler(req,res){
  if(req.method!=='GET')return send(res,405,{error:'Método no permitido.'});
  return send(res,200,{authenticated:!configError()&&authorized(req)});
}
