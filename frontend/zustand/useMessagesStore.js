import { create } from "zustand";

const messageStore = (set) => ({
    messages: [],
    setMessages: (newMessages) => set({messages: newMessages})
});

export const useMessageStore = create(messageStore);