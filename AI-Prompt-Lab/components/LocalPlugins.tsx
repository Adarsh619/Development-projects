"use client";
import { useEffect, useState } from "react";
import { Code2, Pencil, FileText } from "lucide-react";
const plugins = [
  { id: "json", name: "JSON formatter", description: "Format valid JSON in your draft.", icon: Code2 },
  { id: "clean", name: "Clean text", description: "Remove extra spaces and blank lines.", icon: Pencil },
  { id: "count", name: "Word count", description: "Count words and characters locally.", icon: FileText },
];
export default function LocalPlugins({ text, onText, onNotice }: { text: string; onText: (text: string) => void; onNotice: (text: string) => void }) {
  const [enabled, setEnabled] = useState<string[]>(plugins.map(plugin => plugin.id));
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem("promptlab-plugins") || "null"); if (Array.isArray(saved)) setEnabled(saved.filter(id => plugins.some(plugin => plugin.id === id))); } catch { /* Use defaults if preferences are invalid. */ } }, []);
  function toggle(id: string) { const next = enabled.includes(id) ? enabled.filter(item => item !== id) : [...enabled, id]; setEnabled(next); localStorage.setItem("promptlab-plugins", JSON.stringify(next)); }
  function run(id: string) {
    if (!text.trim()) { onNotice("Write a draft in the chat composer first, then run this plugin."); return; }
    if (id === "count") { onNotice(`${text.trim().split(/\s+/).length} words · ${text.length} characters`); return; }
    if (id === "clean") { onText(text.split("\n").map(line => line.trim().replace(/[\t ]+/g, " ")).join("\n").replace(/\n{3,}/g, "\n\n").trim()); onNotice("Draft cleaned locally."); return; }
    try { const formatted = JSON.stringify(JSON.parse(text), null, 2); if (formatted.length > 20000) throw new Error(); onText(formatted); onNotice("JSON formatted locally."); } catch { onNotice("Use valid JSON under 20,000 characters to format your draft."); }
  }
  return <section className="local-plugins"><h2>Local plugins</h2><p>Small tools for your draft. No AI requests or account connection required.</p><div className="plugin-grid">{plugins.map(({ id, name, description, icon: Icon }) => <article key={id}><Icon size={21}/><h3>{name}</h3><p>{description}</p><div><button className="text-button" aria-pressed={enabled.includes(id)} onClick={() => toggle(id)}>{enabled.includes(id) ? "Enabled" : "Disabled"}</button><button className="outline-button" disabled={!enabled.includes(id)} onClick={() => run(id)}>Run</button></div></article>)}</div></section>;
}
