import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  typingUsers: {},

  searchQuery: "",

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      isRead: false,
      reactions: [],
    };

    set({ messages: [...get().messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: get().messages.map((m) => (m._id === tempId ? res.data : m)) });
    } catch (error) {
      set({ messages: get().messages.filter((m) => m._id !== tempId) });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  markMessagesAsRead: async (senderId) => {
    try {
      await axiosInstance.put(`/messages/read/${senderId}`);
      set({
        messages: get().messages.map((m) =>
          m.senderId === senderId && !m.isRead ? { ...m, isRead: true } : m
        ),
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },

  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.put(`/messages/react/${messageId}`, { emoji });
      // Optimistically update reactions in local state immediately
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add reaction");
    }
  },

  deleteMessage: async (messageId, deleteForEveryone) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`, {
        data: { deleteForEveryone },
      });
      if (deleteForEveryone) {
        // Replace with a tombstone so the position in the chat is clear
        set({
          messages: get().messages.map((m) =>
            m._id === messageId ? { ...m, isDeletedForAll: true, text: null, image: null } : m
          ),
        });
      } else {
        // "Delete for me" — simply remove from local list
        set({ messages: get().messages.filter((m) => m._id !== messageId) });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete message");
    }
  },

  emitTyping: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket?.emit("typing", { to: selectedUser._id });
  },

  emitStopTyping: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket?.emit("stopTyping", { to: selectedUser._id });
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // New incoming message
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });

      if (isSoundEnabled) {
        const s = new Audio("/sounds/notification.mp3");
        s.currentTime = 0;
        s.play().catch(() => {});
      }

      get().markMessagesAsRead(newMessage.senderId);
    });

    // Read receipts: other person read our messages
    socket.on("messagesRead", ({ by }) => {
      if (by !== selectedUser._id) return;
      set({
        messages: get().messages.map((m) =>
          m.receiverId === by && !m.isRead ? { ...m, isRead: true } : m
        ),
      });
    });

    
    socket.on("messageReaction", ({ messageId, reactions }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      });
    });

    socket.on("messageDeleted", ({ messageId, deletedForAll }) => {
      if (deletedForAll) {
        set({
          messages: get().messages.map((m) =>
            m._id === messageId
              ? { ...m, isDeletedForAll: true, text: null, image: null }
              : m
          ),
        });
      } else {
        set({ messages: get().messages.filter((m) => m._id !== messageId) });
      }
    });

    socket.on("userTyping", ({ from }) => {
      if (from !== selectedUser._id) return;
      set({ typingUsers: { ...get().typingUsers, [from]: true } });
    });

    socket.on("userStoppedTyping", ({ from }) => {
      const next = { ...get().typingUsers };
      delete next[from];
      set({ typingUsers: next });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
    socket.off("messageReaction");
    socket.off("messageDeleted");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
  },
}));
