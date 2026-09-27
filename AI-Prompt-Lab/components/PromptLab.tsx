"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Bot, Plus, Search, File, FileText, Pencil, Code2, GitBranch, BriefcaseBusiness, ChevronDown, ChevronUp, Share2, Bookmark, MoreHorizontal, Copy, ThumbsUp, ThumbsDown, Send, X, Sun, Moon, Monitor, Menu, SlidersHorizontal, Check, Trash2, LogOut, Settings, ArrowRight, Sparkles, BookOpen, ShieldCheck, CircleHelp, Paperclip, FolderOpen, Plug, Volume2 } from "lucide-react";
import { seedChats, type Conversation, type Message, type SavedPrompt } from "@/lib/demo";
import DriveConnector from "@/components/DriveConnector";
import VoiceInput from "@/components/VoiceInput";
import LocalPlugins from "@/components/LocalPlugins";

type Theme = "dark" | "light" | "system";
type Tab = "Chat" | "Prompt Library" | "Explore" | "Connectors" | "Docs";
type Attachment = { id: string; name: string; text: string };
type AuthMode = "signin" | "signup" | "reset" | "recover" | null;
type ConnectionStatus = { aiConfigured: boolean; authConfigured: boolean; aiEnabled: boolean };
let browserSupabase: SupabaseClient | null = null;
const templateItems = [
  { icon: BookOpen, title: "Explain", description: "Simplify complex topics", prompt: "Explain this in simple terms: ", color: "blue" },
  { icon: FileText, title: "Summarize", description: "Summarize long text", prompt: "Summarize the following text: ", color: "teal" },
  { icon: Pencil, title: "Rewrite", description: "Improve or rewrite text", prompt: "Rewrite this text to make it clearer: ", color: "teal" },
  { icon: Code2, title: "Generate Code", description: "Create code from description", prompt: "Generate code for: ", color: "purple" },
  { icon: GitBranch, title: "Fix Code", description: "Debug and fix issues", prompt: "Find and fix the issues in this code: ", color: "coral" },
  { icon: BriefcaseBusiness, title: "Career Advice", description: "Get learning or career guidance", prompt: "Give me career advice about: ", color: "cyan" },
];
const defaultSystem = "You are a helpful AI assistant specialized in software development, web technologies, and career guidance.";
const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const readStored = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } };
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part);
}
function Markdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [], lines = text.split("\n"); let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      nodes.push(<pre key={i}><code>{code.join("\n")}</code></pre>); i++; continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const title = lines[i++].replace(/^\d+\. /, ""), details: string[] = [];
        while (i < lines.length && /^\s+- /.test(lines[i])) details.push(lines[i++].replace(/^\s+- /, ""));
        items.push(<li key={i}>{inline(title)}{details.length > 0 && <ul>{details.map((detail, index) => <li key={index}>{inline(detail)}</li>)}</ul>}</li>);
      }
      nodes.push(<ol key={i}>{items}</ol>); continue;
    }
    if (/^[-*] /.test(line)) {
      const items: string[] = []; while (i < lines.length && /^[-*] /.test(lines[i])) items.push(lines[i++].slice(2));
      nodes.push(<ul key={i}>{items.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>); continue;
    }
    nodes.push(<p key={i}>{inline(line.replace(/^#{1,3} /, ""))}</p>); i++;
  }
  return <div className="markdown">{nodes}</div>;
}

export default function PromptLab() {
  const [chats, setChats] = useState<Conversation[]>(seedChats);
  const [activeId, setActiveId] = useState("projects");
  const [tab, setTab] = useState<Tab>("Chat");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [model, setModel] = useState("GPT-4o mini");
  const [systemPrompt, setSystemPrompt] = useState(defaultSystem);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [themeMenu, setThemeMenu] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [saved, setSaved] = useState<SavedPrompt[]>([]);
  const [promptName, setPromptName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [toast, setToast] = useState("");
  const [chatError, setChatError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authNote, setAuthNote] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [account, setAccount] = useState("");
  const [siteOrigin, setSiteOrigin] = useState("http://127.0.0.1:3001");
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const filePicker = useRef<HTMLInputElement>(null);
  const folderPicker = useRef<HTMLInputElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const storageOwner = useRef("guest");
  const current = chats.find(chat => chat.id === activeId) || chats[0];
  const messages = current?.messages || [];
  const userName = account ? account.split("@")[0] : "Guest";
  const servicesReady = Boolean(connection?.aiConfigured && connection?.authConfigured && supabase);
  const liveReady = servicesReady && Boolean(connection?.aiEnabled);

  async function refreshConnection() {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not read the connection settings.");
      setConnection(await response.json());
    } catch { setConnectionError("Could not read the connection settings. Refresh the page to try again."); }
  }

  useEffect(() => {
    setSiteOrigin(window.location.origin);
    setChats(readStored("promptlab-chats:guest", seedChats)); setSaved(readStored("promptlab-saved:guest", []));
    const storedTheme = localStorage.getItem("promptlab-theme");
    if (["dark", "light", "system"].includes(storedTheme || "")) setTheme(storedTheme as Theme);
    setHydrated(true);
    refreshConnection();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(), key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) return;
    let client: SupabaseClient;
    const parameters = new URLSearchParams(window.location.hash.slice(1));
    const recoveryRequested = parameters.get("type") === "recovery" || new URLSearchParams(window.location.search).get("auth") === "recovery";
    if (recoveryRequested) sessionStorage.setItem("promptlab-recovery-pending", "true");
    try { client = browserSupabase ??= createClient(url, key); } catch { setConnectionError("The Supabase project URL is invalid. Correct it in .env.local and restart the app."); return; }
    setSupabase(client);
    let active = true;
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      switchAccount(session?.user.email || "");
      if (event === "PASSWORD_RECOVERY") sessionStorage.setItem("promptlab-recovery-pending", "true");
      if (session && sessionStorage.getItem("promptlab-recovery-pending") === "true") { setAuthNote(""); setAuthMode("recover"); }
    });
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      switchAccount(data.session?.user.email || "");
      if (data.session && sessionStorage.getItem("promptlab-recovery-pending") === "true") { setAuthMode("recover"); setAuthNote(""); }
      else if (recoveryRequested || parameters.has("error")) { sessionStorage.removeItem("promptlab-recovery-pending"); setAuthMode("reset"); setAuthNote("This reset link is expired or invalid. Request a new link below."); }
      else if (error) setAuthNote(error.message);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(`promptlab-chats:${storageOwner.current}`, JSON.stringify(chats)); }, [chats, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(`promptlab-saved:${storageOwner.current}`, JSON.stringify(saved)); }, [saved, hydrated]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(""), 3200); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => { if (loading || messages.length > 2) transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "smooth" }); }, [messages.length, loading]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === "k") { event.preventDefault(); composer.current?.focus(); } if (event.key === "Escape") { setAuthMode(null); setSettingsOpen(false); setLeftOpen(false); setRightOpen(false); setThemeMenu(false); setAccountMenu(false); } };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, []);

  function switchAccount(value: string) {
    setAccount(value);
    const owner = value ? encodeURIComponent(value) : "guest";
    if (owner === storageOwner.current) return;
    storageOwner.current = owner;
    const freshChat: Conversation = { id: crypto.randomUUID(), title: "New conversation", date: "Just now", messages: [] };
    const history = readStored<Conversation[]>(`promptlab-chats:${owner}`, value ? [freshChat] : seedChats);
    setChats(history); setActiveId(history[0]?.id || "projects");
    setSaved(readStored<SavedPrompt[]>(`promptlab-saved:${owner}`, []));
    setInput(""); setAttachments([]); setChatError("");
  }
  function chooseTheme(value: Theme) { setTheme(value); localStorage.setItem("promptlab-theme", value); setThemeMenu(false); }
  function fillPrompt(value: string) { setInput(value); setTab("Chat"); setLeftOpen(false); setRightOpen(false); setTimeout(() => composer.current?.focus(), 0); }
  function newChat() {
    const chat: Conversation = { id: crypto.randomUUID(), title: "New conversation", date: "Just now", messages: [] };
    setChats(previous => [chat, ...previous]); setActiveId(chat.id); setInput(""); setAttachments([]); setMessageSearch(""); setTab("Chat"); setLeftOpen(false); setChatError("");
    setTimeout(() => composer.current?.focus(), 0);
  }
  function viewSample() {
    const chat: Conversation = { ...seedChats[0], id: crypto.randomUUID(), title: "Sample · React project ideas", date: "Example conversation", messages: seedChats[0].messages.map(message => ({ ...message, id: crypto.randomUUID(), demo: true })) };
    setChats(previous => [chat, ...previous]); setActiveId(chat.id); setTab("Chat"); setInput(""); setAttachments([]); setMessageSearch(""); setChatError(""); setSettingsOpen(false); setLeftOpen(false);
  }
  function updateMessages(id: string, next: Message[]) { setChats(previous => previous.map(chat => chat.id === id ? { ...chat, messages: next } : chat)); }
  function addAttachment(name: string, text: string) {
    if (attachments.length >= 10 || attachments.reduce((sum, item) => sum + item.text.length, 0) + text.length > 12000) { setToast("Attachment limit: 10 files and 12,000 characters total."); return; }
    setAttachments(previous => [...previous, { id: crypto.randomUUID(), name, text }]);
  }
  async function attachFiles(files: FileList | null) {
    if (!files) return;
    const supported = /\.(txt|md|js|jsx|ts|tsx|json|csv|css|html|py|sql|yaml|yml|xml|java|c|cpp|h|go|rs)$/i;
    const next = [...attachments]; let skipped = 0;
    for (const file of Array.from(files)) {
      const name = file.webkitRelativePath || file.name;
      if (!supported.test(name) || /(^|\/)(node_modules|\.git|\.env[^/]*)(\/|$)/.test(name) || file.size > 12000 || next.length >= 10 || next.some(item => item.name === name)) { skipped++; continue; }
      const content = await file.text();
      if (content.includes("\u0000") || next.reduce((sum, item) => sum + item.text.length, 0) + content.length > 12000) { skipped++; continue; }
      next.push({ id: crypto.randomUUID(), name, text: content });
    }
    setAttachments(next); setToast(skipped ? `Added ${next.length - attachments.length} files; skipped ${skipped}. Text/code files only, up to 12 KB total.` : "Files attached locally. No file contents have been sent to AI.");
    if (filePicker.current) filePicker.current.value = "";
    if (folderPicker.current) folderPicker.current.value = "";
  }
  async function sendMessage() {
    const text = input.trim(); if (!text || loading || !current) return;
    if (!connection?.aiEnabled) { setChatError("Live AI is paused. You can save this prompt to your library and send it after enabling live AI."); return; }
    if (!servicesReady || !supabase) { setChatError("Connect Supabase and OpenAI in Account settings to receive live AI answers."); setSettingsOpen(true); return; }
    const session = await supabase.auth.getSession(), token = session.data.session?.access_token;
    if (!token) { setAuthNote("Sign in to start chatting with the connected AI provider."); setAuthMode("signin"); return; }
    const owner = storageOwner.current;
    if (attachments.length && !window.confirm(`Send the contents of these files to OpenAI with your message?\n\n${attachments.map(file => file.name).join("\n")}\n\nCancel to keep them local.`)) return;
    const content = attachments.length ? `${text}\n\nAttached files (reference content):\n${attachments.map(file => `--- ${file.name} ---\n${file.text}`).join("\n\n")}` : text;
    if (content.length > 20000) { setChatError("Shorten the prompt or remove attachments to stay within 20,000 characters."); return; }
    const id = current.id, next: Message[] = [...messages, { id: crypto.randomUUID(), role: "user", content, time: clock() }];
    updateMessages(id, next); setInput(""); setChatError(""); setLoading(true);
    if (!messages.length) setChats(previous => previous.map(chat => chat.id === id ? { ...chat, title: text.slice(0, 38), date: "Just now" } : chat));
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), model, temperature, maxTokens, systemPrompt, topP, frequencyPenalty }) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 && storageOwner.current === owner) { setAuthNote(data.error); setAuthMode("signin"); }
        throw new Error(data.error || "Could not send your message.");
      }
      if (storageOwner.current === owner) { updateMessages(id, [...next, { id: crypto.randomUUID(), role: "assistant", content: data.message, time: clock() }]); setAttachments([]); }
    } catch (error) { if (storageOwner.current === owner) { updateMessages(id, messages); setChatError(error instanceof Error ? error.message : "Could not reach the chat server."); setInput(text); } }
    finally { setLoading(false); }
  }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setToast("Copied to clipboard"); } catch { setToast("Clipboard access is unavailable in this browser."); } }
  function readAloud(text: string) {
    if (!("speechSynthesis" in window)) { setToast("Read aloud is unavailable in this browser."); return; }
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*`#]/g, ""));
    const voice = window.speechSynthesis.getVoices().find(voice => voice.localService && voice.lang.startsWith("en"));
    if (!voice) { setToast("No local English voice is available. Install a voice in your device's speech settings."); return; }
    utterance.voice = voice; window.speechSynthesis.speak(utterance);
  }
  function savePrompt() {
    if (!promptName.trim()) { setToast("Give your prompt a name first."); return; }
    const content = input.trim() || [...messages].reverse().find(message => message.role === "user")?.content || systemPrompt;
    setSaved(previous => [{ id: crypto.randomUUID(), name: promptName.trim(), content }, ...previous]); setPromptName(""); setToast("Prompt saved to your library");
  }
  function exportChat() {
    const blob = new Blob([messages.map(message => `${message.role === "user" ? "You" : "PromptLab"}\n${message.content}`).join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = `${current?.title || "conversation"}.txt`; anchor.click(); URL.revokeObjectURL(url); setToast("Conversation exported");
  }
  async function submitAuth(event: FormEvent) {
    event.preventDefault(); setAuthNote("");
    if (!supabase) { setAuthNote("Connect your Supabase project in Account settings before creating an account."); return; }
    setAuthBusy(true);
    try {
      const result = authMode === "recover" ? await supabase.auth.updateUser({ password }) : authMode === "reset" ? await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/?auth=recovery` }) : authMode === "signup" ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } }) : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (authMode === "recover") { sessionStorage.removeItem("promptlab-recovery-pending"); window.history.replaceState({}, "", window.location.pathname); }
      if (authMode === "signin" || authMode === "recover" || (authMode === "signup" && "session" in result.data && result.data.session)) { setAuthMode(null); setPassword(""); setToast(authMode === "recover" ? "Password updated" : authMode === "signup" ? "Your account is ready" : "Welcome back"); }
      else setAuthNote(authMode === "reset" ? "Check your inbox for a password reset link." : "Check your inbox to confirm your account.");
    } catch (error) { setAuthNote(error instanceof Error ? error.message : "Account access failed."); }
    finally { setAuthBusy(false); }
  }
  async function googleSignIn() {
    if (!supabase) { setAuthNote("Enable Google sign-in in a connected Supabase project to use this option."); return; }
    setAuthBusy(true); setAuthNote("");
    try { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); if (error) throw error; }
    catch (error) { setAuthNote(error instanceof Error ? error.message : "Could not start Google sign-in."); }
    finally { setAuthBusy(false); }
  }

  return <main className={`app theme-${theme}`}>
    <header className="topbar">
      <button className="icon-button mobile-only" aria-label="Open navigation" onClick={() => setLeftOpen(true)}><Menu size={22}/></button>
      <button className="brand" onClick={() => setThemeMenu(!themeMenu)} aria-label="PromptLab appearance menu"><Bot className="brand-icon" size={39} strokeWidth={1.8}/><span>Prompt<span>Lab</span></span></button>
      <nav className="top-nav">{(["Chat", "Prompt Library", "Explore", "Connectors", "Docs"] as Tab[]).map(value => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{value}</button>)}</nav>
      <div className="header-actions">
        <button className={`demo-badge ${liveReady ? "ready-badge" : ""}`} onClick={() => setSettingsOpen(true)}>{connection && !connection.aiEnabled ? "LIVE AI PAUSED" : servicesReady ? account ? "KEY CONFIGURED" : "SIGN IN TO CHAT" : connection ? "SETUP REQUIRED" : "CHECKING SETUP"}</button>
        <button className="theme-switch" title="Choose appearance" onClick={() => setThemeMenu(!themeMenu)}><Sun size={20}/><span/></button>
        <div className="profile-wrap"><button className="profile" onClick={() => setAccountMenu(!accountMenu)}><span className="avatar">{userName[0].toUpperCase()}</span><span className="profile-name">{userName}</span><ChevronDown size={15}/></button>
          {accountMenu && <div className="popover account-popover"><span className="popover-caption">{account || "Guest workspace"}</span><button onClick={() => { setSettingsOpen(true); setAccountMenu(false); }}><Settings size={16}/> Account settings</button>{account ? <button onClick={async () => { const result = await supabase?.auth.signOut(); if (result?.error) { setToast(result.error.message); return; } setPassword(""); setAccountMenu(false); setToast("Signed out"); }}><LogOut size={16}/> Sign out</button> : <><button onClick={() => { setAuthMode("signin"); setAuthNote(""); setAccountMenu(false); }}>Sign in</button><button onClick={() => { setAuthMode("signup"); setAuthNote(""); setAccountMenu(false); }}>Create account</button></>}</div>}
        </div>
        {!account && <button className="outline-button header-signin" onClick={() => { setAuthMode("signin"); setAuthNote(""); }}>Sign in</button>}
      </div>
      {themeMenu && <div className="popover theme-popover"><span className="popover-caption">APPEARANCE</span>{(["dark", "light", "system"] as Theme[]).map(value => <button key={value} onClick={() => chooseTheme(value)}>{value === "dark" ? <Moon size={16}/> : value === "light" ? <Sun size={16}/> : <Monitor size={16}/>}<span>{value[0].toUpperCase() + value.slice(1)}</span>{theme === value && <Check size={15}/>}</button>)}</div>}
    </header>
    <div className="workspace">
      {(leftOpen || rightOpen) && <button className="drawer-scrim" aria-label="Close panel" onClick={() => { setLeftOpen(false); setRightOpen(false); }}/>} 
      <aside className={`left-panel ${leftOpen ? "open" : ""}`}>
        <button className="new-chat" onClick={newChat}><Plus size={23}/> New Chat</button>
        <nav className="sidebar-pages" aria-label="Workspace pages">{(["Chat", "Prompt Library", "Explore", "Connectors", "Docs"] as Tab[]).map(value => <button key={value} className={tab === value ? "active" : ""} onClick={() => { setTab(value); setLeftOpen(false); }}>{value}</button>)}</nav>
        <div className="sidebar-section-title"><h2>Chats</h2><button className="icon-button" title="Search chats" onClick={() => setSearchOpen(!searchOpen)}><Search size={20}/></button></div>
        {searchOpen && <input className="chat-search" aria-label="Search chats" placeholder="Search conversations…" value={search} onChange={event => setSearch(event.target.value)} autoFocus/>}
        <div className="chat-list">{chats.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase())).map(chat => <button key={chat.id} className={`chat-item ${activeId === chat.id ? "selected" : ""}`} onClick={() => { setActiveId(chat.id); setTab("Chat"); setLeftOpen(false); setChatError(""); }}><File size={21} strokeWidth={1.6}/><span><strong>{chat.title}</strong><small>{chat.date}</small></span></button>)}</div>
        <section className="templates"><h2>Prompt Templates</h2>{templateItems.map(({ icon: Icon, title, description, prompt, color }) => <button className="template-item" key={title} onClick={() => fillPrompt(prompt)}><span className={`template-icon ${color}`}><Icon size={20} strokeWidth={1.7}/></span><span><strong>{title}</strong><small>{description}</small></span></button>)}</section>
        <div className="sidebar-footer"><ShieldCheck size={14}/><span>Made for your next big idea</span></div>
      </aside>
      <section className="center-panel">
        {tab === "Chat" ? <>
          <div className="conversation-header"><div><div className="conversation-title"><h1>{current?.title || "New conversation"}</h1><button className="icon-button" title="Rename conversation" onClick={() => { const title = window.prompt("Conversation name", current?.title); if (title?.trim()) setChats(previous => previous.map(chat => chat.id === activeId ? { ...chat, title: title.trim() } : chat)); }}><Pencil size={16}/></button></div><p>Model: {model}<span>|</span>Messages: {messages.length}</p></div><div className="conversation-header-actions"><button className="outline-button icon-only" title="Search this conversation" onClick={() => setMessageSearchOpen(!messageSearchOpen)}><Search size={18}/></button><button className="outline-button" onClick={() => copy(messages.map(message => `${message.role}: ${message.content}`).join("\n\n"))}><Share2 size={17}/><span>Copy</span></button><button className="outline-button" onClick={exportChat}><Bookmark size={17}/><span>Export</span></button><button className="outline-button icon-only" title="View sample conversation" onClick={viewSample}><MoreHorizontal size={21}/></button><button className="outline-button mobile-settings" title="Model settings" onClick={() => setRightOpen(true)}><SlidersHorizontal size={18}/></button></div></div>
          <div className="transcript" ref={transcript}>
            {messages.length === 0 && <div className="empty-chat"><span><Bot size={36}/></span><h2>A little curiosity goes a long way.</h2><p>What would you like to explore today?</p><div>{templateItems.slice(0, 4).map(item => <button key={item.title} onClick={() => fillPrompt(item.prompt)}>{item.title}<ArrowRight size={15}/></button>)}</div><button className="sample-link" onClick={viewSample}>View a sample conversation <ArrowRight size={15}/></button></div>}
            {messageSearchOpen && <div className="message-search"><input aria-label="Search this conversation" placeholder="Search messages…" value={messageSearch} onChange={event => setMessageSearch(event.target.value)}/><button className="icon-button" aria-label="Close message search" onClick={() => { setMessageSearchOpen(false); setMessageSearch(""); }}><X size={16}/></button></div>}
            {messageSearch && !messages.some(message => message.content.toLowerCase().includes(messageSearch.toLowerCase())) && <p className="search-empty">No matching messages.</p>}
            {messages.filter(message => !messageSearch || message.content.toLowerCase().includes(messageSearch.toLowerCase())).map(message => <article key={message.id} className={`message ${message.role}`}>
              <span className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : ""}`}>{message.role === "user" ? userName[0].toUpperCase() : <Sparkles size={25}/>}</span>
              <div className="message-content"><div className="message-bubble"><Markdown text={message.content}/>{message.role === "assistant" && <span className="message-time">{message.time}</span>}</div>{message.role === "user" ? <span className="user-time">{message.time}</span> : <div className="message-actions"><button title="Read aloud / stop" onClick={() => readAloud(message.content)}><Volume2 size={17}/></button><button title="Copy response" onClick={() => copy(message.content)}><Copy size={17}/></button><button title="Helpful response" onClick={() => setToast("Feedback noted — helpful")}><ThumbsUp size={17}/></button><button title="Not helpful" onClick={() => setToast("Feedback noted — needs improvement")}><ThumbsDown size={17}/></button>{message.demo && <span>Demo response</span>}</div>}</div>
            </article>)}
            {loading && <div className="loading-message"><span className="message-avatar ai-avatar"><Sparkles size={24}/></span><span className="typing"><i/><i/><i/></span></div>}
          </div>
          <div className="composer-container">{!liveReady && <div className="connection-notice"><ShieldCheck size={17}/><span>{connectionError || (connection?.aiEnabled ? "Connect your account and AI provider to start chatting." : "Live AI paused · explore templates or view a sample.")}</span><button onClick={() => setSettingsOpen(true)}>Details <ArrowRight size={14}/></button></div>}{chatError && <div className="chat-error" role="alert">{chatError}</div>}<div className="composer"><input ref={filePicker} type="file" multiple hidden accept=".txt,.md,.js,.jsx,.ts,.tsx,.json,.csv,.css,.html,.py,.sql,.yaml,.yml,.xml,.java,.c,.cpp,.h,.go,.rs" onChange={event => attachFiles(event.target.files)}/><input ref={folderPicker} type="file" multiple hidden {...{ webkitdirectory: "" }} onChange={event => attachFiles(event.target.files)}/>{attachments.length > 0 && <div className="attachment-list">{attachments.map(file => <details className="attachment-chip" key={file.id}><summary><FileText size={14}/><span>{file.name}</span><button aria-label={`Remove ${file.name}`} onClick={event => { event.preventDefault(); setAttachments(previous => previous.filter(item => item.id !== file.id)); }}><X size={13}/></button></summary><pre>{file.text}</pre></details>)}</div>}<textarea ref={composer} aria-label="Message" placeholder="Type a message or enter a prompt…" value={input} maxLength={20000} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendMessage(); } }}/><div className="composer-actions"><div className="composer-tools"><select aria-label="Model" className="composer-model" value={model} onChange={event => setModel(event.target.value)}><option>GPT-4o mini</option><option>GPT-4o</option></select><button className="icon-button" aria-label="Attach files" title="Attach text/code files" onClick={() => filePicker.current?.click()}><Paperclip size={19}/></button><button className="icon-button" aria-label="Attach folder" title="Import text/code files from a folder" onClick={() => folderPicker.current?.click()}><FolderOpen size={19}/></button><button className="icon-button" aria-label="Plugins and connectors" title="Plugins and connectors" onClick={() => setTab("Connectors")}><Plug size={19}/></button><VoiceInput onText={text => setInput(previous => `${previous}${previous ? " " : ""}${text}`.slice(0, 20000))} onNotice={setToast}/></div><span className="composer-caption"><span className={`status-dot ${liveReady ? "" : "status-pending"}`}/>{liveReady ? account ? "Live AI · signed in" : "Sign in for live AI" : connection?.aiEnabled ? "Waiting for connection" : "Preview · no API requests"}</span><button className="send-button" disabled={!input.trim() || loading} onClick={sendMessage}><Send size={19}/>{loading ? "Sending" : "Send"}</button></div></div><div className="composer-footnote"><span>AI can make mistakes. Review important information.</span><span>Enter to send</span></div></div>
        </> : <div className="content-view"><div className="view-eyebrow">YOUR WORKSPACE</div><h1>{tab}</h1><p className="view-description">{tab === "Prompt Library" ? "Good prompts deserve a place to live. Save, reuse, and make them your own." : tab === "Explore" ? "A few starting points for your next conversation." : "Everything you need to get started with PromptLab."}</p>
          {tab === "Prompt Library" && <><div className="library-grid">{saved.length ? saved.map(prompt => <article className="library-card" key={prompt.id}><div><Bookmark size={20}/><button title="Delete saved prompt" onClick={() => setSaved(previous => previous.filter(item => item.id !== prompt.id))}><Trash2 size={15}/></button></div><h2>{prompt.name}</h2><p>{prompt.content}</p><button className="text-button" onClick={() => fillPrompt(prompt.content)}>Use prompt <ArrowRight size={15}/></button></article>) : <div className="empty-library"><Bookmark size={32}/><h2>Your library starts here</h2><p>Give a prompt a name in the settings panel, then click Save.</p></div>}</div><h2 className="section-heading">Starter templates</h2></>}
          {(tab === "Prompt Library" || tab === "Explore") && <div className="library-grid">{templateItems.map(({ icon: Icon, title, description, prompt, color }) => <button className="explore-card" key={title} onClick={() => fillPrompt(prompt)}><span className={`template-icon ${color}`}><Icon size={23}/></span><h2>{title}</h2><p>{description}</p><span>Start a conversation <ArrowRight size={15}/></span></button>)}</div>}
          {tab === "Docs" && <div className="docs-list">{[
            ["Start a conversation", "Click New Chat, type your message, and press Enter. Use Shift + Enter for a new line. Your conversations are saved in this browser."],
            ["Make the model work for you", "Choose a model, edit the system prompt, and adjust temperature or max tokens in the right panel. Higher temperature makes replies more varied."],
            ["Build a prompt library", "Write a prompt, give it a name in Save Prompt, and save it. Open Prompt Library to reuse or delete your saved prompts."],
            ["Connect live AI and accounts", "Open Account settings for the setup checklist. Add your Supabase project URL, publishable key, and OpenAI API key to .env.local, then restart the app. Sign up or sign in to send messages. Enable Google in Supabase if you want Google sign-in. The OpenAI secret key stays on the server."],
            ["About this workspace", "The initial guest conversations are examples. New messages use live AI once services are configured and you sign in. Conversations and saved prompts stay in this browser, separately for each account. Cloud sync, files, and web ingestion are not enabled."],
          ].map(([title, text], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div>}
          {tab === "Connectors" && <><LocalPlugins text={input} onText={fillPrompt} onNotice={setToast}/><DriveConnector onImport={(name, text) => { addAttachment(name, text); setTab("Chat"); setToast("Google Drive document attached locally. Review it before sending."); }}/></>} 
        </div>}
      </section>
      <aside className={`right-panel ${rightOpen ? "open" : ""}`}>
        <div className="settings-title"><h2>Prompt Settings</h2><button className="icon-button mobile-settings" aria-label="Close settings" onClick={() => setRightOpen(false)}><X size={18}/></button></div>
        <div className="settings-section"><label className="setting-label" htmlFor="system-prompt">System Prompt <CircleHelp size={18}/></label><textarea id="system-prompt" className="system-prompt" value={systemPrompt} onChange={event => setSystemPrompt(event.target.value)} maxLength={4000}/></div>
        <div className="settings-section parameters"><h2>Parameters</h2><label htmlFor="temperature">Temperature<output>{temperature.toFixed(1)}</output></label><input id="temperature" type="range" min="0" max="1.5" step="0.1" value={temperature} onChange={event => setTemperature(Number(event.target.value))} style={{ "--progress": `${temperature / 1.5 * 100}%` } as CSSProperties}/><label htmlFor="max-tokens">Max Tokens<output>{maxTokens}</output></label><input id="max-tokens" type="range" min="100" max="2000" step="100" value={maxTokens} onChange={event => setMaxTokens(Number(event.target.value))} style={{ "--progress": `${(maxTokens - 100) / 1900 * 100}%` } as CSSProperties}/></div>
        <button className="advanced-toggle" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>Advanced Options <ChevronDown size={15}/>{advanced ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}</button>
        {advanced && <div className="advanced-fields"><label>Top P<input aria-label="Top P" type="number" min="0" max="1" step="0.1" value={topP} onChange={event => setTopP(Number(event.target.value))}/></label><label>Frequency penalty<input aria-label="Frequency penalty" type="number" min="-2" max="2" step="0.1" value={frequencyPenalty} onChange={event => setFrequencyPenalty(Number(event.target.value))}/></label><button className="text-button" onClick={() => { setTemperature(0.7); setMaxTokens(1000); setTopP(1); setFrequencyPenalty(0); setSystemPrompt(defaultSystem); setToast("Model settings reset"); }}>Reset defaults</button></div>}
        <div className="settings-section quick-prompts"><h2>Quick Prompts</h2><div>{["Explain this", "Summarize this", "Generate code", "Improve this text", "Give examples", "Find errors"].map(text => <button key={text} onClick={() => fillPrompt(`${text}: `)}>{text}</button>)}</div></div>
        <div className="settings-section save-prompt"><h2>Save Prompt</h2><input aria-label="Saved prompt name" placeholder="Enter a name for this prompt…" value={promptName} maxLength={100} onChange={event => setPromptName(event.target.value)} onKeyDown={event => { if (event.key === "Enter") savePrompt(); }}/><button className="outline-button" onClick={savePrompt}><Bookmark size={19}/> Save</button></div>
        <div className="settings-footer"><ShieldCheck size={14}/><span>Your AI key stays on the server</span></div>
      </aside>
    </div>
    {authMode && <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) setAuthMode(null); }}>
      <form className="modal auth-modal" onSubmit={submitAuth}>
        <button type="button" className="modal-close icon-button" aria-label="Close sign-in" onClick={() => setAuthMode(null)}><X size={21}/></button>
        <Bot size={39} className="auth-logo"/><div className="view-eyebrow">WELCOME TO PROMPTLAB</div>
        <h2>{authMode === "signin" ? "Your next idea starts here." : authMode === "signup" ? "Make room for great ideas." : authMode === "recover" ? "Choose a new password." : "Let's get you back in."}</h2>
        <p>{authMode === "signin" ? "Sign in to your personal AI workspace." : authMode === "signup" ? "Create an account to make PromptLab your own." : authMode === "recover" ? "Set a new password for your account." : "We'll send you a link to reset your password."}</p>
        {!supabase && <div className="form-notice">Connect your Supabase project to enable accounts. <button type="button" className="text-button" onClick={() => { setAuthMode(null); setSettingsOpen(true); }}>Open connection setup <ArrowRight size={14}/></button></div>}
        {(authMode === "signin" || authMode === "signup") && <><button type="button" className="google-button" disabled={authBusy || !supabase} onClick={googleSignIn}><span>G</span> Continue with Google</button><div className="or-divider"><span/>or continue with email<span/></div></>}
        {authMode !== "recover" && <label>Email address<input autoComplete="email" type="email" required placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)}/></label>}
        {authMode !== "reset" && <label>Password<input autoComplete={authMode === "signin" ? "current-password" : "new-password"} type="password" required minLength={authMode === "signin" ? 1 : 8} placeholder={authMode === "signin" ? "Your password" : "At least 8 characters"} value={password} onChange={event => setPassword(event.target.value)}/></label>}
        {authNote && <div className="form-notice" role="status">{authNote}</div>}
        <button className="primary-button" disabled={authBusy || !supabase}>{authBusy ? "Please wait…" : authMode === "signin" ? "Sign in" : authMode === "signup" ? "Create account" : authMode === "recover" ? "Update password" : "Send reset link"}</button>
        <div className="auth-links">{authMode === "signin" ? <><button type="button" onClick={() => { setAuthMode("reset"); setAuthNote(""); }}>Forgot password?</button><span>New here? <button type="button" onClick={() => { setAuthMode("signup"); setAuthNote(""); }}>Sign up</button></span></> : <button type="button" onClick={() => { setAuthMode("signin"); setAuthNote(""); }}>Back to sign in</button>}</div>
        <div className="auth-footer"><ShieldCheck size={14}/> A little more focus. A lot more possibility.</div>
      </form>
    </div>}
    {settingsOpen && <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
      <section className="modal settings-modal">
        <button className="modal-close icon-button" aria-label="Close account settings" onClick={() => setSettingsOpen(false)}><X size={21}/></button>
        <Settings size={29} className="auth-logo"/><h2>Account settings</h2><p>{account || "Your workspace is waiting for you."}</p>
        <h3>Connections</h3>
        <div className="connection-checklist"><div><span>Supabase · accounts</span><strong className={connection?.authConfigured && supabase ? "configured" : ""}>{connection?.authConfigured && supabase ? "Configured" : "Needs setup"}</strong></div><div><span>OpenAI · live answers</span><strong className={connection?.aiConfigured ? "configured" : ""}>{connection?.aiConfigured ? "Configured" : "Needs setup"}</strong></div></div>
        {connectionError && <div className="form-notice" role="alert">{connectionError}</div>}
        {!servicesReady && <div className="connection-guide"><p>Save these three values in <code>.env.local</code>:</p><ol><li>Create a <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase project</a>. Copy its URL and publishable key from the <strong>Connect</strong> dialog.</li><li>Create an <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">OpenAI API key</a> for live answers.</li><li>Restart the app, then refresh this page.</li></ol><p>In Supabase → Authentication → URL Configuration, set the Site URL to <code>{siteOrigin}</code> and allow <code>{siteOrigin}/**</code> as a redirect URL for confirmation and reset emails.</p><p>Google sign-in also needs the Google provider enabled in Supabase.</p><button className="text-button" onClick={() => window.location.reload()}>Refresh after setup <ArrowRight size={14}/></button></div>}
        <div className="form-notice"><strong>{connection?.aiEnabled ? "Live requests enabled" : "Live AI is paused"}</strong><p>Templates, saved prompts, themes, and sample conversations are available without API credits. A saved API key does not confirm available quota.</p><button className="text-button" onClick={viewSample}>View a sample conversation <ArrowRight size={15}/></button>{!connection?.aiEnabled && <p>When you want real answers, fund your OpenAI API account, set <code>AI_CHAT_ENABLED=true</code> in .env.local, and restart the app.</p>}</div>
        <h3>Appearance</h3><div className="appearance-options">{(["dark", "light", "system"] as Theme[]).map(value => <button key={value} className={theme === value ? "selected" : ""} onClick={() => chooseTheme(value)}>{value === "dark" ? <Moon size={19}/> : value === "light" ? <Sun size={19}/> : <Monitor size={19}/>}<span>{value}</span></button>)}</div>
        <h3>Account access</h3><p>{account ? "Manage the password for your account." : "Sign in or create your own account to connect to live AI."}</p>
        <button className="primary-button" onClick={() => { setSettingsOpen(false); setAuthMode(account ? "reset" : "signin"); setEmail(account); setAuthNote(""); }}>{account ? "Reset password" : "Sign in"}</button>
        {account && <button className="text-button" onClick={() => { setSettingsOpen(false); setAuthMode("recover"); setPassword(""); setAuthNote(""); }}>Set a new password <ArrowRight size={15}/></button>}
        {!account && <button className="text-button" onClick={() => { setSettingsOpen(false); setAuthMode("signup"); setAuthNote(""); }}>Create account <ArrowRight size={15}/></button>}
        <div className="form-notice">Conversations and saved prompts currently stay in this browser. They do not sync between devices.</div>
      </section>
    </div>}
    {toast && <div className="toast" role="status"><Check size={17}/>{toast}</div>}
  </main>;
}



