import { motion } from "framer-motion";
import { MessageSquarePlus, Zap, Settings2 } from "lucide-react";

export default function NativeEmptyState({ onActivateMetaAI }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-4 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border-[1px] border-white rounded-full"></div>
        <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border-[1px] border-white rounded-full"></div>
        <div className="absolute w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] border-[1px] border-white rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[520px] flex flex-col items-center">
        {/* Minimal Logo Mark */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 bg-[#111111] border border-[#262626] rounded-2xl flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          <img src="/logo.png" alt="Chatify" className="w-10 h-10 object-contain drop-shadow-md brightness-0 invert opacity-90" />
        </motion.div>

        {/* Typography */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl font-semibold text-white tracking-tight brand-font mb-4"
        >
          Chatify OS
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] leading-[1.6] text-[#a3a3a3] max-w-[380px] font-light"
        >
          Experience uncompromised privacy and speed. Select a conversation from the sidebar or start a new connection.
        </motion.p>

        {/* Quick Actions Array - Replaced legacy buttons with sleek minimal ones */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex items-center justify-center gap-4 flex-wrap"
        >
          <button className="flex items-center gap-3 px-6 py-3 bg-[#111111] border border-[#262626] hover:bg-[#1a1a1a] hover:border-[#333] transition-all rounded-xl text-white text-sm font-medium">
            <MessageSquarePlus size={18} className="text-[#a3a3a3]" />
            New Message
          </button>
          
          <button 
            onClick={onActivateMetaAI}
            className="flex items-center gap-3 px-6 py-3 bg-white text-black hover:bg-[#e5e5e5] transition-all rounded-xl text-sm font-medium"
          >
            <Zap size={18} className="text-black" />
            Chatify AI
          </button>
        </motion.div>

        {/* Bottom Lock / Security Disclaimer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-[-80px] flex items-center gap-2 text-[#737373] text-[12px] font-medium tracking-wide"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          END-TO-END ENCRYPTED
        </motion.div>
      </div>
    </div>
  );
}
