import { FileText, UserPlus, Sparkles, Shield } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AddContactModal from "./AddContactModal";

export default function NativeEmptyState({ onActivateMetaAI }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-8 select-none"
      style={{ background: "#222e35" }}
    >
      {/* Central illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
        className="flex flex-col items-center gap-5 max-w-sm text-center px-8"
      >
        {/* Logo circle */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-[200px] h-[200px] rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 60%, rgba(0,168,132,0.15) 100%)",
              border: "1px solid rgba(0,168,132,0.08)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[160px] h-[160px] rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,168,132,0.06)" }}>
              {/* Chat icon illustration */}
              <svg viewBox="0 0 120 120" width="90" height="90" fill="none">
                <circle cx="60" cy="60" r="50" stroke="#00a884" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3"/>
                <rect x="22" y="35" width="76" height="48" rx="12" fill="#005c4b" opacity="0.6"/>
                <rect x="28" y="42" width="40" height="6" rx="3" fill="#00a884" opacity="0.7"/>
                <rect x="28" y="54" width="52" height="5" rx="2.5" fill="#8696a0" opacity="0.4"/>
                <rect x="28" y="64" width="32" height="5" rx="2.5" fill="#8696a0" opacity="0.3"/>
                <circle cx="84" cy="75" r="14" fill="#202c33"/>
                <path d="M79 75l3.5 3.5L90 68" stroke="#00a884" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[24px] font-light mb-2"
            style={{ color: "#e9edef" }}
          >
            Chatify for Desktop
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[14px] leading-relaxed"
            style={{ color: "#8696a0" }}
          >
            Send and receive messages without keeping your phone online.
            Use Chatify on up to 4 linked devices and 1 phone simultaneously.
          </motion.p>
        </div>

        {/* Encryption badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: "rgba(134,150,160,0.06)", border: "1px solid rgba(134,150,160,0.12)" }}
        >
          <Shield size={14} style={{ color: "#8696a0" }} strokeWidth={1.5} />
          <span className="text-[12.5px]" style={{ color: "#8696a0" }}>
            Your personal messages are end-to-end encrypted
          </span>
        </motion.div>
      </motion.div>

      {/* Action tiles */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <ActionTile
          icon={<FileText size={21} style={{ color: "#aebac1" }} strokeWidth={1.5} />}
          label="Send document"
          onClick={() => {}}
        />
        <ActionTile
          icon={<UserPlus size={21} style={{ color: "#aebac1" }} strokeWidth={1.5} />}
          label="Add contact"
          onClick={() => setModalOpen(true)}
        />
        <ActionTile
          icon={
            <div className="w-[22px] h-[22px] rounded-full" style={{
              background: "conic-gradient(from 0deg, #00a884, #4fd1c5, #667eea, #00a884)",
              animation: "spin-ring 3s linear infinite",
              padding: 2,
            }}>
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#2a3942" }}>
                <Sparkles size={9} style={{ color: "#00a884" }} />
              </div>
            </div>
          }
          label="Chatify AI"
          onClick={onActivateMetaAI}
        />
      </motion.div>
      <AddContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function ActionTile({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center gap-3 px-5 py-5 rounded-2xl transition-colors"
      style={{
        background: "#2a3942",
        border: "1px solid rgba(255,255,255,0.05)",
        minWidth: 110,
        color: "#e9edef",
      }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        {icon}
      </div>
      <span className="text-[12.5px] font-medium text-center leading-tight" style={{ color: "#aebac1" }}>
        {label}
      </span>
    </motion.button>
  );
}
