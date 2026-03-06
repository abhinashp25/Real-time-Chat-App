import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers, searchQuery, setSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = !!typingUsers[selectedUser._id];

  useEffect(() => {
    const handleEscKey = (e) => { if (e.key === "Escape") setSelectedUser(null); };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex flex-col bg-slate-800/50 border-b border-slate-700/50 px-6 py-3 gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="w-12 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
            {/* TYPING INDICATOR: shows "typing…" with animated dots instead of Online/Offline */}
            {isTyping ? (
              <p className="text-cyan-400 text-sm flex items-center gap-1">
                typing
                <span className="flex gap-0.5 mt-0.5">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </p>
            ) : (
              <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
            )}
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>

      {/* MESSAGE SEARCH: inline search bar below the user info */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages…"
          className="w-full bg-slate-700/40 border border-slate-700/50 rounded-lg py-1.5 pl-8 pr-4
                     text-slate-300 placeholder-slate-500 text-sm
                     focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
