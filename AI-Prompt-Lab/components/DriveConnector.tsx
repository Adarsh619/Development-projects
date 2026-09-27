"use client";

import { useEffect, useState } from "react";
import { Cloud, FileText, Search, Plug, Check, X } from "lucide-react";

type DriveFile = { id: string; name: string; mimeType: string; size?: string };
type TokenResponse = { access_token?: string; expires_in?: number; error?: string; error_description?: string };
type GoogleOAuth = {
  initTokenClient: (options: { client_id: string; scope: string; include_granted_scopes: boolean; callback: (response: TokenResponse) => void; error_callback: () => void }) => { requestAccessToken: () => void };
  revoke: (token: string, callback: () => void) => void;
};
declare global { interface Window { google?: { accounts: { oauth2: GoogleOAuth } } } }
let driveSession: { token: string; expiresAt: number } | null = null;

export default function DriveConnector({ onImport }: { onImport: (name: string, text: string) => void }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(Boolean(driveSession && driveSession.expiresAt > Date.now()));
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ name: string; text: string } | null>(null);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    if (window.google?.accounts.oauth2) setReady(true);
    else {
      let script = document.querySelector<HTMLScriptElement>('script[data-promptlab-google="true"]');
      if (!script) { script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.dataset.promptlabGoogle = "true"; document.head.appendChild(script); }
      const loaded = () => { if (active) setReady(true); };
      const failed = () => { if (active) setNotice("Google's connection library could not load. Refresh to try again."); };
      script.addEventListener("load", loaded); script.addEventListener("error", failed);
      if (window.google?.accounts.oauth2) setReady(true);
      if (driveSession && driveSession.expiresAt > Date.now()) listFiles();
      return () => { active = false; script.removeEventListener("load", loaded); script.removeEventListener("error", failed); };
    }
    if (driveSession && driveSession.expiresAt > Date.now()) listFiles();
    return () => { active = false; };
  }, [clientId]);

  function accessToken() {
    if (!driveSession || driveSession.expiresAt <= Date.now()) { driveSession = null; setConnected(false); throw new Error("Your Google session expired. Connect again."); }
    return driveSession.token;
  }
  async function listFiles() {
    setBusy(true); setNotice("");
    try {
      const params = new URLSearchParams({ q: "trashed = false and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'text/markdown' or mimeType = 'text/csv')", fields: "files(id,name,mimeType,size),nextPageToken", pageSize: "100", orderBy: "modifiedTime desc" });
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers: { Authorization: `Bearer ${accessToken()}` } });
      if (!response.ok) throw new Error(response.status === 401 ? "Google authorization expired. Disconnect and reconnect." : "Could not list documents. Enable Google Drive API and check the OAuth permissions.");
      const data = await response.json(); setFiles(data.files || []); if (data.nextPageToken) setNotice("Showing your 100 most recently modified supported documents.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load documents."); }
    finally { setBusy(false); }
  }
  function connect() {
    if (!clientId || !window.google?.accounts.oauth2) return;
    setBusy(true); setNotice("");
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: "https://www.googleapis.com/auth/drive.readonly", include_granted_scopes: false,
      callback: response => {
        if (!response.access_token || response.error) { setNotice(response.error_description || "Google Drive permission was not granted."); setBusy(false); return; }
        driveSession = { token: response.access_token, expiresAt: Date.now() + (response.expires_in || 3600) * 1000 }; setConnected(true); listFiles();
      }, error_callback: () => { setBusy(false); setNotice("Connection cancelled or popup blocked. Allow the Google popup and try again."); },
    });
    client.requestAccessToken();
  }
  async function previewFile(file: DriveFile) {
    setBusy(true); setNotice("");
    try {
      if (Number(file.size || 0) > 12000) throw new Error("Choose a document under 12 KB for this workspace.");
      const suffix = file.mimeType === "application/vnd.google-apps.document" ? "/export?mimeType=text%2Fplain" : "?alt=media";
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}${suffix}`, { headers: { Authorization: `Bearer ${accessToken()}` } });
      if (!response.ok) throw new Error("Could not read that document. Check its permissions.");
      const text = await response.text(); if (text.length > 12000) throw new Error("Choose a shorter document: the attachment limit is 12,000 characters.");
      setPreview({ name: file.name, text });
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not read document."); }
    finally { setBusy(false); }
  }
  function disconnect() {
    const token = driveSession?.token; driveSession = null; setConnected(false); setFiles([]); setPreview(null);
    if (token) window.google?.accounts.oauth2.revoke(token, () => setNotice("Google Drive access revoked."));
  }

  return <section className="connector-card">
    <div className="connector-heading"><span className="template-icon teal"><Cloud size={25}/></span><div><h2>Google Drive</h2><p>Bring a document into your next prompt.</p></div><span className="connector-status">{connected ? "Connected" : clientId ? "Ready to connect" : "Needs setup"}</span></div>
    <p className="connector-description">Connect your Google account to browse Google Docs and text files. This connector requests read-only access to your Drive. Importing a document previews it locally; sending its contents to OpenAI requires a separate confirmation.</p>
    {!clientId && <div className="form-notice">Google Drive needs a Google Cloud OAuth client ID. The setup instructions are in <strong>CONNECTORS.md</strong>. Once configured, you can authorize your Google account here. No OpenAI credits are needed to browse documents.</div>}
    <div className="connector-actions">{connected ? <><button className="outline-button" onClick={disconnect}>Disconnect</button><button className="outline-button" disabled={busy} onClick={listFiles}>Refresh documents</button></> : <button className="outline-button" disabled={!ready || busy} onClick={connect}><Plug size={17}/>{busy ? "Connecting…" : "Connect Google Drive"}</button>}</div>
    {notice && <div className="form-notice" role="status">{notice}</div>}
    {connected && <><div className="message-search"><Search size={17}/><input aria-label="Search Google Drive documents" placeholder="Search listed documents…" value={query} onChange={event => setQuery(event.target.value)}/></div><div className="drive-files">{files.filter(file => file.name.toLowerCase().includes(query.toLowerCase())).map(file => <button key={file.id} disabled={busy} onClick={() => previewFile(file)}><FileText size={18}/><span>{file.name}</span><small>Preview</small></button>)}{!busy && !files.length && <p>No supported documents found. Google Docs and text files are supported; PDFs and folders are not imported by this connector.</p>}</div></>}
    {preview && <div className="drive-preview"><div><strong>{preview.name}</strong><button className="icon-button" aria-label="Close document preview" onClick={() => setPreview(null)}><X size={17}/></button></div><pre>{preview.text}</pre><button className="outline-button" onClick={() => onImport(preview.name, preview.text)}><Check size={17}/> Attach to prompt locally</button></div>}
  </section>;
}
