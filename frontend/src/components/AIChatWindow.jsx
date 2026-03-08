import { useState, useRef, useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import { SendIcon, XIcon, SparklesIcon, RefreshCwIcon } from "lucide-react";

export default function AIChatWindow({ onClose }) {
  const { aiMessages, isAILoading, sendAIMessage, clearAI, retryAfter } = useAIStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages, isAILoading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const isBlocked = isAILoading || retryAfter > 0;

  const handleSend = async () => {
    if (!input.trim() || isBlocked) return;
    const text = input.trim();
    setInput("");
    await sendAIMessage(text);
  };

  const STARTERS = [
    "✍️ Help me write a message",
    "💡 What can you do?",
    "🌍 Tell me a fun fact",
    "🗓️ Help me plan my day",
    "🧑‍💻 Explain a coding concept",
    "😄 Tell me a joke",
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[64px] flex-shrink-0 relative"
        style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #667eea 0%, #4fd1c5 100%)' }} />

        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #4fd1c5 100%)' }}>
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9l-1 2H8l1-2-1-2h4l1 2zm4 0l-1 2h-2l1-2-1-2h2l1 2z"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
            style={{ background: '#4fd1c5', border: '1.5px solid #0f1621' }}>✦</span>
        </div>

        <div className="flex-1">
          <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Chatify AI</p>
          <p className="text-[11px]" style={{ color: retryAfter > 0 ? '#f6ad55' : '#4fd1c5' }}>
            {retryAfter > 0 ? `⏳ Cooling down ${retryAfter}s…` : "Always online · Powered by Gemini AI"}
          </p>
        </div>

        {retryAfter > 0 && (
          <div className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(246,173,85,0.15)', border: '1px solid rgba(246,173,85,0.3)', color: '#f6ad55' }}>
            {retryAfter}s
          </div>
        )}

        <button onClick={clearAI} className="icon-btn" title="New chat">
          <RefreshCwIcon className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="icon-btn" title="Close">
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {aiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(79,209,197,0.2))', border: '1px solid rgba(79,209,197,0.2)' }}>
              <SparklesIcon className="w-9 h-9" style={{ color: '#4fd1c5' }} />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Hi! I'm Chatify AI</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Ask me anything — I'm here to help</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => { setInput(s.replace(/^[^\s]+\s/, "")); inputRef.current?.focus(); }}
                  className="text-left text-[12px] px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: msg.isError ? 'rgba(246,173,85,0.3)' : 'linear-gradient(135deg, #667eea, #4fd1c5)' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap`}
              style={{
                background: msg.role === "user" ? 'linear-gradient(145deg, #226b59, #1a4a3d)'
                  : msg.isError ? 'rgba(246,173,85,0.1)'
                  : 'var(--bg-panel)',
                color: msg.isError ? '#f6ad55' : 'var(--text-primary)',
                border: msg.isError ? '1px solid rgba(246,173,85,0.2)' : '1px solid var(--border)',
                borderRadius: msg.role === "user" ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isAILoading && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #667eea, #4fd1c5)' }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#4fd1c5', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Rate limit banner */}
      {retryAfter > 0 && (
        <div className="mx-4 mb-2 px-4 py-2.5 rounded-xl flex items-center gap-3 text-[13px]"
          style={{ background: 'rgba(246,173,85,0.08)', border: '1px solid rgba(246,173,85,0.2)', color: '#f6ad55' }}>
          <span className="text-lg">⏳</span>
          <div>
            <p className="font-semibold">Rate limit reached — free tier is ~15 msg/min</p>
            <p className="text-[11px] opacity-70">Ready again in <strong>{retryAfter}s</strong>. Consider upgrading your Gemini API plan.</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'var(--bg-input)', border: `1px solid ${retryAfter > 0 ? 'rgba(246,173,85,0.3)' : 'var(--border)'}` }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
            placeholder={retryAfter > 0 ? `Cooling down… ${retryAfter}s` : "Ask me anything…"}
            disabled={isBlocked}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            style={{ color: isBlocked ? 'var(--text-muted)' : 'var(--text-primary)' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isBlocked}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: !input.trim() || isBlocked ? 'transparent' : 'linear-gradient(135deg, #667eea, #4fd1c5)',
              opacity: !input.trim() || isBlocked ? 0.3 : 1,
            }}>
            <SendIcon className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
