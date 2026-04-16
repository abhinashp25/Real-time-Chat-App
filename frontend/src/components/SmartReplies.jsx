import { useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import { useChatStore } from "../store/useChatStore";
import { SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function SmartReplies({ lastMessage }) {
  const { smartReplies, fetchSmartReplies, clearSmartReplies } = useAIStore();
  const { setPendingInput } = useChatStore();

  useEffect(() => {
    if (lastMessage) fetchSmartReplies(lastMessage);
    else clearSmartReplies();
  }, [lastMessage, fetchSmartReplies, clearSmartReplies]);

  if (!smartReplies.length) return null;

  const handleSelect = (reply) => {
    setPendingInput(reply);   // fills MessageInput via React state
    clearSmartReplies();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="px-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar mask-fade-edges">
      
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <SparklesIcon className="w-3.5 h-3.5 text-[#e5e5e5]" />
      </div>

      {smartReplies.map((r, i) => (
        <motion.button key={i} onClick={() => handleSelect(r)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="text-[12.5px] font-medium px-4 py-1.5 rounded-xl whitespace-nowrap transition-colors flex-shrink-0 bg-[#1a1a1a]/80 hover:bg-[#262626] backdrop-blur-md shadow-lg"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#d1d7db' }}>
          {r}
        </motion.button>
      ))}
    </motion.div>
  );
}
