import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync,randomBytes} from 'node:crypto';
import https from 'node:https';
import {EventEmitter} from 'node:events';
import login from '../api/login.js';
import session from '../api/session.js';
import items from '../api/items.js';
import {authorized,verifyPassword,validImage} from '../server/admin-shared.js';
const salt=Buffer.from('000102030405060708090a0b0c0d0e0f','hex');
process.env.ADMIN_PASSWORD_SCRYPT=`scrypt$16384$8$1$${salt.toString('hex')}$${scryptSync('2525',salt,64,{N:16384,r:8,p:1}).toString('hex')}`;
process.env.ADMIN_SESSION_SECRET='long-signed-session-secret-testing-1234567890';
process.env.GITHUB_TOKEN='test-token';
process.env.GITHUB_REPO='owner/project';
process.env.GITHUB_BRANCH='main';
function req(method,body={},cookie='') {return {method,body,headers:{origin:'https://example.com',host:'example.com',cookie,'content-length':'0','x-forwarded-for':`test-${randomBytes(4).toString('hex')}`}};}
function res(){return {headers:{},code:200,setHeader(name,value){this.headers[name.toLowerCase()]=value;},status(v){this.code=v;return this;},json(data){this.data=data;return this;}};}
async function call(handler,request){const response=res();await handler(request,response);return response;}
let current={invitaciones:[],pases:[]},sha='1234',images=new Map();
let lastAuthorization='';
globalThis.fetch=async (url,options={})=>{
 const path=new URL(url).pathname;
 if(!options.method){return {ok:true,status:200,json:async()=>({sha,content:Buffer.from(JSON.stringify(current)).toString('base64')})};}
 if(!path.endsWith('catalogo-adicional.json')){images.set(path,JSON.parse(options.body).content);return {ok:true,status:201,json:async()=>({content:{sha:'new'}})};}
 const obj=JSON.parse(options.body);
 if(obj.sha!==sha)return {ok:false,status:409,json:async()=>({message:'Conflict'})};
 current=JSON.parse(Buffer.from(obj.content,'base64').toString('utf8'));sha+=1;
 return {ok:true,status:200,json:async()=>({content:{sha}})};
};
// El administrador usa HTTPS nativo para evitar errores UND_ERR_INVALID_ARG de Undici.
// Simular https.request en vez de hacer llamadas reales a GitHub durante las pruebas.
https.request=(url,options,callback)=>{
 lastAuthorization=options.headers?.Authorization||'';
 const request=new EventEmitter();
 let payload='';
 request.write=chunk=>{payload+=chunk.toString();return true;};
 request.end=()=>{
   Promise.resolve().then(async()=>{
     const fetchOptions=options.method==='GET'?{}:{method:options.method,body:payload};
     const fake=await globalThis.fetch(url,fetchOptions);
     const response=new EventEmitter();
     response.statusCode=fake.status;
     callback(response);
     response.emit('data',Buffer.from(JSON.stringify(await fake.json())));
     response.emit('end');
   }).catch(error=>request.emit('error',error));
 };
 request.destroy=error=>request.emit('error',error);
 return request;
};
test('scrypt valida el código y no acepta otro',()=>{assert.equal(verifyPassword('2525'),true);assert.equal(verifyPassword('1111'),false);});
test('el acceso rechaza contraseña incorrecta y el servidor firma la sesión',async()=>{
 const invalid=await call(login,req('POST',{password:'0000'}));assert.equal(invalid.code,401);
 const right=await call(login,req('POST',{password:'2525'}));assert.equal(right.code,200);
 const cookie=right.headers['set-cookie'].split(';')[0];
 assert.equal(authorized(req('GET',{},cookie)),true);
 const authenticated=await call(session,req('GET',{},cookie));assert.equal(authenticated.data.authenticated,true);
 const without=await call(items,req('GET'));assert.equal(without.code,401);
});
test('se agrega una invitación y se puede retirar',async()=>{
 const logged=await call(login,req('POST',{password:'2525'}));const cookie=logged.headers['set-cookie'].split(';')[0];
 const bad=await call(items,req('POST',{type:'invitacion',url:'javascript:alert(1)',category:'Bodas'},cookie));assert.equal(bad.code,400);
 const good=await call(items,req('POST',{type:'invitacion',url:'https://muestra.netlify.app/',name:'Ejemplo',category:'XV años'},cookie));assert.equal(good.code,201);
 assert.equal(current.invitaciones[0].name,'Ejemplo');
 const deleted=await call(items,req('DELETE',{type:'invitaciones',id:good.data.item.id},cookie));assert.equal(deleted.code,200);
 assert.equal(current.invitaciones.length,0);
});
test('se sube solo la imagen de un pase, validada por firma',async()=>{
 const logged=await call(login,req('POST',{password:'2525'}));const cookie=logged.headers['set-cookie'].split(';')[0];
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(25)]);
 assert.equal(validImage(png),'png');
 const uploaded=await call(items,req('POST',{type:'pase',image:'data:image/png;base64,'+png.toString('base64')},cookie));
 assert.equal(uploaded.code,201);assert.match(uploaded.data.item.image,/^\/passes\/nuevos\/.*\.png$/);
 assert.equal(current.pases.length,1);assert.equal(images.size,1);
});
test('el servidor rechaza el acceso desde otro origen',async()=>{
 const request=req('POST',{password:'2525'});request.headers.origin='https://evil.example';
 const response=await call(login,request);assert.equal(response.code,403);
});

test('recorta espacios y saltos de línea al final del token de GitHub',async()=>{
 const previous=process.env.GITHUB_TOKEN;
 process.env.GITHUB_TOKEN='test-token\r\n';
 try{
   const response=await call(login,req('POST',{password:'2525'}));
   const cookie=response.headers['set-cookie'].split(';')[0];
   const result=await call(items,req('GET',{},cookie));
   assert.equal(result.code,200);
   assert.equal(lastAuthorization,'Bearer test-token');
 }finally{process.env.GITHUB_TOKEN=previous;}
});
test('detecta saltos de línea dentro del token sin exponer el secreto',async()=>{
 const previous=process.env.GITHUB_TOKEN;
 process.env.GITHUB_TOKEN='test-token\nsegunda-linea';
 try{
   const response=await call(login,req('POST',{password:'2525'}));
   const cookie=response.headers['set-cookie'].split(';')[0];
   const result=await call(items,req('GET',{},cookie));
   assert.equal(result.code,503);
   assert.match(result.data.error,/GITHUB_TOKEN.*caracteres no válidos/);
   assert.ok(!result.data.error.includes('segunda-linea'));
 }finally{process.env.GITHUB_TOKEN=previous;}
});
