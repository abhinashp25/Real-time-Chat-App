import { useState, useEffect } from "react";
import { useChatStore }   from "../store/useChatStore";
import { useGroupStore }  from "../store/useGroupStore";
import { useAuthStore }   from "../store/useAuthStore";
import { useSettingsStore } from "../store/useSettingsStore";
import ProfileHeader      from "../components/ProfileHeader";
import ActiveTabSwitch    from "../components/ActiveTabSwitch";
import ChatsList          from "../components/ChatsList";
import ContactList        from "../components/ContactList";
import ChatContainer      from "../components/ChatContainer";
import GroupChatWindow    from "../components/GroupChatWindow";
import AIChatWindow       from "../components/AIChatWindow";
import ArchivedChats      from "../components/ArchivedChats";
import StarredMessages    from "../components/StarredMessages";
import CreateGroupModal   from "../components/CreateGroupModal";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import SettingsPage       from "./SettingsPage";

function ChatPage() {
  const { activeTab, selectedUser, chats, unreadCounts, archivedChats } = useChatStore();
  const {
    groups, selectedGroup, setSelectedGroup,
    fetchGroups, subscribeToGroupMessages, unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { applyStoredTheme } = useSettingsStore();

  const [showAI,       setShowAI]       = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showStarred,  setShowStarred]  = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchGroups();
    subscribeToGroupMessages();
    applyStoredTheme();
    return () => unsubscribeFromGroupMessages();
  }, []);

  // Computed counts
  const totalUnread   = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const archivedCount = chats.filter(c => c.isArchived).length;
  const groupCount    = groups.length;

  const rightPanel = () => {
    if (showAI)        return <AIChatWindow onClose={() => setShowAI(false)} />;
    if (selectedGroup) return <GroupChatWindow group={selectedGroup} onClose={() => setSelectedGroup(null)} />;
    if (selectedUser)  return <ChatContainer />;
    return <NoConversationPlaceholder />;
  };

  if (showArchived) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <aside className="flex-shrink-0 flex flex-col w-full sm:w-[360px] md:w-[400px]"
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <ArchivedChats onClose={() => setShowArchived(false)} />
        </aside>
        <main className="flex-1 hidden sm:flex flex-col chat-bg"><NoConversationPlaceholder /></main>
      </div>
    );
  }

  if (showStarred) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <aside className="flex-shrink-0 flex flex-col w-full sm:w-[360px] md:w-[400px]"
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <StarredMessages onClose={() => setShowStarred(false)} />
        </aside>
        <main className="flex-1 hidden sm:flex flex-col chat-bg"><NoConversationPlaceholder /></main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col w-full sm:w-[360px] md:w-[400px]
          ${(selectedUser || selectedGroup || showAI) ? "hidden sm:flex" : "flex"}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <ProfileHeader
          onShowAI={() => { setShowAI(true); setSelectedGroup(null); }}
          onShowArchived={() => setShowArchived(true)}
          onShowStarred={() => setShowStarred(true)}
          onShowSettings={() => setShowSettings(true)}
        />
        <ActiveTabSwitch extraActions={
          <button onClick={() => setShowNewGroup(true)} className="icon-btn" title="New group">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
        }/>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats"    && <ChatsList />}
          {activeTab === "contacts" && <ContactList />}
          {activeTab === "groups"   && <GroupsList groups={groups} selected={selectedGroup} onSelect={(g) => { setSelectedGroup(g); setShowAI(false); }} />}
        </div>

        {/* ── Bottom Nav Bar ──────────────────────────────── */}
        <div className="flex items-center flex-shrink-0 px-1"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-header)', height: 58 }}>

          {/* AI */}
          <NavBtn
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            }
            label="AI Chat" active={showAI}
            onClick={() => { setShowAI(true); setSelectedGroup(null); }}
          />

          {/* Archive with count */}
          <NavBtn
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
            }
            label="Archived" badge={archivedCount}
            onClick={() => setShowArchived(true)}
          />

          {/* Starred */}
          <NavBtn
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            }
            label="Starred"
            onClick={() => setShowStarred(true)}
          />

          {/* Groups */}
          <NavBtn
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
            label="Groups" badge={groupCount}
            onClick={() => setShowNewGroup(true)}
          />

          {/* Settings */}
          <NavBtn
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            }
            label="Settings"
            onClick={() => setShowSettings(true)}
          />
        </div>

        {/* ── Stat strip above nav ──────────────────────────── */}
        {(totalUnread > 0 || archivedCount > 0) && (
          <div className="flex items-center gap-3 px-4 py-1.5 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
            {totalUnread > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <b style={{ color: 'var(--accent)' }}>{totalUnread}</b> unread
                </span>
              </div>
            )}
            {archivedCount > 0 && (
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowArchived(true)}>
                <span className="w-2 h-2 rounded-full" style={{ background: '#a0aec0' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <b style={{ color: '#a0aec0' }}>{archivedCount}</b> archived
                </span>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Chat panel */}
      <main className={`flex-1 flex flex-col min-w-0 chat-bg ${(selectedUser || selectedGroup || showAI) ? "flex" : "hidden sm:flex"}`}>
        {rightPanel()}
      </main>

      {showNewGroup  && <CreateGroupModal onClose={() => setShowNewGroup(false)} />}
      {showSettings  && <SettingsPage onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function GroupsList({ groups, selected, onSelect }) {
  if (!groups.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        style={{ color: 'var(--text-muted)' }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No groups yet</p>
    </div>
  );
  return (
    <div>
      {groups.map((g) => (
        <div key={g._id} onClick={() => onSelect(g)} className={`chat-row ${selected?._id === g._id ? "active" : ""}`}>
          {g.groupPic ? (
            <img src={g.groupPic} alt={g.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #667eea, #4fd1c5)', color: 'white' }}>
              {g.name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
            <p className="text-[12px] truncate" style={{ color: 'var(--text-muted)' }}>
              {g.lastMessage || `${g.members?.length || 0} members`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NavBtn({ icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick}
      className="relative flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-150"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: active ? 'var(--bg-active)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
            style={{ background: 'var(--accent)' }}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className="text-[9px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}

export default ChatPage;
