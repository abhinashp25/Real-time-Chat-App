import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageTicks from "./MessageTicks";
import ReactionPicker from "./ReactionPicker";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    markMessagesAsRead,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    toggleReaction,
    deleteMessage,
    searchQuery,
  } = useChatStore();
  const { authUser, cacheContact } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null); // { msgId, x, y, isMine }

  useEffect(() => {
    cacheContact(selectedUser._id, selectedUser.fullName);
  }, [selectedUser, cacheContact]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    markMessagesAsRead(selectedUser._id);
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages,
      unsubscribeFromMessages, markMessagesAsRead]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const visibleMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const getMyReaction = (msg) =>
    msg.reactions?.find((r) => r.userId === authUser._id || r.userId?._id === authUser._id)?.emoji;

  const groupReactions = (reactions = []) =>
    reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {visibleMessages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Search results banner */}
            {searchQuery && (
              <p className="text-center text-xs text-slate-500">
                {visibleMessages.length} result{visibleMessages.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
              </p>
            )}

            {visibleMessages.map((msg) => {
              const isMine = msg.senderId === authUser._id ||
                             msg.senderId?._id === authUser._id;
              const myReaction = getMyReaction(msg);
              const grouped = groupReactions(msg.reactions);
              const hasReactions = Object.keys(grouped).length > 0;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isMine ? "chat-end" : "chat-start"}`}
                >
                  {/* Wrapper gives the reaction picker its hover anchor */}
                  <div className="relative group">

                    {/* REACTION PICKER — floats above the bubble on hover */}
                    {!msg.isDeletedForAll && !msg.isOptimistic && (
                      <div className={`${isMine ? "right-0" : "left-0"}`}>
                        <ReactionPicker
                          messageId={msg._id}
                          currentUserReaction={myReaction}
                          onReact={toggleReaction}
                        />
                      </div>
                    )}

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={`chat-bubble relative cursor-default select-text
                        ${isMine ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}
                        ${searchQuery && msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
                          ? "ring-2 ring-cyan-400/60" : ""}
                      `}
                      onContextMenu={(e) => {
                        if (msg.isOptimistic || msg.isDeletedForAll) return;
                        e.preventDefault();
                        setContextMenu({ msgId: msg._id, x: e.clientX, y: e.clientY, isMine });
                      }}
                    >
                      {/* DELETED FOR ALL tombstone */}
                      {msg.isDeletedForAll ? (
                        <p className="italic opacity-50 text-sm">This message was unsent.</p>
                      ) : (
                        <>
                          {msg.image && (
                            <img src={msg.image} alt="Shared"
                              className="rounded-lg h-48 object-cover" />
                          )}
                          {msg.text && (
                            <p className="mt-2">
                              {/* Highlight matched search text */}
                              {searchQuery
                                ? highlightMatch(msg.text, searchQuery)
                                : msg.text}
                            </p>
                          )}
                        </>
                      )}

                      {/* Time + read ticks */}
                      <p className="text-xs mt-1 opacity-75 flex items-center justify-end gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit", minute: "2-digit",
                        })}
                        {isMine && <MessageTicks message={msg} />}
                      </p>
                    </div>

                    {/* REACTION BUBBLES below the message */}
                    {hasReactions && !msg.isDeletedForAll && (
                      <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
                        {Object.entries(grouped).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg._id, emoji)}
                            title={count > 1 ? `${count} people` : ""}
                            className={`text-sm px-1.5 py-0.5 rounded-full border transition-all
                              ${myReaction === emoji
                                ? "bg-cyan-500/20 border-cyan-400/60 text-white"
                                : "bg-slate-700/60 border-slate-600/40 text-slate-300 hover:bg-slate-600/60"}
                            `}
                          >
                            {emoji}{count > 1 ? ` ${count}` : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>No messages match &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {/* RIGHT-CLICK CONTEXT MENU — Delete / Unsend */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-xl
                     overflow-hidden text-sm min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 transition-colors"
            onClick={() => { deleteMessage(contextMenu.msgId, false); setContextMenu(null); }}
          >
            🗑️ Delete for me
          </button>
          {contextMenu.isMine && (
            <button
              className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-slate-700 transition-colors border-t border-slate-700"
              onClick={() => { deleteMessage(contextMenu.msgId, true); setContextMenu(null); }}
            >
              ↩️ Unsend for everyone
            </button>
          )}
        </div>
      )}

      <MessageInput />
    </>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-cyan-400/30 text-inherit rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default ChatContainer;
