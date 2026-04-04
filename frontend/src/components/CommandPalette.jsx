import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, Settings, Moon, Sun, MessageSquare } from "lucide-react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const { chats, setSelectedUser } = useChatStore();
  const { authUser, logout } = useAuthStore();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  const togglePalette = () => {
    setOpen(!open);
  }

  // Filter actions based on query
  const rawActions = [
    { id: "logout", label: "Log out", icon: <Settings size={18} />, action: () => logout() },
    ...chats.map((chat) => ({
      id: `chat-${chat._id}`,
      label: `Chat with ${chat.fullName}`,
      icon: <MessageSquare size={18} />,
      action: () => {
        setSelectedUser(chat);
        setOpen(false);
      }
    }))
  ];

  const filteredActions = query === "" 
    ? rawActions 
    : rawActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-xl mx-4 overflow-hidden rounded-2xl border border-glass-border shadow-premium-heavy pointer-events-auto"
              style={{ background: "rgba(18, 26, 46, 0.95)", backdropFilter: "blur(24px)" }}
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search size={20} className="text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
                />
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 font-mono">ESC</kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredActions.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">No results found.</p>
                ) : (
                  filteredActions.map((action, i) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <div className="text-gray-400 text-premium-cyan">{action.icon}</div>
                      {action.label}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
