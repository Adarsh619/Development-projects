import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { validateTransaction, totals, type State } from '../../src/domain';
const resources=['accounts','transactions','budgets','goals','bills','jobs'] as const;
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function validateSnapshot(value:unknown): asserts value is State {
 if(!value||typeof value!=='object')throw new Error('Expected a workspace object.');
 const s=value as State;if(s.version!==1)throw new Error('Unsupported workspace version.');
 for(const r of resources){if(!Array.isArray(s[r])||s[r].length>10000)throw new Error(`Invalid ${r} collection.`);const ids=new Set<string>();for(const item of s[r]){if(typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id))throw new Error('Invalid or duplicate item ID.');ids.add(item.id);}}
 const str=(v:unknown,max=300)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 const num=(v:unknown,min=0)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=1e12;
 const date=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 for(const a of s.accounts)if(!str(a.name,100)||!str(a.type,50)||!num(a.opening,-1e12)||!str(a.color,30))throw new Error('Invalid account.');
 for(const t of s.transactions){if(!['income','expense','transfer'].includes(t.kind)||!str(t.merchant,120)||!str(t.category,100)||!num(t.amount,.01)||t.note&&(!str(t.note,300)))throw new Error('Invalid transaction.');validateTransaction(t,s.accounts);}
 const cats=new Set<string>();for(const b of s.budgets){if(!str(b.category,100)||cats.has(b.category)||!num(b.limit,.01)||!num(b.carry)||typeof b.rollover!=='boolean')throw new Error('Invalid budget.');cats.add(b.category);}
 for(const g of s.goals)if(!str(g.name,100)||!num(g.target,.01)||!num(g.saved)||!date(g.deadline)||!str(g.emoji,20))throw new Error('Invalid goal.');
 for(const b of s.bills)if(!str(b.name,100)||!num(b.amount,.01)||!date(b.date)||!str(b.category,100)||!['monthly','yearly'].includes(b.frequency)||typeof b.active!=='boolean'||!s.accounts.some(a=>a.id===b.accountId))throw new Error('Invalid bill.');
 for(const j of s.jobs)if(!str(j.name,100)||!['queued','failed','simulated'].includes(j.status)||!Number.isFinite(Date.parse(j.date))||!str(j.detail,500)||!Number.isInteger(j.attempts)||j.attempts<0)throw new Error('Invalid job.');
}
export default async (request:Request,_context:Context)=>{
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;if(!url||!key)return json({error:'Backend Supabase configuration required.'},503);
 const authorization=request.headers.get('authorization');if(!authorization?.startsWith('Bearer '))return json({error:'Authentication required.'},401);
 const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(authorization.slice(7));if(error||!data.user)return json({error:'Invalid or expired session.'},401);
 const redisConfigured=Boolean(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN);
 if(redisConfigured){try{const redis=Redis.fromEnv();const count=Number(await redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n",[`financeflow:rate:${data.user.id}`],[]));if(count>60)return json({error:'Rate limit reached. Try again in one minute.'},429);}catch{return json({error:'Rate limiter unavailable. Try later.'},503);}}
 const path=new URL(request.url).pathname.replace(/^\/api\/?|^\/\.netlify\/functions\/api\/?/,'').split('/').filter(Boolean);const resource=path[0]||'health';const id=path[1];
 if(resource==='health')return json({authenticated:true,redis:redisConfigured?'configured; request rate check completed':'not configured',n8n:'not checked',python:'not checked'});
 async function snapshot(){const entries=await Promise.all(resources.map(async r=>{const {data:rows,error}=await client.from(r).select('payload').eq('user_id',data.user!.id);if(error)throw error;return [r,(rows||[]).map(row=>row.payload)]}));return {version:1,...Object.fromEntries(entries)} as State;}
 try{
  if(resource==='reports'&&request.method==='GET'){
   const month=new URL(request.url).searchParams.get('month')||new Date().toISOString().slice(0,7);
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return json({error:'Invalid month.'},400);
   // Snapshot fingerprint prevents stale cache reads after a workspace edit.
   const s=await snapshot();const {createHash}=await import('node:crypto');const hash=createHash('sha256').update(JSON.stringify(s.transactions)).digest('hex');
   const cacheKey=`financeflow:report:${data.user.id}:${month}:${hash}`;
   const redis=redisConfigured?Redis.fromEnv():null;
   if(redis){const cached=await redis.get(cacheKey);if(cached)return json({result:cached,cache:'hit'});}
   const result={month,currency:'INR',...totals(s.transactions.filter(t=>t.date.startsWith(month))),assumptions:'Recorded transactions only; transfers excluded.'};
   if(redis)await redis.set(cacheKey,result,{ex:300});return json({result,cache:redis?'miss; stored for 300 seconds':'disabled'});
  }
  if(resource==='snapshot'){
   if(request.method==='GET')return json(await snapshot());
   if(request.method!=='PUT')return json({error:'Method not allowed.'},405);
   const body=await readBody(request);validateSnapshot(body);const {error}=await client.rpc('replace_workspace',{workspace:body});if(error)throw error;return json({synced:true});
  }
  if(!resources.includes(resource as typeof resources[number]))return json({error:'Unknown resource.'},404);
  if(request.method==='GET'){let query=client.from(resource).select('payload').eq('user_id',data.user.id);if(id)query=query.eq('id',id);const {data:rows,error}=await query;if(error)throw error;if(id&&!rows.length)return json({error:'Not found.'},404);return json(id?rows[0].payload:rows.map(row=>row.payload));}
  // Validate the entire candidate workspace before modifying any row. The RPC runs atomically.
  const s=await snapshot();const r=resource as typeof resources[number];const old=s[r] as {id:string}[];
  if(request.method==='DELETE'){if(!id)return json({error:'Item ID required.'},400);if(!old.some(x=>x.id===id))return json({error:'Not found.'},404);Object.assign(s,{[r]:old.filter(x=>x.id!==id)});}
  else if(request.method==='POST'||request.method==='PUT'){const item=await readBody(request) as {id:string};if(!item||typeof item.id!=='string'||(id&&id!==item.id))throw new Error('Matching item ID required.');if(request.method==='POST'&&old.some(x=>x.id===item.id))return json({error:'ID already exists.'},409);if(request.method==='PUT'&&!old.some(x=>x.id===item.id))return json({error:'Not found.'},404);Object.assign(s,{[r]:[...old.filter(x=>x.id!==item.id),item]});}
  else return json({error:'Method not allowed.'},405);
  validateSnapshot(s);const {error}=await client.rpc('replace_workspace',{workspace:s});if(error)throw error;return json({saved:true},request.method==='POST'?201:200);
 }catch(e){const message=e instanceof Error?e.message:'Database request failed.';return json({error:message.includes('Invalid')||message.includes('required')||message.includes('Choose')||message.includes('Amount')||message.includes('Expected')||message.includes('Unsupported')?message:'Request failed; check backend logs and schema configuration.'},400);}
};
async function readBody(request:Request){const text=await request.text();if(text.length>2_000_000)throw new Error('Invalid body: maximum 2 MB.');return JSON.parse(text);}
export const config={path:'/api/*'};
