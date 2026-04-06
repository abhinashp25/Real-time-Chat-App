import { MessageSquare, Phone, Users, CircleDot, Archive, Settings, Sparkles } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";

export default function LeftRail({ activeTab, setActiveTab }) {
  const { unreadCounts } = useChatStore();
  const { authUser } = useAuthStore();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className="flex flex-col items-center py-2 gap-0.5 flex-shrink-0"
      style={{
        width: 68,
        background: "#202c33",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Profile Avatar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveTab("profile")}
        className="w-10 h-10 rounded-full overflow-hidden mb-3 mt-1 flex-shrink-0 relative"
        style={{
          border: activeTab === "profile" ? "2px solid #00a884" : "2px solid transparent",
          transition: "border-color 0.2s",
        }}
      >
        <img src={authUser?.profilePic || "/avatar.png"} alt="me" className="w-full h-full object-cover" />
      </motion.button>

      {/* Primary Nav */}
      <NavBtn label="Chats" active={!activeTab || activeTab === "chats"} badge={totalUnread} onClick={() => setActiveTab("chats")}>
        <MessageSquare size={21} strokeWidth={1.8} />
      </NavBtn>

      <NavBtn label="Calls" active={activeTab === "calls"} onClick={() => setActiveTab("calls")}>
        <Phone size={21} strokeWidth={1.8} />
      </NavBtn>

      <NavBtn label="Status" active={activeTab === "status"} onClick={() => setActiveTab("status")}>
        <CircleDot size={21} strokeWidth={1.8} />
      </NavBtn>

      <NavBtn label="Communities" active={activeTab === "communities"} onClick={() => setActiveTab("communities")}>
        <Users size={21} strokeWidth={1.8} />
      </NavBtn>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Chatify AI — animated conic ring */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title="Ask Chatify AI"
        onClick={() => setActiveTab("chatify-ai")}
        className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all"
        style={{ background: activeTab === "chatify-ai" ? "rgba(0,168,132,0.12)" : "transparent" }}
      >
        <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center"
          style={{
            background: "conic-gradient(from 0deg, #00a884, #4fd1c5, #667eea, #9f7aea, #00a884)",
            animation: "spin-ring 3s linear infinite",
            padding: 2.5,
          }}>
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#202c33" }}>
            <Sparkles size={10} style={{ color: "#00a884" }} />
          </div>
        </div>
        {activeTab === "chatify-ai" && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#00a884" }} />
        )}
      </motion.button>

      <NavBtn label="Archive" active={activeTab === "archived"} onClick={() => setActiveTab("archived")}>
        <Archive size={21} strokeWidth={1.8} />
      </NavBtn>

      <NavBtn label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
        <Settings size={21} strokeWidth={1.8} />
      </NavBtn>
    </div>
  );
}

function NavBtn({ children, label, active, badge, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      title={label}
      onClick={onClick}
      className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all"
      style={{
        color: active ? "#e9edef" : "#8696a0",
        background: active ? "rgba(255,255,255,0.07)" : "transparent",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
      {badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: "#00a884", color: "#fff" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#00a884" }} />
      )}
    </motion.button>
  );
}
