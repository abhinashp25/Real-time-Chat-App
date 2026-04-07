import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useChatStore }   from "../store/useChatStore";
import { useAuthStore }   from "../store/useAuthStore";
import { ArchiveIcon, ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function ArchivedChats({ onClose }) {
  const [archived, setArchived]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const { setSelectedUser, setActiveTab } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    axiosInstance.get("/messages/archived")
      .then((r) => setArchived(r.data))
      .catch(() => toast.error("Could not load archived chats"))
      .finally(() => setLoading(false));
  }, []);

  const unarchive = async (partnerId, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.put(`/messages/archive/${partnerId}`);
      setArchived((a) => a.filter((u) => u._id !== partnerId));
      toast.success("Chat unarchived");
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[64px] flex-shrink-0 bg-[#111b21] border-b border-[#202c33]">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full text-[#aebac1] hover:bg-white/5 transition-colors"><ArrowLeftIcon className="w-5 h-5" /></button>
        <ArchiveIcon className="w-5 h-5 text-[#00a884]" />
        <p className="font-bold text-[15px] text-[#e9edef]">
          Archived Chats
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-[#00a884]" />
          </div>
        )}
        {!loading && archived.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArchiveIcon className="w-12 h-12 text-[#8696a0]" />
            <p className="text-sm text-[#8696a0]">No archived chats</p>
          </div>
        )}
        {archived.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <div key={user._id}
              className="chat-row"
              onClick={() => { setSelectedUser(user); setActiveTab("chats"); onClose(); }}>
              <div className="relative flex-shrink-0">
                <img src={user.profilePic || "/avatar.png"} alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover" />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111111] bg-[#00a884]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate text-[#e9edef]">
                  {user.fullName}
                </p>
                <p className="text-[12px] truncate mt-0.5 text-[#8696a0]">
                  Archived conversation
                </p>
              </div>
              <button
                onClick={(e) => unarchive(user._id, e)}
                className="text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all flex-shrink-0 bg-[#00a884]/10 text-[#00a884] border border-[#00a884]/20 hover:bg-[#00a884]/20">
                Unarchive
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
