import { SearchIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ActiveTabSwitch() {
  const { activeTab, setActiveTab, activeFilter, setActiveFilter, chats, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [search, setSearch] = useState("");

  const totalUnread = Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0);
  const totalOnline = (chats || []).filter(
    (c) => (onlineUsers || []).includes(c._id)
).length;

  useEffect(() => {
    const el = document.getElementById("sidebar-search-hidden");
    if (el) el.value = search;
  }, [search]);

  return (
    <div className="flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>

      {/* Tab row */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        {["chats", "contacts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3.5 text-[13px] font-semibold transition-all relative capitalize"
            style={{ color: activeTab === tab ? '#4fd1c5' : 'var(--text-muted)' }}
          >
            {tab}
            <span
              className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full transition-all duration-300"
              style={{
                background: activeTab === tab ? '#4fd1c5' : 'transparent',
                boxShadow: activeTab === tab ? '0 0 8px rgba(79,209,197,0.5)' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <SearchIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "chats" ? "Search or start new chat" : "Search contacts…"}
            className="w-full py-2.5 pl-10 pr-9 text-sm border-none focus:outline-none transition-all"
            style={{
              background: 'var(--bg-input)',
              borderRadius: '9999px',
              color: 'var(--text-primary)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter pills — only on Chats tab */}
      {activeTab === "chats" && (
        <div className="flex items-center gap-2 px-3 pb-2.5 overflow-x-auto no-scrollbar">
          <FilterPill label="All"    active={activeFilter === "all"}    onClick={() => setActiveFilter("all")} />
          <FilterPill
            label={`Unread${totalUnread > 0 ? ` ${totalUnread}` : ""}`}
            active={activeFilter === "unread"}
            onClick={() => setActiveFilter("unread")}
          />
          <FilterPill
            label={`Online${totalOnline > 0 ? ` ${totalOnline}` : ""}`}
            active={activeFilter === "online"}
            onClick={() => setActiveFilter("online")}
          />
        </div>
      )}

      {/* Hidden bridge so child lists can read the search value */}
      <input type="hidden" id="sidebar-search-hidden" defaultValue="" />
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`filter-pill ${active ? "active" : ""}`}>
      {label}
    </button>
  );
}
