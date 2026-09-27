"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type RecognitionWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export default function VoiceInput({ onText, onNotice }: { onText: (text: string) => void; onNotice: (text: string) => void }) {
  const recognition = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  useEffect(() => () => { const current = recognition.current; if (current) { current.onresult = null; current.onerror = null; current.onend = null; current.abort(); } }, []);
  function toggle() {
    if (listening) { recognition.current?.stop(); return; }
    const speechWindow = window as RecognitionWindow, Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Constructor) { onNotice("Voice input isn't supported in this browser. Open PromptLab in Chrome and allow microphone access."); return; }
    if (!window.confirm("Use your microphone to dictate a prompt? Your browser may send audio to its speech-recognition service. PromptLab adds the transcript to your draft; it does not send the draft to AI automatically.")) return;
    const current = new Constructor(); recognition.current = current;
    current.lang = "en-IN"; current.continuous = false; current.interimResults = false;
    current.onresult = event => { for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) onText(event.results[i][0].transcript); };
    current.onerror = event => { setListening(false); onNotice(event.error === "not-allowed" ? "Microphone access was denied. Allow it in Chrome's site permissions." : event.error === "no-speech" ? "No speech detected. Try again." : "Voice input could not complete. Check your microphone and connection."); };
    current.onend = () => setListening(false);
    try { current.start(); setListening(true); onNotice("Listening… speak your prompt. It will appear as a draft."); } catch { setListening(false); onNotice("Could not start the microphone. Try again."); }
  }
  return <button className={`icon-button ${listening ? "voice-listening" : ""}`} title={listening ? "Stop dictation" : "Voice input"} aria-label={listening ? "Stop dictation" : "Voice input"} aria-pressed={listening} onClick={toggle}>{listening ? <Square size={18}/> : <Mic size={19}/>}</button>;
}
