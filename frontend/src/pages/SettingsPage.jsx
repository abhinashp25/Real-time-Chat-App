import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSettingsStore, THEMES } from "../store/useSettingsStore";
import { useChatStore } from "../store/useChatStore";
import {
  ArrowLeftIcon, CameraIcon, PencilIcon, CheckIcon, XIcon,
  PaletteIcon, BellIcon, ShieldIcon, InfoIcon, LogOutIcon,
  MessageSquareIcon, ZapIcon, MoonIcon, SunIcon, SettingsIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage({ onClose }) {
  const { authUser, logout, updateProfile } = useAuthStore();
  const { activeTheme, setTheme, fontSize, setFontSize, enterToSend, setEnterToSend } = useSettingsStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [section, setSection] = useState("profile"); 
  const [editing, setEditing] = useState(null);       
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving]   = useState(false);
  const fileRef = useRef(null);

  const startEdit = (field, val) => { setEditing(field); setEditVal(val || ""); };
  const cancelEdit = () => { setEditing(null); setEditVal(""); };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateProfile({ [editing]: editVal });
      toast.success("Saved");
      setEditing(null);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        await updateProfile({ profilePic: reader.result });
        toast.success("Photo updated!");
      } catch { toast.error("Failed to update photo"); }
      finally { setSaving(false); }
    };
    reader.readAsDataURL(file);
  };

  const SECTIONS = [
    { id: "profile",       label: "Profile",       icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { id: "theme",         label: "Appearance",    icon: <PaletteIcon className="w-4 h-4" /> },
    { id: "chats",         label: "Chats",         icon: <MessageSquareIcon className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon className="w-4 h-4" /> },
    { id: "privacy",       label: "Privacy",       icon: <ShieldIcon className="w-4 h-4" /> },
    { id: "about",         label: "About",         icon: <InfoIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      {/* Panel */}
      <div className="relative flex w-full max-w-3xl mx-auto my-6 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>

        {/* Sidebar nav */}
        <div className="w-52 flex-shrink-0 flex flex-col py-4"
          style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-4 mb-5">
            <SettingsIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <p className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Settings</p>
          </div>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all text-left"
              style={{
                color: section === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                background: section === s.id ? 'var(--bg-active)' : 'transparent',
                borderLeft: section === s.id ? `2px solid var(--accent)` : '2px solid transparent',
              }}>
              {s.icon}
              {s.label}
            </button>
          ))}

          <div className="mt-auto px-3 pb-2">
            <button onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors hover:bg-red-500/10"
              style={{ color: '#fc8181' }}>
              <LogOutIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-[60px] flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {SECTIONS.find(s => s.id === section)?.label}
            </p>
            <button onClick={onClose} className="icon-btn"><XIcon className="w-4 h-4" /></button>
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {section === "profile" && (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img src={authUser.profilePic || "/avatar.png"} alt="profile"
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ border: '3px solid var(--accent)', boxShadow: '0 0 20px var(--accent-dim)' }} />
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      <CameraIcon className="w-4 h-4 text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
                  </div>
                  {saving && <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Saving…</p>}
                </div>

                {/* Editable fields */}
                {[
                  { key: "fullName", label: "Name",   val: authUser.fullName,  multi: false },
                  { key: "bio",      label: "Bio",    val: authUser.bio || "",   multi: true, hint: "0/160" },
                  { key: "status",   label: "Status", val: authUser.status || "", multi: false },
                ].map(({ key, label, val, multi }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      {editing !== key && (
                        <button onClick={() => startEdit(key, val)} className="icon-btn p-1">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {editing === key ? (
                      <div>
                        {multi ? (
                          <textarea value={editVal} onChange={(e) => setEditVal(e.target.value.slice(0, 160))}
                            rows={3} maxLength={160}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border-none focus:outline-none resize-none"
                            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
                            autoFocus />
                        ) : (
                          <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border-none focus:outline-none"
                            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
                            autoFocus />
                        )}
                        <div className="flex gap-2 mt-2">
                          <button onClick={saveEdit} disabled={saving}
                            className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-white"
                            style={{ background: 'var(--accent)' }}>
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={cancelEdit}
                            className="px-4 py-1.5 rounded-lg text-[12px]"
                            style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] px-4 py-2.5 rounded-xl"
                        style={{ background: 'var(--bg-input)', color: val ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: val ? 'normal' : 'italic' }}>
                        {val || `No ${label.toLowerCase()} set`}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Email</p>
                  <p className="text-[14px] px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                    {authUser.email}
                  </p>
                </div>
              </div>
            )}

            {section === "theme" && (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Choose a theme — your contacts will see the same app but in their own theme
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <button key={key} onClick={() => { setTheme(key); toast(`${theme.emoji} ${theme.name} theme applied`, { duration: 1500 }); }}
                        className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                        style={{
                          background: theme.vars["--bg-panel"],
                          border: activeTheme === key ? `2px solid ${theme.vars["--accent"]}` : `1px solid ${theme.vars["--border"]}`,
                          boxShadow: activeTheme === key ? `0 0 16px ${theme.vars["--accent-dim"]}` : 'none',
                        }}>
                        {/* Preview swatches */}
                        <div className="flex gap-1 flex-shrink-0">
                          {[theme.vars["--accent"], theme.vars["--bubble-mine"], theme.vars["--bg-header"]].map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold truncate" style={{ color: theme.vars["--text-primary"] }}>
                            {theme.emoji} {theme.name}
                          </p>
                        </div>
                        {activeTheme === key && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: theme.vars["--accent"] }}>
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Font Size</p>
                  <div className="flex gap-2">
                    {["small","medium","large"].map((s) => (
                      <button key={s} onClick={() => { setFontSize(s); toast(`Font: ${s}`, { duration: 1200 }); }}
                        className="flex-1 py-2 rounded-xl text-[13px] font-medium transition-all capitalize"
                        style={{
                          background: fontSize === s ? 'var(--accent)' : 'var(--bg-input)',
                          color: fontSize === s ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${fontSize === s ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === "chats" && (
              <div className="space-y-3">
                <ToggleRow
                  icon={<ZapIcon className="w-4 h-4" />}
                  label="Enter to send" desc="Press Enter to send messages"
                  value={enterToSend} onToggle={() => setEnterToSend(!enterToSend)} />
                <ToggleRow
                  icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
                  label="Message sounds" desc="Play sounds when sending/receiving"
                  value={isSoundEnabled} onToggle={toggleSound} />
              </div>
            )}

            {section === "notifications" && (
              <div className="space-y-4">
                <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                  <BellIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Browser notifications</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {Notification.permission === "granted" ? "✅ Enabled" : Notification.permission === "denied" ? "❌ Blocked in browser" : "Not yet enabled"}
                    </p>
                  </div>
                  {Notification.permission !== "granted" && Notification.permission !== "denied" && (
                    <button onClick={() => Notification.requestPermission().then((p) => toast(p === "granted" ? "Notifications enabled!" : "Blocked"))}
                      className="ml-auto px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                      style={{ background: 'var(--accent)' }}>
                      Enable
                    </button>
                  )}
                </div>
              </div>
            )}

            {section === "privacy" && (
              <div className="space-y-4">
                <InfoCard icon="🔒" title="End-to-end encryption" desc="All messages are encrypted. Nobody outside this chat can read them." />
                <InfoCard icon="👁️" title="Last seen" desc="Your last seen time is visible to your contacts. This helps them know when you're available." />
                <InfoCard icon="📖" title="Read receipts" desc="Blue ticks show when your message has been read. You can't disable this feature in the current version." />
              </div>
            )}

            {section === "about" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #667eea)' }}>
                    <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <p className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>Chatify</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Version 3.0 · Build 2026</p>
                </div>
                <InfoCard icon="⚡" title="Real-time messaging" desc="Built with Socket.io, React, and Node.js for instant message delivery." />
                <InfoCard icon="🤖" title="AI Assistant" desc="Powered by Google Gemini AI — always ready to help." />
                <InfoCard icon="☁️" title="Cloud media" desc="Images and voice messages stored securely on Cloudinary." />
                <InfoCard icon="🔐" title="Auth & Security" desc="JWT authentication with bcrypt password hashing." />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, desc, value, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-xl"
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <div>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
      <button onClick={onToggle}
        className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0"
        style={{ background: value ? 'var(--accent)' : 'var(--bg-input)' }}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
          style={{ left: value ? '22px' : '2px' }} />
      </button>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="px-4 py-3.5 rounded-xl" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
          <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
