import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

const dedupeGroups = (groups) => {
  const seen = new Map();
  for (const g of groups) seen.set(String(g._id), g);
  return [...seen.values()];
};

export const useGroupStore = create((set, get) => ({
  groups:           [],
  selectedGroup:    null,
  groupMessages:    {},
  isGroupsLoading:  false,
  isMsgLoading:     false,
  groupTypingUsers: {},

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  fetchGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: dedupeGroups(res.data) });
      const socket = useAuthStore.getState().socket;
      res.data.forEach((g) => socket?.emit("joinGroup", g._id));
    } catch {
      toast.error("Could not load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  fetchGroupMessages: async (groupId) => {
    set({ isMsgLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: { ...get().groupMessages, [groupId]: res.data } });
      axiosInstance.put(`/groups/${groupId}/read`).catch(() => {});
    } catch {
      toast.error("Could not load messages");
    } finally {
      set({ isMsgLoading: false });
    }
  },

  sendGroupMessage: async (groupId, data) => {
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId, groupId, senderId: authUser, isOptimistic: true,
      text: data.text, image: data.image, audio: data.audio,
      createdAt: new Date().toISOString(), reactions: [], readBy: [{ userId: authUser }],
    };
    const cur = get().groupMessages[groupId] || [];
    set({ groupMessages: { ...get().groupMessages, [groupId]: [...cur, optimistic] } });

    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, data);
      const msgs = (get().groupMessages[groupId] || []).map((m) =>
        m._id === tempId ? res.data : m
      );
      set({ groupMessages: { ...get().groupMessages, [groupId]: msgs } });
    } catch {
      const msgs = (get().groupMessages[groupId] || []).filter((m) => m._id !== tempId);
      set({ groupMessages: { ...get().groupMessages, [groupId]: msgs } });
      toast.error("Could not send message");
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/groups", data);
      set({ groups: dedupeGroups([res.data, ...get().groups]) });
      useAuthStore.getState().socket?.emit("joinGroup", res.data._id);
      toast.success(`Group "${res.data.name}" created! 🎉`);
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not create group");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set({ groups: get().groups.filter((g) => !sameId(g._id, groupId)) });
      if (sameId(get().selectedGroup?._id, groupId)) set({ selectedGroup: null });
      useAuthStore.getState().socket?.emit("leaveGroup", groupId);
      toast.success("Left group");
    } catch {
      toast.error("Could not leave group");
    }
  },

  emitGroupTyping: (groupId) => {
    useAuthStore.getState().socket?.emit("groupTyping", { groupId });
  },

  emitGroupStopTyping: (groupId) => {
    useAuthStore.getState().socket?.emit("groupStopTyping", { groupId });
  },

  subscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroupMessage", (msg) => {
      const groupId = msg.groupId;
      const cur = get().groupMessages[groupId] || [];
      if (cur.some((m) => m._id === msg._id)) return;
      set({ groupMessages: { ...get().groupMessages, [groupId]: [...cur, msg] } });
      set({
        groups: get().groups.map((g) =>
          sameId(g._id, groupId)
            ? { ...g, lastMessage: msg.text || (msg.image ? "📷 Image" : "🎤 Voice"), lastMessageAt: msg.createdAt }
            : g
        ),
      });
      if (sameId(get().selectedGroup?._id, groupId)) {
        axiosInstance.put(`/groups/${groupId}/read`).catch(() => {});
      }
    });

    socket.on("groupMessagesRead", ({ groupId, byUserId }) => {
      const msgs = get().groupMessages[groupId];
      if (!msgs) return;
      const updated = msgs.map((m) => {
        const alreadyRead = m.readBy?.some(
          (r) => String(r.userId?._id || r.userId) === String(byUserId)
        );
        if (alreadyRead) return m;
        return { ...m, readBy: [...(m.readBy || []), { userId: byUserId, readAt: new Date().toISOString() }] };
      });
      set({ groupMessages: { ...get().groupMessages, [groupId]: updated } });
    });

    socket.on("groupCreated", (group) => {
      const merged = dedupeGroups([group, ...get().groups]);
      set({ groups: merged });
      socket.emit("joinGroup", group._id);
    });

    socket.on("groupUpdated", (group) => {
      set({ groups: get().groups.map((g) => sameId(g._id, group._id) ? group : g) });
      if (sameId(get().selectedGroup?._id, group._id)) set({ selectedGroup: group });
    });

    socket.on("groupUserTyping", ({ groupId, from, name }) => {
      set({
        groupTypingUsers: {
          ...get().groupTypingUsers,
          [groupId]: { ...get().groupTypingUsers[groupId], [from]: name },
        },
      });
      setTimeout(() => {
        const cur = { ...get().groupTypingUsers };
        if (cur[groupId]) {
          delete cur[groupId][from];
          if (!Object.keys(cur[groupId]).length) delete cur[groupId];
          set({ groupTypingUsers: cur });
        }
      }, 3000);
    });

    socket.on("groupUserStoppedTyping", ({ groupId, from }) => {
      const cur = { ...get().groupTypingUsers };
      if (cur[groupId]) {
        delete cur[groupId][from];
        if (!Object.keys(cur[groupId]).length) delete cur[groupId];
        set({ groupTypingUsers: cur });
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    ["newGroupMessage","groupMessagesRead","groupCreated","groupUpdated",
     "groupUserTyping","groupUserStoppedTyping"].forEach((ev) => socket?.off(ev));
  },
}));
