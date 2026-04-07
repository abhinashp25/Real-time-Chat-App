import { useRef, useState, useCallback, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore }  from "../store/useChatStore";
import VoiceRecorder     from "./VoiceRecorder";
import EmojiPicker       from "./EmojiPicker";
import ReplyBar          from "./ReplyBar";
import ScheduleModal     from "./ScheduleModal";
import toast from "react-hot-toast";
import { Mic, MicOff, Send } from "lucide-react";
import { motion } from "framer-motion";

const STOP_DELAY = 1500;

export default function MessageInput({ onTextChange }) {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText]             = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [emojiOpen, setEmojiOpen]   = useState(false);
  const [voiceMode, setVoiceMode]   = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileRef   = useRef(null);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const holdTimer = useRef(null);
  const typingRef = useRef(false);
  const recognitionRef = useRef(null);

  const {
    sendMessage, isSoundEnabled, emitTyping, emitStopTyping,
    pendingInput, clearPendingInput, replyingTo,
    selectedUser, disappearSeconds,
  } = useChatStore();

  useEffect(() => {
    if (pendingInput !== null) {
      setText(pendingInput);
      onTextChange?.(pendingInput);
      clearPendingInput();
      inputRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingInput]);

  const handleTyping = useCallback((val) => {
    onTextChange?.(val);
    if (val.length > 0 && !typingRef.current) { typingRef.current = true; emitTyping(); }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { typingRef.current = false; emitStopTyping(); }, STOP_DELAY);
    if (val.length === 0) { clearTimeout(timerRef.current); typingRef.current = false; emitStopTyping(); }
  }, [emitTyping, emitStopTyping, onTextChange]);

  const toggleVoiceTyping = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice typing is not supported in this browser.");
      return;
    }
    
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setText((prev) => prev + (prev ? " " : "") + finalTranscript);
        handleTyping(text + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      toast.error("Voice typing error or interrupted");
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
    toast.success("Voice typing started. Speak now...", { icon: "🎤" });
  };

  const handleSend = () => {
    if (!text.trim() && !imgPreview && !docPreview) return;
    if (isSoundEnabled) {
      const sendSound = new Audio("/sounds/notification.mp3"); // reuse notification or a pop
      sendSound.volume = 0.4;
      sendSound.play().catch(() => {});
    }
    clearTimeout(timerRef.current); typingRef.current = false; emitStopTyping();
    sendMessage({ text: text.trim(), image: imgPreview, document: docPreview });
    setText(""); setImgPreview(null); setDocPreview(null); setEmojiOpen(false);
    onTextChange?.("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleVoiceSend = (audioBase64) => {
    sendMessage({ audio: audioBase64 });
    setVoiceMode(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (limit 10MB)"); return; }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (file.type.startsWith("image/")) {
        setImgPreview(reader.result);
      } else {
        setDocPreview({ filename: file.name, size: file.size, data: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const insertEmoji = (em) => {
    const pos = inputRef.current?.selectionStart ?? text.length;
    const newText = text.slice(0, pos) + em + text.slice(pos);
    setText(newText);
    handleTyping(newText);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos + em.length, pos + em.length);
    }, 0);
  };

  // Long-press on send button → schedule modal
  const onSendPointerDown = () => {
    if (!canSend) return; // only schedule if there's content
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      setShowSchedule(true);
    }, 600);
  };
  const onSendPointerUp = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
      handleSend(); // short tap = send immediately
    }
  };
  const onSendPointerLeave = () => {
    clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  const canSend = text.trim() || imgPreview || docPreview;

  // Disappear timer label for display in input area
  const disappearLabel = disappearSeconds === 0 ? null
    : disappearSeconds === 3600    ? "1h"
    : disappearSeconds === 86400   ? "24h"
    : disappearSeconds === 604800  ? "7d"
    : disappearSeconds === 2592000 ? "30d"
    : "90d";

  return (
    <div className="flex-shrink-0 safe-bottom" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>

      {/* Reply preview */}
      {replyingTo && <ReplyBar />}

      {/* Image preview */}
      {imgPreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img src={imgPreview} alt="Preview"
              className="w-20 h-20 object-cover rounded-xl"
              style={{ border: "2px solid var(--accent)" }} />
            <button type="button"
              onClick={() => { setImgPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#fc8181" }}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Document preview */}
      {docPreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-[#262626] pr-10 shadow-sm">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <svg className="w-5 h-5 text-[#a3a3a3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className="flex flex-col max-w-[200px]">
              <span className="text-[13px] text-white truncate font-medium">{docPreview.filename}</span>
              <span className="text-[11px] text-[#737373]">{(docPreview.size / 1024).toFixed(1)} KB</span>
            </div>
            <button type="button"
              onClick={() => { setDocPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#ef4444]">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {emojiOpen && (
        <div className="px-3 pt-2">
          <EmojiPicker onSelect={insertEmoji} onClose={() => setEmojiOpen(false)} />
        </div>
      )}

      {/* Disappear timer badge — shows when timer is active */}
      {disappearLabel && (
        <div className="flex items-center gap-1.5 px-4 pt-2">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--accent)" }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
            Messages disappear after {disappearLabel}
          </span>
        </div>
      )}

      {/* Main input row */}
      <div className="flex items-center gap-2 px-3 py-2.5">

        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="icon-btn flex-shrink-0"
          title="Attach file"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        {voiceMode ? (
          <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setVoiceMode(false)} />
        ) : (
          <>
            {/* Main pill input */}
            <div className="flex-1 flex items-center gap-2 rounded-full px-4 h-[44px] input-pill-glass">
              {/* Emoji */}
              <button
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                className="flex-shrink-0 transition-colors"
                style={{ color: emojiOpen ? "#e5e5e5" : "#737373" }}
                title="Emoji"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  handleTyping(e.target.value);
                  if (isSoundEnabled) playRandomKeyStrokeSound?.();
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-none focus:outline-none text-[14.5px] leading-none"
                style={{ color: "var(--text-primary)", fontFamily: "inherit" }}
              />

              {/* Voice typing toggle */}
              <button
                type="button"
                onClick={toggleVoiceTyping}
                className="flex-shrink-0 transition-colors"
                style={{ color: isRecording ? "#ef4444" : "#737373" }}
                title={isRecording ? "Stop voice typing" : "Voice type"}
              >
                {isRecording
                  ? <Mic size={18} className="animate-pulse" />
                  : <MicOff size={18} />}
              </button>

              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
            </div>

            {/* Send / Mic button */}
            <div className="relative flex-shrink-0">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onPointerDown={canSend ? onSendPointerDown : undefined}
                onPointerUp={canSend ? onSendPointerUp : undefined}
                onPointerLeave={canSend ? onSendPointerLeave : undefined}
                onClick={canSend ? undefined : () => setVoiceMode(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all select-none"
                style={{
                  background: canSend ? "#ffffff" : "#1a1a1a",
                  color: canSend ? "#000000" : "#737373",
                  border: canSend ? "none" : "1px solid #262626",
                  touchAction: "none",
                }}
                title={canSend ? "Send" : "Record voice"}
              >
                {canSend
                  ? <Send size={17} className="ml-0.5" />
                  : <Mic size={18} />}
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Schedule modal */}
      {showSchedule && selectedUser && (
        <ScheduleModal
          text={text}
          image={imgPreview}
          receiverId={selectedUser._id}
          onClose={() => setShowSchedule(false)}
          onScheduled={() => {
            setText(""); setImgPreview(null); setDocPreview(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
      )}
    </div>
  );
}
