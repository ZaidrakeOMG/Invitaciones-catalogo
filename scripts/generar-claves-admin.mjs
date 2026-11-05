import {randomBytes,scryptSync} from 'node:crypto';
const pin=process.argv[2];
if(!pin||pin.length<4){console.error('Uso: node scripts/generar-claves-admin.mjs 2525');process.exit(1);}
const salt=randomBytes(16),hash=scryptSync(pin,salt,64,{N:16384,r:8,p:1});
console.log('\nCopia estas variables en Vercel → Project → Settings → Environment Variables:\n');
console.log(`ADMIN_PASSWORD_SCRYPT=scrypt$16384$8$1$${salt.toString('hex')}$${hash.toString('hex')}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(40).toString('hex')}`);
console.log('\nNo pongas estas claves en GitHub ni en código público.');
