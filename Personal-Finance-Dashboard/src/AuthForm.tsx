import { useState, type FormEvent } from 'react';
import { supabase } from './auth';
export default function AuthForm({ mode, changeMode, signedIn }: { mode: 'signin'|'signup'; changeMode: (mode:'signin'|'signup')=>void; signedIn:()=>void }) {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent) {
  e.preventDefault();if(!supabase){setMessage('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild. No account was created or signed in.');return;}
  setBusy(true);setMessage('');
  try {
   if(mode==='signin'){
    const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin,shouldCreateUser:false}});
    if(error)throw error;setMessage('Sign-in link requested. Check your inbox.');
   }else{
    const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}});
    if(error)throw error;if(data.session)signedIn();else setMessage('Registration submitted. If email confirmation is required, check your inbox before signing in.');
   }
  }catch(e){setMessage(e instanceof Error?e.message:'Authentication request failed.');}finally{setBusy(false);}
 }
 return <section aria-label={mode==='signup'?'Create account form':'Sign in form'} className="auth-panel">
  <div className="auth-tabs"><button className={mode==='signin'?'selected':''} onClick={()=>{changeMode('signin');setMessage('');}}>Sign in</button><button className={mode==='signup'?'selected':''} onClick={()=>{changeMode('signup');setMessage('');}}>Create account</button></div>
  <h3>{mode==='signup'?'Create your FinanceFlow account':'Sign in to your account'}</h3>
  {!supabase&&<p className="auth-config-note">Supabase is not configured. You can explore the demo; real accounts require your own Supabase setup.</p>}
  <button className="primary wide google-button" disabled={busy} onClick={async()=>{if(!supabase){setMessage('Google OAuth requires configured Supabase credentials. No sign-in took place.');return;}setBusy(true);try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error)setMessage(error.message);}catch{setMessage('Google sign-in request failed. Try again.');}finally{setBusy(false);}}}><span aria-hidden="true" className="google-mark">G</span>Continue with Google</button>
  <div className="divider">or use your email address</div>
  <form onSubmit={submit}><label>Email address<input autoFocus type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>{mode==='signup'&&<label>Password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>}<button className="secondary wide" disabled={busy}>{busy?'Please wait…':mode==='signup'?'Create account':'Send sign-in link'}</button></form>
  {message&&<div className="notice" role="status">{message}</div>}
 </section>;
}
