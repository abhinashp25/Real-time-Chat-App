import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAIStore = create((set, get) => ({
  aiMessages:   [],
  isAILoading:  false,
  smartReplies: [],
  rateLimitUntil: 0,
  retryAfter: 0,

  clearAI: () => set({ aiMessages: [], smartReplies: [] }),

  rateLimitUntil: 0,    
  retryAfter: 0,       

  sendAIMessage: async (userText) => {
    if (!userText.trim()) return;

    const now = Date.now();
    const { rateLimitUntil } = get();
    if (rateLimitUntil > now) {
      const secs = Math.ceil((rateLimitUntil - now) / 1000);
      const warnMsg = {
        role: "assistant",
        content: `⏳ Still cooling down. Please wait ${secs} more second${secs !== 1 ? "s" : ""}.`,
        id: Date.now() + 1,
        isError: true,
      };
      set({ aiMessages: [...get().aiMessages, warnMsg] });
      return;
    }

    const newMsg = { role: "user", content: userText, id: Date.now() };
    const history = [...get().aiMessages, newMsg];
    set({ aiMessages: history, isAILoading: true, smartReplies: [] });

    try {
      const res = await axiosInstance.post("/ai/chat", {
        messages: history.map(({ role, content }) => ({ role, content })),
      });
      const aiMsg = { role: "assistant", content: res.data.reply, id: Date.now() + 1 };
      set({ aiMessages: [...get().aiMessages, aiMsg], rateLimitUntil: 0, retryAfter: 0 });
    } catch (e) {
      const status = e?.response?.status;
      let errText = e?.response?.data?.message || "Something went wrong.";
      let cooldown = 0;

      if (status === 429) {
        // Rate limited — enforce 30s local cooldown
        cooldown = 30;
        errText = `⏳ Gemini rate limit hit. I'll be ready again in ${cooldown}s — the free tier allows ~15 messages/minute.`;
        set({ rateLimitUntil: Date.now() + cooldown * 1000, retryAfter: cooldown });

        const tick = setInterval(() => {
          const remaining = Math.ceil((get().rateLimitUntil - Date.now()) / 1000);
          if (remaining <= 0) {
            clearInterval(tick);
            set({ retryAfter: 0 });
          } else {
            set({ retryAfter: remaining });
          }
        }, 1000);
      }

      const errMsg = {
        role: "assistant",
        content: errText,
        id: Date.now() + 1,
        isError: true,
      };
      set({ aiMessages: [...get().aiMessages, errMsg] });
    } finally {
      set({ isAILoading: false });
    }
  },

  fetchSmartReplies: async (lastMessage) => {
    if (!lastMessage?.trim()) return;
    try {
      const res = await axiosInstance.post("/ai/smart-replies", { lastMessage });
      set({ smartReplies: res.data.suggestions || [] });
    } catch {
      set({ smartReplies: ["👍", "Thanks!", "Sure!", "Got it!"] });
    }
  },

  clearSmartReplies: () => set({ smartReplies: [] }),
}));
