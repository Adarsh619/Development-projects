import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase=url&&key?createClient(url,key):null;
export async function api(path:string,method='GET',body?:unknown) {
 if(!supabase)throw new Error('Supabase is not configured.');
 const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Sign in first.');
 const response=await fetch(`/api/${path}`,{method,headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Request failed');return result;
}
