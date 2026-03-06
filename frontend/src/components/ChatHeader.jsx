import {
  ArrowLeftIcon, SearchIcon, PhoneIcon, VideoIcon,
  MoreVerticalIcon, XIcon, InfoIcon, TrashIcon, UserXIcon,
} from "lucide-react";
import { useChatStore }  from "../store/useChatStore";
import { useAuthStore }  from "../store/useAuthStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers, searchQuery, setSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline  = onlineUsers.includes(selectedUser._id);
  const isTyping  = !!typingUsers[selectedUser._id];
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if (e.key !== "Escape") return;
      if (searchOpen) { setSearchOpen(false); setSearchQuery(""); }
      else setSelectedUser(null);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setSelectedUser, searchOpen, setSearchQuery]);

  useEffect(() => {
    const h = () => setMenuOpen(false);
    if (menuOpen) { document.addEventListener("click", h); return () => document.removeEventListener("click", h); }
  }, [menuOpen]);

  return (
    <div className="flex-shrink-0" style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}>

      {/* Main header row */}
      <div className="flex items-center gap-2 px-3 h-[64px]">

        {/* Back button — mobile only */}
        <button
          onClick={() => setSelectedUser(null)}
          className="icon-btn sm:hidden flex-shrink-0"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0 cursor-pointer">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
          />
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#48bb78', borderColor: 'var(--bg-header)' }}
            />
          )}
        </div>

        {/* Name + status */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => toast(`${selectedUser.fullName}`, { icon: "👤" })}
        >
          <p className="text-[15px] font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
            {selectedUser.fullName}
          </p>
          {isTyping ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px]" style={{ color: '#4fd1c5' }}>typing</span>
              <span className="flex gap-[3px] items-center">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#4fd1c5', animationDelay: `${d}ms` }}
                  />
                ))}
              </span>
            </div>
          ) : (
            <p className="text-[12px] leading-tight" style={{ color: isOnline ? '#48bb78' : 'var(--text-muted)' }}>
              {isOnline ? "online" : "offline"}
            </p>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            className="icon-btn"
            title="Voice call"
            onClick={() => toast("Voice calls coming soon! 📞", { icon: "🔜" })}
          >
            <PhoneIcon className="w-[17px] h-[17px]" />
          </button>
          <button
            className="icon-btn"
            title="Video call"
            onClick={() => toast("Video calls coming soon! 📹", { icon: "🔜" })}
          >
            <VideoIcon className="w-[17px] h-[17px]" />
          </button>
          <button
            className={`icon-btn ${searchOpen ? "active" : ""}`}
            title="Search messages"
            onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearchQuery(""); }}
          >
            <SearchIcon className="w-[17px] h-[17px]" />
          </button>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              className={`icon-btn ${menuOpen ? "active" : ""}`}
              title="More options"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              <MoreVerticalIcon className="w-[17px] h-[17px]" />
            </button>
            {menuOpen && (
              <div className="dropdown-menu animate-dropdown" style={{ top: '44px', right: 0 }}>
                <button className="dropdown-item" onClick={() => {
                  toast(`Viewing: ${selectedUser.fullName}`, { icon: "👤" });
                  setMenuOpen(false);
                }}>
                  <InfoIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  View contact
                </button>
                <button className="dropdown-item" onClick={() => {
                  setSearchOpen(true); setMenuOpen(false);
                }}>
                  <SearchIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  Search messages
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" style={{ color: '#fc8181' }} onClick={() => {
                  setSelectedUser(null); setMenuOpen(false);
                }}>
                  <XIcon className="w-4 h-4" />
                  Close chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="px-3 pb-3">
          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages…"
              className="w-full py-2.5 pl-10 pr-9 text-sm border-none focus:outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                borderRadius: '9999px',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
