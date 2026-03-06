import { useState, useRef, useEffect } from "react";
import {
  LogOutIcon, Volume2Icon, VolumeOffIcon,
  MoreVerticalIcon, BellIcon, BellOffIcon,
  UserCircleIcon, InfoIcon, EditIcon, MoonIcon, SunIcon,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore }  from "../store/useChatStore";
import toast from "react-hot-toast";

const clickSound = new Audio("/sounds/mouse-click.mp3");

export default function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound }     = useChatStore();
  const [selectedImg, setSelectedImg]       = useState(null);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [notifsEnabled, setNotifsEnabled]   = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const fileRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSelectedImg(reader.result);
      await updateProfile({ profilePic: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) { toast.error("Browser doesn't support notifications"); return; }
    if (Notification.permission === "denied") { toast.error("Notifications blocked — enable in browser settings"); return; }
    if (Notification.permission === "default") {
      const p = await Notification.requestPermission();
      if (p === "granted") { setNotifsEnabled(true); toast.success("Notifications enabled! 🔔"); }
    } else {
      setNotifsEnabled((v) => !v);
      toast(notifsEnabled ? "Notifications off" : "Notifications on", { icon: notifsEnabled ? "🔕" : "🔔" });
    }
    setMenuOpen(false);
  };

  const handleSound = () => {
    clickSound.currentTime = 0; clickSound.play().catch(() => {});
    toggleSound(); setMenuOpen(false);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 h-[64px] flex-shrink-0 relative"
      style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Subtle gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #4fd1c5 0%, #667eea 100%)', opacity: 0.6 }} />

      {/* Avatar + click to change */}
      <button className="relative group flex-shrink-0" onClick={() => fileRef.current.click()}>
        <img
          src={selectedImg || authUser.profilePic || "/avatar.png"}
          alt="me"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#4fd1c5]/40 transition-all"
        />
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <EditIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: '#48bb78', borderColor: 'var(--bg-header)' }} />
        <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} className="hidden" />
      </button>

      {/* App name */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>Chatify</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{authUser.fullName}</p>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-0.5 flex-shrink-0 relative" ref={menuRef}>
        <button onClick={handleSound} title={isSoundEnabled ? "Mute" : "Unmute"} className="icon-btn">
          {isSoundEnabled
            ? <Volume2Icon className="w-[17px] h-[17px]" />
            : <VolumeOffIcon className="w-[17px] h-[17px]" />}
        </button>

        {/* ⋮ Three-dot menu */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`icon-btn ${menuOpen ? "active" : ""}`}
          title="More options"
        >
          <MoreVerticalIcon className="w-[17px] h-[17px]" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="dropdown-menu animate-dropdown" style={{ top: '48px', right: 0 }}>
            <button className="dropdown-item" onClick={() => { fileRef.current.click(); setMenuOpen(false); }}>
              <UserCircleIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              Change profile photo
            </button>
            <button className="dropdown-item" onClick={handleToggleNotifications}>
              {notifsEnabled
                ? <BellIcon className="w-4 h-4" style={{ color: '#4fd1c5' }} />
                : <BellOffIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              {notifsEnabled ? "Notifications on" : "Enable notifications"}
            </button>
            <button className="dropdown-item" onClick={handleSound}>
              {isSoundEnabled
                ? <Volume2Icon className="w-4 h-4" style={{ color: '#4fd1c5' }} />
                : <VolumeOffIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              {isSoundEnabled ? "Sound on" : "Sound off"}
            </button>
            <button className="dropdown-item" onClick={() => {
              toast("Chatify v2.0 — Real-time messaging 💬", { icon: "ℹ️" });
              setMenuOpen(false);
            }}>
              <InfoIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              About Chatify
            </button>
            <div className="dropdown-divider" />
            <button
              className="dropdown-item"
              style={{ color: '#fc8181' }}
              onClick={() => { logout(); setMenuOpen(false); }}
            >
              <LogOutIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
