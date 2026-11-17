"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [auditSessions, setAuditSessions] = useState([
    { id: 1, title: "ABC Traders - 43B(h) Audit", date: "2026-11-17" },
    { id: 2, title: "GSTR-2B ITC Mismatch - XYZ Corp", date: "2026-11-16" },
    { id: 3, title: "Sec 142(1) Scrutiny Notice Reply", date: "2026-11-15" },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText = null) => {
    const textToSend = customText !== null ? customText : input;
    if (!textToSend.trim() && !file) return;

    const userMessage = { role: "user", content: textToSend, fileName: file?.name };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (customText === null) setInput("");
    setFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(newMessages));
      if (file) formData.append("file", file);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    "Section 43B(h) MSME Dues",
    "GSTR-2B vs 3B ITC Reconciling",
    "TDS Sec 194J Thresholds",
    "Tax Audit Form 3CD Checklist",
    "Sec 142(1) Scrutiny Reply Draft",
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR: HISTORY & REMINDERS */}
      <div className={`${historyOpen ? "w-80" : "w-0"} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/50">Audit Vault</span>
          </div>
          <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <div className="p-3">
          <button 
            onClick={() => setMessages([])}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm shadow transition flex items-center justify-center space-x-2"
          >
            <span>+ New Client Session</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">Recent Consultations</div>
          {auditSessions.map((session) => (
            <div key={session.id} className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition group">
              <div className="text-sm font-medium text-slate-200 group-hover:text-blue-400 truncate">{session.title}</div>
              <div className="text-xs text-slate-400 mt-1">{session.date}</div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-xs text-amber-400 font-medium flex items-center space-x-1">
            <span>🔔 Reminder: GSTR-3B Due on 20th</span>
          </div>
        </div>
      </div>

      {/* MAIN CHAT & WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            {!historyOpen && (
              <button onClick={() => setHistoryOpen(true)} className="text-slate-400 hover:text-white mr-2">
                ☰ History
              </button>
            )}
            {/* ICAI CA Logo Style Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-orange-500 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-orange-400 to-emerald-400 text-sm">CA</span>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CA-TwinForge</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Executive AI Studio for Indian CAs</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Tax Engine Ready
            </span>
            <button 
              onClick={() => setMessages([])} 
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700"
            >
              Clear Chat
            </button>
          </div>
        </header>

        {/* FEED / CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl shadow-inner">
                ⚖️
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Ask anything on Indian Tax, GST & Audit</h2>
                <p className="text-sm text-slate-400">
                  Type naturally in plain language, upload an invoice PDF, or click a CA terminology shortcut below.
                </p>
              </div>

              {/* QUICK TERMINOLOGY CHIPS */}
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-xs bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 px-3 py-1.5 rounded-full transition shadow-sm"
                  >
                    ⚡ {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-3xl rounded-2xl p-4 shadow-md ${
                    m.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                  }`}>
                    {m.fileName && (
                      <div className="mb-2 text-xs bg-black/20 px-2 py-1 rounded inline-flex items-center space-x-1">
                        <span>📎 Attached: {m.fileName}</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 p-4 rounded-2xl rounded-bl-none text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                    <span className="pl-2">Running statutory reasoning & deterministic tax calculations...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 backdrop-blur">
          <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-lg focus-within:border-blue-500 transition">
            {file && (
              <div className="mb-2 px-3 py-1 bg-slate-900 rounded-lg flex items-center justify-between text-xs text-blue-400 border border-slate-800">
                <span>📎 {file.name}</span>
                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-white">Remove</button>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a sharp tax question or upload a ledger / PDF notice..."
              rows={2}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none px-2"
            />
            <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-900">
              <label className="cursor-pointer text-slate-400 hover:text-blue-400 text-xs flex items-center space-x-1 transition">
                <span>📎 Attach PDF / Ledger</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !file)}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition"
              >
                Send Query ➔
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}