import { useEffect, useRef, useState } from 'react';
type Action = { label: string; run: () => void };
export function accountActionLabels(email: string, cloud: boolean): string[] {
 return [...(email ? ['Account settings', 'Sign out'] : ['Sign in', 'Create account']), ...(!cloud ? ['Exit demo'] : [])];
}
export default function AccountMenu({ email, cloud, onAuth, onSettings, onSignOut, onExit }: {
 email: string; cloud: boolean; onAuth: (mode: 'signin' | 'signup') => void;
 onSettings: () => void; onSignOut: () => void; onExit: () => void;
}) {
 const [open, setOpen] = useState(false);
 const root = useRef<HTMLDivElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 const menu = useRef<HTMLDivElement>(null);
 const handlers: Record<string, () => void> = { 'Account settings': onSettings, 'Sign out': onSignOut, 'Sign in': () => onAuth('signin'), 'Create account': () => onAuth('signup'), 'Exit demo': onExit };
 const actions: Action[] = accountActionLabels(email,cloud).map(label=>({label,run:handlers[label]}));
 function close(restore = false) { setOpen(false); if (restore) trigger.current?.focus(); }
 useEffect(() => {
  if (!open) return;
  menu.current?.querySelector<HTMLButtonElement>('[role=menuitem]')?.focus();
  const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) close(); };
  document.addEventListener('pointerdown', outside);
  return () => document.removeEventListener('pointerdown', outside);
 }, [open]);
 return <div className="account-menu-root" ref={root}>
  <button className="top-avatar account-trigger" ref={trigger} aria-label="Open account menu" aria-haspopup="menu" aria-expanded={open} aria-controls="account-menu" title={email || 'Aarav Patel · fictional demo profile'} onClick={() => setOpen(!open)} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); } }}>{email ? email.slice(0,2).toUpperCase() : 'AP'}</button>
  {open && <div className="account-dropdown" id="account-menu" role="menu" aria-label="Account" ref={menu} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }} onKeyDown={e => {
   if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
   const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]') || []);
   const index = items.indexOf(document.activeElement as HTMLButtonElement);
   if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
    e.preventDefault(); const next = e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length; items[next]?.focus();
   }
  }}>
   <div className="account-menu-label"><strong>{email || 'Aarav Patel'}</strong><small>{email ? 'Signed in to Supabase' : 'Fictional demo profile · not your identity'}</small></div>
   {actions.map(action => <button key={action.label} role="menuitem" onClick={() => { close(); action.run(); }}>{action.label}</button>)}
  </div>}
 </div>;
}
