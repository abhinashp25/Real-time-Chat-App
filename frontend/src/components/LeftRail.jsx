import { MessageSquare, Phone, Users, CircleDot, Archive, Settings, Zap } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";

export default function LeftRail({ activeTab, setActiveTab }) {
  const { unreadCounts } = useChatStore();
  const { authUser } = useAuthStore();
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className="flex flex-col items-center py-4 gap-2 flex-shrink-0"
      style={{
        width: 72,
        background: "#0a0a0a",
        borderRight: "1px solid #141414",
      }}
    >
      {/* Profile Avatar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveTab("profile")}
        className="w-10 h-10 rounded-full overflow-hidden mb-6 flex-shrink-0 relative"
        style={{
          border: activeTab === "profile" ? "2px solid #ffffff" : "2px solid transparent",
          transition: "border-color 0.2s",
        }}
      >
        <img src={authUser?.profilePic || "/avatar.png"} alt="me" className="w-full h-full object-cover" />
      </motion.button>

      {/* Primary Nav */}
      <NavBtn label="Chats" active={!activeTab || activeTab === "chats"} badge={totalUnread} onClick={() => setActiveTab("chats")}>
        <MessageSquare size={20} strokeWidth={2} />
      </NavBtn>

      <NavBtn label="Calls" active={activeTab === "calls"} onClick={() => setActiveTab("calls")}>
        <Phone size={20} strokeWidth={2} />
      </NavBtn>

      <NavBtn label="Status" active={activeTab === "status"} onClick={() => setActiveTab("status")}>
        <CircleDot size={20} strokeWidth={2} />
      </NavBtn>

      <NavBtn label="Communities" active={activeTab === "communities"} onClick={() => setActiveTab("communities")}>
        <Users size={20} strokeWidth={2} />
      </NavBtn>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Chatify AI - Sleek minimal button without neon glow */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Chatify AI"
        onClick={() => setActiveTab("chatify-ai")}
        className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${activeTab === "chatify-ai" ? "bg-white text-black shadow-md" : "bg-[#111111] text-[#a3a3a3] border border-[#262626] hover:bg-[#1a1a1a] hover:text-white"}`}
      >
        <Zap size={20} strokeWidth={2} />
        {activeTab === "chatify-ai" && (
          <span className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white" />
        )}
      </motion.button>

      <div className="my-2" />

      <NavBtn label="Archive" active={activeTab === "archived"} onClick={() => setActiveTab("archived")}>
        <Archive size={20} strokeWidth={2} />
      </NavBtn>

      <NavBtn label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
        <Settings size={20} strokeWidth={2} />
      </NavBtn>
    </div>
  );
}

function NavBtn({ children, label, active, badge, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title={label}
      onClick={onClick}
      className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
        active ? "bg-[#1a1a1a] text-white" : "text-[#737373] hover:text-white hover:bg-[#111111]"
      }`}
    >
      {children}
      {badge > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && (
        <span className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white" />
      )}
    </motion.button>
  );
}
