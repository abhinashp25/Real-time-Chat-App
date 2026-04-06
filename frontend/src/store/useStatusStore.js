import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStatusStore = create((set, get) => ({
  statuses: [],
  isFetching: false,
  isUploading: false,

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

  uploadStatus: async (content, type = "text") => {
    set({ isUploading: true });
    try {
      const res = await axiosInstance.post("/status", { content, type });
      set({ statuses: [res.data, ...get().statuses] });
      toast.success("Status posted!");
    } catch (e) {
      toast.error("Failed to post status");
    } finally {
      set({ isUploading: false });
    }
  }
}));
