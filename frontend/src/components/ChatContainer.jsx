import { useEffect, useRef, useState } from "react";
import { useAuthStore }  from "../store/useAuthStore";
import { useChatStore }  from "../store/useChatStore";
import ChatHeader        from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput      from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageTicks      from "./MessageTicks";
import ReactionPicker    from "./ReactionPicker";

export default function ChatContainer() {
  const {
    selectedUser, getMessagesByUserId, markMessagesAsRead,
    messages, isMessagesLoading, subscribeToMessages,
    unsubscribeFromMessages, toggleReaction, deleteMessage, searchQuery,
  } = useChatStore();
  const { authUser, cacheContact } = useAuthStore();
  const bottomRef   = useRef(null);
  const [ctx, setCtx] = useState(null); // context menu

  useEffect(() => { cacheContact(selectedUser._id, selectedUser.fullName); }, [selectedUser, cacheContact]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    markMessagesAsRead(selectedUser._id);
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages, markMessagesAsRead]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Search filter
  const visible = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const getMyReaction = (msg) =>
    msg.reactions?.find((r) => r.userId === authUser._id || r.userId?._id === authUser._id)?.emoji;

  const groupReactions = (reactions = []) =>
    reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {});

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />

      {/* ── Messages scroll area ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : visible.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <SearchEmptyIcon />
            <p className="text-sm">No messages match &quot;{searchQuery}&quot;</p>
          </div>
        ) : visible.length === 0 ? (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-[2px]">

            {searchQuery && (
              <p className="text-center text-[11px] text-slate-600 py-2">
                {visible.length} result{visible.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
              </p>
            )}

            {visible.map((msg, idx) => {
              const isMine      = msg.senderId === authUser._id || msg.senderId?._id === authUser._id;
              const myReaction  = getMyReaction(msg);
              const grouped     = groupReactions(msg.reactions);
              const hasReacts   = Object.keys(grouped).length > 0;

              // Date separator
              const showDate = idx === 0 || !sameDay(
                new Date(visible[idx - 1]?.createdAt),
                new Date(msg.createdAt)
              );

              return (
                <div key={msg._id}>
                  {showDate && <DatePill date={msg.createdAt} />}

                  <div className={`flex ${isMine ? "justify-end" : "justify-start"} group mb-0.5`}>
                    <div className="relative" style={{ maxWidth: "min(75%, 520px)" }}>

                      {/* Reaction hover tray */}
                      {!msg.isDeletedForAll && !msg.isOptimistic && (
                        <div className={`absolute -top-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto ${isMine ? "right-0" : "left-0"}`}>
                          <ReactionPicker messageId={msg._id} currentUserReaction={myReaction} onReact={toggleReaction} />
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        onContextMenu={(e) => {
                          if (msg.isOptimistic || msg.isDeletedForAll) return;
                          e.preventDefault();
                          setCtx({ msgId: msg._id, x: e.clientX, y: e.clientY, isMine });
                        }}
                        className={`
                          ${isMine ? "bubble-mine" : "bubble-theirs"}
                          ${searchQuery && msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
                            ? "ring-2 ring-yellow-400/50" : ""}
                        `}
                      >
                        {msg.isDeletedForAll ? (
                          <p className="text-[13px] italic opacity-40">This message was unsent.</p>
                        ) : (
                          <>
                            {msg.image && (
                              <img src={msg.image} alt="Shared"
                                className="rounded-lg max-h-[280px] w-full object-cover mb-1" />
                            )}
                            {msg.text && (
                              <p className="text-[14px] leading-[1.5] break-words whitespace-pre-wrap">
                                {searchQuery ? highlightMatch(msg.text, searchQuery) : msg.text}
                              </p>
                            )}
                          </>
                        )}

                        {/* Time + ticks */}
                        <div className={`flex items-center justify-end gap-1 mt-1
                          ${isMine ? "text-white/50" : "text-slate-500"}`}>
                          <span className="text-[10px]">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" })}
                          </span>
                          {isMine && <MessageTicks message={msg} />}
                        </div>
                      </div>

                      {/* Reaction row */}
                      {hasReacts && !msg.isDeletedForAll && (
                        <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
                          {Object.entries(grouped).map(([emoji, count]) => (
                            <button key={emoji} onClick={() => toggleReaction(msg._id, emoji)}
                              className="text-[12px] px-2 py-0.5 rounded-full border transition-all"
                              style={{
                                background: myReaction === emoji ? 'rgba(79,209,197,0.2)' : 'rgba(26,34,53,0.9)',
                                borderColor: myReaction === emoji ? 'rgba(79,209,197,0.4)' : 'var(--border)',
                                color: 'var(--text-primary)',
                              }}>
                              {emoji}{count > 1 ? ` ${count}` : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Right-click context menu ───────────────────────── */}
      {ctx && (
        <div
          className="dropdown-menu animate-dropdown fixed"
          style={{
            top: Math.min(ctx.y, window.innerHeight - 120),
            left: Math.min(ctx.x, window.innerWidth - 200),
            minWidth: 180,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CtxBtn label="🗑️  Delete for me"
            onClick={() => { deleteMessage(ctx.msgId, false); setCtx(null); }} />
          {ctx.isMine && (
            <>
              <div className="dropdown-divider" />
              <CtxBtn label="↩️  Unsend for everyone" danger
                onClick={() => { deleteMessage(ctx.msgId, true); setCtx(null); }} />
            </>
          )}
        </div>
      )}

      <MessageInput />
    </div>
  );
}

function CtxBtn({ label, onClick, danger }) {
  return (
    <button onClick={onClick} className="dropdown-item"
      style={{ color: danger ? '#fc8181' : 'var(--text-primary)' }}>
      {label}
    </button>
  );
}

function DatePill({ date }) {
  const d   = new Date(date);
  const now = new Date();
  let label;
  if (sameDay(d, now)) label = "Today";
  else {
    const y = new Date(); y.setDate(now.getDate() - 1);
    label = sameDay(d, y) ? "Yesterday"
      : d.toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" });
  }
  return (
    <div className="flex justify-center my-4">
      <span className="text-[11px] px-4 py-1.5 rounded-full shadow-sm"
        style={{
          background: 'rgba(26,34,53,0.85)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}>
        {label}
      </span>
    </div>
  );
}

function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-400/40 text-inherit rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function SearchEmptyIcon() {
  return (
    <svg className="w-12 h-12 text-slate-700" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
}
