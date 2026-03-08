import { useRef, useState, useCallback, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore }  from "../store/useChatStore";
import VoiceRecorder     from "./VoiceRecorder";
import EmojiPicker       from "./EmojiPicker";
import ReplyBar          from "./ReplyBar";
import toast from "react-hot-toast";

const STOP_DELAY = 1500;

export default function MessageInput({ onTextChange }) {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText]             = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  const [emojiOpen, setEmojiOpen]   = useState(false);
  const [voiceMode, setVoiceMode]   = useState(false);
  const fileRef   = useRef(null);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const typingRef = useRef(false);

  const {
    sendMessage, isSoundEnabled, emitTyping, emitStopTyping,
    pendingInput, clearPendingInput, replyingTo, clearReply,
  } = useChatStore();

  // Smart reply fills input via store
  useEffect(() => {
    if (pendingInput !== null) {
      setText(pendingInput);
      onTextChange?.(pendingInput);
      clearPendingInput();
      inputRef.current?.focus();
    }
  }, [pendingInput]);

  const handleTyping = useCallback((val) => {
    onTextChange?.(val);
    if (val.length > 0 && !typingRef.current) { typingRef.current = true; emitTyping(); }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { typingRef.current = false; emitStopTyping(); }, STOP_DELAY);
    if (val.length === 0) { clearTimeout(timerRef.current); typingRef.current = false; emitStopTyping(); }
  }, [emitTyping, emitStopTyping, onTextChange]);

  const handleSend = () => {
    if (!text.trim() && !imgPreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();
    clearTimeout(timerRef.current); typingRef.current = false; emitStopTyping();
    sendMessage({ text: text.trim(), image: imgPreview });
    setText(""); setImgPreview(null); setEmojiOpen(false);
    onTextChange?.("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleVoiceSend = (audioBase64) => {
    sendMessage({ audio: audioBase64 });
    setVoiceMode(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result);
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

  const canSend = text.trim() || imgPreview;

  return (
    <div className="flex-shrink-0 safe-bottom"
      style={{ background: 'var(--bg-header)', borderTop: '1px solid var(--border)' }}>

      {/* Reply preview */}
      {replyingTo && <ReplyBar />}

      {/* Image preview */}
      {imgPreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img src={imgPreview} alt="Preview"
              className="w-20 h-20 object-cover rounded-xl"
              style={{ border: '2px solid var(--accent)' }} />
            <button type="button"
              onClick={() => { setImgPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#fc8181' }}>
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

      {/* Main input row — WhatsApp style */}
      <div className="flex items-end gap-2 px-3 py-2">

        {/* Emoji button */}
        <button type="button"
          onClick={() => setEmojiOpen((v) => !v)}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ color: emojiOpen ? 'var(--accent)' : 'var(--text-muted)' }}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>

        {voiceMode ? (
          <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setVoiceMode(false)} />
        ) : (
          <>
            {/* Text input — WhatsApp pill */}
            <div className="flex-1 flex items-end rounded-[22px] px-4 py-2 min-h-[44px]"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-none focus:outline-none text-[14px] leading-[1.4]"
                style={{ color: 'var(--text-primary)', fontFamily: 'inherit', minWidth: 0 }}
              />
              {/* Attach image inside pill */}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 ml-2 mb-0.5"
                style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} className="hidden" />
            </div>

            {/* Send / Mic button — WhatsApp round teal */}
            <button type="button"
              onClick={canSend ? handleSend : () => setVoiceMode(true)}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover, #38b2ac))',
                boxShadow: '0 4px 14px rgba(79,209,197,0.35)',
              }}>
              {canSend ? (
                <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
