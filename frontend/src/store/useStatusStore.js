import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStatusStore = create((set, get) => ({
  statuses: [],
  isFetching: false,
  isUploading: false,
  activeStatus: null,
  isTextModalOpen: false,
  setIsTextModalOpen: (isOpen) => set({ isTextModalOpen: isOpen }),
  viewedIds: (() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("talksphere-viewed-statuses") || localStorage.getItem("chatify-viewed-statuses") || "[]"));
    } catch {
      return new Set();
    }
  })(),

  setActiveStatus: (statusOrUpdater) => {
    set((state) => {
      const nextStatus = typeof statusOrUpdater === "function"
        ? statusOrUpdater(state.activeStatus)
        : statusOrUpdater;
      return { activeStatus: nextStatus };
    });
  },

  markAsViewed: (id) => {
    const next = new Set(get().viewedIds);
    next.add(id);
    localStorage.setItem("talksphere-viewed-statuses", JSON.stringify(Array.from(next)));
    set({ viewedIds: next });
  },

  fetchStatuses: async () => {
    set({ isFetching: true });
    try {
      const res = await axiosInstance.get("/status");
      set({ statuses: res.data });
    } catch (e) {
      toast.error("Failed to load statuses");
    } finally {
      set({ isFetching: false });
    }
  },

  statusPrivacy: localStorage.getItem("talksphere_status_privacy") || "everyone",
  allowedUsers: (() => { try { return JSON.parse(localStorage.getItem("talksphere_status_allowed") || "[]"); } catch { return []; } })(),
  deniedUsers: (() => { try { return JSON.parse(localStorage.getItem("talksphere_status_denied") || "[]"); } catch { return []; } })(),

  setStatusPrivacy: (privacy, allowed = [], denied = []) => {
    localStorage.setItem("talksphere_status_privacy", privacy);
    localStorage.setItem("talksphere_status_allowed", JSON.stringify(allowed));
    localStorage.setItem("talksphere_status_denied", JSON.stringify(denied));
    set({ statusPrivacy: privacy, allowedUsers: allowed, deniedUsers: denied });
    toast.success("Status privacy updated!");
  },

  deleteStatus: async (statusId) => {
    try {
      await axiosInstance.delete(`/status/${statusId}`);
      set({
        statuses: get().statuses.filter(s => s._id !== statusId),
        activeStatus: get().activeStatus?._id === statusId ? null : get().activeStatus
      });
      toast.success("Status deleted 🗑️");
    } catch {
      toast.error("Failed to delete status");
    }
  },

  uploadStatus: async (content, type = "text") => {
    set({ isUploading: true });
    try {
      const { statusPrivacy, allowedUsers, deniedUsers } = get();
      const res = await axiosInstance.post("/status", {
        content,
        type,
        privacy: statusPrivacy,
        allowedUsers,
        deniedUsers
      });
      set({ statuses: [res.data, ...get().statuses] });
      toast.success("Status posted! ✨");
    } catch (e) {
      toast.error("Failed to post status");
    } finally {
      set({ isUploading: false });
    }
  }
}));
