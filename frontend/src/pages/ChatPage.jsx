import { useChatStore } from "../store/useChatStore";
import ProfileHeader     from "../components/ProfileHeader";
import ActiveTabSwitch   from "../components/ActiveTabSwitch";
import ChatsList         from "../components/ChatsList";
import ContactList       from "../components/ContactList";
import ChatContainer     from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    /* Full-viewport: sidebar + chat panel side-by-side on desktop,
       single panel on mobile */
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside
        className={`
          flex-shrink-0 flex flex-col
          w-full sm:w-[340px] md:w-[360px] lg:w-[400px]
          border-r
          ${selectedUser ? "hidden sm:flex" : "flex"}
        `}
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <ProfileHeader />
        <ActiveTabSwitch />
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" ? <ChatsList /> : <ContactList />}
        </div>
      </aside>

      {/* ── CHAT PANEL ──────────────────────────────────── */}
      <main
        className={`
          flex-1 flex flex-col min-w-0 chat-bg
          ${selectedUser ? "flex" : "hidden sm:flex"}
        `}
      >
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </main>
    </div>
  );
}
export default ChatPage;
