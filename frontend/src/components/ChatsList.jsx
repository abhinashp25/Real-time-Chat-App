import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquarePlus, MoreVertical, Search, ArrowLeft, Star, Heart } from "lucide-react";
import toast from "react-hot-toast";

function timeAgo(iso) {
  if (!iso) return "";
  const d    = new Date(iso);
  const now  = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1)  return "now";
  if (mins < 60) return `${mins}m`;
  if (hrs  < 24) return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (days < 7)  return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function ChatsList({ onSelectUser, onSelectGroup, onShowNewGroup, onShowStarred }) {
  const {
    getMyChatPartners, chats, isUsersLoading, setSelectedUser,
    selectedUser, unreadCounts, activeFilter, setActiveFilter, sidebarSearch, setSidebarSearch,
    favourites = [], toggleFavourite, setActiveTab
  } = useChatStore();
  const { groups, selectedGroup } = useGroupStore();
  const { onlineUsers, logout } = useAuthStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { getMyChatPartners(); }, []);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  // 1. Combine chats and groups
  const allConversations = [
    ...chats.map(c => ({
      ...c,
      isGroup: false,
      displayName: c.fullName,
      displayPic: c.profilePic || "/avatar.png",
      sortTime: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).getTime() : 0,
      unreadBadge: unreadCounts[c._id] ?? c.unreadCount ?? 0,
      lastMsgObj: c.lastMessage
    })),
    ...groups.map(g => ({
      ...g,
      isGroup: true,
      displayName: g.name,
      displayPic: null, // use gradient
      sortTime: g.lastMessageAt ? new Date(g.lastMessageAt).getTime() : 0,
      unreadBadge: 0, // Simplified for groups without unread counters natively
      lastMsgObj: g.lastMessage 
    }))
  ].sort((a, b) => b.sortTime - a.sortTime);

  const visible = allConversations.filter((c) => {
    if (c.isArchived) return false;
    if (sidebarSearch && !c.displayName.toLowerCase().includes(sidebarSearch.toLowerCase())) return false;
    
    if (activeFilter === "unread") return c.unreadBadge > 0;
    if (activeFilter === "favourites") return favourites.includes(c._id);
    if (activeFilter === "groups") return c.isGroup;
    return true; // "all"
  });

  const handleConversationClick = (conv) => {
    if (conv.isGroup) {
      if (onSelectGroup) onSelectGroup(conv);
    } else {
      if (onSelectUser) onSelectUser(conv);
      else setSelectedUser(conv);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] overflow-hidden">
      {/* Header matching WhatsApp */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px] relative">
        <h1 className="text-[22px] font-bold text-[#e9edef]">Chats</h1>
        <div className="flex items-center gap-3 text-[#aebac1]">
          <button 
            onClick={() => setActiveTab("contacts")}
            className="hover:bg-white/5 p-2 rounded-full transition-colors flex items-center justify-center" title="New Chat">
            <MessageSquarePlus size={20} strokeWidth={2} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${showMenu ? "bg-white/10" : "hover:bg-white/5"}`}>
              <MoreVertical size={20} strokeWidth={2} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-lg shadow-xl border border-white/5 z-50 animate-fade-in"
                style={{ background: "#233138" }}>
                <button onClick={() => { setShowMenu(false); if (onShowNewGroup) onShowNewGroup(); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">New group</button>
                <button onClick={() => { setShowMenu(false); if (onShowStarred) onShowStarred(); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">Starred messages</button>
                <button onClick={() => { setShowMenu(false); toast("Select chats mode enabled", { icon: "✅" }); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">Select chats</button>
                <button onClick={() => { setShowMenu(false); toast.success("Marked all as read"); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">Mark all as read</button>
                <button onClick={() => { setShowMenu(false); toast("App locked", { icon: "🔒" }); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">App lock</button>
                <button onClick={() => { setShowMenu(false); logout(); }} className="w-full text-left px-5 py-[10px] hover:bg-white/5 text-[14.5px] text-[#d1d7db] transition-colors">Log out</button>
              </div>
            )}
            {/* Overlay to close menu when clicking outside */}
            {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}
          </div>
        </div>
      </div>

      {/* Search Bar aligned with screenshot */}
      <div className="px-3 mb-2">
        <div className={`relative flex items-center bg-[#202c33] rounded-lg h-[35px] transition-colors duration-200 border-b-2 
          ${searchFocused ? "border-[#00a884] bg-white text-gray-900 border-t-transparent border-l-transparent border-r-transparent rounded-b-none" : "border-transparent"}`}>
          
          <button 
            className="w-12 h-full flex items-center justify-center flex-shrink-0"
            onClick={() => { if (searchFocused) { setSidebarSearch(""); setSearchFocused(false); } }}
          >
            {searchFocused ? (
              <ArrowLeft size={18} className="text-[#00a884]" />
            ) : (
              <Search size={16} className="text-[#aebac1]" />
            )}
          </button>
          
          <input 
            type="text" 
            placeholder="Search or start a new chat" 
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => { if (!sidebarSearch) setSearchFocused(false); }}
            className={`w-full bg-transparent text-[14px] focus:outline-none placeholder:font-light ${searchFocused ? "text-gray-900 placeholder:text-gray-500" : "text-[#d1d7db]"}`}
          />
        </div>
      </div>

      {/* Pill Filters */}
      <div className="flex items-center gap-2 px-3 pb-2 pt-1 overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <FilterPill label="All" active={activeFilter === "all" || !activeFilter} onClick={() => setActiveFilter("all")} />
        <FilterPill label="Unread" badge={allConversations.filter(c => c.unreadBadge > 0).length} active={activeFilter === "unread"} onClick={() => setActiveFilter("unread")} />
        <FilterPill label="Favourites" active={activeFilter === "favourites"} onClick={() => setActiveFilter("favourites")} />
        <FilterPill label="Groups" badge={groups.length} active={activeFilter === "groups"} onClick={() => setActiveFilter("groups")} />
        
        {/* Visual + icon for filters as per native WhatsApp */}
        <button onClick={() => toast("Add custom list...")} className="w-7 h-[32px] flex-shrink-0 flex items-center justify-center rounded-full bg-[#202c33] text-[#aebac1] hover:bg-[#202c33]/80 transition-colors">
          <span className="text-[17px] leading-none mb-0.5">+</span>
        </button>
      </div>

      {/* Chat Rows */}
      <div className="flex-1 overflow-y-auto w-full no-scrollbar">
      {!allConversations.length && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
          <p className="font-medium text-[#d1d7db]">No conversations</p>
        </div>
      )}
      {allConversations.length > 0 && !visible.length && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-[#8696a0]">
            {sidebarSearch ? `No results for "${sidebarSearch}"` : `No ${activeFilter} conversations`}
          </p>
        </div>
      )}

      {visible.map((conv) => {
        const isOnline = !conv.isGroup && onlineUsers.includes(conv._id);
        const isActive = conv.isGroup ? selectedGroup?._id === conv._id : selectedUser?._id === conv._id;
        const unread   = conv.unreadBadge;
        const isFav    = favourites?.includes(conv._id);

        return (
          <div key={conv._id} 
            className={`flex items-center px-3 py-[9px] cursor-pointer hover:bg-[#202c33] group transition-colors ${isActive ? "bg-[#2a3942] hover:bg-[#2a3942]" : ""}`}
            onClick={() => handleConversationClick(conv)}
          >
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0 mr-3">
              {conv.isGroup ? (
                <div className="w-[49px] h-[49px] rounded-full flex items-center justify-center text-lg font-bold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #00A884, #008f6f)', color: 'white' }}>
                  {conv.displayName[0].toUpperCase()}
                </div>
              ) : (
                <img src={conv.displayPic} alt={conv.displayName} className="w-[49px] h-[49px] rounded-full object-cover shadow-sm bg-[#e9edef]/10" />
              )}
              {isOnline && (
                <span className="absolute bottom-[2px] right-[2px] w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: '#00a884', borderColor: '#111b21' }} />
              )}
            </div>

            {/* Content / Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-[rgba(255,255,255,0.06)] pb-[10px] pt-1 group-last:border-none">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[16px] text-[#e9edef] truncate" style={{ fontWeight: unread > 0 ? "500" : "400" }}>
                  {sidebarSearch ? highlight(conv.displayName, sidebarSearch) : conv.displayName}
                </p>
                {conv.sortTime > 0 && (
                  <span className="text-[12px] flex-shrink-0" style={{ color: unread > 0 ? '#00a884' : '#8696a0' }}>
                    {timeAgo(conv.sortTime)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2 mt-[2px]">
                <p className="text-[13px] truncate flex-1"
                  style={{ color: '#8696a0' }}>
                  {conv.lastMsgObj ? (
                    <>
                      {conv.lastMsgObj.isMine && !conv.lastMsgObj.isDeleted && (<span>You: </span>)}
                      {conv.isGroup && typeof conv.lastMsgObj === 'string' ? conv.lastMsgObj : conv.lastMsgObj.text || "📷 Image"}
                    </>
                  ) : (
                    <span style={{ fontStyle: 'italic' }}>Start chatting</span>
                  )}
                </p>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavourite && toggleFavourite(conv._id); }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/20 ${isFav ? "!opacity-100" : ""}`}
                  >
                    <Heart size={14} className={isFav ? "fill-[#00a884] text-[#00a884]" : "text-[#8696a0]"} />
                  </button>
                  {unread > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-[#00a884] text-[#111b21] rounded-full text-[11px] font-bold">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function FilterPill({ label, badge, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-[6px] h-[32px] rounded-full text-[14px] transition-colors flex flex-shrink-0 items-center justify-center gap-1.5
        ${active ? "bg-[#0a332c] text-[#00a884]" : "bg-[#202c33] text-[#aebac1] hover:bg-[#202c33]/80"}`}
    >
      {label}
      {badge > 0 && <span className="text-[12px] font-medium" style={{ color: active ? "inherit" : "#00a884" }}>{badge}</span>}
    </button>
  );
}

function highlight(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#00a884]/30 text-inherit rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
